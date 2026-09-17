---
name: execute
description: Execute an approved plan folder — a cycle plan from /vwf:plan or
  a change plan from /vwf:change-plan — to completion in a dedicated worktree,
  in a fresh session. The one executor for every plan folder, reading each
  unit's Kind from the Units table; a code unit runs TDD, coverage and its
  commit one unit at a time, the edit units of a wave are dispatched together
  and judged by the wave review, and a review row runs the code and security
  engines and reviewers over the branch delta the row covers; the acceptance
  and UX pass and the blueprint reconcile run when the plan has a covers list.
  It claims the plan's row in docs/plans/index.md, keeps a run log the final
  report renders, lands per the plan's recorded consent — archiving the folder
  when no gap is open — and runs each after-landing step on the mode the plan
  recorded, run or ask.
  Invoke as /vwf:execute <plan-folder> or /vwf:execute next — the latter reads
  docs/plans/index.md alone and picks the runnable plan of highest priority,
  of either kind. Requires an approved plan folder in docs/plans/.
argument-hint: "<plan-folder, its index.md, or next>"
model: opus

disable-model-invocation: true
---

# execute — Run an Approved Plan to Completion

Implement an approved plan **to completion, autonomously**. The plan folder is
the contract and its `index.md` is the only input: every ruling, consent row,
unit scope and gate line the run needs was written there by `/vwf:plan` or
`/vwf:change-plan`, and this skill reads it rather than re-asking it. The
orchestrator **decides, reviews and verifies, and never reads unit work
inline**: every edit is a subagent's, so this session's context stays the size
of the reports. The Units table's `Kind` column is the switch, and it takes
three values: a `code` unit passes code under TDD to the coverage gate and its
commit; an `edit` unit is dispatched with the other `edit` units of its wave
and judged by the wave review; a `review` row — the planner placed it, by
default once after the last code unit — runs the two review engines and the
two reviewers over the branch delta since the previous review row, with
findings looped back to the owning units' coders before it counts as done.
Acceptance and UX conformance run once after all units when the plan has
`covers:`. There are **no per-stage human gates** — decisions come from the
**Autonomous Rules** below, and the run stops only at the **Pause
Conditions**, at the **final report** when something stands in the way of the
landing, and once before each after-landing step whose recorded mode is
`ask`. You own the orchestration and dispatch the five stage subagents —
`execute-coder` for `code` units, `execute-code-reviewer` and
`execute-security-reviewer` at `review` rows, `execute-acceptance-verifier`
and `execute-ux-reviewer` once per plan — the unit agents for `edit` units,
and the wave reviewer for every wave.

Run it in a session that has done nothing else. It cannot check that, so the
plan's launch line says it and this skill trusts it.

Adopt the **Autonomous delivery driver** persona: keep moving, decide from the
rules, isolate all work in one worktree, document what you can't resolve, and
land only what the plan's Consent block already authorised.

## References

The rules that hold on every run — the halts, the pause conditions, the
autonomous rules — stay here. The three pipelines and three conditional
branches load on demand, each named where it applies — never upfront.

| Reference                                                   | When to read                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [One `code` unit](references/code-unit.md)                  | the Waves section, when a wave holds a `code` unit — TDD, coverage, commit                             |
| [`edit` units and the wave review](references/edit-unit.md) | the Waves section, when a wave holds an `edit` unit, and every wave's review                           |
| [One `review` row](references/review-unit.md)               | the Waves section, when a wave holds a `review` row — the engines, both reviewers, the findings loop   |
| [Blocking and resume](references/blocking.md)               | On failure — what a failure skips, what it blocks, how a re-run picks up                               |
| [The `code`-unit preflight](references/preflight.md)        | Setup steps 2 and 3, when the Units table holds a `code` unit — the LSP rule and the conventions fetch |
| [Acceptance & UX](references/acceptance-and-ux.md)          | when `covers:` is present and the acceptance or ux stage returns short of a pass                       |

## Halt Conditions

### 1. Resolve and refuse early

**`next`.** When `$ARGUMENTS` is `next`, run *Reading the queue* in
`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`: the candidates are every
`APPROVED` row whose requirements are satisfied, `cycle` or `change` alike —
there is no Kind filter. On a pick, print the folder taken, its `Kind` and its
`Priority`, and every other `APPROVED` row with why it was not taken — a lower
priority, or the requirement it waits on. Ask no confirmation: the session is
meant to run unattended. Then continue below as if that folder had been named.
Nothing runnable → stop with the message that procedure prints: each `APPROVED`
row and what it waits on, or that the table is absent or holds no rows.

**Finding the plan.** A plan folder lives in **the repo whose code it changes**
— a change plan's is the base's — and the one table of `docs/plans/index.md` in
the base repo lists every one with its target repo
(`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`; the file's shape is
`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`). Read the index rather than
walking the members — under `multi-repo` most of them are not on this machine,
so a walk would report the product's plans as a function of what happens to be
cloned. Halt if no approved plan exists: "No approved plan found. Run
`/vwf:plan` or `/vwf:change-plan` first."

**Halt if the target repo is absent.** Offer the consent-gated clone first; on
decline, **stop**. Unlike `plan` and `doctor`, there is no honest partial
result — you cannot write code into a repo you do not have.

