# SwiftUI — conventions

The native Apple app stack. **Xcode owns the project and the build.** The app
is one committed Xcode project, `<Name>.xcodeproj` at the repo root, created
once by a person in Xcode; no generator writes it. `xcodebuild` and `swift`
are the only tools the tasks call.

**Why this is an app framework, not a framework on the Swift language.** The
four-part test for an SDK that is the root of its bundle holds for Xcode:

- **It owns the manifest.** `project.pbxproj` declares the targets, their
  destinations, deployment targets, entitlements, signing and the packages they
  link; the package list is subordinate to it. There is no `Package.swift` at
  the root describing the app.
- **It owns the build.** Xcode's build system compiles, links, embeds, signs
  and packages the app; SwiftPM only fetches what the project links.
- **It decides which languages exist.** A target's sources are what the
  project says they are; Objective-C, C or Metal enter only because a target
  names them.
- **Its language's tooling comes through it.** The Swift compiler and
  sourcekit-lsp are the ones inside the selected Xcode, not a toolchain
  installed beside it.

**Swift is the primary language, and there is no platform edge.** The app is
Swift top to bottom; Objective-C and C reach it only through interop, and that
is the platform-interop reference's, never a second language member.

**Creating the project is a person's step, in Xcode.** No pack lands the
`.xcodeproj`, and Xcode has no command that creates one. In Xcode: File → New
→ Project → App, saved at the repo root; then File → New → Target → Unit
Testing Bundle, named `SnapshotTests`, testing the app; then File → Add Package
Dependencies → `https://github.com/pointfreeco/swift-snapshot-testing`, added
to `SnapshotTests` only. Mark the app's scheme **Shared** (Product → Scheme →
Manage Schemes) so it is committed and `xcodebuild` finds it on every machine.

**The project is committed whole, except `xcuserdata/`.** That includes
`Package.resolved`, the package lockfile, which Xcode keeps inside the project
at `<Name>.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/`. Per-user
state — `xcuserdata/`, and DerivedData wherever it lives — never is.

**Agents edit `project.pbxproj` sparingly.** A source file under a
synchronized folder joins its target by existing, so adding, moving or
removing Swift files needs no project edit. Targets, packages, build settings,
capabilities and signing do. Prefer asking a person to make those changes in
Xcode; edit `project.pbxproj` by hand only when that is not possible, and
build afterwards to prove the file still loads.

**Xcode is pinned by the repo, not installed by it.** mise cannot install
Xcode. This pack's `templates/.config/mise/conf.d/swiftui/mise.toml` sets
`XCODE_VERSION` in mise's `[env]` (`27.0`, say — the version
`xcodebuild -version` prints) from the `@@XCODE_VERSION@@` value, filled by
`/vwf:setup` as it lands the pack: it reads the value from this machine, offers
it as the default, and stores the one confirmed under `packs.swiftui` in
`.config/stackgen.yaml` through tool-config's `pack --set`, which renders the
file. The value is the repo's committed pin, not a per-machine override. Every
task that builds or resolves checks the selected Xcode against it first and
stops with the fix when they differ — or when `XCODE_VERSION` is empty, since
an unpinned build checks nothing. The same check refuses a Mac with only the
Command Line Tools, where `xcodebuild -version` fails, and `/vwf:doctor` probes
the same command rather than looking `xcodebuild` up on `PATH`, where that
Mac's stub is found.

**The golden simulator is pinned there too.** `SIMULATOR_PLATFORM`
(`iOS Simulator`, say), `SIMULATOR_DEVICE` (`iPhone 17`) and `SIMULATOR_OS`
(`27.0`), the same file's other three values, name the one simulator every
golden is recorded and compared on, filled the same way — `/vwf:setup` offers
the first available iPhone on this machine's newest iOS runtime. A Mac-only
app pins `macOS`, which needs no device or OS. The goldens are that one
platform's. `ux-gate` reports `rendered: ok` only when some changed platform's
goldens were compared; an audit-only run is `n/a`. It audits accessibility on
the pinned device's own platform (read from its product family — iPhone is
`mobile`, iPad `tablet`) and on `desktop` through macOS, and reports every
other changed platform, `auto` always among them, `n/a` with a finding.

**The tasks read the pins from the environment mise exports**, never from a
file. A pin set in the environment or in a gitignored `mise.local.toml` is a
machine's deliberate override (a CI job choosing another simulator, say). An
unset or empty pin is refused as unpinned, naming `/vwf:setup` as the fix —
by `test:golden` only when its run does not pass all three overrides.

**One project, several surfaces.** An app declares whichever of iPhone, iPad,
Mac, CarPlay, Watch, TV and Vision it ships as destinations of its targets —
one project, never one project per device. A web surface is not offered by
this pack.

