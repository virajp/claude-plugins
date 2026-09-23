# SwiftUI — performance & artifact size

Performance is measured, never judged by eye: **profile a Release build on a
physical device** with Instruments. The simulator and Debug builds measure
nothing real.

## The model: bodies, dependencies, identity

SwiftUI re-evaluates a view's `body` when something that body read changes,
diffs the result, and updates only what differs. So cost comes from three
places:

- **Too many bodies re-evaluated** — a view reads more state than it renders,
  and every unrelated change re-runs it.
- **An expensive body** — work done while describing the view: formatting,
  sorting, filtering, decoding, allocating.
- **Unstable identity** — ids that change between updates, so SwiftUI tears
  down and rebuilds views (and their state) it could have kept.

## Keep bodies cheap and narrow

- **A body only describes.** Sorting, filtering and formatting happen in the
  model when the data changes, and the body reads the result. A formatter is
  created once, not per evaluation.
- **Read only what you render.** Split views so each reads the smallest slice
  of state it shows — [state management](state-management.md) has the rules.
  Pass a row its element, not the model.
- **Subview structs, not helper methods**, so an unchanged subview is skipped.
- **Stable, cheap ids** in `ForEach` — the model's own identifier. Keep each
  element producing a constant number of views: a conditional that yields one
  view or none inside a lazy container defeats its laziness, so wrap the
  condition in a container that always yields one.
- **Scope animations to a value**, so a change elsewhere does not animate the
  screen.

## Lists and scrolling

Start with a standard stack and switch to a lazy stack or `List` when profiling
shows the eager one loading too many views; lazy containers compute geometry
only for what is on screen, at a cost in layout predictability. Images in a
scrolling list are decoded at display size and off the main actor, never at
full resolution in the row.

## Launch time

- **Do nothing before the first frame that the first frame does not need.** The
  composition root builds the root model and installs the scene; everything
  else — warming caches, syncing, analytics setup — starts after the first
  screen is up, from a `task`.
- **Fewer dynamic frameworks** shorten launch: prefer static linking for the
  app's own modules and for dependencies that allow it, a choice made in each
  framework target's Mach-O type and in which library product of a package the
  project links.
- Measure launch with Instruments' launch template and track it release to
  release.

## Instruments

The **SwiftUI** template profiles view body evaluations and property changes
alongside Core Animation commits and the time profiler — the first stop for a
janky screen: it names the views re-evaluated most and what triggered them.
The **Time Profiler** finds main-actor work that should have been elsewhere;
**Allocations** and **Leaks** find the retain cycle a closure-capturing model
introduced. A hang reported by the system is a main-actor block — find it in the
time profile, move it off.

## Artifact size

There is no engine to ship — the UI framework is in the OS — so the artifact is
the app's code, its dependencies and its assets:

- **Assets dominate.** Keep images in asset catalogs, which let the store
  deliver only the variants a device needs; prefer vector and symbol images
  over raster sets; compress what must be raster.
- **Every dependency is size.** A package added for one function is weighed
  against writing the function; a dependency that ships a large binary
  framework is a size decision recorded as one.
- **Strip what ships**: Release builds with dead-code stripping, symbols
  uploaded for crash reports rather than shipped.
- **Read the size report** from an archive on each release and compare with the
  last; a jump is investigated before it ships.

Per-platform budgets — the watch's tight memory and binary limits, tv's
on-demand resources, spatial's rendering budget — are the platform references'.
