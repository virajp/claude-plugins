---
name: Cloudflare Workers AI
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/workers-ai@0.1.0
---

# Backing — Cloudflare Workers AI

**Serverless inference reached from a Worker as a binding.** The product
names a model from a catalog Cloudflare hosts — text generation,
embeddings, reranking, image, speech — passes an input and gets a result
on the request path. Pick it when the model the product needs is in that
catalog, when the call is already happening inside a Worker, and when the
prompt should be answered without leaving the platform it arrived on.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model, what does and does not exist on a laptop, how the
meter runs, and the fence saying which Cloudflare services this stack
offers at all. The service component carries this one service and **cites**
those rather than restating them.

**This is a backing-axis entry and it produces no artifact**, so it
carries no `artifact:` key. It hosts nothing and deploys nothing: the
project still ships however its own hosting pin says, and this decides
where its inference is answered once it has.

**It pins beside other backing entries rather than instead of one.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object
storage, telemetry sink" — that is vwf's own config-format asset
describing `backing_template`, not a rule restated here. A product whose
inference is here and whose records are in a relational store pins both,
and that is the ordinary case rather than a workaround.

## What this bundle decides that neither component decides alone

**There is no resource to name, and that is the fact everything else
follows from.** The binding carries no id — no instance, no region, no
capacity, nothing to create ahead of a deploy. So there is nothing to vary
per environment: a laptop, a pre-production environment and production all
call the same models on the same meter. Every design that assumed a
cheaper non-production tier has to move that assumption into the product,
which is a decision worth taking at architecture time rather than
discovering when the test suite's bill arrives.

**The model id is the perishable part of the pin.** Cloudflare publishes
planned deprecations with sunset dates and expects references removed
before them, so pinning this bundle is accepting a standing maintenance
obligation on a catalog the product does not control. The obligation is
cheap or expensive depending on exactly one thing: whether the id lives in
one place in the codebase or at every call site. That is why the service
component asks for a seam rather than merely suggesting one.

**The category realizes no vwf capability token.** `inference` is one of
the categories the taxonomy records as a known vwf-side gap, so the
service component leaves `capability` unset and nothing here mints one.
A blueprint that wants to declare "the product does inference" as a
capability has nothing to declare it with yet, and that is vwf's move
rather than this bundle's.

**The bill is per model, not per service, and the model is chosen per
task.** Usage is metered in neurons at a rate assigned to each model, so
the cost of a feature is decided by which model answers it — which makes
moving one step from a large model to a small one a change of a single
constant with an order-of-magnitude effect. It also makes a development
loop a real line item, since there is no local form and every dev call
runs on the production models.

**Pairing it with a vector index is the common case, and the pairing has
an irreversible edge.** This bundle produces embeddings;
`cloudflare-vectorize` stores and searches them, and that index's
dimension count and distance metric are fixed when the index is created
and follow the embedding model. So the model decision is taken once, with
both pins in view, and changing it later means a new index and a full
re-embed of the corpus. Pinning the two together is what makes that seam
visible at architecture time rather than at the first model upgrade.

**What this bundle deliberately does not include.** Caching, retries,
fallbacks between providers, per-consumer rate limiting and a searchable
log of every call are a gateway's job and a separate pin that composes in
front of this one. Chunking documents, crawling a site and keeping an
index current is managed retrieval, another pin again. Both are offered by
this stack under their own bundles, and neither is folded in here —
because a product that wants inference and a product that wants a managed
retrieval pipeline are answering different questions, and a composite
would hide which one was asked.

Full judgment: the components' own skills and their references.
