# Decision — the Cloudflare Agents SDK ships as a framework pack with its own language bundle

**Date** 2026-09-06 · **Branch** `2026-09-06-cloudflare-ai` · **Plan**
[`docs/plans/2026-09-06-cloudflare-ai/`](../../plans/2026-09-06-cloudflare-ai/index.md)
· **Adds** the first pack in the `framework` category `agent-sdk` minted by
[`2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md`](./2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md)

## What was decided before

Twenty Cloudflare developer-platform services were chosen from a brief and split
across four chained plans. Nineteen of them are **services with a binding**: a
key in the project's root `wrangler.jsonc`, a handle on `env`, and a bill. Every
one of those takes the same shape here — a `cloud-service` pack carrying the
five service topics, and a `cloudflare-<slug>` bundle on the `backing` axis
composing the provider component with it.

Two other facts were already settled and are what this decision turns on.
**Framework packs** are `type: framework`, `kind: language-bundle`, project-axis
and `harness: n/a`, with topic-driven references rather than the five service
topics — `framework/effect` and `framework/astro` are the two that existed. And
a framework pack **reaches a project only inside a project-axis language
bundle**: the menu lists bundles, never bare components, so a pack no bundle
names is authored and unreachable. That is not a hypothetical — it is the
standing gap in
[`2026-09-01-python-packs-authored-but-unreachable.md`](../gaps/2026-09-01-python-packs-authored-but-unreachable.md),
where `language/python` and `package-manager/uv` exist and nothing can
materialize them.

## What changed

**The Agents SDK is the one of the twenty that is not a service.** It is the
`agents` npm package: an `Agent` class that compiles to a Durable Object,
carrying its own state, SQL storage, scheduling and WebSocket connections,
declared in the hosting Worker's `wrangler.jsonc` as a `durable_objects` binding
plus a `migrations` entry. There is no `agents:` key to add and no meter of its
own — a project pays for the Durable Object it becomes. Shaped as a
`cloud-service` pack it would have four of its five mandated topics empty and a
fifth restating Durable Objects.

**So it ships as `framework/cloudflare-agents`** — category `agent-sdk`, and
otherwise the pack shape above, `kind: language-bundle` on the project axis with
`harness: n/a` — the third framework pack, in the `effect`/`astro` shape. Its
references are topic-driven, not the service five, and its router skill is
paths-scoped and `user-invocable: false`, opening on the "layers on the
TypeScript baseline" sentence both siblings use; its path globs add
`**/wrangler.jsonc` and `**/wrangler.toml` to the TypeScript ones, because the
agent's binding and migration live there. The slug carries the vendor because
`agents` alone is a generic noun.

**And it ships with `typescript-cloudflare-agents`, a project-axis language
bundle**, so it is pinnable rather than merely authored. Its components are
exactly `typescript-effect-hono`'s with both framework refs replaced by
`framework/cloudflare-agents@0.1.0`: `language/typescript`,
`package-manager/pnpm`, `toolchain-gate/tsconfig`, `toolchain-gate/eslint`,
`framework/cloudflare-agents`. `platforms: [service]` — `service` here means an
agent.

**The bundle states its pairings in prose and adds neither as a component.** It
pairs with `cloudflare-workers-ssr` on the **deploy** axis, the Worker the agent
class is exported from (or `cloudflare-containers` where the project's compute
is an image beside that Worker), and with `cloudflare-durable-objects` on the
**backing** axis, the object the agent *is*, whose judgment about instance
names, alarms, hibernation and the irreversibility of deleting a class the
framework component cites rather than restates. Both are pins the project makes
on those axes: the axes are lists, and a language bundle that folded a deploy
target into itself would answer, for every agent project, a question the deploy
axis exists to ask.

## Rejected

- **A framework pack with no bundle.** The pack would be correct and nothing
  would be able to pin it — the menu offers bundles, so a component no bundle
  names is invisible to a user. This is exactly the python-packs gap, and
  repeating it knowingly is worse than the first time, when the pack existed
  only to hold a payload a retirement needed a destination for.
- **Parking the Agents SDK.** It was one of the twenty the user chose, and the
  only reason to park it was that it did not fit the `cloud-service` shape the
  other nineteen do. The shape was the wrong thing to preserve.
- **A `cloud-service` pack with the five service topics forced onto it.** The
  five topics — pick-and-trade, service doctrine, cost, identity, local dev —
  assume a managed service with an account, a grant and a meter. An npm package
  has none of the three, so four of the five would be written to fill a slot,
  and `plugins:check`'s topic bar would pass on prose that says nothing.

## Consequences

- **The `agent-sdk` framework category has its first pack.** Plan A minted it
  with the rest of the twenty services' categories, once for the whole developer
  platform rather than per landing, so nothing in `assets/taxonomy.md` changed
  here. It stays without a vwf capability token: minting one is vwf's move.
- **The third framework pack changes a hand-typed count.**
  `site/src/content/docs/plugins/stackgen.md` said "two framework packs ship
  today" and now says three. The pack and bundle **counts** are generated into
  `plugins/stackgen/stacks/inventory.md` and typed nowhere; this sentence names
  the packs rather than counting them, which is why it needed an edit at all.
- **The deploy shape is parked, deliberately.** An agent's Worker is deployed by
  the `cloudflare-workers-ssr` pack, whose `wrangler.jsonc` payload knows
  nothing about `durable_objects` migrations. Whether that template should carry
  a commented `durable_objects` + `migrations` block is a `workers-ssr`
  question, not this plan's, and it is the **"a `cloudflare-agents` deploy
  shape"** entry parked by
  [`docs/plans/2026-09-06-cloudflare-ai/`](../../plans/2026-09-06-cloudflare-ai/index.md).
  Until it is answered, a project on this bundle reads the pairing prose and
  adds the two entries by hand.
- **`framework/react` is a little more pressing.** The Agents SDK ships client
  hooks, and the framework pack mentions them as a client option rather than as
  a pack. It stays parked, carried from the Astro plan.
- **The pack tree is the live statement of the rule.**
  `plugins/stackgen/stacks/bundles/typescript-cloudflare-agents.md` and
  `plugins/stackgen/stacks/framework/cloudflare-agents/conventions.md` each
  carry it in their own words; this doc is the record of why. When they
  disagree, the pack is right and this doc is history.
