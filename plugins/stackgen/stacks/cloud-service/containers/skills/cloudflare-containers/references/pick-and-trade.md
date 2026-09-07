# Containers — pick & trade

## What it is for

Hosting a project whose deployment is **a Docker image running beside a
Worker**. The Worker takes the request; the image runs the work an isolate
cannot do. One `wrangler deploy` builds the image, pushes it and publishes
the Worker that addresses it
([Containers](https://developers.cloudflare.com/containers/)).

This **is** where the project runs. It produces an artifact and it is what
a project pins on the `deploy` axis when the workload needs a real
process — a filesystem, a runtime the edge sandbox does not have, or more
CPU than an invocation is allowed.

## When a project belongs here

- **The work needs a real runtime.** A binary, a language with no Workers
  target, a tool that shells out. `nodejs_compat` is a surface, not Node,
  and a container is the actual thing.
- **The work is CPU-heavy or long-running.** Image and video processing, a
  report build, a model that has to load. A container's resources are a
  configuration — the instance type — rather than a platform property you
  discover late.
- **The work needs a filesystem.** Temporary files of real size, a
  scratch directory, anything that unpacks before it processes. Disk is
  allocated per instance and is part of what an instance type buys
  ([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)).
- **A per-user or per-tenant sandbox.** Instances are addressed by id, so
  "one instance per session" is the ordinary shape here rather than a
  scheduler problem
  ([Scaling and routing](https://developers.cloudflare.com/containers/platform-details/scaling-and-routing/)).

The common thread is that **the unit of work does not fit inside a request
handler**, but the traffic still arrives at a Worker and the product is
already on this account.

## When it stops being the answer

- **The work fits in an isolate.** A request/response API that renders,
  proxies or transforms small payloads wants `workers-ssr` or a plain
  Worker: no image to build, no cold start to pay, nothing to size.
- **A long-running daemon with no Worker in front.** There is no direct
  ingress to a container here — it is reached only through the Durable
  Object binding a Worker holds
  ([Containers](https://developers.cloudflare.com/containers/)). A queue
  consumer that should just run, a service other systems dial directly,
  anything expecting its own hostname: the Worker-shaped front door is a
  constraint rather than an accident, and a workload that fights it wants
  a different compute pack.
- **The product is not otherwise on this account.** The whole argument for
  this pack over another cloud's compute is that the front door, the
  routing and the account are already here. Bring neither and it is a
  container host with fewer knobs.
- **Sustained, predictable load.** Billing runs while an instance is awake
  ([Pricing](https://developers.cloudflare.com/containers/pricing/)), so
  the shape that pays here is bursty and the shape that does not is a
  process that never sleeps — see [cost shape](cost-shape.md).

## Against the alternatives

**Against `workers-ssr`** — the same account, the same Worker, one extra
process. Take Containers when the sandbox is genuinely not enough; the
cost is an image to build, a daemon on every runner, and a cold start
where there was none. And note this is not an addition: the two are pinned
**instead of** each other, because both ship `wrangler.jsonc` at the repo
root and a repo pinning both gets whichever composed last. A Worker
fronting a container can still serve assets and render — that Worker is
just one the project writes.

**Against `cloud-service/cloud-run`** — Cloud Run is the closer analogue
and the fairer comparison: serverless containers, scale to zero, one
service per deployable project. It gives the container its own URL, its
own ingress and its own autoscaling, and it does not need a Worker in
front. Choose it when the container *is* the service. Choose Containers
when the container is a back room behind a front door already on this
account, and take the second provider only when you were going to have one
anyway — two clouds is two identity models, two cost reviews and two
places a deploy can fail.

**Against `cloud-service/gke`** — the same reasoning as Cloud Run's, one
step further out. Reach for a cluster when the workload needs what a
request-scoped platform cannot host: sidecars, operators, custom
networking, pods you schedule. Nothing about Containers is competing for
that; if the question is a cluster, this pack is not in the running.

**Against a Durable Object alone** — a Durable Object is already
single-threaded per id, with storage and alarms, and it is the cheaper
answer whenever the state and the coordination are the whole point. Add
the container only when the work inside that object needs a process:
`cloud-service/durable-objects` is the pack for the object on its own, and
this one is the object with an image attached.

## The trade, stated plainly

**What it buys:**

- **A real process on the account that already fronts the product.** No
  second cloud, no second identity model, no second cost review.
- **Scale to zero without a cluster.** Instances start on demand and sleep
  when idle, and nothing is billed while they sleep
  ([Pricing](https://developers.cloudflare.com/containers/pricing/)).
- **Addressability by id.** One instance per user, per tenant or per job
  is a `get(id)` rather than a scheduling design.
- **One deploy for both halves.** The Worker and the image are published
  together, so the front door and the process behind it cannot be a
  version apart.

**What it costs:**

- **A cold start where a Worker had none.** Waking a sleeping instance is
  work, and the request that wakes it pays for it — which shows up in
  probes and in tail latency before it shows up anywhere else.
- **Docker everywhere.** On the laptop for `wrangler dev` and on every CI
  runner that deploys, because `wrangler deploy` builds the image
  ([Image management](https://developers.cloudflare.com/containers/platform-details/image-management/)).
- **No `--remote` escape hatch.** A Worker binding a container cannot be
  run with whole-Worker remote development — Containers is one of the
  three bindings that page carves out
  ([supported bindings per development mode](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)).
  See the provider's local development map.
- **Account-wide ceilings you did not set.** Concurrent memory, vCPU and
  disk are capped per account, and total image storage with them
  ([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)).

## What choosing it does not decide

**What is in the image.** The Dockerfile is the project's, and this
component states only the contract it must satisfy — see
[artifact](artifact.md).

**Where the product's other projects run.** A container here and an API
elsewhere are two projects with two deploy pins.

**Whether the front door is public.** It can sit behind the account's
identity-aware proxy — `cloud-service/zero-trust-access` — which composes
with this pin rather than replacing it.
