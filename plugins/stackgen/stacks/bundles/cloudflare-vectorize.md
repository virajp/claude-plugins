---
name: Cloudflare Vectorize
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/vectorize@0.1.0
---

# Backing — Cloudflare Vectorize

A **vector index bound to a Worker**: the product's own embeddings,
stored with an id and some metadata, searched by nearest neighbour. Pick
it when the product has embeddings and needs the closest ones — retrieval
for a generation step, "more like this" recommendation, near-duplicate
detection, classification by nearest label — and when the query path is
already running on this platform, so the search is a binding rather than
a round trip out of it.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model, what does and does not exist on a laptop, how the
meter runs, and the fence saying which Cloudflare services this stack
offers at all. The service component carries this one service and
**cites** those rather than restating them.

**This is a backing-axis entry and it produces no artifact**, so it
carries no `artifact:` key. It hosts nothing and deploys nothing: the
project still ships however its own hosting pin says, and this decides
where its embeddings live once it has.

**It pins beside other backing entries rather than instead of one.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object
storage, telemetry sink" — that is vwf's own config-format asset
describing `backing_template`, not a rule restated here. A product
whose search index is here and whose records are in a relational store
pins both, and that is the ordinary case rather than a workaround.

## What this bundle decides that neither component decides alone

**The index is not the record.** Vectors are derived from data the
product keeps somewhere else, and the vector's metadata carries only what
a query filters on and what gets the caller back to the source. That
makes this bundle a **second copy of the truth by construction**: every
write path to the source record is a write path to this index, and the
delete path is the one that gets forgotten. Pinning this alongside the
datastore that holds the records is what makes that seam visible at
architecture time rather than at the first stale result.

**Two of the index's properties are decided before any code runs and
cannot be changed afterwards** — the dimension count and the distance
metric, both dictated by the embedding model. Changing the model
therefore means a new index and a full re-embed from the source records,
which is why "can this product regenerate every embedding from its own
data" is a question worth answering while the corpus is still small.

**The bill is dimensions, not queries.** Both metered terms multiply the
index's dimension count, and the queried term counts the stored vectors
rather than only the results returned — so index width and index size are
both inside the price of every query, and `topK` is not the lever it
looks like. Creating indexes is free, which turns partitioning into a
cost decision as well as a design one.

**The local answer is a live index, not a simulation.** Vectorize has no
local mode, so the dev loop binds a real index with `remote: true`. That
makes the dev index shared, chargeable state — never production's, seeded
by a repeatable command, and safe to recreate.

**Where the embeddings come from is a separate pick, and it is not in
this bundle.** This composition stores and searches vectors; producing
them is the product's inference provider's job, and which of this
provider's AI services the stack offers at all is the `cloudflare`
component's scope fence to answer. So is whether a managed retrieval
pipeline over documents is available — nothing here chunks, embeds or
re-indexes on a schedule.

Full judgment: the components' own skills and their references.
