---
type: vwf-change-plan
title: Android device features
requires: [
  docs/plans/2026-10-09-os-feature-declarations,
  docs/plans/2026-10-09-android-form-factors,
]
backlog: []
backlog_pieces: [ B58 ]
---

# Plan — Android device features (2026-10-09)

## Status

**APPROVED**

APPROVED 2026-10-09 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| End an `all` run after landing                    | yes     |

## Release levels

| Project  | Level | Reason                                                                                           |
| -------- | ----- | ------------------------------------------------------------------------------------------------ |
| vwf      | MINOR | the flow-platform scope list gains two Android values, and the blueprint reviewer checks them    |
| stackgen | MINOR | the Compose pack gains a device-feature rule behind a capability check, with a declared fallback |
| site     | PATCH | the manual pages describe the new scope values; the site gets no new feature                     |

## Goal

After this plan lands, an Android flow can declare a device-family feature
inside `mobile`. The scope is `android:samsung` or `android:oneplus`. The
Compose pack builds the feature behind a capability check, and the declared
`fallback` applies on any device without the feature. The vendor name is a label
only; the capability decides.

This plan is folder 2 of 2 for backlog item B58. It stands on folder 1
(`2026-10-09-os-feature-declarations`), which defines the `features:` entry and
the `ios` scope, and on `2026-10-09-android-form-factors`, which lands the
Compose pack this plan edits. It lands a piece of B58 and does not finish it:
the vendor worked cases and the canvas frame-size piece remain.

No reversal of a standing decision. Folder 1 parked the Android device families
for this plan, and this plan adds them as the rule only.

## Facts the survey established

- Folder 1 defines the `features:` entry (`name`, `scope`, `fallback`) and the
  iOS scope `ios`. The scope list is defined in the flow-platform template and
  in the flow contract, both edited by folder 1.
- Folder 1's decision 1 reserves the Android scope form `android:<vendor>`. This
  plan names its two values: `android:samsung` and `android:oneplus`.
- The mobile form factor covers iOS and Android
  (`plugins/vwf/assets/standard-flows.md:153-167`).
- The Compose pack and the Kotlin bundles land in the form-factors plan. Their
  paths are `plugins/stackgen/stacks/app-framework/compose/**` and
  `plugins/stackgen/stacks/bundles/kotlin-compose.md`.
- Vendor research, run at plan time:
  - Samsung: the Galaxy Edge SDK page (`https://developer.samsung.com/GlxyEdge`)
    is old. It names widgets and service components, not a current detection
    method. No current Edge Panel SDK capability check was confirmed.
  - OnePlus: no public developer API was found. OnePlus dropped the Alert Slider
    in March 2025
    (`https://www.laopinion.com/2025/03/11/oneplus-confirma-la-eliminacion-del-iconico-alert-slider-en-favor-de-un-nuevo-boton-inteligente`).
- The capability check the rule names is the platform's own feature test. For
  Android that is `PackageManager.hasSystemFeature` where a vendor publishes a
  feature flag; the rule does not claim that any vendor publishes one.
- The commit convention allows `ops`, `docs`, `merge`, `feat`, `fix` and
  `refactor`, with no scopes (`.config/git-conventional-commits.yaml`).

## Assumed decisions — confirm or override at review

| # | Decision              | Ruling                                                                                                                                                           | Rejected                                           | Unit   |
| - | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| 1 | Named scope values    | `android:samsung` and `android:oneplus`, defined in the mobile doctrine. Confirmed by the user.                                                                  | Any vendor string                                  | U1     |
| 2 | Detection             | A capability check. The vendor name is a label only. Confirmed by the user.                                                                                      | A manufacturer check (`Build.MANUFACTURER`)        | U2     |
| 3 | Worked cases          | None. No stable public API was verified for either vendor. The user's rule applied: the pack ships the rule only, and a case waits for verifiable documentation. | A Samsung case from the unverified Galaxy Edge SDK | U2     |
| 4 | Fallback              | Required on every entry. Inherited from folder 1.                                                                                                                | An optional fallback                               | U1, U2 |
| 5 | Blueprint scope check | The reviewer accepts only the values the platform doctrine names for the platform.                                                                               | Accept any `android:` string                       | U1     |
| 6 | Review row            | None. The change is Markdown and doctrine only, with no runnable code.                                                                                           | A `Kind: review` row                               | —      |
| 7 | Pack bump             | The Compose pack bumps MINOR, with its pins and the generated inventory updated.                                                                                 | PATCH                                              | U4     |
| 8 | Decision record       | The docs unit writes `docs/memory/decisions/2026-10-09-android-device-features.md`.                                                                              | No record                                          | U3     |

