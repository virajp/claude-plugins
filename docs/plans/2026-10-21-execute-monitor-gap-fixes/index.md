---
type: vwf-change-plan
title: Execute monitor gap fixes
requires: []
source: []
backlog: []
backlog_pieces: []
gaps_of: [ docs/plans/2026-10-21-execute-monitor-in-vwf ]
---

# Plan — Execute monitor gap fixes (2026-10-21)

## Status

**RUNNING**

RUNNING since 2026-10-24T17:54 in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-10-21-execute-monitor-gap-fixes

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | no      |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt, and `run` is the only mode. This plan has no after-landing
step: `.config/vwf.yaml`'s `after_landing:` already runs
`mise run p:plugins:local`. The staged vwf is picked up only by a **restarted**
session.

## Release levels

| Project | Level | Reason                                                                             |
| ------- | ----- | ---------------------------------------------------------------------------------- |
| vwf     | PATCH | The progress pane follows every unit of every plan kind, and its defects are fixed |
| site    | PATCH | The manual drops the edit-only limit and describes the wave-review lines           |

## Goal

After this plan lands, the `/vwf:execute` progress pane follows every unit of a
run of either kind, change or cycle, and the defects the review of
`docs/plans/2026-10-21-execute-monitor-in-vwf` found are fixed. The plan takes
that plan's two open gaps (`gaps_of:`). No standing decision is reversed:
decision 6 of that plan only scoped it to a move, and
`docs/memory/decisions/2026-10-21-execute-monitor-inside-vwf.md` lists these
defects as known limits.

## Facts the survey established

Paths below: `R` is `plugins/vwf/hooks/monitor/register.tsx`, `P` is
`plugins/vwf/hooks/monitor/plan.ts`. No line moved since the review's round 2.
The reviewer's full text is in
`docs/plans/2026-10-21-execute-monitor-in-vwf/engine/U2-1.log` and `U2-2.log`.

- **What `/vwf:execute` dispatches** (`plugins/vwf/skills/execute/**`,
  `plugins/vwf/assets/execute-stages.md`):
  - an edit unit (the docs and gates units too): `subagent_type`
    `general-purpose`, `name` `U<n>`; its prompt carries the unit file path
    (`references/edit-unit.md:15-20`);
  - the wave review: `general-purpose`, `name` `R<wave>`; late re-runs
    `R<wave>-late` and `R-late`; its prompt carries the wave's unit files
    (`edit-unit.md:39-42`, `references/review-unit.md:222-223`);
  - a coder: type `execute-coder` (so `vwf:execute-coder`); its prompt carries
    the unit id and the `NN-<unit>.md` file, in no fixed format
    (`execute-stages.md:22,69,75`);
  - a review row: `execute-code-reviewer` and `execute-security-reviewer` in one
    message; the prompt carries the loop id, the row id `U<n>` or `U<n>-late<k>`
    (`review-unit.md:18-21,106-108`);
  - acceptance and UX: `execute-acceptance-verifier`, `execute-ux-reviewer`; no
    unit id;
  - a runner (`all`): `vwf:execute-runner`, `name` `run-<n>`, the folder path in
    its prompt (`references/all.md:98-104`).
  - `description` is never specified. `run_in_background` is never used for an
    Agent call; the review engines may run as background tasks the orchestrator
    waits on with `TaskOutput`. The run is one main turn; the main loop's
    `turn.complete` fires mid-run only at a pause, a halt or a subagent death
    (`SKILL.md:429-470,1046-1058`).
- **How a run ends:** the folder's Status block reads `COMPLETE <date> — …`,
  `BLOCKED at wave <n> — …`, `RUNNING — paused at unit <n> …` or
  `RUNNING — ready to land by hand on <branch>` (`SKILL.md:841-869,968-971`); on
  a green landing with no gap the folder moves to `docs/plans/archived/`.
- **The engine API:** `agent.spawn`'s input carries `name` beside
  `subagentType`, `description` and `prompt`; `$.agent.list()` answers `id`,
  `name`, `type`, `description`, `status`, `parentId`, and drops an agent once
  it ends.
