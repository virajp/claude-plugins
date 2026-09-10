# Pick & trade — Cloudflare R2

## What this actually is

**An S3-compatible object store with no egress charge**
([Pricing](https://developers.cloudflare.com/r2/pricing/)). Two things
follow, and between them they decide most of the arguments below: existing
S3 SDKs and tools work against it unchanged, and the line that dominates
every other object store's bill — reading the bytes back out — is not on
this one's.

It is strongly consistent, including read-after-write, deletes and
listings
([Consistency model](https://developers.cloudflare.com/r2/reference/consistency/)),
which removes the "the write may not be visible yet" caveat that flows
against other stores have to carry.

## Against the neighbours on the same platform

**Over Workers KV, when the value is large or is a file.** KV caps a value
at 25 MiB
([KV limits](https://developers.cloudflare.com/kv/platform/limits/)); a
single R2 object can be several terabytes, with a per-request upload
ceiling of 4.995 GiB
([R2 limits](https://developers.cloudflare.com/r2/platform/limits/)). The
size difference is the obvious half. The other half is what each is for:
KV is a read-optimized store for configuration and routing metadata, and
using it for user content buys a cache nobody wanted in front of data
that had to be current.

**Over D1, when the payload is bytes rather than fields.** A blob in a
relational row is a row that cannot be indexed, cached or ranged over,
and it drags the whole record's size into every query that touches it.
Store the object here, store the record in the datastore, and let the
record name the key. The reverse of that mistake matters too: see below.

**Over a third-party object store, when reads leave the cloud.** Zero
egress is the argument, and it is a real one for anything media-heavy or
publicly served — the bill stops scaling with success. Where reads are
overwhelmingly internal and same-region, the argument is much weaker, and
the trade is then about the platform, not about the price.

## When a bucket is the wrong home

- **Hot, small values read on every request.** Configuration, feature
  flags, routing tables, session-shaped data. Every read is a billed
  operation and none of them is cached the way a key-value store's is.
  That is what Workers KV exists for.
- **Anything transactional.** There are no multi-object transactions and
  no way to make two writes land together. A flow that needs "both or
  neither" needs a datastore holding the state and the objects hanging off
  it.
- **Anything you need to query.** A bucket answers "give me this key" and
  "list this prefix". Everything else — filter, join, aggregate — is a
  full scan you are paying for per operation. The record belongs in the
  datastore, which is cheaper to ask and is the thing that knows what
  exists.
- **A queue.** Writing objects to be polled for is a queue built out of
  list operations, which is both the slowest and the most expensive way to
  have one.

## Both paths in one product is normal

Server-mediated for anything the product must authorize per request, and a
presigned URL or a public custom domain for bytes whose exposure is
already decided. Decide **per bucket** — the policy is bucket-level — and
say which in the blueprint.

## When objects become tables: the Data Catalog decision

R2 Data Catalog turns a bucket into an Apache Iceberg REST catalog, and
R2 SQL queries the tables in it
([Data Catalog](https://developers.cloudflare.com/r2/data-catalog/)).
That is a genuinely different use of the same service, and it is worth
naming when it applies rather than discovering it later.

**Take it when the objects are a growing set of same-shaped records** —
events, transactions, telemetry, anything appended rather than edited —
and someone is going to want to ask questions of them. The alternative,
scanning a prefix and parsing files by hand, is the thing the catalog
replaces.

**Do not take it as a warehouse substitute.** R2 SQL is **read-only**, and
it reads Parquet only — no `INSERT`, no `UPDATE`, no `CREATE TABLE`, and
no CSV or JSON
([R2 SQL limitations](https://developers.cloudflare.com/r2-sql/reference/limitations-best-practices/)).
Something else writes the tables; this queries them. And it adds a
scan-volume cost line on top of the storage and operations the bucket
already bills
([R2 SQL pricing](https://developers.cloudflare.com/r2-sql/platform/pricing/)),
which is the one place on this service where a careless query is
expensive.

Either way it needs **no second pin**: the catalog and the SQL surface
come with this component.

## What this does not decide

**What is stored, for how long, and what happens on delete.** Entities,
retention and PII are blueprint contracts authored per product; this
component provides the mechanisms they choose between.
