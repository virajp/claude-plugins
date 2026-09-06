---
type: repo-plan
title: Cloudflare media, messaging and secrets — Images, Realtime, Email
  Service, Secrets Store
requires: [ docs/plans/2026-09-06-cloudflare-storage-and-data ]
---

# Plan — Cloudflare media, messaging and secrets (2026-09-06)

Plan **D of four**. It stands on plan A
(`docs/plans/2026-09-06-cloudflare-storage-and-data`), which minted every
category token and narrowed the provider pack's scope. It does **not** depend on
plan B (`…-cloudflare-compute-and-orchestration`) or plan C (`…-cloudflare-ai`)
and may run before either of them; the provider-narrowing unit and the gates
unit derive their lists and numbers from what is on disk at run time, so order
does not matter.

## Status

**APPROVED** — 2026-09-07 by the user, at the shape gate, after the self-review.
Not yet run; halts at preflight until every `requires:` plan reads COMPLETE.

## Consent

| Action                                       | Granted                                                     |
| -------------------------------------------- | ----------------------------------------------------------- |
| Merge to `develop` and push on green run     | yes                                                         |
| Stage locally (`plugins:local`) on green run | yes                                                         |
| Release `vwf` publicly                       | none                                                        |
| Release `stackgen` publicly                  | none (minor bump from the version on disk recorded, no tag) |
| Release installer publicly                   | none                                                        |
| Release site publicly                        | none                                                        |

**A release is two stages.** The local one — `mise run plugins:local` — stages
the changed plugins into the dev marketplace and updates this machine's install;
it publishes nothing, so execute-plan runs it without a further prompt and only
reports what it staged. The public one is the tags, and it is what the release
rows above are about: they are intent, and execute-plan stops once before the
`main` merge and the tags and asks, per `CLAUDE.md`. A staged plugin loads only
in a **restarted** session. The user's answer for stackgen was "not this time":
the version still climbs one minor from whatever `plugin.json` reads when this
plan runs (`1.5.0` → `1.6.0` if it runs last; `1.3.0` → `1.4.0` if it runs
straight after A), but no tag is cut by this plan. The eventual `main` merge
will want that tag for `plugins.yml`'s "every marketplace ref names a tag" step
— that is the release step, not this plan's.

## Goal

After this lands, four more Cloudflare services — Images, Realtime, Email
Service and Secrets Store — are shipped `cloud-service` packs under
`plugins/stackgen/stacks/cloud-service/`, each reachable from the stack menu as
its own backing-axis bundle `cloudflare-<slug>`, so a project pinning one gets a
curated copy instead of a generator run. Secrets Store is the runtime secrets
binding a hosted Worker or Container reads in staging and production; it sits
**beside** `capability-provider/fnox`, which stays the developer-machine and CI
provider, and the packs say so. The Cloudflare provider pack's scope prose names
these four as shipped.

