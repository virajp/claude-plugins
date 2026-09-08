# Cloudflare Containers — conventions

**A container image running beside a Worker**: the Worker is the front
door, the image runs the process that could not live inside an isolate,
and the two are one deployment. One `wrangler deploy` builds the image,
pushes it and publishes the Worker that addresses it.

**This is a hosting pin, and it produces an artifact.** Like
`workers-static-assets` and `workers-ssr`, this is where the project
actually runs — which makes it the entry a project pins on the `deploy`
axis when the workload needs a real runtime rather than the edge sandbox.

## Pinned instead of Workers SSR, never beside it

**A Containers project is a Workers project.** The container is not a
second deployment target layered onto a Worker; it is reached *through*
one, and the `wrangler.jsonc` this pack ships is a **complete** Worker
config — `main`, the container block, the Durable Object binding and the
migration that declares the class.

So this pack is pinned **instead of** `cloud-service/workers-ssr`, not
alongside it. Both ship `wrangler.jsonc`, both land it at the repo root,
and a repo that pinned both would have two components writing one file —
the second one to compose wins, and which of them that is depends on the
pin order rather than on anything the project decided. The
`cloudflare-containers` bundle states the same rule where a stack is
chosen.

A project that renders pages at the edge *and* needs a container behind
them still pins this one: `main` names a Worker that can serve assets and
route to the container both, which is a Worker the project writes rather
than a second pin.

## How the Worker reaches the container

