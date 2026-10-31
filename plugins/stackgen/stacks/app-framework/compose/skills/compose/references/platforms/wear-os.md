# Jetpack Compose — Wear OS (`watch`)

The platform file a flow's `watch.md` take is realised on. A watch session
lasts seconds: the wrist comes up, the user reads or does one thing, the wrist
goes down. Every screen is judged by whether that one thing fits.

## Its own module, its own library

- **The watch app is its own application module** beside the phone app, sharing
  the domain and data modules rather than re-implementing them, per
  [project layout](../project-layout.md). It is never the phone app's UI
  shrunk.
- **Compose for Wear OS, not phone Compose Material.** The UI is
  `androidx.wear.compose:compose-material3` on
  `androidx.wear.compose:compose-foundation`; the phone's
  `androidx.compose.material3` components are not used on the watch. The
  design system's tokens map into the Wear theme, which scales them for a
  round screen.
- **The manifest declares the form factor**:
  `<uses-feature android:name="android.hardware.type.watch" />`, and the
  `com.google.android.wearable.standalone` meta-data saying whether the app
  works without a phone.

## Standalone or companion

The first decision, made once and recorded in the product's architecture.
**Either way, the phone is not the data source.** A standalone app fetches its
own data over the network and signs in on its own; a companion app degrades
cleanly when the phone is out of range. The Data Layer may move data between
them when both are reachable — see
[data & networking](../data-and-networking.md).

## Glanceable screens

- **The scaffold is the frame.** `AppScaffold` at the root holds the time text
  across screens; each screen is a `ScreenScaffold` that owns its scroll
  indicator and edge buttons.
- **Lists are `TransformingLazyColumn`**, whose items scale and fade at the
  round edges; content padding comes from the scaffold, never a fixed inset.
- **One screen, one purpose, shallow hierarchy.** The most important fact is
  legible without scrolling; a task that needs a deep drill-down belongs on
  the phone. Nothing needs a keyboard: input is a tap, a list pick, the
  rotating side button or bezel, voice or a preset reply.
- **Lay out for round and square**, small and large, against the scaffold's
  padding — never a fixed frame.

## Navigation and input

- **Back is a swipe.** Navigation uses the Wear swipe-to-dismiss host
  (`SwipeDismissableNavHost`, or the Wear scene strategy under Navigation 3),
  never the phone's back handling — see [navigation](../navigation.md).
- **Rotary input scrolls** every scrolling container through the scaffold's
  state; value entry binds the rotary input to a stepper or a picker. One
  rotary consumer on screen at a time.

## Tiles and complications

A **tile** and a **complication** are surfaces beside the app's screens, and
the flow's watch take names which content surfaces there. Neither is Compose:

- **A tile** is a `TileService` returning a ProtoLayout layout
  (`androidx.wear.tiles`, `androidx.wear.protolayout-material3`), registered
  in the manifest with a preview image. It is rebuilt from the same repository
  the app reads; it never holds state of its own.
- **A complication** is a `ComplicationDataSourceService` (its coroutine form
  `SuspendingComplicationDataSourceService`) declaring its supported types and
  update period in the manifest.
- A tap on either opens the app on the matching screen through the one router.

## Goldens

A `watch` screen's goldens render under `watch/` on a round Wear OS device
qualifier (`RobolectricDeviceQualifiers.WearOSLargeRound`), wrapped in the Wear
theme. Tiles are tested with `androidx.wear.tiles:tiles-testing` and are not
goldens the `ux-gate` reads. See [testing](../testing.md).

## The contract

A `watch` screen follows the flow's platform file: the glanceable content
against the phone screen, rotary input for scrolling and value entry, which
content becomes a tile or a complication, and every task done in seconds. The
`watch` take is selective, so a flow with no watch screen has no watch code.
