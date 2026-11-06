DECISION 2026-10-26 ★3 | plan.mjs rewave | one dedicated verb that renumbers
waves in one validated write, refusing any move that touches a non-pending unit
or wave — a wave record holds no unit list, so a green wave stays green when its
units leave | alt general batch verb rejected (user chose rewave)

**Source plan** `2026-10-26-plan-mjs-rewave`

Why the verb exists: the validator requires `waves` to list exactly `W1` to
`W<n>` after every write, and no single `set`, `append` or `remove` can change
a unit's wave and the list together. On 2026-10-25 a 95octane plan needed U3 to
U6 split into one wave each, and the user had to permit a scripted whole-file
rewrite. The rule "never rewrite `index.json` whole after the first validate"
stays. `rewave` is the one permitted exception, for planners only.

Rulings the code does not explain:

- A moved unit needs `waits` first. `rewave` changes only `wave` fields and the
  `waves` list. The planner runs `plan.mjs set` for `waits`, then `rewave`.
  Rejected: `rewave` sets `waits` itself (it needs a reason for each unit).
- A move that leaves a middle wave empty is a refusal. Rejected: permit it, as
  `validate` does; or renumber the higher waves down (it changes ids that
  other text may cite).
- It refuses outside `DRAFT` and `APPROVED`, and when the old, new or dropped
  wave is not pending. Rejected: refuse only on the moved unit.
- A call that moves nothing writes nothing, so a file not in `plan.mjs` format
  keeps its bytes.
- A run never calls `rewave`, and the rulings reviewer never runs it.
- The refusal lines print one line for each distinct path and message pair.
  The dropped-wave check stays in the code even when the old-wave check
  catches the same wave first.
