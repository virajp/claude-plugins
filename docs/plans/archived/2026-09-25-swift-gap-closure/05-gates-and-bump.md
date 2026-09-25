# U5 — Gates and bump: pack versions only where unbumped, generators, the full gate

- **Wave:** 3
- **Depends on:** U4
- **Owns:** `plugins/stackgen/stacks/package-manager/swiftpm/pack.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/swift-format/pack.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/swiftlint/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`,
  `plugins/stackgen/stacks/bundles/*.md`,
  `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Facts (Versions).

## Ruling

> **A7** — Ride the unreleased bumps: no stackgen, vwf or site bump. A changed
> pack is patch-bumped only if its `pack.yaml` version is unchanged since
> `stackgen-v1.31.0`, with every bundle pin that names it. No release step.
> Rejected: bump again; a `/release` step as `ask`.

## Edits

1. For each of swiftpm, swift-format, swiftlint and swiftui: find whether the
   branch changed any file in that pack
   (`git diff develop...HEAD --stat -- <pack dir>`, excluding `pack.yaml`). For
   each changed pack, compare its `pack.yaml` `version:` with the one at the tag
   (`git show stackgen-v1.31.0:<pack dir>/pack.yaml`). Equal → patch-bump it
   (skipping a 13 or 17 component) and update every `<type>/<slug>@<version>`
   pin that names it in `plugins/stackgen/stacks/bundles/*.md`. Already
   different → leave it.
2. Do **not** touch `plugins/stackgen/.claude-plugin/plugin.json`,
   `plugins/vwf/.claude-plugin/plugin.json` or `site/package.json`.
3. Run `mise run p:plugins:inventory` and `mise run p:plugins:marketplace`.
4. Run every Wave gate line in index.md; all must pass.

## Verification

- All nine Wave gate lines pass, both `--check` freshness lines included.
- `git diff develop...HEAD -- plugins/stackgen/.claude-plugin/plugin.json plugins/vwf/.claude-plugin/plugin.json site/package.json`
  is empty.
- No version component is 13 or 17.

## Guardrails

- Never tag, release or push.
- Write with Write/Edit, never heredocs. Delete with `rm`, never `git rm`.

## Commit

`ops: swift gap closure — pack versions and generated manifests`
