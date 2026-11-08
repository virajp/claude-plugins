GAP 2026-10-08 ★3 | release tasks | a release target below the manifest —
resolved 2026-10-10: the manifest is the floor | the decision record still calls
it open

**Source plan** `2026-10-08-release-tasks-bump`,
`2026-10-08-release-levels-recorded`.

The record `2026-10-08-release-tasks-bump.md` says gap G1 is open. It is closed.

- The gap: the rule "bump from the last tag by the higher of the recorded level
  and the implied level" can put the target below the manifest. Example: tag
  `21.0.0`, manifest `21.2.0`, no recorded level, so the implied level is MINOR
  and the target is `21.1.0`. The task would lower the manifest.
- The user ruled on 2026-10-10: the manifest is the floor. `release_target`
  takes the manifest as a third argument and releases the manifest as is when
  the target falls below it. The three release tasks pass it, and
  `p:releases:test` covers it.
- Rejected: refuse a target below the manifest. A refusal stops a release that
  an untagged bump (from a plan that landed) already made correct.

Also confirmed by the user on 2026-10-10 (plan
`2026-10-08-release-levels-recorded`):

- A failed `after_landing:` command stops only the `after_landing:` commands
  after it. It uses the same failure rule as a plan's own steps.
- The levels file goes in the same commit that marks the plan COMPLETE. The
  plan-index contract (`plan-index.md`, step 5) named the plan index as the only
  file that commit stages, so the contract now names this one exception.
