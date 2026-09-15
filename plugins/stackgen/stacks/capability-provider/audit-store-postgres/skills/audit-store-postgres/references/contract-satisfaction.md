# Audit store · PostgreSQL — contract satisfaction

Clause by clause against stackgen's neutral audit contract. It cites, and does
not restate. Unlike the D1 realization beside it, no clause here is met by a
code boundary standing in for a missing grant — every one of the six is held by
the engine, and what is left over is the discipline that keeps the engine's
answer true, which is [three roles](three-roles.md).

Before the clauses, the two things the contract deliberately hands to the
realization. It asks each to be stated here and in the pick-and-trade and
access-shape topics rather than assumed, so both are stated.

## Handed over 1 — the instance: a schema in the product's own database

Postgres draws its access boundary at the **grant**, per schema and per table,
and again at the **row** through row-level security policies. So isolation does
not require a separate instance: a table in an `audit` schema that the
application's role holds `INSERT` on and nothing else is more isolated than the
same table in a second database reached by a role that can do anything to it.

Because the boundary is a grant rather than a connection, the audit events can
live where the product's data lives — and that is what makes clause 2's
ordering the atomic one below. The realization that decides the other way is
the D1 one, and it decides that way because it has no grants at all; [pick &
trade](pick-and-trade.md) weighs the two.

Two consequences of the schema choice, both deliberate:

- **Not the `public` schema.** Grants are what this pack runs on, and a table
  in the schema the application already works in inherits whatever the
  application's role already holds there.
- **The schema's objects are owned by the migration role, not by any of the
  three.** The datastore contract asks only that migrations be applied by an
  explicit step; separating that step's identity from the application's is this
  pack's own addition, and audit is where it stops being hygiene and becomes
  the enforcement, because the owner is the one identity a policy does not
  restrain by default.

## Handed over 2 — the write ordering: one transaction, and one exception

**This realization writes the event in the same unit of work as the act it
records.** Both are in the same database, so the seam's insert and the
mutation are one transaction: the mutation cannot commit without its event, and
an event cannot survive a mutation that rolled back. The contract asks a
realization that cannot do this to state its ordering and its residual; this one
can, and the statement is that there is no ordering to state and no residual on
the successful path.

**The exception is the act that must be recorded because it did not happen.**
A denied privileged attempt, a validation refusal an operator needs to see, an
abort — these are recorded inside a transaction that is about to roll back, and
Postgres has no autonomous-transaction construct to escape it with. So:

- **Refusals are written on a second connection**, outside the aborting
  transaction, by the same seam through a separate entry point that says so in
  its name. The alternative documented route out of a transaction is a loopback
  connection through `dblink` or `postgres_fdw`, which is the same second
  connection with more machinery.
- **The two paths are not interchangeable.** A seam that writes every event
  outside the transaction has thrown away the atomicity that is this store's
  main reason for existing; a seam that writes every event inside it silently
  loses every refusal. Which endpoint uses which is a blueprint decision.
- **The residual is on the refusal path only**: a crash between the refusal
  event and the rollback leaves an event for an act that never happened —
  which, being a refusal, is what the record already says.

## Clause 1 — accept an insert, and offer the writing role nothing else

**Satisfied by grants.** The writer role holds `USAGE` on the audit schema and
`INSERT` on the events table. It is not granted `SELECT`, `UPDATE`, `DELETE` or
`TRUNCATE`, and `PUBLIC` holds nothing on the schema — the engine grants no
table privileges to `PUBLIC` by default, and anything inherited from an earlier
migration is revoked explicitly rather than assumed absent. Where the schema
will gain further tables, the same shape is set once with `ALTER DEFAULT
PRIVILEGES IN SCHEMA audit`, so a table added later does not arrive with the
wrong grants.

There is a stronger form worth taking where the seam's arguments are stable:
give the writer **no table privilege at all** and only `EXECUTE` on a
`SECURITY DEFINER` function owned by the schema's owner, which performs the
insert. The function then defines the record shape, and the application cannot
write a row the function would not have written. Two rules come with it: set an
explicit `search_path` on the function with `pg_temp` last, and revoke the
default `PUBLIC` execute grant in the same transaction that creates it — both
are the documented way to write such a function safely.

