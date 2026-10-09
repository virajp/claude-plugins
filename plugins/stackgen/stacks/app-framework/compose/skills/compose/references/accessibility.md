# Jetpack Compose — accessibility

Compose builds a **semantics tree** beside the composition. TalkBack, Switch
Access, the test framework and the Accessibility Test Framework all read it.
Material components fill it in; anything custom must.

## The rules

- **Every meaningful image and icon has a `contentDescription`**; a decorative
  one passes `null` so TalkBack skips it. Descriptions are string resources,
  never literals.
- **Touch targets are at least 48×48 dp.** Material components enforce it;
  a custom `clickable` on a small element uses
  `minimumInteractiveComponentSize()` or padding inside the click area.
- **Merge what reads as one thing.** A row of an icon, a title and a subtitle
  that acts as one control is `Modifier.semantics(mergeDescendants = true)` (or
  `clickable`, which merges), so TalkBack reads it once.
- **Custom controls declare their role and state** — `role = Role.Switch`,
  `stateDescription`, `toggleableState` — through `semantics` or the
  `toggleable` / `selectable` modifiers rather than a bare `clickable`.
- **Headings are marked** with `semantics { heading() }` so screen-reader users
  can jump between sections.
- **Text scales.** Sizes are `sp` from the type scale; layouts survive font
  scale 2.0 without clipping or overlapping — test it in previews and goldens.
- **Contrast meets WCAG AA**: 4.5:1 for body text, 3:1 for large text and
  essential non-text elements. The design system's colour roles carry this; a
  screen does not override them.
- **Order follows reading order.** When layout order and meaning differ, set
  `traversalIndex` or `isTraversalGroup` rather than reordering the layout.
- **Custom actions** (`customActions`) expose swipe-to-dismiss and long-press
  menus to users who cannot perform the gesture.

## Checked automatically

- **Every golden is also an audit.** The golden tests run Roborazzi's
  accessibility check with the Accessibility Test Framework's latest preset
  over the captured screen — missing labels, small touch targets, low contrast,
  duplicate descriptions. A failure is a finding at WCAG A/AA severity; see
  [testing](testing.md).
- **Compose UI tests can run the same checks** with
  `composeTestRule.enableAccessibilityChecks()` (the
  `ui-test-junit4-accessibility` artifact), triggered by any action or by
  `tryPerformAccessibilityChecks()`.
- **What automation misses** — a description that is present but wrong, a
  confusing focus order, an announcement that never fires — is checked by hand
  with TalkBack before a screen ships.
