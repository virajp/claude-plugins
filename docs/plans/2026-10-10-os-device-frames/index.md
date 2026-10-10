---
type: vwf-change-plan
title: OS device frames on the design canvas
requires: [ docs/plans/2026-10-10-swiftui-third-party-integrations ]
backlog: [ B58 ]
backlog_pieces: []
---

# Plan — OS device frames on the design canvas (2026-10-10)

## Status

**APPROVED**

APPROVED 2026-10-10 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | no      |

There is no After landing row: `.config/vwf.yaml`'s `after_landing:` already
lists `mise run p:plugins:local`, and `/vwf:execute` runs it after every green
landing. Only a restarted session loads the staged vwf and stackgen. The End an
`all` run row is `no`: this plan edits the screens, setup and doctor doctrine
and four packs. The execute, plan-management and backlog skills that an `all`
run uses do not change, so the stale copy is safe for the next plans.

## Release levels

| Project  | Level | Reason                                                                                               |
| -------- | ----- | ---------------------------------------------------------------------------------------------------- |
| vwf      | MINOR | new behaviour: OS device frames, the `device` tweak, the list form of `design.viewports`             |
| stackgen | MINOR | new behaviour: the bundle `os:` key and payload field; ux-gates and design-tool packs read OS frames |
| site     | PATCH | the manual describes the new frames; the site gets no new feature                                    |

## Goal

A canvas frame shows the OS that the product ships on. A SwiftUI phone shows a
Dynamic Island, a Compose phone shows a punch-hole camera, a Wear OS watch is
round. A project whose stack targets more than one OS on one platform (Flutter
on `mobile`) switches between its OS frames with a `device` tweak on the one
coded frame. A flow's `features:` entry shows on the frame of its own OS, and
its fallback on every other frame. This plan finishes backlog item B58.

This is folder 3 for B58. Folder 1 (`2026-10-09-os-feature-declarations`) landed
the `features:` list and the iOS side. Folder 2
(`2026-10-09-android-device-features`) landed the Android device-family scopes.
Both parked two pieces: the canvas frame sizes for each platform, and the
Samsung and OnePlus worked cases. This plan lands the first piece. For the
second piece, the research at plan time found no case that can ship (D11), so
B58 finishes with the rule only.

**Two reversals, both confirmed by the user on 2026-10-10:**

- `2026-09-23-watch-tv-spatial-platforms` decision **D7** rejected "a list of
  sizes per product". `design.viewports` now also accepts a list of OS frames
  for each platform (D5). The scalar form stays valid.
- `2026-10-09-web-canvas-layout` decision **D4** rejected desktop "window chrome
  that follows the pinned stack — that is B58's OS fidelity". The `macos` and
  `windows` frames now follow the stack (D6). The neutral frame stays as the
  `linux` frame and as the frame when no OS is known.

## Facts the survey established

- **Today's model.** One frame for each platform, with a default size and an
  optional per-project override `design.viewports.<project>.<platform>: <W>x<H>`
  in `.config/vwf.yaml`. It is prose in about 15 files. No checker, test or
  script reads a viewport key (`scripts/src/check.ts`, the tests and
  `.config/mise/tasks` have no hits).
- **The authoritative definition** is the Layout block of
  `plugins/vwf/assets/templates/canvas-claude.md`: `:44-51` (the default and
  override comment), `:54-56` mobile 390×844 with a generic "camera
  notch/cutout", `:57-59` tablet, `:60-63` desktop (neutral native window),
  `:64-76` site and webapp (fixed, `width` tweak), `:77-83` auto, `:85-91`
  watch, `:92-96` tv (title-safe inset), `:97-102` spatial, `:111-115` the
  standing tweak set.
- **The config schema** is `plugins/vwf/assets/vwf-config.md:142-145` (the
  `design.viewports` comment, with the defaults repeated) and `:265-272` (the
  reading rules). `config_format` is 23 and `blueprint_format` is 25
  (`vwf-config.md:49-50`).
