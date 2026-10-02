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

## Where things live

- `.config/miserc.toml`, `.config/mise.toml` and `.config/mise.<env>.toml`
  hold settings and top-level keys only.
- `.config/mise/conf.d/<section>.toml` holds one section for every
  environment, `.config/mise/conf.d/<section>.<env>.toml` one section for one:
  `[tools]`, `[env]`, `[tasks]` and `[shell_alias]`.
- `.config/mise/tasks/` holds the file-based tasks; `_scripts/` there is the
  library they share.
- `mise.local.toml` is this machine's, gitignored and never committed.
- Lines between `# >>> <name>` and `# <<< <name>` belong to the tool or pack
  that wrote them; edit only the lines outside every block.

## Adding a tool

Write the exact version into the right `conf.d/tools*.toml` file —
`tools.toml` for a tool every environment needs, `tools.<env>.toml` for one —
then run `mise install` — never a bare `mise use`, which writes the
top-level config this layout keeps settings-only.

One pin per tool across all the tools files: a tool two environments need is
pinned once, in `tools.toml`.

## Tasks

<!-- >>> tasks -->
| Task | Description |
| ---- | ----------- |
<!-- <<< tasks -->
