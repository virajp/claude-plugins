# U6 — Gates and bump

- **Wave:** 3
- **Depends on:** U5
- **Owns:** `site/package.json`, `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/stackgen/stacks/design-tool/claude-code/pack.yaml`,
  `plugins/stackgen/stacks/design-tool/claude-design/pack.yaml`,
  `plugins/stackgen/stacks/bundles/claude-code.md`,
  `plugins/stackgen/stacks/bundles/claude-design.md`,
  `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Wave gate.

## Ruling

Quoted from index.md's Consent block:

- "Release vwf publicly — minor — 19.43.1 → 19.44.0, by hand in
  `plugins/vwf/.claude-plugin/plugin.json`"
- "Release stackgen publicly — minor — 1.27.0 → 1.28.0, by hand in
  `plugins/stackgen/.claude-plugin/plugin.json`"
- "Release site publicly — patch — 1.1.40 → 1.1.41, `mise run p:site:version`
  (bare, no positional, on a clean tree)"
- "Release installer publicly — none"

And **D12** — "Bumps land in-tree; no release step. The public tags ship with
plan 2."

## Edits

1. **Site first, on a clean tree.** `mise run p:site:version` — bare; it takes
   no positional and refuses a dirty tree, so run it before any other edit in
   this unit. It writes `site/package.json` to 1.1.41. If it reports a skip past
   13 or 17, record the version it reached.
2. **vwf** — `plugins/vwf/.claude-plugin/plugin.json` `version` 19.43.1 →
   19.44.0.
3. **stackgen** — `plugins/stackgen/.claude-plugin/plugin.json` `version` 1.27.0
   → 1.28.0.
4. **The two design-tool packs U3 edited** — minor each:
   `design-tool/claude-code/pack.yaml` 0.2.0 → 0.3.0, and its pin in
   `bundles/claude-code.md:7` to `design-tool/claude-code@0.3.0`;
   `design-tool/claude-design/pack.yaml` 0.1.0 → 0.2.0, and its pin in
   `bundles/claude-design.md:6` to `design-tool/claude-design@0.2.0`. Each pack
   version and its pin move together, in this one commit.
5. **Generators** — `mise run p:plugins:inventory` then
   `mise run p:plugins:marketplace`.
6. **The full wave gate**, every line green.

## Verification

- Every line of index.md's Wave gate green, including both freshness checks.
- No version written anywhere carries a 13 or 17 component.

## Guardrails

- Touch nothing outside Owns. No pack other than the two design-tool packs moves
  its version — only touched packs move.
- Run no release task: `p:plugins:release`, `p:site:release` and `p:i:release`
  are out of this plan (D12).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`ops: vwf 19.44.0, stackgen 1.28.0, site 1.1.41 — watch, tv and spatial platforms`
