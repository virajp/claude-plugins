---
type: vwf-change-plan
title: Kotlin language stack
requires:
  [
    docs/plans/2026-10-08-typescript-ux-gate-renders,
    docs/plans/2026-10-08-release-levels-recorded,
  ]
backlog: []
backlog_pieces: [ B57 ]
---

# Plan — Kotlin language stack (2026-10-09)

## Status

**APPROVED**

APPROVED 2026-10-09 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| End an `all` run after landing                    | no      |

This plan runs after `2026-10-08-release-levels-recorded`, so it has that plan's
folder shape: no `Release` Consent rows, a `## Release levels` section, and a
gates unit that bumps nothing. The End an `all` run row is `no`: the running
session's stale vwf and stackgen do not affect the next plans, which only edit
files.

## Release levels

| Project  | Level | Reason                                                            |
| -------- | ----- | ----------------------------------------------------------------- |
| stackgen | MINOR | new behaviour: a curated Kotlin/JVM library stack                 |
| vwf      | MINOR | new behaviour: `init` detects a Gradle repo as `kotlin`           |
| site     | PATCH | the manual pages list the new stack; the site gets no new feature |

## Goal

stackgen offers a curated Kotlin/JVM library stack — `language/kotlin`,
`package-manager/gradle`, `toolchain-gate/ktlint`, `toolchain-gate/detekt` — and
a `kotlin-library` bundle on the `packages` platform. vwf `init` detects a
Gradle repo as `kotlin`. No reversal of a standing decision.

This plan is plan A of 3 for backlog item B57 (native Kotlin for Android). Plan
B is the Jetpack Compose Android app stack; plan C is the form factors, the app
types and the docs. The Swift chain of 2026-09-23 is the pattern.

## Facts the survey established

- Stack type dirs:
  `plugins/stackgen/stacks/{app-framework,capability-provider,ci-system,cloud-provider,cloud-service,datastore,deploy-target,design-tool,framework,language,package-manager,stylesheet,toolchain-gate}`,
  plus `bundles/`, `inventory.md` (generated) and `readme.md`. Closed type and
  category lists: `plugins/stackgen/assets/taxonomy.md:17-104`.
- Pack layout and keys: `plugins/stackgen/assets/pack-format.md:19-141`
  (`pack.yaml`, `conventions.md`, `skills/<name>/`, `config/` mirroring the repo
  root with subtasks under `.config/mise/tasks/...` at mode 755, `templates/`
  holding only `.config/mise/conf.d/<slug>/` with `@@NAME@@` values). `binaries`
  `:142`, `lockfile` `:164`, `templates/` `:183`, `values` `:231`, subtasks
  `:263-293`, bundle frontmatter `:348-410`, version and pin rule `:440-447`,
  honest facts `:465-475`.
- Kind bars: `language-bundle` at `plugins/stackgen/assets/kinds.md:50-135` (12
  topics split across language, package-manager and toolchain-gate packs; facts
  `lsp`, `mise_tool`, `manifest`).
- The pattern to copy (Swift chain, archived
  `docs/plans/archived/2026-09-23-swift-package-stack/`): `language/swift`
  (0.2.1: `platforms: [packages]`, `binaries: [swift]`, `setup/deps/*/swift`
  tasks, skill `swift` with seven references); `package-manager/swiftpm` (0.3.1:
  `lockfile:` globs, no tasks); `toolchain-gate/swift-format`
  (`.config/swift-format.json`, `code/{format,lint}/swift-format`);
  `toolchain-gate/swiftlint` (`.config/swiftlint.yml`, `code/lint/swiftlint`, a
  mise template pinning `aqua:realm/SwiftLint`); bundle
  `bundles/swift-package.md` (language-bundle, `packages`). Its wave 1 landed as
  one commit with the regenerated inventory (decision E14 in
  `docs/memory/decisions/2026-09-23-swift-native-stack.md`).
- Kotlin today appears only as a `platform-edge` language inside
  `app-framework/flutter/pack.yaml:20-29`; its `lsp_servers` run
  `mise x kotlin@latest -- kotlin-lsp` (`:48-54`).
