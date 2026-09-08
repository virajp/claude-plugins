# Service doctrine — Cloudflare Workflows

This component realizes the `durable-workflows` capability, so what it
owes is stackgen's neutral async-orchestration contract, clause by
clause. The contract
states what **any** backend for work that happens later must do; this file
states how this one does each, **citing rather than restating**, which is
what lets a queue or a self-hosted engine be judged against the same
clauses. The contract's `message-queue` and `pub-sub` tokens are not
realized here — those are `cloud-service/queues`'.

## Contract satisfaction

**Deliver at least once, so every consumer is idempotent.** A Workflow
step is the unit that is delivered, and it is delivered at least once: a
step can commit its effect and still be retried, because the destination
may succeed while the reply is lost or the engine restarts. Cloudflare
documents the shape the contract's clause 1 demands — ask the destination
whether the work is already done, and return early if it is, *before*
performing a non-idempotent call
([rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)).
The contract's "keyed on an id it records" is satisfied by the instance
id, which the caller chooses, so a domain id — the order, the upload —
carries the idempotency key from the caller all the way into the step.

**Retry with back-off, and stop.** Per step and by configuration, not by a
wrapper the product writes: `step.do` takes
`retries: { limit, delay, backoff }` — `backoff` is `exponential` or
`linear` — plus a `timeout`, and only the failing step is retried rather
than the Workflow from the beginning
([sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)).
The contract's "and stop" has an explicit mechanism here: throwing
`NonRetryableError` from `cloudflare:workflows` ends the attempt rather
than consuming the remaining budget
([sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)).
Use it for the failures that are answers — a rejected charge, a validation
failure — and leave the retry budget for the ones that are weather.

**Have a poison path.** Work that will never succeed becomes an instance
in the `errored` state, which is retained after the run ends —
`retention.errorRetention` is set per instance at creation, alongside
`successRetention`
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)).
That is the poison destination, and it satisfies the clause **only if
something looks**: there is no dead-letter queue here that another
consumer drains, so the operational commitment a project makes when it
pins this is that errored instances are reviewed on a stated cadence.
Where the failure leaves the outside world half-changed, the mechanism is
a step's `rollback` handler — a compensating function with its own
`rollbackConfig` retries and timeout, receiving the step's own output and
the error that triggered it
([sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)).
A process with an irreversible middle either registers those or has an
operator procedure; leaving both unwritten is the failure this clause
exists to prevent.

