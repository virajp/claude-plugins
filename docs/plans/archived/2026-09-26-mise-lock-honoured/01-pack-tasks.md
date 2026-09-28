# U1 — The mise pack's setup:mise and setup:all honour the lockfile

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/mise`,
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/all`,
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing; then
  `.../config/.config/mise/tasks/setup/external/start` (the dev-check idiom,
  read only); `mise.dev.toml`, `mise.ci.toml`, `mise.test.toml` beside
  `mise.toml` (read only).
- **Lazy-load:** `mise lock --help`, `mise install --help` for exact flag
  spelling; `.claude/skills/plugin-authoring/SKILL.md` if a checker rule fails.

## Ruling

Quoted from index.md's assumed decisions:

> 1. `setup:all` gains `#USAGE flag "--upgrade"` and forwards it to
>    `setup:mise --upgrade`; off by default.
> 2. When `,${MISE_ENV:-},` does not contain `,dev,`, `setup:mise --upgrade`
>    exits non-zero before any step, naming the reason — the same check
>    `setup:external` uses.
> 3. `find` looks for `mise*.lock` directly under `.config/`; when it finds
>    none, `mise lock` runs once, in any environment. Otherwise no lock step
>    runs unless `--upgrade` is passed.
> 4. `mise lock --bump --upgrade` for the base config, then once per
>    `.config/mise.<env>.toml` present (`.local` excluded) with that environment
>    selected — every environment's lockfile moves together. `test` is selected
>    as `dev,test`, since it layers on dev.
> 5. Always `mise install --locked`, after any lock step.
> 6. `mise upgrade` removed from every task. `dprint config update` stays under
>    `--upgrade`, behind its terminal probe.

The user, verbatim: *"lock file must only be created in 2 situations: 1. If the
lock files do not exist 2. If `--upgrade` is passed and then versions must be
upgraded across"* and *"Skill must run `find` cli to find the lock files in
`.config/` folder, if not found, it can run the `mise lock` one time. No need of
creating `mise task` for one-time use"*.

## Edits

1. **`.../tasks/setup/mise`**
   - `#MISE description` and the `#USAGE flag "--upgrade"` help text describe
     the new behaviour (locked install; `--upgrade` bumps every environment's
     lockfile and updates the formatter plugins; dev only).
   - Right after `UPGRADE=` is read: when `$UPGRADE = true` and
     `[[ ",${MISE_ENV:-}," != *",dev,"* ]]`, print an error naming `MISE_ENV`
     and that `--upgrade` runs only in dev, and `exit 1` — before reshim.
   - Keep reshim and doctor.
   - Replace the plain `mise install` block with three steps, in this order.
   - Step one, **missing lockfile:** when
     `find "${MISE_PROJECT_ROOT}/.config" -maxdepth 1 -name 'mise*.lock'` prints
     nothing, run `mise lock` once (subheader naming it).
   - Step two, **upgrade:** when `$UPGRADE = true`, run
     `MISE_ENV= mise lock --bump --upgrade` for the base, then for each
     `.config/mise.<env>.toml` found by `find` (skip names containing
     `.local.`), run `MISE_ENV=<env> mise lock --bump --upgrade` — `<env>` being
     `dev,test` for `test`. If the base call is already covered by the dev call
     (verify with `mise lock --dry-run` in a scratch dir, isolated per the
     Guardrails), drop the redundant call and record it under `DECIDED:`.
   - Step three: `mise install --locked`.
   - Under `--upgrade`, delete `mise upgrade --local || true` and its subheader;
     keep the `dprint config update` block and its `can_prompt` probe unchanged,
     and reword the comment above it so it no longer says "refreshed here rather
     than by `mise upgrade`" (say: outside mise's lockfile, so
     `mise lock --bump` does not reach them).
   - The `else` message becomes: tools installed from the lockfile — pass
     `--upgrade` (dev only) to bump the lockfiles and update formatter plugins.
   - Keep the `setup:lint` tail.
2. **`.../tasks/setup/all`** — add `#USAGE flag "--upgrade" help="…"` beside
   `--all`; pass `--upgrade` to the `setup:mise` call when
   `${usage_upgrade:-false}` is `true`, using the same argument style the file
   already uses for flags; forward it on the member loop
   (`mise run --cd <member> setup:all`) too. Update any comment saying
   `setup:all` passes no rewriting flag, to say it passes `--upgrade` only when
   the user does.
3. **`.../config/.config/mise.toml`** — the comment near line 47 that says
   humans move the lockfile forward "(`mise upgrade`)": say
   `mise run setup:all --upgrade` (dev) instead. No setting changes.

## Verification

- `mise run p:plugins:shellcheck` green
- `mise run p:plugins:check` green
- `grep -rn "mise upgrade" plugins/stackgen/stacks/toolchain-manager/mise/config`
  prints nothing
- `grep -n -- "--locked" .../tasks/setup/mise` shows the install line

## Guardrails

- Touch nothing outside the three owned paths — the pack's skill docs,
  `conventions.md` and the site are U4's; this repo's `.config/` is U2's.
- Any `mise` experiment runs in a scratch dir with `HOME`, `MISE_DATA_DIR`,
  `MISE_CACHE_DIR`, `MISE_CONFIG_DIR` and `MISE_STATE_DIR` all under one
  `mktemp -d` — a scratch `mise install` rewrote the global lock on 2026-09-25.
- This tree is **payload**, excluded from this repo's dprint on purpose: do not
  run this repo's formatter over it. `shfmt -d` via `p:plugins:shellcheck` is
  the check.
- BSD `sed` on this host; prefer the Edit tool.
- Never write file content through `cat > file <<EOF` — `cat` is `bat`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: mise pack — setup:all installs from the lockfile, --upgrade bumps it` —
written by the orchestrator after the wave gate.
