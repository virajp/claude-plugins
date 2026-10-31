# U1 — Structured feature entry in the flow-platform template

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/templates/flow-platform.md`,
  `plugins/vwf/assets/standard-flows.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/templates/flow.md` — only if the
  frontmatter key style needs a check.

## Ruling

From index.md, decisions 1, 2, 3, 4 and 6, and the confirmed reversal:

- Decision 1 — `scope` is the OS name from the platform doctrine: `ios` now;
  `watchos`, `tvos`, `visionos`, `carplay`, `macos` later. Folder 2 adds
  `android:<vendor>`. Rejected: free text; a closed enum in `registry.yaml`.
- Decision 2 — a `features:` list in `flow-platform.md` frontmatter. Each entry
  has `name`, `scope` and `fallback`. Rejected: a separate features document.
- Decision 3 — additive. No `blueprint_format` bump. Rejected: bump the
  blueprint format.
- Decision 4 — `fallback` is required on every entry.
- Decision 6 — any form-factor platform may carry entries.
- Reversal, confirmed by the user — the prose-only rule in
  `flow-platform.md:123-137` and `standard-flows.md:190-196` becomes a
  structured entry. No vendor token is added.

## Edits

1. **`plugins/vwf/assets/templates/flow-platform.md`** — add a `features:` list
   to the frontmatter. Each entry carries three keys: `name` (the feature, in
   words), `scope` (one OS name from the platform doctrine, `ios` in this
   release), and `fallback` (what the other OS, or a device without the feature,
   shows). Add one short paragraph under the Platform deviations heading: the
   `features:` list is the structured record, and prose deviations stay for
   every other difference. Keep every existing frontmatter key unchanged.
2. **`plugins/vwf/assets/standard-flows.md`** — at lines 190-196, replace the
   sentence that keeps vendor differences as deviations in prose with this rule:
   an OS-specific feature inside one form-factor platform is declared in that
   platform's `features:` list, with a `scope` and a `fallback`. Keep the
   form-factors-not-vendors statement at lines 190-191 unchanged.

## Verification

- `mise run p:plugins:check` — green.
- `grep -n 'features:' plugins/vwf/assets/templates/flow-platform.md` — at least
  one match in the frontmatter.
- `sed -n '186,200p' plugins/vwf/assets/standard-flows.md` — the new rule
  present, and the form-factors-not-vendors statement intact.

## Guardrails

- Do not touch `plugins/vwf/skills/blueprint/`,
  `plugins/vwf/skills/blueprint-authoring/` or `plugins/vwf/agents/`. Those
  belong to U3.
- Do not add a vendor token to `plugins/vwf/assets/templates/registry.yaml`.
- Delete with `rm`, never `git rm`.
- Edit with Edit or Write. Never `cat >` (cat is aliased to bat).

## Commit

`feat: declare OS-specific features in the flow-platform template`
