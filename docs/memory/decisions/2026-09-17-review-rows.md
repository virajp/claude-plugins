# Decision — review rows: the plan places the code and security review

**Date** 2026-09-17 · **Branch** `2026-09-17-review-rows` · **Plan**
[`docs/plans/2026-09-17-review-rows/`](../../plans/2026-09-17-review-rows/index.md)
· **Reverses** nothing — the after-landing reversal the same plan carries is its
own record,
[`2026-09-17-after-landing-runs-on-recorded-consent.md`](./2026-09-17-after-landing-runs-on-recorded-consent.md)
· **Backlog** none

## What prompted it

The user found `/vwf:execute` running `/code-review` and `/security-review`, and
the two reviewers behind them, at every step of a multi-unit plan — after every
`code` unit and again on every loop-back round — which is waste: the engines
take up to thirty minutes a round and nothing between two consecutive units
needed reviewing twice. The 2026-09-15 deadlock plan had parked "the per-step
slowness" as out of its scope; this plan is that item coming due. The survey
found the per-unit review hard-wired in prose only — the execute skill, its two
references, the stages asset, the two reviewer agents, the template and the two
planners — and nothing programmatic reading a review placement, so no format
number moved.

## What changed

A review is a **`Kind: review` row** in the Units table. `/vwf:execute` runs the
two engines and the two reviewers only when wave order reaches such a row, over
the branch delta since the previous row that reached `green` or since the branch
base, and loops findings back to the unit whose commit last touched the file. A
`code` unit runs TDD, the coverage gate and its commit, and moves on.
`/vwf:plan` writes one row after the last code unit and before the docs unit;
`/vwf:change-plan` writes one only when the change lands runnable code. A plan
with `code` units no row covers is refused at preflight. The loop is
`skills/execute/references/review-unit.md`; the stage table's Runs column, the
dispatch contracts and the journal in `assets/execute-stages.md` name the row.

## The rulings, with what each rejected

Numbered as in the plan's decisions table; 8, 9 and 11 are in the reversal
record.

- **Trigger shape (1).** A review is a `Kind: review` row: Owns `—`, Depends on
  names the units it covers, Model `opus`, and a `NN-review.md` unit file
  carrying only the header lines and a Scope section. When execute reaches it in
  wave order it runs `/code-review` and `/security-review`, waits, then
  dispatches `execute-code-reviewer` and `execute-security-reviewer` in one
  message with the Engine section — step 3 of the old code-unit, once, over the
  row's scope. Rejected: a `review after:` flag on a code unit; a Review-points
  section in `index.md`.
- **Default placement (2).** Both planners write **one** row, after the last
  code unit and before the docs unit. An earlier row is a planner decision with
  its reason in the plan's assumed-decisions table — a boundary later units
  build on, say. No code unit triggers a review by itself. Rejected: per-unit
  review (the status quo); execute implying a row.
- **Review scope (3).** A row reviews the branch delta since the previous
  `review` row, or the branch base when it is the first. Rejected: per-unit
  commits.
- **Findings loop (4).** A finding names a file; the orchestrator maps it to the
  unit whose commit last touched it and re-dispatches that unit by its Kind — a
  `code` unit's coder in fix-first mode, an `edit` unit's loop-back; then the
  row re-runs in full, engines first. `pipeline.review_round_cap`, the
  convergence guard and the `contested` exit apply to the row unchanged. A
  finding no branch commit explains is recorded `contested` with `unmapped`,
  never dropped. Rejected: a separate cap for review rows.
- **Journal and recall tags (5).** The run journal's node value `review` names
  the row; the unit cell carries the row id; `wave` is the row's wave. Recall
  tags are `<loop-id>/review/<round>` and `<loop-id>/security/<round>` — the
  loop id being the row id for the row's main loop and `<row-id>-late<n>` for
  its n-th late re-run, the key the engine output files also take; every gap
  files under one scheme, `<unit, loop or stage id>/gap/<round>` with
  `source_file` the plan folder path. Rejected: a new tag scheme.
- **Change plans (6).** A change plan gets no review row by default — the wave
  review stays its only check. `/vwf:change-plan` writes one only when the
  change lands runnable code (shipped shell or hook scripts, `scripts/`,
  `installer/`), and says why in the decisions table. Rejected: never a row on a
  change plan; always one at the end.
- **Missing row (7).** A plan with `code` units and no review row covering them
  is refused at preflight, naming the uncovered units and the fix — add a row
  and re-approve. Execute runs what is written and infers no node. Rejected:
  execute implying a row after the last code unit.
- **What stays (10).** A code unit stays TDD → coverage → commit; the `edit`
  wave review is unchanged; the acceptance and UX passes stay after the last
  unit, hence after the final review row. Nothing rejected.

The wave review widened two Owns in the run: the plan's Goal falsified
`assets/plan-index.md`'s After landing passage and `agents/execute-coder.md`'s
"before handoff to code review", and no unit had named either.

## Refined during execution

The fix rounds settled what the rulings left open;
`skills/execute/references/review-unit.md` is the one authority.

- **Review rows run first in their wave**, before any `edit` or `code` unit of
  that wave is dispatched, so the engines see a committed tree.
- **Two placement rules**, refused at preflight: a row sits in a wave strictly
  later than every unit it covers, and on a cycle plan it covers every
  earlier-wave `code` unit no earlier row covers. A change plan's row covers the
  units landing runnable code. Beside them a third refusal: a review row whose
  Depends on names no unit — a review row that covers nothing.
- **One branch-wide commit map.** Every file in the range maps to the unit whose
  commit last touched it, built once over the whole branch from the Units table
  and Run log Commit cells — never read from Owns.
- **The off-coverage rule.** A finding on a file whose unit the row does not
  cover: a security finding routes to that unit all the same, the widening
  recorded; a non-security finding is dropped and counted.
- **Late re-runs are a new loop.** A fix landing after the last row covering its
  unit re-runs that row over the fix delta, rounds restarting at 1 under a fresh
  cap, without advancing the row's recorded `to`.
- **One gap scheme keyed to the folder.** `<unit, loop or stage id>/gap/<round>`
  with `source_file` the plan folder path, since ids repeat across plans.
- **Resume.** The Run log tells a resumed run which round a row last returned
  and whether a late re-run is pending; a row ended at the cap or the guard with
  residuals `contested` reads `green` and is not re-run.

## Parked

- **`release <folder>`** — resets a stale `RUNNING` row to `APPROVED` in an
  integration-branch commit instead of the hand edit. Needs a rule for proving
  the session is gone. Parked since the queue plan (2026-09-15).
- **The diary checkpoint beside the run log.** The Stop hook fires mid-run, so a
  unit produces a diary entry on top of its run-log row. A later plan decides
  whether the hook stands down while a run is open. Parked since the deadlock
  plan (2026-09-15).
