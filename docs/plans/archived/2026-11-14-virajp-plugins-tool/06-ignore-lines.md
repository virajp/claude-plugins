# U6 — vwf's ignore lines come from the virajp-plugins tool

- **Read first:** the passage of each owned file named below.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D11:** after bootstrap's R2c, vwf's `.gitignore` lines
  (`docs/memory/handoff/`, `docs/memory/doctor/`, `docs/memory/runs/`,
  `docs/scratchpad/`, and the negation `!docs/plans/**/*.log`) come from
  bootstrap's `virajp-plugins` tool, which `/vwf:init` adds to the base repo,
  not from bootstrap's git tool. Change only the sentence that names the
  source of those lines in each owned file.

## Edits

1. `plugins/vwf/skills/setup/references/memory-tree.md` (about line 13).
2. `plugins/vwf/skills/handoff/SKILL.md` (about line 157).
3. `plugins/vwf/skills/git-workflow/references/worktree-setup.md` (about line
   38).
4. `plugins/vwf/skills/setup/SKILL.md` (about line 200).
5. `plugins/vwf/skills/mockups/SKILL.md` (about line 171).
6. `plugins/vwf/skills/blueprint/references/screen-review.md` (about line 28).
7. `plugins/vwf/assets/memory.md` (about line 75).

## Verification

- `mise x -- mise run code:format` passes.
- `grep -rnF "bootstrap's git tool"` over the owned files finds no passage on
  vwf's ignore lines.

## Guardrails

- Touch nothing outside the owned files. Change nothing else in them.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`docs: vwf's ignore lines come from the virajp-plugins tool`
