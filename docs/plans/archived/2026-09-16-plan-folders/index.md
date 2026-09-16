---
type: vwf-change-plan
title: One plan folder shape, one index, both executors read it
requires: []
backlog: []
---

# Plan — One plan folder shape, one index, both executors read it (2026-09-16)

## Status

**COMPLETE** — 2026-09-16. Commits `af98a5f7`, `e7e6b338`, `f738133a`,
`ae60be55`, `d402bec8`, `9abd9dc1`, `07012aed`, `789afc6f`, `d3cd7aae`,
`6b9db2fa`, `f8c8a273`, `e480b41c` on branch `2026-09-16-plan-folders`.

APPROVED 2026-09-16 by the user.

## Consent

| Action                                            | Granted                                                              |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                  |
| After landing: `mise run p:plugins:local`         | ask                                                                  |
| Release vwf publicly                              | minor — 19.29.0 → 19.30.0, hand edit of `plugin.json`; not this time |
| Release site publicly                             | patch — 1.1.23 → 1.1.24, `mise run p:site:version`; not this time    |

**A release recorded here is intent, not authorisation.** Every after-landing
step is an `ask` step: the run stops once, reports what it would do, and waits.
`mise run p:plugins:local` stages vwf into the dev marketplace; it is picked up
only by a **restarted** session. No tag is cut: per the 2026-09-14 ruling every
plan bump batches into the next release, offered only when `docs/plans/` holds
no unarchived folder.

## Goal

After this lands, `/vwf:plan` and `/vwf:change-plan` write the **same plan
folder** — `index.md` plus one file per unit, each unit carrying Wave, Owns,
Depends-on, Model and Kind — and `docs/plans/index.md` is **one table** with one
claim/complete/sweep procedure that `/vwf:execute` and `/vwf:change-execute`
both follow, `next` included. A cycle plan carries every ruling, consent row and
gate line `/vwf:execute` needs to run unattended in a fresh session and land per
recorded consent, the way a change plan already does.

This is the parked item *Cycle-plan queue parity* from
`docs/plans/archived/2026-09-15-plan-index-queue/` coming due. It is **plan 1 of
2**: plan 2 merges the two executors into one `/vwf:execute` with a per-unit
Kind switch and retires `/vwf:change-execute`; it names this folder in its
`requires:`. Nothing here is a reversal — the removal of `next` was proposed
mid-interview and withdrawn.

## Facts the survey established

- **Nothing programmatic reads `docs/plans/`.** No task under
  `.config/mise/tasks`, no rule in `scripts/src`, no workflow in
  `.github/workflows` parses the plan index or a plan file. The change is prose
  across skills, assets and docs; there is no gate delta.
- **No format number moves.** `blueprint_format` (25) covers `docs/blueprint/`
  only; `config_format` (19) bumps only on a `.config/vwf.yaml` key
  (`plugins/vwf/assets/vwf-config.md:256-258`). A plan-shape change stamps
  nothing.
- **Versions.** vwf 19.29.0 (`plugins/vwf/.claude-plugin/plugin.json:4`), site
  1.1.23 (`site/package.json:3`). No plugin bump task — `plugin.json` is a hand
  edit; `mise run p:site:version` bumps the site (no positional, refuses a dirty
  tree). 13 and 17 are never issued as a component.
- **Commit convention.** `.config/git-conventional-commits.yaml:3-10` — types
  `ops, docs, merge, feat, fix, refactor`; no scopes. Bumps read
  `ops: bump vwf X, site Y — <plan>`.
- **Formatting.** `plugins/**/*.md` is **not** dprint-formatted — fold by hand
  at the surrounding width. `site/**/*.md`, `readme.md`, `CLAUDE.md` and
  `docs/**` are dprint markdown (width 80, `textWrap: always`). The linter lints
  every markdown file.
- **The four trees.** `skills/plan/` 382 lines +
  `references/{delta-checks,
  plan-doc}.md` (101); `skills/execute/` 508 +
  `references/{preflight,
  acceptance-and-ux}.md` (47); `skills/change-plan/`
  314 + `references/{interview,plan-template}.md` (323);
  `skills/change-execute/` 327 + `references/{queue,wave-review,blocking}.md`
  (248). `execute` has `disable-model-invocation: false`; `change-execute` has
  `true`.
