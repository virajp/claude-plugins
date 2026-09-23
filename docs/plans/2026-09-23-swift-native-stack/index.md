---
type: vwf-change-plan
title: Native Swift stack — SwiftUI apps for every Apple platform, and Swift
  packages
requires: [ docs/plans/2026-09-23-watch-tv-spatial-platforms ]
backlog: [ B56 ]
---

# Plan — Native Swift stack — SwiftUI apps for every Apple platform, and Swift packages (2026-09-23)

## Status

**APPROVED**

APPROVED 2026-09-23 by the user

## Consent

| Action                                            | Granted                                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                       |
| After landing: `mise run p:plugins:local`         | run                                                                                       |
| Release vwf publicly                              | minor — 19.44.0 → 19.45.0, by hand in `plugins/vwf/.claude-plugin/plugin.json`            |
| Release stackgen publicly                         | minor — 1.28.0 → 1.29.0, by hand in `plugins/stackgen/.claude-plugin/plugin.json`         |
| Release site publicly                             | patch — 1.1.41 → 1.1.42, `mise run p:site:version` (bare, no positional, on a clean tree) |
| Release installer publicly                        | none                                                                                      |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

The `Release` rows are **intent, not authorisation**: the user ruled at the
interview for **no release step** in either plan. Both plans land merged and
unreleased; the user runs `/release` when ready. The three touched existing
packs move a patch each (`toolchain-gate/dprint` 1.1.0 → 1.1.1,
`toolchain-gate/pre-commit` 1.1.4 → 1.1.5, `repo-hygiene/repo-hygiene` 1.2.0 →
1.2.1) with their bundle pins; the six new packs start at 0.1.0.

## Goal

After this lands, a project can pin a **native Swift stack** instead of Flutter:
`swift-swiftui`, an `app-framework` bundle rooted at a new
`app-framework/swiftui` pack, covers `mobile`, `tablet`, `desktop`, `auto`,
`watch`, `tv` and `spatial` — every app type Xcode builds — and `swift-package`,
a `language-bundle` rooted at a new `language/swift` pack, covers a Swift
package on `packages`. stackgen materializes either, with SwiftPM, swift-format
and SwiftLint gates, Tuist-defined app projects, golden tests and doctrine deep
enough to get the best of each platform.

This is plan 2 of 2 for backlog item **B56**, and the plan that finishes it. It
requires plan 1 (`2026-09-23-watch-tv-spatial-platforms`), which added the
`watch`, `tv` and `spatial` tokens and the per-product viewport override. No
reversal.

## Facts the survey established

- **The Flutter model to mirror.** `app-framework/flutter` (0.4.0,
  `category: cross-platform-ui`), `package-manager/pub` (0.1.0,
  `kind: app-framework`, `axis: repo`, no `config/`),
  `toolchain-gate/analysis-options` (0.2.0, `kind: app-framework`,
  `axis: project`, one `conditional:` vscode.d fragment on `editor: vscode`),
  composed by `bundles/dart-flutter.md:1-14`. Flutter's tasks:
  `config/.config/mise/tasks/code/{format,lint}` and
  `setup/deps/{install,audit,cleanup,outdated,upgrade}`, each sourcing
  `${MISE_PROJECT_ROOT}/.config/mise/tasks/_scripts/helpers` (shipped by
  `toolchain-manager/mise`, hence `# shellcheck source=/dev/null`), using
  `print_header`/`print_subheader`/`print_warn` and `#MISE`/`#USAGE` headers,
  executable 755 with a shebang. `code/format` takes `--fix` and an optional
  file list; its header comment explains it overlays because app-framework
  composes last (`assets/output-tree.md:244-250`).
