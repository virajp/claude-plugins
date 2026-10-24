# Open items — `2026-10-21-execute-monitor-gap-fixes`

The plan landed `COMPLETE` on 2026-10-24 (`882e80fe`) and is archived. It left
no open gap. These items were parked, and they are inputs for the plan that
makes the progress pane replay the action log (plan C of the chain in the
memory `plan-yaml-format-design`).

## Parked by the plan

- In `all` mode, show the plans that ran before the current one.
- Show the unit titles in the unit rows.
- A start time for a unit that started before the pane loaded. The plan
  proposed a `Started` field in the Run log. With the Run log table removed,
  the replayed action log gives this time.
- Add `claude plugin test plugins/vwf` to `p:plugins:check`. This is an edit of
  this repo's `.config/`, which the user makes by hand.

## Context that plan C needs

- Decision 12 of the plan: `register.tsx` `locate` keeps a known `index.md`
  only in a linked worktree. A main-checkout copy re-reads `git worktree list`
  on each refresh, and the run's worktree copy replaces it. The `run:` paths
  that plan B writes make this search unnecessary.
- The pane follows an agent by its `name` (a unit id `U<n>`, or a wave-review
  name `R<wave>`), or by a type that starts with `vwf:execute-`. With the log
  replay, the `agent` field of each log line can replace this matching.
- The pane module tests run with `claude plugin test plugins/vwf`, not with
  `pnpm vitest run`.
