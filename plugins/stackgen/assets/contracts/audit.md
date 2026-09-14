# Audit — the capability contract

What **any** audit store has to satisfy to serve a vwf product, stated without
naming one. The provider packs under `stacks/capability-provider/` say how a
particular store satisfies it; each of them rides a datastore pack the product
already uses, and says which.

Capability tokens realized here: `audit-store`. Blueprint prose calls it **the
audit store** — never the product name. Its product-side half is vwf's
`audit-log` foundation, which is not a pin: *what* is recorded, who may read it
and how long it is kept are decided there. This contract only says what the
store holding those records has to be able to do.

## What an audit store is, and is not

An audit store holds **append-only records of accountable action**. Every
record answers one question — *which actor did what, to which thing, when, and
whether it succeeded* — and it exists so that question can still be answered
months later by a reader who was not there and is not a developer: an operator,
a compliance officer, an auditor.

That is a different job from telemetry, and the line is not stylistic. A
telemetry backend answers *what the system did*, and is allowed to sample, to
drop under load and to expire on a fixed window; an audit store may do none of
those, because a missing record is indistinguishable from an action that never
happened. `contracts/observability.md` is the contract for the first, and the
only thing the two share is a trace id.

## What a store must be able to do

1. **Accept an insert, and offer the writing role nothing else.** The identity
   the product writes with can append and read back nothing it did not need to
   append. Where the store can express that as a grant, it is a grant; where it
   cannot, the exception below applies.
2. **Refuse update and delete to every application role.** Not "the product
   does not issue them" — the product cannot issue them. An audit record that
   an application bug can rewrite is a record that proves nothing, and the
   difference is invisible until the moment it matters.
3. **Restrict reads to the operator surface.** Only the project that carries
   the operator console reads audit records, and inside it only the operator
   roles — with events referencing data retained past its subject's deletion
   readable by the compliance role alone. No customer-facing path reads this
   store at all unless the product decides otherwise, which is a foundation
   decision and not a store capability.
4. **Make retention purge the one removal path, and record the purge itself.**
   Records leave when the retention window says so and never otherwise; the
   purge run is itself an audit record, naming the window it applied and the
   count it removed. A store whose only delete is indistinguishable from an
   application delete has not satisfied clause 2.
5. **Hold no personal data in an identifier.** Actor, target and tenant are
   opaque ids that resolve elsewhere. This is what lets a record outlive the
   subject it references: purging the person's data leaves the accountability
   record intact and meaningless to anyone without the resolving grant.
6. **Carry a trace id, and copy nothing else from telemetry.** One field links
   a record to the investigation around it. The store does not hold spans,
   metrics or log lines, and the telemetry backend does not hold audit records
   — the id is the whole of the seam.

A clause a store cannot satisfy is **stated as such** in its pack's contract-
satisfaction topic (`${CLAUDE_PLUGIN_ROOT}/assets/kinds.md`), never omitted. A
store with no role system is a legitimate pick with a named gap: clauses 1 and
2 are then enforced at the boundary in front of it, and the pack says where and
what that boundary cannot stop.

Two things this contract deliberately leaves to the realization. **The
instance**: whether the records live in their own schema inside the database
the product already runs, or in a database of their own on the same engine, is
decided per store, in its pick-and-trade and access-shape topics — because the
access boundary an engine can enforce differs, and the instance is part of how
the clauses above are held rather than a clause itself. **The write ordering**:
a realization that can write the record in the same unit of work as the act it
records says so; one that cannot states its ordering — which side is written
first — and the residual that ordering leaves, so a product plans for it
instead of discovering it.

## The local-stack stance

A realization here **rides a datastore pack**: it reuses an engine the product
already runs rather than introducing one. So it composes no engine of its own,
and declares `local_stack: n/a` with that reason — the ridden pack's local
stack *is* the audit store's local stack, and standing up a second service
would be testing the store against an engine the product does not use.

## The realizations

One pack per store, each naming the pack it rides:

| Pack                   | Rides                | The constraint that bites                             |
| ---------------------- | -------------------- | ----------------------------------------------------- |
| `audit-store-d1`       | `cloud-service/d1`   | no in-database roles; enforcement sits at the binding |
| `audit-store-postgres` | `datastore/postgres` | real grants, held by a role the application never has |

The column is the difference that decides the design, not a ranking. Where the
store has no role system, clauses 1, 2 and 3 are satisfied by the code path
that holds the only handle to it, and the pack states plainly what a bug in
that path can do that a grant would have stopped. Where the store has grants,
the cost moves instead to operations: the schema and the grants are applied by
an identity the running application never holds, and the retention purge of
clause 4 runs as a third identity again.

Each pack's own six topics carry the detail — the append-only schema, the
insert-only role and the console-only read grants are described there, and the
migration that creates them is written by the target repo's plan rather than
shipped as a payload here.

## Declined — `cloud-service/analytics-engine`

An analytics sink is not an audit store, and the pack declines the role in its
own words. Its *pick & trade* topic already lists **"billing-grade counts"** as
the wrong answer, because **"sampling makes totals estimates"**, and **"data
that must outlive three months in place"**, because **"retention is fixed;
anything longer is an export the product schedules and owns"**.

Both trades land exactly on what an audit store is for. An audit log is
complete or it is nothing — a sampled record set cannot answer whether an
action happened — and its window is set by the legal basis for keeping it,
which is a decision the product makes and a store must then honour, not a
platform default it inherits.

## What this contract does not decide

- **Which store.** That is the pin, one per project, from the realizations
  above or a cloud plugin's managed flavour. The axis that separates them is
  where the invariants are enforced, and each pack's pick-and-trade topic is
  where that argument belongs.
- **What is recorded, and for how long.** vwf's `audit-log` foundation decides
  the event set, the read surface and the retention window per product; the
  store honours whatever comes out of it.
- **Who the operator and compliance roles are.** That is the identity
  contract's and the product's — this one only insists the store can tell them
  apart from everyone else.
- **Whether a product must have one at all.** Mandating audit is a vwf-side
  statement; this contract says what a store has to do once the foundation is
  accepted and the capability declared.
