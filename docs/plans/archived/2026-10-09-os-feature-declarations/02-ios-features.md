# U2 — iOS side: the availability rule and the Dynamic Island worked case

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/ios-ipados.md`,
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platform-interop.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/watchos.md`
  — only to confirm no edit is needed there.

## Ruling

From index.md, decisions 6 and 7:

- Decision 6 — any form-factor platform may carry entries. The stack rule covers
  iOS only in this plan. Rejected: `mobile` only.
- Decision 7 — iOS worked case: Dynamic Island inside `mobile`, built behind a
  `#available` guard with its declared fallback. The Out of scope paragraph at
  `ios-ipados.md:68-72` is replaced by the rule. Rejected: the rule only, with
  no worked case.

## Edits

1. **`ios-ipados.md`, lines 68-72** — replace the Out of scope paragraph on
   device- and OS-specific features with the rule: a flow's `features:` entry
   with `scope: ios` is built behind an availability check (`#available`) at the
   smallest scope that needs it, and the code shows the entry's declared
   `fallback` when the check fails. The stack builds the fallback; it never
   invents one.
2. **`ios-ipados.md`, a new section after the rule** — headed "Device features
   inside mobile". Give one worked case, the Dynamic Island: it is present on
   iPhone models with a Dynamic Island and absent on earlier iPhones. State the
   availability check and the fallback pattern in prose and in one short Swift
   example. Name the fallback as the declaring flow sets it; the example shows
   the pattern, not a product's answer.
3. **`platform-interop.md`, lines 52-59** — add one cross-reference sentence
   that points to the new rule in `ios-ipados.md`, so the availability pattern
   is named in one place per concern. Change no other line in this file.

## Verification

- `mise run p:plugins:check` — green.
- `grep -n 'Device features inside mobile' plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/ios-ipados.md`
  — one match.
- `grep -n 'Out of scope' plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/ios-ipados.md`
  — the device-feature paragraph no longer appears under that heading.

## Guardrails

- Do not change `pack.yaml`, the bundle, or `inventory.md`. U5 owns the version
  bump.
- Do not touch the other five SwiftUI platform files.
- Do not name a vendor token or add a `scope` value other than `ios`.
- Delete with `rm`, never `git rm`.
- Edit with Edit or Write. Never `cat >`.

## Commit

`feat: build OS-specific features behind an availability guard in the SwiftUI pack`
