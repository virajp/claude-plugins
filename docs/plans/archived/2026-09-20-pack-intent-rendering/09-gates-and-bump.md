# U9 — gates and bump: six pack bumps, vwf 19.42.0, stackgen 1.25.0, site 1.1.38

- **Wave:** 4
- **Depends on:** U8
- **Owns:** the `pack.yaml` version lines of `repo-hygiene/repo-hygiene`,
  `toolchain-gate/dprint`, `toolchain-gate/pre-commit`,
  `toolchain-gate/tsconfig`, `toolchain-gate/analysis-options`,
  `framework/astro`, `package-manager/pnpm`; every
  `plugins/stackgen/stacks/bundles/*.md` pin naming one of them;
  `plugins/stackgen/stacks/inventory.md` (regenerated);
  `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json` (regenerated)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file; index.md's Consent block and decision 9;
  `grep -rn "<pack>@" plugins/stackgen/stacks/bundles/` for each pack to find
  every pin.
- **Lazy-load:**
  `.claude/skills/plugin-authoring/references/structure.md:35-48`.

## Ruling

Decision 9 — Pack bumps: "hygiene `1.1.4` → **`1.2.0`** (conditionals, the
split), dprint `1.0.1` → **`1.1.0`** (per-language formatter), pre-commit
`1.1.3` → `1.1.4`, tsconfig, analysis-options, astro, pnpm each **minor** (a new
or widened fragment) from whatever their `pack.yaml` reads at run time; every
pin and the inventory in U9, one commit."

The Consent block, verbatim:

- "Release vwf publicly — minor — `19.41.0` → `19.42.0` …; no release step"
- "Release stackgen publicly — minor — `1.24.0` → `1.25.0` …; no release step"
- "Release site publicly — patch — `1.1.37` → `1.1.38` via
  `mise run p:site:version`; no release step"
- "Release installer publicly — none — untouched"

No named target lands on a component equal to 13 or 17; for the four packs
bumped "minor from what they read", step past 13 or 17 if the minor would land
there and say so in `DECIDED:`.

## Edits

1. `mise run p:site:version` bare, first, → `1.1.38`.
2. The seven `pack.yaml` version lines per decision 9.
3. Every bundle pin naming one of the seven (grep them all — astro appears in
   four `astro-*` bundles, pnpm in several, tsconfig and analysis-options in
   their stack bundles), updated to the new versions.
4. `mise run p:plugins:inventory`.
5. `plugins/vwf/.claude-plugin/plugin.json` → `19.42.0`;
   `plugins/stackgen/.claude-plugin/plugin.json` → `1.25.0`.
6. `mise run p:plugins:marketplace`.

## Verification

- The full wave gate:

      mise run p:plugins:marketplace -- --check
      mise run p:plugins:inventory -- --check
      mise run p:plugins:check
      mise run p:plugins:shellcheck
      mise run p:plugins:npm-normalize-test
      pnpm vitest run
      pnpm exec tsc --noEmit -p scripts
      mise run code:precommit
      mise run p:site:check

- `git diff --stat` shows only the owned files (plus the site lockfile if
  `p:site:version` touches it — report it as `CHANGED:`); list every bundle file
  touched in `CHANGED:`.

## Guardrails

- No edit outside the owned files; every bump, every pin and the inventory in
  the tree together — the generator refuses a pin without its pack.
- A version is plain `X.Y.Z`; never 13 or 17 as a component.
- `p:site:version` first.
- Delete with `rm`, never `git rm`.

## Commit

`ops: vwf 19.42.0, stackgen 1.25.0, site 1.1.38 — pack intent rendering` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