The framing: plan A's index carries the full story (the blocked greenfield init,
the service-by-service brief, the user's choice of twenty services and four
chained plans). This plan is the media, messaging and secrets slice. The user's
brief answer put Images, Realtime and Email Service in; Stream and Turnstile
stayed out; Secrets Store was added by the user: "Include `Secrets
Store` as it
will be required if hosting containers in CloudFlare or even Workers."

**No reversal.** The Pages and Stream retirement was plan A's and is recorded in
`docs/memory/decisions/2026-09-06-pages-and-stream-leave-the-reservation.md`.
This plan writes one decisions doc of its own — the Secrets Store
runtime-versus-development ruling — because it settles how two packs that share
the noun `secrets-manager` coexist.

## Facts the survey established

**This repo, as plan A leaves it.** Everything in plan A's §Facts holds; the
points this plan leans on:

- After plan A the `cloud-service` category line in
  `plugins/stackgen/assets/taxonomy.md` carries `media`, `realtime`, `messaging`
  and `secrets-manager`. **No taxonomy edit in this plan.** The "no capability
  token today" paragraph names `media`, `realtime` and `secrets-manager` among
  the token-less categories; `messaging` realizes `email` (or
  `push-notifications` / `sms`).
- Backing-service packs ship no `config/`: `pack.yaml`, `conventions.md`,
  `skills/<name>/SKILL.md` and five references. The Cloudflare sibling is
  `stacks/cloud-service/zero-trust-access/**`; the sibling whose `capability` is
  set is `stacks/cloud-service/cloud-sql/pack.yaml`; plan A's seven packs are
  further siblings once landed (`kv`, `r2`, `d1`, `hyperdrive`, `vectorize`,
  `pipelines`, `analytics-engine`, each with a `skills/cloudflare-<slug>/`
  router).
- `stacks/capability-provider/fnox/pack.yaml` declares
  `type:
  capability-provider`, `category: secrets-manager`,
  `kind:
  capability-provider`, `axis: backing`, `harness: n/a`, `capability`
  unset with the comment "`secrets-manager` has no vwf capability token today …
  Minting one is vwf's move". Its summary: "The local-first secrets manager —
  you hold them, encrypted into git or referenced in your own cloud". It is the
  secrets provider `/vwf:init` question 4 picks.
- `plugins/stackgen/assets/contracts/secrets.md` — "Capability tokens realized
  here: none today"; its cardinal rule: "**A secret reaches a process as an
  environment variable, injected at the process boundary — never read by the
  application from a file.**" and "the injector **wraps the task, not the
  application**"; then a numbered "What a manager must be able to do" list
  (resolve a distinct set per environment, fail rather than fall back,
  authenticate CI non-interactively, …). A Workers binding is injected by the
  runtime at the process boundary — it is neither a file nor an SDK the
  application compiles in — so the Secrets Store pack can cite the rule as
  satisfied by the binding model, and must say where the model differs (a
  `.get()` on the binding rather than a shell variable).
- No contract exists for `messaging`, `media` or `realtime`.
- The provider pack's service-enumerating passages, after plan A's U2, state
  three lists — shipped / planned / declined — in
  `stacks/cloud-provider/cloudflare/conventions.md`,
  `skills/cloudflare/SKILL.md` and
  `skills/cloudflare/references/local-development-map.md`. The six duplicate
  passages in the Workers packs and existing bundles are now single pointer
  sentences and need no edit here.
- Both stack axes are lists (`plugins/vwf/assets/vwf-config.md:72`, `:75`); a
  backing bundle is pinned beside others.
- The per-service bundle template is
  `stacks/bundles/cloudflare-zero-trust.md:1-9` and plan A's seven
  `cloudflare-<slug>.md`; a backing bundle has no `artifact:` key
  (`assets/pack-format.md:204`).

**Gates.** As plan A: `plugins:inventory` (reads every `pack.yaml` and bundle;
throws on an undefined kind — none here), `plugins:check` (rule 4 strict-YAML
frontmatter on every shipped skill; rule 12 retired vocabulary; rule 11 walks
only a `config/` tier, absent here), `plugins:shellcheck` (nothing to walk),
`pnpm vitest run` over the real tree, pre-commit order marketplace → inventory →
check. Expect waves 2–4 to land as one commit unless the orchestrator
regenerates the inventory at the wave-2 boundary. `site:check` from wave 3 on.

**Docs that describe today's behaviour** (the docs unit's list):

- `site/src/content/docs/how-to/operate/choosing-your-stack.md:72-78` (the
  Cloudflare rows, extended by plan A) and `:62` ("`doppler` and `fnox` for
  secrets") — the second is where the runtime-side sentence belongs.
- `site/src/content/docs/plugins/stackgen.md:350-353` names
  `capability-provider/fnox` and its guard hook; `:626` the secrets overlay.
  Check they stay true; do not add a count.
- `plugins/stackgen/stacks/readme.md` — the wave narrative; plan A appends Wave
  F, plan B G, plan C H; this plan appends the next letter after the last one
  present.
- `.claude/skills/stackgen-plugin/SKILL.md:26-27` forbids restating counts.
- `readme.md`, `CLAUDE.md`, `.claude/docs/plugins.md` — only if a sentence is
  falsified; the survey found no Cloudflare service enumeration in them.

**Cloudflare, from Context7 (`/websites/developers_cloudflare`, fallback
`/cloudflare/cloudflare-docs`).** Every unit re-verifies before citing. What the
interview rested on: Image Resizing is the older name for what Images now
covers; Calls is the older name for Realtime; Email Routing and Email Workers
fold into Email Service as its receive side; Secrets Store is an account-level
store bound to Workers as `secrets_store_secrets` (binding, store id, secret
name) and is distinct from per-Worker `wrangler secret put`. Realtime is reached
over a REST API with an app id and secret, not a wrangler binding.

## Assumed decisions — confirm or override at review

| #   | Decision            | Ruling                                                                                                                                                                                                                                                                                                                                                                        | Rejected                                                                                           | Unit  |
| --- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----- |
| D1  | Plan split          | Plan D of "Four chained plans"; requires A only; runs in any order relative to B and C. The provider-narrowing and gates units derive lists and numbers from disk.                                                                                                                                                                                                            | Requiring B and C too (no dependency exists)                                                       | index |
| D2  | Bundle granularity  | "One bundle per service": `cloudflare-<slug>`, kind `cloud-provider`, components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`, `axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the zero-trust bundle's shape.                                                                                                                    | Domain composites; both                                                                            | U2–U5 |
| D3  | Config tier         | "Backing-service packs ship **no `config/`**; the wrangler binding block a project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to add to the project's own `wrangler.jsonc`."                                                                                                                                                                         | A wrangler fragment convention                                                                     | U2–U5 |
| D4  | Contracts           | Cite a contract only where one exists: Secrets Store → `assets/contracts/secrets.md`, clause by clause, stating that the Workers binding is the process-boundary injection the rule demands and naming the one place the model differs. Images, Realtime, Email Service cite none. No new contracts.                                                                          | Writing a `messaging` or `media` contract                                                          | U2–U5 |
| D5  | Secrets Store shape | A `cloud-service` pack, category `secrets-manager`, backing axis, for the runtime environment only. The user's ruling, verbatim: "Secrets Store is NOT for development environment but for Cloud Environment where applications run in production or staging". It coexists with `capability-provider/fnox`; the pack's `capability` comment and the bundle prose both say so. | A `capability-provider` pack (a second init-time secrets provider); folding into the provider pack | U5    |
| D6  | `capability:`       | Email Service `capability: email`. Images, Realtime, Secrets Store **unset** with the zero-trust comment shape (`media`, `realtime`, `secrets-manager` have no vwf token today). Realtime's comment says why it is not `realtime-sync`: that token is data sync, this is media.                                                                                               | `realtime-sync` for Realtime                                                                       | U2–U5 |
| D7  | Provider narrowing  | One unit updates the provider pack's three lists: shipped = every Cloudflare `cloud-service` pack on disk at run time plus this plan's four; planned = the remainder of the twenty, derived from disk; if none remain, the planned clause is dropped and the paragraph says the platform coverage is complete; declined unchanged. Four local-development-map rows.           | Each pack editing the provider                                                                     | U1    |
| D8  | Skill naming        | Router skill directory and `name:` are `cloudflare-images`, `cloudflare-realtime`, `cloudflare-email`, `cloudflare-secrets-store`. Pack slugs are `images`, `realtime`, `email-service`, `secrets-store`. Bundles are `cloudflare-images`, `cloudflare-realtime`, `cloudflare-email-service`, `cloudflare-secrets-store`.                                                     | Bare skill names; `cloudflare-email-service` as the skill name (long for a router)                 | U2–U5 |
| D9  | Reference files     | "Exactly five per pack, named for the topics: `pick-and-trade.md`, `service-doctrine.md`, `cost-shape.md`, `identity-shape.md`, `local-dev.md`. No sixth file." Email's receive side (Routing, Email Workers) and Images' storage side are **sections**, not files.                                                                                                           | Extra files per sub-feature                                                                        | U2–U5 |
| D10 | Research sourcing   | "Every Cloudflare fact in a pack is verified against Context7 `/websites/developers_cloudflare` … at authoring time and cited by URL in the reference that states it. No fact from memory." Product renames (Image Resizing → Images, Calls → Realtime, Email Routing/Workers → Email Service) are each stated once, verified.                                                | Trusting this plan's facts                                                                         | U2–U5 |
| D11 | Harness block       | `harness:` with `health`, `e2e_staging`, `local_stack`, each `task: n/a` with honest mechanism prose. Realtime and Email have no local form — the mechanism says "None" and how a project substitutes, as `zero-trust-access` does.                                                                                                                                           | Naming a task the pack does not ship                                                               | U2–U5 |
| D12 | Credentials         | Packs cite the provider's identity-and-iam reference for the API token and account id; `identity-shape.md` states only the per-service permission. Realtime's app secret and Email's DKIM material are secrets under the provider's secrets doctrine — and, once this plan lands, the Secrets Store pack is the runtime home the other three point at by path.                | Restating credential rules per pack                                                                | U2–U5 |
| D13 | Versions            | Every new pack and bundle is `0.1.0`; stackgen bumps one **minor** from the version on disk at run time (expected `1.6.0` if this plan runs last), untagged.                                                                                                                                                                                                                  | Patch; a fixed number                                                                              | U7    |
| D14 | Model               | `opus` on every unit.                                                                                                                                                                                                                                                                                                                                                         | `inherit`                                                                                          | all   |
| D15 | Waves               | Provider prose first (wave 1), four packs concurrently (wave 2), docs (wave 3), gates (wave 4).                                                                                                                                                                                                                                                                               | Packs in wave 1                                                                                    | index |
| D16 | Decisions doc       | `docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md` records D5 with its rejected shapes, so the next plan that touches secrets does not re-open it.                                                                                                                                                                                                | Recording it only in the pack                                                                      | U6    |

## New dependencies

None. Packs are YAML and Markdown; no unit adds a package.

## Units

| Id | Wave | Unit file                                            | Owns                                                                                                                                                                                                                              | Depends on | Status  | Commit |
| -- | ---- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-provider-narrowing.md](01-provider-narrowing.md) | `plugins/stackgen/stacks/cloud-provider/cloudflare/**`                                                                                                                                                                            | —          | pending |        |
| U2 | 2    | [02-images-pack.md](02-images-pack.md)               | `plugins/stackgen/stacks/cloud-service/images/**`, `plugins/stackgen/stacks/bundles/cloudflare-images.md`                                                                                                                         | U1         | pending |        |
| U3 | 2    | [03-realtime-pack.md](03-realtime-pack.md)           | `plugins/stackgen/stacks/cloud-service/realtime/**`, `plugins/stackgen/stacks/bundles/cloudflare-realtime.md`                                                                                                                     | U1         | pending |        |
| U4 | 2    | [04-email-service-pack.md](04-email-service-pack.md) | `plugins/stackgen/stacks/cloud-service/email-service/**`, `plugins/stackgen/stacks/bundles/cloudflare-email-service.md`                                                                                                           | U1         | pending |        |
| U5 | 2    | [05-secrets-store-pack.md](05-secrets-store-pack.md) | `plugins/stackgen/stacks/cloud-service/secrets-store/**`, `plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md`                                                                                                           | U1         | pending |        |
| U6 | 3    | [06-docs.md](06-docs.md)                             | `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `plugins/stackgen/stacks/readme.md`, `docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md` | U1–U5      | pending |        |
| U7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)         | `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                                                          | U6         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                                                           | Why it collides                                                                     | Owner   |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------- |
| `plugins/stackgen/.claude-plugin/plugin.json`                                                                                  | several units bumping one version is a lost update                                  | U7 only |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                      | generated; regenerating mid-wave races                                              | U7 only |
| `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `docs/memory/**` | n units editing one doc                                                             | U6 only |
| `plugins/stackgen/stacks/readme.md`                                                                                            | the wave narrative every pack would want a line in                                  | U6 only |
| `plugins/stackgen/stacks/cloud-provider/cloudflare/**`                                                                         | four packs would each want the scope prose and the local-dev map                    | U1 only |
| `plugins/stackgen/assets/**` (taxonomy, kinds, pack-format, contracts)                                                         | nothing in this plan changes them; a unit that thinks it must reports `UNRESOLVED:` | nobody  |
| `plugins/stackgen/stacks/capability-provider/fnox/**`                                                                          | the Secrets Store pack cites it; nothing edits it                                   | nobody  |
| Any pack or bundle landed by plans A, B or C                                                                                   | cited by path, never edited                                                         | nobody  |

## Waves

- **Wave 1 — U1.** The provider-pack prose alone; the packs cite it.
- **Wave 2 — U2–U5.** Four pack units, each owning one new directory and one new
  bundle file; nothing shared.
- **Wave 3 — U6.** Docs, after every `DOCS FALSIFIED:` line is in.
- **Wave 4 — U7.** Bump, generate, full gate, target-verifier.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `mise run plugins:shellcheck`,
`pnpm vitest run`, `pnpm exec tsc --noEmit -p installer` and `-p scripts`,
`mise run plugins:npm-normalize-test`, `mise run site:check` from wave 3 on (U6
owns `site/**`), plus the wave review, plus every report read for `UNRESOLVED:`.

The inventory `--check` **will fail after wave 2 until U7 regenerates it** —
expected, recorded as such in the wave-2 gate line; the orchestrator may
regenerate it at the wave-2 boundary (its file, not a unit's), in which case U7
re-runs the generator and confirms no diff.

Plan-specific checks, run by the orchestrator after wave 2:

- `ls plugins/stackgen/stacks/cloud-service/{images,realtime,email-service,secrets-store}/skills/cloudflare-*/references/ | grep -c '\.md$'`
  is 20 — five per pack, named exactly per D9.
- `find plugins/stackgen/stacks/cloud-service/{images,realtime,email-service,secrets-store} -name config`
  is empty (D3).
- `grep -L '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-{images,realtime,email-service,secrets-store}.md`
  lists all four (D2).
