---
type: vwf-change-plan
title: Release levels recorded
requires: [ docs/plans/2026-10-08-typescript-ux-gate-renders ]
backlog: []
backlog_pieces: [ B96 ]
---

# Plan — Release levels recorded (2026-10-08)

## Status

**COMPLETE**

COMPLETE 2026-10-09 — 5469cf91 4ff5409a a94338cd eca3296b b9998eaa c7d09d2a
a9063a43

## Consent

| Action                                            | Granted                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                       |
| After landing: `mise run p:plugins:local`         | run                                                                       |
| Release vwf publicly                              | none — no bump; U7 records `vwf: MAJOR` in `.config/releases.yaml` (D13)  |
| Release site publicly                             | none — no bump; U7 records `site: PATCH` in `.config/releases.yaml` (D13) |
| End an `all` run after landing                    | yes                                                                       |

The executor that runs this plan is the vwf that this plan changes, at its old
version. Thus this folder keeps the old Consent shape. The two `Release` rows
say `none` because no unit bumps a version and no step releases. The new
`## Release levels` section below records the levels, and U7 writes them to
`.config/releases.yaml`. The End an `all` run row is `yes`: this plan edits vwf,
and the next plan (the B96 release tasks) needs the new executor. Only a
restarted session loads the vwf that `p:plugins:local` stages.

## Release levels

| Project | Level | Reason                                                                                                                                          |
| ------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| vwf     | MAJOR | breaks users: the release question, the release after-landing steps and the `hold release:` override are removed; the plan folder changes shape |
| site    | PATCH | the manual pages describe the new behaviour; the site gets no new feature                                                                       |

## Goal

Each vwf plan records a derived release level for each project that it changes.
At landing, `/vwf:execute` raises these levels in `.config/releases.yaml` and
bumps no version. A later release task reads the file, bumps and tags; that task
is the next plan (Parked, B96).

This plan is plan 1 of 2 for backlog item B96. Plan 2 changes this repo's
release tasks to read the file.

**Reversals of standing decisions** (confirmed by the user on 2026-10-08):

1. Ruling 9 of 2026-09-17
   (`docs/memory/decisions/2026-09-17-after-landing-runs-on-recorded-consent.md`),
   confirmed again on 2026-10-07 (`2026-10-07-plans-carry-every-answer.md`), is
   reversed. The release question is gone, and no plan carries a release
   after-landing step. A release is always a hand step with `/release`.
2. The exception in `CLAUDE.md`, the release skill, `installer/CLAUDE.md` and
   `.claude/docs/ci-and-releases.md` — "unless the plan folder records that
   release as `run`" — goes. The rule is now: always ask before a release task.
3. Override O4 of 2026-10-07 (`2026-10-07-execute-all-overrides.md`) is retired.
   `/vwf:execute all` no longer asks "one release at the end" and no longer
   writes `hold release:`.
4. Interview item 18 changes from a question to a stated fact, as item 12
   (priority) is.

## Facts the survey established

- The release intent is prose only. No script or parser reads the
  `Release <project>` Consent rows. The gates-and-bump unit reads them as text.
