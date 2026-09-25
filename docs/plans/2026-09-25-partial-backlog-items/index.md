---
type: vwf-change-plan
title: partial backlog items — a plan that lands one piece leaves its item
  Partially done
requires: []
backlog: [ B52 ]
---

# Plan — partial backlog items — a plan that lands one piece leaves its item Partially done (2026-09-25)

## Status

**RUNNING**

RUNNING since 2026-09-26 in .worktrees/2026-09-25-partial-backlog-items (claude
plugin validate --strict warns on unquoted CLAUDE_PLUGIN_ROOT in
plugins/vwf/hooks/hooks.json, Stop and PreCompact); worktree
.worktrees/2026-09-25-partial-backlog-items

## Consent

| Action                                                          | Granted                                                                                                  |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green               | yes                                                                                                      |
| After landing: `mise run p:plugins:local`                       | run                                                                                                      |
| After landing: retro audit of the board, in a restarted session | ask                                                                                                      |
| Release vwf publicly                                            | none — rides the unreleased `19.46.0` (last tag `vwf-v19.45.1`); no bump, no release step, the tag waits |
| Release site publicly                                           | none — rides the unreleased `1.1.47` (last tag `site-v1.1.46`); no bump, no release step, the tag waits  |
| Release installer publicly                                      | none — untouched                                                                                         |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, a backlog item reaches `Done` only when the plan that finishes
it lands. A plan that lands one piece of an item leaves the item open — Status
`Partially done` — and records on it which piece landed, in which folder.

The framing: B52. A plan covering one piece of an item listed the whole id on
its `backlog:` line, and both places that turn that list into `Done` — the
executor's landing (`plugins/vwf/skills/execute/SKILL.md:741-752`) and
`plan-management archive`
(`plugins/vwf/skills/plan-management/SKILL.md:306-312`) — check nothing but "the
list is non-empty". The B28 chain (nine plans, 2026-09-20) survived only because
eight of them carried a hand-written Parked warning and one landing declined the
`done` by judgement.

Not a reversal. It makes the repo's own rule — an id goes on `backlog:` only on
the plan that finishes the item — the skills' rule. The user restated the
standing "fix the source, not a guard" rule at the interview: *"The idea is
always to fix the vwf skill and not add facade in the repos using vwf skill"* —
so the consistency check lives in the executor's preflight and in `archive`,
never in a repo gate.

## Facts the survey established

- **Where `Done` is set.** Only two places:
  `plugins/vwf/skills/execute/SKILL.md:741-752` (Land step 3 — consent yes with
  no open gaps calls `plan-management archive`, which closes the ids, :743-745;
  open gaps or consent no calls `/vwf:backlog done <ids>` directly, :749-751)
  and `plugins/vwf/skills/plan-management/SKILL.md:306-312` (archive's "Close
  the backlog items", for every `backlog:` id not already `Done`). Neither reads
  Parked. Archive's completion check is `plan-management/SKILL.md:247-266`.
- **Execute's other backlog passages:** `execute/SKILL.md:107-109` (reads
  `backlog:` from the frontmatter), :230 (tree-table row), :319-321 (only calls
  the backlog at landing), :889 and :894 (the never-list; :894 is the one
  mention of Parked). `execute/references/` has no backlog call.
