---
name: mise
description: Runs this repo's mise tasks and edits its mise config — use it before running, adding or changing a task, a tool pin, an env value or an alias.
---

# mise

This repo runs on mise: it pins the tools, holds the env values and runs the
tasks.

## Running tasks

- Run every task as `mise run <task>`; discover them with `mise tasks`. Tasks
  differ per repo, so never assume a task name the table below does not list.
- Work locally under `MISE_ENV=dev`. `setup:all` refuses an unset `MISE_ENV`:
  `MISE_ENV=dev mise run setup:all`.
- `code:check:all`, `code:lint:all`, `code:format:all`, `setup:ai:all` and
  `setup:deps:<verb>:all` run every subtask beside them; add a step by adding a
  subtask file, never by editing an `all` task.

## Where things live

- `.config/miserc.toml` and `.config/mise.toml` hold settings and top-level
  keys only.
- `.config/mise/conf.d/<folder>/mise.toml` holds a folder's tools, env values,
  tasks and aliases for every environment, `mise.<env>.toml` for one (`dev`,
  `ci`, `test`). `_base/` and `ai/` are stackgen's, one folder per pack is the
  pack's, and a folder named for a project is the repo's own.
- `.config/mise/tasks/` holds the file-based tasks; `_scripts/` there is the
  library they share.
- `mise.local.toml` is this machine's, gitignored and never committed.
- stackgen's tool-config renders `_base/`, `ai/`, each pack's folder and the
  `all` tasks; a hand edit there is shown as a change on its next run. Put the
  repo's own pins and values in a folder of its own.

## Adding a tool

Pin it in exactly one folder. In `mise.dev.toml` write `version = "latest"`;
in a file CI loads (`mise.toml`, `mise.ci.toml`, `mise.test.toml`) write the
exact version. Then run `mise install` — never a bare `mise use`, which writes
the top-level config this layout keeps settings-only.

## Tasks

| Task | Description |
| ---- | ----------- |
@@#each TASKS@@
| `@@.name@@` | @@.description@@ |
@@/each@@
