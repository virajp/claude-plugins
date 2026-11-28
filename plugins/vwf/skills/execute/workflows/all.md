# `all` — every runnable plan, each in its own runner

Read this when the argument is `all`, and when you are an `execute-runner` handed one folder and
this skill's `SKILL.md`. The second half, *Runner mode*, is yours.

`/vwf:execute all` runs every runnable plan, highest priority first, one at a time, each in its own
runner subagent. A question a runner cannot settle is relayed: the runner returns it, the loop asks the
user and resumes the runner with the answer, per *The loop* step 4. It stops at the first point it cannot settle.

The session that typed it is **the loop**. It picks, dispatches, and keeps a one-line result per plan. It
lands the held plans in its landing phase, and does nothing else. It never reads a unit report or a unit's
state itself. Of a plan folder it reads `consent` and `after_landing` alone, with `plan.mjs get`, at the
landing phase. Of `.config/vwf.yaml` it reads the `after_landing:` key alone.

`plan.mjs` names `node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`, as in
[the plan files](../references/plan-files.md). Plain `/vwf:execute <folder>` and `/vwf:execute next` are
unchanged by any of this.

Before anything else, the loop runs the format test of `SKILL.md`, once. On the old format it prints the
migration message and stops, asking nothing and dispatching no runner. A repo with neither
`docs/plans/index.md` nor `docs/plans/index.json` has no runnable plan, and the loop ends as step 2 of *The
loop* does.

## Run-level rules — no question before the first plan

A plan's folder answers every question its own run needs. These rules cover the **run of several plans**,
which no single folder can answer. The loop asks nothing before its first plan. Each rule is an **override**
of the plans' recorded steps for this run only. It is passed to each runner in its dispatch prompt, and
written by the runner as one entry of that folder's `overrides` list. A folder's `consent` is never changed.

1. **One shared worktree, always**. All the plans of the run commit to one worktree on branch
   `all-<date>-<HHMM>`, the time the loop starts. The first runner cuts it, per Setup; each later runner
   reuses it. The loop's exit removes it, except on a `STOPPED` end.
2. **Land at the end**. A runner does not land its plan. It holds it: the plan is green and committed on
   the shared branch, and its row stays `RUNNING`. The loop lands every held plan in its **landing
   phase**, below. That phase runs once at the loop's normal end, and earlier only when a plan the loop
   would pick next requires a held plan, per *The loop* step 2.
3. **After-landing steps after the landing**. A held plan runs no after-landing step. The landing phase
   runs each distinct step once, after its last landing, per *The landing phase* step 4. A phase run early,
   because a later plan requires a held plan, runs its steps before that later plan starts. So a step
   that the next plan needs has run, and every other step runs once, after all the plans land.
4. **The one question is at the landing phase**. When a held plan's `consent.merge` reads `false`, the
   landing phase asks once whether to land all the held plans, per its step 2. Nothing else is asked at
   the run level.

### The overrides block

Each dispatch prompt carries the overrides that apply to its folder, after the two paths, as this block:

```text
Overrides:
- shared worktree: <branch>
- hold landing
- land: yes
- skip after-landing
```

A runner that runs a plan's units gets `shared worktree` and `hold landing`. A runner that the landing
phase dispatches gets `shared worktree`, `land: yes` and `skip after-landing`.

