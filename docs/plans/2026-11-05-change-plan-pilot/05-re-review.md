# U5 — Settle the open ledger entries as a fresh reviewer

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

> D5: One restore round. A missing entry after the re-review stops the run, and
> no unit can set dropped, because the run is unattended.

> D9: No. The change lands no runnable code, so the wave review is the check.

> D10: Fresh means a new subagent that saw no writer's reasoning. The overlap
> list moves from Facts into the U1 unit file, so Facts stays neutral.

> D11: Yes, in different waves, with one writer per wave. The skill folder and
> the ledger folder take this exception.

> D14: The user decides each open entry by hand in the run's worktree: restore the
> rule and set its entry to pending, or record dropped with approved true. The
> user writes the ruling in decisions and commits. Then the run resumes at U5.

> D16: Yes. A re-dispatched U2 or U5 may change the entry that a wave-review
> finding names, and nothing else.

## Edits

1. **`docs/plans/2026-11-05-change-plan-pilot/ledger/SKILL.json`.** Run the
   reviewer prompt on the `pending` entries, with `<new-skill-dir>` as
   `plugins/vwf/skills/change-plan`.
2. **`docs/plans/2026-11-05-change-plan-pilot/re-review.md`.** Write an H1, the
   count per status, and one line for each `missing` entry. Write this file even
   when no entry was pending. On a re-dispatch, add a new section, and do not
   overwrite an earlier one.

## Verification

- `mise x -- mise run code:format`
- `node .claude/skills/skill-kit/scripts/ledger.mjs check docs/plans/2026-11-05-change-plan-pilot/ledger plugins/vwf/skills/change-plan`
  exits 0.
- If it exits 1, return `UNRESOLVED:` with each open entry (D5, D14).

## Guardrails

- Change only `pending` entries, or the entry that a wave-review finding names
  (D16), and no `id`, `line`, `kind` or `text`.
- Do not read `01-rewrite.md`, or the git history of the skill.
- Doubt means `missing`.
- Do not set `dropped`.
- Do not edit the skill. Do not edit `.claude/skills/skill-kit/` (D3).

## Commit

`docs: settle the rule ledger of the change-plan rewrite`
