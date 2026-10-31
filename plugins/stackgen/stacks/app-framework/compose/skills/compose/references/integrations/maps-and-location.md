# Jetpack Compose — Maps and location

**Wiring, configuration and anti-patterns only.** The `GoogleMap` composable,
its camera, marker and overlay API, and the fused location provider's request
API are Context7's at use time.

Maps Compose (`com.google.maps.android:maps-compose`) puts the Maps SDK for
Android behind composables; Play Services Location supplies the fused location
provider. The two are separate concerns: a screen can show a map without the
user's position, and read a position without a map.

## Setup order

1. **Catalog entries** for `maps-compose` and, when the app reads the device's
   position, `play-services-location`.
2. **Keep the Maps API key out of source control.** The key lives in an
   ignored `secrets.properties` beside `local.properties`; the Secrets Gradle
   Plugin reads it, with a committed `local.defaults.properties` holding a
   placeholder so a fresh clone still builds. CI injects the real value.
3. **Manifest metadata**: a `com.google.android.geo.API_KEY` `<meta-data>`
   entry inside `<application>`, its value the `${MAPS_API_KEY}` placeholder
   the build fills — never the literal key.
4. **Declare only the location permissions the features use.**
   `ACCESS_COARSE_LOCATION` whenever the app needs a location;
   `ACCESS_FINE_LOCATION` only when a feature benefits from precise location;
   `ACCESS_BACKGROUND_LOCATION` only for a feature that reads location while
   no activity is visible and no foreground service runs — constant sharing,
   geofencing.
5. **Request in context**, per [platform interop](../platform-interop.md):
   foreground location from the action that needs it, with a rationale when
   the system says one is due, and a drawn state for denial. Background
   location is a separate decision with its own rationale, never part of the
   first request.
6. **Continuous tracking while the user leaves the screen** runs in a
   foreground service declared with `android:foregroundServiceType="location"`,
   which keeps the access foreground location.

## Structure

- **Location sits behind a repository** in the data layer, exposing a `Flow`;
  the ViewModel never holds the fused client or a `Context`.
- **Prefer one fresh fix to a stream.** A single current-location read suits
  most features; a stream of updates is for tracking, and stops when its
  collector does — an update request left running drains the battery when no
  fix is available.
- **The last known location can be null** — location off, never recorded, or
  Play services restarted — and a screen draws that case.
- **One-time grants are normal.** Since Android 11 the dialog offers "Only
  this time"; the app re-checks the permission on resume rather than caching
  the answer.
- **Session-only precise location** may need the system location button: an
  app targeting Android 17 whose features need location only for a session is
  required by Play policy to use it.
- **Map state is hoisted.** The camera position state is remembered by the
  screen, and markers are derived from UI state, so a position update moves one
  marker rather than rebuilding the overlay set.

## Testing

- **The emulator's position is set from its console** with `geo fix`, so a
  location path runs without a device in the field.
- **The repository is faked** in ViewModel and UI tests; no test reaches Play
  services.

## Per platform

- **Phone and tablet**: Maps Compose and the fused location provider, as
  above.
- **Wear OS**: the Maps SDK runs on the watch, shown through the View-based map
  fragment inside a swipe-to-dismiss layout, with ambient mode forwarded to the
  map; Maps Compose on Wear OS is not confirmed.
- **Android TV**: not confirmed.
- **Android Auto**: the car draws templates, not composables — see
  [Android Auto](../platforms/android-auto.md); a map there is the Car App
  Library's map or navigation template, not Maps Compose.

## Anti-patterns

| Anti-pattern                                   | Instead                                    |
| ---------------------------------------------- | ------------------------------------------ |
| Maps API key committed in the manifest         | the Secrets Gradle Plugin and a placeholder |
| Every location permission requested at launch  | each from the feature that needs it       |
| Background location for a visible screen       | foreground access, or a location service   |
| An update request never removed                | a `Flow` that stops with its collector     |
| The fused client held by a ViewModel           | a repository in the data layer             |
