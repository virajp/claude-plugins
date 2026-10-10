# Jetpack Compose — phone & tablet (`mobile`, `tablet`)

The platform file a flow's `mobile.md` and `tablet.md` takes are realised on.
One app serves both: a phone, a foldable and a tablet are the same app in a
different window, never two codebases. What differs is space, posture and input,
and all three are read at run time, never inferred from the device model.

## Layout follows the window size class

- **Branch on the window size class**, from
  `currentWindowAdaptiveInfo().windowSizeClass`. Compact width is a single
  pane; medium has room for a rail and wider content; expanded for list and
  detail side by side. A tablet in split screen or a free-form window is
  compact or medium — a layout keyed on "is a tablet" breaks there.
- **Use the adaptive scaffolds before hand-rolling.**
  `NavigationSuiteScaffold` switches between bottom bar, rail and drawer from
  the size class; `ListDetailPaneScaffold` and `SupportingPaneScaffold` place
  one or two panes and handle back between them.
- **Never hard-code a screen size** or lock orientation. Android 16 and later
  ignore orientation and resizability restrictions on large screens, so an app
  that assumes portrait is broken there.
- **Content has a maximum readable width.** Text and forms do not stretch across
  a 1200 dp window; they centre or move into a pane.

## Configuration change

- **Rotation, resizing, folding and a window moving to another display are
  configuration changes.** The activity is recreated unless it handles them;
  either way, state survives because it lives in the ViewModel and
  `rememberSaveable` — see [state management](../state-management.md). Test it:
  rotate on every screen with input in it.

## Foldables

- **Posture is read, not assumed.** A half-opened device in tabletop posture
  reports a fold; a screen that benefits (a video, a camera) places content
  above it and controls below. Most screens just use the window size class.

## Input

- **Tablets get keyboards and mice.** Every clickable shows hover and focus
  states (Material components do), tab order is logical, and common actions
  have keyboard shortcuts where the app has a desktop-like workflow.
- **Text fields declare their keyboard** (`KeyboardOptions`) and IME action, and
  the layout moves above the IME with `imePadding()`.

## Device features inside mobile

A flow's platform file may list a device-family feature as a `features:`
entry with `scope: android:samsung` or `scope: android:oneplus`. Both run the
same `mobile` target as every other Android phone, so the entry is built behind
a capability check and never behind the vendor:

- **The check is the platform's own feature test** — for example
  `PackageManager.hasSystemFeature`, where the vendor documents a feature flag
  for it. The check asks whether this device has the feature, at run time.
- **The vendor name is a label, never the test.** It names the family the
  flow was designed for; the code does not read the device's maker or model to
  decide, because a feature moves between models and vendors drop it.
- **When the check fails, the code shows the entry's declared `fallback`.**
  The stack builds the fallback the flow names and never invents one, and a
  feature with no entry is not built.

The rule has no code example on purpose: the shape is the check, the feature
behind it, and the declared fallback in the other branch. No vendor worked case
ships in this release, because no stable public API was verified for Samsung or
OnePlus at plan time.

## Goldens

A screen shipped to both platforms has goldens under `mobile/` (Pixel 7
qualifiers) and `tablet/` (medium tablet qualifiers); one shipped to one
platform has goldens for that one only. See [testing](../testing.md).
