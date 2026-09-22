# U7 — gates and bump: mise 1.5.0, hygiene 1.1.4, vwf 19.41.0, stackgen 1.24.0, site 1.1.37

- **Wave:** 4
- **Depends on:** U6
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`,
  `plugins/stackgen/stacks/bundles/mise.md`,
  `plugins/stackgen/stacks/bundles/repo-hygiene.md`,
  `plugins/stackgen/stacks/inventory.md` (regenerated),
  `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json` (regenerated)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file; index.md's Consent block and decision 8.
- **Lazy-load:**
  `.claude/skills/plugin-authoring/references/structure.md:35-48`.

## Ruling

Decision 8 — Pack bumps: "mise `1.4.1` → **`1.5.0`** (two marked positions
added, one retired), hygiene `1.1.3` → `1.1.4` (CONTRIBUTING); pins and
inventory in U7, one commit."

The Consent block, verbatim:

- "Release vwf publicly — minor — `19.40.0` → `19.41.0` …; no release step"
- "Release stackgen publicly — minor — `1.23.1` → `1.24.0` …; no release step"
- "Release site publicly — patch — `1.1.36` → `1.1.37` via
  `mise run p:site:version`; no release step"
- "Release installer publicly — none — untouched"

No target lands on a component equal to 13 or 17.

## Edits

1. `mise run p:site:version` bare, first, → `1.1.37`.
2. `mise/pack.yaml` → `1.5.0`; `repo-hygiene/pack.yaml` → `1.1.4`.
3. `bundles/mise.md` → `@1.5.0`; `bundles/repo-hygiene.md` → `@1.1.4`.
4. `mise run p:plugins:inventory`.
5. `plugins/vwf/.claude-plugin/plugin.json` → `19.41.0`;
   `plugins/stackgen/.claude-plugin/plugin.json` → `1.24.0`.
6. `mise run p:plugins:marketplace`.

## Verification

- The full wave gate:

      mise run p:plugins:marketplace -- --check
      mise run p:plugins:inventory -- --check
      mise run p:plugins:check
      mise run p:plugins:shellcheck
      mise run p:plugins:npm-normalize-test
      mise run code:precommit
      mise run p:site:check

- `git diff --stat` shows exactly the nine owned files (plus the site lockfile
  if `p:site:version` touches it — report it as `CHANGED:`).

## Guardrails

- No edit outside the owned files; bumps, pins and inventory together.
- A version is plain `X.Y.Z`.
- `p:site:version` first.
- Delete with `rm`, never `git rm`.

## Commit

`ops: vwf 19.41.0, stackgen 1.24.0, site 1.1.37 — branch model` — written by the
orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
