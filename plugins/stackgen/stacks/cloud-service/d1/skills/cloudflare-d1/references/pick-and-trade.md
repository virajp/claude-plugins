# Pick & trade — Cloudflare D1

## When this is the answer

Three signals, and the first two together are usually enough:

- **The data model has real relationships.** Joins, referential integrity
  and constraints enforced by the store rather than by every caller.
  Cloudflare positions D1 as the relational option among its storage
  products, for structured data with a high read-to-write ratio
  ([choose a storage product](https://developers.cloudflare.com/workers/platform/storage-options/)).
- **The compute is already Workers.** The query is a binding call from
  the runtime that issued it, not a network round trip to another cloud,
  and there is no connection to establish, pool or exhaust — which is the
  single largest operational difference from a server database.
- **The dataset has a natural bound.** Per tenant, per product, per
  bounded context: something that fits inside a 10 GB database and stays
  there.

## When it stops being the answer

- **The database already exists somewhere else.** A Postgres or MySQL
  instance a team already runs is not a migration candidate merely
  because the front end moved to Workers. Reaching it is
  **Hyperdrive**'s job — its own component — and that keeps the drivers,
  the ORM and the operational knowledge the team already has.
- **The dataset has no bound.** A single database is capped at 10 GB, and
  the documented remedy is splitting into several smaller databases
  ([limits](https://developers.cloudflare.com/d1/platform/limits/)). If
  the shape of the data offers no seam to split on, the ceiling is a real
  ceiling and the store is the wrong one.
- **The state is per-object and must be strongly consistent under
  concurrent writers.** That is Durable Objects' SQLite storage —
  business logic and its database on the same machine, addressed one
  object at a time. Cloudflare states the pricing and query limits are
  intended to be the same, so the choice is about shape rather than cost:
  a shared relational database many requests read, versus a single
  object's private store. That component is **planned and not offered
  yet** — a product that needs it has a gap to name.
- **The access pattern is a key lookup with no relationships in it.**
  Workers KV is the cheaper and simpler answer for configuration,
  routing metadata and read-mostly lookups, and it is its own component.
  A table with two columns and no joins is a hint that the relational
  store is not earning its schema.
- **The workload is write-heavy or high-cardinality time-series.** Rows
  written is a billing term here and there is one primary; append-only
  telemetry belongs in Analytics Engine, and streaming ingestion in
  Pipelines. Both are their own components.

## Sizing is the pick, not a tuning step afterwards

The 10 GB ceiling makes "how will this be split" a question answered
before the first table rather than during an incident. Two shapes work,
and both are decided up front:

- **A database per tenant.** Cloudflare names this as one of the two
  isolation shapes for multi-tenant data on D1, the other being row-level
  isolation inside one shared database
  ([data isolation](https://developers.cloudflare.com/use-cases/saas/data-isolation/)).
  The seam is obvious, the blast radius of a restore is one tenant, and
  each tenant's growth is independent. The cost is that a cross-tenant
  query does not exist — every aggregate is assembled by the
  application, or by a separate store fed from these.
- **A database per bounded context.** One for the catalogue, one for
  billing. The seam is the domain boundary the blueprint already draws,
  and the same rule applies: no joins across the line.

**What does not work is deferring the decision.** Splitting a full
database later means migrating data and rewriting every query that
crossed the seam, at the point where the store has already stopped
accepting writes.

## The trade against a server database, stated plainly

What is given up: long-lived transactions held open across requests
(every query runs inside an implicit transaction of its own), the mature
Postgres extension ecosystem, and a dialect most teams already know
deeply. What is gained: no connection management at all, a bill that
falls to nothing when nothing is running, and read replicas that cost no
more than the rows they serve
([read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/)).

That trade is worth taking for a product being built on Workers, and it
is rarely worth taking as a migration away from a database that already
works.
