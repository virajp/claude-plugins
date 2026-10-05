# U5 — Checker tighten

- **Wave:** 3
- **Depends on:** U2, U3
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`,
  `plugins/stackgen/skills/tool-config/scripts/lib/schema.mjs` (deleted),
  `.claude/skills/plugin-authoring/references/checks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `scripts/src/check.ts` (39, 65-70, 409-440, 487-489, 501-854,
  876, 1766-2015); `check.test.ts`; `checks.md:141-199, 270-279`; the trees U2
  and U3 landed.

## Ruling

> E19 (U5's half) — U5 tightens (wave 3): refuse `tool-config:` and
> `machine_env` keys, validate that a pack's `templates/` uses only `@@` names
> from the Template names table or its own `packs.<slug>` keys, drop the
> `schema.mjs` import and delete it, rewrite rule 15's readers for the new asset
> paths. Commit order in wave 3: U4 then U5.

> E13 — renovate config paths and the `update_bot` enum leave the checker.

> E7 — the gitleaks allowlist stays a subset of the formatter excludes (rule 15
> keeps asserting it).

## Edits

1. **`check.ts`** — remove the `schema.mjs` import (39, 65-70) and every use of
   `validateEntry`; rule 11 refuses a `tool-config:` or `machine_env:` key in a
   `pack.yaml` (a finding naming the file and the replacement: `templates/` or a
   subtask); the string-grammar path (817-854), the
   `machine_env`-needs-`add-env` cross-check (487-489, 650-662, 771-803), the
   renovate paths (410-419) and the `update_bot` enum (876) go;
   `TOOL_CONFIG_ROOT_FILES`/`toolConfigTrees` walk `assets/` and `templates/` at
   their flattened paths; a new check lists the `@@` names in each pack's
   `templates/` and refuses one outside the Template names table and the pack's
   own `packs.<slug>` keys (any upper-snake name not in the table is taken as
   the pack's own — refuse only names that collide with a global name); rule
   15's readers (1827-1953) read the flattened asset paths and skip `@@` tokens.
2. **`rm`** `plugins/stackgen/skills/tool-config/scripts/lib/schema.mjs`.
3. **`check.test.ts`** — drop the entry-grammar cases; add refusal cases for
   `tool-config:`, `machine_env:` and a colliding template name.
4. **`checks.md`** — rule 11 and rule 15 restated for the new shapes; the
   seventeen-rule count is unchanged unless a rule disappears (say so if one
   does, as `DOCS FALSIFIED:` for `CLAUDE.md`).

## Verification

- `pnpm vitest run scripts/src/check.test.ts` green.
- `mise run p:plugins:check` green over the tree U2–U4 left.
- `pnpm exec tsc --noEmit -p scripts` green.
- `rg -n "schema\.mjs|validateEntry|update_bot|renovate" scripts/src/check.ts`
  prints nothing.

## Guardrails

- Touch nothing outside Owns. Commit **after** U4 (index.md's Waves).
- `checks.md` is plugin-authoring doctrine, not dprint-excluded: keep code spans
  on one line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the plugin checker refuses tool-config entries and checks pack template names`
