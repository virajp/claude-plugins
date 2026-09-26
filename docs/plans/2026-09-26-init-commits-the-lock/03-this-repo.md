# U3 — This repo's setup:mise gains --lock-only

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise/tasks/setup/mise`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file; `02-mise-pack.md` (apply the same edit
  independently — do not wait for or copy U2's result).

## Ruling

> - Decision 2: `setup:mise` gains `--lock-only`: write the combined lock only
>   when it is missing, then exit before installing; with a lock present, do
>   nothing.
> - Decision 3: `.config/mise/tasks/setup/mise` stays byte-identical to the
>   pack's.

## Edits

1. Apply `02-mise-pack.md` Edit 1 to this repo's copy. The orchestrator diffs it
   against the pack's after the wave; any difference is a finding.

## Verification

- `MISE_ENV=dev mise run code:precommit` green
- `MISE_ENV=dev mise run setup:mise --lock-only` in this repo changes no file
  (the lock exists)

## Guardrails

- Touch nothing outside the owned file; never `--upgrade` here.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`ops: this repo's setup:mise gains --lock-only` — written by the orchestrator
after the wave gate.