- `grep -h '^category:' plugins/stackgen/stacks/cloud-service/{images,realtime,email-service,secrets-store}/pack.yaml`
  yields exactly `media`, `realtime`, `messaging`, `secrets-manager`, each
  present on `taxonomy.md`'s `cloud-service` line.
- `grep -h '^capability:' plugins/stackgen/stacks/cloud-service/{images,realtime,email-service,secrets-store}/pack.yaml`
  yields exactly one line, `capability: email` (D6).
- `grep -rc 'contracts/secrets.md' plugins/stackgen/stacks/cloud-service/secrets-store`
  ≥ 1 and
  `grep -rl 'fnox' plugins/stackgen/stacks/cloud-service/secrets-store plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md`
  is non-empty (D5).

## Gates the orchestrator keeps

- **The menu check**, after wave 2: read `plugins/stackgen/stacks/bundles/` as
  `stackgen-stack-menu` does — every `*.md` without `unconditional: true` is a
  row. The four new `cloudflare-*.md` files must each parse with `name`,
  `axis: backing`, `kind: cloud-provider` and two `components` refs whose
  targets exist on disk. Pass = four rows, all resolvable. A failure is a wave-2
  finding routed to the owning unit.
- **No scratch materialization.** No pack in this plan has a `config/` tier.
- **`target-verifier`** inside U7: a hermetic install of the bumped stackgen
  from the dev marketplace shows the four pack directories and four bundle files
  under the installed plugin's `stacks/`, and an uninstall leaves nothing
  behind. Pass = both.
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

