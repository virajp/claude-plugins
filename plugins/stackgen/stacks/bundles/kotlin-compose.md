---
name: Kotlin · Compose
axis: project
kind: app-framework
components:
- language/kotlin@0.1.0
- package-manager/gradle@0.1.0
- toolchain-gate/ktlint@0.1.0
- toolchain-gate/detekt@0.1.0
- framework/android@0.1.0
- app-framework/compose@0.1.0
platforms:
- mobile
- tablet
---

# mobile · tablet — Kotlin · Compose

The native Android app: **Kotlin ·
[Jetpack Compose](https://developer.android.com/compose)** with Material 3, a
single-package repo living as its own repo — a multi-repo member — built by
Gradle and the Android Gradle Plugin and shipping through Google Play.

**One project, phones and tablets.** A project on this template declares the
platforms it actually ships, as **one** project with one app module, never one
project per form factor. The tokens map like this:

| Token    | Form factor     |
| -------- | --------------- |
| `mobile` | Android phones  |
| `tablet` | Android tablets |

Those two are what it covers today. `watch` (Wear OS), `tv` (Android TV),
`auto` (Android Auto) and `spatial` (Android XR) are **not yet covered** — a
project declaring one of them is not covered by this bundle.

## When to pick it

Pick **Kotlin · Compose** when the product is a native Android app written in
Kotlin and wants each new Android API on the day it ships and the system's own
look and behaviour without a bridge. Pick **Dart · Flutter** when the same app
must also ship on iOS from one codebase, and **Swift · SwiftUI** for the Apple
side of a product that ships a native app on each.

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
- **Android**, from the `android` pack: the **Android Gradle Plugin**; the
  **Android SDK**, whose cmdline-tools mise pins and whose platform,
  build-tools and emulator image `setup:deps:install:android` installs with
  `sdkmanager` into `ANDROID_HOME` (`~/.local/share/android/sdk`), from the
  `COMPILE_SDK`, `MIN_SDK`, `TARGET_SDK` and `EMULATOR_IMAGE` values
  `/vwf:setup` asks for as it lands the pack; **Android Lint** under
  `code:lint:android`; and **Gradle Managed Devices**, which run the Compose UI
  tests as E2E on a headless emulator: `mise run test:e2e` runs
  `./gradlew e2eDebugAndroidTest` on the app module's one managed device,
  `e2e`, while `mise run test:e2e --connected` runs `connectedCheck` on an
  emulator or device already running.
- **Compose**, from the `compose` pack: Jetpack Compose with **Material 3**
  as the only UI toolkit; the app doctrine — a ViewModel exposing StateFlow,
  **Hilt** for injection, **Navigation Compose** and **Room** — with a Jetpack
  integrations reference set; **goldens** recorded and verified by
  [Roborazzi](https://github.com/takahirom/roborazzi) on Robolectric under a
  `test:golden` task; and the repo's `ux-gate` skill, which renders them for
  review.
- **Client SDKs for the backing services** the product selected — identity,
  push, analytics, crash reporting, app attestation, and storage as needed. The
  app authenticates against the identity provider and calls the `service` API
  with the resulting token; business logic and server SDKs stay in the backend.

## What it does not carry

- **No Views/XML UI** — Compose is the app's only toolkit; Views interop is
  not taught.
- **No iOS** and **no Kotlin Multiplatform** — an app that must also ship on
  iOS from one codebase is the Flutter bundle's.
- **No signing, release builds or Play publishing** pipeline.

The deep doctrine — Compose layout, state, navigation, data, testing and
goldens in the `compose` pack's skill, the SDK, AGP, Lint and the emulator in
the `android` pack's — lives in the packs; this doc only fixes the stack
choice.
