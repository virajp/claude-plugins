# Identity shape — Cloudflare R2

The account and role model, what automation authenticates with, and why
the unscoped account key is never the answer are the `cloudflare` skill's
identity-and-iam reference — cited here and restated nowhere. This file
states only the grants **this** service needs and the seam between its two
access paths.

## The binding holds no credential, and that is the argument for it

A Worker reaching a bucket through an `r2_buckets` binding presents
nothing: the platform resolves the binding for that Worker, so there is no
key in the project, none in CI, and none to rotate. Every credential
question below exists only because something **other** than a Worker needs
the bucket.

So the first identity decision is not which token to issue. It is whether
a token is needed at all.

## The permission to grant, and the two that are not it

R2 API tokens come in four levels — **Admin Read & Write**, **Admin Read
only**, **Object Read & Write** and **Object Read only**
([R2 API tokens](https://developers.cloudflare.com/r2/api/tokens/)).

- **An application gets an object-level permission**, read-only wherever
  reading is all it does. Object-level is the data plane: it reads,
  writes and lists objects and cannot create or delete a bucket, change
  its lifecycle rules or open it to the internet.
- **An admin permission is for administration**, and handing one to an
  application is several orders of privilege beyond writing a file — it
  reaches the bucket's own configuration, which is where public access
  and retention live.
- **The two object-level permissions work only over the S3-compatible
  API**, not over Cloudflare's REST API. A job that has to create a bucket
  or edit its settings therefore needs an admin permission by
  construction, which is the argument for keeping provisioning out of the
  application's credential entirely.

**Scope the token to the buckets it touches.** A token's policy names its
resources, and it can name specific buckets rather than every bucket in
the account. A token scoped to the account reads every environment's data,
including production's from staging.

## The S3 path: an access key pair, and what it implies

The S3-compatible surface authenticates with an **access key id and secret
access key** derived from an R2 API token — not with the account-wide
credential the provider reference governs
([S3 API](https://developers.cloudflare.com/r2/get-started/s3/)). Treat it
as any other long-lived secret: injected by the secrets provider,
catalogued by name in the project's environment doc, never in the repo,
and rotated on a schedule someone owns.

**Sign in the services layer, once.** An identity that can presign a URL
can hand out access to whatever the signature covers, for as long as it
lasts — so expiry and constraints are decided in one place rather than per
caller. Expiries are short: long enough for the operation, not long enough
to be shared, because a signed URL that outlives the request is a
credential in a log, a browser history and a support ticket. And sign for
a **specific key and method**; a signature covering a prefix covers
everything under it.

## Data Catalog and R2 SQL

The catalog has its own permission pair on top of the storage one, and the
split is a useful one to hold. **Admin Read only** is enough to list
namespaces, load tables and query data; **Admin Read & Write** is required
to create or drop tables and to commit transactions
([R2 API tokens](https://developers.cloudflare.com/r2/api/tokens/)). A
query engine therefore gets the read pair — the catalog read permission
alongside object read — and only the producer that writes tables gets
write.

`wrangler r2 sql query` reads its token from the
`WRANGLER_R2_SQL_AUTH_TOKEN` environment variable
([wrangler commands](https://developers.cloudflare.com/r2-sql/reference/wrangler-commands/)),
so it is a credential a developer holds locally and a job holds in CI —
the same rules apply to both.

## Nothing is public unless someone decided it is

Exposure is a **bucket-level** setting: a custom domain or an `r2.dev`
subdomain, both off until enabled
([Public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)).
Where a client needs an object it does not own the path to, the answer is
a presigned URL from a service that authorized the request. A bucket
opened to the internet is irreversible in the sense that matters: you
cannot know what was copied while it was open.

## The one propagation delay to expect

**Permission changes are eventually consistent** and can take up to a
minute to take effect
([Consistency model](https://developers.cloudflare.com/r2/reference/consistency/)),
while everything about the data itself is strongly consistent. A token
that 403s immediately after being created or re-scoped is usually that,
not a wrong policy — which is worth knowing before an hour goes into
debugging the scope.

## Reviewing this bucket

1. Does anything hold an **admin** permission that only reads and writes
   objects?
2. Is any token scoped to **all buckets** rather than to the ones it
   touches?
3. Is the bucket **publicly reachable**, and did someone decide that?
4. What is the **longest-lived presigned URL** the product issues, and
   why?
5. Does the query engine's credential also carry catalog **write**?
