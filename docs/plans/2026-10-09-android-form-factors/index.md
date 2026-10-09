---
type: vwf-change-plan
title: Android form factors
requires: [ docs/plans/2026-10-09-android-compose-stack ]
backlog: [ B57 ]
backlog_pieces: []
---

# Plan — Android form factors (2026-10-09)

## Status

**RUNNING**

RUNNING since 2026-10-09 21:03 in .worktrees/2026-10-09-android-form-factors

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

| Project  | Level | Reason                                                                   |
| -------- | ----- | ------------------------------------------------------------------------ |
| stackgen | MINOR | new behaviour: the Android stack covers `watch`, `tv` and `auto`         |
| vwf      | MINOR | new behaviour: setup detects Wear OS, Android TV and Android Auto        |
| site     | PATCH | the manual pages describe the new coverage; the site gets no new feature |

## Goal

The `kotlin-compose` bundle covers `mobile`, `tablet`, `watch`, `tv` and `auto`,
and the Android packs document the other app and module types Android Studio
builds. vwf setup detects Wear OS, Android TV and Android Auto. The docs say
when to pick Kotlin Compose, Flutter or SwiftUI. No reversal of a standing
decision.

This plan is plan C of 3 for backlog item B57, and it finishes the item. It
stands on plan A (`2026-10-09-kotlin-language-stack`) and plan B
(`2026-10-09-android-compose-stack`: `framework/android@0.1.0`,
`app-framework/compose@0.1.0`, bundles `kotlin-compose` on `mobile` and `tablet`
and `android-library` on `packages`). Android XR is out of scope by the user's
choice.

## Facts the survey established

- The pattern for per-platform doctrine:
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/{ios-ipados,macos,carplay,watchos,tvos,visionos}.md`,
  and the bundle `plugins/stackgen/stacks/bundles/swift-swiftui.md` holding
  every platform (the OS-to-token table at `:31-39`, "when to pick it over
  Flutter" at `:48-56`, "No Android" at `:94`).
- Platform tokens (`plugins/vwf/assets/templates/registry.yaml:29-38`) and the
  device table (`plugins/vwf/assets/standard-flows.md:150-196`): `auto` =
  CarPlay and Android Auto, `watch` = watchOS and Wear OS, `tv` = tvOS and
  Android TV, `spatial` = visionOS, Android XR and Quest. `auto` is only ever
  declared with `mobile`. No vendor token, by design (`:189-196`).
- The covering rule: a bundle's `platforms:` must cover every platform the
  project declares (`plugins/vwf/assets/stack-adapter.md:210-220`). The goldens
  harness is required for a device platform
  (`plugins/vwf/assets/harness.md:20`).
- The `ux-gate` contract: `rendered: ok|n/a` plus findings
  (`plugins/vwf/assets/stack-adapter.md:418-463`) and the `renders:` list (the
  TypeScript `ux-gate`'s shape).
- vwf setup's platform detection:
  `plugins/vwf/skills/setup/references/topology-detection.md:150-152` — the
  `watch`, `tv` and `spatial` rows detect via an Xcode target SDK or an
  AndroidManifest feature (`android.software.leanback`, the XR feature); `watch`
  (`:150`) names only Xcode/watchOS.
- Docs with the Flutter-only Android guidance:
  `site/src/content/docs/how-to/operate/choosing-your-stack.md:46-66` ("pick
  Flutter when it must also ship on Android" at `:62-63`),
  `plugins/stackgen/stacks/bundles/dart-flutter.md:16-35`,
  `plugins/stackgen/stacks/bundles/swift-swiftui.md:48-56`, `:94`, and
  `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/pick-and-trade.md`
  if it exists.
- The version and pin rule: every bundle ref must match the pack's `version`;
  bumping a pack re-pins every bundle that names it, and the inventory is
  regenerated in the same commit
  (`plugins/stackgen/assets/pack-format.md:440-447`,
  `scripts/src/inventory.ts`).
- Commit types allowed: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`, no
  scopes.

## Assumed decisions — confirm or override at review

