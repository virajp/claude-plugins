---
name: execute
description: Execute an approved plan folder — a cycle plan from /vwf:plan or
  a change plan from /vwf:change-plan — to completion in a dedicated worktree,
  in a fresh context — a fresh session, or a runner that `all` dispatches.
  The one executor for every plan folder, reading each unit's kind from the
  folder's index.json; a code unit runs TDD, coverage and its commit one unit
  at a time, the edit units of a wave are dispatched together
  and judged by the wave review, and a review row runs the code and security
  engines and reviewers over the branch delta the row covers — security alone
  when it covers edit units alone — each later round over the last round's
  fixes; the acceptance
  and UX pass and the blueprint reconcile run when the plan has a covers list.
  It stops on the old plan format and points to the migration guide, claims
  the plan's row in docs/plans/index.json through plan-management, keeps each
  unit's state in index.json, which the final report renders, lands per the
  plan's recorded consent — archiving the folder when no gap is open and
  archive raises no warning — and runs every after-landing step the plan
  recorded, each `run`.
  It asks the user nothing at run time — every answer is in the folder, save
  the run-level questions /vwf:execute all asks once, before its first plan.
  Invoke as /vwf:execute <plan-folder> or /vwf:execute next — the latter asks
  plan-management for the runnable plan of highest priority in
  docs/plans/index.json, of either kind — or /vwf:execute all, which runs
  every runnable plan in turn, highest priority first, each in its own runner
  subagent, until one stops. Requires an approved plan folder in docs/plans/.
argument-hint: "<plan-folder, its index.json, next, or all>"
model: opus

disable-model-invocation: true
---

# execute — Run an Approved Plan to Completion

Implement an approved plan **to completion, autonomously**. The plan folder is
the contract and its `index.json` is the input: every consent, unit scope and
gate line the run needs was written there by `/vwf:plan` or
`/vwf:change-plan`, beside the prose in its `index.md` and the rulings in its
unit files, and this skill reads them rather than re-asking them. The
orchestrator **decides, reviews and verifies, and never reads unit work
inline**: every edit is a subagent's, so this session's context stays the size
of the reports. Each unit's `kind` is the switch, and it takes
three values: a `code` unit passes code under TDD to the coverage gate and its
commit; an `edit` unit is dispatched with the other `edit` units of its wave
and judged by the wave review; a `review` row — the planner placed it, by
default once after the last code unit — runs the two review engines and the
two reviewers over the branch delta since the previous review row, the
security half alone when it covers `edit` units alone, with findings looped
back to the owning units before it counts as done, each later round over the
previous round's fixes alone.
Acceptance and UX conformance run once after all units when the plan has
`covers`. There are **no per-stage human gates** — decisions come from the
**Autonomous Rules** below, and the run stops only at a runtime stop — the
**Pause Conditions**, or the **final report** when something stands in the way
of the landing — each reported with its resume command. You own the
orchestration and dispatch the five stage subagents — `execute-coder` for
`code` units, `execute-code-reviewer` and `execute-security-reviewer` at
`review` rows, `execute-acceptance-verifier` and `execute-ux-reviewer` once
per plan — the unit agents for `edit` units, and the wave reviewer for every
wave.

**Execute asks the user nothing.** Every answer a run could need was asked by
the planner and recorded in the folder; where the folder is silent and the
rules below do not decide, the run reports what is missing and stops — it
never offers a choice, waits for a yes, or asks how to proceed. A fix goes
into the folder, and the person re-runs `/vwf:execute <folder>`. The one
exception is `all`'s run-level questions — asked once by the loop, before its
first plan, about the run of several plans, and never by a run.

Run it in a fresh context: a fresh session, or a runner that `all`
dispatches. It cannot check that, so the plan's launch line says it and this
skill trusts it.

Adopt the **Autonomous delivery driver** persona: keep moving, decide from the
rules, isolate all work in one worktree, document what you can't resolve, and
land only what the plan's `consent` already authorised.

## References

The rules that hold on every run — the halts, the pause conditions, the
autonomous rules — stay here. The three pipelines and four conditional
branches load on demand, each named where it applies — never upfront.

| Reference                                                   | When to read                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [One `code` unit](references/code-unit.md)                  | the Waves section, when a wave holds a `code` unit — TDD, coverage, commit                             |
| [`edit` units and the wave review](references/edit-unit.md) | the Waves section, when a wave holds an `edit` unit, and every wave's review                           |
| [One `review` row](references/review-unit.md)               | the Waves section, when a wave holds a `review` row — the engines, both reviewers, the findings loop   |
| [Blocking and resume](references/blocking.md)               | On failure — what a failure skips, what it blocks, how a re-run picks up                               |
| [The preflight reads](references/preflight.md)              | Resolve, for `validate` and the release levels; Setup steps 2 and 3, when the plan has a `code` unit   |
| [Acceptance & UX](references/acceptance-and-ux.md)          | when `covers` is present and the acceptance or ux stage returns short of a pass                        |
| [`all` and runner mode](references/all.md)                  | Resolve, when `$ARGUMENTS` is `all` — and when you are an `execute-runner` handed one folder           |
| [The action log](references/action-log.md)                  | Resolve, once the folder is read and not refused — every call the run makes to `log.mjs`               |

## The plan files

A plan folder keeps every structured fact in its `index.json` — the schema is
the one `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md` writes — its
prose (goal, facts, out of scope, parked) in `index.md`, and each unit's
prompt in the file its `units` entry names. The plan index is the base repo's
`docs/plans/index.json`. One script reads and writes both files, and below
`plan.mjs` names it:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs <verb> …
```

- **Every read** is `plan.mjs get <folder>/index.json <path>` — a dot path,
  where a segment after a list chooses the entry by its `id`:
  `units.U3.status`, `consent.merge`, `stages.ux.state`, `gaps.G2.state`.
- **Every write** the run makes to the folder is one
  `plan.mjs set <folder>/index.json <path> <value>` — `--json` for any
  value not a string: a number, boolean, list, object or null — or one
  `plan.mjs append <folder>/index.json <list> --json <entry>`. The file is
  never rewritten whole, and never edited with Write, Edit or `sed`. The run
  never calls `plan.mjs rewave <file> <unit>=<wave>...` — that is a planner
  write, run after a `set` of a moved unit's `waits` when the unit moves
  above wave 1; a run never renumbers waves. A write
  that exits non-zero wrote nothing; it is a blocking-gap stop per the Pause
  Conditions, its stderr the detail.
- **What the run writes**: each unit's `status` (`running` at dispatch, then
  `green`, `failed`, `unresolved` or `skipped`), its `commit` (the short hash
  of its last commit) and its `rounds` (the highest round it reached); a
  `review` row's `range`, per [review-unit.md](references/review-unit.md);
  each wave's `status` — `set waves.W<n>.status running` as the wave starts,
  `green` as it closes, `failed` when a unit in it failed or was skipped;
  each entry of `gaps`; each of the four `stages` — its `state` `running` as
  it starts, then `green`, `failed` or `skipped`; and, under `all`, one entry
  of `overrides`. The plan's own `status.state` and `status.detail` are
  never set here: they are the `plan-management status` verb's, and the plan
  index is `plan-management`'s.
- **The run writes no time.** Every unit, wave and stage carries `started`
  and `ended`, and `plan.mjs` stamps them itself on each `set` of a unit's or
  wave's `status` or a stage's `state`, in the same validated write — a first
  `running` sets `started`, a later `running` clears `ended`, a final status
  sets `ended`. The plan's row in `docs/plans/index.json` is stamped the same
  way by `plan-management`'s `claim` and `complete`.
- **A gap** is one
  `append <folder>/index.json gaps --json '{"id": "G<n>", "unit": "<id>", "stage": "<stage>", "text": "<what the plan left open> · <the assumption taken>", "state": "open"}'`,
  `G<n>` one past the highest `G` id in the list; `unit` and `stage` are `""`
  for a plan-level gap or a stage not known. Closing one is two `set` calls,
  `gaps.G<n>.state` to `closed` and `gaps.G<n>.text` to its line ended with
  how.
- **Every run fact goes to the action log too.** `index.json` keeps the facts
  — it is committed, and resume and the final report read it — and the log
  carries the same facts as events, the real-time feed for `log.mjs summary`,
  debugging and timing statistics; the progress pane reads the states and the
  times from `index.json` and the plan's row, and from the log only each
  unit's agent and whether the run is still writing. After each `set` of a
  unit's `status`, `commit`, `rounds` or `range`, or of a stage, run
  `log.mjs event row` with the JSON on stdin; after each `append` to `gaps`
  and each `set` of a gap's `state`, run `log.mjs event gap`. A wave's
  `status` set is followed by no event: the wave's `phase.start` and
  `phase.end` already carry it. Both read a quoted heredoc, so nothing in
  it is expanded:

  ```sh
  node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs event row <<'EOF'
  {"unit": "U3", "wave": 2, "status": "green", "commit": "1a2b3c4"}
  EOF
  node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs event gap <<'EOF'
  {"id": "G2", "unit": "U3", "stage": "", "text": "<the line>", "state": "open", "class": "GAP", "source": "unit"}
  EOF
  ```

  A `row` carries exactly one of `unit` or `stage` (a `stages` key), and
  always `status` — the status after the set; a unit row also carries `wave`.
  Add the field that changed — `commit`, `rounds`, `range` (`{"from", "to"}`)
  or `detail` — or none, for a status change. A `gap` carries `unit`,
  `stage`, `text` and `state`, plus `class` and `source` as
  [the action log](references/action-log.md) lists them; its `id` is the
  `G<n>` of the `gaps` entry, and is left out for a recorded line that is not
  an `index.json` gap — `log.mjs` gives it the next `L<n>`. Both are strict:
  an unknown key or a wrong value exits non-zero and writes nothing, and a log
  call never stops a run.

## Halt Conditions

### 1. Resolve and refuse early

**The format test — first, before anything else.** Whatever `$ARGUMENTS`
is — a folder, `next` or `all` — look at the base repo's local checkout
before any other step. The repo is in the **old format** whenever
`docs/plans/index.md` exists, with or without `docs/plans/index.json` (a
migration stopped half way); a named folder is in the old format when it
holds an `index.md` and no `index.json`. On the old format, stop before any
change — claim nothing, cut no worktree, start no log, write nothing — and
print the migration message:

> This repo uses the old plan format. Migrate it with
> `https://github.com/virajp/claude-plugins/blob/main/docs/plans/migrate.md`
> — in a local clone of `virajp/claude-plugins`, paste "Read
> `<local path>/docs/plans/migrate.md` and follow it in this repo." — then
> run the same command again.

