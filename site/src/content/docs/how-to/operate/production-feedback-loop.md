---
title: "Keep the blueprint true once the product is live"
description: "Route bugs, metric readings, UX complaints, feature requests and shape changes from production into the one doc each belongs in."
order: 2
---

[Start a product from an empty repo](../greenfield/single-repo.md) ends with a
deploy verified against the blueprint. This guide picks up from there. **Relay**
— the team task manager from that guide, one repo holding a single project that
declares both `service` and `webapp` — is in production now, and reality has
started disagreeing with the contract. A user reports a bug. The first metric
reading comes in under target. Somebody says a badge looks wrong. Three teams
ask for the same feature. A prospect wants single sign-on, which nothing in the
registry can provide.

Each of those arrives as a sentence in a chat window, and each has exactly one
place it belongs. By the end of this guide all five have landed in a doc, four
have a fixing command behind them, and none of them has been fixed by hand.

Mechanics — flags, halt conditions, the classification table, config keys — live
in the [vwf plugin manual](../../plugins/vwf.md). This guide covers the journey
and the judgment calls.

## The journey

### 1. Verify the deploy

vwf never deploys. Relay's pipeline pushes the production tag; this runs once
that deploy is live, and it is one of the commands the model never fires on its
own — you decide when a post-deploy check happens.

```text
/vwf:verify production
```

