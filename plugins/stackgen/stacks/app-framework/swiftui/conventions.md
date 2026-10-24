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

**Xcode is found, not installed.** mise cannot install Xcode. The repo's
`_scripts/xcode` library, which bootstrap ships, finds the selected Xcode and
exports `XCODE_VERSION` (`27.0`, say — the version `xcodebuild -version`
prints). A repo that must build with one Xcode sets `XCODE_VERSION` in the
`[env]` of `.config/mise/conf.d/zz-repo/mise.<env>.toml` and commits it. Every
task that builds checks the selected Xcode against that value first, and stops
with the fix when they differ. The same check refuses a Mac with only the
Command Line Tools, where `xcodebuild -version` fails, and `/vwf:doctor` probes
the same command rather than looking `xcodebuild` up on `PATH`, where that
Mac's stub is found.

**The golden simulator comes from the same library.** `SIMULATOR_PLATFORM`
(`iOS` by default), `SIMULATOR_DEVICE` (`iPhone 17`, say) and `SIMULATOR_OS`
(`27.0`) name the one simulator every golden is recorded and compared on.
Without a value, `_scripts/xcode` picks the newest iOS runtime and its
highest-numbered plain iPhone. That choice moves when a machine installs a
newer runtime, so a repo that commits goldens sets all three in the same
`zz-repo` `[env]`. A Mac-only app sets `macOS`, which needs no device or OS.
The goldens are that one platform's. `ux-gate` reports `rendered: ok` only
when some changed platform's goldens were compared; an audit-only run is
`n/a`. It audits accessibility on the device's own platform (read from its
product family — iPhone is `mobile`, iPad `tablet`) and on `desktop` through
macOS, and reports every other changed platform, `auto` always among them,
`n/a` with a finding.

**The tasks read the values from the environment mise exports**, never from a
file. A value set in the environment or in a gitignored `mise.local.toml` is a
machine's deliberate override (a CI job choosing another simulator, say).

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

## The task this pack owns

This pack ships one task, `test/golden`, landing at the repo's own
`.config/mise/tasks/` behind the materializer's config consent line. The rest
of the toolchain is bootstrap's: `mise run setup` resolves the project's
packages from the committed `Package.resolved`, `mise run setup --upgrade`
moves them to the newest versions their ranges allow, and `mise run code`
runs the format and lint gates. `test:golden` locates the project as the
single `*.xcodeproj` at the repo root, refusing none or several, and checks
Xcode first through the `_scripts/xcode` library. Package checkouts and build
products go under `.build/`.

| Task | Does |
| --- | --- |
| `test:golden` | `xcodebuild test` on the project, limited to the snapshot target — `SnapshotTests`, or `--target` — in the project's scheme, or `--scheme`; the `-destination` is built from `SIMULATOR_PLATFORM`, `SIMULATOR_DEVICE` and `SIMULATOR_OS` in mise's environment, or found by `_scripts/xcode` when the repo sets none, which `--platform`, `--device` and `--os` override for one run (`--platform` never alone); `Package.resolved` is never moved; compares against the recorded goldens, `--record` records afresh and then compares, on those values only — refused with an override that moves the destination; the result bundle is `.build/golden.xcresult` |

**The goldens are swift-snapshot-testing image snapshots** of SwiftUI views,
in the `SnapshotTests` target, recorded into the repo beside the tests that
own them. A comparison never records, so a view with no golden fails rather
than passing on a golden it just wrote. A failed comparison leaves the
reference as the committed file under the test's `__Snapshots__` directory,
the new render under `.build/snapshot-artifacts/`, and the diff as an
attachment in `.build/golden.xcresult` — the three the `ux-gate` skill hands
to the reviewer.

**Why the task is built the way it is.** The task file carries one-line
warnings only; the reasoning is here.

- `_scripts/xcode` checks `xcodebuild -version`, never a `PATH` lookup: every
  Mac carries a `/usr/bin/xcodebuild` stub that exists and fails with only the
  Command Line Tools selected. `find_xcodeproj` is called
  as a command substitution, so its messages go to stderr.
- `test:golden` passes the record mode through xcodebuild, which strips the
  `TEST_RUNNER_` prefix and hands the rest to the tests. The library fails
  every assertion it records, so the recording run's exit status is ignored and
  the comparison after it is the verdict. `-collect-test-diagnostics never`
  skips a sysdiagnose-sized bundle that costs minutes on every failure, and
  every recording run fails by design. `.build/snapshot-artifacts/` is emptied
  first, so what is there is this run's.

Full judgment: the `swiftui` skill's references.
