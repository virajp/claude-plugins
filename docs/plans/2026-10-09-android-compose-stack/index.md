---
type: vwf-change-plan
title: Android Compose stack
requires: [ docs/plans/2026-10-09-kotlin-language-stack ]
backlog: []
backlog_pieces: [ B57 ]
---

# Plan — Android Compose stack (2026-10-09)

## Status

**RUNNING**

RUNNING since 2026-10-09T18:37 in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-10-09-android-compose-stack

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

| Id | Wave | Unit file                          | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-android.md](01-android.md)     | edit   | `plugins/stackgen/stacks/framework/android/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —          | green   | aea0e8f9 |
| U2 | 1    | [02-compose.md](02-compose.md)     | edit   | `plugins/stackgen/stacks/app-framework/compose/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —          | green   | aea0e8f9 |
| U3 | 1    | [03-bundles.md](03-bundles.md)     | edit   | `plugins/stackgen/stacks/bundles/kotlin-compose.md`, `plugins/stackgen/stacks/bundles/android-library.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —          | green   | aea0e8f9 |
| U4 | 1    | [04-supersets.md](04-supersets.md) | edit   | `plugins/stackgen/skills/tool-config/assets/.gitignore`, `plugins/stackgen/skills/tool-config/assets/.graphifyignore`, `plugins/stackgen/skills/tool-config/assets/.config/dprint.json`, `plugins/stackgen/skills/tool-config/assets/.config/gitleaks.toml`, `plugins/stackgen/skills/tool-config/assets/.config/taplo.toml`, `plugins/stackgen/skills/tool-config/assets/.config/linter.yaml`, `plugins/stackgen/skills/tool-config/assets/.config/pre-commit-config.yaml`, `plugins/stackgen/skills/tool-config/references/dprint.md`, `plugins/stackgen/skills/tool-config/references/pre-commit.md` | —          | green   | aea0e8f9 |
| R1 | 2    | [05-review.md](05-review.md)       | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | U1, U2, U4 | green   |          |
| U5 | 3    | [06-docs.md](06-docs.md)           | edit   | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `CLAUDE.md`, `readme.md`, `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/assets/pack-format.md`, and any other human-facing passage `vwf:docs-sync` finds                                                                                                                                                                                                                                                                                                                                                                      | R1         | pending |          |
| U6 | 4    | [07-gates.md](07-gates.md)         | edit   | `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | U5         | pending |          |

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

## Gaps surfaced during execution

- G1 (U1, non-blocking): the cmdline-tools pin in
  `framework/android/templates/.config/mise/conf.d/android/mise.toml` is an
  exact build number, not `latest` as `pack-format.md` asks, because
  tool-config's `isExact`/`pinExact` accept only `X.Y.Z` and an `http:` tool has
  no version list before its file exists; `tool-config upgrade` will never move
  it. The fix belongs in tool-config (teach it integer build ids), outside this
  plan.
- G2 (U1, non-blocking): the taxonomy has no build-framework category;
  `framework/android` uses `meta-framework`, and its harness capability
  `e2e_local` → `test:e2e` is used by no other pack yet.
- G3 (U2, non-blocking): the `app-framework` four-part ownership test in
  `kinds.md` does not hold for Compose (Gradle and AGP own the manifest and the
  build); the type is kept with the reason stated in `conventions.md`.
- G4 (U2, non-blocking): ruling C4 says E2E runs through `connectedCheck`, but
  Gradle Managed Devices run through their own device tasks; the packs ship
  `test:e2e` on the managed device `e2e` (`e2eDebugAndroidTest`) and keep
  `connectedCheck` behind `--connected` for an attached device.
- G5 (R1/gap/1, non-blocking): U4 Edit 2 ("add only what rule 15 needs")
  conflicts with tool-config's rule that the gitleaks allowlist and the
  `linter.yaml` ignores hold every stack's generated folders; the plan never
  said whether a new stack's folders join those lists outside rule 15.

- G6 (U4, non-blocking): `captures/` stays unanchored in the universal
  `.gitignore` and the three formatter lists, as ruling C8 wrote it — Android
  Studio writes it at the Gradle project root, which in a monorepo can sit at
  any depth — so a `captures/` source folder in any repo tool-config shapes is
  ignored and skipped by the formatters. Narrowing it needs a new ruling.
