# Jetpack Compose — testing & coverage

Three tiers, each in its own source set, each answering one question.

| Tier                | Source set         | Runs on                          | Answers                               |
| ------------------- | ------------------ | -------------------------------- | ------------------------------------- |
| Unit                | `src/test/`        | the JVM                          | does the logic produce the right state |
| Goldens             | `src/test/`        | the JVM, under Robolectric       | does each screen look right, and pass the a11y checks |
| Compose UI (E2E)    | `src/androidTest/` | a headless emulator, via Gradle Managed Devices | does the app work end to end |

The test framework, assertions and coroutine testing are the `kotlin` skill's;
this reference is what the app adds.

## Unit tests

- **ViewModels are tested through their state.** Construct the ViewModel with
  fake repositories (hand-written fakes, not mocks of your own types), drive it
  with method calls, and assert on `uiState` values — with `runTest` and a
  `StandardTestDispatcher` set as `Dispatchers.Main` by a JUnit rule, and
  Turbine or `first()` for the flow.
- **Repositories are tested against fakes of their sources**, and Room DAOs
  against an in-memory database under Robolectric.

## Goldens

- **A golden is a Roborazzi capture of the stateless screen** in one state on
  one device, inside the app theme:

  ```kotlin
  @RunWith(AndroidJUnit4::class)
  @GraphicsMode(GraphicsMode.Mode.NATIVE)
  @Config(qualifiers = RobolectricDeviceQualifiers.Pixel7)
  class OrderListGoldens {
    @get:Rule val compose = createComposeRule()

    @Test fun default() {
      compose.setContent { AppTheme { OrderListScreen(OrderListPreviewData.content) } }
      compose.onRoot().captureRoboImage("mobile/004a--default.png")
    }
  }
  ```

  The file name is the screen's code and state, under the platform the
  qualifiers render (`mobile` for a phone, `tablet` for `MediumTablet`), so the
  `ux-gate` finds it. Paths and properties are the conventions'.
- **Every pinned state of a screen in the flow's Screens table has a golden**,
  on every platform the screen ships to. A state with no golden is a gap the
  `ux-gate` reports.
- **The accessibility check runs on every golden** through a `RoborazziRule`
  with `RoborazziATFAccessibilityCheckOptions` (preset `LATEST`, failure level
  error) and the after-test strategy, so a missing label or a small touch
  target fails the golden test.
- **Run them with `mise run test:golden`**, which verifies and never records.
  `mise run test:golden -- --record` re-records; the changed PNGs are reviewed
  as a diff before they are committed, and a recording is never committed to
  make a failing verification pass without that review.
- **Goldens are deterministic.** No current time, random data or network in a
  golden: the sample UI states are fixed, animations are at rest, and fonts are
  bundled rather than the system's.

## Compose UI tests on the emulator

- **End-to-end flows** — launch, sign in, complete a task — are Compose UI
  tests with `createAndroidComposeRule<MainActivity>()`, finding nodes by
  semantics (text, content description, `testTag`) and acting on them.
- **They run on a headless emulator defined as a Gradle Managed Device**, so
  every machine and CI boot the same image. The `framework/android` pack owns
  the device definitions and the task; locally, `./gradlew connectedCheck` runs
  the same tests on an emulator already running.
- **Hilt in instrumented tests** uses `@HiltAndroidTest`, a `HiltAndroidRule`
  ordered before the Compose rule, and a custom runner that swaps in
  `HiltTestApplication`; test modules replace the network with a fake — see
  [Hilt](integrations/hilt.md).
- **Keep them few.** A behaviour a ViewModel test or a golden can prove is not
  proved again on the emulator.

## Coverage

Coverage is the unit and golden tiers', measured by the coverage tool the
`kotlin` skill names over `testDebugUnitTest`. Emulator tests are not counted;
they exist for the paths only a device can exercise.