After the migration the same command runs on the new format. A repo with
neither file has no plan: `next` and `all` report no runnable plan, and a
named folder halts as *Finding the plan* says.

**`all`.** When `$ARGUMENTS` is `all`, this session is the loop, not an
orchestrator: follow [`all` and runner mode](references/all.md) and nothing
below. It asks its run-level questions once, before the first plan — the one
place `all` asks anything — then picks with `plan-management next`,
dispatches one `execute-runner` per pick — handed the folder, this file's
absolute path and the run's overrides for that folder — waits for its
five-line return, and repeats until nothing is runnable, a runner returns
`STOPPED`, a plan's return reads `ENDS RUN: yes`, or a cap directive has
reached the session; then it prints one table and the stop reason. A runner
reads this file and runs it for its one folder, in that reference's *Runner
mode* — as if that folder had been named here.

**`next`.** When `$ARGUMENTS` is `next`, invoke `plan-management next` — the
pick is that skill's, per *Reading the queue* in
`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`: the
candidates are every `APPROVED` row whose requirements are satisfied, `cycle`
or `change` alike — there is no kind filter. On a pick, print what it returned
— the folder taken, its `kind` and its `priority`, and every other `APPROVED`
row with why it was not taken. Ask no confirmation: the session is meant to run
unattended. Then continue below as if that folder had been named. Nothing
runnable → stop with the message the verb returns: each `APPROVED` row and what
it waits on, or that the index is absent or holds no rows.

**Finding the plan.** A plan folder lives in **the repo whose code it changes**
— a change plan's is the base's — and the `plans` list of
`docs/plans/index.json` in the base repo lists every one with its target repo
(`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`; the file's shape is
`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`, and
`plan-management` is its one writer). Read the index rather than
walking the members — under `multi-repo` most of them are not on this machine,
so a walk would report the product's plans as a function of what happens to be
cloned. Halt if no approved plan exists: "No approved plan found. Run
`/vwf:plan` or `/vwf:change-plan` first."

**Halt if the target repo is absent.** Report the missing repo and the command
that fetches it, per `${CLAUDE_PLUGIN_ROOT}/assets/membership.md` —
`git submodule update --init <path>` under submodule linkage,
`git clone <url> <path>` under siblings — and **stop**; the run clones
nothing. The person fetches it and re-runs `/vwf:execute <folder>`. Unlike
`plan` and `doctor`, there is no honest partial result — you cannot write code
into a repo you do not have.

**Read the folder.** Resolve `$ARGUMENTS` to `<folder>/index.json` — a
folder shaped by `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`;
`execute` reads folders only, and a single-file plan from an earlier release
is not an input (finish it on the release that wrote it, or re-plan it).
First run `plan.mjs validate <folder>/index.json`, per
[the preflight reads](references/preflight.md): a red result is a refusal
that prints every finding, on a fresh run and a resume alike. Then read with
`plan.mjs get` — `type`, `covers` when present, `requires`, `source` (the
ids of the backlog items the plan was made for, each of which sits on one of
the next two lists), `backlog` (the ids the plan **finishes**, which the
landing hands to `/vwf:backlog done`) and `backlog_pieces` (the ids it lands
**a piece of**, which the landing hands to `/vwf:backlog partial`), each `[]`
when the plan covers no such item — and `status`, `consent`, `units`, `gaps`
and `stages`; below, *Status* is `status.state` and *the status line* is
`status.detail`. A **`- Bnn:` Parked line** is a line under the `## Parked`
heading of the folder's `index.md` that begins `- B`, digits and a colon —
the remainder of item `Bnn` that this plan does not land; other Parked prose
is not read. Hold two facts from this read for every gate below: **has
`covers`** — a cycle plan, whose blueprint-bound steps run — and **has a
`code` unit** — one or more `units` entries whose `kind` is `code`. Then
read the folder's **row** in the base repo's `docs/plans/index.json`, at the
integration branch's tip, the way the contract's *Reading the queue* reads
it — `git show <remote>/<integration branch>:docs/plans/index.json` piped
into `plan.mjs get - plans.<basename>`; a `get` that finds no such id, or an
origin tree with no `docs/plans/index.json`, means no row. Then:

- Status `DRAFT` → stop: "not approved; run the planner that wrote it to finish
  it" — `/vwf:plan` for `type` `vwf-plan`, `/vwf:change-plan` for
  `type` `vwf-change-plan`.
- Status `COMPLETE` → stop: nothing to do.
- Invoke `plan-management resolve <folder>` — the contract's *Resolution*,
  by the test each entry's kind takes. Anything but *runnable* → stop and name
  each entry it returned with the reason it gave. For a **cycle** entry short
  of its stamps, halt with:

  > "Prerequisite plan `<folder>` has not been executed and merged (`<doc>` is
  > `implementation: <state>`). Run `/vwf:execute <folder>` first."

  No override flag — if reality differs from the stamp, heal it via
  `/vwf:plan` (its stamp-heal offer) or amend the blueprint via
  `/vwf:blueprint`; never guess past the halt. Because stamps land in the
  merged Reconcile commit, an executed-but-unmerged prerequisite correctly
  halts too. For a **change** entry, say "run /vwf:execute <that folder>
  first" when its row is `APPROVED` and "another session is running <that
  folder>; re-run this plan once it lands — or, when that run is gone, make
  the `plan-management unclaim <that folder>` request yourself" when it is
  `RUNNING`. An entry the verb names
  as unresolvable → "<entry> is neither in the plan index nor archived; fix
  the folder's `requires` list".
- Status `APPROVED` with no row at all → stop: "not in the plan index; re-run
  the planner's hand-off, or add the row by hand".
- Status `APPROVED` with a `RUNNING` row → a claim another session holds. Stop
  and name it: the row is resumed only by the session that holds it, or claimed
  afresh once the user has asked the session to unclaim it —
  `plan-management`'s `unclaim <folder>`, which refuses while the run's
  worktree still exists. Execute stops here; it never invokes the verb from
  this refusal.
- Status `BLOCKED` or `RUNNING` → a **resume**, per the Resume check under
  Recall below and [blocking and resume](references/blocking.md): the worktree
  named in the status line exists, and the run starts at the first unit that
  is not `green`. The ruling a block asked for must now be in the plan — if the
  status line still reads the same `UNRESOLVED:`, stop and say which ruling is
  missing. The row is expected to read `RUNNING` already, and is left alone; a
  row reading `APPROVED` was unclaimed, and the run claims it again below.
  A resume runs what its folder says and takes none of the fresh-run refusals
  below — a folder written before review rows existed was reviewed per unit,
  and cannot be re-approved mid-run. One thing it does refuse beyond
  `validate`, with the fix — edit the folder in the worktree with
  `plan.mjs`, then re-launch: a non-green `code` unit with no `review` row
  ahead that covers it (write a `NN-review.md` and `append` its `units`
  entry), since it would land with no review.
