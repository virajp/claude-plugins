---
type: vwf-change-plan
title: SwiftUI app stack — the swiftui pack, Tuist, goldens, topics 1–11,
  the swift-swiftui bundle
requires: [ docs/plans/2026-09-23-swift-package-stack ]
backlog: []
---

# Plan — SwiftUI app stack — the swiftui pack, Tuist, goldens, topics 1–11, the swift-swiftui bundle (2026-09-23)

## Status

**APPROVED**

APPROVED 2026-09-23 by the user

## Consent

| Action                                            | Granted                                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                       |
| After landing: `mise run p:plugins:local`         | run                                                                                       |
| Release stackgen publicly                         | minor — 1.30.0 → 1.31.0, by hand in `plugins/stackgen/.claude-plugin/plugin.json`         |
| Release site publicly                             | patch — 1.1.43 → 1.1.44, `mise run p:site:version` (bare, no positional, on a clean tree) |
| Release vwf publicly                              | none                                                                                      |
| Release installer publicly                        | none                                                                                      |

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
stackgen materializes a working SwiftUI app repo: a Tuist-defined project, Xcode
pinned through Tuist, the swiftpm and gate packs 2b landed, golden tests through
swift-snapshot-testing, a `ux-gate` skill, and SwiftUI doctrine across topics
1–11 of the app-framework bar.

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

| #   | Decision           | Ruling                                                                                                                                                                                          | Rejected                                           | Unit   |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| E1  | Bundle shape       | `swift-swiftui` is an app-framework bundle with `platforms: [mobile, tablet, desktop, auto, watch, tv, spatial]`                                                                                | one bundle per Apple OS; one bundle for everything | U3     |
| E2  | Project definition | Tuist: the app's project is declared in `Project.swift` / `Tuist.swift` and generated; tasks run `tuist install` / `tuist generate`                                                             | XcodeGen; plain committed `.xcodeproj`             | U1, U2 |
| E4  | Doctrine depth     | Topics 1–11 here; one reference per platform and the Apple core integrations in plan 2d; third-party integrations parked                                                                        | full Flutter parity; the bar only                  | U2     |
| E5  | Goldens            | swift-snapshot-testing (Point-Free), through SwiftPM, under a `test:golden` task and the `goldens` harness                                                                                      | XCUITest screenshots; defer goldens                | U1     |
| E6  | Xcode              | Tuist's `compatibleXcodeVersions` pins the version; the pack declares `binaries: [xcodebuild, swift]`; the tasks fail fast                                                                      | xcodes + `.xcode-version`; no pin                  | U1     |
| E7  | Names              | `app-framework/swiftui` in bundle `swift-swiftui`                                                                                                                                               | `apple`; `xcode`                                   | U1, U3 |
| E9  | Shared tasks       | The swiftui pack's tasks are **copied** from the landed `language/swift` tasks, byte-identical wherever no Tuist step is needed; each file that differs is named in U1's report with the reason | writing them afresh                                | U1     |
| E10 | LSP                | `sourcekit-lsp` declared byte-identical to `app-framework/flutter/pack.yaml:55-60`                                                                                                              | —                                                  | U1     |
| E11 | Config placement   | No pack lands `Project.swift`, `Tuist.swift` or `Package.swift`; `tuist init` creates them                                                                                                      | —                                                  | U1     |
| S4  | Router rows        | U1's router links topics 1–11 only; plan 2d adds the platform and integration rows with their files, so no row ever links a missing file                                                        | link 2d's files now (broken links between plans)   | U1     |
| E14 | Wave-1 commit      | Wave 1 lands as **one** commit, the orchestrator running `mise run p:plugins:inventory` into it                                                                                                 | one commit per unit                                | —      |
| E15 | Review row         | R4 covers U1 — it ships shell task scripts                                                                                                                                                      | no review row                                      | R4     |
| E16 | Smoke test         | The orchestrator smoke-tests the app bundle in `/tmp` before landing                                                                                                                            | none                                               | —      |
| E17 | Release            | No release step                                                                                                                                                                                 | `/release` as `ask`; as `run`                      | U6     |
| E18 | Library docs       | Units resolve Tuist, swift-snapshot-testing and Apple framework APIs through Context7 (`resolve-library-id` → `query-docs`) before writing about them — never from training knowledge           | —                                                  | U1, U2 |

