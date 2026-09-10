# Project ids

A repo names its projects, and those names reach places that are not
prose: a task group, a flag, a shell alias, an environment variable. Each
of those has a grammar, and a name that reads fine in a registry can be
silently mangled by one of them. This file is the single rule that turns a
project's name into the **id** every one of those surfaces uses, so the
same token means the same project everywhere.

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
the directory name into the position where the extension rule applies, and
that is exactly the file `/vwf:init` authors for every project group. A
task nobody can name is indistinguishable from a task nobody wrote.

Two more grammars the id reaches, neither of which tolerates the same
characters:

- **A `#USAGE` flag name.** `#USAGE flag "--virajp.dev"` is not a flag
  name a caller can type as written, and the flag is how `setup:all`
  reaches one member.
- **A shell alias key.** `[shell_alias]` entries become ordinary shell
  aliases, and `setup-virajp.dev` is not a name every shell will accept as
  one.

One rule ahead of all three is cheaper than three escapes, and it is why
the id is derived once and then carried, never re-derived per surface.

## Where the id lands

| Surface                        | Shape                        |
| ------------------------------ | ---------------------------- |
| The per-project task group     | `p/<id>/`, run as `p:<id>:…` |
| The member flag on `setup:all` | `--<id>`                     |
| The setup alias                | `setup-<id>`                 |
| The repo's own environment key | `REPO_NAME = "<id>"`         |

`REPO_NAME` carries the **slug**, never the raw name. It is the toolchain
manager pack's marked position, and everything reading it — a launcher
alias, a per-repo editor profile — gets the same token the task group
uses, which is the whole point of deriving the id once.

## Who applies it

Two, and only two:

- **The orchestrator that resolves ids** — whatever shapes the repo
  derives the id when it resolves a project's name, writes it into the
  task group, the flags, the aliases and `REPO_NAME`, and reports the id
  it used.
- **The materializer**, when it renames a pack's `p/_project/` marked
  position to the project this stack is being pinned for
  (`${CLAUDE_PLUGIN_ROOT}/skills/stackgen-stack-template/references/materializer.md`).

A pack never applies the rule: a pack ships `_project`, and the rename is
the landing's.

## What it is not

An id is **not a display name**. The repo's `readme.md`, its manifests,
its remote and its domain keep the real name — `virajp.dev` is the
project, `virajp-dev` is only how a task, a flag, an alias and an
environment variable spell it. Nothing renames a directory, a package or a
repository to match an id, and a report that shows one should show the
name beside it.
