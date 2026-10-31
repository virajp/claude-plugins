# U6 — The checker rejects pack templates, values and bootstrap payload

- **Wave:** 3
- **Depends on:** U2, U3, U4, U5
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`, new files under
  `scripts/src/fixtures/`,
  `.claude/skills/plugin-authoring/references/checks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.

## Ruling

> - Decision 4: Drop the tier and the key from the pack format. Packs ship
>   `config/` only, copied as is.
> - Decision 6: Bootstrap's: conf.d pins, `setup/deps/**`, `setup/ai/**`,
>   `setup/secrets`, gate configs (`detekt.yml`, `ktlint.editorconfig`,
>   `swiftlint.yml`, `swift-format.json`), `code/format/**`, `code/lint/**`,
>   `code/check/**`, `.npmrc`, `fnox.toml`. Stays: `test/**`, `_scripts/xcode`,
>   `p/_project/**`, `wrangler.jsonc`.
> - Decision 12: U6 (wave 3) rejects `templates/`, `values:` and bootstrap
>   payload paths.

## Edits

1. **`scripts/src/check.ts`** — rule 11, for packs only: fail a pack with a
   `templates/` directory or a `values:` key; fail a `config/` file under
   `.config/mise/conf.d/`, `.config/mise/tasks/setup/deps/`,
   `.config/mise/tasks/setup/ai/`, `.config/mise/tasks/setup/secrets`,
   `.config/mise/tasks/code/{format,lint,check}/`, or named `.npmrc`,
   `fnox.toml`, `.config/detekt.yml`, `.config/ktlint.editorconfig`,
   `.config/swiftlint.yml`, `.config/swift-format.json`. Remove the pack
   `templates/` and `values:` checks this makes dead. Keep every check on
   tool-config's own `assets/` and `templates/` trees — plan 3's.
2. **`scripts/src/check.test.ts`** — a failing case for each new refusal; drop
   cases that only test pack `templates/` or `values:`.
3. **`.claude/skills/plugin-authoring/references/checks.md`** — rule 11
   (:107-226) matches the code: `bootstrap_tools:` and its pinned list, the
   refused paths, and no pack `templates/` or `values:`.

## Verification

- `mise run p:plugins:check` — green on the tree after wave 2.
- `pnpm vitest run` — green.
- `pnpm exec tsc --noEmit -p scripts` — green.

## Guardrails

- Do not touch `plugins/**` or the tool-config tests.
- Do not remove the tool-config imports (:46, :48) or rules 4, 15, 16, 17 — plan
  3's.

## Commit

`feat: the checker refuses bootstrap payload in packs`
