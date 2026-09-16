---
name: execute
description: Execute an approved cycle-plan folder end-to-end in a dedicated
  worktree, in a fresh session — dependency-ordered, code then review+security
  concurrently per unit under TDD with finding loops — the orchestrator runs
  the two review engines itself and hands their output to the reviewers — one
  E2E acceptance + UX-conformance pass after all units, gaps captured in the
  folder's index.md. Autonomous between the start and the landing — it lands
  per the plan's recorded consent and stops once before every after-landing
  step.
  Invoke as /vwf:execute <plan-folder> or /vwf:execute next — the latter reads
  docs/plans/index.md alone and picks the runnable cycle plan of highest
  priority. Requires an approved plan folder in docs/plans/.
argument-hint: "<plan-folder, its index.md, or next>"
model: opus

disable-model-invocation: true
---

# execute — Run an Approved Plan to Completion

Implement an approved cycle plan **to completion, autonomously**. The plan
folder is the contract and its `index.md` is the only input: every ruling,
consent row, unit scope and gate line the run needs was written there by
`/vwf:plan`, and this skill reads it rather than re-asking it. Execution is
mechanical from the folder: TDD is non-negotiable; every unit passes code, then
a concurrent review + security pass, with findings looped back before it counts
as done; acceptance and UX conformance run once after all units. There are **no
per-stage human gates** — decisions come from the **Autonomous Rules** below,
and the run stops only at the **Pause Conditions**, at the **final report**
when something stands in the way of the landing, and once before each
**after-landing** step. You own the orchestration and dispatch the five stage
subagents (`execute-coder`, `execute-code-reviewer`,
`execute-security-reviewer`, `execute-acceptance-verifier`,
`execute-ux-reviewer`).

Run it in a session that has done nothing else. It cannot check that, so the
plan's launch line says it and this skill trusts it.

Adopt the **Autonomous delivery driver** persona: keep moving, decide from the
rules, isolate all work in one worktree, document what you can't resolve, and
land only what the plan's Consent block already authorised.

## Halt Conditions

### 1. Resolve and refuse early

**`next`.** When `$ARGUMENTS` is `next`, run *Reading the queue* in
`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`, keeping the rows whose `Kind` is
`cycle`. On a pick, print the folder taken and its `Priority`, and every other
`APPROVED` cycle row with why it was not taken — a lower priority, or the
requirement it waits on. Ask no confirmation: the session is meant to run
unattended. Then continue below as if that folder had been named. Nothing
runnable → stop with the message that procedure prints: each `APPROVED` cycle
row and what it waits on, or that the table is absent or holds no cycle rows.

