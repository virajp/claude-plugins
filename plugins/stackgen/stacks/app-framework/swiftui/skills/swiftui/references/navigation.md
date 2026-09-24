# SwiftUI — navigation & routing

Navigation is **data-driven**: the stack a user sees is a value in a model, and
views are resolved from that value by type. That one choice is what makes deep
links, state restoration and tests of navigation possible.

## The route model

- **Routes are values.** Each destination is a case of a `Hashable` route type
  (usually an enum, one per feature or one for the app) carrying the
  identifiers it needs — an id, never a whole model object that may go stale.
- **The path is state the app owns.** A `NavigationStack` is bound to a path —
  a typed array of routes where every element is one type, a `NavigationPath`
  where elements are heterogeneous — held by a model, not by the view.
- **Destinations are registered once per type**, on the stack's root, with
  `navigationDestination(for:)`. A link pushes a value; the stack resolves the
  view. Never construct a destination view inside the link.
- **Programmatic navigation is a path mutation.** Push by appending, pop by
  removing, pop to root by clearing. A model method does it; a test asserts the
  path.

## Stack or split

| Surface shape                                  | Container                           |
| ---------------------------------------------- | ----------------------------------- |
| A drill-down hierarchy on one column           | `NavigationStack`                   |
| A list-and-detail product on a wide surface    | `NavigationSplitView`               |
| Peer top-level sections                        | a `TabView`, each tab its own stack |
| A self-contained task that returns a result    | a sheet or full-screen cover        |

A split view **collapses** into a single stack in compact width — an iPhone,
iPad Slide Over. Tell it which column to show first when collapsed, and design
the detail so it works both beside the list and pushed onto it. Each tab owns
its own path, so switching tabs never loses another tab's place.

Modal presentation is state too: a sheet is driven by an optional item on the
model, so presenting and dismissing are assignments a test can drive.

## Deep links

- **One router in the composition root** turns an incoming URL, universal link,
  notification or intent into route values and writes them into the owning
  model's path — and selects the tab, if any.
- **Parse into routes, never into views.** The router validates the URL and
  produces routes or nothing; an unknown or malformed link lands on a defined
  screen, never a crash or a blank stack.
- **The same entry for every source.** A URL scheme, a universal link, a
  widget tap, a notification, a Spotlight result and an App Intent all funnel
  into the one router, so each is tested once.
- The associated-domains entitlement and URL scheme declarations are
  [build & signing](build-and-signing.md)'s.

## State restoration

Because the path is data, it can be persisted: encode the path when it changes,
decode it at launch. A typed array of `Codable` routes encodes directly; a
heterogeneous path exposes a codable representation only when every element is
`Codable`, so check for it rather than assuming. A route whose target no longer
exists on decode is dropped, not shown as an empty screen.

## Per-platform idioms

Each platform's back-stack expectation wins over a shared shape:

- **mobile / tablet** — edge-swipe back on a stack, tabs at the bottom, split
  view on the wider sizes.
- **desktop** — windows and a sidebar; navigation often opens a new window
  rather than pushing, and the menu bar carries commands.
- **watch** — shallow hierarchies, vertical pagination, one task at a time.
- **tv** — the focus engine drives everything; the Menu button is back, and a
  focus trap is a navigation bug.
- **spatial** — windows, volumes and immersive spaces; navigation within a
  window is a stack, opening a new window or space is a scene action.
- **auto** — CarPlay presents system templates; the app supplies content, not
  navigation chrome.

Depth per platform lives in the platform references, not here.
