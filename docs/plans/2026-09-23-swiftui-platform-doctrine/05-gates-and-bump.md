# U5 — Gates and bump

- **Wave:** 4
- **Depends on:** U4
- **Owns:** `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`,
  `plugins/stackgen/stacks/bundles/swift-swiftui.md`,
  `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Wave gate.

## Ruling

Quoted from index.md's Consent block: "Release stackgen publicly — minor —
1.31.0 → 1.32.0"; "Release site publicly — patch — 1.1.44 → 1.1.45,
`mise run p:site:version` (bare, no positional, on a clean tree)"; "Release vwf
publicly — none"; "Release installer publicly — none"; and
"`app-framework/swiftui` moves 0.1.0 → 0.2.0 with its pin in
`bundles/swift-swiftui.md`." And **E17** — "No release step."

## Edits

1. **Site first, on a clean tree** — `mise run p:site:version`, bare. Record the
   version reached if it skips past 13 or 17.
2. **stackgen** manifest by hand. If the tree reads a version other than 1.31.0,
   bump what it says by one minor and record it.
3. **`app-framework/swiftui/pack.yaml`** 0.1.0 → 0.2.0, and its pin in
   `bundles/swift-swiftui.md` to `app-framework/swiftui@0.2.0`, together.
4. **Generators** — `mise run p:plugins:inventory`, then
   `mise run p:plugins:marketplace`.
5. **The full wave gate**, every line green.

## Verification

- Every Wave gate line green, both freshness checks included.
- No version carries a 13 or 17 component.

## Guardrails

- Touch nothing outside Owns; no other pack moves.
- Run no release task (E17).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`ops: stackgen 1.32.0, swiftui 0.2.0, site 1.1.45 — SwiftUI platform doctrine`
