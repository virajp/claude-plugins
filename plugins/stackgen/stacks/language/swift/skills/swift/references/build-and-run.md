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
| `code:format` | dprint and shfmt, then `swift format` with `.config/swift-format.json` over every `.swift` file git does not ignore — rewritten in place under `--fix`, then a strict lint either way |
| `code:lint` | shellcheck, actionlint, the house linter over every file git does not ignore, then `swiftlint lint --strict` with `.config/swiftlint.yml` over every `.swift` file git does not ignore |
| `setup:deps:outdated` | `swift package update --dry-run` |
| `setup:deps:upgrade` | `swift package update` |
| `setup:deps:cleanup` | removes `.build/` |

`code:format` without `--fix` is read-only, so it is safe as a gate. The
pre-commit hook calls `code:format --fix` with the staged files, so only those
are formatted — and the strict lint that follows the rewrite runs over the same
files, so a finding the formatter cannot fix fails the commit rather than CI.
The hook calls `code:lint --fix` with the staged files too, but lint ignores
the list: the house linter's rules read across files and SwiftLint follows its
config, so both always take the whole tree.

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
