# Decision — a canvas frame shows the OS the product ships on, switched by a `device` tweak

**Date** 2026-10-10 · **Branch** `2026-10-10-os-device-frames` · **Plan**
`docs/plans/2026-10-10-os-device-frames/` · **Finishes backlog item B58**

## What was decided before

Each device platform had one canvas frame, with a default size and an optional
per-project scalar override `design.viewports.<project>.<platform>: <W>x<H>` in
`.config/vwf.yaml`. The `mobile` frame carried a generic camera notch or cutout,
and `desktop` a neutral native window. Two earlier rulings fixed that shape:

- `2026-09-23-watch-tv-spatial-platforms` **D7** rejected a list of sizes per
  product.
- `2026-10-09-web-canvas-layout` **D4** rejected desktop window chrome that
  follows the pinned stack, naming it B58's OS fidelity.

This is **folder 3 for B58**. Folder 1 (`2026-10-09-os-feature-declarations`)
landed the `features:` list and the iOS side; folder 2
(`2026-10-09-android-device-features`) landed the Android device-family scopes.
Both parked the canvas frame sizes per platform and the Samsung and OnePlus
worked cases. This folder lands the first and closes the second with the rule
only.

## Two reversals

Both were confirmed by the user on 2026-10-10.

- **Reversal of `2026-09-23-watch-tv-spatial-platforms` D7.** `design.viewports`
  now also accepts a list of OS frames per platform (D5). The scalar form stays
  valid.
- **Reversal of `2026-10-09-web-canvas-layout` D4.** The `macos` and `windows`
  desktop frames now follow the stack (D6). The neutral frame stays as the
  `linux` frame and as the frame when no OS is known.

## The decisions

**Frame shape (D1).** More than one device for one platform is a `device` tweak
on the one coded frame, never an extra frame or page. Its values are the OS
tokens of the resolved list, in order; the first is the primary and the default.
Import diffs the primary frame only. Rejected: one frame per device
(`<code>@<device>`); one page per device.

**Device list source (D2).** The pinned stack picks the OS frames for each
platform; `design.viewports` can replace the list. Rejected: fixed defaults;
config only.

**Stack link (D3).** A bundle's frontmatter declares an optional `os:` map,
`<platform>: [ <os> ]`, beside `platforms:`, and the stack-template payload
passes it through. vwf keeps the one (platform, OS) frame table, so vwf names no
technology. Rejected: the pack declares full frames; asking at screens prompt.

**OS record (D4).** `/vwf:setup` copies the payload's `os:` map into
`projects.<name>.stack.os`. Optional and additive, so no `config_format` bump.
An absent key or platform reads as no OS known: the generic frame. Rejected:
fetching the payload live at each screens run.

**Override shape (D5).** `design.viewports.<project>.<platform>` takes the
scalar `<W>x<H>` (resizes the primary frame) or a list of `{ os, size }`
entries, `size` optional. The list replaces the stack's list and its order sets
the primary. The chrome always follows the OS. Rejected: full device entries
with a free `chrome` field; an OS list with no size.

**Frame table (D6).** One (platform, OS) table in the canvas conventions
template's Layout block, with the generic row kept as the no-OS fallback:
`mobile` `ios` 393×852 (Dynamic Island), `android` 412×915 (punch-hole camera);
`tablet` `ios` 834×1194, `android` 800×1280; `desktop` 1440×900 with controls
left on `macos`, right on `windows`, neutral on `linux`; `auto` 800×480 for
`carplay` and `androidauto`; `watch` `watchos` 208×248, `wearos` 227×227 round;
`tv` `tvos` 1920×1080 with a 60/80 title-safe inset, `androidtv` 960×540 with a
27/48 overscan margin; `spatial` 1280×720 for `visionos` and `androidxr`. Tablet
uses `ios`, not `ipados`. Rejected: mobile, watch and tv only; a separate
`ipados` token.

**Size check (D7).** Each size and chrome was cross-examined against the
vendor's design guidelines through Context7. Rejected: sizes taken without a
check.

**`features:` on frames (D8).** A `features:` entry shows on the frame whose OS
equals the OS part of its scope (the text before any `:`), and its fallback on
every other frame. Import diffs the primary frame only. Rejected: the canvas
ignores `features:`.

**ux-gates (D9).** The SwiftUI and Compose ux-gates resolve the frame of their
own OS. The SwiftUI `mobile` default moves from 390×844 to 393×852. Rejected:
leaving the ux-gates alone.

