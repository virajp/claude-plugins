---
name: cloudflare-pipelines
version: 0.1.0
category: development
description: >-
  Cloudflare Pipelines as this product's streaming ingestion path — when
  events belong in an object store rather than in a queue or a metrics
  store, how streams, pipelines and sinks are shaped, the binding block
  and the HTTP ingest door, the two consumption dimensions the bill
  actually has, the token permissions ingest and management each need, and
  why there is no local form to run.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Pipelines

Events from a Worker binding or an HTTP endpoint, optionally reshaped by
SQL, landing in R2 as files or as Iceberg tables. This skill carries the
judgment; the current CLI flags, the SQL dialect's surface and the API's
shape belong to Context7 at use time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Deciding whether events belong here at all | [Pick & trade](references/pick-and-trade.md) |
| Shaping a stream, a transform or a sink | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Scoping a token for ingest or for management | [Identity shape](references/identity-shape.md) |
| Running or testing the project on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** The binding's key is
`pipelines` and the field inside it is **`stream`** — `pipeline` is the
renamed spelling and it fails at deploy, not at edit. A **stream**, a
**pipeline** and a **sink** are three different resources, and collapsing
them into one word makes every question about latency, cost and health
unanswerable. And the sink is R2, so a Pipelines pin is incomplete without
an R2 pin beside it — the `cloudflare-r2` component owns the bucket, the
catalog and the SQL that reads the tables back.

The fact this skill leans on hardest is a negative one: **Cloudflare
states no local form for a Pipelines binding**, and its per-binding
development table does not list one. That is not a gap in this pack's
research — it is the shape of the service, and the substitution it forces
is the subject of the local dev reference.
