# Decision — audit is its own capability: `audit-store`, the `audit` category, per-stack provider packs

**Date** 2026-09-14 · **Branch** `2026-09-14-audit-capability` · **Plan**
[`docs/plans/2026-09-14-audit-capability/`](../../plans/2026-09-14-audit-capability/index.md)
· **Extends**
[`2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md`](./2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md)'s
category rule · **Backlog** B06

## What was decided before

**Two audit vocabularies, side by side and unreconciled.** The registry's
`cross_cutting:` block carried the foundation token `audit`, set to
`privileged-destructive`, and `capability-vocabulary.md` carried the per-project
token `audit-log`, kind **F** — "product foundation, nothing to pin". Both
appeared in the example registry. Nothing in either said where audit records
actually live: the foundation's Storage line answered it in passing ("a
dedicated append-only collection/table in the primary datastore"), which is a
realization decision written into a product contract.

**Observability claimed half of it.** `contracts/observability.md` listed, among
the capability tokens it realizes, "the transport half of `audit-log`" — so a
telemetry sink was, on paper, part of the answer to where audit records go.

**The category rule this extends.** The 2026-09-06 decision fixed how a
`category` is minted: the lists are closed per type, a new one lands in a single
edit to `assets/taxonomy.md`, and capability **tokens** stay vwf's while the
finer **category** taxonomy stays stackgen's. Four categories existed under
`capability-provider` — `identity`, `telemetry`, `workflow`, `secrets-manager`.

## The ruling

Decisions 1, 2 and 4 of the plan's assumed-decisions table, verbatim as
approved:

**1 — Token seam.** Mint `audit-store` as kind **B** in the vocabulary's
governance group; `audit-log` stays **F** as the product-side half (what is
recorded, the read surface, retention). Both entries state the split. Prose noun
for `audit-store`: "audit store". (User, MCQ.)

