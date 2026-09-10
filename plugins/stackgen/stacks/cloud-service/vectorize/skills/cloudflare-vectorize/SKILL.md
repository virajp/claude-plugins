---
name: cloudflare-vectorize
version: 0.1.0
category: development
description: >-
  Cloudflare Vectorize as this product's search index — when similarity
  search over the product's own embeddings is the answer and when a
  column in the relational store is, the index lifecycle and the two
  filtering mechanisms, dimension-shaped billing, the token permission it
  needs, and why there is no local Vectorize and what that costs the dev
  loop.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Vectorize

A vector index bound to a Worker: the product's own embeddings, stored
with an id and metadata, searched by nearest neighbour. This skill
carries the judgment; the client API's current signatures, the Wrangler
flags and the limit numbers of the day belong to Context7 at use time.

Read the reference that matches what you are doing — one, not all of
them.

| Doing | Read |
| --- | --- |
| Deciding whether the product needs a vector index at all | [Pick & trade](references/pick-and-trade.md) |
| Creating an index, or designing what goes in it and how it is queried | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Granting the token that manages an index | [Identity shape](references/identity-shape.md) |
| Running or testing against it on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** **Dimensions and metric
are fixed at creation** — they follow the embedding model, so the model
is chosen first and changing it means a new index. **Writes are
asynchronous**, so code and tests that write and immediately query are
wrong even when they pass. And **there is no local Vectorize**: the dev
loop is opted into a live index, which makes it shared state and makes
the seeding question a real one.

The rule this skill leans on hardest is not its own: an index stores
vectors, and the record each vector points back to lives wherever the
product already keeps it. Trying to make the metadata the record is what
turns an ordinary schema change into a full re-embed.
