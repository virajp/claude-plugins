# U8 — this repo drops .editorconfig and takes the strip

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `.editorconfig` (removed), `.config/mise/tasks/setup/precommit`
- **Model:** opus
- **Kind:** edit
- **Read first:** `.config/mise/tasks/setup/precommit`; U1's
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/precommit`.

## Ruling

> - Decision 12: … This repo's copy is deleted.
> - Decision 17: This repo's `.config/mise/tasks/setup/precommit` becomes a
>   byte-copy of the tool-config asset.

## Edits

1. **`rm .editorconfig`.**
2. **`cp`** the asset `setup/precommit` over this repo's, keeping mode 755;
   `cmp` them.

## Verification

- `cmp` reports identical
- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- `MISE_ENV=dev mise run code:precommit` green

## Guardrails

- Do not run `setup:precommit` here — it is an after-landing step.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`ops: drop .editorconfig and take the raw-hook strip` — written by the
orchestrator after the wave gate.