**Finding the plan.** A plan folder lives in **the repo whose code it changes**,
and the one table of `docs/plans/index.md` in the base repo lists every one
with its target repo (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`; the file's
shape is `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`). Read the index rather
than walking the members — under `multi-repo` most of them are not on this
machine, so a walk would report the product's plans as a function of what
happens to be cloned. Halt if no approved plan exists: "No approved plan found.
Run `/vwf:plan` first."

**Halt if the target repo is absent.** Offer the consent-gated clone first; on
decline, **stop**. Unlike `plan` and `doctor`, there is no honest partial
result — you cannot write code into a repo you do not have.

**Read the folder.** Resolve `$ARGUMENTS` to `<folder>/index.md` — a folder
shaped by `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`; `execute`
reads folders only, and a single-file plan from an earlier release is not an
input (finish it on the release that wrote it, or re-run its slice through
`/vwf:plan`). Read the frontmatter — `covers:`, `requires:`, and `backlog:`
(the ids the landing hands to `/vwf:backlog`, empty or absent when the plan
covers no backlog item) — and the **Status**, **Consent**, **Units** and
**Run log** blocks. Then read the folder's **row** in the base repo's
`docs/plans/index.md`, at the integration branch's tip, the way that asset's
*Reading the queue* reads it. Then:

- Status `DRAFT` → stop: "not approved; run /vwf:plan to finish it".
- Status `COMPLETE` → stop: nothing to do.
- Any `requires:` entry unsatisfied — by the test its kind takes, per that
  asset's *Resolution* → stop and name it. A **cycle** entry is satisfied when
  every `covers:` doc of the required plan reads `implementation: complete`
  **in the base repo's blueprint** — the blueprint is where the stamps live, so
  this resolves even when the upstream plan's own repo is not cloned here; its
  index row is not the test. Halt with:

  > "Prerequisite plan `<folder>` has not been executed and merged (`<doc>` is
  > `implementation: <state>`). Run `/vwf:execute <folder>` first."

  No override flag — if reality differs from the stamp, heal it via
  `/vwf:plan` (its stamp-heal offer) or amend the blueprint via
  `/vwf:blueprint`; never guess past the halt. Because stamps land in the
  merged Reconcile commit, an executed-but-unmerged prerequisite correctly
  halts too. A **change** entry is satisfied by the row test: a `COMPLETE`
  row, or a folder under `docs/plans/archived/` with no row; say "run
  /vwf:change-execute <that folder> first" when it is `APPROVED` and "another
  session is running <that folder>; wait for it to land" when it is
  `RUNNING`. An entry that resolves to nothing → "<entry> is neither in the
  plan index nor archived; fix the `requires:` line by hand".
- Status `APPROVED` with no row at all → stop: "not in the plan index; re-run
  `/vwf:plan`'s hand-off, or add the row by hand".
- Status `APPROVED` with a `RUNNING` row → a claim another session holds. Stop
  and name it: the row is resumed only by the session that holds it, or claimed
  afresh after a hand reset of the row to `APPROVED`, committed on the
  integration branch.
- Status `BLOCKED` or `RUNNING` → a **resume**, per the Resume check under
  Recall below: the worktree named in the status line exists, and the run
  starts at the first unit the folder's Run log does not show done. The row is
  expected to read `RUNNING` already, and is left alone; a row reading
  `APPROVED` is a hand reset, and the run claims it again below.
- Status `APPROVED` with an `APPROVED` row → a fresh run.

The folder arrives **already committed** on the integration branch —
`/vwf:plan` commits and pushes it at hand-off — so the worktree Setup step 1
cuts sees it from its first commit. A folder that is not on that branch is
refused, not swept into a unit commit: stop and say to run `/vwf:plan` again on
it, or to commit and push it by hand, then re-launch.

**Claim the row.** Before the worktree is cut, and before the folder's own
Status is touched, run *Writing a row* in
`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` with the row set to `RUNNING` —
the commit `docs: plan queue — <folder> running`, pushed on the integration
branch. This is the **one** edit the run makes in the main checkout, and it is
made there on purpose: the pushed row is what another session's `next` reads,
so a claim that lived only on the run branch would claim nothing; and the run
branch must never carry `docs/plans/index.md`, or two plans landing in parallel
would conflict on it. A rejected push is handled inside that procedure — a
clean rebase pushes again; a conflict on the same row means the plan was
claimed first, and the run re-picks (`next`) or stops (a named folder). A
resume whose row already reads `RUNNING` skips this step.

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

Before the first unit, run the preflight in
`${CLAUDE_PLUGIN_ROOT}/assets/format-check.md`. Since the run is autonomous: if
the format drift is **non-blocking**, log it and continue; if it is **blocking**
(the run needs an artifact the old format lacks), **pause** for `/vwf:setup` per
the pause rules — never migrate autonomously.

## Doc Paths

| Doc           | Path                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| Plan          | `<target-repo>/docs/plans/<date>-<HHMM>-<slice>/` (`index.md` + unit files)     |
| Plan index    | `docs/plans/index.md` (base repo) — its one table                               |
| Plan template | `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`                         |
| Membership    | `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`                                    |
| Registry      | `docs/blueprint/registry.yaml`                                                  |
| Flow (slice)  | `docs/blueprint/flows/<project>/<NNN>-<flow>/index.md`                          |
| Entity        | `docs/blueprint/entities/<entity>/` (`index.md` + schema)                       |
| API contract  | `docs/blueprint/apis/<project>.openapi.yaml`                                    |
| Released APIs | `docs/blueprint/apis/released/`                                                 |
| Conventions   | `docs/blueprint/conventions.md`                                                 |
| Environment   | `docs/blueprint/environment.md`                                                 |
| Backlog       | `docs/backlog.md` (base repo) — marked done via `/vwf:backlog`                  |

## References

This skill is almost entirely rules that hold on every run — the halts, the
pause conditions, the autonomous rules — so they stay here. Only two branches
are conditional enough to load on demand, and each is named where it applies:
[preflight](references/preflight.md) (Setup step 2, when doctor reports a
missing LSP server) and
[acceptance-and-ux](references/acceptance-and-ux.md) (when the acceptance or ux
stage returns short of a clean pass). Never read either upfront.

## Pipeline (per unit)

`code`, then `review` and `security` **concurrently**, per unit — the
orchestrator runs the two review engines itself and hands their output to the
reviewers — then **`acceptance` + `ux` once after all units** (see the
Acceptance & UX section below). The stage table, per-stage subagent contracts,
and shared stage rules (model enforcement, terse subagent output,
loop-on-findings, gap capture, never silently editing the blueprint) are
defined in `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md` — follow them
throughout. The durable gap record is the **"Gaps surfaced during execution"
section of the folder's `index.md`**.

## Autonomous Rules

- **Implement the whole plan.** Every **unit** in the folder's Units table is
  implemented — no cherry-picking, no partial delivery.
- **Dependencies first.** The order is the Units table's — its Depends-on
  column and Wave column — run **serially**: one unit at a time, wave by wave,
  a unit only after every unit it depends on is done. Never two coders at once
  in this release: waves are ordering only here, and the merged executor
  decides concurrency. Reorder only to honor a real dependency the table left
  implicit. If the derivation finds a **cycle or genuine ambiguity**, fall back
  to the table's **written order** as-is; if even that is not executable, treat
  it as an **uncovered decision** and pause (per the Pause Conditions) — never
  invent an order.
- **One plan, one worktree.** Via `/vwf:git-workflow`, create a dedicated
  isolated worktree for this plan — declared preference: **yes, isolate; do not
  prompt**. Implement everything there and **commit each unit autonomously** (no
  consent). Merge/push happens **only at the landing**, per the plan's Consent.
- **Full pipeline every unit.** `code`, then `review` and `security` run
  concurrently, for each unit — the orchestrator runs the two review engines
  itself and hands their output to the reviewers. Both findings sets merge into
  one loop-back to `code` before the unit is done — never a separate round per
  reviewer.
- **Always fix every security finding.** Security findings gate the unit: loop
  back to `code` until security review is clean. A security finding is **never**
  downgraded to a gap or deferred.
- **Always fix every breaking-API finding.** A `[breaking-api]` finding from the
  review stage (a code change that would break a **released** API contract under
  `docs/blueprint/apis/released/`) gates exactly like a security finding: loop
  back to `code` until the `API COMPAT:` line reads clean — exempt from the
  review round cap, never downgraded to a gap, never configurable off.
- **Review findings: capped rounds, guarded for convergence.** For `review`
  (non-security) findings, loop `code → review` up to the configured cap
  (`.config/vwf.yaml` `pipeline.review_round_cap`, default **4**) — and apply
  the **convergence guard** in `execute-stages.md` before each new round. A
  round that did not strictly reduce the finding count, or that resurfaced a
  finding an earlier round resolved, is not converging: end the loop there
  rather than burning the remaining rounds, and record the contested findings as
  an **oscillation** gap naming them and the rounds tried.
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
  continues. A *non-blocking* gap never stops the run. An *isolated blocking*
  gap (the unit can't proceed without a human decision, but other units can) →
  skip that unit **and its dependents**, document, continue.
- **The backlog is never edited here.** `docs/backlog.md` has one writer,
  `/vwf:backlog`; this command only calls it at the landing with the plan's
  `backlog:` ids, and no unit, subagent or reconcile pass touches the file.
- **All git via `/vwf:git-workflow`.** Never run raw git — the one exception is
  the index row, whose claim and completion edits are the plain commands
  `assets/plan-index.md` spells out, in the main checkout. On **every** mid-run
  invocation, pass git-workflow these declared preferences so it never prompts:
  **isolate without asking** (its Step 1) and **commit only — do not prompt,
  never merge/push** (its Step 4). Without these, git-workflow's post-commit
  gate fires on every unit commit and stalls the run. The final merge/push (via
  git-workflow) happens only at the landing, per the plan's Consent.
- **Memory via mempalace (lean on it)** — follow
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`. mempalace is the run's working
  memory, not just an end-of-run sink: resolve the project **wing** once;
  **recall per unit** (decisions/problems/gaps/runs for that slice) before
  dispatching the coder, not only before the first unit; pass the wing **and**
  the recall hits to every subagent; **persist incrementally** — store each
  unit's durable decisions as it lands, and append a **Run log** row to the
  folder's `index.md` as each *node* returns, not only at reconcile, in the
  fixed shape the Run log section of `execute-stages.md` defines, mirroring
  each row to the **run journal** (room `runs`, drawer `<plan folder>`). The
  Run log is what a resumed run reads after a pause **and** what the final
  report renders — so a row skipped under context pressure is work a resumed
  run repeats and a result the report cannot vouch for. The execute subagents
  file their own findings and gaps directly (rich detail bypasses your context)
  and recall them on fix loop-backs. Skip the journal silently if mempalace is
  down — the folder's Run log and the worktree commits are the record either
  way.

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

- **Hard halts** — no approved plan or missing blueprint for a needed slice; the
  test/coverage/build harness cannot run at all (TDD can't be verified); a git
  or merge **conflict** that cannot be safely resolved.
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
slice (rooms `decisions`, `planning`, `problems`, `gaps`) before the first unit.
Pass the wing to every subagent.

**Resume check.** On a `BLOCKED` or `RUNNING` folder, the folder's **Run log**
is what the resumed run reads: which units are already done and their commits,
and which node of the current unit last returned. Consult the **run journal**
(room `runs`, drawer `<plan folder>`) only when the folder cannot be read.
Confirm the worktree named in the status line exists — if it does not, the run
cannot resume; say so and stop, and the user decides whether to start over
from `APPROVED` (resetting the folder's Status **and** its index row by hand,
the row in a commit on the integration branch). Reconcile the log against the
worktree, and **resume at the current unit** — do not re-implement finished
units. Run log rows from the earlier attempt stay; new rows are appended with
the round numbering continued. This is how a run paused at a resource cap
(`/vwf:handoff`, then `/vwf:execute <folder>` in a fresh session) picks up
where it left off.

**Tie-break — the worktree is authoritative.** If the Run log (or the journal)
marks a unit **done** but its commit is **absent** from the worktree, trust the
worktree and **re-run that unit**. A record can be stale or ahead of what
actually landed; the committed code is ground truth.

Per-unit recall continues inside the Execute loop below. Skip every memory step
silently if mempalace is unavailable.

## Setup

1. **Worktree.** Invoke `/vwf:git-workflow` to create the dedicated worktree,
   passing the declared preferences (isolate without prompting; commit-only, no
   post-commit prompt; never merge/push). All subsequent work and commits happen
   here. Record the worktree path in the folder's status line.

   **In a `multi-repo` product, which repo the worktree is of follows the
   linkage** — `/vwf:git-workflow` resolves it, and the two
   cases differ in a way worth knowing:

   - **`linkage: submodule`** — unchanged from every previous release. The
     worktree is of the **base** repo (the outermost superproject), and the
     members are populated inside it, so one tree holds both the code and the
     blueprint. Nothing here is cross-repo; the member's pointer commit is part
     of landing the branch.
   - **`linkage: siblings`** — the base repo's tree does **not** contain the
     members, so the worktree is of the **target member**, and the blueprint
     writes below (`implementation:` stamps, docs-sync edits) go to the base
     checkout as a second working tree. Commit the two separately, **base repo
     last**, so a half-finished run never leaves a doc claiming work that has
     not landed.
2. **Preflight (unattended — nothing here asks).** Run `/vwf:doctor` scoped to
   the plan's projects. It reads each project's `stack.languages` from
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

   **Then read the LSP findings against the plan's Consent block** — everything
   else doctor reports is noted and carried into the run's gap list, not blocked
   on. A missing LSP server was a question at `/vwf:plan`'s stack gate, and its
   answer is the Consent row `LSP <language>`; this run reads the row and never
   asks: follow [the LSP rule](references/preflight.md) when doctor reports one.

   Then run every line of the folder's **Wave gate** section, in order, from the
   worktree root — what is written and nothing
   inferred; `none` is said in the Run log and skipped. A red line here is the
   integration branch's, not the plan's: stop and report it as such — never
   start a run that would be blamed for a failure it inherited. Record the green
   preflight as the first Run log row (`wave 0`, `preflight`).

3. **Stack conventions.** Fetch the `conventions:` prose for every template this
   plan's projects pin, per *Resolving the conventions* in
   `${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md` — deduped by slug, **once
   for the whole run**, here rather than per unit. The config block names the
   templates; the prose is what the code is actually written to, and every stage
   below that touches code is passed it.

   **Under `multi-repo`, the fetch carries `repo: <path>`** — that asset's
   *The target repo* line, naming the member whose `members:` entry lists the
   project (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`). Step 1 above already
   resolved which repo each project is of; **hand that resolution to the fetch**
   rather than dropping it, under both linkages — under `siblings` it is the
   worktree's own repo, under `submodule` the member's path inside the base.
   A materialized template lives in the repo it was landed in, so a fetch that
   omits the repo reads the base's `.claude/` tree for a member's project and
   finds the wrong prose or none. Dedupe per (repo, slug).

   **Two different halts live here.** An axis reading `unresolved` halts at
   that asset's step 1, before any fetch — the axis was deferred, so there is
   no prose to resolve; name the project and the axis and point at
   `/vwf:architecture`. A failed fetch halts for the opposite reason: the
   preflight already proved each pin resolves, so a failure now is the plugin
   being unreachable. Report them distinguishably — a question nobody answered
   is not a plugin that broke — and note that `/vwf:doctor` will not have
   caught the first, since it reports deferral as a degradation by design.
   Either way, code written to conventions nobody read is the thing this whole
   gate exists to prevent.
4. **Dependency order.** Read the folder's Units table, build the dependency
   order from its Depends-on and Wave columns, and record the sequence you will
   execute. **Open the Run log** in the folder's `index.md` — the table is
   already there, empty at approval; no `pending` row is written per unit, rows
   are appended as nodes return — and **open the run journal** in mempalace
   (room `runs`, drawer `<plan folder>`) with that ordered sequence, as the
   folder's mirror. The loop appends a row per node per the Run log section of
   `execute-stages.md`; the folder is both the resumable record and what the
   final report renders.

## Execute (loop over units, no human gates)

For each unit in dependency order (skip any the folder's Run log already shows
done — its `code` node carries a commit and its reviewers' last round is
clean):

1. **recall** — before dispatching, `mempalace_search` the wing scoped to this
   unit's slice across rooms `decisions`, `problems`, `gaps`, and `runs` (limit
   3-5). Pass the relevant hits (with the wing) to the coder so it builds on
   prior decisions instead of re-deriving them. Skip silently if mempalace is
   down.
2. **code** — dispatch `execute-coder` per the stage contract in
   `execute-stages.md`: the unit's `NN-<unit>.md` file (its ruling, Test first
   line, Owns and Verification) plus the index's *Facts the survey
   established*, *Assumed decisions* and *Shared-file rule* sections — never
   the whole folder — the resolved stack, wing, and recall hits. Mark the unit
   `running` in the Units table. A sub-100% coverage result against the
   configured target (`.config/vwf.yaml` `pipeline.coverage_target`, default
   100) is documented as a gap — never a silent pass.
3. **review + security (engines first, then concurrent)** — four moves, in
   this order:
   1. In **one message**, invoke `/code-review` at high effort and
      `/security-review` through the `Skill` tool. Each may run as a background
      task; note the task each reports.
   2. Wait on each with `TaskOutput`, blocking, up to 30 minutes from
      invocation. An engine that errors or times out is stopped with `TaskStop`
      and counted unavailable, with the reason kept for the prompt.
   3. In **one message**, dispatch `execute-code-reviewer` and
      `execute-security-reviewer` so both run at once. Each dispatch prompt
      ends with a section headed `## Engine` holding either that engine's
      output verbatim or the single line `ENGINE: unavailable — <reason>`. They
      are independent read-only passes over the same diff; neither reads the
      other's output, so serializing them only costs wall-clock.
   4. Each reviewer returns exactly one block — `REVIEW:` or `SECURITY:`. A
      return without it is an error under the "Subagent death" pause rule:
      re-dispatch once; twice in a row on one unit → record `blocked`, pause.

   The reviewers run no engine, so the orchestrator never waits for a
   notification on a reviewer's behalf and never sends a reviewer a message to
   finish its block — the only thing it waits for from a reviewer is its
   return.
4. **resolve both findings sets in one loop-back** — merge the two returns and
   send the combined findings **tags** to `code` in **one** dispatch, then
   repeat step 3 in full — engines first, then both reviewers concurrently —
   for every round. Merging is not just faster, it is better:
   the coder fixes review and security findings in a single pass instead of two,
   so the two stages never fight over the same lines. Gating is unchanged and
   per-stage: every security finding and every `[breaking-api]` finding **must**
   be fixed (cap-exempt); other review findings loop **per the round-cap rule**
   (residuals after the cap → documented as gaps). A round counts once, even
   though it ran two reviewers. Before each new round, apply the **convergence
   guard** — the merged loop-back is what *keeps* the two reviewers from
   fighting over the same lines, and the guard is what catches it when that
   fails.
5. **gaps** — any stage's gap pointer → mirror into the "Gaps surfaced during
   execution" section of the folder's `index.md` and file to mempalace room
   `gaps`. Decide blocking vs non-blocking and act per the rules.
6. **commit** — commit the unit's work via `/vwf:git-workflow`, **per the
   commit-only preference**, with the unit file's Commit line. The folder's
   edits — the Run log rows, the Units table cells, the gap section — ride the
   same commit: the folder is edited in the worktree, never in the main
   checkout.
7. **persist & journal** — store the unit's durable decisions to room
   `decisions`, and fill the unit's Units table row: Status `green` (or
   `skipped`, `failed`, `unresolved` per the gap rules) and the short commit
   hash. The **Run log rows** themselves are written **as each node returns**
   (steps 2-4), not batched here: one row per execution
   (`Wave | Unit | Model | Round | Outcome | Detail | Commit`), appended to the
   folder's `index.md` and mirrored to the journal before the next dispatch, so
   the round count is the row count and a skip carries its `why`. Batching them
   to the end of the unit is what makes a resumed run repeat work and the report
   render from memory.

## Acceptance & UX (once, after all units)

When every unit is done (or skipped per the gap rules), run the `acceptance` and
`ux` stages back to back per the contracts in `execute-stages.md` — skip each
(a Run log row with its `why`, never silent) per its condition: acceptance when
the folder's `index.md` "Acceptance criteria (from blueprint)" section reads
`none — no flow touched`, ux when the plan changes no screens in a UI project.
On anything short of a clean pass, follow the autonomous policy in
[acceptance & ux](references/acceptance-and-ux.md) — the loop-to-`code` rule and
its 4-round cap under the convergence guard, the `n/a` cases, and the spec-gap
routing. Two rules hold whatever it says: a residual is **never silently
dropped**, and infrastructure is **never scaffolded beyond the plan's own
units**.

Record both stages like any other node — a Run log row per execution, and a
`skipped` row with its `why` when the condition didn't hold, each mirrored to
the journal. A resumed run must know whether they already passed, and the report
states each skip from the row rather than from recollection.

## Reconcile (in the worktree, before the final report)

1. **Architecture, environment, harness, docs & implementation stamps.**
   Reconcile per the Reconcile section of
   `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md` — the registry block for any
   topology change, `environment.md` for any new secret/env var, the
   `.config/vwf.yaml` `harness:` block for any capability the run added, the
   repo's human docs (README/CLAUDE.md) via /vwf:docs-sync
   (relay its report — what was synced, or `docs: nothing contradicted`), and
   the **`implementation:` stamp** on each
   blueprint doc in the plan's `covers:` list (the single sanctioned blueprint
   edit — state only, per the stage rules) — committed in the worktree like
   every other unit. Then run every line of the folder's **Wave gate** section
   once more over the finished tree, and every item under *Gates the
   orchestrator keeps*; each is a Run log row (`wave —`, `reconcile`).
2. **Persist.** Per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, store the run's
   durable decisions, resolved findings, and each gap to mempalace (rooms
   `decisions`, `problems`, `gaps`). Skip anything a doc already captures. Most
   per-unit decisions were already persisted in the loop — here, fill only what
   is missing. Then mark the Run log **complete** with a final `reconcile` row
   and mirror it to the run journal (room `runs`, drawer `<plan folder>`).

## Final report and landing

**Render the report from the folder's Run log** — do not reconstruct the run
from what you remember of it. By this point the run may have spanned dozens of
dispatches, a compaction, or a resource-cap handoff, and the log is the only
account that survived all three intact. Read the Run log table back and
present:

- **The node rows**, grouped by unit — each unit's commit, and every execution
  beneath it with its round, outcome, and any `skipped`/`blocked` `why`. Round
  counts are **counted from the rows**, never recalled.
- **Coverage** vs the configured target, and the **acceptance** (per-criterion
  pass/fail) and **ux** (findings + a11y) results — each from its row, or its
  `skipped` row's `why`.
- **Model downgrades**, named on the nodes that ran under them.
- **The implementation stamps written** — each `covers:` doc and the state it
  was set to, with why anything is short of `complete`.
- **The consolidated gap list** from the "Gaps surfaced during execution"
  section of the folder's `index.md`, marking which came from a **cap** and
  which from the **convergence guard** — they point reconciliation at different
  places.
- **The wave gate and orchestrator gate results.**
- **The worktree path.**

Fall back to the run journal only when the folder cannot be read — say so
plainly and mark the report **reconstructed**. Whoever reads it needs to know
whether they are reading a record or a recollection; a reconstructed report is a
valid thing to land on, an undisclosed one is not.

**Then land per the Consent block.** Read the row *Merge to the integration
branch and push on green*. When it reads `yes`, **and** every Wave gate line
and orchestrator gate is green, **and** every unit is `green` or a skip the Run
log records with its `why`, **and** the gap list holds no blocking gap → land
without a further prompt:

1. When the folder's `backlog:` names ids, invoke `/vwf:backlog done <ids>` —
   that skill is the only writer of `docs/backlog.md`, and its edit rides the
   run. Set the folder's Status to `COMPLETE` with the date and the commit list,
   and commit it as one final `docs:` commit in the worktree.
2. Hand off to `/vwf:git-workflow` step 4, *merge, push & clean up*, **with the
   declared preference that consent was recorded in the plan — do not ask
   again**. A merge conflict is a hard halt: abort, keep the worktree, set
   `BLOCKED`, report the files.
3. When step 4 returns from the merge and push, run *Writing a row* in
   `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` with the row `Status` set to
   `COMPLETE` and its `Folder` cell **left at the live path** — a cycle plan's
   folder is not moved here, so re-pointing `Folder` under
   `docs/plans/archived/` is `/vwf:archive`'s edit, made when it moves the
   folder — and the sweep, which still runs — every `COMPLETE` row no
   `APPROVED` or `RUNNING` row's `Requires` still names is removed. That is
   the commit
   `docs: plan queue — <folder> complete`, on the integration branch, in the
   main checkout; a rejected push re-applies the same row until it lands, and
   never re-picks.
4. The folder itself is **not** moved to `docs/plans/archived/` here — tell the
   user to run `/vwf:archive` (see Archive below).

When any condition fails, or the row reads `no` → **stop at the report** with
what failed — the red gate line, the unit that is not green, the blocking gap,
or the consent itself — and the exact resume command, `/vwf:execute <folder>`.
The worktree stays committed; the folder's Status reads `BLOCKED` with the
detail, or `RUNNING` with the branch name and that it is ready to land by hand
when consent alone withheld it (say too that the index row stays `RUNNING`
until the hand merge is followed by a hand edit of the row to `COMPLETE`, or
by `/vwf:archive <folder>`, which applies the same rule). Two things a user can
say at that stop:

- **Fix first** → the user names what to address → loop the affected units back
  through the pipeline (code, then the loop's step 3 in full — engines first,
  then review + security concurrently; re-verify acceptance/ux if touched), then
  re-present the report and re-read the Consent block.
- **Reject** → leave the worktree intact and committed for inspection; nothing
  merges.

**After landing — every step is an `ask`, and the run stops once before each.**
Read the folder's **After landing** table. Before each step, in order, the run
stops once, reports what the step would do in the step's own terms, and waits;
a yes authorises exactly that step and nothing else. A `run` mode in an older
folder is read as `ask`. An empty table, or `none`, skips this in one clause.
The steps run from the repo root the landing left behind — the main checkout
when the branch merged, the worktree when it did not, and then only the steps
whose *Notes* say they may run from the worktree. The orchestrator runs them,
never a unit. Offer waiting as the equal option: where a step stages something
a **restarted** session picks up, "not yet" is the answer the two-stage shape
exists for. Report each step taken — ran, with what it did, or exited non-zero,
verbatim, never worked around.

**Gap reconciliation (after the landing).** Whatever the landing decision, walk
the consolidated gap list and offer to close each — **never silently rewrite
either doc**: blueprint holes → `/vwf:blueprint` (the sweep re-stamps
coverage); plan holes → `/vwf:plan` to re-derive the slice against the
now-updated blueprint. When a gap is reconciled, note its resolution back into
the `gaps` room so a later cycle's recall sees it as closed.

## Archive

After a merge with no open gaps, **tell the user to run `/vwf:archive`** to
retire the completed plan folder. `/vwf:archive` is user-only — you cannot
invoke it, so recommend it by name and stop there. While gaps remain open, don't
recommend it — the folder is still the working record of what needs
reconciling.

**Chain forward.** Scan the one table of the base repo's `docs/plans/index.md`
— not a walk of the members, most of which are not cloned here — for `cycle`
rows whose `Requires` names the folder just completed. If one is now unblocked
(every prerequisite's `covers:` docs read `implementation: complete`), offer
`/vwf:execute <next-folder>` — chained plans land one focused run at a time.

## What does not stop the run

The plan is approved and every ruling is in the folder. The run does **not**
pause to re-ask a ruling, confirm a unit's scope, report progress between units,
ask whether to continue after a green gate, ask before a commit, ask before the
claim or the landing row, ask about a missing LSP server, or ask what to do
about a gap — a gap is recorded and the stated assumption stands until the
final report. It pauses on the Pause Conditions, at the report when the landing
conditions fail, and once before each after-landing step. Everything else is
recorded in the Run log and answered at the end.
