# Service doctrine — Cloudflare R2

This component realizes the `object-file-storage` capability, so what it
owes is the neutral object-storage contract
(`assets/contracts/object-storage.md`), clause by clause. The contract
states what **any** object store must satisfy; this file states how this
one does, **citing rather than restating**.

## Contract satisfaction

**Serve bytes without the application in the path.** Three mechanisms
here, and picking between them is a per-bucket decision. A **presigned
URL**, issued by a service that authorized the request, moves the bytes
directly and is the general answer
([Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)).
A **custom domain** on a zone you control serves a bucket whose exposure
is already decided, with the product's own hostname and cache in front of
it
([Public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)).
A **Worker reading through the binding** keeps the authorization decision
on every request, and pays for it with the product's compute on the byte
path — correct for small, per-request-authorized objects and wrong for
large ones. What satisfies no reading of the clause is application code
buffering a file to hand it on.

**Express lifecycle as a bucket policy.** Expiry and the transition to the
colder storage tier are **bucket lifecycle rules**, set with
`wrangler r2 bucket lifecycle add`, which takes a prefix condition plus
`--expire-days`, `--ia-transition-days` and `--abort-multipart-days`
([Object lifecycles](https://developers.cloudflare.com/r2/buckets/object-lifecycles/),
[wrangler commands](https://developers.cloudflare.com/r2/reference/wrangler-commands/)).
Set them at bucket creation, per the contract's reasoning: a retention
rule that lives in a cron job is a retention rule that stops running.

**State its consistency.** R2 is **strongly consistent** — a read after a
write, a metadata update, a delete and a bucket listing all see the latest
state
([Consistency model](https://developers.cloudflare.com/r2/reference/consistency/)).
The documented exception is worth knowing because it bites during setup
rather than at runtime: **permission changes are eventually consistent**
and can take up to a minute to propagate. A new token that 403s
immediately after being created is usually that, not a wrong scope.

**Bound access by prefix.** The **key layout is the authorization
boundary**, and it is effectively immutable once objects exist — design it
before the first upload. On this service the boundary is enforced in two
different places depending on the path: a bucket-scoped API token for the
S3 path, and the product's own check before it touches the binding on the
Worker path. See [identity shape](identity-shape.md).

**Price egress, and say so.** Here the answer inverts the clause: **there
is no egress charge**
([Pricing](https://developers.cloudflare.com/r2/pricing/)). The clause
exists because egress is the line that surprises products; on this store
the surprising line is **operations**, and the tiering decision carries a
retrieval charge of its own. See [cost shape](cost-shape.md).

## Buckets

**One bucket per environment**, never a prefix inside the production
bucket. Public access, CORS, lifecycle rules and the default storage class
are all **bucket-level** settings, so two environments in one bucket
cannot hold two policies — and a staging job that clears a prefix is one
typo away from clearing production's.

**One bucket per sensitivity class**, for the same reason a grant is
per-bucket: user uploads, internal exports and public assets have
different answers to "who may read this", and a boundary that is only a
prefix is a boundary one token forgets.

Bucket names are 3–64 characters and are visible in the S3 endpoint path,
so they are not a place for anything confidential
([Create buckets](https://developers.cloudflare.com/r2/buckets/create-buckets/)).
Name them for the environment and the class — not for a team, a person or
a date.

## Object keys

The key is the only thing a bucket indexes, so it carries the whole
design:

- **Put the authorization boundary at the front.** A tenant, a user or an
  entity id as the first segment makes "may this identity touch this
  object" answerable from the path alone, and makes a scoped listing
  possible at all.
- **Do not encode anything mutable.** A key containing a status, a version
  name or a display name becomes wrong the moment the record changes, and
  renaming an object is a copy plus a delete — two billed operations and a
  window where both exist.
- **The record names the key, not the reverse.** The datastore holds the
  entity and stores the key on it. Deriving a key from user input is how
  one tenant reads another's file.
- **Prefixes are the only grouping.** Listing is by prefix; there is
  nothing else to filter on. A layout that needs a scan to answer an
  ordinary question is a layout that will be paid for per request.

## Uploads, sizes and multipart

A single object can be up to **4.995 TiB**, but a single request — an
upload, a multipart part, or a copy into a part — is capped at **4.995
GiB**
([Limits](https://developers.cloudflare.com/r2/platform/limits/)).
Anything above that ceiling is a **multipart upload**, which is also the
right shape for anything large enough that a dropped connection is
likely, since only the failed part is resent
([Multipart objects](https://developers.cloudflare.com/r2/objects/multipart-objects/)).

Two consequences to design for rather than discover:

- **An incomplete multipart upload is billed storage that no listing
  shows.** Parts are automatically aborted after 7 days
  ([Workers API reference](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)),
  and `--abort-multipart-days` on a lifecycle rule shortens that. Set it;
  the default is a week of paying for bytes nobody can read.
- **Custom metadata is capped at 8,192 bytes** across the whole object
  ([Error codes](https://developers.cloudflare.com/r2/api/error-codes/)).
  It is a label, not a record — anything the product queries belongs in
  the datastore.

**Constrain content type and size where the upload happens.** On a
presigned URL that means at issue time: signing an unconstrained upload
URL is signing a blank cheque, and an unbounded upload path is an
unbounded bill. And never trust the declared content type downstream — it
is client-supplied, so serve user content with an explicit type and
disposition from a host that cannot execute in the product's own origin.

## Storage classes

Two tiers: **Standard** and **Infrequent Access**
([Storage classes](https://developers.cloudflare.com/r2/buckets/storage-classes/)).
A bucket has a default class for new objects, and a lifecycle rule moves
objects to the colder one on an age condition. Infrequent Access is
cheaper to store and **more expensive to operate on, plus a per-GB
retrieval charge** — so the tier is a bet that the data will be read
rarely, and it costs more than Standard if the bet is wrong. Set the
tiering threshold against the expiry threshold rather than independently;
see [cost shape](cost-shape.md).

## CORS

A bucket read directly by a browser — a presigned upload from a page, a
public asset fetched by script — needs a **CORS policy on the bucket**,
set with `wrangler r2 bucket cors set`
([CORS](https://developers.cloudflare.com/r2/buckets/cors/)). It is
bucket-level, which is another reason environments do not share one: the
allowed origin differs per environment by definition, and a policy loose
enough for both is loose.

## The two surfaces, and which one to use

The **binding** is the default wherever a Worker is already in the path.
It carries no credential, so there is nothing to rotate or leak; the shape
of the block the project adds to its own wrangler config is in
`conventions.md`.

The **S3-compatible API** is for everything else — a build job, a
migration, another cloud's service, an existing tool. The endpoint is
`https://<account-id>.r2.cloudflarestorage.com`, the region string is
`auto` and is ignored, and the credentials are R2's own access key pair
([S3 API](https://developers.cloudflare.com/r2/get-started/s3/),
[AWS SDK for JavaScript](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)).
Reaching for it from inside a Worker that already has a binding is adding
a credential and a network hop to buy nothing.

## R2 Data Catalog

Enabling the catalog on a bucket, with
`wrangler r2 bucket catalog enable <bucket>`, activates an **Apache
Iceberg REST catalog** over it and returns two identifiers every client
needs: the **Warehouse name** and the **Catalog URI**
([Getting started](https://developers.cloudflare.com/r2/data-catalog/get-started/)).
Record both at enable time; they are what authenticates an engine, and
hunting for them later is the usual first stumble.

Ordinary Iceberg engines connect against those two values plus a token —
DuckDB, PyIceberg, Snowflake, Spark (PySpark and Scala), StarRocks and
Trino all have documented configurations
([Connect to Iceberg engines](https://developers.cloudflare.com/r2/data-catalog/config-examples/)).
Nothing about the bucket changes: the objects are still objects, and the
catalog is metadata describing which of them are tables.

**Compaction is a decision, not a default.** Many small files make queries
slow, and
`wrangler r2 bucket catalog compaction enable` merges them at the catalog
or the table level against a target file size; catalog-level compaction
needs an API token as a service credential
([Manage catalogs](https://developers.cloudflare.com/r2/data-catalog/manage-catalogs/)).
A table written by a streaming producer is exactly the case that needs it,
and exactly the case where nobody thinks to turn it on.

## R2 SQL

`wrangler r2 sql query [WAREHOUSE] [QUERY]` runs SQL against the catalog's
tables, authenticating with the `WRANGLER_R2_SQL_AUTH_TOKEN` environment
variable
([wrangler commands](https://developers.cloudflare.com/r2-sql/reference/wrangler-commands/)).

What it can do is broad — expressions, CTEs, joins, subqueries, window
functions and set operations. What it cannot do is the part to design
against: it is **read-only** and reads **Parquet only**, so no `INSERT`,
`UPDATE`, `CREATE TABLE` or `DROP TABLE`, and no CSV or JSON. `OFFSET`,
named `WINDOW` clauses and `LATERAL` derived tables are unsupported, and
`NOT IN` against a nullable column needs rewriting as `NOT EXISTS`
([Limitations and best practices](https://developers.cloudflare.com/r2-sql/reference/limitations-best-practices/)).

So R2 SQL is a **query surface, not a warehouse**: something else writes
the tables, and this asks questions of them. Treat a query as a billed
scan rather than as a free lookup — see [cost shape](cost-shape.md).

## The access rule

A project reaches the store **only through the shared services layer** —
no project imports the SDK or holds the binding directly. Signing happens
there, once, so expiry and constraints are decided in one place rather
than per caller, and the key layout stays a thing one module knows.

## The object is not the record

The product's own datastore holds the entity; the object is referenced
from it. Two consequences worth writing into the flow rather than
discovering:

- **A completed upload that no record points at is an orphan**, and an
  orphan nothing cleans up is permanent. Either write the record first and
  the object second under a key the record names, or run a lifecycle rule
  over an incoming prefix that expires anything unclaimed.
- **A deleted record does not delete its objects.** What happens on delete
  — hard delete, tombstone, or lifecycle expiry — is a retention and PII
  decision the blueprint makes, and it has to be made, because the default
  is that the bytes stay forever.
