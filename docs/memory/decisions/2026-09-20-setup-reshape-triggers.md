# Decision — every structural change re-checks the shape and offers `reshape`

**Date** 2026-09-20 · **Branch** `2026-09-20-setup-reshape-triggers` · **Plan**
[`docs/plans/2026-09-20-setup-reshape-triggers/`](../../plans/2026-09-20-setup-reshape-triggers/index.md)
· **Closes** the open half of
[`2026-09-06-init-behind-setup.md`](./2026-09-06-init-behind-setup.md) —
config-side drift as a mode signal · **Requires**
[`2026-09-20-init-editor-dedupe.md`](./2026-09-20-init-editor-dedupe.md)

## What was decided before

The 2026-09-06 decision put `init` behind `/vwf:setup`: Step 0 asks whether the
shape is *there* and *current*, offers `init` on either, and the `reshape`
argument runs the shape pass alone. `/vwf:doctor` gained the drift finding whose
one remedy is that line. What it left open was the other direction — nothing
brought the user **to** the door. Step 0 ran before the materialize pass, so a
pack version that pass moved was drift the run could not see until the next run;
`stackgen-sync` said *"a re-run of init is what folds it in"* and invoked
nothing; a member added or a folder renamed outside vwf waited for someone to
type `/vwf:doctor`. Init's re-run doctrine listed the reasons and named no
command that acted on them.

## What changed

Not a reversal. Step 0 and `reshape` stay the only two doors to `init`; this
adds the commands that walk the user up to them.

**Four triggers.** Each ends by running the shape check and **offering**
`reshape` exactly the Step 0 way — one line naming the drifted repos and the
failing predicate, then the question — and saying nothing when the check is
clean. Nothing reshapes unprompted.

| Trigger                   | When                                                                                                                      | How                                                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/vwf:architecture`       | after it writes the registry                                                                                              | unchanged — it already invokes `/vwf:setup`, whose Step 0 runs the check                                                                                              |
| `/vwf:setup`              | after its own materialize pass, once per invocation, in every mode the pass runs — never on `reshape`, which runs no pass | **the second shape check**: Step 0's two questions over the same repos, against the lockfile the pass just wrote; `/vwf:init` on a yes, a deferral on a no            |
| `/stackgen:stackgen-sync` | as its closing step 7, after apply-and-commit — or when nothing was selected                                              | runs setup's Step 0 check in-session over base and members; invokes `/vwf:setup reshape` on a yes; a fragment that moved in step 2 is folded there, never by the sync |
| `/vwf:recall`             | at session start, beside the format check, before the palace reads                                                        | invokes `/vwf:doctor baseline` and prints **one line** on drift — the repos, their failing letters, `/vwf:setup reshape`; nothing when clean or never shaped          |

**Doctor's `baseline` invocation.** `/vwf:doctor baseline` is a named invocation
beside the project list — an argument value, not a mode — that evaluates the
**local** repo-shape predicates **(a) through (f)** per repo and returns nothing
else: no stack, manifest, health, memory, graphify or format-stamp check,
nothing written to room `doctor`, no remedy printed — the caller decides what to
show. A base with no lockfile reports `not shaped`, distinct from drift, since a
repo never shaped has no baseline to drift from. It is what recall calls, and
the only place a caller runs a subset of doctor.

**Why (g) is excluded at recall.** The forge predicate needs the forge CLI on
`PATH` and logged in, and a network read; recall runs at every session start,
including sessions that never touch the shape. (g) stays where the CLI is
already in hand — doctor's whole run and setup's Step 0.

**Init's doctrine names the triggers.** The *When it runs again* passage of
`init/SKILL.md` lists the four commands in one line each beside the reasons it
already listed; the doors are unchanged.

**The open half closes.** The 2026-09-06 note left "config-side drift as a mode
signal" open. Recall's one drift line is that signal: a change made outside vwf
is surfaced at the next session start, and the user never has to remember to run
setup after the initial shaping.

## The alternatives rejected

- **Commands only, no recall nudge** — leaves a change made outside vwf
  invisible until someone runs doctor by hand.
- **A session-start hook running doctor** — noise on every session that never
  touches the shape; recall is where the session already reads its state.
- **Auto-reshape when a check finds drift** — a reshape takes init's own
  consents; an offer keeps them.
- **Recall runs doctor whole, or reads the forge** — too slow and too
  network-bound for every session start; `baseline` is the cheap subset.
- **Leave the trigger list to the site docs** — init's own doctrine is where a
  maintainer reads when it runs again.
- **Drop the stackgen-sync trigger** (ruling (b) at the U2 gap) — ruled (a)
  instead: the skill lives under `plugins/stackgen/`, so stackgen is bumped
  `1.20.3` → `1.21.0` alongside vwf `19.37.0` → `19.38.0`.

## Still out of scope

- Shape drift as a **blocking** finding for `/vwf:execute` — it stays drift.
- B28's last piece, the greenfield / brownfield rework — its own folder, chained
  after this one.
