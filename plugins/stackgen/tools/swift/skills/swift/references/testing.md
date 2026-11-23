# Swift — testing

Tests are **Swift Testing** — `import Testing`, `@Test`, `#expect`,
`#require` — run by `swift test`. XCTest remains for code that already uses it
and for the few things Swift Testing does not cover; new tests do not start
there.

## Placement

- One test target per source target: `Tests/<Target>Tests/`, declared in the
  manifest beside it.
- Test files mirror the source files they cover, by name, so a reader finds
  the test for `Parser.swift` in `ParserTests.swift`.
- Fixtures live in the test target as resources, never read from a path
  relative to the working directory.

## Test the public surface

**Import the module the way a consumer does.** A test written against the
public API is a test of the contract, and it survives an internal refactor.

`@testable import` reaches `internal` declarations. Use it for the internal
logic that is genuinely worth testing on its own — a parser, a state machine —
not as the default, and never to reach something that should have been
public. A package whose tests all need `@testable` has an untested public API.

## Shape

- **One behaviour per test**, named for the behaviour, via the `@Test`
  display name rather than a long function name.
- `#expect` for assertions that should let the test continue; `#require` for
  preconditions whose failure makes the rest meaningless — it throws and ends
  the test.
- **Parameterised tests over copy-paste**: pass the cases as arguments to
  `@Test` rather than writing one test per input.
- Group related tests in a `@Suite` type; use its `init` for shared setup —
  each test gets a fresh instance, so there is no shared state to reset.
- Traits (`.tags`, `.enabled(if:)`, `.timeLimit`) state conditions on the test
  itself, never an early `return` inside it.
- Expected errors are asserted with `#expect(throws:)`, naming the error type
  or case — never a `do`/`catch` that passes when nothing throws.

## Concurrency in tests

Swift Testing runs tests **in parallel by default**. A test that depends on
shared global state is a flaky test waiting to happen: remove the shared state
rather than serialising the suite. `.serialized` is for a suite whose subject is
genuinely a process-wide resource, and says why.

Test `async` code with `async` tests, awaiting the real result. Never sleep to
wait for work to finish; await it, or inject a clock.

## Doubles

A protocol at the seam is what makes a double possible — see
[coding standards](standards.md). Prefer a small hand-written fake over a
mocking framework; a fake that records calls is usually all a test needs.

## Coverage

`swift test --enable-code-coverage` produces coverage for the package. Coverage
is a map of what is untested, not a target: every public declaration has a
test, and every thrown error case has a test that produces it.