- **The backlog skill.** `plugins/vwf/skills/backlog/SKILL.md` — description
  :6-8, argument-hint :12 (all seven verbs), Status vocabulary :75, :79, :83-85
  (`In progress` ends with `Planned in: <folder>`, `Closed` with its reason;
  `Done` has no closing line), the bootstrap trim to four options, verbs
  :110-176 (`add`'s id rule :120-122, `done` :163-166 unconditional), callers
  table :181-195. `references/github.md` — id derivation :242-250 (greps
  `^backlog:` over live and archived `index.md`), per-verb commands :280-297,
  the `planned`/`done`/`close` body append :284-295, the ask-before-replacing
  `Planned in:` guard :293, plus the bootstrap's snapshot-and-restore of every
  item's Status across the option-list replace.
- **Plan-management.** `plan-management/SKILL.md:60` (tree row "closed via
  `/vwf:backlog`"), :104 and :116-118 (`add` reads `backlog:` into the index
  Backlog column); `references/plan-index.md:48` (the column).
- **The planners.** `plugins/vwf/assets/templates/plan-folder.md:39` (the
  `backlog:` key), :220-223 (Parked — free prose, no id grammar).
  `skills/change-plan/SKILL.md` :51-60 (recall notes the ids), :113-122 (split
  rule, Parked definition), :211, :226-227 (`backlog:` names the recalled ids),
  :277, :317-319 (hand-off calls `planned`), :360. `skills/plan/SKILL.md` :54,
  :98-106, :325, :350, :372, :397-400 (the `backlog:` rule), :449-451, :504.
  `skills/plan/references/plan-doc.md:19-21`. `assets/plan-interview.md:151-155`
  (F. Parked — no mention of `backlog:`).
- **No other reader.** feedback, doctor, recall, handoff, init and setup read
  neither item Status nor `backlog:` lists. Nothing under `scripts/` or any
  `*.ts|*.js|*.sh|*.mjs` references the backlog — no test or checker covers it.
- **The docs that describe today's behaviour** (the docs unit's list):
  `site/src/content/docs/plugins/vwf.md` — :842 (command row), :2367-2372 and
  :2381-2382 (plan marks `planned`), :2424-2425 (index Backlog column),
  :2672-2676 (execute landing marks `done`), :2756 and :2771 (archive), the
  `### /vwf:backlog` section :2910-3022 (examples :2924-2927, "the two verbs
  that write nothing" :2943-2944, id rule :2955-2958, Status flow :2962, the
  closing lines ~:2975, next/list :2997-3003, callers :3005-3016), :3104 and
  :3123-3125 (change-plan), quick-start :3462-3466.
  `site/src/content/docs/how-to/operate/ad-hoc-change.md` :68-70, :155, :235,
  :281. `.claude/skills/vwf-plugin/references/skills-and-agents.md` :35, :36,
  :39, :45 (literally lists the seven verbs and the four statuses), :46;
  `references/docs-tree.md:56-61`. `readme.md:250-256` names no verb;
  `CLAUDE.md` :327, :375 only the missing-project procedure. Historical, never
  edited: `docs/memory/decisions/2026-09-13-vwf-process.md:90-97` and the
  archived plans' "seven verbs".
- **The B28 history.** All nine 2026-09-20 plans listed B28 in `backlog:`; eight
  carried "this landing's `done` may need the item moved back by hand";
  `archived/2026-09-20-branch-model/index.md:359` records the landing declining
  B28's `done`; `archived/2026-09-20-pack-intent-rendering/index.md:398` is the
  intended final close. B28 is `Done` now.
- **The project.** `virajp/claude-plugins` project #2 — 35 items, 34 `Backlog`,
  1 `Done` at survey time; its Status field carries `Backlog`, `In progress`,
  `Done`, `Closed` since the 2026-09-19 trim.
- **Versions.** `plugins/vwf/.claude-plugin/plugin.json` is `19.46.0`, already
  past the last tag `vwf-v19.45.1`; `site/package.json` is `1.1.47`, past
  `site-v1.1.46`. Both ride.
