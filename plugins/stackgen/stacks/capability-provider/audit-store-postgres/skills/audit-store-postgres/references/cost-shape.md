# Audit store · PostgreSQL — cost shape

There is no meter here. The store rides the product's own instance, so it costs
nothing per row and nothing per query — it costs **capacity on a server the
product is already paying for**, and the way it consumes that capacity is
unusual enough to be worth stating. The instance's own economics — the managed
flavour, storage growth, the connection limit, the difference between a
provisioned and a serverless-billing server — are the `datastore/postgres`
component's doctrine, and this file does not restate them. No dollar figures:
they age badly and are wrong per region anyway.

## The shape: write-once, read-rarely, delete-never

Almost nothing else in a product looks like this, and every trap below follows
from it.

- **Writes are proportional to privileged actions**, not to traffic. What is
  recorded is vwf's `audit-log` product foundation's decision, which the audit
  contract defers to; its default scope is operator actions plus destructive
  mutations, so the write rate is roughly the rate at which humans do
  consequential things.
- **Reads are rare and human-paced.** A handful of operators, a few queries
  each per incident.
- **Storage grows monotonically until the purge runs**, and never otherwise —
  the only term with no natural ceiling.

The consequence that matters: **the audit store is a small workload sitting on
the product's critical instance**, and every trap here is a way for a small
workload to cost the product's own queries something.

## Trap one: the events table is the largest table and the planner knows it

An unindexed history filter is a sequential scan over the biggest relation in
the database, competing for buffer cache with the queries that serve customers.
It gets slower every day the product runs, which is the property that makes it
invisible in testing and expensive in year two, and the cost lands on the
product rather than on the operator who ran it.

Index the three shapes the console actually offers, composite and ending in the
timestamp, and no others — [access shape](access-shape.md) names them. Check
with `EXPLAIN` before the surface ships.

## Trap two: `DELETE`-based purging is the expensive shape

Deleting rows does not return space; it marks them dead, and autovacuum then
does the work — on the largest table in the database, in a burst proportional
to the window cleared, against an instance that is also serving the product. A
quarterly purge of a year's growth is exactly the shape that turns into an
incident.

Two fixes, in order of preference:

- **Range-partition by time and drop the expired partition.** Removal becomes
  metadata: no scan, no dead rows, space returned immediately, and the
  documentation names data removal as a legitimate reason to choose the
  partition key. The trade is a DDL act rather than a DML one —
  [contract satisfaction](contract-satisfaction.md) states what that does to
  clause 4's guarantee.
- **If deleting, run it small and often.** A schedule that keeps each run
  bounded rather than discovering the purge as a quarterly event.

## Trap three: indexes are a write tax on every event

Each index is extra work on every insert, and this insert is inside the
mutation's own transaction — so an index added for a report nobody runs is paid,
in latency, by every privileged action the product performs, forever. Three
indexes are a considered set; a speculative fourth is not.

## Trap four: the unbounded query visits every partition

Partitioning makes the purge free and makes "everything this actor ever did"
expensive: with no time predicate there is nothing to prune, so the planner
opens every partition. The surface's defaulted time window is what keeps this
from happening, and it is a design decision rather than a UI nicety —
[access shape](access-shape.md).

## Trap five: widening the scope multiplies the store

Recording ordinary CRUD instead of privileged and destructive actions changes
the write rate from human-paced to traffic-paced — orders of magnitude, in rows,
in index maintenance and in storage, and permanently, because nothing here is
deleted early. On this store the multiplication lands on the instance the
product serves from, which is the concrete reason the audit foundation makes
widening a deliberate, elicited decision. Past a certain rate the honest answer
is that this is no longer a relational workload and the store is the wrong one.

## Trap six: a third role is a third connection budget

The datastore component's arithmetic — instances times pool size against the
server's connection limit — gains two more pools when the console's reader and
the purge job get their own. They are small, and they are not zero, and a
connection limit reached is a total outage rather than a slow query.
[Three roles](three-roles.md) is where the shared-pool alternative is weighed.

## What costs nothing

- **The store itself.** No second instance, no second backup, no second
  restore path, no separate bill — the audit schema is backed up with the
  product's database because it is in it.
- **The atomic write.** The event is another insert in a transaction that was
  already open. This is the cheapest correct write ordering any realization in
  this category offers, and it is the main thing the coupling buys.
