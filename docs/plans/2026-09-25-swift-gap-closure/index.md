---
type: vwf-change-plan
title: Swift gap closure — the swift packs' and swiftui's open gaps, and
  doctor's folds
requires: []
backlog: []
---

# Plan — Swift gap closure — the swift packs' and swiftui's open gaps, and doctor's folds (2026-09-25)

## Status

**RUNNING**

RUNNING since 2026-09-25 in .claude/worktrees/2026-09-25-swift-gap-closure

## Consent

| Action                                            | Granted                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                     |
| After landing: `mise run p:plugins:local`         | run                                                                     |
| Release stackgen publicly                         | none — rides the unreleased 1.32.0 (last tag stackgen-v1.31.0); no bump |
| Release vwf publicly                              | none — rides the unreleased 19.46.0 (last tag vwf-v19.45.1); no bump    |
| Release site publicly                             | none — rides the unreleased 1.1.47 (last tag site-v1.1.46); no bump     |
| Release installer publicly                        | none                                                                    |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

The `Release` rows are **intent**: no release step. The changes ship with the
pending release, which the user cuts with `/release` (A7).

## Goal

After this lands, every open gap the three live Swift-chain folders
(`2026-09-23-swift-stack-mechanism`, `2026-09-23-swift-package-stack`,
`2026-09-23-swiftui-app-stack`) still carry is closed, except the cross-pack
gate items, which plan B (`2026-09-25-gate-hardening`, requires this one) owns.
Once B lands, the three folders are archived.

Plan **A** of two, split at the interview: A is the Swift and SwiftUI docs and
tasks plus doctor's folds; B is gate hardening across packs. B requires A
because both touch the swift packs' tasks. No reversal.

## Facts the survey established

- **Already closed, nothing to plan** (verified in the tree at `ec79a56c`):
  package-stack G1 (`--deduplicate` — the tasks now use a mktemp file and exit
  on ls-files failure), G2 (conventions/build-and-run agree), swift-format
  lint-rule wording (the pack now says lint rules stay at upstream defaults),
  swiftlint.yml any-depth wording; app-stack G1, G2, G4 (amendment 2026-09-24),
  G3, G5, G7, G8 and G9's two medium findings plus its lows (1) macOS-pin
  wording and (2) the audit's `XCODE_VERSION` check (gap-closure plan).
- **Still open, this plan:**
  - `package-manager/swiftpm/conventions.md:33-34` says `.build/` and
    `.swiftpm/` are "regenerable and ignored". Nothing ignores `.swiftpm/`:
    repo-hygiene appends upstream `Swift.gitignore` for a `swift` repo
    (`repo-hygiene/repo-hygiene/conventions.md:111,132-140`), which ignores
    `.build/` and leaves `.swiftpm` commented out.
  - `toolchain-gate/swift-format/skills/swift-format/SKILL.md:36-42` shows
    `swift format lint --strict` and `--in-place` with
    `--recursive Sources Tests Package.swift`; the task (`language/swift`
    `code/format:167-175`) runs `swift format format --in-place` and
    `lint --strict --parallel` over git-derived `swift_targets`, never
    `--recursive`.
  - `toolchain-gate/swiftlint/conventions.md:32` (37 chars) and `:35` (56) are
    ragged against 65–80-char neighbours.
  - swiftui (pack 0.2.0): "Catalyst" appears nowhere; the desktop audit and
    golden use a bare `platform=macOS` (`skills/ux-gate/SKILL.md:136-137`,
    `config/.config/mise/tasks/test/golden:88`).
  - swiftui `test/golden:103`: with `--record`, all three overrides and no pin,
    the refusal names "the pinned simulator", which does not exist.
  - swiftui `test/golden:38` and `conventions.md:85` say a run with no pin is
    refused; `golden:80-82` accept the three overrides and refuse only an empty
    platform.
  - swiftui `skills/ux-gate/SKILL.md:159-160` emit `viewport:` and `a11y:`
    lines. vwf's ux-gate contract
    (`plugins/vwf/assets/stack-adapter.md:421-425`) defines only
    `rendered: ok | n/a`, `reason` (required when n/a) and
    `findings: [{severity, screen, what, where}]`. No other pack emits them.
  - `plugins/vwf/skills/doctor/SKILL.md:218` (45 chars), `:242` (~98) and `:246`
    (36) are ragged.
- **Not actionable, recorded only:** mechanism's Owns-widened note, stale
  consent row and U1 assumption; gap-closure's G1 (accepted as is).
- **Formatting.** `plugins/**/*.md` is not dprint-formatted: fold by hand at the
  surrounding width (~80). `site/**`, `readme.md`, `CLAUDE.md` are.
