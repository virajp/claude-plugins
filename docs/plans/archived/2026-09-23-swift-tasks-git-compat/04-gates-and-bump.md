# U4 — Gates and bump

- **Wave:** 4
- **Depends on:** U3
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `site/package.json`,
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Wave gate; the run log row of U3,
  for whether a site page changed.

## Ruling

Quoted from index.md's Consent block: "Release stackgen publicly — patch —
1.30.0 → 1.30.1, by hand in `plugins/stackgen/.claude-plugin/plugin.json`";
"Release site publicly — patch only if U3 edits a site page —
`mise run p:site:version` (bare, on a clean tree); else none"; "Release vwf
publicly — none"; "Release installer publicly — none". No public release step.

## Edits

1. **Site, only if U3 changed a page under `site/src/content/docs/`** (the
   orchestrator states which in the dispatch) — `mise run p:site:version`, bare,
   on a clean tree, first. Record the version reached.
2. **stackgen** manifest by hand to 1.30.1. If the tree reads a version other
   than 1.30.0, bump what it says by one patch and record it.
3. **Generators** — `mise run p:plugins:inventory`, then
   `mise run p:plugins:marketplace`.
4. **The full wave gate**, every line green.

## Verification

- Every Wave gate line green, both freshness checks included.
- No version carries a 13 or 17 component.

## Guardrails

- Touch nothing outside Owns.
- Run no release task.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.

## Commit

`ops: stackgen 1.30.1 — Swift tasks git compatibility` (add `, site <version>`
when step 1 ran)
