# U5 — Docs

- **Wave:** 3
- **Depends on:** R1
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `CLAUDE.md`, `readme.md`, `plugins/stackgen/stacks/readme.md`,
  `plugins/stackgen/assets/pack-format.md`, and any other human-facing passage
  `vwf:docs-sync` finds
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then each owned
  passage before editing it.

## Ruling

> **Goal.** stackgen offers a curated Android app stack: the packs
> `framework/android` (AGP, the Android SDK, Android Lint, the emulator) and
> `app-framework/compose` (Jetpack Compose doctrine, the `ux-gate`, the
> goldens), and two bundles — `kotlin-compose` (an app on `mobile` and `tablet`)
> and `android-library` (an AAR on `packages`).

> - Decision C1: The stack teaches Jetpack Compose only, with Material 3.
>   Views/XML is out of scope.
> - Decision C6: `kotlin-compose` (kind `app-framework`, platforms `mobile` and
>   `tablet`, no default) and `android-library` (kind `language-bundle`,
>   platform `packages`).

No reversal, so no decisions doc.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U4 returned.
2. `site/src/content/docs/plugins/stackgen.md` — add an Android Compose section
   beside the SwiftUI narrative; the kinds table and any bundle list gain the
   two bundles; the gitignore list gains Android.
3. `.claude/skills/stackgen-plugin/SKILL.md:168-176` — the app bundles named as
   unflagged gain `kotlin-compose`; `:246-250` gains Android.
4. `plugins/stackgen/stacks/readme.md` — `:74-110` (an app-framework wave line
   for Compose) and `:260-265` (the bundle count).
5. Do not change the "pick Flutter when it must ship on Android" text or the
   Flutter and SwiftUI bundles' trade-off prose: that is plan C's.

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit a pack, a bundle, `inventory.md` or the tool-config assets —
  earlier units own them; a falsified passage there is a `GAP:`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: android compose stack — the manual follows`
