# Decision — mise config in `conf.d/` folders: `_base/`, `ai/`, one per pack

**Date** 2026-10-05 · **Branch** `2026-10-05-tool-config-templates` · **Plan**
[`docs/plans/2026-10-05-tool-config-templates/`](../../plans/2026-10-05-tool-config-templates/index.md)
· **Supersedes**
[`2026-09-26-mise-conf-d-layout.md`](./2026-09-26-mise-conf-d-layout.md) lines
25-42 (root `mise.<env>.toml`, flat section files,
`task.run_auto_install = false`), and the standing memory
`mise-experiments-must-isolate-home` on one point: never shipping a
project-level `npm.package_manager`

## What was decided before

On 2026-09-26 the mise config split into settings-only root files —
`.config/mise.toml` plus a `mise.<env>.toml` per environment — and one flat
section file per table in `.config/mise/conf.d/` (`tools.toml`,
`tools.dev.toml`, `env.toml`, `tasks.toml`, `shell_alias.dev.toml`), with
`task.run_auto_install = false` leaving every install to `setup:mise`. A pack's
mise lines were written into those shared files inside its own block. The memory
`mise-experiments-must-isolate-home` held that a project never ships
`npm.package_manager`, since a scratch experiment with it had rewritten the
global lock.

## What changed

The user, verbatim: *"`mise` is something I have fixed in
`~/Projects/github.com/virajp/bootstrap/.config`"* — that tree is the reference
layout. Confirmed with the other nine reversals on 2026-10-05: *"yes, confirm
all ten"*.

- **L1 — folders, no root env files.** `.config/mise.toml` holds
  `min_version = "2026.10.0"` and `[settings]` only; `.config/miserc.toml` holds
  `env_conf_d = true`; there is no root `mise.<env>.toml`. Environments are dev,
  ci and test.
- **L2 — `_base/`.** `conf.d/_base/mise{,.dev,.ci}.toml` in every repo: the
  repo's values (`REPO_NAME`, `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN`,
  `MEMBERS`) and `tasks.init` in `mise.toml`; the gate tools, the Python and uv
  settings and the shell aliases in `mise.dev.toml`; `node.gpg_verify = false`
  in `mise.ci.toml` on a node repo.
- **L3 — `ai/`.** `conf.d/ai/mise.dev.toml` in every repo: jq, yq,
  `pipx:mempalace`, `pipx:graphifyy` and the `MEMPALACE_*` values, dev only.
- **L4 — one folder per pack**, `conf.d/<slug>/`, rendered from that pack's
  `templates/`; `conf.d/<project>/` is the repo's own, hand-written. A tool is
  pinned in exactly one folder, since mise does not document which of two
  folders wins.
- **L5 — `task.run_auto_install = true`**, from bootstrap: a task's tools
  install before its body.
- **L6 — node in `_base`.** On a node repo, `node`, `pnpm`,
  `npm.package_manager = "pnpm"`, `node.compile = false` and
  `_.path = node_modules/.bin` sit in `_base/mise.toml`; otherwise node and pnpm
  sit in `_base/mise.dev.toml`, since the script runs on them.

## The alternatives rejected

- **Root env files** — an environment's lines belong to the folder that owns
  them, so removing a pack is removing its folder.
- **Flat section files** — a pack's lines in a shared file needed per-requester
  blocks to be removable.