- **Readers that restate the defaults or the resolution:**
  - `plugins/vwf/skills/screens/SKILL.md:66-73`
  - `plugins/vwf/skills/screens/references/prompt-mode.md:15-28` and `:89-93`
  - `plugins/vwf/skills/screens/references/import-mode.md:36-50`
  - `plugins/vwf/assets/templates/screen-prompt.md:13-21`
  - `plugins/vwf/skills/import-screens/SKILL.md:35-39`
  - `plugins/vwf/skills/doctor/references/stack-checks.md:270-279` (the
    validation, non-blocking)
  - `plugins/vwf/agents/execute-ux-reviewer.md:93-97`
  - `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md:165-175`
    (hard-codes the seven defaults)
  - `plugins/stackgen/stacks/design-tool/claude-design/skills/design-import-screens/references/canvas-push.md:48-56`
  - `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/SKILL.md:34-50`
    (a default table mapped to simulator destinations; mobile 390×844)
  - `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/testing.md:69-71`
  - `plugins/stackgen/stacks/app-framework/compose/skills/ux-gate/SKILL.md:42-50`
    (Robolectric qualifiers; mobile is a Pixel 7)
- **Not readers:** `plugins/vwf/skills/design-system/SKILL.md`,
  `plugins/vwf/agents/mockup-generator.md`, `plugins/vwf/skills/mockups/`, the
  Flutter ux-gate.
- **The import payload** (`plugins/vwf/assets/design-adapter.md:112-135`) has no
  size, device or frame field. `code` is the join key (`:137-140`). The rule
  "variants are tweaks, never extra frames" is stated at
  `screens/SKILL.md:56-58`, `canvas-claude.md:38-39` and `import-mode.md:41-50`.
- **The `features:` list.** Shape at
  `plugins/vwf/assets/templates/flow-platform.md:8-13` (`name`, `scope`,
  `fallback`). Scope values `ios`, `android:samsung`, `android:oneplus`;
  doctrine at `plugins/vwf/skills/blueprint/references/platforms.md`,
  `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md:144-159`
  and `frontmatter-and-links.md:81-91`. No screens, canvas or adapter file reads
  `features:` today.
- **The stack link.** No place maps a stack to an OS for the canvas. A project's
  platforms come from its bundle frontmatter `platforms:` list
  (`plugins/stackgen/stacks/bundles/swift-swiftui.md`, `kotlin-compose.md`,
  `dart-flutter.md`), which
  `plugins/stackgen/skills/stackgen-stack-template/SKILL.md:74-100` passes into
  the payload. `plugins/stackgen/assets/pack-format.md:359` and `:385-402`
  document the bundle `platforms:` key. `/vwf:setup` records the payload into
  `projects.<name>.stack` through
  `plugins/vwf/skills/setup/references/materialize.md`; the payload shape vwf
  reads is `plugins/vwf/assets/stack-adapter.md:273-297`.
- **The platform vocabulary** is `plugins/vwf/assets/standard-flows.md` (the
  form-factors-not-vendors rule at `:190-199`).
