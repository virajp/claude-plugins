# U3 — The stage contract and memory asset, for one executor

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/execute-stages.md`,
  `plugins/vwf/assets/memory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom.
- **Lazy-load:** `plugins/vwf/skills/change-execute/references/wave-review.md`
  (:58-62 already cites the convergence guard; read only).

## Ruling

Decision 6: "Present only on a cycle plan, `covers:` gates: … the acceptance and
UX pass, Reconcile's stamps / registry / environment / harness steps …"

Decision 8: "The Run log mirrors to room `runs` for every plan; per-unit recall
before dispatch and decision persistence after run for `code` units only — an
`edit` unit's ruling is in its file."

Decision 9: "`execute`'s inline docs-sync call in Reconcile goes — the docs unit
does it. The `implementation:` stamps and the registry / environment / harness
reconcile stay the orchestrator's Reconcile step, gated on `covers:`, run
**before** the docs unit's wave so its delta is complete."

## Edits

1. **`plugins/vwf/assets/execute-stages.md`** —
   - `:1` title line: "used by `/vwf:execute` for a `code` unit" — the stage
     table and the five contracts (:10-110) apply to `code` units; say so in the
     section's first sentence.
   - Shared stage rules `:112-177`: mark which apply to every unit (Model
     enforcement, Pipeline knobs, Terse output, Loop on findings, Convergence
     guard — the wave review cites the last two) and which to `code` units with
     `covers:` (the blueprint gap rules :160-177). One short line per rule, no
     restructuring.
   - Run log section `:179-227`: one row per node for a `code` unit, one row per
     unit report for an `edit` unit; the journal mirror for every plan.
   - Reconcile `:229-265`: delete step 4 (docs-sync, :247-252) — the docs unit's
     wave does it; say Reconcile runs before that wave; steps 1-3 and 5 gated on
     `covers:`.
   - Fold by hand.
2. **`plugins/vwf/assets/memory.md`** — the room `runs` and the journal passages
   (:91-94, :325-338): the mirror is written for every plan; the per-unit recall
   and the decision persistence (`:61-69`, wherever the execute loop is
   described) are for `code` units. No other change.

## Verification

- `grep -n 'docs-sync' plugins/vwf/assets/execute-stages.md` prints nothing (or
  only a sentence saying the docs unit does it).
- `grep -n 'code. unit\|`code`unit' plugins/vwf/assets/execute-stages.md` ≥ 3.
- `grep -n 'change-execute' plugins/vwf/assets/execute-stages.md plugins/vwf/assets/memory.md`
  prints nothing.
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch `plan-index.md`, `plan-folder.md`, `plan-interview.md` (U1) or
  anything under `plugins/vwf/skills/`.
- Do not change a stage contract's content — only its scope line.
- No escaped backtick inside a code span.

## Commit

`refactor: execute-stages and memory — scoped to code units, one executor` —
written by the orchestrator after the wave gate. Type `refactor`; no scope.
