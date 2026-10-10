# U2 — Compose pack: device-family features behind a capability check

- **Wave:** 1
- **Depends on:** — (the Compose pack exists after the form-factors plan lands;
  this plan requires that plan)
- **Owns:** `plugins/stackgen/stacks/app-framework/compose/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing. Find the
  `mobile` platform doctrine file under `compose/` and read its Out of scope or
  device-features text, if any, before editing.
- **Lazy-load:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/ios-ipados.md`
  — only to match the rule's shape to the iOS rule folder 1 wrote. Do not copy
  any iOS content.

## Ruling

From index.md, decisions 2, 3 and 4:

- Decision 2 — detection is a capability check. The vendor name is a label only.
  Rejected: a manufacturer check (`Build.MANUFACTURER`).
- Decision 3 — no worked case. No stable public API was verified for either
  vendor. The pack ships the rule only, and a case waits for verifiable
  documentation. Rejected: a Samsung case from the unverified Galaxy Edge SDK.
- Decision 4 — the fallback is required on every entry.

## Edits

1. **The `mobile` platform doctrine under `compose/`** — add a section headed
   "Device features inside mobile". State the rule in prose:
   - a flow's `features:` entry with `scope: android:samsung` or
     `scope: android:oneplus` is built behind a capability check;
   - the capability check is the platform's own feature test (for example
     `PackageManager.hasSystemFeature` where a feature flag is documented);
   - the vendor name is a label and never the test;
   - when the check fails, the code shows the entry's declared `fallback`;
   - the stack builds the fallback and never invents one.
2. Add one sentence to the section: no vendor worked case ships in this release,
   because no stable public API was verified for Samsung or OnePlus at plan
   time.
3. Do not write a Kotlin code example for a vendor API. The rule shows the shape
   of the check in prose only.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rn 'Device features inside mobile' plugins/stackgen/stacks/app-framework/compose/`
  — one match.
- `grep -rni 'Build.MANUFACTURER' plugins/stackgen/stacks/app-framework/compose/`
  — no match. The rule must not test the vendor name.

## Guardrails

- Do not change `pack.yaml`, the bundles or `inventory.md`. U4 owns them.
- Do not add a vendor worked case, a vendor API name or a manufacturer check.
- Do not touch the files of the other Android packs (`framework/android`, the
  Kotlin language pack).
- Delete with `rm`, never `git rm`.
- Edit with Edit or Write. Never `cat >`.

## Commit

`feat: build device-family features behind a capability check in the Compose pack`
