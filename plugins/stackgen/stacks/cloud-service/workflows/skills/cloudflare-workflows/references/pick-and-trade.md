# Pick & trade — Cloudflare Workflows

## When this is the answer

Three signals, and the first is the one that decides:

- **The work is one process with steps, not many independent messages.**
  It has an order, it carries state from one step to the next, and
  "halfway through" is a real state someone would ask about. The
  async-orchestration contract calls this the heaviest of its four shapes
  and reserves it for "a multi-step process with state, timers and
  compensation" (`assets/contracts/orchestration.md`, *Pick the smallest
  thing that holds*).
- **The process outlives a request, and possibly a day.** A step may sleep
  for up to 365 days, and `waitForEvent` blocks on something outside the
  system entirely — a webhook, an approval — with a timeout that defaults
  to 24 hours
  ([limits](https://developers.cloudflare.com/workflows/reference/limits/),
  [Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)).
  Neither costs compute while it waits
  ([pricing](https://developers.cloudflare.com/workflows/reference/pricing/)).
- **The compute is already Workers.** The Workflow class lives in the
  Worker's own script, so this adds a binding and a class rather than a
  service to operate.

## When it stops being the answer

- **The work is independent messages with consumers.** One thing, later,
  retried until it succeeds is a **queue** — `cloud-service/queues` — and
  buying a workflow engine for it is the mistake the contract names
  outright. The tell is that nothing in the work needs to know what the
  previous message did.
- **The state must be coordinated, not completed.** A counter many writers
  increment, a room many clients join, a lock: that is **Durable
  Objects** (`cloud-service/durable-objects`) — an object that lives and
  serializes access, where a Workflow is a run that ends. A Durable
  Object with an alarm can imitate a long process, and it is the wrong
  tool for one: it gives you no step cache, no per-step retry
  configuration and no instance status to query.
- **The latency budget is sub-second.** Every step boundary is a
  persistence point, and the engine may hibernate between steps. A
  request-path computation that must answer in milliseconds does not
  become one by being written as a Workflow.
- **The fan-out is unbounded.** Steps are counted and capped — the ceiling
  is configurable on the binding through `limits.steps`, which is the
  proof that it exists
  ([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)),
  and a Workflow that creates a step per row of an unbounded input will
  meet it. The shape that scales is a Workflow that enqueues, and a queue
  that fans out.
- **The team already runs an orchestration engine.** Here the contract's
  own instruction applies: pick the smallest thing that holds. Migrating a
  working Temporal deployment onto Workflows buys edge co-location and
  costs the durable-timer semantics, the SDK and the operational knowledge
  the team has. The contract's `assets/contracts/orchestration.md` says
  which engine is the user's pick, and this component is one of the
  answers rather than the answer.

## The trade against a self-hosted workflow engine, stated plainly

What is given up: a language-agnostic SDK, arbitrary retry and timer
policies, a queryable history the team owns, and the ability to run the
same engine anywhere. What is gained: no engine to operate, an idle
process that costs nothing while it sleeps or waits
([pricing](https://developers.cloudflare.com/workflows/reference/pricing/)),
and steps that run in the same runtime and the same bindings as the rest of
the product's code — the Workflow reaches the project's other bindings
directly rather than over a network.

That trade is worth taking for a product being built on Workers whose
processes are shaped like the ones above. It is rarely worth taking as a
migration away from an engine that already works.

## What the pick commits the design to

Two things, both decided here rather than later:

- **Step names become a persisted interface.** They key the cache, so
  renaming one changes what an in-flight instance thinks it has already
  done. Designing them as a stable vocabulary is part of picking this,
  not a refinement afterwards — see
  [service doctrine](service-doctrine.md).
- **Compensation is a first-class option, and choosing not to use it is
  still a choice.** A step may register a `rollback` handler with its own
  retry configuration, run when the Workflow fails after that step
  succeeded
  ([sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)).
  A process with an irreversible middle — a charge, an external
  provisioning call — either has compensating steps or has an operator
  procedure, and the design says which.
