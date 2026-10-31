# Jetpack Compose — previews

`@Preview` renders a composable in the IDE. Previews are a design-time tool;
the goldens are the record of what the app looks like — see
[testing](testing.md).

## The rules

- **Preview the stateless screen**, never the route.
  `<Screen>Screen(uiState = …)` with a fake UI state renders without a
  ViewModel, Hilt or the network; a preview that needs any of those is a sign
  the screen is not stateless.
- **One preview per meaningful state** — loading, content, empty, error —
  using the same sample UI states the goldens use, kept in one
  `<Screen>PreviewData` object in the test fixtures or the module's debug
  source set.
- **Wrap every preview in the app theme**, so colour roles and type resolve as
  they do on a device.
- **Multipreview annotations** cover the variations once: a
  `@PreviewLightDark`, `@PreviewFontScale` and `@PreviewScreenSizes` (or the
  project's own annotation combining them) on each screen's preview, so dark
  mode, font scale 2.0 and the tablet width are looked at while building, not
  discovered in review.
- **Previews are `private` and live beside the composable** they preview, in
  the main source set; the tooling dependency they need is debug-only, so they
  cost the release build nothing.
- **`@PreviewParameter`** feeds a list of states through one preview function
  when the states are many and uniform.

## What a preview is not

- **Not a test.** Nothing fails when a preview changes. A screen whose look
  matters has a golden.
- **Not a golden generator in this stack.** Roborazzi can generate tests from
  previews, but the goldens here are hand-written tests named by screen code and
  state, so the `ux-gate` can find them; a preview carries no screen code.
