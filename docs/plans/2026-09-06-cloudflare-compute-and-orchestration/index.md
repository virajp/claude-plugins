---
type: repo-plan
title: Cloudflare compute and orchestration — Durable Objects, Workflows,
  Queues, Containers
requires: [ docs/plans/2026-09-06-cloudflare-storage-and-data ]
---

# Plan — Cloudflare compute and orchestration (2026-09-06)

Plan **B of four**. It stands on plan A
(`docs/plans/2026-09-06-cloudflare-storage-and-data`), which minted every
category token the twenty Cloudflare services need and narrowed the provider
pack's scope prose. Plan C (`docs/plans/2026-09-06-cloudflare-ai`) requires this
plan; plan D (`docs/plans/2026-09-06-cloudflare-media-messaging-secrets`)
requires only A and may run before or after this one — the provider-narrowing
unit here derives its lists from disk for that reason.

## Status

**APPROVED** — 2026-09-07 by the user, at the shape gate, after the self-review.
Not yet run; halts at preflight until every `requires:` plan reads COMPLETE.

## Consent

| Action                                       | Granted |
| -------------------------------------------- | ------- |
| Merge to `develop` and push on green run     | yes     |
| Stage locally (`plugins:local`) on green run | yes     |
| Release `vwf` publicly                       | none    |
| Release `stackgen` publicly                  | none    |
| Release installer publicly                   | none    |
| Release site publicly                        | none    |

**A release is two stages.** The local one — `mise run plugins:local` — stages
the changed plugins into the dev marketplace and updates this machine's install;
it publishes nothing, so execute-plan runs it without a further prompt and only
reports what it staged. The public one is the tags, and it is what the release
rows above are about: they are intent, and execute-plan stops once before the
`main` merge and the tags and asks, per `CLAUDE.md`. A staged plugin loads only
in a **restarted** session. The user's answer for stackgen was "not this time":
the version still climbs one minor so the dev marketplace stages it, but no
`stackgen-v*` tag is cut by this plan. The eventual `main` merge will want the
tag (`plugins.yml`'s "every marketplace ref names a tag" step runs on `main`
only) — that is the release step, not this plan's.

## Goal

After this lands, four Cloudflare compute and orchestration services — Durable
Objects, Workflows, Queues and Containers — are shipped `cloud-service` packs
under `plugins/stackgen/stacks/cloud-service/`, each reachable from the stack
menu as its own bundle `cloudflare-<slug>`. Three are backing-axis pins; the
fourth, Containers, is a **deploy target** in category `compute`: it carries the
eight-topic bar, ships a complete `wrangler.jsonc` and a `p:<id>:deploy` overlay
exactly as `workers-ssr` does, and is pinned **instead of**
`cloudflare-workers-ssr`, never beside it. The provider pack's scope prose moves
these four from "planned" to "shipped".

The framing: the user asked for all Cloudflare developer-platform services and
chose twenty, split into four chained plans (see plan A's Goal for the full
framing and the reversal it recorded — Pages and Stream retired). This plan is
the compute/orchestration domain. No reversal is introduced here; the one new
ruling with reach beyond this plan is the Containers-instead-of-Workers-SSR pin
rule, recorded as a decisions doc by the docs unit.

## Facts the survey established

**This repo, after plan A lands.** Every fact in plan A's `index.md` §Facts
holds and is not repeated; the deltas:

- stackgen reads `1.3.0` if plan A ran and nothing else did. The inventory
  header reads 49 packs, 45 bundles, 12 kinds. **This plan bumps the minor from
  whatever `plugin.json` reads at run time** and expects the header to grow by
  +4 packs / +4 bundles from whatever the committed header reads (expected
  result in order: `1.4.0`, 53 packs, 49 bundles, 12 kinds).
- The tokens this plan's packs use all exist after plan A: `stateful-compute`,
  `orchestration`, `queue`, `compute` (`plugins/stackgen/assets/taxonomy.md`,
  the `cloud-service` line). No asset changes here; a unit that believes one
  must returns `UNRESOLVED:`.