**Read the folder.** Resolve `$ARGUMENTS` to `<folder>/index.md` — a folder
shaped by `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`; `execute`
reads folders only, and a single-file plan from an earlier release is not an
input (finish it on the release that wrote it, or re-plan it). Read the
frontmatter — `type:`, `covers:` when present, `requires:`, and `backlog:` (the
ids the landing hands to `/vwf:backlog`, empty or absent when the plan covers
no backlog item) — and the **Status**, **Consent**, **Units** and **Run log**
blocks. Hold two facts from this read for every gate below: **has `covers:`**
— a cycle plan, whose blueprint-bound steps run — and **has a `code` unit** —
one or more Units table rows whose `Kind` is `code`. Three refusals are read
off the folder here, before the claim, each stopping the run with the fix —
amend the row and re-approve the plan — since execute runs what is written and
infers no row. **A `code` unit no `review` row covers** — a row covers a unit
when its Depends on names it, directly or transitively through units it names
— naming every uncovered unit. **A `review` row placed wrong** — its wave is
not strictly greater than the wave of every unit it covers (a row reviews a
commit range, and a unit in its own wave is committed after it runs), or its
Depends on omits a `code` unit in an earlier wave than itself that no earlier
`review` row names (the range would carry that unit's commits while the
coverage would not, so the row's range and its coverage must agree) — naming
the row and the unit. **An After landing table with no *Mode* column, or
a step whose mode is neither `run` nor `ask`** — stops the run the same way:
the planner that wrote it re-records the step; a section reading `none`, with
no table, is valid and exempt. Then read the folder's **row**
in the base repo's `docs/plans/index.md`, at the integration branch's tip, the
way that asset's *Reading the queue* reads it. Then:

- Status `DRAFT` → stop: "not approved; run the planner that wrote it to finish
  it" — `/vwf:plan` for `type: vwf-plan`, `/vwf:change-plan` for
  `type: vwf-change-plan`.
- Status `COMPLETE` → stop: nothing to do.
- Any `requires:` entry unsatisfied — by the test its kind takes, per that
  asset's *Resolution*, matched by basename → stop and name it. A **cycle**
  entry is satisfied when every `covers:` doc of the required plan reads
  `implementation: complete` **in the base repo's blueprint** — the blueprint
  is where the stamps live, so this resolves even when the upstream plan's own
  repo is not cloned here; its index row is not the test. Halt with:

  > "Prerequisite plan `<folder>` has not been executed and merged (`<doc>` is
  > `implementation: <state>`). Run `/vwf:execute <folder>` first."

  No override flag — if reality differs from the stamp, heal it via
  `/vwf:plan` (its stamp-heal offer) or amend the blueprint via
  `/vwf:blueprint`; never guess past the halt. Because stamps land in the
  merged Reconcile commit, an executed-but-unmerged prerequisite correctly
  halts too. A **change** entry is satisfied by the row test: a `COMPLETE`
  row, or a folder under `docs/plans/archived/` with no row; say "run
  /vwf:execute <that folder> first" when it is `APPROVED` and "another session
  is running <that folder>; wait for it to land" when it is `RUNNING`. An
  entry that resolves to nothing → "<entry> is neither in the plan index nor
  archived; fix the `requires:` line by hand".
- Status `APPROVED` with no row at all → stop: "not in the plan index; re-run
  the planner's hand-off, or add the row by hand".
- Status `APPROVED` with a `RUNNING` row → a claim another session holds. Stop
  and name it: the row is resumed only by the session that holds it, or claimed
  afresh after a hand reset of the row to `APPROVED`, committed on the
  integration branch.
- Status `BLOCKED` or `RUNNING` → a **resume**, per the Resume check under
  Recall below and [blocking and resume](references/blocking.md): the worktree
  named in the status line exists, and the run starts at the first unit that
  is not `green`. The ruling a block asked for must now be in the plan — if the
  status line still reads the same `UNRESOLVED:`, stop and say which ruling is
  missing. The row is expected to read `RUNNING` already, and is left alone; a
  row reading `APPROVED` is a hand reset, and the run claims it again below.
- Status `APPROVED` with an `APPROVED` row → a fresh run.

The folder arrives **already committed** on the integration branch — the
planner commits and pushes it at hand-off — so the worktree Setup step 1 cuts
sees it from its first commit. A folder that is not on that branch is refused,
not swept into a unit commit: stop and say to run the planner again on it, or
to commit and push it by hand, then re-launch.

**Claim the row.** Before the worktree is cut, and before the folder's own
Status is touched, run *Writing a row — the claim, and the completion* in
`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` with the row set to `RUNNING` —
the commit `docs: plan queue — <folder> running`, pushed on the integration
branch. The row's `Status` cell is the only cell that changes; `Kind` and
`Target repo` are never edited. This is the **one** edit the run makes in the
main checkout, and it is made there on purpose: the pushed row is what another
session's `next` reads, so a claim that lived only on the run branch would
claim nothing; and the run branch must never carry `docs/plans/index.md`, or
two plans landing in parallel would conflict on it. A rejected push is handled
inside that procedure — a clean rebase pushes again; a conflict on the same row
means the plan was claimed first, and the run re-picks (`next`) or stops (a
named folder). A resume whose row already reads `RUNNING` skips this step.

