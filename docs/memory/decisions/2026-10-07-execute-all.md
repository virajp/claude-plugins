# Decision — /vwf:execute all runs every runnable plan, each in its own runner

**Date** 2026-10-07 · **Branch** `2026-10-07-execute-all` · **Plan**
[`docs/plans/2026-10-07-execute-all/`](../../plans/2026-10-07-execute-all/index.md)
· **Reverses** execute's "a session that has done nothing else" and "chained
plans land one focused run at a time" · **Backlog** none

## What prompted it

With plan 1 landed
([`2026-10-07-plans-carry-every-answer.md`](./2026-10-07-plans-carry-every-answer.md)),
execute asks nothing at run time, so nothing stops a queue of approved plans
from running back to back but the launch rule. Typing `/vwf:execute all` once
should run every runnable plan, highest priority first, each in its own runner
subagent, stop at the first point that needs the user, and keep only a one-line
result per plan in the session.

This is plan 2 of a chain of three: plan 3 gives `all` run-level questions asked
once before the first plan.

## The reversal

Each run happened "in a session that has done nothing else", and chained plans
"land one focused run at a time". Both now read **a fresh context: a fresh
session, or a runner that `all` dispatches**. Plain `/vwf:execute <folder>` and
`/vwf:execute next` are unchanged.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **The runner (E1).** A new agent, `execute-runner` (`model: opus`), with the
  execute agents' tools plus `Agent`, `Skill`, `TaskOutput` and `TaskStop`;
  handed the folder and the path to execute's `SKILL.md`, it reads that file and
  follows it for the one folder. Rejected: a general-purpose subagent; splitting
  `SKILL.md`.
- **The loop (E2).** `all` calls `plan-management next`, dispatches one runner,
  waits for it, and repeats until nothing is runnable; runners never run in
  parallel. Rejected: parallel runners.
- **Stops (E3).** Any runtime stop — the runner stops; the loop ends, printing
  its table and the resume command. Rejected: skip and continue; ask, then
  continue.
- **Reload (E4).** The planners record a Consent row, End an `all` run after
  landing (yes/no), asked only when the plan edits a plugin the session running
  `all` loads; on yes, `all` ends after that plan and reports "restart, then
  `/vwf:execute all`". Rejected: execute detecting it; accept and document.
- **Caps (E5).** The cap hook pauses a runner as it pauses execute, which ends
  the loop; the loop starts no new plan once a cap directive has reached the
  session; a runner's own context goes unmeasured. Rejected: the loop polling
  the usage endpoint.
- **Return block (E6).** The runner returns exactly five lines — `PLAN:`,
  `OUTCOME:` (`COMPLETE`, `COMPLETE with gaps`, `STOPPED`), `DETAIL:`,
  `RESUME:`, `ENDS RUN:`; the loop's exit is one table of these plus the stop
  reason. A reply that is not those five lines is recorded `STOPPED`, never
  re-dispatched. Rejected: a free-form report.
- **Unchanged (E7).** Plain `<folder>` and `next` are unchanged;
  `disable-model-invocation` stays `true`, so the runner reads the skill file
  rather than invoking it. Rejected: making execute model-invocable.
