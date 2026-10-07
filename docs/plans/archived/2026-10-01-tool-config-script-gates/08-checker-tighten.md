# G8 — Checker refuses string gate entries

- **Wave:** 4
- **Depends on:** G4, G5
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** G4's changes; `check.ts` `:720-764`, `:846-876` (the string
  grammar for these tools).

## Ruling

> G9 — … string entries for dprint, pre-commit, grype and `all` are refused in a
> later wave.

Runs in wave 4 because the refusal fails on content G5 migrates in wave 3.

## Edits

1. A string `tool-config:` entry whose tool word is `dprint`, `pre-commit`,
   `grype` or `all` is a fault ("structured — see pack-format.md"). git strings
   stay accepted (plan 3).
2. Remove the now-unreachable string grammar for those tools — `DPRINT_PLUGINS`,
   `HOOK_PAIR`, `TOOL_CONFIG_HOOK`, their `TOOL_CONFIG_GATE_VERBS` rows,
   `TOOL_CONFIG_LONE_EXCLUDE`, `hookFault` — keeping the git rows and the shared
   `toolConfigCall` path git still uses.
3. `check.test.ts` — string dprint, pre-commit and `all` entries refused; a git
   string accepted; drop the cases for the removed grammar.

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

`feat: checker refuses string dprint, pre-commit and exclude entries`
