# One `code` unit

Read this when a wave holds a `code` unit. Each `code` unit in the wave runs this pipeline **one at
a time**, after the wave's `edit` units have returned. This is an ordering rule: two coders never
write in the same worktree at once.

The pipeline is TDD → coverage → commit. The unit's code and security review happen at the `review` row
that covers it, [review-unit.md](review-unit.md), never here. The stage table, the per-stage dispatch
contracts and the shared stage rules are `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`; this file is
the loop that runs them.

Every write to the folder's `index.json` below is one call in the worktree,

    node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs set <folder>/index.json units.U<n>.<field> <value>

`plan.mjs set` for short (`--json` for a number), or one `plan.mjs append` to a list. Every read is one
`plan.mjs get`. Follow each `set` of the unit's `status`, `commit` or `rounds` below with one
`log.mjs event row`. Follow each `append` to `gaps` with one `log.mjs event gap`, per
[the plan files](plan-files.md).

For the unit (skip it when its `status` in `index.json` already reads `green` with a `commit` set):

1. **recall** — before dispatching, list the file names of `docs/memory/decisions/`,
   `docs/memory/problems/` and `docs/memory/gaps/`. Read the files whose slug or title matches this unit's
   slice, newest first, at most ten, per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`. Pass the relevant hits
   to the coder, so it builds on prior decisions and does not re-derive them. A folder that is absent or
   empty recalls nothing, silently.
2. **code** — dispatch `execute-coder` per the stage contract in `execute-stages.md`, with:
   - the unit's `NN-<unit>.md` file (its ruling, Test first line and Verification);
   - the unit's entry in `index.json`, its `owns` above all, since the unit file carries no header lines;
   - the `decisions` and `shared_files` lists of `index.json`, and index.md's *Facts the survey established*
     section, never the whole folder;
   - the resolved stack and the recall hits.

   Set the unit's `status` to `running`; `plan.mjs` stamps its times, per [the plan files](plan-files.md).
   Document a sub-100% coverage result against the configured target (`.config/vwf.yaml`
   `pipeline.coverage_target`, default 100) as a gap, never a silent pass.
3. **questions** — ask each of the coder's `QUESTION` lines, and each old `GAPS:` line, per
   [questions.md](questions.md). Record each answer there, and resume the coder with it. Its latest block is its
   report. Run no gate and no commit while a question is open or the resumed coder still works.
4. **commit** — run every line of the folder's *Unit gate*, its `gates.unit` list, once. A red line is the
   unit's failure, per [waves.md](waves.md) step 5. Then commit the unit's work through `/vwf:git-workflow`,
   **per the commit-only preference**, with the unit file's Commit line. The folder's edits ride the same commit: the unit fields
   and the `gaps` entries of `index.json`. The folder is edited in the worktree, never in
   the main checkout.
5. **record** — set the unit's fields. Its `status` is `green` (or `skipped`, `failed`, or `unresolved` when its
   question went unanswered or was answered stop, per [questions.md](questions.md)).
   Its `commit` is the short commit hash, and its `rounds` is the round reached.
   - Write the unit's durable decisions as `docs/memory/decisions/` files, per the run exception in `memory.md`.
     Write them in the run's worktree, or in the base checkout under multi-repo `linkage: siblings`, as Reconcile
     writes its stamps. Leave them unstaged: no unit's Owns holds `docs/memory/`, so they ride the Reconcile commit.
   - Write no other record, and file no finding.
   - Set each field, and log its `row` event, **as the node returns** (step 2), not batched here. Write one `row`
     event per execution before the next dispatch. It holds the wave, the unit, the status, the outcome and model
     in its `detail`, and the commit once it has one. So a re-dispatch is a further event, and a skip carries its `why`. Batching it to the
     end of the unit makes a resumed run repeat work, and the report render from memory.

A fix loop-back comes from the covering review row, the wave review, or the acceptance and UX pass. It re-enters
this pipeline from step 2 with the finding lines appended, then steps 3-5. Its `row` event carries the next round
number, which the unit's `rounds` then holds, and its fix commit becomes the unit's `commit`.

Where the loop-back came from decides who reviews the fix:

- From the **running** `review` row: that row's own loop continues (review-unit.md step 4, the next round over the fix
  commits alone).
- From a row still **ahead** that covers this unit: that row.
- Otherwise: the last row covering it is re-run over the fix delta, per *Late loop-backs re-run the last row* in
  [review-unit.md](review-unit.md).
