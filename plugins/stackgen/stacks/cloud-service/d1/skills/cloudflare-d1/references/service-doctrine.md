# Service doctrine — Cloudflare D1

This component realizes the `relational-datastore` capability, so what it
owes is the neutral datastore contract
(`assets/contracts/datastore.md`), clause by clause. The contract states
what **any** datastore must do; this file states how this one does each,
**citing rather than restating**, which is what lets a second datastore be
judged against the same clauses.

## Contract satisfaction

**Optimistic concurrency on every mutable record.** A `version` column on
the row, and the check folded into the write:
`UPDATE … SET version = version + 1 … WHERE id = ? AND version = ?`. The
statement's own result says whether it won — D1 returns `changes` and
`rows_written` in the result metadata, so zero changed rows **is** the
stale-version signal, answered with the coded conflict response
([Worker API](https://developers.cloudflare.com/d1/worker-api/d1-database/)).
Read-then-write in two statements is the wrong shape here, because there
is no transaction to hold between them.

**Atomic multi-record writes.** `batch()`, which sends an array of
prepared statements in one call, executes and commits them sequentially,
and aborts or rolls the sequence back if any one fails
([Worker API](https://developers.cloudflare.com/d1/worker-api/d1-database/)).
This is the store's transaction unit and there is no other: **there is no
`BEGIN` a request can hold open**, because every query already runs
inside an implicit transaction of its own. Anything that must be true
together is composed into one batch, at authoring time, from statements
that need no intermediate result — a decision that has to be visible in
the design, since a batch cannot branch on what the previous statement
returned.

**Server-generated time.** A column default evaluated by the database,
never a timestamp sent by the client and never one the Worker took from
its own clock. The specific SQLite function belongs to Context7 at use
time; the rule does not — several Worker instances mean several clocks,
and an ordering derived from them is wrong in ways that surface as
impossible sequences much later.

**A deterministic local stack.** `wrangler dev` runs in local mode by
default and gives the Worker a local database behind the same binding,
and the same migration files apply to it with `--local`
([local development](https://developers.cloudflare.com/d1/best-practices/local-development/)).
The schema under test is therefore the schema the migrations produce,
which is what this clause asks for. What the local mode does not
reproduce is [local dev](local-dev.md)'s subject.

**Forward-only migrations, applied by an explicit deploy step.**
`wrangler d1 migrations create` writes the next numbered file; the
applied set is tracked in a table in the database itself, whose name and
whose source directory are configurable on the binding entry
([migrations](https://developers.cloudflare.com/d1/reference/migrations/)).
Migrations are committed with the code, and applied by the deploy —
**never at request time**, where the first request after a release races
every other first request. Forward-only means a mistake is corrected by a
new migration, not by editing an applied one, whose row in the tracking
table already says it ran.

The contract's **access rule** — every read and write through the
product's own services — is enforced by the shape rather than by policy.
A D1 database is reachable from a Worker holding its binding, or over the
account-authenticated HTTP API; there is no client-direct path and no
edge-evaluated rules engine, so a flow whose blueprint assumes a browser
subscribing to the store needs a different design.

## Statements are prepared and bound, always

D1 supports ordered (`?NNNN`) and anonymous (`?`) parameters through
`bind()`
([prepared statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)).
Concatenating a value into SQL is a finding rather than a style
preference, and preparing once and binding many times is also what makes
a batch cheap.

Four limits shape query design, and all four are documented rather than
folklore ([limits](https://developers.cloudflare.com/d1/platform/limits/)):
a maximum SQL query duration of 30 seconds, a statement length ceiling of
100 KB, at most 100 bound parameters per query, and a cap on queries per
Worker invocation that differs by plan. The last one is the one that
bites: a loop issuing one query per row of a result set is both the
slowest and the most expensive shape available, and it is what `batch()`
and a join exist to replace.

## Schema discipline

Constraints live in the database, not only in the application: a nullable
column the code guarantees non-null is a column that will eventually be
null. Foreign keys are enforced, and because every query is already
inside an implicit transaction the way to postpone the checks during a
schema change is `PRAGMA defer_foreign_keys = on`, which is implicitly
turned off at the end of that transaction and fails it if violations
remain
([foreign keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/)).

Indexes are designed alongside the queries that need them, and here that
has a direct cost consequence rather than only a latency one: the bill
counts **rows read**, and a query without a usable index reads the table.
[Cost shape](cost-shape.md) is where that argument lives; the schema is
where it is won.

## Per-environment databases

The binding names a database by `database_id`, so **an environment is a
database id**. Each environment gets its own database and its own id in
that environment's binding, and a `preview_database_id` covers the
preview target
([migrations](https://developers.cloudflare.com/d1/reference/migrations/)).
Nothing in the configuration is a secret — an id identifies, it does not
authorize — so these values sit in the checked-in configuration and the
credential story stays [identity shape](identity-shape.md)'s.

The failure this prevents is the quiet one: a staging deploy that keeps
production's id runs the suite, and its migrations, against production.

## Read replication and what a session buys

Replication is enabled per database, and it is not free of consequence
even though it is free of charge: a replica may serve a read that has not
yet seen a write which already returned. The Sessions API is the answer —
`withSession()` takes `first-primary`, `first-unconstrained` (the
default) or a bookmark from an earlier session, and `getBookmark()`
returns a token identifying the state the session has seen, which a later
request replays to be served no staler than that
([read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/)).

Two decisions follow, and both belong in the blueprint rather than in a
code review: **which flows must read their own writes** (those carry the
bookmark forward, typically through a response header the client returns)
and **which are content to be eventually consistent** (those take the
default and say so). A product that enables replication and uses no
sessions has chosen the second answer for every flow, whether or not
anyone decided it.

## Backup doctrine

Time Travel is on by default, needs no scheduling, and restores the
database to a point in time inside the plan's retention window
([release notes](https://developers.cloudflare.com/d1/platform/release-notes/));
`wrangler d1 time-travel info` resolves a timestamp to a bookmark before
anything is restored
([wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/)).

Three rules around it. **A restore is the whole database**, so it is an
incident action and never a routine one. **It is not an export** — a copy
of the data outside the account is a separate decision, and a product
with a retention or portability obligation needs to have taken it. And
**it is not a test fixture**, which is the mistake worth naming, because
the alternative — recreating a local database from migrations plus seed —
is faster and does not touch anything shared.
