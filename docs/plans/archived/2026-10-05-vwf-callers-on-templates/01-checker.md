# U1 — The checker accepts pack `values:`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`,
  `.claude/skills/plugin-authoring/references/checks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `scripts/src/check.ts` rule 11 and the pack-template name
  check plan 2's U5 added; `check.test.ts`; `checks.md` rule 11.

## Ruling

> F1 — A `values:` list in `pack.yaml`, each entry `name` (upper snake),
> `detect` (a shell command printing the value, exit non-zero when unknown) and
> `question`. The checker requires every `values:` name to appear as
> `@@<name>@@` in the pack's `templates/`, and every pack-own `@@` name to be
> declared in `values:`.

## Edits

1. **`check.ts`** — rule 11 accepts an optional `values:` key: a block list of
   mappings, each with exactly `name` (`^[A-Z][A-Z0-9_]*$`, not a global
   Template name), `detect` (non-empty string) and `question` (non-empty
   string); a malformed entry is a finding naming the line. Two cross-checks: a
   `values:` name absent from the pack's `templates/` is a finding; an `@@` name
   in the pack's `templates/` that is neither a global name nor in `values:` is
   a finding (this replaces plan 2's looser "own name" rule). `machine_env:`
   stays refused, the message naming `values:`.
2. **`check.test.ts`** — accepted `values:`, each malformed shape, both
   cross-checks, the `machine_env` message.
3. **`checks.md`** — rule 11 gains the `values:` paragraph.

## Verification

- `pnpm vitest run scripts/src/check.test.ts` green.
- `mise run p:plugins:check` green over the tree plan 2 left.
- `pnpm exec tsc --noEmit -p scripts` green.

## Guardrails

- Touch nothing outside Owns.
- `checks.md` is dprint-formatted: keep code spans on one line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the plugin checker accepts a pack's values list`