- **The defects, with the reviewer's scenario and the line:**
  1. Only `vwf:execute-*` agents are followed: `R:28` (`AGENT_PREFIX`), the
     filters at `R:240` (adoption) and `R:364-367` (`agent.spawn`). `R:238` also
     adopts agents of an earlier plan of an `all` run.
  2. `turn.complete` ends the run at the first idle main-loop turn: `R:416-438`,
     the idle test at `R:424`, vacuously true with no tracked agent.
  3. Refresh race: `refresh` reads the state once (`R:184`), awaits
     (`R:197-235`), and writes back a list built from that stale read (`R:280`);
     `turn.complete` calls `refresh` outside `poke`'s guard (`R:422`).
  4. First-`RUNNING`-row pick: `R:199-206` (`R:205`), `P:100-105`; never re-read
     once a folder is set.
  5. Finished agents stuck `running`: `R:250-261`, the fallback at `R:252`;
     adopted agents with no `startedAt` never get an `endedAt` (`R:254`).
  6. Newest-mtime `index.md` pick: `R:145-159`, the comparison at `R:153`.
  7. Tool rows compact while the pane is closed: `R:441-454`; the
     `AskUserQuestion` hook reopens a pane the person closed (`R:353-355`).
  8. Blocking `poke` in the unmatched `tool.call` hook: `R:337-345`
     (`await poke($)` at `R:341`); `poke` awaits an in-flight refresh even when
     throttled (`R:167-180`).
  9. Member-repo plans not found: `R:119-142`; the cwd list at `R:197`; the
     index read at `R:201-205`.
  10. Reviewers counted against the covered unit: `P:113-123`, the file match
      first at `P:114-116`; callers `R:258`, `R:398`; `P:9` matches only `U\d+`.
  11. Escaped pipes in table cells: `P:35-36`, the split inside `table()` at
      `P:30`.
  12. The 3-second timer runs in every vwf session: `R:292`, registered at
      `session.start`.
- **Membership** (`plugins/vwf/assets/membership.md:14-44,64-80,158-170`): the
  base repo holds `.config/vwf.yaml` with `members:` entries, each with a
  `path:` relative to the base root; a member holds
  `.config/vwf-membership.yaml` with `host:` relative to its own root; the base
  is resolved by `.config/vwf.yaml` here, else the membership `host:`, else a
  superproject, else a linked worktree's main checkout. Under `multi-repo` a
  cycle plan's folder lives in the member; the plan index lives in the base.
- **Tests now:** 6 — `plan.test.ts` 4 (`:50`, `:65`, `:74`, `:94`),
  `pane.test.tsx` 1 (`:33`), `refresh.test.tsx` 1 (`:27`).
- **The docs this plan falsifies:**
  `site/src/content/docs/plugins/vwf.md:3060-3065` (one row per unit, open its
  transcript) and `:3077-3079` (the edit-only limit);
  `.claude/skills/vwf-plugin/SKILL.md:417-418` (follows only `vwf:execute-*`
  subagents).
  `docs/memory/decisions/2026-10-21-execute-monitor-inside-vwf.md:73-78` is
  dated and stays.
- **Tooling, unchanged since the last plan:** dprint formats `.ts`/`.tsx` at
  commit and once turned `<Text> </Text>` spacers into empty elements — write
  spacers as `{" "}`; the linter ignores `**/*.d.ts`; `claude plugin test` runs
  only tests inside the plugin; CI has no `claude`.
- **The commit convention:** types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; no scopes.

## Assumed decisions — confirm or override at review

