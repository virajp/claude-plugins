# Cost shape — Cloudflare Workflows

The provider's billing principle is **seats, not traffic**, and it is
about the private plane; the `cloudflare` skill's cost doctrine owns it and
says explicitly that every other service this stack offers bills by
consumption instead. This file states what that consumption is for this one
service. No dollar figures — the billing model and its traps are what stay
true.

## The meter

Four terms, and nothing else
([pricing](https://developers.cloudflare.com/workflows/reference/pricing/)):

- **Requests** — the invocations that create and drive instances
- **CPU time** — compute actually burned, per invocation
- **Steps executed**
- **Storage**

Workflows is included in both the Free and the Paid plan, and each carries
an allowance before any term is charged. The two allowances are measured on
**different periods** — the Free plan's are daily (requests and steps among
them), the Paid plan's monthly, with usage beyond them billed
([pricing](https://developers.cloudflare.com/workflows/reference/pricing/)).
Which matters for a design more than the numbers do: on the Free plan one
batch that fans out into thousands of steps can exhaust a day, and the
meter resets rather than the bill growing.

## The headline: elapsed time is not a billed dimension

**A Workflow does not incur CPU time while it is idle** — waiting on an API
response, or sleeping
([pricing](https://developers.cloudflare.com/workflows/reference/pricing/)).
This inverts the instinct every self-hosted workflow engine trains, where a
long-running process occupies a worker slot for its whole life and the cost
of "wait 30 days" is thirty days of something running.

Two consequences follow directly:

- **A sleep is not a cost decision.** `step.sleep` is the right answer for
  a delay of any documented length, and polling in a loop to avoid one is
  strictly worse on every term of the meter.
- **`waitForEvent` is cheap to hold open.** A process parked on a human's
  approval for a day is not paying for the day; it is paying for the
  invocation that parked it and the one that resumes it.

## Trap one: the step is the unit that bills

Steps executed is a term of its own, so **granularity has a price**. A
Workflow that wraps every line of a loop in its own `step.do` bills a step
per line; the same work in one step bills one.

The counter-pressure is that a step is also the **resumption boundary**: a
coarse step that fails re-runs all of its work, and a fine one does not. So
this is not "use fewer steps" but a design decision taken per step —
**each step is as large as the work you would be willing to repeat.** A
step wrapping an expensive external call earns its cost; ten steps wrapping
ten arithmetic operations do not.

The cost of getting it wrong runs in both directions, which is why it
belongs in the design rather than in a later optimization pass: too fine
inflates the step meter and the storage behind it, too coarse turns a
transient failure into a repeat of everything.

## Trap two: fan-out multiplies both meters

A Workflow that creates a step per row of an input scales its bill with the
input. It also meets the step ceiling, which is configurable on the binding
through `limits.steps` and therefore demonstrably finite
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)).
Raising the ceiling is not the fix; the shape that scales is a Workflow
that hands the fan-out to a queue and waits, or a Workflow per item created
by the thing that has the items.

## Trap three: persisted state is storage, and retention decides how long

Every step's return value is persisted so the run can resume past it, which
is what makes storage a term here rather than an afterthought. Two levers
control it, both explicit:

- **What a step returns.** The cap is 1 MiB, and the documented practice
  for anything larger is to write it to a store and return a key
  ([rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)).
  Returning a whole fetched dataset from a step is how a Workflow acquires
  a storage bill it did not need — and it moves the bytes to a meter with
  a cheaper one.
- **How long a finished instance is kept.** `retention.successRetention`
  and `retention.errorRetention` are set per instance at creation
  ([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)).
  Those two want different answers: a successful run is evidence for a
  short while, and an errored one is evidence until somebody has looked at
  it — [service doctrine](service-doctrine.md)'s poison-path clause is the
  reason the second is the longer of the two.

## What the CPU term actually measures

Per invocation, and the ceiling is configurable — Cloudflare documents CPU
limits raisable up to five minutes per instance
([pricing](https://developers.cloudflare.com/workflows/reference/pricing/)).
So the expensive Workflow is not the long one, it is the **busy** one: a
step doing real computation between two waits is the thing that moves this
term. Where a step is mostly waiting on a network call it is cheap on CPU
regardless of how long the call takes.

## The sizing question

Not "how long will this process run" — that is free — but **"how many
steps will an instance execute, how large is what each returns, and how
many instances per day"**. All three are known from the flow's design
before any code exists, which is what makes this a design-time estimate
rather than a bill to be explained afterwards.

Never write dollar figures. They change; the shape does not.
