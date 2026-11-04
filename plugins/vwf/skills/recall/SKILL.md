---
name: recall
description: Read a handoff document from docs/memory/handoff/<name>.md at the
  main checkout of the base repo to resume work in a fresh session, and
  optionally run its next prompt. With no argument — or `next` — it resumes the
  reserved `next` handoff and runs its continuation without asking. Use to
  continue after a session that exceeded ~60% context.
argument-hint: "[<name> | next]"
model: haiku

disable-model-invocation: true
---

# recall — Resume Work from a Handoff

Read a handoff written by `/vwf:handoff` and reconstruct enough context to
continue the work in **this fresh session**.

**When to use:** at the start of a new session when the previous one grew
**beyond ~60% context** and you want to continue with a clean window.

## Inputs

| Input    | Source                                                |
| -------- | ----------------------------------------------------- |
| `<name>` | `$ARGUMENTS` — the handoff file name. Empty → `next`. |
| Root     | the main checkout of the base repo (see step 1)       |

## The `next` handoff

`next` is the reserved "resume where I left off" handoff `/vwf:handoff` writes
by default, `docs/memory/handoff/next.md`. Recalling it differs from a named
recall in one way:

- **Its continuation runs without a gate** — step 4 executes the Next prompt
  instead of asking. That is the whole point of `next`: one command resumes the
  work. It is **left in place** afterwards; the following `/vwf:handoff` (or
  `/vwf:handoff next`) replaces it.

---

## Pipeline

### 1. Resolve the root

Resolve the root **exactly as `/vwf:handoff` does** (so they agree): the
**base repo**, in its **main checkout**, found from wherever the session stands
with the walk in `${CLAUDE_PLUGIN_ROOT}/assets/membership.md` (*Resolving the
base repo*), whose linked-worktree step lands on the main checkout — the parent
directory of `git rev-parse --git-common-dir`. If the walk ends at *not a vwf
repo*, the root is this repo's main checkout.

### 2. Find the handoff

If `$ARGUMENTS` named no `<name>`, the name is **`next`**. Read
`docs/memory/handoff/<name>.md` under the root — that file is the handoff, and
the only place recall looks for one.

If it does not exist, list the files in `docs/memory/handoff/` under the root,
say that none matched `<name>`, show the names found (from each file's
`# Handoff: <name>` header, else its file name), and stop — don't guess the
prior state. With no folder or no files, say there is no handoff to recall and
stop.

### Format check

Before rebuilding context off the blueprint, run the preflight in
`${CLAUDE_PLUGIN_ROOT}/assets/format-check.md` (as the other consuming commands
do); if the repo's blueprint format is behind what vwf ships, nudge `/vwf:setup`
(proceed unless a needed artifact is missing).

### Shape check

Beside the format check, and before `docs/memory/` is read in step 3, invoke
`/vwf:doctor baseline` — the local baseline predicates of the repo-shape check,
named by title and evaluated per repo, file reads only. Recall runs no mise task
and no bootstrap code, never reads the forge and never runs doctor whole, so it
does **not report config drift**: doctor's full mode is the place that does.
When doctor reports drift, print **one line per remedy**, with the rows that
led to it: `/vwf:setup` for Pack versions, Project ids and Content
drift; `/vwf:setup reshape` for Branches, and a member not
shaped or on the old layout; the fix in `.config/bootstrap.toml` for Merge model
— e.g. *shape drift: base Pack versions, api Content drift — run `/vwf:setup`*
and *shape drift: api Branches — run `/vwf:setup reshape`*. When every repo is
clean, or the base has no `.config/bootstrap.toml` (`not shaped` or on the old
layout in doctor's result), print **nothing**. This is an offer: recall never invokes a remedy itself — the
user runs it — and no line ever stops the recall; it runs early so a change made
outside vwf is seen before the session builds on it.

### 3. Rebuild context

Read the handoff, then **read the files and docs it points to** (relevant files,
`docs/blueprint/…`) so the work is grounded in the current code, not just the
handoff's snapshot.

Then read the recorded decisions and gaps under the root:
`docs/memory/decisions/` and `docs/memory/gaps/` (each file
`<date>-<slug>.md`). List each folder's file names; read in full only the files
whose slug or title matches the handoff's topic, newest first, at most ten per
folder, and read no file in full that does not match. A missing folder is
nothing to read, not an error.

Summarize back to the user in a few lines: the goal, current state, the
decisions and gaps that bear on it, and the open next steps.

**Re-enter the workspace.** Read the handoff's **Workspace** section (worktree
path + branch). If the path still exists, continue there. If it is **gone**,
don't silently proceed as if the work vanished — resolve by the branch:

- **Branch merged** into the destination → the work landed; resume from the
  **main checkout**.
- **Branch still exists, un-merged** → recreate the worktree for it via
  `/vwf:git-workflow`, then continue there.
- **Neither** (branch absent, nothing merged) → say so and stop; the work can't
  be located.

### 4. Run or offer the next prompt

**For a named handoff**, if it has a **Next prompt** section, show it and **ask
the user whether to run it now**:

- **Yes** → proceed to execute that prompt (route through the matching `/vwf:`
  command — `blueprint` / `plan` — when it names one). A prompt naming
  `/vwf:execute <folder>` is the exception: `execute` must start in a
  fresh context — a fresh session, or a runner that
  `/vwf:execute all` dispatches — so print that launch line and stop — the
  run resumes from its row `RUNNING` in `docs/plans/index.json` and the unit
  fields of the folder's `index.json` (`status`, `commit`, `rounds`), which
  record every unit that returned.
  Resuming a cap-paused run that way is the primary use of this command.
  That resume line is printed as it is — a folder already claimed (its row
  `RUNNING`, a paused or blocked run) is never replaced. For a folder not yet
  claimed, invoke `/vwf:backlog unplanned` before printing it: if it lists
  items, print them and the planner command for the first one —
  `/vwf:change-plan <item>`, or `/vwf:plan <slice>` — instead of the launch
  line. A backlog that is unreadable leaves the launch line as it is.
- **No** → stop after the summary; the user drives from here.

**For `next`, do not ask** — show the summary, then execute the Next prompt
straight away (routing through the matching `/vwf:` command the same way). The
handoff **stays in place**: leave `docs/memory/handoff/next.md` alone, so a
re-run resumes the same point until the next `/vwf:handoff` replaces it.

If there is no next prompt, end with the summary and the open items, and wait
for direction. For `next` this means the previous session recorded no
continuable work — say that plainly ("nothing further to continue — give me a
direction") rather than picking an open item and running with it.
