---
name: change-plan
description: Turn an ad-hoc change request — work outside the blueprint — into a
  plan folder under docs/plans/<date>-<name>/ that /vwf:execute runs unattended
  in a fresh context — a fresh session, or a runner that /vwf:execute all
  dispatches. Recall and survey the repo, split a request
  that is really several plans, interview the user one question at a time until
  the checklist is discharged, present the shape behind a hard gate, agree the
  wave gate and the after-landing steps, derive the release levels, record
  consent, write index.json, index.md and one file per subagent unit, validate
  index.json, mark the backlog
  items it covers planned, add its row to the plan index with a derived
  priority, and commit and push the folder so the fresh context sees it.
  Run when the user wants to plan a change that is not a blueprint slice —
  tooling, docs, CI, a refactor, a tree the blueprint does not describe; a
  blueprint slice is /vwf:plan.
argument-hint: "[what to plan]"
model: opus

disable-model-invocation: false
---

# change-plan

Produce a plan that `/vwf:execute <folder>` can run **without you present**.
That sentence is the whole bar: every decision, ruling, file scope, gate and
consent the run will need is written into the folder, or the run will stop and
ask for it — which defeats the point. This skill is the part that talks to the
user; `/vwf:execute` is the part that does not.

This planner sits **beside** vwf's chain, not inside it. A blueprint slice — a
flow or an entity the product describes — is `/vwf:plan` → `/vwf:execute`. A
change with no blueprint slice behind it — tooling, docs, CI, a refactor, a tree
the blueprint does not describe — is `/vwf:change-plan` → `/vwf:execute`. One
executor runs both kinds of folder.

The plan folder is the contract. `index.json` carries everything
`/vwf:execute` reads mechanically, `index.md` the prose a reader needs, and
the unit files what each subagent reads. Nothing lives in conversation.

## Procedure

### 1. Recall, then survey

**Recall first.** Before asking anything, read what is already decided:

- `docs/memory/decisions/` — any doc touching the trees the request names
- the last plan in `docs/plans/archived/` that touched the same tree — a folder
  or, before 2026-09-16, a single `.md` file, the shape cycle plans had until
  then — reading its *Out of scope* and its *Parked* list from `index.md`, and
  its `gaps` list from `index.json`; an old-format folder, with an `index.md`
  and no `index.json`, carries all three in its `index.md`, the gaps in its
  *Run log* and its gaps section: the request is often one of those items
  coming due, and a gap the last run surfaced is a fact
- the backlog, read through `/vwf:backlog list` — the product's backlog, the
  prioritised list of work that cannot be picked up now, a project on the base
  repo's forge that the `backlog` skill alone writes. It is product-level: a
  session in a member repo reads the base's project, resolved from the base's
  remote, never one of its own. When the verb reports the backlog unreadable —
  `gh` absent, unauthenticated or without the `project` scope, or no project
  yet — record that with its reason in the facts and continue with nothing.
  The request is often one of its items; note every id it covers, and for each
  whether this plan finishes the item or lands one piece of it — interview item
  2a settles it — so the plan's `index.json` can carry them on the right list.
  A `Bnn` id in `$ARGUMENTS` — `/vwf:backlog next` prints the launch line with
  it — is always one of them, and is never dropped for a weaker match. Every
  id noted here is a **source** id, recorded on the `index.json` `source`
  list, so the executor can tell a plan made for an item from one made for
  none. The same read tells the interview which items share the plan's priority —
  what §8's check counts before it recommends `/vwf:execute`. Reading the
  backlog is this skill's business; editing it never is —
  `/vwf:backlog` is its sole writer
