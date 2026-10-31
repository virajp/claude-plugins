# SwiftUI — iOS & iPadOS (`mobile`, `tablet`)

The platform file a flow's `mobile.md` and `tablet.md` takes are realised on.
One target serves both: an iPhone and an iPad are the same app reading a
different environment, never two codebases. What differs is space, input and
how many copies of the app are on screen at once — and all three are read at
run time, never inferred from the device model.

## Layout follows the size class, not the device

- **Branch on the horizontal size class**, read from the environment. Compact
  is a single column; regular has room for a sidebar, a split view or a
  second column. The system sets it from the device, the orientation and the
  iPad multitasking mode, so an iPad in a narrow Split View or Slide Over is
  **compact** — an iPad-only layout keyed on the idiom breaks there.
- **One view, adaptive**, before two views: a split view that collapses to a
  stack in compact width, a grid whose column count follows the available
  width, a toolbar that moves items into a menu when it runs out of room. A
  second view per size class is for a genuinely different layout, chosen in
  one place.
- **Never hard-code a screen size.** Lay out against the proposed size and the
  safe area; a fixed frame is a bug on the next device.
- The stack-or-split choice and how a split collapses are
  [navigation](../navigation.md)'s.

## iPad multitasking

- **Multiple windows are opt-in.** An iPad app shows more than one window only
  when its scene manifest declares support for multiple scenes; until then the
  environment reports that multiple windows are unsupported and an open-window
  action is ignored with a logged error. Read that value before offering "open
  in new window", and hide the command where it is false.
- **Each window is its own scene with its own state.** Per-window state —
  selection, navigation path, a draft — lives in scene storage or a
  per-scene model, never in an app-wide singleton, so two windows on the same
  data do not fight over one selection. Shared data is the model layer's, per
  [state management](../state-management.md).
- **Resizing is continuous.** A window can be any width the system allows, and
  can change width while the user watches; every layout survives a live
  resize without losing state.
- **Pointer and keyboard are real inputs on iPad.** Hover effects on custom
  controls, keyboard shortcuts on the commands a keyboard user reaches for, and
  a focus order that works from the Tab key. A hardware keyboard is not an edge
  case on an iPad.

## Dynamic Type

- **Text uses semantic text styles** and scales with the user's preferred size;
  a fixed point size is refused except where the design system pins one for a
  reason it states.
- **Layouts reflow at the accessibility sizes**: a horizontal row that cannot
  fit becomes a vertical stack, read from the environment's dynamic type size,
  rather than truncating. A custom metric that must scale with text — a
  padding, an icon — scales with it.
- **Clamp only where the design system says so.** Limiting the range a view
  scales across is a deliberate exception, recorded, never a fix for a layout
  that did not reflow.
- **Every screen is previewed at the largest accessibility size** as well as
  the default; the golden tests of [testing](../testing.md) carry both.

## The contract

A `mobile` or `tablet` screen follows the flow's platform file: the navigation
idiom that platform expects (tabs at the bottom and edge-swipe back on a phone,
a sidebar on a regular-width iPad), touch targets of the platform's minimum
size, and the design system's tokens throughout. The difference between the two
tokens is layout, never behaviour — a task the phone can do, the tablet can do.

**OS-specific features are declared, then guarded.** A flow's platform file
may list an OS-specific feature as a `features:` entry. An entry with
`scope: ios` is built behind an availability check (`#available`) at the
smallest scope that needs it, per [platform interop](../platform-interop.md),
and the code shows the entry's declared `fallback` wherever the check fails.
The stack builds the fallback the flow names; it never invents one, and a
feature with no entry is not built.

## Device features inside mobile

The worked case is the **Dynamic Island**. It is present on iPhone models with
a Dynamic Island and absent on earlier iPhones, and both run the same `mobile`
target. Two separate things decide what a user sees, and the code handles
each:

- **The OS** — Live Activities, which feed the island, need iOS 16.1. Guard
  the call that starts one with `#available(iOS 16.1, *)`, and check that the
  user has not turned Live Activities off before starting one. The `else`
  branch shows the declared fallback.
- **The hardware** — no availability check sees the island itself. A Live
  Activity carries two presentations: the island's, and the Lock Screen's,
  which the system shows as a banner on a device without the island. Build
  the Lock Screen presentation as the declared fallback, so a device without
  the island still shows what the flow asked for.

The pattern, with the fallback left as the declaring flow sets it:

```swift
func startTracking(_ order: Order) {
    if #available(iOS 16.1, *),
       ActivityAuthorizationInfo().areActivitiesEnabled {
        startOrderActivity(order) // the island, or the Lock Screen banner
    } else {
        showDeclaredFallback(for: order) // the flow's `fallback`, as written
    }
}
```

The example shows the shape, not a product's answer: what the fallback is —
an in-app banner, a status row, nothing at all — is the flow's `fallback`
field, read from the entry, never chosen here.
