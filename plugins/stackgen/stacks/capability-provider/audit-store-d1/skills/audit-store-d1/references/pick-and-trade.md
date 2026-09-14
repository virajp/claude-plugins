# Audit store · D1 — pick & trade

## When it is the answer

**When the product already runs on Workers and already pins D1.** This is the
decisive signal, and it is about the shape of the write path rather than about
transactions. Same runtime, same binding model, no second driver, no second
connection story, no credential anywhere on the audit write path — the console
Worker declares one more binding and the seam is an ordinary D1 call. A product
whose mutations already happen inside a Worker adds an audit store without
adding a system.

**When a second database costs nothing to have.** D1 bills rows read, rows
written and storage, with no instance and no idle charge — a database nobody
queried today bills only its bytes. That is what makes "give audit its own
database" a design decision rather than a budget conversation, and it is the
single largest reason this pack exists at all: on most managed relational
services isolation-by-database is expensive enough that teams put audit in a
table instead — and a table beside the product's data is reachable by every
code path that already reaches that data, which leaves the contract's
insert-only, no-update-no-delete and console-only-read clauses with nothing
but code review behind them.

**When the read surface is one console and the queries are narrow.** Operator
history is filtered by actor, by target and by time window, paged, and read by
a handful of people. That is a small, indexable query set against an
append-only table — the shape D1 handles well.

**When the retention window is bounded and stated.** An audit dataset that
expires per event class, purged on a schedule, has a size that can be reasoned
about against D1's per-database ceiling.

## When it stops being the answer

**When the event must commit in the same unit of work as the action.** The
contract leaves the write ordering to the realization, and this realization has
no such unit to offer: isolation here is a second database, and D1 has no
transaction spanning two — so the guarantee becomes an ordering, event first,
with an over-report that is monitored rather than impossible. That is the one
real difference between this pack and the Postgres realization beside it, where
grants let the audit schema live in the action's own database and the write is
genuinely atomic. A product that can have both should.
[Contract satisfaction](contract-satisfaction.md) states the ordering and the
residual it leaves in full.

**When the compliance requirement is tamper-evidence rather than
append-only.** This is the honest limit of this pack. Append-only here is a
schema trigger plus a code seam, and both are removable by anything holding
`D1:Edit` on the account. That is a strong operational control and it is not a
cryptographic one: it does not prove to a third party that no row was ever
altered. A product whose legal basis needs that wants write-once storage with
object lock, or an append-only log with hash chaining, and neither is this.

**When the retention window is unbounded.** A D1 database is capped, and an
audit table only grows. A product that must keep every event for years needs
either a split with a real seam — a database per year, per tenant — or an
archive tier the events are exported into. Deciding that after the ceiling is
reached means migrating a dataset that is by definition not allowed to change.

**When the product is not on Workers.** Reaching D1 from outside the runtime is
the HTTP API and an account token — a write credential in something that is not
a Worker, which is the credential this store's whole design avoids. If the
mutations happen elsewhere, the audit store should be where they happen; the
Postgres realization of this same category is the neighbour to look at.

**When operators must run ad-hoc analytical queries over the whole history.**
Rows read is the meter and it counts rows scanned. A store people explore is a
store that scans, and an audit dataset is the worst-case shape for that: large,
append-only, and interesting precisely where the index is not. Narrow, indexed,
paged queries are what this store is priced for.

## What the choice does not commit you to

**It does not commit the product to D1 for its own data.** The audit store is a
separate database of this pack's choosing, reached through one seam. A
product could move its primary datastore and keep this one, or the reverse. The
seam is the whole reason that is true — see
[contract satisfaction](contract-satisfaction.md).

**It does not decide what is recorded.** Scope, event classes and retention
periods are the product's, elicited by the workflow's audit-logs foundation.
This pack decides where they live and what the store can and cannot promise
about them.
