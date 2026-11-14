# U3 — init and readme: the landing key, git:* names, two CONTRIBUTING variants

- **Read first:** each owned file's passages named below.
- **Lazy-load:** `docs/memory/gaps/2026-11-14-one-or-two-core-branches-parked.md`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D4:** every `merge_model` or `[branch.*]` name becomes the landing key
  `repo.branches.<b>.landing` (`pr`, `direct-merge`, `direct-commit`), read
  and written through `bootstrap config`. "A pull request on whichever has
  `merge_model = "pr"`" becomes "on each core branch whose landing is `pr`".
- **D1:** `code:merge:develop` and `code:merge:main` become
  `git:merge:develop` and `git:merge:main`; `setup:worktree` becomes
  `git:worktree:setup`.
- **D3:** init's hygiene `CONTRIBUTING.md` has two variants: one for a repo
  with two core branches (`develop` and `main`) and one for a repo with one.
  init picks the variant from `repo.core_branches`. The forge pass protects
  each core branch and sets the default branch to the integration branch.

## Edits

1. **`init/SKILL.md`**: about lines 98 and 438: D4; the forge pass: D3.
2. **`init/references/new-repo.md`**: about lines 246, 375 and 470: D4 and D3.
3. **`init/references/readme-and-license.md`**: about line 37: D1.
4. **`init/assets/hygiene/CONTRIBUTING.md`**: the two-branch variant (lines
   about 34-55: D1, D4). Add the one-branch variant beside it, with the same
   sections and one move (`git:merge:<branch>`). Name both files in SKILL.md's
   hygiene step.
5. **`readme/references/steps.md`**: about lines 13 and 70: D1.

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned files.

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init names the landing key, the git tasks and one or two core branches`
