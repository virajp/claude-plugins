# U4 — gates and bump

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json` (regenerated)
- **Model:** opus
- **Read first:** the consent block in `index.md`; the two version files.
- **Lazy-load:** `.claude/skills/release/SKILL.md`;
  `.config/mise/tasks/_scripts/local` (the 13/17 guard functions).

## Ruling

Quoted from `index.md`'s consent block:

> Release vwf publicly — patch — `plugins/vwf/.claude-plugin/plugin.json`, the
> next patch above the value the tree holds when U4 runs, never a 13 or 17
> component; by editing the `version` field.

> Release site publicly — patch — `mise run p:site:version` (bare; patch is its
> default; it refuses a dirty tree, so U4 runs it first).

> Release stackgen publicly — none — untouched.

> Release installer publicly — none — untouched.

## Edits

1. **`site/package.json`** — run `mise run p:site:version` (bare) **first**, on
   the clean tree the orchestrator hands you. Read the version it printed.
2. **`plugins/vwf/.claude-plugin/plugin.json`** — edit `version` to the next
   patch above the value the file holds now: `X.Y.Z` becomes `X.Y.(Z+1)`, and if
   `Z+1` is 13 or 17 it becomes `X.Y.(Z+2)`. Plain semver, no build metadata.
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

- `command grep -n '"version"' plugins/vwf/.claude-plugin/plugin.json` shows one
  new patch with no 13 or 17 component.
- `command grep -n '"version"' plugins/stackgen/.claude-plugin/plugin.json` is
  unchanged from the tree the run started on.

## Guardrails

- Do not touch any file outside the three owned.
- Do not bump stackgen or the installer.
- Do not run `p:plugins:release`, `p:site:release`, `p:i:release`, or
  `p:plugins:local` — the orchestrator's, after the landing.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump vwf and site (patch) — execute engine deadlock` — written by the
orchestrator after the wave gate, not by the unit. Type `ops` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
