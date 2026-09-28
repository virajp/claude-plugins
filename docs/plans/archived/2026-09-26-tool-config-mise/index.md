---
type: vwf-change-plan
title: tool-config mise — a stackgen skill owns mise config; packs call it
requires:
  - docs/plans/2026-09-26-mise-lock-sidecar-exclusions
backlog: [ B54 ]
backlog_pieces: [ B66 ]
---

# Plan — tool-config mise — a stackgen skill owns mise config; packs call it (2026-09-26)

## Status

**COMPLETE**

COMPLETE 2026-09-26 — c75e22b9 7fbb61da e9629bea ea4b87ea 67955fd3 42f74a4f
8c789df5 c5e5258c 256f8d90 be820d96 927dd5b3 7eb82f3e 609115f0 b85343d3
3d193abc; folder live — 18 gaps, all closed on branch
2026-09-26-tool-config-gaps

## Consent

| Action                                            | Granted                                                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                             |
| After landing: `mise run p:plugins:local`         | run                                                                                                                             |
| Release stackgen publicly                         | major — `1.34.0` → `2.0.0`, by editing `plugins/stackgen/.claude-plugin/plugin.json`; no release step, the chain ships after T3 |
| Release vwf publicly                              | major — `19.47.0` → `20.0.0`, by editing `plugins/vwf/.claude-plugin/plugin.json`; no release step, the chain ships after T3    |
| Release site publicly                             | none — not this time                                                                                                            |
| Release installer publicly                        | none — untouched                                                                                                                |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, a new user-invocable stackgen skill, `stackgen:tool-config`,
owns mise configuration: `/stackgen:tool-config mise <instruction>` writes the
layout B1 defined (`.config/miserc.toml`, settings-only mise files,
`.config/mise/conf.d/<section>[.<env>].toml`, the task library, one lock), the
mise pack's content lives in the skill, and every other pack asks for what it
needs through `tool-config:` calls in its `pack.yaml`. init and setup use the
skill. graphify becomes a universal dev tool with a `code:graph` task.

The framing, the user: *"Why not simply create a `mise` skill which knows how to
setup tools and other config in various environments and then let stackgen use
that skill to add whatever is required"*, then *"Let's create a skill called
`stackgen:tools:config` which as per the argument will configure all universal
tools"* (named `stackgen:tool-config` — a skill name takes no colon), and on how
packs contribute: *"Other stack will simply use the skill to install for which
they will call `stackgen:tool-config`. e.g.:
`/stackgen:tool-config mise
add latest version of "node" to "dev" environment`"*.
T1 of three: T2 (`docs/plans/2026-09-26-tool-config-gates`) moves dprint,
pre-commit, gitleaks, grype; T3 (`docs/plans/2026-09-26-tool-config-hygiene`)
moves repo-hygiene and finishes init's cutover. This plan finishes B54 and lands
the first piece of B66; it also carries B72's mise side.

**Reversals, all confirmed at the interview:**

1. The retired plans `docs/plans/archived/2026-09-26-universal-packs-into-init`
   (packs into vwf init), `…-mise-conf-d-packs` (init merges `mise.d/`) and
   `…-linter-pin-in-the-packs` — superseded, never run.
2. `docs/memory/decisions/2026-09-05-charter-fence-opens-for-gate-configs.md`
   payload kind (d), a provider's landed `conf.d/<pack>.toml` — retired; a pack
   calls the skill instead.
3. The mise pack as a copied payload (`2026-09-05-vwf-init-and-the-repo-shape`:
   "the packs own every file") — for mise, the skill owns the files; the pack
   directory and the `mise` unconditional bundle are removed.

## Facts the survey established

- **B1's layout** (`docs/plans/2026-09-26-mise-conf-d-layout`, lands first):
  `.config/miserc.toml` (`env_conf_d = true`, never `env`); `.config/mise.toml`
  and `.config/mise.<env>.toml` hold `[settings]` and top-level keys
  (`min_version`); every other section in
  `.config/mise/conf.d/<section>[.<env>].toml`; one `.config/mise/mise.lock`
  written only when missing or under `--upgrade` in dev, locked across the union
  of every environment suffix; `task.run_auto_install = false`;
  `lockfile_platforms = ["linux-x64", "macos-arm64"]`; `setup:all` refuses an
  unset `MISE_ENV`. B69 (`…-mise-lock-sidecar-exclusions`) follows it.
- **The mise pack** (`plugins/stackgen/stacks/toolchain-manager/mise/`, 41 files
  before B1): `pack.yaml` (version `1.7.0` after B1), `conventions.md`,
  `config/.config/**` (the mise files, `conf.d/` after B1,
  `vscode.d/mise.jsonc`, the task library under `mise/tasks/` with
  `_scripts/{helpers,helpers.mjs,checks,merge,placeholder}`),
  `skills/mise/{SKILL.md,references/**}` (copied into target repos today).
  Bundle: `plugins/stackgen/stacks/bundles/mise.md` (`unconditional: true`).
- **Init's marked positions in the mise files** (after B1: `REPO_NAME`,
  `MERGE_MODEL_DEVELOP`/`MAIN`, `MEMBERS`, `PATH_ENTRIES` in `conf.d/env.toml`;
  `RUNTIME_BLOCK` in `mise.toml`; `setup-<member>` aliases in
  `conf.d/shell_alias.dev.toml`); init's list is
  `plugins/vwf/skills/init/references/new-repo.md` §7 (:430–600 before B1); init
  fetches the `mise` slug through `/<plugin>:<plugin>-stack-template`
  (`new-repo.md:80-110`, `SKILL.md:745-771`) with an `answers:` map {forge,
  editor, secrets, update_bot}.