The runner applies each over the folder as Setup ([setup.md](../references/setup.md)), Land ([land.md](../references/land.md))
and After landing ([after-landing.md](../references/after-landing.md)) describe for an `all` override. Right after its preflight,
it appends the one entry, the block's lines joined by `; `, `O<n>` one past the highest `O` id in the list:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs append <folder>/index.json overrides --json '{"id": "O<n>", "text": "<line>; <line>"}'
```

It never changes `consent`.

### The answers block

Only the fresh runner of *The loop* step 4, dispatched when the resume of a runner that returned `OUTCOME: QUESTION`
failed, carries this block, right after the overrides block. One line per question the user answered, its plan-wide id
and the answer as given:

```text
Answers:
- Q<n>: <answer>
- Q<n>: <answer>
```

`Answers: none` is never sent; with no answer, the block is left out. The runner records each answer per *Recording* in
[questions.md](../references/questions.md) — one `decisions` entry, `rejected` filled from the `options` of that
question's `question` event in the action log — before its resume path runs.

## The loop

Run it in a session that has done nothing else; it cannot check that, so it trusts it. Each runner is the fresh context its plan
runs in. The loop's own context grows only by the five-line return of each.

Each iteration, in order:

1. **Cap check**. A resource-cap directive is the `PostToolUse` hook's, per the Pause Conditions in
   [pause.md](../references/pause.md). When one has reached this session at any point, start no new plan. The loop ends, stop reason
   *resource cap*. The hook pauses a running runner the same way it pauses execute today, and that runner returns `STOPPED`. A
   runner's own context is not measured, only the session's figures the hook reads. The 5-hour and 7-day figures are
   account-wide.
2. **Pick**. Run `plan.mjs pick --branch <integration>`, with `--member-branch` as [claim.md](../references/claim.md) says (the loop's re-pick: it picks and claims nothing; the runner's `start.mjs` claims). Exit 1,
   `{nothing: [{folder, waits}]}`:
   - when a `waits` entry names a plan this run holds, run *The landing phase* now, then go back to step 1;
   - otherwise the loop ends, stop reason each `APPROVED` row and what it waits on, or that the index is
     absent or holds no rows. On a pick, `{pick: {folder, kind, priority}}`, print one line: the folder, its `kind` and its
   `priority`. Print nothing of the other rows.
3. **Dispatch one runner**. Make one `Agent` call, `subagent_type: "vwf:execute-runner"` (the `execute-runner` agent). Start its `description` with `run-<n>` for
   the iteration's number, and give it no `name`: with agent teams on, a `name` makes the runner a teammate, and a teammate's named agents fail. Never pass `isolation: "worktree"`: the runner cuts its own, per Setup, or reuses the shared one. The prompt
   is two paths and the overrides block, and nothing else:
   - the picked folder, repo-relative;
   - the **absolute** path of this skill's `SKILL.md`, the base directory this skill was loaded from plus `/SKILL.md`;
   - the block for that folder: `shared worktree` and `hold landing`;
   - only on the fresh runner of step 4, after a failed resume: *The answers block* above.

   Pass no conversation context, no recall, and no instruction beyond *run this folder in runner mode*. Runners never run in parallel: dispatch the next only once this one has
   returned.
4. **Record the return**. The runner's reply is five lines, per *The return block* below, followed by the question lines only when its
   `OUTCOME:` is `QUESTION`. Keep the five as one row of the loop's table. A reply that is not that block can be an agent error, a death or
   free prose. Never re-dispatch it. A dead runner may hold a claim or a worktree half-way. The row reads `STOPPED`, detail *runner returned
   no block*, resume `/vwf:execute <folder>`, and the loop ends there.

   A reply whose `OUTCOME:` is `QUESTION` is legal, and is not a row yet. The loop relays it:
   - **Ask.** Each `QUESTION Q<n> <owner>:` line is one `AskUserQuestion` call, one per call, one at a time, its id and owner in the text,
     its `OPTIONS Q<n>:` as the options (the first the recommendation) and its `WHY Q<n>:` beside it. The loop waits at each for as long
     as necessary.
   - **Resume.** Load `SendMessage` with `ToolSearch`, then send the runner, by its agent id, one message carrying each `Q<n>` and its
     answer. Wait for its next reply: a return block again, read by this same step.
   - **A failed resume.** Dispatch a fresh runner on the same folder as in step 3, with *The answers block* after the overrides block,
     and read its reply by this same step.
   - **No one to answer** (`AskUserQuestion` not available or failing, a headless loop): resume the runner with `SendMessage`, the
     message reading *no one can answer* and naming each `Q<n>`. The runner then does what *No one to answer* in
     [questions.md](../references/questions.md) says and returns `STOPPED`; record that block as usual. If that resume fails, the row
     reads `STOPPED`, its detail naming the open question ids, resume `/vwf:execute <folder>`; the folder's next resume asks them from
     the action log, per *No one to answer* in [questions.md](../references/questions.md).

   The loop still reads no unit report, and edits no folder: the question lines are part of the runner's return block.
5. **Continue or end**. A row whose `OUTCOME:` is `HELD` adds the plan to the held list, in order, and the loop goes back to step 1.
   The loop ends on the first row whose `OUTCOME:` is `STOPPED`, stop reason that row's `DETAIL:`. It also ends on the first
   row whose `ENDS RUN:` is `yes`. The stop reason is then *the plan edited a plugin this run loaded — restart, then `/vwf:execute all`*. Otherwise go back to
   step 1.

Nothing is skipped past: a plan that stops ends the run, and the next plan waits for the person. The loop never unclaims, never resumes a stopped plan
itself, and never edits a folder or the plan index by hand. Its runners change the tree. The loop itself does only in the landing phase, through the
after-landing steps, and at the exit, through the worktree removal below.

### The landing phase

It lands the held list, in the order the plans were held. An empty list lands nothing.

1. **Read the consents**. For each held plan, read `consent.merge` and `after_landing` with `plan.mjs get`.
2. **The one question**. When one or more held plans read `false`, list them, then ask once, with one `AskUserQuestion`
   call: land all the held plans now? The plans share one branch, so the answer is for all of them.
   - **Yes** → go on to step 3.
   - **No** → no plan lands. The loop ends, stop reason *held plans not landed*. The exit names the branch and each held folder.
   - **No one to answer** → the same as **No**.

   When every held plan reads `true`, ask nothing.
3. **Land each, in order**. For each held plan, dispatch one runner as in *The loop* step 3, its block `shared worktree`,
   `land: yes` and `skip after-landing`. The runner resumes the folder, finds every unit green, and lands it per
   [land.md](../references/land.md), keeping the shared worktree. Record its return by *The loop* step 4. A `STOPPED` row ends
   the phase and the loop, as in step 5; the plans not yet landed stay held.
4. **The after-landing steps, each once**. From the main checkout, asking nothing, run each distinct command of the landed plans'
   `after_landing` lists, in the order the first plan that lists it was held, then each command of `.config/vwf.yaml`'s
   `after_landing:` key, in list order. A command already run in this phase runs not again. A step that exits non-zero stops the
   rest, as in [after-landing.md](../references/after-landing.md), and ends the loop.
5. Empty the held list.

### The exit

On any end other than `STOPPED` or a **No** at the landing phase, first run *The landing phase*, when the held list is not empty. Then:

1. **The shared worktree**. Remove it with a plain `git worktree remove <path>` from the main checkout, asking nothing, when every
   held plan landed. Otherwise name its path and branch.
2. **A stop lands nothing**. On a `STOPPED` end, the held plans stay held, on the shared branch under the stopped plan's commits.
   The loop does nothing more by itself: the person decides what comes next. Print the recommended next steps, in this order:
   - resume the stopped plan in a fresh session with its `RESUME:` command. Say that its landing merges the shared branch, so it
     lands the held plans' commits too, a held plan that reads `consent.merge` `false` among them;
   - then, for each held plan, `/vwf:execute <folder>` in a fresh session. Its resume finds every unit green and completes its
     landing: the status, the archive, the row and the after-landing steps.

A step that exits non-zero stops the rest, as in [after-landing.md](../references/after-landing.md). The exit reports it, its exit code and output, and every
step not run with its command. Then print one table — a row per runner dispatched, in order — then the stop reason and the one command that continues:

| Plan | Outcome | Detail | Resume |
| ---- | ------- | ------ | ------ |

The `ENDS RUN:` column is not printed; a `yes` shows as the stop reason. The continuing command is:

- the stopped row's `RESUME:` when a plan stopped, run by a person in a fresh session, with the next steps above;
- the branch to land by hand, and each held folder, after a **No** at the landing phase;
- `/vwf:execute all` in a restarted session after an `ENDS RUN: yes`;
- the stopped row's `RESUME:` after a cap (the runner's own `/vwf:handoff` wrote the reserved `next` handoff; the loop writes none);
- nothing when no plan was runnable.

Below the table, print one line per after-landing step of the landing phase — ran, failed or not run — with its command. A run that dispatched no runner prints the stop reason alone.
The exit asks nothing.

## Runner mode

A runner is the orchestrator `SKILL.md` describes, for the one folder it was handed, in a fresh context of its own. Everything in `SKILL.md` and the files it routes to **holds as written**. That covers the refusals, the claim, the worktree, the waves, the gates, the landing and the
after-landing steps. It covers every stop too, each the stop those files already define. What differs is only this:

- **The folder is given**. The runner resolves the folder it was handed, as `/vwf:execute <folder>` would: one
  `start.mjs <folder> --branch <integration>` call, the flags as [claim.md](../references/claim.md) says. Under a `shared worktree: <branch>` override it passes that worktree's repo-relative path
  as `--worktree`, so the claim's `run.worktree` names the shared worktree. It never runs `next` or `all`, and takes no second plan
  when its own lands or stops.
- **Its plan runs `solo`**, whatever the folder's `execution` reads. A runner can start teammates, but it ends its turn before their reports arrive. The reason in the `execution` event is
  *runner under all*.
- **It applies the overrides it is handed**. The dispatch prompt's overrides block, per *The overrides block* above, applies over the folder. It applies exactly as those
  files describe for an `all` override. `Overrides: none`, or no block, leaves the folder as recorded.
- **It returns the block and nothing else**. Every report those files write still goes where they put it: the folder's `status`, unit fields and `gaps`, the action log. Those reports are
  the final report, a pause's report, a refusal, the gap reconciliation and the chain-forward launch lines. What the runner sends back to the loop is the five lines
  below, and no line more. The chain-forward lines are not returned: the loop's next `next` finds an unblocked plan on its own.
  A skill's output — any `Skill` call, a vwf skill or a built-in — is input for the runner's next step, never its reply; after each `Skill` call the
  runner continues, and its last message is always the block.
- **It relays its questions; it asks no one itself**. A runner is a subagent, with no `AskUserQuestion`. Where `SKILL.md` asks the user, per
  [questions.md](../references/questions.md), the runner instead:
  - gives each question its plan-wide id with `log.mjs next-question`, and logs its `question` event before it returns;
  - waits until every unit it dispatched has returned, then returns `OUTCOME: QUESTION` with the `QUESTION Q<n> <owner>:`,
    `OPTIONS Q<n>:` and `WHY Q<n>:` lines of each open question, per *The return block* below;
  - on resume, by the loop's `SendMessage` or a fresh runner's `Answers:` block, records each answer per *Recording* and applies it by
    owner per *Resuming the owner* in [questions.md](../references/questions.md): a unit, a review finding, H7 or H8, a stage. It always
    dispatches a fresh agent for it, with its prompt, the questions, the answers and the note that its earlier edits are in the worktree;
    a fresh dispatch returns its result in the same turn;
  - on a resume reading *no one can answer*, does *No one to answer* of [questions.md](../references/questions.md) itself and returns
    `STOPPED`.

  A runner never resumes one of its agents with `SendMessage`: that agent's reply goes to the top session, which the runner cannot read.
  When the runner invokes a skill that could prompt, it passes the answer in the invocation:
  - the declared preferences those files name for `/vwf:git-workflow` and `plan-management archive`;
  - at a resource-cap pause, `/vwf:handoff prefer: the one thread is this plan's run`.

  Nothing answers a skill that asks regardless: the runner stops, `DETAIL:` naming the skill and its question.
