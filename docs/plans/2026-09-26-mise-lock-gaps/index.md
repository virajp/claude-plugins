---
type: vwf-change-plan
title: mise lock gaps — only setup:mise writes a lockfile, and setup:all needs
  MISE_ENV
requires: []
backlog: []
backlog_pieces: [ B54 ]
---

# Plan — mise lock gaps — only setup:mise writes a lockfile, and setup:all needs MISE_ENV (2026-09-26)

## Status

**APPROVED**

APPROVED 2026-09-26 by the user

## Consent

| Action                                            | Granted                                                                                                                      |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                          |
| After landing: `mise run p:plugins:local`         | run                                                                                                                          |
| Release stackgen publicly                         | minor — `1.33.0` → `1.34.0`, bumped by editing `plugins/stackgen/.claude-plugin/plugin.json`; no release step, the tag waits |
| Release vwf publicly                              | patch — `19.46.0` → `19.46.1`, bumped by editing `plugins/vwf/.claude-plugin/plugin.json`; no release step, the tag waits    |
| Release site publicly                             | none — not this time                                                                                                         |
| Release installer publicly                        | none — untouched                                                                                                             |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, a lockfile is written only by `setup:mise` — when a config
file that declares at least one tool has no lockfile, or under `--upgrade` in
dev — and `setup:all` refuses to run with `MISE_ENV` unset, while every vwf
caller of it passes `MISE_ENV=dev`.

The framing: B54, second of three pieces. The first,
`docs/plans/2026-09-26-mise-lock-honoured`, landed with gaps G1–G5 and C1 open
(its index.md, *Gaps surfaced during execution*). CI's first run after that
landing was green on `773115fc`, which closes G5. This plan settles G1–G4 and
C1. The third piece, `.config/mise/conf.d` retired, is planned next as
`docs/plans/2026-09-26-mise-conf-d-retired`, which finishes B54.

Not a reversal. Decision 4 tightens the convention at
`plugins/stackgen/stacks/toolchain-manager/mise/conventions.md:164` (unset
`MISE_ENV` is outside dev) into a hard refusal on `setup:all`.

## Facts the survey established

- **G2**: `mise run` installs missing tools before a task body — setting
  `task.run_auto_install`, default `true` (mise 2026.9.13,
  `mise settings ls --all`); related `auto_install`, `exec_auto_install`,
  `not_found_auto_install` all `true`; `locked` default `false`. In dev the
  pre-task install writes the lockfiles, so the task's own lock branch is not
  reached. The pack sets none of these; its `mise.toml:59` sets
  `lockfile = true` (block at :27), `mise.ci.toml:23` sets `locked = true`,
  `mise.dev.toml:11` has a `[settings]` block with no lock keys. The pack sets
  no `lockfile_platforms`, so a first lock is host-platform only; this repo's
  `.config/mise.toml:14` sets `["linux-x64", "macos-arm64"]`.
- **G3**: the pack's `tasks/setup/mise:33` —
  `find "$CONFIG_DIR" -maxdepth 1 -name 'mise*.lock' -print -quit`: any one
  match counts, `mise.local.lock` included.
- **G4**: nothing in the pack or init sets `MISE_ENV=dev` — no `.miserc`, no
  direnv, no shell snippet; prose only (`mise.dev.toml:3-4`,
  `skills/mise/SKILL.md:66`, `skills/mise/references/config-files.md:40`);
  `conventions.md:164` defines unset as outside dev.
