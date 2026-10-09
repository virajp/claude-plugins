---
type: vwf-change-plan
title: OS feature declarations
requires: []
backlog: []
backlog_pieces: [ B58 ]
---

# Plan — OS feature declarations (2026-10-09)

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

| Project  | Level | Reason                                                                                                  |
| -------- | ----- | ------------------------------------------------------------------------------------------------------- |
| vwf      | MINOR | new behaviour: a flow platform declares OS-specific features, and the blueprint reviewer checks them    |
| stackgen | MINOR | new behaviour: the SwiftUI pack builds a declared feature behind an availability guard, with a fallback |
| site     | PATCH | the manual pages describe the new declaration; the site gets no new feature                             |

## Goal

After this plan lands, a flow can declare one OS-specific feature inside one
form-factor platform. The declaration names the feature, the OS it applies to
and the fallback the other OS shows. The SwiftUI pack builds the feature behind
an availability guard, and the blueprint reviewer returns a gap when a
declaration has no fallback.

This plan is folder 1 of 2 for backlog item B58. It lands the blueprint rules
and the iOS side. Folder 2 (`2026-10-09-android-device-features`) adds the
Android device families. Neither folder finishes B58: the canvas frame-size
piece has no folder yet.

**Reversal, confirmed by the user on 2026-10-09:** the standing rule in
`plugins/vwf/assets/templates/flow-platform.md` (lines 123-137) and
`plugins/vwf/assets/standard-flows.md` (lines 190-196) keeps OS and vendor
differences as free prose in Platform deviations. This plan makes an OS-specific
feature a structured `features:` entry. No vendor token is added, so the
form-factors-not-vendors rule still holds.

## Slice

No dependency chain. This is a change plan, not a blueprint slice.

## Facts the survey established

- Platform tokens are form factors only: `mobile`, `tablet`, `desktop`, `auto`,
  `watch`, `tv`, `spatial`, `packages`, `site`, `webapp`, `cli`. The table is
  `plugins/vwf/assets/standard-flows.md:153-167`. Vendors are named in the
  descriptions only (`auto` covers CarPlay and Android Auto).
- The "no vendor token" rule is `plugins/vwf/assets/standard-flows.md:190-191`,
  with its corollary at `:195-196`.
- Vendor differences today are prose only:
  `plugins/vwf/assets/templates/flow-platform.md:123-137` (Platform deviations,
  "each noting any vendor difference") and `:19-21`. The Components section has
  no per-OS field (`flow-platform.md:85-88`).
- The SwiftUI pack states the device and OS features are out of scope at
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/ios-ipados.md:68-72`,
  and routes them to a Platform deviations entry and an availability check. The
  check is described at `…/swiftui/references/platform-interop.md:52-59`
  (`#available` guarded at the smallest scope).
- The blueprint platform rules are at
  `plugins/vwf/skills/blueprint/references/platforms.md:40,45,59,69,79`.
- The blueprint completeness checklist is the reviewer agent
  `plugins/vwf/agents/blueprint-reviewer.md`. The flow contract is
  `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`.
- The SwiftUI pack is at version 0.5.1
  (`plugins/stackgen/stacks/app-framework/swiftui/pack.yaml:5`). The pin is
  `app-framework/swiftui@0.5.1` in
  `plugins/stackgen/stacks/bundles/swift-swiftui.md:6` and in the generated
  `plugins/stackgen/stacks/inventory.md` at lines 32 and 157.
- The commit convention allows the types `ops`, `docs`, `merge`, `feat`, `fix`
  and `refactor`, and no scopes (`.config/git-conventional-commits.yaml`).
- No existing decision in `docs/memory/decisions/` rules on a structured feature
  field. `docs/memory/decisions/2026-09-23-watch-tv-spatial-platforms.md` parks
  OS-specific features for a dedicated plan, and this plan is that plan.
- No `docs/blueprint/` tree exists in this repo. The blueprint rules are the
  plugin's own templates and references.

## Assumed decisions — confirm or override at review

