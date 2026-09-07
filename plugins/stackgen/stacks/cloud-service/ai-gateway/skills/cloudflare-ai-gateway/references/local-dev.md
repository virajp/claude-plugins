# AI Gateway — local dev

**There is no local form of a gateway, and none is wanted.** The provider's
local development map owns the general shape — the `cloudflare` skill — and
places this service outside the emulator question entirely: the gateway is
an HTTPS endpoint under `gateway.ai.cloudflare.com`, which the Worker
binding's `getUrl()` hands back
([worker binding methods](https://developers.cloudflare.com/ai-gateway/usage/worker-binding-methods/)),
so a local session and a deployed one call the same live gateway and there
is nothing to simulate or opt into. This is what that means for this
service.

## What runs locally

The project, under `wrangler dev`, with its `ai` binding configured exactly
as in production. Model calls leave the laptop and reach the real gateway.

That has no `remote: true` to set and no local mode to fall back to,
because there is no local mode: the two AI services beside this one have
that choice and this one does not. The consequence is the one to plan
around — **a local run against a gateway is a real run.** It reaches the
upstream provider, it bills, it writes log entries, it counts against the
rate limit, and it reads and populates the cache.

## The gateway a laptop points at is not production's

The single rule here follows from the environments rule in
[service doctrine](service-doctrine.md): **a local session points at a
development gateway, never at production's.** The gateway id is environment
configuration, so this costs nothing but reading it from the environment
rather than hardcoding it — and the failure it prevents is a developer's
loop populating production's cache, consuming production's rate limit, and
scattering entries through the log history an incident review will later
read.

The gateway token is separate per environment for the same reason
([identity shape](identity-shape.md)).

## The cheaper answer: stub the call at the product's own seam

Most of what a local run needs to exercise is not the model. A product that
calls a model has a boundary where a prompt goes out and a structured answer
comes back — that boundary is the seam, and a local run substitutes a fixed
answer at it and never leaves the machine.

That is the default for tests. Reaching the real gateway is the exception,
reserved for the cases that are actually about the integration: whether the
request shape is accepted, whether the fallback chain behaves, whether the
gateway token works.

Nothing about this substitution is a shortfall of the gateway. A product
whose local suite requires a live model call has coupled its tests to
somebody else's non-deterministic service, which is a design finding
independent of this stack.

## The cache is the trap that makes a local or staging run lie

A gateway with caching on will answer a repeated request from the cache. So
a run can pass on an answer stored **before the change under test**, and the
failure mode is a green suite.

Two ways out, and one of them is picked deliberately:

1. **Send `cf-aig-skip-cache`** on requests originating from a test run
   ([per-request configuration](https://developers.cloudflare.com/ai-gateway/usage/rest-api/)),
   which costs full price on every call.
2. **Leave `cache_ttl` unset on the non-production gateway**, so nothing is
   cached there at all — simplest, and it means the non-production gateway
   no longer exercises the caching the production one does.

Either is fine. Neither being chosen is how a suite ends up proving
something about last week.

## What a local run therefore cannot tell you

- **Whether the production gateway's configuration is right.** The cache
  TTL, the rate limit, the retry policy, the fallback chain, the guardrails
  and whether `authentication` is on are all attributes of a gateway the
  laptop is not pointed at.
- **Whether the stored provider keys work.** They belong to the gateway
  being called, so a development gateway proves only its own.
- **What production latency looks like.** The hop the gateway adds is
  measured from wherever the request originates, and a laptop is not the
  edge.

All three are deployed-environment facts, which is why the staging gateway
in [service doctrine](service-doctrine.md) is a requirement rather than a
convenience.
