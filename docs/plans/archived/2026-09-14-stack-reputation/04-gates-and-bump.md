# U4 — gates and bump

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json` (regenerated)
- **Model:** opus
- **Read first:** the consent block in `index.md`; the two version files.
- **Lazy-load:** `.claude/skills/release/SKILL.md`;
  `.config/mise/tasks/_scripts/local` (the two 13/17 guard functions).

## Ruling

Quoted from `index.md`'s consent block:

> Release stackgen publicly — minor —
> `plugins/stackgen/.claude-plugin/plugin.json`, the next minor above the value
> the tree holds when U4 runs, never a 13 or 17 component; by editing the
> `version` field.

> Release site publicly — patch — `mise run p:site:version` (bare; patch is its
> default; it refuses a dirty tree, so U4 runs it first).

> Release vwf publicly — none — untouched. Release installer publicly — none —
> untouched.

## Edits

1. **`site/package.json`** — run `mise run p:site:version` (bare) **first**, on
   the clean tree the orchestrator hands you. Read the version it printed.
2. **`plugins/stackgen/.claude-plugin/plugin.json`** — edit `version` to the
   next minor above the value the file holds now: `X.Y.Z` becomes `X.(Y+1).0`,
   and if `Y+1` is 13 or 17 it becomes `X.(Y+2).0`. Plain semver. Do not touch
   `plugins/vwf/.claude-plugin/plugin.json`.
3. **`.claude-plugin/marketplace.json`** — run `mise run p:plugins:marketplace`
   and take the result; never edit by hand.

## Verification

The full wave gate, every line green:

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

Plus:

- `command grep -n '"version"' plugins/stackgen/.claude-plugin/plugin.json`
  shows the new minor with no 13 or 17 component.
- `git diff --stat -- plugins/vwf` is empty across the run's branch.

## Guardrails

- Do not touch any file outside the three owned.
- Do not run `p:plugins:release`, `p:site:release`, `p:i:release`, or
  `p:plugins:local` — the orchestrator's, after the landing.
- Do not bump vwf or the installer.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump stackgen (minor) and site (patch) — stack reputation` — written by
the orchestrator after the wave gate, not by the unit. Type `ops` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