| #  | Decision                         | Ruling                                                                                                                                                                                            | Rejected                                    | Unit   |
| -- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------ |
| 1  | Value set for `scope`            | The OS name from the platform doctrine: `ios` now; `watchos`, `tvos`, `visionos`, `carplay`, `macos` later. Folder 2 adds `android:<vendor>`.                                                     | Free text; a closed enum in `registry.yaml` | U1     |
| 2  | Structured record                | A `features:` list in `flow-platform.md` frontmatter. Each entry has `name`, `scope` and `fallback`.                                                                                              | A separate features document                | U1     |
| 3  | Format                           | Additive. No `blueprint_format` bump, on the precedent of decision D4 in `2026-09-23-watch-tv-spatial-platforms`.                                                                                 | Bump the blueprint format                   | U1     |
| 4  | Fallback                         | Required on every entry. Confirmed by the user.                                                                                                                                                   | An optional fallback                        | U1, U3 |
| 5  | Enforcement                      | The blueprint reviewer returns a gap for a missing fallback or an unknown scope. The flow contract states the rule. No new checker rule. Confirmed by the user.                                   | A `p:plugins:check` rule; a doctor finding  | U3     |
| 6  | Platforms that may carry entries | Any form-factor platform. The stack rule covers iOS only in this plan. Confirmed by the user.                                                                                                     | `mobile` only                               | U1, U2 |
| 7  | iOS worked case                  | Dynamic Island inside `mobile`, built behind a `#available` guard with its declared fallback. The Out of scope paragraph at `ios-ipados.md:68-72` is replaced by the rule. Confirmed by the user. | The rule only, with no worked case          | U2     |
| 8  | SwiftUI pack bump                | MINOR: 0.5.1 becomes 0.6.0, with every pin and the generated inventory updated.                                                                                                                   | PATCH                                       | U5     |
| 9  | Review row                       | None. The change is Markdown only and lands no runnable code, so the wave review is the only check.                                                                                               | A `Kind: review` row                        | —      |
| 10 | Docs owner                       | The docs unit writes the decision record for the reversal in decision 2 and the site pages. Its Owns list is fixed; a falsified passage outside it is reported, not edited.                       | Docs edits in the feature units             | U4     |

## New dependencies

None. No unit adds a package.

## Units

| Id | Wave | Unit file                                      | Kind | Owns                                                                                                                                                                                             | Depends on | Status  | Commit |
| -- | ---- | ---------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | ------ |
| U1 | 1    | [01-flow-platform.md](01-flow-platform.md)     | edit | `plugins/vwf/assets/templates/flow-platform.md`, `plugins/vwf/assets/standard-flows.md`                                                                                                          | —          | pending |        |
| U2 | 1    | [02-ios-features.md](02-ios-features.md)       | edit | `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/ios-ipados.md`, `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platform-interop.md` | —          | pending |        |
| U3 | 2    | [03-blueprint-rules.md](03-blueprint-rules.md) | edit | `plugins/vwf/skills/blueprint/references/platforms.md`, `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`, `plugins/vwf/agents/blueprint-reviewer.md`                         | U1         | pending |        |
| U4 | 3    | [04-docs.md](04-docs.md)                       | edit | `site/src/content/docs/plugins/vwf.md`, `site/src/content/docs/plugins/stackgen.md`, `docs/memory/decisions/2026-10-09-structured-platform-features.md`                                          | U1, U2, U3 | pending |        |
| U5 | 4    | [05-gates.md](05-gates.md)                     | edit | `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`, `plugins/stackgen/stacks/bundles/swift-swiftui.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`         | U2, U4     | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Kind is `edit` on every unit. No row is `review` (decision 9).

## Shared-file rule

| File                                                               | Why it collides                                            | Owner           |
| ------------------------------------------------------------------ | ---------------------------------------------------------- | --------------- |
| `plugins/stackgen/stacks/inventory.md`                             | generated; regenerating mid-wave races                     | gates unit only |
| `.claude-plugin/marketplace.json`                                  | generated                                                  | gates unit only |
| `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`          | version bump                                               | gates unit only |
| `plugins/stackgen/stacks/bundles/swift-swiftui.md`                 | pin bump                                                   | gates unit only |
| `site/src/content/docs/plugins/vwf.md`, `…/plugins/stackgen.md`    | human-facing docs; several units could describe the change | docs unit only  |
| `docs/memory/decisions/2026-10-09-structured-platform-features.md` | decision record                                            | docs unit only  |

## Waves

- Wave 1: U1 and U2. Their owned paths are disjoint, and neither depends on the
  other.
- Wave 2: U3. It reads the template and the entry shape U1 writes.
- Wave 3: U4 (docs). It runs after the feature units so its delta is complete.
- Wave 4: U5 (gates). It bumps the pack, regenerates the inventory and runs the
  full gate.

## Wave gate

- `mise run p:plugins:check`
- `mise run p:plugins:marketplace -- --check`
- `mise run p:site:check`

The wave review runs after each wave. The inventory check runs only in U5,
because it fails until the pack bump lands. No line here depends on a unit.

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
the return block. A unit never bumps a version, never runs a generator, never
edits a doc outside its own Owns, never adds a dependency, and never commits. A
unit deletes with plain `rm`, never `git rm`.

## Out of scope

- Android device families (Samsung, OnePlus) — folder 2.
- Canvas frame sizes per platform — parked; no folder yet.
- Android XR (`spatial`) — out of scope for B57 and therefore for this item.
- Vendor tokens of any kind.
- A checker rule for the new declaration (decision 5).
- Flutter. It declares no OS-specific feature in this plan.

## Parked

- B58: Android device-family features (Samsung, OnePlus) — covered by
  docs/plans/2026-10-09-android-device-features (folder 2).
- B58: canvas frame sizes per platform — no folder yet; raised with B58 and
  parked with the OS-specific-features decision.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-09-os-feature-declarations

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
