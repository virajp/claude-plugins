# U6 — the kept-file key and config_format 18

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/skills/setup/references/format-lineage.md`,
  `plugins/vwf/skills/setup/references/migrate-pipeline.md`. Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom. The schema is `vwf-config.md`
  — the `## Schema (config_format 16)` heading and the `config_format: 16` line,
  the `enforcement:` block, and the "who writes what" table (the `enforcement`
  row). The lineage file's "What the stamps mean now" paragraph is where a
  never-issued integer is recorded; its table is where a retired spelling
  resolves. `migrate-pipeline.md` is what `/vwf:setup`'s migrate mode runs when
  a stamp is behind.
- **Lazy-load:** `plugins/vwf/skills/init/references/existing-repo.md` around
  its kept-file paragraph, and
  `plugins/vwf/skills/doctor/references/stack-checks.md` predicate (e) —
  read-only, to see the two readers of the key you define.

## Ruling

Quoted from index.md:

> **4. Recording a kept file.** DECIDED 2026-09-12 by the user, after both U1
> and U2 returned the fallback: the record is a **new key**,
> `enforcement.kept_files:` — a map of `<path>: { reason: <one line> }`, the
> path relative to the repo root as the lockfile names it — and `config_format`
> bumps **16 → 18**. Seventeen is never issued: the user's rule is that every
> version line skips 13 and 17, and a repo whose `config_format` reads 17 is
> treated as 16. `init` writes the key (consented, in its single plan); `init`
> and `doctor` read it. An absent block reads as empty; migrate adds
> `kept_files: {}` when the block lacks it and rewrites the stamp.

## Edits

1. **`vwf-config.md`** — the schema heading and the `config_format:` line read
   18. Under `enforcement:`, after `rules:`, add `kept_files: {}` with a
   trailing comment in the file's own style: `<path>: { reason: <one line> }`,
   written by `/vwf:init` when a pack-owned file is kept over the pack's on a
   reshape, read by `init` (never re-offered) and `doctor` (predicate (e) skips
   it); the path is the lockfile's. In the "who writes what" table the
   `enforcement` row gains `init` (`kept_files`, consented) among the writers
   and `init`, `doctor` among the readers. If the file carries a sentence saying
   `config_format` 17 follows 16, or enumerates the format history, reconcile it
   — otherwise add nothing about 17 here; the lineage file owns that fact.
2. **`format-lineage.md`** — "What the stamps mean now": `config_format` reads
   **18**; the paragraph on never-issued integers now says both lines skip 13
   and 17 **for `config_format` 17 only** — 13 was issued on the config line and
   stays real, so the sentence "`config_format` 13 is real" must survive; a repo
   reading `config_format` 17 is treated as 16. In the lineage table add one
   `config-key` row: an absent `enforcement.kept_files` → `{}` (the block
   introduced in format 18; nothing retired). No fan-out.
3. **`migrate-pipeline.md`** — where the migrate mode reconciles the config
   against the current schema, one sentence: a config behind 18 gains
   `enforcement.kept_files: {}` when absent, and the stamp is rewritten; there
   is no content to migrate because nothing wrote the key before 18.

## Verification

- `grep -n 'config_format 18\|config_format: 18' plugins/vwf/assets/vwf-config.md`
  hits both; `grep -n 'kept_files' plugins/vwf/assets/vwf-config.md` hits the
  block and the table row.
- `grep -n '18\|kept_files\|13 is real' plugins/vwf/skills/setup/references/format-lineage.md`
  hits the stamp paragraph, the row, and the surviving sentence.
- `grep -n 'kept_files' plugins/vwf/skills/setup/references/migrate-pipeline.md`
  hits.
- `grep -rn 'config_format 16\|config_format: 16\|(16)' plugins/vwf/assets/vwf-config.md plugins/vwf/skills/setup/references/format-lineage.md`
  is empty.
- `mise run p:plugins:check` green; frontmatter untouched.

## Guardrails

- Do not touch `init` (U1), `doctor` (U2), `setup/SKILL.md` (U3, green), or any
  doc outside the three owned files; report every passage elsewhere that names
  `config_format` 16 as `DOCS FALSIFIED:` (the survey found
  `site/src/content/docs/plugins/vwf.md` and
  `.claude/skills/vwf-plugin/references/{docs-tree,assets,dependencies}.md`).
- The schema names no tool and no pack; the key's path is the lockfile's.
- `plugins/**/*.md` is not formatter-covered — match the surrounding fold width
  by hand; `vwf-config.md`'s long comment lines are its own style, keep it.

## Commit

`feat: config_format 18 — enforcement.kept_files records a kept pack file` —
written by the orchestrator after the wave gate. Type `feat`; no scope.
