# U5 — Docs

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/vwf-plugin/**`, `CLAUDE.md`, `readme.md`,
  `plugins/stackgen/stacks/readme.md`,
  `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/pick-and-trade.md`,
  and any other human-facing passage `vwf:docs-sync` finds
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then each owned
  passage before editing it.

## Ruling

> **Goal.** The `kotlin-compose` bundle covers `mobile`, `tablet`, `watch`, `tv`
> and `auto`, and the Android packs document the other app and module types
> Android Studio builds. vwf setup detects Wear OS, Android TV and Android Auto.
> The docs say when to pick Kotlin Compose, Flutter or SwiftUI.

> - Decision F1: `spatial` (Android XR) is out of scope, and B57 finishes
>   without it.
> - Decision F6: The trade-off text names the Kotlin Compose stack.
> - Decision F7: setup detects Wear OS, Android TV and Android Auto from
>   `AndroidManifest.xml`.

No reversal, so no decisions doc.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U4 returned.
2. **`site/src/content/docs/how-to/operate/choosing-your-stack.md:46-66`** — the
   mobile choice becomes three-way: Kotlin Compose (Android native: phone,
   tablet, Wear OS, TV, Auto), SwiftUI (Apple native), Flutter (one codebase for
   both). Replace "pick Flutter when it must also ship on Android" (`:62-63`).
3. **`site/src/content/docs/plugins/stackgen.md`** — the Android Compose section
   lists the five platforms and the new references.
4. **`site/src/content/docs/plugins/vwf.md`** — where setup's platform detection
   is described, add the Android signals.
5. **`plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/pick-and-trade.md`**
   — if the file exists, name Kotlin Compose as the native Android alternative;
   if not, skip it.
6. **`plugins/stackgen/stacks/readme.md`** — a line for this wave.

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit a pack other than the Flutter `pick-and-trade.md` reference, a
  bundle, `inventory.md` or `plugins/vwf/skills/**` — earlier units own them; a
  falsified passage there is a `GAP:`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: android form factors — the manual follows`
