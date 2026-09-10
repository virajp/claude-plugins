# Cloudflare — local development map

Which of this provider's surfaces exist on a laptop, and what stands in
where none does.

## The map, at the scope this stack offers

| Surface | Locally |
| --- | --- |
| The identity-aware proxy | **Does not exist, and must not be simulated** |
| The identity assertion it passes | Injected as a fake through the project's own seam |
| Static assets on Workers | **Really runs** — `wrangler dev` serves the built directory |
| A Worker with a script on those assets | **Really runs** — the framework adapter's dev server executes it under the platform's own runtime, and `wrangler dev` serves the built output |
| Workers KV | **Simulated**, and can be pointed at the real namespace — the binding supports both modes |
| R2 | **Simulated**, and can be pointed at the real bucket — the binding supports both modes |
| D1 | **Simulated**, and can be pointed at the real database — the binding supports both modes |
| Hyperdrive | **Runs for real, against a local database you stand up and point the binding at** — no per-binding remote mode |
| Vectorize | **Remote only** — no local simulation exists; the binding must be opted into the live index |
| Analytics Engine | **Simulated** — writes land in the local simulation; no per-binding remote mode |
| Pipelines | **Not stated** by Cloudflare's per-binding table; the `pipelines` component's own local-dev reference settles it |
| Durable Objects | **Simulated** — `wrangler dev` runs the class on the laptop; no per-binding remote mode, though a locally-run object can reach remote bindings |
| Workflows | **Simulated** — instances run and their steps sleep on the laptop; no remote binding and no `--remote` |
| Queues | **Simulated**, and can be pointed at the real queue — the binding supports both modes; locally a producer's messages invoke a consumer, and a separate consumer Worker can be started alongside |
| Containers | **Really runs** — `wrangler dev` builds and runs the image, so Docker must be running on the machine; no per-binding remote mode |
| Workers AI | **Remote only** — no local simulation; the `ai` binding takes `remote: true` and runs inference on the production models, which is a billed call from a laptop |
| AI Gateway | **No local form, and none is wanted** — the gateway is an HTTPS endpoint, so a local session calls the same live gateway a deployed Worker does, and its cache, logs and rate limits are the real ones |
| AI Search | **Remote only** — no local simulation; local development works by proxying to a deployed instance, so the instance binding — `ai_search`, carrying an `instance_name` — takes `remote: true` |
| Browser Rendering | **Remote only** — no local simulation; the `browser` binding takes `remote: true` and drives a real headless browser on Cloudflare |
| Images | **Simulated**, and can be pointed at the real service — the binding supports both modes, so a transformation runs under `wrangler dev` either way |
| Realtime | **No local form at all** — it is reached over an HTTPS API with an app id and secret rather than through a Worker binding, so it has no row on the per-binding table and nothing to simulate or opt into |
| Email Service | **Simulated** on both sides — the `send_email` binding supports both modes and the remote one sends real mail, and the `email()` handler is invoked by POSTing a message to a local endpoint; what has no local form is the routing rule that decides which mail reaches the Worker |
| Secrets Store | **Simulated only**, and deliberately — the `secrets_store_secrets` binding reads secrets created locally, and production secrets are unreachable from a dev session by design |
| The declined set, and account-level products | Out of this stack's scope entirely |

Modes are Cloudflare's, not this stack's: a binding either has a local
form, or a per-binding `remote` connection to the live resource, or both,
and
[the per-binding table](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)
is what says which. "No per-binding remote mode" above never means the
real resource is unreachable from a dev session — `wrangler dev --remote`
uploads the Worker and runs it on Cloudflare with **every** binding on the
live resource, whatever the column says. **Three rows are outside that
escape hatch**, and the same page names them: its remote-development list
carries every binding remote development supports and then states that
Containers, Queues and Workflows are not among them, so a Worker binding
any of the three cannot be run with `--remote`
([supported bindings per development mode](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)).
That is a statement about the whole-Worker mode and about nothing else.
A Queues binding still reaches the real queue from a local session, by
the per-binding route its row above describes; Containers and Workflows
have no remote route of either kind, which is what leaves them running
on the laptop or not at all.

**Durable Objects is not one of the three.** That same list names it as
supported in remote development, even though its own binding has no
per-binding remote mode — the two questions have different answers for
it, which is exactly why they are asked separately here. The scope fence
in the `cloudflare` skill says which services are here at all.

