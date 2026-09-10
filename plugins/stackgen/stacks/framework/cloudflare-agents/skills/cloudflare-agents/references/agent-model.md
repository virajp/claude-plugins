# The Agent class

**This doctrine applies only where the codebase depends on `agents`.** In a
Worker without it, do not introduce the SDK to get a Durable Object: a plain
`DurableObject` subclass is the smaller thing, and the
`cloud-service/durable-objects` component covers it. Reach for the SDK when the
object needs the things it adds — broadcast state, a client that connects, and
scheduling with a table behind it.

## One class per addressable kind, one instance per thing

The class is the type; the name picks the instance. `getAgentByName(namespace,
name)` resolves a stub for a name, and every distinct name is its own agent
with its own state and its own SQLite database
([agent class](https://developers.cloudflare.com/agents/runtime/lifecycle/agent-class/)).

So the name is a design decision, not an identifier: it is the key the data
behind it is filed under, and reusing one for a different thing merges two
lifetimes into one object. Derive it from something the product already owns —
a conversation id, a tenant id, a room slug — and never from something that can
change while the data stays.

A class that answers two unrelated responsibilities gets one hibernation
schedule, one storage bill and one single-threaded queue for both. Split it.

## Two stores, two jobs

An agent has `state` and it has SQL, and choosing wrongly between them is the
most common structural mistake in an agent codebase
([state](https://developers.cloudflare.com/agents/runtime/lifecycle/state/)).

| Store | Is | Use it for |
| --- | --- | --- |
| `this.state` / `this.setState()` | a JSON-serializable object, persisted **and** broadcast to every connected client | the current picture a client renders — status, counters, who is present |
| `this.sql` | an embedded SQLite database, queried with a tagged template | rows: history, logs, work queues, anything unbounded or filtered |

`setState` replaces the whole object, so a partial update spreads the previous
one. It also triggers the state-changed hook and pushes to connections — which
means a high-frequency write to state is a high-frequency broadcast, and
belongs in SQL with a periodic state summary instead.

`this.sql` is a tagged template and interpolations are parameters, never string
concatenation. Create tables idempotently (`CREATE TABLE IF NOT EXISTS`) in the
start hook, because a fresh instance is created for every new name.

## Hibernation is the reason state exists

An agent wakes on a request or a scheduled task, runs, goes idle for roughly
two minutes, then hibernates; eviction on crash or redeploy can happen at any
point
([lifecycle](https://developers.cloudflare.com/agents/runtime/lifecycle/state/)).

**A plain class property does not survive this.** It survives the request that
set it and usually the next one, which is exactly why the bug reaches
production: local testing never idles long enough. Anything that must outlive a
turn goes in `state` or in SQL. An in-memory field is legitimate only as a
cache rebuilt in the start hook from one of those two.

```ts
export class RoomAgent extends Agent<Env, RoomState> {
  initialState = { participants: [], status: "idle" };

  async onStart() {
    this.sql`CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, at INTEGER)`;
  }
}
```

## Lifecycle hooks

The hooks are `onStart`, `onRequest`, `onConnect`, `onMessage`, `onClose` and
`onError`
([websockets](https://developers.cloudflare.com/agents/runtime/communication/websockets/)).

`onStart` runs **once per wake**, before any connection is accepted — so it is
the place to create tables and rebuild caches, and it is emphatically not the
place to do anything that must happen once per agent. It will run again after
every hibernation, and a schedule or a side effect created there without
idempotency accumulates one copy per wake (see the scheduling reference).

`onRequest` handles HTTP that is not a WebSocket upgrade. The connection hooks
are the connections reference's.

## The error boundary

The baseline's one-mapping-home rule holds: an agent method that fails should
fail with the project's own error type and be mapped once, at the edge — in
`onRequest`, or in the callable method the client invoked. A throw that escapes
a WebSocket message handler reaches `onError` with no client waiting on it, so
the client sees a silence rather than a failure unless the handler answers.

## What the class does not decide

The model, the gateway, the retrieval store and the vector index — those are
backing-axis pins with their own components. The Worker that exports this class
and the file that declares it — the deploy pin's. Whether the work belongs in
an agent at all rather than in a Workflow — Cloudflare's own line is durable
execution, and it is drawn in this component's conventions.
