# U10 — /vwf:init's stack read: an Xcode project is swift

- **Wave:** 3
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/init/SKILL.md:320-350` (the manifest table
  and the paragraph around it) and index.md's *Amendment 2026-09-24*.

## Ruling

Quoted from index.md: **E24** — "`/vwf:init` maps a root `*.xcodeproj` directory
to swift in place of the `Project.swift` / `Tuist.swift` row."

## Edits

1. In the stack read's manifest table, replace the row `Project.swift` or
   `Tuist.swift` → swift with a row for a `*.xcodeproj` directory → swift. If
   the surrounding prose says the table lists files only, add the one clause
   that admits this directory.
2. Nothing else in the file changes.

## Verification

- `mise run p:plugins:check` green.
- `grep -n -i tuist plugins/vwf/skills/init/SKILL.md` is empty.

## Guardrails

- Touch nothing outside Owns — the site's copy of this table
  (`site/src/content/docs/plugins/vwf.md`) is U5's; report it as
  `DOCS FALSIFIED:`.
- Match the surrounding fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.

## Commit

Wave 3 lands as one commit (E27):
`refactor: swiftui stack — a committed Xcode project in place of Tuist`
