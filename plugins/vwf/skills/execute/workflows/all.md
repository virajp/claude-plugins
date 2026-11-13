# `all` — every runnable plan, each in its own runner

Read this when the argument is `all`, and when you are an `execute-runner` handed one folder and
this skill's `SKILL.md`. The second half, *Runner mode*, is yours.

`/vwf:execute all` runs every runnable plan, highest priority first, one at a time, each in its own
runner subagent. A question a runner cannot settle is relayed: the runner returns it, the loop asks the
user and resumes the runner with the answer, per *The loop* step 4. It stops at the first point it cannot settle.

The session that typed it is **the loop**. It asks the run's questions once, picks, dispatches, and keeps a
one-line result per plan. It runs what the answers deferred to its exit, and does nothing else. It never reads
a unit report or a unit's state itself. Of a plan folder it reads `consent` and `after_landing` alone, once,
for the questions, with `plan.mjs get`. Of `.config/vwf.yaml` it reads the `after_landing:` key alone.

`plan.mjs` names `node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`, as in
[the plan files](../references/plan-files.md). Plain `/vwf:execute <folder>` and `/vwf:execute next` are
unchanged by any of this.

Before anything else, the loop runs the format test of `SKILL.md`, once. On the old format it prints the
migration message and stops, asking nothing and dispatching no runner. A repo with neither
`docs/plans/index.md` nor `docs/plans/index.json` has no runnable plan, and the loop ends as step 2 of *The
loop* does.

## Run-level questions — once, before the first plan

A plan's folder answers every question its own run needs. These are questions about the **run of several
plans**, which no single folder can answer. Each answer is an **override** of the plans' recorded steps for this
run only. It is passed to each runner in its dispatch prompt, and written by the runner as one entry of that
folder's `overrides` list. A folder's `consent` is never changed.

1. **The plans the loop will reach**. Invoke `plan-management list`, which reads `docs/plans/index.json`, and take
   the runnable rows: the `APPROVED` rows `next` would take. Then add every `APPROVED` row whose each `requires`
   entry is satisfied or is a row already in the set. Repeat until no row joins. None → ask nothing; the loop's
   first pick ends it as before. Read each reached folder's `consent` and `after_landing`, and nothing else of it.
   Read the `after_landing:` key of `.config/vwf.yaml`, when there is one.
2. **Ask the questions that apply, one per turn**, each a yes or no, holding the answers:
   - **One shared worktree** — always asked. All the reached plans run in one worktree on branch
     `all-<date>-<HHMM>`, the time this question is asked. It is refreshed from the integration branch before each
     plan, each plan landing in turn while the worktree is kept. The loop's exit removes it, except on a `STOPPED`
     end.
   - **Deduped after-landing steps** — asked when one step command would run after two or more reached plans. That
     is an `after_landing` `step` recorded by two or more of them. It is also a command in `.config/vwf.yaml`'s
     `after_landing:` list, which runs after every landing, whenever two or more plans are reached. List each such command and its
     plans. Yes → each runs once, from the main checkout, after the last plan that landed, on an early stop too, and no
     runner runs it.
   - **Landing** — asked when a reached plan's `consent.merge`, *merge to the integration branch and push on green*,
     reads `false`. List every such plan together first, then ask once per plan, one per turn: land `<folder>` this run?
     Yes → that runner lands it as if the row read `yes`. No → it stops at its landing as recorded, and that stop ends
     the run.

   A **no** to any question leaves the plans' steps as recorded.
3. **After this step, no run-level question is asked**, until the exit. The exit asks nothing either. The one other
   question the loop asks is a runner's relayed question, per *The loop* step 4; a runner itself asks no one.

### The overrides block

Each dispatch prompt carries the answers that touch its folder, after the two paths, as this block. A line appears only
when its answer was yes and it applies to this folder, and `Overrides: none` when no line does:

```text
Overrides:
- shared worktree: <branch>
- skip as deduped: <command>; <command>
- land: yes
```

