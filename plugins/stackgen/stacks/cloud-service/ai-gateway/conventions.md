# Cloudflare AI Gateway — conventions

**A plane in front of model calls, and it is provider-agnostic.** Cloudflare
describes it as giving "visibility and control over AI applications" —
analytics and logging over what the product sends, plus caching, rate
limiting, request retries and model fallbacks
([overview](https://developers.cloudflare.com/ai-gateway/)). What sits
behind it is the product's choice: Workers AI, or OpenAI, Anthropic, Google,
Vertex, Grok and the rest of the provider list, or several at once. That is
the whole shape — it is not an inference service and it does not run a
model.

**A Worker reaches it two ways, and both are shapes the project writes.**
This component ships no configuration file.

The **URL** is the general route, and it works from anywhere with an HTTPS
client. A provider-specific endpoint is
`https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/{provider}`;
the **Universal endpoint**,
`https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}`, takes an
ordered array of provider objects and is what fallbacks are expressed in
([universal endpoint](https://developers.cloudflare.com/ai-gateway/usage/universal/));
and a `/compat/chat/completions` path speaks the OpenAI request shape to
every provider behind it
([chat completion](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/)).

The **`ai` binding** is the route from inside a Worker, and it is the same
binding Workers AI uses — there is nothing gateway-shaped to add to
`wrangler.jsonc` beyond it:

```jsonc
{
  "ai": { "binding": "AI" }
}
```

`env.AI.gateway("<gateway-id>")` then hands back a gateway handle with
`run()` for a Universal-endpoint request, `getUrl()` for the endpoint
itself, and `getLog()` / `patchLog()` for reading a log entry and attaching
feedback or metadata to it
([worker binding methods](https://developers.cloudflare.com/ai-gateway/usage/worker-binding-methods/)).
A Workers AI call routes through a gateway by passing one more argument
instead: `env.AI.run(model, input, { gateway: { id, skipCache, cacheTtl } })`
([Workers AI through the gateway](https://developers.cloudflare.com/ai-gateway/usage/providers/workersai/)).

**The gateway is provisioned out of band, which is the fact that decides
where it belongs in a project.** It is created in the dashboard or by
`POST /accounts/{account_id}/ai-gateway/gateways`
([create a gateway](https://developers.cloudflare.com/api/resources/ai_gateway/methods/create)),
and everything it does — cache TTL, rate limit, retry policy, log retention,
authentication — is gateway configuration rather than request code. So the
gateway id is **environment configuration the project reads**, never a
constant compiled into a Worker, and the deploy does not create the thing it
points at.

**Every feature is off or absent by default and is turned on deliberately.**
The create call's fields are the honest inventory: `cache_ttl` and
`cache_invalidate_on_update`; `collect_logs`; `rate_limiting_limit`,
`rate_limiting_interval` and a `fixed` or `sliding` technique;
`retry_max_attempts` (1–5), `retry_delay` (0–5000 ms) and a `constant`,
`linear` or `exponential` backoff; `authentication`; `log_management` with a
`STOP_INSERTING` or `DELETE_OLDEST` strategy; `logpush` and an `otel` sink;
`dlp` and `guardrails`; and `spend_limits`
([create a gateway](https://developers.cloudflare.com/api/resources/ai_gateway/methods/create)).
A gateway created and left at its defaults buys observability and nothing
else, which is a real answer — but it should be the one that was chosen.

**Per-request headers override the gateway's settings for one call.**
`cf-aig-skip-cache` bypasses the cache, `cf-aig-max-attempts` and
`cf-aig-retry-delay` change the retry policy, `cf-aig-request-timeout` caps
the call, and `cf-aig-metadata` tags the log entry with the product's own
identifiers; the response carries `cf-aig-step` naming which step in a
fallback chain answered
([per-request configuration](https://developers.cloudflare.com/ai-gateway/usage/rest-api/)).
That last one is the one to actually read: a fallback means the model the
product used is not the model it asked for.

**The upstream provider key lives in the gateway, not in the Worker.** With
provider keys stored server-side, a request carries only
`cf-aig-authorization: Bearer {token}` and no provider credential at all
([BYOK](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/)).
That is the security argument for the gateway, and it moves the secret
rather than removing it: the gateway token the Worker now holds **is** a
secret, injected as an environment variable at the process boundary and
catalogued by name, never value, in `docs/blueprint/environment.md`, exactly
as the `cloudflare` skill's identity and IAM reference requires of every
credential at this provider. This component cites that doctrine and does not
restate it.

**An authenticated gateway is the setting that makes the URL not a public
one.** Without it, anyone who learns the account id and gateway id can send
requests through the gateway, spending the stored keys. With
`authentication` on, a request without a valid `cf-aig-authorization` header
is rejected
([create a gateway](https://developers.cloudflare.com/api/resources/ai_gateway/methods/create)).
The default is off; the choice to leave it off is one to make on purpose,
not by omission.

**One gateway per environment.** Logs, cache, rate limits and spend limits
are all per gateway, so a staging run sharing production's gateway pollutes
the analytics the product reasons about and can consume a rate limit
production needs. Free plans allow ten gateways per account and paid plans
twenty
([limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)),
so this costs a name, not a budget.

**What this component does not cover.** The model behind the gateway is
somebody else's subject: Workers AI is `cloud-service/workers-ai/` and the
managed retrieval pipeline is `cloud-service/ai-search/`, each with its own
component and its own bundle. Third-party providers are not components here
at all — the gateway fronts them and this stack has no doctrine about
choosing between them. Which Cloudflare services this stack offers, and
which are planned or declined, is the provider component's to state — see
the `cloud-provider/cloudflare` component's conventions, in this
composition's template.

Full judgment: the `cloudflare-ai-gateway` skill and its references. The
provider-wide doctrine it cites — cost, identity and IAM, the local
development map — is the `cloudflare` skill's.
