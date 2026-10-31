# Jetpack Compose — Glance app widgets

A home-screen widget is a surface beside the app's screens, and the flow names
which content surfaces there. It is built with Jetpack Glance
(`androidx.glance:glance-appwidget`, with `glance-material3` for the theme): a
Compose-style API that is **not Compose UI**. Glance composables translate to
`RemoteViews` drawn by the launcher, so the app's composables, modifiers and
`androidx.compose.material3` components cannot be used inside a widget.

## Wiring

- **A `GlanceAppWidget`** builds the content in `provideGlance`, loading what
  it shows and then calling `provideContent { }` with Glance composables
  (`androidx.glance.*`, never `androidx.compose.ui.*`).
- **A `GlanceAppWidgetReceiver`** names that widget, and is declared in the
  manifest as a receiver with the `APPWIDGET_UPDATE` action and an
  `appwidget-provider` XML giving the sizes, the resize mode, the preview and
  the configuration activity if one exists.
- **The theme is `GlanceTheme`**, fed from the design system's colour tokens,
  with dynamic colour where the launcher supports it.

## State and updates

- **The widget reads the app's repositories**, never a copy of their data.
  Per-instance state (which list a widget shows) lives in Glance's state
  definition, keyed by the widget id.
- **Updates are pushed, not polled.** When the data changes, the app calls
  `update` for one widget or `updateAll` for every instance; periodic refresh
  goes through WorkManager, per
  [WorkManager](integrations/workmanager.md), never a tight
  `updatePeriodMillis`.

## Size and layout

- **`SizeMode.Responsive`** with the few sizes the design names, or
  `SizeMode.Exact` when the content truly varies with every size; the content
  branches on `LocalSize`.
- **Glance layouts are limited**: `Row`, `Column`, `Box`, `LazyColumn`, `Text`,
  `Image`, `Button`. A design that needs more is a design for the app, not the
  widget.

## Actions

- **A tap opens the app on the matching screen** with `actionStartActivity`
  and a deep link through the one router, per [navigation](navigation.md).
- **An in-place action** (mark done, play) runs through `actionRunCallback`,
  calls the same domain code the app does, then updates the widget.

## Testing

Widget content is unit-tested with `androidx.glance:glance-appwidget-testing`
(`runGlanceAppWidgetUnitTest`), asserting on the nodes it provides. A widget is
not a screen the `ux-gate` renders: its preview image is reviewed by hand. See
[testing](testing.md).