- G7 (U1, non-blocking): from API 37.1 Google appears to publish `google_apis`
  system images only as `_ps16k` variants; `EMULATOR_IMAGE` must name an id that
  exists.

- G8 (R1, oscillation — convergence guard, non-blocking): the review loop
  stopped after round 2 because the covered finding count did not decrease (8 →
  8; each round's engine pass surfaced new findings rather than the old ones
  resurfacing). Contested, rounds 1–2: U2 `compose/conventions.md:44`
  (Robolectric NATIVE renders differ macOS/Linux — record goldens on the CI OS
  or set a threshold); U1 `references/build-configuration.md:54` (staging/prod
  flavors vs compose `build-and-variants.md`); U1
  `references/build-configuration.md:47` (convention-plugin SDK levels vs the
  literal-grep detects); U1 `code/lint/android:32` (trigger misses `lint.xml`,
  `lint-baseline.xml`); U1 `references/emulator-and-managed-devices.md:32` (raw
  `EMULATOR_IMAGE` vs the `<level>.0` rewrite); U1 `test/e2e:25` (`--connected`
  ignores `--variant`/`--device`); U1 `code/lint/android:51` (full multi-module
  lint per commit); U4 `references/pre-commit.md:71` (one 120-character line).
  Reconciliation looks at the loop first, not the plan.
- G9 (R1/gap/2, non-blocking): ruling C2 and U1 Edit 3 still name build-tools,
  which U1 dropped on R1's advice (AGP fetches its own build-tools).

## Run log

