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

**Each tool comes from one place.** The JDK — Temurin, on the LTS line — comes
from the toolchain bootstrap syncs. Gradle comes from the committed wrapper
(`gradlew`, `gradle/wrapper/gradle-wrapper.properties`), and every task calls
`./gradlew`, never a bare `gradle`. The Kotlin compiler comes from the Kotlin
Gradle plugin, whose catalog version is the Kotlin version. JDK 25 needs the
Gradle wrapper at 9.1 or later. The bytecode target is set with `jvmTarget`
plus `-Xjdk-release` and `options.release` on that JDK — never a Gradle
toolchain (`jvmToolchain`), which demands a JDK the toolchain does not
install.

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

**The gates and the dependency tasks come from the toolchain bootstrap
syncs.** `mise run code` runs the format and lint gates; the **ktlint** pack
carries the formatting and style-lint doctrine, the **detekt** pack the
static-analysis doctrine. `mise run setup` resolves every project against its
lockfile and fails when the resolved graph disagrees with one;
`mise run setup --upgrade` writes new lockfiles.

**Every configuration is locked, strictly.** The build sets
`dependencyLocking { lockAllConfigurations(); lockMode.set(LockMode.STRICT) }`,
so a new module with no lockfile fails instead of resolving unlocked. See the
`gradle` skill's locking reference for the rule in full.

- A version moves by a reviewed edit to `gradle/libs.versions.toml`, then
  `mise run setup --upgrade` re-locks to match, and the lockfile diff shows
  what moved. No lockfile is edited by hand.
- `gradle-wrapper.properties` sets `distributionSha256Sum`, 64 hex digits, so
  CI never runs an unverified Gradle distribution.
- An outdated report needs the ben-manes plugin `com.github.ben-manes.versions`
  applied in the root `build.gradle.kts`, its version in the catalog's
  `[plugins]` table; `./gradlew dependencyUpdates` prints it.

**CI validates the wrapper jar before any `./gradlew`.** `gradlew` runs the
committed `gradle/wrapper/gradle-wrapper.jar`, so a change that swaps the jar
runs its code on the runner. No task here can prove the jar genuine, so CI
runs `gradle/actions/wrapper-validation` — or `gradle/actions/setup-gradle`,
which validates it built in — before the first Gradle step, and a jar diff in
review is a finding unless the change is a wrapper upgrade.

**A library reads no environment.** Configuration is a value the caller passes
in; logging and metrics go through the ecosystem's API artifacts (SLF4J,
Micrometer, OpenTelemetry), never a backend.

**The language server is `kotlin-lsp`**, started as
`mise x -- kotlin-lsp --stdio`. The toolchain bootstrap syncs installs it, in
the development environment alone, for macOS and Linux. No other install is
needed or wanted.

Full judgment: the `kotlin` skill's references.