- The local `mise registry` has `java` (core), `kotlin`, `gradle`,
  `android-sdk`, `ktlint` and `maven`; it has no `detekt` or `ktfmt` entry (they
  need an `aqua:` or `github:` backend).
- Checker rules (`.claude/skills/plugin-authoring/references/checks.md`,
  `scripts/src/check.ts`): rule 4 strict-YAML skill frontmatter; rule 11
  (`checkPackConfigTier`, check.ts:586) — executable tasks with a known shebang,
  the root allowlist, `binaries`/`lockfile` fact shapes, `values:` upper snake
  case and used, `@@` grammar, `conf.d/` holds only the slug folder, subtask
  leaf equals the slug; rule 13 — landed files cite no plugin path, no
  `${CLAUDE_PLUGIN_ROOT}`, no sibling-pack path; rule 14 — at most one
  `default: true` per axis per platform; rule 15 — the exclusion lists agree;
  rule 17 — no bare `mise use`. Gate order: marketplace `--check`, inventory
  `--check`, `check`.
- `scripts/src/inventory.ts` fails on an unknown kind or a pin that does not
  match a pack's version (`:24-31`, `:303-336`). The header reads "68 packs, 64
  bundles, 10 kinds".
- vwf `init`'s stack read: `plugins/vwf/skills/init/SKILL.md:346-360`, a fixed
  manifest → language table; `:356-358` "A file not in this table is not a
  manifest"; the `.xcodeproj` row is root-only.
- Universal supersets: `plugins/stackgen/skills/tool-config/assets/.gitignore`
  has Dart/Flutter (`:75`) and Swift/Xcode (`:82`) sections and no Gradle
  section. Exclusion lists live in
  `assets/.config/{dprint.json,gitleaks.toml,taplo.toml,linter.yaml,pre-commit-config.yaml}`,
  `assets/.graphifyignore`, and are described in
  `references/{dprint,pre-commit}.md`.
- `stackgen-reputation` supports only `npm:`, `pypi:`, `pub:`, `action:`,
  `image:` — Maven names are B60's; curated packs are unaffected.
- Docs that enumerate packs or languages:
  `site/src/content/docs/plugins/stackgen.md:264` ("fourth language"),
  `:293-335`, `:441-447`, `:743` (the gitignore language list);
  `site/src/content/docs/plugins/vwf.md:695`;
  `.claude/skills/stackgen-plugin/SKILL.md:246-250`;
  `plugins/stackgen/stacks/readme.md:55`, `:260-265`;
  `plugins/stackgen/stacks/inventory.md:10` (regenerated).
- Versions now: stackgen `3.0.0` (the typescript plan bumps it to `3.1.0`), vwf
  `21.1.0`. This plan bumps neither; `/vwf:execute` records the levels.
