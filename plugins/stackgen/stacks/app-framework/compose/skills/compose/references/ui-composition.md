# Jetpack Compose — UI composition & theming

## Material 3 is the design system's carrier

- **One app theme composable**, `<App>Theme`, in the design-system module,
  wrapping `MaterialTheme(colorScheme, typography, shapes)`. Every screen,
  preview and golden is drawn inside it.
- **The design system's tokens become Material's roles.** Colours map onto the
  `ColorScheme` roles (`primary`, `onPrimary`, `surface`, `surfaceContainer`…),
  type onto the `Typography` scale (`displayLarge` … `labelSmall`), corner radii
  onto `Shapes`. A token Material has no role for is a field of a small custom
  theme object provided through a `CompositionLocal`, read the same way.
- **Composables read the theme, never a literal.**
  `MaterialTheme.colorScheme.primary`, `MaterialTheme.typography.bodyLarge` —
  no hex colour, no raw `sp` size in a screen. A literal is a token the design
  system does not know about.
- **Light and dark are two `ColorScheme`s**, chosen by `isSystemInDarkTheme()`.
  Dynamic colour (`dynamicLightColorScheme`) is used only when the design
  system says so; a brand palette usually overrides it.
- **Edge-to-edge is the default.** `enableEdgeToEdge()` in `MainActivity`, and
  each screen applies window insets through `Scaffold`'s content padding or the
  `WindowInsets` modifiers — never a hard-coded status-bar height.

## Layout

- **`Column`, `Row`, `Box` and the lazy lists are the vocabulary.** A long or
  unbounded list is `LazyColumn` / `LazyVerticalGrid` with a stable `key` per
  item; a scrolling `Column` over a large list composes every item.
- **Modifiers order matters.** `padding` then `clickable` makes the padding
  untappable; `clickable` then `padding` makes it part of the target. Pass a
  `modifier: Modifier = Modifier` parameter as the first optional parameter of
  every reusable composable and apply it to the root.
- **Size from the space given.** Use `fillMaxWidth`, `weight` and the window
  size class — never a screen width read from the device. Adaptive layout is
  [phone & tablet](platforms/phone-and-tablet.md)'s.
- **`Scaffold`** owns the top bar, bottom bar, FAB and snackbar host of a
  screen; a screen does not position those itself.

## Components

- **Material 3 components first**, styled through the theme. A custom
  component is built from Material's and lives in the design-system module.
- **Component state is hoisted** — a text field's value, a sheet's visibility —
  so goldens can render each state directly.

## Animation

- **`animate*AsState`, `AnimatedVisibility`, `AnimatedContent`** for
  state-driven changes; `updateTransition` when several values move together.
  Durations and easing come from the design system's motion tokens.
- **Animate in the draw or layout phase where possible** — `graphicsLayer`
  alpha and translation do not recompose.
- **Respect reduced motion**: when the system's animator duration scale is 0,
  transitions are instant, and nothing essential is conveyed by motion alone.

## Localization

- **Every user-facing string is a string resource**, read with
  `stringResource`; a count goes through a `<plurals>` resource and
  `pluralStringResource`, never an `if (n == 1)` in a screen. A string literal
  in a screen is a translation the app cannot ship.
- **Per-app language** is the system's: turn on `generateLocaleConfig` in the
  module's `androidResources` block and set the default in
  `res/resources.properties` (`unqualifiedResLocale`), so the locales come from
  the `values-*` folders. An in-app picker calls
  `AppCompatDelegate.setApplicationLocales`; on Android 13 and later the system
  stores the choice, below it the app opts into the library's storage.
- **Numbers, dates and times go through a formatter** for the current locale —
  the `android.icu.text` formatters — never a hard-coded pattern; a time
  observes the user's 12- or 24-hour setting.
- **Preview each shipped locale** with the `@Preview` `locale` parameter,
  grouped into one multipreview annotation, so a long translation is seen
  before it ships.
- **Right-to-left comes for free with `start` and `end`.** Padding and
  alignment use `start`/`end`, a custom layout places children with
  `placeRelative`, and an RTL preview sets `LocalLayoutDirection` — never
  `left`/`right` for anything that should mirror.

## Anti-patterns

| Anti-pattern                        | Why                                   | Instead                              |
| ----------------------------------- | ------------------------------------- | ------------------------------------ |
| Hex colours and `sp` sizes in screens | drifts from the design system       | theme roles and the type scale       |
| `Column(Modifier.verticalScroll)` over hundreds of items | composes every item | `LazyColumn` with keys        |
| Status-bar padding as a constant    | wrong on every other device           | window insets                        |
| A composable without a `modifier` parameter | callers cannot place it       | `modifier: Modifier = Modifier`      |
