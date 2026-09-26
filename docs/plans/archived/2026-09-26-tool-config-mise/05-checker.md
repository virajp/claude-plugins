# U5 — The checker, the inventory and the gates follow tool-config

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`,
  `scripts/src/inventory.ts`, `.config/mise/tasks/p/plugins/shellcheck`,
  `.config/dprint.json`, `.config/pre-commit-config.yaml`
- **Model:** opus
- **Kind:** edit
- **Read first:** `check.ts` — pack walks (:432, :1272, :1300), `PACK_CONF_D`
  and `packFactFaults` (:549–701); `check.test.ts` :671–790; `inventory.ts` :69,
  :178, :247; the shellcheck task :40–80; `.config/dprint.json:10`;
  `.config/pre-commit-config.yaml:105,129,151`; index.md's Facts.

## Ruling

> - Decision 11: Rule 11: each `machine_env` name must be set by a `mise … env`
>   call in the pack's `tool-config:` list; a file under a pack's
>   `config/.config/mise/conf.d/` is a finding. The pack walks (:432, :1272,
>   :1300), rule 13, shellcheck and this repo's payload exclusions also cover
>   `plugins/stackgen/skills/tool-config/assets/*`. `inventory.ts` drops the
>   mise bundle.
> - Decision 15: Any comment a unit adds is one line.

## Edits

1. **Rule 11** — `machine_env` names checked against the `tool-config:` list's
   `mise … env` lines (parse the key names from each instruction); a landed
   `conf.d` fragment is a finding.
2. **Walks and rule 13** — also treat each
   `plugins/stackgen/skills/tool-config/assets/<tool>/` as a payload root
   (landed-citation checks, exec bits and shebangs on task files).
3. **`inventory.ts`** — no mise bundle; an `unconditional` bundle list may now
   hold two entries.
4. **`check.test.ts`** — fixtures for the new rule-11 shape; a pack with a
   `conf.d` fragment fails; a `machine_env` name no call sets fails.
5. **Shellcheck task** :45, :74 — also
   `plugins/stackgen/skills/tool-config/assets/*`.
6. **`.config/dprint.json`** :10, **`.config/pre-commit-config.yaml`** :105,
   :129, :151 — the payload exclusions also match
   `plugins/stackgen/skills/tool-config/assets/`.

## Verification

- `pnpm vitest run` green
- `pnpm exec tsc --noEmit -p scripts` green
- `MISE_ENV=dev mise run code:precommit` green on the two `.config` files
- `MISE_ENV=dev mise run p:plugins:check` and `p:plugins:shellcheck` green once
  U1 and U3 land

## Guardrails

- The orchestrator commits this unit **first** in wave 1 (it owns
  `.config/pre-commit-config.yaml`).
- Touch nothing outside the six owned files.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: checker, inventory and gates cover stackgen:tool-config` — written by the
orchestrator, first in wave 1.
