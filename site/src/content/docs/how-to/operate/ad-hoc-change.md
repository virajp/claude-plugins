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

That work has its own pair:
**[`/vwf:change-plan`](../../plugins/vwf.md#vwfchange-plan)** writes a plan
folder, and **[`/vwf:change-execute`](../../plugins/vwf.md#vwfchange-execute)**
runs it unattended in a fresh session. They sit beside the chain rather than in
it, and they read neither the blueprint nor the architecture registry.

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
version, say — plan the slice and let the change ride along in its cycle plan.
Two folders for one landing is how you get two merge conflicts.

## The journey

### 1. Ask for the plan, not the change

```text
/vwf:change-plan "generate the release notes in CI instead of by hand"
```

The first thing it does is **read before it asks**. It looks through
`docs/memory/decisions/`, the last archived plan that touched the same tree, and
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
  test task, and the workflow linter. `/vwf:change-execute` runs **what is
  written and nothing it infers** — a check you leave out is a check the run
  will not do, however obvious it looks in the tree. It also runs the whole gate
  once **before** the first wave, so every line has to be green on the untouched
  branch — which means a check that can only pass once one of the units has
  landed does not belong here. That one goes in the unit's own verification. If
  the repo has no task runner and no stamp, the answer is `none`, and the plan
  says plainly that the wave review is then the only gate.
- **The after-landing steps.** What happens once the branch is in. Each is
  marked `run` — done unprompted, publishes nothing, cuts no tag, reaches nobody
  but this machine — or `ask`, where the run stops and asks first. Every release
  step is `ask`. An empty list is a perfectly good answer.
- **The release intent.** Per project the change touches: does a user see a
  difference, and what command ships it. Recorded as `none`, `patch`, `minor` or
  `major`. Relay's answer is `none` — CI plumbing, no user-visible change — so
  nothing ships and the version stays put.

A release recorded here is **intent, not authorization**. Saying `minor` now
does not authorize anything; the run still stops and asks in the moment.

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
`docs/plans/2026-09-08-ci-release-notes/` — an `index.md` plus one file per unit
— and ends with a launch line.

It does not start executing, and that is deliberate.

### 4. Run it in a fresh session

Open a new session, `/clear` or a new window, and paste the launch line:

```text
/vwf:change-execute docs/plans/2026-09-08-ci-release-notes
```

The fresh session is the whole point: the planning session's context was a
survey and an interview, and none of it should ride along into the run. The
skill is user-only for the same reason — nothing else can promise you a clean
window.

From there you are not needed. It creates one worktree, runs the plan's gate
once as a preflight (a red line here is the branch's problem, not the plan's,
and it says so rather than fixing it), then works wave by wave: every unit in a
wave dispatched at once as its own subagent, a reviewer over the wave's diff
with at most two rounds of findings, the gate again, and one commit per green
unit. Each of those commits stages only what that unit owns, and unstages
anything else that reached the index first, so one unit's work never rides
another's commit. The two-round loop has one exception: a docs finding in a file
no unit owns has nowhere to loop back to, so it goes to the docs unit, which is
given that passage to own for the rest of the run, and you see it in the report
as a `GAP:`. The last two units are fixed — a docs unit that runs
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

If everything is green it archives the folder to `docs/plans/archived/`, lands
per the consent you recorded, runs the after-landing `run` steps and reports
each one, and then asks **one** question naming the `ask` steps in order.

"Not yet" is offered as an equal option, not a fallback — everything that
reaches only your machine has already happened, and where a step staged
something, only a **restarted** session will pick it up. Coming back to the
`ask` steps tomorrow is a normal ending, and the table still names them.

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

## What this pair will not do for you

- **It will not read the blueprint**, so it will not notice that your "small
  refactor" changes a contract. That judgment is step 0 of this guide, and it is
  yours.
- **It will not gate on what you did not name.** The wave gate is a list you
  wrote in the interview.
- **It will not pick up an item from *Out of scope* or *Parked***, however
  adjacent it looks once the run is underway. That is what the next plan's
  recall is for.
- **It will not release anything on the plan's word alone.** Every publishing
  step is an `ask` step, and consent recorded at approval time is intent.

## Where to go next

- The command reference for both halves:
  [`/vwf:change-plan`](../../plugins/vwf.md#vwfchange-plan) and
  [`/vwf:change-execute`](../../plugins/vwf.md#vwfchange-execute).
- If the change turned out to be a slice after all:
  [keep the blueprint true once the product is live](./production-feedback-loop.md).
- If the planning session is going to outlast its window:
  [hand off work that outlives one session](./sessions-and-handoff.md).