Set the folder's Status to `RUNNING` with the timestamp and, once Setup step 1
has cut it, the worktree path. From there the folder is edited in the worktree
only and committed with each unit, so a session that dies still leaves a
legible plan on the branch — never in the main checkout, which would dirty the
integration branch — the one exception being the index row above, which is
committed and pushed in the main checkout and never edited in the worktree. The
row does not change on a pause or a block: the index carries `APPROVED`,
`RUNNING` or `COMPLETE` only, and the folder's status line keeps the run
detail.

## Format Check

With `covers:`, before the first unit, run the preflight in
`${CLAUDE_PLUGIN_ROOT}/assets/format-check.md`. Since the run is autonomous: if
the format drift is **non-blocking**, log it and continue; if it is **blocking**
(the run needs an artifact the old format lacks), **pause** for `/vwf:setup` per
the pause rules — never migrate autonomously. Without `covers:` the check is
skipped — one Run log row saying so, journaled — since the plan reads no
blueprint artifact.

## Doc Paths

| Doc           | Path                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| Plan          | `docs/plans/<date>-<HHMM>-<slice>/` in the target repo, or `docs/plans/<date>-<name>/` in the base (`index.md` + unit files) |
| Plan index    | `docs/plans/index.md` (base repo) — its one table                               |
| Plan template | `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`                         |
| Membership    | `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`                                    |
| Backlog       | `docs/backlog.md` (base repo) — marked done via `/vwf:backlog`                  |
| Registry      | `docs/blueprint/registry.yaml` — *cycle plans only*                             |
| Flow (slice)  | `docs/blueprint/flows/<project>/<NNN>-<flow>/index.md` — *cycle plans only*     |
| Entity        | `docs/blueprint/entities/<entity>/` (`index.md` + schema) — *cycle plans only*  |
| API contract  | `docs/blueprint/apis/<project>.openapi.yaml` — *cycle plans only*               |
| Released APIs | `docs/blueprint/apis/released/` — *cycle plans only*                            |
| Conventions   | `docs/blueprint/conventions.md` — *cycle plans only*                            |
| Environment   | `docs/blueprint/environment.md` — *cycle plans only*                            |

The *cycle plans only* rows are read on a plan with `covers:` and never
otherwise.

## Autonomous Rules

- **Implement the whole plan.** Every **unit** in the folder's Units table is
  implemented — no cherry-picking, no partial delivery.
- **Waves in order, Kind decides concurrency.** The order is the Units table's
  — its Wave column, then its Depends-on column: wave by wave, a unit only
  after every unit it depends on is done. Within a wave, every `edit` unit is
  dispatched in one message and awaited; then each `code` unit runs serially
  through its pipeline; then each `review` row, after the units it depends on
  and never concurrently with a `code` unit; then the wave review; then the
  wave gate. Reorder only to honor a real dependency
  the table left implicit. If the derivation finds a **cycle or genuine
  ambiguity**, fall back to the table's **written order** as-is; if even that
  is not executable, treat it as an **uncovered decision** and pause (per the
  Pause Conditions) — never invent an order.
- **One plan, one worktree.** Via `/vwf:git-workflow`, create a dedicated
  isolated worktree for this plan — declared preference: **yes, isolate; do not
  prompt**. Implement everything there and **commit each unit autonomously** (no
  consent). Merge/push happens **only at the landing**, per the plan's Consent.
- **The review runs at the `review` row, and only there.** A `code` unit is
  TDD → coverage → commit; the `review` and `security` stages run when wave
  order reaches the `review` row that covers it — the orchestrator runs the two
  review engines itself over the row's range and hands their output to the two
  reviewers, dispatched concurrently — and both findings sets merge into one
  loop-back to the owning units' coders before the row is done, never a
  separate round per reviewer; the loop is
  [review-unit.md](references/review-unit.md). An `edit` unit has no stage of
  its own: its report and the wave review are its whole pipeline. The **shared
  stage rules** in
  `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md` hold throughout: the ones
  marked *every unit* — model enforcement via `pipeline.models` (an `edit`
  unit's or the wave reviewer's dispatch honours an override of its tier the
  same way, and states the downgrade), the pipeline knobs, terse subagent
  output, loop on findings, the convergence guard — reach an `edit` unit and
  the wave review too; the ones marked *`code` units with `covers:`* never
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
  - Any review finding still unresolved when the loop ends — at the cap, or
    early at the guard — is **documented as a gap** and execution continues; it
    does not block.
  - The gap's diagnosis differs by exit. At the **cap**, "blueprint/plan was not
    thorough enough" — the contract left something open. At the **guard**, the
    contract is not the suspect and must not be named as one: the loop itself
    failed to settle, and reconciliation should look there first.
  - A guard trip on a **cap-exempt** finding (security or `[breaking-api]`) is
    not a gap — those must be fixed. It is a pause; see Pause Conditions.
- **Gaps: document and continue.** Every gap (a blueprint/plan hole, not a code
  finding) is mirrored into the "Gaps surfaced during execution" section of
  the folder's `index.md` and filed to mempalace room `gaps`, then execution
  continues; a unit's own `GAP:` line is recorded in its Run log row with the
  assumption it took. A *non-blocking* gap never stops the run. An *isolated
  blocking* gap (the unit can't proceed without a human decision, but other
  units can) → skip that unit **and its dependents**, document, continue — per
  [blocking and resume](references/blocking.md), where a unit's `UNRESOLVED:`
  is the same thing.
