---
type: vwf-change-plan
title: mise conf.d layout — section files, one lock for every environment
requires: []
backlog: []
backlog_pieces: [ B54 ]
---

# Plan — mise conf.d layout — section files, one lock for every environment (2026-09-26)

## Status

**RUNNING**

RUNNING since 2026-09-26 17:46 in .worktrees/2026-09-26-mise-conf-d-layout

## Consent

| Action                                            | Granted                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                           |
| After landing: `mise run p:plugins:local`         | run                                                                                                                           |
| Release stackgen publicly                         | minor — `1.33.0` → `1.34.0`, bumped by editing `plugins/stackgen/.claude-plugin/plugin.json`; no release step, ships after B2 |
| Release vwf publicly                              | minor — `19.46.0` → `19.47.0`, bumped by editing `plugins/vwf/.claude-plugin/plugin.json`; no release step, ships after B2    |
| Release site publicly                             | none — not this time                                                                                                          |
| Release installer publicly                        | none — untouched                                                                                                              |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, a shaped repo's mise config is split by section under
`.config/mise/conf.d/` — `.config/miserc.toml` turns on environment suffixes,
the top-level mise files hold only settings and top-level keys, and every
environment's tools lock into one `.config/mise/mise.lock`, written only when it
is missing or under `--upgrade` in dev. `setup:all` refuses an unset `MISE_ENV`.
init, doctor and reshape follow the new layout, and reshape migrates a repo on
the old one.

The framing: B54. The user: *"`mise` config files are becoming large and
difficult to manage"*. This is B1 of two; B2,
`docs/plans/2026-09-26-mise-conf-d-packs`, moves the five packs that ship a
`conf.d/<pack>.toml` fragment into the section files and finishes B54. This plan
supersedes `docs/plans/2026-09-26-mise-lock-gaps` (approved, never run), retired
at this plan's hand-off; its still-valid rulings are decision 6.

**Reversals, all confirmed at the interview:**

1. `docs/memory/decisions/2026-09-05-mise-split-becomes-five-files.md` — the
   five-file split with tables in each file becomes settings-only files plus
   section files in `conf.d`.
2. `docs/memory/decisions/2026-09-05-charter-fence-opens-for-gate-configs.md`
   payload kind (d) — a provider's `conf.d/<pack>.toml` — changes shape (B2
   finishes it).
3. `docs/memory/decisions/2026-09-26-mise-lock-honoured.md` and plan A's G3
   ruling — one lockfile per config file becomes one lockfile for every
   environment.
4. B54's original line "Never use `.config/mise/conf.d` folder in any repo" —
   the user reversed it after the mise docs showed environment-scoped `conf.d`.

## Facts the survey established

