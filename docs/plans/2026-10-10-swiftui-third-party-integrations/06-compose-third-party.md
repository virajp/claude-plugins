# U6 — Compose: billing, images, WebRTC, sign-in and updates

- **Wave:** 1
- **Depends on:** —
- **Owns:** in
  `plugins/stackgen/stacks/app-framework/compose/skills/compose/references/integrations/`
  — `revenuecat.md`, `image-handling.md`, `webrtc.md`, `credential-manager.md`,
  `in-app-updates.md` (all new)
- **Model:** opus
- **Kind:** edit
- **Read first:** the seven existing files in the same directory, top to bottom,
  for shape; `plugins/stackgen/assets/kinds.md:566` and `:595-600` (topic 12).
- **Lazy-load:** the Flutter `revenuecat.md`, `image-handling.md` and
  `webrtc.md` in
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
> - Decision T11 (this unit's part): `revenuecat.md` (with Google Play Billing),
>   `image-handling.md`, `webrtc.md`, `credential-manager.md` (Google sign-in),
>   `in-app-updates.md` (Play In-App Updates).
> - Decision T14: Compose `image-handling.md` wires Coil (Compose-first,
>   coroutines) with one shared `ImageLoader`; each pack's cropping library is
>   chosen on Context7 evidence and named in the file.
> - Decision T15: Compose `webrtc.md` has two sections like SwiftUI's: a
>   maintained prebuilt libwebrtc artifact chosen on Context7 evidence first,
>   then the LiveKit Android SDK.

## Edits

The H1 form is "Jetpack Compose — <topic>".

1. **`revenuecat.md`** — the RevenueCat Android SDK, configuring at app start,
   its relation to Google Play Billing (which it wraps), the Play Console
   products and license testers, the user-id identity flow at the wiring level.
2. **`image-handling.md`** (T14) — Coil: one shared `ImageLoader` with disk and
   memory cache, `AsyncImage` in Compose, sizing to avoid full-size decodes;
   then a **Cropping** section: compare the candidates on Context7 (for example
   uCrop and Android-Image-Cropper), pick one, name it and why in one sentence,
   give its wiring.
3. **`webrtc.md`** (T15) — two top-level sections, each with its own setup
   order: a maintained prebuilt libwebrtc artifact (camera and microphone
   permissions, audio routing, a foreground service for ongoing calls, the
   signalling left to the product); then the LiveKit Android SDK (the package,
   the server URL and token from the product's backend, what the SDK wires).
4. **`credential-manager.md`** — Credential Manager for Google sign-in (and
   passkeys where Context7 confirms them): the dependency, the web client id,
   the SHA fingerprints, handing the credential to Firebase Auth (name
   `firebase-auth.md` by file name).
5. **`in-app-updates.md`** — Play In-App Updates: flexible versus immediate
   updates, the staleness and priority signals, testing through internal app
   sharing; the server-side minimum version as the fallback.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` and
  `MISE_ENV=dev mise run code:precommit` are green.
- The five files exist; none lists an API surface.
- A grep of the five files for `plugins/`, `CLAUDE_PLUGIN_ROOT` and `stackgen/`
  finds nothing (rule 13).

## Guardrails

- Touch nothing outside the five files; the router is U10's.
- `plugins/**/*.md` is not dprint-formatted — match the existing files' fold
  width by hand; pad anti-pattern table separators like the existing files. Keep
  each code span on one line; never end a table cell in a bare asterisk.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: compose pack — billing, image, webrtc, sign-in and update references`