The runner applies each over the folder as Setup ([setup.md](../references/setup.md)), Land ([land.md](../references/land.md))
and After landing ([after-landing.md](../references/after-landing.md)) describe for an `all` override. Right after its preflight,
it appends the one entry, the block's lines joined by `; `, `O<n>` one past the highest `O` id in the list:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs append <folder>/index.json overrides --json '{"id": "O<n>", "text": "<line>; <line>"}'
```

It never changes `consent`. `Overrides: none`, or no block, appends nothing.

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

Once the run-level questions above are answered, each iteration, in order:

1. **Cap check**. A resource-cap directive is the `PostToolUse` hook's, per the Pause Conditions in
   [pause.md](../references/pause.md). When one has reached this session at any point, start no new plan. The loop ends, stop reason
   *resource cap*. The hook pauses a running runner the same way it pauses execute today, and that runner returns `STOPPED`. A
   runner's own context is not measured, only the session's figures the hook reads. The 5-hour and 7-day figures are
   account-wide.
2. **Pick**. Run `plan.mjs pick` (the loop's re-pick: it picks and claims nothing; the runner's `start.mjs` claims). Exit 1,
   `{nothing: [{folder, waits}]}` → the loop ends, stop reason each `APPROVED` row and what it waits on, or that the index is
   absent or holds no rows. On a pick, `{pick: {folder, kind, priority}}`, print one line: the folder, its `kind` and its
   `priority`. Print nothing of the other rows.
3. **Dispatch one runner**. Make one `Agent` call, `subagent_type: "vwf:execute-runner"` (the `execute-runner` agent). Start its `description` with `run-<n>` for
   the iteration's number, and give it no `name`: with agent teams on, a `name` makes the runner a teammate, and a teammate's named agents fail. Never pass `isolation: "worktree"`: the runner cuts its own, per Setup, or reuses the shared one. The prompt
   is two paths and the overrides block, and nothing else:
   - the picked folder, repo-relative;
   - the **absolute** path of this skill's `SKILL.md`, the base directory this skill was loaded from plus `/SKILL.md`;
   - the block for that folder;
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
5. **Continue or end**. The loop ends on the first row whose `OUTCOME:` is `STOPPED`, stop reason that row's `DETAIL:`. It also ends on the first
   row whose `ENDS RUN:` is `yes`. The stop reason is then *the plan edited a plugin this run loaded — restart, then `/vwf:execute all`*. Otherwise go back to
   step 1.

Nothing is skipped past: a plan that stops ends the run, and the next plan waits for the person. The loop never unclaims, never resumes a stopped plan
itself, and never edits a folder or the plan index by hand. Its runners change the tree. The loop itself does only at the exit, through the deferred
steps and the worktree removal below.

### The exit

On any end, first run what the answers deferred, from the main checkout, in this order and asking nothing:

1. **The deduped steps**. Take each command the deduped answer named that would have run after a plan which landed this run.
   A landed plan reads `COMPLETE` or `COMPLETE with gaps`. The command is recorded in that plan's table or in the `after_landing:` key. Run each once, on an early stop too. Go in the order the
   first such plan's table lists them, then the key's commands in list order. None landed → none runs.
2. **The shared worktree**. Remove it with a plain `git worktree remove <path>` from the main checkout, asking nothing, on every exit except a `STOPPED` one.
   The stopped plan's resume runs in the worktree its status line names. On a `STOPPED` exit, name its path and branch instead.

A step that exits non-zero stops the rest, as in [after-landing.md](../references/after-landing.md). The exit reports it, its exit code and output, and every
step not run with its command. Then print one table — a row per runner dispatched, in order — then the stop reason and the one command that continues:

| Plan | Outcome | Detail | Resume |
| ---- | ------- | ------ | ------ |

The `ENDS RUN:` column is not printed; a `yes` shows as the stop reason. The continuing command is:

- the stopped row's `RESUME:` when a plan stopped, run by a person in a fresh session;
- `/vwf:execute all` in a restarted session after an `ENDS RUN: yes`;
- the stopped row's `RESUME:` after a cap (the runner's own `/vwf:handoff` wrote the reserved `next` handoff; the loop writes none);
- nothing when no plan was runnable.

Below the table, print one line per deferred step — ran, failed or not run — with its command. A run that dispatched no runner prints the stop reason alone.
The exit asks nothing.

## Runner mode

A runner is the orchestrator `SKILL.md` describes, for the one folder it was handed, in a fresh context of its own. Everything in `SKILL.md` and the files it routes to **holds as written**. That covers the refusals, the claim, the worktree, the waves, the gates, the landing and the
after-landing steps. It covers every stop too, each the stop those files already define. What differs is only this:

- **The folder is given**. The runner resolves the folder it was handed, as `/vwf:execute <folder>` would: one
  `start.mjs <folder>` call. Under a `shared worktree: <branch>` override it passes that worktree's repo-relative path
  as `--worktree`, so the claim's `run.worktree` names the shared worktree. It never runs `next` or `all`, and takes no second plan
  when its own lands or stops.
- **Its plan runs `solo`**, whatever the folder's `execution` reads. A runner can start teammates, but it ends its turn before their reports arrive. The reason in the `execution` event is
  *runner under all*.
- **It applies the overrides it is handed**. The dispatch prompt's overrides block, per *The overrides block* above, applies over the folder. It applies exactly as those
  files describe for an `all` override. `Overrides: none`, or no block, leaves the folder as recorded.
- **It returns the block and nothing else**. Every report those files write still goes where they put it: the folder's `status`, unit fields and `gaps`, the action log. Those reports are
  the final report, a pause's report, a refusal, the gap reconciliation and the chain-forward launch lines. What the runner sends back to the loop is the five lines
  below, and no line more. The chain-forward lines are not returned: the loop's next `next` finds an unblocked plan on its own.
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

  One question differs: the continue-or-stop of an unknown language, asked before the claim (*An unknown language* in
  [claim.md](../references/claim.md)). It records nothing: no log is open, so it takes no `log.mjs next-question` id and no
  `question` event — its id is one past the highest `Q<n>` in the folder's `decisions` and `gaps` text, its owner `setup` — and
  its answer writes no `answer` event and no `decisions` entry, from a `SendMessage` resume or an `Answers:` block alike. On
  continue, the runner runs `start.mjs` again with `--continue-unknown-language`; on stop, or *no one can answer*, it returns
  `STOPPED`, nothing claimed.

  A runner never resumes one of its agents with `SendMessage`: that agent's reply goes to the top session, which the runner cannot read.
  When the runner invokes a skill that could prompt, it passes the answer in the invocation:
  - the declared preferences those files name for `/vwf:git-workflow` and `plan-management archive`;
  - at a resource-cap pause, `/vwf:handoff prefer: the one thread is this plan's run`.

  Nothing answers a skill that asks regardless: the runner stops, `DETAIL:` naming the skill and its question.