- **The index contract today** is `plugins/vwf/assets/plan-index.md`: two tables
  (:10-15, :26-40), the cycle table one row per flat file (:44-50), the change
  table with Priority derivation (:61), basename matching (:100-102), the `next`
  pick (:113-119). The procedure — read at tip, claim, completion, sweep — is
  `skills/change-execute/references/queue.md`.
- **The cycle template** is `plugins/vwf/assets/templates/plan.md` (25 lines):
  `type: vwf-plan`, `covers:`, `requires:`, `backlog:`, `status: draft`, the
  sections Slice / Current state / Target state / Delta — ordered steps /
  Acceptance criteria (from blueprint) / Risks — drift / Out of scope for this
  cycle / Gaps surfaced during execution. The folder template is
  `skills/change-plan/references/plan-template.md`.
- **Consumers of the cycle-plan shape outside the four trees**, each with the
  passage it assumes: `skills/archive/SKILL.md` (:4, :18-22 flat plan =
  `docs/plans/<plan>.md` and a cycle-table row, :34 gap-report companion, :53,
  :58-60, :75-79 Gaps section and run journal, :83 `requires:`, :93-100
  flat-vs-folder, :107-117 flat move, :118-142 folder move, :163);
  `skills/backlog/SKILL.md` (:8, :60, :131-138 flat cycle plan frontmatter);
  `skills/feedback/SKILL.md:209`; `skills/recall/SKILL.md:119-121`;
  `skills/doctor/SKILL.md:241-246`;
  `skills/setup/references/onboard-pipeline.md:23-24,164-165`;
  `skills/blueprint-authoring/references/frontmatter-and-links.md:59-60`;
  `skills/docs-sync/SKILL.md:35,44`; agents `execute-coder.md:24,80,111`,
  `execute-code-reviewer.md:36,43,130-131`,
  `execute-acceptance-verifier.md:25-27` (names the heading *Acceptance criteria
  (from blueprint)*), `execute-ux-reviewer.md:24`; assets
  `memory.md:61-69,91-94,167,307,318,325-338`,
  `execute-stages.md:33,81-82,97,163,176-215,240-246`,
  `membership.md:122-124,144-161`,
  `topologies/multi-repo.md:43-47,77-85,
  141-143`, `harness.md:64`,
  `templates/project-claude.md:7,12`, `graphify.md:64,72`; root
  `mempalace.yaml:71,112` ("cycle-plan" in room descriptions).
- **Docs the change falsifies.** `readme.md:231-239`;
  `CLAUDE.md:48-58, 72,
  84-86, 248, 296-302, 362`;
  `.claude/skills/vwf-plugin/SKILL.md:58-67,
  156-161, 198-205`;
  `.claude/skills/vwf-plugin/references/docs-tree.md:39-55,
  69-80`;
  `references/skills-and-agents.md:12, 34-38, 44-50, 65-72`;
  `references/assets.md:12,15,27`; `.claude/skills/release/SKILL.md:51`;
  `.claude/docs/ci-and-releases.md:82`; `.claude/docs/plugins.md:12`; site
  `plugins/vwf.md` — commands table :792-817 (rows :804-812), sections
  `/vwf:plan` :1812-1863, `/vwf:execute` :1864-1986, `/vwf:archive` :1987-2036,
  `/vwf:backlog` :2147-2201, `/vwf:change-plan` :2202-2308,
  `/vwf:change-execute` :2309-2429, quick-start :2705-2721, skills prose
  :2739-2809, plus :294 (mermaid *Approve & execute*), :342, :397-398, :503,
  :1825, :1952, :1999-2029, :2187, :2194, :2622, :2710;
  `how-to/operate/ad-hoc-change.md` (:11-16, :38-39, :45, :52, :60, :105, :144,
  :162-189, :262, :285-286); `how-to/operate/production-feedback-loop.md`
  (:93-99, :179-181, :209, :259, :278, :302, :314, :323);
  `how-to/operate/choosing-your-stack.md:238-239`;
  `how-to/operate/sessions-and-handoff.md:137`; `how-to/index.md:67-68`;
  `plugins/mempalace.md:354`. The greenfield and brownfield how-tos name
  `### /vwf:plan` / `### /vwf:execute` as step headings only — invocation, not
  shape — and are touched only where a sentence describes a flat file or an
  in-session hand-off.
- **Anchors.** `#vwfchange-execute` is linked from `CLAUDE.md:85`,
  `how-to/operate/ad-hoc-change.md:16,286` and `how-to/index.md:68`; the heading
  stays in this plan (the skill is retired in plan 2).
