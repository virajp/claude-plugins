<!-- Template for the canvas project conventions file — written by
     /vwf:screens prompt to
     docs/prompts/screens/<project>/CLAUDE--<platform>.md, ONE per
     pinned design project (per registry UI project + platform; two platforms
     never share a canvas project). The file is a deliverable: the user sets
     it as the canvas project's own CLAUDE.md and keeps it current from here.
     Generated sections are REGENERATED IN PLACE on every prompt run; the
     "Project conventions (canvas-owned)" section is preserved verbatim —
     /vwf:screens import folds canvas-side additions into it. Replace every
     backticked `<placeholder>` with plain prose; in Layout keep only the
     block matching this platform. A canvas brief companion, not a blueprint
     doc: no OKF frontmatter. -->

# `<product>`: `<Platform>` — screen conventions

Scope: this project holds the **`<platform>`** screen flows of `<product>`.
`<the other declared platforms>` live in separate Claude Design projects with
their own conventions.

## Product

`<product>` — `<one-line product description from product.md>`.

## Design system (binding)

- Compose every screen from the bound design system's components — never restyle
  raw HTML to imitate them. Style via its tokens only.
- Use the design system's icon set and fonts; follow its tone.
- When the design system ships templates, use the closest one as the base for a
  screen — build from scratch only when none fits.

## Page naming contract

- One interactive page per flow, at the project root, named
  **`<NNN>-<flow>--<platform>`** — the flow's numbered blueprint folder name
  plus this platform's suffix. The name is the sync key — never rename it.
- Inside a page, each screen frame is named by its pinned blueprint **code**
  (`<NNN><letter>`, e.g. `020a`) — the per-screen sync key. State variations
  ride as **tweaks** on the coded frame, never as extra frames or pages — the
  `device` tweak, which switches the frame between its OS frames, is one such
  variant.
- Revise existing pages **in place** under the same name — never duplicate, fork
  per revision, or rebuild from scratch.
- **`index--<platform>`** stitches every flow page's happy path in flow-number
  order, with stub rows for flows not yet designed. Update it every time a flow
  page is added or changed.

## Layout

<!-- Keep only this platform's block and this platform's rows of the frame
     table; drop the others. The OS frames resolve per (project, platform),
     for a device platform only (never site or webapp, whose sizes are
     fixed), from .config/vwf.yaml:
     1. The OS list is the design.viewports.<project>.<platform> list when
        one is set ([ { os: <os>, size: <W>x<H> } ], size optional), else
        projects.<project>.stack.os.<platform>, else empty.
     2. An empty list gives the one generic frame (the "(none)" row) at its
        default size, or at the scalar override
        design.viewports.<project>.<platform>: <W>x<H> when set.
     3. A non-empty list gives one frame with a `device` tweak; each OS takes
        its size from its list entry, else from its row below. The first OS
        is the primary and the tweak's default. A scalar override resizes the
        primary OS frame only.
     Keep the rows of the resolved OS list (or the "(none)" row when it is
     empty), with each resolved size written in place of the default, and
     write the resolved list and its primary into the kept block. The chrome
     always follows the OS. -->

**Frame table** — the one place that holds each frame's size and chrome. Sizes
are in points (Apple OSes) or dp (Android OSes). The `(none)` row of each
platform is the generic frame used when no OS is known.

