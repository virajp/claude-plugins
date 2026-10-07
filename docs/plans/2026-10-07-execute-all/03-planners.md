# U3 — the planners record the reload row and launch `all`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-plan/SKILL.md`,
  `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/assets/plan-interview.md`,
  `plugins/vwf/assets/templates/plan-folder.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom.

## Ruling

> - Decision E4: The planners record a Consent row "End an `all` run after
>   landing: yes/no", asked only when the plan edits a plugin the run itself
>   loads; on yes, `all` ends after that plan and reports "restart, then
>   `/vwf:execute all`".

Reversal, confirmed: "a fresh session" becomes "a fresh context: a fresh
session, or a runner that `all` dispatches".

## Edits

1. **`assets/plan-interview.md`** — section E: a new item asking E4's question,
   only when the plan's Owns include a plugin the run loads; otherwise the row
   is written `no` unasked.
2. **`assets/templates/plan-folder.md`** — the Consent table gains the row
   `End an all run after landing | yes / no`; the Launch block adds a third
   line, `/vwf:execute all`.
3. **`skills/change-plan/SKILL.md`** and **`skills/plan/SKILL.md`** — §4 / the
   consent step names the new row; the launch block they end with adds
   `/vwf:execute all`; their "fresh session" passages take the reversal's
   wording.

## Verification

- `mise run p:plugins:check` green.
- `grep -n 'End an' <each owned file>` shows the row in the template and the
  interview.

## Guardrails

- Keep the Consent and Launch headings and column order exactly.
- `plugins/**/*.md` is not formatted — match the fold width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: the planners record the end-an-all-run row and launch /vwf:execute all`
