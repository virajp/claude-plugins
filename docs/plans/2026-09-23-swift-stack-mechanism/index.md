---
type: vwf-change-plan
title: Swift stack mechanism — the binaries fact, doctor, init detection,
  exclusion lists
requires: [ docs/plans/2026-09-23-watch-tv-spatial-platforms ]
backlog: []
---

# Plan — Swift stack mechanism — the binaries fact, doctor, init detection, exclusion lists (2026-09-23)

## Status

**RUNNING**

RUNNING since 2026-09-23 in .claude/worktrees/2026-09-23-swift-stack-mechanism

## Consent

| Action                                            | Granted                                                                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                       |
| After landing: `mise run p:plugins:local`         | run                                                                                       |
| Release vwf publicly                              | minor — 19.44.0 → 19.45.0, by hand in `plugins/vwf/.claude-plugin/plugin.json`            |
| Release stackgen publicly                         | minor — 1.28.0 → 1.29.0, by hand in `plugins/stackgen/.claude-plugin/plugin.json`         |
| Release site publicly                             | patch — 1.1.41 → 1.1.42, `mise run p:site:version` (bare, no positional, on a clean tree) |
| Release installer publicly                        | none                                                                                      |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

The `Release` rows are **intent, not authorisation**: the user ruled for **no
release step** in any plan of this chain; the user runs `/release` when ready.
The three touched existing packs move a patch each — `toolchain-gate/dprint`
1.1.0 → 1.1.1, `toolchain-gate/pre-commit` 1.1.4 → 1.1.5,
`repo-hygiene/repo-hygiene` 1.2.0 → 1.2.1 — with their bundle pins.

## Goal

After this lands, the machinery a native Swift stack needs exists before any
Swift pack does: a pack can declare executables it needs outside mise
(`facts.binaries`), and doctor reports a missing one as blocking once the
project is pinned; init detects a Tuist app from `Project.swift` or
`Tuist.swift`; the hygiene pack maps Swift slugs to the `Swift.gitignore`
section; and Swift's build trees (`.build`, `Derived`) join the formatter
exclusion lists.

This is plan **2a** of a four-plan chain for backlog item B56 (full Swift
support), re-cut on 2026-09-23 from the single plan
`docs/plans/archived/2026-09-23-swift-native-stack` at the user's request, for
reliability: 2a mechanism → 2b the Swift package stack → 2c the SwiftUI app
stack → 2d the SwiftUI platform doctrine (which carries B56). The rulings are
the ones the user gave at that plan's interview, carried over unchanged with
their ids. It requires plan 1 (`2026-09-23-watch-tv-spatial-platforms`) only to
serialize the version files both edit. No reversal.

## Facts the survey established

- **Facts flow.** `pack.yaml`'s `languages[].facts{lsp, mise_tool, manifest}`
  (`plugins/stackgen/assets/pack-format.md:157-184`, honest-facts rule
  `:389-391`) → the template payload's `language_facts`
  (`plugins/stackgen/skills/stackgen-stack-template/SKILL.md:87`) → vwf's
  contract (`plugins/vwf/assets/stack-adapter.md:355`,
  `plugins/vwf/assets/stack-vocabulary.md:48`, "the same three facts") →
  doctor's per-language checks
  (`plugins/vwf/skills/doctor/references/stack-checks.md:65-103`), whose
  Toolchain bullet skips a `—`/`n/a` tool **silently** — so a missing Xcode is
  never reported today.
- **init detection.** `plugins/vwf/skills/init/SKILL.md:340` maps
  `Package.swift` → swift; the six-key vocabulary is at `:346-358`. A Tuist app
  (only `Project.swift` / `Tuist.swift`) is not detected.
- **Hygiene.** `stacks/repo-hygiene/repo-hygiene/conventions.md:111` has the
  `swift → Swift.gitignore` row; the slug-to-key prose (`:124-131`) names only
  the node and dart cases, so a Swift slug is proposed rather than appended
  (`:140-143`). Whether upstream `Swift.gitignore` covers Tuist's `Derived/` is
  unverified.