- Release intent is asked and recorded at:
  - `plugins/vwf/assets/plan-interview.md:147-157` (item 18 with the 13/17
    rule), `:57` (item 7 "drives the release intent"), item 18a after `:157`.
  - `plugins/vwf/assets/templates/plan-folder.md:58-66` (Consent table,
    `Release` row `:63`), `:68-85` (row prose, "the mode recorded here is the
    consent"), `:130` (gates-and-bump row), `:172-173` (shared-file rows),
    `:208` (unit contract), the "Gates and bump" section near `:384-389`.
  - `plugins/vwf/skills/change-plan/SKILL.md:9` (description), `:150-195` (§4,
    §4c release intent), `:226` (§5 item 6), `:291-293` (§6 fixed last units),
    `:386-388` (never-do list).
  - `plugins/vwf/skills/plan/SKILL.md:341-342`, `:406`, `:522-527`;
    `plugins/vwf/skills/plan/references/plan-doc.md:47`.
- `/vwf:execute` handles it at:
  - `plugins/vwf/skills/execute/SKILL.md:677` (fixed final units), `:749-751`
    (bumps per the consent block), `:776` (final report lists versions bumped),
    `:804-838` (landing), about `:886-912` (after landing; release step runs on
    the same terms), `:950-962` (never-do: no bump outside gates-and-bump).
  - `plugins/vwf/skills/execute/references/edit-unit.md:22` (a unit does not
    bump).
  - `plugins/vwf/skills/execute/references/preflight.md:15-33` reads only the
    `LSP` Consent rows.
  - `plugins/vwf/skills/execute/references/all.md:36-50` (run-level questions;
    "One release at the end" `:44-47`), `:68` (`hold release:` line), `:133-136`
    (held releases run after the last plan).
  - `plugins/vwf/agents/execute-runner.md:39` parses `hold release:`.
- The executor finds the last unit by its role ("the two fixed final units"),
  not by its file name. Old folders with `NN-gates-and-bump.md` thus still run.
- `plan-management` does not read the Consent block
  (`plugins/vwf/skills/plan-management/SKILL.md:331` only says the archive verb
  does not change it).
- `plugins/vwf/assets/vwf-config.md` is the `.config/vwf.yaml` doctrine
  (`config_format 23`). Its reading rules say that a missing section means the
  shipped default, and that an additive key needs no `config_format` bump
  (`design.viewports` is the precedent). The semantics table is at about
  `:218-235`. `/vwf:execute` and `/vwf:change-plan` do not examine
  `config_format`.
- This repo has no `.config/vwf.yaml`. Plan 2 creates it (D16).
- Docs that describe the current model:
  - `site/src/content/docs/plugins/vwf.md:2348` (release intent in the consent
    block), `:2463` (One release at the end), `:2588-2592` (After landing
    validation), `:2674`, `:2716` (fixed final waves), `:3176-3194`
    (`#vwfchange-plan`: release intent), `:3228`.
  - `site/src/content/docs/how-to/operate/ad-hoc-change.md:127-130`, `:255`,
    `:336-337`.
  - `.claude/skills/vwf-plugin/references/skills-and-agents.md:36`, `:46`.
  - `CLAUDE.md:5-7` (Rules: the exception), `:340-342` (the ask rule and its
    exception), and the "Where the detail lives" paragraph near `:62`
    (after-landing steps and `/release`).
  - `installer/CLAUDE.md:219-221`; `.claude/skills/release/SKILL.md:12-16`;
    `.claude/docs/ci-and-releases.md:306`.
- The name "gates-and-bump" appears in:
  `plugins/vwf/skills/{change-plan,plan,execute}/SKILL.md`,
  `plugins/vwf/skills/plan/references/plan-doc.md`,
  `plugins/vwf/assets/templates/plan-folder.md`,
  `.claude/skills/vwf-plugin/references/skills-and-agents.md`,
  `site/src/content/docs/plugins/vwf.md`,
  `site/src/content/docs/how-to/operate/ad-hoc-change.md`. Also in
  `docs/memory/decisions/2026-09-16-one-executor.md` (a record — do not edit)
  and `graphify-out/**` (generated — do not edit).
- vwf is at `21.0.0` now. The B91 chain bumps it to `21.2.0` before this plan
  runs. stackgen goes to `3.1.0`. This plan does not change either
  `plugin.json`.
- The commit convention (`.config/git-conventional-commits.yaml`) allows `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`, with no scopes.
- The three B91 plans own `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/skills/plan/references/delta-checks.md`,
  `site/src/content/docs/**` and `CLAUDE.md`. This plan requires the last of
  them, so it runs on their landed text.

## Assumed decisions — confirm or override at review

| #   | Decision                        | Ruling                                                                                                                                                                                                                                                                                                                           | Rejected                                                            | Unit           |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------- |
| D1  | Split                           | Two chained plans: this plan is vwf; plan 2 is this repo's release tasks                                                                                                                                                                                                                                                         | one plan; vwf only with the tasks done by hand                      | —              |
| D2  | Release steps                   | No plan carries a release after-landing step. `/release` is always a hand step. Ruling 9 of 2026-09-17, the CLAUDE.md exception and override O4 are reversed                                                                                                                                                                     | keep an optional release step at item 17                            | U1–U4, U6      |
| D3  | The file                        | The file is `.config/releases.yaml`. It has one key for each project, with the value `NONE`, `PATCH`, `MINOR` or `MAJOR`. An absent key reads as `NONE`. An absent file reads as all `NONE`                                                                                                                                      | `docs/releases/pending.yaml`; `docs/plans/releases.yaml`            | U1, U4, U5, U7 |
| D4  | Combine                         | The highest level wins. The executor raises a key only when the new level is higher, and never lowers a key. `PATCH` after `MAJOR` stays `MAJOR`. The release tasks (plan 2) clear a key when they release it                                                                                                                    | the last write wins                                                 | U4             |
| D5  | Writer                          | `/vwf:execute` writes the file itself, on the integration branch after the merge, in the commit that marks the plan `COMPLETE`. Two runs at the same time thus cause no merge conflict                                                                                                                                           | the gates unit writes it on the plan branch; a plan-management verb | U4             |
| D6  | Record in the folder            | `index.md` has a fixed-shape `## Release levels` table, columns Project, Level, Reason, after the Consent block. One row for each project the units touch, `NONE` included. The `Release <project>` rows leave the Consent block                                                                                                 | rows in the Consent block; a frontmatter map                        | U1–U4          |
| D7  | Who sets the level              | Interview item 18 is stated, never asked. The planner derives each level from the change: breaks users → `MAJOR`, new behaviour → `MINOR`, a fix → `PATCH`, no user-visible change → `NONE`. It shows each level with its reason at the approval gate, as it shows the priority; the user changes a level there                  | ask the level, as now                                               | U1–U3          |
| D8  | 13 and 17                       | The 13/17 skip leaves the plan text and the gates unit. A level is not a version; the release task applies the skip when it bumps (plan 2)                                                                                                                                                                                       | keep the skip in item 18                                            | U1             |
| D9  | Last unit name                  | The last unit is the "gates unit", file `NN-gates.md`. It runs the generators the plan names and passes the full wave gate. It bumps nothing                                                                                                                                                                                     | keep the name "gates-and-bump"                                      | U1–U4, U6      |
| D10 | Old-shape folders               | A folder with no `## Release levels` section is an old-shape folder. Its units run as written, the executor writes nothing to `.config/releases.yaml`, and the final report says so in one line. Preflight does not refuse it                                                                                                    | preflight refuses the folder                                        | U4             |
| D11 | Implicit after-landing commands | A new optional key in `.config/vwf.yaml`, `after_landing:`, is a list of commands. The user edits it by hand. `/vwf:execute` runs these commands after every green landing, after the plan's own After landing rows, as `run` steps. A command that the plan also lists runs once. The key is additive: `config_format` stays 23 | a post-merge git hook; a CLAUDE.md rule                             | U4, U5         |
| D12 | `all` and the key               | In an `all` run, the `after_landing:` commands are steps like the plan rows, so the "Deduped after-landing steps" override applies to them too                                                                                                                                                                                   | always run them after each plan                                     | U4             |
| D13 | This plan's own levels          | U7 creates `.config/releases.yaml` with this plan's own levels (`vwf: MAJOR`, `site: PATCH`). Only this one time does a unit write the file. No `plugin.json` changes                                                                                                                                                            | a last bump by hand                                                 | U7             |
| D14 | Order                           | This plan requires `2026-10-08-typescript-ux-gate-renders`, so the three B91 plans land first under the old rules                                                                                                                                                                                                                | require only execute-renders                                        | —              |
| D15 | Review row                      | No review row: this plan changes only prose and lands no runnable code                                                                                                                                                                                                                                                           | one review row                                                      | —              |
| D16 | This repo's key                 | Plan 2 creates `.config/vwf.yaml` in this repo with `after_landing: [mise run p:plugins:local]`. Until plan 2 lands, plans carry an explicit `p:plugins:local` row                                                                                                                                                               | this plan creates it; the user creates it by hand                   | plan 2         |

## New dependencies

none

## Units

| Id | Wave | Unit file                              | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                           | Depends on         | Status | Commit   |
| -- | ---- | -------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------ | -------- |
| U1 | 1    | [01-template.md](01-template.md)       | edit | `plugins/vwf/assets/plan-interview.md`, `plugins/vwf/assets/templates/plan-folder.md`                                                                                                                                                                                                                                                                                                                                                          | —                  | green  | 5469cf91 |
| U2 | 1    | [02-change-plan.md](02-change-plan.md) | edit | `plugins/vwf/skills/change-plan/SKILL.md`                                                                                                                                                                                                                                                                                                                                                                                                      | —                  | green  | 4ff5409a |
| U3 | 1    | [03-plan.md](03-plan.md)               | edit | `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/plan/references/plan-doc.md`                                                                                                                                                                                                                                                                                                                                                           | —                  | green  | a94338cd |
| U4 | 1    | [04-execute.md](04-execute.md)         | edit | `plugins/vwf/skills/execute/SKILL.md`, `plugins/vwf/skills/execute/references/all.md`, `plugins/vwf/skills/execute/references/edit-unit.md`, `plugins/vwf/skills/execute/references/preflight.md`, `plugins/vwf/agents/execute-runner.md`                                                                                                                                                                                                      | —                  | green  | eca3296b |
| U5 | 1    | [05-vwf-config.md](05-vwf-config.md)   | edit | `plugins/vwf/assets/vwf-config.md`                                                                                                                                                                                                                                                                                                                                                                                                             | —                  | green  | b9998eaa |
| U6 | 2    | [06-docs.md](06-docs.md)               | edit | `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`, `CLAUDE.md`, `installer/CLAUDE.md`, `.claude/skills/release/SKILL.md`, `.claude/docs/ci-and-releases.md`, `docs/memory/decisions/2026-10-08-release-levels-recorded.md`, `plugins/vwf/skills/plan-management/references/plan-index.md` (widened at run time: the step-5 staging passage U4 falsified), and any other human-facing passage `vwf:docs-sync` finds outside `plugins/` | U1, U2, U3, U4, U5 | green  | c7d09d2a |
| U7 | 3    | [07-gates.md](07-gates.md)             | edit | `.config/releases.yaml`                                                                                                                                                                                                                                                                                                                                                                                                                        | U6                 | green  | a9063a43 |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                 | Why it collides                         | Owner          |
| -------------------------------------------------------------------- | --------------------------------------- | -------------- |
| `plugins/vwf/.claude-plugin/plugin.json`                             | a version file; this plan bumps nothing | nobody — never |
| `.claude-plugin/marketplace.json`                                    | generated; nothing changes its inputs   | nobody — never |
| `.config/releases.yaml`                                              | the new pending-levels file             | U7 only        |
| `site/src/content/docs/**`, `CLAUDE.md`, the other human-facing docs | n units editing one doc                 | U6 only        |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5.** Each unit owns different files, and no unit
  reads a file that another unit writes. Each unit file quotes the shared words
  from this file: the path `.config/releases.yaml`, the four levels, the
  `## Release levels` section shape, and the name "gates unit". Thus no unit
  waits for the text of another.
- **Wave 2 — U6.** The docs unit needs the landed text of wave 1.
- **Wave 3 — U7.** The gates unit writes the levels file and passes the full
  gate last.

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

| Step                       | Mode | Notes                                                                                                  |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages vwf into the dev marketplace as `X.Y.Z+N`; only a restarted session loads it. Publishes nothing |

## Gates the orchestrator keeps

none — the change is prose; the wave gate and the wave review are the checks.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. The one exception is U7, which writes `.config/releases.yaml` (D13).

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- The mobile app build number `+N`. Backlog item B96 says that it changes no
  skill or task of this repo; a repo with a mobile app applies it in its own
  release step.
- The release tasks, the release skill ritual, `deps-update.yml` and this repo's
  `.config/vwf.yaml`. Plan 2 owns them (Parked).
- Old decision docs (for example
  `docs/memory/decisions/2026-09-16-one-executor.md`) and `graphify-out/**`.
  They are records and generated output; U6 does not edit them.

## Parked

- B96: plan 2 — this repo's release tasks. `p:plugins:release`, `p:i:release`
  and `p:site:release` (an explicit exception to the rule that plans do not edit
  this repo's `.config`) read `.config/releases.yaml`, bump each project by its
  recorded level with the 13/17 guard from `.config/mise/tasks/_scripts/local`
  (levels are uppercase; the guard takes lowercase), commit the bump and the
  cleared entries, then tag. Points to settle at its interview: the `main`-only
  rule of the release tasks against the `no-commit-to-branch` hook on `main`;
  the untagged bumps of the B91 plans (vwf `21.2.0`, stackgen `3.1.0`);
  `deps-update.yml`, which calls `p:i:version` and then `p:i:release --ci`; a
  `p:plugins:version` task, if necessary; `plugins.yml`, which requires every
  marketplace ref on `main` to be a tag; the creation of `.config/vwf.yaml` with
  `after_landing: [mise run p:plugins:local]` (D16); the release skill,
  `.claude/docs/ci-and-releases.md` ("That is why no release task commits"),
  `CLAUDE.md`, `site/CLAUDE.md` and `.claude/docs/repo-shape.md`.
- The backlog has two items with the id B96. The second item holds all of the
  first. Closing the first with `/vwf:backlog close` is the user's choice.

## Gaps surfaced during execution

- G1 (plan hole, U5; cap-free, from the unit's own GAP) — D11 does not say what
  a failed `after_landing:` command stops. Assumed: it stops only the
  `after_landing:` commands after it, the same failure rule as the plan's own
  steps (U4 and U5 agree). Close by confirming or amending D11.
- G2 (plan hole, run-time Owns widening) — D5 puts the levels file in the commit
  that marks the plan COMPLETE, but the plan-index contract's step 5 staged
  `docs/plans/index.md` alone, and no unit owned it. U6's Owns was widened to
  `plugins/vwf/skills/plan-management/references/plan-index.md`, which now names
  the one exception. Close by confirming the widening.
- G3 (plan fact, informational) — the Facts cite `installer/CLAUDE.md:219-221`
  as carrying the release exception; it never did, so U6 left it unchanged. The
  header comment U7 wrote in `.config/releases.yaml` (verbatim from 07-gates.md)
  differs from the header the new execute landing write uses when it creates the
  file; the keys agree. Close by acknowledging.

## Run log

| Wave | Unit          | Model | Round | Outcome           | Detail                                                                                                                                                                                                                                                                                                                                                                                     | Commit |
| ---- | ------------- | ----- | ----- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 0    | preflight     | —     | 1     | green             | format check skipped (no covers:); doctor: no blocking finding (repo not onboarded, no .config/vwf.yaml); edit units only — LSP and conventions skipped; wave gate 7/7 green (code:precommit green on its second pass, after reflowing this run's own Status line)                                                                                                                         | —      |
| 0    | override      | —     | —     | applied           | override: skip as deduped: mise run p:plugins:local                                                                                                                                                                                                                                                                                                                                        | —      |
| 1    | U5            | opus  | 1     | green             | after_landing key in schema, semantics row, reading rule; GAP: a failed after_landing command stops only the after_landing commands after it (assumed)                                                                                                                                                                                                                                     | —      |
| 1    | U2            | opus  | 1     | green             | change-plan: description, §4 intro, §4(b), §4(c) Release levels, §5 item 6, §6 gates unit, §7, never-do; kept final-units shared-file line                                                                                                                                                                                                                                                 | —      |
| 1    | U1            | opus  | 1     | green             | plan-interview item 7 → item 18; item 17 skips after_landing commands; item 18 stated never asked; template: Release row removed, Release levels section, NN-gates.md, Gates section without bump                                                                                                                                                                                          | —      |
| 1    | U3            | opus  | 1     | green             | plan §5 items 16-18 (levels stated per D7), §6 gate shows levels, §7 writes Release levels, gates unit NN-gates.md; plan-doc fixed-shape list; GAP: ran code:precommit mid-wave (fix hooks touched other units files); left to wave gate                                                                                                                                                   | —      |
| 1    | U4            | opus  | 1     | green             | execute: gates unit bumps nothing, release-levels write at landing, after_landing key, Level-cell refusal; all.md: one-release question and hold release removed; preflight.md release-levels section; execute-runner hold-release parse removed; GAP: D5 same-commit-as-COMPLETE vs plan-management staging index.md alone, assumed a separate docs: release levels commit after complete | —      |
| 1    | R1            | opus  | 1     | findings(7)       | U1 fold width plan-folder.md:22,67,396; U4 fold width execute SKILL.md:222,780; U4 RULINGS D5 — levels write is a separate commit, not the COMPLETE commit; U2 rule 5 change-plan:278 stale Version files clause                                                                                                                                                                           | —      |
| 1    | U2            | opus  | 2     | green             | Shared-file rule: version files belong to no unit (release task bumps them)                                                                                                                                                                                                                                                                                                                | —      |
| 1    | U1            | opus  | 2     | green             | re-folded plan-folder.md prose at :22, :67, :396 to 80 columns                                                                                                                                                                                                                                                                                                                             | —      |
| 1    | U4            | opus  | 2     | green             | re-folded SKILL.md :222, :780 and an all.md line; D5 honoured — levels write staged with index.md in the one docs: plan queue complete commit, named as the one exception to the contract staging step; rejected-push re-apply covers the file. DOCS FALSIFIED plan-management/references/plan-index.md step 5 — handed to U6                                                              | —      |
| 1    | R1            | opus  | 2     | pass              | all four round-1 findings resolved; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                          | —      |
| 1    | orchestrator  | —     | —     | widened           | GAP: U6 Owns widened to plugins/vwf/skills/plan-management/references/plan-index.md (step 5 that-file-alone staging, falsified by U4 D5 exception, reported DOCS FALSIFIED)                                                                                                                                                                                                                | —      |
| 1    | gate          | —     | —     | green             | wave gate 7/7 green; commits U1 5469cf91, U2 4ff5409a, U3 a94338cd, U4 eca3296b, U5 b9998eaa                                                                                                                                                                                                                                                                                               | —      |
| —    | acceptance    | —     | —     | skipped           | no covers: — no acceptance criteria                                                                                                                                                                                                                                                                                                                                                        | —      |
| —    | ux            | —     | —     | skipped           | no covers: — no Screens contract                                                                                                                                                                                                                                                                                                                                                           | —      |
| —    | reconcile     | —     | —     | skipped           | no covers: (no stamps) and no code unit (nothing to persist)                                                                                                                                                                                                                                                                                                                               | —      |
| 2    | U6            | opus  | 1     | green             | docs-sync applied: plan-index.md step 5/7 exception; site vwf.md and ad-hoc-change.md; vwf-plugin skill; CLAUDE.md; release skill; ci-and-releases.md; readme.md; new decision doc; installer/CLAUDE.md already clean; GAP: precommit misses untracked files, decision doc dprint-checked by hand                                                                                          | —      |
| 2    | R2            | opus  | 1     | findings(1)       | CLAUDE.md:337 rule 5 — "the plan's first after-landing step" implies a second release step; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                  | —      |
| 2    | U6            | opus  | 2     | green             | CLAUDE.md:337 now "the plan's after-landing step"                                                                                                                                                                                                                                                                                                                                          | —      |
| 2    | R2            | opus  | 2     | pass              | finding resolved; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                            | —      |
| 2    | gate          | —     | —     | green             | wave gate 7/7 green; U6 c7d09d2a                                                                                                                                                                                                                                                                                                                                                           | —      |
| 3    | U7            | opus  | 1     | green             | .config/releases.yaml created: vwf MAJOR, site PATCH; no plugin.json or marketplace change                                                                                                                                                                                                                                                                                                 | —      |
| 3    | R3            | opus  | 1     | pass              | CONTRACT clean; RULINGS clean; informational only: the header comment U7 wrote (verbatim from 07-gates.md) differs from the header execute SKILL.md writes when it creates the file — matters only for an absent file, keys agree                                                                                                                                                          | —      |
| 3    | gate          | —     | —     | green             | wave gate 7/7 green; U7 a9063a43                                                                                                                                                                                                                                                                                                                                                           | —      |
| —    | reconcile     | —     | —     | green             | final wave gate over the finished tree 7/7 green (the wave 3 run); Gates the orchestrator keeps: none                                                                                                                                                                                                                                                                                      | —      |
| —    | land          | —     | —     | green             | consent merge yes; gaps G1-G3 open, so not archived (folder stays live); backlog partial B96 → Partially done (Landed line added; Planned in keeps release-tasks-bump)                                                                                                                                                                                                                     | —      |
| —    | after landing | —     | —     | skipped (deduped) | mise run p:plugins:local — deferred to the all loop exit by override                                                                                                                                                                                                                                                                                                                       | —      |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-08-release-levels-recorded

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
