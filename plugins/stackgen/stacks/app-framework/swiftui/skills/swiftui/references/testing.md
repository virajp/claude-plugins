# SwiftUI — testing & coverage

Four test surfaces, each with one job: **unit tests** of models and clients,
**golden tests** of views, **UI tests** of a few critical journeys, and the
**accessibility** checks the UX gate runs. The language-level rules — Swift
Testing by default, one behaviour per test, parameterised cases, no sleeps —
are the **swift** skill's testing reference and apply here unchanged.

## Placement

A test target per module, declared in `Project.swift` beside the module it
covers; test files mirror the source files they test. Goldens are the
exception: they live in a snapshot test target of their own — `SnapshotTests`
unless the repo names another — so they run apart from the unit tests and
nothing else is judged by pixels.

## Unit tests: models are where the logic is

Because views hold no logic (see
[standards & architecture](standards-and-architecture.md)), most tests are
model tests: create the model, call its intent methods, assert its state and
the navigation path it produced. No rendering, no simulator UI.

Models are main-actor state, so their tests run on the main actor.

## Dependencies in tests and previews

swift-dependencies is what keeps these tests hermetic.

- **A test never reaches a live dependency by accident.** The library fails a
  test that touches a dependency whose live value was not overridden, and each
  client's test value is unimplemented by default — so a new network call in a
  model shows up as a failing test, not a slow one.
- **Override per test with `withDependencies`**, around the model's creation:
  the overrides apply to the model and everything it creates. Where the
  library's Swift Testing support is used, a dependency trait on the test says
  the same thing with less nesting.
- **Override only what the test is about.** A test that stubs every client is a
  test of the stubs. Give clients sensible test values — an immediate clock, an
  incrementing id generator — and override the one under test.
- **Reaching a live value in a test is explicit.** An integration test that
  genuinely wants the real client says so in its override, visibly.
- **Previews use preview values.** A client's preview value returns fixed,
  synchronous data, so previews are fast and never touch the network; a single
  preview that needs a different world prepares its dependencies at the top of
  the preview.

## Goldens: swift-snapshot-testing

View goldens use **swift-snapshot-testing** (Point-Free), a SwiftPM test
dependency, run by the repo's `test:golden` task. The task checks that
`xcodebuild` and `tuist` are on the path, then runs `tuist test` over the
snapshot target alone — its `--target` flag names another — with selective
testing off, because a golden run that skips an unchanged target judged
nothing. It compares with recording off, so a view with no golden fails rather
than quietly recording one. A failed comparison leaves the reference, the new
render and their diff under `.build/snapshot-artifacts/`, emptied at the start
of each run so what is there is that run's.

- **One golden per screen state** the flow's Screens contract names — empty,
  loading, loaded, error, and each variant the contract pins — rendered with
  preview dependencies so the image is deterministic.
- **Render at the resolved viewport.** A golden's size is the platform's
  viewport as the product resolves it: the per-product override
  `design.viewports.<project>.<platform>` in `.config/vwf.yaml` when set, else
  the platform default. Use the library's device layout where one matches that
  size, a fixed layout of that size where none does. A golden at a size the
  design never specified checks nothing the design cares about.
- **Cover the axes that change rendering**: light and dark, the default and the
  largest accessibility Dynamic Type size, and right-to-left where the product
  ships a right-to-left locale.
- **Record deliberately.** Recording is `test:golden --record`, an intentional
  run: it writes every golden afresh, then runs the comparison against the new
  images, and that comparison is the verdict — the library fails every
  assertion it records, so the recording pass's own result means nothing.
  Recording is never left on in a committed test, and a changed reference
  image is reviewed in the diff like code.
- **One simulator, one OS.** References are only comparable when recorded and
  verified on the same simulator model and OS version — which is what the
  Xcode pin (see [build & signing](build-and-signing.md)) guarantees. A new
  Xcode re-records in its own change.
- **A platform the library cannot render is a stated gap.** Where there is no
  image strategy for a platform's views, say so in the gate's report; never
  count the absence as a pass.

The repo's `ux-gate` skill runs the goldens and the accessibility checks for
vwf's UX review, and reports a changed screen with no golden as a finding.

## UI tests: few, and only for journeys

XCUITest drives the real app and is slow and brittle, so it covers only the
journeys whose failure would stop the product — sign in, the core purchase or
creation flow, a deep link landing. Query by accessibility identifier, never by
visible text or position. Everything a model test or a golden can cover is
covered there instead.

## Accessibility

Accessibility is tested, not reviewed by eye: labels on every interactive
element, contrast in both colour schemes, tap-target sizes, Dynamic Type at the
largest size without truncation. UI tests can run the system's accessibility
audit on a screen; goldens at the largest type size catch layout that breaks.

## Coverage

Enable code coverage in the test scheme and read it per module. Coverage is a
map of what is untested, not a target: every model intent has a test, every
client error case has a test that produces it, and every screen state the
contract names has a golden.
