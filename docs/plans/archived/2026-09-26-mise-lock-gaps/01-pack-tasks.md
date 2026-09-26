# U1 — The mise pack: no pre-task install, per-config lockfiles, MISE_ENV required

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/all`,
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/mise`,
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom; then, read only,
  `mise.dev.toml`, `mise.ci.toml`, `mise.test.toml` beside `mise.toml`.
- **Lazy-load:** `mise settings ls --all`, `mise config get --help`,
  `mise lock --help`.

## Ruling

Quoted from index.md's assumed decisions:

> - Decision 1: The pack's base `mise.toml` `[settings]` sets
>   `task.run_auto_install = false`, so `setup:all`'s `mise lock` +
>   `mise install --locked` is the only path that installs or locks.
> - Decision 2: The pack's base `mise.toml` `[settings]` sets
>   `lockfile_platforms = ["linux-x64", "macos-arm64"]`.
> - Decision 3: A lockfile is required only for a config file that declares at
>   least one tool — the user: *"One per config file which contains atleast 1
>   tool to be installed"*. For `mise.toml` and each non-local `mise.<env>.toml`
>   that declares a tool, read through mise itself (`mise config get`, or the
>   nearest mise command that reads one file's `[tools]`), when its lockfile is
>   missing run `mise lock` in that environment only.
> - Decision 4: `setup:all` exits 1 when `MISE_ENV` is unset, before any step,
>   with a message naming `MISE_ENV=dev mise run setup:all` — the user:
>   *"setup:all must raise error when the MISE_ENV is unset"*.
> - Decision 9: Any comment a unit adds or edits is one line; a few lines only
>   where needed. Trimming existing comments is B65, not this plan.

## Edits

1. **`mise.toml`** — in `[settings]`, add `task.run_auto_install = false` and
   `lockfile_platforms = ["linux-x64", "macos-arm64"]`, each with a one-line
   comment. Rewrite nothing else.
2. **`tasks/setup/all`** — first thing after the helpers are sourced: when
   `${MISE_ENV:-}` is empty, print an error naming
   `MISE_ENV=dev mise run setup:all` and `exit 1`.
3. **`tasks/setup/mise`** — replace the any-lock `find` check (around :33) with
   the per-config check of decision 3. Iterate `.config/mise.toml` (base,
   `MISE_ENV=''`) and each `.config/mise.<env>.toml` whose name has no `.local.`
   (`test` as `dev,test`, as the `--upgrade` loop already does). A config
   declaring no tool is skipped. The lockfile beside it is `mise.lock` for the
   base and `mise.<env>.lock` for an env. Run `mise lock` for that environment
   only when its lockfile is missing. Keep the existing refusal of a missing
   lockfile outside dev, now scoped to a missing lockfile the check requires.
   Keep everything else, including the `--upgrade` loop and
   `mise install --locked`.

## Verification

- `mise run p:plugins:shellcheck` green
- `mise run p:plugins:check` green
- `grep -n "run_auto_install" .../config/.config/mise.toml` shows the setting
- any `mise` experiment you run is isolated as the Guardrails say

## Guardrails

- Touch nothing outside the three owned paths.
- Any `mise` experiment runs in a scratch dir with `HOME`, `MISE_DATA_DIR`,
  `MISE_CACHE_DIR`, `MISE_CONFIG_DIR` and `MISE_STATE_DIR` under one `mktemp -d`
  — a scratch `mise install` rewrote the global lock on 2026-09-25.
- This tree is payload, excluded from this repo's dprint: do not run this repo's
  formatter over it.
- BSD `sed`; prefer the Edit tool. Never `cat > file <<EOF` — `cat` is `bat`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: mise pack — only setup:mise locks, per config file, and setup:all needs MISE_ENV`
— written by the orchestrator after the wave gate.
