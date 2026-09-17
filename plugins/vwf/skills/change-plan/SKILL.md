---
name: change-plan
description: Turn an ad-hoc change request — work outside the blueprint — into a
  plan folder under docs/plans/<date>-<name>/ that /vwf:execute runs unattended
  in a fresh session. Recall and survey the repo, split a request
  that is really several plans, interview the user one question at a time until
  the checklist is discharged, present the shape behind a hard gate, agree the
  wave gate, the after-landing steps and the release intent, record consent,
  write index.md plus one file per subagent unit, mark the backlog items it
  covers planned, add its row to the plan index with a derived priority, and
  commit and push the folder so the fresh session sees it.
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

The plan folder is the contract. `index.md` is the entry point and carries
everything `/vwf:execute` reads mechanically; the unit files carry what each
subagent reads. Nothing lives in conversation.

## Procedure

### 1. Recall, then survey

**Recall first.** Before asking anything, read what is already decided:

- `docs/memory/decisions/` — any doc touching the trees the request names
- the last plan in `docs/plans/archived/` that touched the same tree — a folder
  or, before 2026-09-16, a single `.md` file, the shape cycle plans had until
  then — reading its *Out of scope*, its *Parked* list and its *Run log*: the
  request is often one of those items coming due, and a gap the last run
  surfaced is a fact
- the base repo's `docs/backlog.md` — the product's backlog, the prioritised
  list of work that cannot be picked up now, which `/vwf:backlog` maintains and
  keeps in the base repo alone, beside the base's `docs/plans/` — when the
  product has one. A session in a member repo reads the base's file, never a
  file of its own. The request is often one of its items; note every id it
  covers, so the plan's frontmatter can carry them. Reading the file is this
  skill's business; editing it never is — `/vwf:backlog` is its sole writer
- the base repo's `docs/plans/index.md` — the plan index, the one table where
  every active plan of either kind, cycle and change, its status and its
  priority live; `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` is the shape.
  Like the backlog it is the base's file alone, read from a member repo and
  never duplicated there. The `Priority` column of the rows a new plan will
  require — rows of either kind — is what §5's derived priority stands on.
  Reading the file is this skill's business; the only edit it ever makes is the
  one row §8 appends
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
  every one needs an owner in the unit table before the plan is written; the
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
earlier one names it in its frontmatter `requires:` list; `/vwf:execute` halts
until every required plan reads `COMPLETE`. One plan never swallows another.

An answer mid-interview that raises something outside this plan's scope is
**parked, durably**: acknowledge it, write it to the plan's *Parked* list with
enough to pick it up later, and do not widen the plan. Parked items are the
first thing the next plan's recall reads.

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
before. If the user says "just decide", record the decision in the assumed
decisions table with your reasoning and the alternative you rejected — that
table is what they review.

### 4. Agree the gate, the after-landing steps and the release intent

Three sub-steps, each proposed from the survey and confirmed by the user. All
three are written into `index.md`, and `/vwf:execute` runs **what is written
and nothing it infers**.

**(a) The wave gate.** Propose the exact commands the run must pass, one per
line, drawn from the survey's gate list — the repo's own task runner tasks, the
capabilities the `harness:` stamp records, the checks CI already runs over the
touched trees. Confirm them. These become `index.md`'s **Wave gate** section,
and `/vwf:execute` runs them before wave 1 and after every wave. A check
that only holds once a particular unit has landed is **not** a wave-gate line —
the gate runs before wave 1 and must be green then — it is that unit's
*Verification*, repeated in the gates-and-bump unit's. A repo with no task
runner and no harness stamp records `none` — say plainly, in that case, that the
run has no automated gate and the wave review is the only check. The wave
review is the only review a change plan runs by default: a `Kind: review` row
— the one that runs `/code-review` and `/security-review` — is written only
when the change lands runnable code (item 10a), with its reason in the
decisions table.

**(b) After landing.** Propose the ordered steps that follow a consented
landing, and confirm each. Each step gets one mode at the interview (item 17),
`run` or `ask`, written to the After landing table: a `run` step runs on a
green landing without a prompt — a local staging step and a release step alike
— and an `ask` step stops the run once before it, reports what it would do,
and waits. Where a step stages something the session already loaded, say
plainly that it is picked up only by a **restarted** session.

Empty is a valid answer. These become `index.md`'s **After landing** section.