- **Exclusion lists (rule 15).** Today `.claude`, `.git`, `.turbo`, `.venv`,
  `build`, `dist`, `graphify-out`, `node_modules`, `target` plus lockfiles, in
  `stacks/toolchain-gate/dprint/config/.config/dprint.json:5-18`,
  `stacks/toolchain-gate/dprint/config/.config/taplo.toml:14-27` and
  `stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml:48-61`;
  `gitleaks.toml:46-54` is a subset and stays untouched. These files are
  **payload** — never formatted with this repo's dprint.
- **Pins.** `toolchain-gate/dprint@1.1.0` and `toolchain-gate/pre-commit@1.1.4`
  in `stacks/bundles/repo-gates.md:7,10`; `repo-hygiene/repo-hygiene@1.2.0` in
  `stacks/bundles/repo-hygiene.md:7`.
- **Versions** (after plan 1): vwf 19.44.0, stackgen 1.28.0, site 1.1.41.
- **Commit convention.** Types `ops`, `docs`, `merge`, `feat`, `fix`,
  `refactor`; no scopes.
- **Formatting.** `plugins/**/*.md` is not dprint-formatted; `site/**`,
  `.claude/**`, `docs/**` are.

## Assumed decisions — confirm or override at review

Ids carried from the retired `2026-09-23-swift-native-stack` folder.

| #   | Decision        | Ruling                                                                                                                                                                                                                                                                              | Rejected                                                | Unit   |
| --- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------ |
| S1  | Chain shape     | Four plans: 2a mechanism, 2b package stack, 2c SwiftUI app stack, 2d platform doctrine; each lands something working on its own                                                                                                                                                     | one plan (retired); splitting plan 1 too                | —      |
| E6  | Xcode           | Tuist's `compatibleXcodeVersions` pins the version. A new optional language fact `binaries: [<name>…]` in `pack.yaml`, carried through `language_facts`, lets doctor report a missing binary on `PATH` as **blocking** once the project is pinned; the swiftui tasks also fail fast | xcodes + `.xcode-version`; no pin; tasks-only fail-fast | U1, U2 |
| E12 | Exclusion lists | `.build` and `Derived` join all three formatter lists; `.swiftpm` does not (it holds user config); gitleaks untouched                                                                                                                                                               | leave the lists alone                                   | U1     |
| E13 | init detection  | init's manifest table maps `Project.swift` and `Tuist.swift` → swift, beside `Package.swift`                                                                                                                                                                                        | —                                                       | U2     |
| S2  | Serialization   | 2a requires plan 1 only because both bump the vwf, stackgen and site versions                                                                                                                                                                                                       | run 2a beside plan 1 (version-file conflicts at merge)  | —      |
| S3  | No review row   | 2a lands prose and config payload, no runnable code; the wave review is the only check                                                                                                                                                                                              | a review row                                            | —      |
| E17 | Release         | No release step                                                                                                                                                                                                                                                                     | `/release` as `ask`; as `run`                           | U4     |

## New dependencies

