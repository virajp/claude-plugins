---
name: Kotlin · library
axis: project
kind: language-bundle
components:
- language/kotlin@0.1.0
- package-manager/gradle@0.1.0
- toolchain-gate/ktlint@0.1.0
- toolchain-gate/detekt@0.1.0
platforms:
- packages
---

# packages — Kotlin · library

A Kotlin/JVM library built with [Gradle](https://docs.gradle.org/) and
published as a JAR — `settings.gradle.kts` at the root, one or more modules
beneath it, each with its own `build.gradle.kts` — consumed by other JVM
projects through a Maven repository, tagged with semantic versions.

## Stack

- **Kotlin on the JVM**, compiled by the Kotlin Gradle plugin — the compiler
  version is the plugin's, never a separate install. mise pins the **JDK**
  (Temurin LTS) in `.config/mise/conf.d/kotlin/`, and **kotlin-lsp** is the
  language server.
- **Gradle** owns the build, through the committed wrapper (`gradlew` and
  `gradle/wrapper/gradle-wrapper.properties`) — mise does not pin Gradle.
  Versions live in the version catalog, `gradle/libs.versions.toml`, and
  dependency locking writes `gradle.lockfile`, which is tracked and written
  only by `./gradlew dependencies --write-locks`.
- **ktlint** formats and lints, and **detekt** lints for code smells and
  complexity, both through mise. Each pack ships its own subtasks, which the
  repo's `code:format:all` and `code:lint:all` run.
- Tests are **`kotlin.test`** on JUnit 5, with `kotlinx-coroutines-test` for
  coroutine code and Kover for coverage.

## What it does not carry

- **No Android** — no Android library module (AAR), no Android app, no Android
  SDK, no Android Lint. Those are not yet covered by a shipped bundle.
- **No Kotlin Multiplatform** — the library targets the JVM alone.
- **No goldens** — a library is tested through `kotlin.test` against its
  public API.

The deep Kotlin doctrine — library API design, visibility, module layout,
coroutines, testing, Gradle and the version catalog — lives in the `kotlin`
and `gradle` packs' skills; this doc only fixes the stack choice.
