# AI Gateway — service doctrine

The service's own usage rules: how the gateway is named and configured, what
shapes the project writes, and the four policies — cache, rate limit, retry
and fallback — that are the reason it exists.

**There is no clause-by-clause contract satisfaction here, and that is
correct rather than missing.** The `ai-gateway` category realizes no vwf
capability token today, so there is no neutral capability contract to check
this against — the taxonomy records that as a known vwf-side gap and nothing
here mints a token to fill it. What this component satisfies instead is
stated directly below.

## One gateway per environment, and the id is configuration

Everything the gateway does is scoped to the gateway: the cache, the log
store, the rate limit, the spend limit, the retry policy. Sharing one across
environments therefore means a staging run polluting the analytics
production reasons about, consuming a rate limit production needs, and
reading answers a production request cached.

So: **one gateway per environment, named for it**, and the gateway id read
from environment configuration rather than written into the source. Free
plans allow ten gateways per account and paid plans twenty
([limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)),
which is enough for every environment a product has and not enough to be
casual about per-service gateways.

Provisioning is out of band from the deploy — the dashboard, or
`POST /accounts/{account_id}/ai-gateway/gateways`
([create a gateway](https://developers.cloudflare.com/api/resources/ai_gateway/methods/create)).
Nothing in a Worker creates the gateway it points at, which is why a
missing gateway is a deploy that succeeds and a runtime that 404s.

## The shapes the project writes

This component ships no configuration file. Two routes exist and a project
usually writes both.

**By URL**, which works from any HTTPS client:

- provider-specific:
  `https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/{provider}`
- universal:
  `https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}`, taking an
  ordered array of provider objects
  ([universal endpoint](https://developers.cloudflare.com/ai-gateway/usage/universal/))
- OpenAI-compatible: a `/compat/chat/completions` path that speaks one
  request shape to every provider behind it
  ([chat completion](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/))

**By binding**, from a Worker — and it is the same `ai` binding Workers AI
uses, added to the project's own `wrangler.jsonc`:

```jsonc
{
  "ai": { "binding": "AI" }
}
```

`env.AI.gateway("<gateway-id>")` returns a handle carrying `run()`,
`getUrl()`, `getLog()` and `patchLog()`
([worker binding methods](https://developers.cloudflare.com/ai-gateway/usage/worker-binding-methods/)),
and a Workers AI call routes through a gateway with one extra argument
rather than a rewritten call site:

```js
await env.AI.run(model, input, {
  gateway: { id: gatewayId, skipCache: false, cacheTtl: 3360 },
});
```

([Workers AI through the gateway](https://developers.cloudflare.com/ai-gateway/usage/providers/workersai/)).

## Cache policy is per route, never one global TTL

`cache_ttl` is a gateway-wide setting and `cf-aig-skip-cache` is the
per-request override
([per-request configuration](https://developers.cloudflare.com/ai-gateway/usage/rest-api/)).
A single global TTL is therefore the easy answer and the wrong one, because
what is safe to cache differs per call site.

The rule: **a response is cacheable when the same request from a different
user may legitimately receive it.** That fails immediately for anything
whose prompt embeds a user's own data, a tenant identifier, or a
freshly-retrieved document — those routes bypass. It holds for
classification, extraction and summarization over content that is the same
for everyone, which is where the cache actually earns its keep.

Two operational facts to design around. `cache_invalidate_on_update` exists
because a changed request otherwise keeps hitting the old entry, and the
cacheable request size is capped at 25 MB with a maximum TTL of one month
([limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)).
And a cache is not a correctness mechanism: an entry can disappear at any
time, so a product that requires the cached answer has a bug rather than a
cache.

## Rate limiting is the product's protection, not the provider's

`rate_limiting_limit` over `rate_limiting_interval`, in a `fixed` or
`sliding` technique
([create a gateway](https://developers.cloudflare.com/api/resources/ai_gateway/methods/create)).
The purpose is to bound what one deployment can spend and send before a loop
or a scraped endpoint runs the bill up — the upstream provider has its own
limits, and hitting theirs is a worse way to find out.

The limit is per gateway, so a limit sized for production applied to a
shared gateway throttles the staging suite, which is another reason the
environments are separated.

## Retries and fallbacks change what answered — log the step

Retries are `retry_max_attempts` (1–5), `retry_delay` (0–5000 ms) and a
`constant`, `linear` or `exponential` backoff, overridable per request with
`cf-aig-max-attempts` and `cf-aig-retry-delay`; `cf-aig-request-timeout`
caps the whole call
([per-request configuration](https://developers.cloudflare.com/ai-gateway/usage/rest-api/)).

Fallbacks are the Universal endpoint's ordered array: the gateway tries each
provider object in turn until one succeeds, so a chain can start at Workers
AI and end at a third-party model
([fallbacks](https://developers.cloudflare.com/ai-gateway/configuration/fallbacks/)).

**The consequence to design for is that the model the product used is not
the model it asked for.** The response carries `cf-aig-step` naming which
step answered
([per-request configuration](https://developers.cloudflare.com/ai-gateway/usage/rest-api/)),
and a product that does not record it alongside the answer cannot afterwards
explain a quality regression, attribute a cost, or reproduce a result.
Recording the step is not optional instrumentation; it is what makes the
fallback safe to have enabled.

Two chain-design rules follow. **Order by capability, not only by price** —
a fallback to a model that cannot do the task turns a clean failure into a
plausible wrong answer. And **keep the chain short**: every additional step
is latency added to the request that was already failing.

## Logging, and what does not go in it

`collect_logs` is what makes the analytics worth having, and the logs hold
requests and responses — which is to say prompts and model output. That
makes retention a data decision:

- **Prompts carrying personal data are the product's PII**, wherever they
  are stored. If the product's retention and PII position does not allow a
  third-party store to hold them, the answer is to keep the personal part
  out of the prompt, not to hope nobody reads the logs.
- **`cf-aig-metadata` tags an entry with the product's own identifiers**
  ([per-request configuration](https://developers.cloudflare.com/ai-gateway/usage/rest-api/)) —
  a request id or a tenant id, so an entry can be correlated with the
  product's own traces. It is the wrong place for a name, an email or
  anything else that identifies a person directly.
- **Retention is a setting with two failure modes**: `log_management` with a
  `DELETE_OLDEST` strategy silently drops history, and `STOP_INSERTING`
  silently stops recording. Free plans store 100,000 logs per account and
  paid plans 10,000,000 per gateway, at up to 500 logs per second, with
  individual entries over 10 MB not stored at all
  ([limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)).
  Whichever strategy is chosen, the gap it produces is invisible in the
  dashboard.
- **Telemetry belongs in the product's own sink too.** The gateway can
  forward to an OTLP endpoint (`otel`) or push logs
  ([create a gateway](https://developers.cloudflare.com/api/resources/ai_gateway/methods/create)),
  which is what keeps the model calls on the same timeline as everything
  else the product does rather than in a separate dashboard nobody opens.

`getLog()` and `patchLog()` are what close the loop from the application
side: an entry can be read back and annotated with feedback after the fact
([worker binding methods](https://developers.cloudflare.com/ai-gateway/usage/worker-binding-methods/)).
That is the seam an evaluation or a thumbs-up signal attaches to.

## Guardrails, DLP and spend limits exist, and each is a decision

`guardrails` classify prompts and responses against hazard categories with a
`FLAG` or `BLOCK` action; `dlp` does the same for configured data profiles;
`spend_limits` caps cost over a window
([create a gateway](https://developers.cloudflare.com/api/resources/ai_gateway/methods/create)).
All three are off by default. Two things to keep straight: `BLOCK` makes the
gateway a source of user-visible failures the product must handle as such
rather than as an outage, and a spend limit that trips is a hard stop, so it
is an alerting threshold as much as a ceiling.

## What this component stays silent on

**Which model to call, and which provider.** The gateway fronts them; it
does not rank them. Workers AI is `cloud-service/workers-ai/` and the
managed retrieval pipeline is `cloud-service/ai-search/`; third-party
providers are not components in this stack at all.