- The provider pack's scope prose
  (`stacks/cloud-provider/cloudflare/conventions.md`,
  `skills/cloudflare/SKILL.md`,
  `skills/cloudflare/references/local-development-map.md`) carries three lists —
  shipped / planned / declined — since plan A's U2. The six duplicate
  reservation passages in the Workers packs and the three older bundles are now
  one-sentence pointers to the provider conventions; **nothing in this plan
  edits them**.
- **The deploy-target shape**, which Containers reuses:
  `stacks/cloud-service/workers-ssr/` — `pack.yaml` (`category: compute`,
  `axis: deploy`, `artifact: worker-script`, `harness:` with honest `n/a`
  tasks), `conventions.md`, `skills/workers-ssr/SKILL.md`, **eight** references
  (`pick-and-trade`, `service-doctrine`, `cost-shape`, `identity-shape`,
  `local-dev`, `artifact`, `pipeline`, `health`), `config/wrangler.jsonc` and
  `config/.config/mise/tasks/p/_project/deploy`. The deploy task's shape:
  `#!/usr/bin/env bash`, `#MISE description=`, `#MISE dir="{{ config_root }}"`,
  `#USAGE flag "--dry-run"`, the `_project` marked-position header comment,
  `set -euo pipefail`, sourcing `helpers` with `# shellcheck source=/dev/null`,
  `project_id` read from the directory name, a `have_task` helper,
  `print_header`, the credentials check (`CLOUDFLARE_API_TOKEN`,
  `CLOUDFLARE_ACCOUNT_ID`, exempt under `--dry-run`) before anything is invoked.
  `wrangler.jsonc`'s shape: a header comment block stating what the stack is and
  the credentials rule, `$schema`, the marked position `"name": "PLACEHOLDER"`
  with its comment block (deliberately invalid uppercase so an unfilled slot
  fails at first deploy), `main`, `compatibility_date`, `compatibility_flags`,
  `assets`, `observability`.
- `wrangler.jsonc` is on the checker's pack-root allowlist
  (`scripts/src/check.ts:314-334`, comment at `:330-332`: wrangler discovers
  config only at the repo root). Rule 11 walks any pack `config/` tier: task
  files 755 + known shebang, hooks 755 + `bash`/`sh` shebang, root allowlist, no
  CI workflow under `.github/`, pre-commit and editor fragments parse
  (`.claude/skills/plugin-authoring/references/checks.md:87-130`).
- `plugins:shellcheck` walks `plugins/*/stacks/*/*/config/.config/mise/tasks/**`
  with `shellcheck -x -s bash -e SC2034 -e SC2154 -P <pack>/config` and
  `shfmt -d -i 2 -ci` (`.config/mise/tasks/plugins/shellcheck:68-79`). The
  Containers deploy task is in that walk.
- `dprint.json:10` excludes `plugins/*/stacks/*/*/config/` — the payload is
  formatted by the **target repo's** gate pack, never by this repo's config.
  Format payload files by hand.
- The Cloud-Bundle deploy analogue: `stacks/bundles/gcp-cloud-run.md:1-9` —
  `axis: deploy`, `kind: cloud-provider`, components `cloud-provider/gcp` +
  `cloud-service/cloud-run` **only** (no `deploy-target/container-image`
  component), `artifact: container-image`. `cloudflare-workers-ssr.md` carries
  `artifact: worker-script`.
- `assets/contracts/orchestration.md` is the async-orchestration capability
  contract: "Capability tokens realized here: `durable-workflows`,
  `message-queue`, `pub-sub`, `scheduled-jobs`." Workflows and Queues cite it;
  Durable Objects and Containers do not.
- The two earlier Cloudflare deploy-target plans kept a **scratch
  materialization** as an orchestrator gate
  (`docs/plans/archived/2026-09-05-cloudflare-workers-static/index.md:324-355`):
  compose the unconditional packs' `config/` trees plus the cloud pack **last**
  into a temp git repo, assert `wrangler.jsonc` at the root parses as JSONC, the
  deploy task lands executable and shellcheck-clean, the task refuses without
  credentials before invoking wrangler, and the bundle has no `unconditional:`
  key. Adapted below.