**(c) Release intent.** For each project the units touch, ask two things: does a
user of that project see a difference, and how does that project ship — the
command that bumps its version, the tag, the publish step. Record the answer as
a `Release <project>` consent row reading `none`, `patch`, `minor` or `major`,
together with the command that bumps it, and as the step in (b) that ships it.
The gates-and-bump unit bumps with the command the plan names.

This question doubles as the consent for a release step recorded `run`: a
release the user names here and (b) records `run` is authorised, and the
executor runs it on a green landing without asking again. A release recorded
`ask`, or with no after-landing step, is **intent, not authorisation**. Record
every answer including "not this time" — a changed project with no public
release recorded is a valid answer, and it means the change waits for the next
one.

### 5. Present the shape — the hard gate

**Nothing is written to disk before this gate.** Present, in sections scaled to
their weight and confirmed one at a time:

1. the goal and the reversals, if any
2. the assumed decisions table — every ruling, its rejected alternatives
3. the unit map — id, wave, owned paths, depends-on — and why each wave is safe
   to run concurrently
4. every new third-party dependency any unit introduces: package, what for,
   which unit. The gate is where the user consents to a dependency; a unit never
   adds one the plan does not name
5. the wave gate, the after-landing steps, the gates the orchestrator keeps —
   and the **derived priority**, stated as a fact with the arithmetic that
   produced it: `10 + max` over the `Priority` column of every unarchived
   `requires:` row in the plan index, naming the row it stands on, or
   "requires nothing active → 10". It is never asked; the one thing that
   changes it is a required plan the user names here that the interview missed
6. the consent block and the release intent
7. the parked list

Then ask once: **approve**, **revise** or **abandon**. Revise loops back to the
section named. Abandon ends here with nothing on disk and a one-line note of
what was decided, so the next attempt can recall it. Only approve continues.

### 6. Write the folder

`docs/plans/<YYYY-MM-DD>-<kebab-name>/` from the template in
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md` — the one folder shape
both planners write: `index.md` plus one `NN-<unit>.md` per unit. Every section
the template does not mark *cycle plans only* is required; the frontmatter and
the **Status**, **Consent**, **Units**, **Wave gate**, **After landing** and
**Run log** blocks have a fixed shape because `/vwf:execute` parses and
rewrites them. The frontmatter's `type:` is `vwf-change-plan`, and its
`backlog:` list names the ids recalled in §1 that this plan covers, or is
empty.

Rules the plan must obey, learned from the plans that came before:

- **One unit, one subagent, one commit.** A unit is stateless and inherits no
  context; its file carries its ruling quoted from index.md, its owned paths,
  its verification, and its commit line.
- **Every unit is `Kind: edit`.** A change plan has no code unit in this
  release. `/vwf:execute` reads each unit's Kind from the Units table: it
  dispatches the `edit` units of a wave together, in one message, and judges
  them by the wave review — the only check, by default. A `Kind: review` row
  (Owns `—`, Depends on the units it covers, a `NN-review.md` in the template's
  shape) is added only when the change lands runnable code — shipped shell or
  hook scripts, `scripts/`, `installer/` — and the reason is a row in the
  decisions table. The row sits in a wave strictly later than every unit it
  covers — in the same wave it runs before their commit and reviews nothing,
  since it scopes by commit range — and its Depends on names every `code` unit
  in an earlier wave no earlier `review` row named; preflight refuses a folder
  that breaks either. The sections the template marks *cycle plans only*
  — Slice, Acceptance criteria (from blueprint), Gaps surfaced during execution
  — and the `covers:` and `exposure:` frontmatter keys are omitted.
- **A unit deletes with plain `rm`, never `git rm`.** A unit stages nothing, so
  no unit's deletion can ride another unit's commit.
- **Shared-file rule.** Any file two units would write is owned by exactly one,
  or by the orchestrator. Version files, generated files, and every doc are
  always the orchestrator's or the final units'. Units in one wave own disjoint
  paths.
- **Gate deltas are units.** A change that needs a new or altered check, test,
  or task plans that as an owned edit, never as "update the gates".
- **`requires:` names a folder by its basename.** A required plan is written as
  its `docs/plans/<date>-<name>` path as planned, and is matched — by
  `/vwf:execute` and by the plan index — on the basename alone, so the line is
  never re-pointed when the folder moves to `docs/plans/archived/`.
- **The two last units are fixed:** the **docs unit**, which runs
  `vwf:docs-sync` over the run's branch delta
  (`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`) and applies its findings
  plus every `DOCS FALSIFIED:` line the earlier units returned; and the
  **gates-and-bump unit**, which bumps each released project's version with the
  command the plan names, runs the generators the plan names, and passes the
  full wave gate. Nothing else touches docs or versions.
- **Assumed decisions are a table**, one row per ruling you made, with the unit
  it changes and the alternative rejected. It is the review surface.
- **Out of scope and Parked are explicit.** What the user declined, with the
  reason, and what was raised and deferred, so `/vwf:execute` never
  "helpfully" picks either up.

### 7. Self-review

Re-read the folder with fresh eyes before handing it off, and fix inline:

- every row of the assumed decisions table is **quoted** in the unit file its
  *Unit* column names — a ruling no unit carries is a ruling the run re-derives
- every owned path appears in exactly one unit per wave, and every file in the
  shared-file rule has an owner
- every gate delta from the interview is an owned edit somewhere
- a `review` row, when present, names its reason in the decisions table,
  covers the units that land runnable code, sits in a wave strictly later than
  every unit it covers, and names in Depends on every earlier-wave `code` unit
  no earlier row named
- every unit's *Verification* names at least one gate line it must pass — a
  `review` row has none, by shape
- every hit of the retired-name grep sits inside some unit's *Owns*, and every
  `## Commit` line's type is one the repo's convention file allows
