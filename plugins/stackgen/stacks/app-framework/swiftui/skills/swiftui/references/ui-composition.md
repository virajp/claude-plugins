# SwiftUI — UI composition & theming

A screen is a composition of small views, styled only through the product's
design system, laid out by the space it is given rather than by the device it
is on.

## Compose small views

- **A view is a struct with one reason to change.** Split a screen into
  subviews along the lines its state changes on — a header that reads the user,
  a list that reads the items, a footer that reads nothing. Each subview reads
  only what it renders.
- **Subview structs, not helper methods.** A method returning `some View` is
  re-run with its parent every time; a subview struct is a boundary SwiftUI can
  skip when its inputs have not changed.
- **Custom modifiers and styles for repeated treatment.** A card treatment used
  twice is a `ViewModifier`; a button look used across the app is a
  `ButtonStyle`. Never copy a chain of modifiers between screens.
- **Stable identity.** Lists and `ForEach` iterate `Identifiable` elements
  whose id is the model's own, never an index and never a fresh `UUID()`.
  Branching with `if` changes a view's identity — resetting its state and
  animation — so prefer a modifier driven by a value when only the appearance
  changes.

## Theming against the design system

The product's `docs/blueprint/design-system.md` defines **semantic tokens** —
colour roles, type roles, spacing steps, radii, motion — and screens reference
those roles, never raw values.

- **Tokens become code once, in the core module.** Colours are named colour-set
  assets (each carrying its light, dark and increased-contrast variants), read
  through one accessor per semantic role. Type roles map onto the system's
  text styles so Dynamic Type scales them. Spacing, radii and durations are
  named constants.
- **Theme values the subtree varies travel through the environment** — declare
  an environment entry for the theme and read it where it is applied. A value
  that never varies is a constant, not an environment entry.
- **Design-system primitives live in core.** A feature composes the primitives
  and never restyles one locally; a screen that needs a variant the design
  system lacks is a design-system gap to raise, not a local override.
- **No literal colour, font size or padding in a feature view.** A literal is
  a token the design system forgot, or a drift from one it has.

## Adaptive layout

Lay out by the **space available**, not the device model:

- **Size classes** say whether the horizontal and vertical space is compact or
  regular. They change at runtime — rotation, Split View, Stage Manager,
  window resizing — so a layout reads them from the environment and handles the
  change rather than deciding once. On watchOS the horizontal class is always
  compact; on macOS and tvOS it is always regular.
- **`ViewThatFits`** picks the first of several layouts that fits — a
  horizontal arrangement that falls back to vertical — without reading a size
  class at all. Prefer it for local decisions.
- **Containers that adapt by themselves** — split navigation, `Form`, `List`,
  grids — before hand-built geometry. `GeometryReader` is for the rare view
  whose drawing depends on its exact size; it is never the way to build a
  layout.
- **Dynamic Type is a layout input.** Every screen works at the largest
  accessibility sizes: text wraps, stacks switch axis where they no longer fit,
  nothing truncates information away.

Per-platform layout conventions — the watch's glanceable column, tv's focus
grid, spatial's windows and volumes, CarPlay's templates — are a sentence
each here: each platform's idiom wins over a shared layout, and the model
underneath stays shared.

## Animation

- Animate **state changes**, not views: a `withAnimation` around the model
  change, or an `.animation(_:value:)` scoped to the value that drives it.
  An unscoped animation animates everything that happens to change.
- Durations and curves come from the design system's motion tokens.
- Respect Reduce Motion: read the accessibility setting and replace movement
  with a cross-fade or nothing.

## Accessibility is part of composition

- Every control has an accessibility label that says what it does, not what it
  looks like; images that only decorate are hidden from assistive technology.
- Group what reads as one thing into one accessibility element.
- Tap targets meet the platform's minimum; contrast meets the design system's
  stated standard in every colour scheme.
- The gate that checks this is the repo's `ux-gate` skill — see
  [testing](testing.md).
