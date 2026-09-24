# U3 — Screens, canvas frames and the per-product viewport override

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/templates/canvas-claude.md`,
  `plugins/vwf/assets/templates/screen-prompt.md`,
  `plugins/vwf/skills/screens/SKILL.md`,
  `plugins/vwf/skills/screens/references/prompt-mode.md`,
  `plugins/vwf/skills/screens/references/import-mode.md`,
  `plugins/vwf/skills/import-screens/SKILL.md`,
  `plugins/vwf/assets/design-adapter.md`,
  `plugins/vwf/skills/design-system/SKILL.md`,
  `plugins/vwf/assets/vwf-config.md`,
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`,
  `plugins/stackgen/stacks/design-tool/claude-design/skills/design-import-screens/references/canvas-push.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.

## Ruling

Quoted from index.md:

- **D2** — "`watch`, `tv`, `spatial` — form-factor nouns."
- **D5** — "All three are **device** screen platforms."
- **D7** — "Every device token (`mobile`, `tablet`, `desktop`, `auto`, `watch`,
  `tv`, `spatial`) keeps a default viewport, and a product may override it per
  project at `design.viewports.<project>.<platform>: <W>x<H>` in
  `.config/vwf.yaml`, beside the canvas pin. Additive key, no `config_format`
  bump. Both design adapters, the screens skill and the canvas Layout block read
  the override."
- **D8** — "`watch` 208×248 (46mm Apple Watch, points), `tv` 1920×1080 (tvOS
  point grid), `spatial` 1280×720 (visionOS default window)."

## Edits

1. **`vwf-config.md`** — beside `design.projects.<project>.<platform>` (`:148`,
   and the pin rules at `:309-318`) document the new key
   `design.viewports.<project>.<platform>`: optional; value `<W>x<H>` in points,
   two positive integers; valid only for a device platform the project declares;
   absent means the platform's default from `canvas-claude.md`. State that it is
   additive and needs no `config_format` bump. `:115` (goldens trigger) and
   `:527` (`ui:` trigger) gain the three tokens.
2. **`canvas-claude.md`** — `:48-66` add a Layout block for `watch` (208×248),
   `tv` (1920×1080) and `spatial` (1280×720), in the existing blocks' shape.
   State once, above the blocks, that each size is the **default**, and that
   when `design.viewports.<project>.<platform>` is set, the generator writes
   that size into the block instead. Do not add `site` or `webapp` blocks, and
   do not change `desktop`'s text (parked as P2).
3. **`screen-prompt.md`** — `:3-4` the brief filenames cover the three; `:16`
   the frame note: the frame is the resolved viewport (override, else default),
   and the camera-cutout note stays `mobile`'s.
4. **screens `SKILL.md`** — `:48,77` the platform lists gain the three; where it
   says the canvas conventions file carries each platform's viewport, add that
   the viewport is resolved from the override first, then the default.
5. **`prompt-mode.md`** — `:16-19` the frame-per-platform branch gains the three
   and reads the resolved viewport. **`import-mode.md`** — `:37` the frame
   branch gains the three; an imported frame is matched against the resolved
   viewport.
6. **import-screens `SKILL.md:34`** and **`design-adapter.md:118,227`** (the
   payload `platform:` enum) gain the three.
7. **design-system `SKILL.md:62-63`** — the screen platforms gain the three.
8. **stackgen `design-session/SKILL.md`** — `:51` the list gains the three;
   `:166-168` the branch that lays out mobile, tablet or auto at that platform's
   viewport covers every device platform, and reads
   `design.viewports.<project>.<platform>` from `.config/vwf.yaml` before
   falling back to the default. **stackgen `canvas-push.md:44`** — the list
   gains the three, and the viewport it pushes is the resolved one. These two
   files are pack payload read by a target repo's session: cite no plugin path
   (checker rule 13); name the config key, not a file in vwf.

## Verification

- `mise run p:plugins:check` green (rule 13 in particular, for the two stackgen
  files).
- `grep -l 'design.viewports'` over `vwf-config.md`, `canvas-claude.md`, screens
  `SKILL.md` and both stackgen files lists all five.
- Every owned file that lists `auto` as a platform also lists the three.

## Guardrails

- Touch nothing outside Owns. Do not bump either design-tool pack's version or
  its bundle pin — U6 does.
- `plugins/**/*.md` is not formatted — match each file's fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`feat: device viewports overridable per product, frames for watch, tv and spatial`
