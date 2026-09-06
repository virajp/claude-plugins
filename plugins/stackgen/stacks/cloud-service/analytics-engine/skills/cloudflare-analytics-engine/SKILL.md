---
name: cloudflare-analytics-engine
version: 0.1.0
category: development
description: >-
  Cloudflare Analytics Engine as this product's metrics store — when a
  high-cardinality time-series written from a Worker is the answer and
  when a counter, a lake or a telemetry sink is, how the index choice
  decides what sampling costs, the SQL API and the weighting every query
  needs, consumption-shaped cost, and why nothing about it can be checked
  on a laptop.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Analytics Engine

A time-series store the product writes to from its own code and reads
back with SQL. This skill carries the judgment; the SQL dialect's current
function list, the binding's type signature and the API's response shapes
belong to Context7 at use time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Deciding whether product metrics belong here | [Pick & trade](references/pick-and-trade.md) |
| Choosing the index, the schema, or writing a query | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Issuing the token a dashboard or report reads with | [Identity shape](references/identity-shape.md) |
| Running or testing the product on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** The **index is the
sampling key** — index by the dimension worth protecting, never by
something unique per event. Every read **weights by `_sample_interval`**,
because an unweighted count of sampled rows is wrong in a way that still
looks like a number. And a **write is fire-and-forget**: it is not
awaited, reports no failure, and is therefore never the record of
anything the product must be sure of.

The line this skill leans on hardest is with the telemetry sink. Metrics
about the product live here; traces and logs about the system live where
`assets/contracts/observability.md` says, and that contract's
replaceability requirement is not one this component tries to meet.