- Status `APPROVED` with an `APPROVED` row → a fresh run. Three refusals are
  read off the folder here, before the claim, each stopping the run with the
  fix — amend the folder and re-approve the plan — since execute runs what
  is written and infers no row. **A `code` unit no `review` row covers** — a
  row covers a unit when its `depends_on` names it, directly or transitively
  through units it names — naming every uncovered unit. **A `review` row that
  covers nothing** — its `depends_on` names no unit at all, so it would
  review nothing and pass inert; cycle plan and change plan alike — naming the
  row. **A `review` row
  placed wrong** — its wave is not strictly greater than the wave of every
  unit it covers (a row reviews a commit range, and a unit in its own wave is
  committed after it runs), or it fails to cover a unit of any kind in an
  earlier wave than itself that no earlier `review` row covers (the range
  would carry that unit's commits while the coverage would not, so the row's
  range and its coverage must agree) — naming the row and the unit. Every
  other refusal a fresh run made off the folder is a `validate` finding,
  refused above with the finding's path: an `after_landing` step whose
  `mode` is not `run`; a `release_levels` entry whose `level` is not one of
  `NONE`, `PATCH`, `MINOR`, `MAJOR`; a `source` id on neither `backlog` nor
  `backlog_pieces` (the plan was made for an item its landing would never
  mark); an id on both `backlog` and `backlog_pieces`; an id on `backlog`
  with a `- Bnn:` Parked line for it; and an id on `backlog_pieces` with no
  such line — a landing turns `backlog` into `Done` and `backlog_pieces` into
  `Partially done` and checks nothing else. The fix for each is to re-run
  the planner named by the folder's `type` — `/vwf:plan` or
  `/vwf:change-plan` — and correct the entry, or move the id to the list its
  Parked lines say it belongs on.

The folder arrives **already committed** on the integration branch — the
planner commits and pushes it at hand-off — so the worktree Setup step 1 cuts
sees it from its first commit. A folder that is not on that branch is refused,
not swept into a unit commit: stop and say to run the planner again on it, or
to commit and push it by hand, then re-launch.

**Start the action log.** Once the folder is read and no refusal above
stopped the run, start this run's action log per
[the action log](references/action-log.md) — `log.mjs start` in the main
checkout, `--folder` the copy of the folder it read, or, on a resume,
`log.mjs start --mode resume --folder <the worktree copy of the folder>`,
which appends to the same file — and from here log each phase, gate line,
commit, review round, row, gap and stop at the point that reference names.
`start` also writes one `plan.snapshot` event, the folder's `units` list. The
log is one append-only file for each plan, the path the folder's `run.log`
names once the claim below has written it —
`~/Library/Caches/vwf/<repo>/<folder basename>.jsonl` — outside the repo, and
is never committed; a log call never stops the run. Under `all`, each runner
starts its own folder's log, and the loop logs nothing.

**No active run.** When a `log.mjs event` or `run` call prints
`log.mjs: no active run in session <id>` during a run — the session's marker
is gone — run `log.mjs start --mode resume --folder <folder>`, which appends
to the same file, then repeat the call. The call itself exited 0, and a gate
it wrapped kept its own exit code.

**Run doctor before the claim.** On every run — a fresh run, and a resume —
run `/vwf:doctor` in the main checkout, scoped to the plan's projects — the
base repo's own when the plan names none — before the claim and before the
worktree is cut. It reads each project's `stack.languages` from
`.config/vwf.yaml` and checks LSP servers, toolchains, manifests, and the
harness. **Halt on any `blocking` finding** — mise, the graphify CLI, no
graph reachable from the main checkout, or a stack no installed plugin
defines (an **unknown** language, a `custom` template pin). These are
mandated tooling and the closed stack menu, so this is a hard halt with the
remedy, not a question: a run started without them fails later and less
legibly, and one started against an undefined stack does not fail at all — it
builds with the conventions, harness and UX gate silently absent. Report and
stop. A halt here leaves no claim, no worktree and no `status` edit, so the fix
and a re-run need no unclaim. Keep the report: Setup step 2 reads it.

**Claim the row.** Before the worktree is cut, and before the folder's own
`status` is touched, invoke `plan-management claim <folder>` in the main
checkout — it sets the row `RUNNING`, and sets the folder's `run` to
`{"worktree": "<dir>/<branch>", "log": "~/Library/Caches/vwf/<repo>/<folder basename>.jsonl"}`,
the worktree this run will use and its log, the `~` literal — then commit and
push `docs: plan queue — <folder> running` on the integration branch, exactly
as the contract's *Writing a row — the claim* spells out. When the folder
lives in a member repo, its `run` edit is a direct commit on that repo's
integration branch, with the same message, and its `<repo>` and worktree are
that repo's. These are the **two** edits the run makes in the main checkout —
the row and the folder's `run` — and they are made there on purpose: the
pushed row is what another session's `next` reads, so a claim that lived only
on the run branch would claim nothing, and `run` is how a reader such as the
progress pane finds the worktree and the log; and the run branch must never
carry `docs/plans/index.json`, or two plans landing in parallel would
conflict on it. A rejected push is handled per that procedure — a clean
rebase pushes again; a conflict on the same row means the plan was claimed
first, and the run re-picks (`next`) or stops (a named folder). A resume
whose row already reads `RUNNING` skips this step.

Once Setup step 1 has cut the worktree, invoke
`plan-management status <folder> RUNNING "RUNNING since <ts> in <worktree>"`
there — the folder's `status` is the verb's, and every later change to it (a
pause, a block, the landing) is the same verb with a different state and
detail. From there the folder is edited in the worktree only, through
`plan.mjs`, and committed with each unit, so a session that dies still leaves
a legible plan on the branch — never in the main checkout, which would dirty
the integration branch — the one exception being the claim's two edits above,
the index row and the folder's `run`, which are committed and pushed in the
main checkout and never edited in the worktree. The row does not change on a
pause or a block: the index carries `APPROVED`, `RUNNING` or `COMPLETE` only,
and the folder's status line keeps the run detail.

## Format Check

With `covers`, before the first unit, run the preflight in
`${CLAUDE_PLUGIN_ROOT}/assets/format-check.md`, taking its report and never its
offer — the run asks nothing. If the format drift is **non-blocking**, log it
and continue; if it is **blocking** (the run needs an artifact the old format
lacks), it is a **blocking-gap stop** per the Pause Conditions: report the
drift, name `/vwf:setup` as what reconciles it, and give the resume command —
never migrate autonomously. Without `covers` the check is skipped — one line
in the run journal saying so — since the plan reads no blueprint artifact.

## Doc Paths

| Doc           | Path                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Plan          | `docs/plans/<date>-<HHMM>-<slice>/` (target repo), `docs/plans/<date>-<name>/` (base): `index.json`, `index.md`, unit files  |
| Plan index    | `docs/plans/index.json` (base repo) — its `plans` list                                                                       |
| Plan template | `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`                                                                      |
| Membership    | `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`                                                                                 |
| Backlog       | a project on the base repo's forge, never a path — marked done or partial via `/vwf:backlog`                                 |
| Registry      | `docs/blueprint/registry.yaml` — *cycle plans only*                                                                          |
| Flow (slice)  | `docs/blueprint/flows/<project>/<NNN>-<flow>/index.md` — *cycle plans only*                                                  |
| Entity        | `docs/blueprint/entities/<entity>/` (`index.md` + schema) — *cycle plans only*                                               |
| API contract  | `docs/blueprint/apis/<project>.openapi.yaml` — *cycle plans only*                                                            |
| Released APIs | `docs/blueprint/apis/released/` — *cycle plans only*                                                                         |
| Conventions   | `docs/blueprint/conventions.md` — *cycle plans only*                                                                         |
| Environment   | `docs/blueprint/environment.md` — *cycle plans only*                                                                         |

The *cycle plans only* rows are read on a plan with `covers` and never
otherwise.

## Autonomous Rules

- **Implement the whole plan.** Every entry of the folder's `units` is
  implemented — no cherry-picking, no partial delivery.
- **Waves in order, kind decides concurrency.** The order is the `units`
  list — each entry's `wave`, then its `depends_on`: wave by wave, a unit only
  after every unit it depends on is done. Within a wave, each `review` row
  runs first, serially, over the committed tree — every unit it covers is in
  an earlier wave — before anything else is dispatched; then every `edit` unit
  is dispatched in one message and awaited; then each `code` unit runs
  serially through its pipeline; then the wave review; then the unit gate and
  the wave gate.
  Reorder only to honor a real dependency
  the list left implicit. If the derivation finds a **cycle or genuine
  ambiguity**, fall back to the list's **written order** as-is; if even that
  is not executable, it is a **blocking-gap stop** (per the Pause Conditions)
  naming the order the folder must state — never invent an order.
- **One plan, one worktree.** Via `/vwf:git-workflow`, create a dedicated
  isolated worktree for this plan — declared preference: **yes, isolate; do not
  prompt**. Implement everything there and **commit each unit autonomously** (no
  consent). Merge/push happens **only at the landing**, per the plan's
  `consent`.
