---
name: Swift · package
axis: project
kind: language-bundle
components:
- language/swift@0.1.3
- package-manager/swiftpm@0.2.0
- toolchain-gate/swift-format@0.1.1
- toolchain-gate/swiftlint@0.2.0
platforms:
- packages
---

# packages — Swift · package

A Swift library shipped as a
[Swift package](https://www.swift.org/documentation/package-manager/) —
`Package.swift` at the root, `Sources/` and `Tests/` beneath it — consumed by
other packages and apps through SwiftPM, tagged with semantic versions.

## Stack

- **Swift 6**, in the Swift 6 language mode with strict concurrency checking.
  The toolchain is the host's: `swift` must be on `PATH`, and `/vwf:doctor`
  blocks when it is not. **sourcekit-lsp** ships with it and is the language
  server.
- **SwiftPM** owns the manifest and the lockfile. No pack lands
  `Package.swift` — `swift package init --type library` creates it; the tasks
  resolve, update and clean through `swift package`.
- **swift-format** (`swift format`, from the toolchain) formats, and
  **SwiftLint**, through mise, lints. Both read their configuration from
  `.config/`, and both run inside the repo's `code:format` and `code:lint`
  tasks.

## Multi-platform availability

A package declares the platforms it supports in its manifest's `platforms:`
list, and gates newer API with `@available` and `#available` rather than
forking per OS. The `packages` platform is the only one this bundle takes: a
package is a library, whatever operating systems it builds for.

## What it does not carry

- **No app target** — no Xcode project, no scheme, no signing, no store
  delivery. An app is the SwiftUI bundle's.
- **No goldens** — no snapshot or screenshot tests; a package is tested through
  Swift Testing against its public API.

The deep Swift doctrine — library API design, access control, module layout,
Swift Testing, DocC, platform availability, semantic versioning — lives in the
`swift` pack's skill; this doc only fixes the stack choice.