| #  | Decision             | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Rejected                                | Unit |
| -- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---- |
| 1  | Matching             | Follow an agent when its `name` is a unit id of the current plan (`U<n>`) or a wave-review name (`R<wave>`, `R<wave>-late`, `R-late`), or its type starts with `vwf:execute-` (the runner excepted). Map it to a unit by its name; a coder by the unit file in its prompt; a review-row reviewer by the row id in its prompt, read before any file name, so a reviewer never counts against the units it covers. Do not adopt an agent of an earlier plan of an `all` run                                                   | follow any subagent while a run is live | U1   |
| 2  | Wave reviews         | One line per wave review under the unit rows — status, start, end, time — that opens its transcript like a unit row; not a segment of the progress bar                                                                                                                                                                                                                                                                                                                                                                      | wave reviews not shown                  | U1   |
| 3  | Run end              | The run ends when the plan's Status reads `COMPLETE` or `BLOCKED`, or the folder moved to `docs/plans/archived/`. A main-loop turn that ends with no live agent only marks the run waiting; the pane keeps reading, and ends the run after 10 minutes with no change in the plan file or the agents                                                                                                                                                                                                                         | the main-turn rule, fixed               | U1   |
| 4  | Seven small fixes    | The refresh merges into the current state inside the `update` callback (agents and plans by id), and `turn.complete` goes through `poke`; an agent seen before and missing from `agent.list` is `completed` with `endedAt` now; keep the known `index.md` path while it exists, search only when it is gone; an `isOpen` state gates the compact tool rows, and `AskUserQuestion` reopens only a pane it closed; `void poke($)` in `tool.call`; the row id before the file name in `unitFor`; escaped pipes split correctly | park some                               | U1   |
| 5  | Several RUNNING rows | With no folder named and several `RUNNING` rows, prefer the row whose `index.md` is in this session's checkout or one of its worktrees; otherwise set a `problem` that asks for `/vwf-monitor <folder>`; re-resolve while the pick was a guess                                                                                                                                                                                                                                                                              | the first row                           | U1   |
| 6  | Member repos         | Resolve the base repo per `membership.md` (`.config/vwf.yaml` here, else the membership `host:`, else a linked worktree's main checkout); read the plan index there; search the base, each `members:` `path:` and their worktrees. Read the paths with a small line reader — no YAML library                                                                                                                                                                                                                                | park the member-repo search             | U1   |
| 7  | Timer                | The 3-second timer runs only while a run is live, and stops when the run ends                                                                                                                                                                                                                                                                                                                                                                                                                                               | a timer in every vwf session            | U1   |
| 8  | Tests                | One new test case for each of rulings 1 to 7, in the existing test files or a new `agents.test.tsx` under `hooks/monitor/`                                                                                                                                                                                                                                                                                                                                                                                                  | —                                       | U1   |
| 9  | Review               | A review row covers U1, because U1 changes runnable code that runs in every vwf session                                                                                                                                                                                                                                                                                                                                                                                                                                     | the wave review only                    | U2   |
| 10 | Decision doc         | The docs unit writes `docs/memory/decisions/2026-10-21-execute-monitor-gap-fixes.md`; the dated `2026-10-21-execute-monitor-inside-vwf.md` stays                                                                                                                                                                                                                                                                                                                                                                            | edit the dated doc                      | U3   |
| 11 | Chain                | The plan requires nothing; priority 10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                       | —    |
| 12 | Known index.md       | Decision 4's known `index.md` path is kept only while no linked worktree for the run exists. A main-checkout copy is known until then; once the run's worktree exists, its copy replaces the main-checkout copy on the next refresh. Recording the worktree and log paths in the plan frontmatter at the claim is the next plan's, not this one's                                                                                                                                                                           | the main-checkout copy stays known      | U1   |

## New dependencies

none

## Units

| Id | Wave | Unit file                    | Kind   | Owns                                                                                                                                                                                                                      | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-fixes.md](01-fixes.md)   | edit   | `plugins/vwf/hooks/monitor/**`                                                                                                                                                                                            | —          | pending | 3eb53ba0 |
| U2 | 2    | [02-review.md](02-review.md) | review | —                                                                                                                                                                                                                         | U1         | pending |          |
| U3 | 3    | [03-docs.md](03-docs.md)     | edit   | `site/src/content/docs/plugins/vwf.md`, `.claude/skills/vwf-plugin/**`, `docs/memory/decisions/2026-10-21-execute-monitor-gap-fixes.md` (new), and any other human-facing passage `vwf:docs-sync` finds outside U1's Owns | U2         | pending |          |
| U4 | 4    | [04-gates.md](04-gates.md)   | edit   | none                                                                                                                                                                                                                      | U3         | pending |          |

## Shared-file rule

| File                   | Why it collides           | Owner   |
| ---------------------- | ------------------------- | ------- |
| every human-facing doc | docs ship with the change | U3 only |

## Waves

- Wave 1 — U1 alone: every fix sits in `register.tsx`, `plan.ts` and their
  tests.
