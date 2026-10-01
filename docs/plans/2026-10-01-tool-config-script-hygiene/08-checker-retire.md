# H8 — Checker retires the string grammar

- **Wave:** 4
- **Depends on:** H4, H5
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** `scripts/src/check.ts` — the string gate in `packFactFaults`
  and everything the survey listed (`TOOL_CONFIG_SCOPE`, `TOOL_CONFIG_VALUE`,
  `TOOL_CONFIG_VERBS`, the git rows of `TOOL_CONFIG_GATE_VERBS`,
  `TOOL_CONFIG_FOR`, `toolConfigCall`).

## Ruling

> H8 — Every pack entry is structured; `check.ts`'s string path, `for`-suffix
> grammar and their tests are deleted.

Runs in wave 4: the refusal fails on content H5 migrates in wave 3.

## Edits

1. A string `tool-config:` entry of any kind is a fault ("tool-config entries
   are structured — see pack-format.md").
2. Delete the string grammar and `toolConfigCall`; keep `isStringList` and
   `TOOL_CONFIG_ROOT_FILES` (used elsewhere). The `machine_env` check reads the
   declared keys from structured `add-env` entries.
3. `check.test.ts` — delete the string-grammar cases; add one refusing a string
   entry and one confirming `machine_env` still resolves from a structured
   entry.

## Verification

- `pnpm vitest run scripts/src/check.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green — a hit is an `UNRESOLVED:` naming the file,
  never a fix outside Owns.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: checker retires the tool-config string grammar`