| Wave | Unit      | Model | Round | Outcome      | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Commit   |
| ---- | --------- | ----- | ----- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 0    | preflight | —     | 1     | green        | doctor: no blocking finding (no registry; no config_format stamp; graphify hook post-commit only); all 7 Wave gate lines green on the branch base; format check skipped (no covers:); stack conventions skipped (edit units only); order: W1 U1,U2,U3,U4 → W2 R1 → W3 U5 → W4 U6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |          |
| 0    | override  | —     | 1     | green        | override: skip as deduped: mise run p:plugins:local                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |          |
| 1    | U3        | opus  | 1     | green        | kotlin-compose.md + android-library.md, C6 pins at 0.1.0; DECIDED display names "Kotlin · Compose", "Android · library"; GAP: bodies name setup:deps:install:android, code:lint:android, test:golden and COMPILE_SDK/MIN_SDK/TARGET_SDK/EMULATOR_IMAGE per C2/C4/C5 — re-check against U1/U2; DOCS FALSIFIED: bundles/kotlin-library.md "not yet covered by a shipped bundle" (nobody-owned)                                                                                                                                                                                                                                                                                                                                                                                                           |          |
| 1    | U4        | opus  | 1     | green        | Android section in .gitignore; .cxx/.externalNativeBuild/captures added to dprint.json, taplo.toml, pre-commit-config.yaml and references/dprint.md; DECIDED gitleaks/linter/.graphifyignore/references/pre-commit.md unchanged (rule 15 needs only the formatter three); GAP: whether scanner and linter skip Android dirs unspecified — assumed not                                                                                                                                                                                                                                                                                                                                                                                                                                                  |          |
| 1    | U2        | opus  | 1     | green        | compose 0.1.0 (app-framework, native-ui): pack.yaml, test/golden (Roborazzi), conventions.md, compose skill (13 topics, phone-and-tablet, 7 integrations), ux-gate (rendered/renders/findings); DECIDED no lsp_servers (from language/kotlin); goldens at src/test/screenshots/<platform>/<code>--<state>.png; GAP: kinds.md ownership test fails for Compose (Gradle/AGP own build) — type kept, reason in conventions.md; GAP: C4 connectedCheck vs Gradle Managed Device tasks — testing.md names both, device task left to framework/android                                                                                                                                                                                                                                                       |          |
| 1    | U1        | opus  | 1     | failed       | agent hung ~30 min in a Bash mise probe (no return, could not be stopped); re-dispatched once with a no-install guard                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |          |
| 1    | U1        | opus  | 1     | green        | re-dispatch: android 0.1.0 pack.yaml (4 values), conf.d/android/mise.toml via mise http: backend (cmdline-tools pinned 13114758), tasks setup:deps:install:android, code:lint:android, test:e2e (GMD group e2e), conventions, android skill + 9 refs; DECIDED http: backend (registry has only vfox android-sdk, rejected by C2); EMULATOR_IMAGE without ABI, task appends host ABI; GAP: no build-framework taxonomy category — used meta-framework; harness e2e_local→test:e2e new; GAP: exact pin departs from pack-format "write latest"                                                                                                                                                                                                                                                           |          |
| 1    | R1-wave   | opus  | 1     | findings(4)  | U3 kotlin-compose.md:61 + android-library.md:46 say GMD runs via connectedCheck (U1 ships e2eGroupDebugAndroidTest); U1 conf.d/android/mise.toml:9 exact pin 13114758 vs pack-format "write latest"; U2 conventions.md:5 + U1 SKILL.md:42 prose over 80-col fold; CONTRACT clean; RULINGS clean; nobody-owned bundles/kotlin-library.md falsified → U5                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 1    | U3        | opus  | 2     | green        | R1-wave fix: both bundles now say test:e2e runs e2eGroupDebugAndroidTest (GMD group e2e); connectedCheck targets an attached device                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |          |
| 1    | U1        | opus  | 2     | green        | R1-wave fix: SKILL.md + lint.md prose refolded to 80 cols; GAP: exact pin 13114758 kept — tool-config pinExact (render.mjs:213) runs mise latest on a CI-loaded mise.toml and an http: tool has no version list before the file exists, so latest refuses the render; fix belongs in tool-config                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |          |
| 1    | U2        | opus  | 2     | green        | R1-wave fix: conventions.md and 9 reference files refolded to 80 cols (chars, not bytes); no code span split                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |          |
| 1    | U1        | opus  | 1     | green        | the first U1 agent (thought hung) returned at 19:27 after the re-dispatch and its fix round, rewriting framework/android over them: pin now 16111833 (integer builds cannot resolve latest), ANDROID_HOME ~/.local/share/android/sdk, GMD device e2e (${device}${Variant}AndroidTest), refs build-configuration, manifest, lint, r8, emulator-and-managed-devices, library-modules, ui-tests; rm-d the retry-s 5 orphan refs. This tree is U1-s state of record                                                                                                                                                                                                                                                                                                                                        |          |
| 1    | R1-wave   | opus  | 2     | findings(2)  | U3 kotlin-compose.md:63 + android-library.md:48 name e2eGroupDebugAndroidTest but U1 now runs e2eDebugAndroidTest (one device, no group); pin reason holds (isExact needs X.Y.Z); U1 tree changed mid-review; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 1    | U3        | opus  | 3     | green        | R1-wave r2 fix: both bundles name e2eDebugAndroidTest on the single managed device e2e, --connected runs connectedCheck, ANDROID_HOME ~/.local/share/android/sdk; android-library lists all four values                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |          |
| 1    | U1        | opus  | 3     | green        | consistency check after the race: no edit needed — prose ≤80 cols, router names the 7 refs, pack.yaml/conventions/template/tasks agree; Edits 1–4 landed; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |          |
| 1    | R1-wave   | —     | —     | pass         | loop ended at the two-round cap; the round-2 findings were fixed by the U3 loop-back above, not re-reviewed (cap)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |          |
| 1    | gate      | —     | 1     | green        | inventory regenerated (74 packs, 67 bundles: +2/+2, C9); all 7 Wave gate lines green; U1–U4 committed together per C9                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | aea0e8f9 |
| 2    | R1        | opus  | 1     | findings(9)  | review node, b65209c2..d30f576c, 48 files mapped by Owns (C9 single commit aea0e8f9); engine: 10 code-review findings kept (all in range), security engine clean; U1 install/android:48 build-tools id guess; U1 mise.toml:17 no linux-arm64; U1 ui-tests.md:48 test:e2e --connected without --; U1 lint/android:32,45 full lintFix per commit; U2 test/golden variant casing; U4 gitleaks.toml/linter.yaml lack .cxx/.externalNativeBuild (out of range, mapped to U4 as cause); U4 .gitignore:100 captures/ unanchored (C8 literal); 2 findings on uncovered units dropped (U3 bundles --connected); GAP R1/gap/1: U4 Edit 2 vs tool-config rule that gitleaks/linter lists hold every stack generated folder; API COMPAT n/a; VERDICT approve                                                       |          |
| 2    | R1        | opus  | 1     | findings(1)  | security node, b65209c2..d30f576c; [low] U1 conf.d/android/mise.toml:12 cmdline-tools zip pinned with no per-platform checksum, shipped mise.toml sets lockfile=false — cap-exempt, must be fixed; VERDICT approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |          |
| 2    | U1        | opus  | 2     | green        | R1 r1 fix: sha256 per platform + linux-arm64 on cmdline-tools; build-tools dropped from install; COMPILE_SDK forms 36, 36.1, 37.0 (bare ≥37 → .0); lint hook path narrowed to Android sources, lintFix only on whole-repo --fix; ui-tests -- --connected; GAP: from 37.1 google_apis images seem published only as _ps16k — EMULATOR_IMAGE must name an existing id; DOCS FALSIFIED bundles --connected → U5                                                                                                                                                                                                                                                                                                                                                                                           | 41afb6b5 |
| 2    | U2        | opus  | 2     | green        | R1 r1 fix: test:golden --variant lowercase default debug, capitalised like test:e2e; ux-gate reads test<Variant>UnitTest; conventions row updated                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 59138649 |
| 2    | U4        | opus  | 2     | green        | R1 r1 fix: .cxx/.externalNativeBuild added to gitleaks allowlist (still a subset) and linter.yaml ignores; references/pre-commit.md names them; DECIDED captures/ kept out of gitleaks/linter; GAP G6: captures/ stays unanchored per C8 (Gradle root at any depth) — a captures/ source folder in any shaped repo is ignored; DOCS FALSIFIED tool-config references/gitleaks.md:48-50 → U5                                                                                                                                                                                                                                                                                                                                                                                                            | 9bbf1e0d |
| 2    | R1        | opus  | 2     | findings(10) | review node, b65209c2..9bbf1e0d; engine 10 kept; U2 compose conventions.md:44 NATIVE render not identical macOS/Linux; U1 build-configuration.md:54 staging/prod flavors vs compose build-and-variants.md; U1 build-configuration.md:47 convention-plugin SDK levels vs literal detects; U1 lint/android:32 trigger misses lint.xml/lint-baseline.xml; U1 emulator-and-managed-devices.md:32 raw EMULATOR_IMAGE vs <level>.0; U1 test/e2e:25 --connected ignores --variant/--device; U1 lint/android:51 full lint per commit; U4 references/pre-commit.md:71 120-char line; 1 finding on uncovered unit U3 dropped (bundles build-tools + --connected, handed to U5 as DOCS FALSIFIED); gitleaks.md:48 (unmapped) handed to U5; GAP R1/gap/2: C2 and U1 Edit 3 still name build-tools; VERDICT approve |          |
| 2    | R1        | opus  | 2     | pass         | security node, b65209c2..9bbf1e0d; no findings — the round-1 checksum fix holds; VERDICT approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |          |
| 2    | R1        | —     | —     | green        | convergence guard: covered findings 8 → 8 (did not strictly decrease) — loop stopped after round 2; the 8 open review findings recorded contested (oscillation gap G8, the loop did not settle — the engine surfaced new findings each round); security clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |          |
| 2    | R2-wave   | opus  | 1     | findings(2)  | U4 references/pre-commit.md:71 120-char line (tree trap) → loop-back; site/src/content/docs/plugins/stackgen.md:777-779 Linter ignores list lacks .cxx/.externalNativeBuild → handed to U5 (its Owns) as DOCS FALSIFIED; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 2    | U4        | opus  | 3     | green        | R2-wave fix: references/pre-commit.md ignores paragraph re-folded to ≤80 cols, words unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 67f4eec8 |
| 2    | R2-wave   | opus  | 2     | pass         | U4 fold fix complete; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |          |
| 2    | gate      | —     | 1     | green        | all 7 Wave gate lines green after R1 and R2-wave                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |          |
| 2    | R1        | opus  | 1     | pass         | review node, re-run 1 (R1-late1), 9bbf1e0d..67f4eec8, 1 file (U4); engine no findings; VERDICT approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 2    | R1        | opus  | 1     | pass         | security node, re-run 1 (R1-late1), 9bbf1e0d..67f4eec8; engine clean; VERDICT approve                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |          |
| 2    | R2-late   | —     | —     | skipped      | why: the re-run produced no fix commits; the U4 fold fix itself was passed by R2-wave round 2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |          |
| 2    | gate      | —     | 2     | green        | all 7 Wave gate lines green over the tree of 67f4eec8 (run on the identical uncommitted tree just before the commit)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |          |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-09-android-compose-stack

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