- **Versions.** stackgen 1.32.0 (tag stackgen-v1.31.0), vwf 19.46.0 (tag
  vwf-v19.45.1), site 1.1.47 (tag site-v1.1.46) — all already one bump past
  their tag. Packs: swiftpm 0.1.1, swift-format 0.1.0, swiftlint 0.1.0, swiftui
  0.2.0.
- **Commit convention.** `.config/git-conventional-commits.yaml`: types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Backlog.** No open item covers these gaps; B63 (binaries on packs) and
  per-platform simulator pins stay parked.

## Assumed decisions — confirm or override at review

| #  | Decision            | Ruling                                                                                                                                                                                                               | Rejected                                                         | Unit |
| -- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---- |
| A1 | `.swiftpm/` claim   | Reword to match upstream: the conventions say `.build/` is ignored by the Swift gitignore section, and `.swiftpm/` is left to the repo, as upstream leaves it                                                        | ignore `.swiftpm/` too; ignore `.swiftpm/*` but `configuration/` | U1   |
| A2 | Stale and ragged    | swift-format's SKILL.md shows the command the `code:format` task actually runs; swiftlint conventions' ragged folds are reflowed                                                                                     | —                                                                | U1   |
| A3 | Mac Catalyst        | State native macOS only: `desktop` means a native macOS target, and Mac Catalyst is not supported by the ux-gate or golden                                                                                           | support Catalyst via the pin; detect it from the scheme          | U2   |
| A4 | ux-gate extra lines | Fold into findings: the swiftui ux-gate drops `viewport:` and `a11y:`, reports the audited device or viewport in `reason` or a finding's `where`, and a11y failures as findings; vwf's contract is unchanged         | add them to vwf's contract; contract allows extra keys           | U2   |
| A5 | golden wording      | The `--record` refusal names the overrides actually given; "a run with no pin is refused" becomes "a run with no pin and not all three overrides is refused", in golden and conventions                              | —                                                                | U2   |
| A6 | No review row       | The only runnable code is golden's refusal message and a comment; the wave review plus `p:plugins:shellcheck` cover it                                                                                               | a review row                                                     | —    |
| A7 | Versions            | Ride the unreleased bumps: no stackgen, vwf or site bump. A changed pack is patch-bumped only if its `pack.yaml` version is unchanged since `stackgen-v1.31.0`, with every bundle pin that names it. No release step | bump again; a `/release` step as `ask`                           | U5   |

## New dependencies

