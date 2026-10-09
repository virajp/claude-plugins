---
type: vwf-change-plan
title: OS feature declarations
requires: []
backlog: []
backlog_pieces: [ B58 ]
---

# Plan — OS feature declarations (2026-10-09)

## Status

**RUNNING**

RUNNING since 2026-10-09 21:22 in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-10-09-os-feature-declarations

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

| Id | Wave | Unit file                                      | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                  | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-flow-platform.md](01-flow-platform.md)     | edit | `plugins/vwf/assets/templates/flow-platform.md`, `plugins/vwf/assets/standard-flows.md`                                                                                                                                                                                                                                                                                                                                               | —          | green   | 9bac0368 |
| U2 | 1    | [02-ios-features.md](02-ios-features.md)       | edit | `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/ios-ipados.md`, `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platform-interop.md`                                                                                                                                                                                                                                      | —          | green   | b332dc2a |
| U3 | 2    | [03-blueprint-rules.md](03-blueprint-rules.md) | edit | `plugins/vwf/skills/blueprint/references/platforms.md`, `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`, `plugins/vwf/agents/blueprint-reviewer.md`                                                                                                                                                                                                                                                              | U1         | green   | 07463800 |
| U4 | 3    | [04-docs.md](04-docs.md)                       | edit | `site/src/content/docs/plugins/vwf.md`, `site/src/content/docs/plugins/stackgen.md`, `docs/memory/decisions/2026-10-09-structured-platform-features.md`, `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md` (widened at run time, R1-wave rule 5), `plugins/vwf/agents/flow-writer.md` (widened at run time, R2-wave rule 5), `plugins/vwf/skills/blueprint/SKILL.md` (widened at run time, R3-wave rule 5) | U1, U2, U3 | green   |          |
| U5 | 4    | [05-gates.md](05-gates.md)                     | edit | `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`, `plugins/stackgen/stacks/bundles/swift-swiftui.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                              | U2, U4     | pending |          |

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

| Wave | Unit       | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Commit   |
| ---- | ---------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight  | —     | 1     | green       | doctor blocking checks: mise and graphify CLI present, graph reachable from the main checkout; no blocking finding; all 3 Wave gate lines green on the branch base 4b597fc2; format check skipped (no covers:); stack conventions skipped (edit units only); order: W1 U1,U2 → W2 U3 → W3 U4 (docs) → W4 U5 (gates)                                                                                                                                                                                                                                                                      |          |
| 0    | override   | —     | 1     | green       | override: skip as deduped: mise run p:plugins:local                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |          |
| 1    | U1         | opus  | 1     | green       | flow-platform.md: frontmatter features: [] with commented entry shape (name, scope ios, required fallback); deviations comment names features: as the structured record. standard-flows.md ~190-200: vendor-differences clause replaced by the features: rule; form-factors-not-vendors and auto sentences intact; refolded 80 cols                                                                                                                                                                                                                                                      |          |
| 1    | U2         | opus  | 1     | green       | ios-ipados.md: Out of scope paragraph replaced by the rule (scope: ios built behind #available at smallest scope, declared fallback, stack never invents one); new section Device features inside mobile — Dynamic Island worked case (#available(iOS 16.1, *) + areActivitiesEnabled; Lock Screen presentation as fallback), ActivityKit checked via Context7. platform-interop.md: one cross-reference sentence                                                                                                                                                                        |          |
| 1    | R1-wave    | opus  | 1     | findings(3) | U1 standard-flows.md:199 features sentence breaks the referent of "the three" (rule 4) → loop-back; U1 flow-platform.md:143 deviations comment still "each noting any vendor difference" (rule 2 minor) → loop-back; rule 5 in nobody-owned plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md:101 (and :78-92 lacks features:) → DOCS FALSIFIED handed to U4, Owns widened (GAP); CONTRACT clean; RULINGS clean                                                                                                                                                 |          |
| 1    | U1         | opus  | 2     | green       | R1-wave fix: standard-flows.md "Unlike auto ... the three" sentence moved above the features: rule, refolded ≤80 cols; flow-platform.md:143 now "every other vendor difference (an OS-specific feature goes in features:, above)"; p:plugins:check green                                                                                                                                                                                                                                                                                                                                 |          |
| 1    | R1-wave    | opus  | 2     | findings(1) | round-1 items 2 and 3 resolved; contested (cap of two rounds, 3→1 converging): U1 standard-flows.md:197 ragged fold ("alone. An" short line) after the round-1 move — cosmetic, left; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                      |          |
| 1    | gate       | —     | 1     | green       | all 3 Wave gate lines green; code:precommit pass 2 clean; U1 committed 9bac0368, U2 b332dc2a                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | b332dc2a |
| 2    | U3         | opus  | 1     | green       | platforms.md: features: sentence in the auto, watch, tv, spatial passages; flow-contract.md: new OS-specific features section (name, scope, required fallback; any form-factor platform); blueprint-reviewer.md: checklist item — missing/empty fallback or unknown scope is a gap. DECIDED features: [] is complete; a scope value is never a vendor-name gap. No DOCS FALSIFIED beyond frontmatter-and-links.md (already U4)                                                                                                                                                           |          |
| 2    | R2-wave    | opus  | 1     | findings(2) | U3 blueprint-reviewer.md:175 scope exemption contradicts the vendor-name check carve-out list (rule 3) → loop-back; rule 5 in nobody-owned plugins/vwf/agents/flow-writer.md:91 (platform-file write list omits features:) → DOCS FALSIFIED handed to U4, Owns widened (GAP); both U3 additions otherwise within the ruling; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                               |          |
| 2    | U3         | opus  | 2     | green       | R2-wave fix: blueprint-reviewer.md:175-177 vendor-name check now lists the features: scope value as a third carve-out (names an OS, not a vendor); dropped the stale "neither of which is a flow doc" clause; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                      |          |
| 2    | R2-wave    | opus  | 2     | pass        | item 1 resolved (three carve-outs agree with the new check); nothing new; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |          |
| 2    | gate       | —     | 1     | green       | all 3 Wave gate lines green; code:precommit pass 2 clean; U3 committed 07463800                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 07463800 |
| —    | acceptance | —     | —     | skipped     | why: no covers: — a change plan has no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |          |
| —    | ux         | —     | —     | skipped     | why: no covers: — no Screens contract to verify against                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |          |
| —    | renders    | —     | —     | skipped     | why: the ux stage did not run, so no RENDER: lines                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |          |
| —    | reconcile  | —     | —     | skipped     | why: no covers: — no stamps, registry or environment to reconcile; no code unit, so nothing to persist                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |          |
| 3    | U4         | opus  | 1     | green       | docs-sync over 4b597fc2..HEAD + handed lines: new decision record 2026-10-09-structured-platform-features.md (D1-D6, reversal confirmed 2026-10-09); site vwf.md names features: and its keys + reviewer gap; site stackgen.md SwiftUI sentence gains #available + declared fallback; frontmatter-and-links.md features: key + carve-out; flow-writer.md writes features:, entry without fallback returned UNRESOLVED. DECIDED stackgen.md had no out-of-scope passage, clause added instead. DOCS FALSIFIED .claude/skills/vwf-plugin/references/skills-and-agents.md:63 (outside Owns) |          |
| 3    | R3-wave    | opus  | 1     | findings(5) | U4 site vwf.md:2096 "each of those three" lost referent (rule 4); U4 site stackgen.md:346 iOS clause leaves topic 12 dangling (rule 4); U4 frontmatter-and-links.md:114 "(below)" points wrong way, :93 referent unclear (rule 3); U4 flow-writer.md:43-47 Inputs omit features (rule 3) → loop-back; rule 5 in nobody-owned plugins/vwf/skills/blueprint/SKILL.md:343-346 (flow-writer dispatch never passes features) → handed to U4, Owns widened (GAP); skills-and-agents.md:63 judged not falsified; CONTRACT clean; RULINGS clean                                                  |          |
| 3    | U4         | opus  | 2     | green       | R3-wave fix: site vwf.md features: sentence after "each of those three"; site stackgen.md iOS rule its own sentence; frontmatter-and-links.md "(above)" and "the platform: key restates it"; flow-writer.md Inputs list features (name, scope, fallback); blueprint/SKILL.md flow-writer dispatch passes features (only change); p:site:check green                                                                                                                                                                                                                                      |          |
| 3    | R3-wave    | opus  | 2     | findings(2) | items 1-5 resolved; contested (cap of two rounds, 5→2 converging): U4 site vwf.md:2097 features sentence sits between "each of those three" and "All four are device platforms" (minor referent); U4 site stackgen.md:352 "those integration references" now follows the iOS sentence (minor referent); CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                    |          |

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
