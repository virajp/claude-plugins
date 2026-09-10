# Cost shape — Cloudflare D1

The provider's billing principle is **seats, not traffic**, and it is
about the private plane; the `cloudflare` skill's cost doctrine owns it
and says explicitly that every other service this stack offers bills by
consumption instead. This file states what that consumption is for this
one service. No dollar figures — the billing model and its traps are what
stay true.

## The meter

Three terms, and nothing else:

- **Rows read**
- **Rows written**
- **Storage**

There is **no charge for data transfer or throughput**, and the model is
**scale-to-zero**: an idle database bills for what it stores and nothing
for what it is not doing
([pricing](https://developers.cloudflare.com/d1/platform/pricing/)). That
inverts the usual managed-database instinct entirely — there is no
instance to size, no idle instance to be embarrassed by, and a
non-production database nobody has touched in a month costs only its
bytes.

Each plan includes an allowance before any of the three is charged, and
the free and paid allowances are measured on different periods — the free
plan's reads and writes are a **daily** allowance, the paid plan's a
**monthly** one
([Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)).
Which matters for a design more than the numbers do: on the free plan a
single expensive batch job can exhaust a day, and the meter resets rather
than the bill growing.

## Trap one: rows read counts rows *scanned*

This is the whole of D1 cost engineering. **A row is read when the query
scans it, regardless of its size and regardless of whether it was
returned to the Worker**
([pricing](https://developers.cloudflare.com/d1/platform/pricing/)). So a
`WHERE` clause with no usable index reads the table, and a query
returning one row can bill for every row that exists.

The consequence is unusual and worth stating plainly: **the index is a
cost control before it is a performance control.** Adding one to a
filtered column can cut the billed rows for that query by orders of
magnitude, and the evidence is available before deployment —
`EXPLAIN QUERY PLAN` in front of a `SELECT` says whether the planner uses
the index
([use indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/)).

Every query returns its own `rows_read` and `rows_written` in the result
metadata, so this is measurable per statement rather than inferred from a
monthly total. A query whose `rows_read` grows with the table and not
with the result set is the one to fix.

## Trap two: an index is a write

The counter-pressure to trap one, and the reason "index everything" is
not the answer. **Each index counts as an additional written row on every
insert, update and delete** of the row it covers
([pricing](https://developers.cloudflare.com/d1/platform/pricing/)). A
table with six indexes bills a single insert as several writes.

So the two traps are one decision: index the columns real queries filter
and sort on, and no others. An index added speculatively is a permanent
tax on the write path, paid in the more expensive of the two meters.

## Trap three: the loop

A query issued once per row of a previous result reads its rows through
the most expensive path available and, on top of the billing, runs into
the per-invocation query cap
([limits](https://developers.cloudflare.com/d1/platform/limits/)). A join
or a `batch()` does the same work as one billed unit of scanning. This is
the commonest expensive pattern, and it is invisible in a small test
dataset because both versions are fast.

## What does not cost extra

- **Read replication.** Replicas add no storage or compute charge; the
  reads they serve bill as the same rows they would have billed on the
  primary
  ([read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/)).
  So consistency, not cost, is the axis to decide it on — see
  [service doctrine](service-doctrine.md).
- **Time Travel.** Point-in-time recovery is on by default at no
  additional cost
  ([release notes](https://developers.cloudflare.com/d1/platform/release-notes/)),
  which removes the usual "is the backup retention worth it" question
  from the cost review entirely.

## The sizing question

Not "how large an instance" — there is none — but **"which queries scan
the most rows, and what is the split when a database approaches its
ceiling"**. The first is answered per statement from the result metadata,
the second is the design decision [pick & trade](pick-and-trade.md)
insists on taking before the first table.

Never write dollar figures. They change; the shape does not.