- **The five fragment packs** ship `config/.config/mise/conf.d/<pack>.toml`:
  pnpm (`[shell_alias] npx = "pnpm dlx"`), swiftlint (`[tools]`
  `aqua:realm/SwiftLint` 0.65.1), fnox (`[tools]` fnox), doppler (`[tools]`
  doppler; `[env]` `DOPPLER_CONFIG`, `DOPPLER_PROJECT` from a `config_root`
  template), swiftui (`[env]` `XCODE_VERSION`, `SIMULATOR_{PLATFORM,DEVICE,OS}`
  = `""`, `machine_env` in `pack.yaml:32-67`). swiftui's `_scripts/xcode:41-61`
  and `tasks/test/golden` read `.config/mise.toml [env]`; doppler's
  `tasks/setup/secrets:16,24` cite the fragment. Versions: pnpm `0.3.1`,
  swiftlint `0.1.1`, fnox `1.0.0`, doppler `1.0.0`, swiftui `0.2.0`; bundle pins
  — pnpm in 15 bundles, swiftlint in `swift-package.md`, `swift-swiftui.md`,
  fnox `fnox.md`, doppler `doppler.md`, swiftui `swift-swiftui.md`.
- **Landing today**: the materializer copies a `conf.d` fragment verbatim
  (`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md:116-131`);
  `/vwf:setup` fills `machine_env` in the landed fragment
  (`plugins/vwf/skills/setup/references/materialize.md:170-248`);
  `stackgen-sync` carries `machine_env` values (`SKILL.md:58-68,206-208`).
- **graphify today**: the mise pack's `tasks/setup/ai:180-195` runs
  `graphify install --platform claude` and `graphify hook install` when graphify
  is on PATH, else tells the user `mise use -g pipx:graphifyy@latest`. B72
  (backlog): no raw git hooks; a pre-commit `post-commit` hook running
  `mise x -- mise run code:graph` (T2); reference task: 95octane's
  `.config/mise/tasks/code/graph`. The PyPI name is `graphifyy`.
- **Checker** (`scripts/src/check.ts`): rule 11 `machine_env` via `PACK_CONF_D`
  :549, `packFactFaults` :554–676, tests `check.test.ts:671-790`; pack walks
  glob `stacks/*/*` (:432, :1272, :1300); `inventory.ts:69,178,247` read
  `unconditional`; `.config/mise/tasks/p/plugins/shellcheck:45,74` scope
  `plugins/*/stacks/*/*`; this repo's payload exclusions
  `.config/dprint.json:10`, `.config/pre-commit-config.yaml:105,129,151`. Rule
  10 bars tool names in vwf outside its exemptions.
- **Doctor**: `plugins/vwf/skills/doctor/references/stack-checks.md`
  missing-mise :276–291, (a) :378–399 (pack versions from the stackgen lock),
  (e) :462–541 (re-tests a record against the pack payload at `source:`).
- **stackgen does not depend on vwf** (vwf depends on stackgen), so the skill is
  stackgen's; vwf names no tool.
- **Commit convention**: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no
  scopes. **Versions** after B1: stackgen `1.34.0`, vwf `19.47.0`, untagged.

## Assumed decisions — confirm or override at review

