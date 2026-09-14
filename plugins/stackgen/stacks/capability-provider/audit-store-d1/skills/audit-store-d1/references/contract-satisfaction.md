# Audit store · D1 — contract satisfaction

Clause by clause against stackgen's neutral audit contract. It cites, and does
not restate. Two of the six clauses are met at a boundary in front of the store
rather than by the store — the contract admits that shape and asks the pack to
say where the boundary is and what it cannot stop, which is what the entries
below do. A clause held by code rather than by the platform is a design
constraint on the product, not a defect to hide.

Before the clauses, the two things the contract deliberately hands to the
realization. It asks each to be stated here and in the pick-and-trade and
access-shape topics rather than assumed, so both are stated.

## Handed over 1 — the instance: a D1 database of its own

D1 offers no per-table, per-row or read-only grant inside a binding — a Worker
holding the binding can do anything to that database. That fact is the
`cloud-service/d1` component's to state and this pack does not restate it; what
follows from it is this pack's whole shape.

Isolation on D1 is *which database*, because that is the only line the platform
draws. So the audit events live in a **second D1 database on the same engine**,
bound by the console Worker and by nothing else. A schema beside the product's
data would be reachable by every code path that already reaches that data,
including the ones that write it, and no grant exists to say otherwise — the
contract's read restriction and its insert-only rule would both be prose.

This is the realization's call, not the contract's, and it is the call that
makes clauses 1, 2, 3 and 4 enforceable here at all. It is also what forces the
ordering below. The Postgres realization of this category decides the other
way, because grants let one database hold both — [pick &
trade](pick-and-trade.md) is where the two are weighed.

## Handed over 2 — the write ordering: event first, over-report monitored

**This realization cannot write the event in the same unit of work as the act
it records.** D1's batch API runs a statement sequence in one call and rolls the
sequence back if any statement fails — a real atomic unit — but it does not
span two databases. One binding covering both databases would buy that unit and
remove every access boundary there is, so the isolation above and a shared
transaction cannot both be had here.

The ordering, and the residual it leaves:

- **Record the event first, then perform the mutation.** A crash between them
  leaves an event for a mutation that did not happen — the record over-reports,
  which is detectable, reviewable, and the failure the product can live with.
- **The reverse ordering is not an option.** A mutation nobody recorded is
  precisely what audit exists to prevent.
- **The outcome is reconciled by a second event, never by an edit** — clause 2
  admits no other correction.
- **The residual is bounded and measurable.** An event whose mutation never
  followed is findable: it is an event with no terminal outcome. A scheduled
  reconciliation that reports the count is what turns an admitted weakness into
  a monitored one, and it is what the product plans for instead of discovering.

## Clause 1 — accept an insert, and offer the writing role nothing else

**Named gap: D1 has no roles, so this is enforced at the boundary in front of
the store.** The contract admits this shape explicitly and asks the pack to say
where the boundary is and what it cannot stop.

*Where it is.* One module in the console Worker exposing two functions and no
third — an append that only inserts, and a query that only selects. Nothing
else in the product imports it, and no other Worker declares the binding.

*What it cannot stop.* A bug or a change inside that module. A grant would make
"this code path can only insert" a property of the database; here it is a
property of a file, held by review and by the module boundary. The honest
statement in the blueprint is that the writer is trusted, not constrained.

## Clause 2 — refuse update and delete to every application role

**Two mechanisms, and only one of them is a guarantee.**

*At the schema.* Triggers on the events table that abort `UPDATE` and `DELETE`.
These hold against every writer — a Worker, a `wrangler d1 execute`, the
dashboard console — which is more than the code boundary of clause 1 gives.
This rests on D1 executing SQLite triggers; see *What this rests on* below,
where it is the one claim the published documentation does not settle. Prove it
in the migration that creates the table: the migration's own test attempts an
`UPDATE` and expects the abort. A trigger nobody ever fired is a rule you are
trusting on the strength of having written it.

*At the seam.* The insert-only module of clause 1. This is what actually holds
in the application, because a trigger can be dropped by anything holding
`D1:Edit` on the account, and the drop is an ordinary migration.

**Named gap:** the account is inside the trust boundary. Nothing in D1's
configuration prevents an account administrator from rewriting a row. See
[no roles](no-roles.md), which also names the point at which a product's threat
model has outgrown this store entirely.

