---
type: vwf-change-plan
title: SwiftUI platform doctrine — per-platform references and Apple core
  integrations
requires: [
  docs/plans/2026-09-23-swiftui-app-stack,
  docs/plans/2026-09-24-swiftui-gap-closure,
]
backlog: [ B56 ]
---

# Plan — SwiftUI platform doctrine — per-platform references and Apple core integrations (2026-09-23)

## Status

**RUNNING**

RUNNING since 2026-09-25 09:50 in
.claude/worktrees/2026-09-23-swiftui-platform-doctrine

## Consent

| Action                                            | Granted                                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                       |
| After landing: `mise run p:plugins:local`         | run                                                                                       |
| Release stackgen publicly                         | minor — 1.31.0 → 1.32.0, by hand in `plugins/stackgen/.claude-plugin/plugin.json`         |
| Release site publicly                             | patch — 1.1.44 → 1.1.45, `mise run p:site:version` (bare, no positional, on a clean tree) |
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
plan of this chain (E17); the user runs `/release` once the chain has landed.
`app-framework/swiftui` moves 0.1.0 → 0.2.0 with its pin in
`bundles/swift-swiftui.md`.

## Goal

After this lands, the SwiftUI pack carries native doctrine for every platform it
covers — one reference each for iOS/iPadOS (`mobile`, `tablet`), macOS
(`desktop`), CarPlay (`auto`), watchOS (`watch`), tvOS (`tv`) and visionOS
(`spatial`) — and topic 12 of the app-framework bar: wiring for widgets and
complications, App Intents, push notifications, StoreKit and Sign in with Apple.
B56 is then done.

