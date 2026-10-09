---
name: Swift · SwiftUI
axis: project
kind: app-framework
components:
- app-framework/swiftui@0.6.0
- package-manager/swiftpm@0.3.1
- toolchain-gate/swift-format@0.1.3
- toolchain-gate/swiftlint@0.2.1
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
Xcode from a committed Xcode project and shipping through the App Store.

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
in the one Xcode project beside the others.

## When to pick it over Flutter

Pick **Swift · SwiftUI** when the product ships on Apple platforms alone, when
it reaches `watch`, `tv` or `spatial` — which Flutter's template does not
cover — or when it needs each new Apple API on the day it ships and the
system's own look and behaviour without a bridge. Pick **Dart · Flutter** when
the same app must also ship on Android: one codebase for both stores is worth
more than native reach there, and Flutter reaches CarPlay through its own
native edge. A product that ships a native app on each side pairs this bundle
with **Kotlin · Compose** for the Android app.

## Stack

- **Swift 6** and **SwiftUI**, from the host's Xcode: `swift` must be on
  `PATH` and `xcodebuild -version` must succeed — a Mac with only the Command
  Line Tools fails it — and `/vwf:doctor` blocks when either does not.
  **sourcekit-lsp** ships with it and is the language server.
- **A committed Xcode project** owns the app's targets. It is created once, by
  a person, in Xcode — no generator, and no pack lands the `.xcodeproj`; the
  tasks call `xcodebuild` and `swift` alone. The Xcode version is pinned by
  `XCODE_VERSION`, beside the golden simulator's pin, each rendered from the
  pack's template into `.config/mise/conf.d/swiftui/mise.toml`;
  `/vwf:setup` asks for each value as it lands the pack, offering what this
  machine answers. Every task that builds
  checks `xcodebuild -version` against the pin and fails fast on the wrong
  one.
- **Packages are added through Xcode**, into the project, and locked in the
  `Package.resolved` it keeps inside the `.xcodeproj`, which is committed. The
  app's own dependencies live there. The **SwiftPM** component governs only a
  local package the app splits out — a `Package.swift` of its own — never the
  app's dependencies.
- **swift-format** formats and **SwiftLint** lints, both reading their
  configuration from `.config/`. Each pack ships its own subtasks —
  `code:format:swift-format` and `code:lint:swift-format`, and
  `code:lint:swiftlint` — which the repo's `code:format:all` and
  `code:lint:all` run.
- **Goldens** through
  [swift-snapshot-testing](https://github.com/pointfreeco/swift-snapshot-testing),
  added through Xcode to a `SnapshotTests` unit-test target, under a
  `test:golden` task; the repo's `ux-gate` skill renders them for review.
- **Client SDKs for the backing services** the product selected — identity,
  push, analytics, crash reporting, app attestation, and storage as needed. The
  app authenticates against the identity provider and calls the `service` API
  with the resulting token; business logic and server SDKs stay in the backend.

## What it does not carry

- **No Android** — a native Android app is the Kotlin · Compose bundle's, and
  one codebase for both stores is the Flutter bundle's.
- **No UIKit- or AppKit-first doctrine** — both are reached from SwiftUI as
  interop, never as the app's primary framework.

The deep SwiftUI doctrine — project layout, app architecture, state,
composition, navigation, data, platform interop, build and signing, testing,
performance — lives in the `swiftui` pack's skill; this doc only fixes the
stack choice.