- **An in-flight flat plan exists elsewhere**: `virajp.dev`
  `docs/plans/2026-09-14-1533-home.md`, steps 9–14 remaining. Decision 6 covers
  it.
- **The last plan's gate** (`archived/2026-09-15-plan-index-queue/index.md`) was
  the five lines below, all green on `develop` at `1baa2abc`.

## Assumed decisions — confirm or override at review

| #  | Decision                               | Ruling                                                                                                                                                                                                                                                                                                                                                                                                            | Rejected                                       | Unit               |
| -- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------ |
| 1  | Cycle-plan folder name                 | `docs/plans/<date>-<HHMM>-<slice>/` — `index.md` plus one `NN-<unit>.md` per unit; the time component stays so two plans for one slice on one day coexist                                                                                                                                                                                                                                                         | `<date>-<slice>`; the flat file                | U2, U3, U4         |
| 2  | Units and Kind                         | Every unit carries Wave, Owns, Depends-on, Model and **Kind** (`code` or `edit`). `/vwf:plan` writes `Kind: code` on every unit; `/vwf:change-plan` writes `Kind: edit`. **No executor switches on Kind in this plan** — `execute` runs its per-step pipeline on every unit, `change-execute` its wave review                                                                                                     | Kind introduced in plan 2 only                 | U2, U4, U6, U7     |
| 3  | One index table                        | Header `Folder, Kind, Plan, Target repo, Priority, Status, Requires, Backlog`. `Kind` is `cycle` for `type: vwf-plan`, `change` for `type: vwf-change-plan`. `Target repo` is the member holding the code for a cycle plan, `—` for a change plan. The queue procedure (read at tip, claim, completion, sweep) moves from `change-execute/references/queue.md` into `assets/plan-index.md`                        | two tables; a separate queue asset             | U1, U3, U5, U6, U7 |
| 4  | `next` and Priority for both           | Both executors take `<folder>` or `next`; `next` reads the one table, filtered to its own `Kind`, ordered by Priority then date prefix then folder. Both claim the row `RUNNING` with a pushed commit in the main checkout **before** the worktree is cut. Priority is derived (`10 + max` over unarchived `requires:` rows), never asked                                                                         | remove `next` everywhere (proposed, withdrawn) | U1, U4, U5, U7     |
| 5  | Cycle `requires:` satisfaction         | A cycle plan's `requires:` entry is satisfied when every `covers:` doc of the required plan reads `implementation: complete` in the base repo's blueprint — the existing test — because cycle folders live in the target repo, which may not be cloned. The index row is what `next`, the claim and visibility use; it is not the satisfaction test for a cycle entry. A change entry keeps the row/archived test | index status as the test for both kinds        | U1, U5, U8         |
| 6  | In-flight flat plans                   | No compatibility path. `execute` reads folders only. The docs state: a flat plan in flight is finished on the previous vwf release, or its slice is re-run through `/vwf:plan` (stamp-heal drops what already conforms). The user finishes `virajp.dev`'s plan before staging this locally                                                                                                                        | a one-release legacy reader                    | U5, U9, U10        |
| 7  | Concurrency in this plan               | `execute` runs a cycle plan's units **serially in dependency order** — one unit = one step through the existing code → review + security pipeline. Waves are written by `/vwf:plan` and honoured as ordering only. Plan 2 decides concurrency when it merges the loops                                                                                                                                            | concurrent coders per wave now                 | U5                 |
| 8  | Landing                                | `execute` lands per the folder's **Consent** block: the final report is rendered from the run log; when consent says yes and every gate is green and no gap is open, it merges and pushes without a further prompt; every after-landing step asks. A red gate, an open blocking gap or `no` stops at the report as before                                                                                         | keep the human final gate in this plan         | U5                 |
| 9  | The LSP question                       | Moves to `/vwf:plan`'s stack gate: doctor's LSP finding is asked there (install now / proceed without) and recorded as a consent row `LSP <language>: installed / proceed without`. `execute` Setup 1 halts on `blocking` only and reads the row; it never asks                                                                                                                                                   | execute keeps asking at Setup 1                | U4, U5             |
| 10 | Shared assets                          | `assets/templates/plan-folder.md` — the one folder template both planners fill; `assets/plan-interview.md` — the one checklist, with a short per-planner note where an item differs; `assets/plan-index.md` — the table plus the procedure. `assets/templates/plan.md`, `change-plan/references/{plan-template,interview}.md` and `change-execute/references/queue.md` are deleted                                | interviews kept per skill                      | U1, U2, U4, U6, U7 |
| 11 | `/vwf:plan` hand-off                   | Mirrors `change-plan` §8: status `APPROVED`, index row, `/vwf:backlog planned`, then commit **and push** the folder in place on the current branch through `vwf:git-workflow` with declared preferences, then the launch line. The in-session *Approve & execute* option is removed; *Approve & plan next* (mid-chain) and *Approve only* stay                                                                    | in-session hand-off; local unpushed worktree   | U4                 |
| 12 | Run log                                | `index.md`'s Run log table is the record for both kinds. `execute` appends one row per node as it returns and mirrors it to the mempalace journal (room `runs`); the folder is what the final report renders and what a resume reads, the journal a copy that may be down                                                                                                                                         | journal only, folder empty for cycle plans     | U3, U5             |
| 13 | Status vocabulary                      | The folder's `## Status` block (`DRAFT`, `APPROVED`, `RUNNING`, `BLOCKED`, `COMPLETE`) is the one status. `status: draft/reviewed/stable` leaves the frontmatter                                                                                                                                                                                                                                                  | keep both                                      | U2, U4             |
| 14 | Cycle-only sections                    | A cycle `index.md` keeps **Slice**, **Acceptance criteria (from blueprint)** and **Gaps surfaced during execution** beside the shared sections; the template marks them *cycle plans only*. The acceptance verifier and `archive` read the last two by heading                                                                                                                                                    | fold into shared sections                      | U2, U4, U5, U8     |
| 15 | `archive`                              | Handles both kinds as folders through its existing folder path; the flat path and the `.gap-report.md` companion prose go. Its `requires:` check uses ruling 5 per kind                                                                                                                                                                                                                                           | keep the flat path                             | U8                 |
| 16 | `plan-surveyor` and the execute agents | Their prompts say *unit* where they said *plan step*; the coder is dispatched one unit's file plus the index's rulings, not the whole plan. No agent's tools or return block changes                                                                                                                                                                                                                              | leave agents untouched                         | U5                 |
| 17 | `execute` invocation mode              | `execute` gets `disable-model-invocation: true` — launched by a person in a fresh session, like `change-execute`; the in-session hand-off from `/vwf:plan` that needed model invocation is gone                                                                                                                                                                                                                   | keep model-invocable                           | U5, U9             |

