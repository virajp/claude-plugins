# U2 — SwiftUI: RevenueCat, image handling and WebRTC references

- **Wave:** 1
- **Depends on:** —
- **Owns:** in
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/integrations/`
  — `revenuecat.md`, `image-handling.md`, `webrtc.md` (all new)
- **Model:** opus
- **Kind:** edit
- **Read first:** the five existing files in the same directory, top to bottom,
  for shape; `plugins/stackgen/assets/kinds.md:566` and `:595-600` (topic 12).
- **Lazy-load:** the Flutter `revenuecat.md`, `image-handling.md` and
  `webrtc.md` in
  `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/integrations/`
  — for which topics to cover, never for shape or for facts.

## Ruling

> - Decision T1: Eleven SwiftUI files, among them `revenuecat.md`,
>   `image-handling.md` and `webrtc.md`.
> - Decision T2: SwiftUI `image-handling.md` wires Nuke (its SwiftUI `LazyImage`
>   and its pipeline: disk and memory cache, prefetch, downsampling).
> - Decision T3: SwiftUI `webrtc.md` has two sections, each with its own setup
>   order: the plain Google WebRTC xcframework through SwiftPM first (bring your
>   own signalling), then the LiveKit Swift SDK (an SFU client tied to a LiveKit
>   server).
> - Decision T4: Every new integration file takes the shape of its pack's
>   existing integration files: the pack's H1 form, the bold "Wiring,
>   configuration and anti-patterns only" lead naming the API surface left to
>   Context7, a framing paragraph, a "Setup order" section, the topic sections,
>   a "Per platform" section, an "Anti-patterns" section last. Prose, no URLs,
>   no API-surface listing.
> - Decision T5: The "Per platform" section covers iOS and iPadOS, macOS,
>   watchOS, tvOS, visionOS, CarPlay. It states only the support Context7
>   confirms; any other platform reads "not confirmed" rather than a guess.
> - Decision T6: Every SDK and platform behaviour is resolved through Context7
>   (`resolve-library-id` then `query-docs`) before it is written, never from
>   training knowledge. A claim Context7 cannot confirm is cut.
> - Decision T12 (this unit's part): `image-handling.md` gains a cropping
>   section (one library, chosen on Context7 evidence).
> - Decision T14 (this unit's part): each pack's cropping library is chosen on
>   Context7 evidence and named in the file.

## Edits

1. **`revenuecat.md`** — purchases-ios through SwiftPM, configuring at app
   start, the API key per platform, the relation to StoreKit 2 and the existing
   `storekit.md` (by file name), the StoreKit configuration file for local
   testing, the sandbox, the user-id identity flow at the wiring level.
2. **`image-handling.md`** — Nuke through SwiftPM (T2): one shared pipeline
   configured at app start, `LazyImage` in SwiftUI, prefetch for lists,
   downsampling for memory; then a **Cropping** section: compare the candidates
   on Context7 (for example TOCropViewController and Mantis) for SwiftUI fit,
   maintenance and platform reach, pick one, name it and why in one sentence,
   and give its wiring. Anti-patterns include an unbounded `AsyncImage` in a
   list and a pipeline per view.
3. **`webrtc.md`** — two top-level sections in this order, each with its own
   setup order (T3): the plain WebRTC xcframework through SwiftPM (camera and
   microphone usage strings, the audio session category, background audio and
   VoIP modes, CallKit, the signalling left to the product); then the LiveKit
   Swift SDK (the package, the server URL and token from the product's backend,
   the same capabilities, what the SDK wires for you).

## Verification

- `MISE_ENV=dev mise run p:plugins:check` and
  `MISE_ENV=dev mise run code:precommit` are green.
- The three files exist; none lists an API surface.
- A grep of the three files for `plugins/`, `CLAUDE_PLUGIN_ROOT` and `stackgen/`
  finds nothing (rule 13).

## Guardrails

- Touch nothing outside the three files; the router is U9's.
- `plugins/**/*.md` is not dprint-formatted — match the existing files' fold
  width by hand; pad anti-pattern table separators like the existing files. Keep
  each code span on one line; never end a table cell in a bare asterisk.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: swiftui pack — revenuecat, image and webrtc references`
