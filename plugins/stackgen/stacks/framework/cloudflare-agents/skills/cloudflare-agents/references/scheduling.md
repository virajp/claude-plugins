# Scheduling

An agent schedules its own work: `this.schedule(when, methodName, payload)`
calls a method on **this instance** later. `when` is a number of seconds, a
`Date`, or a cron expression, and the call returns a schedule with an id that
`cancelSchedule` takes back
([schedule tasks](https://developers.cloudflare.com/agents/runtime/execution/schedule-tasks/)).

```ts
await this.schedule(3600, "hourlyCleanup", {}, { idempotent: true });
await this.schedule("0 9 * * *", "sendDigest", { tz: "utc" });
await this.schedule(new Date(dueAt), "expireHold", { holdId });
```

The callback is named by string, so a rename in code silently breaks a schedule
already sitting in storage. Renaming a scheduled method is therefore a data
change: cancel the outstanding schedules, or keep the old name as a
forwarding method, before deploying the rename.

The payload is persisted and must be JSON-serializable. Keep it a **reference**
— an id — rather than a snapshot of a record, because it will be read back at
a time when the snapshot may be wrong.

## Idempotency is the whole trap

`onStart` runs on **every wake**, not once per agent. A schedule created there
without deduplication is created again after every hibernation, every crash and
every redeploy, and the table grows one row per wake until the work runs many
times over.

The `idempotent` option deduplicates by callback and payload. It defaults to
**true for cron** schedules and **false for delayed and dated** ones
([schedule tasks](https://developers.cloudflare.com/agents/runtime/execution/schedule-tasks/)).
So:

- A recurring schedule created in `onStart` is safe by default.
- A delayed or dated schedule created in `onStart` is **not**, and must pass
  `{ idempotent: true }`.
- A delayed schedule created in response to an event — a hold placed, a message
  received — is normally *meant* to be one per event, and the default is right.
  If the event can be retried, deduplicate on the payload instead of on the
  option.

Verify the current defaults against the docs when writing the call; they are
the kind of thing that changes, and the failure is silent duplication rather
than an error.

## Handlers run again

A scheduled method can run more than once — a retry, a duplicate schedule, an
eviction between the work and the acknowledgement. Write the handler so a
second run is harmless: check the state or the row before acting, and record
completion in the same store the decision reads from.

```ts
async expireHold({ holdId }: { holdId: string }) {
  const [hold] = this.sql<Hold>`SELECT * FROM holds WHERE id = ${holdId}`;
  if (!hold || hold.status !== "open") return;
  this.sql`UPDATE holds SET status = 'expired' WHERE id = ${holdId}`;
}
```

A handler that only sends — an email, a webhook — has no such guard available
and needs an explicit one: a sent-marker row written before the send, checked
on entry.

## What scheduling is not

**Not a job queue.** The schedule belongs to one agent instance and runs on its
single thread, so it competes with that agent's requests. Fan-out across many
things, or work that any worker could pick up, is the Queues component's.

**Not durable execution.** A multi-step process that must survive failure at
each step, retry with backoff, or wait on a human is a Workflow — Cloudflare's
own guidance draws the line at about thirty seconds and at multi-step
pipelines, and pairs the two rather than choosing between them
([run workflows](https://developers.cloudflare.com/agents/runtime/execution/run-workflows/)).
An agent that schedules itself in a chain to fake durable steps has
reimplemented Workflows without the retries.

**Not a cron trigger.** A Worker's own scheduled trigger fires for the Worker,
not for an agent, and has no instance to run on. Waking many agents on a
timetable means a trigger that enumerates them and calls each by name — which
is a design with a cost, not a free loop.

## Cost

Scheduled wakes are billed like any other wake: the object comes out of
hibernation, and duration is metered. A per-second schedule on a thousand
instances is a thousand objects that never sleep. The billing model is the
Durable Objects component's reference; the design decision here is the
frequency.
