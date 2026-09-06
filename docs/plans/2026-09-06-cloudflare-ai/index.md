---
type: repo-plan
title: Cloudflare AI — Workers AI, AI Gateway, AI Search, Browser Rendering,
  and the Agents SDK as a framework
requires:
  - docs/plans/2026-09-06-cloudflare-storage-and-data
  - docs/plans/2026-09-06-cloudflare-compute-and-orchestration
---

# Plan — Cloudflare AI (2026-09-06)

Plan **C of four**. It stands on A
(`docs/plans/2026-09-06-cloudflare-storage-and-data`, which minted every
category token and narrowed the provider's scope) and on B
(`docs/plans/2026-09-06-cloudflare-compute-and-orchestration`, which ships
Durable Objects — the Agents SDK compiles to one, and its bundle prose names the
`cloudflare-durable-objects` pin). D
(`docs/plans/2026-09-06-cloudflare-media-messaging-secrets`) is independent of
this plan. This plan touches nothing under `plugins/stackgen/assets/`.

## Status

**APPROVED** — 2026-09-07 by the user, at the shape gate, after the self-review.
Not yet run; halts at preflight until every `requires:` plan reads COMPLETE.

## Consent

| Action                                       | Granted                                                    |
| -------------------------------------------- | ---------------------------------------------------------- |
| Merge to `develop` and push on green run     | yes                                                        |
| Stage locally (`plugins:local`) on green run | yes                                                        |
| Release `vwf` publicly                       | none                                                       |
| Release `stackgen` publicly                  | none (minor bump recorded — see the version rule — no tag) |
| Release installer publicly                   | none                                                       |
| Release site publicly                        | none                                                       |

**A release is two stages.** The local one — `mise run plugins:local` — stages
the changed plugins into the dev marketplace and updates this machine's install;
it publishes nothing, so execute-plan runs it without a further prompt and only
reports what it staged. The public one is the tags, and it is what the release
rows above are about: they are intent, and execute-plan stops once before the
`main` merge and the tags and asks, per `CLAUDE.md`. A staged plugin loads only
in a **restarted** session. The user's answer for stackgen was "not this time":
the version still climbs one minor so the dev marketplace stages it, but no
`stackgen-v*` tag is cut by this plan.

**The version rule.** Plans B and D may land in either order relative to each
other, so this plan does not hardcode its number: the gates unit bumps the
**minor from whatever `plugin.json` reads at run time**. In order (A → B → C)
that is `1.4.0` → `1.5.0`; the inventory header then reads **58 packs, 54
bundles, 12 kinds** — five packs (four `cloud-service`, one `framework`) and
five bundles (four cloud bundles, one language bundle) more than whatever the
committed header reads at run time.

## Goal

After this lands, four Cloudflare AI services — Workers AI, AI Gateway, AI
Search (formerly AutoRAG) and Browser Rendering — are shipped `cloud-service`
packs under `plugins/stackgen/stacks/cloud-service/`, each reachable from the
stack menu as its own backing-axis bundle `cloudflare-<slug>`; and the **Agents
SDK** ships as a `framework` pack, `framework/cloudflare-agents`, reachable
through a project-axis language bundle `typescript-cloudflare-agents`, so a
project that is an agent is pinnable from the menu rather than authored and
unreachable. The Cloudflare provider pack's scope prose names these as shipped.

The framing is plan A's (recalled there in full): the user asked for all
Cloudflare developer platform services, chose twenty from a brief, and chose
four chained plans. The AI domain is the third. The Agents SDK is the one of the
twenty that is not a service with a binding — it is an npm framework on Durable
Objects — so it takes the framework-pack shape; the user picked "Framework
pack + language bundle" over "Framework pack only, no bundle" (which would
repeat the python-packs gap: authored, reachable by nobody) and over "Park it".

No reversal. Plan A retired Pages and Stream and dissolved the reservation list;
this plan narrows the provider's "planned" list further and reverses nothing.

## Facts the survey established

**This repo, as plan A's survey found it and as A and B leave it.**

- Plan A's facts section is authoritative for the pack model, the
  `cloud-provider` kind's five service topics
  (`plugins/stackgen/assets/kinds.md:242-252`), the backing-bundle shape
  (`stacks/bundles/cloudflare-zero-trust.md:1-9`, `gcp-cloud-sql.md:1-10`; no
  `artifact:` on a backing bundle, `pack-format.md:204`), the closed category
  vocabulary (`assets/taxonomy.md:94-96`, extended by A), the axes-are-lists
  fact (`plugins/vwf/assets/vwf-config.md:72`, `:75`), and the gates. Read it
  rather than re-deriving.
