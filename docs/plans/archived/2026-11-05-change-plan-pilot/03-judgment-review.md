# U3 — Answer the judgment list as a fresh reviewer

- **Read first:** `.claude/skills/skill-kit/templates/judgment-reviewer-prompt.md`,
  and follow it as your task, with `<skill-dir>` as
  `plugins/vwf/skills/change-plan` and `<skill-kit>` as
  `.claude/skills/skill-kit`.

## Ruling

> D1: Separate units for rewrite, ledger review, and restore, so each reviewer is
> fresh.

> D3: A skill-kit defect becomes a gap, and no unit changes the tool. A blocking
> defect stops the run.

> D9: No. The change lands no runnable code, so the wave review is the check.

> D10: Fresh means a new subagent that saw no writer's reasoning. The overlap
> list moves from Facts into the U1 unit file, so Facts stays neutral.

## Edits

1. **`docs/plans/2026-11-05-change-plan-pilot/judgment.md`.** Write the prompt's
   return value to this file: an H1, then one line per finding, or `NO GAPS`.

## Verification

- `mise x -- mise run code:format`
- The file exists, and holds `NO GAPS` or at least one line in the prompt's form.

## Guardrails

- Change no file of the skill. U4 applies the findings.
- Do not read `01-rewrite.md`, or the git history of the skill (D10).
- Report a judgment finding only. The ledger reviewer owns whether a rule stayed.
- Report no finding that the skill's behavior must change. Return it as a `GAP:`,
  because a behavior change is out of scope.
- Do not edit `.claude/skills/skill-kit/` (D3).

## Commit

`docs: record the judgment review of the change-plan rewrite`
