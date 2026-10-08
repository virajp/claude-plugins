---
type: vwf-change-plan
title: Android Compose stack
requires: [ docs/plans/2026-10-09-kotlin-language-stack ]
backlog: []
backlog_pieces: [ B57 ]
---

# Plan — Android Compose stack (2026-10-09)

## Status

**APPROVED**

APPROVED 2026-10-09 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| End an `all` run after landing                    | no      |

This plan has the folder shape of `2026-10-08-release-levels-recorded`: no
`Release` Consent rows, a `## Release levels` section, and a gates unit that
bumps nothing.

## Release levels

| Project  | Level | Reason                                                            |
| -------- | ----- | ----------------------------------------------------------------- |
| stackgen | MINOR | new behaviour: a curated Android app stack and an AAR bundle      |
| site     | PATCH | the manual pages list the new stack; the site gets no new feature |

## Goal

stackgen offers a curated Android app stack: the packs `framework/android` (AGP,
the Android SDK, Android Lint, the emulator) and `app-framework/compose`
(Jetpack Compose doctrine, the `ux-gate`, the goldens), and two bundles —
`kotlin-compose` (an app on `mobile` and `tablet`) and `android-library` (an AAR
on `packages`). No reversal of a standing decision.

This plan is plan B of 3 for backlog item B57. It stands on plan A
(`2026-10-09-kotlin-language-stack`: `language/kotlin`,
`package-manager/gradle`, `toolchain-gate/ktlint`, `toolchain-gate/detekt`, all
at `0.1.0`). Plan C adds the other form factors, the app types and the docs.

## Facts the survey established

- Pack layout and keys: `plugins/stackgen/assets/pack-format.md:19-141`;
  `binaries` `:142`, `lockfile` `:164`, `templates/` `:183`, `values` `:231`,
  subtasks `:263-293`, bundle frontmatter `:348-410`, version and pin rule
  `:440-447`, honest facts `:465-475`. Taxonomy:
  `plugins/stackgen/assets/taxonomy.md:17-104` (`app-framework` categories
  `cross-platform-ui` and `native-ui` at `:103`; a `framework` type exists).
- Kind bars: `app-framework` at `plugins/stackgen/assets/kinds.md:519-600` (the
  four-part ownership test and a 12-topic bar, topic 12 repeated per
  integration); `language-bundle` at `:50-135`.
- The pattern to copy: `app-framework/swiftui` (0.5.1, `native-ui`): no
  `platforms:` (the bundle owns them); `binaries` with a probe; four `values:`
  (`XCODE_VERSION`, `SIMULATOR_*`); template
  `templates/.config/mise/conf.d/swiftui/mise.toml`; tasks
  `setup/deps/*/swiftui`, `_scripts/xcode`, `test/golden`; skills `swiftui`
  (topics 1–11, `platforms/*.md`, `integrations/` for Apple frameworks) and
  `ux-gate`. Bundle `bundles/swift-swiftui.md`.
- The `ux-gate` contract: a pack that owns a UI ships `skills/ux-gate/SKILL.md`
  under that fixed name; it returns `rendered: ok|n/a` plus findings
  (`plugins/vwf/assets/stack-adapter.md:418-463`) and, after
  `2026-10-08-typescript-ux-gate-renders`, a `renders:` list — read
  `plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md` for the
  shape.
- The goldens harness is required when a project declares a device platform
  (`plugins/vwf/assets/harness.md:20`, `plugins/vwf/assets/vwf-config.md:115`).
  The covering rule: a bundle's `platforms:` must cover every platform the
  project declares (`plugins/vwf/assets/stack-adapter.md:210-220`).
- Platform tokens (`plugins/vwf/assets/templates/registry.yaml:29-38`):
  `packages site webapp desktop mobile tablet auto watch tv spatial cli`; no
  vendor token, by design (`plugins/vwf/assets/standard-flows.md:189-196`).
- The local `mise registry` has `java`, `kotlin`, `gradle`, `android-sdk`
  (vfox), `ktlint`, `maven`.
- Checker rules: rule 4 (strict-YAML frontmatter), rule 11 (task files 755 with
  a shebang; `binaries`/`lockfile` shapes; `values:` upper snake case and used;
  `conf.d/` holds only the slug folder; subtask leaf equals the slug), rule 13
  (no plugin path in landed files), rule 14 (one `default: true` per axis per
  platform; no app bundle is a default today), rule 15 (exclusion lists agree),
  rule 17 (no bare `mise use`). `scripts/src/inventory.ts` fails a pin that does
  not match a pack's version.
