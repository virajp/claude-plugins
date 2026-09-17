# One `code` unit (the Waves section)

Read this when a wave holds a `code` unit. Each `code` unit in the wave runs
this pipeline **one at a time**, after the wave's `edit` units have returned —
an ordering rule: two coders never write in the same worktree at once. The
pipeline is TDD → coverage → commit. The unit's code and security review happen
at the `review` row that covers it — [review-unit.md](review-unit.md) — never
here. The stage table, the per-stage dispatch contracts and the shared stage
rules are `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`; this file is the
loop that runs them.

For the unit (skip it when the folder's Run log already shows it done — its
`code` node carries a commit):

1. **recall** — before dispatching, `mempalace_search` the wing scoped to this
   unit's slice across rooms `decisions`, `problems`, `gaps`, and `runs` (limit
   3-5). Pass the relevant hits (with the wing) to the coder so it builds on
   prior decisions instead of re-deriving them. Skip silently if mempalace is
   down.
2. **code** — dispatch `execute-coder` per the stage contract in
   `execute-stages.md`: the unit's `NN-<unit>.md` file (its ruling, Test first
   line, Owns and Verification) plus the index's *Facts the survey
   established*, *Assumed decisions* and *Shared-file rule* sections — never
   the whole folder — the resolved stack, wing, and recall hits. Mark the unit
   `running` in the Units table. A sub-100% coverage result against the
   configured target (`.config/vwf.yaml` `pipeline.coverage_target`, default
   100) is documented as a gap — never a silent pass.
3. **gaps** — the coder's gap pointer → mirror into the "Gaps surfaced during
   execution" section of the folder's `index.md` and file to mempalace room
   `gaps`. Decide blocking vs non-blocking and act per the rules.
4. **commit** — commit the unit's work via `/vwf:git-workflow`, **per the
   commit-only preference**, with the unit file's Commit line. The folder's
   edits — the Run log rows, the Units table cells, the gap section — ride the
   same commit: the folder is edited in the worktree, never in the main
   checkout.
5. **persist & journal** — store the unit's durable decisions to room
   `decisions`, and fill the unit's Units table row: Status `green` (or
   `skipped`, `failed`, `unresolved` per the gap rules) and the short commit
   hash. The **Run log row** itself is written **as the node returns**
   (step 2), not batched here: one `code` row per execution
   (`Wave | Unit | Model | Round | Outcome | Detail | Commit`), appended to the
   folder's `index.md` and mirrored to the journal before the next dispatch, so
   a re-dispatch is a further row and a skip carries its `why`. Batching it to
   the end of the unit is what makes a resumed run repeat work and the report
   render from memory.

A fix loop-back — from the covering review row, from the wave review, or from
the acceptance and UX pass — re-enters this pipeline from step 2 with the
finding lines or tags appended, then steps 3-5; its `code` row carries the next
round number. A `review` row still ahead **that covers this unit** reviews the
fix; otherwise the last row covering it is re-run over the fix delta, per
*Late loop-backs re-run the last row* in [review-unit.md](review-unit.md).
