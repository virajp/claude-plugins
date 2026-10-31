# U5 — The design-tool packs lay out OS frames and the device tweak

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`,
  `plugins/stackgen/stacks/design-tool/claude-design/skills/design-import-screens/references/canvas-push.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's frame table and resolution order; then both owned
  files, top to bottom, before editing.

## Ruling

> - Decision D1: More than one device for one platform is a `device` tweak on
>   the one coded frame, never an extra frame or page. The tweak's values are
>   the OS tokens of the resolved list, in order. The first OS is the primary
>   and the tweak's default. Import diffs the primary frame only, as for the web
>   `width` tweak.
> - Decision D5: `design.viewports.<project>.<platform>` takes the scalar
>   `<W>x<H>` (unchanged: it resizes the primary frame) or a list,
>   `[ { os: <os>, size: <W>x<H> } ]`, where `size` is optional and falls back
>   to the OS frame's default. The list replaces the stack's list, and its order
>   sets the primary. The chrome always follows the OS; there is no chrome
>   field.
> - Decision D8: The screen brief tells the canvas: with the `device` tweak on a
>   frame whose OS equals the OS part of a `features:` entry's scope (the text
>   before any `:`, so `android:samsung` matches `android`), show the feature;
>   on every other frame, show the entry's fallback. Import diffs the primary
>   frame only.

## Edits

1. **`design-session/SKILL.md`** (`:165-175`) — replace the seven hard-coded
   default sizes with the frame table from index.md (every row, sizes and
   chrome), written inline (rule 13 forbids citing the vwf file). State the
   resolution order: the `design.viewports` list, else
   `projects.<name>.stack.os.<platform>` in `.config/vwf.yaml`, else the generic
   row. When the resolved list has two or more OS tokens, author one frame with
   a `device` tweak; draw each `features:` entry per D8.
2. **`canvas-push.md`** (`:48-56`) — the resolved viewport becomes the resolved
   OS list with sizes. The `device:` frontmatter mapping names the primary OS
   frame; the other OS frames are the `device` tweak's values on the same frame,
   never more frames.

## Verification

- The full wave gate.
- `grep -n "device"` over both files finds the tweak in each, and
  `grep -n "wearos"` over `design-session/SKILL.md` finds a hit.

## Guardrails

- Touch nothing outside the two files. Never edit `pack.yaml`, a bundle or
  `inventory.md` — U7 owns them.
- These files land in a target repo: no `plugins/`, `CLAUDE_PLUGIN_ROOT` or vwf
  path citation (rule 13).
- Do not change `canvas-push.md`'s mapping of `web` to `desktop`; it is a known
  follow-up outside this plan.
- `plugins/**/*.md` is not formatted by dprint: match the surrounding fold width
  by hand. Keep every code span on one line.
- No `git checkout` or `git restore`, and no formatter `--fix`, outside Owns.

## Commit

`feat: lay out OS device frames and the device tweak in the design-tool packs`