| Platform | OS            | Size      | Chrome                                        |
| -------- | ------------- | --------- | --------------------------------------------- |
| mobile   | (none)        | 390×844   | generic notch or cutout                       |
| mobile   | `ios`         | 393×852   | Dynamic Island, home indicator                |
| mobile   | `android`     | 412×915   | punch-hole camera, gesture bar                |
| tablet   | (none)        | 834×1194  | camera cutout                                 |
| tablet   | `ios`         | 834×1194  | rounded corners, home indicator               |
| tablet   | `android`     | 800×1280  | camera in the bezel, gesture bar              |
| desktop  | (none)        | 1440×900  | neutral title bar                             |
| desktop  | `macos`       | 1440×900  | window controls on the left                   |
| desktop  | `windows`     | 1440×900  | window controls on the right                  |
| desktop  | `linux`       | 1440×900  | neutral title bar                             |
| auto     | (none)        | 800×480   | in-car display frame                          |
| auto     | `carplay`     | 800×480   | CarPlay status sidebar                        |
| auto     | `androidauto` | 800×480   | Android Auto navigation rail                  |
| watch    | (none)        | 208×248   | rounded watch face                            |
| watch    | `watchos`     | 208×248   | rounded rectangle                             |
| watch    | `wearos`      | 227×227   | round face                                    |
| tv       | (none)        | 1920×1080 | title-safe inset shown                        |
| tv       | `tvos`        | 1920×1080 | title-safe inset, 60 top and bottom, 80 sides |
| tv       | `androidtv`   | 960×540   | overscan margin, 27 top and bottom, 48 sides  |
| spatial  | (none)        | 1280×720  | floating window, glass material               |
| spatial  | `visionos`    | 1280×720  | glass window, window bar below                |
| spatial  | `androidxr`   | 1280×720  | panel with a top bar                          |

Sources:

- Android `mobile` 412×915: unconfirmed. No vendor page states it; the Compose
  phone preview is 411×891 (the `tablet` link below).
- Android `tablet` 800×1280 (the Compose 1280×800 dp tablet, portrait):
  https://developer.android.com/reference/kotlin/androidx/compose/ui/tooling/preview/PreviewScreenSizes
- Wear OS 227×227, round (the large round device):
  https://developer.android.com/reference/kotlin/androidx/wear/tooling/preview/devices/WearDevices
- Android TV 960×540, margin 48 at the sides and 27 top and bottom:
  https://developer.android.com/design/ui/tv/guides/styles/layouts
- Android Auto 800×480 (the head unit default; 1280×720 is one more option):
  https://developer.android.com/training/cars/testing/dhu
- CarPlay 800×480 (a common CarPlay screen size):
  https://developer.apple.com/design/human-interface-guidelines/carplay
- watchOS 208×248 (the 46mm watch, 416×496 pixels at @2x; Apple's live page no
  longer shows the table, so this is the September 2025 copy):
  https://web.archive.org/web/20250925130912/https://developer.apple.com/design/human-interface-guidelines/layout

On a device platform whose resolved OS list has **two or more** entries, every
coded frame carries the `device` tweak: its values are the OS tokens of the list
in order, its default is the primary, and switching it redraws the same coded
frame at that OS's size and chrome — never a second frame or page. With one OS
there is no `device` tweak; with none, the generic frame.

- **mobile** — every screen renders at its resolved frame (portrait; the
  generic **390×844**) in a phone frame: dark bezel **with the OS's camera
  chrome** — the Dynamic Island on `ios`, the punch-hole camera on `android`,
  the generic notch/cutout when no OS is known — for a true visual, toggleable
  via the `frame` tweak (default on); theme via `darkMode` (default on).
- **tablet** — every screen renders at its resolved frame (portrait; the
  generic **834×1194**) in a tablet frame **with the OS's camera chrome**,
  toggleable via the `frame` tweak (default on); theme via `darkMode` (default
  on).
- **desktop** (a natively installed app) — every screen renders at its
  resolved frame (the generic **1440×900**) in a native app window frame: a
  title bar with the OS's window controls (left on `macos`, right on
  `windows`, neutral on `linux` and when no OS is known), no address bar and
  no tabs, toggleable via the `frame` tweak (default on); theme via
  `darkMode` (default on).
- **site** — every screen renders at **1440×900** in a desktop browser-chrome
  frame by default. A `width` tweak (`1440` | `390`, default `1440`) switches
  the same coded frame to **390×844** in a mobile browser frame with a status
  bar and an address bar — the narrow layout is this tweak, never a second
  frame. The `frame` tweak toggles the chrome (default on); theme via `darkMode`
  (default on). The size is fixed: `design.viewports` does not apply to `site`.
- **webapp** — every screen renders at **1440×900** in a desktop browser-chrome
  frame by default. A `width` tweak (`1440` | `390`, default `1440`) switches
  the same coded frame to **390×844** in a mobile browser frame with a status
  bar and an address bar — the narrow layout is this tweak, never a second
  frame. The `frame` tweak toggles the chrome (default on); theme via `darkMode`
  (default on). The size is fixed: `design.viewports` does not apply to
  `webapp`.
