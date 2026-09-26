# Decision — mise conf.d layout: section files, one lock for every environment

**Date** 2026-09-26 · **Branch** `2026-09-26-mise-conf-d-layout` · **Plan**
[`docs/plans/2026-09-26-mise-conf-d-layout/`](../../plans/2026-09-26-mise-conf-d-layout/index.md)
· **Backlog** B54, piece one of two · **Supersedes** plan A,
[`archived/2026-09-26-mise-lock-gaps/`](../../plans/archived/2026-09-26-mise-lock-gaps/index.md),
never run

The user: *"`mise` config files are becoming large and difficult to manage"*.

## What was decided before

The mise pack shipped five files under `.config/` — `mise.toml`,
`mise.dev.toml`, `mise.ci.toml`, `mise.test.toml` and the uncommitted
`mise.local.toml` — each carrying its own `[settings]`, `[tools]`, `[env]` and
`[shell_alias]` tables. mise wrote one lock per config file that declared tools:
`mise.lock`, `mise.dev.lock`, `mise.ci.lock`. B54 itself said *"Never use
`.config/mise/conf.d` folder in any repo"*.

## What changed

1. **`.config/miserc.toml`** holds `env_conf_d = true` and nothing else. The
   user: *"this file must NOT have the `env` value configured, that must be set
   at system level only by user"*.
2. **Top-level files hold settings only.** `mise.toml` and `mise.<env>.toml`
   keep `[settings]` and top-level keys. The user: *"Top level settings will
   stay in `mise.toml` file, as they should be"*. `mise.toml` adds
   `min_version = "2026.9.13"`.
3. **Every other section is its own file** in `.config/mise/conf.d/` —
   `<section>.toml` for every environment, `<section>.<env>.toml` for one. The
   user: *"Any section `[*]` can be it's own independent file in `conf.d`"*;
   shell aliases go in `shell_alias.dev.toml`.
4. **One lock**, `.config/mise/mise.lock`, written by one `mise lock` over the
   union of every environment suffix, only when missing or under `--upgrade` in
   dev. Never a single-environment `mise lock`: it drops the other environments'
   tools.
5. **A tool is pinned in one file.** Two environments share `tools.toml`.
6. **Plan A's rulings carried over:** `task.run_auto_install = false`,
   `lockfile_platforms = ["linux-x64", "macos-arm64"]`, and `setup:all` exits 1
   when `MISE_ENV` is unset, naming `MISE_ENV=dev mise run setup:all`.
7. **init, doctor and reshape follow.** `REPO_NAME`, the merge-model pair and
   `MEMBERS` sit in `conf.d/env.toml`; `RUNTIME_BLOCK` stays in `mise.toml`.
   `/vwf:setup reshape` migrates a repo on the old layout; doctor reports it as
   drift.

## The reversals

- [`2026-09-05-mise-split-becomes-five-files.md`](./2026-09-05-mise-split-becomes-five-files.md)
  — **superseded**: settings-only files plus section files replace tables in
  each of the five.
- [`2026-09-05-charter-fence-opens-for-gate-configs.md`](./2026-09-05-charter-fence-opens-for-gate-configs.md)
  — **amended**: payload kind (d), a provider's `conf.d/<pack>.toml`, changes
  shape; B54's second piece finishes it.
- [`2026-09-26-mise-lock-honoured.md`](./2026-09-26-mise-lock-honoured.md) —
  **superseded** on one point: one lock per config file becomes one lock for
  every environment. Its `--upgrade` and fail-outside-dev rulings stand.
- **B54's "never `conf.d`" line** — reversed by the user after the mise docs
  showed environment-scoped `conf.d`.

## The alternatives rejected

- **A root `.miserc.toml`, or `MISE_ENV_CONF_D` in the shell** — the repo keeps
  its config under `.config/`, and a shell setting is per machine.
- **Splicing sections into the top-level files; one file per pack** — both keep
  the files large.
- **Per-environment versions of one tool** — mise locks one version, and the
  other environment's locked install fails.

## Still out of scope

- **The five pack fragments**, swiftui's `xcode` script, doppler's references,
  the materializer and checker rule 11 — B54's second piece.
- **Open gaps** — a newly pinned tool in a locked repo (G-lock-extend), the
  local lock's ignore path, and the rest are in the plan's Gaps section.
