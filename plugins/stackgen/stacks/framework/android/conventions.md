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

**The SDK levels are the repo's, pinned once.** `COMPILE_SDK`, `MIN_SDK` and
`TARGET_SDK` live in `.config/mise/conf.d/android/mise.toml`, filled per repo
by `/vwf:setup`, and every module's `android {}` block states the same three
numbers. Raising one is a reviewed change to both, together — the build reads
the build script, the install task reads the environment, and they must agree.

**Each SDK piece comes from one place.** mise pins Android's command-line tools
(`sdkmanager`, `avdmanager`) through its `http:` backend, an exact build number,
and sets `ANDROID_HOME` to `~/.local/share/android/sdk` — outside any tool
directory, so a cmdline-tools upgrade never discards the SDK.
`setup:deps:install:android` installs the rest into it: `platform-tools`, the
`platforms;android-<COMPILE_SDK>` platform, the `emulator`, and the
`EMULATOR_IMAGE` system image with the host's ABI appended (`arm64-v8a` on
Apple silicon, `x86_64` on a Linux runner) — after accepting the SDK licenses
non-interactively. It installs no build-tools: AGP downloads the build-tools
it wants on first build. `ANDROID_SDK_ROOT` is not set: AGP reads
`ANDROID_HOME`. The JDK is the **kotlin** pack's.

**Android Lint is a gate, and its baseline is debt, not a mute.**
`code:lint:android` runs `./gradlew lint` across every Android module, or
`lintFix` under `--fix` on a whole-repo run. Each module sets
`warningsAsErrors` and `abortOnError`; a `lint-baseline.xml` is committed only
when adopting the gate on an existing codebase, and it only ever shrinks.

**Release builds shrink.** `isMinifyEnabled` and `isShrinkResources` are on for
the release build type, the keep rules beside the module in
`proguard-rules.pro`; a library ships its consumers' rules as
`consumer-rules.pro`. A keep rule names the one class reflection needs, never a
package wildcard.

**E2E is instrumented UI tests on a managed emulator.** Each app module
declares a Gradle Managed Device named `e2e` under
`testOptions.managedDevices.localDevices` — API level `TARGET_SDK`, the system
image source matching `EMULATOR_IMAGE` — and `test:e2e` runs
`./gradlew e2eDebugAndroidTest`: AGP creates the emulator, boots it headless,
runs the module's `androidTest` source set, and tears it down. On CI it adds the
software GPU renderer. `mise run test:e2e -- --connected` runs
`connectedCheck` against a running emulator or device instead, for a local
debugging loop.

**Why the tasks are built the way they are.** The task files carry one-line
comments only; the reasoning is here.

- `setup:deps:install:android` skips itself with a warning when `sdkmanager` is
  missing, except under `--frozen`, which fails: CI must not build against an
  SDK it never installed. It fails when a value is unset, naming it, since an
  SDK install with no level is a guess.
- The emulator image value carries no ABI, so one committed value serves a Mac
  and a Linux runner; the task appends the host's.
- No build-tools package is installed: its ids do not follow the compile
  level, and AGP downloads the version it pins on first build, which the
  accepted licenses allow.
- `COMPILE_SDK` is a level, `36` or `36.1` or `37.0`; the task refuses any
  other form. From API 37 Google publishes platforms and system images only as
  `<level>.<minor>`, so the task maps a bare `37` or later to `<level>.0`, in
  the platform id and in the image's `android-<level>` alike. A minor release
  is stated in full.
- `code:lint:android` runs per module, since Android Lint has no per-file mode:
  a file list from the hook decides only whether to run at all, and a commit
  touching no Kotlin, Java or XML under a `src/` tree, no build script, keep
  rule or version catalog skips it — IDE XML never starts it. With a file list
  it runs `lint` even under `--fix`: `lintFix` rewrites across every module, so
  only a whole-repo `mise run code:lint:android -- --fix` applies it. It skips
  itself when there is no `./gradlew` or no installed SDK.
- `test:e2e` fails rather than skips: the E2E harness is a verification gate,
  and a gate that quietly passes on a missing SDK proves nothing.
- `cmdline-tools` is pinned to an exact build, not `latest`: its builds are
  plain integers, which the pin rule cannot resolve to an exact version. Move
  it by hand to `mise latest http:android-cmdline-tools`'s answer, a commit of
  its own.

Full judgment: the `android` skill's references.