- **The review runs at the `review` row, and only there.** A `code` unit is
  TDD → coverage → commit; the `review` and `security` stages run when wave
  order reaches the `review` row that covers it — the orchestrator runs the two
  review engines itself, filters their output to the row's range and hands it
  to the two reviewers, dispatched concurrently; a row that covers `edit`
  units alone runs the security engine and reviewer only; each round after
  the first reviews the previous round's fix commits alone — and both
  findings sets merge
  into one loop-back to the units whose commits the findings fall on, by kind,
  before the row is done, never a separate round per reviewer; the loop, its
  scope, the commit-based unit map and the one rule for an uncovered unit's
  file are [review-unit.md](references/review-unit.md), the authority every
  other passage cites. An `edit` unit has no stage of
  its own: its report and the wave review are its whole pipeline. The **shared
  stage rules** in
  `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md` hold throughout: the ones
  marked *every unit* — model enforcement via `pipeline.models` (an `edit`
  unit's or the wave reviewer's dispatch honours an override of its tier the
  same way, and states the downgrade), the pipeline knobs, terse subagent
  output, loop on findings, the convergence guard — reach an `edit` unit and
  the wave review too; the ones marked *`code` units with `covers`* never
  fire on a plan without one.
- **Always fix every security finding.** At a `review` row, security findings
  gate the row: loop back to the owning unit's coder until security review is
  clean. A security finding is **never** downgraded to a gap or deferred.
- **Always fix every breaking-API finding.** At a `review` row, a
  `[breaking-api]` finding from the review stage (a code change that would
  break a **released** API contract under `docs/blueprint/apis/released/`)
  gates exactly like a security finding: loop back to the owning unit's coder
  until the `API COMPAT:` line reads clean — exempt from the review round cap,
  never downgraded to a gap, never configurable off.
- **Review findings: capped rounds, guarded for convergence.** For a `review`
  row's `review` (non-security) findings, loop `code → review` up to the
  configured cap (`.config/vwf.yaml` `pipeline.review_round_cap`, default
  **4**) — the cap is the row's, whatever number of units it covers — and
  apply the **convergence guard** in `execute-stages.md` before
  each new round. A round that did not strictly reduce the finding count, or
  that resurfaced a finding an earlier round resolved, is not converging: end
  the loop there rather than burning the remaining rounds, and record the
  contested findings as an **oscillation** gap naming them and the rounds
  tried. The wave review's own loop is capped at two rounds under the same
  guard, per [edit-unit.md](references/edit-unit.md).
  - A loop that ends at the cap or the guard with findings open first runs the
    **closing pass** in `execute-stages.md` — one fix aimed at the open set
    alone, checked narrowly with no engine, never a round.
  - Any review finding still unresolved after the closing pass is
    **documented as a gap** and execution continues; it does not block.
  - The gap's diagnosis differs by exit. At the **cap**, "blueprint/plan was not
    thorough enough" — the contract left something open. At the **guard**, the
    contract is not the suspect and must not be named as one: the loop itself
    failed to settle, and reconciliation should look there first.
  - A guard trip on a **cap-exempt** finding (security or `[breaking-api]`) is
    not a gap — those must be fixed. It is a pause; see Pause Conditions.
- **Gaps: document and continue.** Every gap (a blueprint/plan hole, not a code
  finding) is appended to the folder's `gaps` list, per *The plan files*, and
  filed to mempalace room `gaps`, then execution continues; a unit's own
  `GAP:` line is one entry whose `unit` is that unit and whose `text` carries
  the assumption it took. A *non-blocking* gap never stops the run. An *isolated
  blocking* gap (the unit can't proceed without a human decision, but other
  units can) → skip that unit **and its dependents**, document, continue — per
  [blocking and resume](references/blocking.md), where a unit's `UNRESOLVED:`
  is the same thing.
- **Every gap entry carries its state.** Each entry of `gaps` has a `state`,
  `open` or `closed`, and its `text` reads
  `<what the plan left open> · <the assumption taken>`. An entry is `closed`
  only when the run settled it with no ruling owed — an Owns widened under
  the plan's Goal and the fix applied, a finding a later round or the closing
  pass resolved, a citation corrected — and its `text` ends with how.
  Everything that still wants a person — an assumption a unit took, a
  `contested` finding, an oscillation, an `UNRESOLVED:` — is `open`. Only the
  `open` entries are the gap list: the count, the archive rule and the
  reconciliation below read them alone. A person who later rules on an entry
  sets its `state` to `closed` and ends its `text` with the ruling.
- **The backlog is never edited here.** The backlog project has one writer,
  `/vwf:backlog`; this command only calls it at the landing — `done` with the
  plan's `backlog` ids, `partial` with its `backlog_pieces` ids — and no
  unit, subagent or reconcile pass touches the project.
- **All git via `/vwf:git-workflow`.** Never run raw git — the exceptions are
  the index row, whose claim and completion commits are the plain commands
  `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`
  spells out, in the main checkout, around the `plan-management` verb that
  makes the edit, and the staging discipline below, whose `git add` and
  `git reset` are the plain commands that keep one unit's commit to its own
  Owns. On **every** mid-run
  invocation, pass git-workflow these declared preferences so it never prompts:
  **isolate without asking** (its Step 1) and **commit only — do not prompt,
  never merge/push** (its Step 4). Without these, git-workflow's post-commit
  gate fires on every unit commit and stalls the run. The final merge/push (via
  git-workflow) happens only at the landing, per the plan's `consent`.
- **The three gate tiers, each line once.** The folder's **unit gate**,
  `gates.unit`, runs before every commit the orchestrator makes on a unit's
  behalf — a unit's own commit and each fix commit — and never while another
  unit is still editing, so in a wave of `edit` units it runs after every
  report is in; its **wave gate**, `gates.wave`, runs after each wave; its
  **plan gate**, `gates.plan`, runs once, over the finished tree. Each line
  runs **once** at each of those points, through the action log's
  `log.mjs run` wrapper, which times it and keeps its exit code. A red unit
  gate line is that unit's failure, handled as the Waves section's step 5
  handles a red gate line. An empty `gates.unit` runs no unit gate, and an
  empty `gates.plan` runs every wave gate line once more in its place.
- **One commit per unit, staged to its Owns.** Every green unit, of either
  kind, is committed on its own, in wave order. Its Owns is its `owns` list
  in `index.json`. Stage exactly that unit's Owns
  — `git add -- <every owned path>`, which stages a deletion as readily as an
  edit — then read `git diff --cached --stat`: for any path outside that unit's
  Owns, `git reset -q HEAD -- <path>` before committing. A path another unit
  staged is that unit's, and rides its own commit. Then commit with the unit
  file's commit line via `vwf:git-workflow` step 3, and `set` the short hash
  into `units.<id>.commit`. Commits are free; they are what
  makes a later failure roll back to the last green unit instead of discarding
  the run. An Owns the orchestrator widens at run time is one `set` of
  `units.<id>.owns --json <the whole widened list>`, recorded as a `closed`
  gap naming the finding that caused it.
