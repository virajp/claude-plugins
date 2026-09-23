# U4 — gates and bump: vwf 19.43.2, site 1.1.41

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json` (the `version` only),
  `site/package.json`, `.claude-plugin/marketplace.json` (regenerated)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file; index.md's Consent block.
- **Lazy-load:**
  `.claude/skills/plugin-authoring/references/structure.md:35-48`.

## Ruling

The Consent block, verbatim:

- "Release vwf publicly — patch — `19.43.1` → `19.43.2`, a hand edit of
  `plugins/vwf/.claude-plugin/plugin.json` then
  `mise run p:plugins:marketplace`; no release step"
- "Release site publicly — patch — `1.1.40` → `1.1.41` via
  `mise run p:site:version`; no release step"
- "Release stackgen publicly — none — untouched"
- "Release installer publicly — none — untouched"

Neither target lands on a component equal to 13 or 17. No file under
`plugins/stackgen/` is touched, so no bundle pin moves and `inventory.md` is not
regenerated.

## Edits

1. `mise run p:site:version` bare, first, → `1.1.41`. The task refuses a dirty
   tree; when the orchestrator's plan-folder edits make it refuse, make the one
   line's edit by hand in `site/package.json` — the task's only write — and say
   so in `DECIDED:`.
2. `plugins/vwf/.claude-plugin/plugin.json` → `"version": "19.43.2"`; no other
   key.
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

- `jq -r .version plugins/vwf/.claude-plugin/plugin.json` prints `19.43.2`;
  `.claude-plugin/marketplace.json` pins `vwf-v19.43.2`.
- `git diff --stat` shows only the owned files (plus the site lockfile if
  `p:site:version` touches it — report it as `CHANGED:`).

## Guardrails

- No edit outside the owned files; in `plugin.json`, `version` only — the
  `mempalace` entry is U1's landed work.
- A version is plain `X.Y.Z`; never 13 or 17 as a component.
- `p:site:version` first.
- Delete with `rm`, never `git rm`.

## Commit

`ops: vwf 19.43.2, site 1.1.41 — mempalace over stdio` — written by the
orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
