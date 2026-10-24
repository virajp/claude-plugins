# U2 — Config, stack payload, OS vocabulary, doctor and setup

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/assets/standard-flows.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/skills/setup/references/materialize.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts, Assumed decisions, the frame table and the
  resolution order; then every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/blueprint/references/platforms.md` and
  `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md:81-91`
  (the `features:` scope doctrine — read only).

## Ruling

> - Decision D2: The pinned stack picks the OS frames for each platform.
>   `design.viewports` can replace the list.
> - Decision D3: A bundle's frontmatter declares an optional `os:` map,
>   `<platform>: [ <os> ]`, beside `platforms:`. The stackgen stack-template
>   payload passes it through. vwf keeps the one table that maps (platform, OS)
>   to a frame, so vwf names no technology.
> - Decision D4: `/vwf:setup` copies the payload's `os:` map into
>   `projects.<name>.stack.os` in `.config/vwf.yaml`, as it copies `languages`
>   and `frameworks`. The key is optional and additive, so no `config_format`
>   bump (the `design.viewports` precedent). An absent key, or an absent
>   platform in it, reads as no OS known: the generic frame, as today.
> - Decision D5: `design.viewports.<project>.<platform>` takes the scalar
>   `<W>x<H>` (unchanged: it resizes the primary frame) or a list,
>   `[ { os: <os>, size: <W>x<H> } ]`, where `size` is optional and falls back
>   to the OS frame's default. The list replaces the stack's list, and its order
>   sets the primary. The chrome always follows the OS; there is no chrome
>   field.
> - Decision D10: Doctor validates `projects.<name>.stack.os` (each key a
>   platform the project declares, each value a token the OS vocabulary names
>   for that platform) and the list form of `design.viewports` (each `os` a
>   token the vocabulary names for that platform, each `size` `<W>x<H>`).
>   Findings are non-blocking, as for the scalar: an invalid entry is reported
>   and ignored.
> - Decision D14: One OS vocabulary for each platform, in `standard-flows.md`,
>   serves both the frames and the `features:` scopes: `mobile` `ios` `android`;
>   `tablet` `ios` `android`; `desktop` `macos` `windows` `linux`; `auto`
>   `carplay` `androidauto`; `watch` `watchos` `wearos`; `tv` `tvos`
>   `androidtv`; `spatial` `visionos` `androidxr`. Quest has no token, so it
>   gets the generic spatial frame.

Reversal of `2026-09-23-watch-tv-spatial-platforms` D7, confirmed by the user on
2026-10-10: `design.viewports` now accepts a list.

## Edits

1. **`standard-flows.md`** — near the form-factors-not-vendors rule
   (`:190-199`), add the OS vocabulary (D14) as one table: platform, OS tokens.
   Say that an OS token names an operating system inside a form factor, never a
   vendor, so the form-factors-not-vendors rule still holds; that a `features:`
   scope's OS part is one of these tokens; and that a vendor label
   (`android:samsung`) stays a label after the `:`.
2. **`vwf-config.md`**
   - Under `projects.<name>.stack` in the schema block, add the optional `os:`
     key: `<platform>: [ <os> ]`, written by `/vwf:setup` from the template
     payload, a token from the `standard-flows.md` vocabulary, absent meaning no
     OS known. Note no `config_format` bump.
   - The `design.viewports` comment (`:142-145`): add the list form (D5) beside
     the scalar; drop the inline defaults list and point at the Layout block of
     `canvas-claude.md` for the sizes, so the sizes live in one place.
   - The reading rules (`:265-272`): state the resolution order from index.md,
     and the doctor behaviour for the list form.
3. **`stack-adapter.md`** — the template payload (`:273-297`): add the optional
   `os:` field, project axis only, with a one-line comment: which OS the
   template targets on each platform; vwf maps (platform, OS) to a canvas frame;
   absent means no OS known.
4. **`materialize.md`** — where setup records the payload's `languages`,
   `frameworks` and `dependencies` into `projects.<name>.stack`, record `os` the
   same way, filtered to the platforms the project declares. Absent in the
   payload means the key is not written.
5. **`stack-checks.md`** (`:270-279`) — add the D10 checks beside the scalar
   check, each a non-blocking finding that names the entry and says it is
   ignored.

## Verification

- The full wave gate.
- `grep -n "stack.os\|os:" plugins/vwf/assets/vwf-config.md plugins/vwf/skills/setup/references/materialize.md plugins/vwf/skills/doctor/references/stack-checks.md`
  finds a hit in each file.
- `grep -n "androidxr" plugins/vwf/assets/standard-flows.md` finds a hit.

## Guardrails

- Touch nothing outside the five files. The canvas, screens, adapter and
  ux-reviewer files are U1's; the blueprint-authoring and blueprint references
  are nobody's in this plan — report a passage there that the vocabulary
  falsifies as `DOCS FALSIFIED:`.
- Do not bump `config_format` or `blueprint_format`; do not edit
  `plugins/vwf/skills/setup/references/format-lineage.md`.
- `plugins/**/*.md` is not formatted by dprint: match the surrounding fold width
  by hand. Keep every code span on one line.
- No `git checkout` or `git restore`, and no formatter `--fix`, outside Owns.
- vwf names no technology: never write `swiftui`, `compose` or `flutter`.

## Commit

`feat: record each platform's OS from the stack and accept an OS list in design.viewports`