**Make work in flight visible.** `instance.status()` returns one of
`queued`, `running`, `paused`, `errored`, `terminated`, `complete`,
`waiting`, `waitingForPause` and `unknown`
([trigger Workflows](https://developers.cloudflare.com/workflows/build/trigger-workflows/)),
and the account-level list endpoint returns per-Workflow counts across
those same states
([list Workflows](https://developers.cloudflare.com/api/go/resources/workflows/methods/list)).
So the contract's **depth** and **failure rate** are answerable without
reading code. Its **age of the oldest item** is not a field the platform
returns: the instance list is what carries creation times, and a project
that needs that number derives it there rather than assuming a gauge
exists. Per-instance, `wrangler workflows instances describe` prints an
instance's logs, retries and errors
([wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workflows/)),
which is the answer to "is this one stuck".

**Preserve the trace.** The clause needs work to be joined to the trace
that started it, and here that is a design obligation rather than a
platform feature. Two documented facts set the shape: `params` is what a
creator hands an instance
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)),
and nothing outside a step survives the engine's hibernation
([rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)).
So the trace context travels **in `params`**, and each step re-establishes
its span from that rather than from an ambient context — an instance that
sleeps for a day resumes in a process that never saw the request.

**Retry only what is safe to repeat.** The contract's three examples — a
payment, an email, an external mutation — are exactly the ones
Cloudflare's own guidance builds its idempotency example around, and the
resolution is the same: an idempotency key the receiver records, or a
bounded "already done?" check inside the step before the call
([rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)).
Where neither is available, the operation is its own step with
`retries.limit` set to zero and a `rollback` handler, so a failure is
visible rather than repeated.

**The access rule.** The contract requires the backend to be reached only
through the product's own services layer, and the shape enforces it: a
Workflow is created and inspected through a binding on a Worker, so there
is no client-direct path and nothing outside the account's own code can
start one. The one seam that can leak is `sendEvent` — see
[identity shape](identity-shape.md).

## Steps are a persisted interface

**A step's name is its key in the cache.** A name built from a clock or a
random value prevents the step from being cached, which means it re-runs
when a later step fails; Cloudflare's rules page opens on that exact
anti-pattern and shows the fix — return dynamic values as step output and
log the rest
([rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)).
A dynamically constructed name is fine when the construction is
deterministic — one step per entry of a list that was itself a step's
output, traversed in order.

Three consequences follow, and they are what makes this a doctrine rather
than a style note:

- **Names are chosen as a vocabulary**, in the domain's terms, at design
  time. `charge card`, not `step 3`.
- **A step's return value is the only state that crosses the boundary**,
  and it is capped at 1 MiB — larger payloads go to a store and the step
  returns the key
  ([rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)).
  A variable accumulated across steps is empty after a hibernation, which
  is a bug that only appears once a sleep is long enough.
- **Renaming a step is a breaking change to instances in flight**, which
  is the versioning subject below.

## Instance lifecycle

Everything a Worker can do to an instance, through the binding
([trigger Workflows](https://developers.cloudflare.com/workflows/build/trigger-workflows/),
[Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)):

| Doing | Call |
| --- | --- |
| Start one, with a chosen id and parameters | `env.MY_WORKFLOW.create({ id, params })` |
| Reach one already running | `env.MY_WORKFLOW.get(id)` |
| Read where it is | `instance.status()` |
| Hold it, and release it | `instance.pause()`, `instance.resume()` |
| Advance one waiting on an event | `instance.sendEvent({ type, payload })` |
| End it, optionally compensating | `instance.terminate({ rollback })` |
| Start it over, discarding intermediate state | `instance.restart()` |

Two of those are sharper than they look. **`terminate` is final** — a
terminated instance cannot be resumed — and its `rollback: true` option is
what runs the registered compensating handlers on the way out, so an
operator ending a stuck process has to decide whether the outside world
should be put back. **`restart` erases intermediate state and cancels
in-progress steps**, so it is the right answer only where every step is
idempotent from the beginning of the run, not merely idempotent per
attempt.

The same verbs exist on the command line — `wrangler workflows trigger`,
`wrangler workflows instances list | describe | pause | resume |
terminate | send-event`
([wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workflows/)).
Treat those as the operator surface, not as the product's: an action a
process depends on belongs in code behind the binding.

## Sleeping and waiting

`step.sleep(name, duration)` suspends without consuming CPU, does not
count against the step limit, and reaches up to 365 days
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/),
[limits](https://developers.cloudflare.com/workflows/reference/limits/)).
`step.waitForEvent(name, { type, timeout })` blocks until an event of that
`type` arrives, with a default timeout of 24 hours and a `type` of up to
100 characters
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)).

Two design rules around them:

- **The timeout is the design, not the fallback.** A wait with the default
  24 hours has decided that a human has a day; write the number you mean,
  and decide what the Workflow does when it expires, because a
  `waitForEvent` that times out throws into the step's retry policy rather
  than quietly continuing.
- **Sleep durations belong in `params` where a test needs them short.**
  Local sleeps elapse in real time — see [local dev](local-dev.md) — so a
  duration hard-coded at 30 days is a step no suite will ever get past.

## Instance ids, and what they buy

The id is chosen by the caller
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)),
capped at 100 characters
([limits](https://developers.cloudflare.com/workflows/reference/limits/)).
Deriving it from the domain object is what makes starting a process
idempotent at the entry point rather than only inside each step: a
retried HTTP request that would otherwise start a second run for the same
order instead collides on the id. A random id is the right choice only
where two runs for the same subject are genuinely both wanted, and saying
which of the two applies is part of designing the flow.

## Versioning a class with instances in flight

Cloudflare exposes deployed Workflow versions through the API — they can
be listed and read per Workflow
([Workflow versions](https://developers.cloudflare.com/api/go/resources/workflows/subresources/versions/methods/get)).
What the documentation consulted does **not** state is which version an
already-running instance continues on, so the safe rule is the one that
holds either way, and it follows from step names being cache keys:

- **Add steps at the end.** A new step after the last one an in-flight
  instance has completed simply runs.
- **Never rename or remove a step an instance may already have recorded.**
  A rename is a new step to the cache and a lost one to the resume path.
- **Change a step's body only where the change is compatible with the
  value already persisted** for instances that passed it, since those
  will not re-run it.
- **Where a change cannot be made compatibly**, deploy the new behaviour
  as a **new Workflow name and binding**, let the old one drain, and
  remove it when its instances have completed. That is more honest than a
  migration the platform does not promise.

## Per-environment Workflows

There is no resource id to swap: **the environment is the deployed
script.** The binding names a Workflow by `name` and a class by
`class_name` in the script `main` points at (this component's
conventions, in the composition's template, carry the block), so a
staging Worker has its
own Workflow and its own instances by virtue of being a different
deployment. Where a Workflow is shared across Workers, `script_name` names
the one that owns the class — and that makes the owning script the thing
an environment split has to follow, or two environments will bind the same
running Workflow.
