# U5 — Gates: pack bump, pins, generated files

- **Wave:** 4
- **Depends on:** U2, U4
- **Owns:** `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`,
  `plugins/stackgen/stacks/bundles/swift-swiftui.md`,
  `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** none.

## Ruling

From index.md, decision 8 and the Gates unit contract:

- Decision 8 — the SwiftUI pack bumps MINOR: 0.5.1 becomes 0.6.0, and every pin
  and the generated inventory follow. Rejected: PATCH.
- Only this unit regenerates the generated files and bumps the pack. No plugin
  version is bumped; the release is a later hand step.

## Edits

1. **`plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`, line 5** —
   change `version: 0.5.1` to `version: 0.6.0`.
2. **Every pin of `app-framework/swiftui@0.5.1`** — find each one with
   `grep -rn 'app-framework/swiftui@0.5.1' plugins/`. Change each to `@0.6.0`.
   The known pin is `plugins/stackgen/stacks/bundles/swift-swiftui.md`, line 6.
3. **Regenerate the inventory** — run `mise run p:plugins:inventory`. Do not
   hand-edit `plugins/stackgen/stacks/inventory.md`.
4. **Regenerate the marketplace manifest** — run
   `mise run p:plugins:marketplace`. Do not hand-edit
   `.claude-plugin/marketplace.json`.
5. **Run the full gate** — the wave gate lines below, plus the inventory check.

## Verification

- `grep -rn 'app-framework/swiftui@0.5.1' plugins/` — no match.
- `mise run p:plugins:inventory -- --check` — green.
- `mise run p:plugins:marketplace -- --check` — green.
- `mise run p:plugins:check` — green.
- `mise run p:site:check` — green.

## Guardrails

- Do not change any file outside the Owns list.
- Do not bump a plugin version in any `plugin.json`.
- Do not hand-edit a generated file.
- Delete with `rm`, never `git rm`.
- Edit with Edit or Write. Never `cat >`.

## Commit

`feat: bump the SwiftUI pack to 0.6.0 for OS-specific features`
