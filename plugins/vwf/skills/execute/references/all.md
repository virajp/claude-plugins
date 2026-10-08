# `all` — every runnable plan, each in its own runner (Resolve)

Read this when `$ARGUMENTS` is `all`, and when you are an `execute-runner`
handed one folder and this skill's `SKILL.md` — the second half, *Runner
mode*, is yours.

`/vwf:execute all` runs every runnable plan, highest priority first, one at a
time, each in its own runner subagent, and stops at the first point that
needs the user. The session that typed it is **the loop**: it asks the run's
questions once, it picks, it dispatches, it keeps a one-line result per plan,
it runs what the answers deferred to its exit, and it does nothing else — it
never reads a unit report or a Run log itself, and of a plan folder it reads
the Consent block and the After landing table alone, once, for the questions
— and of `.config/vwf.yaml`, the `after_landing:` key alone.
Plain `/vwf:execute <folder>` and `/vwf:execute next` are unchanged by any of
this.

## Run-level questions — once, before the first plan

A plan's folder answers every question its own run needs; these are questions
about the **run of several plans**, which no single folder can answer. Each
answer is an **override** of the plans' recorded steps for this run only —
passed to each runner in its dispatch prompt and written by the runner as one
`override:` row in that folder's Run log. A folder's Consent block is never
changed.

1. **The plans the loop will reach.** Invoke `plan-management list` and take
   the runnable rows — the `APPROVED` rows `next` would take — then add every
   `APPROVED` row whose each `requires:` entry is satisfied or is a row
   already in the set, repeating until no row joins. None → ask nothing; the
   loop's first pick ends it as before. Read each reached folder's Consent
   block and After landing table, and nothing else of it, and the
   `after_landing:` key of `.config/vwf.yaml`, when there is one.
2. **Ask the questions that apply, one per turn**, each a yes or no, holding
   the answers:
   - **One shared worktree** — always asked. All the reached plans run in one
     worktree on branch `all-<date>-<HHMM>`, the time this question is asked,
     refreshed from the integration branch before each plan, each plan landing
     in turn while the worktree is kept; the loop's exit removes it, except
     on a `STOPPED` end.
   - **Deduped after-landing steps** — asked when one step command would run
     after two or more reached plans: a plan step recorded `run` by two or
     more of them, or a command in `.config/vwf.yaml`'s `after_landing:` list,
     which runs after every landing, whenever two or more plans are reached.
     List each such command and its plans. Yes → each runs once, from the
     main checkout, after the last plan that landed — on an early stop too —
     and no runner runs it.
   - **Landing** — asked when a reached plan's Consent row *Merge to the
     integration branch and push on green* reads `no`. List every such plan
     together first, then ask once per plan, one per turn: land `<folder>`
     this run? Yes → that runner lands it as if the row read `yes`. No → it
     stops at its landing as recorded, and that stop ends the run.

   A **no** to any question leaves the plans' steps as recorded.
3. **After this step, nothing is asked** — not by the loop, not by a runner,
   until the exit, which asks nothing either.

### The overrides block

Each dispatch prompt carries the answers that touch its folder, after the two
paths, as this block — a line only when its answer was yes and it applies to
this folder, and `Overrides: none` when no line does:

```text
Overrides:
- shared worktree: <branch>
- skip as deduped: <command>; <command>
- land: yes
```

The runner applies each over the folder as `SKILL.md` describes for an `all`
override — Setup, Land, After landing — and writes the one Run log row
(`wave 0`, unit `override`, detail `override:` and the block's lines, `; `
between them) right after its preflight row.

## The loop

Run it in a session that has done nothing else: it cannot check that, so it
trusts it. Each runner is the fresh context its plan runs in; the loop's own
context grows only by the five-line return of each.

Once the run-level questions above are answered, each iteration, in order:

1. **Cap check.** When a resource-cap directive — the `PostToolUse` hook's,
   per the Pause Conditions in `SKILL.md` — has reached this session at any
   point, start no new plan: the loop ends, stop reason *resource cap*. The
   hook pauses a running runner the same way it pauses execute today, and that
   runner returns `STOPPED`; a runner's own context is not measured, only the
   session's figures the hook reads, and the 5-hour and 7-day figures are
   account-wide.
2. **Pick.** Invoke `plan-management next`. Nothing runnable → the loop ends,
   stop reason the message the verb returns: each `APPROVED` row and what it
   waits on, or that the table is absent or holds no rows. On a pick, print
   one line — the folder, its `Kind` and its `Priority` — and nothing of the
   other rows.
3. **Dispatch one runner.** One `Agent` call,
   `subagent_type: "vwf:execute-runner"` — the `execute-runner` agent —
   named `run-<n>` for the iteration's number, never with
   `isolation: "worktree"` (the runner cuts its own, per Setup, or reuses the
   shared one). The prompt is two paths and the overrides block, and nothing
   else: the picked folder, repo-relative, the **absolute** path of this
   skill's `SKILL.md` — the base directory this skill was loaded from, plus
   `/SKILL.md` — and the block for that folder. No conversation context, no
   recall, no instruction beyond *run this folder in runner mode*. Runners
   never run in parallel: dispatch the next only once this one has returned.
4. **Record the return.** The runner's reply is five lines, per *The return
   block* below. Keep them as one row of the loop's table. A reply that is not
   those five lines — an agent error, a death, free prose — is never
   re-dispatched, since a dead runner may hold a claim or a worktree half-way:
   the row reads `STOPPED`, detail *runner returned no block*, resume
   `/vwf:execute <folder>`, and the loop ends there.
