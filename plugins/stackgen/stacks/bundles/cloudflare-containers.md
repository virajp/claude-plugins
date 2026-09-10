---
name: Cloudflare Containers
axis: deploy
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/containers@0.1.0
artifact: container-image
---

# Deploy — Cloudflare Containers

**A container image running beside a Worker**: the Worker takes the
request, the image runs the process an isolate cannot host, and the
container is reached through a Durable Object rather than through an
address of its own. One `wrangler deploy` builds the image, pushes it to
Cloudflare's registry and publishes the Worker that addresses it.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is — the same shape as
[Google Cloud · Cloud Run · Artifact Registry](gcp-cloud-run.md), and for
the same reason. The provider component carries what spans services: the
account and role model, the token scoping rule, what does and does not
exist locally. The service component carries this one service and **cites**
that rule rather than restating it. There is no
`deploy-target/container-image` component in the composition: the neutral
component states the image contract for a host belonging to no cloud, and
what this bundle deploys is not a portable arrangement even though the
image is a portable artifact.

## Pinned instead of Cloudflare Workers SSR, never beside it

**A Containers project is a Workers project.** The container is not an
addition to a Worker deployment; it is part of one. The
`cloud-service/containers` pack ships a **complete** Worker config —
`main`, the `containers` block, the Durable Object binding whose class
matches it, and the migration that declares the class — and it ships that
config at the repo root, at `wrangler.jsonc`.

So does `cloud-service/workers-ssr`. Pinning
[Cloudflare Workers SSR](cloudflare-workers-ssr.md) **and** this bundle
means two components writing one file: the later one in the composition
order wins, and which of them that is depends on the pin order rather than
on anything the project decided. **Pin this one instead of that one**, and
nothing is lost by doing so — a Worker that fronts a container can render
pages and serve assets too, because `main` names a Worker the project
writes rather than a framework adapter's entrypoint.

The same reasoning applies to
[Cloudflare Workers Static Assets](cloudflare-workers-static.md), which
ships the same file at the same path.

## What this bundle decides that no component decides alone

**The artifact is a container image, and one deploy is distinguished from
the next by its tag.** The image carries no environment-specific
configuration, so what differs between staging and production arrives from
the Worker at runtime. An image tag is never shared between environments:
the registry is account-wide, and two Workers pointed at one tag are two
environments that have stopped being independently rollbackable.

**The pipeline needs Docker as surely as it needs the token.**
`wrangler deploy` builds the image locally before pushing it, so a CI
runner without a working daemon cannot deploy this stack at all. The
deploy task checks for both, credentials first, and refuses before
wrangler is invoked.

**The release runs behind `p:<project>:deploy`, and this bundle ships no
workflow.** The task is the only thing that knows a Cloudflare account is
on the other end, which is what keeps the target swappable; the CI system
pinned on the project's `cicd` axis decides what fires it, behind
stackgen's release-trigger contract. Naming the task and writing the
workflow are different jobs, and only the first one is stackgen's.

**Credentials arrive from the environment, never from the config file**,
and the image push adds none of its own — wrangler authenticates it from
the same token, so there is no registry login to hold or rotate.

**Scale to zero is the cost model, and the idle window is a product
decision.** Instances start on demand and sleep when idle; billing runs
for the awake span. The class's `sleepAfter` trades money against
cold-start latency in one number, and it applies per instance, so a design
with one instance per tenant multiplies it.

## The seam with the other Cloudflare bundles

**[Cloudflare Durable Objects](cloudflare-durable-objects.md)** is the
backing pin for the object on its own — the state, the coordination, the
alarms. This bundle uses a Durable Object as the container's address and
cites that component's doctrine rather than restating it; a project whose
work fits inside an object with no process attached wants that pin and not
this one.

**[Cloudflare Zero Trust Access](cloudflare-zero-trust.md)** produces no
artifact and composes with a hosting pin rather than replacing one — this
is a hosting pin it composes with, exactly as it does with the two Workers
bundles. A project that must not be publicly reachable pins **both**: this
one decides how the work gets served, that one decides who may reach it.

## What is still not offered

Which Cloudflare services stackgen offers, and which are planned or
declined, is the provider component's to state — see the
`cloud-provider/cloudflare` component's conventions, in this composition's
template. A product that needs one it
does not offer has a gap to name rather than a gap to fill from general
Cloudflare knowledge.

Full judgment: the components' own skills and their references.
