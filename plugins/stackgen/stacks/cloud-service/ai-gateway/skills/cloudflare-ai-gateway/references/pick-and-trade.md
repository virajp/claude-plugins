# AI Gateway — pick & trade

## What it is for

Putting **one plane in front of every model call the product makes**, so
that what the product spends, what it sends and what came back are visible
in one place, and so that caching, rate limiting, retries and fallbacks are
policy rather than application code. Cloudflare's own framing is visibility
and control over AI applications, with those four features named as the
scaling and reliability half
([overview](https://developers.cloudflare.com/ai-gateway/)).

It runs no model. It is provider-agnostic by construction: Workers AI is one
of the providers behind it, not a prerequisite for it.

## The two shapes it is picked in

**With Workers AI behind it.** The model runs on Cloudflare and the gateway
sits between the Worker and the inference service. The seam is the cheapest
one in this stack: the existing `ai` binding already carries a gateway
option, so a Workers AI call routes through a gateway by adding one argument
and nothing else changes
([Workers AI through the gateway](https://developers.cloudflare.com/ai-gateway/usage/providers/workersai/)).
Pin `cloudflare-workers-ai` beside this and both are on the backing axis.

**In front of a third-party provider, with no Workers AI anywhere.** This is
the case worth saying out loud, because the pairing reads as implied and is
not: **a product hosted on Cloudflare compute that runs no Cloudflare model
still wants the gateway.** OpenAI, Anthropic, Google, Vertex, Grok and the
rest are reached through provider-specific endpoints under the same gateway
([chat completion](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/)),
and the analytics, the cache and the stored keys work identically. Nothing
about pinning this component obliges a project to pin `cloudflare-workers-ai`
too.

Both shapes at once is ordinary and is the case fallbacks exist for — see
[service doctrine](service-doctrine.md).

## The trade against calling providers directly

**What it buys:**

- **One place the spend, the latency and the error rate are visible**,
  across providers that otherwise each have their own dashboard and their
  own definition of a request.
- **Policy out of application code.** A retry budget, a rate limit and a
  cache TTL become gateway configuration a change to which needs no deploy —
  and, more to the point, needs no second implementation in the next service
  that calls a model.
- **The provider key stops living in the Worker.** With keys stored in the
  gateway the request carries no provider credential
  ([BYOK](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/)),
  which shrinks what a compromised Worker leaks — see
  [identity shape](identity-shape.md) for what it does not remove.
- **A cache in front of a metered call**, which is the one lever here that
  moves the bill downward rather than sideways.

**What it costs:**

- **One more hop, and one more thing that can be the outage.** The gateway
  is now on the critical path of every model call, and a failure in it looks
  to the product like a provider failure.
- **A second thing to configure per environment**, provisioned out of band
  from the deploy — see [service doctrine](service-doctrine.md) on the
  gateway id as environment configuration.
- **A logging surface with real content in it.** The point of the logs is
  that they hold prompts and responses; that is also the reason they are a
  data-retention and PII decision rather than a switch.
- **Answers that may not be fresh, and answers that may not be from the
  model asked for.** Both are the features working. Both are surprising in a
  test run.

## When it is not the answer

- **A single model call in a single service, with no cost or latency
  question anyone has asked.** The gateway is worth its hop when there is
  something to see or something to control; ahead of that it is a
  dependency bought on speculation.
- **A product whose model calls must be independently auditable inside a
  boundary this does not sit in.** The gateway is a Cloudflare account
  resource, and the logs live there.
- **A product hosted nowhere near Cloudflare.** The gateway is reachable by
  URL from anywhere and works fine — but this stack offers it only as a
  Cloudflare backing pin beside a Cloudflare provider component, so a
  product hosted elsewhere has no clean way to pin it today. That is a gap
  in this stack's model rather than in the service, and it is recorded as
  such rather than papered over.

## When to bypass the cache

The cache is the feature most likely to be right in production and wrong
everywhere else. Bypass it — per request with `cf-aig-skip-cache`, or by
leaving `cache_ttl` unset on a non-production gateway — when:

- **The call is part of a test run.** A suite that passes on an answer
  cached before the change under test has proved nothing, and the failure
  mode is a green run.
- **The answer is expected to differ per call**, because the request carries
  a nondeterministic instruction or the product's value is in the variation.
- **The prompt embeds something personal**, so the cached entry would be
  served across users. What is safe to cache is a per-route decision, not a
  gateway-wide one — [service doctrine](service-doctrine.md) has the rule.

Everywhere else, the cache is the reason the gateway pays for its hop.
