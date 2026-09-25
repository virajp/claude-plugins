# SwiftUI — watchOS (`watch`)

The platform file a flow's `watch.md` take is realised on. A watch session
lasts seconds: the wrist comes up, the user reads or does one thing, the wrist
goes down. Every screen is judged by whether that one thing fits.

## Standalone or companion

The first decision, made once and recorded in the product's architecture:

- **Standalone** — the watch app installs and runs without the iPhone app. It
  fetches its own data over the network, signs in on its own, and treats the
  phone as an optional accelerator.
- **Companion** — the watch app depends on the iPhone app being installed, and
  the project marks it as not running independently.

**Either way, the phone is not the data source.** The watch-to-phone channel
may move data between them when both are reachable, but a standalone app may
not rely on it as its primary source, and a companion app degrades cleanly
when the phone is out of range. The watch app has its own networking and
persistence, per [data & networking](../data-and-networking.md), and shares
model and domain modules with the iOS app rather than re-implementing them.

## Glanceable screens

- **One screen, one purpose.** The most important fact is legible without
  scrolling, in a couple of seconds; anything secondary goes below it or to a
  second page.
- **Shallow hierarchies.** Vertical pages of a tab view for peer views, a
  navigation stack at most a level or two deep, per
  [navigation](../navigation.md). A task that needs a deep drill-down belongs
  on the phone.
- **Layout adapts to every case size.** The horizontal size class is always
  compact on the watch; lay out against the proposed size and the safe area,
  never a fixed frame.
- **Nothing needs a keyboard.** Input is a tap, a list pick, the Digital
  Crown, dictation or a short preset reply; a free-text form is a phone task.

## The Digital Crown

- **Scrolling is the crown's by default** for any scrolling container; do not
  intercept it without reason.
- **Value entry binds the crown** to a model value with a range, a step and a
  sensitivity, with haptic detents on each step — for a quantity, a time, a
  level. The bound view must be focusable, and the focused control shows it.
- **One crown consumer on screen at a time.** Two views competing for the crown
  is a focus bug.

## Complications and widgets

A complication is **a first-class surface beside the app's screens**: the flow's
watch take names which content surfaces there, and that content must be as
current and as correct as the app's own screen. Complications are WidgetKit
widgets in the accessory families, fed by a timeline — wiring is
[widgets & complications](../integrations/widgets-and-complications.md)'s.
A tap on a complication opens the app on the matching screen through the one
router.

## Short sessions

- **Resume where the user was**, fast: the app is ready to show current data
  the moment it appears, from a cache refreshed in the background, rather than
  spinning on a network call.
- **Work that outlives the session** — a workout, a timer — uses the system's
  extended runtime or background mechanisms, never a view that has to stay on
  screen.

## The contract

A `watch` screen follows the flow's platform file: the glanceable content
against the phone screen, the crown for scrolling and value entry, which
content becomes a complication, and every task done in seconds. The `watch`
take is selective, so a flow with no watch screen has no watch code.