- **Its subagents are one layer deeper**. The loop is the session, and the runner is layer one. The units, reviewers and docs unit it dispatches are layer two, and so are the
  `execute-engine` agents a review row dispatches. The docs-sync surveyor is layer three, the default nesting limit, and so are the agents
  `/code-review` starts inside an engine agent. A runner adds no layer of its own: it dispatches exactly what those files dispatch.

### The return block

```text
PLAN: <the folder, as handed>
OUTCOME: <COMPLETE | COMPLETE with gaps | HELD | QUESTION | STOPPED>
DETAIL: <the folder's status.detail, as last written>
RESUME: <the resume command, or none>
ENDS RUN: <yes | no>
```

Only on `OUTCOME: QUESTION`, the five lines are followed by three lines per open question, and nothing else:

```text
QUESTION Q<n> <owner>: <the question, readable alone>
OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> — <consequence> | <option 4> — <consequence>]
WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>
```

`Q<n>` is the plan-wide id and `<owner>` the unit, wave or stage, per *Ids and owners* in
[questions.md](../references/questions.md).

Under `skip after-landing`, `DETAIL:` adds `; after-landing: the loop's`.

- **`COMPLETE`**: the branch merged and pushed, the row went `COMPLETE`, and every after-landing step ran, save those `skip after-landing` left to the loop. The gap list was empty.
  `RESUME: none`.
