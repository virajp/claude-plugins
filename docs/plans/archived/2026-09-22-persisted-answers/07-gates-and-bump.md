# U7 — gates and bump: vwf 19.43.0, stackgen 1.26.0, site 1.1.39

- **Wave:** 3
- **Depends on:** U6
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json` (regenerated)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file; index.md's Consent block.
- **Lazy-load:**
  `.claude/skills/plugin-authoring/references/structure.md:35-48`.

## Ruling

The Consent block, verbatim:

- "Release vwf publicly — minor — `19.42.0` → `19.43.0` …; no release step"
- "Release stackgen publicly — minor — `1.25.0` → `1.26.0` …; no release step"
- "Release site publicly — patch — `1.1.38` → `1.1.39` via
  `mise run p:site:version`; no release step"
- "Release installer publicly — none — untouched"

No named target lands on a component equal to 13 or 17, and no pack version is
bumped — **no file under `plugins/stackgen/stacks/` is touched by this plan**,
so no bundle pin moves and `inventory.md` is not regenerated.

## Edits

1. `mise run p:site:version` bare, first, → `1.1.39`. The task refuses a dirty
   tree; when the orchestrator's plan-folder edits make it refuse, make the one
   line's edit by hand in `site/package.json` — the task's only write — and say
   so in `DECIDED:`.
2. `plugins/vwf/.claude-plugin/plugin.json` → `19.43.0`;
   `plugins/stackgen/.claude-plugin/plugin.json` → `1.26.0`.
3. `mise run p:plugins:marketplace`.

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
  `p:site:version` touches it — report it as `CHANGED:`).

## Guardrails

- No edit outside the owned files; no pack, no bundle pin, no inventory.
- A version is plain `X.Y.Z`; never 13 or 17 as a component.
- `p:site:version` first.
- Delete with `rm`, never `git rm`.

## Commit

`ops: vwf 19.43.0, stackgen 1.26.0, site 1.1.39 — persisted answers` — written
by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