- The universal `.gitignore` is
  `plugins/stackgen/skills/tool-config/assets/.gitignore`; plan A adds a
  Gradle/Kotlin section. The rule-15 files are `assets/.graphifyignore` and
  `assets/.config/{dprint.json,gitleaks.toml,taplo.toml,linter.yaml,pre-commit-config.yaml}`,
  described in `references/{dprint,pre-commit}.md`.
- Docs that enumerate packs and bundles:
  `site/src/content/docs/plugins/stackgen.md` (the stack narrative near
  `:293-335`, the kinds table `:441-447`, the gitignore list `:743`),
  `.claude/skills/stackgen-plugin/SKILL.md:168-176` ("Two are flagged today",
  the app bundles named as unflagged) and `:246-250`,
  `plugins/stackgen/stacks/readme.md` (`:74-110` the app-framework waves,
  `:260-265` the bundle count).
- Commit types allowed: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`, no
  scopes.

## Assumed decisions — confirm or override at review

| #   | Decision     | Ruling                                                                                                                                                                                                                                                                                                                                                                                                           | Rejected                                      | Unit   |
| --- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------ |
| C1  | UI toolkit   | The stack teaches Jetpack Compose only, with Material 3. Views/XML is out of scope                                                                                                                                                                                                                                                                                                                               | Compose + Views interop; both as equals       | U2     |
| C2  | Android SDK  | mise pins Android cmdline-tools in `conf.d/android/`. `setup:deps:install:android` runs `sdkmanager` for the platform, build-tools and emulator image from `values:` (`COMPILE_SDK`, `MIN_SDK`, `TARGET_SDK`, `EMULATOR_IMAGE`) into `ANDROID_HOME`, which the mise env sets. If mise has no backend for cmdline-tools, the unit returns `UNRESOLVED`                                                            | a `binaries` fact; vfox `android-sdk`         | U1     |
| C3  | Renders      | Roborazzi renders the screens. `test:golden` records and verifies the goldens, and the `ux-gate` returns `renders:` in the shape of the TypeScript `ux-gate`                                                                                                                                                                                                                                                     | Paparazzi; Compose Preview Screenshot Testing | U2     |
| C4  | E2E          | E2E tests are Compose UI tests on a headless emulator, run through Gradle Managed Devices (`./gradlew connectedCheck`)                                                                                                                                                                                                                                                                                           | Maestro; Robolectric                          | U1, U2 |
| C5  | Pack split   | Two packs. `framework/android` holds AGP, the SDK, Android Lint (`code:lint:android`), the emulator and Gradle Managed Devices. `app-framework/compose` (`native-ui`) holds the Compose doctrine, the `ux-gate` and the goldens                                                                                                                                                                                  | one Compose pack; no AAR bundle               | U1, U2 |
| C6  | Bundles      | `kotlin-compose` (kind `app-framework`, platforms `mobile` and `tablet`, no default): `language/kotlin@0.1.0`, `package-manager/gradle@0.1.0`, `toolchain-gate/ktlint@0.1.0`, `toolchain-gate/detekt@0.1.0`, `framework/android@0.1.0`, `app-framework/compose@0.1.0`. `android-library` (kind `language-bundle`, platform `packages`): the same without `app-framework/compose`. The new packs start at `0.1.0` | —                                             | U1–U3  |
| C7  | App doctrine | The app doctrine is a ViewModel with StateFlow, Hilt, Navigation Compose and Room. A Jetpack `integrations/` reference set follows the SwiftUI pattern                                                                                                                                                                                                                                                           | Koin; manual DI                               | U2     |
| C8  | Supersets    | The universal `.gitignore` gets an Android section (`.cxx/`, `.externalNativeBuild/`, `captures/`). The rule-15 lists stay in agreement                                                                                                                                                                                                                                                                          | —                                             | U4     |
| C9  | One commit   | Wave 1 lands as one commit with the regenerated inventory: the orchestrator runs `mise run p:plugins:inventory` after wave 1 returns and before its wave gate, and commits the inventory with the wave                                                                                                                                                                                                           | one commit per unit                           | —      |
| C10 | Review       | One review row: the packs ship bash subtasks (SDK install, emulator, lint, goldens)                                                                                                                                                                                                                                                                                                                              | no review                                     | R1     |

## New dependencies

None in this repo. The packs teach target repos to use: AGP, Android
cmdline-tools (`sdkmanager`), Jetpack Compose and Material 3, Roborazzi with
Robolectric, Hilt, Navigation Compose, Room, and Gradle Managed Devices. The
user consented to each at the approval gate on 2026-10-09.

## Units

| Id | Wave | Unit file                          | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Depends on | Status  | Commit |
| -- | ---- | ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-android.md](01-android.md)     | edit   | `plugins/stackgen/stacks/framework/android/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —          | pending |        |
| U2 | 1    | [02-compose.md](02-compose.md)     | edit   | `plugins/stackgen/stacks/app-framework/compose/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —          | pending |        |
| U3 | 1    | [03-bundles.md](03-bundles.md)     | edit   | `plugins/stackgen/stacks/bundles/kotlin-compose.md`, `plugins/stackgen/stacks/bundles/android-library.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —          | pending |        |
| U4 | 1    | [04-supersets.md](04-supersets.md) | edit   | `plugins/stackgen/skills/tool-config/assets/.gitignore`, `plugins/stackgen/skills/tool-config/assets/.graphifyignore`, `plugins/stackgen/skills/tool-config/assets/.config/dprint.json`, `plugins/stackgen/skills/tool-config/assets/.config/gitleaks.toml`, `plugins/stackgen/skills/tool-config/assets/.config/taplo.toml`, `plugins/stackgen/skills/tool-config/assets/.config/linter.yaml`, `plugins/stackgen/skills/tool-config/assets/.config/pre-commit-config.yaml`, `plugins/stackgen/skills/tool-config/references/dprint.md`, `plugins/stackgen/skills/tool-config/references/pre-commit.md` | —          | pending |        |
| R1 | 2    | [05-review.md](05-review.md)       | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | U1, U2, U4 | pending |        |
| U5 | 3    | [06-docs.md](06-docs.md)           | edit   | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `CLAUDE.md`, `readme.md`, `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/assets/pack-format.md`, and any other human-facing passage `vwf:docs-sync` finds                                                                                                                                                                                                                                                                                                                                                                      | R1         | pending |        |
| U6 | 4    | [07-gates.md](07-gates.md)         | edit   | `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | U5         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                           | Why it collides                             | Owner                                     |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| `plugins/stackgen/stacks/inventory.md`                                                         | generated from every pack and bundle        | the orchestrator in wave 1 (C9), U6 after |
| `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                      | version files and a generated file; no bump | nobody — never                            |
| plan A's packs (`language/kotlin`, `package-manager/gradle`, `toolchain-gate/{ktlint,detekt}`) | another plan's packs; pinned only           | nobody — never                            |
| `.config/releases.yaml`                                                                        | written by `/vwf:execute` at landing        | nobody in a unit                          |
| the human-facing docs                                                                          | n units editing one doc                     | U5 only                                   |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Separate trees; the bundle pins are fixed in C6.
  Lands as one commit with the regenerated inventory (C9).
