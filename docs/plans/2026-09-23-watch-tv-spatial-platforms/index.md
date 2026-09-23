---
type: vwf-change-plan
title: watch, tv and spatial platforms, and per-product device viewports
requires: []
backlog: []
---

# Plan — watch, tv and spatial platforms, and per-product device viewports (2026-09-23)

## Status

**APPROVED**

APPROVED 2026-09-23 by the user

## Consent

| Action                                            | Granted                                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                       |
| After landing: `mise run p:plugins:local`         | run                                                                                       |
| Release vwf publicly                              | minor — 19.43.1 → 19.44.0, by hand in `plugins/vwf/.claude-plugin/plugin.json`            |
| Release stackgen publicly                         | minor — 1.27.0 → 1.28.0, by hand in `plugins/stackgen/.claude-plugin/plugin.json`         |
| Release site publicly                             | patch — 1.1.40 → 1.1.41, `mise run p:site:version` (bare, no positional, on a clean tree) |
| Release installer publicly                        | none                                                                                      |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

The three `Release` rows are **intent, not authorisation**: this plan has no
release step. The versions are bumped in-tree, and the public tags ship with
plan 2 (the native Swift stack, B56), which requires this folder — the user
ruled at the interview to hold the release for it.

## Goal

After this lands, vwf's closed per-role platform vocabulary names three more
device screen platforms — `watch`, `tv` and `spatial` — each with its own
interaction contract in the blueprint, mirroring the rules `auto` carries; and
every device screen platform's canvas viewport has a default that a product can
override per project in `.config/vwf.yaml`. This is plan 1 of 2 for backlog item
B56 (full Swift support for every app type Xcode builds): watchOS, tvOS and
visionOS had no token, so the Swift stack could not declare them. Plan 2 is the
Swift pack set, and requires this folder. B56 rides plan 2, the plan that
finishes the item; this plan carries no backlog id.

No reversal. The tokens extend the standing form-factors-not-vendors rule
(`plugins/vwf/skills/architecture/references/platforms.md:42-43`) — `watch`
hides watchOS and Wear OS, `tv` hides tvOS and Android TV, `spatial` hides
visionOS, Android XR and Quest, the way `mobile` hides iOS and Android.

## Facts the survey established

- **The closed list.** The frontend role's platforms today: `packages`, `site`,
  `webapp`, `desktop`, `mobile`, `tablet`, `auto`, `cli` —
  `plugins/vwf/assets/templates/registry.yaml:35`, restated at
  `plugins/vwf/skills/architecture/references/platforms.md:19`. No `watch`, `tv`
  or `spatial` hit anywhere in the repo.
- **No code validates the vocabulary.** No checker rule or test checks platform
  tokens against the list; every enumeration is prose or a template, so every
  site is a hand edit. `scripts/src/check.ts:1413-1505` (default-per-platform)
  holds no vocabulary. `scripts/src/check.ts:2177-2186` (retired-`web` drift)
  lists device tokens as a hint only — left alone (D10).
