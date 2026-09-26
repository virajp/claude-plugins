# U2 — This repo's setup tasks and mise config follow the pack

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise/tasks/setup/all`, `.config/mise/tasks/setup/mise`,
  `.config/mise.toml`, `.config/mise.ci.toml`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom; `01-pack-tasks.md` (the edits
  U1 makes, which this unit applies independently — do not wait for or copy U1's
  result); `.config/mise/tasks/_scripts/helpers` (read only).

## Ruling

Quoted from index.md's assumed decisions:

> - Decision 1: The pack's base `mise.toml` `[settings]` sets
>   `task.run_auto_install = false`, so `setup:all`'s `mise lock` +
>   `mise install --locked` is the only path that installs or locks.
> - Decision 3: A lockfile is required only for a config file that declares at
>   least one tool — the user: *"One per config file which contains atleast 1
>   tool to be installed"*. For `mise.toml` and each non-local `mise.<env>.toml`
>   that declares a tool, read through mise itself, when its lockfile is missing
>   run `mise lock` in that environment only.
> - Decision 4: `setup:all` exits 1 when `MISE_ENV` is unset, before any step,
>   with a message naming `MISE_ENV=dev mise run setup:all`.
> - Decision 6: This repo's `setup:all` forwards `--upgrade` to its member loop
>   as the pack's does; its `.config/mise.toml` takes decision 1's setting and
>   `lockfile = true`; `.config/mise.ci.toml`'s two comments are corrected to
>   what CI reads (`mise.lock`, `mise.ci.lock`).
> - Decision 9: Any comment a unit adds or edits is one line; a few lines only
>   where needed. Trimming existing comments is B65, not this plan.

## Edits

1. **`.config/mise/tasks/setup/mise`** — apply `01-pack-tasks.md` Edit 3. The
   file was byte-identical to the pack's before this run; the goal is that it
   still is after U1's edit, and the orchestrator diffs the two after the wave.
2. **`.config/mise/tasks/setup/all`** — apply `01-pack-tasks.md` Edit 2 (the
   unset-`MISE_ENV` refusal), and forward `UPGRADE_ARGS` on the member loop
   (:87) as the pack's does (:84). Keep this repo's other differences.
3. **`.config/mise.toml`** — in `[settings]`, add `lockfile = true` and
   `task.run_auto_install = false`, one-line comment each. `lockfile_platforms`
   is already set; leave it.
4. **`.config/mise.ci.toml`** — :9 no longer claims a base setting this file
   does not see (after Edit 3 it is true — reword only if still wrong); :13-15
   list only the lockfiles CI reads, `mise.lock` and `mise.ci.lock`.

## Verification

- `MISE_ENV=dev mise run code:precommit` green on the four files
- `mise run setup:all` with `MISE_ENV` unset exits 1 and changes nothing
- `MISE_ENV=dev mise run setup:mise` leaves every `.config/mise*.lock`
  byte-identical (checksum before and after)
- `diff .config/mise/tasks/setup/mise plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/mise`
  reported in `DECIDED:` (empty expected once U1 lands)

## Guardrails

- Touch nothing outside the four owned paths; `.config/mise*.lock` are not owned
  — a run that changes one is a defect to report.
- Do not run `setup:mise --upgrade` here — it bumps this repo's committed locks.
- BSD `sed`; prefer the Edit tool. Never `cat > file <<EOF` — `cat` is `bat`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`ops: this repo's setup tasks and mise config follow the pack's lock rules` —
written by the orchestrator after the wave gate.