- **The backlog is never edited here.** `docs/backlog.md` has one writer,
  `/vwf:backlog`; this command only calls it at the landing with the plan's
  `backlog:` ids, and no unit, subagent or reconcile pass touches the file.
- **All git via `/vwf:git-workflow`.** Never run raw git — the exceptions are
  the index row, whose claim and completion edits are the plain commands
  `assets/plan-index.md` spells out, in the main checkout, and the staging
  discipline below, whose `git add` and `git reset` are the plain commands
  that keep one unit's commit to its own Owns. On **every** mid-run
  invocation, pass git-workflow these declared preferences so it never prompts:
  **isolate without asking** (its Step 1) and **commit only — do not prompt,
  never merge/push** (its Step 4). Without these, git-workflow's post-commit
  gate fires on every unit commit and stalls the run. The final merge/push (via
  git-workflow) happens only at the landing, per the plan's Consent.
- **One commit per unit, staged to its Owns.** Every green unit, of either
  Kind, is committed on its own, in wave order. Stage exactly that unit's Owns
  — `git add -- <every owned path>`, which stages a deletion as readily as an
  edit — then read `git diff --cached --stat`: for any path outside that unit's
  Owns, `git reset -q HEAD -- <path>` before committing. A path another unit
  staged is that unit's, and rides its own commit. Then commit with the unit
  file's commit line via `vwf:git-workflow` step 3, and write the short hash
  into the Units table and the run-log row. Commits are free; they are what
  makes a later failure roll back to the last green unit instead of discarding
  the run.
