DECISION 2026-11-05 ★3 | skill-kit ledger proof under execute | a rewrite runs
as separate fresh units and a run never drops a rule — the run is unattended, so
only the user can drop a ledger entry | alt one unit doing all, two restore
rounds, run-time drops rejected

**Source plan** `2026-11-05-change-plan-pilot`

First real test of the `skill-kit` rule ledger, on the `change-plan` skill.
The skill-kit workflow does not state these run rulings:

- Rewrite, ledger review and restore are separate units, so each reviewer is
  fresh. Fresh means a new subagent that saw no writer's reasoning.
- One restore round. A ledger entry still missing after the re-review stops the
  run. No unit sets `dropped`. The user decides each open entry by hand in the
  run's worktree: restore the rule and set the entry to pending, or record
  `dropped` with `approved: true`, write the ruling in decisions, commit, and
  resume at the re-review unit.
- A defect in skill-kit itself becomes a gap. No unit changes the tool during
  its own proof. A blocking defect stops the run.
- Several units write one path in different waves, one writer for each
  wave. Rejected: one writer for the whole run, which removes the restore round.
- The ledger folder inside the plan folder is committed. Rejected: a cache
  folder or a gitignored path.
- The always-loaded word count is a warning, not a gate, but the stats unit
  returns UNRESOLVED if the final count is not below the starting count
  (4,912). The pilot ended at 4,486, over the 1,500 budget. The user accepted
  it. Lint warnings stay where a split risks losing a condition.
- The argument placeholder stays in `SKILL.md`. The host expands it only in
  that file.
- Phases keep the numbers §1 to §8 so that old citations hold.
- Where these rulings differ from the skill-kit rewrite workflow, the rulings
  win. The plan adds no script, since no runnable code lands.