- Both earlier Cloudflare plans landed wave 1 as **one commit**, forced by
  pre-commit `plugins:inventory --check`; expect the same for waves 2–4 here.

**Docs that describe today's behaviour** (the docs unit's list):

- `site/src/content/docs/plugins/stackgen.md:90` ("Both Cloudflare Workers
  deploy packs' `assets.directory` cite that heading") and `:680` ("which is how
  both Workers packs land `p:<id>:deploy`") — **falsified by this plan**:
  Containers is a third pack shipping `wrangler.jsonc` and the deploy overlay.
  `:196` (kinds, stays true); `:155` (framework packs, plan C's).
- `site/src/content/docs/how-to/operate/choosing-your-stack.md:72-78` (the
  Cloudflare rows; plan A added seven backing rows) and `:85-86`.
- `plugins/stackgen/stacks/readme.md` — plan A appended a Wave F paragraph; a
  **Wave G** paragraph belongs after it.
- `.claude/skills/stackgen-plugin/SKILL.md:87-115` — the `(f)` config-entry
  precedent names `workers-static-assets` and `workers-ssr` by hand; a third
  pack now fits the same entry kind.
- `readme.md:227-265`, `CLAUDE.md:211`, `.claude/docs/plugins.md:13` — only if a
  sentence enumerates Cloudflare services or the Workers packs.

**Cloudflare, from Context7 (`/websites/developers_cloudflare`, primary;
`/cloudflare/cloudflare-docs` secondary).** Every unit re-verifies before
citing; these are the facts the interview rested on.

- `durable_objects.bindings: [{name, class_name}]` binds a Durable Object class
  that lives in the Worker script; a `migrations` entry (with
  `new_sqlite_classes` for SQLite-backed storage) declares the class to the
  platform. Durable Objects are single-threaded per id, with a storage API,
  alarms, and WebSocket hibernation. `wrangler dev` runs them locally.
- `workflows: [{name, binding, class_name}]` binds a Workflow class; steps
  retry, `sleep` and `waitForEvent` are durable, and `WorkflowInstance.status()`
  reads instance status. `wrangler workflows` has subcommands for instances.
- Queues: producer bindings (`queues.producers: [{binding, queue}]`) and
  consumers
  (`queues.consumers: [{queue, max_batch_size, max_batch_timeout,
  max_retries, dead_letter_queue}]`),
  pull consumers over HTTP, R2 event notifications as a producer. `wrangler dev`
  simulates queues locally.
- Containers run Docker images beside Workers and are addressed through a
  Durable Object; `wrangler.jsonc` carries
  `containers: [{class_name, image,
  max_instances}]` alongside the DO binding
  and migration; `wrangler deploy` builds and pushes the image; local
  `wrangler dev` needs Docker. Cloudflare's reference architecture lists
  Containers under Compute with Workers and Durable Objects.
- The storage comparison table: Durable Objects = "global coordination &
  stateful serverless … strongly consistent, transactional storage"; Queues =
  "background job processing … message queuing, and deferred tasks".

## Assumed decisions — confirm or override at review

| #   | Decision            | Ruling                                                                                                                                                                                                                                                                                                                                                                      | Rejected                                                                                | Unit   |
| --- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------ |
| B1  | Plan position       | Plan B of four; requires plan A; plan C requires this one. No taxonomy, kinds, pack-format or contract edit — plan A minted every token.                                                                                                                                                                                                                                    | Minting `stateful-compute` / `orchestration` here                                       | index  |
| B2  | Bundle granularity  | "One bundle per service": `cloudflare-<slug>`, kind `cloud-provider`, components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`, `name: Cloudflare <Service>`. Three are `axis: backing` with **no `artifact:` key**; `cloudflare-containers` is `axis: deploy` with `artifact: container-image`, mirroring `gcp-cloud-run.md` — provider + service only. | Domain composites; a `deploy-target/container-image` component in the Containers bundle | U2–U5  |
| B3  | Config tier         | "Backing-service packs ship **no `config/`**; the wrangler binding block a project adds lives in `service-doctrine.md` and `local-dev.md`." Durable Objects, Workflows, Queues ship none. **Containers ships one**, mirroring `workers-ssr/config/` in form: `config/wrangler.jsonc` and `config/.config/mise/tasks/p/_project/deploy`.                                     | A wrangler fragment convention; Containers without a config tier                        | U2–U5  |
| B4  | Containers pin rule | "A Containers project **is** a Workers project, so `cloudflare-containers` is pinned **instead of** `cloudflare-workers-ssr`, never beside it — both ship a `wrangler.jsonc` and would collide; the bundle prose says so." The Containers `wrangler.jsonc` is a **complete** Worker config (`main`, the container block, the DO binding and migration).                     | A Containers pack that layers onto a Workers SSR pin; a shared wrangler fragment        | U5, U6 |
| B5  | Contracts           | Workflows and Queues cite `assets/contracts/orchestration.md` clause by clause (Workflows for `durable-workflows`, Queues for `message-queue`). Durable Objects and Containers cite none. No new contracts.                                                                                                                                                                 | Writing a contract for `stateful-compute`                                               | U2–U5  |
| B6  | `capability:`       | Workflows `durable-workflows`, Queues `message-queue`. Durable Objects and Containers **unset** with the zero-trust comment shape (`stateful-compute` and deploy-axis `compute` carry no vwf token).                                                                                                                                                                        | `pub-sub` on Queues; `realtime-sync` on Durable Objects                                 | U2–U5  |
| B7  | Provider narrowing  | One unit rewrites the provider pack's three lists. The **shipped** list is every Cloudflare `cloud-service` pack present on disk at run time plus this plan's four; the **planned** list is the remainder of the twenty, derived from disk (plan D may have run first); the declined list is unchanged. Four rows join the local-development map.                           | A fixed list assuming run order; each pack unit editing the provider                    | U1     |
| B8  | Skill naming        | Router skill directory and `name:` are `cloudflare-<slug>`: `cloudflare-durable-objects`, `cloudflare-workflows`, `cloudflare-queues`, `cloudflare-containers`. Pack directory slugs stay bare.                                                                                                                                                                             | Bare skill names as `workers-ssr` used                                                  | U2–U5  |
| B9  | Reference files     | Backing packs: exactly five, named `pick-and-trade.md`, `service-doctrine.md`, `cost-shape.md`, `identity-shape.md`, `local-dev.md`. Containers: exactly **eight** — the five plus `artifact.md`, `pipeline.md`, `health.md` (the deploy-target extension of `kinds.md:254-265`).                                                                                           | Topic-free names; extra files                                                           | U2–U5  |
| B10 | Research sourcing   | "Every Cloudflare fact in a pack is verified against Context7 `/websites/developers_cloudflare` (falling back to `/cloudflare/cloudflare-docs`) at authoring time and cited by URL in the reference that states it. No fact from memory."                                                                                                                                   | Trusting this file's facts                                                              | U1–U5  |
| B11 | Harness block       | `harness:` carries `health`, `e2e_staging`, `local_stack`, each `task: n/a` with honest mechanism prose, as `zero-trust-access/pack.yaml:14-41` and `workers-ssr/pack.yaml` do. Containers names no health task either — its `health.md` carries the doctrine (a Containers health probe **task** is parked).                                                               | Naming a mise task the pack does not ship                                               | U2–U5  |
| B12 | Credentials         | Packs **cite** the provider pack's identity-and-iam reference for the API token and account id and never restate them; the Containers deploy task checks the same two environment variables the `workers-ssr` task checks, with the same comment.                                                                                                                           | Restating the credential rule per pack                                                  | U2–U5  |
| B13 | Versions            | Every new pack and bundle is `0.1.0`; stackgen bumps the **minor from whatever `plugin.json` reads at run time** (expected `1.4.0`), untagged.                                                                                                                                                                                                                              | Patch; a hard-coded `1.4.0`                                                             | U7     |
| B14 | Model               | `opus` on every unit.                                                                                                                                                                                                                                                                                                                                                       | `inherit`                                                                               | all    |
| B15 | Waves               | Provider prose first (wave 1), the four packs concurrently (wave 2), the scratch materialization for Containers, then docs, then gates.                                                                                                                                                                                                                                     | Packs in wave 1                                                                         | index  |
| B16 | Docker pre-check    | The Containers deploy task adds one check the Workers SSR task lacks: `docker` on `PATH` and the daemon answering (`docker info`), after the credential check and exempt under `--dry-run`, because `wrangler deploy` builds the image. The one deliberate departure from line-for-line mirroring.                                                                          | Strict mirroring of the workers-ssr task                                                | U5     |

## New dependencies

None. Packs are YAML, Markdown, one JSONC payload and one bash task; no unit
adds a package.

## Units

| Id | Wave | Unit file                                                | Owns                                                                                                                                                                                                                           | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | ------ |
| U1 | 1    | [01-provider-narrowing.md](01-provider-narrowing.md)     | `plugins/stackgen/stacks/cloud-provider/cloudflare/**`                                                                                                                                                                         | —          | pending |        |
| U2 | 2    | [02-durable-objects-pack.md](02-durable-objects-pack.md) | `plugins/stackgen/stacks/cloud-service/durable-objects/**`, `plugins/stackgen/stacks/bundles/cloudflare-durable-objects.md`                                                                                                    | U1         | pending |        |
| U3 | 2    | [03-workflows-pack.md](03-workflows-pack.md)             | `plugins/stackgen/stacks/cloud-service/workflows/**`, `plugins/stackgen/stacks/bundles/cloudflare-workflows.md`                                                                                                                | U1         | pending |        |
| U4 | 2    | [04-queues-pack.md](04-queues-pack.md)                   | `plugins/stackgen/stacks/cloud-service/queues/**`, `plugins/stackgen/stacks/bundles/cloudflare-queues.md`                                                                                                                      | U1         | pending |        |
| U5 | 2    | [05-containers-pack.md](05-containers-pack.md)           | `plugins/stackgen/stacks/cloud-service/containers/**`, `plugins/stackgen/stacks/bundles/cloudflare-containers.md`                                                                                                              | U1         | pending |        |
| U6 | 3    | [06-docs.md](06-docs.md)                                 | `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `plugins/stackgen/stacks/readme.md`, `docs/memory/decisions/2026-09-06-containers-pin-instead-of-workers-ssr.md` | U1–U5      | pending |        |
| U7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)             | `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                                                       | U6         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                                                           | Why it collides                                                                        | Owner   |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------- |
| `plugins/stackgen/.claude-plugin/plugin.json`                                                                                  | several units bumping one version is a lost update                                     | U7 only |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                      | generated; regenerating mid-wave races                                                 | U7 only |
| `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `docs/memory/**` | n units editing one doc                                                                | U6 only |
| `plugins/stackgen/stacks/readme.md`                                                                                            | the wave narrative every pack would want a line in                                     | U6 only |
| `plugins/stackgen/stacks/cloud-provider/cloudflare/**`                                                                         | four packs would each want the scope prose and the local-dev map to name them          | U1 only |
| `plugins/stackgen/stacks/cloud-service/workers-ssr/**`, `workers-static-assets/**`, the three older `bundles/cloudflare-*.md`  | plan A made their scope passages pointers; nothing here changes them                   | nobody  |
| `plugins/stackgen/assets/**` (taxonomy, kinds, pack-format, artifact-doctrine, contracts)                                      | plan A's; nothing here changes them — a unit that thinks it must reports `UNRESOLVED:` | nobody  |
| `scripts/src/check.ts`, `.config/mise/tasks/plugins/*`                                                                         | no gate delta in this plan                                                             | nobody  |

## Waves

- **Wave 1 — U1.** The provider prose alone; the four packs cite the narrowed
  scope read-only.
- **Wave 2 — U2–U5.** Four pack units, each owning one new directory and one new
  bundle file; nothing shared. U5's `config/` tier is inside its own directory.
- **Scratch materialization** (orchestrator, after wave 2 is green, before
  wave 3) — see below.
- **Wave 3 — U6.** Docs, after every `DOCS FALSIFIED:` line is in.
- **Wave 4 — U7.** Bump, generate, full gate, target-verifier.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `mise run plugins:shellcheck`,
`pnpm vitest run`, `pnpm exec tsc --noEmit -p installer` and `-p scripts`,
`mise run plugins:npm-normalize-test`, `mise run site:check` from wave 3 on (U6
owns `site/**`), plus the wave review, plus every report read for `UNRESOLVED:`.
`plugins:shellcheck` is load-bearing in this plan: U5 ships a bash task in its
walk.

The inventory `--check` **will fail after wave 2 until U7 regenerates it** — the
expected state, recorded as such in the wave-2 gate line, exactly as plan A and
both earlier Cloudflare plans recorded it. Because pre-commit runs the same
check, expect waves 2–4 to land as **one commit** unless the orchestrator
regenerates the inventory itself at the wave-2 boundary (allowed — it is the
orchestrator's file, not a unit's; if it does, U7 re-runs the generator and
confirms no diff).

Plan-specific checks, run by the orchestrator after wave 2:

- `ls plugins/stackgen/stacks/cloud-service/{durable-objects,workflows,queues}/skills/cloudflare-*/references/ | grep -c '\.md$'`
  is 15 — five per backing pack, names exactly B9's; and
  `ls plugins/stackgen/stacks/cloud-service/containers/skills/cloudflare-containers/references/ | grep -c '\.md$'`
  is 8.
- `find plugins/stackgen/stacks/cloud-service/{durable-objects,workflows,queues} -name config`
  is empty (B3);
  `find plugins/stackgen/stacks/cloud-service/containers/config -type f | sort`
  is exactly `config/wrangler.jsonc` and
  `config/.config/mise/tasks/p/_project/deploy`.
- `grep -L '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-{durable-objects,workflows,queues}.md`
  lists all three;
  `grep -n '^artifact: container-image$' plugins/stackgen/stacks/bundles/cloudflare-containers.md`
  hits once (B2).
- `grep -h '^category:' plugins/stackgen/stacks/cloud-service/{durable-objects,workflows,queues,containers}/pack.yaml`
  yields exactly `stateful-compute`, `orchestration`, `queue`, `compute`, each
  present on `taxonomy.md`'s `cloud-service` line.
- `grep -rn 'instead of' plugins/stackgen/stacks/bundles/cloudflare-containers.md`
  hits at least once and names `cloudflare-workers-ssr` (B4).
- `grep -rln 'contracts/orchestration.md' plugins/stackgen/stacks/cloud-service/{workflows,queues}`
  lists at least one file per pack (B5).

## Gates the orchestrator keeps

- **The menu check**, after wave 2: read `plugins/stackgen/stacks/bundles/` the
  way `stackgen-stack-menu` does — every `*.md` without `unconditional: true` is
  a menu row. The four new `cloudflare-*.md` files must each parse as
  frontmatter with `name`, `kind: cloud-provider`, the right `axis`, and two
  `components` refs whose targets exist on disk. Pass = four rows, all
  resolvable. A failure is a wave-2 finding routed to the owning unit.
- **The scratch materialization**, after wave 2 is green and before wave 3,
  adapted from `2026-09-05-cloudflare-workers-static/index.md:324-355`:
  1. Compose into a temp git repo whose directory is named `scratch.dev`, in the
     documented order, the `config/` trees of `toolchain-manager/mise`, the
     `toolchain-gate` packs, `repo-hygiene/repo-hygiene` and
     `cloud-service/containers` — the cloud pack **last** per the composition
     ruling in `.claude/skills/stackgen-plugin/SKILL.md` — skipping top-level
     `_`-prefixed entries.
  2. `wrangler.jsonc` lands at the repo root, parses as JSONC (strip comments,
     then `python3 -c "import json"`), carries `main`, `compatibility_date`, a
     `containers` array whose entry has `class_name`, `image` and
     `max_instances`, a `durable_objects.bindings` entry whose `class_name`
     matches the container's, and a `migrations` entry; the marked position
     `"name": "PLACEHOLDER"` is intact and clearly marked.
  3. The deploy task lands under `.config/mise/tasks/p/`, is executable, and is
     clean under
     `shellcheck -x -s bash -P .config/mise/tasks/_scripts -e SC2034 -e SC2154`
     and `shfmt -d -i 2 -ci`.
  4. With the `_project` directory renamed to `scratch` by hand and no
     credentials in the environment, `MISE_ENV=dev mise run p:scratch:deploy`
     exits **non-zero with a clear message naming the two environment variables
     it needs**, before invoking wrangler or Docker — never a wrangler auth
     trace or a Docker daemon error. `mise tasks` lists `p:scratch:deploy`; no
     `p:_project:*` task appears.
  5. `mise run plugins:check` from the worktree reports the pack accepted, and a
     dry read of `stacks/bundles/cloudflare-containers.md`'s frontmatter shows
     no `unconditional:` key — the menu must offer it.

  Pass = all five. A failure is a wave-2 finding routed to U5, not a GAP.
- **No scratch materialization for U2–U4** — they ship no `config/` tier.
- **`target-verifier`** runs inside U7: a hermetic install
  (`CLAUDE_CONFIG_DIR=/tmp/…`) of stackgen at the bumped version from the dev
  marketplace shows the four pack directories, the four bundle files, and
  `stacks/cloud-service/containers/config/wrangler.jsonc` plus the deploy task
  (executable) under the installed plugin's `stacks/`; an uninstall leaves
  nothing behind. Pass = both.
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

- **Workers AI, AI Gateway, AI Search, Browser Rendering, Agents SDK** — plan C,
  which requires this plan (the Agents SDK sits on Durable Objects). **Images,
  Realtime, Email Service, Secrets Store** — plan D.
- **Pages, Workers Sites, Stream, Turnstile** — retired or declined in plan A;
  nothing here re-opens them.
- **Zaraz, Logpush, Snippets, Cache Reserve, Workers for Platforms, WAF, DNS,
  Tunnels, Load Balancing, Rules, Pub/Sub** — as plan A: account-level or
  unverified.
- **A `deploy-target/container-image` component in the Containers bundle** —
  rejected under B2; the bundle mirrors `gcp-cloud-run.md`, provider + service
  only.
- **A Containers pack that layers onto a Workers SSR pin** — rejected under B4;
  a Containers project is a Workers project and pins `cloudflare-containers`
  instead.
- **Any taxonomy, kinds, pack-format, artifact-doctrine or contract edit** —
  plan A's; every token needed exists.
- **Any vwf file**; **new `plugins:check` rules**; **a public stackgen or site
  release** — as plan A.
- **A CI workflow file** in the Containers `config/` tier — rule 11 refuses one
  under `.github/`, and the deploy task is what CI runs.

## Parked

- **A Containers health probe task** (`p:<id>:health` or similar). The pack's
  `health.md` carries the doctrine (what to probe, and that a container behind a
  Durable Object is only reachable through the Worker); the `harness.health`
  task stays `n/a` like every other pack's. Decide with the first real
  Containers project.
- **`run_worker_first` and a Worker script in front of a static site** — still
  open from the Astro plan; unrelated to Containers but adjacent to the
  "complete `wrangler.jsonc`" ruling here.
- **A checker rule validating `category` against `taxonomy.md`**, **an
  enumerated `artifact:` token list**, **vwf capability tokens for the new
  categories** (`stateful-compute` among them), **a D1 migrations task
  overlay**, **`p:<id>:preview`**, **Turnstile**, **composite Cloudflare
  bundles**, **the stale `docs/memory/handoff/next.md`** — all carried from plan
  A's Parked list unchanged; not re-argued here.
- **Container image registry doctrine beyond Cloudflare's managed registry** —
  `wrangler deploy` builds and pushes to Cloudflare's registry; a project that
  wants its image in another registry (for GKE or Cloud Run too) is a
  cross-provider question the `deploy-target/container-image` pack should
  answer, not this one.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

Run in a fresh session:

/execute-plan docs/plans/2026-09-06-cloudflare-compute-and-orchestration
