# U8 — Checker tightening: string mise entries and bare `mise use`

- **Wave:** 4
- **Depends on:** U4, U5, U7
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** U4's changes in `scripts/src/check.ts` (the structured-entry
  reader) and `scripts/src/check.test.ts`.

## Ruling

> D9 — A pack's `tool-config:` entry for mise becomes structured YAML, validated
> by `check.ts` against one schema the script exports.

> D10 — Plan 1 migrates only the mise entries. The non-mise entries keep the
> string grammar until plans 2–3.

> D13 — Bare `mise use` is forbidden: a tool is entered into the config first,
> then installed with `mise install`. … a checker rule fails any `mise use`
> under `plugins/**`.

User, verbatim: *"base `mise use` command must be forbidden. All mise tools must
be first entered into the config and then use `mise install`."*

This unit runs in wave 4 because both rules fail on content U5 and U7 fix in
wave 3; landing them earlier would leave a wave gate red.

## Edits

1. **String mise entries refused.** A pack `tool-config:` entry that is a string
   whose tool word is `mise` is a fault: "mise entries are structured — see
   plugins/stackgen/assets/pack-format.md". String entries for every other tool
   keep today's grammar check unchanged.
2. **`mise use` ban.** Fail any line in any file under `plugins/**` that runs a
   bare `mise use` — the words `mise use` followed by a space and then a
   non-dash word or a `-g` flag — unless the same line carries the word `never`
   (the doctrine sentences that forbid it). Report path and line.
3. **`scripts/src/check.test.ts`** — a string mise entry refused, a string
   dprint entry accepted; `mise use node` and `mise use -g pipx:x` refused;
   `never run a bare mise use` accepted.

## Verification

- `pnpm vitest run scripts/src/check.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green — every string mise entry and every bare
  `mise use` was removed in wave 3. A hit here is an `UNRESOLVED:` naming the
  file and the unit that owned it, never a fix outside Owns.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`.
- Delete with `rm`, never `git rm`.

## Commit

`feat: checker refuses string mise entries and bare mise use`