## Clause 3 — restrict reads to the operator surface

**Satisfied at the boundary, not by the store.** The console Worker is the only
binding holder, which restricts reads to the operator project. Inside it, "the
compliance role alone reads events referencing retained post-deletion data" is
the console's own authorization, applied in the `WHERE` clause and classified
by the seam at write time.

That is the constraint that reshapes this design and it has its own file —
[no roles](no-roles.md).

## Clause 4 — retention purge is the one removal path, and records itself

**Satisfied by an explicit scheduled job.** D1 has no TTL and no expiry: rows
persist until something deletes them, so retention is a purge the product runs,
per event class, holding the compliance role.

Three things make it the *one* path rather than a second delete:

- **The trigger of clause 2 admits exactly one delete** — rows past their
  retention date, and nothing wider. A trigger that admits any delete has
  re-opened the clause.
- **The purge writes its own record once the run has completed**, naming the
  window it applied and the count it removed.
- **Time Travel is not this.** It restores the whole database to a point inside
  a 30-day window; it is recovery, and using it against an audit database would
  rewind the record itself. Where an archive tier is wanted, the export path is
  the one to use — `wrangler d1 export`, or the account-level export endpoint —
  into storage whose own retention is stated.

## Clause 5 — no personal data in an identifier

**Satisfied by discipline, not by the store**, and the store raises the stakes
rather than lowering them. An audit database is the one place in the product
where nothing is deleted, so personal data written into an event body outlives
every deletion obligation the product has, in the store least able to comply.

Events carry ids. The resolution from id to person happens at read time, in the
console, against the store that is allowed to forget — which is what lets a
record survive its subject's deletion and remain meaningless to a reader
without the resolving grant.

## Clause 6 — a trace id, and nothing else from telemetry

**Satisfied by a column, wired at the seam.** The trace id of the request that
produced the event comes from the request context rather than from an argument
every caller can forget. No spans, no metrics, no log lines: the id is the whole
of the seam between this store and the telemetry backend.

## The record shape, and where the clock comes from

Actor id and actor class, a stable action verb from the flow's Trigger &
Actors, target entity and target id, timestamp, outcome, reason, trace id — all
columns, not a JSON blob, because the console filters on actor, target and time
and a filter over extracted JSON is a filter the index cannot help. Where a
payload genuinely varies, D1 supports generated columns, so the filtered field
is projected out of the JSON into a `STORED` column the index can reach.

**Time comes from the store.** The timestamp column defaults to the database's
own clock rather than being passed in by the caller — the datastore contract's
clause, and an audit record is where a wrong client clock is least recoverable.
A seam that accepts a timestamp argument has handed that guarantee back.

## What this rests on

The D1 documentation consulted for this file, so a reader can check whether it
has moved:

| Fact | Source | Confidence |
| --- | --- | --- |
| D1 runs SQLite's query engine and is "compatible with most SQLite's SQL convention" | [SQL statements](https://developers.cloudflare.com/d1/sql-api/sql-statements/) | documented |
| The batch API runs a statement sequence in one call and rolls it back on failure | [Worker API](https://developers.cloudflare.com/d1/worker-api/d1-database/) | documented |
| Generated columns, including `STORED`, projected out of a JSON text column | [generated columns](https://developers.cloudflare.com/d1/reference/generated-columns/) | documented |
| No per-table, per-row or read-only grant inside a binding; off-request access is an account token carrying `D1:Read` or `D1:Edit` | [read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/), and the `cloud-service/d1` component's identity reference | documented |
| Time Travel restores the whole database to a point within the last 30 days | [wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/) | documented |
| A database exports to a SQL dump, by CLI or by the account export endpoint | [wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/) | documented |
| Migrations are numbered files applied by an explicit step, backed up after applying and rolled back on error | [migrations](https://developers.cloudflare.com/d1/reference/migrations/) | documented |
| **`CREATE TRIGGER` and `RAISE(ABORT)`** | — | **not settled by the docs** |

That last row is the one to be careful with. Cloudflare publishes no explicit
supported-statement list and no trigger example; what it does publish is a
PRAGMA allowlist that includes `PRAGMA recursive_triggers`, on the same page
that says the engine is SQLite's — strong indirect evidence that triggers
execute, and not a statement of support. Treat the schema-level half of clause
2 as **verified by the migration test, not by this file**, and note that the
seam-level half does not depend on the answer.