- **Memory via mempalace (lean on it)** — follow
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`. mempalace is the run's working
  memory, not just an end-of-run sink: resolve the project **wing** once. For a
  **`code` unit**, **recall per unit** (decisions/problems/gaps/runs for that
  slice) before dispatching the coder, not only before the first unit; pass
  the wing **and** the recall hits to every subagent; **persist incrementally**
  — store each unit's durable decisions as it lands. An **`edit` unit** takes
  neither: its ruling is in its file, and its `DECIDED:` lines ride the run
  journal. For **every plan**, as each *node* returns for a `code` unit or a
  `review` row and as each *report* returns for an `edit` unit, not only at
  reconcile, `set` the unit's fields in `index.json` — `status`, `rounds`,
  and `commit` once it has one — each followed by its `log.mjs event row`
  per [the plan files](#the-plan-files) — and write the node's whole fact
  (wave, unit, model, round, outcome, detail, commit) to the **run journal**
  (room `runs`, drawer `<plan folder>`), in the fixed shape
  `execute-stages.md` defines. The unit fields, the `gaps` list, the
  `stages` and `git log` are what a resumed run reads after a pause **and**
  what the final report renders — so a field left unset under context
  pressure is work a resumed run repeats and a result the report cannot
  vouch for. The execute subagents
  file their own findings and gaps directly (rich detail bypasses your
  context) and recall them on fix loop-backs. Skip the journal silently if
  mempalace is down — the folder's `index.json` and the worktree commits are
  the record either way.

## Pause Conditions

These are the **only** stops before the final report. On any pause: ensure the
worktree is committed, append the folder's `gaps`, state precisely what
is needed, log the stop and end the action log per
[the action log](references/action-log.md), **emit the exact resume command**,
and stop — do not guess past it.
The resume command is always `/vwf:execute <folder>`, run by a person in a
fresh session — after a **resource-cap** pause too, where a bare `/vwf:handoff`
wrote the reserved `next` handoff first and `/vwf:recall next` may point the
person at that command but never launches it (this skill is not
model-invocable). The resume reads the folder's `index.json` and `git log`
first, the journal second, per the Resume check.

**Always on**

- **Hard halts** — no approved plan or, for a plan with `covers`, a missing
  blueprint for a needed slice; the test/coverage/build harness cannot run at
  all (TDD can't be verified) when a `code` unit is planned; a git or merge
  **conflict** that cannot be safely resolved.
- **Subagent death** — a stage subagent erroring twice in a row (after one
  re-dispatch) on the **same unit**. A reviewer that returned without its
  `REVIEW:` / `SECURITY:` block counts as an error here. Commit what is safe,
  record the unit as **blocked** (its `status` set `failed`, its `why` in the
  journal and in one `gaps` entry), and pause — never proceed on a dead
  stage.
- **Resource caps** — context > 65%, 5-hour > 90%, or 7-day > 80% (a repo may
  **tighten** these — never loosen — via `.config/vwf.yaml`
  `pipeline.execute_caps`; the hook honors the lower value). A command cannot
  measure its own context window — those figures reach the session only on the
  statusline payload — so this signal is **delivered by an external
  `PostToolUse` hook** that reads them and injects a cap directive.
  `claude-status` provides one
  (`brew install virajp/tap/claude-status`, **macOS on Apple silicon only**);
  for autonomous runs, install it or this pause will not fire — and on any
  other platform it cannot be installed at all, so plan long runs around a
  pause that will never arrive. On the injected cap directive: finish setting
  the unit fields for every report already in hand, commit what is green,
  invoke
  `plan-management status <folder> RUNNING "RUNNING — paused at unit <n> for context"`
  (the index row stays `RUNNING` — a pause is the folder's detail, not the
  queue's), run `/vwf:handoff` with no argument to snapshot state as the
  reserved `next` handoff, and stop with the launch line
  `/vwf:execute <folder>`. The person re-runs it in a fresh session;
  `/vwf:recall next` surfaces the handoff and the launch line but cannot
  invoke this skill.

  **The contract vwf states, for whoever provides the hook**: read
  `<cwd>/.config/vwf.yaml` → `pipeline.execute_caps` and apply it
  **tighten-only** (a value above the shipped default is ignored — config may
  lower a cap, never raise one), and name `/vwf:handoff` and
  `/vwf:execute <folder>` in the directive, since those are what make the pause
  resumable. vwf never
  invokes the hook and cannot detect its absence; a hook that skips the config
  read leaves `pipeline.execute_caps` a key nothing honors.

**Judgment**

- **All-blocking gap** — a blocking gap that halts **every** remaining unit (no
  independent work is left). Document it and pause. (An isolated blocking gap
  does *not* pause — skip + document + continue per the rules above.)
- **Non-converging cap-exempt finding** — a security or `[breaking-api]` finding
  that trips the convergence guard (the fix isn't holding, or keeps trading
  against another finding). These can never be downgraded to gaps, so the loop
  has nowhere to exit to. Pause with the finding, the rounds tried, and what
  each round changed.
- **Uncovered decision** — any decision the rules above and the folder do not
  cover that is irreversible or outward-facing, an ambiguous wave order the
  written order cannot settle, or blocking format drift. It is a
  blocking-gap stop: commit what is safe, append the gap, report the
  ruling the folder needs, and give the resume command. Never ask.

Everything else is decided from the rules — do not pause for routine approvals.
Destructive operations (`--force`, `reset --hard`, deleting files the run did
not create) are **refused**, never paused on.

---

## Recall (mempalace)

Per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, resolve the project **wing** and
recall prior decisions, plan rationale, findings, and unreconciled gaps for this
plan (rooms `decisions`, `planning`, `problems`, `gaps`) before the first unit.
Pass the wing to every subagent.

**Resume check.** On a `BLOCKED` or `RUNNING` folder, the folder's
`index.json` and the branch's `git log` are what the resumed run reads: each
unit's `status`, `commit` and `rounds` — which units are already `green` and
their commits, which unit is the first that is not, and, for a `review` row,
which round last returned and whether a late re-run is pending (a covered
unit's `commit` that is not an ancestor of the row's `range.to` — by
ancestry, not recency, each covered unit tested once — per
[blocking.md](references/blocking.md) step 4) — the `gaps` list, and the
`stages`, which say whether a plan-level stage already passed. Consult the
**run journal** (room `runs`, drawer `<plan folder>`) only when the folder
cannot be read. Then the Resume steps of
[blocking and resume](references/blocking.md): the worktree in the status
line must exist, the rulings a block asked for must now be in the plan, and
**the worktree is authoritative** — a unit whose `commit` is absent from the
branch is re-run, since the committed code is ground truth. Resume at the
first non-`green` unit; never re-implement a finished one. The earlier
attempt's fields stay; a unit run again continues its `rounds`. This is how
a run paused at a resource cap (`/vwf:handoff`, then `/vwf:execute <folder>`
in a fresh session) picks up where it left off. The resumed run's action log
is `log.mjs start --mode resume --folder <the worktree copy of the folder>`,
which appends a new `run.start` and `plan.snapshot` to the same file the
folder's `run.log` names; the log is never read to decide where to resume.

Per-unit recall continues inside the `code` pipeline, for `code` units only.
Skip every memory step silently if mempalace is unavailable.

## Setup

1. **Worktree.** Invoke `/vwf:git-workflow` to create the dedicated worktree,
   passing the declared preferences (isolate without prompting; branch from the
   repo's integration branch, named with the plan's name — the `<name>` of a
   change plan's `docs/plans/<date>-<name>/`, the `<slice>` of a cycle plan's
   `docs/plans/<date>-<HHMM>-<slice>/` — so `2026-10-24-plan-json-format`
   runs on the branch and worktree `plan-json-format`; commit-only, no
   post-commit prompt; never merge/push). That skill resolves which branch the
   integration branch is; this one never assumes a name. All subsequent work
   and commits happen here; **no unit gets `isolation: "worktree"`** — units
   in a wave own disjoint paths. Record the worktree path in the folder's
   status line.

   **Under an `all` override** — the dispatch prompt's overrides block names a
   `shared worktree: <branch>`, per
   [`all` and runner mode](references/all.md) — cut no worktree of the
   plan's name. When a worktree on that branch exists, reuse it: stop when
   it is not clean, then bring it up to date with a plain
   `git merge <integration branch>` run inside it — where the plan before it
   landed — and treat a conflict as the hard halt *Land* names: abort, keep
   the worktree, mark the folder `BLOCKED` with the conflicting files. When
   none exists, invoke `/vwf:git-workflow` with the same preferences, the
   branch named as given instead of with the plan's name. Record that path in
   the status line. Once the preflight below is green, append the one
   `overrides` entry the reference describes.

   **In a `multi-repo` product, which repo the worktree is of follows the
   linkage** — `/vwf:git-workflow` resolves it, and the two
   cases differ in a way worth knowing:

   - **`linkage: submodule`** — unchanged from every previous release. The
     worktree is of the **base** repo (the outermost superproject), and the
     members are populated inside it, so one tree holds both the code and the
     blueprint. Nothing here is cross-repo; the member's pointer commit is part
     of landing the branch.
   - **`linkage: siblings`** — the base repo's tree does **not** contain the
     members, so the worktree is of the **target member**, and the base's
     writes — Reconcile's `implementation:` stamps, and the docs unit's edits
     to the base's own docs — go to the base checkout as a second working
     tree. Commit the two separately, **base repo last**, so a half-finished
     run never leaves a doc claiming work that has not landed.
2. **Preflight (unattended — nothing here asks).** Doctor already ran before
   the claim, under *Run doctor before the claim* above, and its blocking
   findings already halted the run; this step reads the rest of its report.

   **When the plan has a `code` unit, read the LSP findings against the
   plan's `consent.lsp`** — everything else doctor reports is noted and
   carried into the run's gap list, not blocked on. A missing LSP server was
   a question at `/vwf:plan`'s stack gate, and its answer is
   `consent.lsp.<language>`; this run reads it and never asks: follow the LSP
   rule in [the `code`-unit preflight](references/preflight.md) when doctor
   reports one. On a plan of `edit` units alone, a missing LSP server is a
   journal detail and nothing more.

   Then run every line of the folder's `gates.unit` and `gates.wave`, in that
   order, once, from the worktree root — what is written and nothing
   inferred; a gate the plan does not name is not this run's to invent,
   however obvious it looks in the tree. `gates.plan` does not run here: it
   runs once, at the end. When a list is empty, say so in the journal and
   continue: when both are empty, the wave review is the only gate before the
   end. A red line here is the integration branch's,
   not the plan's: stop and report it as such — never start a run that would be
   blamed for a failure it inherited. Record the green preflight in the
   journal (`wave 0`, `preflight`).

3. **Stack conventions — only when the plan has a `code` unit.** Fetch
   the `conventions:` prose for every template this plan's projects pin, per
   the *Stack conventions* section of
   [the `code`-unit preflight](references/preflight.md) — once for the whole
   run, deduped per (repo, slug), with its two distinguishable halts. A plan of
   `edit` units alone skips this step, said in the journal.
4. **Wave order.** Read the folder's `units`, build the sequence from each
   entry's `wave`, `depends_on` and `kind`, and record the sequence you will
   execute. Every unit reads `pending` at approval; no field is written ahead
   of its unit. **Open the run journal** in mempalace (room `runs`, drawer
   `<plan folder>`) with that ordered sequence; with `covers`, the journal
   also records the `requires` check's result per prerequisite. The loop sets
   the unit fields and writes a journal entry per node or report, per
   `execute-stages.md`; the folder is both the resumable record and what the
   final report renders.

## Waves (loop over waves, no human gates)

Each `units` entry carries a `kind` — `code`, `edit` or `review`, per
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md` — and it is the switch.
Each unit's dispatch prompt carries its `owns` list from `index.json`, which
its file no longer repeats, and runs on its `model` — through
`pipeline.models`, as the shared stage rules say.
For each wave in `wave` order, skipping units already `green` on a resume —
its `waves` entry set `running` as it starts and `green` or `failed` before
step 6's closing folder commit, per *The plan files*:

