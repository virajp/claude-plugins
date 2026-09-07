# Testing

The runner is the TypeScript baseline's — Vitest — and the assertions are
ordinary. What changes is **where the code runs**: an agent is a Durable
Object, so it needs the Workers runtime, not Node. That is what
`@cloudflare/vitest-plugin` provides, installed as a dev dependency beside
Vitest itself and configured from the project's own Wrangler file so the test
environment has the same bindings the deploy does
([testing your agent](https://developers.cloudflare.com/agents/getting-started/testing-your-agent/)).
That is the current name: it replaces `@cloudflare/vitest-pool-workers`, whose
API and configuration were identical, so a project still on the old name
migrates by codemod
([migrate to Vitest plugin](https://developers.cloudflare.com/workers/testing/vitest-integration/migration-guides/migrate-to-vitest-plugin/)).
The `cloudflareTest` plugin the config below adds is that package's own export
([Vitest integration configuration](https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/)):

```ts
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [cloudflareTest({ wrangler: { configPath: "./wrangler.jsonc" } })],
});
```

Pinning the config file rather than duplicating bindings is the point: a
binding added for a feature is present in tests without a second edit, and a
class declared for the deploy is the class under test.

## Three levels, and what each is for

**In-process, through the Worker.** The default and the one to write most of.
A `Request` goes into the Worker's fetch handler, `routeAgentRequest` resolves
the agent, and the response is asserted — so routing, the binding and the
class are all exercised, in the runtime, with no server running:

```ts
import { env } from "cloudflare:workers";
import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import worker from "../src";

it("responds with state", async () => {
  const ctx = createExecutionContext();
  const res = await worker.fetch(
    new Request("http://example.com/agents/my-agent/agent-123"),
    env,
    ctx,
  );
  await waitOnExecutionContext(ctx);
  expect(await res.json()).toEqual({ hello: "from your agent" });
});
```

The URL shape is `routeAgentRequest`'s — `/agents/:agent/:name` — so a test
that invents a path tests nothing but the fallthrough.

**Through a stub.** Where the behaviour under test is a method rather than a
route, take the agent by name and call it directly, as server code does. This
is the level for state transitions and SQL: cheaper than a request, and it
skips the routing that another test already covers.

**Against `wrangler dev`.** The local server runs the class on the laptop and
persists its storage between runs
([testing your agent](https://developers.cloudflare.com/agents/getting-started/testing-your-agent/)).
Keep it for what the in-process levels cannot reach — a real WebSocket
handshake, a browser client, an end-to-end path — and not for the bulk of the
suite, which does not need a port.

## Names are test fixtures

Every test that addresses an agent picks a name, and that name is an instance
with storage. **Use a fresh name per test** — derived from the test's own name
or a counter — unless the test is specifically about state surviving between
calls. Two tests sharing a name share a database, and the second one passes or
fails depending on the order the first ran in.

The same fact bites the local server harder: **`wrangler dev` persists storage
across runs**, so an agent left in a bad state by yesterday's session is still
in it today. Clearing the local state directory is part of debugging a local
failure that reproduces nowhere else.

## What is worth testing, and what is not

- **Test the state machine.** What `setState` leaves behind after a sequence of
  calls is the agent's contract with its clients, and it is cheap to assert.
- **Test the SQL you wrote**, not the database. Schema creation in the start
  hook, and any query with a filter in it.
- **Test scheduling by its effect, not its timing.** Assert that the schedule
  was recorded and that calling the handler twice is harmless — the second
  half is the idempotency the scheduling reference demands, and it is the part
  that actually breaks. Waiting on wall-clock time in a test is a flake.
- **Test the authorization hooks.** `onBeforeConnect` and `onBeforeRequest` are
  the boundary; a test that a wrong token is refused, and that a valid token
  cannot address another instance's name, is worth more than any assertion
  inside the class.
- **Do not test hibernation.** It is not addressable from a test. What is
  testable is the invariant it exists to enforce: that nothing the agent needs
  is held only in a class property — which is a review question, and a start
  hook that rebuilds from storage is the evidence.
- **Do not test the SDK.** `getAgentByName` resolving, or `@callable` being
  reachable, is Cloudflare's code.

Coverage stance is the language baseline's; the SDK changes nothing about it.
