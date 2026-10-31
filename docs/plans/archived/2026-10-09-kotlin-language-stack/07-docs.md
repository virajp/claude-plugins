# U6 — Docs

- **Wave:** 3
- **Depends on:** R1
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/vwf-plugin/**`, `CLAUDE.md`, `readme.md`,
  `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/assets/pack-format.md`,
  and any other human-facing passage `vwf:docs-sync` finds
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then each owned
  passage before editing it.

## Ruling

> **Goal.** stackgen offers a curated Kotlin/JVM library stack —
> `language/kotlin`, `package-manager/gradle`, `toolchain-gate/ktlint`,
> `toolchain-gate/detekt` — and a `kotlin-library` bundle on the `packages`
> platform. vwf `init` detects a Gradle repo as `kotlin`.

> - Decision K2: The bundle covers only Kotlin/JVM libraries (JAR). The Android
>   library module (AAR) is in plan B. Kotlin Multiplatform is out of scope.
> - Decision K11: The vwf `init` manifest table maps `settings.gradle(.kts)` at
>   the root to `kotlin`.
> - Decision K12: The universal `.gitignore` gets a Gradle/Kotlin section.

No reversal, so no decisions doc.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U5 returned.
2. `site/src/content/docs/plugins/stackgen.md` — `:264` ("fourth language" → the
   count after Kotlin), `:293-335` (add a short Kotlin/JVM library section in
   the style of the Swift package passage), `:441-447` (kinds table if it lists
   bundles), `:743` (the gitignore language list gains Gradle and Kotlin).
3. `site/src/content/docs/plugins/vwf.md` — where `init`'s manifest table is
   described, add `settings.gradle(.kts)` → `kotlin`.
4. `.claude/skills/stackgen-plugin/SKILL.md:246-250` — the universal-superset
   language lists gain Gradle/Kotlin; any pack or bundle count.
5. `plugins/stackgen/stacks/readme.md` — `:55` (language-root count) and
   `:260-265` (curated-bundle count); add a line for this wave.
6. Do not change the "pick Flutter when it must ship on Android" text: Android
   is plan C's.

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit a pack, a bundle, `inventory.md`, `plugins/vwf/skills/**` or the
  tool-config assets — earlier units own them; a falsified passage there is a
  `GAP:`.
- `plugins/**/*.md` is not dprint-formatted; `CLAUDE.md` and `readme.md` are.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: kotlin language stack — the manual follows`