- **vwf callers of `setup:all`**:
  `plugins/vwf/skills/init/references/new-repo.md:685-706` (§10, offers "the
  task library's bootstrap aggregator", no env);
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md:96-116`
  (`setup:worktree`, falling back to `mise run setup:all`; :109-116 also
  describes the fallback, flagged falsified by the last run's R2);
  `plugins/vwf/skills/readme/SKILL.md:73`, :109 (tells a README to say
  `mise run setup:all`).
- **G1**: the pack's `setup/all:41-42` builds `UPGRADE_ARGS`, forwarded to
  `setup:mise` (:45) and the member loop (:84); this repo's
  `.config/mise/tasks/setup/all:37-38` forwards to `setup:mise` only, member
  loop at :87 bare.
- **C1**: `.config/mise.ci.toml:9` cites a base `lockfile = true` this repo's
  `.config/mise.toml` never sets (it comes from the global config);
  `.config/mise.ci.toml:13-15` lists `mise.dev.lock` among what CI reads.
- **This repo's `.config/mise/tasks/setup/mise` is byte-identical to the
  pack's** since the last plan (its U2 round 4).
- **Gates**: no test runs a pack task file; `p:plugins:shellcheck` runs
  `shellcheck -x` and `shfmt -d` over pack task libraries. CI
  (`.github/workflows/plugins.yml`) runs marketplace, inventory, check,
  shellcheck, vitest, npm-normalize test, tsc.
- **Commit convention** (`.config/git-conventional-commits.yaml`): `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Docs describing today's behaviour** (the docs unit's list): the mise pack's
  `skills/mise/SKILL.md` (:66), `skills/mise/references/config-files.md` (:40),
  `skills/mise/references/task-library.md` (the `setup:all` / `setup:mise` rows
  and the no-clobber contract), `conventions.md` (:164);
  `site/src/content/docs/plugins/stackgen.md` (the `setup:all` passage around
  :982–1102); `readme.md` and `CLAUDE.md` wherever they say
  `mise run setup:all`; `.claude/docs/ci-and-releases.md:17-23` (the last run's
  U3 found it omits the CI lock files).
- **Versions**: stackgen `1.33.0` (tagged), vwf `19.46.0` (tagged), site
  `1.1.47` (last tag `site-v1.1.46`).

## Assumed decisions — confirm or override at review

| #  | Decision                        | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                        | Rejected                                                                               | Unit     |
| -- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------- |
| 1  | Pre-task install (G2)           | The pack's base `mise.toml` `[settings]` sets `task.run_auto_install = false`, so `setup:all`'s `mise lock` + `mise install --locked` is the only path that installs or locks. A gate task on a machine missing a tool fails and the user runs `setup:all`.                                                                                                                                                                   | `locked = true` in every environment; accepting and documenting mise's default         | U1 U2    |
| 2  | Lock platforms (G2)             | The pack's base `mise.toml` `[settings]` sets `lockfile_platforms = ["linux-x64", "macos-arm64"]`.                                                                                                                                                                                                                                                                                                                            | adding `linux-arm64`; leaving it unset                                                 | U1       |
| 3  | Which lockfiles must exist (G3) | A lockfile is required only for a config file that declares at least one tool — the user: *"One per config file which contains atleast 1 tool to be installed"*. For `mise.toml` and each non-local `mise.<env>.toml` that declares a tool, read through mise itself (`mise config get`, or the nearest mise command that reads one file's `[tools]`), when its lockfile is missing run `mise lock` in that environment only. | any one lockfile counts; excluding `.local` only                                       | U1 U2    |
| 4  | Unset `MISE_ENV` (G4)           | `setup:all` exits 1 when `MISE_ENV` is unset, before any step, with a message naming `MISE_ENV=dev mise run setup:all` — the user: *"setup:all must raise error when the MISE_ENV is unset"*.                                                                                                                                                                                                                                 | init passes `MISE_ENV=dev` with unset still merely "outside dev"; unset treated as dev | U1 U2    |
| 5  | vwf callers                     | Every vwf passage that runs or tells a user to run `setup:all` uses `MISE_ENV=dev mise run setup:all`: init's §10 bootstrap offer, git-workflow's fallback, the readme skill's setup line.                                                                                                                                                                                                                                    | — (follows from 4)                                                                     | U3       |
| 6  | This repo (G1, C1)              | This repo's `setup:all` forwards `--upgrade` to its member loop as the pack's does; its `.config/mise.toml` takes decision 1's setting and `lockfile = true`; `.config/mise.ci.toml`'s two comments are corrected to what CI reads (`mise.lock`, `mise.ci.lock`).                                                                                                                                                             | leaving it for the next `/vwf:setup reshape`                                           | U2       |
| 7  | Review row                      | One `Kind: review` row (U4) after U1 and U2: shell scripts ship.                                                                                                                                                                                                                                                                                                                                                              | the wave review alone                                                                  | U4       |
| 8  | Proof                           | No new gate task; the orchestrator re-runs the isolated scratch-repo check (Gates the orchestrator keeps).                                                                                                                                                                                                                                                                                                                    | a table-test task                                                                      | —        |
| 9  | Comments                        | Any comment a unit adds or edits is one line; a few lines only where needed. Trimming existing comments is B65, not this plan.                                                                                                                                                                                                                                                                                                | trimming the owned files now                                                           | U1 U2 U3 |
| 10 | Release                         | stackgen minor `1.34.0`, vwf patch `19.46.1`, bumped; no release step; site none.                                                                                                                                                                                                                                                                                                                                             | `/release` as ask; release on green                                                    | U6       |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                             | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-pack-tasks.md](01-pack-tasks.md)         | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/all`, `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/mise`, `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`           | —          | pending |        |
| U2 | 1    | [02-repo-config.md](02-repo-config.md)       | edit   | `.config/mise/tasks/setup/all`, `.config/mise/tasks/setup/mise`, `.config/mise.toml`, `.config/mise.ci.toml`                                                                                                                                                     | —          | pending |        |
| U3 | 1    | [03-vwf-callers.md](03-vwf-callers.md)       | edit   | `plugins/vwf/skills/init/references/new-repo.md`, `plugins/vwf/skills/git-workflow/references/worktree-setup.md`, `plugins/vwf/skills/readme/SKILL.md`                                                                                                           | —          | pending |        |
| U4 | 2    | [04-review.md](04-review.md)                 | review | —                                                                                                                                                                                                                                                                | U1, U2     | pending |        |
| U5 | 3    | [05-docs.md](05-docs.md)                     | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/**`, `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`, `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/**`, `docs/memory/decisions/2026-09-26-mise-lock-gaps.md` (new) | U3, U4     | pending |        |
| U6 | 4    | [06-gates-and-bump.md](06-gates-and-bump.md) | edit   | `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                                               | U5         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                           | Why it collides                             | Owner                       |
| ------------------------------------------------------------------------------ | ------------------------------------------- | --------------------------- |
| both `plugin.json` files                                                       | version files                               | U6 only                     |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`      | generated                                   | U6 only                     |
| every human-facing doc (pack skills, conventions, site, root docs, `.claude/`) | n units editing one doc                     | U5 only                     |
| the pack's `setup/{all,mise}` vs this repo's copies                            | U2 applies the same rulings; no shared path | U1 / U2 each own their tree |

