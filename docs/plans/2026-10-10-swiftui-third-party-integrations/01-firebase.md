# U1 — Six Firebase integration references

- **Wave:** 1
- **Depends on:** —
- **Owns:** in
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/integrations/`
  — `firebase-analytics.md`, `firebase-app-check.md`, `firebase-auth.md`,
  `firebase-crashlytics.md`, `firebase-messaging.md`, `firebase-storage.md` (all
  new)
- **Model:** opus
- **Kind:** edit
- **Read first:** the five existing files in the same directory, top to bottom,
  for shape; `plugins/stackgen/assets/kinds.md:566` and `:595-600` (topic 12).
- **Lazy-load:** the six Flutter Firebase files in
  `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/integrations/`
  — for which topics to cover, never for shape or for facts.

## Ruling

> - Decision T1: Eleven files, among them `firebase-analytics.md`,
>   `firebase-app-check.md`, `firebase-auth.md`, `firebase-crashlytics.md`,
>   `firebase-messaging.md` and `firebase-storage.md`.
> - Decision T4: Every new file takes the shape of the five SwiftUI integration
>   files: an H1 that reads "SwiftUI — <topic> (<SDK or framework>)", the bold
>   "Wiring, platform configuration and anti-patterns only" lead naming the API
>   surface left to Context7, a framing paragraph, the "Setup order" section,
>   the topic sections, the "Per platform" section, the "Anti-patterns" section
>   last. Prose, no URLs, no API-surface listing.
> - Decision T5: The "Per platform" section covers iOS and iPadOS, macOS,
>   watchOS, tvOS, visionOS and CarPlay. It states only the support Context7
>   confirms; any other platform reads "not confirmed" rather than a guess.
> - Decision T6: Decision E18 holds: every SDK and Apple behaviour is resolved
>   through Context7 (`resolve-library-id` then `query-docs`) before it is
>   written, never from training knowledge. A claim Context7 cannot confirm is
>   cut.

## Edits

Write each file in the T4 shape. Resolve firebase-ios-sdk through Context7
first. Cover, per file, what topic 12 asks — setup order, manifest and
`Info.plist` entries, entitlements, capabilities, permissions, emulator wiring —
and no API surface.

1. **`firebase-analytics.md`** — adding the SDK through SwiftPM, the
   `GoogleService-Info.plist` placement, `FirebaseApp.configure()` at app start
   in a SwiftUI `App`, the method-swizzling and consent settings, the debug
   view, the App Tracking Transparency interplay.
2. **`firebase-app-check.md`** — the provider per platform (App Attest,
   DeviceCheck, the debug provider), the entitlement, the order against
   `configure()`, the debug token in the simulator and CI.
3. **`firebase-auth.md`** — the URL scheme and the reversed client id, Sign in
   with Apple and Google sign-in wiring at the Firebase side (link to the
   existing `sign-in-with-apple.md` by file name, not path), the Auth emulator,
   keychain sharing.
4. **`firebase-crashlytics.md`** — the dSYM upload build phase and its inputs,
   the debug-build opt-out, the Xcode Cloud or CI symbol upload.
5. **`firebase-messaging.md`** — the APNs key in the Firebase console, the push
   capability and background mode, swizzling on or off, the token flow against
   the existing `push-notifications.md` (by file name), the notification service
   extension.
6. **`firebase-storage.md`** — the bucket config, the Storage emulator, App
   Check enforcement, background upload with a `URLSession` background
   configuration.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` and
  `MISE_ENV=dev mise run code:precommit` are green.
- The six files exist; none lists an API surface (no method-by-method lists).
- A grep of the six files for `plugins/`, `CLAUDE_PLUGIN_ROOT` and `stackgen/`
  finds nothing (rule 13).

## Guardrails

- Touch nothing outside the six files. Do not edit the router `SKILL.md` — U4
  owns it.
- `plugins/**/*.md` is not dprint-formatted — match the existing files' fold
  width by hand; pad anti-pattern table separators like the existing files. Keep
  each code span on one line; never end a table cell in a bare asterisk.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: swiftui pack — firebase integration references`