| #  | Decision         | Ruling                                                                                                                                                                                                                                                                                                                                                                                              | Rejected                                                                                                         | Unit  |
| -- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----- |
| 1  | The skill        | `plugins/stackgen/skills/tool-config/`, user-invocable and model-invocable: `/stackgen:tool-config <tool> <instruction>` or `/stackgen:tool-config all [answers]`. `SKILL.md` is the contract (argument grammar, block markers, drift, removal, lock recording); `references/<tool>.md` is each tool's doctrine and verbs; `assets/<tool>/` its static files and templates. This plan ships `mise`. | a skill per tool; `stackgen:tools:config` (a colon is not a legal skill-name character); `stackgen:tools-config` | U2    |
| 2  | Content home     | The mise pack's content moves into the skill: `config/.config/**` → `assets/mise/.config/**` (the landed shape), `conventions.md`, `skills/mise/**` and `pack.yaml`'s facts → `references/mise.md`. `plugins/stackgen/stacks/toolchain-manager/mise/` and `bundles/mise.md` are deleted; no mise skill is copied into target repos any more.                                                        | packs stay as data; keeping the landed repo skill                                                                | U1 U2 |
| 3  | Blocks           | The skill writes each requester's lines between `# >>> <requester>` / `# <<< <requester>` (`//` in JSONC); the base is the tool's own name (`# >>> mise`). Lines outside every block are the user's and never touched. Where a format has no comments (plain JSON), provenance is kept in the lock entry. A section file exists only while it has content.                                          | per-block hashes                                                                                                 | U2    |
| 4  | Drift            | On a later run, a block differing from what its requester would write is shown with take theirs / keep mine / merge — no hash. The user: *"skill must check with user on what to do and accordingly do it"*. `machine_env` values are never drift.                                                                                                                                                  | a hash test                                                                                                      | U2    |
| 5  | Removal          | `/stackgen:tool-config <tool> remove <requester>` deletes that requester's blocks; the materializer calls it when a pack is dropped.                                                                                                                                                                                                                                                                | —                                                                                                                | U2 U4 |
| 6  | Pack calls       | A pack lists its calls in `pack.yaml` under `tool-config:`, one instruction per line (`mise add tool swiftlint 0.65.1 to all environments`); the materializer runs them, tagging `for <pack>`. The five `conf.d/<pack>.toml` fragments become such calls and are deleted; `mise.d/` never exists.                                                                                                   | a declarative `tool.d/` folder                                                                                   | U3 U4 |
| 7  | init             | init calls `/stackgen:tool-config all` with its answers (repo name, members, merge models, runtimes, editor, forge, secrets, update bot) as arguments — `all` lands every tool the skill owns (mise, in T1) — then fetches the unconditional bundles that remain through the stack adapter. Marked positions become arguments. vwf still names no tool.                                             | init naming `mise`                                                                                               | U6    |
| 8  | setup and doctor | `/vwf:setup` fills a `machine_env` value with `/stackgen:tool-config mise set env <KEY>=<value> for <pack>`. The stackgen lock records what the skill writes as `source: tool-config/<tool>@<stackgen version>`; doctor (a) and (e) read that (re-testing against `tool-config/assets/<tool>/`); the missing-mise finding names the skill.                                                          | —                                                                                                                | U7    |
| 9  | graphify (B72)   | `"pipx:graphifyy" = "latest"` in the mise base's `conf.d/tools.dev.toml` (dev only); a `code:graph` task in the task library (after 95octane's); `setup:ai` no longer runs `graphify hook install`. The pre-commit `post-commit` hook is T2's.                                                                                                                                                      | every environment; keeping B72 separate                                                                          | U8    |
| 10 | Scripts          | swiftui's `_scripts/xcode` and `tasks/test/golden`, doppler's `tasks/setup/secrets`, read values from the environment mise exports, not a file.                                                                                                                                                                                                                                                     | parsing `conf.d/env.toml`                                                                                        | U3    |
| 11 | Checker          | Rule 11: each `machine_env` name must be set by a `mise … env` call in the pack's `tool-config:` list; a file under a pack's `config/.config/mise/conf.d/` is a finding. The pack walks (:432, :1272, :1300), rule 13, shellcheck and this repo's payload exclusions also cover `plugins/stackgen/skills/tool-config/assets/*`. `inventory.ts` drops the mise bundle.                               | —                                                                                                                | U5    |
| 12 | Review row       | One `Kind: review` row (U9): shell tasks, the checker and the task library move.                                                                                                                                                                                                                                                                                                                    | the wave review alone                                                                                            | U9    |
| 13 | Release          | stackgen `1.34.0` → `2.0.0`, vwf `19.47.0` → `20.0.0`; T2 and T3 ride them; no release step — T3 carries `/release` (ask).                                                                                                                                                                                                                                                                          | minors; release after each plan                                                                                  | U11   |
| 14 | Pack bumps       | pnpm, swiftlint, fnox, doppler, swiftui each bump one minor from their `pack.yaml` version at run time (skipping a 13 or 17 component), with every bundle pin and `inventory.md`, in one commit.                                                                                                                                                                                                    | leaving pack versions unchanged                                                                                  | U11   |
| 15 | Comments         | Any comment or sentence a unit adds is one line (B65).                                                                                                                                                                                                                                                                                                                                              | —                                                                                                                | all   |

## New dependencies

none — `pipx:graphifyy` is a mise tool pin, already recommended by the task
library.

## Units

