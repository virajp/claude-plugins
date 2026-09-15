---
type: vwf-change-plan
title: plan index queue — docs/plans/index.md as the change-plan queue, and
  change-execute next
requires: []
backlog: []
---

# Plan — plan index queue — `docs/plans/index.md` as the change-plan queue, and `change-execute next` (2026-09-15)

## Status

**COMPLETE** 2026-09-15 — commits 53e3c7b9, fc115ab2, 62f0ca08, ee3cfd90,
c593328c on branch `2026-09-15-plan-index-queue`

## Consent

| Action                                            | Granted                                                                                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                 |
| After landing: `mise run p:plugins:local`         | ask                                                                                                                                 |
| After landing: `/release`                         | ask                                                                                                                                 |
| Release `vwf` publicly                            | minor — `19.28.0` → `19.29.0`, by editing `plugins/vwf/.claude-plugin/plugin.json`; tagged by the `/release` ask step               |
| Release `site` publicly                           | patch — `1.1.22` → `1.1.23`, by `mise run p:site:version` (bare — no positional, refuses a dirty tree, runs first in the bump unit) |
| Release `stackgen` publicly                       | none — untouched                                                                                                                    |
| Release `installer` publicly                      | none — untouched                                                                                                                    |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. Both
after-landing steps are `ask` — `p:plugins:local` stages the edited plugins into
the dev marketplace, which a **restarted** session picks up. (This plan is run
by the change-execute shipped before it lands, which still reads `run`/`ask`;
`ask` is honoured by both.)

## Goal

After this lands, `docs/plans/index.md` is the **queue** of a product's change
plans: `/vwf:change-plan` adds a row when it approves a folder,
`/vwf:change-execute` flips it to `RUNNING` when it claims the folder and to
`COMPLETE` when the folder lands, every one of those edits a direct commit on
the integration branch, and `/vwf:change-execute next` reads that file alone to
pick, claim and run the next runnable plan — safely when another session is
already running one, because the claim is a pushed commit and a rejected push
means re-pull and re-pick. Priority is derived from the dependency chain in
blocks of ten, never asked. After-landing steps are `ask` only: the `run` mode
that let a plan pre-authorise a local deployment at plan time is retired, and
the run stops and asks before every after-landing step.

Framing: this repo already keeps a hand-written `docs/plans/index.md` in the
shape this plan mechanises, with a note that mechanising it "is a later change"
— this is that change.

**Reversal, named as one.** The decision record
`docs/memory/decisions/2026-09-13-vwf-process.md` and the shipped `/vwf:archive`
skill rule that `docs/plans/index.md` lists `/vwf:plan`'s flat cycle plans only,
and that change-plan folders are **never** listed there. This plan reverses
that: change plans get their own table in the same file. The cycle-plan table is
untouched.

## Facts the survey established