- **Wave 2 — R1.** Reviews the wave-1 commit.
- **Wave 3 — U5.** Docs.
- **Wave 4 — U6.** Gates.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
pnpm exec tsc --noEmit -p scripts
mise run code:precommit
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                                                                                           |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen into the dev marketplace; a restarted session loads it. Publishes nothing. If `.config/vwf.yaml`'s `after_landing:` also lists it, it runs once |

## Gates the orchestrator keeps

- After wave 1: `mise run p:plugins:inventory` before the wave gate, and the
  inventory rides the wave-1 commit (C9). Pass:
  `mise run p:plugins:inventory -- --check` is green and the header counts grew
  by 2 packs and 2 bundles.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc outside its Owns, never adds a dependency this file
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. Before writing code with an external tool or library, a unit
reads its current docs through Context7 (`resolve-library-id`, then
`query-docs`).

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Views/XML UI (C1); Kotlin Multiplatform.
- Signing, release builds to Google Play and Play publishing pipelines.
- The form factors `watch`, `tv`, `auto`, `spatial` — plan C.

## Parked

- B57: plan C — the form factors Wear OS (`watch`), Android TV (`tv`), Android
  Auto (`auto`) and Android XR (`spatial`) on the `kotlin-compose` bundle, with
  per-platform references in `app-framework/compose`; the app types Android
  Studio builds (instant apps, widgets, and the rest); Wear OS detection in
  `plugins/vwf/skills/setup/references/topology-detection.md:150`; the "Kotlin
  or Flutter" text in
  `site/src/content/docs/how-to/operate/choosing-your-stack.md:62-63`,
  `plugins/stackgen/stacks/bundles/dart-flutter.md` and
  `plugins/stackgen/stacks/bundles/swift-swiftui.md:48-56`, `:94`.
- A Google Play deploy target (a `deploy-target` pack) — not yet a backlog item.
- Compose interop with Views (`AndroidView`, `ComposeView`) for existing
  View-based apps.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-09-android-compose-stack

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