- **Sites that state or branch on the list**, by owning unit:
  - U1: `registry.yaml:35,46,59`; architecture `platforms.md:19,24-25,33-43`
    (the `auto` elicitation rule — the model for any rule; the new tokens take
    none), `:51` (screen-platform obligations row); `standard-flows.md:63`
    (device column), `:154-165` ("exactly **six** screen platforms" + Kind
    table), `:186-190` (form-factor prose);
    `architecture-writer.md:104,115-116`; `topology-detection.md:73,99,105-106`,
    and `:141-148` (one detection signature row per token — each new token needs
    one); `derive-from-product.md:44,79` (elicitation hints).
  - U2: blueprint `SKILL.md:71,109,215`; blueprint
    `references/platforms.md:11-12,34-40` (the in-car rules to mirror);
    `flow-placement.md:13`; `frontmatter-and-links.md:80,98`;
    `flow-contract.md:11,31,120-121`; `ui-ux-contract.md:52-57` (in-car
    interaction rules — the model); `templates/flow-platform.md:6,16,99`;
    `templates/flow.md:16,23,63`; `templates/flows-index.md:23`;
    `templates/project-claude.md:49`; `blueprint-surveyor.md:98-99` (the only
    prose validator); `blueprint-reviewer.md:56-57`.
  - U3: `canvas-claude.md:48-66` (per-platform Layout block: mobile 390×844,
    tablet 834×1194, desktop 1440×900, auto 800×480 — the viewport home);
    `screen-prompt.md:3-4,16`; screens `SKILL.md:48,77`; `prompt-mode.md:16-19`;
    `import-mode.md:37`; import-screens `SKILL.md:34`;
    `design-adapter.md:118,227` (payload `platform:` enum); design-system
    `SKILL.md:62-63`; `vwf-config.md:115,148,309-318,527`; stackgen
    `design-session/SKILL.md:51,166-168`; stackgen `canvas-push.md:44`.
  - U4: `harness.md:20` (goldens required for device platforms);
    `execute-stages.md:55-56`; `execute-ux-reviewer.md:84-85` (browser vs
    device); docs-sync `SKILL.md:59` (app changelog on device platforms); doctor
    `stack-checks.md:151-152` (device platforms correct with
    `deploy_template: []`).
  - U5: site `plugins/vwf.md:654,1988` (device lists), `:2052-2056` ("**Seven
    platforms**"), `:2084,2194` (examples);
    `.claude/skills/vwf-plugin/references/docs-tree.md:16-17` (per-platform
    files).
- **Generic, no edit needed:** `stack-menu.md:43-45`, `verify/SKILL.md:47-49`,
  mockups skill, `mockup-generator.md`, feedback skill, stackgen
  `pack-format.md`, `kinds.md`, `taxonomy.md`, the stack-menu and stack-template
  skills, `stack-adapter.md:220` (the cover rule), the web-head contract
  (`site`/`webapp` only).
- **Canvas mapping.** One canvas project per `(project, platform)`, pinned at
  `design.projects.<project>.<platform>` (`vwf-config.md:148`); page names
  `<flow>--<platform>` and `index--<platform>`, one `CLAUDE--<platform>.md` per
  canvas (screens `SKILL.md:48-62`); `cli` takes no pin. The Layout block of
  `canvas-claude.md` is a **generated** section of each `CLAUDE--<platform>.md`,
  rewritten by `/vwf:screens prompt` — so a viewport override cannot live there;
  it lives in `.config/vwf.yaml`.
- **Formats.** `blueprint_format` ships 25, `config_format` 21. Since vwf 18
  they are drift detectors only. `auto` was added additively in `1a07016d` (vwf
  5.12.0) with no bump — the precedent D4 follows. An additive config key needs
  no `config_format` bump.
- **Stale passages found (fixed here, D11):**
  `plugins/vwf/skills/setup/references/format-lineage.md:18` says config_format
  20 (it is 21); `plugins/vwf/skills/setup/SKILL.md:156` calls 19 → 20 "the
  latest step" (20 → 21 is);
  `.claude/skills/vwf-plugin/references/docs-tree.md:105` says blueprint 24 (it
  is 25); `site/src/content/docs/plugins/vwf.md:400-401,432-433` still say
  `web`, the token split into `site` and `webapp` at format 22.
- **Versions.** vwf 19.43.1, stackgen 1.27.0, site 1.1.40.
  `design-tool/claude-code` pack 0.2.0 (pinned by `bundles/claude-code.md:7`),
  `design-tool/claude-design` pack 0.1.0 (pinned by
  `bundles/claude-design.md:6`). A plugin version is bumped by hand in its
  manifest.
- **Commit convention.** `.config/git-conventional-commits.yaml`: types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes enforced.
- **Formatting.** `plugins/**/*.md` is not dprint-formatted — match the
  surrounding fold width by hand. `site/**`, `docs/**` and `.claude/**` are.

## Assumed decisions — confirm or override at review

| #   | Decision             | Ruling                                                                                                                                                                                                                                                                                                                                                                                  | Rejected                                                                                     | Unit   |
| --- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------ |
| D1  | Scope                | Two plans, chained: this one adds the tokens; plan 2, the Swift packs (B56), requires it                                                                                                                                                                                                                                                                                                | one plan across vwf and stackgen; existing tokens only with watch/tv/vision parked           | —      |
| D2  | Token names          | `watch`, `tv`, `spatial` — form-factor nouns. `watch` covers watchOS and Wear OS, `tv` covers tvOS and Android TV, `spatial` covers visionOS, Android XR and Quest                                                                                                                                                                                                                      | `wearable`/`tv`/`xr`; vendor names `watchos`/`tvos`/`visionos`                               | U1     |
| D3  | Pairing rule         | None: `watch`, `tv` and `spatial` may each be declared alone, since all three can ship as standalone apps. The `auto`-needs-`mobile` rule stays specific to `auto`                                                                                                                                                                                                                      | `watch` needs `mobile`; ask at architecture time                                             | U1     |
| D4  | Format bump          | None. The change is additive — precedent `1a07016d`                                                                                                                                                                                                                                                                                                                                     | bump `blueprint_format` to 26                                                                | U1, U4 |
| D5  | Platform class       | All three are **device** screen platforms: store-shipped, the device column of the standard flows (splash mandatory), goldens required, `deploy_template: []`, the app changelog applies, outside the web-head contract                                                                                                                                                                 | —                                                                                            | U1, U4 |
| D6  | Interaction contract | Each new token carries its own interaction rules in the blueprint contract, mirroring `auto`'s in-car rules — watch: glanceable screens, Digital Crown, complications, short sessions; tv: focus-based navigation with a remote, the 10-foot distance, no touch; spatial: gaze and pinch, windows, volumes and immersive spaces                                                         | tokens only, interaction left to the design system                                           | U2     |
| D7  | Viewports            | Every device token (`mobile`, `tablet`, `desktop`, `auto`, `watch`, `tv`, `spatial`) keeps a default viewport, and a product may override it per project at `design.viewports.<project>.<platform>: <W>x<H>` in `.config/vwf.yaml`, beside the canvas pin. Additive key, no `config_format` bump. Both design adapters, the screens skill and the canvas Layout block read the override | a list of sizes per product; override for the new three only; fixed default only; no default | U3, U4 |
| D8  | Default viewports    | `watch` 208×248 (46mm Apple Watch, points), `tv` 1920×1080 (tvOS point grid), `spatial` 1280×720 (visionOS default window)                                                                                                                                                                                                                                                              | Ultra watch 205×251 and 4K TV                                                                | U3     |
| D9  | Flutter              | Flutter claims none of the new tokens — it has no watchOS, tvOS or visionOS target. The Flutter pack and bundle are not edited                                                                                                                                                                                                                                                          | —                                                                                            | —      |
| D10 | Checker              | The retired-`web` rule's token hint (`scripts/src/check.ts:2177-2186`) is left alone. The plan lands no runnable code, so it carries no review row; the wave review is the only check                                                                                                                                                                                                   | extend the hint regex (would force a review row for no behaviour gain)                       | —      |
| D11 | Stale passages       | Fix the three already-stale passages the survey found, in files this plan edits anyway                                                                                                                                                                                                                                                                                                  | park them for a later docs pass                                                              | U4, U5 |
| D12 | Release              | Bumps land in-tree; no release step. The public tags ship with plan 2                                                                                                                                                                                                                                                                                                                   | `/release` as `ask`; as `run`                                                                | U6     |

## New dependencies

None.

## Units

| Id | Wave | Unit file                                          | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Depends on     | Status  | Commit |
| -- | ---- | -------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | ------ |
| U1 | 1    | [01-vocabulary.md](01-vocabulary.md)               | edit | `plugins/vwf/assets/templates/registry.yaml`, `plugins/vwf/skills/architecture/references/platforms.md`, `plugins/vwf/skills/architecture/references/derive-from-product.md`, `plugins/vwf/agents/architecture-writer.md`, `plugins/vwf/assets/standard-flows.md`, `plugins/vwf/skills/setup/references/topology-detection.md`                                                                                                                                                                                                                                                                                                                                            | —              | pending |        |
| U2 | 1    | [02-blueprint.md](02-blueprint.md)                 | edit | `plugins/vwf/skills/blueprint/SKILL.md`, `plugins/vwf/skills/blueprint/references/platforms.md`, `plugins/vwf/skills/blueprint/references/flow-placement.md`, `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md`, `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`, `plugins/vwf/skills/blueprint-authoring/references/ui-ux-contract.md`, `plugins/vwf/assets/templates/flow-platform.md`, `plugins/vwf/assets/templates/flow.md`, `plugins/vwf/assets/templates/flows-index.md`, `plugins/vwf/assets/templates/project-claude.md`, `plugins/vwf/agents/blueprint-surveyor.md`, `plugins/vwf/agents/blueprint-reviewer.md` | —              | pending |        |
| U3 | 1    | [03-screens-viewports.md](03-screens-viewports.md) | edit | `plugins/vwf/assets/templates/canvas-claude.md`, `plugins/vwf/assets/templates/screen-prompt.md`, `plugins/vwf/skills/screens/SKILL.md`, `plugins/vwf/skills/screens/references/prompt-mode.md`, `plugins/vwf/skills/screens/references/import-mode.md`, `plugins/vwf/skills/import-screens/SKILL.md`, `plugins/vwf/assets/design-adapter.md`, `plugins/vwf/skills/design-system/SKILL.md`, `plugins/vwf/assets/vwf-config.md`, `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`, `plugins/stackgen/stacks/design-tool/claude-design/skills/design-import-screens/references/canvas-push.md`                                              | —              | pending |        |
| U4 | 1    | [04-execute-doctor.md](04-execute-doctor.md)       | edit | `plugins/vwf/assets/harness.md`, `plugins/vwf/assets/execute-stages.md`, `plugins/vwf/agents/execute-ux-reviewer.md`, `plugins/vwf/skills/docs-sync/SKILL.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`, `plugins/vwf/skills/setup/references/format-lineage.md`, `plugins/vwf/skills/setup/SKILL.md`                                                                                                                                                                                                                                                                                                                                                       | —              | pending |        |
| U5 | 2    | [05-docs.md](05-docs.md)                           | edit | `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`, `docs/memory/decisions/2026-09-23-watch-tv-spatial-platforms.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                            | U1, U2, U3, U4 | pending |        |
| U6 | 3    | [06-gates-and-bump.md](06-gates-and-bump.md)       | edit | `site/package.json`, `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/stackgen/stacks/design-tool/claude-code/pack.yaml`, `plugins/stackgen/stacks/design-tool/claude-design/pack.yaml`, `plugins/stackgen/stacks/bundles/claude-code.md`, `plugins/stackgen/stacks/bundles/claude-design.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                 | U5             | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                      | Why it collides                                      | Owner                            |
| ------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------- |
| `plugins/vwf/.claude-plugin/plugin.json`                                  | several units bumping one version is a lost update   | U6                               |
| `plugins/stackgen/.claude-plugin/plugin.json`                             | same                                                 | U6                               |
| `site/package.json`                                                       | same                                                 | U6                               |
| the two design-tool `pack.yaml` files and their two bundle pins           | a pack version and its pin move in one commit        | U6                               |
| `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json` | generated; regenerating mid-wave races               | U6                               |
| `site/src/content/docs/**`, `.claude/**` docs, `readme.md`, `CLAUDE.md`   | n units editing one doc                              | U5                               |
| `plugins/vwf/assets/vwf-config.md`                                        | U3 adds the viewport key; U4's doctor check cites it | U3 (U4 reads it, never edits it) |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Four disjoint path sets (vocabulary and
  architecture; blueprint and authoring; screens, canvas and viewports; execute,
  doctor and the stale format passages). No file is in two lists, and no unit
  needs another's edit to make its own: each writes the three tokens and the
  rulings from this file.
