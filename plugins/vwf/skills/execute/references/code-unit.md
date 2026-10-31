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

1. **recall** — before dispatching, `mempalace_search` the wing scoped to this
   unit's slice across rooms `decisions`, `problems`, `gaps`, and `runs` (limit
   3-5). Pass the relevant hits (with the wing) to the coder so it builds on
   prior decisions instead of re-deriving them. Skip silently if mempalace is
   down.
2. **code** — dispatch `execute-coder` per the stage contract in
   `execute-stages.md`: the unit's `NN-<unit>.md` file (its ruling, Test first
   line and Verification) with the unit's entry in `index.json` — its `owns`
   above all, since the unit file carries no header lines — plus the
   `decisions` and `shared_files` lists of `index.json` and index.md's
   *Facts the survey established* section — never the whole folder — the
   resolved stack, wing, and recall hits. Set the unit's `status` to
   `running` — `plan.mjs` stamps its times, per *The plan files*. A sub-100% coverage result against the configured target
   (`.config/vwf.yaml` `pipeline.coverage_target`, default 100) is documented
   as a gap — never a silent pass.
3. **gaps** — the coder's gap pointer → one `plan.mjs append` to the `gaps`
   list of `index.json` (`{id, unit, stage: "code", text, state: "open"}`,
   the next `G<n>`) and file to mempalace room `gaps`. Decide blocking vs
   non-blocking and act per the rules.
4. **commit** — run every line of the folder's *Unit gate* — its
   `gates.unit` list — once; a red line is the unit's failure, per the Waves
   section's step 5. Then commit the unit's work via `/vwf:git-workflow`,
   **per the commit-only preference**, with the unit file's Commit line. The
   folder's edits — the unit fields and the `gaps` entries of `index.json` —
   ride the same commit: the folder is edited in the worktree, never in the
   main checkout.
5. **persist & journal** — store the unit's durable decisions to room
   `decisions`, and set the unit's fields: `status` `green` (or `skipped`,
   `failed`, `unresolved` per the gap rules), `commit` the short commit hash
   and `rounds` the round reached. The **journal record** itself is written
   **as the node returns** (step 2), not batched here: one `code` record per
   execution — wave, unit, model, round, outcome, detail, commit — mirrored to
   the journal before the next dispatch, so a re-dispatch is a further record
   and a skip carries its `why`. Batching it to the end of the unit is what
   makes a resumed run repeat work and the report render from memory.

A fix loop-back — from the covering review row, from the wave review, or from
the acceptance and UX pass — re-enters this pipeline from step 2 with the
finding lines or tags appended, then steps 3-5; its `code` record carries the
next round number, which the unit's `rounds` then holds, and its fix commit
becomes the unit's `commit`. Who reviews the fix depends on where the
loop-back came from: from the **running** `review` row, that row's own loop
continues
(review-unit.md step 4 — the next round over the fix commits alone); from a
row still **ahead** that covers this unit, that row; otherwise the last row covering it
is re-run over the fix delta, per *Late loop-backs re-run the last row* in
[review-unit.md](review-unit.md).
