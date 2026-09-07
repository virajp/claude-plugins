# Connections

Everything reaches an agent through the Worker's `fetch` handler. There are two
ways in, and they are not interchangeable.

## Server-side: a stub, by name

Worker code that already knows which agent it wants takes a stub and calls
methods on it directly
([routing](https://developers.cloudflare.com/agents/runtime/communication/routing/)):

```ts
import { getAgentByName } from "agents";

const counter = await getAgentByName(env.CounterAgent, "shared-counter");
const next = await counter.increment();
```

This is Durable Object RPC. It needs no decorator, no WebSocket and no
serialization beyond what RPC already does, and it is the right shape for
Worker-to-agent and agent-to-agent calls
([callable methods](https://developers.cloudflare.com/agents/runtime/lifecycle/callable-methods/)).

## Client-side: routed, and explicitly exposed

A browser reaches an agent through `routeAgentRequest`, which the Worker's
fetch handler delegates to and which returns nothing when the path is not an
agent path — so the handler falls through to its own routes:

```ts
export default {
  async fetch(request: Request, env: Env) {
    return (await routeAgentRequest(request, env))
      ?? new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

Methods a client may invoke must be marked `@callable`; anything not marked is
not reachable from a client, which is the boundary doing its job rather than an
inconvenience. Arguments and return values must be JSON-serializable —
functions, `Date`, `Map` and `Set` are not
([callable methods](https://developers.cloudflare.com/agents/runtime/lifecycle/callable-methods/)).

**The rule that follows: `@callable` is the public surface.** Do not decorate a
method because a test or another Worker calls it — those take a stub. Every
decorator added is one more entry point to authorize and to validate input on.

## Authenticate at the connection, not in the agent

`routeAgentRequest` takes `onBeforeConnect` and `onBeforeRequest` hooks that
run before the agent wakes. Returning a `Response` from either rejects the
caller; returning nothing admits it
([routing](https://developers.cloudflare.com/agents/runtime/communication/routing/)).

```ts
await routeAgentRequest(request, env, {
  onBeforeConnect: async (request) => {
    const token = new URL(request.url).searchParams.get("token");
    if (!(await verifyToken(token, env))) {
      return new Response("Unauthorized", { status: 401 });
    }
  },
});
```

Two consequences worth stating plainly. **A WebSocket carries no headers after
the handshake**, so the credential arrives on the upgrade request — as a query
parameter in Cloudflare's own example — and is therefore in whatever logs the
URL. Prefer a short-lived, single-purpose token minted for the connection over
the session credential itself. And **authorization is per agent name**: the
hook sees the URL, so it is the place that decides whether this caller may
address *that* instance. An authenticated caller reaching an arbitrary name is
the failure mode this design invites, and the check has to be written.

Who issues the token is the identity pin's business, not this component's.

## The client SDK

The SDK ships a browser client and, for React, `agents/react`'s `useAgent`,
which opens the connection, exposes `agent.stub` for the callable methods and
delivers state changes through an update callback
([client SDK](https://developers.cloudflare.com/agents/communication-channels/chat/client-sdk/)).

```tsx
const agent = useAgent<CounterAgent, CounterState>({
  agent: "CounterAgent",
  name: "shared-counter",
  onStateUpdate: (state) => setCount(state.count),
});
```

The hook is **named here as one client option**, not as a UI decision: this
plugin ships no React framework component, and nothing in this pack says a
project's front end is React. A non-React client uses the vanilla client class;
a server-to-server caller uses a stub and needs neither.

**State arrives; it is not fetched.** A client that polls a callable method for
the current picture has reimplemented, worse, what `setState` already
broadcasts. Poll only for what lives in SQL.

## Long work does not belong on the connection

A connection is not a job runner. Work that outlives a turn goes to a schedule
(the scheduling reference) or to a Workflow, and the connection carries the
progress rather than the work — Cloudflare draws the line at roughly thirty
seconds and at anything needing retries or a human
([run workflows](https://developers.cloudflare.com/agents/runtime/execution/run-workflows/)).

Signatures for every symbol named here are Context7's at use time.
