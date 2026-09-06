---
name: cloudflare-d1
version: 0.1.0
category: development
description: >-
  Cloudflare D1 as this product's relational datastore — when a serverless
  SQLite database bound to a Worker is the right answer and when it is
  not, how it satisfies the datastore contract, the schema and migration
  discipline it demands, what read replication costs in consistency, a
  bill measured in rows rather than in hours, and the local database
  `wrangler dev` runs. Use when designing the data layer, writing
  migrations, or wiring the binding.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare D1

A serverless SQLite database a Worker reaches through a binding. This
skill carries the judgment; SQLite's own SQL surface, the Worker API's
current signatures and `wrangler`'s current flags belong to Context7 at
use time.

Read the reference that matches what you are doing — one, not all of
them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this datastore | [Pick & trade](references/pick-and-trade.md) |
| Designing schema, writing queries and migrations | [Service doctrine](references/service-doctrine.md) |
| Sizing the data, or explaining a bill | [Cost shape](references/cost-shape.md) |
| Wiring the binding, or granting automation | [Identity shape](references/identity-shape.md) |
| Running or testing against it on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** A database is capped at
10 GB, so **sizing is a design decision taken before the first table** —
per tenant or per bounded context, never one database for everything.
There are **no connections and no pool**, so none of the connection-limit
reasoning a server database demands applies here, and reaching for it is
the commonest way to over-engineer this store. And every statement is
**prepared and bound** — a query assembled by string concatenation is a
finding, not a style.

The rule this skill leans on hardest is the provider's, not its own: the
account is the unit of blast radius, and the API token this service needs
is scoped to D1 alone. That is the `cloudflare` skill's identity and IAM
reference, cited in [identity shape](references/identity-shape.md) and
restated nowhere.
