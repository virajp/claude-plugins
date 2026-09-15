# U4 — gates and bump

- **Wave:** 4
- **Depends on:** U3
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json` (regenerated)
- **Model:** opus
- **Read first:** the consent block in `index.md`; the two version files.
- **Lazy-load:** `.claude/skills/release/SKILL.md` (what the next `/release`
  will read); `.config/mise/tasks/_scripts/local` (the two 13/17 guard functions
  the version tasks call).

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
   the clean tree the orchestrator hands you; it bumps the patch component and
   skips past a 13 or 17 on its own. Read the version it printed.
2. **`plugins/stackgen/.claude-plugin/plugin.json`** — edit `version` to the
   next minor above the value the file holds now: `X.Y.Z` becomes `X.(Y+1).0`,
   and if `Y+1` is 13 or 17 it becomes `X.(Y+2).0`. Plain semver, no build
   metadata. Do not touch `plugins/vwf/.claude-plugin/plugin.json`.
3. **`.claude-plugin/marketplace.json`** — run `mise run p:plugins:marketplace`
   and take the result; never edit by hand. The dev manifest under
   `.dev-marketplace/` is gitignored and regenerates with it; leave it be.

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
  shows the new minor with no 13 or 17 component; `p:plugins:check` rule 1 would
  refuse one.
- `git diff --stat -- plugins/vwf` is empty across the run's branch.
- `command grep -n 'capability-provider/notion' .claude-plugin/marketplace.json`
  is **empty** — the marketplace manifest pins plugins, not packs; a hit means
  something was hand-edited.

## Guardrails

- Do not touch any file outside the three owned — every doc is U3's, every pack
  file is U1's or U2's.
- Do not run `p:plugins:release`, `p:site:release`, `p:i:release`, or
  `p:plugins:local` — the first three are `ask` steps the orchestrator owns
  after the landing, the fourth is the orchestrator's `run` step.
- Do not bump vwf or the installer.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump stackgen (minor) and site (patch) — notion workspace pack` — written
by the orchestrator after the wave gate, not by the unit. Type `ops` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
