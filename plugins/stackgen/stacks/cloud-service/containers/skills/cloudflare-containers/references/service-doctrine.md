# Containers — service doctrine

The service's own usage rules: what the configuration declares, how an
instance is reached, when it wakes and when it sleeps.

**There is no clause-by-clause contract satisfaction here, and that is
correct rather than missing.** The `compute` category names no vwf
capability token in the capability vocabulary, so there is no neutral
capability contract to check this against — the component leaves
`capability` unset, exactly as `workers-ssr` and `cloud-run` do, and
nothing here mints a token to fill the hole.

## Three blocks, one class name

A container deploys with three configuration blocks that are not
independent, and the thing that ties them together is a class name:

```jsonc
{
  "containers": [{ "class_name": "MyContainer", "image": "./Dockerfile", "max_instances": 5 }],
  "durable_objects": { "bindings": [{ "class_name": "MyContainer", "name": "MY_CONTAINER" }] },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["MyContainer"] }]
}
```

([Containers](https://developers.cloudflare.com/containers/),
[Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/))

- **`containers`** declares the image and its ceiling. Fields:
  `class_name`, `image`, `max_instances`, an optional `instance_type`,
  optional `image_vars` for build-time variables, and optional
  `constraints` naming `regions` or a `jurisdiction`
  ([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).
- **`durable_objects.bindings`** is how the Worker reaches it. The binding
  has a `name` — the property on `env` — and a `class_name` that must
  match the `containers` entry.
- **`migrations`** declares the class to the platform. A container-backed
  class takes the SQLite storage backend, so it is declared with
  `new_sqlite_classes` under a `tag`
  ([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/),
  [Containers](https://developers.cloudflare.com/containers/)).

**The class name appears three times and must equal the class the Worker
script exports.** That is four places, and it is the single most common
first failure: a rename that touches three of them reports as a class the
account does not know about, which reads like a platform problem rather
than a typo. Migrations are append-only in spirit — a later change to the
class adds an entry rather than editing `v1`.

## The container is not addressed directly

There is no ingress, no hostname and no port to publish. **The Worker
holds the binding and the request goes through it**:
`env.MY_CONTAINER.get(id)` returns an instance, starting it if it was
asleep
([Containers](https://developers.cloudflare.com/containers/)). The id is
the routing decision — one instance per tenant, per session or per job —
and `getContainer(env.MY_CONTAINER, id).startAndWaitForPorts()` is the
form that waits for the process to be listening before the request is
handed over
([Scaling and routing](https://developers.cloudflare.com/containers/platform-details/scaling-and-routing/)).

Two consequences worth stating as rules:

- **The Worker is part of the deployment, not a shim in front of it.**
  Whatever chooses the instance id, retries, or decides that a request
  belongs to the container at all is Worker code the project writes and
  tests. `getRandom(env.BACKEND, N)` spreading requests across a fixed
  count is one shape of that decision, not the only one
  ([Container backend example](https://developers.cloudflare.com/containers/examples/container-backend/)).
- **A container's blast radius is its Worker's.** Anything the Worker can
  reach, the request path to the container can reach; the container itself
  holds no Cloudflare identity. See [identity shape](identity-shape.md).

## The Container class

The Worker-side class extends `Container` from `@cloudflare/containers`
and is where the instance's behaviour is set. Two properties matter enough
to name here:

- **`defaultPort`** — the port inside the image requests are forwarded to.
- **`sleepAfter`** — the idle window before an instance is put to sleep,
  written as a duration (`"2h"` in Cloudflare's own backend example)
  ([Container backend example](https://developers.cloudflare.com/containers/examples/container-backend/)).

`containerFetch(request, port)` is the method that sends a request to the
process, and it is meant to be called from inside an overridden `fetch()`
rather than from outside it — calling the instance's own `fetch` from
within its `fetch` is infinite recursion
([Container class](https://developers.cloudflare.com/containers/container-class/)).

**The rest of the class's surface moves.** Read it at Context7 when you
write the class rather than from a doctrine file; what belongs here is the
judgment, and the judgment is that `sleepAfter` is a **product decision**
— see below.

## Instance types

Six predefined types, from `lite` (1/16 vCPU, 256 MiB memory) to
`standard-4` (4 vCPU, 12 GiB); `dev` and `standard` remain as aliases for
`lite` and `standard-1`
([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)).
A custom type is an object naming `vcpu`, `memory_mib` and `disk_mb`
([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).

This pack ships **no** `instance_type`, taking the platform default of
`lite`, and the reason is the same one behind `max_instances: 3`: sizing
up is a cost decision that wants a measurement behind it, and a generous
default is a bill nobody chose. Account-level ceilings sit above all of it
— concurrent memory, concurrent vCPU and concurrent disk are capped per
account
([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)),
which is worth knowing before `max_instances` is raised across several
projects on one account.

## Sleep and wake is the whole cost and latency model

An instance starts when a request arrives or when it is started
explicitly, and stops when its `sleepAfter` window passes with no
traffic; billing runs for exactly that span, in 10 ms increments
([Pricing](https://developers.cloudflare.com/containers/pricing/)).

So `sleepAfter` trades money for latency in one number:

- **Short** — instances sleep quickly, the bill tracks real work, and more
  requests pay a cold start.
- **Long** — the first user after a lull gets a warm instance, and the
  account pays for idle time nobody used.

**Neither is the default answer, and the honest version is measured.** The
number worth having before setting it is the gap distribution between
requests to one instance id, not the overall request rate — because the
lifecycle is per instance and a busy service made of quiet tenants sleeps
constantly.

## Ports and the health endpoint are the image's contract

The process listens on a port and the class forwards to it. Two rules
follow, and one of them only bites locally:

- **The image should expose a health endpoint of its own**, separate from
  the work, so the Worker has something to forward a readiness probe to —
  see [health](health.md).
- **Local development may need the ports declared with `EXPOSE` in the
  Dockerfile**, where production does not. Cloudflare states this for
  **Sandbox**, which is built on Containers: under `wrangler dev` every
  port must be declared or the connection is refused, because deployed,
  every container port is reachable automatically
  ([Sandbox preview URLs](https://developers.cloudflare.com/sandbox/concepts/preview-urls/),
  [expose services](https://developers.cloudflare.com/sandbox/guides/expose-services/)).
  **Containers' own local-development guide does not state the rule**, so
  treat it as Sandbox-documented and Containers-plausible rather than
  established — and declare the ports regardless, since an `EXPOSE` line
  documents the image's interface either way. See [local dev](local-dev.md).

## Configuration and secrets reaching the container

**Build-time and runtime are different questions and the config only
answers the first.** `image_vars` in the `containers` block supplies
variables to the image **build**
([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)),
which makes it the wrong place for anything secret: a build argument is a
value that was present when the image was made, and the image outlives the
build.

What a running instance is configured with is set from the Worker side, on
the Container class. Read the current property names at Context7 when you
write the class; what does not move is the rule — **the Worker is the only
thing holding secrets, and it passes the container what that container
needs and nothing else**. The provider's secrets doctrine and the repo's
secrets contract
(`${CLAUDE_PLUGIN_ROOT}/assets/contracts/secrets.md`) govern how a value
reaches the Worker in the first place; a dedicated Cloudflare secrets
service is not among the services this stack offers today, and the
provider component's scope fence
(`cloud-provider/cloudflare/conventions.md`) is what says so.

## Observing it

The Worker half's logs are on by default in this pack's config
(`observability.enabled`), and they are what show how a request was
routed and whether the instance was awake. `wrangler containers list`
reports what is deployed, and `wrangler containers images list` what the
account is storing
([Containers](https://developers.cloudflare.com/containers/)). Anything
beyond that — streaming a container's own output, attaching to a running
instance — is a wrangler surface that moves; check it at Context7 rather
than assuming it from another platform's tooling.

## What this component stays silent on

**What is in the image.** The Dockerfile is the project's — see
[artifact](artifact.md).

**Durable Objects as a service.** The binding and the migration are here
because a container needs them; the object's own doctrine is
`cloud-service/durable-objects`.

**Whether the front door should be publicly reachable.** Putting it behind
the account's identity-aware proxy is a second pin on the same axis, and
`cloud-service/zero-trust-access` owns that judgment.