## Waves

- **Wave 1 — U1, U2, U3.** Three disjoint trees: the pack payload, this repo's
  `.config/`, and three vwf skill files.
- **Wave 2 — U4**, the review row over U1 and U2 (U3 is prose, not runnable).
- **Wave 3 — U5**, the docs unit.
- **Wave 4 — U6**, gates and bump.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`. Every gate
command runs with `MISE_ENV=dev` exported, since this repo's `mise.toml` gains
`task.run_auto_install = false` in wave 1.

## After landing

| Step                       | Mode | Notes                                                                                            |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages stackgen `1.34.0` and vwf `19.46.1` on this machine; picked up by a **restarted** session |

## Gates the orchestrator keeps

**Scratch-repo run of the pack's `setup:all` → `setup:mise`**, after wave 1
lands and before wave 2. Isolate everything — `HOME`, `MISE_DATA_DIR`,
`MISE_CACHE_DIR`, `MISE_CONFIG_DIR`, `MISE_STATE_DIR` under one `mktemp -d` —
copy the pack's `config/.config/` into a temp git repo, trust it, and log every
`mise` call through a PATH shim. Pass condition, all five:

1. `MISE_ENV` unset: `setup:all` exits 1 before any step, message names
   `MISE_ENV=dev`.
2. `MISE_ENV=dev`, no lockfile: the lockfiles appear, written by the task's
   `mise lock` (the shim shows it; no pre-task install ran), and each carries
   both `linux-x64` and `macos-arm64` entries.
3. Delete `mise.dev.lock` only, re-run in dev: `mise.dev.lock` is recreated,
   `mise.lock` byte-identical.
4. A second plain dev run: every `.config/mise*.lock` byte-identical.
5. A `mise.ci.toml` with no tools: no `mise.ci.lock` is required or written.

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

- **B65** — trimming the existing long comments across the mise pack and other
  tool/config files: raised at this plan's gate, and the user ruled it B65's:
  *"we will take up comments reduction in B65"*. Only decision 9 applies here.
- **B67** — init writing and committing `mise.lock` before the first CI push.
- **B69** — dprint, taplo and pre-commit exclusions covering
  `.config/mise/locks/` (the linter's is done).
- **The doctor hash re-record after `--upgrade`** — owed by the 2026-09-20
  pack-first-run-safety plan 3.
- **G5** — closed: CI green on `773115fc`.

## Parked

- B54: retire `.config/mise/conf.d` in every repo — planned as
  `docs/plans/2026-09-26-mise-conf-d-retired`, which requires this plan and
  finishes B54.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-mise-lock-gaps

or let the queue pick it, by priority:

/vwf:execute next
