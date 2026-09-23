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

The repo's tasks are the interface; the tools behind them are detail.

| Task | Runs |
| --- | --- |
| `setup:deps:install` | `swift package resolve` — `--frozen` fails rather than move `Package.resolved` |
| `code:format` | dprint and shfmt, then `swift format` over `Package.swift`, `Sources/` and `Tests/` with `.config/swift-format.json` — in place under `--fix`, a strict lint otherwise |
| `code:lint` | shellcheck, actionlint, the house linter, then `swiftlint lint --strict` with `.config/swiftlint.yml`, once any Swift file exists |
| `setup:deps:outdated` | `swift package update --dry-run` |
| `setup:deps:upgrade` | `swift package update` |
| `setup:deps:cleanup` | `swift package clean`, then removes `.build/` |

`code:format` without `--fix` is read-only, so it is safe as a gate. Both
format and lint take a file list, which is how the pre-commit hook narrows
them to the staged files.

## Warnings

Warnings are defects that have not failed yet. The linter runs `--strict`, and
the formatter's lint mode is strict too, so a warning fails the gate rather
than accumulating. Compiler warnings are treated the same way in review: a
package ships clean.

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
