# U4 — The SwiftUI and Compose ux-gates resolve their own OS frame

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/SKILL.md`,
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/testing.md`,
  `plugins/stackgen/stacks/app-framework/compose/skills/ux-gate/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's frame table and resolution order; then every owned
  file, top to bottom, before editing.

## Ruling

> - Decision D5: `design.viewports.<project>.<platform>` takes the scalar
>   `<W>x<H>` (unchanged: it resizes the primary frame) or a list,
>   `[ { os: <os>, size: <W>x<H> } ]`, where `size` is optional and falls back
>   to the OS frame's default. The list replaces the stack's list, and its order
>   sets the primary. The chrome always follows the OS; there is no chrome
>   field.
> - Decision D9: The SwiftUI and Compose ux-gate skills resolve the frame of
>   their own OS: the list entry with that OS token, else the OS default from
>   the frame table. The SwiftUI `mobile` default moves from 390×844 to 393×852
>   (`ios`).

## Edits

1. **swiftui `ux-gate/SKILL.md`** (`:34-50`)
   - Step 1: resolve the viewport for the platform's Apple OS token (`mobile`
     and `tablet` `ios`, `desktop` `macos`, `auto` `carplay`, `watch` `watchos`,
     `tv` `tvos`, `spatial` `visionos`): when
     `design.viewports.<project>.<platform>` is a list, the entry with that
     token, its `size` else the table default; when it is a scalar, the scalar;
     else the table default.
   - The table: `mobile` becomes 393×852; the other rows keep their sizes, which
     equal the Apple rows of the frame table. Name the chrome column only if the
     table already has room; sizes are what the gate needs.
2. **swiftui `references/testing.md`** (`:69-71`) — the same resolution, in one
   sentence.
3. **compose `ux-gate/SKILL.md`** (`:42-50`) — resolve for the Android token
   (`mobile` and `tablet` `android`, `watch` `wearos`, `tv` `androidtv`, `auto`
   `androidauto`) the same way. When the resolved size is one the golden tests'
   qualifiers do not render, the existing finding applies. The qualifier table
   does not change.

## Verification

- The full wave gate.
- `grep -n "393" plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/SKILL.md`
  finds a hit, and `grep -n "390×844"` over the same file finds none.

## Guardrails

- Touch nothing outside the three files. Never edit `pack.yaml`, a bundle or
  `inventory.md` — U7 owns them.
- These files land in a target repo: no `plugins/`, `CLAUDE_PLUGIN_ROOT` or vwf
  path citation (rule 13). Write the sizes inline.
- `plugins/**/*.md` is not formatted by dprint: match the surrounding fold width
  by hand. Keep every code span on one line.
- No `git checkout` or `git restore`, and no formatter `--fix`, outside Owns.

## Commit

`feat: resolve each ux-gate viewport for its own OS`
