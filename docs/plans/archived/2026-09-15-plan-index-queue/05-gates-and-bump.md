# U5 — gates and bump

- **Wave:** 3
- **Depends on:** U4
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `site/package.json`
- **Model:** opus
- **Read first:** `index.md`'s Consent block; the three owned files.
- **Lazy-load:** `.config/mise/tasks/_scripts/local` (the 13/17 guard the
  version tasks call — read only).

## Ruling

The consent block: "Release `vwf` publicly — minor — `19.28.0` → `19.29.0`, by
editing `plugins/vwf/.claude-plugin/plugin.json`; tagged by the `/release` ask
step." "Release `site` publicly — patch — `1.1.22` → `1.1.23`, by
`mise run p:site:version` (bare — no positional, refuses a dirty tree, runs
first in the bump unit)." stackgen and installer: none.

## Edits

1. **`site/package.json`** — first, on a clean tree: `mise run p:site:version`
   (bare). It bumps the patch component and refuses a dirty tree, which is why
   it runs before the manifest edit. Confirm the result reads `1.1.23`.
2. **`plugins/vwf/.claude-plugin/plugin.json`** — `version` `19.28.0` →
   `19.29.0`. Neither component is 13 or 17.
3. **`.claude-plugin/marketplace.json`** — regenerate:
   `mise run p:plugins:marketplace`. Stage nothing.

## Verification

- `mise run p:plugins:marketplace -- --check` green.
- `mise run p:plugins:inventory -- --check` green.
- `mise run p:plugins:check` green.
- `mise run code:precommit` green.
- `mise run p:site:check` green.
- `command grep -n '"version"' plugins/vwf/.claude-plugin/plugin.json site/package.json`
  reads `19.29.0` and `1.1.23`.

## Guardrails

- Touch nothing outside the three owned files; the generator writes
  `.dev-marketplace/**` too, which is gitignored — leave it.
- Run `p:site:version` **before** editing the manifest — it refuses a dirty
  tree.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump vwf 19.29.0, site 1.1.23 — plan index queue` — written by the
orchestrator after the wave gate, not by the unit.
