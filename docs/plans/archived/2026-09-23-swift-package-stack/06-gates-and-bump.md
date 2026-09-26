# U6 — Gates and bump

- **Wave:** 4
- **Depends on:** U5
- **Owns:** `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Wave gate.

## Ruling

Quoted from index.md's Consent block: "Release stackgen publicly — minor —
1.29.0 → 1.30.0"; "Release site publicly — patch — 1.1.42 → 1.1.43,
`mise run p:site:version` (bare, no positional, on a clean tree)"; "Release vwf
publicly — none"; "Release installer publicly — none". And **E17** — "No release
step."

## Edits

1. **Site first, on a clean tree** — `mise run p:site:version`, bare. Record the
   version reached if it skips past 13 or 17.
2. **stackgen** manifest by hand. If the tree reads a version other than 1.29.0,
   bump what it says by one minor and record it.
3. **Generators** — `mise run p:plugins:inventory`, then
   `mise run p:plugins:marketplace`.
4. **The full wave gate**, every line green.

## Verification

- Every Wave gate line green, both freshness checks included.
- No version carries a 13 or 17 component.

## Guardrails

- Touch nothing outside Owns; the four new packs stay at 0.1.0.
- Run no release task (E17).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`ops: stackgen 1.30.0, site 1.1.43 — Swift package stack`
