# Project ids and repo names

A repo names its projects, and it has a name of its own. A project's name
reaches a place that is not prose: a task group. That has a grammar, and a
name that reads fine in a registry can be silently mangled by it. This file
is the single **slug rule** that turns a project's name into a token a task
group accepts: the project's **id**. The repo's own name is not slugged
here: bootstrap derives it, and the two are independent of each other.

## The rule

From a project's name, derive its id:

1. Lowercase it.
2. Replace every run of characters outside `[a-z0-9]` with a single `-`.
3. Trim any leading or trailing `-`.

Worked examples:

| Name             | Id               |
| ---------------- | ---------------- |
| `virajp.dev`     | `virajp-dev`     |
| `My App 2`       | `my-app-2`       |
| `claude-plugins` | `claude-plugins` |
| `web_api`        | `web-api`        |
| `95octane`       | `95octane`       |

A name that is already lowercase alphanumerics and dashes is its own id,
which is the common case and why the rule is easy to forget it exists.

## Why

The rule is not stylistic. It was measured, on **mise 2026.9.1**:

- A directory `tasks/p/virajp.dev/` holding a file `deploy` lists as
  `p:virajp.dev:deploy` — the dot survives.
- The **same** directory holding `_default` lists as `p:virajp`.
  `_default` collapses into its parent, which makes the parent the task's
  **last** segment, and mise strips what looks like an extension from the
  last segment. `.dev` is gone, and with it the project the group was for.

So the defect is not that mise dislikes dots; it is that `_default` moves
the directory name into the position where the extension rule applies. A
pack's `p/_project/` tree lands under the id whatever it ships, so one
`_default` in it would lose the project unless the id carries no dot. A
task nobody can name is indistinguishable from a task nobody wrote.

The rule is written down only here: a reader that needs an id cites this
file and restates nothing.

## Where the two tokens land

| Token              | Comes from                  | Lands in                                                        |
| ------------------ | --------------------------- | --------------------------------------------------------------- |
| The **project id** | the project's name, slugged | `p/<id>/`, run as `p:<id>:…`                                    |
| The **repo name**  | bootstrap's own derivation  | `repo_name` in `.config/bootstrap.toml`, which bootstrap writes |

The two are **independent**. `repo_name` is the repo's own and never a
project id; the `p:<id>:*` group takes the project id. A single-project
repo whose name happens to spell its project id is a coincidence, not a
rule, and nothing may read one to infer the other.

The commit scopes are bootstrap's `commit_scopes`, in the same file. A
plugin writes neither value.

## Who applies it

**The materializer** alone, when it renames a pack's `p/_project/` marked
position to the id of the project this stack is being pinned for
(`${CLAUDE_PLUGIN_ROOT}/skills/stackgen-stack-template/references/materializer.md`).
The orchestrator that shapes the repo writes no `repo_name` and no
commit-scope list.

A pack never applies the rule: a pack ships `_project`, and the rename is
the landing's.

## What it is not

An id is **not a display name**. The repo's `readme.md`, its manifests,
its remote and its domain keep the real name — `virajp.dev` is the
project, `virajp-dev` is only how a task group spells it. Nothing renames
a directory, a package or a repository to match an id, and a report that
shows one should show the name beside it.
