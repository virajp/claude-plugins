# Jetpack Compose — conventions

The native Android app stack's UI half. **Jetpack Compose with Material 3 is
the only UI toolkit**: no XML layout, no View-based screen, no Fragment. The
build — the Android Gradle Plugin, the SDK, Android Lint, the emulator — is
the `framework/android` pack's; Kotlin, Gradle and the gates are their own
packs'. This pack owns how screens are built, how state reaches them, and the
goldens that prove what they look like.

**Why this pack is typed `app-framework` though Gradle owns the build.** The
four-part test for an SDK that roots its bundle does not hold for Compose:
Gradle and the Android Gradle Plugin own the manifest and the build, Kotlin is
the only language and is chosen before Compose is, and the Kotlin language
server reaches the code without going through Compose. The pack is typed
`app-framework` because it is what makes the bundle an **app** rather than a
library — the screens, the goldens and the `ux-gate` are here, and the
`android-library` bundle is the same composition without it.

**Kotlin is the primary language, and there is no platform edge.** The app is
Kotlin top to bottom. Java, C or C++ reach it only through the Android
framework's own interop, which is the platform-interop reference's, never a
second language member.

**One app module, feature code beside it.** The app is one Gradle build: an
`:app` module that owns `MainActivity`, the Hilt application class and the
navigation graph, and feature or core modules it depends on as the app grows.
Shared build logic is a convention plugin in `build-logic/`, per the Gradle
pack. Versions — Compose's BOM among them — live in `gradle/libs.versions.toml`
alone.

**The app doctrine is fixed.** One `ViewModel` per screen exposes one
`StateFlow` of UI state and takes events as plain method calls; the screen
collects it with `collectAsStateWithLifecycle()` and is otherwise stateless
(unidirectional data flow). Dependencies are provided by **Hilt**, navigation is
**Navigation Compose** with type-safe routes, and local persistence is **Room**
behind a repository. The reasons, and the rules each brings, are the `compose`
skill's references.

**Single-package, always.** The app is one Gradle build in one repo. A library
other apps consume is an AAR on the `android-library` bundle, in its own repo.

## The goldens

**Goldens are Roborazzi image captures of Compose screens, rendered on the JVM
under Robolectric** — no emulator, no device, so a render is the same on every
machine and in CI. Each golden is a JUnit test in the module's `src/test/`
source set that sets one screen in one state and captures it.

- **Goldens are committed, under `src/test/screenshots/`.** Roborazzi's default
  output is under `build/`, which is never committed, so the module sets
  `roborazzi { outputDir.set(file("src/test/screenshots")) }`, and
  `gradle.properties` sets `roborazzi.record.filePathStrategy` to
  `relativePathFromRoborazziContextOutputDirectory`.
- **One file per screen, state and platform**:
  `src/test/screenshots/<platform>/<code>--<state>.png`, where `<code>` is the
  screen's code in the flow's Screens table, `<state>` is `default` or a pinned
  state, and `<platform>` is the vwf platform token the test's device qualifiers
  render — `mobile` or `tablet`. The `ux-gate` reads exactly these paths.
- **The device is a Robolectric qualifier, never the machine's.** A `mobile`
  golden runs under `@Config(qualifiers = RobolectricDeviceQualifiers.Pixel7)`,
  a `tablet` golden under `RobolectricDeviceQualifiers.MediumTablet`, both with
  `@GraphicsMode(GraphicsMode.Mode.NATIVE)`.
- **Accessibility is checked over the same captures.** The golden tests use
  Roborazzi's accessibility-check module with the Accessibility Test
  Framework's latest preset, so a golden run is also the audit.

## The task this pack owns

This pack ships one task, `config/.config/mise/tasks/test/golden`, landing at
the repo's own `.config/mise/tasks/test/golden` behind the materializer's
config consent line. It calls only the committed Gradle wrapper.

| Task          | Does                                                                                                                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test:golden` | `./gradlew verifyRoborazziDebug` — fails on any render that differs from its golden and on a screen with no golden; `--record` runs `./gradlew recordRoborazziDebug` instead; `--variant` names another variant than `debug` |

**Why the task is built the way it is.** A verifying run never records, so a
screen with no golden fails rather than passing on a golden it just wrote.
Recording is a separate, deliberate run, and its result is reviewed as a diff of
the PNGs before it is committed. On a failed verification Roborazzi leaves the
new render and a comparison image under the module's `build/outputs/roborazzi/`
and its report at `build/reports/roborazzi/index.html` — the three the
`ux-gate` hands the reviewer beside the committed golden.

**Emulator tests are not this task's.** End-to-end tests are Compose UI tests in
`src/androidTest/`, run on a headless emulator through Gradle Managed Devices —
the `framework/android` pack owns the device definitions and the task that runs
them. Formatting and linting are the Kotlin gate packs' and Android Lint the
`framework/android` pack's.

Full judgment: the `compose` skill's references.
