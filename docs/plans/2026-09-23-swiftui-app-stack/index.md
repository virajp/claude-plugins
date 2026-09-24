---
type: vwf-change-plan
title: SwiftUI app stack — the swiftui pack, Tuist, goldens, topics 1–11,
  the swift-swiftui bundle
requires: [
  docs/plans/2026-09-23-swift-package-stack,
  docs/plans/2026-09-23-swift-tasks-git-compat,
]
backlog: []
---

# Plan — SwiftUI app stack — the swiftui pack, Tuist, goldens, topics 1–11, the swift-swiftui bundle (2026-09-23)

## Status

**RUNNING**

RUNNING since 2026-09-24 (resumed at wave 3) in
.worktrees/2026-09-23-swiftui-app-stack

## Consent

| Action                                            | Granted                                                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                   |
| After landing: `mise run p:plugins:local`         | run                                                                                                   |
| Release stackgen publicly                         | minor — 1.30.1 → 1.31.0, by hand in `plugins/stackgen/.claude-plugin/plugin.json`                     |
| Release site publicly                             | patch — 1.1.45 → 1.1.46, `mise run p:site:version` (bare, no positional, on a clean tree)             |
| Release vwf publicly                              | patch — 19.45.0 → 19.45.1, by hand in `plugins/vwf/.claude-plugin/plugin.json` (amendment 2026-09-24) |
| Release installer publicly                        | none                                                                                                  |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

The `Release` rows are **intent, not authorisation**: no release step in any
plan of this chain (E17). `app-framework/swiftui` starts at 0.1.0.

## Goal

After this lands, a project can pin `swift-swiftui` — an `app-framework` bundle
rooted at a new `app-framework/swiftui` pack (`category: native-ui`) covering
`mobile`, `tablet`, `desktop`, `auto`, `watch`, `tv` and `spatial` — and
stackgen materializes a working SwiftUI app repo: a committed Xcode project
created in Xcode (amended 2026-09-24; Tuist dropped), Xcode pinned through
`XCODE_VERSION` in mise `[env]`, the swiftpm and gate packs 2b landed, golden
tests through swift-snapshot-testing, a `ux-gate` skill, and SwiftUI doctrine
across topics 1–11 of the app-framework bar.