## New dependencies

none — every unit edits markdown, YAML and JSON already in the tree.

## Units

| Id  | Wave | Unit file                                                    | Owns                                                                                                                                                                                                                                                                                                                                                    | Depends on | Status | Commit   |
| --- | ---- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1  | 1    | [01-index-contract.md](01-index-contract.md)                 | `plugins/vwf/assets/plan-index.md`                                                                                                                                                                                                                                                                                                                      | —          | green  | af98a5f7 |
| U2  | 1    | [02-template-and-interview.md](02-template-and-interview.md) | `plugins/vwf/assets/templates/plan-folder.md` (new), `plugins/vwf/assets/plan-interview.md` (new)                                                                                                                                                                                                                                                       | —          | green  | e7e6b338 |
| U3  | 1    | [03-other-assets.md](03-other-assets.md)                     | `plugins/vwf/assets/memory.md`, `plugins/vwf/assets/execute-stages.md`, `plugins/vwf/assets/membership.md`, `plugins/vwf/assets/harness.md`, `plugins/vwf/assets/topologies/multi-repo.md`, `plugins/vwf/assets/templates/project-claude.md`                                                                                                            | —          | green  | f738133a |
| U4  | 2    | [04-plan.md](04-plan.md)                                     | `plugins/vwf/skills/plan/**`, `plugins/vwf/assets/templates/plan.md` (delete — moved from U2 at run time)                                                                                                                                                                                                                                               | U1, U2, U3 | green  | ae60be55 |
| U5  | 2    | [05-execute.md](05-execute.md)                               | `plugins/vwf/skills/execute/**`, `plugins/vwf/agents/execute-coder.md`, `plugins/vwf/agents/execute-code-reviewer.md`, `plugins/vwf/agents/execute-security-reviewer.md`, `plugins/vwf/agents/execute-acceptance-verifier.md`, `plugins/vwf/agents/execute-ux-reviewer.md`, `plugins/vwf/agents/plan-surveyor.md`                                       | U1, U2, U3 | green  | d402bec8 |
| U6  | 2    | [06-change-plan.md](06-change-plan.md)                       | `plugins/vwf/skills/change-plan/**`                                                                                                                                                                                                                                                                                                                     | U1, U2, U3 | green  | 9abd9dc1 |
| U7  | 2    | [07-change-execute.md](07-change-execute.md)                 | `plugins/vwf/skills/change-execute/**`                                                                                                                                                                                                                                                                                                                  | U1, U2, U3 | green  | 07012aed |
| U8  | 2    | [08-consumers.md](08-consumers.md)                           | `plugins/vwf/skills/archive/**`, `plugins/vwf/skills/backlog/**`, `plugins/vwf/skills/feedback/SKILL.md`, `plugins/vwf/skills/recall/SKILL.md`, `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/setup/references/onboard-pipeline.md`, `plugins/vwf/skills/blueprint-authoring/**`, `plugins/vwf/skills/docs-sync/SKILL.md`, `mempalace.yaml` | U1, U2, U3 | green  | 789afc6f |
| U9  | 3    | [09-docs-repo.md](09-docs-repo.md)                           | `readme.md`, `CLAUDE.md`, `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `.claude/skills/release/SKILL.md`, `docs/memory/decisions/2026-09-16-plan-folders.md` (new)                                                                                                                                                                                | U4–U8      | green  | 6b9db2fa |
| U10 | 3    | [10-docs-site.md](10-docs-site.md)                           | `site/src/content/docs/**`                                                                                                                                                                                                                                                                                                                              | U4–U8      | green  | f8c8a273 |
| U11 | 4    | [11-gates-and-bump.md](11-gates-and-bump.md)                 | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`                                                                                                                                                                                                                                                        | U9, U10    | green  | e480b41c |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                          | Why it collides                                                                                          | Owner        |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------ |
| `plugins/vwf/.claude-plugin/plugin.json`      | the version; several units would bump it                                                                 | U11 only     |
| `.claude-plugin/marketplace.json`             | generated from the manifest                                                                              | U11 only     |
| `site/package.json`                           | the site version                                                                                         | U11 only     |
| `plugins/vwf/assets/plan-index.md`            | every wave-2 unit cites it; only one writes it                                                           | U1 only      |
| `plugins/vwf/assets/templates/plan-folder.md` | every planner and executor cites it                                                                      | U2 only      |
| `plugins/vwf/assets/plan-interview.md`        | both planners cite it                                                                                    | U2 only      |
| `plugins/vwf/agents/*.md`                     | U5 owns the execute agents and the surveyor; no other unit touches `agents/`                             | U5           |
| `readme.md`, `CLAUDE.md`, `.claude/**`        | human docs; every unit reports `DOCS FALSIFIED:` and edits none                                          | U9 only      |
| `site/src/content/docs/**`                    | the manual                                                                                               | U10 only     |
| `docs/plans/index.md`                         | the run branch never carries it; the claim and landing edits are the orchestrator's in the main checkout | orchestrator |
| `mempalace.yaml`                              | root config, two room descriptions name "cycle-plan"                                                     | U8 only      |

## Waves

- **Wave 1 — U1, U2, U3.** Three disjoint asset sets. Nothing in wave 2 can be
  written until the contract, the template and the checklist exist, since every
  wave-2 unit cites them by path and quotes their headings.
- **Wave 2 — U4, U5, U6, U7, U8.** Five disjoint trees: the four skill trees,
  plus the consumers unit, which owns every other skill that names a plan shape,
  and the root `mempalace.yaml`. U5 also owns `agents/`, which no other unit
  touches.
- **Wave 3 — U9, U10.** Docs split by tree — repo docs and the site — disjoint.
- **Wave 4 — U11.** The bump, the regenerated marketplace, the full gate.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1 — all five were green on `develop` at `1baa2abc`
when the plan was written. `code:precommit` misses untracked files: a unit that
creates a file (U2, U9) must `git add` it before the gate, or expect one retry.

## After landing

| Step                       | Mode | Notes                                                                                                                      |
| -------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | ask  | stages vwf at `19.30.0+N` into the dev marketplace and updates this machine's install; a **restarted** session picks it up |

No release step: the bump is recorded, the tag waits for the batch.

## Gates the orchestrator keeps

- **The retired-name grep.** After wave 3 and again after wave 4, from the repo
  root, each of these returns nothing outside `docs/plans/archived/`,
  `docs/memory/` and this folder: `Approve & execute`, `<date>-<time>-<slice>`,
  `-<time>-<slice>`, `docs/plans/<plan>.md`, `cycle-plan table`,
  `change-plan table`, `two tables` (in a plan-index sense — `CLAUDE.md:391`
  names the plugin tables and stays), `templates/plan.md`,
  `references/queue.md`, `references/plan-template.md`,
  `references/interview.md`, `status: draft`, `flat cycle plan`, `flat file`
  (plan sense), `run journal` as *the* record (a mirror mention is fine).
- **The anchor pass.** `mise run p:site:check`'s link checker is green — it
  proves `#vwfchange-execute`, `#vwfplan`, `#vwfexecute`, `#vwfarchive` and
  `#vwfchange-plan` still resolve from `CLAUDE.md`, the how-tos and the site.
- **The template round-trip.** Read `assets/templates/plan-folder.md` and
  confirm every heading `execute` (U5) and `change-execute` (U7) say they parse
  — Status, Consent, Units, Wave gate, After landing, Run log — appears in it
  verbatim, and that the cycle-only sections of ruling 14 are present and
  marked.
- **The unattended read.** Dispatch one reviewer (opus) with `skills/plan/**`
  and `skills/execute/**` and this question only: *walk a fictional cycle plan
  from `/vwf:plan`'s hand-off through `/vwf:execute <folder>` to the landing —
  name every point where execute would stop to ask a user something the plan
  folder could have carried.* The pass condition is an empty list, or a list
  whose every item is one of the pause conditions execute keeps by design (hard
  halt, subagent death, resource cap, all-blocking gap, non-converging
  cap-exempt finding, uncovered irreversible decision).

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter with
`--fix` on a path outside its Owns.

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

- **Merging the executors and retiring `/vwf:change-execute`** — plan 2, which
  requires this folder. Here both executors keep their own pipeline and read the
  new shape.
- **Any change to `execute`'s per-step pipeline** — the engines, the review
  round cap, the convergence guard, the acceptance and UX stages. Unchanged in
  this plan and in plan 2, which only wraps them in a Kind switch.
- **A compatibility reader for flat cycle plans** — ruling 6.
- **Concurrent units inside `execute`** — ruling 7; plan 2 decides.
- **`plugins/stackgen`** — its mentions of `/vwf:plan` and `/vwf:execute` are
  invocation only and stay true.
- **A release** — every plan bump batches into the next tag, per the 2026-09-14
  ruling.

## Parked

- **Plan 2 — one executor.** `/vwf:execute` absorbs `/vwf:change-execute`:
  `code` units get the TDD / coverage / engines / review + security pipeline,
  `edit` units get the wave review; acceptance, UX and the blueprint reconcile
  fire only when the plan has `covers:`; `change-execute` is retired outright,
  no alias. Decided on 2026-09-15; planned after this lands, with
  `requires: [docs/plans/2026-09-16-plan-folders]`.
- **`release <folder>`** — a verb that resets a stale `RUNNING` row to
  `APPROVED` in an integration-branch commit, instead of the hand edit. Needs a
  rule for proving the session is gone. Parked since the queue plan.
- **The diary checkpoint beside the run log.** The Stop hook fires mid-run, so a
  unit produces a diary entry on top of its run-log row. A later plan decides
  whether the hook stands down while a run is open. Parked since the deadlock
  plan.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | —     | green       | all five gate lines green on develop at f0569ae1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| 1    | U1        | opus  | 1     | green       | DECIDED: stash tag `vwf plan queue <folder>`; `## Status` span → "Status block"; membership.md citation kept. GAP: membership.md:147-149 still names two tables — U3 owns; columns table cites assets/membership.md for Target repo assuming U3 keeps the section name                                                                                                                                                                                                                                                                                                                               | af98a5f7 |
| 1    | U2        | opus  | 1     | green       | DECIDED: shared asset says "the planner"/"the executor" not a skill section; Slice carries dark-exposure flag detail; acceptance link uses ../../blueprint. GAP: deleting templates/plan.md reddens p:plugins:check until U4 drops skills/plan/SKILL.md:50 — orchestrator defers the deletion to U4's commit (U4 Owns widened to the rm)                                                                                                                                                                                                                                                             | e7e6b338 |
| 1    | R1        | opus  | 1     | findings(5) | plan-folder.md:221 retired `<date>-<time>-<slice>` form; plan-folder.md:186 Run log per-unit vs ruling 12 per-node (RULINGS U2 #12); plan-interview.md:68 9a lazy continuation; project-claude.md:13 86 cols; execute-stages.md:62-63,84 ragged fold — looped to U2, U3                                                                                                                                                                                                                                                                                                                              |          |
| 1    | U2        | opus  | 2     | green       | fixed R1 findings 1-3; DECIDED: 9a a standalone paragraph between list runs (no `9a.` marker in markdown; column-0 grep kept)                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |          |
| 1    | U3        | opus  | 2     | green       | fixed R1 findings 4-5; four pre-existing >80 lines in execute-stages.md left untouched                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |          |
| 1    | R1        | opus  | 2     | findings(1) | execute-stages.md:85 orphaned `**round number**). It` short line (cosmetic) — contested, cap reached                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 1    | U3        | opus  | 1     | green       | DECIDED: execute-stages.md:244-246 reworded plan step→unit (grep forbids "plan step"), stamp logic untouched; node/why ride in Run log Detail column                                                                                                                                                                                                                                                                                                                                                                                                                                                 | f738133a |
| 2    | U6        | opus  | 1     | green       | DECIDED: description frontmatter untouched; §8 names neither executor. DOCS FALSIFIED: CLAUDE.md:51, vwf-plugin/SKILL.md:64, skills-and-agents.md:45-46, docs-tree.md:44, site vwf.md:2283,2324 ("change-plan table")                                                                                                                                                                                                                                                                                                                                                                                | 9abd9dc1 |
| 2    | U7        | opus  | 1     | green       | DECIDED: blocking.md/wave-review.md untouched; cycle-entry refusal wording mirrors the change-entry line                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 07012aed |
| 2    | U4        | opus  | 1     | green       | templates/plan.md deleted here (deferred from U2). DECIDED: blind spots/trimmed chain go to Facts or an assumed-decisions row (template has no Risks section); §7 closes with a self-review checklist; multi-repo hand-off order member folder first, base index+backlog last                                                                                                                                                                                                                                                                                                                        | ae60be55 |
| 2    | U8        | opus  | 1     | green       | DECIDED: `vwf-gap-report` type row removed (ruling 15); onboard-pipeline.md and docs-sync untouched. DOCS FALSIFIED: site vwf.md archive :1987-2036, backlog :2187,:2194, commands-table archive row; skills-and-agents.md archive/backlog rows. GAP: `flat` grep hits two non-plan uses, left; whole-tree precommit red on U5 mid-edit                                                                                                                                                                                                                                                              | 789afc6f |
| 2    | U5        | opus  | 1     | green       | DECIDED: wave-gate lines run at Setup 1 preflight and again after Reconcile; coder IMPLEMENTED line per unit edit; description folded for strict YAML; "flat" → "single-file plan". GAP: consent-withheld landing leaves Status RUNNING + ready to land by hand, mirroring change-execute §7                                                                                                                                                                                                                                                                                                         | d402bec8 |
| 2    | R2        | opus  | 1     | findings(5) | execute:609 COMPLETE row re-points Folder under archived/ while folder stays (RULINGS U5 #3, plan-internal: edit 13 vs asset completion step); recall:119 + execute:279,307 cap resume via recall but execute is disable-model-invocation (ruling 17); change-plan:46 "flat file" hits the retired grep (unit-dictated); execute:386 Setup 1 depends on step 2; frontmatter-and-links.md:24 status: required contradicts ruling 13 — looped to U5, U8, U6, and U1 (asset: Folder re-pointed by whichever skill moves the folder). GAP: orchestrator ruled the re-point follows the move, per edit 13 |          |
| 2    | U6        | opus  | 2     | green       | change-plan:46 reworded, `flat file` gone                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 2    | U1        | opus  | 2     | green       | plan-index.md completion: Folder re-pointed by whichever skill moves the folder; DECIDED: execute row of Writers table says Folder left as is                                                                                                                                                                                                                                                                                                                                                                                                                                                        | d3cd7aae |
| 2    | U5        | opus  | 2     | green       | landing leaves Folder live; every resume is `/vwf:execute <folder>` by a person; Setup reordered worktree→preflight; DECIDED: hook directive still names /vwf:handoff                                                                                                                                                                                                                                                                                                                                                                                                                                |          |
| 2    | U8        | opus  | 2     | green       | archive offers COMPLETE row still under docs/plans/ and re-points on move; recall prints the launch line, never invokes; frontmatter-and-links status: exception                                                                                                                                                                                                                                                                                                                                                                                                                                     |          |
| 2    | R2        | opus  | 2     | findings(2) | execute:616 completion sweep removes the plan's own COMPLETE row while the cycle folder is live — archive never finds it (consequence of round-1 fix); frontmatter-and-links.md:37 code span begins with `##`. RULINGS clean. Cap reached: both fixed as mechanical re-dispatches of U1 (sweep skips live-Folder rows) and U8, no third review — flagged in the report                                                                                                                                                                                                                               |          |
| 2    | U1        | opus  | 3     | green       | sweep candidates only rows whose Folder is under archived/, stated in three places                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | d3cd7aae |
| 2    | U8        | opus  | 3     | green       | `## Status` span → "its Status block"; archive §1/§3 match the sweep rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 3    | U9        | opus  | 1     | green       | DECIDED: docs-tree history row says "single-file cycle plan"; "Approve & execute" named only in docs/memory; CLAUDE.md "two tables" (plugin sense) left. GAP: its docs-sync surveyor's report reached the orchestrator, not U9 (docs-tree.md:39-50, skills-and-agents.md:38 — passages U9 rewrote anyway; R3 verifies)                                                                                                                                                                                                                                                                               | 6b9db2fa |
| 3    | U10       | opus  | 1     | green       | DECIDED: "The execute merge gate" heading kept (4 inbound links), body rewritten to consent-at-approval; bare `/vwf:execute` in how-tos → `/vwf:execute next`. GAP: its surveyor's report reached the orchestrator (vwf.md broad drift, greenfield how-tos, ad-hoc-change, mempalace.md:354, sessions-and-handoff:133 — all in U10's CHANGED list; R3 verifies)                                                                                                                                                                                                                                      | f8c8a273 |
| 3    | R3        | opus  | 1     | findings(5) | vwf.md:206-211 `+` at line start became a bogus sub-bullet; readme.md:21,:225 human merge gate (RULINGS U9 #8); skills-and-agents.md:39 doctor row "execute also gates on LSP" (ruling 9); vwf.md:2303 "after the final gate"; two how-tos "plan step" — looped to U9, U10. Both surveyor lists verified resolved; retired-name grep clean outside allowed senses                                                                                                                                                                                                                                    |          |
| 3    | U9        | opus  | 2     | green       | readme.md:19-23,:225 land per recorded consent; doctor row fixed. DECIDED: readme.md:26 "never merges until you approve" left — consent at approval is that approval                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 3    | U10       | opus  | 2     | green       | Fit bullet rephrased; backlog callers rows "at landing, per the folder's consent"; two how-tos plan step → plan unit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 3    | R3        | opus  | 2     | pass        | all five resolved; retired-name grep clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |          |
| 4    | U11       | opus  | 1     | green       | site 1.1.24 via p:site:version (no commit), vwf 19.30.0 hand edit, marketplace regenerated; all six gate commands exit 0. DECIDED: files left unstaged for the orchestrator's commit                                                                                                                                                                                                                                                                                                                                                                                                                 | e480b41c |
| 4    | RU        | opus  | 1     | pass        | unattended read: 21 stops, 16 tagged by design; the other 5 judged pause conditions of the kept classes — :66 absent target repo (hard halt on machine state), :150 blocking format drift (hard halt, never migrates), :201 cyclic Depends-on (uncovered decision — a plan defect), plan-folder.md:169 unit UNRESOLVED (all-blocking gap path), :630 Consent `no` (the user's recorded choice). GAP: judgment call, listed in the report                                                                                                                                                             |          |
| 4    | R4        | opus  | 1     | pass        | three Owns files only; versions exact; marketplace differs in vwf ref+version only; no tag                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |          |
| 4    | gate      | —     | —     | green       | wave gate 5/5; orchestrator gates: retired-name grep clean after waves 3 and 4, anchor pass green, template round-trip 6/6 headings + 3 marked cycle-only sections, unattended read pass                                                                                                                                                                                                                                                                                                                                                                                                             |          |

## Launch

This folder is committed and pushed on the branch it was planned on, so the
fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-16-plan-folders

or let the queue pick it, by priority:

/vwf:change-execute next
