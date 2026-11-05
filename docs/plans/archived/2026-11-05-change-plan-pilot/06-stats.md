# U6 — Run the proof and write the before and after stats

- **Read first:** the before table in
  `docs/plans/2026-11-05-change-plan-pilot/index.md`.

## Ruling

> D2: The ledger lives in docs/plans/2026-11-05-change-plan-pilot/ledger/ and is
> committed.

> D3: A skill-kit defect becomes a gap, and no unit changes the tool. A blocking
> defect stops the run.

> D5: One restore round. A missing entry after the re-review stops the run, and
> no unit can set dropped, because the run is unattended.

> D8: Mark always and sometimes honestly. If the always-loaded words exceed
> 1,500, record the warning and do not hide it.

> D9: No. The change lands no runnable code, so the wave review is the check.

> D12: Errors block, and warnings do not. U1 rewrites to the style guide, and
> stats.md lists each warning that remains. A sentence is never split in a way
> that loses a condition.

> D13: U6 returns UNRESOLVED when the final always-loaded words are not below
> 4,912, so the run stops before the merge. The user then accepts the number with
> a ruling in decisions, or rewrites by hand. After a hand rewrite, the user
> reopens the affected entries and resets U5 to pending, and the run resumes at
> U5. On resume, U6 reads the ruling.

## Edits

1. **Measure**, from the worktree root:
   - `node .claude/skills/skill-kit/scripts/ledger.mjs check docs/plans/2026-11-05-change-plan-pilot/ledger plugins/vwf/skills/change-plan`
   - `node .claude/skills/skill-kit/scripts/lint.mjs plugins/vwf/skills/change-plan`
   - `node .claude/skills/skill-kit/scripts/lint.mjs --words plugins/vwf/skills/change-plan`
   - `wc -c plugins/vwf/skills/change-plan/SKILL.md`, for the bytes
   - `find plugins/vwf/skills/change-plan -type f | wc -l`, for the files
   - for the description chars, the same measure as the before value:
     `node --input-type=module -e 'import {readSkill} from "./.claude/skills/skill-kit/scripts/lib/skill.mjs"; console.log(readSkill("plugins/vwf/skills/change-plan").fm.description.length)'`
2. **`docs/plans/2026-11-05-change-plan-pilot/stats.md`.** Write:
   - An H1.
   - A table with the columns Measure, Before, After, Change, for each row of the
     before table, with each change as a number and a percent.
   - The always-loaded words against the 1,500 budget.
   - The ledger counts per status, and the number of restored rules: the sum over
     the sections of `round.md`.
   - Each `no-rule` and `dropped` entry that `check` prints, as a list, so that a
     person can read each reason. A dropped rule is one that the user approved.
   - Each lint warning that remains.
   - Each `skill-kit` defect that the earlier units reported as a gap, read from
     the `gaps` list of `index.json`.

## Verification

- `mise x -- mise run code:format`
- The ledger check exits 0, and lint shows no error. If not, return `UNRESOLVED:`
  with the output (D5).
- Each number in `stats.md` comes from a command in this run.
- If the always-loaded words are not below 4,912, and `decisions` holds no ruling
  from the user that accepts the number, write `stats.md`, then return
  `UNRESOLVED:` with the number (D13).

## Guardrails

- Do not round a number, and do not leave out a bad number.
- Edit only `stats.md`. Do not edit `.claude/skills/skill-kit/` (D3).

## Commit

`docs: record the before and after stats of the change-plan rewrite`
