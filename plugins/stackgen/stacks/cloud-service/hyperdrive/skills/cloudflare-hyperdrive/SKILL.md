---
name: cloudflare-hyperdrive
version: 0.1.0
category: development
description: >-
  Cloudflare Hyperdrive as the connection pool and query cache in front
  of a product's existing Postgres or MySQL — when a proxy is the answer
  and when a different datastore is, what the origin must satisfy, how
  caching decides correctness before it decides speed, the least
  privilege the configuration needs, and why a laptop never exercises
  the pool.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Hyperdrive

A connection pool and a query cache between Workers and a relational
database that already exists somewhere else. This skill carries the
judgment; driver APIs, the wrangler flag surface and the current
configuration schema belong to Context7 at use time.

Read the reference that matches what you are doing — one, not all of
them.

| Doing | Read |
| --- | --- |
| Deciding whether a proxy is the answer at all | [Pick & trade](references/pick-and-trade.md) |
| Shaping the origin, the drivers, the cache | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Granting the account, or holding the origin credential | [Identity shape](references/identity-shape.md) |
| Running or testing the project on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** This is **not a
datastore** — it is pinned beside the database component, never instead
of it, and a stack whose only backing entry is this one has named a
proxy and no data. The database client is constructed **inside the
request handler**, because a Worker cannot carry I/O across requests
and a global client goes stale. And **caching is on by default**, so
whether a given read may be up to a minute old is a decision the
product makes deliberately rather than discovers.

The rule this skill leans on hardest is the provider's, not its own:
the origin credential is handed to Cloudflare at configuration time and
never to the Worker, which makes it the `cloudflare` skill's identity
and IAM reference's subject, cited here and restated nowhere.
