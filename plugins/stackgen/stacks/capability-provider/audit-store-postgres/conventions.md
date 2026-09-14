# Audit store · PostgreSQL — conventions

The audit store is **a schema of its own inside the product's own PostgreSQL
database**, written through one seam and read by one role. It is not a table in
the public schema and it is not a second database: on Postgres the access
boundary is the grant, so isolation is bought with privileges rather than with
an instance — and staying in the same database is what lets the event and the
act it records commit together.

**A dedicated schema, never the public one.** `audit` holds the events table
and nothing the application otherwise touches. The point is not tidiness: the
schema is the unit the roles below are granted on, so a table sitting in
`public` inherits whatever the application's role already holds there and the
grants stop meaning anything. Nothing in the application's own migrations
creates objects in this schema.

**Three roles, and the running application holds exactly one of them.** The
**writer** holds `USAGE` on the schema and `INSERT` on the events table — no
`SELECT`, no `UPDATE`, no `DELETE`, no `TRUNCATE` — and is the identity the
product's services connect as. The **reader** holds `SELECT` under policy and
is held by the console. The **purger** holds the one removal right and is held
by the retention job alone. None of the three owns anything: the schema, the
table and the trigger are owned by a migration role this pack separates from
the application's — the datastore contract asks only for an explicit migration
step, and giving that step its own identity is this pack's addition — which is
what keeps a running service from altering the rules it is bound by. Each of the three is a separate
connection identity, and which one a process connects as is the whole of the
enforcement.

**Triggers raise on update and delete, and the grants already refused them.**
A `BEFORE UPDATE OR DELETE` row-level trigger that raises is the second lock,
not the first — unlike a store with no roles, here the grant is the guarantee
and the trigger is what also catches the owner, the purge running too wide, and
a psql session someone opened by hand. `TRUNCATE` fires no row-level trigger at
all, so it is revoked *and* given a statement-level trigger of its own.

**One writer seam, and every privileged mutation passes through it.** Making a
mutation structurally unable to happen without an event is the product's
audit-log foundation's rule rather than a store capability; on this store it
lands as a single function that records the event **in the same transaction**
as the mutation. An endpoint that can mutate without going through the seam is
a hole, and the review question is always "what else writes this table" — with
the answer, uniquely on this store, checkable against the catalogue rather than
against a code search.

**A refusal cannot ride the transaction it is refusing.** Postgres has no
autonomous transaction, so an event recorded inside a unit of work that then
rolls back is rolled back with it. Denials, aborted privileged attempts and
anything else that must be recorded *because* the act did not complete are
written on a second connection, outside the transaction, and that is a design
decision made once rather than discovered per endpoint.

**Retention purge is the one delete path, and it is itself recorded.** Removal
happens on expiry, against a retained category with a legal basis, executed by
the purge identity — and the purge writes its own event once the run has
completed, naming the window it applied and the count it removed. Where the
table is partitioned by time the purge is a partition drop rather than a
`DELETE`, which is cheaper and is a DDL act the trigger does not see, so the
recording is the job's own responsibility and not the table's.

**Reads are two-tier and the tier is a policy, not a `WHERE` clause someone
remembers.** Operators read the history; the compliance role alone reads events
that reference retained post-deletion data. Row-level security expresses both,
which is the thing this store has that a store without roles does not — so use
it, and do not re-implement the same rule in application code where the two can
drift.

**Events reference ids and never copy personal data.** Actor id, target entity
and id, a stable action verb, the trace id. The moment an event body carries a
name or an email, the audit schema inherits every deletion obligation the
product has, in the one place designed so that nothing is deleted.

**Time is the store's, not the caller's.** The timestamp comes from the
database inside the transaction, never from a client clock — the datastore
contract requires it and an audit record is where a wrong clock is least
recoverable.

Full judgment: the `audit-store-postgres` skill's references. The contract it
cites is stackgen's audit contract; the store-wide half — pooling, migrations,
credentials and the cost of the instance — is the `datastore/postgres`
component's, in this composition's template.