## Clause 2 — refuse update and delete to every application role

**Satisfied by grants first, and by a trigger second.** This is the clause where
this store differs most from a store with no roles: the primary mechanism is the
absence of the privilege, which the engine enforces against every statement
that identity can issue, from any client.

The trigger is the second lock and it is not redundant:

- A `BEFORE UPDATE OR DELETE` row-level trigger that raises catches what a
  grant does not — the owner, a psql session opened by hand, and a retention
  purge whose predicate ran wider than its window.
- It admits **exactly one** delete: rows past their retention date, and nothing
  wider. A trigger that admits any delete has re-opened the clause.

**Named gap — `TRUNCATE` is a separate right and fires no row-level trigger.**
It is its own privilege in the grant list, and the documentation is explicit
that a trigger on truncation can only be declared at statement level. So the
clause needs both halves: `TRUNCATE` revoked from every role, and a
`BEFORE TRUNCATE ... FOR EACH STATEMENT` trigger that raises. A design that
guards `UPDATE` and `DELETE` and forgets truncation has left the widest delete
in the engine unguarded.

**Named gap — the owner and the superuser are inside the trust boundary.**
Whoever owns the table can drop the trigger and change the grants; a superuser
can do anything. This is the same limit the D1 realization names for its
account, and it is not a Postgres peculiarity. [Three roles](three-roles.md)
states what control applies instead, and where a product's threat model has
outgrown database-enforced append-only entirely.

## Clause 3 — restrict reads to the operator surface

**Satisfied by a grant plus row-level security, which is what this store has
and its neighbour does not.** `SELECT` on the events table is granted to the
reader role alone, held by the console — no product service holds it, so no
product service can read audit at all.

Inside it, the contract's second tier is a policy rather than application code.
Row-level security is enabled on the table and the policies name the roles they
apply to: the general operator reader sees events not flagged as referencing
retained post-deletion data, and the compliance role sees all of them. With RLS
enabled and no applicable policy, the engine's default is deny, which is the
right default for this table.

Three things to decide out loud, because the policy only helps if they are
right:

- **The flag is written, not derived.** Whether an event references retained
  post-deletion data is decided by the seam at write time and stored as a
  column. A read-time derivation is a rule that drifts the first time an
  entity's retention changes, and a policy predicate is the worst place to
  discover that.
- **Force the policies on the owner.** A table's owner bypasses its policies
  unless the table is set to force row-level security, so an owner-run report
  reads everything. Decide whether that is wanted; if it is not, force it.
- **`BYPASSRLS` is a role attribute someone can grant.** Review it, the way the
  superuser list is reviewed.

## Clause 4 — retention purge is the one removal path, and records itself

**Satisfied by a purge identity, and it has two shapes.**

*As a delete.* A third role holds `DELETE` on the events table and nothing else
holds it. The trigger of clause 2 admits exactly its rows. This is the simple
shape and it is correct; its cost is bloat and vacuum work on the largest table
in the database — [cost shape](cost-shape.md).

*As a partition drop.* Where the table is range-partitioned by time, retention
becomes detaching the expired partition and dropping it. The documentation
names this as a reason to choose the partition key, and it is the shape an audit
store wants: constant-time, no scan, space returned. The trade is that this
is DDL rather than DML — it takes ownership, not the `DELETE` grant, so it does
not run as the purge role and **the trigger never sees it**. The guarantee
moves from the table to the job.

Either way, the purge writes its own record when the run completes, naming the
window it applied and the count it removed. Under the partition shape that
record is the only evidence there is, which is the reason it is not optional.

**Point-in-time recovery is not this.** Restoring the database to an earlier
point rewinds the audit schema with everything else — it is recovery, and using
it against this store as a reset rewinds the record. Where an archive tier is
wanted, a detached partition dumped to storage whose own retention is stated is
the path.

## Clause 5 — no personal data in an identifier

**Satisfied by discipline, not by the store**, and here the stakes are raised
twice over: the audit schema is the one place in the product where nothing is
deleted, *and* it sits in the same database as the entities it references, so
the temptation to denormalize a name into an event is right there.

