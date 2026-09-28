# U1 — The mise pack moves to the conf.d section layout

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/**`,
  `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`
- **Model:** opus
- **Kind:** edit
- **Read first:** every file under the owned `config/.config/` tree and
  `pack.yaml`, top to bottom; index.md's Facts (the mise facts and the payload
  map).
- **Lazy-load:** `mise lock --help`, `mise settings ls --all`; Context7
  `/jdx/mise` for any mise behaviour the Facts do not state.

## Ruling

Quoted from index.md's assumed decisions:

> - Decision 1: `.config/miserc.toml` holds `env_conf_d = true` and nothing else
>   — the user: *"this file must NOT have the `env` value configured, that must
>   be set at system level only by user"*.
> - Decision 2: `.config/mise.toml` and `.config/mise.<env>.toml` hold only
>   `[settings]` and top-level keys. `mise.toml` adds
>   `min_version = "2026.9.13"`. `RUNTIME_BLOCK` stays at the end of
>   `[settings]`.
> - Decision 3: Every other section is its own file,
>   `.config/mise/conf.d/<section>.toml` for all environments and
>   `<section>.<env>.toml` for one — the user: *"Any section `[*]` can be it's
>   own independent file in `conf.d`"*. A section with no content ships no file.
> - Decision 4: One `.config/mise/mise.lock`. When it is missing, or under
>   `--upgrade` (dev only: `--bump --upgrade`), run one `mise lock` with
>   `MISE_ENV` set to the comma-joined union of every environment suffix found
>   in `.config/mise.<env>.toml` and `.config/mise/conf.d/*.<env>.toml`,
>   `.local` excluded. Never a single-environment `mise lock`. Always
>   `mise install --locked` after.
> - Decision 5: A tool is pinned in one environment file only; a tool two
>   environments need goes in `tools.toml`.
> - Decision 6: `task.run_auto_install = false` and
>   `lockfile_platforms = ["linux-x64", "macos-arm64"]` in `mise.toml`
>   `[settings]`; `setup:all` exits 1 when `MISE_ENV` is unset, naming
>   `MISE_ENV=dev mise run setup:all`.
> - Decision 8: `REPO_NAME`, `MERGE_MODEL_DEVELOP`/`MAIN` and `MEMBERS` sit in
>   `conf.d/env.toml`, `PATH_ENTRIES` at its end; the `setup-<member>` alias
>   template in `conf.d/shell_alias.dev.toml`; `RUNTIME_BLOCK` stays in
>   `mise.toml` `[settings]`.
> - Decision 12: Any comment a unit adds or edits is one line; a few lines only
>   where needed. Trimming the rest is B65.

## Edits

1. **`miserc.toml`** (new, `config/.config/miserc.toml`) — `env_conf_d = true`
   with a one-line comment.
2. **`mise.toml`** — keep `[settings]` (add `task.run_auto_install = false`,
   `lockfile_platforms`, keep `lockfile = true`) and add top-level
   `min_version = "2026.9.13"`. Move `[env]` (with its markers and
   `PATH_ENTRIES`) to `mise/conf.d/env.toml`, `[tools]` to
   `mise/conf.d/tools.toml`, `[tasks.init]` to `mise/conf.d/tasks.toml`. Every
   marker keeps its exact text, so init's splice still finds it.
3. **`mise.dev.toml`** — keep `[settings]`; `[tools]` →
   `mise/conf.d/tools.dev.toml`, `[shell_alias]` (with the `setup-<member>`
   template) → `mise/conf.d/shell_alias.dev.toml`, `[env]` →
   `mise/conf.d/env.dev.toml`.
4. **`mise.ci.toml`, `mise.test.toml`** — keep `[settings]` (`locked = true` in
   ci); drop the empty tables; move any real content to its section file.
5. **Lock comments and paths** — every mention of `.config/mise.lock` /
   `mise.<env>.lock` in the payload names `.config/mise/mise.lock`.
6. **`mise/tasks/setup/all`** — first thing after helpers: unset `MISE_ENV` →
   error naming `MISE_ENV=dev mise run setup:all`, `exit 1`.
7. **`mise/tasks/setup/mise`** — replace the lock logic with decision 4: the
   environment list is the union of suffixes from `.config/mise.<env>.toml` and
   `.config/mise/conf.d/*.<env>.toml` (strip `.local` files); missing
   `.config/mise/mise.lock` → `MISE_ENV=<union> mise lock`; `--upgrade` (dev
   only, existing refusal kept) → the combined lock with `--bump --upgrade`
   (same `MISE_ENV` union); then `mise install --locked`. Drop the
   per-environment loop.
8. **`mise/tasks/setup/worktree`** :18–19, **`mise/tasks/code/all`** :15,
   **`vscode.d/mise.jsonc`** :25–33 — follow the new paths (nesting groups the
   `conf.d` files and the lock under `.config/mise/`).
9. **`pack.yaml`** — its file list, lockfile fact and any `conditional:` entry
   name the new paths.

## Verification

- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- `MISE_ENV=dev mise run p:plugins:check` green
- `find .../config/.config -maxdepth 1 -name 'mise*.toml' -exec grep -l '^\[\(tools\|env\|shell_alias\|tasks\)' {} +`
  prints nothing
- any `mise` experiment is isolated as the Guardrails say

## Guardrails

- Touch nothing outside the owned paths.
- Any `mise` experiment runs with `HOME`, `MISE_DATA_DIR`, `MISE_CACHE_DIR`,
  `MISE_CONFIG_DIR`, `MISE_STATE_DIR` under one `mktemp -d`.
- The payload tree is excluded from this repo's dprint: do not run this repo's
  formatter over it.
- Move lines by copying them byte for byte; do not retype a marker.
- BSD `sed`; prefer the Edit and Write tools. Never `cat > file <<EOF`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: mise pack — conf.d section files, one lock for every environment` —
written by the orchestrator after the wave gate.
