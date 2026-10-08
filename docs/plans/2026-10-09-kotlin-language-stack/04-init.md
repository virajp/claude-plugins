# U4 — init reads a Gradle repo as kotlin

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/init/SKILL.md:330-370` (the stack read)
  before editing.

## Ruling

> - Decision K11: The vwf `init` manifest table maps `settings.gradle(.kts)` at
>   the root to `kotlin`. A root `build.gradle(.kts)` with no settings file also
>   maps to `kotlin`. A module build file under a root settings file is not a
>   project.

## Edits

1. **The stack-read table (`:346-360`)** — add a row: `settings.gradle.kts` or
   `settings.gradle` → `kotlin`, and `build.gradle.kts` or `build.gradle` →
   `kotlin` when no settings file sits beside it. Add the rule, in the style of
   the `.xcodeproj` "root only" rule: a directory with a settings file is one
   project, and the `build.gradle(.kts)` files of its modules below it are not
   read as further projects.
2. Any sentence in the file that lists the manifest table's languages gains
   `kotlin`.

## Verification

- `mise run p:plugins:check` and `mise run code:precommit` pass.
- `grep -n "settings.gradle" plugins/vwf/skills/init/SKILL.md` returns the new
  row.

## Guardrails

- Do not touch any file outside Owns. vwf names no technology outside this
  manifest table; add no other Kotlin mention.
- `plugins/**/*.md` is not formatted by dprint: match the table padding and fold
  width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (K13):
`feat: kotlin language stack — packs, bundle, init row, supersets`.
