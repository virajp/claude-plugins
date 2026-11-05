# U1 — Extract the ledger and rewrite change-plan

- **Read first:** every owned file, top to bottom, before editing.
- **Read first:** `.claude/skills/skill-kit/references/standard.md`,
  `references/style.md`, `references/archetype-workflow.md`, and
  `workflows/rewrite.md` in the same skill.
- **Lazy-load:** `plugins/vwf/assets/templates/plan-folder.md`,
  `plugins/vwf/assets/plan-interview.md`,
  `plugins/vwf/skills/plan-management/SKILL.md` and
  `plugins/vwf/skills/backlog/SKILL.md`, to test whether an owner states a rule.

## Ruling

> D1: Separate units for rewrite, ledger review, and restore, so each reviewer is
> fresh.

> D2: The ledger lives in docs/plans/2026-11-05-change-plan-pilot/ledger/ and is
> committed.

> D3: A skill-kit defect becomes a gap, and no unit changes the tool. A blocking
> defect stops the run.

> D4: Link to owners, plus plain style. A rule that only the skill holds stays.

> D6: Phases keep the numbers §1 to §8, so that existing citations stay valid.

> D7: The argument placeholder stays in SKILL.md, because the host is expected to
> expand it only in that file, so a reference must not depend on it.

> D8: Mark always and sometimes honestly. If the always-loaded words exceed
> 1,500, record the warning and do not hide it.

> D9: No. The change lands no runnable code, so the wave review is the check.

> D10: Fresh means a new subagent that saw no writer's reasoning. The overlap
> list moves from Facts into the U1 unit file, so Facts stays neutral.

> D11: Yes, in different waves, with one writer per wave. The skill folder and
> the ledger folder take this exception.

> D12: Errors block, and warnings do not. U1 rewrites to the style guide, and
> stats.md lists each warning that remains. A sentence is never split in a way
> that loses a condition.

> D13: U6 returns UNRESOLVED when the final always-loaded words are not below
> 4,912, so the run stops before the merge. The user then accepts the number with
> a ruling in decisions, or rewrites by hand. After a hand rewrite, the user
> reopens the affected entries and resets U5 to pending, and the run resumes at
> U5. On resume, U6 reads the ruling.

> D15: Yes, wherever they differ. U1 adds no script, because D9 depends on no
> runnable code landing.

## Overlaps with an owner

- `plugins/vwf/assets/templates/plan-folder.md` owns the `index.json` keys, the
  `index.md` sections and the unit file shape. §6 restates much of it.
- `plugins/vwf/assets/plan-interview.md` owns the checklist. §3, §4 and §5
  restate items 13, 16, 17, 18 and 19.
- `plugins/vwf/skills/plan-management/` owns `add`, `priority`, `resolve` and the
  index shape.
- `plugins/vwf/skills/backlog/SKILL.md` owns the `planned` and `unplanned` calls.

## Edits

1. **Extract before any edit.** Run from the worktree root:
   `node .claude/skills/skill-kit/scripts/ledger.mjs extract plugins/vwf/skills/change-plan docs/plans/2026-11-05-change-plan-pilot/ledger`.
   Expect 123 entries. Do not edit the ledger files after this step. If
   `ledger/.manifest.json` already exists, this is a re-dispatch: skip this step.
2. **`plugins/vwf/skills/change-plan/SKILL.md` frontmatter.**
   - Keep `name`, `argument-hint`, `model` and `disable-model-invocation`
     unchanged.
   - Write a `description` of at most 350 chars: the outcome, the trigger, and
     "Not for a blueprint slice (use plan)". The mechanism goes in the body.
   - Add `metadata.archetype: workflow`, and
     `metadata.depends-on: [plan-management, backlog, git-workflow]`.
   - If lint reports SK012, add `metadata.invocation-reason`, and state that the
     skill keeps its current invocation state.
3. **`SKILL.md` body**, in the sections of the workflow archetype:
   - A title line with the purpose: the planner's bar is a plan that
     `/vwf:execute` can run with no one present.
   - **State**: the files that it reads and writes, and each owner.
   - **Phases**: one row for each of §1 to §8, in this order, with the gate, a
     link, and a `Loads` column. Mark a reference `always` when most runs read
     it.
   - **Halt and pause**: a table with IDs. Include the §5 hard gate, the
     `plan-management add` refusal, and the stop at an unplanned item.
   - **Output**: the launch block, exactly as it is today, and its three endings.
   - **Never**: at most 5 bullets in the form `rule — reason`, and name the
     correct action. Move any further prohibition to the reference of its phase.
   - The argument placeholder is `$ARGUMENTS` (D7). `SKILL.md` keeps one line that
     defines "the request" as `$ARGUMENTS`, and the rule that a `Bnn` id in it is
     always a source id. The survey moves to the §1 reference, and says "the
     request".
4. **`plugins/vwf/skills/change-plan/references/`.** Write one file per phase or
   per close group of phases. One topic per file, no subfolders, and a relative
   link from `SKILL.md` to each.
5. **Compress by D4.**
   - Replace a passage with a link to its owner only when the owner states the
     same rule. Read the owner first.
   - A passage that adds a condition, an order, an actor or a reason that the
     owner lacks stays, with only that difference kept.
   - Keep each `Bnn` rule, each list of `index.json` keys that only this skill
     rules on, and every self-review check.
   - Rewrite the remaining prose by `style.md`.
   - Keep each interview item number exactly as it is.
6. **Fold** the prose at 80 columns by hand. dprint does not format this tree.

## Verification

- `mise x -- mise run code:format`
- `node .claude/skills/skill-kit/scripts/lint.mjs plugins/vwf/skills/change-plan`
  shows no error. A warning can stay (D8, D12).
- `mise x -- mise run p:plugins:check` passes.
- `node .claude/skills/skill-kit/scripts/lint.mjs --words plugins/vwf/skills/change-plan`
  prints a lower `always` than 4,912. If it does not, return a `GAP:` with the
  number and continue, because only U6 enforces D13.
- Each of the 123 entries exists in `ledger/SKILL.json`, with status `pending`.

## Guardrails

- Change no behavior. If a passage is wrong, keep it, and return it as a `GAP:`.
- Do not fill the ledger. A fresh unit does that, or the proof means nothing.
- Add no script. `workflows/rewrite.md` lists scripts first, but D15 overrides it.
- Do not edit `.claude/skills/skill-kit/`. Return a defect as a `GAP:`, or as
  `UNRESOLVED:` if it blocks the extract (D3).
- Do not edit `plan-interview.md` or `plan-folder.md`.
- Keep every `${CLAUDE_PLUGIN_ROOT}` citation to a file in `plugins/vwf/`.
- Do not use a bash heredoc to write a file. Use the Write tool, because `cat` is
  aliased.

## Commit

`refactor: rewrite change-plan to the skill-kit standard`
