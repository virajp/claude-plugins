# U1 — Layout blocks for site and webapp, native desktop

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/templates/canvas-claude.md`,
  `plugins/vwf/skills/screens/references/prompt-mode.md`,
  `plugins/vwf/skills/screens/references/import-mode.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/standard-flows.md` ~:150-175 — the platform
  vocabulary, for the meaning of `desktop`, `site` and `webapp`.

## Ruling

From index.md, assumed decisions 1 to 6:

- Decision 1 — Every screen renders at 1440×900 in a desktop browser-chrome
  frame. A `width` tweak (1440 | 390, default 1440) switches it to 390×844 in a
  mobile browser frame with a status bar and an address bar. The `frame` tweak
  toggles the chrome (default on). Rejected: one desktop frame only; extend
  `design.viewports` to the web tokens.
- Decision 2 — Each screen code keeps one frame. The narrow layout is the
  `width` tweak, not a second frame. This follows the rule "variants are tweaks,
  never extra frames". Rejected: frames named `<code>@1440` and `<code>@390`.
- Decision 3 — Import diffs the default (1440) layout of `site` and `webapp`
  frames. It does not diff the 390 tweak. Rejected: diff both widths.
- Decision 4 — Every screen renders at 1440×900 in a neutral native app window
  frame: a title bar with window controls, no address bar and no tabs. The
  `frame` tweak toggles it (default on). Rejected: a macOS window; window chrome
  that follows the pinned stack.
- Decision 5 — `prompt-mode.md:16-22` gets the same desktop correction and adds
  `site` and `webapp` lines.
- Decision 6 — `design.viewports` stays limited to the device tokens. The `site`
  and `webapp` sizes are fixed.

## Edits

1. **`plugins/vwf/assets/templates/canvas-claude.md`, desktop block (~:59-61)**
   — replace "in a browser-chrome frame" with a neutral native app window frame
   per decision 4: a title bar with window controls, no address bar and no tabs,
   toggleable via the `frame` tweak (default on). Keep 1440×900 and the
   `design.viewports` override wording the other device blocks use.
2. **`canvas-claude.md`, Layout section** — add one block for `site` and one for
   `webapp`, after the desktop block, in the same shape as the other blocks.
   Each says decision 1 in full: 1440×900 desktop browser-chrome frame by
   default; a `width` tweak (1440 | 390, default 1440) that switches the same
   coded frame to 390×844 in a mobile browser frame with a status bar and an
   address bar; the `frame` tweak toggles the chrome (default on). Say that the
   size is fixed and `design.viewports` does not apply to this platform
   (decision 6). The two blocks can share wording but are two blocks, because
   the generator keeps one block per platform.
3. **`canvas-claude.md`, HTML comment (~:48-51)** — if it implies that every
   block takes a `design.viewports` size, make it say the override applies to
   the device tokens only. Change nothing else in the comment.
4. **`canvas-claude.md`, standing tweak set (~:96-98)** — add that `site` and
   `webapp` frames also carry the `width` tweak (decision 2). Do not change the
   page naming contract: one frame per code stays true.
5. **`plugins/vwf/skills/screens/references/prompt-mode.md:16-22`** — change the
   desktop entry to the native app window of decision 4, and add `site` and
   `webapp` entries per decision 1 (decision 5).
6. **`plugins/vwf/skills/screens/references/import-mode.md:30-41`** — add that
   for `site` and `webapp` pages, import reads each coded frame at its default
   1440 width, and does not diff the 390 `width` tweak (decision 3). Where the
   text checks the `frame` tweak against the resolved viewport, say the web
   tokens resolve to the fixed 1440×900.

## Verification

- `mise run p:plugins:check` — green.
- `grep -n 'browser-chrome' plugins/vwf/assets/templates/canvas-claude.md plugins/vwf/skills/screens/references/prompt-mode.md`
  — every match is in a `site` or `webapp` entry; none is in a desktop entry.
- `grep -n 'site' plugins/vwf/assets/templates/canvas-claude.md` and the same
  for `webapp` — each has its own Layout block.
- `grep -n 'width' plugins/vwf/skills/screens/references/import-mode.md` — at
  least one match for the 1440 rule.

## Guardrails

- Do not touch any file outside the Owns list. Report a falsified passage
  elsewhere (for example `vwf-config.md`, `screen-prompt.md`, the manual) under
  DOCS FALSIFIED.
- Do not change the page naming contract, the payload shape, or the
  `design.viewports` rule.
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width by
  hand. Keep each code span on one line.
- Delete with `rm`, never `git rm`. Never run `git checkout` or `git restore`,
  and never run a formatter with `--fix` outside the Owns list.
- Edit with Edit or Write. Never `cat >`.

## Commit

`feat: canvas layout blocks for site and webapp, native desktop frame`
