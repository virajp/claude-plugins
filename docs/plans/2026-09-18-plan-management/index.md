---
type: vwf-change-plan
title: plan-management — one owner of the plan index, the Status block and the
  archive
requires: []
backlog: []
---

# Plan — plan-management — one owner of the plan index, the Status block and the archive (2026-09-18)

## Status

**RUNNING** — since 2026-09-18, worktree `.worktrees/2026-09-18-plan-management`

APPROVED 2026-09-18 by the user

## Consent

| Action                                            | Granted                                                                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                    |
| After landing: `mise run p:plugins:local`         | run                                                                                                                    |
| Release vwf publicly                              | minor — `19.32.0` → `19.33.0`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json`; no release step, the tag waits |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, one vwf skill — `plan-management` — is the only writer of the
base repo's `docs/plans/index.md`, of every plan folder's **Status** block, and
of the move that retires a folder into `docs/plans/archived/`; and it is the one
implementation of the read procedures those files carry — the `next` pick,
`requires:` resolution, priority derivation and the listing. `/vwf:plan`,
`/vwf:change-plan` and `/vwf:execute` call its verbs instead of carrying the
procedure, so the four copies of the plan-index contract that drifted apart
collapse to one. The `archive` skill and `assets/plan-index.md` cease to exist
as separate things: the pipeline of the first and the contract of the second
live inside the new skill.

The framing: the session found that `execute`'s inline archive and the `archive`
skill had drifted — the skill's completion check would have warned on every
green landing, its commit shape differed, and only the skill marked the
mempalace journal drawer. Rather than re-wire one to call the other, the
`backlog` pattern — one skill as the sole writer of a file that several commands
need to move — was applied to `docs/plans/`.

**Reversal.** `/vwf:archive` stops being a typed command. Since the plan-index
plan of 2026-09-15 it has been documented as user-only — the site manual lists
it in the Commands table, the worked walkthrough ends on it, and the shipped
`project-claude.md` workflow line ends on it. The new skill is model-only: a
user retires a folder by asking in prose, and the session invokes the verb. The
docs unit writes this to `docs/memory/decisions/2026-09-18-plan-management.md`.

## Facts the survey established

**The four writers and their copies of the contract.** `assets/plan-index.md`
(262 lines) is the contract: columns and priority derivation (`:32-56`), the
writers table (`:58-66`), the sweep (`:68-77`, authoritative at `:243-253`), the
two commit messages (`:78-87`), `requires:` resolution (`:89-112`), the pick
(`:113-131`), reading the queue (`:133-184`), and writing a row — the claim and
the completion (`:186-241`). Its implementers:

- `skills/execute/SKILL.md` — `next` (`:75-84`), finding the plan and refusing a
  row (`:86-157`), `requires:` resolution (`:117-136`), the claim (`:182-196`),
  Status → `RUNNING` (`:197-205`), paused (`:392-395`), Land steps 2–3
  (`:727-736`), the completion edit and sweep (`:745-756`), the `no` path
  (`:757-760`), the user-only archive recommendation (`:783-785`), chain forward
  (`:786-791`), "never does" (`:865-868`). `references/blocking.md:4,45-52`
  writes Status `BLOCKED`; `:56-65` is the hand reset of a stale row.
- `skills/plan/SKILL.md` — Doc Paths (`:51`), priority (`:321-324`), Status
  `DRAFT` (`:365-366`), self-review (`:424-426`), Status → `APPROVED`
  (`:432-433`), the row append (`:434-443`), "never does" (`:497-498`);
  `references/plan-doc.md:10-22` on the Status block and `requires:`.
- `skills/change-plan/SKILL.md` — index read (`:58-65`), priority (`:197-202`),
  self-review (`:291-293`), Status → `APPROVED` (`:300-301`), the row append
  (`:302-310`), "never does" (`:354-355`).
- `skills/archive/SKILL.md` — the whole file (175 lines): frontmatter `:1-10`
  (`model: haiku`, `disable-model-invocation: true`), resolve (`:57-75`),
  completion check (`:79-116`), move and Status (`:120-136`), the row edit and
  sweep (`:138-152`), backlog (`:154-160`), collisions, commit and the mempalace
  drawer mark (`:162-175`).

**Other passages the retired names falsify** — every one is in some unit's Owns:

- `plugins/vwf`: `skills/backlog/SKILL.md:9,35,133`;
  `assets/plan-interview.md:99-104` (item 12, the derivation);
  `assets/templates/plan-folder.md:17`; `assets/templates/project-claude.md:13`;
  `assets/membership.md:114,148-150`; `.claude-plugin/plugin.json:18` (the
  `archive` keyword).
- repo docs: `CLAUDE.md:59,310`; `readme.md:242`;
  `.claude/skills/vwf-plugin/SKILL.md:67,77-78,225-244` (the invocation counts);
  `references/skills-and-agents.md:11-13,35,38,44,45`;
  `references/assets.md:15`; `references/docs-tree.md:45,51,57`.
- site:
  `site/src/content/docs/plugins/vwf.md:157,298,348,815,827,865,2201,2209,2249-2259,2464,2892`;
  `how-to/operate/ad-hoc-change.md:235,274`. The `### /vwf:archive` heading at
  `:2249` is the `#vwfarchive` anchor four links resolve to; `p:site:check`'s
  link checker fails a fragment that resolves to nothing, and `site/CLAUDE.md`
  forbids a slug plugin — the links are re-pointed, never the anchor faked.
