# Swift — conventions

The Swift package baseline. Code is written in the **Swift 6 language mode**,
with strict concurrency checking on — data-race safety is a compile error, never
a warning to be silenced later.

**SwiftPM owns the manifest.** `Package.swift` declares the products, targets,
dependencies and supported platforms; `Package.resolved` is committed. No pack
lands `Package.swift` — `swift package init` creates it, and the repo owns it
from then on.

**The public API is the contract.** Everything is `internal` until a consumer
needs it; what is `public` is documented, versioned by semver, and changed only
through a deprecation.

**Errors are thrown and typed where the caller branches.** `precondition` and
`fatalError` are for programmer error only, never for input a caller can send.

**`async`/`await` and structured concurrency throughout.** Shared mutable state
lives in an actor or is `Sendable` by construction; nothing blocks a thread
waiting on async work.

**Tests are Swift Testing** (`@Test`, `#expect`), under `Tests/`, written
against the public API.

**The toolchain is bootstrap's.** This pack ships no task. `mise run setup`
resolves the packages from the committed `Package.resolved` and never moves
it; `mise run setup --upgrade` moves them within the ranges `Package.swift`
declares — widening a range is a manifest edit, reviewed as that diff.
`mise run code` runs the gates, `mise run code:format` and
`mise run code:lint` each half alone, and the pre-commit hooks call them
with the staged files. Without `--fix` every gate is read-only.

**The gates are swift-format and SwiftLint**, each with its own pack,
`toolchain-gate/swift-format` and `toolchain-gate/swiftlint`, which both
Swift bundles include. Their configs live under `.config/`, and every run
names the config explicitly. Both run `--strict`, since a warning nobody has
to fix accumulates. `--fix` never reaches SwiftLint: its autocorrect
rewrites layout, which is swift-format's, and a lint gate that rewrites
cannot run read-only.

**A library reads no environment.** Configuration is a value the caller passes
in; logging and metrics go through the ecosystem's API packages, never a
backend.

Full judgment: the `swift` skill's references.
