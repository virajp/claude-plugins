# Cost shape — Cloudflare R2

The provider-wide billing principle is the `cloudflare` skill's cost
doctrine, and this service is the case that principle explicitly hands
over: the private plane bills by **seats**, and every other Cloudflare
service — this one included — bills by **consumption**. Reading one across
from the other gets the answer backwards. This file states only what is
R2's own. No dollar figures; the current rates are on
[the pricing page](https://developers.cloudflare.com/r2/pricing/) and the
billing model is what stays true.

## The meter

Three terms, and the third is the one that is missing:

1. **Stored bytes**, per month, at a rate that depends on the storage
   class.
2. **Operations**, split into two classes — **Class A** for the
   state-mutating calls (writes, listings, multipart bookkeeping) and
   **Class B** for reads. Class A is the more expensive of the two by a
   wide margin
   ([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)).
3. **Egress — which is not billed at all.**

A monthly free allowance covers Standard storage and both operation
classes; it does **not** apply to Infrequent Access
([Pricing](https://developers.cloudflare.com/r2/pricing/)).

## The whole doctrine follows from term three

**Zero egress removes the line that dominates every other object store's
bill**, and with it most of the architecture people build to avoid that
line. A CDN in front of a bucket to keep bytes from leaving is solving a
problem this service does not have; serving derivatives instead of
originals is still worth doing for latency and for the reader, but not for
the storage bill.

What that leaves is a bill driven by **how often you touch the store**
rather than by how much leaves it — which is the opposite of the instinct
most teams bring. So the expensive designs here are the chatty ones, not
the heavy ones.

## Trap one: listing is a Class A operation, and polling is a loop of them

A job that lists a prefix to find something is paying the mutating-class
rate to ask a question, and paying it again on every poll. Two remedies,
both structural: the datastore knows what exists — the object is not the
record, and the record is cheaper to query — and where an upload has to
trigger work, an event notification into a queue is one operation instead
of a poll loop
([Event notifications](https://developers.cloudflare.com/r2/buckets/event-notifications/)).

The same reasoning applies to any per-request read the product could have
cached. A hot object read on every request is a Class B operation on every
request, and that is the workload Workers KV exists for.

## Trap two: Infrequent Access is a bet, and losing it costs more

The colder class is cheaper per stored byte and **more expensive per
operation in both classes, plus a per-GB retrieval charge**
([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/),
[Storage classes](https://developers.cloudflare.com/r2/buckets/storage-classes/)).
So tiering pays only if the data really is read rarely; tier something
that is merely old but still read and the bill goes **up**.

Set the tiering threshold and the expiry threshold **against each other**,
not independently. Data that will be deleted soon should never be tiered
first — that pays the transition, the colder rate and the retrieval, to
save storage on bytes that were about to disappear. And the free allowance
does not extend to this class, so tiering a small bucket can move it from
free to billed.

## Trap three: incomplete multipart uploads are billed and invisible

Parts of an unfinished multipart upload occupy storage and do not appear
in a listing of objects. They are aborted automatically after seven days
([Workers API reference](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)).
A lifecycle rule with `--abort-multipart-days` shortens that, and setting
it is the cheapest cleanup the service offers
([Object lifecycles](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)).

## The control that goes in first

**Lifecycle rules at bucket creation.** Without an expiry rule a bucket
grows monotonically forever, and the storage term is the one that never
goes down on its own. Retrofitting a policy over an existing bucket means
reasoning about data nobody remembers writing, which is why this is a
day-one decision rather than an optimization.

## Data Catalog and R2 SQL

Both sit **on top of** the bucket's bill rather than replacing any part of
it — the storage and operations above still accrue.

- **R2 SQL bills by the volume of compressed data a query scans**, and the
  engine's own reads count as Class B operations on the bucket. It charges
  no egress
  ([R2 SQL pricing](https://developers.cloudflare.com/r2-sql/platform/pricing/)).
  So the cost of a query is a property of the **table layout**, not of the
  result size: an unpartitioned table means every query scans everything,
  and a `LIMIT` does not save you.
- **Compaction is work the catalog does on your behalf**, merging small
  files against a target size
  ([Manage catalogs](https://developers.cloudflare.com/r2/data-catalog/manage-catalogs/)).
  It reads and rewrites data, so it is not free — and not running it on a
  table fed by a streaming producer is more expensive still, because every
  subsequent query scans the small files instead.

The review to run before enabling either: what is the table partitioned
on, does that match what queries filter on, and who is going to notice if
someone runs an unbounded scan on a schedule.
