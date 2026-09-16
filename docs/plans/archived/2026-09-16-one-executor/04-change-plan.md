# U4 — `/vwf:change-plan` hands off to `/vwf:execute`

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/change-plan/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/change-plan/SKILL.md` top to bottom;
  `plugins/vwf/assets/templates/plan-folder.md` Launch block and Units paragraph
  (as U1 left them).
- **Lazy-load:** none.

## Ruling

Decision 13: "`/vwf:change-plan` and `/vwf:plan` both end with
`/vwf:execute docs/plans/<folder>` and `/vwf:execute next`."

Decision 14: "`change-plan`'s `description` names `/vwf:execute` where it named
`change-execute`."

## Edits

1. **`SKILL.md`** — every `change-execute` at :4, :23, :27, :32, :35, :103,
   :111, :142, :149, :208, :233, :245, :270, :304, :308 → `/vwf:execute` (or
   "the executor" where the sentence reads better); the frontmatter
   `description` folded for strict YAML. `:218-222`: replace "runs its wave
   review on every unit and switches on nothing" with: every unit carries the
   Kind `edit`; `/vwf:execute` dispatches the `edit` units of a wave together
   and judges them by the wave review. The two launch lines (:304, :308) read
   `/vwf:execute docs/plans/<date>-<name>` and `/vwf:execute next`. The "What
   this skill never does" list: "`/vwf:execute`'s and `/vwf:archive`'s".
2. Fold by hand — not dprint-formatted.

## Verification

- `grep -rn 'change-execute\|switches on nothing' plugins/vwf/skills/change-plan/`
  prints nothing.
- `grep -n '/vwf:execute docs/plans/\|/vwf:execute next' plugins/vwf/skills/change-plan/SKILL.md`
  — both.
- `mise run p:plugins:check` green; the marketplace manifest still lists
  `change-plan`.

## Guardrails

- Do not touch `skills/{execute,plan,archive,backlog,feedback}/**` or any asset.
- No escaped backtick inside a code span.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`refactor: change-plan — hands off to /vwf:execute` — written by the
orchestrator after the wave gate. Type `refactor`; no scope.
