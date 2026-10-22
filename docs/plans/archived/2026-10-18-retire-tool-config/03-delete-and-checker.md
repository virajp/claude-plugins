# U3 — Delete tool-config and renumber the checker

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `plugins/stackgen/skills/tool-config/**`,
  `scripts/src/tool-config-render.test.ts`,
  `scripts/src/tool-config-template.test.ts`,
  `scripts/src/tool-config-values.test.ts`,
  `scripts/src/fixtures/tool-config/**`, `scripts/src/check.ts`,
  `scripts/src/check.test.ts`,
  `.claude/skills/plugin-authoring/references/checks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `scripts/src/check.ts`, `scripts/src/check.test.ts`,
  `.claude/skills/plugin-authoring/references/checks.md`.

## Ruling

> - Decision 1: miserc, `.gitattributes`, `.graphifyignore`, the statusline
>   config and `code:count` go with tool-config; bootstrap items B06–B10 own
>   them.
> - Decision 2: taplo goes: "`taplo` is no more required as `dprint` does it's
>   work now".
> - Decision 6: Rules 4 and 15 go; rule 11 loses its tool-config part. Renumber
>   1 to 15: 1–3 unchanged, 5–14 → 4–13, 16 → 14, 17 → 15. Archived plans keep
>   their old numbers.

## Edits

1. **Delete** with `rm -r`: `plugins/stackgen/skills/tool-config/`,
   `scripts/src/fixtures/tool-config/`; with `rm`: the three
   `scripts/src/tool-config-*.test.ts` files.
2. **`scripts/src/check.ts`** — remove the imports at :46 and :48 and every use;
   remove rule 4 and rule 15 and their constants; remove rule 11's checks on
   tool-config's `assets/` and `templates/` trees (keep the pack checks plan 1
   left); rule 13 and rule 17 stop naming tool-config paths (`conf.d/_base`,
   `ai`); renumber every rule label and message per decision 6.
3. **`scripts/src/check.test.ts`** — drop the cases for the removed rules and
   tool-config trees (the "exclusion sets" block, :1960); keep "skill scripts"
   (:1291) on a fixture if it read tool-config's script; renumber.
4. **`.claude/skills/plugin-authoring/references/checks.md`** — remove rules 4
   and 15 and rule 11's tool-config part, renumber 1 to 15, and state the count
   as fifteen.

## Verification

- `pnpm vitest run` — green.
- `pnpm exec tsc --noEmit -p scripts` — green.
- `mise run p:plugins:check` — green.
- `grep -rn 'tool-config' scripts/src` — no hit.

## Guardrails

- Do not edit `docs/plans/**` or this repo's `.config/`.
- Delete with `rm`, never `git rm`.

## Commit

`feat: retire stackgen:tool-config`