Events carry ids. Resolution from id to person happens at read time, in the
console, against the tables that are allowed to forget — which is what lets a
record survive its subject's deletion and remain meaningless to a reader
without the resolving grant. The reader role's grants are what enforce that
second half: `SELECT` on the audit schema does not imply `SELECT` on the
entities the ids point at.

**A foreign key from an event to an entity is a mistake.** It looks like good
schema design and it defeats the clause: the reference becomes enforced, so
deleting the subject either fails or cascades into the store that must not be
deleted from. Ids are values here, not references.

## Clause 6 — a trace id, and nothing else from telemetry

**Satisfied by a column, wired at the seam.** The trace id of the request that
produced the event comes from the request context rather than from an argument
every caller can forget. No spans, no metrics, no log lines: the id is the whole
of the seam between this store and the telemetry backend.

## The record shape, and where the clock comes from

Actor id and actor class, a stable action verb from the flow's Trigger &
Actors, target entity and target id, timestamp, outcome, reason, trace id, and
the retained-reference flag clause 3 needs — all columns, not a `jsonb` blob,
because the console filters on actor, target and time and because a policy
predicate over an extracted key is a predicate the planner cannot index well.
Where a payload genuinely varies, a `jsonb` detail column beside the typed ones
is fine; what must never be in it is anything a filter or a policy reads.

**Time comes from the store.** The timestamp defaults to the database's own
clock inside the transaction rather than being passed in by the caller — the
datastore contract's clause, and an audit record is where a wrong client clock
is least recoverable. Note that the transaction's start time is what that
clock returns, which is the property wanted: the event and the act it records
carry the same instant.

## What this rests on

The PostgreSQL documentation consulted for this file, so a reader can check
whether it has moved:

| Fact | Source | Confidence |
| --- | --- | --- |
| Privileges are per table and include `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE` separately; no table privileges are granted to `PUBLIC` by default | [privileges](https://www.postgresql.org/docs/current/ddl-priv.html) | documented |
| `ALTER DEFAULT PRIVILEGES IN SCHEMA … GRANT INSERT ON TABLES TO …` sets the shape for tables created later | [ALTER DEFAULT PRIVILEGES](https://www.postgresql.org/docs/current/sql-alterdefaultprivileges.html) | documented |
| `CREATE POLICY … FOR SELECT TO <role> USING (…)`; RLS must be enabled on the table; with RLS on and no applicable policy the default is deny | [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html) | documented |
| Superusers and roles with `BYPASSRLS` bypass row security; the owner bypasses its own policies unless `FORCE ROW LEVEL SECURITY` is set | [row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) | documented |
| A `BEFORE UPDATE OR DELETE … FOR EACH ROW` trigger may call `RAISE EXCEPTION` to refuse the statement | [triggers](https://www.postgresql.org/docs/current/plpgsql-trigger.html), [CREATE TRIGGER](https://www.postgresql.org/docs/current/sql-createtrigger.html) | documented |
| Truncation triggers can only be defined at statement level, so a row-level trigger does not see `TRUNCATE` | [trigger behavior](https://www.postgresql.org/docs/current/trigger-definition.html) | documented |
| A `SECURITY DEFINER` function runs with its owner's privileges; set an explicit `search_path` ending in `pg_temp`, and revoke the default `PUBLIC` execute grant in the creating transaction | [CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html) | documented |
| Range partitioning by a time column; `ALTER TABLE … DETACH PARTITION` and `DROP TABLE` remove old data quickly, and data removal is named as a reason to choose the key | [partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html) | documented |
| `SET LOCAL ROLE` changes the current user for the remainder of the transaction only | [SET ROLE](https://www.postgresql.org/docs/current/sql-set-role.html) | documented |
| **No autonomous-transaction construct** | — | **an absence, not a documented statement** |
| **A `BEFORE … FOR EACH ROW` trigger declared on a partitioned parent** | — | **verify against the pinned major version** |

The last two rows are the ones to be careful with. The first is an absence:
nothing in the documentation offers a way to commit work from inside a
transaction that then rolls back, and the routes people reach for — `dblink`, a
second pool connection — are all second connections wearing different clothes.
The second is a version question rather than a doubt: row-level triggers on a
partitioned parent have not always been allowed, so where the purge shape is a
partition drop, **prove the append-only trigger fires on a partition** in the
migration's own test against the major version the product pins, rather than
against this file.