- **Wave 2 — U5.** Docs, after every wave-1 unit's `DOCS FALSIFIED:` lines are
  in.
- **Wave 3 — U6.** Versions and generators, last.

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

plus the wave review, plus every report read for `UNRESOLVED:`. Inside wave 3
the marketplace and inventory freshness lines fail transiently between U6's
edits and its regeneration — expected, not a break; U6 returns only once both
are green.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                   |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed vwf and stackgen into the dev marketplace under `X.Y.Z+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |

## Gates the orchestrator keeps

1. **Every closed-list site names the new tokens.** For each file in the Facts
   section's site list under U1–U5, `grep -c 'watch'`, `grep -c '\btv\b'` and
   `grep -c 'spatial'` are each at least 1; and
   `grep -rnE '(six|seven|Six|Seven)[* ]+(screen )?platforms' plugins/vwf site/src/content/docs`
   returns nothing. Pass: every count ≥ 1, the count grep empty.
2. **The viewport override is wired end to end.**
   `grep -l 'design.viewports' plugins/vwf/assets/vwf-config.md plugins/vwf/assets/templates/canvas-claude.md plugins/vwf/skills/screens/SKILL.md plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md plugins/stackgen/stacks/design-tool/claude-design/skills/design-import-screens/references/canvas-push.md plugins/vwf/skills/doctor/references/stack-checks.md`
   lists all six files. Pass: six paths.
3. **No wrapped code span.** After `code:precommit`, grep this folder's files,
   `site/src/content/docs/plugins/vwf.md` and the new decision doc for lines
   ending in a bare backtick, and for lines with an odd count of backticks.
   Pass: every hit is a span that is closed on the same line — none split by the
   formatter.

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

- **Flutter claiming the new tokens** — Flutter has no watchOS, tvOS or visionOS
  target (D9).
- **The checker's retired-`web` hint** — no behaviour gain, and it would add
  runnable code and a review row (D10).
- **A format bump** — additive change, precedent `1a07016d` (D4).
- **The Swift pack set itself** — plan 2, which requires this folder.
- **A public release** — held for plan 2 (D12).
- **Multiple viewport sizes per platform** — declined for now (D7); parked with
  P1.

## Parked

- **P1 — OS- and vendor-specific features inside a form-factor platform.**
  Raised by the user 2026-09-23: with the native stacks, a product should be
  able to build iOS-only features such as the Dynamic Island, and features
  specific to Android device families such as Samsung's or OnePlus's, inside
  `mobile`. The user ruled it "a massive effort" that gets its **own dedicated
  plan**. It should also take up multiple frame sizes per platform (a size list
  per product, rejected under D7 for now), since device-frame fidelity — the
  island versus the notch, a watch's corner radius, a TV's safe area — is where
  it lands. Suggested entry point: a `/vwf:backlog add`, then
  `/vwf:change-plan`.
- **P2 — `canvas-claude.md` Layout gaps.** The per-platform Layout block has no
  `site` or `webapp` entry and describes `desktop` as browser-chrome
  (`plugins/vwf/assets/templates/canvas-claude.md:48-66`). Predates this change;
  U3 adds the three new blocks and the override text only.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-23-watch-tv-spatial-platforms

or let the queue pick it, by priority:

/vwf:execute next
