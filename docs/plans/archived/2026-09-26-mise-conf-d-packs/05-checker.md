# U5 — The checker reads mise.d and refuses a landed conf.d fragment

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** `check.ts` — `PACK_CONF_D`, `packFactFaults`, `tomlEnvKeys`
  (around :549–701 before M; find them by name); `check.test.ts` — the
  `machine_env` cases (around :671–790); index.md's Facts.

## Ruling

> - Decision 7: Rule 11 reads `machine_env` names from the pack's
>   `mise.d/env*.toml`; a pack shipping anything under
>   `config/.config/mise/conf.d/` is a finding.
> - Decision 11: Any comment a unit adds is one line.

## Edits

1. **`check.ts`** — replace `PACK_CONF_D` with the pack-root `mise.d/`; each
   `machine_env` name must be a key of an `[env]` table in `mise.d/env*.toml`; a
   file under the pack's `config/.config/mise/conf.d/` is a finding naming it.
2. **`check.test.ts`** — fixtures move from `…/conf.d/swiftui.toml` to
   `…/swiftui/mise.d/env.toml`; add: a pack with
   `config/.config/mise/conf.d/x.toml` fails; a `machine_env` name absent from
   `mise.d/env*.toml` fails.

## Verification

- `pnpm vitest run` green
- `pnpm exec tsc --noEmit -p scripts` green
- `MISE_ENV=dev mise run p:plugins:check` green once U1 lands

## Guardrails

- The orchestrator commits this unit after U1.
- Touch nothing outside the two owned files.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: checker reads mise.d and refuses a landed conf.d fragment` — written by
the orchestrator after U1's commit.