- **Memory via mempalace (lean on it)** — follow
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`. mempalace is the run's working
  memory, not just an end-of-run sink: resolve the project **wing** once. For a
  **`code` unit**, **recall per unit** (decisions/problems/gaps/runs for that
  slice) before dispatching the coder, not only before the first unit; pass
  the wing **and** the recall hits to every subagent; **persist incrementally**
  — store each unit's durable decisions as it lands. An **`edit` unit** takes
  neither: its ruling is in its file, and its `DECIDED:` lines ride the Run
  log. For **every plan**, append a **Run log** row to the folder's `index.md`
  as each *node* returns for a `code` unit or a `review` row and as each
  *report* returns for an `edit` unit, not only at reconcile, in the fixed
  shape the Run log section
  of `execute-stages.md` defines, mirroring each row to the **run journal**
  (room `runs`, drawer `<plan folder>`). The Run log is what a resumed run
  reads after a pause **and** what the final report renders — so a row skipped
  under context pressure is work a resumed run repeats and a result the report
  cannot vouch for. The execute subagents file their own findings and gaps
  directly (rich detail bypasses your context) and recall them on fix
  loop-backs. Skip the journal silently if mempalace is down — the folder's
  Run log and the worktree commits are the record either way.

## Pause Conditions

These are the **only** stops before the final report. On any pause: ensure the
worktree is committed, update the folder's gap section, state precisely what
is needed, **emit the exact resume command**, and stop — do not guess past it.
The resume command is always `/vwf:execute <folder>`, run by a person in a
fresh session — after a **resource-cap** pause too, where a bare `/vwf:handoff`
wrote the reserved `next` handoff first and `/vwf:recall next` may point the
person at that command but never launches it (this skill is not
model-invocable). The resume reads the folder's Run log first, the journal
second, per the Resume check.

**Always on**

- **Hard halts** — no approved plan or, for a plan with `covers:`, a missing
  blueprint for a needed slice; the test/coverage/build harness cannot run at
  all (TDD can't be verified) when a `code` unit is planned; a git or merge
  **conflict** that cannot be safely resolved.
- **Subagent death** — a stage subagent erroring twice in a row (after one
  re-dispatch) on the **same unit**. A reviewer that returned without its
  `REVIEW:` / `SECURITY:` block counts as an error here. Commit what is safe,
  record the unit as **blocked** (a Run log row with its `why`, mirrored to the
  journal, plus the folder's gap section), and pause — never proceed on a dead
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
  pause that will never arrive. On the injected cap directive: finish writing
  the Run log rows for every report already in hand, commit what is green, set
  the folder's Status to `RUNNING — paused at unit <n> for context` (the index
  row stays `RUNNING` — a pause is the folder's detail, not the queue's), run
  `/vwf:handoff` with no argument to snapshot state as the reserved `next`
  handoff, and stop with the launch line `/vwf:execute <folder>`. The person
  re-runs it in a fresh session; `/vwf:recall next` surfaces the handoff and
  the launch line but cannot invoke this skill.

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
- **Uncovered irreversible decision** — any decision the rules above do not
  cover that is irreversible or outward-facing. Pause and ask.

Everything else is decided from the rules — do not pause for routine approvals.
Destructive operations (`--force`, `reset --hard`, deleting files the run did
not create) are **refused**, never paused on.

---

## Recall (mempalace)

Per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, resolve the project **wing** and
recall prior decisions, plan rationale, findings, and unreconciled gaps for this
plan (rooms `decisions`, `planning`, `problems`, `gaps`) before the first unit.
Pass the wing to every subagent.

**Resume check.** On a `BLOCKED` or `RUNNING` folder, the folder's **Run log**
and its **Units table** are what the resumed run reads: which units are already
`green` and their commits, which unit is the first that is not, and — for a
`review` row — which round last returned. Consult the **run journal** (room
`runs`, drawer `<plan folder>`) only when the folder cannot be read. Then the
Resume steps of [blocking and resume](references/blocking.md): the worktree in
the status line must exist, the rulings a block asked for must now be in the
plan, and **the worktree is authoritative** — a unit the log marks done whose
commit is absent is re-run, since the committed code is ground truth. Resume
at the first non-`green` unit; never re-implement a finished one. Run log rows
from the earlier attempt stay; new rows are appended with the round numbering
continued. This is how a run paused at a resource cap (`/vwf:handoff`, then
`/vwf:execute <folder>` in a fresh session) picks up where it left off.

Per-unit recall continues inside the `code` pipeline, for `code` units only.
Skip every memory step silently if mempalace is unavailable.

## Setup

1. **Worktree.** Invoke `/vwf:git-workflow` to create the dedicated worktree,
   passing the declared preferences (isolate without prompting; branch from the
   repo's integration branch, named after the plan folder; commit-only, no
   post-commit prompt; never merge/push). That skill resolves which branch the
   integration branch is; this one never assumes a name. All subsequent work
   and commits happen here; **no unit gets `isolation: "worktree"`** — units
   in a wave own disjoint paths. Record the worktree path in the folder's
   status line.

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
2. **Preflight (unattended — nothing here asks).** For every plan, run
   `/vwf:doctor` scoped to the plan's projects — the base repo's own when the
   plan names none. It reads each project's `stack.languages` from
   `.config/vwf.yaml` and checks LSP servers, toolchains, manifests, and the
   harness.

   **Halt on any `blocking` finding** — mise, the graphify CLI, no graph
   reachable from either this worktree or the main checkout, or a stack no
   installed plugin defines (an **unknown** language, a `custom` template pin).
   These are mandated tooling and the closed stack menu, so this is a hard halt
   with the remedy, not a question: a run started without them fails later and
   less legibly, and one started against an undefined stack does not fail at all
   — it builds with the conventions, harness and UX gate silently absent. Report
   and stop.

   **Then, when the Units table holds a `code` unit, read the LSP findings
   against the plan's Consent block** — everything else doctor reports is
   noted and carried into the run's gap list, not blocked on. A missing LSP
   server was a question at `/vwf:plan`'s stack gate, and its answer is the
   Consent row `LSP <language>`; this run reads the row and never asks: follow
   the LSP rule in [the `code`-unit preflight](references/preflight.md) when
   doctor reports one. On a plan of `edit` units alone, a missing LSP server
   is a Run log detail and nothing more.

   Then run every line of the folder's **Wave gate** section, in order, from the
   worktree root — what is written and nothing inferred; a gate the plan does
   not name is not this run's to invent, however obvious it looks in the tree.
   When the section reads `none`, say so in the Run log and continue: the wave
   review is then the only gate. A red line here is the integration branch's,
   not the plan's: stop and report it as such — never start a run that would be
   blamed for a failure it inherited. Record the green preflight as the first
   Run log row (`wave 0`, `preflight`).

3. **Stack conventions — only when the Units table holds a `code` unit.** Fetch
   the `conventions:` prose for every template this plan's projects pin, per
   the *Stack conventions* section of
   [the `code`-unit preflight](references/preflight.md) — once for the whole
   run, deduped per (repo, slug), with its two distinguishable halts. A plan of
   `edit` units alone skips this step, said in the Run log.
4. **Wave order.** Read the folder's Units table, build the sequence from its
   Wave and Depends-on columns and each unit's `Kind`, and record the sequence
   you will execute. **Open the Run log** in the folder's `index.md` — the
   table is already there, empty at approval; no `pending` row is written per
   unit, rows are appended as nodes and reports return — and **open the run
   journal** in mempalace (room `runs`, drawer `<plan folder>`) with that
   ordered sequence, as the folder's mirror; with `covers:`, the journal also
   records the `requires:` check's result per prerequisite. The loop appends a
   row per node or report per the Run log section of `execute-stages.md`; the
   folder is both the resumable record and what the final report renders.

## Waves (loop over waves, no human gates)

The Units table carries a `Kind` column — `code`, `edit` or `review`, per
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md` — and it is the switch.
For each wave in index.md order, skipping units already `green` on a resume:

1. **Dispatch the `edit` units** — every `edit` unit in the wave, in one
   message, per [edit-unit.md](references/edit-unit.md)'s dispatch; wait for
   every report; a Run log row per report as it arrives, one re-dispatch on an
   agent error, then `failed`. Mark each unit in the Units table as its report
   is read.
2. **Run the `code` units** — each `code` unit in the wave, one at a time, per
   [code-unit.md](references/code-unit.md): recall, the coder under TDD to the
   coverage gate, gaps, the unit's commit, persist and journal. A Run log row
   per node as it returns. The next `code` unit starts only when this one's
   commit is written or the unit is recorded `blocked`.