## New dependencies

None in this repo. Named in the payload the pack lands, by U1: **Tuist**
(through mise) for project generation (E2), and **swift-snapshot-testing**
(`pointfreeco/swift-snapshot-testing`, a SwiftPM test dependency) for goldens
(E5).

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                                             | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-swiftui-core.md](01-swiftui-core.md)     | edit   | `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`, `plugins/stackgen/stacks/app-framework/swiftui/conventions.md`, `plugins/stackgen/stacks/app-framework/swiftui/config/**`, `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/SKILL.md`, `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/**` | —          | pending |        |
| U2 | 1    | [02-swiftui-topics.md](02-swiftui-topics.md) | edit   | `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/*.md` (the eleven topic files, top level only)                                                                                                                                                                                                          | —          | pending |        |
| U3 | 1    | [03-bundle.md](03-bundle.md)                 | edit   | `plugins/stackgen/stacks/bundles/swift-swiftui.md`                                                                                                                                                                                                                                                                               | —          | pending |        |
| R4 | 2    | [04-review.md](04-review.md)                 | review | —                                                                                                                                                                                                                                                                                                                                | U1         | pending |        |
| U5 | 3    | [05-docs.md](05-docs.md)                     | edit   | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`                                                                                                                                                                                | all        | pending |        |
| U6 | 4    | [06-gates-and-bump.md](06-gates-and-bump.md) | edit   | `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                                                                                                                                                                                    | U5         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                          | Why it collides                                    | Owner                                                                        |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`                            | several units bumping one version is a lost update | U6                                                                           |
| `plugins/stackgen/stacks/inventory.md`                                                        | generated                                          | the orchestrator for the wave-1 commit (E14), then U6                        |
| `.claude-plugin/marketplace.json`                                                             | generated                                          | U6                                                                           |
| `swiftui/skills/swiftui/SKILL.md` vs its references                                           | the router links files another unit writes         | U1 writes the router against the fixed names below; U2 writes only the files |
| `app-framework/swiftui` at 0.1.0 vs the bundle pin                                            | a pin names a version                              | fixed here; U1 writes it, U3 pins it                                         |
| docs — `site/**`, `.claude/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md` | n units editing one doc                            | U5                                                                           |

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
- **Wave 2 — R4.** **Wave 3 — U5**, docs. **Wave 4 — U6**, versions and
  generators.

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
regeneration (E14), and inside wave 4 between U6's edits and its regeneration —
expected; each is green before its commit.

## After landing

| Step                       | Mode | Notes                                                                                                                                                           |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed stackgen into the dev marketplace under `X.Y.Z+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |

## Gates the orchestrator keeps

1. **Smoke test, in `/tmp`** (E16), after wave 1 and again after wave 4, outside
   the repo and any worktree: a scratch git repo; land the payload of every
   component `swift-swiftui.md` pins plus `toolchain-manager/mise`'s helper
   library; `mise install`; `tuist init` for an iOS app;
   `mise run setup:deps:install`; `tuist generate --no-open`;
   `xcodebuild build -scheme <app> -destination 'generic/platform=iOS Simulator'`;
   `mise run code:format`; `mise run code:lint`; `mise run test:golden`
   (recording first, then verifying). Pass: every command exits 0. Network
   allowed for mise, Tuist and SwiftPM. A failure blocks the landing and goes to
   the unit whose file failed.
2. **Shared tasks** (E9). For every task path present in both
   `language/swift/config/.config/mise/tasks/` and
   `app-framework/swiftui/config/.config/mise/tasks/`, `cmp` the pair; every
   differing pair is one U1's report names. `test -x` on every swiftui task.
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
  in one is a `GAP:`, not an edit.
- **A public release** (E17).

## Parked

None new; the chain's parked items live in plan 2d.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-23-swiftui-app-stack

or let the queue pick it, by priority:

/vwf:execute next
