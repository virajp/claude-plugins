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

The repo's tasks are the interface; the tools behind them are detail, and
they are bootstrap's.

| Task | Runs |
| --- | --- |
| `mise run setup` | resolves the packages exactly as `Package.resolved` records them |
| `mise run setup --upgrade` | moves every package to the newest version its range allows |
| `mise run code:format` | swift-format, beside every other formatter — read-only without `--fix`, rewriting in place with it |
| `mise run code:lint` | SwiftLint, beside every other linter |
| `mise run code` | both |

`mise run code:format` without `--fix` is read-only, so it is safe as a
gate. The pre-commit hooks pass the staged files, so only those are
formatted.

## Warnings

Warnings are defects that have not failed yet. SwiftLint runs `--strict` and
swift-format's read-only check runs `--strict`, so a warning fails the gate
rather than accumulating.
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
