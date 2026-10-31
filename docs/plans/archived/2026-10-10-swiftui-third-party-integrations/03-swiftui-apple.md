# U3 — SwiftUI: maps, location and webview references

- **Wave:** 1
- **Depends on:** —
- **Owns:** in
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/integrations/`
  — `maps-and-location.md`, `webview.md` (both new)
- **Model:** opus
- **Kind:** edit
- **Read first:** the five existing files in the same directory, top to bottom,
  for shape; `plugins/stackgen/assets/kinds.md:566` and `:595-600` (topic 12).
- **Lazy-load:** the Flutter `maps-and-location.md` and `webview.md` in
  `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/integrations/`
  — for which topics to cover, never for shape or for facts.

## Ruling

> - Decision T1: Eleven SwiftUI files, among them `maps-and-location.md` (MapKit
>   and Core Location) and `webview.md` (`WKWebView`).
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

## Edits

1. **`maps-and-location.md`** — MapKit in SwiftUI and Core Location: the
   location usage strings (when in use, always), the background location mode,
   the precise and reduced-accuracy flow, the authorization order, the
   simulator's simulated locations, CarPlay's own rules where Context7 confirms
   them.
2. **`webview.md`** — `WKWebView` hosted in SwiftUI (and the native SwiftUI web
   view where Context7 confirms it, with its OS floor), App Transport Security,
   the shared data store, the JavaScript bridge at the wiring level, the
   inspectable flag for debugging, the platforms that have no web view.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` and
  `MISE_ENV=dev mise run code:precommit` are green.
- The two files exist; neither lists an API surface.
- A grep of the two files for `plugins/`, `CLAUDE_PLUGIN_ROOT` and `stackgen/`
  finds nothing (rule 13).

## Guardrails

- Touch nothing outside the two files; the router is U9's.
- `plugins/**/*.md` is not dprint-formatted — match the existing files' fold
  width by hand; pad anti-pattern table separators like the existing files. Keep
  each code span on one line; never end a table cell in a bare asterisk.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: swiftui pack — maps, location and webview references`