- **Stream** — retired by plan A's reversal
  (`docs/memory/decisions/2026-09-06-pages-and-stream-leave-the-reservation.md`);
  it does not come back without a fresh decision. Not a media pack here.
- **Turnstile** — declined by the user when briefed; parked, not built.
- **Pages, Workers Sites** — retired / deprecated (plan A).
- **A Secrets Store `capability-provider` pack** — rejected under D5: it has no
  laptop-side injection and cannot feed pre-commit or mise tasks; it is the
  runtime store, not a development one.
- **Email as a `capability-provider`** — no; a `cloud-service` realizing `email`
  is the shape every other messaging provider would take.
- **Editing `capability-provider/fnox/**`** — cited, never edited.
- **Any taxonomy, kinds, pack-format or contract edit** — plan A's tokens cover
  this plan; a unit needing more returns `UNRESOLVED:`.
- **Any vwf file** — vwf stays vendor-free; the token-less categories stay
  unset.
- **Durable Objects, Workflows, Containers, Queues** (plan B); **Workers AI, AI
  Gateway, AI Search, Browser Rendering, Agents SDK** (plan C) — cited by path
  where a reference points at them, never written here.
- **Account-level products** (Zaraz, Logpush, WAF, DNS, Tunnels, …) and
  **Pub/Sub** (unverified) — as plan A.
- **A public stackgen or site release** — "not this time"; the version still
  bumps.

## Parked

- **Turnstile** as a `cloud-service` pack (a new category such as
  `bot-protection` would be minted first).
- **A vwf capability token for the runtime secrets store** — `secrets-manager`
  has none; with fnox and Secrets Store both realizing it in different
  environments, vwf may want to split the token by environment. Vwf's move.
- **Email templates and a `p:<id>:mail-preview` loop** — raised while framing
  the Email pack's local-dev story (no local form exists); a later plan if a
  real project needs it.
- **Images and R2 as one "media origin" composite** — rejected per-service
  granularity applies; recorded so it is not re-raised as new.
- Everything plan A parked (category-validation checker rule, `artifact:`
  enumeration, D1 migrations task, `p:<id>:preview`, composite bundles, the
  stale handoff) stands.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

Run in a fresh session:

/execute-plan docs/plans/2026-09-06-cloudflare-media-messaging-secrets
