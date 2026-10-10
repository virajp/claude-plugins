# Decision — site and webapp get a browser canvas frame, and desktop renders in a native app window

**Date** 2026-10-09 · **Branch** `2026-10-09-web-canvas-layout` · **Plan**
[`docs/plans/2026-10-09-web-canvas-layout/`](../../plans/2026-10-09-web-canvas-layout/index.md)
· **Finishes** backlog item B59

## The defect

The Layout section of the canvas conventions template
(`plugins/vwf/assets/templates/canvas-claude.md`), which `/vwf:screens prompt`
regenerates into each platform's `CLAUDE--<platform>.md`, had no block for
`site` or `webapp`, so a browser-delivered platform had no frame or viewport.
Its `desktop` block described a browser-chrome frame, though `standard-flows.md`
defines `desktop` as a natively installed application. `prompt-mode.md` repeated
the same desktop description and had no `site` or `webapp` entry.

## The decisions

1. **The `site` and `webapp` frames.** Every screen renders at 1440×900 in a
   desktop browser-chrome frame. A `width` tweak (`1440` | `390`, default
   `1440`) switches it to 390×844 in a mobile browser frame with a status bar
   and an address bar. The `frame` tweak toggles the chrome (default on).
   Rejected: one desktop frame only — it does not show the responsive layout;
   extending `design.viewports` to the web tokens — it changes vwf-config and
   doctor.
2. **One frame for each code.** Each screen code keeps one frame. The narrow
   layout is the `width` tweak, not a second frame, following the rule "variants
   are tweaks, never extra frames". Rejected: frames named `<code>@1440` and
   `<code>@390` — the import payload shape changes and stackgen's import skill
   needs edits.
3. **What import diffs.** Import diffs the default (1440) layout of `site` and
   `webapp` frames, not the 390 tweak. Rejected: diffing both widths — it needs
   a width field in the payload.
4. **The `desktop` frame.** Every screen renders at 1440×900 in a neutral native
   app window frame: a title bar with window controls, no address bar and no
   tabs. The `frame` tweak toggles it (default on). Rejected: a macOS window —
   wrong for Windows and Linux; window chrome that follows the pinned stack —
   that is B58's OS fidelity.
5. **`prompt-mode.md` agrees.** Its device-frame list gets the same desktop
   correction and adds `site` and `webapp`. Rejected: leaving it — two sources
   then disagree.
6. **`design.viewports` scope.** `design.viewports` stays limited to the device
   tokens; the `site` and `webapp` sizes are fixed. Rejected: accepting the web
   tokens — out of scope.

## Not in scope

- Several canvas frame sizes per platform, and OS-specific window or device
  chrome — B58's parked piece.
- `cli` — it has no screens and no canvas.
- The import payload shape and stackgen's `design-import-screens` skill. Its
  `canvas-push.md` still maps `web` to `desktop`; a follow-up plan should map it
  to `site`/`webapp`.
