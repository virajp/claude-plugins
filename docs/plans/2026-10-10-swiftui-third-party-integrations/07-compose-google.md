# U7 — Compose: maps, location and webview references

- **Wave:** 1
- **Depends on:** —
- **Owns:** in
  `plugins/stackgen/stacks/app-framework/compose/skills/compose/references/integrations/`
  — `maps-and-location.md`, `webview.md` (both new)
- **Model:** opus
- **Kind:** edit
- **Read first:** the seven existing files in the same directory, top to bottom,
  for shape; `plugins/stackgen/assets/kinds.md:566` and `:595-600` (topic 12).
- **Lazy-load:** the Flutter `maps-and-location.md` and `webview.md` in
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
> - Decision T11 (this unit's part): `maps-and-location.md` (Maps Compose and
>   the fused location provider) and `webview.md`.

## Edits

The H1 form is "Jetpack Compose — <topic>".

1. **`maps-and-location.md`** — Maps Compose and Play Services Location: the
   Maps API key kept out of source control, the manifest metadata, the location
   permissions (coarse, fine, background) and their request order, the fused
   location provider, the emulator's location controls.
2. **`webview.md`** — `WebView` hosted in Compose through `AndroidView`, the
   lifecycle and state saving, the internet permission and cleartext policy, the
   JavaScript bridge at the wiring level, remote debugging, the platforms with
   no WebView.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` and
  `MISE_ENV=dev mise run code:precommit` are green.
- The two files exist; neither lists an API surface.
- A grep of the two files for `plugins/`, `CLAUDE_PLUGIN_ROOT` and `stackgen/`
  finds nothing (rule 13).

## Guardrails

- Touch nothing outside the two files; the router is U10's.
- `plugins/**/*.md` is not dprint-formatted — match the existing files' fold
  width by hand; pad anti-pattern table separators like the existing files. Keep
  each code span on one line; never end a table cell in a bare asterisk.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: compose pack — maps, location and webview references`
