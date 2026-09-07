---
name: Cloudflare AI Search
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/ai-search@0.1.0
---

# Backing — Cloudflare AI Search

A **managed retrieval pipeline** behind a Worker binding: point an
instance at a bucket, a website or its own storage, and it chunks the
content, embeds it, keeps a vector index over it, re-syncs it on a
schedule, and answers a query with the matching passages — or with a
generated answer and the passages it drew on. Pick it when the product
needs answers grounded in its own documents and the pipeline that
produces them is plumbing rather than the thing the product competes on.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model, what does and does not exist on a laptop, how the
meter runs, and the fence saying which Cloudflare services this stack
offers at all. The service component carries this one service and
**cites** those rather than restating them.

**This is a backing-axis entry and it produces no artifact**, so it
carries no `artifact:` key. It hosts nothing and deploys nothing: the
project still ships however its own hosting pin says, and this decides
where its retrieval happens once it has.

**It pins beside other backing entries rather than instead of one.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object
storage, telemetry sink" — that is vwf's own config-format asset
describing `backing_template`, not a rule restated here. A product whose
documents are retrieved here and whose records are in a relational store
pins both, and that is the ordinary case rather than a workaround.

**Where the source is a bucket, this pin expects a `cloudflare-r2` pin
beside it.** The bucket is the product's own — it exists whether or not
this service reads it, it is billed as R2, and its layout and lifecycle
are that component's doctrine. Pinning only this one and treating the
bucket as an implementation detail of retrieval is how a corpus ends up
with no owner. An instance fed by direct uploads or by a crawl needs no
such pin.

## What this bundle decides that neither component decides alone

**The corpus is the source of truth and the index is derived from it.**
Chunk size, chunk overlap and the embedding model are instance
configuration applied while indexing, so changing any of them means
processing the whole corpus again. A product that cannot re-run its own
ingestion has an instance whose settings became permanent the day it was
created — which makes "where does the corpus actually live" an
architecture question rather than an operational one, and the reason to
answer it while the corpus is small.

**The binding form is a grant, and it is chosen here.** `ai_search` binds
one named instance; `ai_search_namespaces` binds every instance in a
namespace and carries with it the ability to upload, create and delete.
There is no read-only form of either, so a Worker given the wider binding
for convenience can rewrite the corpus it was only meant to query. Taking
the narrower one by default, and per-instance separation where tenants
must not share, is the decision this composition makes visible.

**The service's own line is free during its open beta; the pieces under
it are not.** Storage, vector indexing and crawling are included in the
service, while Workers AI and AI Gateway are billed separately — so the
bill moves with embedding volume and generated answers rather than with
corpus size, and a re-index is the expensive operation. That inversion is
the one thing to carry forward from this bundle into an estimate.

**The local answer is a deployed instance, not a simulation.** AI Search
has no local form, so the dev loop proxies to a real instance with
`remote: true`. That makes the dev instance shared, chargeable state —
never production's, seeded by a repeatable command, and safe to
recreate.

**Retrieval quality is verified against a real corpus or not at all**,
which is what makes the pre-production instance in the harness block
something to seed deliberately rather than something to leave to whatever
the last run put in it. A stale index does not fail; it answers
confidently from content that has changed.

**A hand-rolled pipeline is the alternative and this stack ships both
halves of it** — a vector index the product writes into, and an inference
call it makes itself. Choosing this bundle is choosing not to own
chunking and ranking; the components' pick-and-trade references carry the
trade, and it is worth re-reading if retrieval turns out to be the
product's differentiator after all.

Full judgment: the components' own skills and their references.
