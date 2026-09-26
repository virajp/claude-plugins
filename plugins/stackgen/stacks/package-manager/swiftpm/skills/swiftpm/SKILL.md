---
name: swiftpm
version: 0.1.0
category: development
description: Package.swift and Package.resolved standards for a Swift package —
  the tools version, products and targets, dependency requirements, the
  committed lockfile and the .build tree. Auto-applies when editing
  Package.swift or Package.resolved.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/Package.swift"
  - "**/Package.resolved"
---

# Package.swift & Dependency Management

`Package.swift` declares the graph; `Package.resolved` pins it. SwiftPM owns
resolution — keep the manifest declarative and let the lockfile carry the
exact versions.

**A `Package.resolved` inside an `.xcodeproj` is Xcode's.** The glob above
also matches
`<Name>.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`,
the lockfile Xcode keeps for an app's dependencies. Those dependencies are
the project's: resolve, update and inspect them through
`mise run setup:deps:*`, never `swift package resolve` or `swift package
update`, and never edit that file by hand. Everything below governs a
`Package.swift` the repo owns — a package, or a local package an app splits
out — and the `Package.resolved` beside it.

## The manifest

```swift
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Orders",
    platforms: [.macOS(.v14), .iOS(.v17)],
    products: [
        .library(name: "Orders", targets: ["Orders"]),
    ],
    dependencies: [
        // https://github.com/apple/swift-collections
        .package(url: "https://github.com/apple/swift-collections", from: "1.1.0"),
    ],
    targets: [
        .target(
            name: "Orders",
            dependencies: [
                .product(name: "Collections", package: "swift-collections"),
            ]
        ),
        .testTarget(name: "OrdersTests", dependencies: ["Orders"]),
    ]
)
```

- **The tools-version comment is the first line** and names the oldest
  toolchain the package supports. Raise it deliberately — it gates the manifest
  API and the language mode together.
- **`platforms:`** states the minimum OS per platform the package supports; a
  package with no Apple-platform API may omit it.
- **One product per public surface.** A target not listed in a product is
  internal to the package.
- **Test targets mirror source targets** — `OrdersTests` for `Orders`, under
  `Tests/`.

## Adding dependencies

- **Ask first.** Never add a package without the user's explicit consent — name
  the package, its repository URL and what it is for, then wait for a yes.
- Declare it with **`from:`** (up to the next major). `exact:` only for a
  dependency known to break on minor releases, with a comment saying so;
  `branch:` and `revision:` only for a temporary fork, never merged to the
  integration branch.
- Put the repository URL in a comment above the declaration.
- Resolve and commit both files together — for a `Package.swift` the repo
  owns; an app's dependency is added through Xcode:

```bash
swift package resolve
git add Package.swift Package.resolved   # commit: "deps: add <package>"
```

## Rules

These govern a `Package.swift` the repo owns and its `Package.resolved`; the
lockfile inside an `.xcodeproj` goes through `mise run setup:deps:*`.

- **Never edit `Package.resolved` by hand** — `swift package resolve` and
  `swift package update` write it.
- **Moving a pin is its own change.** `swift package update <name>` for one
  dependency, reviewed and committed on its own; never as a side effect of an
  unrelated edit.
- **CI never moves the lockfile.** `swift package resolve
  --force-resolved-versions` resolves exactly what is pinned and fails on a
  stale `Package.resolved`.
- **Nothing in the manifest reads the environment.** A dependency list that
  depends on `ProcessInfo` resolves differently on every machine.
- **`.build/` and `.swiftpm/` are never committed** — both are regenerable.
- Every `import` of a third-party module needs a `.product` dependency on the
  target that imports it; SwiftPM does not let a target borrow another
  target's dependencies.

## Supply chain

- **`Package.resolved` is the supply-chain record.** It pins each dependency
  to a version **and** the commit revision it resolved to, so its diff in
  review shows exactly what code moved.
- **SwiftPM ships no audit command**, and this pack adds none. Advisories for
  Swift packages reach a repo through the forge — GitHub's dependency graph
  reads `Package.resolved` — and through whichever gate scanner reads it,
  never through a tool this pack installs.
- **Check by hand before adding or moving a dependency:** the repository is
  the one the package's own documentation names (a URL typo is a different
  package); the version is a tagged release, not a branch; the diff between
  the old and new revision in `Package.resolved` is what you expected; and a
  new transitive dependency in that diff is read as carefully as a direct one.
- **Binary targets are a trust decision.** A `.binaryTarget` downloads a
  prebuilt artifact; its `checksum:` is mandatory, and a dependency that
  brings one in is named as such when asking for consent.
- **Build plugins run code at build time.** A dependency that vends a build
  tool or command plugin executes on every developer's machine and in CI —
  name that when asking for consent, too.

## Workspace

`n/a` for this pack. A Swift package the repo owns is one `Package.swift`
with its own targets; a repo holding several packages is the `workspace`
bundle's concern, and no Swift workspace bundle ships. An app's Xcode project
is neither — its dependencies are Xcode's, as above.
