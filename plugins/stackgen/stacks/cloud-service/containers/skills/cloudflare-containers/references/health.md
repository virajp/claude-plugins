# Health — Containers

**There is a process to probe here, and no way to probe it directly.** A
container instance has no address of its own: it is reached through the
Durable Object the Worker holds a binding to
([Containers](https://developers.cloudflare.com/containers/)). So every
answer to "is it up?" is an HTTP probe of the **Worker**, and what makes
the probe worth anything is what the Worker does with it.

The `harness.health` task is therefore `n/a`. This component fixes no task
name and ships no probe — what it fixes is **what the probe must ask**.
A Containers health-probe task is parked, deliberately, until a real
project has an opinion about the cold-start budget below.

## One probe, two hops

**`GET` a readiness path on the Worker that forwards to the container's
own health endpoint, and returns 200 only if the container answered.**

Both halves of that sentence are load-bearing:

- **The Worker must forward.** A readiness path the Worker answers by
  itself proves the Worker deployed and nothing else. The container can be
  failing to start, failing to listen, or crash-looping, and the probe is
  green throughout — which is the same failure the Workers-script sibling
  has with a prerendered page, in a costlier form, because here something
  is actually broken rather than merely unexercised.
- **The container must have a health endpoint of its own**, separate from
  the work and cheap to answer. Forwarding the readiness probe to a real
  work route makes the probe expensive, and makes it fail for reasons that
  have nothing to do with liveness. That endpoint is part of the image's
  contract — see [artifact](artifact.md).

## The cold start is the whole difficulty

An instance that has slept is started by the request that woke it
([Pricing](https://developers.cloudflare.com/containers/pricing/) states
the billing side of the same lifecycle; the wake itself is
[scaling and routing](https://developers.cloudflare.com/containers/platform-details/scaling-and-routing/)).
So a probe of a quiet service is, most of the time, a probe that wakes
something.

Three consequences, and each is a decision rather than a detail:

- **A timeout tuned to a warm instance reports a sleeping one as dead.**
  The probe's budget has to cover a cold start of this image, measured —
  not guessed, and re-measured when the image grows. This is the single
  most likely way a Containers health check produces false alarms.
- **"Sleeping" and "dead" are distinguishable, and only by the Worker.**
  The Worker knows whether it was waiting on a wake or on a container that
  never answered, and it is the only thing that does. A readiness path
  that reports which of the two happened turns an ambiguous timeout into
  a fact; the Worker's own logs are the other half of that, which is why
  this pack ships `observability.enabled`.
- **Probing frequently keeps instances awake, and that is billed.** A
  health check every thirty seconds against a service with a long
  `sleepAfter` is a service that never sleeps, and the monitoring has
  become the traffic. Probe interval is therefore a **cost** decision here
  in a way it is not on any request-billed platform — see
  [cost shape](cost-shape.md).

Where the last two pull against each other, the honest resolution is to
probe rarely and to accept that the probe measures the wake path, since
the wake path is what a real user gets after a lull anyway.

## Per-instance health is not a thing a probe can cover

Instances are addressed by id, so "the service" may be dozens of
containers and a probe reaches exactly one — whichever id the readiness
path picks. Two rules follow:

- **Give the readiness path a fixed, reserved id** rather than letting it
  land on a tenant's instance. A probe that wakes a real user's container,
  or that reports a real user's container's state as the service's, is
  measuring the wrong thing in both directions.
- **A green probe says nothing about the other instances.** Per-instance
  failure — one tenant's container stuck, one job's instance out of memory
  — is not an availability signal a probe produces. It is a signal the
  Worker produces, because the Worker is what saw the failure.

## What health cannot tell you here

- **Whether the work is correct.** A successful deploy of a broken image
  is a successful deploy, and a container returning 200 from a health
  endpoint while doing the wrong thing is healthy by every definition a
  probe has. Correctness is the acceptance suite's, running against a
  deployed URL — see [pipeline](pipeline.md).
- **Whether the instance type is big enough.** An instance that will run
  out of memory under real work answers a health endpoint comfortably.
  That failure arrives under load, not at probe time.
- **Whether the account has headroom.** Concurrent memory, vCPU and disk
  are capped per account
  ([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)),
  so a service that is healthy at one instance can fail to start the
  eleventh for reasons that live on a neighbouring project.
- **Whether the container's own dependencies are reachable.** A health
  endpoint that touches the datastore is a dependency check, with a
  dependency check's cost and its own failure modes; that is a decision to
  make deliberately rather than by default.

## Alerting is built on the Worker's signals

The Worker sees every request, every wake, every timeout and every
container error, and it is the only vantage point that sees all four. Alert
on error rate and on wake latency from there. The one signal worth adding
beyond them is **awake-instance count against `max_instances`**: hitting
the ceiling is not an error and produces no failed request until it does,
so it is the failure that arrives as a cliff — and the number that caps it
is one this pack deliberately ships small. See
[service doctrine](service-doctrine.md).