None.

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                     | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | -------- |
| U1 | 1    | [01-swift-packs.md](01-swift-packs.md)       | edit | `plugins/stackgen/stacks/package-manager/swiftpm/conventions.md`, `plugins/stackgen/stacks/toolchain-gate/swift-format/skills/swift-format/SKILL.md`, `plugins/stackgen/stacks/toolchain-gate/swiftlint/conventions.md`                                                                                                                                                  | —          | green   | 9ea561d2 |
| U2 | 1    | [02-swiftui.md](02-swiftui.md)               | edit | `plugins/stackgen/stacks/app-framework/swiftui/skills/**`, `plugins/stackgen/stacks/app-framework/swiftui/conventions.md`, `plugins/stackgen/stacks/app-framework/swiftui/config/.config/mise/tasks/test/golden`                                                                                                                                                         | —          | green   | 922a10fc |
| U3 | 1    | [03-doctor-folds.md](03-doctor-folds.md)     | edit | `plugins/vwf/skills/doctor/SKILL.md`                                                                                                                                                                                                                                                                                                                                     | —          | green   | 8d5b0b85 |
| U4 | 2    | [04-docs.md](04-docs.md)                     | edit | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`                                                                                                                                                                                        | U1, U2, U3 | pending |          |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md) | edit | `plugins/stackgen/stacks/package-manager/swiftpm/pack.yaml`, `plugins/stackgen/stacks/toolchain-gate/swift-format/pack.yaml`, `plugins/stackgen/stacks/toolchain-gate/swiftlint/pack.yaml`, `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`, `plugins/stackgen/stacks/bundles/*.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json` | U4         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                          | Why it collides                       | Owner |
| --------------------------------------------------------------------------------------------- | ------------------------------------- | ----- |
| every `pack.yaml` and its pins in `bundles/*.md`                                              | a version and its pin move together   | U5    |
| `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`                     | generated                             | U5    |
| swiftui `config/.config/mise/tasks/code/format`, `code/lint`                                  | plan B edits them; this plan does not | none  |
| docs — `site/**`, `.claude/**`, `readme.md`, `CLAUDE.md`, `plugins/stackgen/stacks/readme.md` | n units editing one doc               | U4    |

## Waves

- **Wave 1 — U1, U2, U3.** Three disjoint trees: the swift toolchain packs, the
  swiftui pack, vwf's doctor.
- **Wave 2 — U4**, docs. **Wave 3 — U5**, versions and generators.

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
the freshness lines are red between U5's edits and its regeneration — expected.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                   |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed stackgen and vwf into the dev marketplace under `X.Y.Z+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |

## Gates the orchestrator keeps

1. **ux-gate keys.**
   `grep -nE '^\s*(a11y|viewport):' plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/SKILL.md`
   is empty. Pass: empty.
2. **`.swiftpm/` claim.**
   `grep -n 'swiftpm' plugins/stackgen/stacks/package-manager/swiftpm/conventions.md`
   shows no line saying `.swiftpm/` is ignored. Pass: none.
3. **Native macOS.**
   `grep -rn 'Catalyst' plugins/stackgen/stacks/app-framework/swiftui` finds the
   native-macOS-only statement in the ux-gate and the swiftui skill. Pass: at
   least one hit in each.

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

- **Cross-pack gate hardening** — the linter pin, dprint's positional args,
  `require_serial`, linter ignores, repo-hygiene's dprint-clean payload: plan B.
- **Supporting Mac Catalyst** — declined (A3).
- **Changing vwf's ux-gate contract** — declined (A4).
- **swiftui `code/format` and `code/lint`** — plan B's.
- **A public release** (A7).

## Parked

- **Per-platform simulator pins** — optional `SIMULATOR_DEVICE_<PLATFORM>`-style
  pins declared through `machine_env:`, so tablet, watch, tv and spatial get
  their own goldens and audit (from gap-closure's Parked).
- **B63** — declare the `binaries` fact on the existing packs that need a
  non-mise binary.
- **Archiving the three Swift-chain folders** — once plan B lands, asked for in
  prose.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green       | doctor blocking predicates clear (mise, graphify CLI, graph); no `covers:` so format check skipped; edit units only so LSP and conventions fetch skipped; all nine wave gate lines pass                                                                                                                                                                                               | —        |
| 1    | U1        | opus  | 1     | green       | .build/ ignored via upstream Swift section, .swiftpm/ left to repo; swift-format SKILL quotes task's real calls (file set = tracked plus untracked-not-ignored, per ls-files); swiftlint paragraph reflowed. DOCS FALSIFIED none; GAP none                                                                                                                                            | 9ea561d2 |
| 1    | U3        | opus  | 1     | green       | reflowed all five §9 paragraphs to 80 columns, words unchanged; rejoined a split code span onto one line. DOCS FALSIFIED none; GAP none                                                                                                                                                                                                                                               | 8d5b0b85 |
| 1    | U2        | opus  | 1     | green       | Catalyst unsupported stated in ux-gate and macos.md; ux-gate returns vwf's three keys only (also dropped `artifacts:`, per A4's exactly-three reading; paths go in the failed finding's `where`); golden refusal names given overrides, comment reworded; conventions :85 and :124 reworded. DOCS FALSIFIED: site swiftui pages may cite viewport/a11y lines — handed to U4; GAP none | 922a10fc |
| 1    | R1        | opus  | 1     | findings(6) | golden:103 pinned-case message garbled by `:-` expansion [U2]; folds over 80 at golden:42, ux-gate SKILL:156,:186 [U2], swift-format SKILL:49 [U1]; testing.md:91 still says no-pin refused, and conventions:85 overrides wording spans ux-gate [U2]. CONTRACT clean, RULINGS clean                                                                                                   |          |
| 1    | U1        | opus  | 2     | green       | R1 loop-back: swift-format SKILL :48-52 refolded to 80 columns, words unchanged                                                                                                                                                                                                                                                                                                       | 9ea561d2 |
| 1    | U2        | opus  | 2     | green       | R1 loop-back: golden refusal message picked by if/else (logic unchanged), comment refolded; ux-gate paragraphs refolded, `where:` example shortened with comment; testing.md A5 wording; conventions:85 scoped to test:golden. SKILL.md:146 left wide (one-line code span)                                                                                                            | 922a10fc |
| 1    | R1        | opus  | 2     | pass        | all six round-1 findings resolved; golden refusal condition byte-identical; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                             |          |
| 1    | gate      | —     | 1     | green       | all nine wave gate lines pass; no UNRESOLVED in any report                                                                                                                                                                                                                                                                                                                            | —        |
| 2    | U4        | opus  | 1     | green       | site stackgen.md swiftui ux-gate passage fixed (not-run platforms are findings, three keys only, desktop native macOS, no Catalyst); no viewport/a11y/artifacts, .swiftpm-ignored or --recursive claims elsewhere in Owns. GAP: docs-sync's surveyor subagent returned no report, so the unit surveyed the Owns trees by grep instead                                                 |          |
| 2    | R2        | opus  | 1     | pass        | only change site stackgen.md:320-332, in Owns, faithful to A3 and A4; Owns trees grepped clean for every wave-1 claim; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                  |          |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-25-swift-gap-closure

or let the queue pick it, by priority:

/vwf:execute next
