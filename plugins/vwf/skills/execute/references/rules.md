# The Autonomous Rules

These rules hold on every run. `execute-stages.md` below means
`${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`.

## Order and isolation

- **Implement the whole plan**. Implement every entry of the folder's `units` — no
  cherry-picking, no partial delivery.
- **Waves in order, kind decides concurrency**. The order is the `units` list: each
  entry's `wave`, then its `depends_on`. Go wave by wave, a unit only after every unit
  it depends on is done. Within a wave:
  1. Each `review` row runs first, serially, over the committed tree. Every unit it
     covers is in an earlier wave. This comes before anything else is dispatched.
  2. Every `edit` unit is dispatched in one message and awaited.
  3. Each `code` unit runs serially through its pipeline.
  4. The wave review runs.
  5. The unit gate and the wave gate run.

  Reorder only to honor a real dependency the list left implicit. If the derivation
  finds a **cycle or genuine ambiguity**, fall back to the list's **written order** as
  is. If even that is not executable, it is a **blocking-gap stop** (per the Pause
  Conditions) naming the order the folder must state. Never invent an order.
- **One plan, one worktree**. Through `/vwf:git-workflow`, create a dedicated isolated
  worktree for this plan, with the declared preference: **yes, isolate; do not prompt**.
  Implement everything there, and **commit each unit autonomously** (no consent). Merge
  and push happen **only at the landing**, per the plan's `consent`.

## Review

- **The review runs at the `review` row, and only there**. A `code` unit is TDD →
  coverage → commit. Its `review` and `security` stages run when wave order reaches the
  `review` row that covers it.
  - The orchestrator runs the two review engines itself, filters their output to the
    row's range, and hands it to the two reviewers, dispatched concurrently.
  - A row that covers `edit` units alone runs the security engine and reviewer only.
  - Each round after the first reviews the previous round's fix commits alone.
  - Both findings sets merge into one loop-back to the units whose commits the findings
    fall on, by kind, before the row is done. Never run a separate round per reviewer.
  - The loop, its scope, the commit-based unit map and the one rule for an uncovered
    unit's file are [review-unit.md](review-unit.md), the authority every other passage
    cites.
  - An `edit` unit has no stage of its own: its report and the wave review are its whole
    pipeline.
- **The shared stage rules** in `execute-stages.md` hold throughout.
  - The ones marked *every unit* reach an `edit` unit and the wave review too. They are model
    enforcement through `pipeline.models`, the pipeline knobs, terse subagent output,
    loop on findings, and the convergence guard.
  - An `edit` unit's or the wave reviewer's dispatch honours an override of its tier the
    same way, and states the downgrade.
  - The ones marked *`code` units with `covers`* never fire on a plan without one.
- **Always fix every security finding**. At a `review` row, security findings gate the
  row. Loop back to the owning unit's coder until security review is clean. Fix each one; a
  security finding is **never** downgraded to a gap or deferred.
- **Always fix every breaking-API finding**. At a `review` row, a `[breaking-api]` finding
  comes from the review stage. It is a code change that would break a **released** API contract
  under `docs/blueprint/apis/released/`. It gates exactly like a security finding: loop
  back to the owning unit's coder until the `API COMPAT:` line reads clean. It is exempt
  from the review round cap, never downgraded to a gap, and never configurable off.
- **Review findings: capped rounds, guarded for convergence**. For a `review` row's
  `review` (non-security) findings, loop `code → review` up to the configured cap
  (`.config/vwf.yaml` `pipeline.review_round_cap`, default **4**). The cap is the row's,
  whatever number of units it covers. Apply the **convergence guard** in
  `execute-stages.md` before each new round.
  - A round that did not strictly reduce the finding count, or that resurfaced a finding
    an earlier round resolved, is not converging. End the loop there rather than burn the
    remaining rounds. Record the contested findings as an **oscillation** gap naming them
    and the rounds tried.
  - The wave review's own loop is capped at two rounds under the same guard, per
    [edit-unit.md](edit-unit.md).
  - A loop that ends at the cap or the guard with findings open first runs the **closing
    pass** in `execute-stages.md`. That is one fix aimed at the open set alone, checked
    narrowly with no engine, and never a round.
  - Any review finding still unresolved after the closing pass is **documented as a gap**,
    and execution continues. It does not block.
  - The gap's diagnosis differs by exit. At the **cap**: "blueprint/plan was not thorough
    enough" — the contract left something open. At the **guard**, the contract is not the
    suspect and must not be named as one. The loop itself failed to settle, and
    reconciliation should look there first.
  - A guard trip on a **cap-exempt** finding (security or `[breaking-api]`) is not a gap —
    those must be fixed. It is a pause; see the Pause Conditions.

## Gaps

