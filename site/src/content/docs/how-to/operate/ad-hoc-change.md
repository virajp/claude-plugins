---
title: "Change something the blueprint does not describe"
description: "Plan and run work with no blueprint slice behind it — tooling, CI, docs, a refactor — without inventing a flow to hang it on."
order: 4
---

Not everything you change is a product behavior. The release notes are pasted by
hand and should come from CI. A docs tree has drifted. Two packages should share
a lint config. A module wants restructuring without moving a single behavior.
None of that is a flow, none of it belongs in `docs/blueprint/`, and pushing it
through `/vwf:plan` would mean inventing a slice to hang it on.

That work has its own planner:
**[`/vwf:change-plan`](../../plugins/vwf.md#vwfchange-plan)** writes a plan
folder and queues it in `docs/plans/index.md`, and the one executor,
**[`/vwf:execute`](../../plugins/vwf.md#vwfexecute)**, runs it unattended in a
fresh session — by name, or `next` to take the queue's pick. The planner sits
beside the chain rather than in it, and reads neither the blueprint nor the
architecture registry; the executor reads the blueprint only for a plan that
covers a slice. The folder it writes and the index it queues in are the same
ones `/vwf:plan` uses; what differs is what runs over a unit.

The worked example picks up **Relay**, the team task manager from
[start a product from an empty repo](../greenfield/single-repo.md), some months
after its first deploy. Relay ships from a tag, and its release notes are
assembled by hand every time. The change: generate them in CI from the merged
pull requests, and delete the hand-written step from the contributing guide.

Mechanics — the folder format, the halt conditions, what each status means —
live in the [vwf plugin manual](../../plugins/vwf.md). This guide covers the
journey and the decisions.

## Is it a slice or a change?

One question decides it: **does the blueprint say anything about this?**

- A flow, an entity, an API operation, a screen — something a user or an
  integrator experiences — is a **slice**. It goes to `/vwf:blueprint` first if
  the contract does not describe it yet, then
  [`/vwf:plan`](../../plugins/vwf.md#vwfplan) →
  [`/vwf:execute`](../../plugins/vwf.md#vwfexecute), with TDD, a coverage gate
  and an implementation stamp.
- Everything else — the toolchain, CI, the gates, the docs, a refactor that
  moves no behavior, a tree the blueprint never modelled — is a **change**.

When it is genuinely both — a CI change that also alters an API's published
version, say — plan the slice and let the change ride along in its cycle plan;
both pairs write the same folder shape, so nothing is lost by folding it in. Two
folders for one landing is how you get two merge conflicts.

You do not always have to make that call yourself.
[`/vwf:feedback`](../../plugins/vwf.md#vwffeedback) asks the same question of
every report it takes, and one of its eight classes is *not a blueprint gap* —
which hands the report here, verbatim, with the reason it was ruled outside the
blueprint. So a production report about tooling or docs reaches `change-plan`
without ever being forced into a flow it does not fit.

## The journey

### 1. Ask for the plan, not the change

```text
/vwf:change-plan "generate the release notes in CI instead of by hand"
```

The first thing it does is **read before it asks**. It looks through
`docs/memory/decisions/`, the last archived plan that touched the same tree, the
base repo's [backlog project](../../plugins/vwf.md#vwfbacklog) through
`/vwf:backlog list` if the product keeps one — the request is often an item
already on it, and the ids it covers go into the plan's `backlog:` frontmatter;
when `gh` cannot reach the project the recall says so and reads nothing — and
the memory palace's `planning`, `decisions` and `gaps` rooms. This matters more
than it sounds: Relay's release-notes request turns out to be sitting in the
*Parked* list of the plan that set up its CI six weeks earlier, together with
the reason it was deferred. That is a fact the interview now does not have to
re-derive, and a decision it will not accidentally reverse in silence.

Then it surveys — concurrent `Explore` subagents that return `file:line`
conclusions rather than file contents, so the session stays small enough to hold
a conversation afterwards.

Two of those reads exist because earlier runs got them wrong. It reads your
repo's **commit convention**, so every unit's commit line already uses a type
your commit-message hook accepts rather than one that has to be swapped at the
last moment. And when the request **retires or renames** something — Relay's
hand-written release-notes step is exactly that — it greps that name across
every tree you have, and every hit gets an owner in the unit map before you are
shown the plan. A hit with no owner is what becomes a stray doc edit halfway
through the run.

If your request is really several things, it says so **before** refining any of
them, and proposes one folder per piece with an order. Relay's is: the CI change
first, the contributing-guide cleanup inside it, and "switch the whole repo to a
different task runner" — which you mentioned in passing — parked, not absorbed.

### 2. Answer one question at a time

The interview is one decision per turn, never batched, and it asks only what has
more than one reasonable answer given the repo. Where there is a real choice it
puts two or three approaches in front of you with their trade-offs and a
recommendation, and records the one you pick **with the alternative it
rejected** — which is what stops the next plan re-opening the same argument.

Three of the questions are the ones that make the run unattended later, and they
are worth answering carefully:

- **The wave gate.** The exact commands the run must pass, proposed from your
  repo's own task list and its `harness:` stamp. Relay's is its lint task, its
  test task, and the workflow linter. `/vwf:execute` runs **what is written and
  nothing it infers** — a check you leave out is a check the run will not do,
  however obvious it looks in the tree. It also runs the whole gate once
  **before** the first wave, so every line has to be green on the untouched
  branch — which means a check that can only pass once one of the units has
  landed does not belong here. That one goes in the unit's own verification. If
  the repo has no task runner and no stamp, the answer is `none`, and the plan
  says plainly that the wave review is then the only gate.
- **The after-landing steps.** What happens once the branch is in. Each one is
  recorded `run` or `ask`, here, whether it stages something on your machine or
  ships a release: a `run` step runs on a green landing without a prompt — the
  yes you give now is the consent — and an `ask` step stops the run once before
  it and waits. An empty list is a perfectly good answer.
- **The release intent.** Per project the change touches: does a user see a
  difference, and what command ships it. Recorded as `none`, `patch`, `minor` or
  `major`. Relay's answer is `none` — CI plumbing, no user-visible change — so
  nothing ships and the version stays put.

A release recorded here is **intent, not authorization** — unless its
after-landing step is recorded `run`, in which case this answer is the consent
and the run ships it on a green landing. Saying `minor` with an `ask` step, or
no step, authorizes nothing; the run still stops and asks in the moment.

### 3. Approve the shape, then walk away

Nothing has been written to disk yet. The plan is presented as a shape first:
the goal and any standing decision it reverses, the assumed-decisions table, the
unit map with each unit's owned paths, every new third-party dependency any unit
would add, the gates, the consent block and the parked list.

Read the **unit map** and the **decisions table** properly; they are the review
surface. A unit is one subagent with one commit and no memory of this
conversation, so anything you would have to explain in person has to be in its
file. Units in the same wave own disjoint paths — that is the rule that lets
them run concurrently without fighting over a file.

Then: **approve**, **revise** or **abandon**. Abandoning leaves nothing on disk
except a one-line note the next attempt can recall. Approving writes
`docs/plans/2026-09-08-ci-release-notes/` — an `index.md` plus one file per
unit.

Then it finishes the hand-off for you. A row for the plan is appended to the one
table of `docs/plans/index.md` — the queue every plan of either kind sits in,
this one with `Kind` `change` — reading `APPROVED`, with a **priority** it works
out rather than asks: `10` for a plan that requires nothing still active, `10`
more than the highest `Priority` value among the plans it requires otherwise, so
a chain runs in order. Any backlog item the plan covers is marked `planned` with
this folder as its path — an edit to the project on the forge, nothing in the
tree — and the folder and the index are **committed and pushed on the branch you
are on** — in place, no worktree, nothing merged. That is not housekeeping: the
next step runs in a worktree cut from the integration branch, and it can only
see a folder that is already committed there. A folder left untracked ends up
swept into some later commit of the run instead. Only then does it print the
launch line.

It does not start executing, and that is deliberate.

### 4. Run it in a fresh session

Open a new session, `/clear` or a new window, and paste the launch line:

```text
/vwf:execute docs/plans/2026-09-08-ci-release-notes
```

or, when you would rather the queue decide:

```text
/vwf:execute next
```

`next` reads that table — every row, cycle plan and change plan alike — and
takes the `APPROVED` row of lowest priority whose requirements have all landed,
tells you which it took and why the others were passed over, and runs it as if
you had named it. With Relay's one plan in the queue the two lines do the same
thing; with several, `next` is how a chain runs in order without you typing each
folder.

The fresh session is the whole point: the planning session's context was a
survey and an interview, and none of it should ride along into the run. The
skill is user-only for the same reason — nothing else can promise you a clean
window.

It refuses a folder that is not committed on the integration branch, which after
a normal approval it always is. If you wrote or moved one by hand, commit and
push it first — or re-run `/vwf:change-plan` on it — then re-launch.

The first thing it does is **claim the plan**: the row in `docs/plans/index.md`
is set to `RUNNING` in a commit pushed on the integration branch, before any
worktree exists. That pushed row is what makes a second session safe: another
`/vwf:execute next` running at the same time sees the row taken and picks
something else, and if two sessions race for the same row, the push that lands
second is rejected, so that session re-reads the queue and re-picks — or, for a
named folder, stops and tells you another session has it. A `RUNNING` row is
never taken over, however long it has sat there; if the session that claimed it
is gone, set the row back to `APPROVED` by hand in a commit on the integration
branch, and the plan is runnable again.

From there you are not needed. It creates one worktree, runs `/vwf:doctor` and
the plan's gate once as a preflight (a red line here is the branch's problem,
not the plan's, and it says so rather than fixing it), then works wave by wave:
every unit in a wave — all `edit` units, in a change plan — dispatched at once
as its own subagent, a reviewer over the wave's diff with at most two rounds of
findings, the gate again, and one commit per green unit. Each of those commits
stages only what that unit owns, and unstages anything else that reached the
index first, so one unit's work never rides another's commit. The two-round loop
has one exception: a docs finding in a file no unit owns has nowhere to loop
back to, so it goes to the docs unit, which is given that passage to own for the
rest of the run, and you see it in the report as a `GAP:`. The last two units
are fixed — a docs unit that runs
[`/vwf:docs-sync`](../../plugins/vwf.md#vwfdocs-sync) over the branch delta, and
a gates-and-bump unit. Relay's docs unit is what actually deletes the
hand-written step from the contributing guide.

The orchestrator never reads a unit's files itself, so a long run costs you the
size of the reports, not the size of the diff.

### 5. Read the report, then answer the one question

The final report is rendered from the run log rather than from memory — by then
the run may have spanned dozens of dispatches. It gives you every unit with its
outcome and commit, every `GAP:` a unit proceeded past and the assumption it
took — including every unit whose owned paths the run widened, with the finding
that widened them (read these) — the review findings that survived the cap, the
gate results, and the worktree path.

If everything is green it marks every backlog item the plan covered `done`,
archives the folder to `docs/plans/archived/` (a landing with a gap still open
leaves the folder live instead, to be archived when you ask), and lands per the
consent you recorded. Once the merge is in, one more commit on the integration
branch sets the plan's row to `COMPLETE`, pointing at the archived folder, and
drops every `COMPLETE` row that no waiting plan still requires — the queue only
ever holds what is waiting, running, or still needed. Then it walks the
after-landing steps on the mode you recorded: a `run` step runs without a
prompt, and before an `ask` step it stops **once** to say what the step would do
and wait for your yes — that yes covers that step and nothing else.

"Not yet" is offered as an equal option, not a fallback — where a step stages
something, only a **restarted** session will pick it up. Coming back to the
remaining `ask` steps tomorrow is a normal ending, and the table still names
them.

## When it stops early

A failure does not abandon the run. The unit that failed, and everything
depending on it, is skipped; the rest carries on, and the run stops **once at
the end** with everything it needs — never mid-wave with "how should I proceed".

What you get is the same final report, plus a `BLOCKED` status naming the ruling
that is missing. Resuming is two steps:

1. Write the answer into `index.md` where the block names it — the ruling in the
   decisions table, the scope in the unit file. Everything already green stays
   green.
2. Re-run the same command. It reads the status, sees a resume, and starts at
   the first unit that is not `green`.

A context cap ends the same way: rows written, green units committed, the status
set to `RUNNING — paused at wave <n> for context`, and the launch line to
re-run. Nothing that has landed is redone.

A **merge conflict at the landing** is the one hard halt: the worktree is kept,
the status goes to `BLOCKED`, and the conflicting files are named. Resolve it
and land through [`/vwf:git-workflow`](../../plugins/vwf.md#vwfgit-workflow)
yourself.

A plan you decide **not** to run at all is retired the same way a completed one
is: ask for it to be archived, and the session invokes
[`plan-management`](../../plugins/vwf.md#vwfplan-management)'s `archive` verb,
which moves the whole folder into `docs/plans/archived/` and marks its Status as
archived-and-not-run, naming what it was before — gives its row in
`docs/plans/index.md` the same `COMPLETE`-and-sweep edit a landing would — and
marks every backlog item the folder still has open `done`, so nothing is left
waiting on a plan that will not run. Nothing is deleted, and the next plan's
recall still reads it.

## What this will not do for you

- **It will not read the blueprint**, so it will not notice that your "small
  refactor" changes a contract. That judgment is step 0 of this guide, and it is
  yours.
- **It will not gate on what you did not name.** The wave gate is a list you
  wrote in the interview.
- **It will not pick up an item from *Out of scope* or *Parked***, however
  adjacent it looks once the run is underway. That is what the next plan's
  recall is for.
- **It will not release anything you did not consent to.** A publishing step
  recorded `run` ships because you said so at the interview; one recorded `ask`,
  or a release intent with no step behind it, stops the run and asks.

## Where to go next

- The command reference for both halves:
  [`/vwf:change-plan`](../../plugins/vwf.md#vwfchange-plan) and
  [`/vwf:execute`](../../plugins/vwf.md#vwfexecute).
- If the change turned out to be a slice after all:
  [keep the blueprint true once the product is live](./production-feedback-loop.md).
- If the planning session is going to outlast its window:
  [hand off work that outlives one session](./sessions-and-handoff.md).
