# U4 — Sources for the OS device frame sizes

- **Wave:** 2
- **Depends on:** U2
- **Owns:** `plugins/vwf/assets/templates/canvas-claude.md`,
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`,
  `plugins/stackgen/stacks/app-framework/compose/skills/ux-gate/SKILL.md`,
  `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts (the D6 frame table) and Assumed
  decisions; the frame table in both full copies, top to bottom.
- **Lazy-load:** `docs/memory/decisions/2026-10-10-os-device-frames.md` (the
  research of the earlier plan, read only).

## Ruling

> - Decision D13: Find a source for each Android, Wear OS, Android TV, Android
>   Auto and watchOS size and margin of D6 (Context7 first, then the vendor's
>   own pages). Put a short "Sources" list of URLs under the full table in
>   `canvas-claude.md` and in `design-session/SKILL.md`. Correct a wrong value
>   in every copy; the ux-gate skills and the site keep the sizes only.
> - Decision D8: `mobile` and `tablet` use explicit qualifier strings at the D6
>   sizes — 412×915 and 800×1280 portrait. The D6 table stays.

This plan runs after `2026-10-18-packs-hand-off-to-bootstrap`, so the line
numbers in Facts can be stale: find each passage by its text.

## Edits

1. **Research.** For each value below, find one source from the vendor (Android
   developer documentation, the Material or Wear OS design guidance, the Compose
   preview device specs, Apple's Human Interface Guidelines), through Context7
   first and the vendor's web pages next:
   - Android `mobile` 412×915 dp and `tablet` 800×1280 dp (portrait);
   - Wear OS 227×227 dp, round;
   - Android TV 960×540 dp, overscan margin 27 dp top and bottom and 48 dp at
     the sides;
   - Android Auto 800×480 (and the note "head units are commonly 1280×720");
   - watchOS 208×248 pt (the 46 mm Apple Watch). Keep the URL and one line of
     what the page states for each.
2. **The two full tables** — `canvas-claude.md` and `design-session/SKILL.md`:
   under each table, a short **Sources** list, one URL per value or per group of
   values the same page states. A value with no source after the search gets the
   word "unconfirmed" in the list, never an invented URL.
3. **A wrong value.** If a source states a different value, correct it in both
   full tables, in the prose of `canvas-claude.md` around the table, and in the
   sizes paragraph of each ux-gate skill that repeats it
   (`compose/skills/ux-gate/SKILL.md`, `swiftui/skills/ux-gate/SKILL.md`). If
   the Android `mobile` or `tablet` size changes, the Compose qualifier strings
   that U2 wrote in the ux-gate skill change to the same size, and the other
   Compose files are a `DOCS FALSIFIED:` line for the docs unit. Report each
   correction as `DECIDED:` with its source. The site copy is the docs unit's:
   report it as `DOCS FALSIFIED:`.

## Verification

- Each full table has a Sources list, and each listed URL was opened in this
  session.
- `grep -rn "412×915\|800×1280\|227×227\|960×540\|208×248\|800×480" plugins/`
  shows the same values in every copy.
- The wave gate lines `mise run p:plugins:check` and `mise run code:precommit`
  are green.

## Guardrails

- Touch nothing outside the four owned files. In the two ux-gate skills, change
  only a size that a source corrects; leave the qualifier table of the Compose
  skill as U2 wrote it unless a size changes.
- No plugin-relative path in a file that lands (checker rule 13): a source is a
  URL, never a path into this repo.
- `plugins/**/*.md` is not formatted by a tool: fold by hand at the width of the
  lines around the edit.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns. Delete
  with `rm`, never `git rm`.

## Commit

`docs: cite a source for each OS device frame size`
