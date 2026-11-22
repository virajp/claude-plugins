# U6 — Docs

- **Read first:** the branch delta of waves 1 and 2, then each passage named
  below.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`. The rulings are quoted in the unit files of
U1 to U4.

- The docs say: git-workflow and `land.mjs` call `git:merge:<b>` and
  `git:worktree:*` (D1); the main checkout's uncommitted changes stay
  uncommitted and are never part of a merge (D23, D29); the
  landing key is `repo.branches.<b>.landing`, `pr`, `direct-merge` or
  `direct-commit` (D4, D42); the integration branch is `develop` when it is a
  core branch, else `main` (D3).
- Amended 2026-11-18: `land.mjs` runs no destructive raw git (D36); it
  rebases its own branch first, and a lost claim is a clean `conflict` (D37);
  a conflict of the task in the main checkout is left for the user to resolve
  or abort (D15); a failed push keeps the merge commit on local `<into>`
  (D38); `abandon` keeps an unmerged branch unless it is `land.mjs`'s own
  scratch (D5, D43), and `finish` deletes only a branch whose request `gh` or
  `glab` reports merged (D11, D44); the task's whole-tree hook pass gates
  every claim, approval and completion (D23, D45); the merge commit has git's
  default subject (D39); a missing `git:*` port stops with the hint
  `bootstrap migrate` (D40).
- This repo's own release tasks and `.config/` files keep their names until the
  user edits them; a passage on them is not changed.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta, and apply its findings
   plus every `DOCS FALSIFIED:` line of waves 1 and 2.
2. **`CLAUDE.md`**, **`readme.md`**, **`.claude/docs/**`**,
   **`.claude/skills/**`**, **`site/src/content/docs/**`**: the rulings above,
   with D48 (`finish` deletes its own merged scratch on origin too).
3. **`.claude/skills/plugin-authoring/references/checks.md`**: the init
   asset allowlist names `CONTRIBUTING-one-branch.md` too (D49).
4. **`CLAUDE.md`** (about lines 310-316) and
   **`.claude/docs/ci-and-releases.md`** (about lines 38-42): the
   landing-model lines become `repo.branches.<b>.landing` in
   `.config/bootstrap/repo.toml`; only the lines on the release tasks stay
   as they are (D50).

## Verification

- `mise x -- mise run code:format --all` passes.

## Guardrails

- Touch nothing outside the owned paths.
- `CLAUDE.md`, `readme.md` and the site pages are dprint-formatted. A table
  cell that ends in `*` oscillates between the formatter and the linter: avoid
  it. U6 may run `mise x -- dprint fmt <file>` on each file it changed.
- Do not edit `.config/` files.
- Delete with `rm`, never `git rm`.

## Commit

`docs: the plugins land through bootstrap's git tasks`