- **Trees and projects.** `plugins/vwf/` (the vwf plugin — skills `change-plan`,
  `change-execute`, `archive`, `plan`, `execute`, and `assets/`),
  `.claude/skills/vwf-plugin/` (this repo's home for vwf), `site/` (the manual),
  the root docs (`readme.md`, `CLAUDE.md`), and `docs/plans/index.md` itself.
- **Gates covering them.** `p:plugins:marketplace --check`,
  `p:plugins:inventory --check`, `p:plugins:check` (fourteen rules; skills need
  strict-YAML frontmatter), `code:precommit` (format, lint, sec), and
  `p:site:check` (astro check, build, link checker over the manual). No unit
  test covers skill prose.
- **The index today.** `plugins/vwf/skills/plan/SKILL.md:49,337-341` —
  `/vwf:plan` appends one row per cycle plan (plan, target repo, status);
  `plugins/vwf/skills/execute/SKILL.md:42-46,79,501-506` reads it (the
  chain-forward at `:501-506` is the analogue of `next`);
  `plugins/vwf/skills/archive/SKILL.md:18-23,52-62,107-110,128-130` — flat rows
  flipped to archived, folders "**never** listed", no-arg listing walks
  `docs/plans/` for folders and skips `RUNNING` ones;
  `plugins/vwf/assets/membership.md:146-148` and
  `plugins/vwf/assets/topologies/multi-repo.md:43-47,77,142` — "a thin index of
  every plan and its target", base repo only;
  `plugins/vwf/skills/backlog/SKILL.md:34,130-137` — the backlog sits beside the
  index; callers table.
- **change-plan today.** `plugins/vwf/skills/change-plan/SKILL.md:131-165` —
  §4(b) after-landing modes `run`/`ask`; `:238-271` — §8 hand-off: set
  `APPROVED`, `/vwf:backlog planned`, commit exactly the folder plus
  `docs/backlog.md` on the current branch with message
  `docs: change plan — <name> — approved, awaiting execution`, push, print the
  launch line. `references/plan-template.md:12-17` — frontmatter `type`,
  `title`, `requires`, `backlog`; `:21-27` — Status block shape; the **After
  landing** table has a `Mode` column reading `run / ask`.
  `references/interview.md:63-80` — item 16 walks `run`/`ask`.
- **change-execute today.** `plugins/vwf/skills/change-execute/SKILL.md:10-11` —
  `argument-hint` "<plan-folder or its index.md>"; `:38-64` — §1 resolves the
  argument, refuses `DRAFT`/`COMPLETE`/unsatisfied `requires:`, resumes
  `BLOCKED`/`RUNNING`, sets `RUNNING` in the folder, refuses a folder not
  committed on the integration branch, and rules the folder is edited in the
  worktree only, never in the main checkout; `:66-75` — §2 one worktree via
  git-workflow "commit only"; `:170-183` — §7 land: move the folder to
  `docs/plans/archived/`, Status `COMPLETE`, `/vwf:backlog done`, final `docs:`
  commit, then git-workflow step 4 merges and pushes per consent; `:185-226` —
  §7a `run` steps and §8 `ask` steps; `:249-265` — the never-does list.
  `references/blocking.md:35-65` — status line format and resume.
- **Priority.** No plan-level priority exists anywhere; `docs/backlog.md` items
  carry `P1`–`P3`, which is a backlog vocabulary, not a plan one.
- **Docs the change falsifies.**
  `.claude/skills/vwf-plugin/SKILL.md:60-61,192-197`;
  `.claude/skills/vwf-plugin/references/docs-tree.md:39-51`;
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:38,45-46`;
  `site/src/content/docs/plugins/vwf.md:353-355,468,502-504,811,818-826,1998-2014,2022-2024,2160-2188,2262-2304,2336-2350,2648,2672-2673,2736`;
  `site/src/content/docs/how-to/operate/ad-hoc-change.md:13-17,136-166,195-197,211-231`;
  `site/src/content/docs/how-to/index.md:67-68`; `readme.md:231-234`;
  `CLAUDE.md:49-53,293-296,357` (the last says each plan folder carries
  `p:plugins:local` as a `run` step); `docs/plans/index.md:3-16`. Every hit of
  the retired `run` mode across `plugins/vwf/skills/change-plan/**` and
  `plugins/vwf/skills/change-execute/**` is U1's and U2's respectively.
- **Commit convention.** `.config/git-conventional-commits.yaml` — types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Formatting.** `plugins/**/*.md` is **not** dprint-formatted — fold by hand.
  `CLAUDE.md`, `readme.md`, `.claude/**`, `site/**` and `docs/**` markdown
  **are**.
- **This repo's state.** No change plan is in flight; the html-site-pack plan
  landed on 2026-09-15 and `docs/plans/index.md`'s table is empty.

## Assumed decisions — confirm or override at review

| #  | Decision                 | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                    | Rejected                                                    | Unit   |
| -- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------ |
| 1  | Index shape              | Two tables in `docs/plans/index.md`: the cycle-plan table exactly as `/vwf:plan` and `/vwf:archive` write it today, plus a **Change plans** table with columns `Folder`, `Plan`, `Priority`, `Status`, `Requires`, `Backlog`. Each writer edits only its own table. The contract is one asset, `plugins/vwf/assets/plan-index.md`, cited by every skill that reads or writes the file.                                    | one unified table; a separate `docs/plans/changes.md`       | U3     |
| 2  | Row statuses             | An index row carries only `APPROVED`, `RUNNING` or `COMPLETE`. The folder's own `## Status` keeps the run detail — `BLOCKED`, `RUNNING — paused …`, the worktree path. `next` reads the index alone; a `RUNNING` row is opaque to it whatever the folder says.                                                                                                                                                            | mirror every status to the index                            | U2     |
| 3  | Claiming                 | A claim is the row set to `RUNNING`, committed and pushed on the integration branch **before** the worktree is cut. A named `/vwf:change-execute <folder>` on an `APPROVED` plan claims the same way; a resume of a `RUNNING`/`BLOCKED` folder finds its row already `RUNNING` and leaves it.                                                                                                                             | branch existence as the claim; no cross-session guard       | U2     |
| 4  | Where index edits happen | Only as direct commits on the integration branch from the main checkout, never in a worktree: change-plan's approval commit adds the row; change-execute commits `RUNNING` at claim and `COMPLETE` after the merge lands. The run branch never touches `docs/plans/index.md`, so two parallel landings cannot conflict on it.                                                                                             | the index rides the run branch, conflicts resolved at merge | U1, U2 |
| 5  | Dirty main checkout      | When the main checkout is dirty or not on the integration branch: `git stash push -u`, `git checkout <integration>`, `git pull --ff-only`, edit and commit the index, push, `git checkout -` and `git stash pop`. Each step is one plain git call.                                                                                                                                                                        | refuse and stop, naming the blocker                         | U2     |
| 6  | Rejected push            | `git pull --rebase`. A clean rebase means another session changed a different row — push again; the pick stands, since a claim only ever flips `APPROVED` to `RUNNING` and cannot make a satisfied `requires:` unsatisfied. A conflict on `docs/plans/index.md` means the same row — `git rebase --abort`, drop the claim commit (`git reset --soft HEAD~1`, then restore the index file), `git pull --ff-only`, re-pick. | fetch and hard-reset                                        | U2     |
| 7  | What `next` picks        | Candidates are `APPROVED` rows whose every `requires:` entry resolves to a `COMPLETE` row or to a folder under `docs/plans/archived/` with no row. Order: `Priority` ascending, then the folder's date prefix ascending, then folder name. Nothing runnable → print each `APPROVED` row and what it waits on, and stop. No change-plan table, or no rows → say so and stop.                                               | run when a requirement is still `RUNNING`                   | U2     |
| 8  | Stale claims             | `next` never takes a `RUNNING` row. Resuming is `/vwf:change-execute <folder>`; a claim whose session is gone is reset to `APPROVED` by hand, in a commit on the integration branch.                                                                                                                                                                                                                                      | `next` offers to take over when the worktree is absent      | U2     |
| 9  | Priority                 | Derived by change-plan, never asked: `10 + max(Priority of every unarchived plan in its requires:)`, or `10` when it requires none of them. Shown in the §5 gate presentation as a fact; written into the row at hand-off.                                                                                                                                                                                                | next free block after the highest active; a user override   | U1     |
| 10 | Requires matching        | A `requires:` entry matches an index row, or an archived folder, by its **basename** — `docs/plans/X` and `docs/plans/archived/X` name the same plan. No skill ever re-points a `requires:` line. An entry with no row and no folder anywhere is a refusal, named.                                                                                                                                                        | exact path, dependents re-pointed at landing                | U2, U3 |
| 11 | Landing                  | After the merge lands (git-workflow step 4 returns), one integration-branch commit sets the row `COMPLETE` with its `Folder` column pointing at the archived path, then removes every `COMPLETE` row that no `APPROVED` or `RUNNING` row's `Requires` names. Message: `docs: plan queue — <folder> complete`. The claim commit's message is `docs: plan queue — <folder> running`.                                        | keep every `COMPLETE` row until archived by hand            | U2     |
| 12 | Archive by hand          | `/vwf:archive <folder>` applies the same rule as decision 11 to that folder's row, in its own commit; its no-argument listing reads the change-plan table for folders instead of walking `docs/plans/`. Archiving a folder that has no row adds none.                                                                                                                                                                     | leave archive's folder path untouched                       | U3     |
| 13 | After-landing modes      | `ask` only. change-plan's §4(b) offers no `run`; the template's After landing table reads `ask`; change-execute stops once before every step. A `run` in an older folder is read as `ask`.                                                                                                                                                                                                                                | keep `run`; default deploy steps to `ask`                   | U1, U2 |
| 14 | Placement                | The index is the **base** repo's, as `docs/backlog.md` is; a run in a member repo addresses the base's file.                                                                                                                                                                                                                                                                                                              | one index per member                                        | U2, U3 |
| 15 | This plan's gate         | The wave gate is this repo's standard five lines (below); the user did not pick between five and four.                                                                                                                                                                                                                                                                                                                    | the four without `p:site:check`                             | —      |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                                                                                          | Depends on | Status | Commit   |
| -- | ---- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1 | 1    | [01-change-plan.md](01-change-plan.md)       | `plugins/vwf/skills/change-plan/**`                                                                                                                                                                                                                                                           | —          | green  | 53e3c7b9 |
| U2 | 1    | [02-change-execute.md](02-change-execute.md) | `plugins/vwf/skills/change-execute/**`                                                                                                                                                                                                                                                        | —          | green  | fc115ab2 |
| U3 | 1    | [03-index-contract.md](03-index-contract.md) | `plugins/vwf/assets/plan-index.md` (new), `plugins/vwf/skills/archive/SKILL.md`, `plugins/vwf/assets/membership.md`, `plugins/vwf/assets/topologies/multi-repo.md`, `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/execute/SKILL.md`, `plugins/vwf/skills/backlog/SKILL.md`          | —          | green  | 62f0ca08 |
| U4 | 2    | [04-docs.md](04-docs.md)                     | `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `docs/plans/index.md`, `docs/memory/decisions/2026-09-15-plan-index-queue.md`, `.claude/docs/ci-and-releases.md` (widened at run time, R1), `.claude/skills/release/SKILL.md` (widened at run time, R1) | U1, U2, U3 | green  | ee3cfd90 |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md) | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`                                                                                                                                                                                              | U4         | green  | c593328c |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                     | Why it collides                                         | Owner   |
| ---------------------------------------- | ------------------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json` | version file                                            | U5 only |
| `.claude-plugin/marketplace.json`        | generated from the plugin manifests                     | U5 only |
| `site/package.json`                      | version file                                            | U5 only |
| `plugins/vwf/assets/plan-index.md`       | the contract U1 and U2 cite by path; one author         | U3 only |
| every human-facing doc                   | three wave-1 units would each describe their own change | U4 only |
| `docs/plans/index.md`                    | this repo's own index, rewritten to the new shape       | U4 only |

## Waves

- **Wave 1 — U1, U2, U3.** Three disjoint trees: `skills/change-plan/`,
  `skills/change-execute/`, and `assets/` plus `skills/archive/`, `plan/`,
  `execute/`, `backlog/`. U1 and U2 cite `assets/plan-index.md` by its path and
  by the column names fixed in decision 1; U3 writes it.
- **Wave 2 — U4.** Docs, after every behaviour change has landed, so
  `vwf:docs-sync` sees the whole delta.
- **Wave 3 — U5.** Versions and the generated manifest, after the docs.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                               |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | ask  | Stages the changed plugins into the dev marketplace and updates this machine's install; reaches nothing else. Picked up by a **restarted** session. |
| `/release`                 | ask  | Tags `vwf-v19.29.0` and `site-v1.1.23` per the consent block; the site tag deploys the website.                                                     |

## Gates the orchestrator keeps

none beyond the wave gate and the wave review — every edit is skill or doc
prose. The first real proof of `next` and the claim path is the next change plan
run on the staged skill; the wave review reads U2's `next` procedure as a
sequence of plain git commands and confirms every branch of decisions 5 and 6 is
written, not implied.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

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

- `next` taking over a stale `RUNNING` row — the user chose never to auto-steal;
  a hand reset is the release valve.
- Mirroring `BLOCKED` or paused states to the index — the index is the queue,
  the folder is the run detail.
- Refusing on a dirty main checkout — the user chose stash, switch, commit,
  restore.
- The same queue semantics for `/vwf:plan` → `/vwf:execute` cycle plans — parked
  below.

## Parked

- **Cycle-plan queue parity.** `/vwf:plan`'s flat plans keep their own table and
  `/vwf:execute` keeps its chain-forward offer (`execute/SKILL.md:501-506`). A
  later plan can give cycle plans the same claim / `next` / derived-priority
  semantics, reading `assets/plan-index.md` as the shared contract.
- **`/vwf:change-execute release <folder>`.** A verb that resets a stale
  `RUNNING` row to `APPROVED` in an integration-branch commit, instead of the
  hand edit decision 8 relies on. Needs a rule for proving the session is gone.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                     | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green       | five gate lines green in the worktree before wave 1                                                                                                                                                                                                                                                                                                        | —        |
| 1    | U1        | opus  | 1     | green       | DECIDED: priority as new interview item 12 (stated fact, not open design point; nothing cites items by number). GAP: none.                                                                                                                                                                                                                                 | 53e3c7b9 |
| 1    | U3        | opus  | 1     | green       | DECIDED: cycle-plan header fixed as Plan / Target repo / Status (no literal header existed); archive's index edit rides the existing archive commit, not a plan-queue message. GAP: none.                                                                                                                                                                  | 62f0ca08 |
| 1    | U2        | opus  | 1     | green       | DECIDED: restore-after-drop is git checkout HEAD -- index.md (file still staged after reset --soft); not-on-integration-branch refusal moved ahead of the claim; stash message names the folder. GAP: §1 sets folder Status RUNNING before §2 cuts the worktree while ruling the folder is edited in the worktree only — pre-existing tension, left as is. |          |
| 1    | R1        | opus  | 1     | findings(3) | queue.md:79 [U2] decision 6 conflict-branch exits (re-pick finds nothing / §1 refuses) do not say step 8 restore still runs — looped to U2. .claude/docs/ci-and-releases.md:83 and .claude/skills/release/SKILL.md:52 say after-landing run step — rule 5, nobody-owned; GAP: U4 Owns widened to both files, handed as DOCS FALSIFIED.                     | —        |
| 1    | U2        | opus  | 2     | green       | queue.md conflict branch names every exit; step 8 restore runs before any re-read so every path ends restored. DECIDED: restore before re-read (re-pick restarts the dance at step 1).                                                                                                                                                                     | fc115ab2 |
| 1    | R1        | opus  | 2     | pass        | no findings; contract and rulings clean                                                                                                                                                                                                                                                                                                                    | —        |
| 2    | U4        | opus  | 1     | green       | DECIDED: p:plugins:local described as the first after-landing ask step. GAP: docs-sync-surveyor's report routed to the orchestrator, not U4; U4 surveyed by hand over the same inventory — every file the surveyor flagged is in its CHANGED list. GAP: literal header grep cannot hit (dprint pads); six columns present.                                 |          |
| 2    | R2        | opus  | 1     | findings(1) | vwf.md:811 (also CLAUDE.md:52, readme.md:233) say highest priority while vwf.md:2338 and ad-hoc-change.md:172 say lowest Priority — looped to U4 to harmonize as ascending. GAP: the same highest-priority phrasing sits in change-execute/SKILL.md:10,35 (U2, committed); left as is — the skill's own queue.md rules ascending.                          | —        |
| 2    | U4        | opus  | 2     | green       | CLAUDE.md, readme.md, vwf.md command table harmonized to lowest Priority value; ad-hoc-change.md derivation kept as highest among requires (the 10 + max arithmetic).                                                                                                                                                                                      | ee3cfd90 |
| 2    | R2        | opus  | 2     | pass        | no findings; contract and rulings clean                                                                                                                                                                                                                                                                                                                    | —        |
| 3    | U5        | opus  | 1     | green       | vwf 19.29.0, site 1.1.23, marketplace regenerated. GAP: p:site:version refused (ERR_PNPM_UNCLEAN_WORKING_TREE) on the orchestrator's modified plan index.md; site/package.json edited by hand to the same value.                                                                                                                                           | c593328c |
| 3    | R3        | opus  | 1     | pass        | no findings; contract and rulings clean                                                                                                                                                                                                                                                                                                                    | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-15-plan-index-queue
