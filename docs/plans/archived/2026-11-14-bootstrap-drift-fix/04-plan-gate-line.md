# U4 — Planners write code:precommit with no --all

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `.config/mise/tasks/code/precommit` and `/Users/virajpatel/Projects/github.com/virajp/bootstrap/repo/tools/pre-commit/tasks/code-precommit`, only to confirm that the task takes no flag.

## Ruling

D8:

> mise x -- mise run code:precommit, with no --all. bootstrap's code-precommit
> task (repo/tools/pre-commit/tasks/code-precommit) and this repo's synced copy
> declare no flag and always run pre-commit with --all-files. This finishes B118
> and closes the gap
> docs/memory/gaps/2026-11-06-gate-line-all-flag-undeclared-open.md.

D21, the user's answer to a rulings-review gap, verbatim:

> Fix it in U4 (Recommended): U4 changes the condition to
> `mise tasks ls --hidden` in gates-consent.md and plan-doc.md, so hidden tasks
> such as code:precommit count.

D27, the user's answer to a rulings-review gap, verbatim:

> Widen U4 (Recommended): U4 also owns change-plan/references/recall-survey.md
> and changes line 59 to `mise tasks ls --hidden`, the same rule as D21.

## Edits

1. **`plugins/vwf/assets/templates/plan-folder.md`** line 90 (the change-plan
   sample's `gates.plan`): `"mise x -- mise run code:precommit --all"` becomes
   `"mise x -- mise run code:precommit"`.
2. **`plugins/vwf/skills/change-plan/references/gates-consent.md`**
   - Line 19 (the table): the default for `gates.plan` becomes
     `mise x -- mise run code:precommit`. Re-pad the table by hand so its
     columns stay aligned.
   - Lines 22-24: replace the bullet with one that is true: the plan gate runs
     the full hook pass over every file of the finished tree, because the task
     always runs pre-commit with `--all-files`; it takes no flag.
3. **`plugins/vwf/skills/plan/references/plan-doc.md`** lines 33-37: the plan
   gate line becomes `mise x -- mise run code:precommit`, and the reason that
   follows says the same as edit 2's bullet.
4. **The listing condition (D21)** — `gates-consent.md` line 15 (the table
   header "Default, when `mise tasks ls` lists it") and `plan-doc.md` line 33
   ("`mise tasks ls` lists them"): `mise tasks ls` becomes
   `mise tasks ls --hidden`. Re-pad the table by hand.
5. **`plugins/vwf/skills/change-plan/references/recall-survey.md`** line 59
   (D27): "the task runner's list (`mise tasks`)" names
   `mise tasks ls --hidden` instead.
6. **`plugins/vwf/agents/plan-rulings-reviewer.md`** line 69 (D32): the gate
   check names the task list as `mise tasks ls --hidden` instead of
   `mise tasks`.

   D32, the user's answer to a rulings-review gap, verbatim:

   > Widen U4 (Recommended): U4 also owns
   > plugins/vwf/agents/plan-rulings-reviewer.md and changes line 69 to
   > `mise tasks ls --hidden`, the same rule as D21 and D27.
7. Any other `code:precommit --all` in the owned files gets the same change.

## Verification

- `mise x -- mise run code:format` passes.
- `grep -nF 'code:precommit --all'` over the five owned files finds nothing.
- `grep -nF 'mise tasks ls --hidden'` finds the condition in gates-consent.md
  and plan-doc.md.

## Guardrails

- Touch nothing outside the five owned files.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width and table
  padding by hand.
- Do not change the unit or wave gate lines.
- Delete with `rm`, never `git rm`.

## Commit

`fix: planners write the plan gate as code:precommit with no --all`