- **Its subagents are one layer deeper**. The loop is the session, and the runner is layer one. The units, reviewers and docs unit it dispatches are layer two. The docs-sync
  surveyor is layer three, the default nesting limit. A runner adds no layer of its own: it dispatches exactly what those files dispatch.

### The return block

```text
PLAN: <the folder, as handed>
OUTCOME: <COMPLETE | COMPLETE with gaps | QUESTION | STOPPED>
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

Under an override, `DETAIL:` adds `; skipped: <commands>` for the steps the block deferred to the loop's exit.

- **`COMPLETE`**: the branch merged and pushed, the row went `COMPLETE`, and every after-landing step ran, save those the overrides skipped. The gap list was empty.
  `RESUME: none`.
- **`COMPLETE with gaps`**: the same landing with a gap open, or with `plan-management archive` raising a warning, so the folder stayed live.
  `RESUME: none`; the gaps are in the folder's `gaps`.
- **`QUESTION`**: the run is not over; it waits for the answers the question lines ask. `RESUME: none`, `ENDS RUN: no`.
- **`STOPPED`**: every other end. `RESUME:` is `/vwf:execute <folder>`, except where a line says otherwise:
  - a refusal at Resolve;
  - a hard halt;
  - a pause (a cap among them);
  - a blocked final report;
  - a merge conflict;
  - `consent.merge` reading `false` with no `land: yes` override: the branch waits to be landed by hand, and `RESUME:` names the branch;
  - an after-landing step that exited non-zero: `RESUME:` is that step's command and the ones not run.
- **`ENDS RUN: yes`** only when the outcome is `COMPLETE` or `COMPLETE with gaps` and the folder's `consent.end_all_run` reads `true`. That key means *end an `all` run after
  landing*. The plan edited a plugin the run itself loads, so the next plan must start in a restarted session. `false` reads `no`. On `STOPPED` it reads `no`; the stop ends the run anyway.
