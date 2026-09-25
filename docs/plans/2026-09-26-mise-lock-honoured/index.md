---
type: vwf-change-plan
title: mise lock honoured — setup:all installs from the lockfile, --upgrade
  moves it
requires: []
backlog: []
backlog_pieces: [ B54 ]
---

# Plan — mise lock honoured — setup:all installs from the lockfile, --upgrade moves it (2026-09-26)

## Status

**RUNNING**

RUNNING since 2026-09-26 in .worktrees/2026-09-26-mise-lock-honoured

## Consent

| Action                                            | Granted                                                                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                       |
| After landing: `mise run p:plugins:local`         | run                                                                                                                       |
| After landing: `/release`                         | ask                                                                                                                       |
| Release stackgen publicly                         | minor — `1.32.0` → `1.33.0`, bumped by editing `plugins/stackgen/.claude-plugin/plugin.json`; tagged via `/release` (ask) |
| Release site publicly                             | none — not this time; the manual edits wait for the next site release                                                     |
| Release vwf publicly                              | none — untouched                                                                                                          |
| Release installer publicly                        | none — untouched                                                                                                          |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, the mise pack's `setup:all` always installs tools from the
committed lockfile (`mise install --locked`), a lockfile is written only when
none exists or when the user passes `--upgrade` in the dev environment, and
nothing runs `mise upgrade` any more.

The framing: B54, first of two pieces. The user split B54 at the interview —
this plan is the lock-and-upgrade piece; the `.config/mise/conf.d` piece is
parked (see Parked) because it reverses two standing decisions and needs its own
interview.

**Reversals, both confirmed at the interview:**

1. `docs/memory/decisions/2026-09-20-pack-first-run-safety.md` ruled that
   `setup:all` passes none of the flags that rewrite state (`--force`,
   `--update`, `--upgrade`). It is **narrowed**: `setup:all` now accepts
   `--upgrade` and forwards it to `setup:mise --upgrade`; off by default, so a
   plain bootstrap still rewrites nothing.
2. B54's own text said "without `--upgrade`: run `mise lock`". The user
   corrected it: *"lock file must only be created in 2 situations: 1. If the
   lock files do not exist 2. If `--upgrade` is passed and then versions must be
   upgraded across"*.

## Facts the survey established

- **`setup:all`** (pack):
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/all`
  — a pure orchestrator, `#MISE depends=["init"]`, one `#USAGE flag "--all"`
  (recurse into member repos). It runs `setup:mise`, `setup:secrets`,
  `setup:external:start`, `setup:deps:all`, `setup:precommit`, `setup:ai`,
  `setup:vscode`, then loops members with `mise run --cd <member> setup:all`
  under `--all`. It takes no `--upgrade` today.
- **`setup:mise`** (pack): same tree, `tasks/setup/mise` —
  `#USAGE flag
  "--upgrade"` read as `usage_upgrade`; runs `mise reshim`,
  `mise doctor`, a plain `mise install` (no `--locked`); under `--upgrade` runs
  `mise upgrade --local || true` and `dprint config update` behind a
  `can_prompt` terminal probe; then `setup:lint` when that task exists. No
  `mise lock` anywhere; no environment check.
- **The dev check idiom** already in the pack:
  `[[ ",${MISE_ENV:-}," != *",dev,"* ]]` —
  `tasks/setup/external/{pull,start,stop}`.
- **Pack mise config**: `config/.config/mise.toml` sets
  `[settings]
  lockfile = true` and `minimum_release_age = "10h"`; its comment
  near line 47 says humans move the lockfile forward "(`mise upgrade`)".
  `mise.dev.toml` pins every tool as `version = "latest"` (fuzzy), so
  `mise lock --bump` moves them. `mise.ci.toml` sets `locked = true`, empty
  `[tools]`. `mise.test.toml` is deltas only, loaded as `MISE_ENV=dev,test`. One
  lockfile per config stem that declares tools (`mise.lock`, `mise.dev.lock`,
  …).
- **mise CLI (2026.9.13, checked with `--help`)**: `mise lock --bump`
  re-resolves fuzzy selectors to the latest versions without installing;
  `mise lock --upgrade` upgrades a legacy-format lockfile to the latest format
  and cannot be combined with tool arguments; `mise install --locked` fails on a
  tool with no lockfile URL for the current platform; `-E/--env` or `MISE_ENV`
  selects `mise.<env>.toml`.
