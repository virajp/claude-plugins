---
name: handoff
description: Capture the current session as a handoff document, written to
  docs/memory/handoff/<name>.md at the main checkout of the base repo, so work
  can resume in a fresh session. With no argument — or `next` — it writes the
  reserved `next` handoff, docs/memory/handoff/next.md, which /vwf:recall
  resumes automatically. Use when the context window grows beyond ~60%.
argument-hint: "[<name> | next]"
model: sonnet

disable-model-invocation: false
---

# handoff — Capture Work for a Fresh Session

Write a **handoff document** that lets a new session continue this work without
the current context, as a file under `docs/memory/handoff/` that `/vwf:recall`
reads later.

**When to use:** when the context window grows **beyond ~60%**, or before
intentionally ending a session mid-task. A handoff written early — while the
session still reasons clearly — is worth far more than one squeezed out at 95%.

## Inputs

| Input    | Source                                                     |
| -------- | ---------------------------------------------------------- |
| `<name>` | `$ARGUMENTS` — the file name. Empty → the reserved `next`. |
| Root     | the main checkout of the base repo (see step 3)            |
| Template | `${CLAUDE_PLUGIN_ROOT}/assets/templates/handoff.md`        |

`$ARGUMENTS` is a short kebab-case name (e.g. `auth-refactor`). **If it is
empty, the name is `next`** — never ask for one, never invent one. It can end
with a `prefer:` preference, which is not part of the name (see Caller
Preferences).

## The `next` handoff

`next` is a **reserved name**: the single "resume where I left off" handoff for
this repo, and the default when no name is given. Every handoff, named or
`next`, is one file, `docs/memory/handoff/<name>.md`, replaced in place when a
handoff of that name runs again — there is never more than one live file per
name. `next` differs from a named handoff in exactly two ways:

- **It is the default.** `/vwf:recall` with no argument resumes it.
- **It must carry a continuation.** `next` exists to be resumed, so its **Next
  prompt** section is required. If the session has no clear next action, say so
  plainly rather than padding it — see step 5.

## Caller Preferences

Everything in `$ARGUMENTS` from `prefer:` to its end is a preference, never a
name, and the words before it are the name. An argument with only a preference
has an empty name, which means `next`. `prefer: the one thread is <text>` names
the thread, and the skill does not ask at step 1. With no `prefer:`, the skill
asks as step 1 says.

---

## Pipeline

### 1. Confirm scope

Restate, in one line, what work this handoff covers, so the captured state
matches the user's intent. If the session spans several unrelated threads, ask
which one to hand off (one handoff = one coherent thread), unless a caller's
preference names it (see Caller Preferences).

### 2. Tidy & checkpoint the working state

Leave the repo clean and resumable before capturing, so the handoff describes
**committed** state, not a dirty tree. This runs on the **outer (superproject)**
repo and its submodules — never a submodule in isolation (the same outer-repo
rule as `/vwf:git-workflow`). **Do not push** — commit only, honoring the
never-push rule.

1. **Commit pending work, everywhere.** In the current worktree and in each
   submodule with uncommitted or untracked changes, stage and commit it as a
   checkpoint — `wip: handoff checkpoint — <name>` — without prompting. Respect
   pre-commit hooks (on failure, fix and make a **new** commit; never
   `--no-verify`).

   **Dirty-state escape.** If the tree still cannot be committed cleanly (an
   unfixable hook keeps failing), do **not** loop — write the handoff
   **anyway**, recording the **dirty state** and the blocking hook output in the
   doc so the next session knows what is uncommitted and why.
2. **Update submodule pointers (outer repo).** If a submodule's recorded commit
   moved, stage the gitlinks and commit them in the outer repo
   (`ops: update submodule pointers`).
3. **Clean up worktrees — safely.** Remove only linked worktrees that are
   **fully merged and clean**. **Never remove a worktree with unmerged work** —
   keep it and list it under the handoff's Open items. Report what was removed
   and kept.

### 3. Resolve the root

The handoff goes where every other `docs/memory/` record goes: the **base
repo**, in its **main checkout** — never a linked worktree. Resolve it from
wherever the session stands with the walk in
`${CLAUDE_PLUGIN_ROOT}/assets/membership.md` (*Resolving the base repo*),
whose linked-worktree step lands on the main checkout — the parent directory of
`git rev-parse --git-common-dir`. In a single-repo product that is this repo's
main checkout; in a multi-repo product it is the base repo's, whichever member
the session ran in. If the walk ends at *not a vwf repo*, the root is this
repo's main checkout.

The file is gitignored (a handoff is personal, per
`${CLAUDE_PLUGIN_ROOT}/assets/memory.md`), so a copy written inside a worktree
would die with it and be invisible to a recall run anywhere else; the main
checkout is the one root every session resolves.

### 4. Write the handoff document

Fill the template at `${CLAUDE_PLUGIN_ROOT}/assets/templates/handoff.md` from
the **current session**. Capture state, not narration — a reader with zero
context must be able to resume. Be concrete: real file paths, real commands, the
actual decisions and their *why*. Set the first line to `# Handoff: <name>`
exactly.

Fill the **Workspace** section from git: the worktree path
(`git rev-parse --show-toplevel`, or the main checkout if not isolated) and the
branch (`git branch --show-current`). `/vwf:recall` reads these to re-enter the
work — a stale or missing path is how it detects the worktree is gone.

If decisions/findings already live in `docs/memory/` or elsewhere in `docs/`,
**reference** them rather than copying — keep the handoff tight.

### 5. Add the next prompt (if there is one)

If a clear single next action exists, fill the **Next prompt** section with a
**self-contained** instruction the user can paste into a fresh session — it must
not rely on this session's context. If there is no obvious next step, delete
that section entirely (don't pad it).

**Plan before execute.** When the Next prompt would be `/vwf:execute …`, first
invoke `/vwf:backlog unplanned` (the top open priority). If it lists items, the
Next prompt is the planner command for the first one instead —
`/vwf:change-plan <item>`, or `/vwf:plan <slice>` for a blueprint slice — and
the **Open items / next steps** list names the others. If the backlog is
unreadable, keep the execute prompt. A Next prompt that resumes a folder already
claimed — its row `RUNNING`, a paused or blocked run — is never replaced: skip
the check and keep its resume line.

**For `next`, this section is the point of the handoff.** If the session has no
continuable work — the thread finished, or the next move is the user's to choose
— do **not** invent one. Write the handoff without the section and **tell the
user there is nothing further to continue until they give a direction**;
`/vwf:recall next` will report the same and wait. A `next` that auto-runs a
made-up prompt is worse than one that admits it is done.

### 6. Write the file

Write the completed document verbatim to `docs/memory/handoff/<name>.md` under
the root step 3 resolved, creating the folder if it is missing. A file of that
name that already exists is **replaced in place** — never a second file, never
a dated or suffixed variant. **Do not commit it** — the line in the repo's
`.gitignore`, synced by bootstrap's git tool, keeps it out of every diff.

The file is the whole deliverable: if it cannot be written, say so and stop —
never report a handoff that is not on disk.

### 7. Report

Confirm the path written, and state in one line that a fresh session can resume
with `/vwf:recall <name>` — `/vwf:recall next` (or bare `/vwf:recall`) for the
reserved one, noting it will run the next prompt without asking. Say whether a
next prompt was included; for `next` without one, say plainly that there is
nothing further to continue until the user gives a direction.
