---
type: vwf-change-plan
title: init commits the lock — the first CI run of a shaped repo finds its
  mise lock
requires:
  - docs/plans/2026-09-26-tool-config-hygiene
backlog: [ B67 ]
backlog_pieces: []
---

# Plan — init commits the lock — the first CI run of a shaped repo finds its mise lock (2026-09-26)

## Status

**RUNNING**

RUNNING since 2026-09-27 in .worktrees/2026-09-26-init-commits-the-lock

## Consent

| Action                                            | Granted                                                                                                                                                                      |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                          |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                          |
| Release vwf publicly                              | patch if `vwf-v20.0.0` is tagged when the run starts (`20.0.0` → `20.0.1`, by editing `plugins/vwf/.claude-plugin/plugin.json`), else none — rides `20.0.0`; no release step |
| Release stackgen publicly                         | none — untouched                                                                                                                                                             |
| Release site publicly                             | none — not this time                                                                                                                                                         |
| Release installer publicly                        | none — untouched                                                                                                                                                             |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, the `ops:` commit of a newly shaped or reshaped repo already
carries `.config/mise/mise.lock` and its `.config/mise/locks/` sidecar, so the
repo's first CI run — `locked = true` — finds every tool locked.

The framing: B67, from the gate-hardening gaps
(`docs/plans/archived/2026-09-25-gate-hardening`): CI's first run failed until
the lock and its aube sidecar were committed together, and init's bootstrap ran
no `mise install`. After B1 (`docs/plans/2026-09-26-mise-conf-d-layout`) the
lock is one file written only when missing; after T1
(`docs/plans/2026-09-26-tool-config-mise`) `stackgen:tool-config` owns mise;
after T1–T3 packs ask `stackgen:tool-config` for their tools. Not a reversal.

## Facts the survey established

- **B67's reproduction**: in a clean HOME, CI failed with "Run mise install
  without --locked"; without the sidecar, "dependency sidecar … No such file or
  directory; run mise lock". The sidecar tree is
  `.config/mise/locks/<tool>/<version>~<hash>/` (`aube-lock.yaml`,
  `package.json`).
- **init's commit staging**: `plugins/vwf/skills/init/references/new-repo.md`
  §11(b) (near :809) stages "every path in this repo's written / moved / renamed
  lists, and nothing else"; a lock written by a later aggregator is not in those
  lists. `existing-repo.md` has no mise-lock handling. §10 (near :685–706)
  offers the bootstrap aggregator after the commit. Line numbers move with
  T1–T3.
- **B1's lock rules**: one `.config/mise/mise.lock`; written only when missing
  or under `--upgrade` (dev); one `mise lock` with `MISE_ENV` set to the union
  of every environment suffix found; `task.run_auto_install = false`, so running
  the task installs nothing before its body.