- historical, **not edited**: `docs/memory/decisions/*` and
  `docs/memory/handoff/next.md`.

**Skills that do not touch the index or the Status block**, so no unit rewires
them: `recall` and `handoff` (their `next` is the handoff drawer), `feedback`,
`docs-sync` (excludes `docs/plans/`), every agent and hook.

**The model-only pattern.** `skills/init/SKILL.md:11-14` carries
`model: sonnet`, `user-invocable: false`, `disable-model-invocation: false`,
with the guard note at `:19-25`; `skills/import-screens/SKILL.md:7-10,20-26` is
the same pair. `.claude/skills/vwf-plugin/SKILL.md:182-244` is the policy — the
four invocation states, and the counts of skill-invoked skills.

**The verb-skill model.** `skills/backlog/SKILL.md`: frontmatter with a
bracketed `argument-hint` (`:12`), "The file" (`:32-65`), one `###` per verb
under "Verbs" (`:67-121`), "Who calls it" (`:123-137`), "What this skill never
does" (`:139-149`).

**Gates.** Pre-commit runs `format`, `lint`, `sec`, `plugins-marketplace`,
`plugins-inventory`, `plugins-check`, `plugins-shellcheck` and the standard
hooks (`.config/pre-commit-config.yaml`). `p:plugins:check` fails a
`${CLAUDE_PLUGIN_ROOT}/…` citation to a path that does not exist — the
plan-folders run of 2026-09-16 was red until a citation to a deleted template
was dropped — which fixes commit order here: the new skill lands before any
caller cites its references, and the deletions after the last citation moves.
`p:site:check` is the site's gate and runs in neither pre-commit nor
`plugins.yml`; it is a wave-gate line here because the site changes.
`plugins/**/*.md` is not dprint-formatted — match the fold width by hand;
`CLAUDE.md`, `readme.md` and `site/**` are.