- the base repo's `docs/plans/index.json` — the plan index, the one file
  where every active plan of either kind, cycle and change, its status and its
  priority live, read with
  `node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs get docs/plans/index.json plans`;
  `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md` is
  the shape, and `plan-management` its only writer. Like the backlog it is the
  base's alone, read from a member repo and never duplicated there. The
  `priority` key of the rows a new plan will require — rows of either kind —
  is what §5's derived priority stands on. A row whose `gaps.open` is above
  `0` is a landed plan with gaps that no plan took yet; a request that takes
  them puts its folder on `gaps_of` — interview item 2b. Reading the file is
  this skill's business; editing it never is — §8's `plan-management add`
  appends the row
- the mempalace rooms `planning`, `decisions` and `gaps` for this repo's wing,
  when the server is up; **skip silently** when it is not. Resolve the wing and
  apply the two-store rules from `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` — do
  not restate them here

A standing decision the request contradicts is a **reversal** — name it as one
in the interview, never as a fresh choice.

**Survey second.** Dispatch **Explore** subagents (one message, concurrent) to
map, for the request in `$ARGUMENTS`:

- the trees the change touches, and which project each belongs to — read the
  project registry `docs/blueprint/registry.yaml` when the repo has one, else
  take the repo's own top-level directories as the projects
- the gates that already cover those trees — the task runner's task list
  (`mise tasks`), the `harness:` stamp in `.config/vwf.yaml` when one is stamped
  (`${CLAUDE_PLUGIN_ROOT}/assets/harness.md` is the vocabulary), and the CI
  workflow files
- the docs that describe the current behaviour — the README, `CLAUDE.md`,
  `docs/`, and any per-project README or home doc
- the third-party dependencies already available to each tree, so a unit can be
  told to reuse before adding
- the repo's commit convention — `.config/git-conventional-commits.yaml` where
  the repo has one, else whatever its commit-message gate reads — so every unit
  file's `## Commit` line carries a type, and a scope, that gate accepts. A repo
  with no convention file takes git-workflow's common types: `feat`, `fix`,
  `perf`, `refactor`, `revert`, `test`, `ops`, `docs`, `merge`, `wip`
- when the request retires or renames a name, the name itself, grepped across
  every tree the repo has — `.claude/`, `installer/`, `site/src/content/docs/`,
  `plugins/`, the root docs. Every hit is a passage the change falsifies, and
  every one needs an owner in some unit's `owns` before the plan is written; the
  three plans that skipped this each left the docs unit inheriting nobody-owned
  passages at run time

Instruct every Explore agent to return **conclusions and `file:line` pointers
only** — never file contents, diffs or directory dumps. Hold the findings; they
ground the questions and become the plan's facts section. Do not read the files
yourself — the survey exists so the orchestrator context stays small, and the
same rule binds `/vwf:execute`.

### 2. Scope check

If the request is really **several independent pieces** — two trees with no
shared ruling, a doctrine change plus an unrelated tooling fix — say so before
refining anything. Decompose it, agree the order, and plan **one folder per
piece**, each through this whole procedure. A later piece that stands on an
earlier one names it in its `index.json` `requires` list; `/vwf:execute` halts
until every required plan reads `COMPLETE`. One plan never swallows another.
The pieces are planned one after another in this session: each runs §3 to §8,
and §8's ending for a piece that is not the last goes straight back to §3 for
the next piece — no launch block until the last one is planned.

An answer mid-interview that raises something outside this plan's scope is
**parked, durably**: acknowledge it, write it to the *Parked* list of the
plan's `index.md` with enough to pick it up later, and do not widen the plan.
Parked items are the first thing the next plan's recall reads. A Parked entry
that belongs to a backlog item begins with its id — `- Bnn: <piece>` — and a
plan that lands one piece of an item writes what remains that way, at least
one line per `backlog_pieces` id, naming the chained folder where one already
covers the piece.

### 3. Interview, one question at a time

Work through the checklist in `${CLAUDE_PLUGIN_ROOT}/assets/plan-interview.md`
top to bottom — it is shared with `/vwf:plan`; where an item carries a
*Change plans:* note, follow that note. Each item is one `AskUserQuestion`
call, or a prose question when the answer is open-ended. **Never batch** — one
decision per turn, and never assume one. An item the survey already answered is
confirmed in a sentence, not re-asked.

