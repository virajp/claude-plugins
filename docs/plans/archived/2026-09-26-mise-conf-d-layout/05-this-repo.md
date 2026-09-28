# U5 — This repo moves to the conf.d layout

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/miserc.toml` (new), `.config/mise.toml`,
  `.config/mise.dev.toml`, `.config/mise.ci.toml`, `.config/mise.test.toml`,
  `.config/mise/conf.d/**` (new), `.config/mise/tasks/setup/all`,
  `.config/mise/tasks/setup/mise`, `.config/mise/tasks/setup/worktree`,
  `.config/vscode.d/mise.jsonc`, `.config/mise.lock`, `.config/mise.dev.lock`,
  `.config/mise.ci.lock` (removed), `.config/mise/mise.lock` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file that exists; `01-mise-pack.md` (the edits U1
  makes — apply them independently, do not wait for or copy U1's result);
  `.config/.gitignore` or root `.gitignore` (read only); index.md's Facts.

## Ruling

> - Decision 1: `.config/miserc.toml` holds `env_conf_d = true` and nothing
>   else.
> - Decision 2: `.config/mise.toml` and `.config/mise.<env>.toml` hold only
>   `[settings]` and top-level keys. `mise.toml` adds
>   `min_version = "2026.9.13"`.
> - Decision 3: Every other section is its own file,
>   `.config/mise/conf.d/<section>.toml` for all environments and
>   `<section>.<env>.toml` for one. A section with no content ships no file.
> - Decision 4: One `.config/mise/mise.lock`. When it is missing, or under
>   `--upgrade` (dev only), run one `mise lock` with `MISE_ENV` set to the
>   comma-joined union of every environment suffix found. Never a
>   single-environment `mise lock`. Always `mise install --locked` after.
> - Decision 5: A tool is pinned in one environment file only.
> - Decision 6: `task.run_auto_install = false` and
>   `lockfile_platforms = ["linux-x64", "macos-arm64"]` in `mise.toml`
>   `[settings]`; `setup:all` exits 1 when `MISE_ENV` is unset; this repo's
>   `setup:all` forwards `--upgrade` to its member loop (G1);
>   `.config/mise.ci.toml` comments name only what CI reads (C1).
> - Decision 12: Any comment a unit adds or edits is one line.

## Edits

1. **Layout** — `.config/miserc.toml` new; each table of `.config/mise.toml`
   (`[tools]` :24, `[env]` :29 with its markers, `[tasks.init]` :81),
   `mise.dev.toml` (`[tools]` :10, `[shell_alias]` :37), `mise.ci.toml`
   (`[tools]` :26), `mise.test.toml` (`[tools]` :13, `[env]` :15) moves byte for
   byte to its `.config/mise/conf.d/<section>[.<env>].toml`. The top-level files
   keep `[settings]` plus decision 2's and 6's keys. If a tool is pinned in two
   environment files, keep one pin in `tools.toml` at the version the current
   locks resolve, and record it under `DECIDED:`.
2. **`.config/mise/tasks/setup/{all,mise,worktree}`** — apply `01-mise-pack.md`
   Edits 6, 7 and 8; plus G1's member loop forwarding in `setup/all` (:87). The
   target is `setup/mise` and `setup/worktree` byte-identical to the pack's once
   U1 lands.
3. **`.config/vscode.d/mise.jsonc`** :25–33 — the new nesting.
4. **Lock** — `rm` the three old locks; with `MISE_ENV=dev` exported run
   `mise run setup:mise` so it writes `.config/mise/mise.lock` across every
   environment; confirm it carries `linux-x64` and `macos-arm64`.
5. **Gitignore** — if this repo's ignore file lists `mise.local.lock`, report
   `DOCS FALSIFIED:`-style under `GAP:`; the file is not owned.

## Verification

- `MISE_ENV=dev mise run code:precommit` green
- `mise run setup:all` with `MISE_ENV` unset exits 1
- `MISE_ENV=dev mise run setup:mise` twice: `.config/mise/mise.lock`
  byte-identical after the second run
- `MISE_ENV=ci mise install --locked --dry-run` succeeds
- `MISE_ENV=dev mise run p:plugins:check` green (the repo's gates run on the new
  layout)

## Guardrails

- Touch nothing outside the owned paths.
- Never run a single-environment `mise lock`, and never `setup:mise --upgrade`.
- `.config/mise.*` files are dprint-formatted in this repo: run `code:precommit`
  on them, not a hand-aligned edit.
- BSD `sed`; prefer the Edit and Write tools. Never `cat > file <<EOF`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`ops: this repo moves to the conf.d mise layout and one lock` — written by the
orchestrator after the wave gate.
