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
  landing key is `repo.branches.<b>.landing` (D4); the integration branch is
  `develop` when it is a core branch, else `main` (D3).
- This repo's own release tasks and `.config/` files keep their names until the
  user edits them; a passage on them is not changed.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta, and apply its findings
   plus every `DOCS FALSIFIED:` line of waves 1 and 2.
2. **`CLAUDE.md`**, **`readme.md`**, **`.claude/docs/**`**,
   **`.claude/skills/**`**, **`site/src/content/docs/**`**: the rulings above.

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside the owned paths.
- `CLAUDE.md`, `readme.md` and the site pages are dprint-formatted. A table
  cell that ends in `*` oscillates between the formatter and the linter: avoid
  it. U6 may run `mise x -- dprint fmt <file>` on each file it changed.
- Do not edit `.config/` files.
- Delete with `rm`, never `git rm`.

## Commit

`docs: the plugins land through bootstrap's git tasks`
