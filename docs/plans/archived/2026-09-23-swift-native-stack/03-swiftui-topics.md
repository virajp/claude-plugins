# U3 — SwiftUI doctrine, topics 1–11

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/*.md`
  — the eleven top-level topic files named below, nothing under `platforms/` or
  `integrations/`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/kinds.md:798-835` (the bar),
  `plugins/stackgen/assets/artifact-doctrine.md`, and Flutter's matching
  references under
  `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/` for
  shape and depth.

## Ruling

Quoted from index.md:

- **E2** — "Tuist: the app's project is declared in `Project.swift` /
  `Tuist.swift` and generated."
- **E4** — "The 12-topic bar, one reference per platform …, and Apple's core
  integrations … Third-party integrations parked."
- **E5** — "swift-snapshot-testing (Point-Free), through SwiftPM, under a
  `test:golden` task and the `goldens` harness."
- **E18** — "Every unit resolves … Apple framework APIs through Context7 …
  before writing about them — never from training knowledge."

## Edits

Write one file per topic, in the shape and depth of Flutter's matching file,
doctrine for a SwiftUI app spanning mobile, tablet, desktop, auto, watch, tv and
spatial:

1. `pick-and-trade.md` — when to pick native SwiftUI over Flutter and the
   reverse; SwiftUI versus UIKit/AppKit; the multiplatform-target trade.
2. `project-layout.md` — the Tuist project, targets per platform, shared
   modules, the generated boundary (`Derived/`, the generated `.xcodeproj` never
   committed).
3. `standards-and-architecture.md` — Swift 6 strict concurrency, the app
   architecture the pack recommends, dependency injection, module boundaries.
4. `state-management.md` — the Observation framework, `@State`/`@Binding`/
   `@Environment`, where state lives.
5. `ui-composition.md` — view composition, theming against the design system's
   semantic tokens, adaptive layout and size classes.
6. `navigation.md` — `NavigationStack`/`NavigationSplitView`, deep links,
   per-platform navigation idioms.
7. `data-and-networking.md` — URLSession with async/await, SwiftData and
   persistence, offline behaviour.
8. `platform-interop.md` — UIKit/AppKit interop, Objective-C, platform
   availability checks.
9. `build-and-signing.md` — Tuist configurations and schemes, signing,
   `compatibleXcodeVersions`, build flavours.
10. `testing.md` — Swift Testing, XCTest/XCUITest, swift-snapshot-testing
    goldens at the resolved viewport, coverage.
11. `performance.md` — launch time, view update cost, Instruments, binary size.

Topic 12 is `integrations/` (U4). No API surface listings anywhere — a listing
is a reviewer gap (`kinds.md:1137-1140`).

## Verification

- `mise run p:plugins:check` green.
- Exactly the eleven filenames above exist at the top of `references/`.

## Guardrails

- Touch nothing outside Owns — `SKILL.md` is U2's, `platforms/` and
  `integrations/` U4's.
- Cite no plugin path (rule 13); a `../` climb only into a sibling skill of this
  pack.
- `plugins/**/*.md` is not formatted — keep a steady fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: native Swift stack — language, swiftui, swiftpm and gate packs, two bundles`
