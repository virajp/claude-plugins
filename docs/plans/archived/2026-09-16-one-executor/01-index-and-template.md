# U1 — The index contract and the folder template name one executor

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/plan-index.md`,
  `plugins/vwf/assets/templates/plan-folder.md`,
  `plugins/vwf/assets/plan-interview.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom.
- **Lazy-load:** `plugins/vwf/skills/change-execute/SKILL.md` §7 (:243-263 — the
  landing that moves the folder; read only, U2 deletes it).

## Ruling

Decision 5: "When the landing's gap list is empty, the landing moves the folder
to `docs/plans/archived/`, re-points `Folder`, sets `COMPLETE` and sweeps — for
both kinds. When any gap is open, the folder stays live as the working record,
the row reads `COMPLETE` with `Folder` at the live path, and the report names
`/vwf:archive` for after reconciliation. `plan-index.md`'s two writer rows
collapse to one."

Decision 9 (as it binds the template): "The docs unit and the gates-and-bump
unit are the last two waves for every plan … The `implementation:` stamps and
the registry / environment / harness reconcile stay the orchestrator's Reconcile
step, gated on `covers:`, run **before** the docs unit's wave."

Decision 11: "No Kind filter: candidates are every `APPROVED` row whose
requirements are satisfied, ordered as today; the `Kind` cell is still written
and printed with the pick."

Decision 13: "`/vwf:change-plan` and `/vwf:plan` both end with
`/vwf:execute docs/plans/<folder>` and `/vwf:execute next`; `plan-folder.md`'s
Launch block, its 'No executor switches on it yet' paragraph and its Run log
'per unit report' sentence are rewritten for one executor; `plan-index.md`'s
'either executor' prose and the intro written into every repo's index name one
`next`."

## Edits

1. **`plugins/vwf/assets/plan-index.md`** —
   - `:12` writers list and `:63-66` writers table: one executor,
     `/vwf:execute`, one row: sets `RUNNING` at claim, `COMPLETE` after the
     merge lands; `Folder` re-pointed under `archived/` when the landing
     archived (an empty gap list), left at the live path otherwise, in which
     case `/vwf:archive` re-points it later. Delete the `change-execute` row.
   - `:25` the intro prose (this text is written into every repo's
     `docs/plans/index.md` — keep it one sentence): "the queue
     `/vwf:execute next` reads to pick the next runnable plan".
   - `:117-119` the pick: `next` is taken by `/vwf:execute`; candidates are
     every `APPROVED` row whose requirements are satisfied, of either kind;
     order unchanged; the pick prints the folder, its `Kind` and its Priority.
     Delete "filtered to its own kind". `:154`, `:174`: "rows of the executor's
     own kind" → "rows"; `:192` unchanged ("the executor").
   - `:206-209` the Folder re-point split: one rule per decision 5.
   - Fold by hand — not dprint-formatted.
2. **`plugins/vwf/assets/templates/plan-folder.md`** —
   - `:3-5`, `:14`: "parsed and rewritten by `/vwf:execute`".
   - `:114-117`: replace the paragraph with: Kind is `code` or `edit`;
     `/vwf:plan` writes `code` on every unit, `/vwf:change-plan` writes `edit`;
     `/vwf:execute` runs a `code` unit through the per-unit pipeline and an
     `edit` unit under the wave review — the `edit` units of a wave are
     dispatched together, the `code` units one at a time.
   - `:186-188` Run log: one row per node for a `code` unit, one row per unit
     report for an `edit` unit, both appended as they return.
   - `:231`, `:235` Launch: `/vwf:execute docs/plans/<date>-<name>` and
     `/vwf:execute next`, for both kinds — drop the "by kind" branching.
   - `:289`, `:300-303`: the docs unit runs `/vwf:docs-sync` for every plan; the
     `implementation:` stamps are the executor's Reconcile step, gated on
     `covers:`, run before the docs unit's wave. Delete "see the executor".
   - Fold by hand.
3. **`plugins/vwf/assets/plan-interview.md`** — `:122` already says "the
   executor"; read the file for any other executor-by-name mention and fix it;
   otherwise no edit.

## Verification

- `grep -n 'change-execute\|either executor\|both executors\|own kind\|switches on it yet\|plan 2' plugins/vwf/assets/plan-index.md plugins/vwf/assets/templates/plan-folder.md plugins/vwf/assets/plan-interview.md`
  prints nothing.
- `grep -c '/vwf:execute next' plugins/vwf/assets/plan-index.md` ≥ 2;
  `grep -n '/vwf:execute docs/plans/' plugins/vwf/assets/templates/plan-folder.md`
  hits.
- `grep -n 'archived' plugins/vwf/assets/plan-index.md` shows the one-rule
  re-point (empty gap list → moved; otherwise live).
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch `plugins/vwf/skills/**` or `assets/execute-stages.md` (U3).
- No escaped backtick inside a code span; no code span beginning with `##`.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`refactor: plan index and template — one executor` — written by the orchestrator
after the wave gate. Type `refactor`; no scope.
