---
type: vwf-change-plan
title: /vwf:execute all asks its run-level questions once, as overrides for that
  run
requires: [ docs/plans/2026-10-07-execute-all ]
backlog: []
backlog_pieces: []
---

# Plan — /vwf:execute all asks its run-level questions once, as overrides for that run (2026-10-07)

## Status

**RUNNING**

RUNNING since 2026-10-07 in .worktrees/2026-10-07-execute-all-overrides

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release vwf publicly                              | none    |
| Release site publicly                             | none    |

The one step is `run`; a **restarted** session picks up what it stages.
**Release none** — the user runs `/release` by hand after the chain. **No
bump**: vwf is `21.0.0`, already a major above the last tag `vwf-v20.0.1`.

## Goal

After this lands, `/vwf:execute all` asks its run-level questions once, before
the first plan, and applies each answer as an override of the plans' steps for
that run only.

Plan 3 of 3 — requires `2026-10-07-execute-all`. No reversal: the planners still
record every answer a single run needs; these are questions about the **run** of
several plans, which no single plan can answer.

## Facts the survey established

- Plan 1 (landed, archived) made execute ask nothing at run time; plan 2 adds
  `/vwf:execute all`, its loop in
  `plugins/vwf/skills/execute/references/all.md`, and the agent
  `plugins/vwf/agents/execute-runner.md`. Find passages by content — line
  numbers moved.
- Execute cuts one worktree per plan through `vwf:git-workflow`, named after the
  plan folder, with declared preferences (isolate without asking; commit only).
  git-workflow's landing has a "keep worktree" option; the merge tasks refuse a
  dirty tree.
- `next` (plan-management) only takes rows whose `requires:` are satisfied — a
  change requirement by a `COMPLETE` row; landing in turn keeps that working.
- The Consent block is the folder's record; the Run log is the run's.
- Commit types: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.

## Assumed decisions — confirm or override at review

| #  | Decision         | Ruling                                                                                                                                                                                                                                                  | Rejected                              | Unit   |
| -- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------ |
| O1 | The questions    | Four, asked once before the first plan: one shared worktree; deduped after-landing steps; one release at the end; landing for each plan recorded `no`. Each is asked only when it applies to a plan the loop will reach; the shared-worktree one always | fewer overrides                       | U1     |
| O2 | Shared worktree  | One worktree on branch `all-<date>-<HHMM>`, brought up to date from `develop` before each plan; each plan lands in turn with "keep worktree"; the loop's exit removes it                                                                                | one merge at the end                  | U1, U2 |
| O3 | Deduped steps    | An identical after-landing step command recorded by several plans runs once, after the last landed plan — on an early stop too; release steps are excluded                                                                                              | running each plan's steps             | U1, U2 |
| O4 | One release      | Each distinct release step a plan records `run` is held and runs once after the last plan; on an early stop every held release stays held and the exit report lists it with its command                                                                 | running releases for the landed plans | U1, U2 |
| O5 | Landing override | Before the first plan, each plan the loop will reach that records merge `no` is listed and asked: land it this run, yes or no                                                                                                                           | none                                  | U1     |
| O6 | Where answers go | The answers are passed to each runner in its dispatch prompt and written as one `override:` line in each folder's Run log; a folder's Consent block is never changed                                                                                    | writing them into the folders         | U1, U2 |
| O7 | Review row       | None — every change is prose                                                                                                                                                                                                                            | a `Kind: review` row                  | —      |

## New dependencies

none

## Units

| Id | Wave | Unit file                      | Kind | Owns                                                                                                                                                                       | Depends on | Status  | Commit |
| -- | ---- | ------------------------------ | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-execute.md](01-execute.md) | edit | `plugins/vwf/skills/execute/**`                                                                                                                                            | —          | green   |        |
| U2 | 1    | [02-runner.md](02-runner.md)   | edit | `plugins/vwf/agents/execute-runner.md`                                                                                                                                     | —          | green   |        |
| U3 | 2    | [03-docs.md](03-docs.md)       | edit | `CLAUDE.md`, `readme.md`, `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-07-execute-all-overrides.md` (new) | U1, U2     | pending |        |
| U4 | 3    | [04-gates.md](04-gates.md)     | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (both expected unchanged)                                                                      | U3         | pending |        |

