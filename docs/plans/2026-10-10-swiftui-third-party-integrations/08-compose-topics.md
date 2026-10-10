# U8 — Compose: native answers in the topic files

- **Wave:** 1
- **Depends on:** —
- **Owns:** in
  `plugins/stackgen/stacks/app-framework/compose/skills/compose/references/` —
  `ui-composition.md`, `platform-interop.md` (both existing)
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom, before editing.

## Ruling

> - Decision T6: Every SDK and platform behaviour is resolved through Context7
>   (`resolve-library-id` then `query-docs`) before it is written, never from
>   training knowledge. A claim Context7 cannot confirm is cut.
> - Decision T13: Short additions to existing topic files, no new integration
>   file. Localization: a section in each pack's `ui-composition.md` (string
>   resources and per-app language on Android). Share sheet, splash or launch
>   screen, keep-screen-on: each pack's `platform-interop.md`.

## Edits

Each addition is short — a paragraph or a few bullets in the file's existing
voice — and names the native API; no API listing.

1. **`ui-composition.md`** — a "Localization" section: string resources and
   plurals, per-app language preferences, locale-aware formatting, previews per
   locale, right-to-left layout.
2. **`platform-interop.md`** — short entries: the share sheet through an
   `ACTION_SEND` chooser; the SplashScreen API (no custom splash activity held
   on a timer); keep-screen-on through the window flag or the view attribute,
   scoped to the screen that needs it.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` and
  `MISE_ENV=dev mise run code:precommit` are green.
- Both files carry their additions; no existing passage is removed.
- A grep of the two files for `plugins/`, `CLAUDE_PLUGIN_ROOT` and `stackgen/`
  finds nothing (rule 13).

## Guardrails

- Touch nothing outside the two files.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand. Keep
  each code span on one line; never end a table cell in a bare asterisk.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: compose pack — native answers for localization and sharing`
