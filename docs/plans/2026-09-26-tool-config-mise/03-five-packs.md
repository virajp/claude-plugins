# U3 — The five fragment packs call tool-config instead of landing conf.d

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/package-manager/pnpm/**`,
  `plugins/stackgen/stacks/toolchain-gate/swiftlint/**`,
  `plugins/stackgen/stacks/capability-provider/fnox/**`,
  `plugins/stackgen/stacks/capability-provider/doppler/**`,
  `plugins/stackgen/stacks/app-framework/swiftui/**` (not their `version:` lines
  — U11's)
- **Model:** opus
- **Kind:** edit
- **Read first:** each pack's `config/.config/mise/conf.d/<pack>.toml`,
  `pack.yaml`, and the files index.md's Facts list for it.

## Ruling

> - Decision 6: A pack lists its calls in `pack.yaml` under `tool-config:`, one
>   instruction per line
>   (`mise add tool swiftlint 0.65.1 to all
>   environments`); the materializer
>   runs them, tagging `for <pack>`. The five `conf.d/<pack>.toml` fragments
>   become such calls and are deleted; `mise.d/` never exists.
> - Decision 10: swiftui's `_scripts/xcode` and `tasks/test/golden`, doppler's
>   `tasks/setup/secrets`, read values from the environment mise exports, not a
>   file.
> - Decision 15: Any comment or sentence a unit adds is one line.

## Edits

1. **`pack.yaml`** of each — a `tool-config:` list reproducing the fragment
   exactly: pnpm `mise add alias npx="pnpm dlx"` (dev); swiftlint
   `mise add tool aqua:realm/SwiftLint 0.65.1 to all environments`; fnox
   `mise add tool fnox latest to all environments`; doppler the tool plus
   `mise add env DOPPLER_CONFIG="local"` and `DOPPLER_PROJECT` with its
   `config_root` template verbatim; swiftui `mise add env` for the four
   `machine_env` keys, empty. Then `rm` each `conf.d/<pack>.toml` and empty
   directories.
2. **swiftui `_scripts/xcode`, `tasks/test/golden`; doppler
   `tasks/setup/secrets`** — read the values from the environment; a missing
   value prints the key and the fix
   (`/stackgen:tool-config mise set env <KEY>=<value> for <pack>`).
3. **Each pack's prose** naming its `conf.d` fragment — the pack's
   `tool-config:` calls instead.

## Verification

- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- `find plugins/stackgen/stacks -path '*config/.config/mise/conf.d*'` prints
  nothing
- `MISE_ENV=dev mise run p:plugins:check` green once U5 lands

## Guardrails

- Payload excluded from this repo's dprint; `plugins/**/*.md` not formatted;
  keep exec bits.
- Touch nothing outside the five pack trees; never a `version:` line.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: five packs ask tool-config for their mise lines` — written by the
orchestrator after the wave gate.
