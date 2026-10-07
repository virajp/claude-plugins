# G4 — Checker accepts structured gate entries

- **Wave:** 2
- **Depends on:** G1
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** plan 1's structured-entry reader in `scripts/src/check.ts`;
  G1's `TC/scripts/lib/schema.mjs`.

## Ruling

> G9 — The 22 entries become structured YAML validated by the script's schema; …
> string entries for dprint, pre-commit, grype and `all` are refused in a later
> wave.

> G10 — Rule 15 stays over the assets.

## Edits

1. The structured-entry branch plan 1 added validates every `tool` the schema
   knows — now `dprint`, `pre-commit`, `grype` and `all` besides `mise` —
   through `validateEntry`. String entries for every tool are still accepted (G8
   refuses them in wave 4).
2. Rule 15 unchanged; confirm it passes over G2's assets.
3. `check.test.ts` — a valid and an invalid structured entry per new tool; an
   `add-exclude` path `*.xcassets/` accepted; a string dprint entry still
   accepted.

## Verification

- `pnpm vitest run scripts/src/check.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`.
- Delete with `rm`, never `git rm`.

## Commit

`feat: checker validates structured dprint, pre-commit, grype and exclude entries`
