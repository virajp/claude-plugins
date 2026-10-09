# Jetpack Compose — build & variants

The Android Gradle Plugin, the SDK levels, Android Lint and the emulator are the
`framework/android` pack's. This reference is what Compose adds to a module's
build, and how variants are used.

## Compose in a module

- **The Compose compiler is the Kotlin plugin
  `org.jetbrains.kotlin.plugin.compose`**, versioned with Kotlin itself — one
  `kotlin` version in the catalog drives both. There is no separate
  compiler-extension version to keep in step.
- **`buildFeatures { compose = true }`** in each module that declares
  composables; a pure data or model module does not enable it.
- **The Compose BOM pins every Compose artifact.** The catalog declares
  `androidx.compose:compose-bom` once; each Compose dependency is declared
  without a version and takes it from the platform. Material 3 is
  `androidx.compose.material3:material3`.
- **Tooling is debug-only.** `ui-tooling` (previews in the IDE) and
  `ui-test-manifest` are `debugImplementation`; the release build carries
  neither.
- **KSP, never kapt**, for Hilt and Room's code generation.
- **Shared configuration is a convention plugin** in `build-logic/` —
  `android.application.compose`, `android.library.compose` — applied by id, so
  each module's build file says what it is, not how.

## Variants

- **Two build types: `debug` and `release`.** `debug` is what developers, the
  goldens and CI's tests run; `release` is minified and is what ships.
- **Product flavours only for a real difference in what ships** — a free and a
  paid edition, say. An environment (staging, production) is a build config
  field or a runtime setting, not a flavour per environment multiplying every
  task by N.
- **`BuildConfig` fields** are enabled per module
  (`buildFeatures { buildConfig = true }`) only where read. Secrets are never
  in `BuildConfig` or in resources: anything shipped in the APK is readable.

## Shrinking

- **`isMinifyEnabled = true` and `isShrinkResources = true` on `release`.** R8
  removes and obfuscates; keep rules live beside the module that needs them, as
  `proguard-rules.pro`, and serialization or reflection users carry their own
  consumer rules.
- **Test the release build**, not only debug: a missing keep rule fails at run
  time, never at compile time.

## Signing

The debug keystore Android generates is all this stack configures. Release
signing, upload keys and store publishing are outside it: the keystore and its
passwords are secrets, held by the repo's secrets provider and never committed,
and wiring them belongs to whatever release pipeline the product adopts.
