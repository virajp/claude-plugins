# Decision — plans carry every answer; execute asks nothing at run time

**Date** 2026-10-07 · **Branch** `2026-10-07-plans-carry-every-answer` ·
**Plan**
[`docs/plans/2026-10-07-plans-carry-every-answer/`](../../plans/2026-10-07-plans-carry-every-answer/index.md)
· **Reverses** ruling 8 of
[`2026-09-17-after-landing-runs-on-recorded-consent.md`](./2026-09-17-after-landing-runs-on-recorded-consent.md)
— the `ask` after-landing mode — and execute's post-run dialogue · **Backlog**
none

## What prompted it

The user ruled, in their words:

> planners must ask all questions before hand and embed the answers in the plan;
> execute will simply implement the plan and follow all the instructions

An unattended run that can still stop to ask — before an `ask` step, after a
failed landing condition, to close a gap, to chain forward — is not unattended.
Every such question has an answer the planner can record at the interview, or a
report the person can act on after the run.

This is plan 1 of a chain of three: plan 2 adds `/vwf:execute all`, plan 3 gives
it run-level questions asked once before the first plan.

## The reversals

- **The `ask` mode is retired (2026-09-17 ruling 8).** Every after-landing step
  is recorded `run` at the interview, or dropped from the plan and run by hand
  later. On a green landing execute runs each in table order without a prompt.
  The same doc's note that an unconsented landing's steps are "offered, every
  one as an `ask`" goes with it — see D4. Rejected: keep `ask`; keep `ask` for
  release steps only.
- **The post-run dialogue becomes a report.** The *Fix first / Reject* choice
  after a failed landing condition, the offer to close each gap, and the
  chain-forward offer of `/vwf:execute <next-folder>` are each reported — what
  failed, the open gaps with the command that closes each, the next launch line
  — and the run stops. A fix goes into the folder, and the person re-runs
  `/vwf:execute <folder>`. Rejected: the Fix first / Reject dialogue; offering
  to close gaps.

**Ruling 9 of 2026-09-17 stands**: a release step recorded `run` is authorised
by the interview's release-intent question, and `CLAUDE.md`'s release rule keeps
its one exception.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **Missing target repo (D3).** Execute reports and stops, naming the missing
  repo and its clone command. Rejected: a `Clone <repo>` consent row in every
  multi-repo plan.
- **Unmerged branch (D4).** No after-landing step runs when the branch did not
  merge; the report lists each step with its command, to run after a hand merge.
  Rejected: a per-step "also run from the worktree" flag.
- **Failed after-landing step (D5).** The remaining steps do not run; the report
  names the failed step, its exit code and the steps not run. Rejected:
  continuing with the remaining steps.
- **Resume with the worktree gone (D6).** The report names the
  `plan-management unclaim <folder>` request for the person to make; execute
  never invokes `unclaim`. Rejected: execute calling `unclaim`, which asks once
  itself.
- **A folder carrying an `ask` step (D7).** Refused on a fresh run and on resume
  alike, naming the planner to re-run. Rejected: reading `ask` as dropped.
- **Archive warning at landing (D8).** Execute calls `archive` with the declared
  preference *do not ask*; on any completion warning the folder is not archived,
  the row still goes `COMPLETE`, and the report names the warning and the
  archive request to make later. Rejected: archive anyway and record the
  warning.
- **Mid-run decisions (D9).** An uncovered irreversible decision, an ambiguous
  wave order, or blocking format drift ends the run as a blocking-gap stop,
  reported with what is needed and the resume command. Rejected: pause and ask.
