# U4 — Gates and bump

- **Wave:** 3
- **Depends on:** U3
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

Quoted from index.md's Consent block: "Release vwf publicly — minor — 19.44.0 →
19.45.0"; "Release stackgen publicly — minor — 1.28.0 → 1.29.0"; "Release site
publicly — patch — 1.1.41 → 1.1.42, `mise run p:site:version` (bare, no
positional, on a clean tree)"; "Release installer publicly — none"; and "The
three touched existing packs move a patch each — `toolchain-gate/dprint` 1.1.0 →
1.1.1, `toolchain-gate/pre-commit` 1.1.4 → 1.1.5, `repo-hygiene/repo-hygiene`
1.2.0 → 1.2.1 — with their bundle pins." And **E17** — "No release step."

## Edits

1. **Site first, on a clean tree** — `mise run p:site:version`, bare. Record the
   version reached if it skips past 13 or 17.
2. **vwf** and **stackgen** manifests by hand. If the tree reads a version other
   than the one this file expects, bump what the tree says by the same level and
   record it.
3. **The three packs** and their pins — `dprint` and `pre-commit` in
   `bundles/repo-gates.md`, `repo-hygiene` in `bundles/repo-hygiene.md`; each
   version and its pin together.
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

`ops: vwf 19.45.0, stackgen 1.29.0, site 1.1.42 — Swift stack mechanism`
