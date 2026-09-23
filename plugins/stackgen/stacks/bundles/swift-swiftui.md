---
name: Swift · SwiftUI
axis: project
kind: app-framework
components:
- app-framework/swiftui@0.1.0
- package-manager/swiftpm@0.1.0
- toolchain-gate/swift-format@0.1.0
- toolchain-gate/swiftlint@0.1.0
platforms:
- mobile
- tablet
- desktop
- auto
- watch
- tv
- spatial
---

# mobile · tablet · desktop · auto · watch · tv · spatial — Swift · SwiftUI

The native Apple app: **Swift · [SwiftUI](https://developer.apple.com/swiftui/)**,
a single-package repo living as its own repo — a multi-repo member — built by
Xcode from a [Tuist](https://tuist.dev)-defined project and shipping through
the App Store.

**One template, every Apple platform.** SwiftUI is one UI framework across
Apple's operating systems, so a project on this template declares whichever
platforms it actually ships — as **one** project with several platforms, never
one project per OS. The tokens map to operating systems like this:

| Token     | Operating system        |
| --------- | ----------------------- |
| `mobile`  | iOS (iPhone)            |
| `tablet`  | iPadOS                  |
| `desktop` | macOS                   |
| `auto`    | CarPlay, through iOS    |
| `watch`   | watchOS                 |
| `tv`      | tvOS                    |
| `spatial` | visionOS                |

**`auto` is not its own build target.** The in-car surface is the *same iOS
app*, reaching CarPlay through the CarPlay framework's templates rather than
through SwiftUI views; nothing new is provisioned for it. So `auto` is only
ever declared **alongside** `mobile`, never alone, and never as its own
project. `watch` and `tv` and `spatial` are real targets of their own, declared
in the one Tuist project beside the others.

## When to pick it over Flutter

Pick **Swift · SwiftUI** when the product ships on Apple platforms alone, when
it reaches `watch`, `tv` or `spatial` — which Flutter's template does not
cover — or when it needs each new Apple API on the day it ships and the
system's own look and behaviour without a bridge. Pick **Dart · Flutter** when
the same app must also ship on Android: one codebase for both stores is worth
more than native reach there, and Flutter reaches CarPlay through its own
native edge.

## Stack

- **Swift 6** and **SwiftUI**, from the host's Xcode: `xcodebuild` and
  `swift` must be on `PATH`, and `/vwf:doctor` blocks when they are not.
  **sourcekit-lsp** ships with it and is the language server.
- **Tuist**, through mise, owns the project. The app's targets are declared in
  `Project.swift` and `Tuist.swift` and generated; no committed `.xcodeproj`.
  No pack lands those files — `tuist init` creates them — and the Xcode version
  is pinned there, through `compatibleXcodeVersions`, so the tasks fail fast on
  the wrong one.
- **SwiftPM** resolves the dependencies, through Tuist's install step.
- **swift-format** formats and **SwiftLint** lints, both reading their
  configuration from `.config/` and both running inside the repo's
  `code:format` and `code:lint` tasks.
- **Goldens** through
  [swift-snapshot-testing](https://github.com/pointfreeco/swift-snapshot-testing),
  a SwiftPM test dependency, under a `test:golden` task; the repo's `ux-gate`
  skill renders them for review.
- **Client SDKs for the backing services** the product selected — identity,
  push, analytics, crash reporting, app attestation, and storage as needed. The
  app authenticates against the identity provider and calls the `service` API
  with the resulting token; business logic and server SDKs stay in the backend.

## What it does not carry

- **No Android** — an app that must also ship there is the Flutter bundle's.
- **No UIKit- or AppKit-first doctrine** — both are reached from SwiftUI as
  interop, never as the app's primary framework.

The deep SwiftUI doctrine — project layout, app architecture, state,
composition, navigation, data, platform interop, build and signing, testing,
performance — lives in the `swiftui` pack's skill; this doc only fixes the
stack choice.
