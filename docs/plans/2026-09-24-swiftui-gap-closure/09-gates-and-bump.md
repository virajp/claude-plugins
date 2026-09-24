# U9 — Gates and bump

- **Wave:** 4
- **Depends on:** U8
- **Owns:** `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Wave gate.

## Ruling

Quoted from index.md's Consent block: "Release stackgen publicly — minor —
1.31.0 → 1.32.0, by hand"; "Release vwf publicly — minor — 19.45.1 → 19.46.0, by
hand"; "Release site publicly — patch — 1.1.46 → 1.1.47,
`mise run p:site:version` (bare, no positional, on a clean tree)"; "Release
installer publicly — none". And: "The `Release` rows are **intent, not
authorisation**: no release step."

## Edits

1. **Site first, on a clean tree** — `mise run p:site:version`, bare. Record the
   version reached if it skips past 13 or 17.
2. **stackgen** manifest by hand: one minor above what the tree reads (expected
   1.31.0 → 1.32.0); record any difference.
3. **vwf** manifest by hand: one minor above what the tree reads (expected
   19.45.1 → 19.46.0); record any difference.
4. **Generators** — `mise run p:plugins:inventory`, then
   `mise run p:plugins:marketplace`.
5. **The full wave gate**, every line green.

## Verification

- Every Wave gate line green, both freshness checks included.
- No version carries a 13 or 17 component.

## Guardrails

- Touch nothing outside Owns; the pack versions F9 set stay as they are.
- Run no release task.
- Never run `git checkout`, `git restore`, `git stash` or a formatter's `--fix`
  outside Owns.

## Commit

`ops: stackgen 1.32.0, vwf 19.46.0, site 1.1.47 — SwiftUI gap closure`