**Commit convention.** `.config/git-conventional-commits.yaml:3-9` allows `ops`,
`docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.

**Version.** `plugins/vwf/.claude-plugin/plugin.json:4` reads `19.32.0`, bumped
by hand (`.claude/skills/release/SKILL.md:78-105`);
`mise run
p:plugins:marketplace` regenerates `.claude-plugin/marketplace.json`
from it. `19.33.0` carries no `13` or `17` component.

**The plan index** is empty of rows — no plan is active, so this plan requires
nothing and its priority is `10`.

## Assumed decisions — confirm or override at review

| #  | Decision                                   | Ruling                                                                                                                                                                                                                                                                                                                                                                                                      | Rejected                                                                                                                                         | Unit       |
| -- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 1  | What `plan-management` owns                | `docs/plans/index.md` rows, the archive move, and each plan folder's Status block. Planners keep writing the folder's content; `execute` keeps writing the Run log                                                                                                                                                                                                                                          | everything under `docs/plans/` (the Run log hop per unit, a payload contract for folder creation); index and move only (the Status block drifts) | U1         |
| 2  | Invocation                                 | Model-only: `user-invocable: false`, `disable-model-invocation: false`, with the guard note `init` carries. A user reaches `archive` or `list` by asking in prose                                                                                                                                                                                                                                           | user-invocable like `backlog` (reverses the model-only intent for archiving)                                                                     | U1         |
| 3  | The verb set                               | Nine: `add`, `claim`, `status`, `complete`, `archive`, `next`, `resolve`, `priority`, `list` — each defined under the Verbs section of U1                                                                                                                                                                                                                                                                   | folding `status` into `claim`/`complete` (they edit different checkouts); dropping `priority`/`resolve` (two implementations of each rule)       | U1         |
| 4  | Commits                                    | The skill never commits; the caller does — `execute` keeps `docs: plan queue — <folder> running` and `… complete`, the planners their approval commit, a standalone archive the session's git-workflow commit                                                                                                                                                                                               | per verb; always commits itself                                                                                                                  | U1, U2, U3 |
| 5  | Where the contract lives                   | `assets/plan-index.md` moves to `skills/plan-management/references/plan-index.md`, edited so its writers table names verbs; `assets/templates/plan-folder.md` stays an asset — the planners still write folders                                                                                                                                                                                             | keep the asset beside the skill                                                                                                                  | U1, U5     |
| 6  | The completion check's `requires:` warning | Warn only when the plan being archived never landed — the rule the check's own later paragraph states; every completion warning asks, none refuses                                                                                                                                                                                                                                                          | the bullet as written (fires on every landing a dependent waits on)                                                                              | U1         |
| 7  | Model                                      | `model: sonnet`, like `backlog`                                                                                                                                                                                                                                                                                                                                                                             | `haiku` (archive's)                                                                                                                              | U1         |
| 8  | The landing sequence in `execute`          | On `yes` with an empty gap list: `status <folder> COMPLETE <date, commits>` → `archive <folder>` in the worktree (moves, leaves `COMPLETE`, closes backlog ids, marks the mempalace drawer; edits no row) → the one final `docs:` commit → merge → `complete <folder>` in the main checkout (row `COMPLETE`, `Folder` re-pointed, sweep). With a gap open, or on `no`: `status` only, the folder stays live | `execute` keeps moving the folder inline                                                                                                         | U2         |
| 9  | The folders a landing does not archive     | Gap-kept, hand-merged and never-run folders are retired when a user asks in prose; the session invokes `archive <folder>` in the main checkout, which then also applies the row edit and sweep, and commits via git-workflow as `docs: archive plan <name>`                                                                                                                                                 | keep `/vwf:archive` typed                                                                                                                        | U2, U4     |
| 10 | The site manual                            | `### /vwf:archive` becomes `### /vwf:plan-management` in `### /vwf:init`'s style — says skill-invoked, lists the verbs and who calls each; the `#vwfarchive` links re-point to `#vwfplan-management`; the Commands table row and the user-only count follow                                                                                                                                                 | a hidden anchor kept for the old links                                                                                                           | U4         |
| 11 | Commit order                               | U1 lands alone in wave 1 so the references path exists before U2/U3 cite it; `rm -r skills/archive` and `rm assets/plan-index.md` are U5's, after every citation has moved                                                                                                                                                                                                                                  | one wave for all three (a citation to a missing path fails the checker at each unit's commit)                                                    | all        |
| 12 | Review row                                 | None — nothing runnable lands; the wave review is the check                                                                                                                                                                                                                                                                                                                                                 | —                                                                                                                                                | —          |
| 13 | The stale-`RUNNING` reset                  | Not this plan — it is backlog B12 (`P1`), the `unclaim <folder>` verb with its liveness rule                                                                                                                                                                                                                                                                                                                | add it now on the user's word alone                                                                                                              | —          |
| 14 | The mempalace `runs` drawer                | `archive` marks it `archived` when the server is up, silently skipping otherwise — the one behaviour `execute`'s inline move never had                                                                                                                                                                                                                                                                      | drop it                                                                                                                                          | U1         |
| 15 | `plugin.json` keywords                     | `archive` → `plan-management`, in the bump unit                                                                                                                                                                                                                                                                                                                                                             | leave the stale keyword                                                                                                                          | U5         |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                                                                                                                | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-skill.md](01-skill.md)                   | edit | `plugins/vwf/skills/plan-management/SKILL.md`, `plugins/vwf/skills/plan-management/references/plan-index.md`                                                                                                                                                                                                                                        | —          | green   | 077cbbb6 |
| U2 | 2    | [02-execute.md](02-execute.md)               | edit | `plugins/vwf/skills/execute/SKILL.md`, `plugins/vwf/skills/execute/references/blocking.md`                                                                                                                                                                                                                                                          | U1         | green   | 2dc4ee39 |
| U3 | 2    | [03-planners.md](03-planners.md)             | edit | `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/plan/references/plan-doc.md`, `plugins/vwf/skills/change-plan/SKILL.md`, `plugins/vwf/skills/backlog/SKILL.md`, `plugins/vwf/assets/plan-interview.md`, `plugins/vwf/assets/templates/plan-folder.md`, `plugins/vwf/assets/templates/project-claude.md`, `plugins/vwf/assets/membership.md` | U1         | green   | 97bea91a |
| U4 | 3    | [04-docs.md](04-docs.md)                     | edit | `CLAUDE.md`, `readme.md`, `.claude/skills/vwf-plugin/**`, `site/src/content/docs/plugins/vwf.md`, `site/src/content/docs/how-to/operate/ad-hoc-change.md`, `docs/memory/decisions/2026-09-18-plan-management.md`, `plugins/vwf/assets/topologies/multi-repo.md` (widened at run time — U3's DOCS FALSIFIED)                                         | U2, U3     | green   | 5cc9eaaa |
| U5 | 4    | [05-gates-and-bump.md](05-gates-and-bump.md) | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, the deletions `plugins/vwf/skills/archive/` and `plugins/vwf/assets/plan-index.md`                                                                                                                                                                                     | U4         | running |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                              | Why it collides                                          | Owner   |
| ------------------------------------------------- | -------------------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`          | the version and the keyword                              | U5 only |
| `.claude-plugin/marketplace.json`                 | generated from the manifest                              | U5 only |
| `plugins/vwf/skills/archive/**`                   | read by U1 as the source of the fold; deleted last       | U5 only |
| `plugins/vwf/assets/plan-index.md`                | read by U1 as the source of the references; deleted last | U5 only |
| `CLAUDE.md`, `readme.md`, `.claude/**`, `site/**` | human-facing docs                                        | U4 only |

## Waves

- **Wave 1 — U1 alone.** Creates the skill and its references. Nothing else may
  land first: every later unit cites
  `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`, and
  `p:plugins:check` fails a citation to a path that is not there.
- **Wave 2 — U2, U3.** Disjoint trees: `skills/execute/` against `skills/plan/`,
  `skills/change-plan/`, `skills/backlog/` and `assets/`. Both read U1's
  committed skill; neither deletes anything.
- **Wave 3 — U4.** The repo docs, the site, the decisions doc; runs docs-sync
  over waves 1–2.
- **Wave 4 — U5.** The bump, the generator, the two deletions, the full gate.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                   |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf at `19.33.0+N` into the dev marketplace and updates this machine's install; publishes nothing, cuts no tag; a **restarted** session loads it |

## Gates the orchestrator keeps

none beyond the wave gate — the next `/vwf:execute` run on this machine is the
first real exercise of the verbs.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` outside its Owns.

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

- **The `unclaim <folder>` verb** — backlog B12, `P1`, picked next; it needs a
  liveness rule this plan does not design.
- **A release** — the bump is recorded; the tag waits for a later release.
- **`docs/memory/decisions/*` and `handoff/next.md`** — historical records that
  name `/vwf:archive` and `assets/plan-index.md` as they were; never edited.
- **The Run log** — stays `execute`'s, written in the worktree per unit.
- **The planners' folder writes** — `index.md` and the unit files stay the
  planners' product; only the Status block moves to the skill.
- **`plugins/stackgen`** — names none of this.

## Parked

- **The diary checkpoint beside the run log.** The Stop hook fires mid-run, so a
  unit produces a diary entry on top of its run-log row. A later plan decides
  whether the hook stands down while a run is open. Parked since the deadlock
  plan (2026-09-15), carried through review-rows (2026-09-17).

## Gaps surfaced during execution

- **Owns widened — U4.** `plugins/vwf/assets/topologies/multi-repo.md:143` cites
  `assets/plan-index.md`, which U5 deletes; no unit owned the file. U3 reported
  it as `DOCS FALSIFIED:`; the orchestrator widened U4's Owns to that passage
  under the plan's Goal (the contract has one home). Non-blocking.
- **`priority` verb signature.** The plan wrote `priority <folder>`
  (01-skill.md) but both planners invoke it at their gate before the folder is
  written (R2 finding). Assumption taken: the verb accepts
  `<folder | requires…>`; the planners pass the `requires:` entries decided at
  interview item 12. Fixed by U1 and U3 in wave 2. Non-blocking.

## Run log

| Wave | Unit          | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                    | Commit   |
| ---- | ------------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight     | —     | 1     | pass        | doctor: mise, graphify CLI and graph (main checkout) present; no `.config/vwf.yaml`, no stack pins, no `code` unit — LSP and conventions steps skipped; format check skipped (no `covers:`); wave gate: 5/5 green on the inherited tree                                                                                                                                                                                   | —        |
| 1    | U1 skill      | opus  | 1     | pass        | edit; DECIDED: writers sentence names "a session, on the user's word" as `archive`'s caller; `archive` on a never-run folder writes `**ARCHIVED**` (status lists four states, `ARCHIVED` is `archive`'s alone); Who-calls-it table lists the two planners in one cell per verb; GAP: none                                                                                                                                 | —        |
| 1    | R1            | opus  | 1     | findings(2) | SKILL.md:55 tree-traps — four table rows unpadded (cosmetic); SKILL.md:117 completeness — an unasked sentence in `add` about `/vwf:backlog planned`; CONTRACT clean; RULINGS clean; looped to U1                                                                                                                                                                                                                          | —        |
| 1    | U1 skill      | opus  | 2     | pass        | edit; both R1 findings fixed — tables padded, unasked sentence removed from `add`                                                                                                                                                                                                                                                                                                                                         | 077cbbb6 |
| 1    | R1            | opus  | 2     | findings(1) | round-1 findings both resolved; new: references/plan-index.md:65 tree-traps — `complete` writers-table row 2 chars wide (cosmetic, gates pass); CONTRACT clean; RULINGS clean; cap of two rounds reached → contested                                                                                                                                                                                                      | —        |
| 2    | U2 execute    | opus  | 1     | pass        | edit; DECIDED: verified with `pre-commit run --files` over its Owns (code:precommit would --fix U3's files); two invocation lines exceed 80 cols as unbreakable code spans; GAP: none                                                                                                                                                                                                                                     | —        |
| 2    | U3 planners   | opus  | 1     | pass        | edit; DECIDED: hand-off steps renumbered 1–3; membership.md names `plan-management` bare in the docs-only list; DOCS FALSIFIED: `plugins/vwf/assets/topologies/multi-repo.md:143` cites `assets/plan-index.md` (no owner) — GAP: orchestrator widened U4's Owns to that file; GAP: format hook re-padded the folder's index.md, left as written                                                                           | —        |
| 2    | R2            | opus  | 1     | findings(3) | execute/SKILL.md:121 completeness — Resolution tests restated after the `resolve` call; plan/SKILL.md:322 + change-plan:152 semantics — `priority <folder>` invoked before the folder exists (plan hole, GAP: verb widened to `priority <folder \| requires…>`, fix looped to U1 and U3); execute/SKILL.md:761 completeness — bare "set BLOCKED" not a `status` call; CONTRACT clean; RULINGS clean; looped to U1, U2, U3 | —        |
| 2    | U3 planners   | opus  | 2     | pass        | edit; gate invocations now `priority <requires…>` in both planners and interview item 12; self-review keeps `<folder>`                                                                                                                                                                                                                                                                                                    | 97bea91a |
| 2    | U2 execute    | opus  | 2     | pass        | edit; `requires:` bullet cites `resolve` and keeps halt wording only; merge-conflict path invokes `status <folder> BLOCKED`                                                                                                                                                                                                                                                                                               | 2dc4ee39 |
| 2    | U1 skill      | opus  | 3     | pass        | edit (R2 loop-back); `priority` widened to `<folder \| requires…>` — argument-hint, heading, body, Who-calls-it row                                                                                                                                                                                                                                                                                                       | 23cbc8e8 |
| 2    | R2            | opus  | 2     | findings(1) | round-1 findings all three resolved; new: change-plan/SKILL.md:200 tree-traps — ragged fold (cosmetic); CONTRACT clean; RULINGS clean; cap of two rounds reached → contested; note for U4: docs list `priority <folder \| requires…>`                                                                                                                                                                                     | —        |
| —    | acceptance    | —     | 1     | skipped     | why: no `covers:` — no acceptance criteria to verify                                                                                                                                                                                                                                                                                                                                                                      | —        |
| —    | ux            | —     | 1     | skipped     | why: no `covers:` — no Screens contract                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| —    | reconcile     | —     | 1     | skipped     | why: no `covers:` (no stamps, registry or environment edit) and no `code` unit (nothing to persist); the fixed final waves U4 and U5 follow                                                                                                                                                                                                                                                                               | —        |
| 3    | U4 docs       | opus  | 1     | pass        | edit; 9 files incl. widened multi-repo.md:143; DECIDED: readme.md untouched (no hit); user-only count 5; GAP: its docs-sync surveyor report reached the orchestrator not the unit — proceeded on the unit's list plus its own grep, and the surveyor's list matches (docs-tree.md:49 handed to R3)                                                                                                                        | —        |
| 3    | R3            | opus  | 1     | findings(1) | docs-tree.md:49 completeness — lowercase splice seam; CONTRACT clean; RULINGS clean (decision 10 landed, counts agree, links resolve, no unowned falsified passage); looped to U4                                                                                                                                                                                                                                         | —        |
| 3    | U4 docs       | opus  | 2     | pass        | edit; docs-tree.md:49 seam fixed                                                                                                                                                                                                                                                                                                                                                                                          | 5cc9eaaa |
| 3    | R3            | opus  | 2     | pass        | round-1 finding resolved; nothing new; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                      | —        |
| 4    | U5 gates+bump | opus  | 1     | pass        | edit; vwf 19.32.0 → 19.33.0, keyword archive → plan-management, marketplace.json regenerated, `skills/archive/` and `assets/plan-index.md` deleted; GAP: none                                                                                                                                                                                                                                                             | —        |
| 4    | R4            | opus  | 1     | pass        | CONTRACT clean; RULINGS clean; tree-wide grep for the retired names and `19.32.0` empty                                                                                                                                                                                                                                                                                                                                   | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-18-plan-management

or let the queue pick it, by priority:

/vwf:execute next
