# U7 — `/vwf:change-execute` reads the shared index procedure

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `plugins/vwf/skills/change-execute/**`
- **Model:** opus
- **Read first:** `plugins/vwf/skills/change-execute/SKILL.md`,
  `references/queue.md`, `references/wave-review.md`, `references/blocking.md`;
  then `plugins/vwf/assets/plan-index.md` and
  `plugins/vwf/assets/templates/plan-folder.md` (as U1/U2 left them).
- **Lazy-load:** none.

## Ruling

Decision 2: "**No executor switches on Kind in this plan** … `change-execute`
[runs] its wave review."

Decision 3: "The queue procedure (read at tip, claim, completion, sweep) moves
from `change-execute/references/queue.md` into `assets/plan-index.md`."

Decision 4: "Both executors take `<folder>` or `next`; `next` reads the one
table, filtered to its own `Kind`."

Decision 10 (as it binds this unit): "`change-execute/references/queue.md` …
deleted."

Decision 5: "A change entry keeps the row/archived test" — and a change plan
whose `requires:` names a **cycle** plan resolves that entry by the cycle test
(every `covers:` doc `implementation: complete` in the base).

## Edits

1. **`SKILL.md`** — `description`: "claim its row in the base repo's
   `docs/plans/index.md`" stays; "next reads that index alone and picks the
   runnable plan of highest priority" → "… the runnable **change** plan". Body:
   - Every "change-plan table" → "the plan index"; every citation of
     `references/queue.md` → `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` (its
     *The procedure* section). The References table loses the queue row.
   - §1 `next`: candidates are the rows with `Kind` `change`; a `cycle` row is
     never picked here (say `/vwf:execute next` picks those). Requirement
     resolution: a `change` entry by row or archived folder as today; a `cycle`
     entry by the stamp test, read from the base repo's blueprint.
   - §1 refusals: a folder whose `index.md` has `type: vwf-plan` is refused — "a
     cycle plan; run `/vwf:execute <folder>`".
   - §1 claim, §7 completion row and sweep: the same steps, now cited from the
     asset; the row's `Kind` and `Target repo` cells are never edited.
   - §4: the Units table has a `Kind` column; this executor reads it and ignores
     it in this release — every unit runs the wave review — and says so in one
     sentence.
   - The folder's Launch text and this skill's own launch echo stay.
2. **`references/queue.md`** — `rm`. Its content now lives in
   `assets/plan-index.md` (U1 wrote it there).
3. **`references/blocking.md`**, **`references/wave-review.md`** — wording only:
   "change-plan table" → "the plan index" if present; nothing else.
4. Fold by hand — `plugins/**/*.md` is not dprint-formatted.

## Verification

- `test ! -e plugins/vwf/skills/change-execute/references/queue.md`.
- `grep -rn 'references/queue.md\|change-plan table\|cycle-plan table' plugins/vwf/skills/change-execute/`
  prints nothing.
- `grep -n 'plan-index.md' plugins/vwf/skills/change-execute/SKILL.md` ≥ 2 hits.
- `grep -n 'Kind' plugins/vwf/skills/change-execute/SKILL.md` hits in §1 and §4.
- `grep -n 'type: vwf-plan' plugins/vwf/skills/change-execute/SKILL.md` hits
  (the refusal).
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch `plugins/vwf/skills/{plan,execute,change-plan}/**` or any asset —
  U1 already moved the procedure; you delete your copy.
- Delete with `rm`, never `git rm`.
- No escaped backtick inside a code span.

## Commit

`refactor: change-execute — shared index procedure, next by kind` — written by
the orchestrator after the wave gate. Type `refactor`; no scope.