**Single-package, always.** The app is one Xcode project in one repo. Shared
code is a module of that project, or a local Swift package beside it; a
library other apps consume is a Swift package in its own repo, on the Swift
package stack.

**Tool configs live under `.config/`.** swift-format reads
`.config/swift-format.json` and SwiftLint `.config/swiftlint.yml`, both passed
explicitly by the tasks. No pack lands a root config, a `Package.swift` or the
project.

## The task library this pack owns

This pack ships a `config/.config/mise/tasks/` tree, landing at the repo's own
`.config/mise/` behind the materializer's config consent line: the five
`setup/deps/<verb>/swiftui` subtasks, `test/golden` and the `_scripts/xcode`
library. Formatting and linting are not this pack's: the bundle's
`toolchain-gate/swift-format` pack owns `code:format:swift-format` and
`code:lint:swift-format`, and `toolchain-gate/swiftlint` owns
`code:lint:swiftlint`, each called by name from the repo's
`code:format:all` and `code:lint:all` beside the universal subtasks — dprint,
shfmt, shellcheck, actionlint and the house linter. Each task below that names
Xcode locates the project as the single `*.xcodeproj` at the repo root, refusing
none or several, and checks Xcode first through the shared
`_scripts/xcode` library beside them. Package checkouts and build products go
under `.build/`.

| Task | Does |
| --- | --- |
| `setup:deps:install:swiftui` | `xcodebuild -resolvePackageDependencies` on the project, checkouts under `.build/SourcePackages`; `--frozen` adds `-onlyUsePackageVersionsFromResolvedFile`, refusing to move `Package.resolved` |
| `setup:deps:audit:swiftui` | a stated no-op — SwiftPM ships no advisory command |
| `setup:deps:cleanup:swiftui` | removes `.build/` — the checkouts and the build products; `Package.resolved` stays |
| `setup:deps:outdated:swiftui` | resolves afresh with the committed `Package.resolved` set aside, lists each pin that would move as `<package> <pinned> -> <newest>`, and puts the lockfile back |
| `setup:deps:upgrade:swiftui` | removes `Package.resolved` and resolves again, so every package moves to the newest version its range allows; a failed resolve puts the old lockfile back |
| `test:golden` | `xcodebuild test` on the project, limited to the snapshot target — `SnapshotTests`, or `--target` — in the project's scheme, or `--scheme`; the `-destination` is built from `SIMULATOR_PLATFORM`, `SIMULATOR_DEVICE` and `SIMULATOR_OS` in mise's environment, which `--platform`, `--device` and `--os` override for one run (`--platform` never alone), and a run with no pin and not all three overrides is refused; `Package.resolved` is never moved; compares against the recorded goldens, `--record` records afresh and then compares, on the pin only — refused with an override that moves the destination; the result bundle is `.build/golden.xcresult` |

**The goldens are swift-snapshot-testing image snapshots** of SwiftUI views,
in the `SnapshotTests` target, recorded into the repo beside the tests that
own them. A comparison never records, so a view with no golden fails rather
than passing on a golden it just wrote. A failed comparison leaves the
reference as the committed file under the test's `__Snapshots__` directory,
the new render under `.build/snapshot-artifacts/`, and the diff as an
attachment in `.build/golden.xcresult` — the three the `ux-gate` skill hands
to the reviewer.

**Why the tasks are built the way they are.** The task files carry one-line
warnings only; the reasoning is here.

- `_scripts/xcode` checks `xcodebuild -version`, never a `PATH` lookup: every
  Mac carries a `/usr/bin/xcodebuild` stub that exists and fails with only the
  Command Line Tools selected. `find_xcodeproj` is called
  as a command substitution, so its messages go to stderr.
- The `setup:deps:*` subtasks print no header: `setup:deps:all` frames each
  verb. `audit` is a deliberate no-op, stated rather than left absent.
  `cleanup` keeps `Package.resolved`,
  the committed lockfile. `install` sends the checkouts to
  `.build/SourcePackages` rather than per-user DerivedData, so every task finds
  them at one path. xcodebuild has no dry run and no update verb —
  `-resolvePackageDependencies` honours an existing `Package.resolved` — so
  `outdated` and `upgrade` set the lockfile aside and resolve afresh; a pin on a
  branch or revision has no version and is not listed.
- `test:golden` passes the record mode through xcodebuild, which strips the
  `TEST_RUNNER_` prefix and hands the rest to the tests. The library fails
  every assertion it records, so the recording run's exit status is ignored and
  the comparison after it is the verdict. `-collect-test-diagnostics never`
  skips a sysdiagnose-sized bundle that costs minutes on every failure, and
  every recording run fails by design. `.build/snapshot-artifacts/` is emptied
  first, so what is there is this run's.

Full judgment: the `swiftui` skill's references.
