# SwiftUI — maps & location (MapKit, Core Location)

**Wiring, platform configuration and anti-patterns only.** The API surface —
the map view and its content, camera positions, map controls, the location
manager, live updates, authorization and accuracy values — is Context7's at
use time, and is the half that ages. This reference carries the usage strings,
the authorization order, the background mode and the testing wiring a per-type
lookup gives only piecemeal.

Two frameworks, one feature: **MapKit** draws the map and its content, and
**Core Location** tells the app where the device is. A map that only shows
places needs no location permission at all; the moment the app reads the
user's position — to centre the map, to show the user's own annotation, to
filter by distance — Core Location's authorization applies, and everything
below with it.

## Setup order

1. **Decide what the feature needs** before any key is written: a map with no
   user position, the position while the app is in use, or the position while
   it is not. Each step up costs a prompt, a usage string and a review
   question; ask for the least the feature works with.
2. **Write the usage strings** in the app's `Info.plist`, localised with the
   app's other strings. `NSLocationWhenInUseUsageDescription` is required for
   any request; asking for Always needs
   `NSLocationAlwaysAndWhenInUseUsageDescription` as well. The strings say what
   the user gets, not that the app "needs location".
3. **Put location in one module**, owned by the composition root: one location
   manager, created once on the main actor, publishing the current position and
   the authorization state the views read. Views never create their own manager
   — see [standards & architecture](../standards-and-architecture.md).
4. **Request When In Use, in context** — when the user first opens the feature
   that uses the position, with the app in the foreground, where the prompt can
   be shown. The request does nothing once a status is decided; a denied user
   is sent to Settings, not prompted again.
5. **Ask for Always only after When In Use was granted**, and only for a
   feature that truly runs while the app is not on screen. The upgrade prompt
   offers keeping When In Use; plan for that answer. A user who chose Allow
   Once has a temporary grant, and the Always request is ignored.
6. **Handle reduced accuracy.** The user can grant an approximate position —
   reduced in space and time, typically within 1 to 20 kilometres, and with no
   region monitoring or beacon ranging. Design the feature to work with it; for
   the one moment that needs precision, add a purpose string under
   `NSLocationTemporaryUsageDescriptionDictionary` and request temporary full
   accuracy with that purpose key while the app is in the foreground. The
   request fails when the key is missing, when full accuracy is already
   granted, or when the app is in the background.
7. **Add background location only if step 1 said so** — Background Modes →
   Location updates, which writes `UIBackgroundModes` with `location`. Turning
   background updates on without that key terminates the app. Turn background
   updates on only while the feature that needs them is active, and show the
   background location indicator so the user can see and stop it.

## Structure

- **Observe authorization, do not assume it.** The status can change at any
  time from Settings; the location module reacts to every change, turns
  features off when access is revoked, and on when it is granted.
- **Live updates are a stream the module owns.** Start them when a feature
  needs positions and stop them when it does not; an update loop left running
  for the app's lifetime is a battery cost the user sees.
- **The map reads the module's state**, never a second manager. Showing the
  user on the map is a map content choice and still needs the authorization
  above.
- **CarPlay** is a separate surface with its own rules: a navigation app needs
  the CarPlay maps entitlement granted by Apple, draws its map in a base view
  controller set as the CarPlay window's root, and places controls only through
  the map template overlaid on it — the base view carries no other UI. The
  CarPlay scene is UIKit; the SwiftUI map is not dropped into it.

## Testing

- **Simulated locations** come from GPX files loaded through the Xcode
  debugger; commit the GPX files the team uses beside the UI tests so a route
  can be replayed.
- **Reject simulated positions where it matters.** A location reports whether
  software simulation generated it; a feature where the true position is
  critical refuses simulated ones outside debug and test builds.
- **Unit-test the module behind a protocol** — authorization changes, reduced
  accuracy and denial driven by a fake, not by the simulator's prompt.

## Per platform

- **iOS and iPadOS** — the full set above: When In Use, Always, reduced
  accuracy, background updates and the indicator.
- **macOS** — When In Use, Always, reduced accuracy and background updates are
  available; the status-bar indicator is not.
- **watchOS** — When In Use, Always and background updates are available. A
  watch app follows the permissions granted on the paired iPhone, and a watch
  on software older than watchOS 7 receives no location at all when the user
  chose reduced accuracy.
- **tvOS** — When In Use is available; Always and background updates are not.
- **visionOS** — When In Use and reduced accuracy are available; an iPhone or
  iPad app running there that asks for Always gets When In Use instead.
- **The SwiftUI map** is listed for iOS and iPadOS 17, macOS 14, tvOS 17 and
  watchOS 10 and later; visionOS support for it is not confirmed — check the
  initializer used at the target's floor.
- **CarPlay** — the CarPlay maps entitlement is iOS and iPadOS; see Structure.

## Anti-patterns

| Anti-pattern                                     | Why                                                    | Instead                                              |
| ------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| Location prompt at first launch                  | Denied before the user sees the value                  | Request when the feature that uses it opens          |
| Asking for Always up front                       | Two prompts, a harder review, a likely "keep"          | When In Use first; Always only for background work   |
| A location manager per view                      | Duplicate prompts, streams and state                   | One location module from the composition root        |
| Feature that breaks under reduced accuracy       | The user's choice silently disables it                 | Work approximate; ask temporary full accuracy        |
| Background updates on without the background key | The app is terminated                                  | Add the Location updates background mode first       |
| Background updates left on permanently           | Battery drain the user sees and revokes                | On while the feature runs, with the indicator shown  |
| Usage string "This app needs your location"      | Tells the user nothing; review pushback                | Say what the user gets                               |
| Arbitrary SwiftUI views on the CarPlay base view | Not allowed; controls belong to the map template       | Draw the map only; controls through the template     |
| Trusting a simulated position in production      | Spoofed locations pass                                 | Check the simulation flag where position is critical |