- **This repo's own copies are stale**: `.config/mise/tasks/setup/mise` runs
  `mise install`, then unconditionally `mise upgrade --local || true`,
  `mise
  lock` and `MISE_ENV=ci mise lock` — no flag, no `--locked`, no dev
  check. `.config/mise/tasks/setup/all` differs from the pack's (this repo's own
  shape). This repo has `.config/mise.{,dev.,ci.}lock` and
  `.config/mise.{,dev.,ci.,test.}toml`; its `.config/mise.toml` sets
  `lockfile_platforms = ["linux-x64", "macos-arm64"]` with a comment naming
  `mise upgrade` (lines 8–13).
- **Gates**: no test runs any pack task file. `p:plugins:shellcheck` runs
  `shellcheck -x` and `shfmt -d` over the pack task libraries. CI
  (`.github/workflows/plugins.yml`, one `validate` job) runs marketplace check,
  inventory check, `p:plugins:check`, shellcheck, `vitest`, the npm-normalize
  test and `tsc`.
- **Commit convention** (`.config/git-conventional-commits.yaml`): types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Docs describing today's behaviour** (the docs unit's list):
  - `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
    — :148 (`setup:mise [--upgrade]` row), :201–213 (the no-clobber contract,
    "`setup:all` passes none of them"), :259–320 (`setup/*` section; :320 the
    hand-run upgrade)
  - `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/SKILL.md`
    :245–272 (:255 `mise upgrade --local`)
  - `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md` :22, :88,
    :124–153 (:152 the flag list)
  - `site/src/content/docs/plugins/stackgen.md` :982–1102 (:989
    `mise upgrade --local`)
  - `site/src/content/docs/plugins/vwf.md` :3344 (`setup:all` mention — check,
    likely unchanged)
- **Retired-name grep** — `mise upgrade`: the pack's `tasks/setup/mise` (U1),
  pack `mise.toml` comment (U1), `task-library.md` and `SKILL.md` (U4),
  `site/.../stackgen.md` (U4), this repo's `.config/mise/tasks/setup/mise` and
  `.config/mise.toml` (U2). Every hit has an owner.
- **Versions**: stackgen `1.32.0` (last tag `stackgen-v1.31.0`); vwf `19.46.0`.
- **Backlog**: B54 (P0) is this plan's item; adjacent open items B67 (init
  writes and commits `mise.lock`) and B69 (exclusions cover the lock sidecars)
  are not covered.

## Assumed decisions — confirm or override at review

| #  | Decision                   | Ruling                                                                                                                                                                                                                                                        | Rejected                                                  | Unit  |
| -- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----- |
| 1  | Where `--upgrade` lives    | `setup:all` gains `#USAGE flag "--upgrade"` and forwards it to `setup:mise --upgrade`; off by default. Narrows the 2026-09-20 ruling, recorded as a reversal.                                                                                                 | the flag on `setup:mise` only                             | U1 U2 |
| 2  | `--upgrade` outside dev    | When `,${MISE_ENV:-},` does not contain `,dev,`, `setup:mise --upgrade` exits non-zero before any step, naming the reason — the same check `setup:external` uses.                                                                                             | warn and skip the upgrade                                 | U1 U2 |
| 3  | When a lockfile is created | `find` looks for `mise*.lock` directly under `.config/`; when it finds none, `mise lock` runs once, in any environment. Otherwise no lock step runs unless `--upgrade` is passed.                                                                             | `mise lock` on every run (B54's wording); a new mise task | U1 U2 |
| 4  | What `--upgrade` bumps     | `mise lock --bump --upgrade` for the base config, then once per `.config/mise.<env>.toml` present (`.local` excluded) with that environment selected — every environment's lockfile moves together. `test` is selected as `dev,test`, since it layers on dev. | only the active environment's lockfiles                   | U1 U2 |
| 5  | Install                    | Always `mise install --locked`, after any lock step.                                                                                                                                                                                                          | a plain `mise install`                                    | U1 U2 |
| 6  | `mise upgrade`             | Removed from every task. `dprint config update` stays under `--upgrade`, behind its terminal probe.                                                                                                                                                           | removing the dprint step too                              | U1 U2 |
| 7  | This repo's own copies     | `.config/mise/tasks/setup/mise` is replaced by the new pack file; `.config/mise/tasks/setup/all` gains only the `--upgrade` flag and its forwarding, keeping this repo's own differences. The rest of a reshape is left to `/vwf:setup reshape`.              | leaving this repo for its next reshape                    | U2    |
| 8  | Proof                      | No new mise task or table test. The orchestrator runs the scratch-repo check under Gates the orchestrator keeps; `p:plugins:shellcheck` stays the standing gate.                                                                                              | a `p:plugins:setup-mise-test` task                        | —     |
| 9  | Review row                 | One `Kind: review` row (U3) after U1 and U2: the change ships shell scripts, which is runnable code.                                                                                                                                                          | the wave review alone                                     | U3    |
| 10 | Decision doc               | The docs unit writes `docs/memory/decisions/2026-09-26-mise-lock-honoured.md` recording both reversals and rulings 1–6.                                                                                                                                       | no decision doc                                           | U4    |
| 11 | Release                    | stackgen minor `1.33.0`; site none this time; `/release` is an `ask` after-landing step.                                                                                                                                                                      | releasing on green; no release step                       | U5    |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                                          | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-pack-tasks.md](01-pack-tasks.md)         | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/mise`, `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/all`, `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`                                                                        | —          | green   |        |
| U2 | 1    | [02-repo-tasks.md](02-repo-tasks.md)         | edit   | `.config/mise/tasks/setup/mise`, `.config/mise/tasks/setup/all`, `.config/mise.toml`                                                                                                                                                                                                                                          | —          | green   |        |
| U3 | 2    | [03-review.md](03-review.md)                 | review | —                                                                                                                                                                                                                                                                                                                             | U1, U2     | pending |        |
| U4 | 3    | [04-docs.md](04-docs.md)                     | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/**`, `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`, `site/src/content/docs/plugins/stackgen.md`, `site/src/content/docs/plugins/vwf.md`, `docs/memory/decisions/2026-09-26-mise-lock-honoured.md` (new), `readme.md`, `CLAUDE.md`, `.claude/**` | U3         | pending |        |
| U5 | 4    | [05-gates-and-bump.md](05-gates-and-bump.md) | edit   | `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                      | U4         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                      | Why it collides                                        | Owner                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------- |
| `plugins/stackgen/.claude-plugin/plugin.json`                             | the version file                                       | U5 only                     |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md` | generated                                              | U5 only                     |
| every human-facing doc (pack skills, conventions, site, root docs)        | n units editing one doc                                | U4 only                     |
| the pack's `setup/{mise,all}` vs this repo's copies                       | U2 copies U1's rulings, not U1's file — no shared path | U1 / U2 each own their tree |

## Waves

- **Wave 1 — U1, U2.** Disjoint trees: the pack payload under
  `plugins/stackgen/` and this repo's `.config/`. U2 implements the same rulings
  independently rather than copying U1's output, so neither waits.
- **Wave 2 — U3**, the review row over U1 and U2's commits.
- **Wave 3 — U4**, the docs unit.
- **Wave 4 — U5**, gates and bump.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                                        |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages the changed stackgen into the dev marketplace on this machine; picked up by a **restarted** session   |
| `/release`                 | ask  | would tag `stackgen-v1.33.0` via `p:plugins:release`; stops and asks first, so releases can still be batched |

## Gates the orchestrator keeps

**Scratch-repo run of the pack's `setup:mise`**, after wave 1 lands and before
wave 2. Isolate everything — `HOME`, `MISE_DATA_DIR`, `MISE_CACHE_DIR`,
`MISE_CONFIG_DIR`, `MISE_STATE_DIR` all under one `mktemp -d` — so no global
lockfile or config is touched (a scratch `mise install` rewrote the global lock
on 2026-09-25). Copy the pack's `config/.config/` into a temp git repo, trust
it, and run `setup:mise` directly (the full `setup:all` reaches tasks other
packs fill). Pass condition, all four:

1. First run under `MISE_ENV=dev`, no lockfile: lockfiles appear under
   `.config/`, and the install ran with `--locked`.
2. Second run under `MISE_ENV=dev`: every `.config/mise*.lock` is byte-identical
   to after run 1 (checksum before and after).
3. `--upgrade` under `MISE_ENV=dev`: exits zero and runs
   `mise lock --bump
   --upgrade` for the base and each environment (a lockfile
   changes, or the run log shows each lock call if every tool is already
   latest).
4. `--upgrade` under `MISE_ENV=ci`: exits non-zero before any step, and no
   lockfile changes.

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

- **B67** — init writing and committing `mise.lock` before the first CI push:
  its own backlog item; this plan changes `setup:mise`, not init's bootstrap.
- **B69** — dprint and pre-commit exclusions covering the `.config/mise/locks/`
  sidecar: its own backlog item.
- **The doctor hash re-record after `--upgrade`** — owed by the 2026-09-20
  pack-first-run-safety plan 3 (parked there); this plan does not touch vwf.
- **`setup:deps:upgrade`** — upgrades package-manager dependencies, not mise
  tools; B54 does not name it.
- **A new mise task or table test** for the lock behaviour — declined by the
  user: *"No need of creating `mise task` for one-time use"*.

## Parked

- B54: never use a `.config/mise/conf.d` folder in any repo. Reverses
  `2026-09-05-mise-split-becomes-five-files` and
  `2026-09-05-charter-fence-opens-for-gate-configs` (payload kind (d)); five
  packs ship a fragment today (swiftui, swiftlint, fnox, doppler, pnpm); the
  checker's `machine_env` rule (`scripts/src/check.ts` ~:548–682, tests
  `scripts/src/check.test.ts` :671–790), `/vwf:setup`'s materialize fill
  (`plugins/vwf/skills/setup/references/materialize.md` :173–206),
  `plugins/vwf/skills/init/references/new-repo.md` :448–460,
  `plugins/stackgen/assets/pack-format.md` :33, :59–70, :243–274 and the Swift
  decision (`2026-09-23-swift-native-stack.md` :113–116) all stand on it. Its
  plan must decide where each pack's `[env]` values and the `machine_env`
  positions move instead. The user chose to plan it after this one.

## Gaps surfaced during execution

- **G1 (wave 1, R1 round 1, plan-level, non-blocking)** — the pack's `setup:all`
  forwards `--upgrade` to the member `setup:all` loop (U1); this repo's
  `.config/mise/tasks/setup/all` does not (U2's Edit 2: "change nothing else";
  decision 1 names only `setup:mise`). No effect here — this repo has no
  members. Assumption: leave this repo's copy as is until its next
  `/vwf:setup reshape`, which lands the pack file whole.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                     | Commit |
| ---- | --------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight | —     | 1     | green       | doctor: no blocking (repo has no `.config/vwf.yaml`, checks not scoped); all 7 wave gate lines green on a9f23b92; no `covers:` — format check, conventions fetch skipped; no `code` unit — LSP read skipped; mempalace read-only (peer writer) — journal skipped                                                                                                                                           | —      |
| 1    | U1        | opus  | 1     | green       | pack `setup/mise`: dev-only `--upgrade` exit, `mise lock` when no `.config/mise*.lock`, `--bump --upgrade` per env, `install --locked`, `mise upgrade` gone; `setup/all` forwards `--upgrade` (also to the member loop); `mise.toml` comment. DECIDED: base `--bump --upgrade` only when no `mise.<env>.toml` (each env call relocks `mise.lock` too); `MISE_ENV=''` for SC1007                            | —      |
| 1    | U2        | opus  | 1     | green       | repo `setup/mise` rewritten to the pack's shape (base + per-env `--bump --upgrade`, `test` as `dev,test`); `setup/all` gains `--upgrade` forwarded to `setup:mise` only; `mise.toml` comment. DECIDED: `#MISE hide=true`; `MISE_ENV=''`; member loop not forwarded (Edit 2 "change nothing else"). GAP: scratch ci/dev runs denied by permissions — left to the orchestrator's scratch-repo gate           | —      |
| 1    | R1        | opus  | 1     | findings(3) | RULINGS: U1 departed from decision #4 (base `--bump --upgrade` skipped when env files exist, no evidence) → U1 loop-back, restore the base call; cross-unit drift: repo `setup/mise` ≠ pack file beyond helper names (decision 7) → U2 loop-back after U1; repo `setup/all` member loop not forwarding `--upgrade` — U2's Edit 2 limits it, repo has no members → recorded GAP, not looped. CONTRACT clean | —      |
| 1    | U1        | opus  | 2     | green       | loop-back from R1: base `MISE_ENV='' mise lock --bump --upgrade` always first under `--upgrade`, then per env; conditional removed                                                                                                                                                                                                                                                                         | —      |
| 1    | U2        | opus  | 2     | green       | loop-back from R1: repo `setup/mise` now byte-identical to the pack file (helpers provide all 4 functions it calls)                                                                                                                                                                                                                                                                                        | —      |
| 1    | R1        | opus  | 2     | pass        | 0 findings; CONTRACT clean; RULINGS clean. GAP: repo `setup/all` member loop does not forward `--upgrade` (the pack's does) — U2 Edit 2 said change nothing else and decision 1 names `setup:mise` only; this repo has no members, so no effect                                                                                                                                                            | —      |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-mise-lock-honoured

or let the queue pick it, by priority:

/vwf:execute next