**Through a Durable Object.** The container class is declared to the
platform as a Durable Object class, the Worker holds a binding to it, and
an instance is addressed by id — `env.<BINDING>.get(id)`, which starts a
sleeping instance and returns something the Worker can `fetch` against
([Containers](https://developers.cloudflare.com/containers/)). That is why
three blocks in `wrangler.jsonc` move together and why editing one of them
alone is the usual first failure: the `containers` entry, the
`durable_objects.bindings` entry whose `class_name` matches it, and the
`migrations` entry that declares the class
([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).

The Durable Object doctrine itself — what an object is, its
single-threaded id, its storage and its alarms — is
`cloud-service/durable-objects`, the backing-axis pack for that service.
This component cites it and restates none of it.

## What this component writes

**`wrangler.jsonc` at the repo root**, not under `.config/`. Wrangler
discovers its configuration by walking up from the working directory to a
`wrangler.jsonc` / `wrangler.toml`, and the only alternative is
`--config .config/wrangler.jsonc` on every invocation any caller might
ever type — a flag someone eventually forgets and then deploys from a
config that does not exist. The root allowlist in stackgen's output
charter admits the file for exactly that reason; being on the list makes
it landable, not standard.

**`.config/mise/tasks/p/<project-id>/deploy`**, an overlay in the
project's own task group. It ships as `p/_project/deploy` — a marked
directory name, not a task — and the command that pins this stack renames
the directory to the project's registry id. Until it is renamed the task
is inert rather than wrong: mise ignores a task directory whose name
starts with an underscore, which is the same rule that keeps `_scripts/`
out of `mise tasks`.

**Two marked positions in `wrangler.jsonc`**: the Worker `name`, and
`main`. Everything else ships with a real value, because everything else
is this component's judgment rather than the repo's identity. The
container `class_name`, the binding name and the migration tag ship real
and must be kept in step with the class the Worker script exports — the
one edit that touches three places at once.

## The Dockerfile is the project's, not this pack's

`image` points at a Dockerfile path in the repo, and **nothing here writes
that Dockerfile.** What the image contains is the project's language, its
build and its process, all of which sit outside the config tier's fence.
What this component states is the contract the image has to satisfy to be
deployable at all — a port the Worker can reach, a health endpoint behind
it, and no secret baked in. That is the `containers` skill's artifact
reference.

## Credentials

The two environment variables `wrangler` reads, how they reach the
process, and why `wrangler login` is not the pipeline's path are the
provider component's — see the `cloudflare` skill's identity-and-IAM
reference and this pack's own identity-shape reference, which cites it.
They never appear in `wrangler.jsonc`, and the deploy task refuses to
start without them rather than letting wrangler fail with an auth trace
that reads like a network problem.

**The registry credential is not a third secret.** `wrangler deploy`
builds the image with the local Docker daemon and pushes it to a
Cloudflare-managed registry, authenticating that push itself from the same
token
([Image management](https://developers.cloudflare.com/containers/platform-details/image-management/)).
There is no registry login to hold and none to rotate.

## The pipeline

**The task CI must run is `p:<project-id>:deploy`.** The workflow that
calls it is the repo's own — a pack states the task name and never writes
the workflow, which is stackgen's output charter's fence. Nothing here
decides the trigger either; that belongs to the CI
system pinned on the project's `cicd` axis.

**The runner needs Docker.** `wrangler deploy` builds the image locally
before pushing it, so a CI job that deploys this stack needs a working
Docker daemon as surely as it needs the token — which is why the deploy
task checks for one, and checks after the credentials rather than before.

## The artifact contract

**A Dockerfile in the repo, an image built and pushed by
`wrangler deploy`.** Setting `image` to a local Dockerfile path is what
makes the build automatic: wrangler builds it with Docker and pushes it to
the Cloudflare-managed registry, which is backed by R2
([Image management](https://developers.cloudflare.com/containers/platform-details/image-management/)).
`wrangler containers build` and `wrangler containers push` are the same
two steps run by hand, and `wrangler containers images list` shows what
the account is storing
([Containers](https://developers.cloudflare.com/containers/)).

- **One deploy is distinguishable from the next by its image tag**, which
  is what makes a rollback a previous image rather than a rebuild.
- **Image storage is account-wide and capped** — 50 GB total, and deleting
  an image to reclaim space is deleting a rollback target
  ([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)).
- **The image carries no environment-specific configuration.** What
  differs between staging and production arrives at runtime.

## Instance types and the sleep/wake lifecycle

Six predefined instance types run from `lite` (1/16 vCPU, 256 MiB memory)
to `standard-4` (4 vCPU, 12 GiB), `dev` and `standard` surviving as
aliases for `lite` and `standard-1`; a custom `instance_type` object naming
`vcpu`, `memory_mib` and `disk_mb` is the other form
([Limits](https://developers.cloudflare.com/containers/platform-details/limits/),
[Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).

**Instances scale to zero and that is the cost model.** Billing runs from
the moment a request arrives or the instance is started manually until it
sleeps, measured in 10 ms increments
([Pricing](https://developers.cloudflare.com/containers/pricing/)). The
Container class's `sleepAfter` is what sets the idle window, and it is a
cost decision and a latency decision at once
([Scaling and routing](https://developers.cloudflare.com/containers/platform-details/scaling-and-routing/)).

## What is explicitly not here

**Static assets.** A build output directory served by the platform is
`cloud-service/workers-static-assets`, and a script in front of one is
`cloud-service/workers-ssr`. A Worker in front of a container can serve
assets too, but the assets doctrine stays in those packs.

**A container without a Worker in front of it.** That is not a shape
Cloudflare offers: the container is reached through a Durable Object
binding held by a Worker, and there is no direct ingress to configure. A
workload that genuinely wants a service with its own address wants a
different provider's compute pack.

**No other Cloudflare service is this component's to speak for.** Which
Cloudflare services stackgen offers, and which are planned or declined, is
the provider component's to state — see the `cloud-provider/cloudflare`
component's conventions, in this composition's template.

**No wrangler pin and no Docker pin.** Wrangler is a development
dependency of the project that deploys, declared in that project's
language manifest, and a manifest is outside the config tier's fence.
Docker is a machine prerequisite rather than a repo dependency; the deploy
task checks for it and names it, and pins nothing.

Full judgment: the `cloudflare-containers` skill and its references. The
provider-wide doctrine it cites — the account model, the token scoping
rule, the cost principle — is the `cloudflare` skill's.
