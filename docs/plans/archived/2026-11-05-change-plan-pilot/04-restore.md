# U4 — Restore missing rules and apply the judgment findings

- **Read first:** every owned file, then
  `docs/plans/2026-11-05-change-plan-pilot/judgment.md`.
- **Lazy-load:** `.claude/skills/skill-kit/references/style.md`.

## Ruling

> D1: Separate units for rewrite, ledger review, and restore, so each reviewer is
> fresh.

> D2: The ledger lives in docs/plans/2026-11-05-change-plan-pilot/ledger/ and is
> committed.

> D3: A skill-kit defect becomes a gap, and no unit changes the tool. A blocking
> defect stops the run.

> D4: Link to owners, plus plain style. A rule that only the skill holds stays.

> D5: One restore round. A missing entry after the re-review stops the run, and
> no unit can set dropped, because the run is unattended.

> D9: No. The change lands no runnable code, so the wave review is the check.

> D11: Yes, in different waves, with one writer per wave. The skill folder and
> the ledger folder take this exception.

> D12: Errors block, and warnings do not. U1 rewrites to the style guide, and
> stats.md lists each warning that remains. A sentence is never split in a way
> that loses a condition.

## Edits

1. **Restore.** For each `missing` entry in `ledger/SKILL.json`, put the rule back
   in `plugins/vwf/skills/change-plan`, with its condition, order, severity and
   actor intact. Then set that entry's `status` to `pending`, and remove its
   `where` and `quote`.
2. **Apply the findings.** Apply each finding in `judgment.md` that keeps
   behavior unchanged. If a finding needs a behavior change, do not apply it, and
   return it as a `GAP:`.
3. **Reopen rejected entries.** Run
   `node .claude/skills/skill-kit/scripts/ledger.mjs check docs/plans/2026-11-05-change-plan-pilot/ledger plugins/vwf/skills/change-plan`.
   For each `kept` entry that the
   check rejects, whatever the message, set its `status` to `pending`, and remove
   its `where` and `quote`. Do the same for each `kept` entry whose passage you
   edited in step 1 or step 2, because an edit can weaken a rule while its quote
   still matches.
4. **`docs/plans/2026-11-05-change-plan-pilot/round.md`.** Write an H1, the count
   of restored rules, the id of each, and each finding applied or not applied.
   Write this file even when nothing was missing. On a re-dispatch, add a new
   section, and do not overwrite an earlier one.

## Verification

- `mise x -- mise run code:format`
- `node .claude/skills/skill-kit/scripts/lint.mjs plugins/vwf/skills/change-plan`
  shows no error.
- `node .claude/skills/skill-kit/scripts/ledger.mjs check docs/plans/2026-11-05-change-plan-pilot/ledger plugins/vwf/skills/change-plan`
  prints no `no match` line. It exits 1 for the `pending` entries, and this is
  correct at this stage.

## Guardrails

- Do not set `kept`, `no-rule` or `dropped`. A fresh unit settles the entries.
- Change no `id`, `line`, `kind` or `text` in the ledger.
- Do not remove a rule to make a finding go away.
- Do not edit `.claude/skills/skill-kit/` (D3).
- Fold at 80 columns by hand under `plugins/`.

## Commit

`refactor: restore the rules that the ledger found missing in change-plan`
