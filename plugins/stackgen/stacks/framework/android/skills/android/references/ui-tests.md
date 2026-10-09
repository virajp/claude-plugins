# Android — UI tests on the emulator

The E2E tests are **Compose UI tests run as instrumented tests** on a real
emulator: the app process, the real framework, no stubs below the network.
They are few — the critical journeys a release must not break — and everything
else is a JVM unit test or a golden, which are faster and less flaky.

## Placement

In the app module's `src/androidTest/kotlin/`, mirroring the feature they
cover, run by `androidx.test.runner.AndroidJUnitRunner`. Dependencies come from
the version catalog: `androidx.compose.ui:ui-test-junit4` on
`androidTestImplementation`, and `ui-test-manifest` on
`debugImplementation`.

## Shape

```kotlin
class SignInJourneyTest {
    @get:Rule
    val compose = createAndroidComposeRule<MainActivity>()

    @Test
    fun signsInAndLandsOnHome() {
        compose.onNodeWithText("Email").performTextInput("user@example.com")
        compose.onNodeWithText("Password").performTextInput("secret")
        compose.onNodeWithText("Sign in").performClick()
        compose.onNodeWithText("Home").assertIsDisplayed()
    }
}
```

- **Find by what the user sees** — text and content descriptions — and fall
  back to a `testTag` only where nothing user-visible is unique. A test that
  cannot find a control by its label has found an accessibility defect.
- **No sleeps.** Compose idles the test until the UI settles; asynchronous work
  outside Compose is registered as an idling resource or awaited with
  `waitUntil` and a condition.
- **One journey per test**, independent of the others: each starts from a
  fresh activity and clears its own state.
- **The network is a fake server**, not production: the test build points the
  client at a local mock web server the test starts, with recorded responses.
  A test that passes only with the real backend up is a staging test, not this.

## Running

- `mise run test:e2e` — the managed device, headless, as CI runs it.
- `mise run test:e2e -- --connected` — `connectedCheck` on the emulator or
  device already running, for a fast local loop while writing a test.

Failures leave their reports under each module's `build/outputs/` and
`build/reports/androidTests/`; CI uploads that directory on a failed run.