None.

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Depends on | Status | Commit   |
| -- | ---- | -------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------ | -------- |
| U1 | 1    | [01-stackgen-side.md](01-stackgen-side.md)   | edit | `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`, `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`, `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json`, `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/taplo.toml`, `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`                                                           | —          | green  | 4f00246c |
| U2 | 1    | [02-vwf-side.md](02-vwf-side.md)             | edit | `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/assets/stack-vocabulary.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`, `plugins/vwf/skills/init/SKILL.md`                                                                                                                                                                                                                                                                                                          | —          | green  | f3cf5235 |
| U3 | 2    | [03-docs.md](03-docs.md)                     | edit | `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`; widened by R1 and R2: `plugins/stackgen/assets/taxonomy.md` (facts passage), `plugins/vwf/skills/doctor/SKILL.md` (checks summary, §9 blocking and degraded lists)                                                                                                                                                                     | U1, U2     | green  | 48533bdc |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md) | edit | `site/package.json`, `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `plugins/stackgen/stacks/toolchain-gate/dprint/pack.yaml`, `plugins/stackgen/stacks/toolchain-gate/pre-commit/pack.yaml`, `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`, `plugins/stackgen/stacks/bundles/repo-gates.md`, `plugins/stackgen/stacks/bundles/repo-hygiene.md`, `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json` | U3         | green  |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                             | Why it collides                                             | Owner |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----- |
| the vwf, stackgen and site version files                                         | several units bumping one version is a lost update          | U4    |
| the dprint, pre-commit, repo-hygiene `pack.yaml` files and their two bundle pins | U1 edits their payload; a version and its pin move together | U4    |
| `plugins/stackgen/stacks/inventory.md`, `.claude-plugin/marketplace.json`        | generated                                                   | U4    |
| docs — `site/**`, `.claude/**`, `readme.md`, `CLAUDE.md`                         | n units editing one doc                                     | U3    |

## Waves

- **Wave 1 — U1, U2.** stackgen's side and vwf's side of the same fact: disjoint
  files; each writes the `binaries` field from E6's wording, so neither waits on
  the other.
- **Wave 2 — U3**, docs.
- **Wave 3 — U4**, versions and generators.

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
the freshness lines are red between U4's edits and its regeneration — expected.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                   |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages the changed vwf and stackgen into the dev marketplace under `X.Y.Z+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |

## Gates the orchestrator keeps

1. **The fact is wired end to end.** `grep -l 'binaries'` over `pack-format.md`,
   the stack-template `SKILL.md`, `stack-adapter.md`, `stack-vocabulary.md` and
   `stack-checks.md` lists all five. Pass: five paths.
2. **Rule 15 holds with the new entries.** `mise run p:plugins:check` reports no
   rule-15 finding, and each of the three lists contains `.build` and `Derived`.
   Pass: no finding, both entries in all three.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore`, `git stash` or a
formatter's `--fix` over any path outside its Owns, and never runs this repo's
dprint over a `config/` payload file.

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

- **Any Swift pack or bundle** — plans 2b, 2c and 2d.
- **The gitleaks allowlist** — a subset; unchanged.
- **Declaring `binaries` on an existing pack** (Flutter's `flutter`, say) — the
  field is optional; retrofitting other packs is a later choice.
- **A public release** (E17).

## Parked

- **Retrofit `binaries` onto existing packs** — Flutter needs `flutter` on
  `PATH`, and other packs may have non-mise binaries; not needed for B56.
- The retired folder's parked items stand, carried into plan 2d's Parked list.

## Gaps surfaced during execution

- **Contested, convergence guard (wave 2 review).**
  `plugins/vwf/skills/doctor/SKILL.md:201` and `:246` keep a ragged short line
  where U3 inserted text into §9's blocking and degraded lists; the paragraphs
  were not reflowed. Cosmetic only; the wave review's two rounds ended with the
  count unchanged, so the loop stopped rather than settled — a hand reflow
  closes it.
- **Owns widened at run time.** U3's Owns widened to
  `plugins/stackgen/assets/taxonomy.md` (facts passage) after R1, and to
  `plugins/vwf/skills/doctor/SKILL.md` (checks summary, then §9's two lists)
  after R1 and R2 — passages the plan's Goal falsified that no unit owned.
- **Consent row stale.** The site release row reads 1.1.41 → 1.1.42, but plan 1
  had already taken the site to 1.1.42; U4 bumped a patch from the tree, to
  1.1.43, and the U4 commit says so.
- **U1 assumption.** What marks a Tuist app for the hygiene `Derived/` line:
  assumed `swift-swiftui` pinned, or a `Project.swift` / `Tuist.swift` found by
  the stack read (E13).

## Run log

| Wave | Unit      | Model          | Round | Outcome   | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Commit   |
| ---- | --------- | -------------- | ----- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —              | —     | green     | doctor blocking predicates clear (mise, graphify CLI, graph in main checkout); 9 wave gate lines green on the untouched tree; code-unit preflight and conventions skipped (edit units only); format check skipped (no covers:)                                                                                                                                                                                                                                                                           | —        |
| 1    | U1        | opus           | 1     | green     | 6 files; binaries fact in pack-format and stack-template payload, Swift hygiene mapping with Derived/ appended line (upstream Swift.gitignore lacks it), .build and Derived in three formatter lists; DOCS FALSIFIED site stackgen.md:641; GAP what marks a Tuist app — assumed swift-swiftui pinned or Project.swift/Tuist.swift read                                                                                                                                                                   |          |
| 1    | U2        | opus           | 1     | green     | 4 files; binaries as optional fourth fact, doctor Binaries bullet (blocking once pinned), init maps Project.swift/Tuist.swift; DECIDED binaries check reads materialized language_facts only; no GAP                                                                                                                                                                                                                                                                                                     |          |
| 1    | R1        | sonnet-default | 1     | findings  | 6 findings; CONTRACT clean, RULINGS clean; 2 looped back (U1 pack-format.md:392 blocking-once-pinned drift, U2 stack-vocabulary.md:53 fold); 4 docs passages handed to U3 as DOCS FALSIFIED (site vwf.md:720,:1057, stackgen.md:582, .claude vwf-plugin skills-and-agents.md:27,:40, assets.md:27) plus 2 in unowned plugin files — GAP: U3 Owns widened to plugins/stackgen/assets/taxonomy.md:23 (facts list lacks binaries) and plugins/vwf/skills/doctor/SKILL.md:176 (summary lacks Binaries check) |          |
| 1    | U1        | opus           | 2     | green     | pack-format.md honest-facts rule now blocking once pinned, degradation while unresolved                                                                                                                                                                                                                                                                                                                                                                                                                  | 4f00246c |
| 1    | U2        | opus           | 2     | green     | stack-vocabulary.md paragraph refolded, wording unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                | f3cf5235 |
| 1    | R1        | sonnet-default | 2     | clean     | FINDINGS 0; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 1    | gate      | —              | —     | green     | all 9 wave gate lines green; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 2    | U3        | opus           | 1     | green     | 6 files: site stackgen.md and vwf.md, .claude vwf-plugin skills-and-agents.md and assets.md, taxonomy.md:23, doctor/SKILL.md:176; docs-sync surveyor found nothing further; DECIDED CLAUDE.md and stackgen-plugin skill need no edit                                                                                                                                                                                                                                                                     |          |
| 2    | R2        | sonnet-default | 1     | findings  | 2 findings; CONTRACT clean, RULINGS clean; stack-checks.md:5 intro looped to U2 (its Owns); doctor/SKILL.md:196 and :239-245 — GAP: U3 Owns widened to those two passages                                                                                                                                                                                                                                                                                                                                | —        |
| 2    | U2        | opus           | 3     | green     | wave 2 loop-back: stack-checks.md intro §3 blocking list adds missing binaries, pinned/unresolved qualifier on both §3 items (R2 verified body :88-92 agrees)                                                                                                                                                                                                                                                                                                                                            | 646d21e7 |
| 2    | U3        | opus           | 2     | green     | doctor/SKILL.md §9 blocking and degraded lists gain a missing binary                                                                                                                                                                                                                                                                                                                                                                                                                                     |          |
| 2    | R2        | sonnet-default | 2     | contested | 2 findings, both fold only: doctor/SKILL.md:201 and :246 ragged lines after U3's edit; round cap 2 reached and count did not fall — convergence guard, recorded as gap; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                    | —        |
| 2    | gate      | —              | —     | green     | all 9 wave gate lines green; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 3    | U4        | opus           | 1     | green     | site 1.1.42 → 1.1.43 via bare p:site:version (tree already read 1.1.42; consent row assumed 1.1.41), vwf 19.45.0, stackgen 1.29.0, dprint 1.1.1, pre-commit 1.1.5, repo-hygiene 1.2.1 with pins; inventory and marketplace regenerated; GAP commit subject says site 1.1.42, written as 1.1.43                                                                                                                                                                                                           |          |
| 3    | R3        | sonnet-default | 1     | clean     | 1 finding, the commit subject's site version — applied by the orchestrator; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 3    | gate      | —              | —     | green     | all 9 wave gate lines green (U4 ran them); no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-23-swift-stack-mechanism

or let the queue pick it, by priority:

/vwf:execute next