- **auto** (in-car — CarPlay and Android Auto together) — every screen renders
  at its resolved frame (landscape; the generic **800×480**, the CarPlay base
  resolution; Android Auto head units are commonly 1280×720 — same layout, more
  pixels) in the in-car display frame with the OS's chrome — the CarPlay status
  sidebar on `carplay`, the navigation rail on `androidauto` (`frame` default
  on). Screens are **template-constrained by the OS** (list / grid / map /
  now-playing) and glanceable — minimal interaction while driving; the design
  system reaches only as far as the platform allows. Where CarPlay and Android
  Auto genuinely diverge, the flow's `auto.md` records it as a deviation.
- **watch** (watchOS and Wear OS together) — every screen renders at its
  resolved frame (the generic **208×248**, the 46mm Apple Watch, in points) in
  a watch-face frame — a rounded rectangle on `watchos`, a round **227×227**
  face on `wearos` — toggleable via the `frame` tweak (default on); theme via
  `darkMode` (default on). Screens are **glanceable** — one idea per screen,
  short sessions, Digital Crown scrolling, complications where the flow pins
  them. Where watchOS and Wear OS genuinely diverge beyond the frame, the flow's
  `watch.md` records it as a deviation.
- **tv** (tvOS and Android TV together) — every screen renders at its resolved
  frame (landscape; the generic **1920×1080**, the tvOS point grid) in a TV
  frame with the OS's safe area shown — the title-safe inset on `tvos`, the
  overscan margin on `androidtv` — toggleable via the `frame` tweak (default
  on); theme via `darkMode` (default on). Screens are read from **ten feet**
  and driven by **focus** with a remote — the focused element is always
  visible, there is no touch and no pointer.
- **spatial** (visionOS, Android XR and Quest together) — every screen renders
  at its resolved frame (the generic **1280×720**, the visionOS default window)
  as a floating window — glass with the window bar below on `visionos`, a panel
  with a top bar on `androidxr`, the generic window for Quest, which has no OS
  token — toggleable via the `frame` tweak (default on); theme via
  `darkMode` (default on). Input is **gaze and pinch**; a flow that pins a
  volume or an immersive space draws it as its own coded frame. Where the
  platforms genuinely diverge, the flow's `spatial.md` records it as a
  deviation.

## Behavior conventions

- Every screen is **interactive, like a fake app** — controls respond,
  navigation is wired, the happy path is clickable end to end and stitched into
  the index; never a static wireframe.
- Standing tweak set on every coded frame: `darkMode` (default on), `frame`
  (default on), one tweak per pinned **sad state**, one tweak per pinned
  **conditional product state** (empty data, entity-state variants). On `site`
  and `webapp` every coded frame also carries the `width` tweak (`1440` |
  `390`, default `1440`) — still one frame per code. On a device platform whose
  resolved OS list has two or more entries, every coded frame also carries the
  `device` tweak (values the OS tokens in list order, default the primary) —
  still one frame per code.
- A screen element the brief marks as an OS **feature** shows on the frames of
  its OS only; every other `device` value shows the brief's fallback in its
  place.
- Info/warning/error popup messages appear **close to the point of interaction**
  — a message for a control in the bottom part of the screen never lands at the
  top, where the user would miss it.
- Popup messages **never overlay an existing component** — they fit into the
  layout properly, without hiding the control that triggered them or any content
  the user still needs.
- Out-of-scope flows and screens homed by other flows compose as **stubs** —
  visibly stubbed and labeled with their flow number — never designed here.

## Goal vocabulary

Briefs reference these by name ("This flow serves **`<goal>`**"); design toward
the outcome:

- **`<goal>`** — `<one-line outcome, from product.md's goal>`

## Project conventions (canvas-owned)

<!-- Conventions discovered while designing live here — added on the canvas
     copy, folded back by /vwf:screens import. This section is preserved
     verbatim across regenerations; everything above it is regenerated. -->
