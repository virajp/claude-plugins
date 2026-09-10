---
name: TypeScript · Cloudflare Agents
axis: project
kind: language-bundle
components:
- language/typescript@0.1.0
- package-manager/pnpm@0.1.0
- toolchain-gate/tsconfig@0.1.0
- toolchain-gate/eslint@0.1.0
- framework/cloudflare-agents@0.1.0
platforms:
- service
---

# service — TypeScript · Cloudflare Agents

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

Five components, and the first four are the TypeScript baseline every project
of this language gets: the language itself, the package manager, and the two
toolchain gates — the compiler config and the lint config. The fifth is the
framework, `framework/cloudflare-agents`, which is the only part of this
bundle that is about agents at all.

That split is deliberate and is what the language-bundle kind is for. The
baseline's rules — `strict`, one mapping home for errors, config read once at
the composition root, Vitest as the runner — apply unchanged; the framework
component layers on top and replaces none of them. A future major version of
the SDK regenerates one component and leaves the baseline alone.

**What a project pinning this gets** is doctrine, not a scaffold: how to shape
the agent class and what belongs in its state versus its SQL; the Wrangler
declaration the class cannot run without, and what renaming or removing that
class costs; how requests are routed in and where a caller is authenticated;
how scheduled work is made idempotent when the start hook runs on every wake;
and what the test levels are once the runtime under test is Workers rather
than Node. It ships no configuration file — language-bundle packs do not.

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
about the whole project's test setup, not about one file.

It decides nothing about the model, the gateway or the retrieval store. An
agent that calls Workers AI reads a binding like any Worker, and which AI
services the project uses are backing-axis pins with their own bundles.
