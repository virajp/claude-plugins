# U1 — Checker widen

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** `scripts/src/check.ts` rule 11 (`checkPackConfigTier` 501-664,
  `packFactFaults` 665-834), the init assets walk (483-486),
  `TOOL_CONFIG_ROOT_FILES` / `toolConfigTrees` (409-440, 856);
  `scripts/src/check.test.ts` 399-1038.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` for the pack shape.

## Ruling

> E18 — Retiring `tool-config:` moots items 1, 3, 4. Item 2: the init assets
> walk gains a root allowlist — `CONTRIBUTING.md`, `SECURITY.md`, `licenses/`,
> `.github/ISSUE_TEMPLATE/`; anything else is a finding.

> E19 (U1's half) — U1 widens (wave 1): accept a pack `templates/` folder,
> subtask paths, a pack with no `tool-config:`; add E18.

> E10 — subtask paths: `code/{check,lint,format}/<slug>`,
> `setup/deps/<verb>/<slug>`, `setup/ai/<slug>` under a pack's
> `config/.config/mise/tasks/` (or `templates/.config/mise/tasks/`).

## Edits

1. **`check.ts`** — the widening is additive; every current shape stays accepted
   until U5:
   - a pack directory may hold `templates/` beside `config/`; files under it are
     checked by the same landed-path rules as `config/` (rule 13 citations, rule
     16 not applicable);
   - a pack's task files may sit at the subtask paths of E10, and a subtask's
     leaf name must equal the pack's slug (`code/lint/eslint` only in the eslint
     pack) — a finding otherwise;
   - a pack with no `tool-config:` key and no `machine_env:` key is valid (it
     already is — assert it in a test);
   - the init assets walk (483-486) passes a root allowlist — `CONTRIBUTING.md`,
     `SECURITY.md`, `licenses/`, `.github/ISSUE_TEMPLATE/` — instead of `null`;
     a file outside it is a rule-11-family finding naming the path.
2. **`check.test.ts`** — cases for each widening (templates folder accepted,
   subtask leaf mismatch refused, allowlist hit and miss); every existing case
   still passes.

## Verification

- `pnpm vitest run scripts/src/check.test.ts` green.
- `mise run p:plugins:check` green over today's tree.
- `pnpm exec tsc --noEmit -p scripts` green.

## Guardrails

- Touch nothing outside the two owned files. Do not remove the `schema.mjs`
  import or any current rule — U5 tightens.
- Never `cat > file <<EOF` — use the Write/Edit tools.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the plugin checker accepts pack templates and per-pack subtasks`
