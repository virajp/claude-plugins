---
name: Android · library
axis: project
kind: language-bundle
components:
- language/kotlin@1.0.0
- package-manager/gradle@0.1.1
- toolchain-gate/ktlint@1.0.0
- toolchain-gate/detekt@1.0.0
- framework/android@1.0.0
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

- **Kotlin on the JVM**, from the `kotlin` pack: the toolchain bootstrap
  syncs pins the **JDK**, the compiler is the Kotlin Gradle plugin's, and
  **kotlin-lsp** is the language server.
- **Gradle**, from the `gradle` pack, owns the build through the committed
  wrapper, with versions in the version catalog `gradle/libs.versions.toml`
  and dependency locking in the tracked `gradle.lockfile`.
- **ktlint** formats and lints and **detekt** lints for code smells; the
  toolchain bootstrap syncs pins both, and `mise run code` runs them.
- **Android**, from the `android` pack: the **Android Gradle Plugin**'s
  library plugin, which fetches its own build-tools on first build; the
  **Android SDK**, which `mise run setup` installs into `ANDROID_HOME` —
  platform-tools, the compile platform, the emulator and its system image,
  at the levels it finds in the build files; **Android Lint**, which
  `mise run code:lint` runs; and **Gradle Managed Devices** for instrumented
  tests on a headless emulator: `mise run test:e2e` runs
  `./gradlew e2eDebugAndroidTest` on the module's one managed device, `e2e`,
  while `mise run test:e2e -- --connected` runs
  `connected<Variant>AndroidTest` on an emulator or device already running.

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