- **Kinds.** `app-framework` — `plugins/stackgen/assets/kinds.md:754-796`: the
  four-part SDK-is-root test (`:764-780`), axis `project`, one router skill per
  language member paths-scoped to its extensions, `role` on every member. The
  12-topic bar (`:798-835`): 1 Pick & trade · 2 Project layout & the generated
  boundary · 3 Standards & app architecture · 4 State management · 5 UI
  composition & theming · 6 Navigation & routing · 7 Data & networking · 8
  Platform interop · 9 Build, flavors & signing · 10 Testing & coverage · 11
  Performance & artifact size · 12 Integration wiring (one artifact per
  integration, **no API surface** — an API listing is a reviewer gap,
  `:1137-1140`). `language-bundle` — `kinds.md:50-134`, its own 12-topic bar
  `:77-114` and topic-to-component map `:110-114`; the TypeScript library
  precedent is `bundles/typescript-effect.md:1-13` (`platforms: [packages]`).
  `package-manager` and `toolchain-gate` are component **types**, not kinds
  (`taxonomy.md:24,38`) and have **no categories** (`taxonomy.md:96-99`);
  `app-framework`'s categories are `cross-platform-ui` / `native-ui`
  (`taxonomy.md:117`) — `native-ui` is unused until now. A language-specific
  linter is never a `repo-gate` (`kinds.md:279-280,1112-1115`).
- **pack.yaml.** Schema `plugins/stackgen/assets/pack-format.md:151-258`:
  `languages[{token, role, facts{lsp, mise_tool, manifest}}]`, `lsp_servers`
  (`extensionToLanguage` mandatory), `harness`, `conditional` (one axis of
  `forge`/`editor`/`secrets`/`update_bot`). Facts must be honest — `n/a` for an
  Xcode-provided tool (`pack-format.md:389-391`). Flutter already declares
  **sourcekit-lsp** at `app-framework/flutter/pack.yaml:55-60`; the local plugin
  is a union across repos, so the same key declared differently is a conflict
  and skipped
  (`skills/stackgen-stack-template/references/local-plugin.md:121-132`). The
  facts flow: `pack.yaml` → the template payload's `language_facts`
  (`skills/stackgen-stack-template/SKILL.md:87`) → vwf's contract
  (`plugins/vwf/assets/stack-adapter.md:355`,
  `plugins/vwf/assets/stack-vocabulary.md:48`) → doctor's toolchain check
  (`plugins/vwf/skills/doctor/references/stack-checks.md:65-103`), which today
  skips a `n/a` tool **silently** — hence E6.
- **Landing.** A pack's `config/` root holds `.config/`, `.github/` (no
  workflows) or `_*` only (`scripts/src/check.ts:335-382`,
  `output-tree.md:158-185`); manifests are fenced out — no pack lands
  `Package.swift`, `Project.swift` or `Tuist.swift` (`output-tree.md:289-294`).
- **Exclusion lists (rule 15).** Today: `.claude`, `.git`, `.turbo`, `.venv`,
  `build`, `dist`, `graphify-out`, `node_modules`, `target` plus lockfiles, in
  `stacks/toolchain-gate/dprint/config/.config/dprint.json:5-18`,
  `stacks/toolchain-gate/dprint/config/.config/taplo.toml:14-27` and
  `stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml:48-61`;
  `gitleaks.toml:46-54` is a subset and stays untouched.
- **Gitignore.** The hygiene `.gitignore` carries no stack section by design;
  sections are appended per repo from upstream templates. The
  `swift → Swift.gitignore` row exists at
  `stacks/repo-hygiene/repo-hygiene/conventions.md:111`; the slug-to-key prose
  (`:124-131`) names only the node and dart cases, so the new slugs need mapping
  or init proposes instead of appending (`:140-143`).
- **init detection.** `plugins/vwf/skills/init/SKILL.md:340` maps
  `Package.swift` → swift; a Tuist app (only `Project.swift` / `Tuist.swift`) is
  not detected.
- **Reputation.** The stackgen-reputation skill runs only on `@generated`
  components; curated packs are copied verbatim, unvetted
  (`skills/stackgen-stack-template/SKILL.md:108-113`). It supports only
  `npm`/`pypi`/`pub`/`action`/`image` — parked.
