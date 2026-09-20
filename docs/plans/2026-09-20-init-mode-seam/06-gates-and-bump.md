# U6 — gates and bump: mise 1.4.0, hygiene 1.1.2, vwf 19.39.0, stackgen 1.23.0, site 1.1.35

- **Wave:** 3
- **Depends on:** U5
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
- **Read first:** every owned file, top to bottom, before editing; index.md's
  Consent block and decision 8.
- **Lazy-load:**
  `.claude/skills/plugin-authoring/references/structure.md:35-48`.

## Ruling

Decision 8 — Pack bumps: "mise `1.3.0` → `1.4.0` (a new marked position),
hygiene `1.1.1` → `1.1.2` (table rows); pins and inventory in U6, one commit."

The Consent block, verbatim:

- "Release vwf publicly — minor — `19.38.0` → `19.39.0`, a hand edit of
  `plugins/vwf/.claude-plugin/plugin.json` then
  `mise run p:plugins:marketplace`; no release step"
- "Release stackgen publicly — minor — `1.22.0` → `1.23.0`, a hand edit of
  `plugins/stackgen/.claude-plugin/plugin.json` then
  `mise run p:plugins:marketplace`; no release step"
- "Release site publicly — patch — `1.1.34` → `1.1.35` via
  `mise run p:site:version`; no release step"
- "Release installer publicly — none — untouched"

No target lands on a component equal to 13 or 17.

## Edits

1. **`site/package.json`** — `mise run p:site:version` bare, first (it refuses a
   dirty tree), reaching `1.1.35`.
2. **`mise/pack.yaml:6`** `1.3.0` → `1.4.0`; **`repo-hygiene/pack.yaml:5`**
   `1.1.1` → `1.1.2`.
3. **`bundles/mise.md:7`** → `@1.4.0`; **`bundles/repo-hygiene.md:7`** →
   `@1.1.2`.
4. `mise run p:plugins:inventory` → `inventory.md` carries both.
5. **`plugins/vwf/.claude-plugin/plugin.json`** `19.38.0` → `19.39.0`;
   **`plugins/stackgen/.claude-plugin/plugin.json`** `1.22.0` → `1.23.0`.
6. `mise run p:plugins:marketplace` → the manifest pins `vwf-v19.39.0` and
   `stackgen-v1.23.0`.

## Verification

- The full wave gate:

      mise run p:plugins:marketplace -- --check
      mise run p:plugins:inventory -- --check
      mise run p:plugins:check
      mise run code:precommit
      mise run p:site:check

- `git diff --stat` shows exactly the nine owned files (plus the site lockfile
  if `p:site:version` touches it — report it as `CHANGED:`).

## Guardrails

- No edit outside the owned files; both bumps, both pins and the inventory in
  the tree together.
- A version is plain `X.Y.Z`.
- `p:site:version` first.
- Delete with `rm`, never `git rm`.

## Commit

`ops: vwf 19.39.0, stackgen 1.23.0, site 1.1.35 — init mode seam` — written by
the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