- **Versions at plan time, after the required plan lands:**
  `app-framework/swiftui` 0.7.0, `app-framework/compose` 0.4.0 (the required
  plan's U12 bumps them), `design-tool/claude-code` 0.5.0,
  `design-tool/claude-design` 0.3.0. Bundles `claude-code.md:7` and
  `claude-design.md:6` pin the two design-tool packs.
- **The user manual:** `site/src/content/docs/plugins/vwf.md:2085-2096` (the
  platforms paragraph) and `:2345-2358` (the viewport defaults paragraph);
  `site/src/content/docs/plugins/stackgen.md:349` and `:442` (`features:` and
  the Dynamic Island).
- **Vendor research at plan time (2026-10-10, primary sources):**
  - Samsung Galaxy Edge SDK: support ended 2023-12-05
    (`https://developer.samsung.com/galaxy-edge`).
  - Samsung S Pen Remote SDK: version 1.0.2 from 2019-09-16, two JARs downloaded
    by hand (not on Maven), "requires devices of the Note series"; the check is
    `SpenRemote.isFeatureEnabled(FEATURE_TYPE_BUTTON)`
    (`https://developer.samsung.com/galaxy-spen-remote`). The Galaxy S25 Ultra S
    Pen has no Bluetooth (press coverage, not a primary source).
  - Samsung DeX: detection uses hidden APIs only
    (`https://developer.samsung.com/samsung-dex/modify-optimizing`).
  - OnePlus: no developer portal, no SDK, no documented feature flag. OPPO Fluid
    Cloud needs vendor approval and runs on the server side.
- **Commit convention** (`.config/git-conventional-commits.yaml`): types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- No other active plan owns a file this plan edits. The required plan owns the
  SwiftUI and Compose `pack.yaml` files, `bundles/swift-swiftui.md`,
  `bundles/kotlin-compose.md` and `inventory.md`, which this plan's U7 bumps
  again. That is why this plan requires it.

## Assumed decisions — confirm or override at review

| #   | Decision              | Ruling                                                                                                                                                                                                                                                                                                                                                                                              | Rejected                                                                | Unit           |
| --- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------- |
| D1  | Frame shape           | More than one device for one platform is a `device` tweak on the one coded frame, never an extra frame or page. The tweak's values are the OS tokens of the resolved list, in order. The first OS is the primary and the tweak's default. Import diffs the primary frame only, as for the web `width` tweak.                                                                                        | one frame for each device (`<code>@<device>`); one page for each device | U1             |
| D2  | Device list source    | The pinned stack picks the OS frames for each platform. `design.viewports` can replace the list.                                                                                                                                                                                                                                                                                                    | fixed defaults; config only                                             | U1, U2         |
| D3  | Stack link            | A bundle's frontmatter declares an optional `os:` map, `<platform>: [ <os> ]`, beside `platforms:`. The stackgen stack-template payload passes it through. vwf keeps the one table that maps (platform, OS) to a frame, so vwf names no technology.                                                                                                                                                 | the pack declares full frames; ask at screens prompt                    | U2, U3, U7     |
| D4  | OS record             | `/vwf:setup` copies the payload's `os:` map into `projects.<name>.stack.os` in `.config/vwf.yaml`, as it copies `languages` and `frameworks`. The key is optional and additive, so no `config_format` bump (the `design.viewports` precedent). An absent key, or an absent platform in it, reads as no OS known: the generic frame, as today.                                                       | fetch the payload live at each screens run                              | U2             |
| D5  | Override shape        | `design.viewports.<project>.<platform>` takes the scalar `<W>x<H>` (unchanged: it resizes the primary frame) or a list, `[ { os: <os>, size: <W>x<H> } ]`, where `size` is optional and falls back to the OS frame's default. The list replaces the stack's list, and its order sets the primary. The chrome always follows the OS; there is no chrome field.                                       | full device entries with a free `chrome` field; an OS list with no size | U1, U2, U4, U5 |
| D6  | Frame table           | The (platform, OS) frame table below, with the generic row kept as the no-OS fallback. Tablet uses `ios`, not `ipados`.                                                                                                                                                                                                                                                                             | mobile, watch and tv only; a separate `ipados` token                    | U1             |
| D7  | Size check            | U1 cross-examines each size and chrome in the table against the vendor's design guidelines through Context7 (`resolve-library-id` then `get-library-docs`). If a source gives a different value, U1 uses the source and reports it as a `DECIDED:` line with the URL.                                                                                                                               | sizes taken without a check                                             | U1             |
| D8  | `features:` on frames | The screen brief tells the canvas: with the `device` tweak on a frame whose OS equals the OS part of a `features:` entry's scope (the text before any `:`, so `android:samsung` matches `android`), show the feature; on every other frame, show the entry's fallback. Import diffs the primary frame only.                                                                                         | the canvas ignores `features:`                                          | U1             |
| D9  | ux-gates              | The SwiftUI and Compose ux-gate skills resolve the frame of their own OS: the list entry with that OS token, else the OS default from the frame table. The SwiftUI `mobile` default moves from 390×844 to 393×852 (`ios`).                                                                                                                                                                          | leave the ux-gates alone                                                | U4             |
| D10 | Doctor                | Doctor validates `projects.<name>.stack.os` (each key a platform the project declares, each value a token the OS vocabulary names for that platform) and the list form of `design.viewports` (each `os` a token the vocabulary names for that platform, each `size` `<W>x<H>`). Findings are non-blocking, as for the scalar: an invalid entry is reported and ignored.                             | a `p:plugins:check` rule                                                | U2             |
| D11 | Vendor worked cases   | No vendor worked case ships. The decision doc records the research (Facts) so the next plan does not repeat it. The capability-check rule already lets a product build a vendor feature.                                                                                                                                                                                                            | an S Pen worked case; an anti-example note                              | U6             |
| D12 | Review row            | None. Every edit is prose; no runnable code lands.                                                                                                                                                                                                                                                                                                                                                  | a review row                                                            | —              |
| D13 | Bundle owner          | U7 owns the three app-framework bundles whole: the `os:` key and the pins. Each bundle has one owner.                                                                                                                                                                                                                                                                                               | U3 adds `os:` and U7 edits the pins                                     | U7             |
| D14 | OS vocabulary         | One OS vocabulary for each platform, in `standard-flows.md`, serves both the frames and the `features:` scopes: `mobile` `ios` `android`; `tablet` `ios` `android`; `desktop` `macos` `windows` `linux`; `auto` `carplay` `androidauto`; `watch` `watchos` `wearos`; `tv` `tvos` `androidtv`; `spatial` `visionos` `androidxr`. Quest has no token, so it gets the generic spatial frame.           | an OS list in each consumer                                             | U2             |
| D15 | Bundle `os:` values   | `swift-swiftui`: `mobile [ios]`, `tablet [ios]`, `desktop [macos]`, `auto [carplay]`, `watch [watchos]`, `tv [tvos]`, `spatial [visionos]`. `kotlin-compose`: `mobile [android]`, `tablet [android]`, `watch [wearos]`, `tv [androidtv]`, `auto [androidauto]`. `dart-flutter`: `mobile [ios, android]`, `tablet [ios, android]`, `desktop [macos, windows, linux]`, `auto [carplay, androidauto]`. | no `os:` on Flutter                                                     | U7             |
| D16 | Pack bumps            | U7 bumps `app-framework/swiftui` 0.7.0 → 0.8.0, `app-framework/compose` 0.4.0 → 0.5.0, `design-tool/claude-code` 0.5.0 → 0.6.0, `design-tool/claude-design` 0.3.0 → 0.4.0, re-pins the four bundles and regenerates `inventory.md`, in one commit.                                                                                                                                                  | a patch bump                                                            | U7             |

**The frame table (D6).** Sizes in points (Apple) or dp (Android).

| Platform | OS            | Size      | Chrome                                        |
| -------- | ------------- | --------- | --------------------------------------------- |
| mobile   | (none)        | 390×844   | generic notch or cutout (today)               |
| mobile   | `ios`         | 393×852   | Dynamic Island, home indicator                |
| mobile   | `android`     | 412×915   | punch-hole camera, gesture bar                |
| tablet   | (none)        | 834×1194  | today's frame                                 |
| tablet   | `ios`         | 834×1194  | rounded corners, home indicator               |
| tablet   | `android`     | 800×1280  | camera in the bezel, gesture bar              |
| desktop  | (none)        | 1440×900  | neutral title bar (today)                     |
| desktop  | `macos`       | 1440×900  | window controls on the left                   |
| desktop  | `windows`     | 1440×900  | window controls on the right                  |
| desktop  | `linux`       | 1440×900  | neutral title bar                             |
| auto     | (none)        | 800×480   | today's frame                                 |
| auto     | `carplay`     | 800×480   | CarPlay status sidebar                        |
| auto     | `androidauto` | 800×480   | Android Auto navigation rail                  |
| watch    | (none)        | 208×248   | today's frame                                 |
| watch    | `watchos`     | 208×248   | rounded rectangle                             |
| watch    | `wearos`      | 227×227   | round face                                    |
| tv       | (none)        | 1920×1080 | today's frame                                 |
| tv       | `tvos`        | 1920×1080 | title-safe inset, 60 top and bottom, 80 sides |
| tv       | `androidtv`   | 960×540   | overscan margin, 27 top and bottom, 48 sides  |
| spatial  | (none)        | 1280×720  | today's frame                                 |
| spatial  | `visionos`    | 1280×720  | glass window, window bar below                |
| spatial  | `androidxr`   | 1280×720  | panel with a top bar                          |

**The resolution order (D2, D4, D5),** one rule that every reader states the
same way: for `(project, platform)`, the OS list is the `design.viewports` list
when one is set, else `projects.<name>.stack.os.<platform>`, else empty. An
empty list gives the one generic frame at its default size, or at the scalar
override. A non-empty list gives one frame with a `device` tweak; each OS takes
its size from its list entry, else from the frame table. A scalar override
resizes the primary OS frame only.

## New dependencies

none

## Units

| Id | Wave | Unit file                                              | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Depends on         | Status  | Commit |
| -- | ---- | ------------------------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------- | ------ |
| U1 | 1    | [01-canvas-screens.md](01-canvas-screens.md)           | edit | `plugins/vwf/assets/templates/canvas-claude.md`, `plugins/vwf/assets/templates/screen-prompt.md`, `plugins/vwf/skills/screens/SKILL.md`, `plugins/vwf/skills/screens/references/prompt-mode.md`, `plugins/vwf/skills/screens/references/import-mode.md`, `plugins/vwf/skills/import-screens/SKILL.md`, `plugins/vwf/assets/design-adapter.md`, `plugins/vwf/agents/execute-ux-reviewer.md`                                                                                                                                                                 | —                  | pending |        |
| U2 | 1    | [02-config-stack-doctor.md](02-config-stack-doctor.md) | edit | `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/assets/standard-flows.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`, `plugins/vwf/skills/setup/references/materialize.md`                                                                                                                                                                                                                                                                                                                            | —                  | pending |        |
| U3 | 1    | [03-stackgen-payload.md](03-stackgen-payload.md)       | edit | `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`, `plugins/stackgen/assets/pack-format.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —                  | pending |        |
| U4 | 1    | [04-ux-gates.md](04-ux-gates.md)                       | edit | `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/SKILL.md`, `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/testing.md`, `plugins/stackgen/stacks/app-framework/compose/skills/ux-gate/SKILL.md`                                                                                                                                                                                                                                                                                                                     | —                  | pending |        |
| U5 | 1    | [05-design-tool-packs.md](05-design-tool-packs.md)     | edit | `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`, `plugins/stackgen/stacks/design-tool/claude-design/skills/design-import-screens/references/canvas-push.md`                                                                                                                                                                                                                                                                                                                                                               | —                  | pending |        |
| U6 | 2    | [06-docs.md](06-docs.md)                               | edit | `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/skills/**`, `.claude/docs/**`, `plugins/stackgen/stacks/readme.md`, `docs/memory/decisions/2026-10-10-os-device-frames.md` (new), and any other human-facing passage `vwf:docs-sync` finds outside the Owns of U1 to U5 and U7                                                                                                                                                                                                                                                              | U1, U2, U3, U4, U5 | pending |        |
| U7 | 3    | [07-gates.md](07-gates.md)                             | edit | `plugins/stackgen/stacks/bundles/swift-swiftui.md`, `plugins/stackgen/stacks/bundles/kotlin-compose.md`, `plugins/stackgen/stacks/bundles/dart-flutter.md`, `plugins/stackgen/stacks/bundles/claude-code.md`, `plugins/stackgen/stacks/bundles/claude-design.md`, `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`, `plugins/stackgen/stacks/app-framework/compose/pack.yaml`, `plugins/stackgen/stacks/design-tool/claude-code/pack.yaml`, `plugins/stackgen/stacks/design-tool/claude-design/pack.yaml`, `plugins/stackgen/stacks/inventory.md` | U6                 | pending |        |

## Shared-file rule

| File                                                                      | Why it collides                                | Owner   |
| ------------------------------------------------------------------------- | ---------------------------------------------- | ------- |
| `plugins/stackgen/stacks/inventory.md`                                    | generated; regenerating mid-wave races         | U7 only |
| the three app-framework bundles                                           | `os:` (D15) and the pins (D16) in one file     | U7 only |
| the four `pack.yaml` files and two design bundles                         | version and pin, one commit with the inventory | U7 only |
| every human-facing doc                                                    | several units' changes reach one doc           | U6 only |
| `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | version files — the release task bumps them    | nobody  |
| `docs/plans/**`                                                           | the executor's and plan-management's           | nobody  |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5.** Five disjoint sets of files. Each unit reads
  only the rulings in this file, not another unit's output, so they are safe
  together.
- **Wave 2 — U6.** Docs, after every edit has landed.
- **Wave 3 — U7.** The `os:` keys, the four bumps, the pins, the inventory and
  the full gate.

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

none — `.config/vwf.yaml`'s `after_landing:` runs `mise run p:plugins:local`.

## Gates the orchestrator keeps

- After wave 1: every viewport reader names the OS frame resolution. Pass:
  `grep -l "stack.os"` over `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/assets/templates/canvas-claude.md`,
  `plugins/vwf/skills/screens/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/skills/setup/references/materialize.md` lists all five files, and
  `grep -l "device"` over the two U5 files and the two U4 ux-gate files lists
  all four.
- After wave 1: a grep of the U3, U4 and U5 files for `plugins/`,
  `CLAUDE_PLUGIN_ROOT` and `stackgen/` finds no new hit (rule 13).
- After wave 3: each of the three app-framework bundles carries an `os:` key
  whose platforms are a subset of its `platforms:` list.
- Every wave: no added line in a changed Markdown file has an odd count of
  backticks, and no line ends in a bare backtick.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. U7 is the one exception to "never bumps a version" and "never runs a
generator": D16 names those bumps and that generator.

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

- **Vendor worked cases (Samsung, OnePlus)** — the research found no case that
  can ship (D11). The Compose pack keeps the rule only.
- **A Quest frame** — no OS token names Quest; it gets the generic spatial
  frame.
- **Local mockup renders** (`/vwf:mockups`, the mockup-generator) — they have no
  viewport logic today. See Parked.
- **The Flutter ux-gate** — it has no size table.
- **An import diff of the non-primary devices** — import diffs the primary frame
  only (D1).
- **`site`, `webapp` and `cli`** — no OS frame; `site` and `webapp` keep their
  fixed browser frames and the `width` tweak.
- **A `config_format` or `blueprint_format` bump** — every key is additive (D4).
- **A checker rule** for `os:` or the list form (D10).
- **Generated stacks** — a generated bundle may emit `os:`; when it does not,
  the generic frame applies. No generator edit.

## Parked

- Local mockup renders (`/vwf:mockups` and the mockup-generator agent) that show
  the `device` tweak and the OS chrome — no backlog item yet.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-10-os-device-frames

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