1. **Run the `review` rows first** — each `review` row in the wave, one at a
   time, before anything in the wave is dispatched, so the engines see a
   committed tree and nothing in flight: every unit a row covers sits in an
   earlier wave and is committed, which preflight guaranteed. Per
   [review-unit.md](references/review-unit.md): the range since the previous
   green row's main loop or the branch base, the two engines filtered to it —
   the security engine alone on a row that covers `edit` units alone —
   both reviewers concurrently, each finding mapped by the commit that last
   touched its file and that unit re-dispatched by kind, the next round run
   engines first over those fix commits alone, under the round cap and the
   convergence guard. The row's fields set and a journal entry written per
   node as it returns. A wave with no `review` row runs no engine.
2. **Dispatch the `edit` units** — every `edit` unit in the wave, in one
   message, per [edit-unit.md](references/edit-unit.md)'s dispatch; wait for
   every report; a journal entry per report as it arrives, one re-dispatch on
   an agent error, then `failed`. Set each unit's `status` and `rounds` as
   its report is read.
3. **Run the `code` units** — each `code` unit in the wave, one at a time, per
   [code-unit.md](references/code-unit.md): recall, the coder under TDD to the
   coverage gate, gaps, the unit's commit, persist and journal. The unit's
   fields set and a journal entry written per node as it returns. The next
   `code` unit starts only when this one's commit is written or the unit is
   recorded `blocked`.
4. **Wave review**, per [edit-unit.md](references/edit-unit.md)'s reviewer
   section, for every wave whatever its units' kind: one reviewer subagent over
   the wave's diff against the unit files, scoped to the contract — rulings
   honoured, Owns respected, cross-unit drift, docs falsified — never a `code`
   unit's code quality or security, which are the covering `review` row's.
   Findings loop back to the owning unit, at most two rounds, under the
   convergence guard. Every round is a journal entry. The prompt also carries
   the unit files and `owns` lists of every unit a `review` row in this wave
   re-dispatched, whose fix commits count against those units' Owns. A unit
   of either kind
   fixed here after the last `review` row covering it marks that row for a
   late re-run, taken at step 7 — *Late loop-backs re-run the last row* in
   [review-unit.md](references/review-unit.md).
5. **Unit gate, then wave gate**, run by the orchestrator once every unit of
   the wave has returned: for each green `edit` unit, in wave order, every
   line of `gates.unit` — a `code` unit ran its unit gate inside its
   pipeline — then every line of `gates.wave`, once,
   plus every report read for `UNRESOLVED:`. A unit that returned
   `UNRESOLVED:` or `failed`, and every unit that depends on it, is **skipped**
   per [blocking and resume](references/blocking.md) — a skipped `review` row
   takes every later `review` row and every later `code` unit one covers with
   it, as that reference states; the rest of the run
   continues. A red gate line no skipped unit explains is attributed to the unit
   whose Owns covers the failing path and handled as that unit's failure; one
   that cannot be attributed marks every unit in the wave `failed` with the gate
   line as detail.
6. **Commit** the green `edit` units, one commit per unit in wave order, per
   the staging discipline in the Autonomous Rules. A `code` unit was committed
   inside its pipeline, on the same discipline, and a `review` row has no
   commit of its own — its fix commits belong to the units fixed; the
   folder's edits — the unit fields, the `gaps` entries, the `stages` — ride
   the unit commits as they are written. A unit's own `commit` is set after
   its commit, so it rides the next one. Then, whenever the folder still
   holds uncommitted edits after the last unit commit — always the case after
   a wave's last unit commit, and for a wave that produced no commit, a clean
   `review` row alone — the orchestrator closes the wave with its own commit
   of the folder and nothing else, `docs: plan state — <folder> wave <n>`, so
   the folder on the branch never lags what ran.
7. **Late re-runs** — for each `review` row step 4 marked, now that the tree
   is committed: the re-run per *Late loop-backs re-run the last row* in
   [review-unit.md](references/review-unit.md), then the one contract review
   `R<wave>-late` over the re-run's fix commits — one round outside the wave
   review's cap, one loop-back, a second recorded `contested`, as that
   reference states — then every line of the wave gate again and a closing
   folder commit as in step 6.

The two fixed final units — the docs unit and the gates unit — run as
their own waves after every other wave, after the Acceptance & UX pass and
after Reconcile; see *The fixed final waves* below.

## On failure

The run **skips what a failure blocks and keeps going** with what it does not,
then stops once at the end with every ruling needed — never mid-wave, and never
with "how should I proceed". The exact semantics — isolated versus all-blocking,
the mechanical re-dispatch, what the status line records, and how a re-run
resumes — are [blocking and resume](references/blocking.md).

## Acceptance & UX (once, after all unit waves)

With `covers`, when every unit wave is done (or skipped per the gap rules),
run the `acceptance` and `ux` stages back to back per the contracts in
`execute-stages.md` — skip each (its `stages` entry set `skipped` with its
`why`, never silent) per its condition: acceptance when the folder's
`acceptance` list is `[]` — no flow touched — ux when the plan
changes no screens in a UI project. On anything short of a clean pass, follow
the autonomous policy in [acceptance & ux](references/acceptance-and-ux.md) —
the loop-to-`code` rule and its 4-round cap under the convergence guard, the
`n/a` cases, and the spec-gap routing. Two rules hold whatever it says: a
residual is **never silently dropped**, and infrastructure is **never
scaffolded beyond the plan's own units**. Every loop-back here lands after the
last `review` row: each fix re-runs the row covering its unit over the fix
delta before the stages re-verify — *Late loop-backs re-run the last row* in
[review-unit.md](references/review-unit.md).

**Keep the renders.** After the ux stage's last round, before the landing, take
the `RENDER: <project> <code> <platform> <state> <file>` lines that round's
reviewer returned, set `stages.renders` `running`, and run the script once
per project the stage reviewed, piping each run, on stdin, only the lines whose first field is that project:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/mockups/scripts/renders.mjs --worktree <worktree> --main <main checkout> --project <project> --plan <folder>
```

It copies each image into the main checkout's
`docs/scratchpad/<project>/renders/<platform>/<route>/` — `index.png`, or
`index--<state>.png` — overwriting only the screens and states it was given,
and records them in that platform's `__renders/renders.json`, pruning there
each entry, and its image, whose code left the platform's route map or whose
route changed. A line it cannot
copy — another project, an unknown code, a missing or non-PNG file, a failed
copy — is one `SKIPPED:` stdout line; the rest are copied, and stdout ends with one
`COPIED: <n>` line. Set `stages.renders` — `state` `green`, `detail` the
`COPIED:` count and each `SKIPPED:` line — and write the same to the
journal. With no `RENDER:` line, or `RENDERED: n/a`, run no copy:
`stages.renders` reads `skipped` with that reason. The copy
writes only into the main checkout's gitignored `docs/scratchpad/` — it is not
a git edit, and it never blocks the landing: a non-zero exit of the script is a
gap, recorded with its stderr, and the run continues.

Without `covers` both stages are skipped — `stages.acceptance`,
`stages.ux` and `stages.renders` each set `skipped` with that `why`,
journaled — a plan with no blueprint slice has no acceptance criteria and no
Screens contract to verify against.

Record both stages in `stages` with `plan.mjs set` — `stages.<stage>.state`
`running` as each starts, then `green` or `failed` as each execution returns, with its result as `detail`,
and `skipped` with its `why` when the condition didn't hold — and write each
to the journal. A resumed run reads `stages` to know whether they already
passed, and runs a stage that reads `green` or `skipped` no more; the report
states each skip from its `detail` rather than from recollection.

## Reconcile (in the worktree, before the fixed final waves)

Reconcile runs **before** the docs unit's wave, so that unit's delta is complete
— the human docs are the docs unit's, not this step's; this skill runs no
docs-sync of its own.

1. **Architecture, environment, harness & implementation stamps — with
   `covers`.** Reconcile per the Reconcile section of
   `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md` — the registry block for any
   topology change, `environment.md` for any new secret/env var, the
   `.config/vwf.yaml` `harness:` block for any capability the run added, and
   the **`implementation:` stamp** on each blueprint doc in the plan's
   `covers` list (the single sanctioned blueprint edit — state only, per the
   stage rules) — committed in the worktree like every other unit. A plan
   without `covers` skips this step whole, journaled as skipped.
2. **Persist — when the plan has a `code` unit.** Per
   `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, store the run's durable decisions,
   resolved findings, and each gap to mempalace (rooms `decisions`, `problems`,
   `gaps`). Skip anything a doc already captures. Most per-unit decisions were
   already persisted in the `code` pipeline — here, fill only what is missing.
   A plan of `edit` units alone has nothing to persist here: an `edit` unit's
   decisions are in its file and the run journal.
