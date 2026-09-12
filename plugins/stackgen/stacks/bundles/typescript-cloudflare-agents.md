---
name: TypeScript · Cloudflare Agents · Effect
axis: project
kind: language-bundle
components:
- language/typescript@0.1.0
- package-manager/pnpm@0.2.0
- toolchain-gate/tsconfig@0.1.0
- toolchain-gate/eslint@0.2.0
- framework/effect@0.1.0
- framework/cloudflare-agents@0.1.0
platforms:
- service
---

# service — TypeScript · Cloudflare Agents · Effect

`service` here is an **agent**: a TypeScript project whose unit of design is
an addressable, stateful object that persists what it knows, schedules its own
work, and holds live connections to the clients talking to it. Pick it when the
product's shape is one long-lived thing per conversation, per room, per tenant
or per job — and not when the product is a stateless API that happens to call a
model, which is an ordinary Worker service with an AI pin beside it.

This doc covers the **project axis** only: language, framework, layout,
testing. Where the agent runs is the **deploy** axis; what it talks to is the
**backing** axis.

## The composition

Six components, and the first four are the TypeScript baseline every project
of this language gets: the language itself, the package manager, and the two
toolchain gates — the compiler config and the lint config. The fifth is
`framework/effect`, the composition and error model the rest of a TypeScript
workspace on `typescript-effect` already runs. The sixth is the framework,
`framework/cloudflare-agents`, which is the only part of this bundle that is
about agents at all.

That split is deliberate and is what the language-bundle kind is for. The
baseline's rules — `strict`, one mapping home for errors, config read once at
the composition root, Vitest as the runner — apply unchanged; both framework
components layer on top and replace none of them. A future major version of
the SDK regenerates one component and leaves the baseline and Effect alone.

**What a project pinning this gets** is doctrine, not a scaffold: how to shape
the agent class and what belongs in its state versus its SQL; the Wrangler
declaration the class cannot run without, and what renaming or removing that
class costs; how requests are routed in and where a caller is authenticated;
how scheduled work is made idempotent when the start hook runs on every wake;
and what the test levels are once the runtime under test is Workers rather
than Node. It ships no configuration file — language-bundle packs do not.

## Effect inside the Agent

The SDK, not Effect, owns the composition root and the lifecycle: dependencies
arrive as bindings on `env` and as `this.sql`, `this.state` and
`this.schedule`, and Cloudflare decides when the instance wakes and sleeps. So
Effect is used here for what the SDK does not give — the typed error channel,
`Schedule` around a model or gateway call, `Config` + `Schema` over `env`, and
OpenTelemetry — and its runtime doctrine bends to the class in three places.

- **One `ManagedRuntime` per instance, built in `onStart`.** A plain class
  property does not survive hibernation, and `onStart` runs once per wake, so
  the runtime is the one in-memory field the agent-model reference allows: a
  cache rebuilt from nothing every time. A module-level runtime would outlive
  the instance and cannot capture it, which the next rule needs.
- **The SDK's stores become services built from `this`.** `this.sql`,
  `this.state`/`setState` and `this.schedule` are instance-bound, so the
  `AppLayer` wraps them as services whose layer is constructed in `onStart`
  with the instance captured — `Layer.succeed` over the class, merged with
  the workspace's common layers. Handlers stay Effect programs; the hook is
  the edge that calls `runtime.runPromise`, and the error boundary is the
  agent-model reference's — squash the `Cause` at that edge and map it once
  to the project's own error type.
- **`dispose()` never runs.** Hibernation has no stop hook, so no layer
  finalizer will ever fire. The `AppLayer` owns nothing that needs releasing —
  an `acquireRelease` in it is a defect — and a per-call resource is scoped
  inside the method with `Effect.scoped` instead.

Layers are cheap to rebuild on this shape because they hold no connections;
what they hold is `this`. Test the services with `@effect/vitest` in Node, and
the class through the Workers runtime the pack's testing reference names.

## What it pairs with

**It pairs with `cloudflare-workers-ssr` on the deploy axis.** An agent class
is exported from a Worker script and declared in that Worker's
`wrangler.jsonc`, which is the deploy pin's file. Nothing in this bundle owns
it. A project on this bundle with no Workers pin has a class with nowhere to be
exported from — and `cloudflare-containers` takes that place instead where the
project's compute is an image running beside the Worker.

**It pairs with `cloudflare-durable-objects` on the backing axis.** The agent
*is* a Durable Object, so the object's own judgment — one responsibility per
class, the instance name as a contract with the data behind it, alarms,
hibernation, what the bill meters, and the irreversibility of deleting a class
— comes from that pin, and the framework component cites it rather than
restating it.

Both are **pins the project makes on those axes**, not components of this
bundle. The axes are lists and each one is the project's own choice; a language
bundle that folded a deploy target into itself would decide, for every agent
project, a question the deploy axis exists to ask.

## What this bundle decides that no component decides alone

That an agent is a **project**, not a capability bolted onto one. The state,
the storage, the schedule and the connection all live in the same class, so the
codebase is organized around that class rather than around routes — and the
tests run inside the Workers runtime rather than in Node, which is a decision
about the whole project's test setup, not about one file. And that Effect runs
inside that class on the SDK's terms — rebuilt per wake, holding `this`,
never disposed — rather than the class being rewritten around a runtime.

It decides nothing about the model, the gateway or the retrieval store. An
agent that calls Workers AI reads a binding like any Worker, and which AI
services the project uses are backing-axis pins with their own bundles.
