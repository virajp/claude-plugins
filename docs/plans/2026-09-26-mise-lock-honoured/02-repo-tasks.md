# U2 — This repo's setup:mise and setup:all honour the lockfile

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise/tasks/setup/mise`, `.config/mise/tasks/setup/all`,
  `.config/mise.toml`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing; then, read
  only: the pack's
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/mise`
  as it stands at the wave's start (U1 is editing it concurrently — do not wait
  for or copy U1's result), and `.config/mise/tasks/_scripts/helpers` (which
  print functions this repo's helper library defines).
- **Lazy-load:** `.config/mise.{dev,ci,test}.toml` (read only),
  `mise lock --help`.

## Ruling

Quoted from index.md's assumed decisions:

> 1. `setup:all` gains `#USAGE flag "--upgrade"` and forwards it to
>    `setup:mise --upgrade`; off by default.
> 2. When `,${MISE_ENV:-},` does not contain `,dev,`, `setup:mise --upgrade`
>    exits non-zero before any step, naming the reason.
> 3. `find` looks for `mise*.lock` directly under `.config/`; when it finds
>    none, `mise lock` runs once, in any environment. Otherwise no lock step
>    runs unless `--upgrade` is passed.
> 4. `mise lock --bump --upgrade` for the base config, then once per
>    `.config/mise.<env>.toml` present (`.local` excluded) with that environment
>    selected — every environment's lockfile moves together. `test` is selected
>    as `dev,test`.
> 5. Always `mise install --locked`, after any lock step.
> 6. `mise upgrade` removed from every task. `dprint config update` stays under
>    `--upgrade`, behind its terminal probe.
> 7. `.config/mise/tasks/setup/mise` is replaced by the new pack file;
>    `.config/mise/tasks/setup/all` gains only the `--upgrade` flag and its
>    forwarding, keeping this repo's own differences. The rest of a reshape is
>    left to `/vwf:setup reshape`.

The user, verbatim: *"lock file must only be created in 2 situations: 1. If the
lock files do not exist 2. If `--upgrade` is passed and then versions must be
upgraded across"*.

## Edits

1. **`.config/mise/tasks/setup/mise`** — rewrite to the pack's shape (the
   `#USAGE flag "--upgrade"`, `usage_upgrade`, `set -euo pipefail`, the
   `have_task`/`setup:lint` tail, the dprint `can_prompt` block) with rulings
   2–6 applied exactly as `01-pack-tasks.md` Edits 1 states them (read that
   file). Today's unconditional `mise upgrade --local`, `mise lock` and
   `MISE_ENV=ci mise lock` are removed. If this repo's `helpers` lacks a print
   function the pack file calls, use the nearest one this repo's helpers define
   and record it under `DECIDED:`. The goal is a file that differs from U1's
   result at most in such helper names; the orchestrator diffs the two after the
   wave.
2. **`.config/mise/tasks/setup/all`** — add `#USAGE flag "--upgrade"` and pass
   `--upgrade` to its `setup:mise` call when `${usage_upgrade:-false}` is
   `true`. Change nothing else in the file.
3. **`.config/mise.toml`** — the comment above `lockfile_platforms` (lines 8–13)
   names `mise upgrade` among the commands that read the setting: replace it
   with `mise lock --bump`. No setting changes.

## Verification

- `mise run code:precommit` green on the three files
- `grep -rn "mise upgrade" .config/mise/tasks .config/mise.toml` prints nothing
- `MISE_ENV=ci mise run setup:mise --upgrade` exits non-zero and changes no
  `.config/mise*.lock` (checksum before and after)
- `mise run setup:mise` (this repo, dev) leaves every `.config/mise*.lock`
  byte-identical (checksum before and after) — lockfiles exist here, so no lock
  step runs

## Guardrails

- Touch nothing outside the three owned paths; the lockfiles
  `.config/mise*.lock` are **not** owned — a run that changes one is a defect to
  report, and the file is restored by the orchestrator, not by you.
- Do **not** run `setup:mise --upgrade` under dev here — it would bump this
  repo's committed lockfiles.
- BSD `sed`; prefer the Edit tool. Never `cat > file <<EOF` — `cat` is `bat`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`ops: this repo's setup:mise installs from the lockfile, --upgrade bumps it` —
written by the orchestrator after the wave gate.
