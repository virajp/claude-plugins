# Audit store · PostgreSQL — pick & trade

## When it is the answer

**When the product already runs Postgres, and the invariants should be the
engine's rather than the code's.** This is the decisive signal and it is not
about familiarity. Postgres has real per-table privileges and row-level
security, so "the application can insert and cannot update", "only the console
reads" and "only the compliance role sees post-deletion references" are grants
and policies that the database refuses to break — not properties of a module
that a refactor can quietly change. On a store with no role system those same
clauses are code, held by review. That difference is the reason this pack and
its D1 neighbour exist as two packs instead of one.

**When the event must commit with the act it records.** The audit schema lives
in the same database as the product's data, so one transaction covers both: if
the mutation rolls back the event goes with it, and if the event cannot be
written the mutation does not happen. This is the strongest guarantee any
realization in this category offers, it is why the schema is a schema rather
than a second database, and it is precisely what the D1 realization cannot
have — there, isolation is a second database and no transaction spans two, so
the event is written first and over-reports under a monitor. A product that can
have the atomic version should.

**When retention is a window, and the volume justifies partitioning.** Range
partitioning the events table by time turns the retention purge into detaching
and dropping a partition — a metadata operation, not a scan, not a row-by-row
delete, and no bloat left behind. An audit store is the archetypal workload for
it: append-only, queried by time, and removed oldest-first.

**When the operator surface must answer questions nobody anticipated.** SQL
against an introspectable schema, with joins to the entities the ids reference.
A compliance question that arrives once a year is answerable without an export
or a new index-only surface.

## When it stops being the answer

**When the product does not already run Postgres.** Introducing a database to
hold audit alone inverts the ride: the audit store is then a system to operate,
back up, upgrade and connect to, and its whole claim was that it reuses the one
the product already has. Where the mutations happen somewhere else, the audit
store should be where they happen — the D1 realization of this same category is
the neighbour to look at.

**When the compliance requirement is tamper-evidence rather than
append-only.** This is the honest limit, and it is the same limit the D1 pack
names for a different reason. Grants bind roles; they do not bind the table's
owner or a superuser, both of whom can drop the trigger, alter the grants, or
rewrite a row. Row-level security is bypassed outright by a superuser and by
any role carrying `BYPASSRLS`, and the table's own owner bypasses its policies
unless the table is set to force them. That is a strong operational control and
it is not a cryptographic one: it does not prove to a third party that no row
was ever altered. A product whose legal basis needs that wants write-once
storage with object lock, or an append-only log with hash chaining, and neither
is this. [Three roles](three-roles.md) states where the trust boundary actually
falls.

**When nobody will operate the role discipline.** Three connection identities,
three sets of credentials or three mapped principals, and a review that keeps
each service on the right one. A grant nobody connects under is worse than an
honest code seam, because the code seam is visible and the unused grant reads
like enforcement. If the team will not sustain the discipline, say so and pick
the design whose enforcement it can actually keep.

**When audit volume is traffic-paced rather than human-paced.** Recording every
read, or every ordinary CRUD write, turns this into an event firehose, and an
append-only firehose is the workload the `datastore/postgres` component already
names as the wrong fit for the engine — partitioning, retention and vacuum
pressure become a standing operational cost against the same instance the
product serves from. The audit foundation makes scope an elicited decision; this
is the store-side reason it matters.

**When a refusal must be recorded and the transaction will not commit.**
Postgres offers no autonomous transaction, so an event written inside a unit of
work that aborts is discarded with it. Denials and failed privileged attempts
therefore need a second connection outside the transaction — workable, decided
once, and stated here because it is the one place this store's atomicity works
against it. [Contract satisfaction](contract-satisfaction.md) has the shape.

## Hosted flavours

The grants are the same on a managed instance, and one thing gets better: where
the host offers identity-based database authentication, each of the three roles
is reached by a mapped principal and there is no password to copy between
services — which is exactly the failure the connection discipline is guarding
against. The mechanism, and the caveat that a managed flavour may not hand out
the superuser or owner rights the migration step assumes, belong to the cloud
service's own pack — the `cloud-service/cloud-sql` component's identity
reference is the worked example.

## What the choice does not commit you to

**It does not decide what is recorded.** Scope, event classes and retention
periods are the product's, elicited by the workflow's audit-logs foundation.
This pack decides where they live and what the store can and cannot promise.

**It does commit the audit store to the product's database, and that is worth
saying plainly.** Unlike the D1 realization, whose separate database can be
kept while the primary datastore moves, this store rides the product's own
instance: moving the product off Postgres moves the audit store too, and a
restore of the product's database restores the audit schema with it. Atomicity
is what is bought with that coupling.
