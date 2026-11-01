# One `code` unit (the Waves section)

Read this when a wave holds a `code` unit. Each `code` unit in the wave runs
this pipeline **one at a time**, after the wave's `edit` units have returned —
an ordering rule: two coders never write in the same worktree at once. The
pipeline is TDD → coverage → commit. The unit's code and security review happen
at the `review` row that covers it — [review-unit.md](review-unit.md) — never
here. The stage table, the per-stage dispatch contracts and the shared stage
rules are `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`; this file is the
loop that runs them.

Every write to the folder's `index.json` below is one call in the worktree,

    node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs set <folder>/index.json units.U<n>.<field> <value>

`plan.mjs set` for short (`--json` for a number), or one `plan.mjs append` to
a list; every read is one `plan.mjs get`. Each `set` of the unit's `status`,
`commit` or `rounds` below is followed by one `log.mjs event row`, and each
`append` to `gaps` by one `log.mjs event gap`, per *The plan files* in the
skill's `SKILL.md`.

For the unit (skip it when its `status` in `index.json` already reads `green`
with a `commit` set):

1. **recall** — before dispatching, list the file names of
   `docs/memory/decisions/`, `docs/memory/problems/` and `docs/memory/gaps/`
   and read the files whose slug or title matches this unit's slice, newest
   first, at most ten, per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`. Pass the
   relevant hits to the coder so it builds on prior decisions instead of
   re-deriving them. A folder that is absent or empty recalls nothing,
   silently.
2. **code** — dispatch `execute-coder` per the stage contract in
   `execute-stages.md`: the unit's `NN-<unit>.md` file (its ruling, Test first
   line and Verification) with the unit's entry in `index.json` — its `owns`
   above all, since the unit file carries no header lines — plus the
   `decisions` and `shared_files` lists of `index.json` and index.md's
   *Facts the survey established* section — never the whole folder — the
   resolved stack and the recall hits. Set the unit's `status` to
   `running` — `plan.mjs` stamps its times, per *The plan files*. A sub-100% coverage result against the configured target
   (`.config/vwf.yaml` `pipeline.coverage_target`, default 100) is documented
   as a gap — never a silent pass.
3. **gaps** — each line of the coder's `GAPS:` → one `plan.mjs append` to
   the `gaps` list of `index.json`
   (`{id, unit, stage: "code", text, state: "open"}`, the next `G<n>`) — the
   one place a run's gap goes. Decide blocking vs non-blocking and act per the
   rules.
4. **commit** — run every line of the folder's *Unit gate* — its
   `gates.unit` list — once; a red line is the unit's failure, per the Waves
   section's step 5. Then commit the unit's work via `/vwf:git-workflow`,
   **per the commit-only preference**, with the unit file's Commit line. The
   folder's edits — the unit fields and the `gaps` entries of `index.json` —
   ride the same commit: the folder is edited in the worktree, never in the
   main checkout.
5. **record** — set the unit's fields: `status` `green` (or `skipped`,
   `failed`, `unresolved` per the gap rules), `commit` the short commit hash
   and `rounds` the round reached. Write the unit's durable decisions as
   `docs/memory/decisions/` files in the run's worktree — in the base
   checkout under multi-repo `linkage: siblings`, as Reconcile writes its
   stamps — per the run exception in `memory.md`, and leave them unstaged: no
   unit's Owns holds `docs/memory/`, so they ride the Reconcile commit. Write
   no other record and file no finding. Each field is set, and its `row` event
   logged, **as the node returns** (step 2), not batched here: one `row` event
   per execution — wave, unit, status, and the outcome and model in its
   `detail`, the commit once it has one — before the next dispatch, so a
   re-dispatch is a further event and a skip carries its `why`. Batching it to
   the end of the unit is what makes a resumed run repeat work and the report
   render from memory.

A fix loop-back — from the covering review row, from the wave review, or from
the acceptance and UX pass — re-enters this pipeline from step 2 with the
finding lines appended, then steps 3-5; its `row` event carries the next
round number, which the unit's `rounds` then holds, and its fix commit
becomes the unit's `commit`. Who reviews the fix depends on where the
loop-back came from: from the **running** `review` row, that row's own loop
continues
(review-unit.md step 4 — the next round over the fix commits alone); from a
row still **ahead** that covers this unit, that row; otherwise the last row covering it
is re-run over the fix delta, per *Late loop-backs re-run the last row* in
[review-unit.md](review-unit.md).