| #  | Decision       | Ruling                                                                                                                                                                                                                                                                                                 | Rejected                        | Unit  |
| -- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ----- |
| F1 | Form factors   | `kotlin-compose` gets `watch` (Wear OS), `tv` (Android TV / Google TV) and `auto` (Android Auto / Automotive OS). `spatial` (Android XR) is out of scope, and B57 finishes without it                                                                                                                  | add XR; park XR as a piece      | U1–U3 |
| F2 | Compose refs   | `app-framework/compose` gets `platforms/{wear-os,android-tv,android-auto}.md` (Compose for Wear OS with tiles and complications, Compose for TV with D-pad focus, the Car App Library templates) and a Glance widgets reference. Version `0.1.0` → `0.2.0`                                             | —                               | U1    |
| F3 | Auto renders   | The `ux-gate` returns `rendered: n/a` for `auto` screens, with a finding that gives the reason: Roborazzi cannot render Car App Library templates                                                                                                                                                      | render `auto` screens           | U1    |
| F4 | Android refs   | `framework/android` gets references for Baseline Profiles with Macrobenchmark, dynamic feature modules, instant apps (only if Context7 confirms that Google Play Instant is still supported, else a note that it is retired), and the manifest features of each form factor. Version `0.1.0` → `0.2.0` | —                               | U2    |
| F5 | One bundle     | One bundle holds all the platforms, as `swift-swiftui` does. `kotlin-compose` repins to `framework/android@0.2.0` and `app-framework/compose@0.2.0`. `android-library` repins to `framework/android@0.2.0`                                                                                             | one bundle for each form factor | U3    |
| F6 | Trade-off text | The trade-off text in `dart-flutter.md` and `swift-swiftui.md` (`:48-56`, `:94` "No Android") names the Kotlin Compose stack                                                                                                                                                                           | —                               | U3    |
| F7 | Detection      | vwf `topology-detection.md`: the `watch` row also detects `android.hardware.type.watch`. The `tv` row detects `android.software.leanback`, and the `auto` row detects the car-app metadata                                                                                                             | no vwf change                   | U4    |
| F8 | One commit     | Wave 1 lands as one commit with the regenerated inventory: the orchestrator runs `mise run p:plugins:inventory` after wave 1 returns and before its wave gate, and commits the inventory with the wave                                                                                                 | one commit per unit             | —     |
| F9 | Review         | No review row: plan C changes only prose (references, a skill, bundles, a detection table) and adds no script                                                                                                                                                                                          | a review row                    | —     |

## New dependencies

None in this repo. The packs teach target repos to use: Compose for Wear OS
(wear-compose Material 3), the Wear Tiles API, Compose for TV (`androidx.tv`),
the Car App Library, Jetpack Glance, Baseline Profiles with Macrobenchmark, and
Play Feature Delivery. The user consented to each at the approval gate on
2026-10-09.

## Units

