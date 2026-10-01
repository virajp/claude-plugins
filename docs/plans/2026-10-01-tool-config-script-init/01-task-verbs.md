# I1 — Task-library verbs

- **Wave:** 1
- **Depends on:** —
- **Model:** opus
- **Kind:** edit
- **Owns:**
  `plugins/stackgen/skills/tool-config/scripts/lib/{cli,schema,bash}.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/mise.mjs`,
  `scripts/src/tool-config-tasks.test.ts`,
  `scripts/src/fixtures/tool-config/tasks/**`
- **Read first:** `plugins/vwf/skills/init/references/existing-repo.md` passes
  3, 4, 5, 8, 9; `new-repo.md` §7; `TC/references/mise.md` §8 (legacy table) and
  the mandatory set.

## Ruling

> I1 — `mise migrate-tasks --ids …` (passes 3, 5, 8, 9 and `_default` creates)
> and `mise audit-shebangs` (pass 4, flag rows only).

> I2 — `_default`: bash shebang,
> `#MISE description="<id> — no project tasks yet"`, helper `source`, prints "no
> project tasks yet", exit 0, mode 755, slot marker kept, no `hide=true`.

> I3 — a node bash-function scanner; unparseable → `needs-edit`.

## Edits

1. `lib/bash.mjs` — list function definitions with verbatim bodies (handle
   braces, heredocs, quotes, comments).
2. `lib/tools/mise.mjs` — `migrate-tasks --ids <a,b>`: rows exactly as the
   passes describe (renames incl. inline `[tasks.*]` → file, collision rule,
   caller rewrites in task files, mise layers, pre-commit config,
   `[shell_alias]`; helper replace + sidecar create/append + `source` inserts;
   group renames of both kinds; `_default` creates; repo-owned notes).
   `audit-shebangs`: one flag row per non-bash task. Both previewable, applied
   with `--answers`.
3. `lib/cli.mjs`, `lib/schema.mjs` — the two verbs.
4. Tests with fixture repos for every row kind and a re-run returning no rows.

## Verification

- `pnpm vitest run scripts/src/tool-config-tasks.test.ts` and
  `pnpm exec tsc --noEmit -p scripts` green; the full wave gate.

## Commit

`feat: tool-config migrate-tasks and audit-shebangs verbs`