**The AI rows are all one shape, and it is the remote one.** Workers AI,
AI Search and Browser Rendering have no local simulation whatever: each
binding takes `remote: true` and the call leaves the laptop for the live
service
([Workers AI and Browser Rendering](https://developers.cloudflare.com/workers/local-development/),
[AI Search](https://developers.cloudflare.com/ai-search/api/instances/workers-binding/)).
A dev session against any of the three is therefore a session against
production — it bills, and for AI Search it reads a real index. AI
Gateway sits outside the question: it is an HTTPS endpoint under
`gateway.ai.cloudflare.com`, which the Worker binding's `getUrl()` hands
back
([worker binding methods](https://developers.cloudflare.com/ai-gateway/usage/worker-binding-methods/)),
so a local session and a deployed one call the same live gateway and
there is nothing to simulate or opt into. What each of those costs, and
what it makes unsafe to run from a laptop, is the service component's own
local-dev reference; this page says only which mode exists.

**The media, messaging and secrets rows split three ways, and two of
them are unlike anything above.** Images and Email Bindings are ordinary
both-modes rows on the per-binding table
([supported bindings per development mode](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)),
with one warning attached to the email one: locally the binding sends
nothing — the message is logged to the console and written to a file to
be inspected — but set `remote: true` and `env.EMAIL.send()` sends
**real mail to real recipients**, so a dev session uses test addresses
or it reaches people
([local development — sending](https://developers.cloudflare.com/email-service/local-development/sending/)).
Email's receive side is simulated too, and the seam is a plain HTTP
one: under `wrangler dev`, a POST to `/cdn-cgi/local/email` carrying
`from` and `to` as query parameters and a raw RFC 5322 message — which
must include a `Message-ID` header — invokes the `email()` handler
([local development — routing](https://developers.cloudflare.com/email-service/local-development/routing/)).
So the handler's logic is exercised locally. What is **not** is the
routing rule: the POST names its own recipient, so nothing on the
laptop decides which addresses reach this Worker at all. That binding
of an address to a Worker is account configuration, and it is verified
in a deployed environment or not at all.

**Realtime has no binding, which is why its row says something
different.** It is an HTTPS API taking an app id and secret
([Realtime SFU HTTPS API](https://developers.cloudflare.com/realtime/sfu/https-api/)),
so it never appears on the per-binding table, `--remote` means nothing
for it, and a local session calls the same live service a deployed one
does — the shape AI Gateway has, arrived at for the same reason.

**Secrets Store inverts the usual worry.** Its local mode is not a
lesser version of the real thing to be escaped with `--remote`; reaching
production secrets from a laptop is the thing Cloudflare refuses. You
cannot read a production secret from local development, and local
secrets are created with `wrangler secrets-store secret` commands
**without** `--remote`
([Secrets Store Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)).
Treat that as a property to keep rather than a limitation to work
around: it is the one row where the local/remote seam is a security
boundary and not a fidelity tradeoff.

**The Agents SDK is a framework, not a binding, so it has no row.** An
agent runs locally exactly as the Durable Object it compiles to does —
read that row, and the `cloudflare-agents` pack for what the SDK adds on
top of it.

Fidelity is a different cut of the same table, and on it four rows are a
genuine local runtime rather than a stand-in: the asset server exercises
the real routing rules; where a script is present the adapter's dev
server runs it under `workerd` rather than under Node, so the
compatibility cliff shows up on the laptop instead of at the edge;
Hyperdrive's local mode is a real database, because the thing it proxies
is one; and a Container is the real image under a real Docker daemon,
which is also why nothing about Containers runs on a machine without one.
Every row's own fidelity traps — the edge, the custom domain, the cache,
the CPU ceiling, a simulation's divergence from the managed service —
belong to that component's local-dev reference, not here. This page is
the index of them, plus the proxy, which has no local existence at all.

## Why simulating the proxy is the wrong instinct

A local stand-in for an identity-aware proxy proves that the stand-in
works. It cannot prove the thing that actually breaks in production —
that the origin is unreachable except through the real proxy — because
locally the origin is deliberately reachable. So the fidelity is not
merely imperfect; it is inverted, asserting the opposite of the property
under test.

The consequence is worth stating plainly: **the private plane is verified
in a deployed environment or not at all.** A local suite that goes green
has said nothing about it. That is not a gap to close with more local
machinery; it is a fact about what local can mean here.

## What runs locally instead

Local runs **reach the project directly**, on its own port, with no proxy
in front. The project still verifies an identity assertion — it must,
because trusting a header is what makes one forgeable — so the assertion
is injected as a fake at the same seam production's real one arrives
through.

That seam is not something this stack introduces. The product's identity
contract already requires a boundary where an asserted identity becomes an
application principal; the fake goes there, and nothing else in the
project knows the difference. If no such seam exists, that is a finding
about the project rather than about this stack: without one, the fake has
to be threaded through application code, and code that special-cases
"local" is code that never runs in production.

## The fidelity trap

The fake is a fake. Two things it does not exercise, which a deployed
environment must:

- **The policy.** Whether the right group is allowed, and whether anyone
  else is, is decided by configuration the laptop never sees.
- **Assertion validation against real signing keys.** A fake the project
  minted for itself proves the parsing, not the trust. Verification
  against the issuer's published keys is a deployed-environment
  behaviour.

Both belong to the pre-production environment, which is why the service
component treats a staging credential as a requirement rather than a
convenience.
