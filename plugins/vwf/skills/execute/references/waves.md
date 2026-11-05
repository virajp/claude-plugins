# Waves (loop over waves, no human gates)

Each `units` entry carries a `kind` — `code`, `edit` or `review`, per
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md` — and it is the switch. Each
unit's dispatch prompt carries its `owns` list from `index.json`, which its file no longer
repeats. Each unit runs on its `model`, through `pipeline.models`, as the shared stage rules
say.

Loop over the waves in `wave` order, and skip units already `green` on a resume. Set each
wave's `waves` entry `running` as it starts, and `green` or `failed` before step 6's closing
folder commit, per [the plan files](plan-files.md).

1. **Run the `review` rows first**. Run each `review` row in the wave, one at a time, before
   anything in the wave is dispatched. So the engines see a committed tree and nothing in
   flight. Every unit a row covers sits in an earlier wave and is committed, which the
   fresh-run refusals guaranteed. Per [review-unit.md](review-unit.md):
   - the range since the previous green row's main loop or the branch base;
   - the two engines filtered to it, the security engine alone on a row that covers `edit`
     units alone;
   - both reviewers concurrently;
   - each finding mapped by the commit that last touched its file, and that unit re-dispatched
     by kind;
   - the next round run engines first over those fix commits alone, under the round cap and the
     convergence guard.

   Set the row's fields and log a `row` event per node as it returns. A wave with no `review` row
   runs no engine.
2. **Dispatch the `edit` units**. Dispatch every `edit` unit in the wave in one message, per
   [edit-unit.md](edit-unit.md)'s dispatch, and wait for every report. Log a `row` event per report
   as it arrives. Re-dispatch once on an agent error, then mark it `failed`. Set each unit's `status`
   and `rounds` as its report is read.
3. **Run the `code` units**. Run each `code` unit in the wave, one at a time, per
   [code-unit.md](code-unit.md). Its nodes are recall, the coder under TDD to the coverage gate, gaps,
   the unit's commit, persist and record. Set the unit's fields and log a `row` event per node as it returns.
   Start the next `code` unit only when this one's commit is written, or the unit is recorded
   blocked.
4. **Wave review**. Run it per [edit-unit.md](edit-unit.md)'s reviewer section, for every wave
   whatever its units' kind. One reviewer subagent reads the wave's diff against the unit files.
   - Its scope is the contract: rulings honoured, Owns respected, cross-unit drift, docs falsified.
     It never reviews a `code` unit's code quality or security, which are the covering `review` row's.
   - Findings loop back to the owning unit, at most two rounds, under the convergence guard. Every
     round is a `row` event.
   - The prompt also carries the unit files and `owns` lists of every unit a `review` row in this wave
     re-dispatched. Their fix commits count against those units' Owns.
   - A unit of either kind fixed here after the last `review` row covering it marks that row for a
     late re-run, taken at step 7. See *Late loop-backs re-run the last row* in
     [review-unit.md](review-unit.md).
5. **Unit gate, then wave gate**. The orchestrator runs them once every unit of the wave has returned.
   For each green `edit` unit, in wave order, it runs every line of `gates.unit`. A `code` unit ran its
   unit gate inside its pipeline. Then it runs every line of `gates.wave`, once. Read every report for `UNRESOLVED:`
   too.
   - A unit that returned `UNRESOLVED:` or `failed`, and every unit that depends on it, is **skipped**
     per [blocking and resume](blocking.md). A skipped `review` row takes every later `review` row and
     every later `code` unit one covers with it, as that reference states. The rest of the run continues.
   - Attribute a red gate line no skipped unit explains to the unit whose Owns covers the failing path,
     and handle it as that unit's failure.
   - A line that cannot be attributed marks every unit in the wave `failed`, with the gate line as detail.
6. **Commit** the green `edit` units, one commit per unit in wave order, per the staging discipline in
   [the rules](rules.md).
   - A `code` unit was committed inside its pipeline, on the same discipline.
   - A `review` row has no commit of its own: its fix commits belong to the units fixed.
   - The folder's edits — the unit fields, the `gaps` entries, the `stages` — ride the unit commits as
     they are written. A unit's own `commit` is set after its commit, so it rides the next one.
   - The folder can still hold uncommitted edits after the last unit commit. Then the orchestrator closes
     the wave with its own commit of the folder and nothing else, `docs: plan state — <folder> wave <n>`.
     So the folder on the branch never lags what ran. That is always the case after a wave's last unit
     commit, and for a wave that produced no commit, a clean `review` row alone.
7. **Late re-runs**. For each `review` row step 4 marked, now that the tree is committed:
   1. The re-run per *Late loop-backs re-run the last row* in [review-unit.md](review-unit.md).
   2. The one contract review `R<wave>-late` over the re-run's fix commits. It is one round outside the
      wave review's cap, with one loop-back. A second is recorded `contested`, as that reference states.
   3. Every line of the wave gate again, and a closing folder commit as in step 6.

With `covers`, run the pass in [acceptance-and-ux.md](acceptance-and-ux.md). Without `covers`, skip both stages. Set `stages.acceptance`,
`stages.ux` and `stages.renders` each `skipped` with that `why`, each logged. A plan with no blueprint slice has no
acceptance criteria and no Screens contract to verify against.

The two fixed final units are the docs unit and the gates unit. They run as their own waves after every other
wave, after the Acceptance & UX pass and after Reconcile; see [reconcile.md](reconcile.md).

## On failure

The run **skips what a failure blocks and keeps going** with what it does not. It then stops once at the
end with every ruling needed — never mid-wave, and never with "how should I proceed". The exact semantics
are [blocking and resume](blocking.md): isolated versus all-blocking, the mechanical re-dispatch, what the
status line records, and how a re-run resumes.
