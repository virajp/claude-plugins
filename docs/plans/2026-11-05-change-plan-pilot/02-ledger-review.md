# U2 — Fill the ledger as a fresh reviewer

- **Read first:** `.claude/skills/skill-kit/templates/ledger-reviewer-prompt.md`,
  and follow it as your task.
- **Lazy-load:** each file that the new skill links to, when a link holds a rule.

## Ruling

> D1: Separate units for rewrite, ledger review, and restore, so each reviewer is
> fresh.

> D2: The ledger lives in docs/plans/2026-11-05-change-plan-pilot/ledger/ and is
> committed.

> D3: A skill-kit defect becomes a gap, and no unit changes the tool. A blocking
> defect stops the run.

> D9: No. The change lands no runnable code, so the wave review is the check.

> D10: Fresh means a new subagent that saw no writer's reasoning. The overlap
> list moves from Facts into the U1 unit file, so Facts stays neutral.

> D11: Yes, in different waves, with one writer per wave. The skill folder and
> the ledger folder take this exception.

> D16: Yes. A re-dispatched U2 or U5 may change the entry that a wave-review
> finding names, and nothing else.

## Edits

1. **`docs/plans/2026-11-05-change-plan-pilot/ledger/SKILL.json`.** Run the
   reviewer prompt with `<ledger-file>` as this file and `<new-skill-dir>` as
   `plugins/vwf/skills/change-plan`. Set a status on every `pending` entry.
2. Change no `id`, `line`, `kind` or `text`. The check compares them with the
   manifest.
3. **`docs/plans/2026-11-05-change-plan-pilot/ledger-review.md`.** Write the
   prompt's return value to this file, under an H1: the count per status, and one
   line for each `missing` entry. Return the unit contract's block as your reply.
   On a re-dispatch, add a new section, and do not overwrite an earlier one.

## Verification

- `mise x -- mise run code:format`
- `node .claude/skills/skill-kit/scripts/ledger.mjs check docs/plans/2026-11-05-change-plan-pilot/ledger plugins/vwf/skills/change-plan`
  prints no `not settled` line. It can still exit 1 for `missing` entries, and
  this is correct at this stage.

## Guardrails

- Do not read `01-rewrite.md`, or the git history of the skill. You judge the old
  text against the new text alone.
- Doubt means `missing`.
- Do not set `dropped`. Only the user can drop a rule.
- Edit only the ledger and `ledger-review.md`.
- Do not edit `.claude/skills/skill-kit/`. Return a defect as a `GAP:`, or as
  `UNRESOLVED:` if it blocks the review (D3).

## Commit

`docs: fill the rule ledger of the change-plan rewrite`
