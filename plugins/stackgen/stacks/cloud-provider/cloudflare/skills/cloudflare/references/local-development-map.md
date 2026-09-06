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
| Hyperdrive | **Simulated only** — the binding resolves to a database you name yourself; there is no remote mode |
| Vectorize | **Remote only** — no local simulation exists; the binding must be opted into the live index |
| Analytics Engine | **Simulated only** — writes land in the local simulation; there is no remote mode |
| Pipelines | **Not stated** by Cloudflare's per-binding table; the `pipelines` component's own local-dev reference settles it |
| The services planned under their own plans | Arriving with their components; until then, out of scope |
| The declined set, and account-level products | Out of this stack's scope entirely |

Modes are Cloudflare's, not this stack's: a binding either has a local
simulation, or a remote connection to the live resource, or both, and
[the per-binding table](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)
is what says which. The scope fence in the `cloudflare` skill says which
services are here at all.

Three rows are a genuine local runtime rather than a stand-in, and they
are the exceptions: the asset server exercises the real routing rules;
where a script is present the adapter's dev server runs it under `workerd`
rather than under Node, so the compatibility cliff shows up on the laptop
instead of at the edge; and Hyperdrive's local mode is a real database,
because the thing it proxies is one. Every row's own fidelity traps — the
edge, the custom domain, the cache, the CPU ceiling, a simulation's
divergence from the managed service — belong to that component's local-dev
reference, not here. This page is the index of them, plus the proxy, which
has no local existence at all.

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
