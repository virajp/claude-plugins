# Swift — build & run

A package builds and tests with the toolchain alone — `swift build` and
`swift test` — and the repo's tasks wrap the rest, so a contributor and CI run
the same thing.

## The dev loop

- `swift build` compiles in the debug configuration into `.build/`.
- `swift test` builds and runs the test targets; `--filter` narrows to one
  suite or test while iterating.
- `swift build -c release` is the configuration consumers get; build it
  before a release to catch optimiser-only diagnostics.
- `.build/` is output — ignored, never committed, and safe to delete.

## The task wiring

The repo's tasks are the interface; the tools behind them are detail. Each
tool has its own subtask, and the repo's `code:format:all` and `code:lint:all`
call every one by name — the Swift ones beside dprint, shfmt, shellcheck,
actionlint and the house linter.

| Task | Runs |
| --- | --- |
| `setup:deps:install:swift` | `swift package resolve` — `--frozen` fails rather than move `Package.resolved` |
| `code:format:swift-format` | `swift format` with `.config/swift-format.json` over the Swift scope when no list is passed, or over the staged `.swift` files the hook passes, less the scope's exclusions — rewritten in place under `--fix`, a strict lint otherwise |
| `code:lint:swift-format` | `swift format lint --strict` over the same files, under `--fix` too |
| `code:lint:swiftlint` | `swiftlint lint --strict` with `.config/swiftlint.yml` over the whole Swift scope |
| `setup:deps:outdated:swift` | `swift package update --dry-run` |
| `setup:deps:upgrade:swift` | `swift package update` |
| `setup:deps:cleanup:swift` | removes `.build/` |

The **Swift scope** is every `.swift` file git tracks or would track, less a
fixed list the tasks hold themselves, at any depth — `.build/`, `.swiftpm/`,
`Derived/`, `DerivedData/` and `*.generated.swift` — so every Swift gate judges
the same files. The shipped `.config/swiftlint.yml` excludes `.build/` and
`.swiftpm/` at the repo root only; the any-depth exclusion is the tasks'. An
`excluded:` entry you add to the config reaches SwiftLint, which is passed
`--force-exclude`, but not swift-format. Inside a git repository — a `.git`
entry here or above, or `GIT_DIR` set — the scope is git's list, and when git
cannot give it the gates that read it stop with an error rather than judge an
empty list. Only with no `.git` entry and no `GIT_DIR`, or no git installed, do
they walk the tree instead.

`code:format:all` without `--fix` is read-only, so it is safe as a gate. The
pre-commit hook calls `code:format:all --fix` with the staged files, so only
those are formatted — and `code:lint:swift-format`'s strict lint runs over the
same files, so a finding the formatter cannot fix fails the commit rather than
CI. The hook calls `code:lint:all --fix` with the staged files too; SwiftLint's
rules read across files, so it always takes the whole Swift scope.

## Warnings

Warnings are defects that have not failed yet. SwiftLint runs `--strict` and
swift-format's lint runs `--strict` on every path — read-only, and after the
rewrite under `--fix` — so a warning fails the gate rather than accumulating.
Compiler warnings are treated the same way in review: a package ships clean.

## Documentation

DocC comments on every public declaration are the documentation — see
[coding standards](standards.md). Where the package publishes a rendered
catalogue, the swift-docc-plugin generates it from the same comments;
a `Documentation.docc` catalogue in the target adds articles and tutorials
beside the symbol pages. Never maintain a separate prose reference that can
drift from the symbols.

## Releases

A release is a **git tag** — SwiftPM resolves versions from tags, and there is
no registry upload. The tag is semver, bare (`1.4.0`), and the version is
decided from the public surface change, per [coding standards](standards.md).
Tag only what builds and tests clean in release configuration on every
platform the manifest declares.
