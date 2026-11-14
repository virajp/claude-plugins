# U6 — Docs

- **Read first:** the branch delta of wave 2, then each passage named below.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`. The rulings are quoted in the unit files of
U1 to U5.

- The docs say: vwf and stackgen need bootstrap 4.0.0 with contract 1 (D8);
  init drives the bootstrap CLI (D7); doctor reports `bootstrap check` and
  `sync --dry-run` as drift (D6); release levels live in
  `.config/bootstrap/releases.toml` through `bootstrap config`, and execute
  moves an old `.config/releases.yaml` at first sight (D5); stackgen's handoff
  calls `bootstrap catalog` and `add tool` (D9).
- **D10:** the passages on this repo's own release tasks
  (`.claude/docs/ci-and-releases.md`, `.claude/skills/release/`, `CLAUDE.md`
  CI & Releases) keep `.config/releases.yaml` until the user's hand step;
  add one sentence where they name it: "After R3a, `/vwf:execute` writes the
  levels to `.config/bootstrap/releases.toml`; the release tasks read it once
  the user switches them."

## Edits

1. Run `vwf:docs-sync` over the run's branch delta, and apply its findings
   plus every `DOCS FALSIFIED:` line of wave 2.
2. **`CLAUDE.md`**, **`readme.md`**, **`.claude/docs/**`**,
   **`.claude/skills/**`**: the rulings above.
3. **`site/src/content/docs/**`**: the manual pages of init, doctor, setup,
   execute, the plan folder and stackgen: the rulings above.

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside the owned paths.
- `CLAUDE.md`, `readme.md` and the site pages are dprint-formatted: widening a
  table cell re-pads every row. A table cell that ends in `*` oscillates
  between the formatter and the linter: avoid it. U6 may run
  `mise x -- dprint fmt <file>` on each file it changed, never on the whole
  tree.
- Do not edit `.config/` files: they are the user's hand step (D10).
- Delete with `rm`, never `git rm`.

## Commit

`docs: the plugins use the bootstrap contract`
