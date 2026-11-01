---
title: "Hand off work that outlives one session"
description: "Capture a session so a fresh one continues it, instead of rebuilding it from the diff and whatever you remember."
order: 3
---

A blueprint sweep, a long elicitation, an unattended run — plenty of vwf work
takes longer than one context window, and much of it lives in a worktree you
will not be sitting in tomorrow. This guide covers capturing a session so a
fresh one continues it, instead of rebuilding it from the diff and whatever you
remember.

The worked example picks up **Relay**, the team task manager from
[start a product from an empty repo](../greenfield/single-repo.md). Relay is
mid-blueprint: `110-create-task` is written and past its reviewer,
`120-team-board` is half-elicited, and the context bar has just crossed 60%. At
the end, the sweep is running again in a clean window with nothing re-decided,
and a second strand is parked under its own name for later.

Mechanics — the arguments, where each file is written, the memory folders — live
in the [vwf plugin manual](../../plugins/vwf.md). This guide covers the journey
and the decisions; when it names a command, the manual section is the link.

## The journey

### 1. Hand off before the window fills

```text
/vwf:handoff
```

No argument, which is the point: naming a handoff is friction you don't want at
62% context. The unnamed form writes the repo's reserved `next` handoff — the
single "resume where I left off" snapshot, described under
[the `next` handoff](../../plugins/vwf.md#the-next-handoff).

It opens by restating in one line what the handoff covers, so you can correct
the scope before it captures the wrong thing. Relay's session had two threads
going — the blueprint sweep and a design-system re-import — and answers that
this handoff is the sweep. One handoff is one coherent thread; the other one
gets its own, in step 3.

Then it leaves the repo resumable before describing it: pending work is
committed as a checkpoint so the handoff talks about committed state rather than
a dirty tree, and only fully-merged worktrees are cleaned up. Nothing is pushed.
What lands is a document that says what the state is, why it got there, and
where the work lives — plus a self-contained next prompt when there is one.

Relay's says the next move is `120-team-board`'s empty-state question. If a
session genuinely has nothing to continue, handoff says so rather than padding
the prompt with invented work, and step 2 will report the same.

Reference:
[`/vwf:handoff` and `/vwf:recall`](../../plugins/vwf.md#vwfhandoff-and-vwfrecall).

### 2. Resume in a fresh session

Start a new session — `/clear`, or a new window — and:

```text
/vwf:recall next
```

Bare `/vwf:recall` does the same thing. It resolves the project the same way
`handoff` did, reads the handoff back, and then **re-reads the files it points
at**, so what you get is grounded in the current code rather than in yesterday's
snapshot. Before it reads the handoff it also runs `/vwf:doctor baseline` — the
local repo-shape predicates alone, no forge read — and prints one line if a repo
has fallen behind, naming the repos and offering `/vwf:setup reshape`; when
every repo is clean, or the repo was never shaped, it prints nothing and carries
on. It summarizes the goal, the state and the open steps, and then — for `next`
alone — runs the continuation straight away instead of asking. One command, and
Relay is back in `/vwf:blueprint` at the empty-state question.

The `next` handoff is one file, `docs/memory/handoff/next.md`, at the main
checkout — ordinary markdown, gitignored, no server required. Recall reads it
from that file alone. The rest of vwf's memory sits beside it under
`docs/memory/`, one file per record: [Memory](../../plugins/vwf.md#memory).

### 3. Park a second strand under its own name

`next` is a singleton — the following `/vwf:handoff` overwrites it — so a thread
you want to keep while you work on something else needs a name:

```text
/vwf:handoff design-system-import
```

Relay's other thread was a design-system re-import blocked on the design tool,
so it gets parked under its own name and stops competing with the sweep for the
reserved slot. Later, in whatever session picks it up:

```text
/vwf:recall design-system-import
```

A named recall rebuilds context the same way, then **shows the next prompt and
asks** before running it — the gate `next` deliberately skips. That is the right
default for a strand you are returning to weeks later, in a repo that has moved
underneath it.

A named handoff is a file too, `docs/memory/handoff/design-system-import.md`, in
the same folder as `next.md`. A second `/vwf:handoff` of the same name replaces
it, as each new `next` replaces the last.

### 4. Resume when the worktree is gone

Every substantive vwf change runs in a git worktree rather than your main
checkout, which is why the sweep's docs, its checkpoint commits and its branch
are all somewhere else on disk. The rules and the mechanism are
[`/vwf:git-workflow`](../../plugins/vwf.md#vwfgit-workflow)'s, and every other
command routes its git through it.

The handoff records that worktree path and its branch, and recall re-enters
there. If the directory is gone — someone cleaned it up, or you are on a
different machine — recall does not quietly carry on as if the work vanished. It
resolves by the branch instead: merged means the work landed and it resumes from
the main checkout, un-merged means it recreates the worktree and continues
there, and neither means it stops and says so.

## Decision points

### When to hand off

**Around 60% context** is the skill's own guidance, and it is deliberately
early. The session writing the handoff is the same session that has been losing
fidelity, so one written at 60% is worth considerably more than one squeezed out
at 95% — by then the summary is produced by exactly the degraded context you are
trying to escape. Hand off before a deliberate stop mid-task too, not only when
the bar gets high.

You do not have to watch the bar during an unattended
[`/vwf:execute`](../../plugins/vwf.md#vwfexecute) run: it carries its own
resource cap, hands off on its own when it hits one, and the same `/vwf:recall`
surfaces the `/vwf:execute <folder>` launch line — you re-run it in a fresh
session, and the run resumes from the run state in the plan folder's
`index.json`. Under `/vwf:execute all` the same pause ends the loop, and the
stopped plan's `/vwf:execute <folder>` is the line to re-run. That pause is
delivered by an external `PostToolUse` caps hook, because a command cannot
measure its own context window — `brew install virajp/tap/claude-status`
provides one (macOS on Apple silicon only). **Without it the pause never fires**
and the run keeps going into a full window; vwf cannot detect its absence, so
this is worth installing before the first long run rather than after.

### Named handoff, or `next`

Use `next` for the thread you are actually coming back to next. It is written to
both surfaces every time, it is overwritten in place so there is never a stale
pile to choose from, and its continuation runs without a gate — which is what
makes resuming a single command.

Use a name for everything else: a strand you are stepping away from, work you
want to hand to someone else, anything you may not touch for a while. The cost
is a name, though not one you have to remember exactly: asking for a `next` that
isn't on file makes recall list the handoffs it has and ask which you meant. The
benefit is the gate — a named recall asks before it acts, which is what you want
when the plan captured in the handoff may no longer be the right plan.

## When things halt

This scenario has very few genuine stops, and all three belong to `recall`
refusing to guess:

- **The resolved project doesn't match the repo you are in.** It fails loudly
  rather than recalling another product's handoff.
- **No handoff by that name on either surface.** A named recall says so and
  stops, rather than reconstructing a prior state it does not have. A bare
  recall is not a halt: with no `next` on file it lists what is there and asks.
- **The worktree is gone and the branch is neither merged nor present.** The
  work cannot be located, so it stops instead of starting over.

`handoff` itself does not halt on a tree it cannot commit cleanly — it writes
the handoff anyway and records the dirty state and the blocking hook output, so
the next session knows what is uncommitted and why.