- **mise facts, checked on mise 2026.9.13** (Context7 `/jdx/mise`
  docs/configuration/environments.md, docs/dev-tools/mise-lock.md, and an
  isolated scratch repo):
  - `env_conf_d = true` in `.config/miserc.toml` (or a root `.miserc.toml`, or
    `MISE_ENV_CONF_D=true`) makes `conf.d/<name>.<env>.toml` load only under
    that environment; `<name>.toml` always; `.local` variants likewise. It must
    be in a miserc file — `mise.toml` is read too late. Opt-in until mise
    2027.8.10, default after. Without it every fragment loads everywhere, with a
    deprecation warning for dotted names.
  - Every tool from `conf.d` locks into one `.config/mise/mise.lock`.
    `MISE_ENV=dev,ci mise lock` writes every environment's tools in one command;
    `MISE_ENV=<env> mise install --locked` then installs that environment's
    tools and keeps the whole lock; a plain `mise install` keeps it too. A
    single-environment `MISE_ENV=dev mise lock` **drops** the `ci` tools, and
    the next `ci` locked install fails.
  - The same tool pinned at different versions in `tools.dev.toml` and
    `tools.ci.toml` locks one version only (`1.7.0` kept, `1.7.1` lost); the
    other environment's locked install fails.
  - `task.run_auto_install` default `true` makes `mise run` install before a
    task body (plan 1's G2).
  - mise has no general include; `[task_config] includes` (tasks) and
    `[env] _.file` / `_.source` (env only) are the narrow ones.
- **The mise pack payload today** (`P` =
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config`):
  - `P/mise.toml`: `[settings]` :27 (:28–33, `minimum_release_age` :45,
    `lockfile` :59, `task.*` :64–77); `RUNTIME_BLOCK` marker :79 ends
    `[settings]`; `[env]` :84 (`REPO_NAME` :109, `MERGE_MODEL_DEVELOP`/`MAIN`
    :123–124, `MEMBERS` :137; markers :88, :111, :126); `PATH_ENTRIES` :139 ends
    `[env]`; `[tools]` :145 (`npm:@askviraj/linter` :196); `[tasks.init]` :198.
    No `min_version`.
  - `P/mise.dev.toml`: `[settings]` :11, `[tools]` :15 (9 tools :22–30),
    `[shell_alias]` :36 (:40–42; `setup-<member>` template :47–49, an init
    marked position), `[env]` :51 (`PRE_COMMIT_HOME` :52).
  - `P/mise.ci.toml`: `[settings]` :7 (`locked` :23); empty `[tools]` :33,
    `[env]` :37. `P/mise.test.toml`: empty `[tools]` :13, `[env]` :15.
  - `P/mise/` holds only `tasks/`. Lock references: `P/mise.toml:52-58`,
    `:184-186`; `P/mise.ci.toml:13-22`; `tasks/setup/mise:33`, `:36`, `:69`;
    `tasks/setup/worktree:18-19`; `vscode.d/mise.jsonc:25-33`;
    `tasks/code/all:15` cites `mise.dev.toml`.
- **init's mise splices**: `plugins/vwf/skills/init/references/new-repo.md`
  :285–297 (both runtime positions "in the same file the environment block sits
  in"), :430–446 (the list), :456–468 (aliases → dev `[shell_alias]`), :510,
  :538–545, :596–601, :1032; `existing-repo.md` :266–280 (a moved root file's
  `[env]` → environment-block file, `[tools]` → tool-pin file), :485–507,
  :758–790; `tool-configs.md` :23–30, :39, :48 ("four files"); `init/SKILL.md`
  :378–379.
- **Doctor**: `plugins/vwf/skills/doctor/references/stack-checks.md` :101–102
  (tool lookup in `.config/mise*.toml`), :284, :425, :445–456 (d), :520,
  :568–606 (f), :649–651 (g); `doctor/SKILL.md` :213, :217–218.
- **vwf callers of `setup:all`**: `init/references/new-repo.md` §10 :685–706;
  `git-workflow/references/worktree-setup.md` :96–116 (:109–116 falsified per
  plan 1's R2); `readme/SKILL.md` :73, :109.
- **Hygiene pack**: `.gitattributes:9` (`mise.lock`), `.gitignore:41-46`
  (`mise.local.toml`, `.config/mise.*.local.toml`, `mise.local.lock`);
  `CONTRIBUTING.md:31` cites `mise.toml [env]`.
- **Packs left to B2**: swiftui (`_scripts/xcode:41-61` reads
  `.config/mise.toml [env]`; conventions :73–81; ux-gate :69; build-and-signing
  :35), doppler (`tasks/setup/secrets:24`, three references), the five
  `conf.d/<pack>.toml` fragments, `materializer.md:126`,
  `setup/references/materialize.md:170-218`, `stackgen-sync`, checker
  `scripts/src/check.ts:549`, `:647`.
- **This repo**: `.config/mise.toml` (`[settings]` :1, `lockfile_platforms` :14,
  `[tools]` :24, `[env]` :29, `[tasks.init]` :81), `mise.dev.toml` (`[settings]`
  :5, `[tools]` :10, `[shell_alias]` :37), `mise.ci.toml` (`[settings]` :7,
  `locked` :16, `[tools]` :26), `mise.test.toml` (`[tools]` :13, `[env]` :15);
  locks `mise.lock`, `mise.dev.lock`, `mise.ci.lock`; no `conf.d`.
  `.config/mise/tasks/setup/mise` is byte-identical to the pack's;
  `.config/mise/tasks/setup/all:87` member loop does not forward `--upgrade`
  (G1); `.config/mise.ci.toml:9`, `:13-15` comments wrong (C1). CI
  (`plugins.yml`) runs with `MISE_ENV=ci`; its first run after plan 1 was green
  on `773115fc`.
- **Gates**: no test runs a pack task file; `p:plugins:shellcheck` runs
  `shellcheck -x` + `shfmt -d` over pack task libraries.
- **Commit convention**: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no
  scopes.
- **Versions**: stackgen `1.33.0`, vwf `19.46.0` (both tagged).

## Assumed decisions — confirm or override at review

| #  | Decision                | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Rejected                                                            | Unit           |
| -- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------- |
| 1  | miserc                  | `.config/miserc.toml` holds `env_conf_d = true` and nothing else — the user: *"this file must NOT have the `env` value configured, that must be set at system level only by user"*.                                                                                                                                                                                                                                                                                  | a root `.miserc.toml`; `MISE_ENV_CONF_D` in the shell               | U1 U5          |
| 2  | Top-level files         | `.config/mise.toml` and `.config/mise.<env>.toml` hold only `[settings]` and top-level keys — the user: *"Top level settings will stay in `mise.toml` file, as they should be"*. `mise.toml` adds `min_version = "2026.9.13"`, the version `env_conf_d` was tested on. `RUNTIME_BLOCK` stays at the end of `[settings]`.                                                                                                                                             | no `min_version`                                                    | U1 U5          |
| 3  | Section files           | Every other section is its own file, `.config/mise/conf.d/<section>.toml` for all environments and `<section>.<env>.toml` for one — the user: *"Any section `[*]` can be it's own independent file in `conf.d`"*; *"`shell_alias.dev.toml` (this one is special as shell aliases are only for `dev` environments)"*. A section with no content ships no file.                                                                                                        | splicing into the top-level files; one file per pack                | U1 U5          |
| 4  | One lock                | One `.config/mise/mise.lock`. When it is missing, or under `--upgrade` (dev only: `--bump --upgrade`), run one `mise lock` with `MISE_ENV` set to the comma-joined union of every environment suffix found in `.config/mise.<env>.toml` and `.config/mise/conf.d/*.<env>.toml`, `.local` excluded. Never a single-environment `mise lock`. Always `mise install --locked` after.                                                                                     | one lockfile per config file (plan A's G3)                          | U1 U5          |
| 5  | One pin per tool        | A tool is pinned in one environment file only; a tool two environments need goes in `tools.toml`.                                                                                                                                                                                                                                                                                                                                                                    | allowing per-environment versions of one tool                       | U1 U4          |
| 6  | Plan A's rulings        | `task.run_auto_install = false` and `lockfile_platforms = ["linux-x64", "macos-arm64"]` in `mise.toml` `[settings]`; `setup:all` exits 1 when `MISE_ENV` is unset, naming `MISE_ENV=dev mise run setup:all`; every vwf caller uses that command; this repo's `setup:all` forwards `--upgrade` to its member loop (G1); `.config/mise.ci.toml` comments name only what CI reads (C1).                                                                                 | —                                                                   | U1 U3 U4 U5    |
| 7  | Hygiene                 | The hygiene pack gitignores `.config/mise/conf.d/*.local.toml` and `.config/mise/mise.local.lock`, and its `.gitattributes` names `.config/mise/mise.lock`.                                                                                                                                                                                                                                                                                                          | —                                                                   | U2             |
| 8  | init's marked positions | `REPO_NAME`, `MERGE_MODEL_DEVELOP`/`MAIN` and `MEMBERS` sit in `conf.d/env.toml`, `PATH_ENTRIES` at its end; the `setup-<member>` alias template in `conf.d/shell_alias.dev.toml`; `RUNTIME_BLOCK` stays in `mise.toml` `[settings]`. init's splices and doctor's predicates read those files.                                                                                                                                                                       | —                                                                   | U1 U3 U4 U5    |
| 9  | Migration               | `/vwf:setup reshape` migrates a repo on the old layout: one consent-gated plan row per repo moves each table into its `conf.d` section file, keeps hand-added lines, adds `miserc.toml`, and replaces the old per-file locks with one combined lock.                                                                                                                                                                                                                 | doctor reports only; new repos only                                 | U3             |
| 10 | Doctor                  | Doctor reads the new layout — the tool lookup, predicates (d), (f), (g) — and reports: the old layout as shape drift (pointing at `/vwf:setup reshape`); a tool pinned in two environment files; a tool pinned in `mise.toml` / `mise.<env>.toml`, offering to move it into the matching `conf.d/tools[.<env>].toml` with consent — the user: *"when a skill finds that, it should move that particular tool in the relevant file in `conf.d` with user's consent"*. | —                                                                   | U4             |
| 11 | Review row              | One `Kind: review` row (U6) after U1 and U5: shell scripts ship.                                                                                                                                                                                                                                                                                                                                                                                                     | the wave review alone                                               | U6             |
| 12 | Comments                | Any comment a unit adds or edits is one line; a few lines only where needed. Trimming the rest is B65.                                                                                                                                                                                                                                                                                                                                                               | trimming now                                                        | U1 U2 U3 U4 U5 |
| 13 | Release                 | stackgen minor `1.34.0`, vwf minor `19.47.0`, bumped; no release step — ships after B2.                                                                                                                                                                                                                                                                                                                                                                              | major bumps; `/release` as ask                                      | U8             |
| 14 | Plan A                  | `docs/plans/2026-09-26-mise-lock-gaps` is superseded: archived not-run at this plan's hand-off.                                                                                                                                                                                                                                                                                                                                                                      | revising A; running A then B                                        | —              |
| 15 | Pack bumps              | A pack whose content changes bumps its `pack.yaml` version, its bundle pin and `inventory.md` in one commit (the 2026-09-20 pack-first-run-safety convention): mise `1.6.1` → `1.7.0`, repo-hygiene `1.2.3` → `1.2.4`.                                                                                                                                                                                                                                               | leaving pack versions unchanged (shaped repos never see the update) | U8             |

## New dependencies

none

## Units

| Id | Wave | Unit file                                            | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Depends on     | Status  | Commit |
| -- | ---- | ---------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | ------ |
| U1 | 1    | [01-mise-pack.md](01-mise-pack.md)                   | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/**`, `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —              | green   |        |
| U2 | 1    | [02-hygiene.md](02-hygiene.md)                       | edit   | `plugins/stackgen/stacks/repo-hygiene/**/config/.gitignore`, `plugins/stackgen/stacks/repo-hygiene/**/config/.gitattributes`, `plugins/stackgen/stacks/repo-hygiene/**/config/CONTRIBUTING.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —              | green   |        |
| U3 | 1    | [03-init.md](03-init.md)                             | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`, `plugins/vwf/skills/init/references/existing-repo.md`, `plugins/vwf/skills/init/references/tool-configs.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —              | green   |        |
| U4 | 1    | [04-doctor-and-callers.md](04-doctor-and-callers.md) | edit   | `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`, `plugins/vwf/skills/git-workflow/references/worktree-setup.md`, `plugins/vwf/skills/readme/SKILL.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —              | green   |        |
| U5 | 1    | [05-this-repo.md](05-this-repo.md)                   | edit   | `.config/miserc.toml` (new), `.config/mise.toml`, `.config/mise.dev.toml`, `.config/mise.ci.toml`, `.config/mise.test.toml`, `.config/mise/conf.d/**` (new), `.config/mise/tasks/setup/all`, `.config/mise/tasks/setup/mise`, `.config/mise/tasks/setup/worktree`, `.config/vscode.d/mise.jsonc`, `.config/mise.lock`, `.config/mise.dev.lock`, `.config/mise.ci.lock` (removed), `.config/mise/mise.lock` (new)                                                                                                                                                                                                                                                             | —              | green   |        |
| U6 | 2    | [06-review.md](06-review.md)                         | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | U1, U5         | pending |        |
| U7 | 3    | [07-docs.md](07-docs.md)                             | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`, `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`, `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/assets/pack-format.md`, the other packs' comment mentions of a base `mise.toml` pin except swiftui and doppler, `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/**`, `docs/memory/decisions/2026-09-26-mise-conf-d-layout.md` (new), widened at run time: the stale-name comments in `.config/mise/tasks/{code/all,p/plugins/shellcheck,p/plugins/marketplace,setup/vscode,_scripts/merge,_scripts/helpers}` and `.github/workflows/plugins.yml` (U5 DOCS FALSIFIED) | U2, U3, U4, U6 | pending |        |
| U8 | 4    | [08-gates-and-bump.md](08-gates-and-bump.md)         | edit   | `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`, the `version:` line of `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml` and `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`, `plugins/stackgen/stacks/bundles/mise.md`, `plugins/stackgen/stacks/bundles/repo-hygiene.md`, widened at run time: the `summary:` of the mise `pack.yaml` (U1 reverted it — its inventory regeneration is U8's)                                                                                                                                     | U7             | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                               | Why it collides                                         | Owner                                                         |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| both `plugin.json` files                                                                           | version files                                           | U8 only                                                       |
| the mise and repo-hygiene `pack.yaml` `version:` lines, `bundles/{mise,repo-hygiene}.md`           | a version, its pin and the inventory land in one commit | U8 only (U1 edits the rest of the mise `pack.yaml` in wave 1) |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                          | generated                                               | U8 only                                                       |
| every human-facing doc (pack skills and conventions, stackgen assets, site, root docs, `.claude/`) | n units editing one doc                                 | U7 only                                                       |
| the pack's `.config/**` vs this repo's `.config/**`                                                | U5 applies U1's rulings; no shared path                 | U1 / U5 each own their tree                                   |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5.** Five disjoint path sets: the mise pack, the
  hygiene pack, init, doctor plus two caller skills, this repo's `.config/`. U5
  applies the rulings independently rather than copying U1's output.
- **Wave 2 — U6**, the review row over U1 and U5.
- **Wave 3 — U7**, the docs unit.
- **Wave 4 — U8**, gates and bump.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `mise run code:precommit`
- `mise run p:site:check`

every line run with `MISE_ENV=dev` exported, plus the wave review, plus every
report read for `UNRESOLVED:`. After wave 1 this repo runs on the new layout
(U5), so the gate itself proves it.

## After landing

| Step                       | Mode | Notes                                                                                            |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages stackgen `1.34.0` and vwf `19.47.0` on this machine; picked up by a **restarted** session |

## Gates the orchestrator keeps

**Scratch-repo run of the mise pack**, after wave 1 and before wave 2. Isolate
everything — `HOME`, `MISE_DATA_DIR`, `MISE_CACHE_DIR`, `MISE_CONFIG_DIR`,
`MISE_STATE_DIR` under one `mktemp -d`; copy the pack's `config/.config/` into a
temp git repo, `mise trust -a`, and add one tool to a `conf.d/tools.ci.toml` so
three environments carry tools. Pass condition, all six:

1. `MISE_ENV` unset: `mise run setup:all` exits 1 before any step, message names
   `MISE_ENV=dev`.
2. `MISE_ENV=dev`, no lock: `setup:mise` writes one `.config/mise/mise.lock`
   holding the tools of `tools.toml`, `tools.dev.toml` and `tools.ci.toml`, each
   with `linux-x64` and `macos-arm64` entries; no pre-task install ran.
3. A second plain dev run: the lock is byte-identical.
4. After the dev run, `MISE_ENV=ci mise install --locked` succeeds.
5. `MISE_ENV=ci mise run setup:mise --upgrade` exits 1, lock unchanged.
6. `MISE_ENV=ci mise config ls` does not list `tools.dev.toml` or
   `shell_alias.dev.toml`.

A failing condition goes back to U1 as a wave-review finding.

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

- **B65** — trimming existing long comments; only decision 12 applies here.
- **B67** — init committing the lock before the first CI push.
- **B69** — dprint, taplo and pre-commit exclusions for mise lock sidecars.
- **The doctor hash re-record after `--upgrade`** — 2026-09-20 plan 3.
- **The five pack fragments, swiftui's `xcode` script, doppler's references, the
  materializer, `/vwf:setup`'s `machine_env` fill, `stackgen-sync`, checker rule
  11** — B2.

## Parked

- B54: pack composition — the five `conf.d/<pack>.toml` fragments (pnpm,
  swiftlint, fnox, doppler, swiftui) merged into the section files between
  per-pack markers; the materializer's merge; `/vwf:setup`'s `machine_env` fill
  targeting `conf.d/env.toml`; `stackgen-sync`; checker rule 11 and its tests;
  swiftui's `_scripts/xcode` and doppler's references. Planned as
  `docs/plans/2026-09-26-mise-conf-d-packs`, which requires this plan and
  finishes B54.
- Interim, until B2 lands: the pack fragments sit beside `env.toml` in `conf.d`
  and load alphabetically, so `mise.toml`'s old precedence over them is gone.

## Run log

| Wave | Unit              | Model | Round | Outcome                 | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Commit |
| ---- | ----------------- | ----- | ----- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight         | —     | 1     | green                   | doctor: only finding is no `.config/vwf.yaml` (removed by 4d184778; same as prior runs), not a blocking tool class — mise, graphify CLI and graph present; all 7 wave gate lines green on 1d332056 with MISE_ENV=dev; no `covers:` — format check, acceptance/ux and conventions fetch skipped; no `code` unit — LSP read skipped                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —      |
| 1    | U2                | opus  | 1     | reported                | .gitignore conf.d/*.local.toml + .config/mise/mise.local.lock; .gitattributes names .config/mise/mise.lock; CONTRIBUTING points at conf.d/env.toml. DECIDED: CONTRIBUTING Setup block now `MISE_ENV=dev mise run setup:all` (decision 6), paragraph re-wrapped to 80. GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —      |
| 1    | U4                | opus  | 1     | reported                | stack-checks.md lookup + (d)–(g) read conf.d/env.toml, RUNTIME_BLOCK in mise.toml; three decision-10 rows under (f); doctor SKILL drift list; worktree-setup + readme use `MISE_ENV=dev mise run setup:all`. DECIDED: layout rows inside (f), not a new (h) — keeps "seven predicates"; old-layout row holds back the two tool rows; duplicate pin fixed by hand. DOCS FALSIFIED: stack-checks.md "All seven sub-checks carry the same remedy" (own file). GAP: plan silent on whether reshape fixes duplicate pins — assumed not, by-hand fix                                                                                                                                                                                                                                                                                               | —      |
| 1    | U3                | opus  | 1     | reported                | new-repo: RUNTIME_BLOCK in mise.toml [settings], PATH_ENTRIES/REPO_NAME/MEMBERS/merge pair in conf.d/env.toml, aliases in conf.d/shell_alias.dev.toml, §10 `MISE_ENV=dev mise run setup:all`; existing-repo: pass 3 split + new "mise layout migration" subsection; tool-configs mise row; SKILL runtime paragraph. DECIDED: migration a plain applied row under the one plan consent, after creates, lock after §9 trust; dropped the "unowned table keeps the moved file alive" rule. GAP: pass 3 keeps an inline [tasks.*] "where it sits" in a removed file — predates plan, left                                                                                                                                                                                                                                                        | —      |
| 1    | U1                | opus  | 1     | reported                | miserc.toml (env_conf_d); mise.toml settings-only + min_version, lockfile_platforms, run_auto_install=false; mise.{dev,ci,test}.toml settings/headers; conf.d/{env,tools,tasks,tools.dev,shell_alias.dev,env.dev}.toml moved byte for byte; setup/all refuses unset MISE_ENV; setup/mise one union lock; path updates in setup/{worktree,vscode}, code/{all,lint},_scripts/{helpers,merge}, vscode.d, pack.yaml summary. DECIDED: `mise doctor` after `mise install --locked` (failed fresh with run_auto_install=false); no empty env.ci/env.test/tools.ci files. DOCS FALSIFIED: pack skills/references/config-files.md, conventions.md. GAP: pack.yaml has no lockfile fact, summary only. Unit scratch run: 1–6 pass                                                                                                                     | —      |
| 1    | U5                | opus  | 1     | reported                | miserc.toml; mise.toml settings-only + min_version, run_auto_install=false; mise.{dev,ci,test}.toml one-line comments (C1); conf.d/{env,tasks,tools,tools.dev,shell_alias.dev}.toml byte for byte; setup/all refuses unset MISE_ENV, forwards --upgrade to member loop (G1); setup/mise union lock; old three locks rm, new .config/mise/mise.lock (15 tools, both platforms). DECIDED: shellcheck/shfmt moved to tools.toml (were pinned in dev and ci); fresh lock moved node 26.10.0, pnpm 12.6.0, doppler, grype, uv; mise.test.toml comments only; legacy MERGE_MODEL moved as is. DOCS FALSIFIED: .config/mise/tasks/{code/all,p/plugins/shellcheck,p/plugins/marketplace,setup/vscode,_scripts/merge,_scripts/helpers}, plugins.yml:61. GAP: ran code:format --fix (contract breach) — status shows no path outside wave Owns changed | —      |
| 1    | scratch-repo gate | —     | 1     | green                   | isolated HOME + MISE_*dirs, pack .config copied, yq added in conf.d/tools.ci.toml: 1 unset MISE_ENV exits non-zero naming MISE_ENV=dev; 2 one .config/mise/mise.lock with tools.toml, tools.dev.toml and tools.ci.toml tools, every binary tool on linux-x64 and macos-arm64 (npm:@askviraj/linter carries no platform entries — platform-independent); 3 second dev run byte-identical; 4 ci --locked install ok; 5 ci --upgrade exits 1, lock unchanged; 6 ci config ls omits the .dev files                                                                                                                                                                                                                                                                                                                                               | —      |
| 1    | R1                | opus  | 1     | findings(6)             | U5 setup/mise runs mise doctor before the locked install and diverges from the pack copy (RULINGS #6); U5 vscode.d nesting groups the pack lacks; U1 setup/mise:48 grep -v under pipefail kills the task when no non-local env file; U3/U4 old-layout tests disagree (doctor: no miserc/conf.d/per-file lock; reshape: non-settings table or .config/mise*.lock); U4 ragged folds in doctor SKILL, stack-checks, readme; U1 pack.yaml summary stray break. Orchestrator adds: U1 pack.yaml summary makes inventory --check red — generator is U8 only, so U1 reverts the summary and U8 Owns widens to it (GAP). Contract clean                                                                                                                                                                                                              | —      |
| 1    | U3                | opus  | 2     | reported                | R1 fix: reshape old-layout test is the orchestrator ruling (a) non-[settings] table in .config/mise[.<env>].toml, (b) a .config/mise*.lock, (c) miserc.toml missing or lacking env_conf_d; notes doctor runs the same check. DECIDED: miserc bullet also adds env_conf_d to an existing miserc.toml without it, so (c) alone has a fix. GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —      |
| 1    | U1                | opus  | 2     | reported                | R1 fix: setup/mise lock_envs uses find ! -name *.local.toml, no grep -v stage (zero matches safe under pipefail); pack.yaml summary reverted to HEAD. DECIDED: summary text handed to U8 (Owns widened, GAP): "The repo’s toolchain manager — settings-only .config/mise*.toml files, one section file per table in .config/mise/conf.d/ scoped by MISE_ENV, one lock for every environment, and the file-based task library …"                                                                                                                                                                                                                                                                                                                                                                                                              | —      |
| 1    | U5                | opus  | 2     | reported                | R1 fix: .config/mise/tasks/setup/mise and .config/vscode.d/mise.jsonc now byte-identical to the pack (doctor after the locked install; nesting groups dropped). DECIDED: HEAD differed from the pack only in one lock comment. Re-verified: two dev setup:mise runs, lock byte-identical; unset MISE_ENV exits 1. GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —      |
| 1    | U4                | opus  | 2     | reported                | R1 fix: doctor old-layout row uses the orchestrator ruling (same as reshape); "same remedy" sentence names the two exceptions; touched paragraphs in stack-checks, doctor SKILL, readme SKILL reflowed by hand. GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —      |
| 1    | R1                | opus  | 2     | findings(2) → contested | cap of two rounds reached (6→2, converging); round-1 items all closed, contract and rulings clean. Contested: existing-repo.md:802 [U3] one short line left unreflowed; stack-checks.md:622 [U4] one short line in the old-layout row — cosmetic fold, no rule lost                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —      |
| 1    | wave gate         | —     | 1     | green                   | all 7 lines green with MISE_ENV=dev (code:precommit clean on its second pass; first pass reformatted the plan folder only). GAP: Owns widened — U7 takes the stale mise-file comments in this repo's .config/mise/tasks/{code/all,p/plugins/shellcheck,p/plugins/marketplace,setup/vscode,_scripts/merge,_scripts/helpers} and plugins.yml (U5 DOCS FALSIFIED, authorised by the Goal); U8 takes the mise pack.yaml summary (U1 edit reverted: a summary change regenerates inventory.md, U8 only)                                                                                                                                                                                                                                                                                                                                           | —      |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-mise-conf-d-layout

or let the queue pick it, by priority:

/vwf:execute next