Plan **2d**, the last of the four-plan chain for B56 (see plan 2a's Goal), and
the one that carries the backlog id. It requires 2c, which landed the pack, its
router (topics 1–11) and the bundle. Pure doctrine: no runnable code, no build
gate. No reversal.

## Facts the survey established

- **What 2c landed** (read in the tree): `app-framework/swiftui` at 0.1.0 with
  `skills/swiftui/SKILL.md` routing topics 1–11 under `references/`, and one
  sentence promising the platform and integration references; the bundle
  `swift-swiftui.md` pinning `app-framework/swiftui@0.1.0`.
- **Topic 12.** `plugins/stackgen/assets/kinds.md:798-835`: integration wiring,
  one artifact per integration, conditional, **no API surface** — an API listing
  is a reviewer gap (`:1137-1140`). Flutter's
  `skills/flutter/references/integrations/` is the shape model.
- **Interaction contracts.** Plan 1 wrote the `watch`, `tv` and `spatial` rules
  beside `auto`'s in
  `plugins/vwf/skills/blueprint-authoring/references/ui-ux-contract.md` and
  `plugins/vwf/skills/blueprint/references/platforms.md` — the platform files
  here must honour them, and may not cite them by path (rule 13).
- **Rule 13.** A landed skill cites no plugin path; a `../` climb only into a
  sibling skill of its own pack.
- **Formatting.** `plugins/**/*.md` is not dprint-formatted.
- **Versions** (after 2c): stackgen 1.31.0, site 1.1.44.
- **Commit convention.** Types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; no scopes.

## Assumed decisions — confirm or override at review

Ids carried from the retired `2026-09-23-swift-native-stack` folder.

| #   | Decision       | Ruling                                                                                                                                                                                                                                      | Rejected                          | Unit   |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------ |
| E4  | Doctrine depth | One reference per platform (iOS/iPadOS, macOS, CarPlay, watchOS, tvOS, visionOS), and Apple's core integrations — widgets and complications, App Intents, push notifications, StoreKit, Sign in with Apple. Third-party integrations parked | full Flutter parity; the bar only | U1, U2 |
| S4  | Router rows    | The platform and integration rows are added to the router in the same plan as their files, after them                                                                                                                                       | —                                 | U3     |
| S5  | No review row  | 2d lands doctrine only, no runnable code; the wave review is the only check                                                                                                                                                                 | a review row                      | —      |
| S6  | Decision doc   | The chain's one decision doc is written here, covering plans 2a–2d                                                                                                                                                                          | one per plan                      | U4     |
| E17 | Release        | No release step                                                                                                                                                                                                                             | `/release` as `ask`; as `run`     | U5     |
| E18 | Library docs   | Units resolve Apple framework behaviour through Context7 (`resolve-library-id` → `query-docs`) before writing about it — never from training knowledge                                                                                      | —                                 | U1, U2 |

## New dependencies

None.

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                         | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | -------- |
| U1 | 1    | [01-platforms.md](01-platforms.md)           | edit | `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/**`                                                                                                                                                                       | —          | green   | 9946dd70 |
| U2 | 1    | [02-integrations.md](02-integrations.md)     | edit | `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/integrations/**`                                                                                                                                                                    | —          | green   | 6409334f |
| U3 | 2    | [03-router.md](03-router.md)                 | edit | `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/SKILL.md`                                                                                                                                                                                      | U1, U2     | green   | 94ed1248 |
| U4 | 3    | [04-docs.md](04-docs.md)                     | edit | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`, `docs/memory/decisions/2026-09-23-swift-native-stack.md`                                                  | U3         | green   | 10c32b8c |
| U5 | 4    | [05-gates-and-bump.md](05-gates-and-bump.md) | edit | `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`, `plugins/stackgen/stacks/bundles/swift-swiftui.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json` | U4         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                          | Why it collides                                    | Owner |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----- |
| `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`                            | several units bumping one version is a lost update | U5    |
| `app-framework/swiftui/pack.yaml` and its pin in `bundles/swift-swiftui.md`                   | a version and its pin move together                | U5    |
| `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                     | generated                                          | U5    |
| `swiftui/skills/swiftui/SKILL.md`                                                             | links files U1 and U2 write                        | U3    |
| docs — `site/**`, `.claude/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md` | n units editing one doc                            | U4    |

**Fixed filenames** under
`plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/`:
`platforms/ios-ipados.md`, `platforms/macos.md`, `platforms/carplay.md`,
`platforms/watchos.md`, `platforms/tvos.md`, `platforms/visionos.md`;
`integrations/widgets-and-complications.md`, `integrations/app-intents.md`,
`integrations/push-notifications.md`, `integrations/storekit.md`,
`integrations/sign-in-with-apple.md`.

## Waves

- **Wave 1 — U1, U2.** Two new directories, disjoint; one commit each (no pack
  is added, so the inventory is unaffected).
- **Wave 2 — U3**, the router rows, once both sets of files exist.
- **Wave 3 — U4**, docs and the chain's decision doc. **Wave 4 — U5**, versions
  and generators.

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

plus the wave review, plus every report read for `UNRESOLVED:`. Inside wave 4
the freshness lines are red between U5's edits and its regeneration — expected.

## After landing

| Step                       | Mode | Notes                                                                                                                                                           |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed stackgen into the dev marketplace under `X.Y.Z+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |

## Gates the orchestrator keeps

1. **Every router link resolves.** Each relative link in the swiftui router
   names a file that exists, and all eleven fixed filenames are linked. Pass: no
   missing file, none unlinked.
2. **Citations.** A grep of the swiftui pack's `skills/` for the plugin-root
   token, a bare `assets/` path or a path into another pack or plugin is empty.
   Pass: empty.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore`, `git stash` or a
formatter's `--fix` over any path outside its Owns.

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

- **Kotlin / Android native** — B57.
- **Third-party integrations** — parked (E4).
- **OS- and vendor-specific features inside a form factor** — plan 1's P1.
- **Editing the topic files 1–11** — 2c's; a defect found is a `GAP:`.
- **A public release** (E17).

## Parked

Carried from the retired `2026-09-23-swift-native-stack` folder:

- **Reputation for SwiftPM and mise names.** stackgen-reputation supports only
  `npm`/`pypi`/`pub`/`action`/`image`
  (`plugins/stackgen/skills/stackgen-reputation/SKILL.md:49-74`); a `@generated`
  Swift component naming a SwiftPM package or a mise tool comes back
  `UNRESOLVED` and halts generation. Curated packs are unaffected. Extend the
  skill with `spm:` and `mise:` prefixes in a later plan.
- **Third-party swiftui integrations** — the Flutter pack's set (Firebase,
  RevenueCat, maps, WebRTC, image handling …) for SwiftUI, one artifact each.
- **Swift on Linux / server** — a Vapor or Hummingbird bundle on `service`.
- **Plan 1's P1** — OS- and vendor-specific features inside a form factor
  (Dynamic Island, Samsung/OnePlus features, multiple frame sizes).
