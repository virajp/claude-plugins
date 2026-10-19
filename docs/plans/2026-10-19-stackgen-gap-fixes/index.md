---
type: vwf-change-plan
title: Stackgen gap fixes
requires:
  - docs/plans/2026-10-18-packs-hand-off-to-bootstrap
source: []
backlog: []
backlog_pieces: []
gaps_of:
  - docs/plans/2026-10-09-android-compose-stack
  - docs/plans/2026-10-09-kotlin-language-stack
  - docs/plans/2026-10-10-os-device-frames
---

# Plan — Stackgen gap fixes (2026-10-19)

## Status

**APPROVED**

APPROVED 2026-10-19 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | no      |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt, and `run` is the only mode — a step the interview did not
confirm `run` (item 17) is not in the plan, and `/vwf:execute` asks nothing at
run time. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Release levels

| Project  | Level | Reason                                                                                                      |
| -------- | ----- | ----------------------------------------------------------------------------------------------------------- |
| stackgen | PATCH | doctrine and pack-fact fixes in the Android, Compose, Kotlin, Flutter and design-tool packs; no new feature |
| vwf      | PATCH | the frame table template gets its sources, and any wrong size is corrected                                  |
| site     | PATCH | the manual follows the corrected doctrine and frame table                                                   |

## Goal

After the plan lands, every 2026-10-18 ruling that falls to this repo for the
three live folders `2026-10-09-android-compose-stack`,
`2026-10-09-kotlin-language-stack` and `2026-10-10-os-device-frames` is true in
the packs and the docs, so all three folders can be archived. The rulings are
recorded in each folder's "Gaps surfaced during execution" section on `develop`
at `5a021377`.

One reversal, confirmed by the user on 2026-10-18 (conflict 5 of the gap
review): Android G3 was ruled on 2026-10-10 as "keep `app-framework` for
Compose, the reason stays in `conventions.md`". The 2026-10-18 ruling also
records the Compose case in the four-part test of `kinds.md` (D1). The docs unit
writes the decisions doc for it.

This plan runs after `2026-10-18-packs-hand-off-to-bootstrap` (user,
2026-10-19). That plan removes `values:` and `templates/` from every pack, bumps
the major component of each changed pack, and owns the same trees. Thus every
line number in the facts below is from `develop` at `5a021377`, before the
hand-off: a unit finds each passage by its text. Where the hand-off already made
an edit this plan asks for, the unit records it as `DECIDED:` and moves on. The
two rulings on Android `values:` — the `EMULATOR_IMAGE` default (gap 15) and the
SDK-level detects (gap 16c) — leave this plan: the values move to bootstrap's
`android` tool, and the rulings are inputs in bootstrap item B03.

The boundary that frames the plan (user, 2026-10-18): bootstrap owns tool pins,
generic tasks and shared configs; anything repo-specific stays in this repo, and
`test:*` tasks stay here because they need a model decision. No Windows support:
macOS only for development tools.

## Facts the survey established

Paths are under `plugins/stackgen/` unless they say otherwise.

- **Four-part test.** `assets/kinds.md:519` starts the `app-framework` section;
  the four bullets are at `:531-542`; `:544-545` reads "Where all four hold, the
  SDK is the root. Where they do not, it is an ordinary `framework`". The new
  paragraph goes after `:545`, before the `- **Axis**` bullets at `:547`.
  `stacks/app-framework/compose/conventions.md:10-11` says the test "does not
  hold for Compose" and must agree with the new paragraph.
  `stacks/app-framework/swiftui/conventions.md:9-17` restates the test for Xcode
  and stays.
