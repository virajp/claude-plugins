# Android — conventions

The Android build framework, on Kotlin and Gradle: the Android Gradle plugin
(AGP) owns each Android module — an application or an AAR library — and this
pack carries the SDK, Android Lint, R8 and the emulator. The UI toolkit is not
this pack's: the **compose** pack carries Jetpack Compose, the UX gate and the
goldens. The Kotlin baseline is the **kotlin** pack's, the build scripts, the
version catalog and the lockfile the **gradle** pack's.

**AGP is a plugin in the version catalog**, applied by alias in each Android
module's `build.gradle.kts` (`com.android.application` or
`com.android.library`), its version written once in
`gradle/libs.versions.toml`. On AGP 9 Kotlin support is built in, so no
separate Kotlin Android plugin is applied. No pack lands a build script: the
author or Android Studio's project wizard creates the modules, and the repo
owns them from then on.

**The SDK levels live in the build files, once.** `compileSdk`, `minSdk` and
`targetSdk` are written in the build — each module's `android {}` block, or a
`build-logic/` convention plugin reading `gradle/libs.versions.toml` — and in
no other file. Raising one is a reviewed change to the build files alone.

**`mise run setup` installs the SDK.** The toolchain bootstrap syncs pins
Android's command-line tools (`sdkmanager`, `avdmanager`) and the JDK, and
sets `ANDROID_HOME`. `mise run setup` installs the SDK into it:
`platform-tools`, the compile platform, the `emulator` and one system image
with the host's ABI appended. It finds the compile level (`COMPILE_SDK`) and
the image (`EMULATOR_IMAGE`) in the build files — `build.gradle.kts`,
`*.gradle`, `build-logic/` and `gradle/libs.versions.toml`. A repo that needs
another value sets it in the `[env]` of
`.config/mise/conf.d/zz-repo/mise.<env>.toml`.

**Android Lint is a gate, and its baseline is debt, not a mute.**
`mise run code:lint` runs `./gradlew lint` across every Android module, and
`./gradlew lintFix` applies its safe fixes. Each module sets
`warningsAsErrors` and `abortOnError`; a `lint-baseline.xml` is committed only
when adopting the gate on an existing codebase, and it only ever shrinks.

**Release builds shrink.** `isMinifyEnabled` and `isShrinkResources` are on for
the release build type, the keep rules beside the module in
`proguard-rules.pro`; a library ships its consumers' rules as
`consumer-rules.pro`. A keep rule names the one class reflection needs, never a
package wildcard.

**E2E is instrumented UI tests on a managed emulator.** Each app module
declares a Gradle Managed Device named `e2e` under
`testOptions.managedDevices.localDevices` — API level the build's `targetSdk`,
the system image source matching the image `mise run setup` installs — and
`test:e2e` runs `./gradlew e2eDebugAndroidTest`: AGP creates the emulator,
boots it headless, runs the module's `androidTest` source set, and tears it
down. On CI it adds the software GPU renderer.
`mise run test:e2e -- --connected` runs `connected<Variant>AndroidTest`
against a running emulator or device instead, for a local debugging loop.

**Why it is built the way it is.** The task file carries one-line comments
only; the reasoning is here.

- The default image is `system-images;android-<targetSdk level>;google_apis`.
  From API 37 Google publishes platforms and system images only as
  `<level>.<minor>`, so a whole level of 37 or more becomes `<level>.0`, in
  the platform id and in the image id alike. From `android-37.1` only the
  `google_apis_ps16k` image exists, and `mise run setup` installs that one.
  A minor release is stated in full.
- The image id carries no ABI, so one value serves a Mac and a Linux runner;
  the host's ABI is appended at install.
- `test:e2e` fails rather than skips: the E2E harness is a verification gate,
  and a gate that quietly passes on a missing SDK proves nothing.
- `--connected` runs the variant `--variant` names. `--device` names a
  managed device, so `--device` with `--connected` is an error, not a
  silent no-op.

Full judgment: the `android` skill's references.
