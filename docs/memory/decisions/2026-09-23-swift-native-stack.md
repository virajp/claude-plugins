# Decision — a native Swift stack, landed as a four-plan chain

**Date** 2026-09-23 to 2026-09-25 · **Plans**
[`2026-09-23-swift-stack-mechanism/`](../../plans/2026-09-23-swift-stack-mechanism/index.md)
(2a) ·
[`2026-09-23-swift-package-stack/`](../../plans/2026-09-23-swift-package-stack/index.md)
(2b) ·
[`2026-09-23-swiftui-app-stack/`](../../plans/2026-09-23-swiftui-app-stack/index.md)
(2c) ·
[`archived/2026-09-23-swiftui-platform-doctrine/`](../../plans/archived/2026-09-23-swiftui-platform-doctrine/index.md)
(2d) · **Retires**
[`archived/2026-09-23-swift-native-stack/`](../../plans/archived/2026-09-23-swift-native-stack/index.md),
not run · **Completes** B56

## What was decided before

stackgen's only `app-framework` bundle was `dart-flutter`: an Apple-only
product, or one reaching a platform Flutter does not build, had no shipped
stack, and a Swift package had no `language-bundle`. Plan 1,
[`2026-09-23-watch-tv-spatial-platforms.md`](./2026-09-23-watch-tv-spatial-platforms.md),
added the `watch`, `tv` and `spatial` tokens so a stack could declare them, and
named a plan 2 as the Swift pack set carrying B56.

## The chain, and why it was re-cut

Plan 2 was first approved as one folder, `2026-09-23-swift-native-stack`, with
the rulings E1–E18 below. Before it ran, the user asked for it to be re-cut for
reliability (S1): four plans, each landing something working on its own — **2a**
the mechanism (the `binaries` fact, init's detection, the hygiene mapping, the
exclusion lists), **2b** the `swift-package` stack, **2c** the `swift-swiftui`
app stack with doctrine topics 1–11, **2d** the per-platform references and
topic 12. The single folder was archived unrun; each successor carries the
rulings it needs with their original ids. Rejected: the one plan (retired);
splitting plan 1 too. 2a required plan 1 only to serialise the version files
both bump (S2); running them side by side was rejected for the conflicts it
would leave at merge.

Two side plans joined the chain: `2026-09-23-swift-tasks-git-compat` fixed the
package tasks' file listing before 2c copied them, and
`2026-09-24-swiftui-gap-closure` closed 2c's gaps before 2d ran — binary probes,
the `lockfile` and `machine_env` facts, and the ux-gate's `ok`.

## The rulings

- **E1 Bundle shape.** Two bundles: `swift-swiftui`, an `app-framework` bundle
  on `mobile`, `tablet`, `desktop`, `auto`, `watch`, `tv` and `spatial`, and
  `swift-package`, a `language-bundle` on `packages`. Rejected: one bundle per
  Apple OS; one bundle for everything.
- **E2 Project definition.** Tuist, generating the project from `Project.swift`.
  Rejected: XcodeGen; a committed `.xcodeproj`. **Reversed** in 2c (E2′, see
  below).
- **E3 Format and lint.** swift-format formats, from the toolchain; SwiftLint
  lints, through mise. Rejected: SwiftFormat plus SwiftLint; swift-format only.
- **E4 Doctrine depth.** The 12-topic bar, one reference per platform (iOS and
  iPadOS, macOS, CarPlay, watchOS, tvOS, visionOS) and Apple's core integrations
  — widgets and complications, App Intents, push notifications, StoreKit, Sign
  in with Apple. Third-party integrations parked. Rejected: full Flutter parity
  including third-party; the bar only.
- **E5 Goldens.** swift-snapshot-testing through SwiftPM, under `test:golden`
  and the `goldens` harness. Rejected: XCUITest screenshots; deferring goldens.