One more cycle has shipped since the spine's staging check — the team board is
live alongside task creation, and notifications are still unbuilt. Relay's first
verify run had to ask for the production hostname; accepting the offer to pin
what it resolved is why no run since has asked. What the two passes cover, and
how each kind of failure routes:
[`/vwf:verify`](../../plugins/vwf.md#vwfverify).

The run comes back healthy, and every criterion passes except the ones belonging
to `130-task-notifications` — a flow nobody has built yet cannot satisfy an
acceptance criterion, so those come back not covered rather than quietly
skipped. That is a testing gap, filed as one, with a plan unit offered for next
cycle. A probe coming back down would have been something else entirely: an
infrastructure failure is reported as operational and never filed as a blueprint
gap — on a production run it also names the matching runbook from
`conventions.md#incidents`, offers `/vwf:feedback incident`, and names the
previous release tag as the first remedy to consider (it never deploys).

Relay's API contract is never frozen, on this run or any other — that half of
the offer belongs to a standalone service (the release record still snapshots
Relay's entity schemas), and
[an API-only product](../greenfield/api-only-service.md#9-vwfverify-and-the-release-freeze)
is where it is worked through.

### 2. Route the bug

A user writes in: tasks created from the board's quick-add show up with nobody
on them. Paste it in.

```text
/vwf:feedback "quick-add on the board creates tasks with no owner"
```

One item at a time. Before classifying anything the command reads `product.md`,
locates the surface the report touches, and recalls what is already known — send
the same complaint twice and the second run reports its status instead of filing
it again.

Relay's item classifies as a **behaviour bug**, and the reason is the entire
judgment: `110-create-task` already pins that an unassigned task is invalid, an
owner being chosen at creation rather than after. The blueprint is right and the
code is wrong.

Before it offers anything, the command prints where that flow stands:

```text
Build state: complete; contract: unreleased
```

The first value is the flow doc's `implementation:` stamp — `execute` wrote
`complete` when the cycle landed, and nobody edits it by hand. The second is
whether a released snapshot exists for what the report touches; Relay's API is
never frozen, so the fix is unconstrained. Had it read `released`, the route
would have said so — the fix is additive-only, or expand and contract — and left
blueprint's released-contract guard and plan's delta checks to enforce it. The
offer is a fix cycle against that slice:

```text
/vwf:plan create-task
```

Every route closes the same way, with the remaining path in one line — here
`then /vwf:execute`, the folder `plan` pushes, run in a fresh session — so you
see the whole way to production before the single hand-off. Take it and you are
back on the spine at [`/vwf:plan`](../../plugins/vwf.md#vwfplan). Relay defers
instead — the ownership number is due this week, and the re-rank in step 3 is
what will schedule the fix — so the item lands as a line in the flow doc's Open
Questions, recording what production does against what the doc promises. That
line is written whether or not the memory daemon is up, which is the property
that makes deferring safe. [`/vwf:feedback`](../../plugins/vwf.md#vwffeedback).

### 3. Log the metric reading

Week four of use, and the ownership number is in.

```text
/vwf:feedback "week four: 71% of open tasks have both an owner and a due date"
```

A number against a goal `product.md` already declares is a **metric reading**.
Relay's `#goal-ownership-visible` targets 90% by week four, so this one misses,
and it lands as a dated row in that doc's Metric readings appendix — created on
first use, and a log rather than part of the reviewed contract, so it does not
go back through the product reviewer. A hit would be recorded and nothing else;
a miss carries an offer:

```text
/vwf:product
```

Update mode raises the missed metric before it asks anything else, and the
decision is yours: re-rank the slices, revisit the goal, or leave both and
record why. Relay re-ranks — the quick-add defect from step 2 is the likeliest
explanation, so that fix cycle moves ahead of notifications.
[`/vwf:product`](../../plugins/vwf.md#vwfproduct).

### 4. Route the UX complaint

```text
/vwf:feedback "the overdue badge on the board reads like an error — people think the task failed"
```

Classified as a **UX issue**: the rendered experience contradicts the design
system rather than the flow contract. It is recorded at the exact screen and
state, against the flow doc that defines that screen, and the offer forks on
which layer is actually wrong. Relay's is language-level — the badge is using
the destructive colour role, and overdue is a status, not a destruction — so the
fix is the design system:

```text
/vwf:design-system
```

That command imports rather than authors, so the colour role gets corrected in
the design tool and the command brings the corrected contract back into
`design-system.md` for the reviewers and the execute UX gate to read. Had the
complaint instead been that the board shows a member who belongs to no team a
blank page, the surface would be under-pinned rather than mis-styled — nothing
ever said what that state renders — and the offer would have been
`/vwf:blueprint team-board`. Which fork to take is a decision point, below.
[`/vwf:design-system`](../../plugins/vwf.md#vwfdesign-system).

### 5. Route the feature idea

```text
/vwf:feedback "three teams have asked for recurring weekly chores"
```

A want, not a defect, and it never goes straight to code — and never to a
nameless "normal path" either. The route names the **unit** the idea lands in,
and which command comes first turns on one question: does an existing goal serve
it? Recurring chores do serve `#goal-standup-free` (a weekly chore nobody owns
is precisely the thing re-asked every standup), and the `task` entity can absorb
them — a recurrence rule is a field on a task, not a new flow — so the offer is
the targeted blueprint update by unit name:

```text
/vwf:blueprint task
```

Had the idea implied a goal `product.md` does not serve, the offer would have
been `/vwf:product <note>` first — the report handed over as the note that seeds
the update questions (a new goal, a re-rank) — and only then the unit. The path
line carries the blueprint hop in both branches: here
`then /vwf:plan <slice>, then /vwf:execute` after the blueprint offer; in the
product-first case `/vwf:product <note>`, then `/vwf:blueprint <unit>`, then
`/vwf:plan <slice>`, then `/vwf:execute`.

Relay's answer is that it serves the goal, but not more urgently than
notifications. So it is recorded as an unranked candidate under that goal's
slice-priority row and nothing is scheduled. When it is ranked later, it enters
`/vwf:blueprint task`, then `plan`, then `execute` like any other slice.

### 6. Route the shape change

```text
/vwf:feedback "an enterprise prospect needs single sign-on before they can sign"
```

Also a want, but no flow can describe it yet: Relay's registry has one project
and no identity capability, and single sign-on needs a provider integration — a
new capability, possibly a new project — before any flow has a surface to pin.
That is a **shape change**, the one kind whose owning doc is the registry rather
than a flow or entity, so the build-state line reads `n/a` for both values and
the offer is:

```text
/vwf:architecture
```

Update mode asks only about the delta, and the command hands the report over as
that delta — the capability to record, the project to add. Architecture then
invokes `/vwf:setup` itself, whose materialize pass lands whatever the new pin
needs; feedback offers nothing to setup. The path line reads
`then /vwf:blueprint <unit>, then /vwf:plan <slice>, then /vwf:execute`. Relay
defers — a prospect is not yet a customer — so the item lands as one line under
`## Open Questions` in `docs/blueprint/architecture.md`, created at the end of
the doc the first time it is needed. A report whose registry change is
incidental — a flow can be pinned down now, and the registry moves as a side
effect — is not this kind: it stays a blueprint hole and reaches architecture
through blueprint's own sub-step.
[`/vwf:architecture`](../../plugins/vwf.md#vwfarchitecture).

### 7. Harvest the design review

```text
/vwf:feedback canvas
```

Everything said while reviewing designs on a canvas is production feedback that
never reached a chat window, and `canvas` pulls those remarks back through the
design adapter — one call per pinned design project, so a product designed in
two different tools harvests both — then runs each remark through the same
classification and the same routes as a pasted one.
[`/vwf:feedback`](../../plugins/vwf.md#vwffeedback).

### 8. Where the five items ended up

The bug is a line in the flow doc's Open Questions, waiting for the cycle the
re-rank just scheduled. The reading is a row in `product.md` and a re-ranked
slice list. The complaint is a note at one screen and a design-system import.
The idea is an unranked candidate under the goal it serves. The shape change is
an open question in `architecture.md`. Not one of them is a patch somebody
applied and remembered.

That is the whole point of the loop. Every route ends in a **doc edit now** plus
the **offer of the command that fixes it**, with the remaining path spelled out
in one line, so the fix — when it happens — happens through `blueprint`, `plan`
and `execute` against a contract that already says the right thing. The
alternative is a codebase that has quietly diverged from its own blueprint, at
which point the blueprint stops being worth reading and every later plan is a
guess.

## Decision points

### Classification is the judgment, not the paperwork

The same sentence from a user can be any of eight things — a behavior bug, a
blueprint hole, a metric reading, a UX issue, a feature idea, a shape change, an
incident, or something the blueprint does not describe at all. An outage is the
easy one — production itself broke, so it routes as an incident
(`/vwf:feedback incident`), filed with a postmortem stub whose action items come
back through this same classifier. The last one is the other easy one, in the
opposite direction: tooling, docs, CI or a refactor has no flow, entity or
screen to file against, so it is handed verbatim to `/vwf:change-plan` rather
than forced into a blueprint shape it does not have. A shape change sits between
them: it is product work, but the registry has to move — a project, a stack pin,
a capability, a foundation — before any flow can hold it, so it goes to
`/vwf:architecture` and only then to a blueprint unit; when the registry moves
only as a side effect of pinning a flow down, it is a blueprint hole, not a
shape change. For the rest, what decides is not the wording but what the
blueprint already says about that surface. "The badge looks wrong" is a UX issue
when the design system pinned a colour role and the screen ignored it, and a
blueprint hole when nothing ever pinned what that badge means. Ambiguity is
confirmed with you by multiple choice, one decision at a time, rather than
guessed — and it is worth answering carefully, because the class picks the
destination.

### A blueprint hole and an implementation defect look identical from production

Both arrive as "the product does the wrong thing". The test that separates them
is one read of the flow contract: **if the doc states the behaviour and
production disagrees, the code is wrong** — a behaviour bug, routed to
[`/vwf:plan`](../../plugins/vwf.md#vwfplan) as a fix cycle. **If the doc is
silent, the contract is wrong** — a blueprint hole, routed to
[`/vwf:blueprint`](../../plugins/vwf.md#vwfblueprint) to pin the behaviour down
first, and only then to a plan.

Getting it backwards is expensive in both directions. Planning against a doc
that never said what to build hands `execute` a plan full of open decisions,
which is exactly the situation the plan gate exists to prevent. Blueprinting a
plain defect re-litigates a contract that was already correct and leaves the bug
sitting in the code while you do it. When you genuinely cannot tell, read the
flow doc before answering the classification question; that read is the cheapest
step in this guide.

### A metric miss is a product question

The temptation on a missed number is to reach for a plan — something is
underperforming, so build something. The reading routes to
[`/vwf:product`](../../plugins/vwf.md#vwfproduct) instead, because a miss is
evidence about the *ranking*, and the honest response is sometimes to re-order
the slices, sometimes to change the target, and sometimes to conclude the goal
was measuring the wrong thing. A plan can only be right after that is settled.

### Deferring is not a backlog

vwf does keep a backlog — [`/vwf:backlog`](../../plugins/vwf.md#vwfbacklog), a
project on the base repo's forge — and this is deliberately not it. The backlog
is work nobody is on yet, agreed and waiting for a slot. Feedback is the
opposite case: it is being worked now, it may change `product.md`, the blueprint
or the architecture, and it follows the `plan` → `execute` line from there. So
declining an offer here never files a backlog item, and nothing routes between
the two.

Declining the offered command does not put the item in a queue somebody has to
remember to drain. The doc edit is written either way — an appendix row, a note
at the screen, or, when the fix cycle is declined, an Open Questions line — so
the item lives in the same tree as the contract it contradicts, and the next
[`/vwf:blueprint`](../../plugins/vwf.md#vwfblueprint) or
[`/vwf:plan`](../../plugins/vwf.md#vwfplan) run over that slice reads it. Memory
is the fast path, not the record: with the daemon down the routing is unchanged
and only the recall step is skipped, which is what makes it safe to defer.
[Memory](../../plugins/vwf.md#memory).

The one item with no doc to fall back on is the eighth kind — the report the
blueprint does not describe at all. (A deferred shape change has one:
`architecture.md`'s Open Questions.) There is no flow, entity or screen it
contradicts, so declining
[`/vwf:change-plan`](../../plugins/vwf.md#vwfchange-plan) files it to memory
tagged `non-blueprint` and memory is then the only record. That is the one place
deferring costs something, and it is worth knowing before you decline.

## When things halt

- **Verify halts when there is nothing to verify** — no flow docs carrying
  acceptance criteria and no deployable project in the registry.
  [`/vwf:verify`](../../plugins/vwf.md#vwfverify)
- **Verify stops to ask which environment** when the command names none and more
  than one is plausible. [`/vwf:verify`](../../plugins/vwf.md#vwfverify)
- **Verify stops on format drift that removed what it checks against** — a
  blueprint too old to carry acceptance blocks sends you to
  [`/vwf:setup`](../../plugins/vwf.md#vwfsetup) first.
- **`feedback canvas` stops when no design project is pinned**, and halts
  separately when a pinned project names a design tool no adapter supports — two
  distinct conditions that are never collapsed into one message.
  [`/vwf:feedback`](../../plugins/vwf.md#vwffeedback)
