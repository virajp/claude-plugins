---
name: Cloudflare AI Gateway
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/ai-gateway@0.1.0
---

# Backing — Cloudflare AI Gateway

**One plane in front of every model call the product makes.** The gateway
proxies inference — to Workers AI, or to OpenAI, Anthropic, Google, Vertex,
Grok and the rest — and adds the four things an application otherwise
reimplements per provider: caching, rate limiting, request retries and model
fallbacks, with analytics and logs over all of it. Pick it when the product
calls a model at all and someone will eventually ask what it spent, what it
sent, or why an answer changed; skip it when there is one call, no cost
question and nothing to see.

It runs no model. That is the sentence most likely to be got backwards here:
this is a plane, not an inference service, and pinning it decides nothing
about which model the product uses.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model behind every grant, the billing principle, what does
and does not exist on a laptop, and the scope fence saying which Cloudflare
services this stack offers at all. The service component carries this one
service and **cites** that doctrine rather than restating it, so the
account-level facts are written once.

**What pinning it gives a project** is the doctrine, not a file. This
component ships no configuration: the gateway itself is created in the
dashboard or through the REST API, out of band from any deploy, and the only
thing that lands in the project's own `wrangler.jsonc` is the `ai` binding
Workers AI already uses. What comes with the pin is the judgment — one
gateway per environment with its id read from configuration rather than
compiled in, a cache policy decided per route instead of as one global TTL,
a fallback whose answer is recorded with the step that produced it because
the model used is not the model asked for, logs treated as a retention and
PII decision because they hold prompts, and `authentication` treated as
mandatory on any gateway holding stored provider keys, since without it two
identifiers are enough to spend them.

**It pins beside other backing entries rather than instead of them.**
`backing_template` is, in vwf's own words, "A LIST: one slug per capability
the project needs — datastore, identity, queue, object storage, telemetry
sink". So a project that calls models and stores rows pins this and
`cloudflare-d1`; one that also caches globally pins `cloudflare-kv` beside
both. Nothing here decides which of them the product needs.

**It composes with `cloudflare-workers-ai`, and equally well without it.**
Where Workers AI is pinned too, the seam is a single argument — the existing
`ai` binding's call takes a `gateway` option and nothing else changes. Where
it is not, the gateway fronts third-party providers alone, and that is a
first-class case rather than a degraded one: a product running no Cloudflare
model still gets the analytics, the cache and the keys held server-side. The
pairing reads as implied and is not.

**What this bundle decides that neither component decides alone** is that
the gateway is a **per-environment** resource whose id is configuration. The
cache, the log store, the rate limit and the spend limit are all scoped to
one gateway, so environments that share one produce analytics nobody can
split, a staging run that consumes production's rate limit, and a suite that
can pass on an answer cached before the change under test. Separating them
costs a name; not separating them is discovered on an invoice or in an
incident review.

**The category realizes no vwf capability token.** `ai-gateway` is among the
ones the taxonomy records as a known vwf-side gap, so the service component
leaves `capability` unset and nothing here mints one. It is deliberately not
lined up against `inference`: the gateway satisfies no model contract, and
asking it to would be asking a proxy to answer for what it proxies.

Full judgment: the components' own skills and their references.