3. **Run the `review` rows** — each `review` row in the wave, one at a time,
   after every unit its Depends on names is done — preflight put each in an
   earlier wave, so each is committed — and never beside a `code` unit's
   pipeline, per [review-unit.md](references/review-unit.md): the range
   since the previous green row or the branch base, the two engines, both
   reviewers concurrently, the findings mapped to the owning units and their
   coders re-dispatched, the row re-run engines first, under the round cap and
   the convergence guard. A Run log row per node as it returns. A wave with no
   `review` row runs no engine.
4. **Wave review**, per [edit-unit.md](references/edit-unit.md)'s reviewer
   section, for every wave whatever its units' Kind: one reviewer subagent over
   the wave's diff against the unit files, scoped to the contract — rulings
   honoured, Owns respected, cross-unit drift, docs falsified — never a `code`
   unit's code quality or security, which are the covering `review` row's.
   Findings loop back to the owning unit, at most two rounds, under the
   convergence guard. Every round is a Run log row. A `code` unit fixed here
   after the last `review` row covering it re-runs that row over the fix delta
   before the gate — *Late loop-backs re-run the last row* in
   [review-unit.md](references/review-unit.md).
5. **Wave gate**, run by the orchestrator: every line of index.md's *Wave gate*
   section, plus every report read for `UNRESOLVED:`. A unit that returned
   `UNRESOLVED:` or `failed`, and every unit that depends on it, is **skipped**
   per [blocking and resume](references/blocking.md); the rest of the run
   continues. A red gate line no skipped unit explains is attributed to the unit
   whose Owns covers the failing path and handled as that unit's failure; one
   that cannot be attributed marks every unit in the wave `failed` with the gate
   line as detail.
6. **Commit** the green `edit` units, one commit per unit in wave order, per
   the staging discipline in the Autonomous Rules. A `code` unit was committed
   inside its pipeline, on the same discipline, and a `review` row has no
   commit of its own — its fix commits belong to the units fixed; the folder's
   edits — the Run log rows, the Units table cells, the gap section — ride
   whichever commit closes the wave. A wave that produced no commit — a clean
   `review` row alone — is closed by the orchestrator's own commit of the
   folder and nothing else, `docs: plan run log — <folder> wave <n>`, so the
   folder on the branch never says a finished row is pending.

The two fixed final units — the docs unit and the gates-and-bump unit — run as
their own waves after every other wave, after the Acceptance & UX pass and
after Reconcile; see *The fixed final waves* below.

## On failure

The run **skips what a failure blocks and keeps going** with what it does not,
then stops once at the end with every ruling needed — never mid-wave, and never
with "how should I proceed". The exact semantics — isolated versus all-blocking,
the mechanical re-dispatch, what the status line records, and how a re-run
resumes — are [blocking and resume](references/blocking.md).

## Acceptance & UX (once, after all unit waves)

With `covers:`, when every unit wave is done (or skipped per the gap rules),
run the `acceptance` and `ux` stages back to back per the contracts in
`execute-stages.md` — skip each (a Run log row with its `why`, never silent)
per its condition: acceptance when the folder's `index.md` "Acceptance criteria
(from blueprint)" section reads `none — no flow touched`, ux when the plan
changes no screens in a UI project. On anything short of a clean pass, follow
the autonomous policy in [acceptance & ux](references/acceptance-and-ux.md) —
the loop-to-`code` rule and its 4-round cap under the convergence guard, the
`n/a` cases, and the spec-gap routing. Two rules hold whatever it says: a
residual is **never silently dropped**, and infrastructure is **never
scaffolded beyond the plan's own units**. Every loop-back here lands after the
last `review` row: each fix re-runs the row covering its unit over the fix
delta before the stages re-verify — *Late loop-backs re-run the last row* in
[review-unit.md](references/review-unit.md).

Without `covers:` both stages are skipped — one Run log row each with that
`why`, journaled — a plan with no blueprint slice has no acceptance criteria
and no Screens contract to verify against.

Record both stages like any other node — a Run log row per execution, and a
`skipped` row with its `why` when the condition didn't hold, each mirrored to
the journal. A resumed run must know whether they already passed, and the report
states each skip from the row rather than from recollection.

## Reconcile (in the worktree, before the fixed final waves)

Reconcile runs **before** the docs unit's wave, so that unit's delta is complete
— the human docs are the docs unit's, not this step's; this skill runs no
docs-sync of its own.

1. **Architecture, environment, harness & implementation stamps — with
   `covers:`.** Reconcile per the Reconcile section of
   `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md` — the registry block for any
   topology change, `environment.md` for any new secret/env var, the
   `.config/vwf.yaml` `harness:` block for any capability the run added, and
   the **`implementation:` stamp** on each blueprint doc in the plan's
   `covers:` list (the single sanctioned blueprint edit — state only, per the
   stage rules) — committed in the worktree like every other unit. A plan
   without `covers:` skips this step whole, journaled as a `skipped` row.
