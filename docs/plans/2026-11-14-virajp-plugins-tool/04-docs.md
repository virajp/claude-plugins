# U4 — Docs

- **Read first:** the branch delta of wave 1, then each passage named below.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D5:** `setup:ai` is declarative (bootstrap R2c): it installs what the
  claude tool lists, vwf through the `virajp-plugins` tool; it removes the
  project plugins it recorded; it updates only with `mise run setup:ai --update` (D10); it makes no
  pnpx call. The installer stays the one-shot for a person.
- **D1, D2:** init adds the `virajp-plugins` tool to the base repo; doctor
  checks the vwf plugin at any scope and reports a missing tool as drift.
- **D3:** a pack's plugin goes through `bootstrap config` and `setup:ai`.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta, and apply its findings
   plus every `DOCS FALSIFIED:` line of wave 1.
2. **`installer/CLAUDE.md`** (about lines 25-31), **`readme.md`** (about line
   141): D5. **`CLAUDE.md`**: about line 298, D5; about lines 429-431, a
   pack's plugin goes through `bootstrap config` and `setup:ai` (D3, D15).
3. **`.claude/docs/**`**, **`.claude/skills/**`**,
   **`site/src/content/docs/**`**: D1 to D3 and D5.

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned docs.

## Guardrails

- Touch nothing outside the owned paths.
- `CLAUDE.md`, `installer/CLAUDE.md`, `readme.md` and the site pages are
  dprint-formatted. A table cell that ends in `*` oscillates between the
  formatter and the linter: avoid it. U4 may run
  `mise x -- dprint fmt <file>` on each file it changed.
- Do not edit `.config/` files.
- Delete with `rm`, never `git rm`.

## Commit

`docs: setup:ai is declarative and vwf repos add virajp-plugins`