Ask only what has **more than one reasonable answer** given the repo. Where that
holds, **propose two or three approaches with their trade-offs**, lead with your
recommendation and why, and let the user pick or redirect. A ruling recorded
without its rejected alternatives is a ruling the next plan re-opens.

The interview is done when every checklist item has an answer recorded, and not
before. If the user says "just decide", record the decision as an assumed
decision with your reasoning and the alternative you rejected — the
`decisions` list of `index.json` is what they review.

### 4. Agree the gate and the after-landing steps, derive the release levels

Four sub-steps. (a), (b) and (d) are proposed from the survey and confirmed by
the user; (c) is derived and stated, never confirmed here — the user changes a
level at the §5 gate. All four are written into `index.json`, and
`/vwf:execute` runs **what is written and nothing it infers**.

**(a) The three gates.** Propose the exact commands the run must pass, one per
line, for each of three tiers, drawn from the survey's gate list — the repo's
own task runner tasks, the capabilities the `harness:` stamp records, the
checks CI already runs over the touched trees. Confirm them. They become the
`gates.unit` list of `index.json`, which `/vwf:execute` runs once before each
unit's commit; its `gates.wave` list, run once before wave 1 and after every
wave; and its `gates.plan` list, run once over the finished tree. When the
repo's `mise tasks ls` lists them, the default proposal is
`mise x -- mise run code:format` for the unit gate,
`mise x -- mise run code:lint` for the wave gate and
`mise x -- mise run code:precommit --all` for the plan gate: the cheap check
runs most often, and the full hook pass runs once. The plan gate takes
`--all` because it runs over the finished, committed tree — without it,
`code:precommit` checks only uncommitted files, and on a clean tree it checks
nothing. A check that runs the whole
hook pass or a slow test suite belongs in the plan gate, not in the wave
gate. A check
that only holds once a particular unit has landed is **not** a wave-gate line —
the gate runs before wave 1 and must be green then — it is that unit's
*Verification*, repeated in the gates unit's. A repo with no task
runner and no harness stamp records `none` — say plainly, in that case, that the
run has no automated gate and the wave review is the only check. The wave
review is the only review a change plan runs by default: a `review` unit is
written only when the change lands runnable code (item 10a), with its reason
in the `decisions` list. Over a change plan's `edit` units it runs
`/security-review` and the security reviewer alone — the wave review has
already judged the units against their files.

**(b) After landing.** Propose the ordered steps that follow a consented
landing, and confirm each. Each step is confirmed at the interview (item 17) as
`run` or dropped, and `run` is written to the `after_landing` list: a `run` step
runs on a green landing without a prompt. A plan never carries a release step —
a release is always a later hand step, `/release`. A step the user wants to
check first is dropped and run by hand later; the executor never stops before a
step to ask. A command already in `.config/vwf.yaml`'s `after_landing:` list is
not proposed: `/vwf:execute` runs it after every green landing. Where a step
stages something the session already loaded, say plainly that it is picked up
only by a **restarted** session.

Empty is a valid answer. These become the `after_landing` list of
`index.json`, `[]` when empty.

**(c) Release levels.** For each project the units touch, derive its level from
the change — never ask it (interview item 18 is stated, as item 12's priority
is): breaks users → `MAJOR`, new behaviour → `MINOR`, a fix → `PATCH`, no
user-visible change → `NONE`. Give each a one-line reason, and write them as
the `release_levels` list of `index.json` — one entry per project the units
touch, `NONE` included, each `{id, level, reason}` with the project name as
its `id`.

No unit bumps a version and no plan releases. `/vwf:execute` raises each level
in `.config/releases.yaml` at landing — one key per project, the highest level
wins — and `/release` is a later hand step that reads that file.

