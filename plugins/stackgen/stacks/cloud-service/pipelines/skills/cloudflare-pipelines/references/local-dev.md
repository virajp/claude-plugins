# Pipelines — local dev

**Cloudflare states no local form for this binding, and the honest answer
is to say so rather than to infer one.** The provider's local development
map carries a row per surface and defers this one here, because the
per-binding table it draws from does not settle it.

## What Cloudflare actually says, and what it does not

Cloudflare's per-binding development table sorts bindings into three
groups — local simulation, remote connection, or both. It names Workers
AI, Media Transformations, mTLS and Vectorize as remote-connection only;
Assets, Analytics Engine, Durable Objects, Containers, Hyperdrive, Rate
Limiting and Workflows as local simulation only; D1, KV, R2, Queues and
Service Bindings as supporting both
([bindings per environment](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)).

**Pipelines is on none of those three lists**, and the Pipelines
documentation itself describes no local mode, no simulated stream and no
`--persist-to` state for one. So there is no documented local simulation
to rely on and no documented remote-connection switch either. Anything a
project observes `wrangler dev` doing with a `pipelines` binding is
undocumented behaviour: verify it against the current docs before
depending on it, and do not write a test suite whose green depends on it.

This is a fact about the service's current state rather than a gap in
this component's research, and it is the reason `local_stack` is `n/a`.

## The two substitutions

**A dev stream feeding a dev bucket.** The pipeline is a set of account
resources, so a second set — a `-dev` stream, sink and pipeline, into a
bucket nobody queries for anything real — costs a provisioning step and
gives the highest fidelity available: the real schema rejection, the real
transform, the real files. It is what a developer wants when the thing
under test is the pipeline. It is not free, it needs a credential on the
laptop, and it is the reason the environment rule in the pack's `harness`
block says a stream and a sink **per environment** rather than a shared
one behind a prefix.

**A stub behind the send seam.** The `send()` call has a natural boundary
in product code — the function that decides what an event looks like and
hands it off. Substituting there means the default local run needs no
Cloudflare resource, no token and no network, and the events are
assertable in a test rather than looked for in an object store minutes
later. It is the right default; the dev stream is what a developer opts
into when they are changing the pipeline rather than the product.

Which of the two a project uses is a per-project decision worth recording,
because the two answer different questions and a team that has only one
of them usually has the wrong one for the day's work.

## `wrangler dev --remote`, and why it is not the general answer

Running the Worker on Cloudflare's own infrastructure connects every
binding to the real resource, which does resolve this one. It also
resolves it for every other binding in the project — the datastore, the
object store, the cache — and moves the whole edit-run loop onto the
network. Cloudflare's own guidance prefers local execution with
per-binding remote connections for exactly that reason. Reach for it to
answer a question about Pipelines specifically, not as the shape of the
project's development loop.

## What local therefore cannot tell you

Four things, and the first two are the ones that break:

- **Whether the schema accepts the events the product actually sends.** A
  stubbed send accepts anything; a real stream rejects an event missing a
  required field, and a rejected event does not exist anywhere
  afterwards.
- **Whether the transform SQL is right.** It runs between stream and
  sink, in the service. Nothing on a laptop evaluates it, so a projection
  that drops a column or a routing predicate that never matches is
  discovered by querying the table and finding it empty.
- **The delivery latency.** Rows appear when the rolling policy closes a
  file. A test that sends and immediately queries is testing the rolling
  policy and will report a bug in the wrong system.
- **The format and partitioning of what lands.** Those are sink
  configuration the local run never reads.

**So the ingestion path is verified in a deployed environment or not at
all** — which is why the pre-production rule is a stream, a pipeline and
a sink of its own rather than a shared one, and why an end-to-end suite
that asserts on delivered rows has to wait for a roll rather than poll
tightly and fail.
