---
name: cloudflare-durable-objects
version: 0.1.0
category: development
description: >-
  Cloudflare Durable Objects as this product's per-key stateful compute —
  when one addressable, single-threaded object with its own strongly
  consistent storage is the answer and when it is the wrong one, class and
  id design, the binding and migration a project adds to its own Wrangler
  config, the compute-plus-rows bill, the permission a deploy needs, and
  what the local run does and does not prove.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Durable Objects

One object per id, single-threaded, with its own transactional storage,
alarms and WebSocket coordination — reached from a Worker through a binding
to a class that lives in the Worker's own script. This skill carries the
judgment; the current API surface, Wrangler's flags and the dashboard belong
to Context7 at use time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Deciding whether a Durable Object is the right home for this state | [Pick & trade](references/pick-and-trade.md) |
| Designing the class, the ids, the storage or the migration | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Issuing the credential a deploy or a script uses | [Identity shape](references/identity-shape.md) |
| Running or testing the project on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** The class ships **inside
the Worker script**, so this pin expects a Workers deploy pin beside it and
adds two entries — a binding and a migration — to a `wrangler.jsonc` this
pack does not own. **The id is the concurrency unit**: everything for one id
is serialized in one instance, and nothing is shared between ids, so a
design that concentrates a product's whole traffic on one id has built a
single-threaded bottleneck on purpose. And a **name passed to
`idFromName`/`getByName` is a contract** — change the derivation and the
storage behind the old id is stranded, reachable by nothing.

The rule this skill leans on hardest is the first question to ask of any
state: may two concurrent requests disagree about it? If they may, it is a
cache and belongs in KV. If they may not and the disagreement spans rows and
queries, it is relational and belongs in D1. If they may not and the
disagreement is about one key, it belongs here.