| Id  | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Depends on         | Status | Commit            |
| --- | ---- | ---------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------ | ----------------- |
| U1  | 1    | [01-move.md](01-move.md)                       | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/**`, `plugins/stackgen/stacks/bundles/mise.md`, `plugins/stackgen/skills/tool-config/assets/mise/**` (new), `plugins/stackgen/skills/tool-config/references/mise/**` (new, raw material), `plugins/stackgen/skills/tool-config/SKILL.md` (stub)                                                                                                                                                                                                                                                                                                                        | —                  | green  | 7fbb61da          |
| U3  | 1    | [03-five-packs.md](03-five-packs.md)           | edit   | `plugins/stackgen/stacks/package-manager/pnpm/**`, `plugins/stackgen/stacks/toolchain-gate/swiftlint/**`, `plugins/stackgen/stacks/capability-provider/fnox/**`, `plugins/stackgen/stacks/capability-provider/doppler/**`, `plugins/stackgen/stacks/app-framework/swiftui/**` (not their `version:` lines)                                                                                                                                                                                                                                                                                                             | —                  | green  | 7fbb61da          |
| U4  | 1    | [04-stackgen-skills.md](04-stackgen-skills.md) | edit   | `plugins/stackgen/skills/stackgen-stack-template/**`, `plugins/stackgen/skills/stackgen-stack-menu/**`, `plugins/stackgen/skills/stackgen-sync/**`, `plugins/stackgen/assets/{pack-format,output-tree,kinds}.md`, `plugins/stackgen/stacks/readme.md`                                                                                                                                                                                                                                                                                                                                                                  | —                  | green  | e9629bea          |
| U5  | 1    | [05-checker.md](05-checker.md)                 | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `scripts/src/inventory.ts`, `.config/mise/tasks/p/plugins/shellcheck`, `.config/dprint.json`, `.config/pre-commit-config.yaml`                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                  | green  | c75e22b9          |
| U6  | 1    | [06-init.md](06-init.md)                       | edit   | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —                  | green  | ea4b87ea c5e5258c |
| U7  | 1    | [07-setup-doctor.md](07-setup-doctor.md)       | edit   | `plugins/vwf/skills/setup/**`, `plugins/vwf/skills/doctor/**`, `plugins/vwf/assets/stack-adapter.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —                  | green  | 67955fd3          |
| U2  | 2    | [02-skill.md](02-skill.md)                     | edit   | `plugins/stackgen/skills/tool-config/SKILL.md` (new), `plugins/stackgen/skills/tool-config/references/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | U1                 | green  | 42f74a4f          |
| U8  | 2    | [08-mise-assets.md](08-mise-assets.md)         | edit   | `plugins/stackgen/skills/tool-config/assets/mise/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | U1                 | green  | 8c789df5          |
| U9  | 3    | [09-review.md](09-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | U3, U5, U8         | green  |                   |
| U10 | 4    | [10-docs.md](10-docs.md)                       | edit   | `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-26-tool-config.md` (new); widened at run time (R1 rule 5): `plugins/stackgen/assets/taxonomy.md`, the prose/comment passages naming the retired toolchain-manager pack in `plugins/stackgen/stacks/**` (bundles/swift-swiftui.md, flutter + repo-hygiene conventions.md, pack task-file header comments, pre-commit linter.yaml); widened (U9): `plugins/vwf/skills/doctor/references/code-intelligence.md`, `plugins/vwf/assets/graphify.md`, `plugins/stackgen/assets/pack-format.md` (the `mise … env` spelling) | U2, U4, U6, U7, U9 | green  | b85343d3          |
| U11 | 5    | [11-gates-and-bump.md](11-gates-and-bump.md)   | edit   | `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`, the `version:` line of the five packs' `pack.yaml`, every `plugins/stackgen/stacks/bundles/*.md` pin naming them                                                                                                                                                                                                                                                                                                                                   | U10                | green  | 3d193abc          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                            | Why it collides                                          | Owner                                  |
| --------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------- |
| `plugins/stackgen/skills/tool-config/assets/mise/**`            | U1 moves it in, U8 edits it                              | U1 (wave 1), then U8 (wave 2)          |
| `plugins/stackgen/skills/tool-config/references/**`             | U1 moves raw material in, U2 writes the reference        | U1 (wave 1), then U2 (wave 2)          |
| `plugins/stackgen/skills/tool-config/SKILL.md`                  | U1 writes a stub so wave 1's gate sees a valid skill     | U1 (wave 1), then U2 (wave 2)          |
| the five packs' `pack.yaml` `version:` lines, their bundle pins | a version, its pins and the inventory land in one commit | U11 only (U3 edits the rest in wave 1) |
| both `plugin.json` files, `marketplace.json`, `inventory.md`    | version and generated files                              | U11 only                               |
| every human-facing doc outside `plugins/`                       | n units, one doc                                         | U10 only                               |

## Waves

- **Wave 1 — U1, U3, U4, U5, U6, U7.** Disjoint paths; every unit writes against
  the new paths. **Commit order: U5 first** (it owns
  `.config/pre-commit-config.yaml`; an unstaged own config aborts every commit),
  **U1 second**, then the rest.
- **Wave 2 — U2, U8**, inside the moved tree (disjoint: `SKILL.md` and
  `references/**` vs `assets/mise/**`).
- **Wave 3 — U9**, review. **Wave 4 — U10**, docs. **Wave 5 — U11**, gates and
  bumps.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `mise run code:precommit`
- `mise run p:site:check`

every line with `MISE_ENV=dev` exported, plus the wave review, plus every report
read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                          |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen `2.0.0` and vwf `20.0.0` on this machine; picked up by a **restarted** session |

## Gates the orchestrator keeps

**The skill in a scratch repo**, after wave 2, isolated (`HOME` and every
`MISE_*` dir under one `mktemp -d`): follow
`plugins/stackgen/skills/tool-config/SKILL.md` and `references/mise.md` by hand
for `/stackgen:tool-config mise repo=scratch`, then run swiftui's and doppler's
`tool-config:` calls. Pass condition: the B1 layout lands (`miserc.toml`,
settings-only mise files, `conf.d/*` section files, the task library);
`conf.d/env.toml` and `conf.d/tools.toml` carry `# >>> swiftui` /
`# >>> doppler` blocks; `conf.d/tools.dev.toml` carries `pipx:graphifyy` in the
`mise` block; `MISE_ENV=dev mise config ls` succeeds; `remove swiftui` deletes
only swiftui's blocks; a line added outside every block survives. Record in the
Run log; a failure goes back to U2 or U8.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff,
under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **dprint, pre-commit, gitleaks, grype** — T2
  (`docs/plans/2026-09-26-tool-config-gates`), including the graphify
  `post-commit` hook and `all add exclude [generated]`.
- **repo-hygiene, `.editorconfig` dropped, init's final cutover** — T3
  (`docs/plans/2026-09-26-tool-config-hygiene`).
- **B67** (`docs/plans/2026-09-26-init-commits-the-lock`) — repointed to run
  after T3.
- **B70** (linter pin into the packs), **B68 + the version gate**, **B65** —
  later plans.

## Parked

- B66: the gate tools and repo-hygiene move into `stackgen:tool-config` —
  planned as `docs/plans/2026-09-26-tool-config-gates` (T2) and
  `docs/plans/2026-09-26-tool-config-hygiene` (T3), which finishes it.

## Gaps surfaced during execution

All closed 2026-09-26 on branch `2026-09-26-tool-config-gaps`, on the user's
ruling to take every recommendation: 13 pins uv; 14 adds the alias conflict row
and fixes the checker leftovers; 4–10, 16–18 are fixed as the decision doc
`docs/memory/decisions/2026-09-26-tool-config.md` records under "Follow-up"; 11
is folded into T2 (`setup:precommit` uninstalls the raw hook before installing
its own); 12 is accepted (the lock pins CI). 1–3 and 15 were resolved during the
run. Source in brackets.

1. [run, wave 1] The plan let only U11 regenerate `inventory.md`, but the
   pre-commit inventory hook refuses a stacks-touching commit while it is stale.
   Ruling taken at run time (the user): regenerate with each such commit.
   Resolved.
2. [run, wave 1] U5's checker refuses U1 alone and U3 alone; they landed as one
   commit, 7fbb61da. Plan hole: the commit order ignored the checker. Resolved.
3. [R1] `plugins/stackgen/assets/taxonomy.md` and the other passages naming the
   retired toolchain-manager pack had no owner; U10's Owns widened.
4. [U9 engine #1, U7, dropped: uncovered] doctor (a) compares
   `tool-config/<tool>@<version>` to the installed stackgen version, and an
   idempotent `all` never re-records, so the drift never clears.
5. [U9 engine #2, U7, dropped: uncovered] setup's "value set elsewhere moves in"
   removes an outside-block line the skill has no verb for; with swiftui's
   pin-source guard gone, a leftover `.config/mise.toml [env]` value may
   override silently.
6. [U9 engine #3, U4, dropped: uncovered] stackgen-sync points a changed
   `tool-config:` list at `/vwf:setup reshape`, which never re-runs a landed
   pack's calls.
7. [U9 engine #4, U4, dropped: uncovered] the retired `toolchain-manager`
   heading in `kinds.md` still matches inventory's kind reader, so the retired
   kind is still counted and accepted.
8. [U9 engine #6, U6, dropped: uncovered] init pass 1 reports a root
   `.mise.toml` as a stray while the toolchain migration folds it.
9. [U9 engine #7, U2, dropped: uncovered] tool-config SKILL.md says a call with
   no `for` writes a user line, and elsewhere that outside-block lines are never
   touched.
10. [U9 engine #8, U4, dropped: uncovered] the materializer's dry-run shows only
    call text; the skill's conflict and drift rows appear after consent.
11. [U9 engine #10, U8, contested] setup:ai stops installing graphify's raw hook
    but never uninstalls it in repos shaped earlier — T2's hook work.
12. [U9 security S4, recorded] graphifyy, doppler and fnox pin `latest` in dev
    (ruling 9; pre-existing for the two providers); CI stays locked.
13. [U9 engine #5, U8, open — a ruling for the user] `"pipx:graphifyy"` in the
    mise base's `tools.dev.toml` needs uv or pipx on PATH, and no asset pins
    either; a clean non-Python dev laptop's `setup:all` fails at `mise install`.
    The fix is a new tool pin (uv), which the plan's New dependencies (`none`)
    does not allow.
14. [U9 round 3, convergence guard — contested] The review loop ended at round 3
    when its confirmed count (5) did not fall below round 2's (3): each round's
    fixes to the call-input rules surfaced the next edge. Look at the loop, not
    the contract. Open: U2 medium — `add alias` has no conflict rule, so a pack
    alias equal to a base `setup-<member>` alias, or two packs' `npx`, writes a
    duplicate TOML key; U2 low — whether a quoted value is taken escaped or raw;
    U5 low — a bare value may end in a quote; U5 nits — a weak unclosed-quote
    alias test, an anchored pattern in the error text.
15. [U9 round 2] `plugins/vwf/skills/doctor/references/code-intelligence.md:32`
    and `plugins/vwf/assets/graphify.md:99` still expect graphify's post-commit
    hook; `plugins/stackgen/assets/pack-format.md:256` still spells `mise … env`
    without `to <scope>`. No owner; U10's Owns widened.
16. [R1, R4 — open] Header comments in pack `config/` payload task files
    (flutter, uv, swift, workers-*, containers) and the pre-commit pack's
    `linter.yaml:52` still say helpers ship in the toolchain-manager pack. A fix
    changes payload, so those packs would need a version bump outside U11's
    five; left for T2/T3, which touch those packs.
17. [U7, U10 — pre-existing, open] setup's `references/onboard-pipeline.md:60`
    says doctor's six predicates; there are seven.
18. [final scratch gate — open, minor] In `mise.toml` the frame rule pulls the
    comment on the version `env_conf_d` was tested on above the mise block, away
    from `min_version`; and "the words are what count" in the drift test would
    collapse repeated spaces inside a quoted value.

## Run log

| Wave | Unit                                | Model | Round | Outcome      | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Commit   |
| ---- | ----------------------------------- | ----- | ----- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight                           | opus  | 1     | pass         | node edit; doctor: not onboarded (no .config/vwf.yaml), no blocking; wave gate 7/7 green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 0    | format check                        | —     | —     | skipped      | why: no covers:, no blueprint artifact read                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| 0    | conventions                         | —     | —     | skipped      | why: no code unit; journal not written — mempalace read-only (peer writer)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| 1    | U1 move                             | opus  | 1     | pass         | node edit; mise pack moved into tool-config/assets/mise + references/mise (48 files, 31 exec kept); bundles/mise.md rm; SKILL.md stub. GAP: nested references/mise/mise/SKILL.md assumed undiscovered — U2 folds it in                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | U7 setup-doctor                     | opus  | 1     | pass         | node edit; setup materialize sets machine_env via /stackgen:tool-config set env; Step 0 + onboard shape test accept tool-config/<tool>@<v>; doctor (a)/(e) read tool-config records; stack-adapter names the skill. DECIDED: <tool> read from the pack's own tool-config env line; detect-on-hash-match kept. DOCS FALSIFIED: onboard-pipeline.md:60 six→seven predicates. GAP: assumes template payload carries the pack's tool-config: list (U4)                                                                                                                                                                                                                            | —        |
| 1    | U4 stackgen-skills                  | opus  | 1     | pass         | node edit; materializer runs pack tool-config: calls + remove on drop, conf.d fragment rule gone; stack-template/menu/sync drop toolchain-manager + mise slug; pack-format adds tool-config: key; output-tree, kinds (13→12), stacks/readme updated. DECIDED: example env call spelled mise add env XCODE_VERSION="" to all environments (U2 owns grammar). DOCS FALSIFIED: plugins/stackgen/assets/taxonomy.md:44,235 toolchain-manager type + bundle — no owner; GAP: handed to U10, Owns widened at wave 4                                                                                                                                                                 | —        |
| 1    | U3 five-packs                       | opus  | 1     | pass         | node edit; pnpm, swiftlint, fnox, doppler, swiftui pack.yaml gain tool-config: lists, 5 conf.d fragments rm; swiftui xcode/golden + doppler setup/secrets read env; prose updated. DECIDED: grammar mise add tool/env/alias … to all environments or to dev environment (U2 must parse); pnpm alias dev-only per plan; stale-pin file check removed (decision 10). GAP: doppler references/access-shape.md:40-55 still says CLI in .config/mise.dev.toml — pre-existing, left                                                                                                                                                                                                 | —        |
| 1    | U5 checker                          | opus  | 1     | pass         | node edit; rule 11 machine_env must be set by a mise … env call in tool-config:, conf.d fragment is a finding, config-tier + rule 13 walk tool-config/assets/<tool>/; tests replaced; shellcheck task, dprint.json, pre-commit hook cover the assets. DECIDED: inventory.ts unchanged (no mise logic); machine_env with no tool-config: list now fails. DOCS FALSIFIED: CLAUDE.md Tasks rule-11 text (conf.d fragment); .claude/skills/plugin-authoring rule-11 text. GAP: inventory.test.ts red — inventory.md stale since U1 removed the mise pack; U11 regenerates                                                                                                         | —        |
| 1    | U6 init                             | opus  | 1     | pass         | node edit; init lands via /stackgen:tool-config all then repo-gates + repo-hygiene; marked positions become arguments; shaped counts tool-config/… records; existing-repo passes repointed; tool-configs.md mise row removed. GAP: argument keys chosen — repo members linkage merge_model_develop merge_model_main runtimes plugin_sources plugins forge editor secrets update_bot — U2 must accept exactly these; all assumed idempotent; skill assumed to migrate legacy MERGE_MODEL and fold old root + conf.d/<pack>.toml files. DOCS FALSIFIED: CLAUDE.md three unconditional bundles, seven-row table .mise.toml, §7 splice passages; site plugins/vwf.md init section | —        |
| 1    | R1                                  | opus  | 1     | findings(9)  | node review; CONTRACT clean, RULINGS clean; fold >80 in U3/U4/U6/U7 files; U3 pnpm conventions.md:66-68 toolchain-manager order — looped to U3 U4 U6 U7. Rule-5 in unowned files → U10: bundles/swift-swiftui.md:67, flutter/conventions.md:55, repo-hygiene/conventions.md:145, ~20 pack task comments naming the toolchain-manager pack, pre-commit linter.yaml:52. GAP: inventory.md regenerated with each stacks-touching unit commit (user ruling 2026-09-26) — the pre-commit inventory hook refuses those commits otherwise                                                                                                                                            | —        |
| 1    | U6 init                             | opus  | 2     | pass         | node edit; R1 fold fixes existing-repo.md:505,591, new-repo.md:319-321                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | U7 setup-doctor                     | opus  | 2     | pass         | node edit; R1 fold fixes stack-checks.md (5 lines), setup/SKILL.md Step 0 paragraph                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 1    | U4 stackgen-skills                  | opus  | 2     | pass         | node edit; R1 fold fixes kinds, output-tree, pack-format, materializer, stackgen-sync, stacks/readme. DECIDED: pack-format.md:162 and stack-template SKILL.md:80 stay long — pre-existing one-line YAML kind: enumerations                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| 1    | U3 five-packs                       | opus  | 2     | pass         | node edit; R1 fixes: pnpm conventions order → mise base from stackgen:tool-config; swiftui fold; 15 pnpm/swiftui task comments now say helpers ships with stackgen:tool-config; tool-config: comments <80. DECIDED: doppler DOPPLER_PROJECT instruction line (97) stays one line; lowercase toolchain manager's slot wording kept (the role, not the pack)                                                                                                                                                                                                                                                                                                                    | —        |
| 1    | R1                                  | opus  | 2     | pass         | node review; FINDINGS 0, CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | wave gate                           | —     | 1     | pass         | 7/7 green after inventory regen; precommit pass 2 clean. GAP: U1+U3 committed as one (7fbb61da) — U5's checker refuses each alone; commit order U5, U1+U3, U4, U6, U7                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 1    | commits                             | —     | —     | pass         | U5 c75e22b9, U1+U3 7fbb61da, U4 e9629bea, U6 ea4b87ea, U7 67955fd3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —        |
| 2    | U8 mise-assets                      | opus  | 1     | pass         | node edit; tools.dev.toml pins pipx:graphifyy (latest, table form); new tasks/code/graph (755, after 95octane's, --force usage flag); setup:ai drops graphify hook install. DECIDED: table form of the pin; 95octane task found at 95octane/95octane not workspace. DOCS FALSIFIED: references/mise/mise/references/task-library.md — forwarded to U2                                                                                                                                                                                                                                                                                                                         | —        |
| 2    | U2 skill                            | opus  | 1     | pass         | node edit; tool-config SKILL.md full contract (argument shapes, all key table, block markers, drift, removal, lock record); references/mise.md (~900 lines, one file) folds the old pack skill; raw references/mise/ removed. DECIDED: comma lists, key= empty, omitted key keeps current; machine value = empty env key, never drift; keep-mine recorded as kept: in lock; RUNTIME_BLOCK node.compile=false only (npm.package_manager dropped); clashing add = conflict row; no for = user line. GAP: fold of old root + conf.d fragments assumed — split root mise files, fragments become pack blocks, old per-env locks deleted                                           | —        |
| 2    | gate: skill in scratch repo         | opus  | 1     | pass         | 6/6 conditions pass (isolated HOME + MISE dirs; B1 layout, swiftui/doppler blocks, graphifyy in mise block, mise config ls ok, remove swiftui removes only its block, user line survives). Ambiguities → U2: SKILL.md:39-41 tool+key=value shape unnamed; SKILL.md:72-74 default for editor/linkage/runtimes absent in mise.md §3; mise.md:244-247 header extent; SKILL.md:96-99 blank line between blocks. Stale → U8: assets tools.toml:7-11, tools.dev.toml:22-24 still say a provider ships a conf.d fragment                                                                                                                                                             | —        |
| 2    | R2                                  | opus  | 1     | findings(5)  | node review; CONTRACT clean; RULINGS: U2 departed from #4 (kept: suppresses the drift question until the version moves). U8 tools.dev.toml:16 breaks shipped taplo alignment; stale provider conf.d comments in U8 assets; code:graph post-commit claim (T2 hook) in U8 + U2; U2 machine value keyed to empty value not machine_env names; U6 new-repo.md:91,94 list spelling unpinned. Looped to U2, U8, U6 (U6 re-commit)                                                                                                                                                                                                                                                   | —        |
| 2    | U8 mise-assets                      | opus  | 2     | pass         | node edit; R2 fixes: tools.dev.toml shipped-taplo clean; provider comments in tools.toml, tools.dev.toml, setup/secrets name the pack tool-config: calls; setup/ai + code/graph say run by hand. DECIDED: shipped taplo also reordered tools.toml linter pin keys (pre-existing drift), kept                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 2    | U6 init                             | opus  | 3     | pass         | node edit; R2 fix: new-repo.md §2 spells tool-config all values (comma lists, key= empty, omitted keeps); §5 §7 §11(a) examples use it. DECIDED: init passes every key on every call so an empty answer clears                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 2    | U2 skill                            | opus  | 2     | pass         | node edit; R2 fixes: keep mine this run only (kept: gone, per #4); drift exemption = requesting pack's machine_env names; third shape tool key=value lands one tool's base; list spelling once; one blank line between blocks; header = leading comment/blank run; defaults table; code:graph run by hand. DECIDED: linkage default submodules if .gitmodules else siblings, editor none, lists empty, repo unfilled, merge models direct and pr                                                                                                                                                                                                                              | —        |
| 2    | R2                                  | opus  | 2     | findings(2)  | node review; CONTRACT clean, RULINGS clean; converging (5→2). linkage spelled submodules in U2 SKILL.md:70, mise.md:302,327 and U6 new-repo.md:92 (vocabulary is submodule); mise.md:246 fold 82. GAP: a third fix round past the two-round cap — one-word cross-unit spelling defect, too cheap to leave contested and land                                                                                                                                                                                                                                                                                                                                                  | —        |
| 2    | U2 + U6                             | opus  | 3     | pass         | node edit; linkage value submodule in SKILL.md, mise.md, new-repo.md:92; mise.md fold fixed. Orchestrator grep: no plural value left                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 2    | wave gate                           | —     | 1     | pass         | 7/7 green (precommit clean on pass 2); commits U2 42f74a4f, U8 8c789df5, U6 fix c5e5258c                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 3    | U9                                  | opus  | 1     | findings(12) | node review; range 09b0fd10..78e87d8a; engine 10 (8 confirmed, 2 partly) + 2 own. Routed: U5 #9 (merged with security 3), U8 #5 #11 #12. 6 findings on uncovered units dropped (U7 #1 #2, U4 #3 #4 #8, U6 #6, U2 #7) — recorded as gaps. #10 graphify hook uninstall in shaped repos → T2, contested                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 3    | U9                                  | opus  | 1     | findings(4)  | node security; engine none; S1 S2 (Low) on references/mise.md — map says U2 (42f74a4f), not U8 as labelled; coverage widened to U2 (security routes regardless). S3 (Info) U5 check.ts tool-config: grammar ungated. S4 (Info) latest pins graphifyy/doppler/fnox — ruling 9 and pre-existing, dev only, CI locked; recorded, not changed                                                                                                                                                                                                                                                                                                                                     | —        |
| 3    | U5 checker                          | opus  | 2     | pass         | node edit; U9 fix: rule 11 parses every tool-config: entry against the pack verbs (add tool/env/alias + scope), flags bad names and templates outside add env values; machine_env set only by add env. DECIDED: templates allowed in add env values only (mise.md §4, doppler); alias names held to env-name pattern; non-mise tools refused until T2 widens                                                                                                                                                                                                                                                                                                                  | 256f8d90 |
| 3    | U2 skill                            | opus  | 4     | pass         | node edit; U9 security fix (coverage widened): mise.md §4 What a call may carry — key/alias name pattern, tool-name charset, every value an escaped TOML basic string; templates only in add env … for <requester>; set env and add env without for refuse template delimiters. SKILL.md points at it                                                                                                                                                                                                                                                                                                                                                                         | be820d96 |
| 3    | U8 mise-assets                      | opus  | 3     | pass         | node edit; U9 fix: code:graph description says run by hand; tools.toml comment names the mise base. GAP: pipx:graphifyy needs uv or pipx and the plan lists neither — mise docs: pypi installs via uv, falls back to pipx; no setting fixes it; pin kept per ruling 9                                                                                                                                                                                                                                                                                                                                                                                                         | 927dd5b3 |
| 3    | U9                                  | opus  | 2     | findings(3)  | node review; range 09b0fd10..927dd5b3; fixes 256f8d90 be820d96 927dd5b3 verified. Routed: U5 {# delimiter + unbalanced quote; U2 + U5 alias names allow - (the rule came from security S2, coverage stays widened). Rule-5 to U10 (Owns widened): doctor code-intelligence.md:32 + assets/graphify.md:99 still expect graphify's post-commit hook; stackgen assets/pack-format.md:256 mise … env without to <scope>. Rejected: ref:main version specs (mise.md:393 narrows on purpose), code:graph body. Guard: converging (round 1 routed 6, round 2 routed 3)                                                                                                               | —        |
| 3    | U9                                  | opus  | 2     | pass         | node security; S1 S2 S3 closed (be820d96, 256f8d90); {# and alias hyphen are correctness not security; nothing new                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —        |
| 3    | U5 checker                          | opus  | 3     | pass         | node edit; U9 round-2 fix: {# refused; unclosed quote refused; alias names allow - after the first char, env keys strict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 7eb82f3e |
| 3    | U2 skill                            | opus  | 5     | pass         | node edit; U9 round-2 fix: alias-name pattern allows - after the first char, env keys strict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 609115f0 |
| 3    | U9                                  | opus  | 3     | findings(5)  | node review; range 09b0fd10..609115f0; round-2 fixes 7eb82f3e 609115f0 verified. Confirmed: U2 medium add alias has no conflict rule (pack alias setup-<member> or two packs' npx → duplicate TOML key); U2 low quoted-value escaping unstated; U5 low bare value may end in a quote; U5 nit weak alias unclosed-quote test; U5 nit error prints anchored pattern. Rejected: docs (U10 has it), pattern-agreement test. GUARD: 5 not < 3 — loop ends, residuals contested (oscillation), row green                                                                                                                                                                            | —        |
| 3    | U9                                  | opus  | 3     | pass         | node security; engine none; alias collision and quote escaping are correctness, not security                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 3    | R3                                  | opus  | 1     | findings(1)  | node review; CONTRACT clean, RULINGS clean (add env as the only machine_env setter is within #11). U8 tools.toml:4 comment line 90 cols — contested: payload TOML, shipped taplo passes, and a fix would force a full late re-run of U9 for a comment wrap                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| 3    | wave gate                           | —     | 1     | pass         | 7/7 green (precommit clean on pass 2); U9 green, residuals contested (gap 14)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —        |
| —    | acceptance                          | —     | —     | skipped      | why: no covers: — no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| —    | ux                                  | —     | —     | skipped      | why: no covers: — no Screens contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| —    | reconcile                           | —     | —     | skipped      | why: no covers: (no stamps, registry, environment); no code unit (nothing to persist); mempalace read-only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| 4    | U10 docs                            | opus  | 1     | pass         | node edit; repo map rule 11 + init + stackgen row; .claude skills and docs; readme; site plugins stackgen/vwf (new /stackgen:tool-config section), choosing-your-stack; decision doc 2026-09-26-tool-config.md; widened plugins prose (taxonomy, pack-format:256, swift-swiftui, flutter/ruff/repo-hygiene conventions, doppler access-shape, code-intelligence:32, graphify.md). DECIDED: a missing raw graphify hook is no doctor finding. Looped: site vwf.md ~3446 hook passage (own Owns); widened setup/SKILL.md:311, doctor/SKILL.md:7,178; doppler access-shape vs pack.yaml environments                                                                             | —        |
| 4    | U10 docs                            | opus  | 2     | pass         | node edit; site vwf.md ~3457, setup/SKILL.md:311, doctor/SKILL.md:7,178 — no refresh hook, code:graph run by hand; site stackgen.md:302-313 swiftui pin via tool-config calls; doppler access-shape matches pack.yaml (tool + DOPPLER_CONFIG + DOPPLER_PROJECT, all environments). Gates green                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 4    | R4                                  | opus  | 1     | findings(4)  | node review; CONTRACT clean, RULINGS clean, decision doc exists, anchor resolves. Looped to U10: .claude vwf-plugin references/assets.md:29 hook degradation; widened plugins/vwf/assets/membership.md:196 and stacks/bundles/repo-gates.md:29 (three bundles). Payload header comments naming the toolchain-manager pack (flutter, uv, swift, workers, containers tasks; pre-commit linter.yaml:52) left — a fix needs pack bumps outside U11's five; recorded as gap 16                                                                                                                                                                                                     | —        |
| 4    | R4                                  | opus  | 2     | findings(2)  | node review; CONTRACT clean, RULINGS clean; round-1 passages correct; two new >80 folds (repo-gates.md:30, membership.md:197) refolded by U10 outside the two-round cap and verified by orchestrator awk — no line over 80                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| 4    | wave gate                           | —     | 1     | pass         | 7/7 green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| 5    | U11 gates-and-bump                  | opus  | 1     | pass         | node edit; stackgen 2.0.0, vwf 20.0.0; pnpm 0.4.0, swiftlint 0.2.0, fnox 1.1.0, doppler 1.1.0, swiftui 0.3.0; 20 pins in 19 bundles; marketplace.json + inventory.md regenerated; gate 7/7. R5: FINDINGS 0, CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| —    | gate: skill in scratch repo (final) | opus  | 2     | pass         | 7/7 over the finished tree (isolated); new condition: set env with a template value refused, plain value fills the swiftui block. Ambiguities → gap 18                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| —    | final wave gate                     | —     | 1     | pass         | 7/7 green over the finished tree (precommit clean on pass 2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| —    | landing                             | —     | —     | pass         | Status COMPLETE; folder stays live (18 gaps, 13 and 14 need a ruling); backlog B54 Done, B66 Partially done (Landed line added, Planned in keeps tool-config-gates)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-tool-config-mise

or let the queue pick it, by priority:

/vwf:execute next
