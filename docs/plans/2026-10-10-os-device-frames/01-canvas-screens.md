# U1 — Canvas and screens read OS frames

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/templates/canvas-claude.md`,
  `plugins/vwf/assets/templates/screen-prompt.md`,
  `plugins/vwf/skills/screens/SKILL.md`,
  `plugins/vwf/skills/screens/references/prompt-mode.md`,
  `plugins/vwf/skills/screens/references/import-mode.md`,
  `plugins/vwf/skills/import-screens/SKILL.md`,
  `plugins/vwf/assets/design-adapter.md`,
  `plugins/vwf/agents/execute-ux-reviewer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts, Assumed decisions, the frame table and the
  resolution order; then every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/templates/flow-platform.md:8-13` (the
  `features:` entry shape); `plugins/vwf/assets/vwf-config.md:142-145` and
  `:265-272` (U2 edits them — read only).

## Ruling

> - Decision D1: More than one device for one platform is a `device` tweak on
>   the one coded frame, never an extra frame or page. The tweak's values are
>   the OS tokens of the resolved list, in order. The first OS is the primary
>   and the tweak's default. Import diffs the primary frame only, as for the web
>   `width` tweak.
> - Decision D2: The pinned stack picks the OS frames for each platform.
>   `design.viewports` can replace the list.
> - Decision D5: `design.viewports.<project>.<platform>` takes the scalar
>   `<W>x<H>` (unchanged: it resizes the primary frame) or a list,
>   `[ { os: <os>, size: <W>x<H> } ]`, where `size` is optional and falls back
>   to the OS frame's default. The list replaces the stack's list, and its order
>   sets the primary. The chrome always follows the OS; there is no chrome
>   field.
> - Decision D6: The (platform, OS) frame table, with the generic row kept as
>   the no-OS fallback. Tablet uses `ios`, not `ipados`.
> - Decision D7: U1 cross-examines each size and chrome in the table against the
>   vendor's design guidelines through Context7 (`resolve-library-id` then
>   `get-library-docs`). If a source gives a different value, U1 uses the source
>   and reports it as a `DECIDED:` line with the URL.
> - Decision D8: The screen brief tells the canvas: with the `device` tweak on a
>   frame whose OS equals the OS part of a `features:` entry's scope (the text
>   before any `:`, so `android:samsung` matches `android`), show the feature;
>   on every other frame, show the entry's fallback. Import diffs the primary
>   frame only.

The frame table and the resolution order are in index.md, under Assumed
decisions. Copy them; do not re-derive them.

## Edits

1. **`canvas-claude.md`** — the Layout block (`:44-115`).
   - Replace the comment at `:44-51` with the resolution order from index.md,
     naming `projects.<name>.stack.os` and both forms of `design.viewports`.
   - Put the frame table (D6) in the block, as the one place that holds the
     sizes and chrome. Keep each platform's existing prose (tweaks, the
     interaction notes); the generic row of each platform is today's frame.
   - Add `device` to the standing tweak set (`:111-115`): present only when the
     resolved OS list has two or more entries; values are the OS tokens in
     order; default is the primary.
   - Keep the rule "variants are tweaks, never extra frames" (`:38-39`) and add
     that the `device` tweak is one such variant.
   - `site` and `webapp` (`:64-76`) do not change.
2. **`screen-prompt.md`** (`:13-21`) — the brief names the resolved OS list for
   the platform, the primary, and the `device` tweak. Add the D8 rule for each
   `features:` entry in the flow platform file: the feature on the frame of its
   OS, the fallback on every other frame.
3. **`screens/SKILL.md`** (`:56-58`, `:66-73`) — state the resolution order in
   one sentence and point at the Layout block for the table. Name
   `projects.<name>.stack.os` as an input.
4. **`prompt-mode.md`** (`:15-28`, `:89-93`) — the device-frame list follows the
   frame table; the `device` tweak joins the standing tweaks; step 3 reads
   `projects.<name>.stack.os` and `design.viewports` when it regenerates the
   conventions file. Add the D8 rule to how the brief is written.
5. **`import-mode.md`** (`:36-50`) — the frame check diffs the primary OS frame
   only; the `device` tweak's other values are not diffed, as for the 390
   `width` tweak.
6. **`import-screens/SKILL.md`** (`:35-39`) — pass the resolved OS list and
   sizes to the adapter, not the raw scalar.
7. **`design-adapter.md`** — the payload (`:112-135`) does not change. Add one
   sentence near the join key (`:137-140`) that a `device` tweak never adds a
   frame, so `code` stays the join. Where the adapter contract names the
   viewport it receives, it now receives the resolved OS list with sizes.
8. **`execute-ux-reviewer.md`** (`:93-97`) — the viewport it judges is the
   resolved frame of the OS the repo's ux-gate renders; name the resolution
   order by pointing at the Layout block.

## Verification

- The full wave gate.
- `grep -n "stack.os" plugins/vwf/assets/templates/canvas-claude.md plugins/vwf/skills/screens/SKILL.md`
  finds a hit in each.
- `grep -n "Dynamic Island" plugins/vwf/assets/templates/canvas-claude.md` and
  `grep -n "wearos" plugins/vwf/assets/templates/canvas-claude.md` each find a
  hit.

## Guardrails

- Touch nothing outside the eight files. `vwf-config.md`, `stack-adapter.md`,
  `standard-flows.md`, doctor and setup are U2's; report a passage there that
  your edit falsifies as `DOCS FALSIFIED:`.
- `plugins/**/*.md` is not formatted by dprint: match the surrounding fold width
  by hand. Keep every code span on one line.
- No `git checkout` or `git restore`, and no formatter `--fix`, outside Owns.
- vwf names no technology: write OS tokens, never `swiftui`, `compose` or
  `flutter`.

## Commit

`feat: show OS device frames and a device tweak on the design canvas`
