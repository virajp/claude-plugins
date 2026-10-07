---
type: vwf-change-plan
title: /vwf:execute all — every runnable plan, each in its own runner subagent
requires: [ docs/plans/2026-10-07-plans-carry-every-answer ]
backlog: []
backlog_pieces: []
---

# Plan — /vwf:execute all — every runnable plan, each in its own runner subagent (2026-10-07)

## Status

**COMPLETE**

COMPLETE 2026-10-07 — 0278b026 c330c702 34dd25ac 063fa056 6224a0eb

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release vwf publicly                              | none    |
| Release site publicly                             | none    |

The one step is `run`; a **restarted** session picks up what it stages.
**Release none** — plan 2 of 3; the chain ships after plan 3. **No bump**: plan
1 took vwf to `21.0.0`, already a major above the last tag `vwf-v20.0.1`.

## Goal

After this lands, typing `/vwf:execute all` once runs every runnable plan,
highest priority first, each in its own runner subagent; the loop stops at the
first point that needs the user; the session keeps only a one-line result per
plan.

Plan 2 of 3 — requires `2026-10-07-plans-carry-every-answer` (execute asks
nothing at run time; planners record every answer); required by
`2026-10-07-execute-all-overrides`.

**Reversal, confirmed:** each run happens "in a session that has done nothing
else" (`execute/SKILL.md:51-52`) and chained plans "land one focused run at a
time" (`:830`) become "a fresh context: a fresh session, or a runner that `all`
dispatches". Plain `/vwf:execute <folder>` and `next` are unchanged.

## Facts the survey established

Line numbers below were read before plan 1 landed; plan 1 rewrites execute, the
planners and plan-management, so each unit finds its passage by content, not by
number.

- Subagents may nest up to three layers below the main session by default
  (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). Under `all`: loop (0) → runner (1) →
  coder, reviewers, docs unit (2) → docs-sync's surveyor (3), at the limit.
- `disable-model-invocation: true` (`execute/SKILL.md:22`) removes execute from
  the model's context; the runner cannot call it through `Skill` — it reads the
  file. The loop knows the path: its own skill base directory.
- `next` (`execute/SKILL.md:77-86`;
  `plan-management/references/plan-index.md:118-188`) never takes a `RUNNING`
  row nor a row waiting on one; nothing runnable → a message listing each
  `APPROVED` row and what it waits on.
- The Status block detail line is already "the summary a reader sees first"
  (`execute/references/blocking.md:53-54`).
- The resource-cap directive comes from claude-status's `PostToolUse` hook,
  which reads the main session's statusline (`execute/SKILL.md:407-435`). The
  5-hour and 7-day figures are account-wide.
- A pause runs `/vwf:handoff` with no argument, writing the reserved `next`
  handoff; under `all` the loop ends at the first stop, so at most one is
  written.
- Checker rule 7 (`scripts/src/check.ts:1764-1801`) adds the role suffix of
  every agent name; no backticked `*-runner` token exists in `plugins/` today.
  The new agent must be referenced in backticks from a skill or asset body.
- Agent frontmatter: `name`, `description` (strict YAML — no colon-space in a
  plain scalar), `tools` (comma list), `model`; e.g.
  `plugins/vwf/agents/execute-coder.md:1-14`.
- "Fresh session" passages outside execute: `change-plan/SKILL.md:5`, `:11`,
  `:338`, `:355-364`; `plan/SKILL.md:6`, `:24`, `:422`, `:465`, `:488-497`;
  `plan-management/SKILL.md:8`, `:422-428`;
  `plan-management/references/plan-index.md:25`, `:120`, `:129`;
  `recall/SKILL.md:135-136`; `handoff/SKILL.md:126`, `:186`;
  `feedback/SKILL.md:210`; `assets/templates/plan-folder.md:273-281`;
  `assets/templates/project-claude.md:13`; `assets/execute-stages.md:25-26`.
