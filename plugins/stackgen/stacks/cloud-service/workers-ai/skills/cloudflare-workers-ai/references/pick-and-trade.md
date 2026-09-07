# Workers AI — pick & trade

## What it is for

Inference the product needs on its own request path, answered by a model
Cloudflare already hosts. The catalog spans tasks rather than one task —
text generation, text embeddings, reranking, summarization, image
generation, speech and transcription, object detection — and a model is
named as a string and called through a binding
([model catalog](https://developers.cloudflare.com/workers-ai/models/),
[Workers AI](https://developers.cloudflare.com/workers-ai/)).

There is nothing to provision. No instance, no GPU reservation, no
capacity planning, and no credential on the request path — a Worker
configured with the binding can call every model in the catalog, and one
without it can call none.

## When it is the answer

- **The model the product needs is in the catalog.** This is the first
  question and it disqualifies more designs than any other. The catalog
  is largely open models; a product built around a specific frontier
  model is not describing this component.
- **The call is already inside a Worker.** The binding costs no round
  trip out of the platform, no key to inject and no egress — the
  inference happens where the request already is.
- **The workload is embeddings, classification or reranking rather than
  a long conversation.** These are the tasks where an open model at
  small size is genuinely competitive, where cost per call is low
  enough that volume is not frightening, and where the output is
  structured enough to validate.
- **The data should not leave the platform to be answered.** Every
  third-party alternative means the prompt — which is user content —
  crossing into another vendor's account. Where that is the constraint,
  a hosted-here catalog is the answer even when a better model exists
  elsewhere.

## When it is not the answer

- **The catalog does not have the model.** Not "has something similar" —
  has it. Substituting a smaller open model for the one the product's
  quality bar was set against is a product decision, not a stack one,
  and pretending the pick is neutral is how a launch discovers it is
  not. The honest answer is that the product's inference provider is
  elsewhere, and this component is not in the design.
- **The product wants one gateway in front of several providers.**
  Caching, retries, fallbacks between providers, rate limiting and a log
  of every call are the gateway's job, not this component's. That is a
  sibling component with its own bundle, and it fronts this service as
  readily as it fronts a third-party one — see
  `cloud-provider/cloudflare/conventions.md` for what the stack offers.
- **The product wants managed retrieval over its documents.** Chunking,
  embedding on a schedule, crawling and keeping an index current is a
  different service again. Building it by hand over this component plus
  a vector index is a legitimate answer; assuming it is included is not.
- **The workload is a long-running batch that is not on a request
  path.** Inference here is billed the same wherever it is called from,
  but a job that runs for hours against a fixed corpus is not obviously
  better served by a per-call serverless meter than by something with a
  reservation, and that comparison is worth doing rather than assuming.
- **The product needs a model it trained.** The catalog carries
  fine-tunes as a feature over supported base models
  ([fine-tunes](https://developers.cloudflare.com/workers-ai/features/fine-tunes/)),
  which is not the same as bringing arbitrary weights. Check that the
  base is supported before designing around it.

## The trade against a third-party model behind a gateway

The realistic alternative is not "no inference" — it is a model from
another vendor, called over HTTPS, usually through a gateway that adds
caching and fallbacks. Four things decide it, and they do not all point
the same way:

- **Catalog coverage.** The other vendor almost certainly has the
  stronger frontier model. This catalog has enough open models to cover
  embeddings, reranking, classification and ordinary generation, and
  covers them at prices that make high-volume use ordinary.
- **Latency.** A binding call from a Worker does not leave the platform;
  a third-party call is a round trip to another network from wherever the
  Worker happens to be running. For a single generation that difference
  is small against the model's own time; for a per-request embedding on
  a hot path it is most of the budget.
- **Data residency and exposure.** The binding keeps the prompt inside
  the account it already runs in. A third-party call is user content
  crossing a boundary, which is a question the product's own data
  handling has to have an answer for before it is a stack question at
  all.
- **Cost.** Both are consumption-metered, and neither is uniformly
  cheaper — this service prices per model in its own unit, so a
  comparison is per model and per workload rather than per vendor
  ([pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)).

**The two are not exclusive**, and the design that ages best usually
mixes them: an open embedding model here, where volume is high and the
task is mechanical, and a stronger model elsewhere for the one step where
quality decides the product. That mix is exactly what the gateway
component is for, and it is why choosing this component is not a
commitment to answer every inference question with it.

## The trade against running the model yourself

Serving weights on your own infrastructure buys full control of the model
and its version, and no dependency on someone else's deprecation
schedule. It costs a GPU fleet, a serving stack, capacity planning for a
spiky load, and an on-call rotation for it. That trade is worth taking
when the model is the product; it is almost never worth taking when the
model is a feature inside the product. This component is the other end of
that spectrum, and the middle — a managed endpoint from a model host —
belongs to whichever provider the product's inference actually lives with.

## The trade, stated plainly

**What it buys:** a catalog of hosted models reached by binding, with no
infrastructure, no credential on the request path, no egress and no
capacity decision, priced per call in a single account-wide unit.

**What it costs:**

- **A catalog you do not control.** Models are deprecated on published
  dates and references must be removed before them
  ([changelog](https://developers.cloudflare.com/workers-ai/changelog/)).
  That is a standing maintenance obligation, and the only thing that
  makes it cheap is having pinned the id in one place — see
  [service doctrine](service-doctrine.md).
- **A ceiling on model choice.** What the catalog has is what the
  product can have, and "close enough" is a quality decision made by
  the stack rather than by the product.
- **Rate limits that are per task type and per model**, and that apply
  to development runs as much as to production
  ([limits](https://developers.cloudflare.com/workers-ai/platform/limits/)).
- **No local anything.** The dev loop calls the live service and bills —
  see [local dev](local-dev.md).

## What choosing it does not decide

**Where the vectors go.** This component can produce embeddings; storing
and searching them is `cloud-service/vectorize/`'s, and the embedding
model fixes that index's dimension count and metric permanently. Decide
the model with both components in view, not just this one.

**Whether the calls go through a gateway.** Caching, fallbacks and a log
of every request are a separate pin that composes in front of this one
rather than replacing it. Nothing here does them, and nothing here should.
