# AI Gateway — cost shape

The provider's billing principle is **seats, not traffic** for the Zero
Trust surface, and the same doctrine states plainly that every other
Cloudflare service in this stack bills by **consumption** and that each
service's own cost-shape reference owns its terms — the `cloudflare` skill's
cost doctrine. This is what that means for this one service. Never write
dollar figures; they change and the shape does not.

## The gateway's own meter is the log store, not the request

The proxying is not the term to size. What has a published limit, and
therefore a plan boundary, is **persistent logs**: available on all plans,
with Workers Free capped at 100,000 logs across every gateway in the account
and Workers Paid allowing 10,000,000 per gateway
([pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)).
The operational ceilings sit beside it — 500 logs per second per gateway,
entries over 10 MB not stored, ten gateways per account on free plans and
twenty on paid
([limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)).

So the first cost question here is not "how many model calls" but **"how
much history does the product need, and per gateway or per account"** — and
on a free plan the answer is shared across every environment at once, which
is the version of this that surprises people.

## The upstream cost stays the upstream's

Putting a gateway in front of a provider does not change what the model
costs. Cloudflare bills third-party model calls through Unified Billing and
Workers AI calls at standard Workers AI pricing
([REST API endpoints](https://developers.cloudflare.com/ai-gateway/usage/rest-api/)),
and features that reach a provider — web search among them — are billed at
that provider's rates with no gateway surcharge added
([web search](https://developers.cloudflare.com/ai-gateway/usage/web-search/)).

Two consequences worth stating:

- **The inference bill is `cloud-service/workers-ai/`'s subject, or the
  third-party provider's, and never this component's.** Reading a Workers AI
  cost question out of this reference gets the wrong answer.
- **Unified Billing changes where the invoice arrives, not what it says.**
  Moving a provider behind stored keys consolidates the line item; it does
  not discount it.

## Caching is the one lever that moves the bill down

A cache hit does not reach the upstream, so it costs no inference. That
makes the cache the only feature here that reduces spend rather than
relocating it — and the reason a per-route cache policy is worth the effort
of writing, since a global TTL either caches nothing useful or caches
something it should not
([service doctrine](service-doctrine.md)).

The trap is the mirror image: **a test suite running against a cached
gateway looks cheap and proves nothing**, and the same suite run with
`cf-aig-skip-cache` costs full price every time. Whichever is chosen, it is
chosen knowingly rather than discovered on an invoice.

## The two guardrails to turn on before they are needed

- **`spend_limits`** caps cost over a window, with rules that can be scoped
  by model or provider, and **`rate_limiting_limit`** bounds request volume
  in the first place
  ([create a gateway](https://developers.cloudflare.com/api/resources/ai_gateway/methods/create)).
  These are the whole reason a runaway loop in front of a metered model is a
  bounded incident rather than an open one. A tripped spend limit is a hard
  stop the product sees as failures, so it is worth alerting on the approach
  rather than only on the wall.
- **A gateway per environment**, so the spend is attributable at all. Shared
  gateways produce one number nobody can split, which is the same
  environment-attribution point the provider's cost doctrine makes from the
  seat side.

## The sizing question

Not "what will the proxying cost" — it is not the term. It is **"how much
log history does this product need, on which plan, and what is the ceiling
on what one environment can spend before something stops it"**. Both have
answers that are settings rather than estimates, which is unusual enough to
be worth saying: this is a service whose cost exposure is configured rather
than forecast.
