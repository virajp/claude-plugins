# U3 — stackgen prose for the migration

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/**`,
  `plugins/stackgen/skills/stackgen-stack-template/**`,
  `plugins/stackgen/skills/stackgen-sync/**`, `plugins/stackgen/assets/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** the landed tool-config `SKILL.md` and `references/mise.md`;
  the materializer reference; index.md's G1–G4.

## Ruling

> G1–G4, quoted from index.md's Assumed decisions.

## Edits

1. **tool-config `SKILL.md`** — a "Migrating an old layout" section: what `all`
   detects, the row kinds it adds (`move`, `delete`, `needs-edit`), the seeded
   values, the `older` refusal and its remedy, the lock cleanup.
2. **`references/mise.md`** — the old section files → `_base/`, `ai/`,
   `conf.d/repo/` mapping, line by line.
3. **Materializer and output-tree prose** — after a migration the lock holds no
   `source: tool-config/` entry; re-running `pack` re-records rendered pack
   files.
4. Grep `plugins/stackgen` for any passage still describing the old model as
   current; fix those inside Owns, report the rest as `DOCS FALSIFIED:`.

## Verification

- `mise run p:plugins:check` green.

## Guardrails

- Touch nothing outside Owns.
- `plugins/**/*.md` is not dprint-formatted: match the fold width; code spans on
  one line.
- Delete with `rm`, never `git rm`.

## Commit

`docs: tool-config documents migrating a stackgen-v2.0.0 repo`
