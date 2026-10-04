# H4 — Checker accepts structured git and graphify entries

- **Wave:** 2
- **Depends on:** H1
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** the structured-entry branch plans 1–2 added in
  `scripts/src/check.ts`; H1's `TC/scripts/lib/schema.mjs`.

## Ruling

> H8 — Every pack entry is structured; … template names are validated against
> the vendored set (covers B78 items 2 and 13).

## Edits

1. The structured branch validates `git` and `graphify` entries through
   `validateEntry` — a `template` outside the vendored list and a
   `gitignore:<Name>` requester are faults. String git entries are still
   accepted (H8 retires them in wave 4).
2. `check.test.ts` — a valid and an invalid structured entry per verb; an
   unknown template refused; `gitignore:Node` in a pack entry refused.

## Verification

- `pnpm vitest run scripts/src/check.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`.
- Delete with `rm`, never `git rm`.

## Commit

`feat: checker validates structured git and graphify entries and template names`
