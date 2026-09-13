# Project ids and repo names

A repo names its projects, and it has a name of its own. Both reach
places that are not prose: a task group, a flag, a shell alias, an
environment variable. Each of those has a grammar, and a name that reads
fine in a registry can be silently mangled by one of them. This file is
the single **slug rule** that turns a name into a token those surfaces
accept — and it has two applications: a project's **id**, and a repo's
**name**. One rule, two things it is applied to, and the two are
independent of each other.

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

## Where the two tokens land

| Token              | Slugged from               | Lands in                                            |
| ------------------ | -------------------------- | --------------------------------------------------- |
| The **project id** | the project's name         | `p/<id>/`, run as `p:<id>:…`, and the commit scopes |
| The **repo name**  | the main checkout's folder | `REPO_NAME = "<slug>"`                              |

Two, and no more. The bootstrap aggregator's **member flags** and the
`setup-<slug>` **aliases** beside them look like a third and a fourth and
are not: they are one per **member repo**, named for the member, because
what they widen a run to is another repository. A member holding three
projects is still one flag. So a project id never reaches them, and this
rule is not what names them.

Both carry the **slug**, never the raw name, and the two are
**independent**. `REPO_NAME` is the toolchain manager pack's marked
position and takes the repo's folder name, slugified — never a project
id; the `p:<id>:*` group takes the project id. A single-project repo
whose folder happens to spell its project id is a coincidence, not a
rule, and nothing may read one to infer the other.

The folder is the **main checkout's**, and the value is written
literally. A linked worktree's directory is named after the branch, so a
`REPO_NAME` derived at load time would address a different repo depending
on where you were standing — and everything reading it, a launcher alias
or a per-repo editor profile, would follow it there. A member repo names
its own folder, never the base's.

## Who applies it

Two, and only two:

- **The orchestrator that shapes the repo** — it derives each project's
  id from that project's name and writes it into the task group and the
  commit-scope list, derives the repo's slug from its main checkout's
  folder name and writes it into `REPO_NAME`, and reports both tokens it
  used.
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
