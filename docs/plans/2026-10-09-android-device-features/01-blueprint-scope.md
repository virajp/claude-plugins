# U1 — Blueprint scope values for Android device families

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/templates/flow-platform.md`,
  `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`,
  `plugins/vwf/agents/blueprint-reviewer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing. Read them as
  folder 1 left them: the `features:` entry shape and the `ios` scope are
  already there.
- **Lazy-load:** `plugins/vwf/assets/standard-flows.md` lines 153-167 — only to
  confirm the mobile row covers Android.

## Ruling

From index.md, decisions 1, 4 and 5:

- Decision 1 — `android:samsung` and `android:oneplus` are the two Android scope
  values, defined in the mobile doctrine. Rejected: any vendor string.
- Decision 4 — `fallback` is required on every entry. Inherited from folder 1.
- Decision 5 — the reviewer accepts only the values the platform doctrine names
  for the platform. Rejected: accepting any `android:` string.

## Edits

1. **`plugins/vwf/assets/templates/flow-platform.md`** — in the `scope`
   description, list the values per platform: `ios` on the iOS side, and
   `android:samsung` and `android:oneplus` on `mobile`. State that a vendor
   value is a label only, and that the feature itself is detected by a
   capability check in the stack.
2. **`plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`** — in
   the "OS-specific features" section that folder 1 added, add the two Android
   values to the list of accepted `scope` values for `mobile`, and say that a
   value outside the platform's list is a gap.
3. **`plugins/vwf/agents/blueprint-reviewer.md`** — in the feature-entry check
   that folder 1 added, state that a `scope` on `mobile` must be one of `ios`,
   `android:samsung` or `android:oneplus`. Any other value is a gap. Keep the
   checklist numbering and the NO GAPS return format unchanged.

## Verification

- `mise run p:plugins:check` — green.
- `grep -n 'android:samsung' plugins/vwf/assets/templates/flow-platform.md plugins/vwf/skills/blueprint-authoring/references/flow-contract.md plugins/vwf/agents/blueprint-reviewer.md`
  — one match in each file.
- `grep -n 'android:' plugins/vwf/agents/blueprint-reviewer.md` — the gap rule
  for values outside the list is present.

## Guardrails

- Do not change `standard-flows.md`. The form-factor table and the
  no-vendor-token rule stay as they are.
- Do not add a vendor token to `registry.yaml`.
- Do not add a value other than the two named.
- Delete with `rm`, never `git rm`.
- Edit with Edit or Write. Never `cat >`.

## Commit

`feat: add Android device-family scope values to the blueprint`