**2 — Realizations.** One `capability-provider` pack per store under a new
category **`audit`**, each riding an existing datastore pack and claiming
`capability: audit-store`. First two: `audit-store-d1` (rides
`cloud-service/d1`) and `audit-store-postgres` (rides `datastore/postgres`),
each `0.1.0` with its own bundle. (User, MCQ; "There will be different stores
depending on the stack".)

**4 — Contract.** `audit-event` is a standard entity: actor (id and class),
action, target (entity and id), timestamp, outcome, reason, trace id;
append-only, retention purge the only removal; ids not PII. `audit-history` is a
standard operator flow in the console project, mandatory once the audit
foundation is accepted; Authorization: operator roles read; the compliance role
alone for events referencing retained post-deletion data. The surveyor treats
both as coverage conditions. (User, MCQ.)

Summarised, decisions 3, 6, 7 and 8:

**3 — Analytics Engine is declined as an audit store**, in the contract, on the
pack's own recorded trades: it samples its totals and expires on a fixed window,
against an audit record's completeness and legal-basis retention.

**6 — Pack shape.** Doctrine and the six-topic references only, modelled on
`otel-lgtm`; no `config/` payload and no migration file. The schema, the
insert-only identity and the console-only read grants are *described*; the
target repo's plan writes the migration. Harness `local_stack: n/a`, with the
reason: the ridden datastore pack's own local stack already serves.

**7 — Observability.** `contracts/observability.md` drops the audit-transport
sentence and points at `contracts/audit.md` by role. The trace id is the whole
of what the two share.

**8 — Architecture.** Accepting or adapting the audit foundation in step 3c adds
`audit-store` to the `capabilities:` of the console project — the one carrying
`operator-rbac`. It is a `B` token, so a console that declares it and pins
nothing is `/vwf:doctor` §5's existing **non-blocking** finding, not a halt.

## What changed beside them

**The contract decides six things and refuses to decide two.** `audit.md`'s
clauses are: accept an insert and offer the writing role nothing else; refuse
update and delete to every application role; restrict reads to the operator
surface; make retention purge the one removal path and record the purge itself;
hold no personal data in an identifier; carry a trace id and copy nothing else
from telemetry. It does **not** decide the database instance — whether the store
is an isolated schema inside the product's own database or a separate database
of the same engine — and it does **not** decide the write ordering.

That second half was settled during the wave-1 review, not at plan time. The
first draft carried a same-database invariant and a same-atomic-unit invariant,
and the D1 pack immediately contradicted both. The ruling: **"rides an existing
datastore pack" names the engine, not the database instance**, because the
access boundary each engine can enforce is different, and a realization that
cannot write atomically with the act states its ordering and its residual rather
than being excluded. So the two packs differ where it matters and both satisfy
the contract:

|                | `audit-store-d1`                                                          | `audit-store-postgres`                                                                       |
| -------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Instance       | a dedicated D1 database                                                   | a schema in the product's own database                                                       |
| Enforced at    | the binding — only the console Worker holds it                            | the grant — insert-only writer, policy-bound reader, purger                                  |
| Write ordering | event first, over-reporting under a monitor (no cross-database atomicity) | one transaction with the act; refusals inside an aborting transaction named as the exception |

**The foundation stopped deciding storage.** `audit-logs.md`'s Storage line now
decides only that events are stored append-only, access-controlled and apart
from the product's ordinary reads; which store, and schema-versus-database,
belongs to the `audit-store` pin. Its read-surface line names the
`audit-history` flow instead of describing a console screen.

**Standard entities are a new concept, not a new special case.**
`assets/standard-entities.md` is the sibling of `standard-flows.md` — journeys
there, data contracts here. A standard entity is authored, reviewed and waived
exactly like any other; standard means the contract starts filled in. `950` is
`audit-history`'s designated number, the lowest free slot in the Account/system
band.

## Why

**The user's own words, from the B06 backlog item.** "Observability collects
logs, metrics and telemetry. However, there's a need to store AuditLogs and
these can contain sensitive data so it must be secured and accessible to ONLY
authorised people. Usually part of `console` project where authorised people can
access it. We need provision for that as independent capability (outside
observability ideally)."

**Telemetry and audit answer different questions, and the difference is not
stylistic.** A telemetry backend answers *what the system did*, and is allowed
to sample, to drop under load and to expire on a fixed window. An audit store
may do none of those, because a missing record is indistinguishable from an
action that never happened. Folding the second into the first would have made
every audit guarantee depend on a sink chosen for cost and cardinality.

**The store is a pin because access is the whole point.** `audit-log` has
nothing to pin — it is the product's own recording code. Where the records land,
and who can reach them, is a backing decision the console makes, which is
exactly the split `distributed-tracing` already makes under observability: there
the sink is the pin and the instrumentation is the contract; here the store is
the pin and the recording is the contract.

**Per-stack, because the user said so.** "There will be different stores
depending on the stack" — and the two first realizations prove it, since one
enforces with grants it has and the other with a binding it holds alone.

## Rejected

| Decision          | Rejected                                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Token seam        | reclassifying `audit-log` to `B`; one token doing both jobs                                                                               |
| Realizations      | one stack-agnostic audit pack; a list-valued `capability:` on a pack                                                                      |
| Analytics Engine  | a third pack — its own `pick-and-trade` declines billing-grade counts (sampled) and data that must outlive three months (fixed retention) |
| Contract          | today's `conventions.md#audit` anchor and the per-flow columns alone, with no entity and no flow                                          |
| Standard entities | an entry inside `standard-flows.md` rather than an asset of its own                                                                       |
| Pack shape        | shipping a migration file or a `config/` payload                                                                                          |
| Observability     | leaving both contracts claiming audit                                                                                                     |
| Architecture      | leaving the console's `audit-store` declaration to the user                                                                               |
| Contract scope    | deciding the database instance, or the write ordering, in the contract                                                                    |

## What stays outside

- **Doctor changes** — §5's provider check already covers any `B` token, so a
  declared-but-unpinned `audit-store` reports with no new code.
- **A `config/` payload or a migration in either pack** — decision 6.
- **A checker rule validating `pack.yaml`'s `category` against the taxonomy** —
  carried parked since 2026-09-06; there are now five categories it would catch
  a typo in.

### Parked

- **`audit-store-firestore`** — the document-datastore realization, once a
  product on Firestore needs one; the same shape as the two here.
- **An immutable-store pack** — write-once object storage with object lock, or
  an append-only event store, for a product whose legal basis needs
  tamper-evidence beyond database grants.
- **Customer self-view of their own audit events** — the foundation keeps it off
  by default; a flow for it is a product decision, not a store capability.
