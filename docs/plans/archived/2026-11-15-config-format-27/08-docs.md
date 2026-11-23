# U8 — Docs

- **Read first:** the branch delta of waves 1 and 2, then each passage named
  below.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- The docs say: `config_format` 27 moves product, topology, members and
  environments to bootstrap's `repo.toml` (D7); `/vwf:setup` migrates a repo,
  and asks only where `repo.toml` and `vwf.yaml` differ (D3); the back-link is
  bootstrap's `[home]` (D4).

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
  it. U8 may run `mise x -- dprint fmt <file>` on each file it changed.
- Do not edit `.config/` files.
- Delete with `rm`, never `git rm`.

## Commit

`docs: config_format 27 and the repo facts in bootstrap`
