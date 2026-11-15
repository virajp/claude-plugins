# U7 — Docs

- **Read first:** the branch delta of waves 1 and 2, then each passage named
  below.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- The docs say: `config_format` 28 slims the project stack (D8), renames
  `backing_template` and `deploy_template` to `services` and `deploy` (D5),
  reads a project's languages, package manager and folder from bootstrap (D9,
  D11), and finds a capability by its task (D10); `blueprint_format` 26 drops
  the registry `path`; `/vwf:setup` migrates a repo (D12).

## Edits

1. Run `vwf:docs-sync` over the run's branch delta, and apply its findings
   plus every `DOCS FALSIFIED:` line of waves 1 and 2.
2. **`CLAUDE.md`**, **`readme.md`**, **`.claude/docs/**`**,
   **`.claude/skills/**`**, **`site/src/content/docs/**`**: the ruling above.

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside the owned paths.
- `CLAUDE.md`, `readme.md` and the site pages are dprint-formatted. A table
  cell that ends in `*` oscillates between the formatter and the linter: avoid
  it. U7 may run `mise x -- dprint fmt <file>` on each file it changed.
- Do not edit `.config/` files.
- Delete with `rm`, never `git rm`.

## Commit

`docs: config_format 28, the slim stack and projects in bootstrap`
