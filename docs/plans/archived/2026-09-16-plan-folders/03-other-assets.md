# U3 — The other assets that name a plan's shape

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/memory.md`,
  `plugins/vwf/assets/execute-stages.md`, `plugins/vwf/assets/membership.md`,
  `plugins/vwf/assets/harness.md`,
  `plugins/vwf/assets/topologies/multi-repo.md`,
  `plugins/vwf/assets/templates/project-claude.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom.
- **Lazy-load:** `plugins/vwf/assets/plan-index.md` (as it stands — U1 is
  rewriting it concurrently; cite it by path only).

## Ruling

Decision 1: "`docs/plans/<date>-<HHMM>-<slice>/` — `index.md` plus one
`NN-<unit>.md` per unit."

Decision 3: "One index table … `Target repo` is the member holding the code for
a cycle plan."

Decision 5: "A cycle plan's `requires:` entry is satisfied when every `covers:`
doc of the required plan reads `implementation: complete` in the base repo's
blueprint — the existing test."

Decision 12: "`index.md`'s Run log table is the record for both kinds. `execute`
appends one row per node as it returns and mirrors it to the mempalace journal
(room `runs`); the folder is what the final report renders and what a resume
reads, the journal a copy that may be down."

Decision 16 (as it binds the stage contract): "the coder is dispatched one
unit's file plus the index's rulings, not the whole plan."

## Edits

1. **`plugins/vwf/assets/memory.md`** — `:91-94` room `runs`: the run journal is
   now the **mirror** of the plan folder's Run log, written per node, read only
   when the folder is unreachable; `:167` "cycle plans" sentence: plans are
   folders; `:307` and `:318`: the section names — *Gaps surfaced during
   execution* stays, *Out of scope for this cycle* becomes *Out of scope*;
   `:325-338` the journal contents: unchanged fields, but the paragraph says the
   folder's Run log is authoritative and the tie-break (worktree over journal)
   stays. Delete any "flat" wording.
2. **`plugins/vwf/assets/execute-stages.md`** — `:33`, `:81-82`, `:97`: a stage
   receives *the unit* (its `NN-<unit>.md` file plus the index's assumed
   decisions and facts), not "the plan step"; `:163`: gaps mirror into the
   folder's *Gaps surfaced during execution* — same heading, now in `index.md`;
   `:176-215` the Run journal section: retitle *Run log and its journal mirror*
   — the fixed record shape stays, the primary write is a row in the folder's
   Run log table (`Wave | Unit | Model | Round | Outcome | Detail |
   Commit`),
   the journal record is written from the same data, and a resume reads the
   folder first; `:240-246` unchanged (stamps from `covers:`).
3. **`plugins/vwf/assets/membership.md`** — `:144-149`: a cycle plan is a
   **folder** in the target repo, its row in the base's one-table index with
   `Target repo` naming the member; `:152-161`: unchanged in meaning
   (`requires:`/`covers:` gate), reworded for a folder; `:147` drop "cycle-plan
   table".
4. **`plugins/vwf/assets/topologies/multi-repo.md`** — `:43-47`, `:77-85`,
   `:141-143`: the tree placement lines show a folder
   (`docs/plans/<date>-<HHMM>-<slice>/`) where they showed a file; the
   "cycle-plan table" phrase becomes "its row in the plan index".
5. **`plugins/vwf/assets/harness.md`** — `:64`: the preflight injects a
   bootstrap **unit**, ordered before the units whose verification depends on
   it.
6. **`plugins/vwf/assets/templates/project-claude.md`** — `:7`, `:12`:
   `docs/plans/` holds plan folders (the diffs and the ad-hoc changes), not
   files.
7. Fold by hand — `plugins/**/*.md` is not dprint-formatted.

## Verification

- `grep -n 'flat\|<date>-<time>\|cycle-plan table\|plan step' plugins/vwf/assets/{memory,execute-stages,membership,harness}.md plugins/vwf/assets/topologies/multi-repo.md plugins/vwf/assets/templates/project-claude.md`
  prints nothing (a "plan step" survivor is allowed only inside a sentence that
  says the word was retired).
- `grep -n 'Run log' plugins/vwf/assets/execute-stages.md plugins/vwf/assets/memory.md`
  hits in both.
- `grep -n 'Gaps surfaced during execution' plugins/vwf/assets/execute-stages.md plugins/vwf/assets/memory.md`
  still hits in both.
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch `plugins/vwf/assets/plan-index.md` (U1), the two new files or
  `templates/plan.md` (U2), or anything under `plugins/vwf/skills/` or
  `plugins/vwf/agents/` (wave 2).
- `assets/examples/**` carry `implementation:` frontmatter as blueprint fixtures
  — not yours, not falsified.
- No escaped backtick inside a code span.

## Commit

`refactor: vwf assets — plan folders, run log in the folder` — written by the
orchestrator after the wave gate. Type `refactor`; no scope.