- **Retrofit `binaries` onto existing packs** — from plan 2a.

## Run log

| Wave | Unit       | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                      | Commit   |
| ---- | ---------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight  | —     | 1     | green       | doctor: no blocking finding (mise, graphify 0.9.65, graph in main checkout; no vwf.yaml stacks); all 9 wave-gate lines pass on develop 942b994a; recall: nothing beyond the plan; no code unit, conventions fetch skipped                                                                                                                   | —        |
| 1    | U1         | opus  | 1     | green       | six platforms/ files; links only to sibling topics + one U2 file via ../ (rule 13 allowed); Context7-checked; no API listings; dropped an unbacked Mac Catalyst sentence. GAP: CarPlay template-depth cap stated without a number (Context7 gave none)                                                                                      |          |
| 1    | U2         | opus  | 1     | green       | five integrations/ files; prose style matching topics 1–11, not Flutter's code blocks; sibling links only; claims Context7 could not confirm cut or softened (App Shortcuts cap, relay sending-domain rule, web flow Services ID)                                                                                                           |          |
| 1    | R1         | opus  | 1     | findings(4) | U1 visionos.md:15 volume not resizable (wrong since visionOS 2); U1 macos.md:57 unbacked iPad Settings sentence; U2 widgets:45 Mac group-id prefix overstated; U2 five anti-pattern tables use unpadded separators unlike topics 1–11. CONTRACT clean, RULINGS clean                                                                        | —        |
| 1    | U1         | opus  | 2     | green       | visionos.md volume resizability corrected (visionOS 2, Context7-confirmed); macos.md iPad Settings sentence kept — Apple's menu-bar page states it verbatim                                                                                                                                                                                 | 9946dd70 |
| 1    | U2         | opus  | 2     | green       | macOS App Group line softened (team-id prefix, provisioned `group.`, or Mac App Store — macOS 15 notes); five anti-pattern tables padded                                                                                                                                                                                                    | 6409334f |
| 1    | R1         | opus  | 2     | pass        | all four round-1 findings hold; nothing regressed; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                            | —        |
| 2    | U3         | opus  | 1     | green       | router: promise sentence replaced by ## Platforms (six rows, vwf token + when to read) and ## Integrations (topic 12) (five rows, wiring only); 22 links resolve, all eleven fixed files linked; topics 1–11 and frontmatter untouched                                                                                                      |          |
| 2    | R2         | opus  | 1     | findings(1) | SKILL.md:40 platforms lead-in sentence does not parse. CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                        | —        |
| 2    | U3         | opus  | 2     | green       | Platforms lead-in rewritten: files keyed by the vwf token they realise (files are named for the platform, not the token)                                                                                                                                                                                                                    | 94ed1248 |
| 2    | R2         | opus  | 2     | pass        | fix holds, nothing regressed; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                 | —        |
| —    | acceptance | —     | —     | skipped     | no covers: — change plan, no acceptance criteria                                                                                                                                                                                                                                                                                            | —        |
| —    | ux         | —     | —     | skipped     | no covers: — change plan, no Screens contract                                                                                                                                                                                                                                                                                               | —        |
| —    | reconcile  | —     | —     | skipped     | no covers: — no stamps or registry; no code unit, nothing to persist                                                                                                                                                                                                                                                                        | —        |
| 3    | U4         | opus  | 1     | green       | site stackgen.md SwiftUI paragraph (platforms + topic 12, replaces come later); stacks/readme.md no-integrations line; decision doc 2a–2d written (S6). docs-sync surveyor found only stackgen.md; hand grep confirmed. GAP: bundles/swift-swiftui.md:94-97 (U5's Owns) lists topics without platforms/integrations — incomplete, not false |          |
| 3    | R3         | opus  | 1     | findings(2) | decision doc :10 links 2d at live path, dead after archive; :90-91 E16 drops rejected alternative package only. CONTRACT clean, RULINGS clean; swift-swiftui.md GAP agreed incomplete-not-false                                                                                                                                             | —        |
| 3    | U4         | opus  | 2     | green       | decision doc 2d link → archived/ path (resolves once the landing archives); E16 rejected list restored                                                                                                                                                                                                                                      | 10c32b8c |
| 3    | R3         | opus  | 2     | pass        | both fixes hold, nothing regressed; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                           | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-23-swiftui-platform-doctrine

or let the queue pick it, by priority:

/vwf:execute next
