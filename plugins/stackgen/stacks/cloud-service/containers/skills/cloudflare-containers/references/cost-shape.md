# Containers — cost shape

The provider's cost doctrine — never write dollar figures, and run the
billing review against the same evidence as the privilege review — is the
`cloudflare` skill's, and this cites it rather than restating it.

**This service is the case that doctrine explicitly set aside.** The
provider doctrine is written for the account's seat-billed surface, where
the bill tracks the population allowed through. Containers is the other
shape entirely: **the bill tracks time a process is awake**, and reading
the seat principle across to it gets the answer backwards.

## The unit is a running second, not a request

Charging starts when a request arrives or the instance is started
explicitly, and stops when the instance goes to sleep, measured in 10 ms
increments; the dimensions are memory, CPU and disk, billed per
GiB-second, per vCPU-second and per GB-second, with monthly allowances on
the paid plan
([Pricing](https://developers.cloudflare.com/containers/pricing/)). The
instance type is what sets the provisioned resources, so a larger type
raises the base cost of every awake second and raises the ceiling on CPU
cost with it
([Pricing](https://developers.cloudflare.com/containers/pricing/)).

Three consequences follow and they are the whole shape of this file:

- **Team growth does not move the bill.** Nobody consumes a seat here;
  there is no seat.
- **Traffic growth moves it only through awake time.** Ten requests to one
  awake instance cost what one request to it costs; ten requests to ten
  sleeping instances start ten of them.
- **Idle inside the sleep window is billed.** An instance awake and doing
  nothing is an instance being paid for, which is the difference from a
  Worker and the thing that surprises a team arriving from one.

## The three traps

**`sleepAfter` is a cost knob wearing a latency name.** Every second of
the idle window is a billed second when nobody is using the instance, and
the window applies **per instance** — so a design with one instance per
tenant multiplies it by the tenant count. A long window on a service made
of quiet tenants is the largest avoidable line here, and it is invisible
in an overall request-rate graph because the requests genuinely are rare.
See [service doctrine](service-doctrine.md).

**Instance sizing is provisioned, not consumed.** Unlike a request-billed
platform, choosing a bigger instance type costs more for every awake
second whether or not the work needed the headroom. The honest move is to
start at the default and size up against a measurement; the tempting move
is to size up once so nothing ever runs out, and that one is paid for
continuously.

**Image storage is account-wide and capped.** Total image storage is
limited per account, and freeing space by deleting images is deleting
rollback targets
([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)).
So image size is a cost-adjacent decision with a reliability edge on it:
a bloated image is not only slower to build and push, it crowds out the
versions a bad release would have been rolled back to — see
[artifact](artifact.md).

## What is not a cost lever

- **Requests to a warm instance.** They are not the unit. Optimizing
  request count without changing awake time changes nothing.
- **`max_instances`, on its own.** It is a ceiling on concurrency, not a
  spend. It bounds the worst case, which is worth having; it does not
  reduce the ordinary bill.
- **Regions.** `constraints` place a container rather than price it
  differently; placement is a latency and jurisdiction decision.

## The sizing question

Not "how many requests" but **"how many instances are awake, how big are
they, and for how long"**. Two products with identical traffic and
different instance-per-id designs have entirely different bills, and the
gap distribution between requests to one id — not the aggregate rate — is
the number to know before `sleepAfter` and the instance type are set.

Where the honest answer is "one instance, awake continuously, at a fixed
size", the shape has stopped being serverless and the comparison worth
running is against a plain container host — see
[pick & trade](pick-and-trade.md). Not because this cannot serve it, but
because scale-to-zero is what this pricing model is paying for.

## Reading the actual numbers

Container usage is queryable per day and per dimension — `cpuTimeSec`,
`allocatedMemory`, `allocatedDisk` and `txBytes` — through the account's
GraphQL analytics
([querying container metrics](https://developers.cloudflare.com/analytics/graphql-api/tutorials/querying-container-metrics/)).

**Two datasets sit behind that, and only one of them is the bill.**
`containersUsageAdaptiveGroups` reports what the container consumed
**together with the micro VM sandbox required to run it** — the values
that populate the dashboard's usage estimates, and the ones to use when
estimating cost. `containersMetricsAdaptiveGroups` reports the workload
inside the container, per instance and per hour, which is what answers
"which instance design is costing this" rather than "what will this cost"
([querying container metrics](https://developers.cloudflare.com/analytics/graphql-api/tutorials/querying-container-metrics/)).

Take the first for a billing review and the second for a sizing argument.
Reaching for the workload numbers to estimate a bill undercounts by the
sandbox, which is the mistake this distinction exists to prevent —
and estimating from request logs instead is measuring the wrong quantity
altogether.

## Two costs that are not this service's

- **The build.** Building and pushing the image costs whatever the CI
  system pinned on the project's `cicd` axis costs, and moving it around
  does not change what running the container costs.
- **What the container calls.** A datastore, an API, a third-party
  service — each is its own pin with its own cost doctrine.

Never write dollar figures. They change; the shape does not.