2. **Persist — when the Units table holds a `code` unit.** Per
   `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, store the run's durable decisions,
   resolved findings, and each gap to mempalace (rooms `decisions`, `problems`,
   `gaps`). Skip anything a doc already captures. Most per-unit decisions were
   already persisted in the `code` pipeline — here, fill only what is missing.
   A plan of `edit` units alone has nothing to persist here: an `edit` unit's
   decisions are in its file and its Run log row.
3. **Mark the Run log** with a `reconcile` row — what ran, or the skip and its
   `why` — and mirror it to the run journal (room `runs`, drawer
   `<plan folder>`). This row is written for every plan.

### The fixed final waves

The two fixed final units run as their own waves, in this order, and **only
when no unit is skipped**: the docs unit invokes `vwf:docs-sync` over the run's
branch delta — its standalone mode,
`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` — and applies its findings
plus every `DOCS FALSIFIED:` line the units returned; the gates-and-bump unit
bumps each released project's version per the consent block **with the command
that block names**, runs the generators the plan names, and passes the wave
gate. Each runs the wave loop above in full — dispatch, wave review, wave gate,
commit. Then run every line of the folder's **Wave gate** section once more
over the finished tree, and every item under *Gates the orchestrator keeps* —
those are the checks a diff cannot prove — before calling the run green; each
is a Run log row (`wave —`, `reconcile`).

## The final report

Before landing, **render the report from the folder's Run log**, not from
memory — by now the run may have spanned dozens of dispatches, a compaction, or
a resource-cap handoff, and the log is the account that survived all three
intact. Read the Run log table back and present:

- every unit with its outcome, rounds, model, commit, and any `skipped` or
  `failed` reason — for a `review` row, every node beneath it with its round
  and outcome, and the units its findings re-dispatched; round counts are
  **counted from the rows**, never recalled
- every `GAP:` the units returned, with the assumption each proceeded on —
  including every Owns the orchestrator widened at run time, with the finding
  that caused it
- the review findings that survived the cap, marked `contested`
- **model downgrades**, named on the nodes that ran under them
- the wave gate and orchestrator gate results
- the versions bumped and the worktree path
- each after-landing step and its outcome, once After landing has run

With `covers:`, also:

- **coverage** vs the configured target, and the **acceptance** (per-criterion
  pass/fail) and **ux** (findings + a11y) results — each from its row, or its
  `skipped` row's `why`
- **the implementation stamps written** — each `covers:` doc and the state it
  was set to, with why anything is short of `complete`
- **the consolidated gap list** from the "Gaps surfaced during execution"
  section of the folder's `index.md`, marking which came from a **cap** and
  which from the **convergence guard** — they point reconciliation at different
  places

Fall back to the run journal only when the folder cannot be read — say so
plainly and mark the report **reconstructed**. Whoever reads it needs to know
whether they are reading a record or a recollection; a reconstructed report is a
valid thing to land on, an undisclosed one is not.

If any unit is `skipped`, `failed` or `unresolved`, this report is the block
notice and the run stops here with the status set to `BLOCKED`.

## Land

With every unit `green`, every Wave gate line and orchestrator gate passed, and
the gap list holding no blocking gap, prepare the landing commit:

1. Read the Consent row *Merge to the integration branch and push on green*.
2. **The folder.** On `yes`, when the gap list is **empty**, move the folder
   to `docs/plans/archived/` — it is finished and the archive is its record.
   When any gap is **open**, the folder stays live at its path as the working
   record of what needs reconciling; the report names `/vwf:archive <folder>`
   for after reconciliation. On `no` the folder is never moved — the hand
   merge, then `/vwf:archive <folder>`, is what retires it.
3. Set the folder's Status to `COMPLETE` with the date and the commit list on
   `yes`, and to `RUNNING — ready to land by hand on <branch>` on `no`. Then,
   when index.md's `backlog:` names ids, invoke `/vwf:backlog done <ids>` —
   that skill is the only writer of `docs/backlog.md`, and its edit rides the
   same commit. Commit all of it as one final `docs:` commit in the worktree.

Then act on that consent row:

- **yes** → hand off to `/vwf:git-workflow` step 4, *merge, push & clean up*,
  **with the declared preference that consent was recorded in the plan — do
  not ask again**. A merge conflict is a hard halt: abort, keep the worktree,
  set `BLOCKED`, report the files. When step 4 returns from the merge and push,
  run *Writing a row — the claim, and the completion* in
  `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` with the row set to `COMPLETE`
  — its `Folder` cell pointing at `docs/plans/archived/<basename>` when step 2
  moved the folder, and left at the live path when a gap kept it there, for
  `/vwf:archive` to re-point later — `Kind` and `Target repo` untouched — and
  *The sweep* from the same asset: every `COMPLETE` row already under
  `archived/` that no `APPROVED` or `RUNNING` row's `Requires` still names is
  removed, whatever its kind. That is the commit
  `docs: plan queue — <folder> complete`, on the integration branch, in the
  main checkout; a rejected push re-applies the same row until it lands, and
  never re-picks.
- **no** → stop with the worktree path and the branch name, and say the branch
  is ready to land by hand. Say too that the index row stays `RUNNING` until
  the hand merge is followed by a hand edit of the row to `COMPLETE`, or by
  `/vwf:archive <folder>`, which applies the same rule. Ask nothing further.

When any landing condition fails — a red gate line, a unit that is not green,
a blocking gap → **stop at the report** with what failed and the exact resume
command, `/vwf:execute <folder>`. The worktree stays committed; the folder's
Status reads `BLOCKED` with the detail. Two things a user can say at that stop:

- **Fix first** → the user names what to address → loop the affected units back
  through their pipeline (a `code` unit: its coder re-dispatched with the
  finding, its commit, then the last `review` row that covers it re-run over
  the fix delta per *Late loop-backs re-run the last row* in
  [review-unit.md](references/review-unit.md); re-verify acceptance/ux if
  touched; an `edit` unit: re-dispatch with the finding appended, then the
  wave review), then re-present the report and re-read the Consent block.
- **Reject** → leave the worktree intact and committed for inspection; nothing
  merges.

**Gap reconciliation (after the landing) — with `covers:`.** Whatever the
landing decision, walk the consolidated gap list and offer to close each —
**never silently rewrite either doc**: blueprint holes → `/vwf:blueprint` (the
sweep re-stamps coverage); plan holes → `/vwf:plan` to re-derive the slice
against the now-updated blueprint. When a gap is reconciled, note its
resolution back into the `gaps` room so a later cycle's recall sees it as
closed. Once no gap is open, the folder that stayed live is retired by
`/vwf:archive` — user-only, so recommend it by name and stop there.

**Chain forward — with `covers:`.** Scan the one table of the base repo's
`docs/plans/index.md` — not a walk of the members, most of which are not cloned
here — for rows whose `Requires` names the folder just completed. If one is
now unblocked (every prerequisite satisfied per that asset's *Resolution*),
offer `/vwf:execute <next-folder>` — chained plans land one focused run at a
time.

## After landing — each step runs on the mode the plan recorded

Read index.md's **After landing** table. Each step carries a *Mode*, `run` or
`ask`, decided at the planner's interview and written there. On a **green
landing** — the branch merged and pushed per the Consent row — the steps go in
table order: a `run` step runs with no prompt, since the `run` recorded in the
folder is its authorisation, consented at the interview that wrote it; before
an `ask` step the run stops once, reports what the step would do in the step's
own terms, and waits — a yes authorises exactly that step and nothing else. A
release step recorded `run` runs on the same terms. An empty table, or `none`,
skips this section and is said in one clause. A table with no *Mode* column or
an unknown mode never reaches here: preflight refused it.

The steps run from the repo root the landing left behind: the main checkout
when the branch merged, the worktree when it did not — and when the landing was
**not** consented, only those steps whose *Notes* say they may run from the
worktree are offered, and every one of them as an `ask`: a `run` step's
authorisation was for a green landing, and this is not one. The orchestrator
runs them, never a unit — a step may mutate the machine rather than the tree
under review, and a unit never reaches outside the worktree.

**Before an `ask` step, offer waiting as the equal option, not the fallback.**
Where a step stages something, it is exercised only in a restarted session —
so "not yet, I want to look first" is the answer the two-stage shape exists to
make easy. Say that the table names the remaining steps whenever the user comes
back to them.

Each step taken is reported with its outcome:

- **Ran.** Say what it did in the step's own terms. A step whose *Notes* say a
  **restarted** session is needed for its effect is reported with that sentence
  — this session already loaded what the step replaced.
- **Exited non-zero.** Report the failure verbatim, stop running — the
  remaining steps, `run` or `ask`, are offered rather than run, since a step
  after a failed one may assume its effect — and never work around it. A step
  that refuses is usually a fact about the machine rather than a failure of the
  run, and the plan named that step, not a substitute for it.

If the landing was not consented and no step may run from the worktree, there
is nothing to offer yet; say so in the final line and stop.

## What does not stop the run

The plan is approved and every ruling is in the folder. The run does **not**
pause to re-ask a ruling, confirm a unit's scope, report progress between units
or waves, ask whether to continue after a green gate, ask before a commit, ask
before the claim or the landing row, ask about a missing LSP server, or ask
what to do about a gap or a `GAP:` — a gap is recorded and the stated
assumption stands until the final report. It pauses on the Pause Conditions —
an inherited red preflight, a merge conflict, a resource cap among them — at
the report when the landing conditions fail, and once before each
after-landing step recorded `ask`. Everything else is recorded in the Run log
and answered at the end.

## What this skill never does

- Reads a unit's owned files itself, or does a unit's work inline because it
  looks small
- Dispatches a wave whose predecessor is not green or explicitly skipped
- Runs two `code` units' pipelines at once, a `review` row beside a `code`
  unit's pipeline, or an engine anywhere but at a `review` row — and never
  infers a `review` row the Units table does not write
- Runs a generator or bumps a version outside the gates-and-bump unit — a
  consented after-landing step is the one exception, and it is the
  orchestrator's because it may write outside the worktree
- Runs an `ask` step without the in-the-moment yes, runs a `run` step on a
  landing that was not green, or merges past the integration branch
- Edits `docs/plans/index.md` from inside the worktree, or edits any row but its
  own plan's and the `COMPLETE` sweep the landing applies
- Takes a `RUNNING` row, however stale — a hand reset to `APPROVED` is the only
  release
- Edits `docs/backlog.md` itself, or lets a unit do it — `/vwf:backlog` owns
  that file, and the landing calls it
- Edits a blueprint doc beyond the `implementation:` stamp, or runs a
  blueprint-bound step on a plan without `covers:`
- Runs a gate the plan's *Wave gate* section does not name, or skips one it does
- Picks up an item from *Out of scope* or *Parked*, however adjacent
- Reports the run from recollection when the run log exists
