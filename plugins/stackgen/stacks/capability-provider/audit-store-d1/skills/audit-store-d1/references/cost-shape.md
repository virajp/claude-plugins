# Audit store · D1 — cost shape

The meter is D1's — rows read, rows written, storage, with no charge for an idle
database — and the `cloud-service/d1` component owns that doctrine, including
the two traps that decide every D1 bill: a row is read when the query *scans*
it, and each index is an extra written row on every write. This file states only
what an **audit dataset** does to that meter, which is a specific and unusual
shape. No dollar figures: they age badly and are wrong per region anyway.

## The shape: write-once, read-rarely, delete-never

Almost nothing else in a product looks like this.

- **Writes are proportional to privileged actions**, not to traffic. The audit
  contract's default scope is operator actions plus destructive mutations, so
  the write rate is roughly the rate at which humans do consequential things —
  small, and bounded by how many operators there are.
- **Reads are rare and human-paced.** A handful of operators, a few queries each
  per incident.
- **Storage grows monotonically until the purge runs**, and never otherwise.
  This is the term to watch, because it is the only one with no natural ceiling.

The counter-intuitive consequence: **the cheapest thing about this store is the
thing it is for.** Recording an event is one insert. What costs is reading badly
and keeping forever.

## Trap one: an unindexed history query scans the table

Rows read counts scanned rows, and the audit table is the largest monotonically
growing table the product has. A filter by actor or target with no index on it
reads the entire history to return one screen — and the query gets more
expensive every day the product runs, which is the property that makes it
invisible in testing and expensive in year two.

Index the three shapes the console actually offers, composite and ending in the
timestamp, and no others — [access shape](access-shape.md) names them. Check the
plan with `EXPLAIN QUERY PLAN` before the surface ships, and read `rows_read`
off the result metadata: a history query whose `rows_read` grows with the table
rather than with the page is the one to fix.

## Trap two: offset pagination bills the pages you skipped

Deep paging with `OFFSET` scans and discards. On an append-only table the deep
pages are the old events — exactly what a compliance review reads. Keyset
pagination costs one page regardless of depth; see
[access shape](access-shape.md).

## Trap three: indexes are a write tax on every event

Each index is an additional written row per insert. On this store the write path
is the one that must never be slow or fragile, because it is inside the
mutation's own batch. Three indexes are a considered set; a speculative fourth
added "for a report someone might want" is paid on every event forever.

## Trap four: widening the scope multiplies the store

Recording ordinary CRUD instead of privileged and destructive actions changes
the write rate from human-paced to traffic-paced — orders of magnitude, in both
rows written and storage, and permanently, because nothing here is deleted
early. The audit foundation makes widening a deliberate, elicited decision
rather than a default, and the cost meter is the concrete reason.

## Storage: the term with no ceiling but a hard limit

A D1 database is capped, and an audit dataset only grows, so the retention purge
is what keeps this store viable and not merely compliant. Two facts follow:

- **The retention period is a capacity decision as well as a legal one.** Event
  rate times event size times the window is a number that can be estimated
  before the first migration, and it is worth estimating: the design that splits
  the store — a database per year, per tenant — is cheap up front and is a
  migration of immutable data afterwards.
- **The purge does not reclaim on its own terms.** Deleting rows is billed as
  rows written, so a purge is a real cost spike, and one that grows with the
  window it clears. Run it on a schedule that keeps each run small rather than
  discovering it as a quarterly event.

## Archiving costs less than keeping

Where the window is long for legal reasons but the events are cold, the cheaper
shape is an export tier: the database exports to a SQL dump, and old events live
in object storage whose bytes are cheaper than a live database's and whose reads
are rare enough to be an operation rather than a surface. The trade is that
retrieving an archived event stops being a query, so the boundary belongs where
the console genuinely never looks.

## What does not cost extra

- **An idle audit database.** Scale-to-zero means a store nobody queried this
  month bills only its bytes, which is what makes the second database an
  affordable design decision rather than a budget line.
- **Time Travel**, which is on by default — and is recovery, not the archive
  path, and must never be used against this store as a reset. Rewinding an audit
  database rewinds the record.