- **Gaps: document and continue**. Append every gap to the folder's `gaps` list, per
  [the plan files](plan-files.md), the one place a run's gaps go. A gap is a blueprint or
  plan hole, not a code finding. Then execution continues. A unit's own `GAP:` line is one entry whose
  `unit` is that unit and whose `text` carries the assumption it took.
  - A *non-blocking* gap never stops the run.
  - An *isolated blocking* gap means that the unit cannot proceed without a human decision, but
    other units can. Skip that unit **and its dependents**, document, and continue, per
    [blocking and resume](blocking.md). A unit's `UNRESOLVED:` is the same thing.
- **Every gap entry carries its state**. Each entry of `gaps` has a `state`, `open` or
  `closed`, and its `text` reads `<what the plan left open> · <the assumption taken>`.
  - An entry is `closed` only when the run settled it with no ruling owed. Examples:
    - an Owns widened under the plan's Goal and the fix applied;
    - a finding a later round or the closing pass resolved;
    - a citation corrected.

    Its `text` ends with how.
  - Everything that still wants a person is `open`: an assumption a unit took, a `contested`
    finding, an oscillation, an `UNRESOLVED:`.
  - Only the `open` entries are the gap list: the count, the archive rule and the
    reconciliation read them alone.
  - A person who later rules on an entry sets its `state` to `closed`, and ends its `text`
    with the ruling.
- **The backlog is never edited here**. The backlog project has one writer, `/vwf:backlog`.
  This command only calls it at the landing: `done` with the plan's `backlog` ids, `partial`
  with its `backlog_pieces` ids. No unit, subagent or reconcile pass touches the project.

## Git, gates, commits

- **All git through `/vwf:git-workflow`**. A read-only git command, such as `git log` or
  `git diff`, needs no skill. A git command that writes goes through the skill, except these:
  - The index row. Its claim and completion commits are the plain commands
    `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md` spells out. They run
    in the main checkout, around the `plan-management` verb that makes the edit.
  - The staging discipline below, whose `git add` and `git reset` are the plain commands
    that keep one unit's commit to its own Owns.
  - `git merge` and its `--abort`, which refresh a shared worktree in [setup.md](setup.md).
  - `git worktree remove`, which removes a shared worktree in [all.md](../workflows/all.md).

  On each mid-run invocation, pass git-workflow two declared preferences, so it never
  prompts. One is **isolate without asking** (its Step 1). The other is **commit only — do not
  prompt, never merge/push** (its Step 4). Without these, its post-commit gate fires on every unit commit
  and stalls the run. The final merge and push (through git-workflow) happen only at the
  landing, per the plan's `consent`.
- **The three gate tiers, each line once.**
  - The **unit gate**, `gates.unit`, runs before every commit the orchestrator makes on a
    unit's behalf: a unit's own commit and each fix commit. It never runs while another unit
    is still editing, so in a wave of `edit` units it runs after every report is in.
  - The **wave gate**, `gates.wave`, runs after each wave.
  - The **plan gate**, `gates.plan`, runs once, over the finished tree.
  - Each line runs **once** at each of those points, through the action log's `log.mjs run`
    wrapper, which times it and keeps its exit code.
  - A red unit gate line is that unit's failure, handled as [waves.md](waves.md) step 5
    handles a red gate line.
  - An empty `gates.unit` runs no unit gate. An empty `gates.plan` runs every wave gate line
    once more in its place.
- **One commit per unit, staged to its Owns**. Commit every green unit, of either kind, on
  its own, in wave order. Its Owns is its `owns` list in `index.json`.
  1. Stage exactly that unit's Owns: `git add -- <every owned path>`, which stages a deletion
     as readily as an edit.
  2. Read `git diff --cached --stat`. For any path outside that unit's Owns, run
     `git reset -q HEAD -- <path>` before committing. A path another unit staged is that
     unit's, and rides its own commit.
  3. Commit with the unit file's commit line through `vwf:git-workflow` step 3.
  4. `set` the short hash into `units.<id>.commit`.

  Commits are free: they make a later failure roll back to the last green unit, not discard
  the run. An Owns the orchestrator widens at run time is one `set` of
  `units.<id>.owns --json <the whole widened list>`, recorded as a `closed` gap naming the
  finding that caused it.

## Memory and the record

