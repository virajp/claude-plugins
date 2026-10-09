# U4 — Gates: Compose pack bump, pins, generated files

- **Wave:** 3
- **Depends on:** U2, U3
- **Owns:** `plugins/stackgen/stacks/app-framework/compose/pack.yaml`,
  `plugins/stackgen/stacks/bundles/kotlin-compose.md`,
  `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** none.

## Ruling

From index.md, decision 7 and the Gates unit contract:

- Decision 7 — the Compose pack bumps MINOR from the version it carries when
  this unit runs, and every pin and the generated inventory follow. Rejected:
  PATCH.
- Only this unit regenerates the generated files and bumps the pack. No plugin
  version is bumped; the release is a later hand step.

## Edits

1. **`plugins/stackgen/stacks/app-framework/compose/pack.yaml`** — read the
   `version:` line and bump it to the next MINOR.
2. **Every pin of the Compose pack** — find each with
   `grep -rn 'app-framework/compose@' plugins/`. Change each to the new version.
   The known pin is in `plugins/stackgen/stacks/bundles/kotlin-compose.md`.
3. **Regenerate the inventory** — run `mise run p:plugins:inventory`. Do not
   hand-edit `plugins/stackgen/stacks/inventory.md`.
4. **Regenerate the marketplace manifest** — run
   `mise run p:plugins:marketplace`. Do not hand-edit
   `.claude-plugin/marketplace.json`.
5. **Run the full gate** — the wave gate lines in index.md, plus the inventory
   check.

## Verification

- `grep -rn 'app-framework/compose@' plugins/` — every match names the new
  version.
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

`feat: bump the Compose pack for device-family features`
