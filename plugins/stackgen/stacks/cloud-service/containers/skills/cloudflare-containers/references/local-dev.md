# Containers — local dev

**The container really runs locally, and it is the real image.** The
provider's local development map owns the general shape — the `cloudflare`
skill — including which surfaces have no local existence. Its Containers
row is a "really runs" row with one hard prerequisite, and this is what
that means for this service.

## `wrangler dev`, and Docker underneath it

Developing a container-enabled Worker locally needs a Docker-compatible
CLI **and** engine — Docker Desktop and Colima are the two Cloudflare
names — so **nothing about this stack runs on a machine without one**
([local development](https://developers.cloudflare.com/containers/guides/local-dev/);
the `cloudflare` skill's local-development-map reference, which lands
beside this one).
That is a genuine local runtime rather than a simulation: the process
under test is the process that will be deployed, in the image that will be
pushed.

Images do not have to come from a Dockerfile. A dev session builds from a
local Dockerfile or pulls from a registry — the Cloudflare Registry,
Docker Hub, Amazon ECR or Google Artifact Registry — and a **private**
registry needs local authentication (`docker login`) first. `wrangler dev`
can pull from the Cloudflare Registry directly; `vite dev` needs a local
Dockerfile with a `FROM` line as a workaround
([local development](https://developers.cloudflare.com/containers/guides/local-dev/)).
This pack ships a Dockerfile path, which is the arrangement with the
fewest moving parts and no external credential.

## `EXPOSE`, and how far the evidence for it actually goes

**Declare every port the Worker reaches with `EXPOSE` in the Dockerfile.**
That is the recommendation; the evidence behind it needs stating plainly,
because it does not come from the Containers documentation.

Cloudflare states the rule for **Sandbox**, which is built on Containers:
under `wrangler dev` each port must be declared or the connection is
refused, and the requirement is specific to local development because
deployed, every container port is reachable automatically
([Sandbox preview URLs](https://developers.cloudflare.com/sandbox/concepts/preview-urls/),
[expose services](https://developers.cloudflare.com/sandbox/guides/expose-services/)).
**Containers' own local-development guide says none of this**
([local development](https://developers.cloudflare.com/containers/guides/local-dev/)),
so whether it generalizes to every Containers image is an inference rather
than a documented fact — check it at Context7 before treating a missing
`EXPOSE` as the diagnosis.

The recommendation survives the uncertainty in either case: declaring the
ports costs a line, an `EXPOSE` documents the image's interface anyway,
and if the rule does apply the symptom is a connection refused that reads
like a process which failed to start.

## There is no `--remote` for this

A Worker binding a container **cannot be run with whole-Worker remote
development**. Containers is one of three bindings Cloudflare's own
per-binding table carves out of its remote-development list, and there is
no per-binding remote mode either
([supported bindings per development mode](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)).

So the choice a Worker developer usually has — run it here against fake
resources, or run it up there against real ones — does not exist here. The
container runs on the laptop or not at all, and everything a real
deployment would have told you has to come from a deployed environment.
The provider's local development map states the same carve-out for the
services it applies to.

## What running locally does prove

- **That the image builds and the process starts.** The Dockerfile, the
  build context and the entrypoint are exercised for real, which is the
  thing a Worker's local runtime could never do for you.
- **That the Worker reaches the container.** The binding, the instance id
  the Worker chooses, the port it forwards to — the whole path is live.
- **That the ports are right**, at least in the stricter direction: local
  passing implies production will connect, and local failing may still
  mean only a missing `EXPOSE`.
- **That the request/response contract holds.** Whatever the Worker sends
  and the container answers is the real exchange.

## What local cannot tell you

- **Whether sleep and wake behave.** The lifecycle is the platform's —
  instances start on demand and sleep after their idle window
  ([Pricing](https://developers.cloudflare.com/containers/pricing/)) — and
  a local run is a process that stays up. The cold start a deployed user
  pays is not visible here, which makes it the failure a probe finds
  first. See [health](health.md).
- **Whether the instance type is big enough.** Locally the container has
  the laptop, which is almost always more generous than a `lite` instance
  and never the same disk. Out-of-memory at the platform's allocation is a
  deployed-only symptom.
- **Whether the account has room.** Concurrent memory, vCPU and disk are
  capped per account
  ([Limits](https://developers.cloudflare.com/containers/platform-details/limits/));
  a laptop has no such ceiling and enforces nothing.
- **Whether the image pushes.** The build is local, the push is not. Image
  size, registry storage and the token all belong to the deploy — see
  [pipeline](pipeline.md) and [identity shape](identity-shape.md).
- **Whether the route is right.** The custom domain, its DNS record and
  the zone it lives in do not exist on a laptop.

## Resetting local state

A container that carries state between local runs is a container hiding a
bug: the deployed instance sleeps and is replaced, and anything it kept in
its own filesystem is gone with it. **Rebuild the image and start from a
cold container before believing a local result** — a run that only passes
against a container which has been up all afternoon is a run that has
tested a state production never has.

## The check worth insisting on

**Wake it cold at least once.** Start `wrangler dev`, make the first
request, and watch what the Worker does while the container is coming up:
that path — request arrives, instance is not running, the Worker waits —
is the one every real user hits after a quiet period, and it is the one
easiest to develop for hours without ever exercising again.