- **EMULATOR_IMAGE.** `stacks/framework/android/pack.yaml:45` is the value;
  `detect:` at `:46-50` always prints `system-images;android-<api>;google_apis`;
  `question:` at `:51-54`.
  `skills/android/references/emulator-and-managed-devices.md:52` hardcodes
  `systemImageSource = "google"`; `:62-63` maps `google` to `google_apis` and
  `aosp` to `default`; `:66-68` covers ATD. No file names `ps16k`. Fact,
  2026-10-18 (Google's `sys-img2-3.xml`): `google_apis` exists up to
  `android-37.0`; from `android-37.1` only `google_apis_ps16k` exists;
  `google_apis_ps16k` exists for each level from 36.
- **Goldens.** `stacks/app-framework/compose/conventions.md:44-46` says a render
  "is the same on every machine and in CI"; `GraphicsMode.NATIVE` is at `:66`.
- **Flavors.**
  `stacks/framework/android/skills/android/references/build-configuration.md:54-58`
  permits staging and production flavors;
  `stacks/app-framework/compose/skills/compose/references/build-and-variants.md:31-34`
  says an environment is a build config field, not a flavor.
- **SDK detects.** `build-configuration.md:47-49` puts the SDK levels in a
  `build-logic/` convention plugin; the `detect:` lines of
  `stacks/framework/android/pack.yaml` at `:21`, `:30`, `:38`, `:46` grep
  `build.gradle.kts` for literal numbers.
- **AVD id.** `emulator-and-managed-devices.md:32` passes the raw
  `${EMULATOR_IMAGE};arm64-v8a` to `avdmanager`;
  `stacks/framework/android/config/.config/mise/tasks/setup/deps/install/android:45-48`
  and `:59-62` rewrite the level to `<level>.0` through `sdk_level`.
- **test:e2e.**
  `stacks/framework/android/config/.config/mise/tasks/test/e2e:25-29`:
  `--connected` runs a bare `connectedCheck` and exits before `--device` and
  `--variant` are read at `:31-32`; the flags are declared at `:6-8`. This file
  is payload: excluded from the formatter, shipped byte for byte.
- **kotlin-library bundle.** `stacks/bundles/kotlin-library.md:31` says the
  lockfile is written "only by `./gradlew dependencies --write-locks`"; `:41`
  says Android "is not yet covered by a shipped bundle" —
  `bundles/android-library.md` and `bundles/kotlin-compose.md` cover it now.
- **Windows.**
  `stacks/language/kotlin/skills/kotlin/references/toolchain.md:82-83` tells
  Windows users to install kotlin-lsp by hand. The other hit,
  `stacks/language/kotlin/templates/.config/mise/conf.d/kotlin/mise.dev.toml:5`,
  is a tool pin file (out of scope).
- **Manifest fact.** `manifest: settings.gradle.kts` is at
  `stacks/language/kotlin/pack.yaml:20` and
  `stacks/app-framework/compose/pack.yaml:21`. No code reads it; vwf doctor
  reads it as prose (`plugins/vwf/skills/doctor/references/stack-checks.md:83`,
  `:144-145`). The other mentions of `settings.gradle.kts` in the packs and in
  vwf init name the Gradle project marker, and stay.
- **LSP entries.** `stacks/app-framework/flutter/pack.yaml:48-54` runs
  kotlin-lsp as `mise` `[x, kotlin@latest, --, kotlin-lsp, --stdio]`; `:42-47`
  runs dart-lsp as
  `[x, flutter@latest, --, dart, language-server, --protocol=lsp]`.
  `stacks/language/kotlin/pack.yaml:22-28` runs kotlin-lsp as
  `[x, --, kotlin-lsp, --stdio]`, with the same extensions and timeout.
- **Locking.** The Gradle skill already has the STRICT rule:
  `stacks/package-manager/gradle/skills/gradle/references/locking.md:12-14`
  (`lockAllConfigurations()`, `lockMode.set(LockMode.STRICT)`). The Kotlin pack
  has no `LockMode` mention; its deps-task table is at
  `stacks/language/kotlin/conventions.md:50-52`.
- **Robolectric qualifiers.**
  `stacks/app-framework/compose/conventions.md:62-65`,
  `stacks/app-framework/compose/skills/ux-gate/SKILL.md:40-43`, and
  `stacks/app-framework/compose/skills/compose/references/testing.md:32`,
  `:44-45` name `Pixel7`, `MediumTablet`, `WearOSLargeRound`, `Television1080p`.
  `platforms/wear-os.md:73` and `platforms/android-tv.md:51` name the watch and
  TV qualifiers, which already match D6 (227×227, 960×540).
- **The D6 frame table.** Full copies:
  `plugins/vwf/assets/templates/canvas-claude.md:73-96` (prose at `:134-157`)
  and `stacks/design-tool/claude-code/skills/design-session/SKILL.md:189-212`; a
  short copy in `site/src/content/docs/plugins/vwf.md:2384-2392`. The sizes also
  sit in `stacks/app-framework/compose/skills/ux-gate/SKILL.md:52-53` and
  `stacks/app-framework/swiftui/skills/ux-gate/SKILL.md:48-51`. Values: Android
  mobile 412×915, tablet 800×1280; Wear OS 227×227 round; watchOS 208×248;
  Android TV 960×540 with overscan 27 top and bottom, 48 at the sides; Android
  Auto and CarPlay 800×480 (`canvas-claude.md:134` adds "Android Auto head units
  are commonly 1280×720"). No file cites a source for any size.
- **Gap 30 is closed.** `assets/pack-format.md:407` is 75 columns now; no line
  in `:403-411` is over 100.
- **Versions.** `framework/android` 0.2.0, `app-framework/compose` 0.5.0,
  `language/kotlin` 0.1.0, `app-framework/flutter` 0.7.1,
  `design-tool/claude-code` 0.6.0, `app-framework/swiftui` 0.8.0. Pins:
  `bundles/kotlin-compose.md:6,10,11`, `bundles/kotlin-library.md:6`,
  `bundles/android-library.md:6,10`, `bundles/dart-flutter.md:6`,
  `bundles/claude-code.md:7`, `bundles/swift-swiftui.md:6`.
  `stacks/inventory.md` is generated.
- **Formatter.** `.config/dprint.json` excludes `plugins/**/*.md` and the
  `config/` and `templates/` payload trees, so plugin markdown is folded by hand
  at the width around it. `site/src/content/docs/**/*.md` and `docs/**/*.md` are
  formatted.
- **Commits.** `.config/git-conventional-commits.yaml` allows `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.

## Assumed decisions — confirm or override at review

| #   | Decision               | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Rejected                                                            | Unit   |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------ |
| D1  | The Compose case       | Keep `type: app-framework` for Compose. `kinds.md` adds, after the four-part test, the Compose case: the UI toolkit is the root when the build SDK (AGP) is a `framework` member of the bundle. `compose/conventions.md:10-11` says the same and drops "does not hold".                                                                                                                                                                                             | the reason in `compose/conventions.md` only (the 2026-10-10 ruling) | U3, U2 |
| D3  | Goldens                | The Compose goldens are recorded in CI on Linux. A local run on macOS only verifies, and a diff there is not a failure of the code. Doctrine only: no task change.                                                                                                                                                                                                                                                                                                  | `test:golden` refuses `--record` off Linux; waiting for B94         | U2     |
| D4  | Staging and production | An environment is a build config field, set per build type or from the CI environment, never a product flavor. The Android reference drops the staging and production flavors and says why.                                                                                                                                                                                                                                                                         | product flavors; flavors only when two builds must share a device   | U1, U2 |
| D6  | The AVD id             | The emulator reference names the same `<level>.0` id the install task installs, and says why.                                                                                                                                                                                                                                                                                                                                                                       | —                                                                   | U1     |
| D7  | `test:e2e --connected` | `--connected` runs `./gradlew connected<Variant>AndroidTest`, so `--variant` applies. `--device` names a managed device, so `--device` with `--connected` is an error with a clear message.                                                                                                                                                                                                                                                                         | ignore `--device` with a warning; refuse both flags                 | U1     |
| D8  | Robolectric qualifiers | `mobile` and `tablet` use explicit qualifier strings at the D6 sizes — 412×915 and 800×1280 portrait — taken from the Robolectric documentation (for example `w412dp-h915dp-…-port-…`). `watch` and `tv` keep `WearOSLargeRound` and `Television1080p`, which match D6. The D6 table stays.                                                                                                                                                                         | change the D6 table to the named qualifiers                         | U2     |
| D9  | The manifest fact      | The `manifest:` fact of the Kotlin and Compose packs is `gradle/libs.versions.toml`. `settings.gradle.kts` stays the project marker.                                                                                                                                                                                                                                                                                                                                | the catalog plus each module's `build.gradle.kts`                   | U2, U3 |
| D10 | Flutter LSP entries    | Both Flutter entries take the `mise x -- <binary>` form: kotlin-lsp `[x, --, kotlin-lsp, --stdio]`, the same as the Kotlin pack, and dart-lsp `[x, --, dart, language-server, --protocol=lsp]`.                                                                                                                                                                                                                                                                     | fix kotlin-lsp only                                                 | U3     |
| D11 | Locking in Kotlin      | The Kotlin `conventions.md` tells the build to set `LockMode.STRICT` and points to the Gradle skill's locking rule by skill name, never by path.                                                                                                                                                                                                                                                                                                                    | a second copy of the rule                                           | U3     |
| D12 | Kotlin text fixes      | Remove the Windows sentence at `toolchain.md:82-83` (no Windows support). `kotlin-library.md:31`: the `setup:deps` tasks write the lockfile of every project. `kotlin-library.md:41`: an Android library module is the `android-library` bundle, an Android app the `kotlin-compose` bundle.                                                                                                                                                                        | —                                                                   | U3     |
| D13 | Frame sources          | Find a source for each Android, Wear OS, Android TV, Android Auto and watchOS size and margin of D6 (Context7 first, then the vendor's own pages). Put a short "Sources" list of URLs under the full table in `canvas-claude.md` and in `design-session/SKILL.md`. Correct a wrong value in every copy; the ux-gate skills and the site keep the sizes only.                                                                                                        | the decisions doc only; a Source column in each table               | U4     |
| D14 | The review row         | One review row, R1, covers U1, because U1 changes runnable shell: the `test/e2e` task.                                                                                                                                                                                                                                                                                                                                                                              | the wave review only                                                | R1     |
| D15 | Pack versions          | U6 bumps each pack whose files the branch changed by one patch, from the version its `pack.yaml` reads at run time (the hand-off bumps the major component first; a component of 13 or 17 is skipped): `framework/android`, `app-framework/compose`, `language/kotlin`, `app-framework/flutter`, `design-tool/claude-code`, and `app-framework/swiftui` only if U4 changed its ux-gate skill. It re-pins the bundles and regenerates `inventory.md`, in one commit. | no bump                                                             | U6     |
| D16 | Dart LSP in scope      | The dart-lsp entry is fixed in this plan, because it is the same defect in the same file as gap 26.                                                                                                                                                                                                                                                                                                                                                                 | Parked for a later plan                                             | U3     |
| D17 | Order                  | This plan requires `2026-10-18-packs-hand-off-to-bootstrap`. Gaps 15 and 16c leave the plan and become inputs in bootstrap item B03.                                                                                                                                                                                                                                                                                                                                | run before the hand-off; merge into the hand-off plan               | all    |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                     | Depends on         | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ------- | ------ |
| U1 | 1    | [01-android.md](01-android.md)               | edit   | `plugins/stackgen/stacks/framework/android/skills/android/references/emulator-and-managed-devices.md`, `plugins/stackgen/stacks/framework/android/skills/android/references/build-configuration.md`, `plugins/stackgen/stacks/framework/android/config/.config/mise/tasks/test/e2e`                                                                                                                                      | —                  | pending |        |
| U2 | 1    | [02-compose.md](02-compose.md)               | edit   | `plugins/stackgen/stacks/app-framework/compose/pack.yaml`, `plugins/stackgen/stacks/app-framework/compose/conventions.md`, `plugins/stackgen/stacks/app-framework/compose/skills/ux-gate/SKILL.md`, `plugins/stackgen/stacks/app-framework/compose/skills/compose/references/testing.md`, `plugins/stackgen/stacks/app-framework/compose/skills/compose/references/build-and-variants.md`                                | —                  | pending |        |
| U3 | 1    | [03-kotlin-flutter.md](03-kotlin-flutter.md) | edit   | `plugins/stackgen/stacks/language/kotlin/pack.yaml`, `plugins/stackgen/stacks/language/kotlin/conventions.md`, `plugins/stackgen/stacks/language/kotlin/skills/kotlin/references/toolchain.md`, `plugins/stackgen/stacks/app-framework/flutter/pack.yaml`, `plugins/stackgen/stacks/bundles/kotlin-library.md`, `plugins/stackgen/assets/kinds.md`                                                                       | —                  | pending |        |
| U4 | 2    | [04-frame-sources.md](04-frame-sources.md)   | edit   | `plugins/vwf/assets/templates/canvas-claude.md`, `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`, `plugins/stackgen/stacks/app-framework/compose/skills/ux-gate/SKILL.md`, `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/SKILL.md`                                                                                                                                      | U2                 | pending |        |
| R1 | 2    | [05-review.md](05-review.md)                 | review | —                                                                                                                                                                                                                                                                                                                                                                                                                        | U1                 | pending |        |
| U5 | 3    | [06-docs.md](06-docs.md)                     | edit   | `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/skills/**`, `.claude/docs/**`, `plugins/stackgen/stacks/readme.md`, `docs/memory/decisions/2026-10-19-stackgen-gap-fixes.md` (new), and any other human-facing passage `vwf:docs-sync` finds outside the Owns of U1 to U4 and U6                                                                                                                          | U1, U2, U3, U4, R1 | pending |        |
| U6 | 4    | [07-gates.md](07-gates.md)                   | edit   | the `version:` line of the six `pack.yaml` files in D15, `plugins/stackgen/stacks/bundles/kotlin-compose.md`, `plugins/stackgen/stacks/bundles/kotlin-library.md`, `plugins/stackgen/stacks/bundles/android-library.md`, `plugins/stackgen/stacks/bundles/dart-flutter.md`, `plugins/stackgen/stacks/bundles/claude-code.md`, `plugins/stackgen/stacks/bundles/swift-swiftui.md`, `plugins/stackgen/stacks/inventory.md` | U5                 | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                    | Why it collides                         | Owner                                           |
| ----------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------- |
| `plugins/stackgen/stacks/inventory.md`                                  | generated; regenerating mid-wave races  | U6 only                                         |
| the six `pack.yaml` `version:` lines and the bundle pins                | one bump, one commit                    | U6 only; U1 to U3 never touch a `version:` line |
| `plugins/stackgen/stacks/app-framework/compose/skills/ux-gate/SKILL.md` | U2 changes the qualifiers, U4 the sizes | U2 in wave 1, U4 in wave 2                      |
| `plugins/stackgen/stacks/bundles/kotlin-library.md`                     | U3 changes the text, U6 the pin         | U3 in wave 1, U6 in wave 4                      |
| each human-facing doc                                                   | several units would edit one doc        | U5 only                                         |

## Waves

- **Wave 1 — U1, U2, U3.** Three disjoint pack trees (Android, Compose, Kotlin
  with Flutter and the shared `kinds.md`), so they are safe together.
- **Wave 2 — U4, R1.** U4 edits the Compose `ux-gate` skill after U2 finished
  with it, and its other files are outside every wave-1 Owns. R1 reviews U1's
  commit, so it sits strictly after wave 1.
- **Wave 3 — U5.** The docs unit reads every earlier diff.
- **Wave 4 — U6.** The gates unit bumps, re-pins and regenerates last.

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

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

none — `.config/vwf.yaml` lists `mise run p:plugins:local` in `after_landing:`,
and `/vwf:execute` runs it after every green landing. A restarted session picks
up the staged plugins.

## Gates the orchestrator keeps

none — every change is text or a shell task with no test harness in this repo;
R1 reviews the shell change.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never writes a lock file with Write, Edit, `sed` or a script. A
unit never runs `git checkout`, `git restore` or a formatter with `--fix`
outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- Tool pins, generic tasks (`setup:deps:*`, `code:format:*`, `code:lint:*`) and
  shared configs — bootstrap owns them; the inputs are in items B03 and B04 of
  the bootstrap project. This includes the cmdline-tools pin, the install-time
  `sdkmanager --list` check, the `java` owner, the ktlint config location, the
  ktlint and detekt filters, and the Android Lint trigger and scope.
- The Windows comment in
  `plugins/stackgen/stacks/language/kotlin/templates/.config/mise/conf.d/kotlin/mise.dev.toml:5`
  — a tool pin file; it goes with the tool-config removal plan.
- Gap 30 (`pack-format.md:407`) — already closed; the line is 75 columns.
- Gap 15 (the `EMULATOR_IMAGE` default) and gap 16c (the SDK-level detects) —
  the hand-off moves the Android `values:` to bootstrap's `android` tool; both
  rulings are inputs in bootstrap item B03.
- The archive of the three `gaps_of:` folders — the user asks for it after the
  landing.

## Parked

none

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-19-stackgen-gap-fixes

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