Plan **2c** of the four-plan chain for B56 (see plan 2a's Goal). It requires 2b,
whose `language/swift` tasks this pack copies byte for byte where it needs no
Tuist step. Topic 12 (integrations) and the per-platform references are plan
2d's, which also adds their rows to this pack's router. No reversal.

## Facts the survey established

- **The Flutter model.** `app-framework/flutter` (0.4.0,
  `category: cross-platform-ui`) with `skills/flutter/SKILL.md` as the router,
  `skills/ux-gate/SKILL.md`, and a `goldens → test:golden` harness
  (`stacks/app-framework/flutter/pack.yaml:61-66`); composed by
  `stacks/bundles/dart-flutter.md:1-14` (`platforms:` without `default: true`).
- **The kind.** `plugins/stackgen/assets/kinds.md:754-796`: the four-part
  SDK-is-root test (`:764-780`), axis `project`, one router skill per language
  member paths-scoped to its extensions, `role` on every member. The 12-topic
  bar (`:798-835`): 1 Pick & trade · 2 Project layout & the generated boundary ·
  3 Standards & app architecture · 4 State management · 5 UI composition &
  theming · 6 Navigation & routing · 7 Data & networking · 8 Platform interop ·
  9 Build, flavors & signing · 10 Testing & coverage · 11 Performance & artifact
  size · 12 Integration wiring (plan 2d). An API listing is a reviewer gap
  (`:1137-1140`). `native-ui` (`taxonomy.md:117`) is unused until now.
- **What 2b landed** (read in the tree): `language/swift` with its tasks under
  `config/.config/mise/tasks/`, its `sourcekit-lsp` block (byte-identical to
  `app-framework/flutter/pack.yaml:55-60`) and `binaries: [swift]`;
  `package-manager/swiftpm`, `toolchain-gate/swift-format`,
  `toolchain-gate/swiftlint`, all at 0.1.0; the `binaries` fact itself from 2a.
- **Landing.** No pack lands `Project.swift`, `Tuist.swift` or `Package.swift`
  (`assets/output-tree.md:289-294`); configs under `.config/`; `config/` is
  payload, never formatted with this repo's dprint. `ux-gate` is a fixed skill
  name every pack with a `goldens` harness ships
  (`assets/artifact-doctrine.md:82-86`).
- **Overlap.** flutter-ios also scopes `**/*.swift`; a repo pins one stack, and
  no rule forbids overlapping globs.
- **Plan 1** added the `watch`, `tv`, `spatial` tokens and
  `design.viewports.<project>.<platform>` in `.config/vwf.yaml`.
- **Toolchain on this machine.** Xcode 27.0, Swift 6.4; `tuist` and `swiftlint`
  in mise's registry.
- **Versions** (after 2b): stackgen 1.30.0, site 1.1.43.
- **Commit convention.** Types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; no scopes.

## Assumed decisions — confirm or override at review

Ids carried from the retired `2026-09-23-swift-native-stack` folder.

| #   | Decision             | Ruling                                                                                                                                                                                                                     | Rejected                                           | Unit   |
| --- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| E1  | Bundle shape         | `swift-swiftui` is an app-framework bundle with `platforms: [mobile, tablet, desktop, auto, watch, tv, spatial]`                                                                                                           | one bundle per Apple OS; one bundle for everything | U3     |
| E2  | Project definition   | Tuist: the app's project is declared in `Project.swift` / `Tuist.swift` and generated; tasks run `tuist install` / `tuist generate`                                                                                        | XcodeGen; plain committed `.xcodeproj`             | U1, U2 |
| E4  | Doctrine depth       | Topics 1–11 here; one reference per platform and the Apple core integrations in plan 2d; third-party integrations parked                                                                                                   | full Flutter parity; the bar only                  | U2     |
| E5  | Goldens              | swift-snapshot-testing (Point-Free), through SwiftPM, under a `test:golden` task and the `goldens` harness                                                                                                                 | XCUITest screenshots; defer goldens                | U1     |
| E6  | Xcode                | Tuist's `compatibleXcodeVersions` pins the version; the pack declares `binaries: [xcodebuild, swift]`; the tasks fail fast                                                                                                 | xcodes + `.xcode-version`; no pin                  | U1     |
| E7  | Names                | `app-framework/swiftui` in bundle `swift-swiftui`                                                                                                                                                                          | `apple`; `xcode`                                   | U1, U3 |
| E9  | Shared tasks         | The swiftui pack's tasks are **copied** from the landed `language/swift` tasks, byte-identical wherever no Tuist step is needed; each file that differs is named in U1's report with the reason                            | writing them afresh                                | U1     |
| E10 | LSP                  | `sourcekit-lsp` declared byte-identical to `app-framework/flutter/pack.yaml:55-60`                                                                                                                                         | —                                                  | U1     |
| E11 | Config placement     | No pack lands `Project.swift`, `Tuist.swift` or `Package.swift`; `tuist init` creates them                                                                                                                                 | —                                                  | U1     |
| S4  | Router rows          | U1's router links topics 1–11 only; plan 2d adds the platform and integration rows with their files, so no row ever links a missing file                                                                                   | link 2d's files now (broken links between plans)   | U1     |
| E14 | Wave-1 commit        | Wave 1 lands as **one** commit, the orchestrator running `mise run p:plugins:inventory` into it                                                                                                                            | one commit per unit                                | —      |
| E15 | Review row           | R4 covers U1 — it ships shell task scripts                                                                                                                                                                                 | no review row                                      | R4     |
| E16 | Smoke test           | The orchestrator smoke-tests the app bundle in `/tmp` before landing                                                                                                                                                       | none                                               | —      |
| E17 | Release              | No release step                                                                                                                                                                                                            | `/release` as `ask`; as `run`                      | U6     |
| E18 | Library docs         | Units resolve Tuist, swift-snapshot-testing, swift-dependencies and Apple framework APIs through Context7 (`resolve-library-id` → `query-docs`) before writing about them — never from training knowledge                  | —                                                  | U1, U2 |
| E19 | Dependency injection | swift-dependencies (Point-Free), added by the app through SwiftPM: topic 3 recommends it as the pack's DI, topic 10 covers `testValue` / `previewValue` and `withDependencies` overrides; no pack lands a dependency on it | Factory; SwiftUI environment alone                 | U2     |

## Amendment 2026-09-24 — Tuist dropped for a committed Xcode project

The run blocked at wave 2: `tuist init` fails from every mise-installed Tuist,
so E11 could not hold. The user then ruled to drop Tuist altogether. Xcode has
no CLI that creates a project (`xcodebuild` has no create verb, and
`swift package init` has no app type). Given that, the user chose a committed
`.xcodeproj` over XcodeGen. **Reversals:** E2 (Tuist over XcodeGen or a
committed `.xcodeproj`), E6 (Xcode pinned by Tuist), E11 (`tuist init` creates
the manifests), and the out-of-scope line "Editing 2b's packs", for repo-hygiene
only. E2, E6 and E11 above are **superseded** by the rows below.

**U1 is superseded by U7** (same Owns), and its status is `skipped` for that
reason. A resume must not re-run U1, and must not re-run R4, which is green. It
starts at wave 3. U1's Tuist commits stay in history, and U7 rewrites their
files.

| #    | Decision             | Ruling                                                                                                                                                                                                                                                                                                         | Rejected                                                                                                           | Unit           |
| ---- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------- |
| E2′  | Project definition   | A committed `.xcodeproj`, created once by a person in Xcode; no project generator; tasks call `xcodebuild` and `swift` only; `conf.d/swiftui.toml` removed                                                                                                                                                     | Tuist (no mise build can run `tuist init`); XcodeGen; a `.swiftpm` app package (no watch/tv/vision/CarPlay); Bazel | U7, U8, U9, U5 |
| E6′  | Xcode pin            | The repo sets `XCODE_VERSION` in its mise `[env]`; every task that builds checks `xcodebuild -version` against it and fails fast with an actionable message — which also catches a Command-Line-Tools-only Mac                                                                                                 | `xcodes` via mise; no pin                                                                                          | U7, U8, U9, U5 |
| E11′ | Project creation     | No pack lands the `.xcodeproj`; doctrine says create it in Xcode, add a `SnapshotTests` unit-test target, and add swift-snapshot-testing through Xcode's package UI; `Package.resolved` is committed inside the project                                                                                        | a pack-shipped template; a project generator                                                                       | U7, U8, U9, U5 |
| E20  | Golden simulator     | The golden simulator is pinned in mise `[env]` — `SIMULATOR_DEVICE`, `SIMULATOR_OS`, `SIMULATOR_PLATFORM`; `test:golden` builds the `-destination` from them, `--device` / `--os` / `--platform` override one run; the result bundle goes to a fixed path under `.build/` so the diff attachments are findable | Tuist's `TUIST_TEST_*` variables; unpinned                                                                         | U7, U8, U5     |
| E21  | Multi-platform gate  | The ux-gate runs goldens once per changed platform and reports the rest `n/a`, never `ok`                                                                                                                                                                                                                      | one run on one destination                                                                                         | U7, U8         |
| E22  | Manifest fact        | The swiftui pack's `manifest:` is `n/a` — the dependency list lives in `<Name>.xcodeproj/project.pbxproj`, a name the fact's single path cannot fix; closes G2                                                                                                                                                 | a glob (needs a doctor change)                                                                                     | U7             |
| E23  | swiftpm component    | `package-manager/swiftpm` stays in the bundle; the bundle body says app dependencies live in the Xcode project, the swiftpm skill governs local packages                                                                                                                                                       | drop it from the bundle                                                                                            | U9             |
| E24  | Tuist traces         | `/vwf:init` maps a root `*.xcodeproj` directory to swift in place of the `Project.swift` / `Tuist.swift` row; repo-hygiene drops its Tuist `Derived/` clause (pack 1.2.1 → 1.2.2, bundle pin follows)                                                                                                          | park both                                                                                                          | U10, U11, U5   |
| E25  | `Derived` exclusions | The `Derived` exclusions in the five gate configs and the Swift task scripts stay — generic generated-tree names                                                                                                                                                                                               | strip them (reaches checker rule 15 and the byte-identical copies)                                                 | U11, U5        |
| E26  | Smoke project        | The smoke agent hand-writes a minimal `project.pbxproj` (an iOS app plus `SnapshotTests`) in its scratch repo                                                                                                                                                                                                  | a person creates it in Xcode; a throwaway XcodeGen                                                                 | —              |
| E27  | Wave-3 commit        | Wave 3 lands as **one** commit, the orchestrator running `mise run p:plugins:inventory` into it                                                                                                                                                                                                                | one commit per unit                                                                                                | —              |

## New dependencies

None in this repo. Named in the payload the pack lands:
**swift-snapshot-testing** (`pointfreeco/swift-snapshot-testing`, a SwiftPM test
dependency the app adds through Xcode) for goldens (E5). Named in the doctrine:
**swift-dependencies** (`pointfreeco/swift-dependencies`, a SwiftPM dependency
the app adds) for dependency injection (E19). Tuist is no longer named (E2′).

## Units

| Id  | Wave | Unit file                                                | Kind   | Owns                                                                                                                                                                                                                                                                                                                             | Depends on                | Status  | Commit   |
| --- | ---- | -------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------- | -------- |
| U1  | 1    | [01-swiftui-core.md](01-swiftui-core.md)                 | edit   | `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`, `plugins/stackgen/stacks/app-framework/swiftui/conventions.md`, `plugins/stackgen/stacks/app-framework/swiftui/config/**`, `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/SKILL.md`, `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/**` | —                         | skipped | e2aeb169 |
| U2  | 1    | [02-swiftui-topics.md](02-swiftui-topics.md)             | edit   | `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/*.md` (the eleven topic files, top level only)                                                                                                                                                                                                          | —                         | green   | e2aeb169 |
| U3  | 1    | [03-bundle.md](03-bundle.md)                             | edit   | `plugins/stackgen/stacks/bundles/swift-swiftui.md`                                                                                                                                                                                                                                                                               | —                         | green   | e2aeb169 |
| R4  | 2    | [04-review.md](04-review.md)                             | review | —                                                                                                                                                                                                                                                                                                                                | U1                        | green   |          |
| U7  | 3    | [07-swiftui-core-xcode.md](07-swiftui-core-xcode.md)     | edit   | `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`, `plugins/stackgen/stacks/app-framework/swiftui/conventions.md`, `plugins/stackgen/stacks/app-framework/swiftui/config/**`, `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/SKILL.md`, `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/**` | —                         | green   | 97474b13 |
| U8  | 3    | [08-swiftui-topics-xcode.md](08-swiftui-topics-xcode.md) | edit   | `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/*.md` (the eleven topic files, top level only)                                                                                                                                                                                                          | —                         | green   | 97474b13 |
| U9  | 3    | [09-bundle-xcode.md](09-bundle-xcode.md)                 | edit   | `plugins/stackgen/stacks/bundles/swift-swiftui.md`                                                                                                                                                                                                                                                                               | —                         | green   | 97474b13 |
| U10 | 3    | [10-init-stack-read.md](10-init-stack-read.md)           | edit   | `plugins/vwf/skills/init/SKILL.md`                                                                                                                                                                                                                                                                                               | —                         | green   | 97474b13 |
| U11 | 3    | [11-repo-hygiene.md](11-repo-hygiene.md)                 | edit   | `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`, `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`, `plugins/stackgen/stacks/bundles/repo-hygiene.md`                                                                                                                                             | —                         | green   | 97474b13 |
| R12 | 4    | [12-review.md](12-review.md)                             | review | —                                                                                                                                                                                                                                                                                                                                | U7                        | pending |          |
| U5  | 5    | [05-docs.md](05-docs.md)                                 | edit   | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`                                                                                                                                                | U7, U8, U9, U10, U11, R12 | pending |          |
| U6  | 6    | [06-gates-and-bump.md](06-gates-and-bump.md)             | edit   | `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                                                                                                                                          | U5                        | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                                         | Why it collides                                    | Owner                                                                             |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json` | several units bumping one version is a lost update | U6                                                                                |
| `plugins/stackgen/stacks/inventory.md`                                                                       | generated                                          | the orchestrator for the wave-1 commit (E14) and the wave-3 commit (E27), then U6 |
| U1's paths, U2's, U3's (amendment)                                                                           | superseded units, reworked                         | U7, U8, U9 — U1–U3 are never re-dispatched                                        |
| `.claude-plugin/marketplace.json`                                                                            | generated                                          | U6                                                                                |
| `swiftui/skills/swiftui/SKILL.md` vs its references                                                          | the router links files another unit writes         | U1 writes the router against the fixed names below; U2 writes only the files      |
| `app-framework/swiftui` at 0.1.0 vs the bundle pin                                                           | a pin names a version                              | fixed here; U1 writes it, U3 pins it                                              |
| docs — `site/**`, `.claude/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`                | n units editing one doc                            | U5                                                                                |

**Fixed filenames** under
`plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/`,
topics 1–11 in order: `pick-and-trade.md`, `project-layout.md`,
`standards-and-architecture.md`, `state-management.md`, `ui-composition.md`,
`navigation.md`, `data-and-networking.md`, `platform-interop.md`,
`build-and-signing.md`, `testing.md`, `performance.md`. Plan 2d adds
`platforms/` and `integrations/` beside them.

## Waves

- **Wave 1 — U1, U2, U3.** Disjoint files, the router written against the
  filenames fixed above, the bundle pinning versions fixed here; lands as **one
  commit** with the regenerated inventory (E14).
- **Wave 2 — R4.**
- **Wave 3 — U7, U8, U9, U10, U11** (amendment). Disjoint files: the pack, its
  references, the bundle, `/vwf:init`, repo-hygiene. Lands as **one commit**
  with the regenerated inventory (E27).
- **Wave 4 — R12**, over `ba994ef0..HEAD`. **Wave 5 — U5**, docs. **Wave 6 —
  U6**, versions and generators.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run p:plugins:shellcheck
    mise run p:plugins:npm-normalize-test
    pnpm vitest run
    pnpm tsc --noEmit -p installer
    pnpm tsc --noEmit -p scripts
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. The inventory
freshness line is red between wave 1's unit returns and the orchestrator's
regeneration (E14), likewise in wave 3 (E27), and inside wave 6 between U6's
edits and its regeneration — expected; each is green before its commit.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                   |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed stackgen and vwf into the dev marketplace under `X.Y.Z+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |

## Gates the orchestrator keeps

1. **Smoke test, in `/tmp`** (E16, amended by E26), after wave 3 and again after
   wave 6, outside the repo and any worktree: a scratch git repo; land the
   payload of every component `swift-swiftui.md` pins plus
   `toolchain-manager/mise`'s helper library; set `XCODE_VERSION` and the
   `SIMULATOR_*` variables in the scratch repo's mise `[env]`; `mise install`;
   hand-write a minimal `<App>.xcodeproj/project.pbxproj` — an iOS SwiftUI app
   target, a `SnapshotTests` unit-test target, and a package reference to
   swift-snapshot-testing — plus the app's sources and one snapshot test of its
   root view; `mise run setup:deps:install`;
   `xcodebuild build -scheme <App> -destination 'generic/platform=iOS Simulator'`;
   `mise run code:format`; `mise run code:lint`; `mise run test:golden`
   (recording first, then verifying). Pass: every command exits 0. Network
   allowed for mise and SwiftPM. A failure in a pack file blocks the landing and
   goes to the unit whose file failed; a fault in the hand-written project is
   the smoke agent's to fix.
2. **Shared tasks** (E9). For every task path present in both
   `language/swift/config/.config/mise/tasks/` and
   `app-framework/swiftui/config/.config/mise/tasks/`, `cmp` the pair; every
   differing pair is one U7's report names. `test -x` on every swiftui task.
   Pass: no unnamed difference, all executable.
3. **LSP declaration** (E10). The `sourcekit-lsp` entry in
   `app-framework/swiftui/pack.yaml` is byte-identical to
   `app-framework/flutter/pack.yaml:55-60`. Pass: no diff.
4. **Coverage, links and citations.** `swift-swiftui.md`'s `platforms:` is
   exactly `mobile, tablet, desktop, auto, watch, tv, spatial` with no
   `default: true`; every file the swiftui router links exists; a grep of the
   pack's `config/` and `skills/` for the plugin-root token, a bare `assets/`
   path or a path into a sibling pack is empty. Pass: exact list, no missing
   link, empty grep.
5. **No Tuist** (amendment). A case-insensitive recursive grep for "tuist" over
   `plugins`, `site/src/content/docs`, `.claude`, `readme.md` and `CLAUDE.md`
   finds nothing. Pass: no hit.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore`, `git stash` or a
formatter's `--fix` over any path outside its Owns, and never runs this repo's
dprint over a `config/` payload file.

A unit returns exactly this block and nothing else — no file contents, no diff —
kept under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **Per-platform references and integrations** — plan 2d.
- **Editing Flutter's packs**, including `flutter-ios`.
- **UIKit- or AppKit-first doctrine** — interop only, topic 8.
- **Editing 2b's packs** — the swiftui pack copies their tasks; a defect found
  in one is a `GAP:`, not an edit. **Except** repo-hygiene's Tuist clause (E24,
  amendment reversal), U11's three files only.
- **A public release** (E17).

## Parked

- **G5**: the dprint pack does not exclude `*.xcassets/**`. The fix is a later
  plan over the dprint, taplo, pre-commit and gitleaks exclusion lists (checker
  rule 15).
- **G3**, what remains: the swiftpm skill's wording when an app has no
  `Package.swift`. Mostly moot under E2′ and E23.
- The chain's other parked items live in plan 2d.

## Gaps surfaced during execution

- **G1 — generated Xcode project not ignored** (R4 round 1, non-blocking, out of
  scope). The swiftui pack says the generated `.xcodeproj` and `.xcworkspace`
  are never committed, but the repo-hygiene Swift row adds only `Derived/`, and
  upstream `Swift.gitignore` leaves `*.xcodeproj` commented out. The fix belongs
  in the repo-hygiene pack, which this plan may not edit; U1 softens the promise
  until then. Mempalace gap `R4/gap/1`.
- **G2 — `manifest: Project.swift` vs doctor's dependency match** (R4 round 1,
  non-blocking, `contested`). Doctor §4 substring-matches `stack.dependencies`
  in the manifest. A Tuist app declares packages in `Tuist/Package.swift`, while
  `Project.swift` names only products, so `swift-snapshot-testing` reads as
  declared but absent. U1 Edit 1 rules the value, so the fix is a user ruling,
  not a unit fix.
- **G3 — swiftpm skill auto-applies to `Tuist/Package.swift`** (R4 engine #4,
  dropped as uncovered, recorded so it is not lost). The bundle composes
  `package-manager/swiftpm`, whose skill matches `**/Package.swift` and says to
  run `swift package resolve` / `update`. In a Tuist app the right steps are
  `tuist install` and `tuist generate`. The fix belongs in the 2b swiftpm pack
  or the bundle body. Unverified.
- **G4 — R4 review loop stopped by the convergence guard** (oscillation, not a
  contract hole; non-blocking, `contested`). Round 2 raised 4 findings and round
  3 raised 5, all new, all U1's, none security. Rounds tried: 3 of 4. Look first
  at the loop: each round's fix exposed the next layer of Tuist and simulator
  behaviour, not a plan gap. The contested findings: (1) medium:
  `command -v xcodebuild` in install, upgrade and test:golden always passes,
  because `/usr/bin/xcodebuild` is a stub. Use `xcrun --find xcodebuild` or
  `xcodebuild -version`. (2) The ux-gate passes no device. The fix is to pin
  `TUIST_TEST_DEVICE` / `_OS` / `_PLATFORM` in the repo's mise `[env]`. (3)
  `SNAPSHOT_ARTIFACTS` receives only the new render, so the "reference, render,
  diff" wording in test:golden, ux-gate and conventions is wrong. (4) A
  multi-destination snapshot target runs one platform per invocation. (5)
  conventions should say Tuist also reads a root `Package.swift`.
- **G5 — dprint pack does not exclude Xcode asset catalogs** (smoke test,
  non-blocking, out of scope). In a fresh SwiftUI app the first `code:format`
  check fails on the `Contents.json` files Xcode writes under `*.xcassets/`. The
  fix belongs in `toolchain-gate/dprint` and its sibling exclusion lists
  (checker rule 15), which this plan may not edit.
- **G6 — repo-hygiene payload not dprint-clean** (smoke test after wave 3,
  non-blocking, out of scope). `repo-hygiene/repo-hygiene`'s
  `config/SECURITY.md` and `config/CONTRIBUTING.md` are hand-wrapped short of
  dprint's 80 columns, so a freshly landed repo's first `code:format` check
  fails on them. Seen with placeholders filled minimally by the smoke agent; the
  fix belongs in the repo-hygiene payload, which U11 may not touch (its Owns
  excludes `config/`).
- **G7 — swift-swiftui bundle vs doctor** (R12 round 1, engine #8 and #9,
  dropped as uncovered — U9's bundle — recorded so it is not lost; plausible,
  unverified). Doctor's `binaries` check is a PATH lookup, and every Mac carries
  `/usr/bin/xcodebuild` and `/usr/bin/swift` stubs, so a Mac with only the
  Command Line Tools passes it; and doctor's repo.stack lockfile check for
  `package_manager: swiftpm` expects a root `Package.resolved`, while a SwiftUI
  app keeps it inside
  `<Name>.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/` (touches E23).
  The fix belongs in doctor's stack checks, not the bundle text.
- **Amendment 2026-09-24 and these gaps.** G1 dissolves: a committed project
  generates nothing to ignore beyond what upstream `Swift.gitignore` covers. E22
  closes G2. G4 finding 1 is fixed by E6′; findings 2 and 4 by E20 and E21;
  finding 3 by U7 and U8; finding 5 is moot. G3 and G5 are parked.

## Run log

| Wave | Unit                    | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Commit   |
| ---- | ----------------------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 0    | preflight               | —     | 1     | pass        | doctor blocking predicates clear (mise, graphify CLI, graph in main checkout; no `.config/vwf.yaml` stack to check); all nine wave gate lines green; no `code` unit — LSP rule and conventions fetch skipped; no `covers:` — format check skipped; order: W1 U1+U2+U3 → W2 R4 → W3 U5 → W4 U6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 1    | U3 bundle               | opus  | 1     | pass        | edit — `swift-swiftui.md` pins swiftui, swiftpm, swift-format, swiftlint @0.1.0, seven platforms, no default; DECIDED no `language/swift` component (dart-flutter carries none); GAP swiftui pin checked against the plan's fixed version only, U1 mid-write                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 1    | U2 topics               | opus  | 1     | pass        | edit — eleven topic references written; DECIDED Tuist and Apple APIs in prose, no code (Context7 held only the old TuistConfig spelling; API listings are gaps); GAP `build-and-signing.md` and `testing.md` name `setup:deps:install` and `test:golden` without describing them, U1's tasks absent at write time                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 1    | U1 swiftui core         | opus  | 1     | pass        | edit — pack.yaml 0.1.0 native-ui, sourcekit-lsp byte-identical to flutter:55-60; tasks copied from language/swift, identical: code/format, code/lint, setup/deps/audit; differ (Tuist): setup/deps/install, cleanup, outdated, upgrade; new test/golden; conf.d pins aqua:tuist/tuist 4.209.0; router links the 11 files; ux-gate skill; DECIDED Tuist pinned (tuist@latest unresolvable), test:golden runs `tuist test` on SnapshotTests, `--record` then a compare pass; GAP smoke test must confirm the TEST_RUNNER_ prefix reaches tests via `tuist test`                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 1    | R1 wave review          | opus  | 1     | findings(5) | CONTRACT clean, RULINGS clean; (1) stray root file of ANSI residue — the orchestrator's own, from a botched gate-script write, removed; (2) `build-and-signing.md:24` says tasks check `swift`, U1's check `tuist` → U2; (3) `choosing-your-stack.md:46`, (4) `plugins/stackgen.md:1037` task-supplier list, (5) `stacks/readme.md:72` "the one bundle whose root is not a language" → DOCS FALSIFIED for U5, already in its Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 1    | U2 topics               | opus  | 2     | pass        | edit — `build-and-signing.md` code block to prose, tasks check `xcodebuild` and `tuist`; `testing.md` describes `test:golden` as U1 ships it (SnapshotTests target, `--record` then compare); `project-layout.md` points goldens at the snapshot target; round-1 GAP closed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 1    | R1 wave review          | opus  | 2     | pass        | CONTRACT clean, RULINGS clean; U2's fixes agree with U1's tasks; no new drift                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 1    | gate                    | —     | 1     | pass        | orchestrator ran `p:plugins:inventory` into the wave (E14); nine wave gate lines green; orchestrator gates 2–4 pass: identical task pairs are code/format, code/lint, setup/deps/audit, each differing pair is one U1 named; all tasks executable; LSP block `cmp`-identical; seven platforms, no default; 11/11 router links resolve; citation grep empty                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —        |
| 1    | U1+U2+U3 commit         | —     | 1     | pass        | the one wave-1 commit (E14), with the inventory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | e2aeb169 |
| 2    | R4                      | opus  | 1     | findings(2) | security; range ae17915e..517125d6; engine clean (its main-based diff narrowed to the range); MEDIUM (U1) ux-gate a11y `tuist test` lacks `--inspect-mode off`, so the xcresult may upload; LOW (U1) the test:golden comment claims more than `--inspect-mode off` delivers (analytics are separate)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —        |
| 2    | R4                      | opus  | 1     | findings(6) | review; range ae17915e..517125d6; engine 10 findings — confirmed #2 (=S1), #3 ux-gate viewport fallback circular, #6 cleanup leaves `Tuist/.build`, #8 upgrade lacks tool guards, #1 xcodeproj not ignored (fix out of scope → gap G1, U1 softens the promise); #5 `manifest: Project.swift` vs doctor substring match restated, ruled by U1 Edit 1 → gap G2, contested; refuted #7 (E9 requires the copy), #9 (`binaries` excludes mise-managed tools), #10 (U1 Edit 4 names the paths); 1 finding on uncovered units dropped (#4, U3's bundle: swiftpm skill auto-applies to `Tuist/Package.swift`); return lacked the literal `REVIEW:` header, content complete, accepted                                                                                                                                                                                                                                                              | —        |
| 2    | U1 swiftui core         | opus  | 2     | pass        | edit, R4 round-1 loop-back — S1 ux-gate a11y run passes `--inspect-mode off`; S2 test:golden comment narrowed to "the result bundle is not uploaded"; F2 viewport fallback is the platform default the vwf reviewer passes; F3 cleanup removes `Tuist/.build`; F4 upgrade gets install's tool guards; F5 conventions: the repo `.gitignore` must list `.xcodeproj`, `.xcworkspace`, `Derived/`; format/lint/audit still byte-identical                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 1955e286 |
| 2    | R4                      | opus  | 2     | pass        | security; range ae17915e..220621e9; engine clean; S1 and S2 verified fixed in 1955e286; cleanup/upgrade changes add nothing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 2    | R4                      | opus  | 2     | findings(4) | review; range ae17915e..220621e9; engine 10 — #4, #5 are G2/G3, #8 refuted in round 1 (E9), #10 is U5 docs: 4 already reported, dropped; S1 S2 F3 F4 F5 hold; F2 does not — #1 ux-gate names a viewport the vwf reviewer never passes (medium); #2 test:golden runs on whatever simulator Tuist picks, no --device (low; the testing.md "one simulator" claim is U2's, 1 finding on uncovered units dropped); #6 conventions says tasks win over language/swift, but the bundle composes none (low); #7 cleanup `tuist clean dependencies` redundant, a set -e failure point (low); #9 refuted (setup:deps:all runs every verb by design, flutter the same); #3 TEST_RUNNER_ env forwarding pending the smoke test; guard: 6→4, nothing resolved resurfaced (F2 failed its first verification) — converging                                                                                                                                | —        |
| 2    | U1 swiftui core         | opus  | 3     | pass        | edit, R4 round-2 loop-back — #1 ux-gate states the default viewports inline (copied from vwf canvas-claude.md, no plugin path); #2 test:golden takes optional `--device` / `--os`, checked against Tuist 4.209.0; #6 conventions: this pack ships the bundle's whole task set; #7 cleanup drops `tuist clean dependencies`; format/lint/audit still byte-identical                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | b9f3543e |
| 2    | R4                      | opus  | 3     | pass        | security; range ae17915e..ba994ef0; engine clean; b9f3543e adds nothing; S1/S2 still hold                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 2    | R4                      | opus  | 3     | findings(5) | review; range ae17915e..ba994ef0; engine 8 — #4 (U2 testing.md, uncovered), #7 #8 (E9 copies): 3 already reported, dropped; round-2 fixes hold; #1 `command -v xcodebuild` always passes (the /usr/bin stub), CLT-only Mac never sees the Xcode message (medium); #2 ux-gate passes no device, could pin via TUIST_TEST_DEVICE/OS/PLATFORM in mise [env] (low-medium); #3 SNAPSHOT_ARTIFACTS gets only the new render, reference and diff are elsewhere (low); #5 multi-destination target runs one platform per invocation (low); #6 conventions should say Tuist also reads a root Package.swift (low); guard: 4→5, count did not strictly decrease — loop ended, all five `contested` as G4 (oscillation); R4 green                                                                                                                                                                                                                     | —        |
| 2    | R2 wave review          | opus  | 1     | findings(3) | CONTRACT clean, RULINGS clean (format/lint/audit byte-identical; E11, rule 13 hold); `testing.md:78` [U2] "Xcode pin guarantees one simulator" false → U2; `ux-gate/SKILL.md:62` [U1] fold broken → U1; `ux-gate/SKILL.md:50` [U1] gate runs goldens with no device → U1, pin via TUIST_TEST_DEVICE/OS/PLATFORM in mise [env] (resolves part of G4 (2)); U2 also asked to fix the `testing.md:56` artifacts wording (G4 (3), U2 copy)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 2    | smoke (gate 1)          | opus  | 1     | fail(1)     | after wave 1, scratch /tmp/smoke-swiftui-1790180773; steps 1,2,4–9 exit 0; step 3 `tuist init` fails with the `aqua:tuist/tuist` 4.209.0 pin (templates missing), app built by hand → U1; test:golden hangs ~10 min per failing run (no `-collect-test-diagnostics never`) → U1; TEST_RUNNER_forwarding confirmed (closes U1 GAP, R4 round-2 #3); dprint pack lacks `*.xcassets/**` exclusion → G5, out of scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 2    | U2 topics               | opus  | 3     | pass        | edit, R2 loop-back — `testing.md` "one simulator, one OS" rewritten: device and OS pinned in mise `[env]` via TUIST_TEST_DEVICE/OS/PLATFORM or `test:golden --device/--os`; failed-comparison wording corrected (reference in `__Snapshots__`, render under `.build/snapshot-artifacts/`, diff in the result bundle); DOCS FALSIFIED in U1 files → U1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 2    | U1 swiftui core         | opus  | 4     | pass        | edit, R2 loop-back — ux-gate step 2 reads the simulator pin (TUIST_TEST_DEVICE/OS/PLATFORM, verified against `tuist help test run` 4.209.0) from mise `[env]`; an unpinned run is reported, golden verdicts untrusted; a11y step on the same simulator, re-folded; test:golden comment and conventions row describe the pin                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 2    | U2 topics               | —     | 3     | pass        | commit of the R2 loop-back                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 3ae5af85 |
| 2    | U1 swiftui core         | opus  | 5     | unresolved  | edit, smoke + artifact loop-back — test:golden passes `-- -collect-test-diagnostics never`; artifact wording fixed in test:golden, ux-gate, conventions; the R2 fold fixes applied; the Tuist pin unchanged: in /tmp, `tuist init` failed with aqua, asdf and github 4.209.0, aqua 4.208/4.200/4.190 and 4.211.0-canary.15 (it looks for `Tuist/` or `.git` above its bundled Templates, which a mise install lacks); GAP `tuist init` also writes `mise.toml` + `mise.lock`, clashing with `.config/mise/`; UNRESOLVED E11 "`tuist init` creates them" cannot hold with any mise-installed Tuist — needs a ruling                                                                                                                                                                                                                                                                                                                         | ddfebfce |
| 3    | U5 docs                 | —     | —     | skipped     | why: depends on all units; U1 unresolved (E11)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —        |
| 4    | U6 gates-and-bump       | —     | —     | skipped     | why: depends on U5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| —    | block                   | —     | —     | blocked     | why: U1 UNRESOLVED — E11 cannot hold with a mise-installed Tuist; user ruled "Stop and re-plan"; the R2 contract review round 2 and the R4 late re-run over 3ae5af85..ddfebfce were not run — a resume takes them first                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| —    | amendment               | —     | —     | pass        | 2026-09-24, /vwf:change-plan on the blocked folder: Tuist dropped for a committed `.xcodeproj` (E2′, E6′, E11′, E20–E27); U1 skipped (superseded by U7); new units U7–U11 (wave 3) and R12 (wave 4); U5 → wave 5, U6 → wave 6; vwf patch added to the consent; resume at wave 3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —        |
| 0    | preflight               | —     | 2     | pass        | resume: worktree present, amendment ruling in the plan; the amendment's "must not re-run R4" overrides blocking.md step 4's pending late re-run (ddfebfce is inside R12's range ba994ef0..HEAD) and step 5's reset of U1 (superseded by U7); doctor blocking predicates clear (mise, graphify CLI); all nine wave gate lines green; no `code` unit — LSP and conventions fetch skipped; no `covers:` — format check skipped; order: W3 U7+U8+U9+U10+U11 → W4 R12 → W5 U5 → W6 U6                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 3    | U10 init stack read     | opus  | 1     | pass        | edit — manifest table row `Project.swift`/`Tuist.swift` → swift replaced by a `*.xcodeproj` directory → swift, one clause admitting the directory; DECIDED "a `*.xcodeproj` directory" (table applies to root and sub-projects); DOCS FALSIFIED `site/.../plugins/vwf.md:1060`, `.claude/skills/vwf-plugin/references/skills-and-agents.md:27` → U5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 3    | U11 repo-hygiene        | opus  | 1     | pass        | edit — swift row `Swift.gitignore` alone, the Tuist `Derived/` clause and `Project.swift`/`Tuist.swift` detection dropped; pack 1.2.1 → 1.2.2, bundle pin follows; DECIDED detection reads "a `Package.swift` or a root `*.xcodeproj` directory" to agree with E24; payload `config/` carries no Tuist logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 3    | U9 bundle               | opus  | 1     | pass        | edit — body only: Tuist removed; committed Xcode project created in Xcode, `XCODE_VERSION` pin, packages through Xcode locked in `Package.resolved`, swiftpm governs local packages only (E23); DECIDED goldens bullet names the `SnapshotTests` target (E11′)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —        |
| 3    | U8 topics               | opus  | 1     | pass        | edit — project-layout, build-and-signing, testing, pick-and-trade rewritten for a committed `.xcodeproj` (E2′/E6′/E11′/E20/E21); performance and standards-and-architecture drop `Tuist/Package.swift`; DECIDED goldens compared on the simulator they were recorded on, one-run overrides for a second platform; GAP result-bundle path left as "a fixed path under `.build/`" (U7 names it)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 3    | U7 swiftui core         | opus  | 1     | pass        | edit — pack.yaml `manifest: n/a` with reason; `conf.d/swiftui.toml` and empty `conf.d/` removed; new sourced `tasks/_scripts/xcode` (require_xcode: `xcodebuild -version` + `XCODE_VERSION` match; find_xcodeproj: exactly one at root); install/upgrade/outdated on `xcodebuild -resolvePackageDependencies`, checkouts in `.build/SourcePackages`, `--frozen` = `-onlyUsePackageVersionsFromResolvedFile`; cleanup now byte-identical to language/swift; test:golden `xcodebuild test -only-testing`, destination from `SIMULATOR_*`, `.build/golden.xcresult`, unpinned refused; conventions, router paths, ux-gate rewritten; DECIDED one shared `_scripts/xcode` (mise pack `_scripts/checks` precedent), flags checked against `xcodebuild -help` (Xcode 27.0), macOS needs no device/OS; GAP E20 pins one simulator — ux-gate reports a changed non-pinned simulator platform `n/a` with a finding, per-platform pins need a ruling | —        |
| 3    | R3 wave review          | opus  | 1     | findings(5) | CONTRACT clean, RULINGS clean; 4 cmp-identical tasks, all executable, no ANSI, frontmatter valid, every edit landed; (1) `site/.../stackgen.md:688` Tuist `Derived/` clause, (2) `:670` "SwiftPM's and Tuist's output trees" → DOCS FALSIFIED for U5 (both already in its survey list); (3) `testing.md:97`,`:91` [U8] ux-gate runs "each changed platform on its simulator" vs U7's pinned simulator + macOS, others `n/a` → U8; (4) `testing.md:63` [U8] name `.build/golden.xcresult` (closes U8 GAP) → U8; (5) `init/SKILL.md:341` [U10] "a `*.xcodeproj` directory" vs E24/U11 "a root `*.xcodeproj`" → U10                                                                                                                                                                                                                                                                                                                           | —        |
| 3    | U10 init stack read     | opus  | 2     | pass        | edit, R3 loop-back — row reads "a root `*.xcodeproj` directory" (E24, U11 wording); prose: at the top of the directory being read (repo root or a sub-project directory), never deeper                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| 3    | U8 topics               | opus  | 2     | pass        | edit, R3 loop-back — `testing.md` names `.build/golden.xcresult` (round-1 GAP closed); per-platform rules match ux-gate step 3: pinned simulator plus macOS when changed, other changed simulator platforms `n/a` with an "unpinned" finding, a second platform via `--platform/--device/--os`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —        |
| 3    | R3 wave review          | opus  | 2     | pass        | CONTRACT clean, RULINGS clean; findings 3–5 verified fixed; 1–2 carried to U5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 3    | smoke (gate 1)          | opus  | 2     | pass        | after wave 3, scratch /tmp/smoke-swiftui-xcode-1790190684: every step exits 0 — payloads landed, `XCODE_VERSION` 27.0 + iPhone 17 / iOS 27.0 pin, `mise install`, hand-written SmokeApp.xcodeproj (E26), `setup:deps:install` (swift-snapshot-testing 1.19.6), `xcodebuild build`, `code:format`, `code:lint`, `test:golden --record` then compare; `code:format` passed on its 2nd run — the 1st failed on repo-hygiene payload `SECURITY.md` and `CONTRIBUTING.md` (not dprint-clean) → gap G6, out of scope                                                                                                                                                                                                                                                                                                                                                                                                                             | —        |
| 3    | gate                    | —     | 1     | pass        | orchestrator ran `p:plugins:inventory` into the wave (E27); nine wave gate lines green; gate 2: format, lint, audit, cleanup identical, install/outdated/upgrade differ as U7 named, all tasks executable; gate 3 LSP block `cmp`-identical; gate 4 seven platforms, no default, 11/11 links, citation grep empty; gate 5 remaining Tuist hits are U5's three docs files (wave 5)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —        |
| 3    | U7 swiftui core         | opus  | 2     | pass        | edit, mechanical re-dispatch — commit-time `code:lint` SC1091 on the `# shellcheck source=.config/.../_scripts/xcode` directives; now `source=/dev/null` in install, upgrade, outdated, test/golden, the mise pack's `_scripts/merge` precedent; `code:lint` over the files and `p:plugins:shellcheck` green, four copies still `cmp`-identical                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —        |
| 3    | U7+U8+U9+U10+U11 commit | —     | 1     | pass        | the one wave-3 commit (E27), with the inventory; the first attempt's lint hook refusal went to U7 round 2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 97474b13 |
| 4    | R12                     | opus  | 1     | pass        | security; range ba994ef0..97474b13; engine clean; deletions quoted fixed paths, no eval, mktemp + restoring trap in outdated, no macro/plugin validation skips, Tuist upload path gone, result bundles stay under `.build/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 4    | R12                     | opus  | 1     | findings(6) | review; range ba994ef0..97474b13; engine 10 — #1 G5 parked and #10 E9 byte copies dropped as already known; CONTRACT clean; E6′, E21 partial; all U7: (1) medium ux-gate:64-65 macOS run reuses the iOS SnapshotTests target and goldens → treat macOS as unpinned `n/a`; (2) `_scripts/xcode:26` unset `XCODE_VERSION` checks nothing → refuse or warn, naming the `[env]` line; (3) upgrade:26 deletes `Package.resolved` with no restore; (4) test/golden:88-96 no `-onlyUsePackageVersionsFromResolvedFile`; (5) ux-gate:85 a11y run lacks `-derivedDataPath`/`-clonedSourcePackagesDirPath` under `.build/`; (6) test/golden:62-78 `--platform` alone keeps the iOS device and OS; 2 findings on uncovered units dropped (U9 #7 doctor PATH stubs, #8 swiftpm root lockfile vs in-project `Package.resolved`) → recorded as G7                                                                                                        | —        |
| 4    | U7 swiftui core         | opus  | 3     | pass        | edit, R12 round-1 loop-back — (1) ux-gate runs the pinned platform only, every other changed platform incl. macOS `n/a` "unpinned"; (2) `require_xcode` refuses unset `XCODE_VERSION`, naming the `[env]` line; (3) upgrade copies `Package.resolved` aside and restores it on failure (trap function, SC2154); (4) test:golden `-onlyUsePackageVersionsFromResolvedFile`; (5) a11y run on `.build/DerivedData` + `.build/SourcePackages`, frozen; (6) `--platform` (not macOS) refused without `--device` and `--os`; DECIDED a macOS pin stays legal for a Mac-only app; DOCS FALSIFIED U8 `testing.md:92`,`:97` → U8 consistency loop-back; verified in /tmp: no pin exits 1, failed resolve restores the lockfile, lone `--platform` refused                                                                                                                                                                                           | b15843fa |
| 4    | U8 topics               | opus  | 3     | pass        | edit, consistency loop-back after U7 R12 round-1 fix — `testing.md` golden rules match (no-pin refusal, Mac-only app pins macOS, goldens belong to the pinned platform, lone `--platform` refused, other platforms `n/a` "unpinned", `test:golden` never moves `Package.resolved`); `build-and-signing.md` unset `XCODE_VERSION` refused                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-23-swiftui-app-stack

or let the queue pick it, by priority:

/vwf:execute next