- **Skills.** Strict-YAML frontmatter (rule 4, `check.ts:818-855`); doctrine is
  `user-invocable: false` plus `paths:` (`assets/artifact-doctrine.md:48-60`),
  as `flutter-ios/SKILL.md:1-16`; `ux-gate` is a fixed skill name every pack
  with a `goldens` harness ships (`artifact-doctrine.md:82-86`). flutter-ios
  scopes `**/*.swift` too; no rule forbids overlapping globs, and a repo pins
  one of the two stacks, so no clash. Rule 13: a landed file cites no plugin
  path; a skill may climb `../` only into a sibling skill of its own pack.
- **Toolchain on this machine.** Xcode 27.0, Swift 6.4, `xcodebuild` present.
  mise's registry has `swift` (core), `swiftlint` (`aqua:realm/SwiftLint`) and
  `tuist`; Apple's swift-format is not in mise — it ships in the Swift 6
  toolchain as `swift format`.
- **Docs.** `readme.md:449-450` already claims SourceKit-LSP is behind the
  language servers stackgen's packs declare — true after this plan.
  `site/src/content/docs/plugins/stackgen.md` uses Flutter as the sole
  `app-framework` archetype and counts the framework packs;
  `plugins/stackgen/stacks/inventory.md` is generated (70 packs, 66 bundles, 13
  kinds today).
- **Versions** (after plan 1): vwf 19.44.0, stackgen 1.28.0, site 1.1.41.
- **Commit convention.** Types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; no scopes.
- **Formatting.** `plugins/**/*.md` is not dprint-formatted;
  `plugins/*/stacks/*/*/config/` is **payload** and must never be formatted with
  this repo's dprint.

## Assumed decisions — confirm or override at review

| #   | Decision           | Ruling                                                                                                                                                                                                                                                                              | Rejected                                                | Unit       |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------- |
| E1  | Bundle shape       | Two bundles: `swift-swiftui` (app-framework, `platforms: [mobile, tablet, desktop, auto, watch, tv, spatial]`) and `swift-package` (language-bundle, `platforms: [packages]`)                                                                                                       | one bundle per Apple OS; one bundle for everything      | U6         |
| E2  | Project definition | Tuist: the app's project is declared in `Project.swift` / `Tuist.swift` and generated; tasks run `tuist install` / `tuist generate`                                                                                                                                                 | XcodeGen; plain committed `.xcodeproj`                  | U2         |
| E3  | Format and lint    | swift-format (`swift format`, from the toolchain) formats; SwiftLint (through mise) lints                                                                                                                                                                                           | SwiftFormat + SwiftLint; swift-format only              | U1, U2, U5 |
| E4  | Doctrine depth     | The 12-topic bar, one reference per platform (iOS/iPadOS, macOS, CarPlay, watchOS, tvOS, visionOS), and Apple's core integrations — widgets and complications, App Intents, push notifications, StoreKit, Sign in with Apple. Third-party integrations parked                       | full Flutter parity incl. third-party; the bar only     | U2, U3, U4 |
| E5  | Goldens            | swift-snapshot-testing (Point-Free), through SwiftPM, under a `test:golden` task and the `goldens` harness                                                                                                                                                                          | XCUITest screenshots; defer goldens                     | U2         |
| E6  | Xcode              | Tuist's `compatibleXcodeVersions` pins the version. A new optional language fact `binaries: [<name>…]` in `pack.yaml`, carried through `language_facts`, lets doctor report a missing binary on `PATH` as **blocking** once the project is pinned; the swiftui tasks also fail fast | xcodes + `.xcode-version`; no pin; tasks-only fail-fast | U1, U2, U7 |
| E7  | Names              | `app-framework/swiftui` in bundle `swift-swiftui`; `language/swift` in bundle `swift-package`                                                                                                                                                                                       | `apple` / `swift-apple`; `xcode` / `swift-xcode`        | U1, U2, U6 |
| E8  | Gate packs         | One per tool: `toolchain-gate/swift-format` and `toolchain-gate/swiftlint`, each landing its config under `.config/` and a vscode.d fragment on `editor: vscode`                                                                                                                    | one combined gate pack                                  | U5         |
| E9  | Shared tasks       | Where `language/swift` and `app-framework/swiftui` ship the same task path, the two files are byte-identical unless the swiftui one must differ for Tuist; each differing pair is named in the unit's report                                                                        | —                                                       | U1, U2     |
| E10 | LSP                | `sourcekit-lsp` declared in both new packs byte-identical to `app-framework/flutter/pack.yaml:55-60`; `mise_tool: n/a` for Xcode-provided tools                                                                                                                                     | —                                                       | U1, U2     |
| E11 | Config placement   | Tool configs land under `.config/` (`.config/swift-format.json`, `.config/swiftlint.yml`), and the tasks pass `--configuration` / `--config`. No pack lands `Package.swift`, `Project.swift` or `Tuist.swift`; `tuist init` / `swift package init` create them                      | root config files, widening the hygiene allowlist       | U1, U2, U5 |
| E12 | Exclusion lists    | `.build` and `Derived` join all three formatter lists; `.swiftpm` does not (it holds user config); gitleaks untouched                                                                                                                                                               | leave the lists alone                                   | U7         |
| E13 | init detection     | init's manifest table maps `Project.swift` and `Tuist.swift` → swift, beside `Package.swift`                                                                                                                                                                                        | —                                                       | U7         |
| E14 | Wave-1 commit      | Wave 1 lands as **one** commit, the orchestrator running `mise run p:plugins:inventory` into it — the pre-commit inventory check refuses any commit adding a pack without the regenerated inventory (Astro-static precedent)                                                        | one commit per unit                                     | —          |
| E15 | Review row         | R8 covers U1 and U2 — they ship shell task scripts, runnable code                                                                                                                                                                                                                   | no review row                                           | R8         |
| E16 | Smoke test         | The orchestrator smoke-tests both bundles in `/tmp` before landing (Gates the orchestrator keeps, 1)                                                                                                                                                                                | package only; none                                      | —          |
| E17 | Release            | No release step; both plans land unreleased                                                                                                                                                                                                                                         | `/release` as `ask`; as `run`                           | U10        |
| E18 | Library docs       | Every unit resolves Tuist, SwiftLint, swift-format, swift-snapshot-testing and Apple framework APIs through Context7 (`resolve-library-id` → `query-docs`) before writing about them — never from training knowledge                                                                | —                                                       | U1–U5      |