**(d) Ending an `all` run.** Write `consent.end_all_run`, the answer to End
an `all` run after landing (interview item 18a). Ask it only when the
units' `owns` include a plugin the run itself loads — one installed in the
session that runs `/vwf:execute all`, which keeps running the stale copy until
it restarts; on yes, `all` ends after this plan and reports "restart, then
`/vwf:execute all`". When the plan touches no such plugin, write `false`
unasked.

### 5. Present the shape — the hard gate

**Nothing is written to disk before this gate.** Present, in sections scaled to
their weight and confirmed one at a time:

1. the goal and the reversals, if any
2. the assumed decisions — every ruling, its rejected alternatives
3. the unit map — id, wave, owned paths, depends-on — why each wave is safe
   to run concurrently, and the named reason each unit in a later wave waits
4. every new third-party dependency any unit introduces: package, what for,
   which unit. The gate is where the user consents to a dependency; a unit never
   adds one the plan does not name
5. the unit gate, the wave gate, the plan gate, the after-landing steps, the
   gates the orchestrator keeps —
   and the **derived priority**, what `plan-management priority <requires…>`
   returns — passed the `requires` entries item 12 settled, folder basenames
   or none, since no folder exists before §6 — stated as a fact with the
   arithmetic that produced it: `10 + max`
   over the `priority` of every unarchived `requires` row in the plan index,
   naming the row it stands on, or "requires nothing active → 10". It
   is never asked; the one thing that changes it is a required plan the user
   names here that the interview missed — then the verb is run again
6. the consent — the End an `all` run after landing answer among it — and
   the release levels, each with its reason, stated as a fact like the
   priority; the user may change a level here
7. the parked list

Then ask once: **approve**, **revise** or **abandon**. Revise loops back to the
section named. Abandon ends here with nothing on disk and a one-line note of
what was decided, so the next attempt can recall it. Only approve continues.

### 6. Write the folder

`docs/plans/<YYYY-MM-DD>-<kebab-name>/` from the template in
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md` — the one folder shape
both planners write: `index.json`, `index.md` and one `NN-<unit>.md` per unit.

- **`index.json`** holds every structured fact of the plan — the keys the
  template names, in its order, each required, cycle-only keys aside. Write
  it **once**, whole, with the Write tool, then run
  `node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs validate <folder>/index.json`
  — the Write and its validate are one step, the creation. A red validate
  means the creation is not finished: correct the content and Write the
  whole file again, then validate again, until it prints
  `<folder>/index.json: valid` — `set` refuses to write a file that does not
  validate, and no Edit touches `index.json`. From that first green validate
  on, every change to it, the self-review's fixes included, is one
  `plan.mjs set`, `append`, `remove` or `rewave` call; never an Edit, never a
  whole-file rewrite. To move units between waves — a split or a merge of
  waves, from the self-review or the rulings review — use one
  `plan.mjs rewave <file> <unit>=<wave>...` call, which rebuilds `waves` with
  it; when a unit moves above wave 1, first `set` its `waits`, then `rewave`.
  `/vwf:execute` reads and writes it with the same
  script. `status.state` is written `DRAFT`, with `status.detail`
  `DRAFT <date>`; `run` is `{}`; each unit's `status` is `pending`, with
  `started`, `ended` and `commit` `""` and `rounds` `0`; `waves` has one
  `pending` entry per wave, `W1` up to the highest unit `wave`, its `started`
  and `ended` `""`; each of the four `stages` is `pending` with empty times;
  and `gaps` and `overrides` are `[]`.
- **`index.md`** holds the prose only, in the template's sections: the goal
  and the reversals, the facts the survey established, Out of scope and
  Parked. It has no frontmatter, no table `/vwf:execute` reads, and no Run
  log.
- **Each unit file** starts with its H1, `# U<n> — <title>`, the same text as
  the unit's `title` in `index.json`, and carries no header lines: its wave,
  kind, model, owns and depends-on live in its `units` entry alone.

