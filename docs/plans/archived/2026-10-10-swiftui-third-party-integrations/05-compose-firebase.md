# U5 — Compose: six Firebase integration references

- **Wave:** 1
- **Depends on:** —
- **Owns:** in
  `plugins/stackgen/stacks/app-framework/compose/skills/compose/references/integrations/`
  — `firebase-analytics.md`, `firebase-app-check.md`, `firebase-auth.md`,
  `firebase-crashlytics.md`, `firebase-messaging.md`, `firebase-storage.md` (all
  new)
- **Model:** opus
- **Kind:** edit
- **Read first:** the seven existing files in the same directory, top to bottom,
  for shape; `plugins/stackgen/assets/kinds.md:566` and `:595-600` (topic 12).
- **Lazy-load:** the six Flutter Firebase files in
  `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/integrations/`
  — for which topics to cover, never for shape or for facts.

## Ruling

> - Decision T4: Every new integration file takes the shape of its pack's
>   existing integration files: the pack's H1 form, the bold "Wiring,
>   configuration and anti-patterns only" lead naming the API surface left to
>   Context7, a framing paragraph, a "Setup order" section, the topic sections,
>   a "Per platform" section, an "Anti-patterns" section last. Prose, no URLs,
>   no API-surface listing.
> - Decision T5: The "Per platform" section covers phone and tablet, Wear OS,
>   Android TV, Android Auto. It states only the support Context7 confirms; any
>   other platform reads "not confirmed" rather than a guess.
> - Decision T6: Every SDK and platform behaviour is resolved through Context7
>   (`resolve-library-id` then `query-docs`) before it is written, never from
>   training knowledge. A claim Context7 cannot confirm is cut.
> - Decision T11 (this unit's part): `firebase-analytics.md`,
>   `firebase-app-check.md` (Play Integrity), `firebase-auth.md` (with the Apple
>   provider), `firebase-crashlytics.md`, `firebase-messaging.md` (FCM and
>   notification channels), `firebase-storage.md`.

## Edits

Resolve the Firebase Android SDK (the BoM) and Play Integrity through Context7
first. The H1 form is "Jetpack Compose — <topic>". Each file covers setup order,
Gradle and manifest entries, permissions, emulator wiring — no API surface.

1. **`firebase-analytics.md`** — the Google Services Gradle plugin and
   `google-services.json` placement, the BoM in the version catalog,
   initialization, consent mode, the DebugView.
2. **`firebase-app-check.md`** — the Play Integrity provider, the debug provider
   for the emulator and CI, the order against initialization.
3. **`firebase-auth.md`** — the Auth emulator, the SHA fingerprints in the
   console, the Apple provider through the web flow; Google sign-in is
   `credential-manager.md` (name it by file name only).
4. **`firebase-crashlytics.md`** — the Crashlytics Gradle plugin, mapping-file
   upload with R8, NDK symbols if native code ships, the debug opt-out.
5. **`firebase-messaging.md`** — FCM: the service in the manifest, the
   notification permission on Android 13 and later, notification channels
   created at startup, the token flow, data versus notification messages.
6. **`firebase-storage.md`** — the bucket config, the Storage emulator, App
   Check enforcement, long uploads through WorkManager (name `workmanager.md` by
   file name).

## Verification

- `MISE_ENV=dev mise run p:plugins:check` and
  `MISE_ENV=dev mise run code:precommit` are green.
- The six files exist; none lists an API surface.
- A grep of the six files for `plugins/`, `CLAUDE_PLUGIN_ROOT` and `stackgen/`
  finds nothing (rule 13).

## Guardrails

- Touch nothing outside the six files; the router is U10's.
- `plugins/**/*.md` is not dprint-formatted — match the existing files' fold
  width by hand; pad anti-pattern table separators like the existing files. Keep
  each code span on one line; never end a table cell in a bare asterisk.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: compose pack — firebase integration references`
