---
name: change-plan
description: >-
  Turns an ad-hoc change request into a plan folder that /vwf:execute runs
  unattended in a fresh context. Use when the user wants to plan a change with
  no blueprint slice behind it: tooling, docs, CI, a refactor, or a tree the
  blueprint does not describe. Not for a blueprint slice (use plan).
argument-hint: "[what to plan]"
model: opus

disable-model-invocation: false
metadata:
  archetype: workflow
  depends-on: [plan-management, backlog, git-workflow]
  invocation-reason: the rewrite keeps the skill's current invocation state,
    because behavior does not change
---

# change-plan

Produce a plan that `/vwf:execute <folder>` can run with no one present. That is
the whole bar. The folder holds every decision, ruling, file scope, gate and
consent the run needs — otherwise the run stops and asks, which defeats the
point. This skill talks to the user; `/vwf:execute` does not.

This planner sits beside vwf's chain, not inside it. A blueprint slice — a flow
or an entity the product describes — is `/vwf:plan` → `/vwf:execute`. A change
with no slice behind it — tooling, docs, CI, a refactor, a tree the blueprint
does not describe — is `/vwf:change-plan` → `/vwf:execute`. One executor runs
both kinds of folder.

The plan folder is the contract. `index.json` carries everything `/vwf:execute`
reads mechanically, `index.md` the prose a reader needs, and the unit files what
each subagent reads. Nothing lives in conversation.

**The request** is `$ARGUMENTS`. A `Bnn` id in it is always a source id —
`/vwf:backlog next` prints the launch line with it — and is never dropped for a
weaker match.

## State

| File                                      | Access                          | Owner              |
| ----------------------------------------- | ------------------------------- | ------------------ |
| `docs/memory/decisions/`, `gaps/`         | read                            | the memory rule    |
| `docs/plans/archived/`                    | read                            | `plan-management`  |
| the backlog, a project on the forge       | read; written through its verb  | `/vwf:backlog`     |
| `docs/plans/index.json`                   | read; written through `add`     | `plan-management`  |
| `docs/plans/<date>-<name>/`               | written; `status` through `add` | this skill         |
| `.config/vwf.yaml`, the commit convention | read                            | the repo           |
| the approval commit and its push          | made through its skill          | `vwf:git-workflow` |

## Phases

| §   | Phase                             | Gate                           | File                                            | Loads  |
| --- | --------------------------------- | ------------------------------ | ----------------------------------------------- | ------ |
| 1   | Recall, then survey               | auto                           | [recall-survey.md](references/recall-survey.md) | always |
| 2   | Scope check                       | user, on several pieces        | [scope-check.md](references/scope-check.md)     | always |
| 3   | Interview, one question at a time | user, each item                | [interview.md](references/interview.md)         | always |
| 4   | Gates, after landing, release     | user; the levels are stated    | [gates-consent.md](references/gates-consent.md) | always |
| 5   | Present the shape — the hard gate | user: approve, revise, abandon | [shape-gate.md](references/shape-gate.md)       | always |
| 6   | Write the folder                  | auto                           | [write-folder.md](references/write-folder.md)   | always |
| 7   | Self-review                       | user, each rulings-review gap  | [self-review.md](references/self-review.md)     | always |
| 8   | Hand off                          | auto                           | [hand-off.md](references/hand-off.md)           | always |

| When                                     | File                                        | Loads     |
| ---------------------------------------- | ------------------------------------------- | --------- |
| §4 or §6, the change lands runnable code | [review-unit.md](references/review-unit.md) | sometimes |

## Halt and pause

| ID  | Condition                                                                                            | Action                                                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | §5 answer is revise or abandon                                                                       | Revise loops back to the section named. Abandon ends with nothing on disk and a one-line note of what was decided, so the next attempt can recall it. |
| H2  | §8 `plan-management add` refuses: `docs/plans/index.md` of the base repo exists, the old plan format | Stop. The folder stays `DRAFT` and uncommitted, and no later step runs. The output is the refusal as `add` printed it.                                |
| H3  | §8 finds something unplanned at the check priority                                                   | Print no launch block. End with the second ending under Output.                                                                                       |
| H4  | §7 rulings review still returns gaps after round four                                                | Follow item 20 of the interview checklist. Hand off with no unread list.                                                                              |

## Output

After §8's check, end in exactly one of three ways:

- **Nothing unplanned** — end with the launch block below, exactly as written.
- **Something unplanned** — no launch block. Print the unplanned pieces of this
  request first, then the unplanned items at the check priority. Then print the
  command for the next one, and nothing after it: `/vwf:change-plan <item>`, or
  `/vwf:plan <slice>` when the item names a blueprint slice. A piece of this
  request that is next goes straight back to §3 instead. `/vwf:execute` is
  unchanged, and the user may still run it.
- **The backlog unreadable** — the verb says so. End with the launch block,
  preceded by one line saying the backlog could not be read, so the check did
  not run.

The launch block, with nothing after it:

```text
Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/<date>-<name>

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
```

## Never

- Write to disk before §5's approve; present the shape first — the gate is the
  user's review.
- Execute a unit, edit a file the plan names, or bump a version; end at the
  launch block — the fresh context is the point, and it carries none of this
  session's survey or interview.
- Write a unit prompt that depends on this conversation; put it in the unit file
  — a unit inherits no context.
- Edit the backlog; call `/vwf:backlog` — it owns the project.
- Edit `docs/plans/index.json` or a folder's `status` key; call
  `plan-management add`, the one verb this skill calls on them — every later
  status is `/vwf:execute`'s to call, and the archive move is
  `plan-management`'s.