5. **Continue or end.** The loop ends on the first row whose `OUTCOME:` is
   `STOPPED`, stop reason that row's `DETAIL:`; or on the first row whose
   `ENDS RUN:` is `yes`, stop reason *the plan edited a plugin this run
   loaded — restart, then `/vwf:execute all`*. Otherwise go back to step 1.

Nothing is skipped past: a plan that stops ends the run, and the next plan
waits for the person. The loop never unclaims, never resumes a stopped plan
itself, and never edits a folder or the plan index by hand. Its runners
change the tree; the loop itself does only at the exit, through the deferred
steps and the worktree removal below.

### The exit

On any end, first run what the answers deferred, from the main checkout, in
this order and asking nothing:

1. **The deduped steps** — each command the deduped answer named that would
   have run after a plan which landed this run (`COMPLETE` or
   `COMPLETE with gaps`) — recorded in its table, or in the `after_landing:`
   key — once, in the order the first such plan's table lists them, then the
   key's commands in list order — on an early stop too. None landed → none
   runs.
2. **The shared worktree** — removed with a plain
   `git worktree remove <path>` from the main checkout, asking nothing, on
   every exit except a `STOPPED` one — the stopped plan's resume runs in the
   worktree its status line names — and then the exit names its path and
   branch instead.

A step that exits non-zero stops the rest, as in `SKILL.md`'s *After
landing*: the exit reports it, its exit code and output, and every step not
run with its command. Then print one table — a row per runner dispatched, in
order — then the stop reason and the one command that continues:

| Plan | Outcome | Detail | Resume |
| ---- | ------- | ------ | ------ |

The `ENDS RUN:` column is not printed; a `yes` shows as the stop reason. The
continuing command is the stopped row's `RESUME:` when a plan stopped — run
by a person in a fresh session — `/vwf:execute all` in a restarted session
after an `ENDS RUN: yes`, the stopped row's `RESUME:` after a cap (the
runner's own `/vwf:handoff` wrote the reserved `next` handoff; the loop
writes none), and nothing when no plan was runnable. Below the table, one
line per deferred step — ran, failed or not run — with its command. A
run that dispatched no runner prints the stop reason alone. The exit asks
nothing.

## Runner mode

A runner is the orchestrator `SKILL.md` describes, for the one folder it was
handed, in a fresh context of its own. **Everything in `SKILL.md` holds as
written** — the refusals, the claim, the worktree, the waves, the gates, the
landing, the after-landing steps, and every stop, each the stop that file
already defines. What differs is only this:

- **The folder is given.** The runner resolves the folder it was handed, as
  `/vwf:execute <folder>` would; it never runs `next` or `all`, and takes no
  second plan when its own lands or stops.
- **It applies the overrides it is handed.** The dispatch prompt's
  overrides block, per *The overrides block* above, applies over the folder
  exactly as `SKILL.md` describes for an `all` override; `Overrides: none`,
  or no block, leaves the folder as recorded.
- **It returns the block and nothing else.** Every report `SKILL.md` writes —
  the final report, a pause's report, a refusal, the gap reconciliation, the
  chain-forward launch lines — still goes where that file puts it: the
  folder's Status block, Run log and gap section, the run journal. What the
  runner sends back to the loop is the five lines below, and no line more.
  The chain-forward lines are not returned: the loop's next `next` finds an
  unblocked plan on its own.
- **It asks nothing, of anyone.** `SKILL.md` already asks the user nothing;
  under runner mode there is no user to ask, so a point that would need one is
  a stop with its resume command, returned as `STOPPED`. When the runner
  invokes a skill that could prompt, it passes the answer in the invocation:
  the declared preferences `SKILL.md` names for `/vwf:git-workflow` and
  `plan-management archive`, and at a resource-cap pause `/vwf:handoff` with
  no argument, told that the one thread to hand off is this plan's run. A
  skill that asks regardless is answered by nothing — the runner stops,
  `DETAIL:` naming the skill and its question.
- **Its subagents are one layer deeper.** The loop is the session, the runner
  layer one, the units, reviewers and docs unit it dispatches layer two, and
  the docs-sync surveyor layer three — the default nesting limit. A runner
  adds no layer of its own: it dispatches exactly what `SKILL.md` dispatches.

### The return block

```text
PLAN: <the folder, as handed>
OUTCOME: <COMPLETE | COMPLETE with gaps | STOPPED>
DETAIL: <the folder's Status block detail line, as last written>
RESUME: <the resume command, or none>
ENDS RUN: <yes | no>
```

Under an override, `DETAIL:` adds `; skipped: <commands>` for the steps the
block deferred to the loop's exit.

- **`COMPLETE`** — the branch merged and pushed, the row went `COMPLETE`, and
  every after-landing step ran, save those the overrides skipped;
  the gap list was empty. `RESUME: none`.
- **`COMPLETE with gaps`** — the same landing with a gap open, or with
  `plan-management archive` raising a warning, so the folder stayed live.
  `RESUME: none`; the gaps are in the folder's gap section.
- **`STOPPED`** — every other end: a refusal at Resolve, a hard halt, a pause
  (a cap among them), a blocked final report, a merge conflict, the Consent
  row reading `no` with no `land: yes` override (the branch waits to be
  landed by hand — `RESUME:` names the branch), or an after-landing step that
  exited non-zero (`RESUME:` is that step's command and the ones not run).
  `RESUME:` is otherwise `/vwf:execute <folder>`.
- **`ENDS RUN: yes`** only when the outcome is `COMPLETE` or
  `COMPLETE with gaps` and the folder's Consent block holds the row
  *End an `all` run after landing* reading `yes` — the plan edited a plugin
  the run itself loads, so the next plan must start in a restarted session.
  A folder without that row reads `no`. On `STOPPED` it reads `no`; the stop
  ends the run anyway.