3. **Set `stages.reconcile`** — `running` as step 1 starts — then `state`
   `green`, or `skipped` with its
   `why`, and a `detail` naming what ran and the Reconcile commit's hash,
   which is what lets a `review` row's commit map exclude it — and write the
   same to the run journal (room `runs`, drawer `<plan folder>`). It is set
   for every plan.

### The fixed final waves

The two fixed final units run as their own waves, in this order, and **only
when no unit is skipped**: the docs unit invokes `vwf:docs-sync` over the run's
branch delta — its standalone mode,
`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` — and applies its findings
plus every `DOCS FALSIFIED:` line the units returned; the gates unit runs the
generators the plan names and passes the full wave gate. It bumps no version:
a release level is recorded at the landing, in `.config/releases.yaml`, and
the version is bumped by the release step a person runs. Each runs the wave
loop above in full — dispatch, wave review, unit gate, wave gate, commit.
Then run every line of the folder's `gates.plan` once over the finished
tree — every line of `gates.wave` once more when `gates.plan` is empty — and
every entry of `gates.keeps`, its `check` held to its `pass` — those are the
checks a diff cannot prove — before calling the run green; each is a journal
entry (`wave —`, `reconcile`). A red plan gate line is
attributed and handled as a red wave gate line is, and the gate runs again
once its fix is committed.

## The final report

Before landing, **render the report from the record** — the folder's
`index.json` (`units`, `gaps`, `stages`, `release_levels`), the branch's
`git log` and the run journal — not from memory: by now the run may have
spanned dozens of dispatches, a compaction, or a resource-cap handoff, and
the record is the account that survived all three intact. Read
`plan.mjs get <folder>/index.json` back and present:

- every unit with its `status`, `rounds`, `model`, `commit`, and any
  `skipped` or `failed` reason — for a `review` row, every node beneath it
  with its round and outcome, from the journal, the units its findings
  re-dispatched, and each late re-run's rounds beside the main loop's, per
  [review-unit.md](references/review-unit.md); round counts are **read from
  the fields**, never recalled
- every entry of `gaps` the units returned, with the assumption each
  proceeded on — including every Owns the orchestrator widened at run time,
  with the finding that caused it
- the review findings that survived the cap, marked `contested`
- **model downgrades**, named on the nodes that ran under them
- the unit gate, wave gate, plan gate and orchestrator gate results
- the release levels recorded — the folder's `release_levels` entries, and,
  once the landing has written them, each key it raised in
  `.config/releases.yaml`, from and to; or the one line *old-shape folder — no
  release levels recorded* for a folder whose `release_levels` is `[]`
- the worktree path
- the action log's path — the folder's `run.log` — and its
  `log.mjs summary`, which reports each run of the plan (one `run.start` to
  the next, the pause between them not counted) and the totals: the phases,
  the agents and the parallel factor, the gates by tier
- each after-landing step and its outcome, once After landing has run

With `covers`, also:

- **coverage** vs the configured target, and the **acceptance** (per-criterion
  pass/fail) and **ux** (findings + a11y) results — each from its `stages`
  entry and the journal, or its `skipped` entry's `why`
- **the renders kept** — from `stages.renders`: the count per platform and
  the line "review them with `/vwf:mockups renders`", or, when it reads
  `skipped`, its reason and no review command
- **the implementation stamps written** — each `covers` doc and the state it
  was set to, with why anything is short of `complete`
- **the consolidated gap list** — the `open` entries of the folder's `gaps`,
  plus one line counting the `closed` ones — marking which came from a
  **cap** and
  which from the **convergence guard** — they point reconciliation at different
  places

Fall back to the run journal only when the folder cannot be read — say so
plainly and mark the report **reconstructed**. Whoever reads it needs to know
whether they are reading a record or a recollection; a reconstructed report is a
valid thing to land on, an undisclosed one is not.

If any unit is `skipped`, `failed` or `unresolved`, this report is the block
notice and the run stops here with the status set to `BLOCKED`.

## Land

With every unit `green`, every unit gate, wave gate and plan gate line and
every orchestrator gate passed, and
the gap list holding no blocking gap, prepare the landing commit:

1. Read `consent.merge` — *merge to the integration branch and push on
   green*, `true` read as `yes` and `false` as `no`. Under an `all` override
   reading `land: yes`, read `yes` in its place — `consent` itself is never
   edited.
2. **The status.** In the worktree, invoke
   `plan-management status <folder> COMPLETE "COMPLETE <date> — <commits>"`
   on `yes`, and
   `plan-management status <folder> RUNNING "RUNNING — ready to land by hand on <branch>"`
   on `no`.
3. **The folder.** On `yes`, when the gap list is **empty** — no `open`
   entry, whatever number of `closed` ones — invoke
   `plan-management archive <folder>` in the worktree, with the declared
   preference **do not ask** — on any completion warning the verb raises, the
   folder is **not** archived: it stays live at its path, the backlog split
   below is made instead, the folder's `status` still reads `COMPLETE`, the
   row still goes `COMPLETE` at the merge, and the final report names the
   warning and the `plan-management archive <folder>` request to make once it
   is settled. Archived, it moves the folder to `docs/plans/archived/`, leaves
   the `COMPLETE` status as written, closes the `backlog` ids through
   `/vwf:backlog done` and records the `backlog_pieces` ids through
   `/vwf:backlog partial`, marks the run's mempalace drawer archived, and
   edits no row, since the index never rides a run branch. The folder is
   finished and the archive is its record. When any gap is **open**, or on
   `no`, `archive` is not invoked — and when it warned, it archived nothing:
   the folder stays live at its path — as the working record of what needs
   reconciling, or for the hand merge — and the same split is made here
   instead: when the folder's
   `backlog` names ids, invoke `/vwf:backlog done <ids> <folder>`, and when
   its `backlog_pieces` names ids, invoke
   `/vwf:backlog partial <ids> <folder>` — that skill is the only writer of
   the backlog project, and its edit touches nothing in the tree. Either way,
   commit all of it as one final `docs:` commit in the worktree.

Then act on that consent:

- **yes** → hand off to `/vwf:git-workflow` step 4, *merge, push & clean up*,
  **with the declared preference that consent was recorded in the plan — do
  not ask again**. Under an `all` shared-worktree override the option is
  *merge, push & keep worktree*: the next plan reuses it, and the loop's exit
  removes it unless the run ends on a `STOPPED` plan. A merge conflict is a
  hard halt: abort, keep the worktree,
  invoke `plan-management status <folder> BLOCKED "<the conflicting files>"`
  there, report the files. When step 4 returns from the merge and push,
  invoke `plan-management complete <folder>` in the main checkout — it sets
  the row's `status` `COMPLETE` and its `gaps` to the count of `open`
  entries in the consolidated gap list, re-points its `folder` under
  `archived/` when step 3 moved the folder and leaves it at the live path
  otherwise, and runs the sweep, per
  the contract's *Writing a row — the completion* and *The sweep* in
  `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`.
  Before that commit is made, make the **release-levels write** below in the
  same checkout, right after `complete` edits the row. That is the commit
  `docs: plan queue — <folder> complete`, on the integration branch, in the
  main checkout, carrying the row and the raised levels together; a rejected
  push re-applies the same row and the same raise until it lands, and never
  re-picks.
- **no** → stop with the worktree path and the branch name, and say the branch
  is ready to land by hand. Say too that the index row stays `RUNNING` until
  the hand merge is followed by asking the session to archive the folder —
  `plan-management archive <folder>`, run in the main checkout, which moves
  the folder and applies the same row edit and sweep — and that no typed
  command does this. Ask nothing further.

**The release-levels write — on a merged landing only.** The run bumps no
version; it records how far each project it changed must move, and a release
step a person runs later bumps, tags and clears the key. `plan-management`'s
verbs never commit, so this skill, the caller that owns the completion commit,
writes the file itself: in the main checkout, on the integration branch, after
the merge, right after `complete` edits the row and before the commit:

1. Read the folder's `release_levels` —
   `plan.mjs get docs/plans/archived/<basename>/index.json release_levels`
   when step 3 archived it, at its live path otherwise. An empty list, `[]`,
   is the old-shape case, which only a migrated folder can have: write
   nothing, and the final report says *old-shape folder — no release levels
   recorded*.
2. Read `.config/releases.yaml` — one key per project, each `NONE`, `PATCH`,
   `MINOR` or `MAJOR`. An absent key reads `NONE`; an absent file reads every
   key `NONE`.
3. **Raise, never lower.** For each entry, the order is
   `NONE < PATCH < MINOR < MAJOR`: when the entry's `level` is higher than the
   key's current value, set the key, named by the entry's `id` (the project),
   to the entry's `level`; otherwise leave it. `PATCH` after `MAJOR` stays
   `MAJOR`, and a `NONE` entry changes nothing. Only the release step clears
   a key.
