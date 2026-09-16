---
type: vwf-change-plan
title: One executor — /vwf:execute runs every plan folder
requires: [ docs/plans/2026-09-16-plan-folders ]
backlog: []
---

# Plan — One executor — /vwf:execute runs every plan folder (2026-09-16)

## Status

**RUNNING** — started 2026-09-16 13:40, worktree
`.worktrees/2026-09-16-one-executor`, branch `2026-09-16-one-executor`

APPROVED 2026-09-16 by the user.

## Consent

| Action                                            | Granted                                                              |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                  |
| After landing: `mise run p:plugins:local`         | ask                                                                  |
| Release vwf publicly                              | minor — 19.30.0 → 19.31.0, hand edit of `plugin.json`; not this time |
| Release site publicly                             | patch — 1.1.24 → 1.1.25, `mise run p:site:version`; not this time    |

**A release recorded here is intent, not authorisation.** Every after-landing
step is an `ask` step: the run stops once, reports what it would do, and waits.
`mise run p:plugins:local` stages vwf into the dev marketplace; it is picked up
only by a **restarted** session. No tag is cut: per the 2026-09-14 ruling every
plan bump batches into the next release, offered only when `docs/plans/` holds
no unarchived folder.

## Goal

After this lands there is **one executor**. `/vwf:execute <folder> | next` runs
every plan folder, of either kind: a `code` unit goes through the TDD / coverage
/ engines / review + security pipeline one unit at a time, an `edit` unit is
dispatched concurrently with the other `edit` units of its wave and judged by
the wave review; the acceptance and UX pass and the blueprint reconcile fire
only when the plan has `covers:`; the landing follows recorded consent, archives
the folder when no gap is open, and stops once before every after-landing step.
`/vwf:change-execute` no longer exists — no alias, no redirect.

This is **plan 2 of 2**, the first Parked item of
`docs/plans/archived/2026-09-16-plan-folders/`, whose `requires:` this folder
names. Nothing here is a reversal.

## Facts the survey established

- **Plan 1 landed** at `a4a3abd4` (row swept, folder archived). vwf 19.30.0,
  site 1.1.24, staged locally as `19.30.0+1`.
- **Nothing programmatic references `change-execute`** — no hook, agent,
  manifest, task, checker or workflow. `plugin.json` names neither executor. The
  change is prose across skills, assets and docs. No format number moves.
- **`skills/execute/SKILL.md` is 690 lines** + `references/preflight.md` (30),
  `references/acceptance-and-ux.md` (23). Headings: Halt Conditions :44 / §1
  Resolve and refuse early :46 / Format Check :145 / Doc Paths :153 / References
  :170 / Pipeline (per unit) :180 / Autonomous Rules :192 / Pause Conditions
  :274 / Recall :344 / Setup :373 / Execute loop :459 / Acceptance & UX :532 /
  Reconcile :551 / Final report and landing :573 / Archive :667 / What does not
  stop the run :681. It reads only the **index row's** Kind (:48-55) and never
  the Units table's. It claims the row :122-133, runs units serially with an
  explicit placeholder for this plan (:196-204), writes the Run log :256-272,
  :449-457, :524-530, lands per Consent :602-645 leaving the folder live for
  `/vwf:archive` (:616-626), after-landing :647-658, pauses :274-340
  (resource-cap hook contract :297-323). Cycle-only parts: `covers:` read :74,
  stamp-based `requires:` :83-96, "missing blueprint" halt :288, Format Check
  :145-151, Doc Paths rows :161-167, Pipeline :180-190 and Autonomous Rules
  :209-238, preflight LSP :395-413, stack conventions :422-448, Acceptance & UX
  :532-549, Reconcile :551-571, report bullets :584-593, gap reconciliation
  :660-665, Archive :667-673, Chain forward :675-679.
