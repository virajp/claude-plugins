# U2 — SwiftUI doctrine, topics 1–11

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/*.md`
  — the eleven top-level topic files named below
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/kinds.md:798-835`,
  `plugins/stackgen/assets/artifact-doctrine.md`, and Flutter's matching
  references under
  `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/` for
  shape and depth.

## Ruling

Quoted from index.md:

- **E2** — "Tuist: the app's project is declared in `Project.swift` /
  `Tuist.swift` and generated."
- **E4** — "Topics 1–11 here; one reference per platform and the Apple core
  integrations in plan 2d; third-party integrations parked."
- **E18** — "Units resolve Tuist, swift-snapshot-testing, swift-dependencies and
  Apple framework APIs through Context7 … before writing about them — never from
  training knowledge."
- **E19** — "swift-dependencies (Point-Free), added by the app through SwiftPM:
  topic 3 recommends it as the pack's DI, topic 10 covers `testValue` /
  `previewValue` and `withDependencies` overrides; no pack lands a dependency on
  it."

## Edits

One file per topic, in the shape and depth of Flutter's matching file, doctrine
for a SwiftUI app spanning mobile, tablet, desktop, auto, watch, tv and spatial.
Platform specifics stay a sentence here; depth per platform is plan 2d's.

1. `pick-and-trade.md` — native SwiftUI versus Flutter and the reverse; SwiftUI
   versus UIKit/AppKit; the multiplatform-target trade.
2. `project-layout.md` — the Tuist project, targets per platform, shared
   modules, the generated boundary (`Derived/`; the generated `.xcodeproj` is
   never committed).
3. `standards-and-architecture.md` — Swift 6 strict concurrency, the app
   architecture the pack recommends, dependency injection through
   swift-dependencies (E19), module boundaries.
4. `state-management.md` — the Observation framework, the property wrappers,
   where state lives.
5. `ui-composition.md` — view composition, theming against the design system's
   semantic tokens, adaptive layout and size classes.
6. `navigation.md` — stack and split navigation, deep links, per-platform
   idioms.
7. `data-and-networking.md` — URLSession with async/await, SwiftData and
   persistence, offline behaviour.
8. `platform-interop.md` — UIKit/AppKit interop, Objective-C, availability
   checks.
9. `build-and-signing.md` — Tuist configurations and schemes, signing,
   `compatibleXcodeVersions`, build flavours.
10. `testing.md` — Swift Testing, XCTest/XCUITest, swift-snapshot-testing
    goldens at the resolved viewport, swift-dependencies test and preview values
    and `withDependencies` overrides (E19), coverage.
11. `performance.md` — launch time, view update cost, Instruments, binary size.

No API surface listings — a listing is a reviewer gap (`kinds.md:1137-1140`).

## Verification

- `mise run p:plugins:check` green.
- Exactly the eleven filenames exist at the top of `references/`.

## Guardrails

- Touch nothing outside Owns — `SKILL.md` is U1's; create no `platforms/` or
  `integrations/` directory (plan 2d).
- Cite no plugin path (rule 13).
- `plugins/**/*.md` is not formatted — keep a steady fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: SwiftUI app stack — the swiftui pack and the swift-swiftui bundle`
