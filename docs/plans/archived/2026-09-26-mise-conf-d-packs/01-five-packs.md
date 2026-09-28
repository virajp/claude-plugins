# U1 — The five packs keep their mise lines in mise.d/

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/package-manager/pnpm/**`,
  `plugins/stackgen/stacks/toolchain-gate/swiftlint/**`,
  `plugins/stackgen/stacks/capability-provider/fnox/**`,
  `plugins/stackgen/stacks/capability-provider/doppler/**`,
  `plugins/stackgen/stacks/app-framework/swiftui/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** each pack's `config/.config/mise/conf.d/<pack>.toml`,
  `pack.yaml`, `conventions.md`, and the files the Facts list for it.

## Ruling

> - Decision 1: Each pack keeps its mise lines in
>   `mise.d/<section>[.<env>].toml` at the pack root, outside `config/`, never
>   landed; `config/.config/mise/conf.d/<pack>.toml` is deleted.
> - Decision 6: swiftui's `_scripts/xcode` and `tasks/test/golden`, and
>   doppler's `tasks/setup/secrets`, read the values from the environment mise
>   exports to the task, not from a config file path.
> - Decision 11: Any comment or sentence a unit adds is one line.

## Edits

1. **Split each fragment by table** into the pack root's `mise.d/`: pnpm →
   `mise.d/shell_alias.dev.toml`; swiftlint → `mise.d/tools.toml`; fnox →
   `mise.d/tools.toml`; doppler → `mise.d/tools.toml` and `mise.d/env.toml`
   (keep the `config_root` template as is and say in one line it resolves to
   `.config/mise/conf.d/`, the same directory as before); swiftui →
   `mise.d/env.toml` with the four `machine_env` keys. Copy lines byte for byte.
   Then `rm` each `config/.config/mise/conf.d/<pack>.toml` and the empty
   directories.
2. **`pack.yaml`** — `machine_env` entries unchanged; any path naming the old
   fragment names `mise.d/<file>`.
3. **swiftui `_scripts/xcode`** (:11, :31, :41–61) and **`tasks/test/golden`**
   (:32, :86, :93, :106, :109) — read `$XCODE_VERSION`, `$SIMULATOR_*` from the
   environment; a missing value prints which key to fill and where
   (`.config/mise/conf.d/env.toml`, the `swiftui` block).
4. **doppler `tasks/setup/secrets`** (:16, :24) — the same.
5. **Each pack's `conventions.md`, `skills/**` and references** — every
   `conf.d/<pack>.toml` path becomes "the `<pack>` block in
   `.config/mise/conf.d/<section>.toml`, merged by `/vwf:init`".

## Verification

- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- `find plugins/stackgen/stacks -path '*config/.config/mise/conf.d*'` prints
  nothing
- `MISE_ENV=dev mise run p:plugins:check` green once U5 lands (report under
  `DECIDED:` if run before)

## Guardrails

- Payload is excluded from this repo's dprint; `plugins/**/*.md` is not
  formatted — match the fold width by hand; keep exec bits.
- Touch nothing outside the five pack trees.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: five packs keep their mise lines in mise.d, never landed` — written by
the orchestrator, first in wave 1.
