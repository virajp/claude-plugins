---
name: Kotlin · Compose
axis: project
kind: app-framework
components:
- language/kotlin@0.1.0
- package-manager/gradle@0.1.0
- toolchain-gate/ktlint@0.1.0
- toolchain-gate/detekt@0.1.0
- framework/android@0.2.0
- app-framework/compose@0.2.0
platforms:
- mobile
- tablet
- watch
- tv
- auto
---

# mobile · tablet · watch · tv · auto — Kotlin · Compose

The native Android app: **Kotlin ·
[Jetpack Compose](https://developer.android.com/compose)** with Material 3, a
single-package repo living as its own repo — a multi-repo member — built by
Gradle and the Android Gradle Plugin and shipping through Google Play.

**One template, every Android form factor.** Compose is one UI toolkit across
Android's form factors, so a project on this template declares whichever
platforms it actually ships — as **one** project with several platforms, never
one project per form factor. The tokens map to form factors like this:

| Token    | Form factor                            |
| -------- | -------------------------------------- |
| `mobile` | Android phones                         |
| `tablet` | Android tablets                        |
| `watch`  | Wear OS                                |
| `tv`     | Android TV and Google TV               |
| `auto`   | Android Auto and Android Automotive OS |

**`auto` is not a Compose surface.** The in-car screens are Car App Library
templates the car host draws, not Compose views — projected from the phone
app on Android Auto, and run from an automotive module of the same Gradle
project on Android Automotive OS. So `auto` is only ever declared
**alongside** `mobile`, never alone, and never as its own project. `watch` and
`tv` are form factors of their own, declared in the one Gradle project beside
the phone app.

`spatial` (Android XR) is **not covered** — a project declaring it is not
covered by this bundle.

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
- **Android**, from the `android` pack: the **Android Gradle Plugin**, which
  fetches its own build-tools on first build; the **Android SDK**, whose
  cmdline-tools mise pins and whose platform-tools, compile platform, emulator
  and emulator system image `setup:deps:install:android` installs with
  `sdkmanager` into `ANDROID_HOME` (`~/.local/share/android/sdk`), from the
  `COMPILE_SDK` and `EMULATOR_IMAGE` values `/vwf:setup` asks for as it lands
  the pack, beside `MIN_SDK` and `TARGET_SDK`; **Android Lint** under
  `code:lint:android`; and **Gradle Managed Devices**, which run the Compose UI
  tests as E2E on a headless emulator: `mise run test:e2e` runs
  `./gradlew e2eDebugAndroidTest` on the app module's one managed device,
  `e2e`, while `mise run test:e2e -- --connected` runs `connectedCheck` on an
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
