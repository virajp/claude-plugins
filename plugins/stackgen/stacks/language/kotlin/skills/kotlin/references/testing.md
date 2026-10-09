# Kotlin — testing

Tests are **`kotlin.test` on JUnit 5**: the `kotlin("test")` dependency with
`useJUnitPlatform()` on the test task, so `@Test` and `assertEquals` resolve to
JUnit 5. Coroutine code is tested with **`kotlinx-coroutines-test`**, and
coverage is measured with **Kover**. All three are declared through the version
catalog — see the **gradle** skill.

## Placement

- Tests live in each module's `src/test/kotlin/`, in the same package as the
  code under test, so `internal` declarations are reachable without ceremony.
- A test class mirrors the source file it covers, by name: `Parser.kt` is
  covered by `ParserTest.kt`.
- Fixtures live in `src/test/resources/` and are read from the classpath,
  never from a path relative to the working directory.

## Test the public surface

**Write tests the way a consumer calls the code.** A test against the public
API is a test of the contract, and it survives an internal refactor. Testing an
`internal` piece directly is fine where it is genuinely worth testing alone — a
parser, a state machine — but a library whose tests only reach internals has an
untested public API.

## Shape

- **One behaviour per test.** Name the test for the behaviour with a
  backticked name: ``fun `rejects an empty key`()``.
- `assertEquals(expected, actual)` — the expected value first.
  `assertFailsWith<SomeException> { }` for an expected exception, asserting on
  the type the API documents.
- **Parameterised cases over copy-paste**: a list of cases iterated inside one
  test with a message per case, or JUnit 5's `@ParameterizedTest` where each
  case should be reported separately.
- No shared mutable state between tests. JUnit 5 creates a fresh instance per
  test method; keep it that way rather than switching the lifecycle.
- Test doubles are hand-written fakes of the library's own interfaces. A
  mocking library is a last resort for a type the library does not own.

## Coroutines

- Suspending code runs inside `runTest { }`, which skips `delay` with virtual
  time, so a test of a timeout runs instantly.
- Inject the dispatcher (see [the async model](async-model.md)) and pass a
  `StandardTestDispatcher(testScheduler)` in the test; `advanceUntilIdle()` and
  `advanceTimeBy()` drive it.
- Flows are tested by collecting into a list (`flow.take(n).toList()`), or by
  collecting in `backgroundScope` while the test drives the source.
- Never `Thread.sleep` or a real-time wait in a test.

## Coverage

Kover reports line and branch coverage for the JVM target
(`./gradlew koverHtmlReport`, `koverVerify` for a threshold). Coverage is a
signal for untested branches, not a target to game — a threshold, where the
repo sets one, sits in the build script and fails the build.

## Running

`./gradlew test` runs every module's tests; `--tests '<pattern>'` narrows while
iterating. `./gradlew check` runs the tests plus every verification task the
build declares. See [build & run](build-and-run.md).