- Commit types allowed: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`, no
  scopes.

## Assumed decisions — confirm or override at review

| #   | Decision      | Ruling                                                                                                                                                                                                                                                                                             | Rejected                                             | Unit   |
| --- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| K1  | Split         | B57 is split into three chained plans: A (Kotlin language and library), B (the Compose Android app stack), C (form factors, app types and docs). Plan C finishes B57                                                                                                                               | two plans; one plan                                  | —      |
| K2  | Library form  | The bundle covers only Kotlin/JVM libraries (JAR). The Android library module (AAR) is in plan B. Kotlin Multiplatform is out of scope                                                                                                                                                             | JVM + KMP; JVM + AAR                                 | U1, U3 |
| K3  | Toolchain     | mise pins the JDK (Temurin LTS) in `conf.d/kotlin/`. Gradle comes from the committed wrapper (`gradlew`, `gradle/wrapper/gradle-wrapper.properties`). The Kotlin compiler comes from the Kotlin Gradle plugin                                                                                      | mise Gradle; a mise Kotlin compiler                  | U1, U2 |
| K4  | Gates         | Two gate packs: `toolchain-gate/ktlint` (format and lint, from the mise registry) and `toolchain-gate/detekt` (lint, through a `github:` backend). Android Lint is in plan B                                                                                                                       | ktlint only; ktfmt + detekt                          | U2     |
| K5  | Locking       | The `gradle` pack teaches the version catalog `gradle/libs.versions.toml` and dependency locking. `gradle.lockfile` is tracked, and only `./gradlew dependencies --write-locks` writes it                                                                                                          | no locking; verification metadata                    | U1, U2 |
| K6  | Tests         | The test doctrine is `kotlin.test` on JUnit 5, with `kotlinx-coroutines-test` and Kover                                                                                                                                                                                                            | Kotest; JUnit 5 + AssertJ                            | U1     |
| K7  | Deps subtasks | `setup:deps:outdated:kotlin` uses the ben-manes `gradle-versions-plugin` (`./gradlew dependencyUpdates`). `setup:deps:audit:kotlin` runs grype over `gradle.lockfile`                                                                                                                              | no outdated; OWASP dependency-check                  | U1     |
| K8  | LSP           | The `conf.d/kotlin/` template pins `kotlin-lsp` (`github:` backend), and `lsp_servers` runs `mise x -- kotlin-lsp`. If no release asset exists, the unit returns `UNRESOLVED`                                                                                                                      | the Flutter form `mise x kotlin@latest --`           | U1     |
| K9  | Pack split    | The SwiftPM pattern applies. `language/kotlin` holds the facts (`mise_tool: java`, `manifest: settings.gradle.kts`, `lsp: kotlin-lsp`, no `binaries`), the `setup/deps/*/kotlin` subtasks and the doctrine. `package-manager/gradle` holds the doctrine and the `lockfile:` fact, with no subtasks | subtasks in the gradle pack                          | U1, U2 |
| K10 | Bundle        | The bundle is `kotlin-library.md`: kind `language-bundle`, platform `packages`, no `default: true`. Pins: `language/kotlin@0.1.0`, `package-manager/gradle@0.1.0`, `toolchain-gate/ktlint@0.1.0`, `toolchain-gate/detekt@0.1.0`. Each pack starts at `0.1.0`                                       | —                                                    | U1–U3  |
| K11 | init          | The vwf `init` manifest table maps `settings.gradle(.kts)` at the root to `kotlin`. A root `build.gradle(.kts)` with no settings file also maps to `kotlin`. A module build file under a root settings file is not a project                                                                       | no init change                                       | U4     |
| K12 | Supersets     | The universal `.gitignore` gets a Gradle/Kotlin section: `.gradle/`, `.kotlin/`, `local.properties`, `*.iml`. The rule-15 exclusion lists stay in agreement                                                                                                                                        | —                                                    | U5     |
| K13 | One commit    | Wave 1 lands as one commit with the regenerated `inventory.md` (Swift decision E14): the orchestrator runs `mise run p:plugins:inventory` after wave 1 returns and before its wave gate, and commits the inventory with the wave                                                                   | one commit per unit (this fails `inventory --check`) | —      |
| K14 | Review        | One review row, because the packs ship bash subtasks (runnable code)                                                                                                                                                                                                                               | no review                                            | R1     |

## New dependencies

None in this repo. The packs teach target repos to use: the Temurin JDK (mise
`java`), `kotlin-lsp` (JetBrains, `github:` backend), ktlint (mise registry),
detekt (`github:` backend), the ben-manes `gradle-versions-plugin`,
`kotlin.test`/JUnit 5, `kotlinx-coroutines-test` and Kover. The user consented
to each at the approval gate on 2026-10-09.

## Units

| Id | Wave | Unit file                                        | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Depends on | Status  | Commit |
| -- | ---- | ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-language-kotlin.md](01-language-kotlin.md)   | edit   | `plugins/stackgen/stacks/language/kotlin/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —          | pending |        |
| U2 | 1    | [02-gradle-and-gates.md](02-gradle-and-gates.md) | edit   | `plugins/stackgen/stacks/package-manager/gradle/**`, `plugins/stackgen/stacks/toolchain-gate/ktlint/**`, `plugins/stackgen/stacks/toolchain-gate/detekt/**`                                                                                                                                                                                                                                                                                                                                                                                                                                             | —          | pending |        |
| U3 | 1    | [03-bundle.md](03-bundle.md)                     | edit   | `plugins/stackgen/stacks/bundles/kotlin-library.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —          | pending |        |
| U4 | 1    | [04-init.md](04-init.md)                         | edit   | `plugins/vwf/skills/init/SKILL.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —          | pending |        |
| U5 | 1    | [05-supersets.md](05-supersets.md)               | edit   | `plugins/stackgen/skills/tool-config/assets/.gitignore`, `plugins/stackgen/skills/tool-config/assets/.graphifyignore`, `plugins/stackgen/skills/tool-config/assets/.config/dprint.json`, `plugins/stackgen/skills/tool-config/assets/.config/gitleaks.toml`, `plugins/stackgen/skills/tool-config/assets/.config/taplo.toml`, `plugins/stackgen/skills/tool-config/assets/.config/linter.yaml`, `plugins/stackgen/skills/tool-config/assets/.config/pre-commit-config.yaml`, `plugins/stackgen/skills/tool-config/references/dprint.md`, `plugins/stackgen/skills/tool-config/references/pre-commit.md` | —          | pending |        |
| R1 | 2    | [06-review.md](06-review.md)                     | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | U1, U2, U5 | pending |        |
| U6 | 3    | [07-docs.md](07-docs.md)                         | edit   | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`, `CLAUDE.md`, `readme.md`, `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/assets/pack-format.md`, and any other human-facing passage `vwf:docs-sync` finds                                                                                                                                                                                                                                                                                                                                      | R1         | pending |        |
| U7 | 4    | [08-gates.md](08-gates.md)                       | edit   | `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | U6         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                      | Why it collides                             | Owner                                      |
| ------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------ |
| `plugins/stackgen/stacks/inventory.md`                                    | generated from every pack and bundle        | the orchestrator in wave 1 (K13), U7 after |
| `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | version files and a generated file; no bump | nobody — never                             |
| `.config/releases.yaml`                                                   | written by `/vwf:execute` at landing        | nobody in a unit                           |
| the human-facing docs                                                     | n units editing one doc                     | U6 only                                    |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5.** Separate trees; the bundle pins are fixed in
  K10. Lands as one commit with the regenerated inventory (K13).
- **Wave 2 — R1.** Reviews the wave-1 commit (U1, U2 and U5 land shell subtasks
  and gate configs).
- **Wave 3 — U6.** Docs.
- **Wave 4 — U7.** Gates.

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

| Step                       | Mode | Notes                                                                                                                                                                     |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf and stackgen into the dev marketplace; a restarted session loads them. Publishes nothing. If `.config/vwf.yaml`'s `after_landing:` also lists it, it runs once |

## Gates the orchestrator keeps

- After wave 1: `mise run p:plugins:inventory` before the wave gate, and the
  inventory rides the wave-1 commit (K13). Pass:
  `mise run p:plugins:inventory -- --check` is green and the header counts grew
  by 4 packs and 1 bundle.

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

- Kotlin Multiplatform (K2).
- Maven and Gradle names in `stackgen-reputation` — backlog B60.
- Anything Android: the SDK, AGP, Android Lint, Compose, the emulator, a
  `ux-gate` — plan B.

## Parked

- B57: plan B — the Jetpack Compose Android app stack: an `app-framework` pack,
  the Android library module (AAR), Android Lint, Android SDK and emulator pins,
  Gradle tasks, a `ux-gate` that returns `renders:`, goldens, and a bundle on
  `mobile` and `tablet`.
- B57: plan C — the form factors Wear OS (`watch`), Android TV (`tv`), Android
  Auto (`auto`) and Android XR (`spatial`), the app types Android Studio builds,
  Wear OS detection in setup's topology table
  (`plugins/vwf/skills/setup/references/topology-detection.md:150`), and the
  "Kotlin or Flutter" text
  (`site/src/content/docs/how-to/operate/choosing-your-stack.md:62-63`,
  `bundles/dart-flutter.md`, `bundles/swift-swiftui.md:48-56`, `:94`).
- The Flutter pack runs `mise x kotlin@latest -- kotlin-lsp`
  (`plugins/stackgen/stacks/app-framework/flutter/pack.yaml:48-54`), against the
  rule that `mise x` runs pinned tools only. Fix it in its own change, with a
  Flutter pack bump and a `dart-flutter` bundle repin.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-09-kotlin-language-stack

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