- **`setup:mise`** lives at
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/mise`
  after T1 (`docs/plans/2026-09-26-tool-config-mise`); this repo's
  `.config/mise/tasks/setup/mise` is byte-identical to it.
- **Gates**: `p:plugins:shellcheck` covers
  `plugins/stackgen/skills/tool-config/assets/*` after T1.
- **Commit convention**: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no
  scopes. **Versions**: vwf `20.0.0` after T1, tagged only if `/release` ran at
  T3's landing.

## Assumed decisions — confirm or override at review

| # | Decision                                           | Ruling                                                                                                                                                                                                                                                           | Rejected                                                        | Unit  |
| - | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----- |
| 1 | When init locks                                    | Before each repo's `ops:` commit — members first, then the base — init runs `MISE_ENV=dev mise run setup:mise --lock-only` and stages `.config/mise/mise.lock` and `.config/mise/locks/**` into that commit; on a new repo, and on a reshape that finds no lock. | running `setup:mise` in full (installs every tool; slower, B50) | U1    |
| 2 | Where the logic lives                              | `setup:mise` gains `--lock-only`: write the combined lock only when it is missing, then exit before installing; with a lock present, do nothing. The environment-union rule lives once, in the script.                                                           | init running `mise lock` itself (the rule written twice)        | U2 U3 |
| 3 | This repo                                          | `.config/mise/tasks/setup/mise` stays byte-identical to the pack's.                                                                                                                                                                                              | —                                                               | U3    |
| 4 | Review row                                         | One `Kind: review` row (U4): a shell task changes.                                                                                                                                                                                                               | the wave review alone                                           | U4    |
| 5 | Release                                            | If `vwf-v20.0.0` is tagged when the run starts, vwf `20.0.1`; otherwise no bump, riding `20.0.0`. No release step.                                                                                                                                               | always patch                                                    | U6    |
| 6 | Comments                                           | Any comment or sentence a unit adds is one line (B65).                                                                                                                                                                                                           | —                                                               | all   |
| 7 | uv before the lock (ruled 2026-09-27, mid-run)     | Before `mise lock`, `write_missing_lock` runs `mise install uv` when the config declares uv — locking a `pipx:` tool runs uv >= 0.12.10; covers `--lock-only` and a full `setup:mise` on a fresh machine.                                                        | uv as an unfixed precondition                                   | U2 U3 |
| 8 | Python before the lock (ruled 2026-09-27, mid-run) | The pack pins a Python >= 3.10 for dev; `write_missing_lock` installs it with uv before `mise lock`, since mise locks a `pipx:` tool's dependencies with `uv lock --no-python-downloads`; a failed lock removes its partial `mise.lock`.                         | Python on PATH as a precondition; stop and re-plan              | U2 U3 |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                        | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-init.md](01-init.md)                     | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`, `plugins/vwf/skills/init/references/existing-repo.md` | —          | green   | beef9cad |
| U2 | 1    | [02-mise-pack.md](02-mise-pack.md)           | edit   | `plugins/stackgen/skills/tool-config/assets/mise/**`, `plugins/stackgen/skills/tool-config/references/mise.md`                              | —          | green   | e341821c |
| U3 | 1    | [03-this-repo.md](03-this-repo.md)           | edit   | `.config/mise/tasks/setup/mise`                                                                                                             | —          | green   | f8afa0e3 |
| U4 | 2    | [04-review.md](04-review.md)                 | review | —                                                                                                                                           | U2, U3     | pending |          |
| U5 | 3    | [05-docs.md](05-docs.md)                     | edit   | `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`                                                                          | U1, U4     | pending |          |
| U6 | 4    | [06-gates-and-bump.md](06-gates-and-bump.md) | edit   | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                 | U5         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                        | Why it collides                      | Owner                       |
| ------------------------------------------- | ------------------------------------ | --------------------------- |
| vwf `plugin.json`                           | version file                         | U6 only                     |
| `.claude-plugin/marketplace.json`           | generated                            | U6 only                     |
| every human-facing doc outside `plugins/`   | n units, one doc                     | U5 only                     |
| the pack's `setup/mise` vs this repo's copy | U3 applies U2's edit; no shared path | U2 / U3 each own their copy |

## Waves

- **Wave 1 — U1, U2, U3.** Disjoint paths.
- **Wave 2 — U4**, review. **Wave 3 — U5**, docs. **Wave 4 — U6**, gates and
  bump.

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

| Step                       | Mode | Notes                                                            |
| -------------------------- | ---- | ---------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf on this machine; picked up by a **restarted** session |

## Gates the orchestrator keeps

**`--lock-only` in an isolated scratch repo**, after wave 1 (`HOME` and every
`MISE_*` dir under one `mktemp -d`; the mise pack's `config/.config/` copied in,
`mise trust -a`): with no lock, `MISE_ENV=dev mise run setup:mise --lock-only`
writes `.config/mise/mise.lock` (and a `locks/` sidecar when a tool needs one)
and installs nothing but uv — `MISE_DATA_DIR/installs` holds uv and python alone
(decisions 7, 8); a second run changes no file;
`MISE_ENV=ci mise install --locked --dry-run` succeeds against it. Record in the
Run log; a failure goes back to U2.

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

- **B50** — shaping speed in general; this plan only avoids adding an install.
- **Installing tools during init** — still the §10 bootstrap offer.

## Parked

none

## Run log

| Wave | Unit           | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Commit |
| ---- | -------------- | ----- | ----- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight      | —     | —     | green       | all 7 Wave gate lines green on develop c766f44f; doctor: repo not onboarded to vwf (no .config/vwf.yaml, removed in 4d184778) — no blocking finding, nothing evaluated                                                                                                                                                                                                                                                                                                                              | —      |
| 0    | format-check   | —     | —     | skipped     | no covers: — plan reads no blueprint artifact                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —      |
| 0    | conventions    | —     | —     | skipped     | no code unit — plan of edit and review units                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —      |
| 1    | U2             | opus  | 1     | green       | --lock-only flag; refused with --upgrade; missing-lock branch factored into write_missing_lock (union rule once); outside dev a missing lock still exits 1; also skips setup:lint. GAP: no isolated mise experiment — assumed usage_lock_only var; orchestrator gate proves it                                                                                                                                                                                                                      |        |
| 1    | U1             | opus  | 1     | green       | new-repo §11(b) lock step before staging, lock + locks/ join the written list, failure stops that repo's git pass; existing-repo runs it only when no lock; SKILL.md summary one line. GAP: when §9 deferred mise (not installed) the lock step fails, so that repo commits nothing — assumed intended                                                                                                                                                                                              |        |
| 1    | U3             | opus  | 1     | green       | --lock-only; refused with --upgrade; missing-lock block moved above reshim then exit 0. Not byte-identical to U2's copy (different structure + error text); copies already differed on develop by one comment (Fact wrong). GAP: code:precommit ran --fix over the shared worktree, may have re-padded other units' files; its own file clean alone; --lock-only in this repo a no-op                                                                                                               |        |
| 1    | R1             | opus  | 1     | findings(5) | copies not byte-identical (U3, decision 3) → converge on pack's; new-repo.md:723 lock step blocks commit when §9 deferred mise (U1 regression); SKILL.md:131 orphan line (U1); U2 Owns cell lacked references/mise.md → aligned to unit file (GAP); DOCS FALSIFIED → U5: .claude/skills/vwf-plugin/SKILL.md:201, site/.../plugins/vwf.md:1447, site/.../how-to/greenfield/single-repo.md:111 (git pass omits lock step)                                                                             | —      |
| 1    | U3             | opus  | 2     | green       | cp -p of the pack's copy; diff empty, exec bit kept; --lock-only no-op here; --lock-only --upgrade exits 1                                                                                                                                                                                                                                                                                                                                                                                          |        |
| 1    | U1             | opus  | 2     | green       | §11(b): where §9 deferred mise the lock step is skipped and the pass goes on; only an actual lock failure stops it; SKILL.md bullet refolded by hand; existing-repo.md defers to §11(b), unchanged                                                                                                                                                                                                                                                                                                  |        |
| 1    | R1             | opus  | 2     | pass        | round-1 findings fixed; copies byte-identical; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                        | —      |
| 1    | gate:lock-only | —     | —     | failed      | isolated scratch repo (HOME + MISE_*under mktemp): run 1 `MISE_ENV=dev mise run setup:mise --lock-only` exits 1 — "Python dependency locks require uv >= 0.12.10": locking pipx:graphifyy shells out to a uv on PATH, and with no mise-installed uv only a stray uv 0.12.3 was found. With a uv present: lock + locks/ sidecar written, installs/ empty, run 2 changes no file, `MISE_ENV=ci mise install --locked --dry-run` ok. Inherited: develop's full setup:mise also locks before installing | —      |
| 1    | U2             | opus  | 2     | unresolved  | decision 7: write_missing_lock runs `mise install uv` when `mise ls --current uv` (MISE_LOCKED=false MISE_ENV=$LOCK_ENVS — ci's locked=true hides latest pins with no lock). Lock then fails: "No interpreter found for Python >=3.10 … downloads 'never'". A failed lock leaves a partial mise.lock that a second run takes as present. User ruled decision 8                                                                                                                                      |        |
| 1    | U2             | opus  | 3     | green       | decision 8: dev pin python latest; write_missing_lock installs uv then python (when declared), sets UV_PYTHON, removes a partial lock on failure and exits 1; mise.md 3 lines; own isolated run: lock + sidecar, installs uv+python only, run 2 no-op, ci --locked dry-run ok. GAP: tools.dev.toml header says "never the language runtime" — now contradicted by the python pin, left as is                                                                                                        |        |
| 1    | U3             | —     | 3     | green       | orchestrator applied U3's own round-2 ruling mechanically: `cp -p` of U2's round-3 pack copy; diff empty (decision 3)                                                                                                                                                                                                                                                                                                                                                                               |        |
| 1    | gate:lock-only | —     | —     | green       | isolated scratch (HOME + MISE_* under mktemp, PATH without uv): run 1 exit 0, mise.lock + locks/{npm-askviraj-linter,pipx-graphifyy} written, installs/ = python, uv only; run 2 changed no file; `MISE_ENV=ci mise install --locked --dry-run` exit 0. Homebrew python3 3.14 was on PATH here; U2's own run had system 3.9 only and also passed                                                                                                                                                    | —      |
| 1    | U2             | opus  | 4     | green       | tools.dev.toml header: the python pin is uv's lock-time interpreter; a pack pinning python in tools.toml drops it; refolded by hand (payload, unformatted)                                                                                                                                                                                                                                                                                                                                          |        |
| 1    | gate           | —     | —     | green       | all 7 Wave gate lines green (code:precommit converged on the second run after re-padding index.md); wave review R1 pass; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                              | —      |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-init-commits-the-lock

or let the queue pick it, by priority:

/vwf:execute next