- **E6 Xcode.** A new optional pack fact `binaries:` lets doctor report a
  missing binary as blocking once the project is pinned, and the tasks fail
  fast; Tuist pinned the Xcode version. Rejected: `xcodes` with an
  `.xcode-version`; no pin; fail-fast in the tasks alone. The pin **reversed**
  in 2c (E6′).
- **E7 Names.** `app-framework/swiftui` in `swift-swiftui`; `language/swift` in
  `swift-package`. Rejected: `apple`/`swift-apple`; `xcode`/`swift-xcode`.
- **E8 Gate packs.** One per tool, `toolchain-gate/swift-format` and
  `toolchain-gate/swiftlint`, each landing its config under `.config/` and a VS
  Code fragment. Rejected: one combined gate pack.
- **E9 Shared tasks.** The swiftui tasks are copied byte for byte from
  `language/swift` wherever they need not differ, each difference named.
  Rejected: writing them afresh.
- **E10 LSP.** `sourcekit-lsp` declared byte-identical to Flutter's.
- **E11 Config placement.** Tool configs land under `.config/` and the tasks
  pass the path; no pack lands `Package.swift` or the app project. Rejected:
  root config files, which would widen the hygiene allowlist. The project half
  **reversed** in 2c (E11′).
- **E12 Exclusion lists.** `.build` and `Derived` join the three formatter
  lists; `.swiftpm` does not, since it holds user config; gitleaks untouched.
  Rejected: leaving the lists alone.
- **E13 init detection.** init's manifest table maps the Swift project files to
  swift beside `Package.swift` — `Project.swift` and `Tuist.swift` first, a root
  `*.xcodeproj` once Tuist was dropped.
- **E14 Wave-1 commit.** A wave that adds a pack lands as one commit with the
  regenerated inventory, which the pre-commit check demands. Rejected: one
  commit per unit.
- **E15 Review row.** A review row over every unit that ships shell task
  scripts. Rejected: none.
- **E16 Smoke test.** The orchestrator smoke-tests each bundle in `/tmp` before
  landing. Rejected: smoke-testing the package bundle only; none.
- **E17 Release.** No release step in any plan of the chain; the user runs
  `/release` once it has landed. Rejected: `/release` as `ask`; as `run`.
- **E18 Library docs.** Every unit resolves Apple, SwiftPM, swift-format,
  SwiftLint and swift-snapshot-testing behaviour through Context7 before writing
  about it, never from training knowledge.
- **S1–S2** are the chain shape and its serialisation, above.
- **S3 and S5 No review row.** 2a and 2d land prose and config payload, no
  runnable code; the wave review is their only check. Rejected: a review row.
- **S4 Router rows.** 2c's router links topics 1–11 only; 2d adds the platform
  and integration rows in the same plan as their files, after them, so no row
  ever links a missing file. Rejected: linking 2d's files early, broken between
  plans.
- **S6 Decision doc.** This one record covers 2a–2d. Rejected: one per plan.

## The reversal inside the chain

2c blocked at its second wave: `tuist init` failed from every mise-installed
Tuist. The user dropped Tuist (E2′): the app is a **committed `.xcodeproj`**
created once by a person in Xcode, and the tasks call `xcodebuild` and `swift`
alone — Xcode has no command that creates a project, and XcodeGen, a `.swiftpm`
app package (no watch, TV, vision or CarPlay targets) and Bazel were rejected.
The Xcode pin moved to `XCODE_VERSION` in mise's `[env]` (E6′), with the golden
simulator pinned beside it (E20) — both later filled by `/vwf:setup` into the
pack's own `conf.d/swiftui.toml` fragment from the `machine_env` fact the gap
closure added. No pack lands the project (E11′).

## What stands on it

B56 is done: plan 1 made watchOS, tvOS and visionOS declarable, and 2a–2d made
them buildable with native doctrine for each. Parked for later plans: SwiftPM
and mise names in `stackgen-reputation`, third-party SwiftUI integrations, a
server-side Swift bundle, OS- and vendor-specific features inside a form factor,
and retrofitting `binaries` onto the older packs. Kotlin and Android native is
B57.
