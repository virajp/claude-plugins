---
name: cloudflare-ai-search
version: 0.1.0
category: development
description: >-
  Cloudflare AI Search as this product's retrieval layer — when a managed
  pipeline over documents is the answer and when a vector index the
  product writes is, the three source kinds and the two binding shapes,
  the indexing decisions that cannot be tuned after a sync, what the
  open beta includes and what is billed beside it, the token permission
  and the service token an R2 source needs, and why the dev loop reads a
  deployed instance. Formerly AutoRAG.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare AI Search

A managed retrieval pipeline: point an instance at content, and it
chunks, embeds, indexes and re-syncs it, answering a query with the
matching chunks or with a generated answer and its citations. This skill
carries the judgment; the binding's current signatures, the request
options of the day and the `wrangler ai-search` flags belong to Context7
at use time. The provider-wide half — the account and role model, the
billing principle, what exists locally — is the `cloudflare` skill's,
cited and never restated.

Read the reference that matches what you are doing — one, not all of
them.

| Doing | Read |
| --- | --- |
| Deciding whether the product wants a managed pipeline at all | [Pick & trade](references/pick-and-trade.md) |
| Creating an instance, choosing its source, binding it and querying it | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Granting the token, or letting the service read a bucket | [Identity shape](references/identity-shape.md) |
| Running or testing against an instance on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** **The chunking
decisions are taken before the first sync** — changing chunk size,
overlap or the embedding model means re-indexing the whole corpus, so
they are not knobs to tune against a live instance. **Pick the binding
for what the Worker actually does**: `ai_search` binds one instance and
is the narrower grant, `ai_search_namespaces` binds every instance in a
namespace and is what the Items API and runtime instance management
require. And **indexing is asynchronous**, so code and tests that upload
and immediately query are wrong even when they pass — poll for readiness
or wait for the sync job.

The rule this skill leans on hardest is not about the service at all: the
corpus is the source of truth and the index is derived from it. A product
that cannot re-run its own ingestion has an instance it can never
reconfigure, and every decision above becomes permanent by accident.
