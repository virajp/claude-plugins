# SwiftUI — conventions

The native Apple app stack. **Tuist owns the project; Xcode owns the build.**
The app's project is declared in Swift — `Project.swift` for the targets,
`Tuist.swift` for the configuration, `Tuist/Package.swift` for the external
packages — and `tuist generate` writes the Xcode project and workspace from
them. `xcodebuild`, which Tuist drives, compiles, signs and tests.

**Why this is an app framework, not a framework on the Swift language.** The
four-part test for an SDK that is the root of its bundle holds for Xcode with
Tuist in front of it:

- **It owns the manifest.** `Project.swift` declares the targets, their
  destinations, deployment targets, entitlements and signing; the package list
  is subordinate to it, linked into the targets it names. There is no
  `Package.swift` at the root describing the app.
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

**Xcode is pinned by the project, not by mise.** mise cannot install Xcode.
`compatibleXcodeVersions` in `Tuist.swift` names the versions the project
builds with, and `tuist generate` refuses any other — so the pin travels with
the project and fails before a build starts. Tuist itself is mise's, pinned in
`.config/mise/conf.d/swiftui.toml`.

**No pack lands `Project.swift`, `Tuist.swift` or `Package.swift`.** `tuist
init` creates them, and the repo owns them from then on. The generated
`.xcodeproj`, `.xcworkspace` and `Derived/` are output: never edited by hand,
and kept out of git — the repo's `.gitignore` must list all three, since no
pack ignores the first two yet. A change to the project is a change to
`Project.swift`, followed by a regeneration.

**One project, several surfaces.** An app declares whichever of iPhone, iPad,
Mac, CarPlay, Watch, TV and Vision it ships as destinations of its targets —
one project, never one project per device. A web surface is not offered by
this pack.

**Single-package, always.** The app is one Tuist project in one repo. Shared
code is a module of that project; a library other apps consume is a Swift
package in its own repo, on the Swift package stack.

**Tool configs live under `.config/`.** swift-format reads
`.config/swift-format.json` and SwiftLint `.config/swiftlint.yml`, both passed
explicitly by the tasks.

## The task library this pack owns

This pack ships a `config/.config/mise/tasks/` tree and a
`config/.config/mise/conf.d/swiftui.toml` pin, landing at the repo's own
`.config/mise/` behind the materializer's config consent line. It is the
bundle's **whole** task set — no other component of the SwiftUI bundle ships a
task — copied from the Swift language pack byte for byte wherever no Tuist step
is needed; the ones below that name Tuist are this pack's own.

| Task | Does |
| --- | --- |
| `code:format` | dprint and shfmt, then `swift format` over the Swift sources — in place under `--fix`, then a strict lint either way; the generated trees (`.build/`, `.swiftpm/`, `Derived/`, `DerivedData/`, `*.generated.swift`) never judged |
| `code:lint` | shellcheck and actionlint over the staged files, the house linter over every file git does not ignore, then `swiftlint lint --strict` over the same Swift scope |
| `setup:deps:install` | fails fast when `xcodebuild` or `tuist` is missing, then `tuist install` and `tuist generate --no-open`; `--frozen` refuses to move `Package.resolved` |
| `setup:deps:audit` | a stated no-op — SwiftPM ships no advisory command |
| `setup:deps:cleanup` | removes `.build/`, `Tuist/.build/` (the package checkouts) and `Derived/` — never Tuist's shared caches |
| `setup:deps:outdated` | `swift package update --dry-run` against `Tuist/Package.swift`, or a root `Package.swift` |
| `setup:deps:upgrade` | `tuist install --update`, then `tuist generate --no-open` |
| `test:golden` | the snapshot test target — `SnapshotTests`, or `--target` — through `tuist test`, comparing against the recorded goldens; `--record` records afresh, then compares; `--device` and `--os` name the simulator, which recording and comparing must share |

**`setup:deps:install` is fetch and generate in one task**, and the reason is
causal: the generated project links what the install fetched, so a project
generated before the install describes a dependency graph that is not there.

**The goldens are swift-snapshot-testing image snapshots** of SwiftUI views,
in a test target of their own, recorded into the repo beside the tests that
own them. A comparison never records, so a view with no golden fails rather
than passing on a golden it just wrote; a failed comparison leaves the
reference, the new render and their diff under `.build/snapshot-artifacts/`,
which the `ux-gate` skill hands to the reviewer.

Full judgment: the `swiftui` skill's references.
