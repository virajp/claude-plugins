# U2 — doctor checks the vwf plugin and the virajp-plugins tool

- **Read first:** `plugins/vwf/skills/doctor/SKILL.md` (the finding kinds and
  the fix tables) and `references/stack-checks.md`, as R3a and R3b leave them,
  and `plugins/vwf/assets/bootstrap-contract.md`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D2:** doctor reads `claude plugin list --json`. If `vwf@virajp-plugins` is
  installed at any scope, the plugin check passes; if it is installed at no
  scope, the finding is blocking, with the fix: install vwf (the installer's
  one-shot, or `mise run setup:ai` in a repo with the tool). In the base repo
  only, if `bootstrap describe --json` `data.tools` does not list
  `virajp-plugins`, doctor reports one drift row (not blocking): vwf's
  `.gitignore` lines are missing; the fix is `/vwf:setup reshape`. If `claude`
  is absent, the plugin check is a note, not a finding.
- **D13, D20:** an entry counts when `enabled` is true and either its scope is
  `user`, or its `projectPath` is this repo's main checkout or one of its
  worktrees (`git worktree list`).
- **D12:** one row per cause: when the tool is missing, the memory check of
  `references/harness-and-memory.md` (about lines 25-26) does not report its
  ignore line, and that file's source sentence names the `virajp-plugins` tool
  (D11).
- **D8:** if the base repo is not shaped, or `describe --json` fails, skip the
  missing-tool row; doctor already reports the shape problem.
- **D9:** if `bootstrap catalog --json` has no `virajp-plugins` tool, give a
  note, not a row.

## Edits

1. **`doctor/references/stack-checks.md`**: the two checks of D2, beside the
   repo-tooling checks, with their fix rows.
2. **`doctor/SKILL.md`**: the Covers cell and the fix table name them.
3. **`doctor/references/harness-and-memory.md`**: D12.

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside the three owned files.
- `plugins/vwf/skills/doctor/scripts/` is not owned. If the check must be
  scripted, return a QUESTION.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: doctor checks the vwf plugin and the virajp-plugins tool`