- **`COMPLETE with gaps`**: the same landing with a gap open, or with `plan-management archive` raising a warning, so the folder stayed live.
  `RESUME: none`; the gaps are in the folder's `gaps`.
- **`HELD`**: under `hold landing`, every unit is green and committed on the shared branch, and the plan waits for the landing
  phase. The row stays `RUNNING`. `RESUME: /vwf:execute <folder>`, which completes the landing; `ENDS RUN: no`.
- **`QUESTION`**: the run is not over; it waits for the answers the question lines ask. `RESUME: none`, `ENDS RUN: no`.
- **`STOPPED`**: every other end. `RESUME:` is `/vwf:execute <folder>`, except where a line says otherwise:
  - a refusal at Resolve;
  - a hard halt;
  - a pause (a cap among them);
  - a blocked final report;
  - a merge conflict;
  - an after-landing step that exited non-zero: `RESUME:` is that step's command and the ones not run.
- **`ENDS RUN: yes`** only when the outcome is `COMPLETE` or `COMPLETE with gaps` and the folder's `consent.end_all_run` reads `true`. That key means *end an `all` run after
  landing*. The plan edited a plugin the run itself loads, so the next plan must start in a restarted session. `false` reads `no`. On `STOPPED` it reads `no`; the stop ends the run anyway.