`type` is `vwf-change-plan`, and the cycle-only keys — `covers`, `exposure`,
`acceptance` and `consent.lsp` — are absent; `validate` fails a change plan
that carries one. `index.json` carries three lists of the `Bnn` ids recalled
in §1, each possibly empty, written `[]`: `source` names every item this plan
was made for, and each of them also sits on one of the other two; `backlog`
names the items this plan **finishes** — landing sets them `Done` — and
`backlog_pieces` the items it lands **one piece of** — landing sets them
`Partially done`. No id sits on both. The last plan of a chain moves the id to
`backlog`. `source` is empty only when no backlog item asked for the plan —
work the user brought that the backlog does not hold. A fourth list,
`gaps_of`, names the landed plan folders whose gaps this plan takes —
interview item 2b — and is `[]` otherwise.

Rules the plan must obey, learned from the plans that came before:

- **One unit, one subagent, one commit.** A unit is stateless and inherits no
  context; its file carries its ruling quoted from the `decisions` list, its
  verification, and its commit line; its owned paths are its `owns` entry,
  which `/vwf:execute` puts into the dispatch prompt.
- **Every unit is `kind` `edit`.** A change plan has no code unit in this
  release. `/vwf:execute` reads each unit's `kind` from the `units` list: it
  dispatches the `edit` units of a wave together, in one message, and judges
  them by the wave review — the only check, by default. A `review` unit
  (`owns` `[]`, `depends_on` the units it covers, a `range` of
  `{"from": "", "to": ""}`, a `NN-review.md` in the template's shape) is added
  only when the change lands runnable code — anything that executes rather
  than is read: shipped shell or hook scripts, build or tooling source, an
  installable package — and the reason is an entry in the `decisions` list.
  The unit sits in a wave strictly later than every unit it covers — in the
  same wave it runs before their commit and reviews nothing, since it scopes
  by commit range — and covers, directly or transitively through
  `depends_on`, **every** unit in an earlier wave that no earlier review unit
  covers, the units that land that code and every other `edit` unit alike,
  since it reviews the whole range since the previous review and a finding on
  a unit it left out would be routed there anyway — the one rule,
  `${CLAUDE_PLUGIN_ROOT}/skills/execute/references/review-unit.md`'s. Its
  `depends_on` names at least one unit it covers — never `[]`: a review that
  covers nothing reviews nothing. Preflight refuses a review unit in the wave
  of a unit it covers, one that covers nothing, and one that leaves an earlier
  unit no earlier review covers out. The `index.md` sections the template
  marks *cycle plans only* — Slice — and the cycle-only keys of `index.json`
  are omitted.
- **A unit deletes with plain `rm`, never `git rm`.** A unit stages nothing, so
  no unit's deletion can ride another unit's commit.
- **Fewest waves.** Every unit sits in wave 1 unless it has a named reason to
  wait: it edits a path an earlier unit creates or moves, or its Verification
  needs an earlier unit's output. A unit that only reads the same files, or
  edits a neighbour of another unit's files, shares the wave. Each unit in a
  later wave states its reason in its `waits` key — the edit units of one
  wave run at once, so each needless wave is a serial step the run pays for.
  The fixed final units and a `review` unit keep their own waves, and their
  `waits` may be `""`; every other unit in wave 1 has `waits` `""`.
- **Shared-file rule.** Any file two units would write is owned by exactly one,
  or by the orchestrator — an entry of the `shared_files` list, its `owner` a
  unit id or the orchestrator. Version files are nobody's — the release task
  bumps them; generated files and every doc are always the orchestrator's or
  the final units'. Units in one wave own disjoint paths.
- **Gate deltas are units.** A change that needs a new or altered check, test,
  or task plans that as an owned edit, never as "update the gates".
- **`requires` names a folder by its basename.** A required plan is written as
  its `docs/plans/<date>-<name>` path as planned, and is matched — by
  `/vwf:execute` and by the plan index — on the basename alone, so the line is
  never re-pointed when the folder moves to `docs/plans/archived/`.
- **The two last units are fixed:** the **docs unit**, which runs
  `vwf:docs-sync` over the run's branch delta
  (`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`) and applies its findings
  plus every `DOCS FALSIFIED:` line the earlier units returned; and the
  **gates unit**, `NN-gates.md`, which runs the generators the plan names and
  passes the full wave gate. Nothing else touches docs; no unit bumps a
  version.
- **Assumed decisions are the `decisions` list**, one entry per ruling you
  made — `decision`, `ruling`, the alternative `rejected`, and the `units` it
  changes. It is the review surface.
- **Out of scope and Parked are explicit** sections of `index.md`. What the
  user declined, with the reason, and what was raised and deferred, so
  `/vwf:execute` never "helpfully" picks either up. What remains of a
  `backlog_pieces` item is a `- Bnn: <piece>` Parked line, at least one per
  id; a `backlog` id has none, and `plan.mjs validate` and the executor's
  preflight both refuse a folder that breaks either rule.

### 7. Self-review

Re-read the folder with fresh eyes before handing it off, and fix inline — a
wave change is one `plan.mjs rewave` call, after a `set` of each moved
unit's `waits` first when it moves above wave 1.
First run
`node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs validate <folder>/index.json`;
a red result is fixed before any other check — each finding names the path
that broke. It already checks the shape: every required key and enum value,
unique ids, each unit's `file` present, `depends_on` naming an earlier wave,
`waits` where a later wave needs it, the `review` unit's shape, and the
`backlog`, `backlog_pieces` and `source` rules against the `- Bnn:` Parked
lines of `index.md`. Then:

- every entry of the `decisions` list is **quoted** in the unit file of each
  id its `units` names — a ruling no unit carries is a ruling the run
  re-derives
- every owned path appears in exactly one unit's `owns` per wave, and every
  `shared_files` entry has an `owner`
- every unit in a wave after wave 1 — the fixed final units and a `review`
  unit aside — names a real reason to wait in its `waits`
- every gate delta from the interview is an owned edit somewhere
- a `review` unit, when present, names its reason in the `decisions` list,
  covers — directly or transitively — every unit in an earlier wave that no
  earlier review unit covers, and sits in a wave strictly later than each of
  them
- every unit's *Verification* names at least one gate line it must pass — a
  `review` unit has none, by shape
- every hit of the retired-name grep sits inside some unit's `owns`, and every
  `## Commit` line's type is one the repo's convention file allows
- every `requires` entry resolves to a row or an archived folder, and none is
  `DRAFT` — invoke `plan-management resolve <folder>` and treat an
  *unresolvable* entry as a finding
- every id §1 noted is on `source` — a folder made for a backlog item with
  `backlog` and `backlog_pieces` both empty is not approved
- no `gaps_of` entry names a row of the plan index that is not `COMPLETE`, or
  whose `gaps` is `null` or has `open` `0`
- the derived priority equals what `plan-management priority <folder>` returns
- every project the units touch has a `release_levels` entry with a reason,
  and `consent` has no release key
- every `consent` key carries an answer, and no `after_landing` entry carries
  a `mode` other than `run` — `/vwf:execute` asks nothing at run time
- the launch line names this folder

Then the **rulings review**, item 20 of
`${CLAUDE_PLUGIN_ROOT}/assets/plan-interview.md`: a fresh
`plan-rulings-reviewer` over the `DRAFT` folder, each gap it returns asked of
the user one at a time and written into the folder, looped until `NO GAPS`,
four rounds at most. These are the last questions the plan gets —
`/vwf:execute` asks none.

### 8. Hand off

In this order.

1. **Hand the folder to `plan-management`.** Invoke
   `plan-management add <folder>` — its `add` verb sets the folder's `status`
   to `APPROVED` with the date (until then it is `DRAFT` and `/vwf:execute`
   refuses it) and appends the folder's row to the plan index — the `plans`
   list of the base repo's `docs/plans/index.json` — `kind` `change`,
   deriving the priority itself
   (`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md` is
   the shape). That skill edits the `status` key and the index; this one never
   does. `add` refuses while the base repo's `docs/plans/index.md` exists —
   the old plan format — and prints the migration message. Then stop here:
   the folder stays `DRAFT` and uncommitted, nothing below runs, and the
   output is the refusal as `add` printed it.
2. **Mark the backlog items planned.** When the `backlog` or `backlog_pieces`
   list of `index.json` names ids, invoke
   `/vwf:backlog planned <ids> <folder>` with the ids of both lists — that
   skill edits the project, not a file; this one never does either.
3. **Commit and push the folder** through `vwf:git-workflow`, invoked with
   these declared preferences, so it asks nothing:
   - **work in place on the current branch, no worktree** — its Step 1 "if
     declined" path. Say why: the run's worktree is cut from the integration
     branch, so it can see the folder only once the folder is committed there;
     a folder still untracked at hand-off gets swept into some later wave's
     commit. The index row rides the same commit for the same
     reason — it is a direct commit on the branch, never a worktree's
   - **stage exactly the plan folder** and `docs/plans/index.json`, and
     nothing else — the `plan-management` edit rides this commit and that
     skill never commits; step 2 changed nothing in the tree
   - **commit** with type `docs` and the message
     `docs: change plan — <name> — approved, awaiting execution`
   - **push to the branch's upstream** after the commit, setting the upstream
     when the branch has none. The approve in §5 is the explicit request
     git-workflow's push rule wants; do not ask again

Then **check that nothing at this priority is left to plan**, before
recommending a run. An **open** backlog item is `Backlog`, `In progress` or
`Partially done`; an **unplanned** one is `Backlog`, or `Partially done` with no
`Planned in:` line. The **check priority** is the highest priority among the
`backlog` and `backlog_pieces` ids of `index.json`, or, when both are empty,
the highest priority that has an open item. Invoke
`/vwf:backlog unplanned <priority>` — with no argument when the plan names no
id — and count, beside what it lists, the pieces of this session's request not
yet planned (§2's split). Then end in exactly one of three ways:

- **Nothing unplanned** — end with the launch block below, exactly as written.
- **Something unplanned** — no launch block. Print the unplanned pieces of this
  request first, then the unplanned items at the check priority, then the
  command for the next one — `/vwf:change-plan <item>`, or `/vwf:plan <slice>`
  when the item names a blueprint slice — and nothing after it. A piece of this
  request that is next goes straight back to §3 instead. `/vwf:execute` is
  unchanged; the user may still run it.
- **The backlog unreadable** — the verb says so; end with the launch block,
  preceded by one line saying the backlog could not be read, so the check did
  not run.

The launch block, with nothing after it:

```text
Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/<date>-<name>

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
```

Do not start executing. The fresh context is the point — this session's context
is the survey and the interview, and the run should carry none of it.

## What this skill never does

- Writes anything to disk before the hard gate in §5 is approved
- Executes a unit, edits a file the plan names, or bumps a version
- Asks two things in one turn, or asks what the repo already answers
- Records a landing consent it did not explicitly ask for, or a release step
- Writes a plan whose unit prompts depend on this conversation
- Pushes anywhere but the branch it stands on, and merges nothing
- Edits the backlog itself — it calls `/vwf:backlog`, which owns the project
- Edits the plan index, `docs/plans/index.json`, or a folder's `status` key
  itself — `add` is the one `plan-management` verb it calls on them; every
  later status is `/vwf:execute`'s to call, and the archive move is the same
  skill's