## New dependencies

None. No unit adds a package.

## Units

| Id | Wave | Unit file                                      | Kind | Owns                                                                                                                                                                                      | Depends on | Status  | Commit |
| -- | ---- | ---------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-blueprint-scope.md](01-blueprint-scope.md) | edit | `plugins/vwf/assets/templates/flow-platform.md`, `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`, `plugins/vwf/agents/blueprint-reviewer.md`                         | —          | pending |        |
| U2 | 1    | [02-compose-rule.md](02-compose-rule.md)       | edit | `plugins/stackgen/stacks/app-framework/compose/**`                                                                                                                                        | —          | pending |        |
| U3 | 2    | [03-docs.md](03-docs.md)                       | edit | `site/src/content/docs/plugins/vwf.md`, `site/src/content/docs/plugins/stackgen.md`, `docs/memory/decisions/2026-10-09-android-device-features.md`                                        | U1, U2     | pending |        |
| U4 | 3    | [04-gates.md](04-gates.md)                     | edit | `plugins/stackgen/stacks/app-framework/compose/pack.yaml`, `plugins/stackgen/stacks/bundles/kotlin-compose.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json` | U2, U3     | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Kind is `edit` on every unit.

## Shared-file rule

| File                                                            | Why it collides                                            | Owner           |
| --------------------------------------------------------------- | ---------------------------------------------------------- | --------------- |
| `plugins/stackgen/stacks/inventory.md`                          | generated; regenerating mid-wave races                     | gates unit only |
| `.claude-plugin/marketplace.json`                               | generated                                                  | gates unit only |
| `plugins/stackgen/stacks/app-framework/compose/pack.yaml`       | version bump                                               | gates unit only |
| `plugins/stackgen/stacks/bundles/kotlin-compose.md`             | pin bump                                                   | gates unit only |
| `site/src/content/docs/plugins/vwf.md`, `…/plugins/stackgen.md` | human-facing docs; several units could describe the change | docs unit only  |
| `docs/memory/decisions/2026-10-09-android-device-features.md`   | decision record                                            | docs unit only  |

## Waves

- Wave 1: U1 and U2. Their owned paths are disjoint. U1 edits the vwf plugin and
  U2 the stack pack.
- Wave 2: U3 (docs). It runs after the rule and the scope values exist.
- Wave 3: U4 (gates). It bumps the pack, regenerates the inventory and runs the
  full gate.

## Wave gate

- `mise run p:plugins:check`
- `mise run p:plugins:marketplace -- --check`
- `mise run p:site:check`

The inventory check runs only in U4, because it fails until the pack bump lands.

## After landing

| Step                       | Mode | Notes                                                                                                                  |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed plugins into the dev marketplace and updates this machine's install; a restarted session loads them |

## Gates the orchestrator keeps

None beyond the wave gate. A staged plugin loads only in a restarted session,
and no run can check that.

## Unit contract

Every unit prompt carries its ruling quoted from this file, its owned paths and
"touch nothing outside this list", the facts section, the shared-file rule and
the return block. A unit never bumps a plugin version, never runs a generator,
never edits a doc outside its own Owns, never adds a dependency, and never
commits. A unit deletes with plain `rm`, never `git rm`.

## Out of scope

- The vendor worked cases (Samsung, OnePlus) — parked until documentation can be
  verified.
- Canvas frame sizes per platform — parked; no folder yet.
- Android XR (`spatial`) — out of scope for B57 and therefore for this item.
- Any vendor token.
- Any manufacturer check in the generated code.

## Parked

- B58: vendor worked cases (Samsung, OnePlus) — no stable public API verified at
  plan time; a case is added when documentation can be verified.
- B58: canvas frame sizes per platform — no folder yet.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-09-android-device-features

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