- every `requires:` plan exists and is not `DRAFT`
- the derived priority equals `10 + max` over the `Priority` column of every
  unarchived `requires:` row in the plan index, or `10` when it requires none
- the launch line names this folder

### 8. Hand off

In this order.

1. **Set the status** to `APPROVED` with the date; until then it is `DRAFT` and
   `/vwf:execute` refuses it.
2. **Add the index row.** Append one row to the plan index — the one table in
   the base repo's `docs/plans/index.md`, per
   `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`: `Folder` the plan folder path
   relative to the repo root, `Kind` `change`, `Plan` the title, `Target repo`
   `—`, `Priority` the integer §5 derived, `Status` `APPROVED`, `Requires` the
   basenames of its `requires:` entries or `—`, `Backlog` its `backlog:` ids or
   `—`. When the file has no table yet, write the file's whole shape from the
   asset first, then append. This is the one edit this skill makes to that file
   — every other row is an executor's or `/vwf:archive`'s.
3. **Mark the backlog items planned.** When the frontmatter's `backlog:` list
   names ids, invoke `/vwf:backlog planned <ids> <folder>` — that skill edits
   the file; this one never does.
4. **Commit and push the folder** through `vwf:git-workflow`, invoked with
   these declared preferences, so it asks nothing:
   - **work in place on the current branch, no worktree** — its Step 1 "if
     declined" path. Say why: the fresh session's worktree is cut from the
     integration branch, so it can see the folder only once the folder is
     committed there; a folder still untracked at hand-off gets swept into some
     later wave's commit. The index row rides the same commit for the same
     reason — it is a direct commit on the branch, never a worktree's
   - **stage exactly the plan folder**, `docs/plans/index.md`, plus
     `docs/backlog.md` when step 3 changed it, and nothing else
   - **commit** with type `docs` and the message
     `docs: change plan — <name> — approved, awaiting execution`
   - **push to the branch's upstream** after the commit, setting the upstream
     when the branch has none. The approve in §5 is the explicit request
     git-workflow's push rule wants; do not ask again

Then end with exactly this, and nothing after it:

```text
Run in a fresh session:

/vwf:execute docs/plans/<date>-<name>

or let the queue pick it, by priority:

/vwf:execute next
```

Do not start executing. The fresh session is the point — this session's context
is the survey and the interview, and the run should carry none of it.

## What this skill never does

- Writes anything to disk before the hard gate in §5 is approved
- Executes a unit, edits a file the plan names, or bumps a version
- Asks two things in one turn, or asks what the repo already answers
- Records a release or landing consent it did not explicitly ask for
- Writes a plan whose unit prompts depend on this conversation
- Pushes anywhere but the branch it stands on, and merges nothing
- Edits `docs/backlog.md` itself — it calls `/vwf:backlog`, which owns the file
- Edits any row of the plan index, `docs/plans/index.md`, but the one it
  appends — statuses are `/vwf:execute`'s and `/vwf:archive`'s