- After A, `taxonomy.md`'s `cloud-service` line carries `inference`,
  `ai-gateway`, `retrieval`, `browser`, and the `framework` line carries
  `agent-sdk`. None has a vwf capability token (A's D8; the "no capability token
  today" paragraph names them). A pack in one of these categories leaves
  `capability` unset with the comment shape at
  `stacks/cloud-service/zero-trust-access/pack.yaml:7-9`.
- After A, the provider pack's scope prose
  (`cloud-provider/cloudflare/conventions.md`, `skills/cloudflare/SKILL.md`,
  `references/local-development-map.md`) carries three lists — shipped / planned
  / declined — and the six former duplicates in the Workers packs and existing
  bundles are one-sentence pointers to it. Only the provider pack changes when a
  service ships.
- After B, `stacks/cloud-service/durable-objects/` and
  `stacks/bundles/cloudflare-durable-objects.md` exist (category
  `stateful-compute`, backing). The Agents bundle names that pin.
- **Framework packs** (`stacks/framework/effect/`, `stacks/framework/astro/`)
  are `type: framework`, `kind: language-bundle`, `axis: project`,
  `harness: n/a`, each carrying the comment
  `# Topic 2 of the language-bundle
  bar — one artifact per detected framework.`
  (`effect/pack.yaml:8-10`). Their router skills are **paths-scoped** and
  `user-invocable: false` (`effect/skills/effect/SKILL.md:1-15`,
  `astro/skills/astro/SKILL.md:1-16`), and open with "Layers on the TypeScript
  baseline — read that skill's standards first". Their references are
  **topic-driven**, not the five service topics: effect has three (`effect.md`,
  `effect-runtime.md`, `testing.md`), astro has eight (`framework-doctrine.md`,
  per-mode files, `build-output.md`, `content-and-routing.md`, `testing.md`).
  The language-bundle kind is `kinds.md:50-135`: "layout, idioms, testing shape,
  placement. Never API reference (Context7 serves that at use time)"; routers
  paths-scoped (`:74`).
- A framework pack reaches a project only inside a project-axis
  **language-bundle**. The template bundle is
  `stacks/bundles/typescript-effect-hono.md:1-14`: `kind: language-bundle`,
  `axis: project`, components `language/typescript@0.1.0`,
  `package-manager/pnpm@0.1.0`, `toolchain-gate/tsconfig@0.1.0`,
  `toolchain-gate/eslint@0.1.0`, `framework/effect@0.1.0`,
  `framework/hono@generated`, `platforms: [service]`. A `@generated` component
  ref is legal; this plan uses none.
- Docs that enumerate framework packs or Cloudflare rows:
  `site/src/content/docs/plugins/stackgen.md:155` ("**Two framework packs ship
  today**, `effect` and `astro`" — falsified by this plan);
  `site/src/content/docs/how-to/operate/choosing-your-stack.md:43-48` (the
  language-bundle rows) and `:72-78` (the Cloudflare rows, extended by A and B);
  `plugins/stackgen/stacks/readme.md` (the wave narrative — A adds Wave F, B
  Wave G; this plan adds **Wave H**).

**Cloudflare, from Context7 (`/websites/developers_cloudflare`, fallback
`/cloudflare/cloudflare-docs`).** Every unit re-verifies before citing.

- Workers AI is reached through the `ai: {binding}` wrangler binding
  (`env.AI.run(model, input)`) and a REST API. Cloudflare publishes planned
  model deprecations (a 2026-05 changelog entry); model ids churn, so a pack
  states how to pick and how to track deprecations, never a model id as
  doctrine. Local `wrangler dev` is believed to call the remote service and bill
  — verify.
- AI Gateway is reached by **URL** — a gateway endpoint per upstream provider —
  and through the `ai` binding's gateway option; it is not a binding of its own.
  It fronts third-party providers as well as Workers AI: caching, rate limiting,
  logs, fallbacks, stored provider keys (BYOK), authenticated gateways. Verify
  each.
- AI Search was AutoRAG. Context7 shows a binding used as
  `env.AI_SEARCH.get(INSTANCE_ID).search({query})` and
  `.items.uploadAndPoll(key, html, {timeoutMs})`; sources are R2 buckets and
  website crawls (the crawl example uses Browser Rendering's `BROWSER` binding
  with `quickAction("content", …)`). The wrangler key for the binding is to be
  verified by its unit.
- Browser Rendering is reached through the `browser: {binding}` binding
  (Cloudflare's Puppeteer and Playwright forks) and a REST API with endpoints
  such as content, screenshot, pdf, scrape. Session reuse and concurrency limits
  exist; local behaviour to be verified.
- The Agents SDK is the `agents` npm package: an `Agent` class that compiles to
  a Durable Object (state, SQL storage, scheduling, WebSocket connections),
  configured in `wrangler.jsonc` with a `durable_objects.bindings` entry and a
  `migrations` entry for the class; an Email agent example integrates Email
  Service (plan D's). Verify the current API surface.

## Assumed decisions — confirm or override at review

| #   | Decision              | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Rejected                                                                   | Unit  |
| --- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----- |
| D1  | Plan split            | "Four chained plans": this is C, requiring A and B.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | One plan; two plans                                                        | index |
| D2  | Bundle granularity    | (A's D4, verbatim) "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`, components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`, `axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the zero-trust bundle's shape."                                                                                                                                                                                                                                                             | Domain composites; both                                                    | U2–U5 |
| D3  | Config tier           | (A's D5, verbatim) "Backing-service packs ship **no `config/`**; the wrangler binding block a project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to add to the project's own `wrangler.jsonc`." The framework pack ships no `config/` either — language-bundle packs never do.                                                                                                                                                                                                                                   | A wrangler fragment convention                                             | U2–U6 |
| D4  | Contracts             | (A's D6) Cite a contract only where one exists for the pack's category and capability. **None of this plan's five packs cites one** — `inference`, `ai-gateway`, `retrieval`, `browser`, `agent-sdk` have no contract and no token.                                                                                                                                                                                                                                                                                                       | Writing contracts per new category                                         | U2–U6 |
| D5  | `capability:`         | **Unset** with the zero-trust comment shape on all four service packs (A's D8: "Workers AI, AI Gateway, AI Search, Browser Rendering … unset"). The framework pack has no `capability` field at all (framework packs never do — `effect/pack.yaml`).                                                                                                                                                                                                                                                                                      | Stretching `search-index` onto AI Search                                   | U2–U6 |
| D6  | Agents SDK shape      | The user's choice: "Framework pack + language bundle (Recommended) — `framework/cloudflare-agents` (new framework category `agent-sdk`) plus a `typescript-cloudflare-agents` language bundle so it is actually pinnable." Pack: `type: framework`, `category: agent-sdk`, `kind: language-bundle`, `axis: project`, `harness: n/a`. Bundle: `kind: language-bundle`, `axis: project`, `platforms: [service]`, components exactly those of `typescript-effect-hono` with both frameworks replaced by `framework/cloudflare-agents@0.1.0`. | "Framework pack only, no bundle" (repeats the python-packs gap); "Park it" | U6    |
| D7  | Agents references     | Topic-driven, as `framework/effect` and `framework/astro` lay theirs out — **not** the five service topics. Expected set: the Agent class model and state; the Durable Object it compiles to and the `wrangler.jsonc` binding + migration; client connection and WebSocket patterns; scheduling; testing. The unit may merge or split by what Context7 shows, recording the final set as `DECIDED:`.                                                                                                                                      | Forcing the cloud-service five onto a framework                            | U6    |
| D8  | Agents router         | Paths-scoped and `user-invocable: false`, in the effect/astro frontmatter shape; opens with the "Layers on the TypeScript baseline" sentence. Paths: the TypeScript globs plus `**/wrangler.jsonc` and `**/wrangler.toml` (the agent's binding and migration live there) — the unit confirms the astro precedent of adding config-file globs.                                                                                                                                                                                             | A model-invocable router as the cloud-service packs use                    | U6    |
| D9  | Agents bundle pairing | The bundle prose states it pairs with `cloudflare-workers-ssr` on the deploy axis (the Worker that hosts the agent) and `cloudflare-durable-objects` on the backing axis (B's pack; the object the agent is). It does not add those components to its own `components:` list — axes are lists and the project pins them.                                                                                                                                                                                                                  | Folding the deploy and backing pins into the language bundle               | U6    |
| D10 | Provider narrowing    | (A's D9 carried forward) One unit rewrites the provider pack's three lists: shipped = every Cloudflare `cloud-service` pack on disk at run time plus this plan's four, **plus** the Agents SDK named as a framework pack rather than a service; planned = the remainder of the twenty, derived from disk; declined unchanged. Four local-development-map rows.                                                                                                                                                                            | Each pack unit editing the provider                                        | U1    |
| D11 | Skill naming          | (A's D11) Service packs' router skill directory and `name:` are `cloudflare-<slug>`: `cloudflare-workers-ai`, `cloudflare-ai-gateway`, `cloudflare-ai-search`, `cloudflare-browser-rendering`. Pack directories bare: `workers-ai`, `ai-gateway`, `ai-search`, `browser-rendering`. The framework pack's skill is `cloudflare-agents` (pack directory `cloudflare-agents` — a framework slug carries the vendor because `agents` alone is a generic noun).                                                                                | Bare skill names                                                           | U2–U6 |
| D12 | Reference files       | (A's D12) Service packs: exactly five, named `pick-and-trade.md`, `service-doctrine.md`, `cost-shape.md`, `identity-shape.md`, `local-dev.md`. The framework pack: per D7.                                                                                                                                                                                                                                                                                                                                                                | Topic-free names; extra files                                              | U2–U6 |
| D13 | Research sourcing     | (A's D13, verbatim) "Every Cloudflare fact in a pack is verified against Context7 `/websites/developers_cloudflare` (falling back to `/cloudflare/cloudflare-docs`) at authoring time and cited by URL in the reference that states it. No fact from memory." For the Agents SDK, also the `agents` package docs if Context7 resolves them.                                                                                                                                                                                               | Trusting this plan's facts section                                         | U2–U6 |
| D14 | Harness block         | (A's D14) Service packs: `harness:` with `health`, `e2e_staging`, `local_stack`, each `task: n/a` with honest mechanism prose. Framework pack: `harness: n/a` as effect and astro carry it.                                                                                                                                                                                                                                                                                                                                               | Naming a task the pack does not ship                                       | U2–U6 |
| D15 | Credentials           | (A's D15) Cite the provider pack's identity-and-iam reference; state only the per-service token permission. AI Gateway's stored upstream-provider keys are a **secret the provider's secrets doctrine governs** — the pack points at that doctrine, not at plan D's Secrets Store pack. The framework pack has no credentials topic.                                                                                                                                                                                                      | Restating the credential rule; naming plan D's pack                        | U2–U5 |
| D16 | Model ids             | No Workers AI model id is written as doctrine anywhere in this plan's packs. A reference may quote a model id **as a cited example from Cloudflare's own docs**, marked as such, next to the sentence on tracking deprecations.                                                                                                                                                                                                                                                                                                           | A recommended-models table                                                 | U2    |
| D17 | Versions              | Every new pack and bundle is `0.1.0`; stackgen bumps one **minor** from its run-time value (expected `1.4.0` → `1.5.0`), untagged.                                                                                                                                                                                                                                                                                                                                                                                                        | Patch; a hardcoded number                                                  | U8    |
| D18 | Model                 | `opus` on every unit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `inherit`                                                                  | all   |
| D19 | Waves                 | Provider prose first (wave 1), the five pack units concurrently (wave 2), docs, gates.                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Packs in wave 1                                                            | index |

## New dependencies

None. Packs are YAML and Markdown; no unit adds a package.

## Units

| Id | Wave | Unit file                                                    | Owns                                                                                                                                                                                                                    | Depends on | Status  | Commit |
| -- | ---- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-provider-narrowing.md](01-provider-narrowing.md)         | `plugins/stackgen/stacks/cloud-provider/cloudflare/**`                                                                                                                                                                  | —          | pending |        |
| U2 | 2    | [02-workers-ai-pack.md](02-workers-ai-pack.md)               | `plugins/stackgen/stacks/cloud-service/workers-ai/**`, `plugins/stackgen/stacks/bundles/cloudflare-workers-ai.md`                                                                                                       | U1         | pending |        |
| U3 | 2    | [03-ai-gateway-pack.md](03-ai-gateway-pack.md)               | `plugins/stackgen/stacks/cloud-service/ai-gateway/**`, `plugins/stackgen/stacks/bundles/cloudflare-ai-gateway.md`                                                                                                       | U1         | pending |        |
| U4 | 2    | [04-ai-search-pack.md](04-ai-search-pack.md)                 | `plugins/stackgen/stacks/cloud-service/ai-search/**`, `plugins/stackgen/stacks/bundles/cloudflare-ai-search.md`                                                                                                         | U1         | pending |        |
| U5 | 2    | [05-browser-rendering-pack.md](05-browser-rendering-pack.md) | `plugins/stackgen/stacks/cloud-service/browser-rendering/**`, `plugins/stackgen/stacks/bundles/cloudflare-browser-rendering.md`                                                                                         | U1         | pending |        |
| U6 | 2    | [06-agents-sdk.md](06-agents-sdk.md)                         | `plugins/stackgen/stacks/framework/cloudflare-agents/**`, `plugins/stackgen/stacks/bundles/typescript-cloudflare-agents.md`                                                                                             | U1         | pending |        |
| U7 | 3    | [07-docs.md](07-docs.md)                                     | `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `plugins/stackgen/stacks/readme.md`, `docs/memory/decisions/2026-09-06-agents-sdk-is-a-framework-pack.md` | U1–U6      | pending |        |
| U8 | 4    | [08-gates-and-bump.md](08-gates-and-bump.md)                 | `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                                                | U7         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                                                           | Why it collides                                                                               | Owner   |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------- |
| `plugins/stackgen/.claude-plugin/plugin.json`                                                                                  | several units bumping one version is a lost update                                            | U8 only |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                      | generated; regenerating mid-wave races                                                        | U8 only |
| `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `docs/memory/**` | n units editing one doc                                                                       | U7 only |
| `plugins/stackgen/stacks/readme.md`                                                                                            | the wave narrative every pack would want a line in                                            | U7 only |
| `plugins/stackgen/stacks/cloud-provider/cloudflare/**`                                                                         | five packs would each want the scope prose and the local-dev map                              | U1 only |
| `plugins/stackgen/assets/**` (taxonomy, kinds, pack-format, contracts)                                                         | plan A minted every token; nothing here changes them — `UNRESOLVED:` if a unit thinks it must | nobody  |
| `plugins/stackgen/stacks/cloud-service/durable-objects/**`, `stacks/bundles/cloudflare-durable-objects.md`                     | B's; U6 cites the pin by name and edits nothing there                                         | nobody  |
| `plugins/stackgen/stacks/framework/effect/**`, `framework/astro/**`, `stacks/bundles/typescript-*.md` (existing)               | read as templates by U6; never edited                                                         | nobody  |

## Waves

- **Wave 1 — U1.** The provider pack's prose alone; it must exist before a pack
  cites the narrowed scope.
- **Wave 2 — U2–U6.** Five pack units, each owning one new directory (four under
  `cloud-service/`, one under `framework/`) and one new bundle file; nothing
  shared. They cite U1's prose read-only and B's Durable Objects pack by name.
- **Wave 3 — U7.** Docs, after every `DOCS FALSIFIED:` line is in.
- **Wave 4 — U8.** Bump, generate, full gate, target-verifier.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `mise run plugins:shellcheck`,
`pnpm vitest run`, `pnpm exec tsc --noEmit -p installer` and `-p scripts`,
`mise run plugins:npm-normalize-test`, `mise run site:check` from wave 3 on (U7
owns `site/**`), plus the wave review, plus every report read for `UNRESOLVED:`.

The inventory `--check` **will fail after wave 2 until U8 regenerates it** —
expected, recorded as such in the wave-2 gate line, as plans A and B recorded
it; the orchestrator may regenerate it at the wave-2 boundary (its file, not a
unit's; U8 then confirms no diff).

Plan-specific checks, run by the orchestrator after wave 2:

- `ls plugins/stackgen/stacks/cloud-service/{workers-ai,ai-gateway,ai-search,browser-rendering}/skills/cloudflare-*/references/ | grep -c '\.md$'`
  is 20 — five per service pack, names exactly D12's.
- `find plugins/stackgen/stacks/cloud-service/{workers-ai,ai-gateway,ai-search,browser-rendering} plugins/stackgen/stacks/framework/cloudflare-agents -name config`
  is empty (D3).
- `grep -L '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-{workers-ai,ai-gateway,ai-search,browser-rendering}.md`
  lists all four (D2).
- `grep -h '^category:' plugins/stackgen/stacks/cloud-service/{workers-ai,ai-gateway,ai-search,browser-rendering}/pack.yaml plugins/stackgen/stacks/framework/cloudflare-agents/pack.yaml`
  yields exactly `inference`, `ai-gateway`, `retrieval`, `browser`, `agent-sdk`,
  each present on its type's line in `taxonomy.md`.
- `grep -c '^capability:' plugins/stackgen/stacks/cloud-service/{workers-ai,ai-gateway,ai-search,browser-rendering}/pack.yaml`
  is 0 for each (D5).
- `grep -n 'kind: language-bundle' plugins/stackgen/stacks/framework/cloudflare-agents/pack.yaml plugins/stackgen/stacks/bundles/typescript-cloudflare-agents.md`
  hits in both; `grep -c '^platforms:' …/typescript-cloudflare-agents.md` is 1.
- `grep -rn '@cf/' plugins/stackgen/stacks/cloud-service/workers-ai` — every hit
  is inside a sentence or code block marked as a cited example (D16); none is a
  recommendation.

## Gates the orchestrator keeps

- **The menu check**, after wave 2: read `plugins/stackgen/stacks/bundles/` the
  way `stackgen-stack-menu` does. The four `cloudflare-*.md` files parse with
  `name`, `axis: backing`, `kind: cloud-provider` and two resolvable
  `components`; `typescript-cloudflare-agents.md` parses with
  `kind: language-bundle`, `axis: project`, `platforms: [service]` and five
  `components` refs whose `pack.yaml` files exist on disk. Pass = five rows, all
  resolvable. A failure is a wave-2 finding routed to the owning unit.
- **No scratch materialization.** No pack in this plan has a `config/` tier —
  the four service packs by D3, the framework pack because language-bundle packs
  never carry one — so there is nothing for `/vwf:init` to lay down.
- **`target-verifier`** runs inside U8: a hermetic install
  (`CLAUDE_CONFIG_DIR=/tmp/…`) of the bumped stackgen from the dev marketplace
  shows the four `cloud-service` directories, the `framework/cloudflare-agents`
  directory and the five bundle files under the installed plugin's `stacks/`,
  and an uninstall leaves nothing behind. Pass = both.
- **`plugins:local`** after landing, by the orchestrator, per the consent block.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits, never runs `git checkout`/`git restore`/`git stash` or a
formatter `--fix` outside its owned paths.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **Images, Realtime, Email Service, Secrets Store** — plan D. AI Gateway's
  stored provider keys point at the provider's secrets doctrine, never at plan
  D's pack (D15).
- **Durable Objects, Workflows, Containers, Queues** — plan B; this plan cites
  B's Durable Objects pin by name and edits nothing there.
- **An agents example application, a starter template, or a `create-cloudflare`
  scaffold** — a pack carries judgment, never a scaffold.
- **A recommended Workers AI model table** — model ids churn and Cloudflare
  publishes deprecations; D16.
- **A `framework/react` pack** — still parked from the Astro plan; the Agents
  SDK's React hooks are mentioned as a client option in the framework pack, not
  as a pack.
- **Any vwf file** — vwf stays vendor-free; no capability token is minted.
- **Any `plugins/stackgen/assets/` edit** — plan A's.
- **Pages, Workers Sites, Stream, Turnstile, account-level products, Pub/Sub** —
  as plan A recorded.
- **A public stackgen or site release** — consent recorded as "not this time";
  the version still bumps.

## Parked

- Everything plan A parked (the category-validation checker rule, the enumerated
  `artifact:` token list, vwf capability tokens for the new categories, the D1
  migrations overlay, `p:<id>:preview`, Turnstile, composite bundles, the stale
  handoff) stays parked there; not re-listed.
- **A vwf capability token for retrieval / inference.** `retrieval` and
  `inference` are the two categories here most likely to be declared as a
  product capability ("the search index" is `search-index`, but a managed RAG
  pipeline is not an index). vwf's move.
- **AI Gateway as a `capability-provider`-style pin for products that use no
  Cloudflare compute at all** — the gateway is reachable by URL from anywhere.
  Today it ships as a `cloud-service` bundle beside a Cloudflare pin; a product
  hosted elsewhere that wants only the gateway has no clean pin. Raised by U3's
  pick-and-trade; decide when such a product exists.
- **`framework/react`** — carried from the Astro plan's Parked list; the Agents
  SDK client hooks make it a little more pressing.
- **A `cloudflare-agents` deploy shape** — an agent's Worker is deployed by the
  `cloudflare-workers-ssr` pack's `wrangler.jsonc` + deploy task, which knows
  nothing about `durable_objects` migrations. Whether the SSR pack's config
  template should carry a commented `durable_objects` + `migrations` block is a
  plan-B/workers-ssr question, not this plan's.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

Run in a fresh session:

/execute-plan docs/plans/2026-09-06-cloudflare-ai
