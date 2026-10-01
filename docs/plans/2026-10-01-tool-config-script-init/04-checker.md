# I4 — Checker admits the hygiene asset tree

- **Wave:** 2
- **Depends on:** I1
- **Model:** opus
- **Kind:** edit
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`

## Ruling

> I4 — a `hygiene` tool lands `CONTRIBUTING.md`, `SECURITY.md`, the licence and
> the readme stub.

## Edits

1. Rule 11's asset-root allowlist admits `TC/assets/hygiene/` files; drop any
   allowance for `plugins/vwf/skills/init/assets/hygiene/` once unused (keep it
   until I5 deletes the tree — accept both this wave).
2. Tests for the new allowance.

## Verification

- `pnpm vitest run scripts/src/check.test.ts`, `tsc -p scripts`,
  `mise run p:plugins:check` green; the full wave gate.

## Commit

`feat: checker admits tool-config's hygiene assets`