| Id | Wave | Unit file                          | Kind | Owns                                                                                                                                                                                                                                                                                                                  | Depends on     | Status  | Commit   |
| -- | ---- | ---------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| U1 | 1    | [01-compose.md](01-compose.md)     | edit | `plugins/stackgen/stacks/app-framework/compose/**`                                                                                                                                                                                                                                                                    | —              | green   | 1aa3a2f0 |
| U2 | 1    | [02-android.md](02-android.md)     | edit | `plugins/stackgen/stacks/framework/android/**`                                                                                                                                                                                                                                                                        | —              | green   | 1aa3a2f0 |
| U3 | 1    | [03-bundles.md](03-bundles.md)     | edit | `plugins/stackgen/stacks/bundles/kotlin-compose.md`, `plugins/stackgen/stacks/bundles/android-library.md`, `plugins/stackgen/stacks/bundles/dart-flutter.md`, `plugins/stackgen/stacks/bundles/swift-swiftui.md`                                                                                                      | —              | green   | 1aa3a2f0 |
| U4 | 1    | [04-detection.md](04-detection.md) | edit | `plugins/vwf/skills/setup/references/topology-detection.md`                                                                                                                                                                                                                                                           | —              | green   | 1aa3a2f0 |
| U5 | 2    | [05-docs.md](05-docs.md)           | edit | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`, `CLAUDE.md`, `readme.md`, `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/pick-and-trade.md`, and any other human-facing passage `vwf:docs-sync` finds | U1, U2, U3, U4 | pending |          |
| U6 | 3    | [06-gates.md](06-gates.md)         | edit | `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                | U5             | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                      | Why it collides                             | Owner                                     |
| ------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| `plugins/stackgen/stacks/inventory.md`                                    | generated from every pack and bundle        | the orchestrator in wave 1 (F8), U6 after |
| `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | version files and a generated file; no bump | nobody — never                            |
| `.config/releases.yaml`                                                   | written by `/vwf:execute` at landing        | nobody in a unit                          |
| the human-facing docs                                                     | n units editing one doc                     | U5 only                                   |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Separate files; the new pack versions and the
  bundle pins are fixed in F2, F4 and F5. Lands as one commit with the
  regenerated inventory (F8).
- **Wave 2 — U5.** Docs.
- **Wave 3 — U6.** Gates.

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
  inventory rides the wave-1 commit (F8). Pass:
  `mise run p:plugins:inventory -- --check` is green.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a plugin version, never
runs a generator, never edits a doc outside its Owns, never adds a dependency
this file does not list, never commits. A pack version named in F2 or F4 is the
pack's own `pack.yaml` field, which its unit sets. A unit deletes with plain
`rm`, never `git rm` — it stages nothing. Before writing about an external
library, a unit reads its current docs through Context7 (`resolve-library-id`,
then `query-docs`).

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Android XR (`spatial`). The user declined it on 2026-10-09: Jetpack XR still
  moves fast. A later backlog item can add it; B57 finishes without it.
- Views/XML UI and Kotlin Multiplatform (plans A and B).

## Parked

none

## Run log

| Wave | Unit       | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Commit   |
| ---- | ---------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight  | —     | 1     | green       | doctor blocking checks: mise and graphify CLI present, graph reachable from the main checkout; no blocking finding; all 7 Wave gate lines green on the branch base 44b8b6cd; format check skipped (no covers:); stack conventions skipped (edit units only); order: W1 U1,U2,U3,U4 → inventory (F8) → W2 U5 → W3 U6                                                                                                                                                                               |          |
| 0    | override   | —     | 1     | green       | override: skip as deduped: mise run p:plugins:local                                                                                                                                                                                                                                                                                                                                                                                                                                               |          |
| 1    | U3         | opus  | 1     | green       | kotlin-compose.md: platforms mobile, tablet, watch, tv, auto; pins android@0.2.0 + compose@0.2.0; token-to-form-factor table; auto only with mobile; no XR. android-library.md pins android@0.2.0. dart-flutter.md new 'When to pick it over the native stacks'; swift-swiftui.md pick section + 'No Android' name Kotlin Compose. DECIDED auto = Car App Library templates (matches F3). inventory --check red pending bumps (expected, F8)                                                      |          |
| 1    | U4         | opus  | 1     | green       | topology-detection.md: watch row adds android.hardware.type.watch; auto row adds Car App Library metadata (minCarApiLevel / CarAppService) or android.hardware.type.automotive; tv row already named leanback, unchanged. DECIDED kept com.google.android.wearable. GAP: ran pre-commit on its own file only (not code:precommit) to avoid --fix on other units' files; lint reported modification during concurrent writes, diff intact                                                          |          |
| 1    | U2         | opus  | 1     | green       | android 0.2.0: new refs baseline-profiles, dynamic-features, instant-apps (retired note — Context7: Play Instant ends Dec 2025), form-factors (uses-feature per form factor + managed-device table); router lists 4 refs. DECIDED device profile kinds over exact names (unconfirmed); SKILL.md version left. GAP: Android Auto has no managed-device emulator — E2E is the phone module's plus Car App Library testing + DHU by hand                                                             |          |
| 1    | U1         | opus  | 1     | green       | compose 0.2.0: platforms/wear-os.md, android-tv.md, android-auto.md (Car App Library, no goldens), glance-widgets.md; compose SKILL.md router; ux-gate watch/tv rows, auto a low finding and n/a when all auto (F3); conventions, testing, pick-and-trade gain watch/tv. DECIDED edited conventions/testing/pick-and-trade so they do not contradict ux-gate (in Owns); skill versions left. GAP: Roborazzi WearOSLargeRound/Television1080p device constants recalled, not confirmed by Context7 |          |
| 1    | R1-wave    | opus  | 1     | findings(7) | U1 android-auto.md:72 ~87-col line (fold) → loop-back; U1 WearOSLargeRound/Television1080p qualifiers unconfirmed → loop-back to verify; 5 rule-5 findings all inside U5 Owns, handed to U5 as DOCS FALSIFIED: site stackgen.md:385, :413-417; choosing-your-stack.md:62-63,68-69; stacks/readme.md:100-101,137; flutter pick-and-trade.md (F6 parity); CONTRACT clean; RULINGS clean                                                                                                             |          |
| 1    | U1         | opus  | 2     | green       | R1-wave fix: android-auto.md:72 re-folded to 80 cols; WearOSLargeRound and Television1080p confirmed in Roborazzi RobolectricDeviceQualifiers.kt (main) — names kept, U1 round-1 GAP closed                                                                                                                                                                                                                                                                                                       |          |
| 1    | R1-wave    | opus  | 2     | pass        | both U1 findings resolved (fold; Roborazzi names confirmed at source); no new >80-col prose; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                        |          |
| 1    | gate       | —     | 1     | green       | inventory regenerated (F8; compose and android 0.2.0, pins match); all 7 Wave gate lines green (code:precommit after one formatter pass on the run log); U1–U4 commit together per F8                                                                                                                                                                                                                                                                                                             | 1aa3a2f0 |
| —    | acceptance | —     | —     | skipped     | why: no covers: — a change plan has no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                                        |          |
| —    | ux         | —     | —     | skipped     | why: no covers: — no Screens contract to verify against                                                                                                                                                                                                                                                                                                                                                                                                                                           |          |
| —    | renders    | —     | —     | skipped     | why: the ux stage did not run, so no RENDER: lines                                                                                                                                                                                                                                                                                                                                                                                                                                                |          |
| —    | reconcile  | —     | —     | skipped     | why: no covers: — no stamps, registry or environment to reconcile; no code unit, so nothing to persist                                                                                                                                                                                                                                                                                                                                                                                            |          |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-09-android-form-factors

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
