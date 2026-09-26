# U2 — This repo's formatter lists exclude the mise sidecar tree

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/dprint.json`, `.config/taplo.toml`,
  `.config/pre-commit-config.yaml`
- **Model:** opus
- **Kind:** edit
- **Read first:** the three owned files; `01-packs.md` (the same entries U1 adds
  to the packs — apply them independently).

## Ruling

> - Decision 3: This repo's `.config/dprint.json`, `.config/taplo.toml` and
>   `.config/pre-commit-config.yaml` gain the same entry.

## Edits

1. **`.config/dprint.json`** :14–15 area — add `"**/.config/mise/locks/"` to
   `excludes`.
2. **`.config/taplo.toml`** — the same entry in its exclude list.
3. **`.config/pre-commit-config.yaml`** — the `(^|/)\.config/mise/locks/`
   alternative in the global `exclude`.

## Verification

- `mise run code:precommit` green
- `mise run p:plugins:check` green

## Guardrails

- Touch nothing outside the three owned files.
- The orchestrator commits this unit first: an unstaged
  `.config/pre-commit-config.yaml` aborts every commit.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`ops: this repo's formatter lists exclude the mise lock sidecar tree` — written
by the orchestrator, first in wave 1.
