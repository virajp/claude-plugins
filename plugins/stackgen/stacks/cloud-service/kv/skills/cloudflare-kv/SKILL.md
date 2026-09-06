---
name: cloudflare-kv
version: 0.1.0
category: development
description: >-
  Cloudflare Workers KV as this product's cache layer — when a global,
  eventually consistent key-value store is the answer and when it is the
  wrong one, key and TTL design against the stated limits, the binding a
  project adds to its own Wrangler config, per-operation cost, the token
  permission a deploy needs, and what the local simulation does and does
  not prove.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Workers KV

A global, eventually consistent key-value store read from a Worker
through a binding. This skill carries the judgment; the current API
surface, Wrangler's flags and the dashboard belong to Context7 at use
time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Deciding whether KV is the right store at all | [Pick & trade](references/pick-and-trade.md) |
| Designing keys, TTLs, metadata or the binding | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Issuing the credential a deploy or a script uses | [Identity shape](references/identity-shape.md) |
| Running or testing the project on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** A write may take **up to
60 seconds or more** to reach other locations, so nothing that must read
its own write belongs here. A single key takes **one write per second**,
so a counter is not a KV design. And this pack ships no Wrangler
configuration — the project's Workers pack owns that file, and this
component only says what the `kv_namespaces` entry must contain.

The rule this skill leans on hardest is the one about what a cache may
hold: losing a namespace should cost latency, never truth. Everything in
it is derivable from a source that survives, or is data the product has
decided in advance it can lose.