## New dependencies

None in this repo. Named in the payload the packs land into a target repo, each
by the unit that names it:

- **Tuist** — project generation (E2); installed through mise (`tuist`); U2.
- **SwiftLint** — linting (E3); through mise (`aqua:realm/SwiftLint`); U1, U2,
  U5.
- **swift-snapshot-testing** (`pointfreeco/swift-snapshot-testing`) — goldens
  (E5); a SwiftPM test dependency; U2.
- swift-format and sourcekit-lsp ship with the Swift toolchain / Xcode — not new
  dependencies.

## Units

| Id  | Wave | Unit file                                          | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Depends on | Status  | Commit |
| --- | ---- | -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1  | 1    | [01-language-swift.md](01-language-swift.md)       | edit   | `plugins/stackgen/stacks/language/swift/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —          | pending |        |
| U2  | 1    | [02-swiftui-core.md](02-swiftui-core.md)           | edit   | `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`, `plugins/stackgen/stacks/app-framework/swiftui/conventions.md`, `plugins/stackgen/stacks/app-framework/swiftui/config/**`, `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/SKILL.md`, `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/**`                                                                                                                                                                                                                                                                        | —          | pending |        |
| U3  | 1    | [03-swiftui-topics.md](03-swiftui-topics.md)       | edit   | `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/*.md` (the eleven topic files, top level only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —          | pending |        |
| U4  | 1    | [04-swiftui-platforms.md](04-swiftui-platforms.md) | edit   | `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/**`, `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/integrations/**`                                                                                                                                                                                                                                                                                                                                                                                                                       | —          | pending |        |
| U5  | 1    | [05-swiftpm-and-gates.md](05-swiftpm-and-gates.md) | edit   | `plugins/stackgen/stacks/package-manager/swiftpm/**`, `plugins/stackgen/stacks/toolchain-gate/swift-format/**`, `plugins/stackgen/stacks/toolchain-gate/swiftlint/**`                                                                                                                                                                                                                                                                                                                                                                                                                                   | —          | pending |        |
| U6  | 1    | [06-bundles.md](06-bundles.md)                     | edit   | `plugins/stackgen/stacks/bundles/swift-swiftui.md`, `plugins/stackgen/stacks/bundles/swift-package.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —          | pending |        |
| U7  | 1    | [07-cross-tree.md](07-cross-tree.md)               | edit   | `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`, `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/assets/stack-vocabulary.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`, `plugins/vwf/skills/init/SKILL.md`, `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`, `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json`, `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/taplo.toml`, `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml` | —          | pending |        |
| R8  | 2    | [08-review.md](08-review.md)                       | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | U1, U2     | pending |        |
| U9  | 3    | [09-docs.md](09-docs.md)                           | edit   | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`, `docs/memory/decisions/2026-09-23-swift-native-stack.md`                                                                                                                                                                                                                                                                                                                                                             | all        | pending |        |
| U10 | 4    | [10-gates-and-bump.md](10-gates-and-bump.md)       | edit   | `site/package.json`, `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/stackgen/stacks/toolchain-gate/dprint/pack.yaml`, `plugins/stackgen/stacks/toolchain-gate/pre-commit/pack.yaml`, `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`, `plugins/stackgen/stacks/bundles/repo-gates.md`, `plugins/stackgen/stacks/bundles/repo-hygiene.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                                                                                                                    | U9         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                                           | Why it collides                                             | Owner                                                                                  |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`   | several units bumping one version is a lost update          | U10                                                                                    |
| the dprint, pre-commit and repo-hygiene `pack.yaml` files and their pins in `repo-gates.md`, `repo-hygiene.md` | U7 edits their payload; a version and its pin move together | U10                                                                                    |
| `plugins/stackgen/stacks/inventory.md`                                                                         | generated                                                   | the orchestrator for the wave-1 commit (E14), then U10                                 |
| `.claude-plugin/marketplace.json`                                                                              | generated                                                   | U10                                                                                    |
| `swiftui/skills/swiftui/SKILL.md` vs its references                                                            | the router links files other units write                    | U2 writes the router against the fixed filenames below; U3 and U4 write only the files |
| the new packs' versions (0.1.0) vs the bundle pins                                                             | a pin names a version                                       | fixed here at 0.1.0; U1, U2, U5 write it, U6 pins it                                   |
| docs — `site/**`, `.claude/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`                  | n units editing one doc                                     | U9                                                                                     |

**Fixed filenames** under
`plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/`, so
U2's router and U3/U4's files agree without a wave between them:

- topics (U3): `pick-and-trade.md`, `project-layout.md`,
  `standards-and-architecture.md`, `state-management.md`, `ui-composition.md`,
  `navigation.md`, `data-and-networking.md`, `platform-interop.md`,
  `build-and-signing.md`, `testing.md`, `performance.md` — topics 1–11 in that
  order;
- platforms (U4): `platforms/ios-ipados.md`, `platforms/macos.md`,
  `platforms/carplay.md`, `platforms/watchos.md`, `platforms/tvos.md`,
  `platforms/visionos.md`;
- integrations (U4, topic 12): `integrations/widgets-and-complications.md`,
  `integrations/app-intents.md`, `integrations/push-notifications.md`,
  `integrations/storekit.md`, `integrations/sign-in-with-apple.md`.

## Waves

- **Wave 1 — U1–U7.** Seven disjoint path sets: each new pack's tree is one
  unit's, the swiftui skill is split by file with the filenames fixed above, the
  bundles pin versions fixed in this file, and U7's cross-tree files are touched
  by no other unit. Lands as **one commit** with the regenerated inventory
  (E14).
- **Wave 2 — R8**, the review row over wave 1's commit.
- **Wave 3 — U9**, docs.
- **Wave 4 — U10**, versions and generators.

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
regeneration (E14) and inside wave 4 between U10's edits and its regeneration —
expected; each is green before its commit.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                   |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed vwf and stackgen into the dev marketplace under `X.Y.Z+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |

## Gates the orchestrator keeps

1. **Smoke test, both bundles, in `/tmp`** (E16), after wave 1 and again after
   wave 4, outside the repo and outside any worktree:
   - **App.** A scratch git repo; land the payload of every component
     `swift-swiftui.md` pins, plus `toolchain-manager/mise`'s helper library the
     tasks source; `mise install`; `tuist init` for an iOS app;
     `mise run setup:deps:install`; `tuist generate --no-open`;
     `xcodebuild build -scheme <app> -destination 'generic/platform=iOS Simulator'`;
     `mise run code:format`; `mise run code:lint`; `mise run test:golden`
     (recording first, then verifying).
   - **Package.** A scratch git repo; land `swift-package.md`'s components plus
     the helper library; `swift package init --type library`;
     `mise run setup:deps:install`; `swift build`; `swift test`;
     `mise run code:format`; `mise run code:lint`.
   - Pass: every command exits 0. Network is allowed for mise, Tuist and SwiftPM
     fetches. A failure blocks the landing and is routed to the unit whose file
     failed.
2. **Shared tasks** (E9). For every task path present in both
   `language/swift/config/.config/mise/tasks/` and
   `app-framework/swiftui/config/.config/mise/tasks/`, `cmp` the pair; every
   pair differs only where U2's report named it. `test -x` on every task file.
   Pass: no unnamed difference, every file executable.
3. **LSP declaration** (E10). The `sourcekit-lsp` entry under `lsp_servers:` in
   `language/swift/pack.yaml` and in `app-framework/swiftui/pack.yaml` is
   byte-identical to `app-framework/flutter/pack.yaml:55-60`. Pass: no diff.
4. **Coverage and citations.** `swift-swiftui.md`'s `platforms:` is exactly
   `mobile, tablet, desktop, auto, watch, tv, spatial`, `swift-package.md`'s
   exactly `packages`, neither sets `default: true`; and a grep of every new
   pack's `config/` and `skills/` for the plugin-root token, a bare `assets/`
   path or a path into a sibling pack is empty. Pass: exact lists, empty grep.

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

- **Kotlin / Android native** — its own backlog item, B57.
- **Third-party swiftui integrations** (Firebase, RevenueCat, maps, WebRTC …) —
  declined at the depth ruling (E4); parked.
- **OS- and vendor-specific features inside a form factor** — plan 1's P1.
- **UIKit- or AppKit-first doctrine** — covered as interop under topic 8 only.
- **Editing Flutter's packs**, including `flutter-ios` and its `**/*.swift`
  glob.
- **The gitleaks allowlist** — a subset; `.build` and `Derived` need not be
  scanned-exempt.
- **Materializing a Swift app in this repo.**
- **A public release** (E17).

## Parked

- **Reputation for SwiftPM and mise names.** stackgen-reputation supports only
  `npm`/`pypi`/`pub`/`action`/`image`
  (`plugins/stackgen/skills/stackgen-reputation/SKILL.md:49-74`); a `@generated`
  Swift component naming a SwiftPM package or a mise tool comes back
  `UNRESOLVED` and halts generation. Curated packs are unaffected. Extend the
  skill with `spm:` and `mise:` prefixes in a later plan.
- **Third-party swiftui integrations** — the Flutter pack's integration set
  (Firebase, RevenueCat, maps, WebRTC, image handling …) for SwiftUI, one
  artifact each, topic 12 shape.
- **Swift on Linux / server** — `language/swift` targets packages; a Vapor or
  Hummingbird service bundle on `service` is a separate item.
- **Plan 1's P1** — OS- and vendor-specific features inside a form factor
  (Dynamic Island, Samsung/OnePlus features, multiple frame sizes).

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-23-swift-native-stack

or let the queue pick it, by priority:

/vwf:execute next
