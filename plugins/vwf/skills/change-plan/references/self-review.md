# §7 — Self-review

Re-read the folder with fresh eyes before handing it off, and fix inline. A wave
change is one `plan.mjs rewave` call, after a `set` of each moved unit's `waits`
first when it moves above wave 1.

First run
`node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs validate <folder>/index.json`.
Fix a red result before any other check; each finding names the path that broke.
It already checks the shape: every required key and enum value, unique ids, each
unit's `file` present, `depends_on` naming an earlier wave, `waits` where a
later wave needs it, the `review` unit's shape, and the `backlog`,
`backlog_pieces` and `source` rules against the `- Bnn:` Parked lines of
`index.md`.

Then check:

- Every entry of the `decisions` list is quoted in the unit file of each id its
  `units` names — a ruling no unit carries is one the run re-derives.
- Every owned path appears in exactly one unit's `owns` per wave, and every
  `shared_files` entry has an `owner`.
- Every unit in a wave after wave 1, the fixed final units and a `review` unit
  aside, names a real reason to wait in its `waits`.
- Every gate delta from the interview is an owned edit somewhere.
- A `review` unit, when present, names its reason in the `decisions` list. It
  covers, directly or transitively, every unit in an earlier wave that no
  earlier review unit covers, and sits in a wave strictly later than each of
  them.
- Every unit's *Verification* names at least one gate line it must pass. A
  `review` unit has none, by shape.
- Every hit of the retired-name grep sits inside some unit's `owns`.
- Every `## Commit` line's type is one the repo's convention file allows.
- Every `requires` entry resolves to a row or an archived folder, and none is
  `DRAFT`. Invoke `plan-management resolve <folder>`, and treat an
  *unresolvable* entry as a finding.
- Every id §1 noted is on `source`. A folder made for a backlog item with
  `backlog` and `backlog_pieces` both empty is not approved.
- No `gaps_of` entry names a row of the plan index that is not `COMPLETE`, or
  whose `gaps` is `null` or has `open` `0`.
- The derived priority equals what `plan-management priority <folder>` returns.
- Every project the units touch has a `release_levels` entry with a reason, and
  `consent` has no release key.
- Every `consent` key carries an answer, and no `after_landing` entry carries a
  `mode` other than `run` — `/vwf:execute` asks only what the plan missed.
- The launch line names this folder.

## The rulings review

Then run item 20 of `${CLAUDE_PLUGIN_ROOT}/assets/plan-interview.md`, which owns
the loop: a fresh `plan-rulings-reviewer` over the `DRAFT` folder, four rounds
at most. These are the last questions the plan gets before the run —
`/vwf:execute` asks only what the plan missed, and each such question is the
planner's miss.