## Shared-file rule

| File                                      | Why it collides                                    | Owner           |
| ----------------------------------------- | -------------------------------------------------- | --------------- |
| `plugins/vwf/.claude-plugin/plugin.json`  | several units bumping one version is a lost update | gates unit only |
| `.claude-plugin/marketplace.json`         | generated; regenerating mid-wave races             | gates unit only |
| every human-facing doc outside `plugins/` | n units editing one doc                            | docs unit only  |

## Waves

- **Wave 1 — U1, U2.** Disjoint files; U2 reads the overrides from the dispatch
  prompt in the shape O6 fixes, so neither reads the other.
- **Wave 2 — U3.** Docs.
- **Wave 3 — U4.** The full gate.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
pnpm exec tsc --noEmit -p scripts
mise run code:precommit
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                    |
| -------------------------- | ---- | ------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages vwf into the dev marketplace; a **restarted** session picks it up |

## Gates the orchestrator keeps

- **Questions only before the first plan.** The wave review finds no passage by
  which `all` or a runner asks anything after the first runner is dispatched.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm`. A unit never runs
`git checkout`, `git restore`, or a formatter's `--fix` outside its Owns.

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- One merge at the end of a shared-worktree run — rejected at O2.
- Authorising a release no plan records `run` — O4 only regroups recorded
  releases.

## Parked

none

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Commit |
| ---- | --------- | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight | —     | 1     | green       | doctor: no .config/vwf.yaml (not onboarded), no blocking finding; mempalace daemon unreachable — memory steps skipped; format check skipped — no covers:; conventions skipped — no code unit; 7 wave-gate lines green                                                                                                                                                                                                                                                | —      |
| 1    | U2        | opus  | 1     | green       | DECIDED: Overrides block entries named shared worktree / skip / hold / land: yes; absent block → Consent alone. GAP: wrote before U1's SKILL.md passage existed — align names at wave review                                                                                                                                                                                                                                                                         | —      |
| 1    | U1        | opus  | 1     | green       | DECIDED: block lines shared worktree: <branch> / skip as deduped: / hold release: / land: yes / Overrides: none; override row wave 0 after preflight. GAP: keeps shared worktree on STOPPED (resume needs it) against O2 exit removal; release step = anything that publishes; held releases run only with no stop; plan-management unclaim finds worktree by folder basename — misses all-… worktree (outside Owns)                                                 | —      |
| 1    | R1        | opus  | 1     | findings(8) | 4 U2 drift vs all.md block shape (worktree path, skip/hold names, exit removal, DETAIL shape); U1 SKILL.md:536 + all.md:132 cite a git-workflow refresh/removal op it never defines; U1 all.md:119 'never edits the tree' falsified; rule 5 unowned: plan-management/SKILL.md:157 unclaim misses all-… worktree, assets/plan-interview.md:167 'asks nothing' unqualified → handed to U3. RULINGS: U1 keeps the worktree on STOPPED against O2; O5 asked one per turn | —      |
| 1    | U2        | opus  | 2     | green       | aligned Overrides block to all.md literal lines and DETAIL shape; removal left to all.md                                                                                                                                                                                                                                                                                                                                                                             | —      |
| 1    | U1        | opus  | 2     | green       | refresh = plain git merge of the integration branch in the clean shared worktree (conflict = hard halt); exit removal = plain git worktree remove, asks nothing; all.md:119 reworded; STOPPED exception made explicit; O5 lists all no-merge plans first                                                                                                                                                                                                             | —      |
| 1    | R1        | opus  | 2     | findings(1) | 8→1 converging; round-1 items resolved; contested (cap 2): SKILL.md:543 [U1] the override: Run log row instruction sits inside the shared-worktree paragraph only (all.md:72 and runner step 5 cover it). CONTRACT clean, RULINGS clean, orchestrator gate clean                                                                                                                                                                                                     | —      |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-10-07-execute-all-overrides

or let the queue pick it, by priority:

/vwf:execute next
