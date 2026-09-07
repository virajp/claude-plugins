---
name: cloudflare-queues
version: 0.1.0
category: development
description: >-
  Cloudflare Queues as this product's background-work path — when work
  belongs behind a queue rather than in a workflow, a durable object or
  an ingestion stream, how messages, batches, retries and the
  dead-letter queue are shaped against the async-orchestration contract,
  what an operation is on the bill, the token permissions a push and a
  pull consumer each need, and what the local queue does and does not
  simulate.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Queues

Durable at-least-once messaging between Workers: a producer binding, a
consumer Worker invoked with batches, bounded retries and a dead-letter
queue behind them. This skill carries the judgment; the current CLI
flags, the runtime API's exact surface and the REST endpoints belong to
Context7 at use time.

Read the reference that matches what you are doing — one, not all of
them.

| Doing | Read |
| --- | --- |
| Deciding whether the work belongs on a queue at all | [Pick & trade](references/pick-and-trade.md) |
| Shaping messages, batches, retries or the poison path | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Scoping a token for a deploy or for a pull consumer | [Identity shape](references/identity-shape.md) |
| Running or testing the project on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** **Each queue has
exactly one active consumer** — Cloudflare says so, and says it is what
makes at-least-once delivery workable — so anything shaped like fan-out
to several independent subscribers is not this service
([how Queues works](https://developers.cloudflare.com/queues/reference/how-queues-works/)).
**Delivery is at-least-once and unordered**, so every consumer is
idempotent on a key it records and no handler assumes it has seen an
earlier message
([delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)).
And **`dead_letter_queue` is required in practice, not optional** —
without it, a message that can never succeed is dropped after the last
retry with nothing to look at
([dead letter queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)).

The seam this pack is most careful about is the one with Workflows.
Both are async, both retry, and only one of them carries state across
steps. A queue holds **independent messages**; a workflow holds **one
process with steps, sleeps and compensation**. Reaching for a queue plus
a status column when the second is what the product has is the mistake
`assets/contracts/orchestration.md` was written to name, and it is the
subject of the pick-and-trade reference.