- Docs: `CLAUDE.md:53-54`; `readme.md:252-255`;
  `.claude/docs/ci-and-releases.md:96`;
  `.claude/skills/vwf-plugin/SKILL.md:318-329`;
  `.claude/skills/vwf-plugin/references/docs-tree.md:48-51`, `:84`;
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:36`, `:52-75`;
  `site/src/content/docs/plugins/vwf.md` — the `/vwf:execute` section from
  `:2389`, `:327`, `:852`, `:189-195`;
  `site/src/content/docs/how-to/operate/ad-hoc-change.md:16-17`, `:169-202`;
  `how-to/operate/sessions-and-handoff.md:57`, `:141-143`.
- Commit types: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.

## Assumed decisions — confirm or override at review

| #  | Decision     | Ruling                                                                                                                                                                                                                                                                                            | Rejected                                         | Unit   |
| -- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------ |
| E1 | The runner   | New agent `plugins/vwf/agents/execute-runner.md`: tools Agent, Skill, Bash, Read, Write, Edit, Grep, Glob, TaskOutput, TaskStop and the mempalace names the execute agents carry; `model: opus`; handed the folder and the path to execute's `SKILL.md`, it follows that file for that one folder | a general-purpose subagent; splitting `SKILL.md` | U1, U2 |
| E2 | The loop     | `/vwf:execute all` calls `plan-management next`, dispatches one runner, waits for it, and repeats until nothing is runnable; runners never run in parallel                                                                                                                                        | parallel runners                                 | U2     |
| E3 | Stops        | Any runtime stop — the runner stops; the loop ends, printing its table and the resume command                                                                                                                                                                                                     | skip and continue; ask, then continue            | U2     |
| E4 | Reload       | The planners record a Consent row "End an `all` run after landing: yes/no", asked only when the plan edits a plugin the run itself loads; on yes, `all` ends after that plan and reports "restart, then `/vwf:execute all`"                                                                       | execute detecting it; accept and document        | U2, U3 |
| E5 | Caps         | The cap hook pauses a runner as it pauses execute today, which ends the loop; the loop starts no new plan once a cap directive has reached the session; a runner's own context goes unmeasured                                                                                                    | the loop polling the usage endpoint              | U2     |
| E6 | Return block | The runner returns exactly five lines — `PLAN:`, `OUTCOME:` (`COMPLETE`, `COMPLETE with gaps`, `STOPPED`), `DETAIL:` (the Status block detail line), `RESUME:` (the resume command or `none`), `ENDS RUN:` (`yes`/`no`); the loop's exit is one table of these plus the stop reason               | a free-form report                               | U1, U2 |
| E7 | Unchanged    | Plain `/vwf:execute <folder>` and `next` are unchanged; `disable-model-invocation` stays `true`                                                                                                                                                                                                   | making execute model-invocable                   | U2     |
| E8 | Review row   | None — every change is prose                                                                                                                                                                                                                                                                      | a `Kind: review` row                             | —      |

## New dependencies

none

## Units

| Id | Wave | Unit file                                | Kind | Owns                                                                                                                                                                                                                                                   | Depends on     | Status | Commit   |
| -- | ---- | ---------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------ | -------- |
| U1 | 1    | [01-runner-agent.md](01-runner-agent.md) | edit | `plugins/vwf/agents/execute-runner.md` (new)                                                                                                                                                                                                           | —              | green  |          |
| U2 | 1    | [02-execute.md](02-execute.md)           | edit | `plugins/vwf/skills/execute/**`                                                                                                                                                                                                                        | —              | green  |          |
| U3 | 1    | [03-planners.md](03-planners.md)         | edit | `plugins/vwf/skills/change-plan/SKILL.md`, `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/assets/plan-interview.md`, `plugins/vwf/assets/templates/plan-folder.md`                                                                                   | —              | green  |          |
| U4 | 1    | [04-vwf-passages.md](04-vwf-passages.md) | edit | `plugins/vwf/skills/plan-management/**`, `plugins/vwf/skills/recall/SKILL.md`, `plugins/vwf/skills/handoff/SKILL.md`, `plugins/vwf/skills/feedback/SKILL.md`, `plugins/vwf/assets/execute-stages.md`, `plugins/vwf/assets/templates/project-claude.md` | —              | green  |          |
| U5 | 2    | [05-docs.md](05-docs.md)                 | edit | `CLAUDE.md`, `readme.md`, `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-07-execute-all.md` (new)                                                                                       | U1, U2, U3, U4 | green  | 6224a0eb |
| U6 | 3    | [06-gates.md](06-gates.md)               | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (both expected unchanged)                                                                                                                                                  | U5             | green  | —        |

## Shared-file rule

| File                                      | Why it collides                                    | Owner           |
| ----------------------------------------- | -------------------------------------------------- | --------------- |
| `plugins/vwf/.claude-plugin/plugin.json`  | several units bumping one version is a lost update | gates unit only |
| `.claude-plugin/marketplace.json`         | generated; regenerating mid-wave races             | gates unit only |
| every human-facing doc outside `plugins/` | n units editing one doc                            | docs unit only  |

## Waves

- **Wave 1 — U1–U4.** Disjoint files; U2 names the agent U1 writes by its fixed
  name and return block (E1, E6), so neither reads the other.
- **Wave 2 — U5.** Docs over the whole delta.
- **Wave 3 — U6.** The full gate.

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

- **Rule 7 both ways.** `mise run p:plugins:check` passes with `execute-runner`
  declared, and the agent is referenced in backticks from `skills/execute/`.
  Pass: green.
- **No ask in runner mode.** The wave review finds no passage under
  `skills/execute/` by which a runner would ask the user anything.

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

- Parallel runners — engines and reviewers must not overlap (one-executor ruling
  3).
- Skipping past a stuck plan — the loop ends at the first stop.
- Resuming or unclaiming a paused plan — a person re-runs
  `/vwf:execute <folder>`; execute never unclaims (unclaim ruling 5).
- Making execute model-invocable.
- A cap on how many plans one run takes.

## Parked

- **Plan 3 — `2026-10-07-execute-all-overrides`** (requires this plan): `all`'s
  run-level questions, asked once before the first plan, each answer an override
  of the plans' steps for that run only.

## Gaps surfaced during execution

- **U3 GAP (non-blocking):** the plan does not define "a plugin the run itself
  loads" — U3 took it as a plugin installed in the session running
  `/vwf:execute all`, which keeps its stale copy until restarted.
- **R1 contested (cap):** `plugins/vwf/skills/execute/references/all.md:16`
  still says "as with any execute run", which the reversal now contradicts.
- **U4 DOCS FALSIFIED:** `docs/plans/index.md`'s intro names only
  `/vwf:execute next`; the index never rides a run branch, so it is left for a
  hand edit on the integration branch.

## Run log

| Wave | Unit         | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                | Commit   |
| ---- | ------------ | ----- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | format-check | —     | —     | skipped     | no `covers:` — the plan reads no blueprint artifact                                                                                                                                                                                                                                                   | —        |
| 0    | preflight    | —     | —     | green       | mise + graphify present, graph reachable from the main checkout; all 7 wave-gate lines green on develop 14572e2d; no `code` unit — LSP read and conventions fetch skipped                                                                                                                             | —        |
| 1    | U1           | opus  | 1     | green       | execute-runner.md written; rule-7 orphan expected until U2; DECIDED: handed SKILL.md wins over the agent file                                                                                                                                                                                         | —        |
| 1    | U4           | opus  | 1     | green       | 7 files; DECIDED: handoff :186 left (recall, not a launch line); handoff says resume is `<folder>`, never `next`/`all`; DOCS FALSIFIED: docs/plans/index.md intro (names only `next`) — never edited on a run branch, carried to the report                                                           | —        |
| 1    | U3           | opus  | 1     | green       | 4 files; DECIDED: interview item numbered 18a (19 taken); GAP: "a plugin the run itself loads" undefined — taken as a plugin installed in the session running `all`, stale until restart                                                                                                              | —        |
| 1    | U2           | opus  | 1     | green       | SKILL.md + new references/all.md; DECIDED: a malformed runner return is recorded STOPPED, never re-dispatched; consent `no` and a failed after-landing step are STOPPED; runner pre-answers skill calls, stops if a skill asks anyway                                                                 | —        |
| 1    | R1           | opus  | 1     | findings(7) | U2: all.md:37,:131 past fold; SKILL.md:5 still "fresh session"; SKILL.md:863 paraphrases reversal. U3: plan-interview.md:159 18a not a list item; plan-folder.md:65 row lacks backticks on `all`. U4: handoff:128 adds an unnamed rule. CONTRACT clean, RULINGS clean on substance; no-ask gate clean | —        |
| 1    | U4           | opus  | 2     | green       | R1 loop-back: handoff/SKILL.md reverted to no diff; :126/:186 keep "fresh session" (pasted prompt / recall, not a launch line)                                                                                                                                                                        | —        |
| 1    | U3           | opus  | 2     | green       | R1 loop-back: 18a now a sub-bullet of item 18; row name backticked as End an `all` run after landing in all four files                                                                                                                                                                                | —        |
| 1    | U2           | opus  | 2     | green       | R1 loop-back: all.md :37/:131 refolded; SKILL.md description and chain-forward take the reversal wording (dash in the description, strict YAML); row name verbatim in all.md                                                                                                                          | —        |
| 1    | R1           | opus  | 2     | findings(1) | round-1 findings all resolved; contested (cap of 2 reached): execute/references/all.md:16 [U2] "as with any execute run" now contradicts the reversal — drop that clause. CONTRACT clean, RULINGS clean, no-ask gate clean                                                                            | —        |
| 1    | gate         | —     | —     | green       | all 7 wave-gate lines green (code:precommit green on its second pass — the first re-padded this run log); no UNRESOLVED                                                                                                                                                                               | —        |
| —    | reconcile    | —     | —     | skipped     | no `covers:` — no stamps, registry or environment edit; no `code` unit — nothing to persist                                                                                                                                                                                                           | —        |
| 2    | U5           | opus  | 1     | green       | docs-sync over develop..HEAD applied: CLAUDE.md, readme.md, ci-and-releases.md, vwf-plugin skill + 2 references (execute-runner row), site vwf.md + 6 how-tos, decision file; DECIDED: multi-repo.md untouched (defers to single-repo); recall keeps fresh session                                    | —        |
| 2    | R2           | opus  | 1     | findings(2) | how-to/index.md:69 and how-to/operate/ad-hoc-change.md:16 still "unattended in a fresh session" beside `all` — reversal not carried. CONTRACT clean, RULINGS clean otherwise                                                                                                                          | —        |
| 2    | U5           | opus  | 2     | green       | R2 loop-back: how-to/index.md:69 and ad-hoc-change.md:16 now "fresh context"                                                                                                                                                                                                                          | 6224a0eb |
| 2    | R2           | opus  | 2     | pass        | both findings fixed; no split spans from the reflow; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                    | —        |
| 2    | gate         | —     | —     | green       | all 7 wave-gate lines green                                                                                                                                                                                                                                                                           | —        |
| 3    | U6           | opus  | 1     | green       | plugin.json reads 21.0.0, unchanged; marketplace.json unchanged; all 7 wave-gate lines green (code:precommit on its second pass) — no commit                                                                                                                                                          | —        |
| 3    | R3           | —     | —     | pass        | not dispatched: wave 3 changed no file, so there is no diff to review                                                                                                                                                                                                                                 | —        |
| —    | reconcile    | —     | —     | green       | orchestrator gates: rule 7 green with `execute-runner` declared and backticked from skills/execute/ (R1); no runner-asks passage under skills/execute/ (R1 rounds 1–2)                                                                                                                                | —        |
| —    | final gate   | —     | —     | green       | all 7 wave-gate lines green over the finished tree; folder left live — 3 non-blocking gaps open; backlog lists empty                                                                                                                                                                                  | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-10-07-execute-all

or let the queue pick it, by priority:

/vwf:execute next
