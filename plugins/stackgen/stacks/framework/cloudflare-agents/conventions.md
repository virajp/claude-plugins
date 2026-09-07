# Cloudflare Agents SDK — conventions

The Agents SDK layers **on top of** the TypeScript baseline rather than
replacing it: the baseline's rules — `strict`, one mapping home for errors,
config read once at the composition root, Vitest — apply to every `.ts` file
an agent project holds. The SDK adds one class, and that class is where the
state, the storage, the schedule and the live connections all live.

**TypeScript with `strict` is a hard requirement**, as it is for every
framework component here. The package is `agents`
([add to an existing project](https://developers.cloudflare.com/agents/getting-started/add-to-existing-project/)),
installed with the project's own package manager, and it needs the
`nodejs_compat` compatibility flag on the Worker that hosts it.

## An agent **is** a Durable Object

This is the fact everything else follows from. An `Agent` subclass is a
Durable Object class: it is exported from the Worker's entry module, declared
in the Worker's Wrangler configuration, and given SQLite storage there. There
is no agent without that declaration — the class is never reachable, and the
failure is a deploy-time or request-time error rather than a type error
([configuration](https://developers.cloudflare.com/agents/runtime/operations/configuration/)).

The shape the project writes into its Worker's `wrangler.jsonc`
([quick start](https://developers.cloudflare.com/agents/getting-started/quick-start/)):

```jsonc
{
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [{ "name": "CounterAgent", "class_name": "CounterAgent" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["CounterAgent"] }]
}
```

**That file is the deploy pack's, not this component's.** This component ships
no configuration at all. `cloudflare-workers-ssr` — or `cloudflare-containers`
where the compute is an image beside the Worker — owns `wrangler.jsonc` and
the deploy task; what is written above is the block a project adds to it. The
object's own doctrine — one responsibility per class, the name as a contract
with the data behind it, alarms, hibernation, what the bill meters, and the
irreversibility of deleting a class — is the `cloud-service/durable-objects`
pack's, cited rather than restated here.

Which of the two declaration forms a project uses, and what changes when a
class is renamed or removed, is the `cloudflare-agents` skill's Durable Object
wiring reference.

## The class is the unit of design

**One agent class per kind of addressable thing, one instance per thing.** The
class is the type; the name handed to `getAgentByName` picks the instance, and
every instance has its own state and its own SQLite database. A class that
serves two unrelated responsibilities has two lifetimes and one hibernation
schedule, which is the same mistake as a Durable Object class that does.

**State and SQL are two stores with two jobs**
([state](https://developers.cloudflare.com/agents/runtime/lifecycle/state/)).
`this.setState()` is for the small, current, JSON-serializable picture the
connected clients need — it persists, and it broadcasts to every connection.
`this.sql` is for the rows: history, queues of work, anything unbounded or
queried rather than rendered. Reach for state when a client re-renders on the
change; reach for SQL when the answer is a query.

**Anything held only as a class property is lost.** An agent hibernates after
roughly two minutes idle and can be evicted at any point; a plain field does
not survive it, and the bug it causes appears under load rather than under
test.

## Clients connect; they do not poll

An agent is reached over WebSocket or HTTP through the Worker's fetch handler,
which delegates to `routeAgentRequest`
([routing](https://developers.cloudflare.com/agents/runtime/communication/routing/)).
Authentication happens **at the connection**, in that call's
`onBeforeConnect` / `onBeforeRequest` hooks — before the agent wakes, so a
rejected caller never reaches the class.

The SDK ships a browser client, and React bindings (`agents/react`'s
`useAgent`) are named here as one client option among them. They are not a
reason to pin a React component — this plugin ships no `framework/react`, and
nothing in this pack decides the UI.

## Schedules are the agent's own timer

`this.schedule(when, method, payload)` takes a delay in seconds, a `Date`, or
a cron expression, and calls a method on the agent later
([schedule tasks](https://developers.cloudflare.com/agents/runtime/execution/schedule-tasks/)).
Because `onStart` runs on every wake, a schedule created there is created
again on every wake unless it is idempotent — cron schedules are deduplicated
by default, delayed and dated ones are not. That default is the whole trap.

## What this is not

**Not a workflow engine.** Cloudflare's own guidance draws the line at durable
execution: agents are for real-time communication, state, chat and quick
calls; anything long-running, multi-step, retried across failure, or waiting
on a human is Workflows' job, and the two compose
([run workflows](https://developers.cloudflare.com/agents/runtime/execution/run-workflows/)).
The Workflows pack under `cloud-service/` carries that side.

**Not a chat product.** The SDK carries chat primitives; what the product is
remains the blueprint's decision. And it decides no model, no gateway and no
retrieval story — those are the AI service pins on the backing axis.

## What a project pins beside it

This is a **project-axis** component, so it says what the code is, never where
it runs or what it talks to. A project pinning
`typescript-cloudflare-agents` also pins `cloudflare-workers-ssr` on its
deploy axis — the Worker that exports the class and carries its configuration
— and `cloudflare-durable-objects` on its backing axis, because the object is
what the agent runs as.

Which Cloudflare services this stack offers at all, and the account, billing
and local-development facts that span every one of them, are the
`cloud-provider/cloudflare` component's conventions.

Full judgment: the `cloudflare-agents` skill's references.