- **Memory through `docs/memory/`**. Follow `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.
  - For a **`code` unit**, **recall per unit**, before dispatching the coder, not only before
    the first unit. Read the files of `docs/memory/decisions/`, `docs/memory/problems/` and
    `docs/memory/gaps/` whose slug or title matches that unit's slice, newest first, at most ten.
    Pass the hits to the coder.
  - **Persist incrementally**: write each unit's durable decisions as `docs/memory/decisions/`
    files as it lands. Write them inside the run's worktree, so they land with the merge. Under
    multi-repo `linkage: siblings`, write them in the base checkout as the second working tree,
    as Reconcile writes its stamps, per the run exception in `memory.md`. Leave them unstaged
    until the Reconcile commit carries them.
  - A run writes no other record and files no finding.
  - An **`edit` unit** takes neither: its ruling is in its file, and its `DECIDED:` lines ride
    its report and the final report.
- **The record, for every plan**. Set the unit's fields in `index.json`: `status`, `rounds`, and `commit` once it has one.
  Set them as each *node* returns for a `code` unit or a `review` row. Set them as each *report*
  returns for an `edit` unit too, not only at reconcile. Follow each with its
  `log.mjs event row` per [the plan files](plan-files.md), its `detail` the node's outcome.
  - The unit fields, the `gaps` list, the `stages` and `git log` are the run record. A
    resumed run reads it after a pause, **and** the final report renders it. A field left unset
    under context pressure is work a resumed run repeats, and a result the report cannot vouch
    for.
  - The execute subagents return their findings and gaps in their report blocks. The orchestrator
    records each gap in `index.json`, and hands each finding back, as its lines, to the unit a fix
    loop-back re-dispatches.

## What does not stop the run

The plan is approved and every ruling is in the folder. The run does **not** pause to:

- re-ask a ruling, or confirm a unit's scope;
- report progress between units or waves;
- ask whether to continue after a green gate, or ask before a commit;
- ask before the claim or the landing row;
- ask about a missing LSP server;
- ask what to do about a gap or a `GAP:` — a gap is recorded, and the stated assumption stands
  until the final report;
- ask before it copies the ux renders into the main checkout's scratchpad.

It stops at the Pause Conditions and at the final report, nowhere else. An inherited red preflight,
a merge conflict and a resource cap are among those conditions. At neither does it ask: each stop is a report
with its resume command. Record everything else in the folder's `index.json` and the action log,
and answer it at the end.

## What this skill never does

The reason for each is on its line, and the correct action follows the semicolon.

- Read a unit's owned files itself, or do a unit's work inline because it looks small; dispatch the
  unit.
- Dispatch a wave whose predecessor is not green or explicitly skipped; wait for it, or skip it per
  the rules.
- Give an agent a `name` outside a `teams` wave; a `name` makes a teammate when agent teams are on, and a
  teammate cannot start named agents. Start its `description` with its id.
- Run two `code` units' pipelines at once, or a `review` row beside a `code` unit's pipeline; run
  them serially. Never run an engine anywhere but at a `review` row. Never infer a `review` row the folder's
  `units` does not write; report it.
- Bump a version, ever; the landing records a release level, and a release step a person runs bumps
  it.
- Run a generator outside the gates unit; leave it to that unit. A consented after-landing step is
  the one exception, and it is the orchestrator's because it may write outside the worktree.
- Lower or clear a key in `.config/releases.yaml`, or write it anywhere but the release-levels write
  on a merged landing; raise it there alone.
- Ask the user anything at run time; report and stop. The session question and `all`'s run-level
  questions are asked before the run starts.
- Write a lock file with Write, Edit, `sed` or a script, or let a unit do it. A lock file is the
  file a package manager or a toolchain manager writes to pin what it resolved. A lock file changes only as the
  output of the CLI that owns it, per the unit contract in
  `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`. A gate fix or a landing that needs a new
  lock file runs that CLI.
- Run an after-landing step on a landing that was not green, or merge past the integration branch;
  list the step for the hand merge.
- Edit `docs/plans/index.json` or a folder's `status` itself; every such edit is a `plan-management`
  verb. The index one and the claim's `run` edit happen only in the main checkout. Never edit a row
  but its own plan's, and the sweep the landing's `complete` applies.
- Edit or remove a line of the action log; it is append-only, and a resume appends a new `run.start`,
  which supersedes the earlier run.
- Rewrite a folder's `index.json` whole, or edit it with anything but one `plan.mjs set` or `append`
  per change.
- Call `plan.mjs rewave`, or renumber a folder's waves any other way; waves are the planner's.
- Take a `RUNNING` row, however stale, or invoke `unclaim`; the person's own
  `plan-management unclaim <folder>` request, once its worktree is gone, is the only release.
- Edit the backlog itself, or let a unit do it; `/vwf:backlog` owns the project. The landing calls
  it, `done` for `backlog` and `partial` for `backlog_pieces`.
- Edit a blueprint doc beyond the `implementation:` stamp, or run a blueprint-bound step on a plan
  without `covers`; stamp only, and skip the step.
- Run a gate that `gates.unit`, `gates.wave`, `gates.plan` or `gates.keeps` do not name, or skip one
  they do. Run each named line once, and never twice at one point. `gates.keeps` entries run as
  [reconcile.md](reconcile.md) says.
- Pick up an item from *Out of scope* or *Parked*, however adjacent; leave it to a later plan.
- Run on a repo or a folder in the old plan format, or migrate one itself; print the migration
  message.
- Report the run from recollection when the folder's `index.json` can be read; render it from the
  record.
