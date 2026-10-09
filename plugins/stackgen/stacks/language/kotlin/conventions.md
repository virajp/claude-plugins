# Kotlin — conventions

The Kotlin/JVM library baseline. Code compiles with **explicit API mode** on
and **warnings as errors** — every public declaration states its visibility and
type, and a warning fails the build rather than accumulating.

**Gradle owns the build.** `settings.gradle.kts` names the modules, each
module's `build.gradle.kts` declares its plugins and dependencies, versions
live in the version catalog `gradle/libs.versions.toml`, and `gradle.lockfile`
is committed. No pack lands a build script — `gradle init` or the author
creates them, and the repo owns them from then on. The **gradle** pack carries
the build-script and lockfile doctrine.

**Each tool comes from one place.** mise pins the JDK — Temurin, on the LTS
line — in `.config/mise/conf.d/kotlin/`. Gradle comes from the committed
wrapper (`gradlew`, `gradle/wrapper/gradle-wrapper.properties`), and every
task calls `./gradlew`, never a bare `gradle`. The Kotlin compiler comes from
the Kotlin Gradle plugin, whose catalog version is the Kotlin version.

**The public API is the contract.** Everything is `internal` until a consumer
needs it; what is `public` is documented with KDoc, versioned by semver — source
and binary — and changed only through a `@Deprecated` cycle.

**Null safety is not bypassed.** No `!!` in library code; a Java platform type
is given an explicit nullability at its first use.

**Failures the caller handles are the library's own exceptions or a sealed
result**, one shape per API. `require`, `check` and `error` are for programmer
error only.

**Coroutines and structured concurrency throughout.** One result is a
`suspend` function, a stream is a cold `Flow`; every suspend function is
main-safe, dispatchers are injected, and `CancellationException` is always
rethrown. No `GlobalScope`, no `runBlocking` in library code.

**Tests are `kotlin.test` on JUnit 5**, in each module's `src/test/kotlin/`,
written against the public API; coroutine code runs under
`kotlinx-coroutines-test`'s `runTest`, and Kover measures coverage.

**Format and lint gates ship with their own packs.** The **ktlint** pack owns
formatting and the style lint, the **detekt** pack the static-analysis lint;
each owns the subtask that runs its tool. This pack ships the five dependency
subtasks:

| Task | Does |
| --- | --- |
| `setup:deps:install:kotlin` | `./gradlew dependencies`, which fails when the resolved graph disagrees with `gradle.lockfile`; with no lockfile, `./gradlew dependencies --write-locks` writes it — `--frozen` refuses instead |
| `setup:deps:outdated:kotlin` | `./gradlew dependencyUpdates` — the report of the ben-manes gradle-versions-plugin |
| `setup:deps:upgrade:kotlin` | `./gradlew dependencies --write-locks`, after the version catalog edit that moved a version |
| `setup:deps:audit:kotlin` | `grype file:gradle.lockfile` — advisory, never a gate |
| `setup:deps:cleanup:kotlin` | `./gradlew clean`; `gradle.lockfile` stays |

**Why the tasks are built the way they are.** The task files carry one-line
comments only; the reasoning is here.

- The `setup:deps:*` subtasks print no header: `setup:deps:all` frames each
  verb with its own subheader. Each skips itself with a warning when there is
  no executable `./gradlew` — a repo before `gradle init` has nothing to
  resolve, and mise does not install Gradle.
- `install` writes the lockfile only when none exists: a lock that exists is
  checked, never rewritten, because Gradle's dependency locking fails a
  resolution that disagrees with it. Moving a version is an `upgrade`.
- `upgrade` does not edit the catalog itself. A version moves by a reviewed
  edit to `gradle/libs.versions.toml`, guided by `outdated`'s report; the task
  then re-locks to match, and the lockfile diff shows what moved.
- `outdated` needs the gradle-versions-plugin applied — the settings plugin
  `io.github.ben-manes.versions.settings` in `settings.gradle.kts`, its version
  in the catalog. Without it, Gradle reports `dependencyUpdates` as an unknown
  task.
- `audit` is advisory, like every ecosystem audit: the advisory database moves
  without any lockfile change, so a gate on it would fail a commit that changed
  nothing. It skips itself when grype is absent — the universal toolchain pins
  grype for the dev environment only — or when no lockfile exists yet.
- `cleanup` keeps `gradle.lockfile`: it is the committed lockfile.

**A library reads no environment.** Configuration is a value the caller passes
in; logging and metrics go through the ecosystem's API artifacts (SLF4J,
Micrometer, OpenTelemetry), never a backend.

**The language server is `kotlin-lsp`**, started as
`mise x -- kotlin-lsp --stdio`. mise installs it too, in the development
environment alone: `.config/mise/conf.d/kotlin/mise.dev.toml` pins it through
the `http:` backend, which reads the version from the GitHub release tag and
downloads the JetBrains archive for macOS and Linux. No other install is
needed or wanted.

Full judgment: the `kotlin` skill's references.
