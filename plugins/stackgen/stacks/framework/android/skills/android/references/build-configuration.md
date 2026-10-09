# Android — build configuration

## The plugin

AGP is declared once, in `gradle/libs.versions.toml`'s `[plugins]` table, and
applied by alias in the module that needs it: `com.android.application` for an
app, `com.android.library` for an AAR. The root `build.gradle.kts` declares it
`apply false`, so every module resolves one version. On AGP 9 Kotlin
compilation is built into AGP — do not also apply the Kotlin Android plugin; the
Compose compiler plugin, where Compose is used, is the **compose** skill's
concern.

## The `android {}` block

One block per Android module, and it states, in this order:

- `namespace` — the package the generated `R` and `BuildConfig` classes live in.
  It is the Kotlin package root of the module, and it is not the application ID.
- `compileSdk` — the API the code compiles against. The newest stable level.
- `defaultConfig` — `minSdk`, `targetSdk` (an app only), and for an app the
  `applicationId`, `versionCode` and `versionName`; the
  `testInstrumentationRunner` (`androidx.test.runner.AndroidJUnitRunner`).
- `buildTypes` — `debug` and `release`, and nothing else unless a third is a
  genuinely different artifact (a benchmark build, say).
- `buildFeatures` — every feature off that the module does not use:
  `buildConfig`, `aidl`, `renderScript`, `resValues`, `shaders` each cost build
  time.
- `testOptions` — the managed devices (see
  [emulator & managed devices](emulator-and-managed-devices.md)).
- `lint` — see [lint](lint.md).

## The SDK levels

Three numbers, written in the build script as literals and in
`.config/mise/conf.d/android/mise.toml` as `COMPILE_SDK`, `MIN_SDK` and
`TARGET_SDK`:

| Level | Means | Moves when |
| --- | --- | --- |
| `compileSdk` | the API surface the code may call | a new stable API level ships |
| `minSdk` | the oldest device that can install it | product decides to drop old devices |
| `targetSdk` | the behaviour changes the app opts into | within a year of a new level — Play requires it |

A call above `minSdk` is guarded by an `SDK_INT` check or an AndroidX
compatibility API; Android Lint's `NewApi` check enforces it. Raising
`targetSdk` is a behaviour change — read the level's behaviour-changes page and
test on that level's emulator before merging. A multi-module repo keeps the
three numbers in one place — a convention plugin in `build-logic/` (the
**gradle** skill's), reading the version catalog — so modules never disagree.

## Build types and flavors

- `debug` is debuggable and unshrunk; `release` is shrunk and signed by the
  release pipeline, never by a key in the repo.
- Product flavors only for a real product dimension — a free and a paid app, a
  staging and a production backend — each in a named `flavorDimensions` entry.
  An environment value a flavor differs by is a `buildConfigField` or a
  resource, never an `if` on the flavor name in code.
- Every flavor multiplies the variants, the build time and the test matrix. Two
  dimensions of two is already eight variants with both build types; prefer
  runtime configuration where the artifact need not differ.

## Version code

`versionCode` is a monotonically increasing integer the release pipeline sets,
never hand-edited in a branch; `versionName` is the human version. Neither is
derived from a Git command inside the build script — that breaks the
configuration cache.
