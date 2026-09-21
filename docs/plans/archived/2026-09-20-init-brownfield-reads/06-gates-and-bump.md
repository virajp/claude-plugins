# U6 — gates and bump: three pack patches, vwf 19.40.0, stackgen 1.23.1, site 1.1.36

- **Wave:** 3
- **Depends on:** U5
- **Owns:** `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/pack.yaml`,
  `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`,
  `plugins/stackgen/stacks/bundles/repo-hygiene.md`,
  `plugins/stackgen/stacks/bundles/repo-gates.md`,
  `plugins/stackgen/stacks/bundles/mise.md`,
  `plugins/stackgen/stacks/inventory.md` (regenerated),
  `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json` (regenerated)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file; index.md's Consent block and decision 12.
- **Lazy-load:**
  `.claude/skills/plugin-authoring/references/structure.md:35-48`.

## Ruling

Decision 12 — Pack bumps: "hygiene `1.1.2` → `1.1.3`, pre-commit `1.1.2` →
`1.1.3`, mise `1.4.0` → `1.4.1` — prose and a comment; pins and inventory in U6,
one commit."

The Consent block, verbatim:

- "Release vwf publicly — minor — `19.39.0` → `19.40.0` …; no release step"
- "Release stackgen publicly — patch — `1.23.0` → `1.23.1` …; no release step"
- "Release site publicly — patch — `1.1.35` → `1.1.36` via
  `mise run p:site:version`; no release step"
- "Release installer publicly — none — untouched"

No target lands on a component equal to 13 or 17.

## Edits

1. `mise run p:site:version` bare, first (dirty-tree refusal), → `1.1.36`.
2. The three `pack.yaml` version lines: hygiene → `1.1.3`, pre-commit → `1.1.3`,
   mise → `1.4.1`.
3. The three pins: `bundles/repo-hygiene.md` → `@1.1.3`; `bundles/repo-gates.md`
   pre-commit → `@1.1.3`; `bundles/mise.md` → `@1.4.1`.
4. `mise run p:plugins:inventory`.
5. `plugins/vwf/.claude-plugin/plugin.json` `19.39.0` → `19.40.0`;
   `plugins/stackgen/.claude-plugin/plugin.json` `1.23.0` → `1.23.1`.
6. `mise run p:plugins:marketplace` → pins `vwf-v19.40.0`, `stackgen-v1.23.1`.

## Verification

- The full wave gate:

      mise run p:plugins:marketplace -- --check
      mise run p:plugins:inventory -- --check
      mise run p:plugins:check
      mise run code:precommit
      mise run p:site:check

- `git diff --stat` shows exactly the eleven owned files (plus the site lockfile
  if `p:site:version` touches it — report it as `CHANGED:`).

## Guardrails

- No edit outside the owned files; bumps, pins and inventory in the tree
  together.
- A version is plain `X.Y.Z`.
- `p:site:version` first.
- Delete with `rm`, never `git rm`.

## Commit

`ops: vwf 19.40.0, stackgen 1.23.1, site 1.1.36 — init brownfield reads` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
