# Workers AI — cost shape

The provider's cost doctrine is the `cloudflare` skill's, and it says what
the account-wide shape is and what it deliberately does not cover —
including that every service besides the proxy bills by consumption rather
than by seat, and that dollar figures are never written down. This is what
consumption means for this one service.

## The unit is a neuron, and the rate is per model

Usage is measured in **Neurons**, and the price is assigned **per model**
rather than per service: Cloudflare moved from a bucket-based structure to
a per-model one so the rate reflects each model's size and capability
([pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)).
The metered quantity is per model too — text and image models are priced
against tokens in and tokens out, audio models against minutes of audio —
so two models doing "the same" task are not comparable by their neuron
rate alone without knowing what each one counts.

There is a **free daily allocation** of neurons on both plans, and the
counters **reset daily at 00:00 UTC**. On the free plan, exceeding the
allocation is not an overage charge — it is request failures
([pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)).

Read the rates on that page before sizing anything, and never copy one
into a document: they change per model and a stale figure reads as
authoritative in a way a stale principle does not.

## What that shape means

**The model choice is the cost decision, and it is taken per task.**
Because the rate is per model, moving one step of a product from a large
generation model to a small one is a change of one constant that moves the
bill by an order of magnitude — and moving the other way is the same
change with the same leverage in the wrong direction. This is the single
strongest argument for the seam in
[service doctrine](service-doctrine.md): the id lives in one place
precisely so that this is a cheap experiment rather than a refactor.

**The bill follows tokens, so it follows the prompt as much as the
answer.** Input is metered. A retrieval step that stuffs a large context
into every call is paying for that context on every call, forever, and
usually it is paying for it in a place nobody is looking — the prompt is
built by code, not written by a person, and it grows quietly as features
are added.

**The daily reset is a cliff, not a slope.** A quota that resets at a
fixed hour means a busy morning can exhaust the day's allocation before
the afternoon, and on the free plan what the afternoon sees is failures.
Anything the product cannot afford to have fail that way needs either the
paid plan or a designed degraded path, decided before the first busy day
rather than during it.

**Development is billed.** There is no local simulation, so every call
from a laptop runs on the production models and counts — against the bill
and against the same rate limits
([local development](https://developers.cloudflare.com/workers/local-development/),
[limits](https://developers.cloudflare.com/workers-ai/platform/limits/)).
See [local dev](local-dev.md); it is the line item people are most
surprised by, because nothing about a dev loop looks like production
traffic.

## The trap

**Inference on a hot path multiplies by traffic, and retries multiply it
again.** A per-request embedding or classification is a per-request
charge, so its cost curve is the product's traffic curve — which is fine
when it was chosen and expensive when it arrived as a convenience. A retry
on a slow or throttled call doubles it, and a retry loop with no ceiling
turns a bad minute into the day's allocation. Three remedies, in the order
they are usually worth taking:

- **Do not call at all where a cached previous answer will do.** The same
  input yielding the same output is the ordinary case for embeddings and
  classification, and the product usually already has somewhere to keep
  it. Where a general answer to this is wanted rather than a per-feature
  one, a gateway in front of the service caches on the product's behalf —
  a sibling component, whose bundle carries the reasoning.
- **Call a smaller model.** Most mechanical tasks — classification,
  routing, extraction against a strict schema — do not need the largest
  model in the catalog, and the evaluation that proves it is an
  afternoon's work against real inputs.
- **Move bulk work off the request path.** The batch API queues an array
  of requests and returns a `request_id` to poll
  ([batch API](https://developers.cloudflare.com/workers-ai/features/batch-api/workers-binding/)),
  which keeps a backfill from competing with live traffic for both the
  meter and the rate limit.

The second half of the trap is the **re-run**. Embedding a corpus is a
one-off cost, right up until the model changes and the whole corpus is
embedded again — and because the vector index's dimensions are fixed at
creation, a model change *forces* that re-embed rather than merely
suggesting it (`cloud-service/vectorize/`). Knowing what a full
re-embed costs, while the corpus is still small, is what makes the model
decision an informed one.

## The sizing question

Not "how many users will this have" but **"how many calls per user
action, which model answers each, and how many tokens go in"**. Those
three numbers are the estimate, and the first is the one most often
underestimated: a feature that reads as one inference call frequently
turns out to be three — an embedding, a generation and a rerank.

Cloudflare also ships features aimed squarely at this arithmetic —
prompt caching among them
([features](https://developers.cloudflare.com/workers-ai/features/)) —
and they are worth reading before optimizing by hand, because the cheapest
call is the one the service does not have to run twice.
