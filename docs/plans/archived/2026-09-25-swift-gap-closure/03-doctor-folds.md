# U3 — doctor: reflow the ragged lines in §9

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/doctor/SKILL.md:190-260`.

## Ruling

> Closes the mechanism plan's contested gap: `doctor/SKILL.md` keeps ragged
> lines where text was inserted into §9's blocking and degraded lists without
> reflowing. Current lines: `:218` (45 chars), `:242` (~98), `:246` (36).

## Edits

1. **`plugins/vwf/skills/doctor/SKILL.md`** — reflow the list items holding
   `:218`, `:242` and `:246` (and any other line in §9 that stops short or runs
   past the ~80-column fold for no reason) to the surrounding fold width. Words
   unchanged — a reflow only. Keep code spans on one line; list-item
   continuation indentation as the neighbours have it.

## Verification

- `mise run p:plugins:check` passes.
- `git diff --word-diff=porcelain -- plugins/vwf/skills/doctor/SKILL.md` shows
  no added or removed word, only line breaks.
- No line in §9 is over 80 columns except one holding an unbreakable code span.

## Guardrails

- A reflow only: no wording change.
- `plugins/**/*.md` is not dprint-formatted: fold by hand.
- Delete with `rm`, never `git rm`.

## Commit

`docs: doctor — reflow §9's ragged lines`
