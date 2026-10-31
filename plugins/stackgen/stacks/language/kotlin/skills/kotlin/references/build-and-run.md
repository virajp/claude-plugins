# Kotlin — build & run

A library builds and tests with the wrapper alone — `./gradlew build` — and the
repo's tasks wrap the rest, so a contributor and CI run the same thing.

## The dev loop

- `./gradlew build` compiles every module, runs its tests and every check the
  build declares, and assembles the JARs under each module's `build/`.
- `./gradlew test` runs the tests alone; `:<module>:test --tests '<pattern>'`
  narrows to one module and one test while iterating.
- `./gradlew check` is the verification set — tests, and any gate the build
  wires in — without assembling.
- `build/`, `.gradle/` and `.kotlin/` are output and caches — ignored, never
  committed, and safe to delete.
- Turn the configuration cache and the build cache on in
  `gradle.properties`, so repeated runs do only the work that changed.

## The task wiring

The repo's tasks are the interface; the tools behind them are detail. The
toolchain bootstrap syncs ships them; this pack ships none.

| Task | Runs |
| --- | --- |
| `mise run setup` | resolves every project against its lockfile, and fails when one disagrees |
| `mise run setup --upgrade` | re-locks every project, after the catalog edit — the one writer of the lockfiles |
| `mise run code` | the format and lint gates, ktlint and detekt among them |

Beside them, plain Gradle: `./gradlew dependencyUpdates` prints the
outdated report of the `com.github.ben-manes.versions` plugin, and
`./gradlew clean` removes the build output; the lockfiles stay.

## Warnings

Warnings are defects that have not failed yet. The compiler runs with
warnings as errors (see [toolchain](toolchain.md)), and the ktlint and detekt
gates fail on any finding, so a library ships clean.

## Documentation

KDoc on every public declaration is the documentation — see
[coding standards](standards.md). Where the library publishes a rendered
reference, Dokka generates it from the same comments; never maintain a
separate prose reference that can drift from the symbols.

## Releases

A release is a **published artifact** — group, artifact id and version —
with its sources and KDoc JARs beside it, and a **git tag** naming the same
version. The version is semver, decided from the public surface change per
[coding standards](standards.md); where binary compatibility matters, the
Kotlin binary-compatibility validator's API dump is committed and diffed in
review. Publish only what builds and checks clean.
