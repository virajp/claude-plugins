# U6 — Gates and bump

- **Wave:** 6
- **Depends on:** U5
- **Owns:** `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Wave gate.

## Ruling

Quoted from index.md's Consent block: "Release stackgen publicly — minor —
1.30.1 → 1.31.0, by hand"; "Release site publicly — patch — 1.1.45 → 1.1.46,
`mise run p:site:version` (bare, no positional, on a clean tree)"; "Release vwf
publicly — patch — 19.45.0 → 19.45.1, by hand"; "Release installer publicly —
none". And **E17** — "No release step."

## Edits

1. **Site first, on a clean tree** — `mise run p:site:version`, bare. Record the
   version reached if it skips past 13 or 17.
2. **stackgen** manifest by hand: one minor above what the tree reads (expected
   1.30.1 → 1.31.0); record any difference.
3. **vwf** manifest by hand: one patch above what the tree reads (expected
   19.45.0 → 19.45.1); record any difference.
4. **Generators** — `mise run p:plugins:inventory`, then
   `mise run p:plugins:marketplace`.
5. **The full wave gate**, every line green.

## Verification

- Every Wave gate line green, both freshness checks included.
- No version carries a 13 or 17 component.

## Guardrails

- Touch nothing outside Owns; `app-framework/swiftui` stays at 0.1.0.
- Run no release task (E17).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`ops: stackgen 1.31.0, vwf 19.45.1, site 1.1.46 — SwiftUI app stack`
