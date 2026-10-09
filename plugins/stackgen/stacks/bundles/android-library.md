---
name: Android · library
axis: project
kind: language-bundle
components:
- language/kotlin@0.1.0
- package-manager/gradle@0.1.0
- toolchain-gate/ktlint@0.1.0
- toolchain-gate/detekt@0.1.0
- framework/android@0.1.0
platforms:
- packages
---

# packages — Android · library

An Android library module written in Kotlin, built with
[Gradle](https://docs.gradle.org/) and the Android Gradle Plugin, and
published as an **AAR** — `settings.gradle.kts` at the root, the library
module beneath it with its own `build.gradle.kts` — consumed by Android apps
through a Maven repository, tagged with semantic versions.

## When to pick it over Kotlin · library

Pick **Android · library** when the library needs the Android SDK — it
touches Android APIs, ships Android resources or a manifest, or is consumed
only by Android apps — and so must be an AAR. Pick **Kotlin · library** when
the code is plain Kotlin on the JVM, publishable as a JAR any JVM project can
use, Android apps included: it needs no SDK, no emulator and no Android Lint.

## Stack

- **Kotlin on the JVM**, from the `kotlin` pack: mise pins the **JDK**, the
  compiler is the Kotlin Gradle plugin's, and **kotlin-lsp** is the language
  server.
- **Gradle**, from the `gradle` pack, owns the build through the committed
  wrapper, with versions in the version catalog `gradle/libs.versions.toml`
  and dependency locking in the tracked `gradle.lockfile`.
- **ktlint** formats and lints and **detekt** lints for code smells, each
  through its own subtasks, which the repo's `code:format:all` and
  `code:lint:all` run.
- **Android**, from the `android` pack: the **Android Gradle Plugin**'s
  library plugin; the **Android SDK**, whose cmdline-tools mise pins and whose
  platform, build-tools and emulator image `setup:deps:install:android`
  installs with `sdkmanager` into `ANDROID_HOME`
  (`~/.local/share/android/sdk`), from the `COMPILE_SDK`, `MIN_SDK`,
  `TARGET_SDK` and `EMULATOR_IMAGE` values `/vwf:setup` asks for as it lands
  the pack; **Android Lint** under `code:lint:android`; and **Gradle Managed
  Devices** for instrumented tests on a headless emulator: `mise run test:e2e`
  runs `./gradlew e2eDebugAndroidTest` on the module's one managed device,
  `e2e`, while `mise run test:e2e --connected` runs `connectedCheck` on an
  emulator or device already running.

## What it does not carry

- **No app and no UI doctrine** — no Compose, no `ux-gate`, no goldens. An
  Android app is the Kotlin · Compose bundle's.
- **No Kotlin Multiplatform** — the library targets Android alone.
- **No signing or Play publishing** — a library is published to a Maven
  repository, never to Google Play.

The deep doctrine — library API design, coroutines and Gradle in the
`kotlin` and `gradle` packs' skills, the SDK, AGP, Lint and the emulator in
the `android` pack's — lives in the packs; this doc only fixes the stack
choice.
