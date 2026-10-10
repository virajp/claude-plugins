# U4 — SwiftUI: native answers in the topic files

- **Wave:** 1
- **Depends on:** —
- **Owns:** in
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/` —
  `data-and-networking.md`, `ui-composition.md`, `platform-interop.md`,
  `state-management.md` (all existing)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.

## Ruling

> - Decision T6: Every SDK and platform behaviour is resolved through Context7
>   (`resolve-library-id` then `query-docs`) before it is written, never from
>   training knowledge. A claim Context7 cannot confirm is cut.
> - Decision T12 (this unit's part): `data-and-networking.md` gains an app
>   version gate section (a server-side minimum version plus an App Store link,
>   since iOS has no in-app update API).
> - Decision T13: Short additions to existing topic files, no new integration
>   file. Localization: a section in each pack's `ui-composition.md` (String
>   Catalogs on SwiftUI). Share sheet, splash or launch screen, keep-screen-on:
>   each pack's `platform-interop.md`. PhotosPicker and general permission usage
>   strings: SwiftUI `platform-interop.md`. `@AppStorage`: SwiftUI
>   `state-management.md`.

## Edits

Each addition is short — a paragraph or a few bullets in the file's existing
voice — and names the native API; no API listing.

1. **`data-and-networking.md`** — an "App version gate" section: the server
   publishes a minimum supported version, the app compares it at launch, and a
   blocking or soft prompt opens the App Store page; there is no in-app update
   API on Apple platforms.
2. **`ui-composition.md`** — a "Localization" section: String Catalogs, plural
   and device variants, locale-aware formatting through Foundation's format
   styles, previews per locale, right-to-left layout.
3. **`platform-interop.md`** — short entries: the share sheet through
   `ShareLink`; the launch screen (the plist launch screen, no custom splash
   view held on a timer); keep-screen-on through the idle timer, scoped to the
   screen that needs it; PhotosPicker for picking without full library access;
   the rule that every protected resource needs its usage-description string
   before the first request.
4. **`state-management.md`** — `@AppStorage` for small user settings, its limits
   (no secrets — Keychain; no large data), and its place beside the repo's state
   owner.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` and
  `MISE_ENV=dev mise run code:precommit` are green.
- Each of the four files carries its addition; no existing passage is removed.
- A grep of the four files for `plugins/`, `CLAUDE_PLUGIN_ROOT` and `stackgen/`
  finds nothing (rule 13).

## Guardrails

- Touch nothing outside the four files.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand. Keep
  each code span on one line; never end a table cell in a bare asterisk.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: swiftui pack — native answers for localization, sharing and settings`
