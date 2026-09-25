# SwiftUI — widgets & complications (WidgetKit)

**Wiring, platform configuration and anti-patterns only.** The API surface —
configurations, timeline providers, families, relevance — is Context7's at use
time, and is the half that ages. This reference carries the setup order and the
parts a per-type lookup gives only piecemeal.

WidgetKit is one mechanism across the platforms that host widgets: a home or
lock screen widget on iOS and iPadOS, a desktop and Notification Center widget
on macOS, and on watchOS the complication on a watch face and the card in the
Smart Stack. A watch complication **is** a widget in an accessory family;
ClockKit is the retired path, and an existing ClockKit complication is migrated
to a widget rather than extended.

## Setup order

1. **Add a Widget Extension target** in Xcode, one per platform product that
   shows widgets — the iOS app's extension, the watch app's extension, the
   Mac app's extension. It is a project change, made and committed as
   [project layout](../project-layout.md) says. A single extension carries
   every widget kind for its platform; do not add a target per widget.
2. **Give the extension the modules it renders from**, never the app target —
   the shared core's models and design-system views, linked as its own
   dependency edges.
3. **Join the app and the extension to one App Group** — the App Groups
   capability on both targets, the same group identifier in both entitlements.
   The extension runs in its own process with its own container; the group
   container is the only storage both sides see.
4. **Decide the data path before the views.** The app writes the snapshot the
   widget needs into the group container — a small, already-shaped record, not
   the app's whole store — and the widget reads it. A widget that fetches from
   the network on every timeline request is a widget that shows a placeholder.
5. **Tell WidgetKit when the data moved.** The app asks for a timeline reload
   of the affected widget kind after it writes, and the timeline's own reload
   policy covers only what the widget can predict on its own. Reloads are
   budgeted by the system; an app that reloads on every change runs out.
6. **Sign the extension** with the same team and a bundle identifier nested
   under the app's; see [build & signing](../build-and-signing.md).

## Per platform

- **iOS and iPadOS** — system families on the home screen, accessory families
  on the lock screen. Declare only the families the design actually draws.
- **macOS** — the same system families on the desktop and in Notification
  Center. A Mac group identifier may take the team-id form, which needs no
  registration, or the `group.` form iOS uses, which macOS honours only when
  a provisioning profile embedded in the app authorises it or the app ships
  through the Mac App Store; otherwise a Mac extension is denied the group
  container. Check the form in both entitlements.
- **watchOS** — accessory families only: the complication slots on a face and
  the Smart Stack. Relevance hints decide when the Smart Stack surfaces the
  widget; a watch widget with no relevance information may simply never appear
  there. Data usually reaches the watch app first (from its own fetch or from
  the phone), which writes to its own group container and reloads — the phone's
  group container is not the watch's.
- **Configurable widgets** take their options from an App Intent, so a
  configurable widget shares its intent types with
  [App Intents](app-intents.md) — keep those types in a module both the app and
  the extension link.

## Anti-patterns

| Anti-pattern                                     | Why                                                        | Instead                                           |
| ------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------- |
| Widget reads the app's database directly         | Two processes, one store, migrations run from the app only | Write a small snapshot to the group container     |
| Different group identifiers on app and extension | Both sides read an empty container, silently               | One identifier, checked in both entitlements      |
| Extension depends on the app target              | Cannot link; drags the app into the extension              | Depend on the shared modules                      |
| Reloading timelines on every app state change    | Budget exhausted; widget stops updating                    | Reload the affected kind after a meaningful write |
| Network fetch inside the timeline request        | Times out; placeholder shown                               | Fetch in the app or a background task, then write |
| New ClockKit complication code                   | Retired path                                               | A WidgetKit accessory widget; migrate the old one |
| One widget kind per data variant                 | Gallery clutter; duplicate code                            | One kind with a configuration intent              |
