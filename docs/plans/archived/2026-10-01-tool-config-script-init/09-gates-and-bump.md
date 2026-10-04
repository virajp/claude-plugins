# I9 — Gates and bump

- **Wave:** 6
- **Depends on:** I8
- **Model:** opus
- **Kind:** edit
- **Owns:** `site/package.json`,
  `plugins/{stackgen,vwf}/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, the `version:` line of
  `plugins/stackgen/stacks/package-manager/swiftpm/pack.yaml` and its bundle
  pins, `plugins/stackgen/stacks/inventory.md`

## Ruling

Bump once per level since the last release (stackgen major, vwf minor, site
patch, swiftpm patch); expect none needed except possibly swiftpm. No release.

## Edits

1. Compare with the last `stackgen-v*`, `vwf-v*`, `site-v*` tags; bump only what
   is still at its released level (site first, `mise run p:site:version`).
2. `mise run p:plugins:inventory`, `mise run p:plugins:marketplace`.

## Verification

- The full wave gate — the run's final gate.

## Commit

`ops: bump for init's passes on the tool-config script`