- **Commit convention.** `.config/git-conventional-commits.yaml` allows `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Recalled decisions.**
  `docs/memory/decisions/2026-09-18-backlog-on-github-projects.md` (items are
  draft issues — ruling 3; no fallback store; the seven verbs) and
  `2026-09-19-backlog-status-vocabulary.md` (the four-option trim, the refusal
  while an item sits in an option being removed, option ids reissued by a
  replace, the next-id floor over plan folders' `backlog:` lists).

## Assumed decisions — confirm or override at review

| #  | Decision                               | Ruling                                                                                                                                                                                                                                                                                                                                   | Rejected                                                                                                                  | Unit        |
| -- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1  | How a plan says it lands one piece     | `backlog:` names the ids the plan **finishes** — landing sets them `Done`. A new frontmatter list, `backlog_pieces:`, names the ids the plan lands **a piece of**. A Parked entry that belongs to an item begins with its id: `- Bnn: <piece>`. The last plan of a chain moves the id to `backlog:`.                                     | splitting the item into new ids first (a `split` verb); scanning Parked prose for ids (a passing mention blocks a `Done`) | U1 U2 U3 U4 |
| 2  | The verb that records a landed piece   | A new verb, `partial <ids> <folder>`: sets Status to the new option `Partially done` and records `Landed: <plan title> in <folder>` on the body.                                                                                                                                                                                         | `done --piece` (a verb called `done` that does not finish); the name `partially-done`; the name `landed`                  | U1          |
| 3  | The Status field                       | Five options — `Backlog`, `In progress`, `Partially done`, `Done`, `Closed`. The bootstrap reshapes an existing four-option field on the next verb, through the existing snapshot-and-restore of every item's Status.                                                                                                                    | a piece leaving the item `In progress`                                                                                    | U1          |
| 4  | Several plans covering one item        | `Planned in:` holds a list of folders. `planned` on an item already `In progress` or `Partially done` appends its folder instead of asking; `partial` and `done` move their folder off `Planned in:` onto the `Landed:` line.                                                                                                            | one folder on the line, asking on every further `planned`                                                                 | U1          |
| 5  | Status after a piece lands             | A landed piece always sets `Partially done`; a later `planned` sets `In progress`; the finishing plan sets `Done`. Folders still pending stay on `Planned in:`.                                                                                                                                                                          | `Partially done` only when `Planned in:` is empty                                                                         | U1          |
| 6  | `next`                                 | Ranks `Backlog` items together with `Partially done` items whose `Planned in:` is empty, by priority then id; naming a partial item shows its `Landed:` lines so the next plan starts from what remains.                                                                                                                                 | `Backlog` only                                                                                                            | U1          |
| 7  | `list`                                 | `Partially done` items are listed, not folded into the trailing count; their `Landed:` lines appear as a count.                                                                                                                                                                                                                          | folding them with `Done` and `Closed`                                                                                     | U1          |
| 8  | Where the consistency check lives      | The executor's preflight refuses a folder that (a) names an id in both `backlog:` and `backlog_pieces:`, (b) names an id in `backlog:` while Parked carries a `- Bnn:` line for it, or (c) names an id in `backlog_pieces:` with no `- Bnn:` Parked line for it.                                                                         | a repo checker rule — user: *"The idea is always to fix the vwf skill and not add facade in the repos using vwf skill"*   | U2          |
| 9  | Landing without the archive            | Open gaps or consent no: `done` for the `backlog:` ids and `partial` for the `backlog_pieces:` ids — the same split archive uses.                                                                                                                                                                                                        | —                                                                                                                         | U2          |
| 10 | Archive on a self-contradicting folder | `archive` refuses a folder that names an id in `backlog:` with `- Bnn:` Parked lines for it (or an id in both lists), naming the id and the lines; a force option archives anyway and calls `partial` — never `done` — for that id. `backlog_pieces:` ids always get `partial`.                                                          | recording it as a piece and archiving without refusing; force calling `done`; force asking per id                         | U3          |
| 11 | The plan index Backlog column          | Lists both kinds; a piece id reads `Bnn (piece)`.                                                                                                                                                                                                                                                                                        | a trailing asterisk marker (a table cell ending in one oscillates between the formatter and the linter)                   | U3          |
| 12 | The planners                           | For each id the recall matched, the interview asks whether this plan finishes it or lands a piece; a finishing id goes on `backlog:`, a piece id on `backlog_pieces:`, and a piece plan writes what remains as `- Bnn: <piece>` Parked lines — at least one per piece id — naming the chained folder where one already covers the piece. | Parked lines optional (the remainder living only in the item body)                                                        | U4          |
| 13 | Older folders                          | An absent `backlog_pieces:` reads as empty. The plan-folder template carries no format version, so nothing is bumped.                                                                                                                                                                                                                    | —                                                                                                                         | U4          |
| 14 | Review row                             | None: every edit is markdown and nothing runnable ships; the wave review is the only check.                                                                                                                                                                                                                                              | a `Kind: review` row                                                                                                      | —           |
| 15 | The id-floor rule                      | The next-id floor reads `backlog_pieces:` lists as well as `backlog:` lists over every plan folder, live and archived.                                                                                                                                                                                                                   | `backlog:` only (an id cited only as a piece could be reissued)                                                           | U1          |

## New dependencies

none.

## Units

| Id | Wave | Unit file                                      | Kind | Owns                                                                                                                                                                                                                                                                                                           | Depends on     | Status  | Commit   |
| -- | ---- | ---------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| U1 | 1    | [01-backlog.md](01-backlog.md)                 | edit | `plugins/vwf/skills/backlog/SKILL.md`, `plugins/vwf/skills/backlog/references/github.md`                                                                                                                                                                                                                       | —              | green   | 17a612a8 |
| U2 | 1    | [02-execute.md](02-execute.md)                 | edit | `plugins/vwf/skills/execute/**`                                                                                                                                                                                                                                                                                | —              | green   | be221b15 |
| U3 | 1    | [03-plan-management.md](03-plan-management.md) | edit | `plugins/vwf/skills/plan-management/**`                                                                                                                                                                                                                                                                        | —              | green   | a379828e |
| U4 | 1    | [04-planners.md](04-planners.md)               | edit | `plugins/vwf/skills/change-plan/SKILL.md`, `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/plan/references/plan-doc.md`, `plugins/vwf/assets/plan-interview.md`, `plugins/vwf/assets/templates/plan-folder.md`                                                                                         | —              | green   | a7cff6ab |
| U5 | 2    | [05-docs.md](05-docs.md)                       | edit | `site/src/content/docs/plugins/vwf.md`, `site/src/content/docs/how-to/operate/ad-hoc-change.md`, `.claude/skills/vwf-plugin/references/skills-and-agents.md`, `.claude/skills/vwf-plugin/references/docs-tree.md`, `docs/memory/decisions/2026-09-25-partial-backlog-items.md` (new), `readme.md`, `CLAUDE.md` | U1, U2, U3, U4 | green   | 95225f61 |
| U6 | 3    | [06-gates-and-bump.md](06-gates-and-bump.md)   | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json` — owned, expected unchanged                                                                                                                                                                                   | U5             | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                          | Why it collides                                                           | Owner                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json` | version files — rides, but only one unit may touch them                   | U6 only                                              |
| `.claude-plugin/marketplace.json`                             | generated                                                                 | U6 only                                              |
| every human-facing doc (site, readme, CLAUDE.md, `.claude/`)  | n units editing one doc                                                   | U5 only                                              |
| the vocabulary shared by U1–U4                                | four units spell `backlog_pieces:`, `partial`, `Partially done`, `- Bnn:` | each quotes the spelling from decisions 1–2 verbatim |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Four disjoint trees under `plugins/vwf/`; each
  carries the shared vocabulary quoted from decisions 1 and 2, so none reads
  another's output.
- **Wave 2 — U5.** The docs describe what wave 1 committed.
- **Wave 3 — U6.** The final gate over the whole delta.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run code:precommit
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                                             | Mode | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local`                       | run  | Stages vwf `19.46.0+N` into the dev marketplace; publishes nothing, cuts no tag. A **restarted** session loads it.                                                                                                                                                                                                                                                                                                                                                     |
| retro audit of the board, in a restarted session | ask  | The executor stops and hands this over — the session that ran the plan still has the old backlog skill loaded. In a restarted session: `/vwf:backlog list` (its bootstrap reshapes project #2's Status field to five options); then, for every id on a `backlog:` list of every folder under `docs/plans/archived/`, compare the plan's Parked text and the item's Status; report each mismatch and correct each only on the user's yes, through `/vwf:backlog` verbs. |

## Gates the orchestrator keeps

After wave 1 and again after U6, each a grep over the committed tree; a miss is
routed to the owning unit per the wave-review loop-back:

- `grep -l 'backlog_pieces' plugins/vwf/skills/execute/SKILL.md plugins/vwf/skills/plan-management/SKILL.md plugins/vwf/skills/change-plan/SKILL.md plugins/vwf/skills/plan/SKILL.md plugins/vwf/assets/templates/plan-folder.md plugins/vwf/skills/backlog/references/github.md`
  lists all six files.
- `grep -c 'Partially done' plugins/vwf/skills/backlog/SKILL.md plugins/vwf/skills/backlog/references/github.md`
  is ≥ 1 in each.
- after U5:
  `grep -n 'partial' .claude/skills/vwf-plugin/references/skills-and-agents.md`
  hits the backlog row, and the site's `### /vwf:backlog` section names
  `partial` and `Partially done`.
- `grep -rn 'seven verbs\|Seven verbs' plugins/vwf .claude/skills/vwf-plugin site/src/content/docs`
  returns nothing.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` over a path outside its Owns. No unit runs `gh` against GitHub — the run
is offline with respect to the forge.

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

- **Board automation — GitHub sub-issues linking an item to its pieces.** The
  user removed it altogether: sub-issues exist only between repo issues, and
  items are draft issues by ruling 3 of the 2026-09-18 decision. Not parked.
- **A repo checker rule over plan folders.** Declined — the check is the skills'
  (decisions 8 and 10), per *"fix the vwf skill and not add facade in the repos
  using vwf skill"*.
- **Rewriting archived plans or historical decision docs** that say "seven
  verbs" or describe the four-option field — records of their day.

## Parked

none. The GitLab backend is planned as its own folder in the same session,
independent of this one.

## Gaps surfaced during execution

- **U1, non-blocking — `planned` on a `Done` or `Closed` item.** The plan did
  not say what `planned` does to an item already `Done` or `Closed`. U1 kept the
  existing behaviour: the skill asks the user before changing it.

## Run log

| Wave | Unit               | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Commit   |
| ---- | ------------------ | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 0    | preflight          | —     | 1     | failed      | inherited red on develop: p:plugins:check (validate --strict, vwf hooks.json unquoted placeholder in Stop and PreCompact); marketplace, inventory, code:precommit, p:site:check green; no unit dispatched                                                                                                                                                                                                                                                          | —        |
| 0    | preflight          | —     | 2     | pass        | resumed after develop 371933e5 quoted the hook placeholder; branch rebased onto it; all five wave-gate lines green; doctor-blocking tools present (mise, graphify, graph in main checkout); no code unit — LSP and conventions steps skipped; no covers — format check skipped                                                                                                                                                                                     | —        |
| 1    | U2 execute         | opus  | 1     | pass        | edit; frontmatter reads backlog_pieces (absent = empty) and Parked; fresh-run refusals 4→7 (decision 8 a–c); Land direct path done/partial split; DECIDED refusals fresh-run only; GAP its code:precommit verification ran lint --fix over U1/U3/U4 files mid-wave, effect unknown — wave review to check                                                                                                                                                          | be221b15 |
| 1    | U3 plan-management | opus  | 1     | pass        | edit; archive refusal (id in both lists, or backlog id with Bnn Parked lines) plus --force calling partial; close calls done/partial split; Backlog cell Bnn (piece); DECIDED force spelled archive <folder> --force; GAP its code:precommit touched other units' in-flight files — re-run after wave                                                                                                                                                              | a379828e |
| 1    | U4 planners        | opus  | 1     | pass        | edit; template backlog_pieces key and Bnn Parked form; interview item 2a (finish or piece) and F rule; change-plan and plan recall, Parked, frontmatter, self-review, hand-off planned over both lists; plan-doc frontmatter; DECIDED ran hooks on its five files only                                                                                                                                                                                             | a7cff6ab |
| 1    | U1 backlog         | opus  | 1     | pass        | edit; partial verb, Partially done option (PURPLE), Planned in list plus Landed lines, five-option bootstrap reshape, id floor greps backlog_pieces, next/list per decisions 6–7; DECIDED done folder arg optional; GAP planned on a Done or Closed item unspecified — kept as a question to the user                                                                                                                                                              | 17a612a8 |
| 1    | R1                 | opus  | 1     | findings(5) | rule 4 only: execute/SKILL.md:247 files-table row not re-padded (U2); ragged folds plan/SKILL.md:330, :378, plan-doc.md:27, change-plan/SKILL.md:61 (U4); CONTRACT clean; RULINGS clean — vocabulary identical across U1–U4                                                                                                                                                                                                                                        | —        |
| 1    | U2 execute         | opus  | 2     | pass        | R1 loop-back: Doc Paths table re-padded whole to its widest (pre-existing Plan) row; cell text unchanged                                                                                                                                                                                                                                                                                                                                                           | be221b15 |
| 1    | U4 planners        | opus  | 2     | pass        | R1 loop-back: four ragged folds refilled to 80 columns, no wording changed, spans on one line                                                                                                                                                                                                                                                                                                                                                                      | a7cff6ab |
| 1    | R1                 | opus  | 2     | pass        | round-1 fixes clean, wording unchanged; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 1    | gate               | —     | 1     | pass        | wave gate five lines green (code:precommit green on re-run after it re-padded the run log); orchestrator greps: backlog_pieces in all six files, Partially done 13 and 9, no seven-verbs hit                                                                                                                                                                                                                                                                       | —        |
| —    | acceptance         | —     | —     | skipped     | why: no covers — change plan, no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| —    | ux                 | —     | —     | skipped     | why: no covers — no Screens contract                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| —    | reconcile          | —     | —     | skipped     | why: no covers, no code unit — no stamps, no persist                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 2    | U5 docs            | opus  | 1     | pass        | edit; vwf.md backlog section (five statuses, partial, Planned in list, Landed lines, callers by list), plan/execute/archive passages; ad-hoc-change recall, hand-off, landing, archive; skills-and-agents rows; docs-tree; new decision doc; readme and CLAUDE.md unchanged (nothing falsified); GAP docs-sync surveyor's report was routed to the orchestrator, not U5 — U5 swept by hand; orchestrator checked the surveyor's four findings against U5's changes | 95225f61 |
| 2    | R2                 | opus  | 1     | pass        | CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 2    | gate               | —     | 1     | pass        | wave gate five lines green (code:precommit green on second run); orchestrator greps: partial hits the backlog row of skills-and-agents, site backlog section names partial (4) and Partially done (8), no seven-verbs hit                                                                                                                                                                                                                                          | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-25-partial-backlog-items

or let the queue pick it, by priority:

/vwf:execute next
