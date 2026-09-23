# U10 — Gates and bump

- **Wave:** 4
- **Depends on:** U9
- **Owns:** `site/package.json`, `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/stackgen/stacks/toolchain-gate/dprint/pack.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/pack.yaml`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`,
  `plugins/stackgen/stacks/bundles/repo-gates.md`,
  `plugins/stackgen/stacks/bundles/repo-hygiene.md`,
  `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Wave gate.

## Ruling

Quoted from index.md's Consent block:

- "Release vwf publicly — minor — 19.44.0 → 19.45.0, by hand in
  `plugins/vwf/.claude-plugin/plugin.json`"
- "Release stackgen publicly — minor — 1.28.0 → 1.29.0, by hand in
  `plugins/stackgen/.claude-plugin/plugin.json`"
- "Release site publicly — patch — 1.1.41 → 1.1.42, `mise run p:site:version`
  (bare, no positional, on a clean tree)"
- "Release installer publicly — none"
- "The three touched existing packs move a patch each (`toolchain-gate/dprint`
  1.1.0 → 1.1.1, `toolchain-gate/pre-commit` 1.1.4 → 1.1.5,
  `repo-hygiene/repo-hygiene` 1.2.0 → 1.2.1) with their bundle pins."

And **E17** — "No release step; both plans land unreleased."

## Edits

1. **Site first, on a clean tree.** `mise run p:site:version` — bare; it takes
   no positional and refuses a dirty tree, so run it before any other edit in
   this unit. If it reports a skip past 13 or 17, record the version reached.
2. **vwf** 19.44.0 → 19.45.0 and **stackgen** 1.28.0 → 1.29.0, by hand in each
   manifest. If plan 1 landed different versions, bump from what the tree says
   by the same level and record it.
3. **The three touched packs** — `toolchain-gate/dprint` 1.1.0 → 1.1.1 with its
   pin in `bundles/repo-gates.md`; `toolchain-gate/pre-commit` 1.1.4 → 1.1.5
   with its pin in `bundles/repo-gates.md`; `repo-hygiene/repo-hygiene` 1.2.0 →
   1.2.1 with its pin in `bundles/repo-hygiene.md`. Each version and its pin
   move together.
4. **Generators** — `mise run p:plugins:inventory` then
   `mise run p:plugins:marketplace`.
5. **The full wave gate**, every line green.

## Verification

- Every line of index.md's Wave gate green, including both freshness checks.
- No version written anywhere carries a 13 or 17 component.

## Guardrails

- Touch nothing outside Owns. No other pack moves its version; the six new packs
  stay at 0.1.0.
- Run no release task (E17).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`ops: vwf 19.45.0, stackgen 1.29.0, site 1.1.42 — native Swift stack`