**Doctor (D10).** Doctor validates `projects.<name>.stack.os` and the list form
of `design.viewports` against the OS vocabulary, non-blocking: an invalid entry
is reported and ignored. Rejected: a `p:plugins:check` rule.

**Vendor worked cases (D11).** None ships; this doc records the research below.
The capability-check rule already lets a product build a vendor feature.
Rejected: an S Pen worked case; an anti-example note.

**Review row (D12).** None — every edit is prose. Rejected: a review row.

**Bundle owner (D13).** One unit owns each app-framework bundle whole, the `os:`
key and the pins together. Rejected: splitting `os:` and the pins.

**OS vocabulary (D14).** One closed list per platform in `standard-flows.md`
serves both the frames and the `features:` scopes: `mobile` and `tablet` `ios`
`android`; `desktop` `macos` `windows` `linux`; `auto` `carplay` `androidauto`;
`watch` `watchos` `wearos`; `tv` `tvos` `androidtv`; `spatial` `visionos`
`androidxr`. Quest has no token and gets the generic spatial frame. Rejected: an
OS list in each consumer.

**Bundle `os:` values (D15).** `swift-swiftui`: `mobile`, `tablet` `ios`,
`desktop` `macos`, `auto` `carplay`, `watch` `watchos`, `tv` `tvos`, `spatial`
`visionos`. `kotlin-compose`: `mobile`, `tablet` `android`, `watch` `wearos`,
`tv` `androidtv`, `auto` `androidauto`. `dart-flutter`: `mobile` and `tablet`
`ios` then `android`, `desktop` `macos` `windows` `linux`, `auto` `carplay` then
`androidauto`. Rejected: no `os:` on Flutter.

**Pack bumps (D16).** `app-framework/swiftui` 0.7.0 → 0.8.0,
`app-framework/compose` 0.4.0 → 0.5.0, `design-tool/claude-code` 0.5.0 → 0.6.0,
`design-tool/claude-design` 0.3.0 → 0.4.0, with the four bundles re-pinned and
the inventory regenerated in one commit. Rejected: a patch bump.

## Open at landing

Two gaps the run recorded, neither blocking and neither resolved:

- **Compose qualifiers against the D6 Android sizes.** The Robolectric
  qualifiers the Compose ux-gate renders do not match the table: `Pixel7`
  renders about 411×914 against 412×915, and `MediumTablet` is landscape
  1280×800 against portrait 800×1280. The qualifiers were kept, and the mismatch
  finding fires only for a size the config sets.
- **D7 found no source for some values.** Context7 returned Apple HIG sources
  confirming 393×852, 834×1194 and the tvOS 60/80 title-safe inset, but nothing
  for the Android, Wear OS, Android TV and watchOS values. The plan's values
  were kept.

## The vendor research, and why no worked case ships

The research ran at plan time, 2026-10-10, from primary sources:

- **Samsung Galaxy Edge SDK** — support ended 2023-12-05
  (`https://developer.samsung.com/galaxy-edge`).
- **Samsung S Pen Remote SDK** — version 1.0.2 from 2019-09-16, two JARs
  downloaded by hand (not on Maven), "requires devices of the Note series"; the
  check is `SpenRemote.isFeatureEnabled(FEATURE_TYPE_BUTTON)`
  (`https://developer.samsung.com/galaxy-spen-remote`). The Galaxy S25 Ultra S
  Pen has no Bluetooth (press coverage, not a primary source).
- **Samsung DeX** — detection uses hidden APIs only
  (`https://developer.samsung.com/samsung-dex/modify-optimizing`).
- **OnePlus** — no developer portal, no SDK, no documented feature flag. OPPO
  Fluid Cloud needs vendor approval and runs on the server side.

Nothing there is a stable public API a pack can ship a case on, so the Compose
pack keeps the rule alone.

## Not in scope

- Vendor worked cases (Samsung, OnePlus) — no case can ship (D11).
- A Quest frame — no OS token names Quest; it gets the generic spatial frame.
- Local mockup renders (`/vwf:mockups`, the mockup-generator) — no viewport
  logic today; parked with no backlog item yet.
- The Flutter ux-gate — it has no size table.
- An import diff of the non-primary devices — import diffs the primary only
  (D1).
- `site`, `webapp` and `cli` — no OS frame; `site` and `webapp` keep their fixed
  browser frames and the `width` tweak.
- A `config_format` or `blueprint_format` bump — every key is additive (D4).
- A checker rule for `os:` or the list form (D10).
- Generated stacks — a generated bundle may emit `os:`; when it does not, the
  generic frame applies. No generator edit.
