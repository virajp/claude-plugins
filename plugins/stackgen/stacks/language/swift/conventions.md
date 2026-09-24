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

**Tool configs live under `.config/`.** swift-format reads
`.config/swift-format.json`, SwiftLint reads `.config/swiftlint.yml`, and the
tasks pass each explicitly:

| Task | Does |
| --- | --- |
| `code:format` | dprint and shfmt, then `swift format` — over the staged `.swift` files the hook passes, or with no list over every `.swift` file git does not ignore; either way less the tasks' fixed exclusions, `.build/`, `.swiftpm/`, `Derived/`, `DerivedData/` and `*.generated.swift` at any depth — in place under `--fix`, then a strict lint either way |
| `code:lint` | shellcheck and actionlint over the staged files the hook passes (every tracked file when none is passed); the house linter over every file git does not ignore; then `swiftlint lint --strict` over every `.swift` file git does not ignore, less the same exclusions — the house linter and SwiftLint whole-tree, whatever list the hook passes |
| `setup:deps:install` | `swift package resolve`; `--frozen` refuses to move `Package.resolved` |
| `setup:deps:audit` | a stated no-op — SwiftPM ships no advisory command |
| `setup:deps:cleanup` | removes `.build/` |
| `setup:deps:outdated` | `swift package update --dry-run` |
| `setup:deps:upgrade` | `swift package update` |

"Every file git does not ignore" holds inside a git repository — a `.git`
entry here or above, or `GIT_DIR` set — where a failed `git ls-files` stops the
task. With neither a `.git` entry nor `GIT_DIR`, or no git installed, both
tasks take the Swift scope from a `find` walk of the tree instead, less the
same exclusions, and `.gitignore` no longer applies.

**A library reads no environment.** Configuration is a value the caller passes
in; logging and metrics go through the ecosystem's API packages, never a
backend.

Full judgment: the `swift` skill's references.
