# SwiftUI — testing & coverage

Four test surfaces, each with one job: **unit tests** of models and clients,
**golden tests** of views, **UI tests** of a few critical journeys, and the
**accessibility** checks the UX gate runs. The language-level rules — Swift
Testing by default, one behaviour per test, parameterised cases, no sleeps —
are the **swift** skill's testing reference and apply here unchanged.

## Placement

A test target per module, added in Xcode beside the module it covers; test
files mirror the source files they test, and a new test file needs no project
edit (see [project layout](project-layout.md)). Goldens are the exception:
they live in a snapshot test target of their own — a Unit Testing Bundle named
`SnapshotTests`, created in Xcode when the project is — so they run apart from
the unit tests and nothing else is judged by pixels.

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

View goldens use **swift-snapshot-testing** (Point-Free), a SwiftPM package
added through Xcode's package dependencies and attached to the `SnapshotTests`
target alone — never to the app or a framework target. The repo's
`test:golden` task runs them: it checks the selected Xcode against the pin (see
[build & signing](build-and-signing.md)), then runs `xcodebuild test` on the
project limited to the snapshot target — its `--target` flag names another —
so a golden run judges every golden and nothing else. It compares with
recording off, so a view with no golden fails rather than quietly recording
one. On a failed comparison the three images live in three places: the
reference is the committed file under the test's `__Snapshots__` directory,
the new render lands under `.build/snapshot-artifacts/` — emptied at the start
of each run, so what is there is that run's — and the diff is an attachment in
the run's result bundle, which the task always writes to
`.build/golden.xcresult` so it is found in the same place every run.

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
- **One simulator, one OS.** A golden is pixels from one simulator: another
  device or OS version renders differently, and every comparison against it
  fails. The Xcode pin fixes the toolchain but neither the device nor the
  runtime. So goldens are recorded and compared on one named simulator, pinned
  once in the repo's mise `[env]` as `SIMULATOR_DEVICE`, `SIMULATOR_OS` and
  `SIMULATOR_PLATFORM`, from which `test:golden` builds its destination — so
  recording, comparing, the UX gate and CI render on the same simulator.
  A second platform's goldens run through `test:golden`'s one-run overrides,
  `--platform`, `--device` and `--os` — macOS needs `--platform` alone, no
  device — and a golden is compared on exactly the simulator it was recorded
  on. Moving the pin, or moving Xcode, re-records in its own change.
- **One run per changed platform.** A product on several platforms has goldens
  for each, and a simulator renders one platform. The UX gate runs the goldens
  on the pinned simulator, and on macOS as well when macOS is among the
  changed platforms. Any other changed simulator platform has no pinned
  simulator to render on, so the gate reports it `n/a` with a finding that it
  is unpinned — never `ok`, since a comparison that did not happen passed
  nothing — and never runs it on a simulator it picked itself.
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
