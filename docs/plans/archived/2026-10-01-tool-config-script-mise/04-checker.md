# U4 — Checker rules

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** `scripts/src/check.ts` around the pack-line grammar
  (`:700-776`, `toolConfigCall`), rule 6 (`:1228-1255`), rule 11
  (`TOOL_CONFIG_ROOT_FILES` `:351`, shebangs `:296-300`), the exclusion-set
  readers (`:1879-2000`, `checkExclusionSets` `:2107`); U1's
  `TC/scripts/lib/schema.mjs`.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md` (read
  only — U9 owns it).

## Ruling

> D9 — A pack's `tool-config:` entry for mise becomes structured YAML, e.g.
> `- {tool: mise, verb: add-tool, name: swiftlint, version: "0.59", env: dev}`,
> validated by `check.ts` against one schema the script exports.

> D10 — Plan 1 migrates only the mise entries. The non-mise entries keep the
> string grammar until plans 2–3, and `check.ts` accepts both shapes meanwhile.

> D11 — `all` lands `.claude/skills/mise/SKILL.md` into the repo.

Refusing a string mise entry and the `mise use` ban are **U8's**, in wave 4:
both would leave this wave red until U5 and U7 fix the offending lines in
wave 3. This unit only widens.

> D14 — the `**/.config/mise/locks/` exclusion line is removed in all four base
> lists.

## Edits

1. **Structured entries.** Where the checker reads a pack's `tool-config:` list,
   accept an entry that is a mapping: import `validateEntry` and
   `TOOL_CONFIG_ENTRY_SCHEMA` from
   `../../plugins/stackgen/skills/tool-config/scripts/lib/schema.mjs` and report
   each fault with the pack path. String entries — mise's included, until U8
   refuses them — keep today's grammar check unchanged.
2. **Rule 11 allowlist.** Allow `.claude/skills/mise/SKILL.md` in the mise asset
   tree (`TOOL_CONFIG_ROOT_FILES` or its equivalent), and hold that file to the
   landed-file rules already applied to the tree (rule 13: no plugin-relative
   citation). Strict-YAML frontmatter is required of it, as of every SKILL.md.
3. **Skill scripts.** A new check over `plugins/*/skills/*/scripts/**/*.mjs`:
   the entry files (those directly under `scripts/`) start with
   `#!/usr/bin/env node` and are executable; modules under `scripts/lib/` need
   neither. No `require(` and no non-`node:` bare import in any of them (zero
   dependencies).
4. **Exclusion sets.** Rule 15 keeps comparing the four lists; nothing to change
   if it compares sets — confirm it still passes with the locks line gone from
   all four (U2) and adjust only a hard-coded expectation of that line, if one
   exists.
5. **`scripts/src/check.test.ts`** — cases for each new or changed rule: a valid
   structured mise entry, an invalid one (unknown key, missing `version`, bad
   `env`), a string mise entry still accepted, a string dprint entry still
   accepted; the repo-local skill allowed in the mise asset tree and refused
   elsewhere in an asset tree; an entry script missing its shebang or exec bit;
   a bare import refused.

## Verification

- `pnpm vitest run scripts/src/check.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green — the `.mjs` import needs `allowJs`
  or a `.d.ts` beside the import; if neither is acceptable inside
  `scripts/tsconfig.json` (not owned), declare the import's types inline in
  `check.ts` and record that as `DECIDED:`.
- `mise run p:plugins:check` green, together with U3's skill asset after the
  wave.
- The full wave gate.

## Guardrails

- Do not touch any `pack.yaml` (U5), anything under `plugins/` (U1, U2, U3,
  U5–U7), or `checks.md` (U9 documents the rules).
- Keep the string grammar for non-mise tools byte-compatible — plans 2–3 retire
  it.
- Delete with `rm`, never `git rm`.

## Commit

`feat: checker accepts structured tool-config entries and checks skill scripts`