- **`skills/change-execute/SKILL.md` is 348 lines** +
  `references/wave-review.md` (69: The reviewer :9, The loop :39) +
  `references/blocking.md` (73: isolated vs all-blocking :6, mechanical
  re-dispatch :27, status line :35, Resume :46). Headings: References :43 / §1
  :52 / §2 worktree :134 / §3 preflight :145 / §4 waves :157 / §5 on failure
  :216 / §6 report :224 / §7 land :243 / §8 after landing :269 / resource caps
  :306 / what does not stop :317 / never does :328. What it has that `execute`
  lacks: the orchestrator "never reads unit work inline" rule :25-27, :329-331;
  concurrent dispatch per wave in one message with the verbatim unit prompt
  :166-176 (no `isolation: worktree` :140-142); one Run log row per unit
  report + one re-dispatch then `failed` :177-183; the wave review :184-187
  (prompt :11-20, five rules :22-34, loop :41-66 — CONTRACT/RULINGS always
  fixed, two-round cap, unowned-file finding → DOCS FALSIFIED + Owns widening as
  GAP, guard, `contested` residue); wave gate after every wave + UNRESOLVED
  read + red-line attribution :188-195; per-unit staging discipline
  (`git add -- Owns`, reset outside Owns) :196-204; the fixed final units as
  their own waves, only when nothing skipped, docs unit runs docs-sync + DOCS
  FALSIFIED, gates-and-bump bumps and regenerates :206-214; UNRESOLVED
  blocking + dependents skipped + resume from first non-green unit (§5 :216-222
  → blocking.md); report incl. Owns widenings, contested findings, versions
  bumped :229-238, BLOCKED rule :240-241; landing **moves the folder** to
  `archived/` and re-points Folder :245-263; the after-landing walk :269-304
  (fuller than execute's); "What this skill never does" :328-348. It names no
  mempalace at all.
- **What `execute` has that `change-execute` lacks:** everything cycle-only
  above, mempalace recall/journal, the full resource-cap contract, the pause
  taxonomy, the absent-target-repo halt and multi-repo linkage :57-68, :380-394,
  Archive/Chain forward, per-node Run log rows.
- **`assets/execute-stages.md` (265 lines)** — Stages :8 / Shared stage rules
  :112 / Run log and its journal mirror :179 / Reconcile :229. Title :1 "used by
  /vwf:execute". Blueprint-bound: the stage table and contracts :10-110, the
  gap/blueprint rules :160-177, Reconcile steps 1-3 and 5 (:231-246, :253-265;
  step 4 docs-sync :247-252 is generic). Generic: Model enforcement :114-118,
  Pipeline knobs :119-122, Terse output :123-128, Loop on findings :129-137,
  Convergence guard :138-159 (already cited by `wave-review.md:58-62`), the Run
  log section :179-227.
- **The wave reviewer is an inline prompt** (`general-purpose`, named `R<wave>`,
  `wave-review.md:11-20`), not an agent file. No agent under `agents/`
  references `change-execute`.
- **Assets naming two executors:** `assets/plan-index.md` :12, :25 (intro prose
  written into every repo's `docs/plans/index.md`), :63-66 (execute row "Folder
  left as is" vs change-execute row "pointing Folder at archived"), :117-119
  ("either executor … filtered to its own kind"), :154, :174, :192, :206-209
  (Folder re-point split); `assets/templates/plan-folder.md` :3-5, :14, :114-117
  ("No executor switches on it yet … the switch is plan 2's"), :186-188 (Run log
  per node vs per unit report), :231, :235 (launch lines), :289, :300-303 ("see
  the executor"); `assets/plan-interview.md:122` ("the executor" — stays).
- **Other skills naming it:** `skills/plan/SKILL.md:421`;
  `skills/change-plan/SKILL.md` :4, :23, :27, :32, :35, :103, :111, :142, :149,
  :208, :218-222 ("switches on nothing"), :233, :245, :270, :304, :308;
  `skills/archive/SKILL.md` :61, :66, :139; `skills/backlog/SKILL.md` :8, :133;
  `skills/feedback/SKILL.md:209`. `recall`, `doctor`, `handoff`, `docs-sync`:
  none.
- **Repo docs naming it:** `readme.md:237-238`; `CLAUDE.md` :53, :54 ("filtered
  to its own kind"), :57, :75, :88, :253, :303, :370;
  `.claude/skills/vwf-plugin/SKILL.md` :61, :70, :72, :204;
  `references/skills-and-agents.md` :12, :35, :44-46; `references/assets.md:15`;
  `references/docs-tree.md` :49, :51, :58; `.claude/skills/release/SKILL.md:51`;
  `.claude/docs/plugins.md:12`; `.claude/docs/ci-and-releases.md:82`.
- **Site:** `plugins/vwf.md` (20 hits) :153, :227, :356, :817-818 (commands
  table rows execute :811, change-execute :818), :826, :829 ("The two executors
  are user-only"), :858, :1932, :2106, :2114, :2303, :2315, :2356, :2370,
  :2414-2415, :2421 (the `### /vwf:change-execute` heading; `###
  /vwf:execute`
  is :1909), :2428-2429, :2446, :2459, :2658, :2866-2867; :509 ("both executors'
  `next`"). `how-to/operate/ad-hoc-change.md` :16, :108, :166, :172, :194, :291
  (title and description name neither executor — keep them).
  `how-to/index.md:69`. **Inbound links to `#vwfchange-execute`**:
  `CLAUDE.md:75`, `CLAUDE.md:88`, `ad-hoc-change.md:16`, `:291`, `vwf.md:356`,
  `:1932`, `:2303`, `:2370`, `:2658`. "The execute merge gate" heading is
  `how-to/greenfield/single-repo.md:437`, linked from four how-tos — its own
  anchor, untouched. **No redirect mechanism** (`site/astro.config.ts` static,
  no `_redirects`, no redirect frontmatter); the hand-rolled TOC
  (`site/src/layouts/Docs.astro:49-50`) is built from depth-2/3 headings, so the
  retired heading simply leaves the outline; `p:site:check`'s link checker fails
  any surviving link to it.
- **Commit convention:** types `ops, docs, merge, feat, fix, refactor`; no
  scopes. `plugins/**/*.md` is not dprint-formatted; site, root docs and
  `docs/**` are.
- **From plan 1's run log:** every resume is by a person (`execute` is
  user-only); the sweep removes only rows whose `Folder` is under `archived/`; a
  consent-withheld landing leaves Status `RUNNING` and the branch ready to land
  by hand; the wave gate runs at preflight and again after Reconcile.

## Assumed decisions — confirm or override at review

| #  | Decision                   | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Rejected                                  | Unit       |
| -- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------- |
| 1  | One executor               | `skills/execute/` is the one executor and keeps its name; `skills/change-execute/` is deleted whole — `SKILL.md` and its three references — with no alias and no redirect                                                                                                                                                                                                                                                                                                                                                                                                 | a thin alias kept for one release         | U2         |
| 2  | The Kind switch            | The executor reads each unit's `Kind` from the Units table. `code` runs the per-unit pipeline now in `execute` (recall, coder under TDD, engines, both reviewers, merged loop-back, gaps, commit, journal), moved verbatim into `references/code-unit.md`. `edit` runs the dispatch and wave review now in `change-execute` §4 and `wave-review.md`, moved into `references/edit-unit.md`. `blocking.md` moves to `execute/references/`. `SKILL.md` keeps the shared spine: resolve and claim, worktree, preflight, the wave loop, report, landing, after landing, pauses | one executor per kind; everything inline  | U2         |
| 3  | Mixed waves                | Within a wave: every `edit` unit is dispatched in one message and awaited; then each `code` unit runs serially through its pipeline; then the wave review, then the wave gate. Engines and reviewers never overlap across units                                                                                                                                                                                                                                                                                                                                           | everything concurrent; everything serial  | U2         |
| 4  | The wave review            | `R<wave>` runs after every wave, of either kind, scoped to the contract: rulings honoured, Owns respected, cross-unit drift, docs falsified. It is told that code-quality and security findings on a `code` unit belong to that unit's reviewers and are not re-raised. The two-round cap, the guard and `contested` residue stay as written                                                                                                                                                                                                                              | only waves holding an edit unit           | U2         |
| 5  | Archiving at landing       | When the landing's gap list is empty, the landing moves the folder to `docs/plans/archived/`, re-points `Folder`, sets `COMPLETE` and sweeps — for both kinds. When any gap is open, the folder stays live as the working record, the row reads `COMPLETE` with `Folder` at the live path, and the report names `/vwf:archive` for after reconciliation. `plan-index.md`'s two writer rows collapse to one                                                                                                                                                                | always leave for archive; always move     | U1, U2, U5 |
| 6  | What `covers:` gates       | Present only on a cycle plan, `covers:` gates: the format check, the stamp-based `requires:` test, the Doc Paths blueprint rows, the acceptance and UX pass, Reconcile's stamps / registry / environment / harness steps, the coverage / acceptance / ux / stamps bullets of the report, gap reconciliation and chain forward. A plan without it skips each, journaled                                                                                                                                                                                                    | run everything for every plan             | U2, U3     |
| 7  | Preflight by content       | `/vwf:doctor` runs for every plan. The stack-conventions fetch and the LSP consent-row rule run only when the Units table holds a `code` unit. `references/preflight.md` says so                                                                                                                                                                                                                                                                                                                                                                                          | full preflight for every plan             | U2         |
| 8  | Mempalace by Kind          | The Run log mirrors to room `runs` for every plan; per-unit recall before dispatch and decision persistence after run for `code` units only — an `edit` unit's ruling is in its file                                                                                                                                                                                                                                                                                                                                                                                      | mempalace for every unit                  | U2, U3     |
| 9  | The fixed final units      | The docs unit and the gates-and-bump unit are the last two waves for every plan, run only when nothing was skipped, exactly as `change-execute` §4 says. `execute`'s inline docs-sync call in Reconcile goes — the docs unit does it. The `implementation:` stamps and the registry / environment / harness reconcile stay the orchestrator's Reconcile step, gated on `covers:`, run **before** the docs unit's wave so its delta is complete                                                                                                                            | orchestrator keeps doing docs-sync itself | U1, U2, U3 |
| 10 | Landing and pauses         | The report, landing and after-landing text is `change-execute` §§6–8 — the fuller version — with `execute`'s additions: the `covers:`-gated report bullets, `/vwf:backlog done`, the git-workflow declared preference, the consent-withheld rule (Status stays `RUNNING`, branch ready to land by hand). The pause taxonomy, the resource-cap hook contract and "What does not stop the run" are `execute`'s and apply to every plan                                                                                                                                      | keep two shorter variants                 | U2         |
| 11 | `next`                     | No Kind filter: candidates are every `APPROVED` row whose requirements are satisfied, ordered as today; the `Kind` cell is still written and printed with the pick                                                                                                                                                                                                                                                                                                                                                                                                        | keep the per-kind filter                  | U1, U2     |
| 12 | The retired anchor         | The `### /vwf:change-execute` heading is removed from `plugins/vwf.md`; its content folds into `### /vwf:execute`. The nine inbound `#vwfchange-execute` links re-point to `#vwfexecute`. `ad-hoc-change.md` keeps its title and description; its body names `/vwf:execute`. No redirect exists to keep                                                                                                                                                                                                                                                                   | an empty heading kept as an anchor        | U6, U7     |
| 13 | The planners' launch lines | `/vwf:change-plan` and `/vwf:plan` both end with `/vwf:execute docs/plans/<folder>` and `/vwf:execute next`; `plan-folder.md`'s Launch block, its "No executor switches on it yet" paragraph and its Run log "per unit report" sentence are rewritten for one executor; `plan-index.md`'s "either executor" prose and the intro written into every repo's index name one `next`                                                                                                                                                                                           | —                                         | U1, U4, U5 |
| 14 | Frontmatter                | `execute`'s `description` names both kinds and the Kind switch; `argument-hint` and `disable-model-invocation: true` unchanged. `change-plan`'s `description` names `/vwf:execute` where it named `change-execute`                                                                                                                                                                                                                                                                                                                                                        | —                                         | U2, U4     |

## New dependencies

none — every unit edits markdown and JSON already in the tree.

## Units

| Id | Wave | Unit file                                            | Kind | Owns                                                                                                                                                                     | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | -------- |
| U1 | 1    | [01-index-and-template.md](01-index-and-template.md) | edit | `plugins/vwf/assets/plan-index.md`, `plugins/vwf/assets/templates/plan-folder.md`, `plugins/vwf/assets/plan-interview.md`                                                | —          | green   | 13f5f0f1 |
| U3 | 1    | [03-execute-stages.md](03-execute-stages.md)         | edit | `plugins/vwf/assets/execute-stages.md`, `plugins/vwf/assets/memory.md`                                                                                                   | —          | green   | dd89ceea |
| U2 | 2    | [02-execute.md](02-execute.md)                       | edit | `plugins/vwf/skills/execute/**`, `plugins/vwf/skills/change-execute/**` (delete)                                                                                         | U1, U3     | green   | 8b54d1ff |
| U4 | 2    | [04-change-plan.md](04-change-plan.md)               | edit | `plugins/vwf/skills/change-plan/**`                                                                                                                                      | U1         | green   | c562fe6d |
| U5 | 2    | [05-plan-and-consumers.md](05-plan-and-consumers.md) | edit | `plugins/vwf/skills/plan/**`, `plugins/vwf/skills/archive/**`, `plugins/vwf/skills/backlog/**`, `plugins/vwf/skills/feedback/SKILL.md`                                   | U1         | green   | af57a24e |
| U6 | 3    | [06-docs-repo.md](06-docs-repo.md)                   | edit | `readme.md`, `CLAUDE.md`, `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `.claude/skills/release/SKILL.md`, `docs/memory/decisions/2026-09-16-one-executor.md` (new) | U2, U4, U5 | green   | 46544335 |
| U7 | 3    | [07-docs-site.md](07-docs-site.md)                   | edit | `site/src/content/docs/**`                                                                                                                                               | U2, U4, U5 | green   | f11c6fd6 |
| U8 | 4    | [08-gates-and-bump.md](08-gates-and-bump.md)         | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`                                                                         | U6, U7     | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Every unit is `Kind: edit` — this plan is prose. The executor that
runs it is the one plan 1 landed, which reads `Kind` and ignores it.

## Shared-file rule

| File                                          | Why it collides                                                                                | Owner        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------ |
| `plugins/vwf/.claude-plugin/plugin.json`      | the version                                                                                    | U8 only      |
| `.claude-plugin/marketplace.json`             | generated from the manifest                                                                    | U8 only      |
| `site/package.json`                           | the site version                                                                               | U8 only      |
| `plugins/vwf/assets/plan-index.md`            | U2, U4, U5 cite it; one writes it                                                              | U1 only      |
| `plugins/vwf/assets/templates/plan-folder.md` | U2, U4, U5 cite it; one writes it                                                              | U1 only      |
| `plugins/vwf/assets/execute-stages.md`        | U2 cites it; one writes it                                                                     | U3 only      |
| `plugins/vwf/skills/change-execute/**`        | read by U2 as source material, then deleted by U2; nobody else                                 | U2 only      |
| `readme.md`, `CLAUDE.md`, `.claude/**`        | human docs; every unit reports `DOCS FALSIFIED:` and edits none                                | U6 only      |
| `site/src/content/docs/**`                    | the manual                                                                                     | U7 only      |
| `docs/plans/index.md`                         | the run branch never carries it; claim and landing are the orchestrator's in the main checkout | orchestrator |

## Waves

- **Wave 1 — U1, U3.** Two disjoint asset sets. U2 quotes both by heading, so
  they land first.
- **Wave 2 — U2, U4, U5.** Three disjoint skill trees; U2 owns both executor
  directories, one to rewrite and one to delete.
- **Wave 3 — U6, U7.** Docs by tree, disjoint.
- **Wave 4 — U8.** The bump, the regenerated marketplace, the full gate.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1 — all five were green on `develop` at `a4a3abd4`.
`code:precommit` misses untracked files: U2 (new references) and U6 (the
decision record) must `git add` what they create before the gate.

## After landing

| Step                       | Mode | Notes                                                                                                                      |
| -------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | ask  | stages vwf at `19.31.0+N` into the dev marketplace and updates this machine's install; a **restarted** session picks it up |

No release step: the bump is recorded, the tag waits for the batch.

## Gates the orchestrator keeps

- **The retired-name grep.** After wave 3 and again after wave 4, from the repo
  root: `change-execute` returns nothing outside `docs/plans/archived/`,
  `docs/memory/` and this folder; `either executor`, `both executors`,
  `two
  executors`, `its own kind`, `filtered to its Kind`,
  `switches on nothing` and `the switch is plan 2` return nothing anywhere
  outside those trees.
- **The directory.** `test ! -d plugins/vwf/skills/change-execute` and
  `test -f plugins/vwf/skills/execute/references/code-unit.md && test -f
  plugins/vwf/skills/execute/references/edit-unit.md && test -f
  plugins/vwf/skills/execute/references/blocking.md`.
- **The anchor pass.** `mise run p:site:check` green — the link checker proves
  the nine re-pointed links resolve and no `#vwfchange-execute` link survives.
- **The unattended read, twice.** Dispatch one reviewer (opus) with
  `skills/execute/**` and `assets/templates/plan-folder.md` and this question
  only: *walk (1) a fictional change plan of three `edit` units and (2) a
  fictional cycle plan of three `code` units with `covers:` from
  `/vwf:execute <folder>` to the landing — name every point where the executor
  would stop to ask a user something the folder could have carried, and every
  step it would run that the plan's kind should have skipped.* Pass: an empty
  list, or one whose every item is a pause condition the skill keeps by design
  (hard halt, subagent death, resource cap, all-blocking gap, non-converging
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

- **Any change to the `code` pipeline itself** — the engines, the review round
  cap, the convergence guard, the coder's TDD and coverage rule, the acceptance
  and UX stages. They move into a reference verbatim.
- **A `release <folder>` verb** for a stale `RUNNING` row — parked.
- **The diary checkpoint beside the run log** — parked.
- **`plugins/stackgen`** — names neither executor.
- **A release** — every plan bump batches into the next tag.

## Parked

- **`release <folder>`** — resets a stale `RUNNING` row to `APPROVED` in an
  integration-branch commit instead of the hand edit. Needs a rule for proving
  the session is gone. Parked since the queue plan.
- **The diary checkpoint beside the run log.** The Stop hook fires mid-run, so a
  unit produces a diary entry on top of its run-log row. A later plan decides
  whether the hook stands down while a run is open. Parked since the deadlock
  plan.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                 | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 0    | preflight | —     | 1     | green       | marketplace, inventory, check, precommit, site:check all green on develop at b216671e                                                                                                                                                                                                                                                                                                                  | —        |
| 1    | U3        | opus  | 1     | green       | DECIDED: commit field reads code node or landed edit unit; every-unit marking on the four generic rules; memory.md :61-69 pointer was git-split table, scoped intro + Findings memory instead. GAP: wave field still — for acceptance/ux/reconcile; no wave-review row shape here — assumes U2's edit-unit.md keeps wave-review.md's wording                                                           |          |
| 1    | U1        | opus  | 1     | green       | DECIDED: plan-interview.md untouched (its mentions already name the one executor); Launch block uses single placeholder date-name; Waves note kept (still true for a code-only plan). GAP: none                                                                                                                                                                                                        | 13f5f0f1 |
| 1    | R1        | opus  | 1     | findings(1) | execute-stages.md:54 [U3] "last two of them" misnames the bullets wave-review.md cites (Pipeline knobs + Convergence guard); CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                             | —        |
| 1    | U3        | opus  | 2     | green       | names Pipeline knobs + Convergence guard explicitly; the unit file's own :35-36 wording was the source (plan file, not edited)                                                                                                                                                                                                                                                                         | dd89ceea |
| 1    | R1        | opus  | 2     | pass        | round-1 finding resolved; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                | —        |
| 2    | U5        | opus  | 1     | green       | DECIDED: archive's completion-check and §3 Status passages left (already say the executor); kind-free landing rule added as one sentence. GAP: none                                                                                                                                                                                                                                                    | af57a24e |
| 2    | U4        | opus  | 1     | green       | DECIDED: "This pair sits beside" → "This planner sits beside". GAP: verification's "manifest still lists change-plan" — manifest lists the skills dir, not names; took p:plugins:check green (37 skills) as the proof                                                                                                                                                                                  | c562fe6d |
| 2    | U2        | opus  | 1     | green       | DECIDED: conventions fetch body moved into preflight.md (code-only); Land sets COMPLETE only on consent yes, RUNNING — ready to land by hand on no; Pipeline section dropped into Kind switch + code-unit.md. GAP: SKILL.md is 777 lines, not under 700 — cutting further drops rules, left as is. DOCS FALSIFIED: skills-and-agents.md:44-46 reference list (five now) → U6                           |          |
| 2    | R2        | opus  | 1     | findings(5) | all U2: SKILL.md:639 folder moved before consent read; edit-unit.md:70 loop-back undefined for a committed code unit; edit-unit.md:90 "prose, not code" cap rationale falsified; SKILL.md:51 every-unit stage rules no longer said to reach edit units; SKILL.md:424 siblings text still routes docs-sync to base. CONTRACT clean. RULINGS: departed #8 — Persist gated on covers:, not on a code unit | —        |
| 2    | U2        | opus  | 2     | green       | all six fixed: Persist gated on a code unit; Land reads consent first, moves on yes only; shared-rules pointer restored; siblings text names Reconcile + docs unit; loop-back defined by Kind (code re-enters code-unit.md step 2 against its cap); two-round rationale restated. GAP: SKILL.md 784 lines                                                                                              | 8b54d1ff |
| 2    | R2        | opus  | 2     | pass        | all five resolved, nothing new; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                          | —        |
| 3    | U6        | opus  | 1     | findings(1) | DECIDED: docs-sync survey by hand (the skill's edits would reach site/**); five references named inside the execute row (no reference table exists). GAP: docs-tree.md:78 retirement sentence carried the literal token, which the orchestrator's grep gate forbids — ruled: gate wins, reworded; three other historical mentions dropped                                                              |          |
| 3    | U6        | opus  | 2     | green       | docs-tree.md:78 reworded to point at the decision record; retired-name greps clean over Owns. GAP: code:precommit exits 1 only on U7's in-flight files being reformatted (whole-tree task); owned files stable                                                                                                                                                                                         | 46544335 |
| 3    | U7        | opus  | 1     | green       | DECIDED: docs-sync as a manual survey scoped to site/; formatted own three files only. GAP: code:precommit not run (whole-tree --fix would reach U6's files) — substituted dprint check + code:lint --fix on own files; p:site:check green                                                                                                                                                             |          |
| 3    | R3        | opus  | 1     | findings(2) | docs/plans/index.md:5 [orchestrator] intro still names two executors — GAP: the file is never edited in the worktree; the one-next intro from assets/plan-index.md rides the landing commit in the main checkout, and the worktree grep gate excludes that file. vwf.md:1972 [U7] "nothing else differs by kind" overstates (recall/persist are code-only). CONTRACT clean; RULINGS clean              | —        |
| 3    | U7        | opus  | 2     | green       | vwf.md:1971 skip clause now names code-only recall/persist                                                                                                                                                                                                                                                                                                                                             | f11c6fd6 |
| 3    | R3        | opus  | 2     | pass        | CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                          | —        |

## Launch

This folder is committed and pushed on the branch it was planned on, so the
fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-16-one-executor

or let the queue pick it, by priority:

/vwf:change-execute next

(The executor that runs this plan is the one plan 1 landed; the merged
`/vwf:execute` it builds is what runs the plans after it.)