4. When a key changed and the file is absent, create it with this two-line
   header comment above the keys:

   ```yaml
   # Pending release levels, written by /vwf:execute at landing.
   # Each key is cleared by the release step that releases the project.
   ```
5. When a key changed, stage `.config/releases.yaml` together with
   `docs/plans/index.json` into the one `docs: plan queue — <folder> complete`
   commit, by the procedure *Writing a row* in
   `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`.
   **This commit is the one exception to that procedure's staging step,
   "that file alone"**: the completion commit carries the levels file too,
   and nothing else. When nothing changed, the commit carries the row alone.
   There is no separate release-levels commit.
6. On a rejected push whose rebase conflicts, the procedure drops the commit
   and pulls; restore `.config/releases.yaml` from the new tip as it restores
   the index, then re-apply both — the row, and the levels from step 2,
   re-read at the new tip and raised again — and push again. Two runs landing
   at once thus both keep the higher level.

Writing on the integration branch after the merge, never on the run branch,
is what keeps two concurrent runs from conflicting on the file at merge time.
When the branch did **not** merge — `no`, or a merge conflict — nothing is
written.

**The graph refresh — on a merged landing only.** Once the
`docs: plan queue — <folder> complete` commit is pushed, run
`mise x -- mise run code:graph` in the main checkout, on the integration
branch, and wait for the task to exit. The task starts the graphify rebuild in
the background and returns, and that is by design: wait for the task, never
for the rebuild. Under `all` this runs after each plan's landing, before the
next plan starts, so each plan reads a graph started after the last merge. A
repo whose `mise tasks ls` lists no `code:graph` skips the step silently. A
non-zero exit is reported in the final report and stops nothing. When the
branch did not merge, the main checkout did not change, and the step does not
run.

When any landing condition fails — a red gate line, a unit that is not green,
a blocking gap → **stop at the report** with what failed and the exact resume
command, `/vwf:execute <folder>`. The worktree stays committed and nothing
merges; the folder's status reads `BLOCKED` with the detail. The report lists
each failed condition — the gate line, the unit and its outcome, the blocking
gap — and the run ends there, asking nothing. A fix goes into the folder — a
ruling into the unit file or one `append` to `decisions`, a finding appended
to the unit file — and the person re-runs `/vwf:execute <folder>`, whose
resume loops the affected units back through their pipeline per
[blocking and resume](references/blocking.md).

**Gap reconciliation (after the landing) — with `covers`.** Whatever the
landing decision, list each gap in the consolidated gap list with the command
that closes it, and offer nothing — **never silently rewrite either doc**:
blueprint holes → `/vwf:blueprint` (the sweep re-stamps coverage); plan holes →
`/vwf:plan` to re-derive the slice against the now-updated blueprint. Whoever
closes a gap notes its resolution back into the `gaps` room so a later cycle's
recall sees it as closed, and sets the entry's `state` to `closed` with the
ruling. Say too that once no entry reads `open`, the folder that
stayed live is retired by the `plan-management archive <folder>` request,
which the person makes in prose, never by a typed command.

**Chain forward — with `covers`.** Scan the `plans` list of the base repo's
`docs/plans/index.json` — not a walk of the members, most of which are not
cloned here — for rows whose `requires` names the folder just completed. For
each one
now unblocked (`plan-management resolve <that folder>` returns *runnable*, per
the contract's *Resolution* in
`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`),
print its launch line, `/vwf:execute <next-folder>`, for a fresh context: a
fresh session, or a runner that `all` dispatches — and launch nothing.

## After landing — every step runs as the plan recorded it

Read the folder's `after_landing` list. Every entry carries the `mode`
`run`, decided at the planner's interview and written there. On a **green
landing** — the branch merged and pushed per `consent.merge` — each entry's
`step` runs in list order from the main checkout, with no prompt: the `run`
recorded in the folder is each step's authorisation, consented at the
interview that wrote it. No step releases: a release is always a step a
person runs by hand, `/release` or the repo's own, and the landing has only
recorded its level. An empty list runs no plan step and is said in one
clause. A mode other than `run` never reaches here: `validate` refused it,
on a fresh run and a resume alike.

**The repo's default steps.** After the plan's own steps, read
`.config/vwf.yaml`'s optional `after_landing:` key — a list of commands the
user keeps by hand — and run each, in list order, as a `run` step on the same
terms: same authorisation, same report, same failure rule. A command the
plan's own list already ran is skipped, so it runs once. An absent key, or
an absent file, adds no step.

**Under an `all` override**, a step — a plan step or a default step alike —
whose command the block names under `skip as deduped` does not run here: it
is reported as deferred to the loop's exit — *skipped (deduped)* — recorded
in the run journal, and the remaining steps run in order without it. It is
neither a failure nor a step not run.

When the branch did **not** merge — the landing was not consented, or was
consented and the merge hit a conflict (the hard halt of the `yes` branch
above — the folder's status reads `BLOCKED` with the files) — **no step
runs**, plan step or default step: a step's authorisation was for a green
landing, and this is not one.
The report lists every step with its command, to run by hand after the hand
merge. The orchestrator runs the steps, never a unit — a step may mutate the
machine rather than the tree under review, and a unit never reaches outside
the worktree.

Each step is reported with its outcome:

- **Ran.** Say what it did in the step's own terms. A step whose `notes` say a
  **restarted** session is needed for its effect is reported with that sentence
  — this session already loaded what the step replaced.
- **Exited non-zero.** Report the failed step, its exit code and its output
  verbatim, and stop: the remaining steps do **not** run, since a step after a
  failed one may assume its effect, and the report names each step not run
  with its command. Never work around it. A step that refuses is usually a
  fact about the machine rather than a failure of the run, and the plan named
  that step, not a substitute for it.

Then end the action log — `end --outcome complete`, or `ready` when the branch
was left to land by hand — per [the action log](references/action-log.md).

## What does not stop the run

The plan is approved and every ruling is in the folder. The run does **not**
pause to re-ask a ruling, confirm a unit's scope, report progress between units
or waves, ask whether to continue after a green gate, ask before a commit, ask
before the claim or the landing row, ask about a missing LSP server, or ask
what to do about a gap or a `GAP:` — a gap is recorded and the stated
assumption stands until the final report — or ask before it copies the ux
renders into the main checkout's scratchpad. It stops at the Pause Conditions —
an inherited red preflight, a merge conflict, a resource cap among them — and
at the final report, nowhere else, and at neither does it ask: each stop is a
report with its resume command. Everything else is recorded in the folder's
`index.json` and the run journal, and answered at the end.

## What this skill never does

- Reads a unit's owned files itself, or does a unit's work inline because it
  looks small
- Dispatches a wave whose predecessor is not green or explicitly skipped
- Runs two `code` units' pipelines at once, a `review` row beside a `code`
  unit's pipeline, or an engine anywhere but at a `review` row — and never
  infers a `review` row the folder's `units` does not write
- Bumps a version, ever — the landing records a release level and a release
  step a person runs bumps it; runs a generator outside the gates unit — a
  consented after-landing step is the one exception, and it is the
  orchestrator's because it may write outside the worktree
- Lowers or clears a key in `.config/releases.yaml`, or writes it anywhere
  but the release-levels write on a merged landing
- Asks the user anything at run time
- Writes a lock file — the file a package manager or a toolchain manager
  writes to pin what it resolved — with Write, Edit, `sed` or a script, or
  lets a unit do it: a lock file changes only as the output of the CLI that
  owns it, per the unit contract in
  `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`, and a gate fix or a
  landing that needs a new lock file runs that CLI
- Runs an after-landing step on a landing that was not green, or merges past
  the integration branch
- Edits `docs/plans/index.json` or a folder's `status` itself — every such
  edit is a `plan-management` verb, the index one and the claim's `run` edit
  only in the main checkout, and never a row but its own plan's and the sweep
  the landing's `complete` applies
- Edits or removes a line of the action log — it is append-only; a resume
  appends a new `run.start`, which supersedes the earlier run
- Rewrites a folder's `index.json` whole, or edits it with anything but one
  `plan.mjs set` or `append` per change
- Calls `plan.mjs rewave`, or renumbers a folder's waves any other way —
  waves are the planner's
- Takes a `RUNNING` row, however stale, or invokes `unclaim` — the person's
  own `plan-management unclaim <folder>` request, once its worktree is gone,
  is the only release
- Edits the backlog itself, or lets a unit do it — `/vwf:backlog` owns the
  project, and the landing calls it, `done` for `backlog` and `partial` for
  `backlog_pieces`
- Edits a blueprint doc beyond the `implementation:` stamp, or runs a
  blueprint-bound step on a plan without `covers`
- Runs a gate the plan's `gates.unit`, `gates.wave` or `gates.plan` do not
  name, skips one they do, or runs a line twice at one point
- Picks up an item from *Out of scope* or *Parked*, however adjacent
- Runs on a repo or a folder in the old plan format, or migrates one itself
- Reports the run from recollection when the folder's `index.json` can be
  read