- Wave 2 — U2 alone: the review of U1's code.
- Wave 3 — U3 alone: the docs, after the review settled the code.
- Wave 4 — U4 alone: the final gate.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
pnpm exec tsc --noEmit -p scripts
```

plus the wave review, plus every report read for `UNRESOLVED:`. Every line must
be green before wave 1.

## After landing

none

## Gates the orchestrator keeps

- `claude plugin test plugins/vwf` — green, every old and new test, after U1 and
  in U4.
- `claude plugin validate --strict plugins/vwf` — passes, after U1 and in U4.
- The live pane cannot be proved by a diff. The final report lists this check
  for the user to do by hand: restart a session, run `/vwf:execute` on a change
  plan, and make sure that the edit units and the wave reviews show with their
  times, and that the run ends when the plan lands.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never writes a lock file. A unit never runs `git checkout`,
`git restore` or a formatter with `--fix` on a path outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Changes to `vwf:execute` — no new `name:` or `description` marker for the
  coder, the reviewers, acceptance or UX; the pane works with what execute sends
  today.
- A status block for the other vwf skills — the rest of B101.
- New pane features beyond ruling 2's wave-review lines — no history of earlier
  plans, no unit titles, no new layout.
- A CI gate with the `claude` CLI.
- This repo's own `.config/` — the user edits it by hand.
- `docs/plans/2026-10-21-execute-monitor-in-vwf/**` — its `04-gates.md` says 5
  tests; that is the record of its run, not a defect.

## Parked

- In `all` mode, show the plans that ran before the current one.
- Show unit titles in the unit rows.
- A `Started` field in the Run log, so that a unit that started before the pane
  loaded has a start time.
- Add `claude plugin test plugins/vwf` to `p:plugins:check` — a by-hand edit in
  this repo's `.config/`.

## Run log

| Wave | Unit      | Model | Round | Outcome      | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Commit   |
| ---- | --------- | ----- | ----- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | failed       | wave gate: 5 of 5 lines green; `/vwf:doctor`: blocking — graphify CLI broken (`ModuleNotFoundError: No module named 'graphify'`), fix `MISE_ENV=dev mise install` (reinstall `pipx:graphifyy`); 4 non-blocking findings noted; no LSP finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 0    | preflight | —     | 2     | green        | resume: graphify CLI repaired by the user, `graphify --help` runs; wave gate 5 of 5 green at round 1; edit units only, so no stack conventions fetched                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 1    | U1        | opus  | 1     | green        | 4 files: register.tsx, plan.ts, plan.test.ts, agents.test.tsx (new); 16 tests. DECIDED: an `all` run ends on BLOCKED or the 10-minute wait, not COMPLETE; the known index.md is kept only in the folder's own worktree; several RUNNING rows picked by tiers (own worktree, then other worktrees), a guess stops re-resolving once an agent is followed; the timer restarts at session.start on a live run. GAP: `mise x` fails on the `pipx:mempalace` install, so gates ran with `MISE_*_AUTO_INSTALL=false`, tsc against the engine types from a /tmp tsconfig                                                                                                                                                                                                                                       | —        |
| 1    | R1        | opus  | 1     | findings(3)  | CONTRACT clean; RULINGS not clean: register.tsx:509 #3 — `all` mode ignores COMPLETE/archived as the run end; register.tsx:258 #4 — the known index.md kept only in the folder-named worktree; register.tsx:385 #5 — a guessed pick frozen by the first followed agent. Orchestrator gates after U1: `claude plugin test` 16 pass, `validate --strict` passed                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 1    | U1        | opus  | 2     | green        | R1 loop-back: decisions 3, 4, 5 fixed (COMPLETE/BLOCKED/archived ends the run in every mode; known index.md kept while it exists; a guess re-resolves with no exit); 3 tests added, 19 pass. DECIDED: after an ended `all` run, a new run starts only from a spawned `vwf:execute-runner` with a folder in its prompt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| 1    | R1        | opus  | 2     | findings(1)  | round-1 fixes #3, #4, #5 hold; new: register.tsx:440 #1 — with each `all` plan a new run of one plan, the adoption filter `plans.length === 1 \|\| info.parentId === runner` skips the parent check, so an earlier plan's still-listed agent is adopted. Count fell 3 → 1, none resurfaced; a RULINGS line is never residue, so it loops back                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 1    | U1        | opus  | 3     | green        | R1 round-2 loop-back: the adoption filter applies the parent check whenever a runner is set; test added (fails on the old filter); 20 tests pass, `validate --strict` passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 3eb53ba0 |
| 1    | R1        | opus  | 3     | skipped      | wave-review cap of two rounds reached; the round-2 finding was fixed and covered by a test, and the U2 review row reviews U1's code next                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 1    | gate      | —     | 1     | green        | wave gate 5 of 5 green (run with `MISE_*_AUTO_INSTALL=false`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 2    | U2        | opus  | 1     | findings(10) | review; range 83dfc8e8..3eb53ba0; files register.tsx, plan.ts, plan.test.ts, agents.test.tsx → U1 (index.md: orchestrator commit, excluded). 2 high (register.tsx:261 `all` run locks onto the main checkout's stale index.md; plan.ts:166 coder mapped by first U<n> in its prompt), 3 medium (:696 spawn not merged by id; :379 guess re-picks forever; :505 interrupted run never ends, timer runs on), 5 low (:507, :315, :381, plan.ts:190, :260). Engine: `/code-review` 10 findings, all kept; log `engine/U2-1.log`. API COMPAT n/a. mempalace write refused, no recall tag                                                                                                                                                                                                                     | —        |
| 2    | U2        | opus  | 1     | pass         | security; engine `/security-review` no findings; reviewer: no findings, approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 2    | U1        | opus  | 1     | failed       | U2 round-1 loop-back: agent stopped by a `/reload-plugins` before it changed a file; re-dispatched once with the same prompt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —        |
| 2    | U1        | opus  | 2     | unresolved   | U2 round-1 loop-back (retry): all 10 findings fixed (worktrees ranked over main checkouts; caches; own-worktree pick tier ends the guess; re-pick carries no agents; spawn merged by id; BLOCKED/COMPLETE wait for live agents; stale end needs no idle turn; no problem line on fallback; coder mapped by unit file; unindented `members:`); 27/27 tests pass (9 fail on 3eb53ba0), validate --strict, p:plugins:check, tsc green. DECIDED: stale end = no live agent, no main tool call running, 10 min unchanged; kept decision 4's keep-known path. UNRESOLVED: should decision 4 count a main-checkout index.md as known? If it does, a run started before its worktree exists never reads the worktree copy (the U2 high finding at register.tsx:261). Work committed as WIP so the tree is clean | aab1f95c |
| 2    | U2        | —     | —     | skipped      | depends on U1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 3    | U3        | —     | —     | skipped      | depends on U2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 4    | U4        | —     | —     | skipped      | depends on U3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 0    | preflight | —     | 3     | green        | resume after decision 12: `/vwf:doctor` no blocking finding (early config, no registry: §§3–5 skipped; noted, not in scope: `pnpm audit` 1 critical, GHSA-cg2g-xh64-v4q7 dompurify via site>mermaid); U2, U3, U4 reset to pending; wave gate 5 of 5 green; edit units only, so no stack conventions fetched                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —        |
| 1    | U1        | opus  | 4     | green        | resume, decision 12: register.tsx `locate` keeps a known index.md only in a linked worktree; a main-checkout copy re-reads `git worktree list` each refresh and the run's worktree copy (named for the folder, or named in its Status) replaces it; `roots` returns `{ ordered, linked }`. agents.test.tsx: ruling 12 test (fails on the committed tree), ruling 4 test now starts from a linked-worktree copy. DECIDED: "the run's worktree" is one named for the folder or whose Status names it, so another session's old copy never replaces the known one. 28 tests pass, `validate --strict` passed, `p:plugins:check` green                                                                                                                                                                      | —        |
| 1    | R1        | opus  | 4     | findings(1)  | resume, wave diff `git diff HEAD` (plan folder excluded). CONTRACT clean; RULINGS not clean: register.tsx:325 #12 — a known copy in a linked worktree that is not the run's is never replaced once the run's worktree appears; the rewritten ruling-4 test (agents.test.tsx:380-405) relies on it. Ruling-12 test present (agents.test.tsx:409-427); loops back to U1                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| 1    | U1        | opus  | 5     | green        | R1 round-4 loop-back: `locate` keeps a known index.md only in the run's worktree (named for the folder, or named in its copy's Status); a copy in the main checkout or another linked worktree re-reads `git worktree list` each refresh and is replaced once the run's worktree holds a copy. Ruling-4 test starts from a run-worktree copy; new ruling-12 test for a non-run linked worktree copy. DECIDED: an `all` run's shared worktree stays known while no run worktree copy exists. 29 tests pass, `validate --strict` passed, `p:plugins:check` green                                                                                                                                                                                                                                          | —        |
| 1    | R1        | opus  | 5     | pass         | round-4 finding #12 fixed (register.tsx:326-353, `isRuns`); U1's `all` shared-worktree ruling consistent with decisions 4 and 12; tests agents.test.tsx:379-407 (ruling 4), :410-429 and :431-452 (ruling 12). CONTRACT clean, RULINGS clean. Count fell 1 → 0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 1    | gate      | —     | 2     | green        | no Unit gate section; wave gate 5 of 5 green; orchestrator gates after U1: `claude plugin test plugins/vwf` 29 pass, `validate --strict` passed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-21-execute-monitor-gap-fixes

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
