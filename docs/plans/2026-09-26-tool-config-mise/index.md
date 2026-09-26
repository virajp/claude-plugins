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

**APPROVED**

APPROVED 2026-09-26 by the user

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

| Id  | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                       | Depends on         | Status  | Commit |
| --- | ---- | ---------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------- | ------ |
| U1  | 1    | [01-move.md](01-move.md)                       | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/**`, `plugins/stackgen/stacks/bundles/mise.md`, `plugins/stackgen/skills/tool-config/assets/mise/**` (new), `plugins/stackgen/skills/tool-config/references/mise/**` (new, raw material), `plugins/stackgen/skills/tool-config/SKILL.md` (stub)            | —                  | pending |        |
| U3  | 1    | [03-five-packs.md](03-five-packs.md)           | edit   | `plugins/stackgen/stacks/package-manager/pnpm/**`, `plugins/stackgen/stacks/toolchain-gate/swiftlint/**`, `plugins/stackgen/stacks/capability-provider/fnox/**`, `plugins/stackgen/stacks/capability-provider/doppler/**`, `plugins/stackgen/stacks/app-framework/swiftui/**` (not their `version:` lines) | —                  | pending |        |
| U4  | 1    | [04-stackgen-skills.md](04-stackgen-skills.md) | edit   | `plugins/stackgen/skills/stackgen-stack-template/**`, `plugins/stackgen/skills/stackgen-stack-menu/**`, `plugins/stackgen/skills/stackgen-sync/**`, `plugins/stackgen/assets/{pack-format,output-tree,kinds}.md`, `plugins/stackgen/stacks/readme.md`                                                      | —                  | pending |        |
| U5  | 1    | [05-checker.md](05-checker.md)                 | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `scripts/src/inventory.ts`, `.config/mise/tasks/p/plugins/shellcheck`, `.config/dprint.json`, `.config/pre-commit-config.yaml`                                                                                                                        | —                  | pending |        |
| U6  | 1    | [06-init.md](06-init.md)                       | edit   | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                                                                               | —                  | pending |        |
| U7  | 1    | [07-setup-doctor.md](07-setup-doctor.md)       | edit   | `plugins/vwf/skills/setup/**`, `plugins/vwf/skills/doctor/**`, `plugins/vwf/assets/stack-adapter.md`                                                                                                                                                                                                       | —                  | pending |        |
| U2  | 2    | [02-skill.md](02-skill.md)                     | edit   | `plugins/stackgen/skills/tool-config/SKILL.md` (new), `plugins/stackgen/skills/tool-config/references/**`                                                                                                                                                                                                  | U1                 | pending |        |
| U8  | 2    | [08-mise-assets.md](08-mise-assets.md)         | edit   | `plugins/stackgen/skills/tool-config/assets/mise/**`                                                                                                                                                                                                                                                       | U1                 | pending |        |
| U9  | 3    | [09-review.md](09-review.md)                   | review | —                                                                                                                                                                                                                                                                                                          | U3, U5, U8         | pending |        |
| U10 | 4    | [10-docs.md](10-docs.md)                       | edit   | `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-26-tool-config.md` (new)                                                                                                                                                                                | U2, U4, U6, U7, U9 | pending |        |
| U11 | 5    | [11-gates-and-bump.md](11-gates-and-bump.md)   | edit   | `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`, the `version:` line of the five packs' `pack.yaml`, every `plugins/stackgen/stacks/bundles/*.md` pin naming them                       | U10                | pending |        |

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

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-tool-config-mise

or let the queue pick it, by priority:

/vwf:execute next
