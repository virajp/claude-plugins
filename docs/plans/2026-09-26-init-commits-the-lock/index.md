---
type: vwf-change-plan
title: init commits the lock — the first CI run of a shaped repo finds its
  mise lock
requires:
  - docs/plans/2026-09-26-mise-conf-d-packs
backlog: [ B67 ]
backlog_pieces: []
---

# Plan — init commits the lock — the first CI run of a shaped repo finds its mise lock (2026-09-26)

## Status

**APPROVED**

APPROVED 2026-09-26 by the user

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
lock is one file written only when missing; after M
(`docs/plans/2026-09-26-universal-packs-into-init`) the mise pack is init's;
after B2 (`docs/plans/2026-09-26-mise-conf-d-packs`) init merges every pack's
tools. Not a reversal.

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
  offers the bootstrap aggregator after the commit. Line numbers move with M and
  B2.
- **B1's lock rules**: one `.config/mise/mise.lock`; written only when missing
  or under `--upgrade` (dev); one `mise lock` with `MISE_ENV` set to the union
  of every environment suffix found; `task.run_auto_install = false`, so running
  the task installs nothing before its body.
- **`setup:mise`** lives at
  `plugins/vwf/skills/init/packs/mise/config/.config/mise/tasks/setup/mise`
  after M; this repo's `.config/mise/tasks/setup/mise` is byte-identical to it.
- **Gates**: `p:plugins:shellcheck` covers `init/packs/*` after M.
- **Commit convention**: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no
  scopes. **Versions**: vwf `20.0.0` after M, tagged only if `/release` ran at
  B2's landing.

## Assumed decisions — confirm or override at review

| # | Decision              | Ruling                                                                                                                                                                                                                                                           | Rejected                                                        | Unit  |
| - | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----- |
| 1 | When init locks       | Before each repo's `ops:` commit — members first, then the base — init runs `MISE_ENV=dev mise run setup:mise --lock-only` and stages `.config/mise/mise.lock` and `.config/mise/locks/**` into that commit; on a new repo, and on a reshape that finds no lock. | running `setup:mise` in full (installs every tool; slower, B50) | U1    |
| 2 | Where the logic lives | `setup:mise` gains `--lock-only`: write the combined lock only when it is missing, then exit before installing; with a lock present, do nothing. The environment-union rule lives once, in the script.                                                           | init running `mise lock` itself (the rule written twice)        | U2 U3 |
| 3 | This repo             | `.config/mise/tasks/setup/mise` stays byte-identical to the pack's.                                                                                                                                                                                              | —                                                               | U3    |
| 4 | Review row            | One `Kind: review` row (U4): a shell task changes.                                                                                                                                                                                                               | the wave review alone                                           | U4    |
| 5 | Release               | If `vwf-v20.0.0` is tagged when the run starts, vwf `20.0.1`; otherwise no bump, riding `20.0.0`. No release step.                                                                                                                                               | always patch                                                    | U6    |
| 6 | Comments              | Any comment or sentence a unit adds is one line (B65).                                                                                                                                                                                                           | —                                                               | all   |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                        | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-init.md](01-init.md)                     | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`, `plugins/vwf/skills/init/references/existing-repo.md` | —          | pending |        |
| U2 | 1    | [02-mise-pack.md](02-mise-pack.md)           | edit   | `plugins/vwf/skills/init/packs/mise/**`                                                                                                     | —          | pending |        |
| U3 | 1    | [03-this-repo.md](03-this-repo.md)           | edit   | `.config/mise/tasks/setup/mise`                                                                                                             | —          | pending |        |
| U4 | 2    | [04-review.md](04-review.md)                 | review | —                                                                                                                                           | U2, U3     | pending |        |
| U5 | 3    | [05-docs.md](05-docs.md)                     | edit   | `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`                                                                          | U1, U4     | pending |        |
| U6 | 4    | [06-gates-and-bump.md](06-gates-and-bump.md) | edit   | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                 | U5         | pending |        |

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
and installs nothing — `MISE_DATA_DIR/installs` stays empty; a second run
changes no file; `MISE_ENV=ci mise install --locked --dry-run` succeeds against
it. Record in the Run log; a failure goes back to U2.

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

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-init-commits-the-lock

or let the queue pick it, by priority:

/vwf:execute next
