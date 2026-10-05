# U1 — The migration engine

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/lib/migrate.mjs` (new),
  `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/cli.mjs`,
  `scripts/src/tool-config-migrate.test.ts` (new),
  `scripts/src/fixtures/tool-config/migrate/**` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** the landed `tool-config.mjs`, `lib/render.mjs`,
  `lib/rows.mjs`, `lib/stackgen-file.mjs`, plan 1's
  `lib/{template,yaml,values}.mjs`; the `stackgen-v2.0.0` tree of
  `plugins/stackgen/skills/tool-config/` (`git show stackgen-v2.0.0:<path>`) —
  its assets, its lock shape (`lib/record.mjs` there) and its block grammar
  (`lib/blocks.mjs` there).
- **Lazy-load:** `scripts/src/tool-config-render.test.ts` for temp-repo helpers.

## Ruling

> G1 — The migration lives in tool-config's script: `all` on an old layout (no
> `stackgen.yaml`, old conf.d files present) returns migration rows — seed
> `stackgen.yaml` from `conf.d/env.toml` (`REPO_NAME`, merge models, `MEMBERS`)
> and `git-conventional-commits.yaml` (`commitScopes`), delete each retired
> file, render the new layout. vwf's reshape passes `--forge` and `--secrets`
> (stackgen never reads a vwf file). Pack contents come back by re-running
> `pack` for each pinned pack.

> G2 — Only `stackgen-v2.0.0`'s layout is migrated. Any other old layout is
> refused (exit 2) naming the remedy: run the last release's
> `/vwf:setup reshape` first. Test fixtures are built by running that tag's
> `all` in a scratch repo.

> G3 — Lines outside every block in the old mise section files move to
> `conf.d/repo/mise.toml` or `conf.d/repo/mise.<env>.toml` (same environment),
> one `move` row each (`ok` or `keep-existing`). In the six marked files the
> repo's own lines stay outside the new `tool-config` markers. A whole-owned
> file edited by hand is a `needs-edit` row naming its target: an extra hook
> becomes a `code/check/repo` subtask; a changed task becomes a repo subtask.

> G4 — For each file the old lock records with `source: tool-config/…` or as a
> pack's whole-file overlay that plan 2 replaced: content hash equals the record
> → `delete` row; differs → `needs-edit` naming what replaced it; a retired-name
> file the lock never recorded → left, said in `notes`. Afterwards every
> `source: tool-config/` entry leaves the lock.

Standing rulings that still bind: rows and `--answers`, refused whole on a
mismatch; the formatter runs after every write; trust is the user's; zero
dependencies.

## Edits

1. **`lib/migrate.mjs`** — `detectLayout(root)` → `new` (has `stackgen.yaml`),
   `v2` (the `stackgen-v2.0.0` markers: `conf.d/env.toml` with its `REPO_NAME`
   line, `source: tool-config/` lock entries), `none` (fresh), or `older` (any
   other old shape). For `v2`: read the old values (a narrow TOML-line reader
   for `env.toml`, the YAML reader for the conventional-commits file), read the
   old lock (a narrow reader of its shape — copy, never import, from the tag's
   `record.mjs`), classify every old file per G3/G4, and return the rows plus
   the seeded values.
2. **`tool-config.mjs`** — `all` calls `detectLayout` first: `older` → exit 2
   with the remedy; `v2` → the migration rows join the render rows in one
   numbered set, and the seeded values feed `stackgen.yaml` (flags given on the
   call win); the lock cleanup runs after the write. **`lib/cli.mjs`** — nothing
   new beyond what `all` already takes; adjust only if the migration needs it,
   and say so in `DECIDED:`.
3. **Fixtures** — build `scripts/src/fixtures/tool-config/migrate/v2-clean/` and
   `v2-edited/` by running the `stackgen-v2.0.0` script
   (`git worktree add <tmp> stackgen-v2.0.0`; run its `tool-config.mjs all` with
   a stub `mise` on `PATH` in a scratch repo) and copying the resulting tree,
   then remove the temp worktree with `git worktree remove`. Commit the trees as
   fixtures, with a `README` naming the command that built them.
4. **`tool-config-migrate.test.ts`** — the four cases of index.md's "Gates the
   orchestrator keeps" over the fixtures (clean, idempotent, edited, older),
   plus the seeded values and the lock cleanup.

## Verification

- `pnpm vitest run scripts/src/tool-config-migrate.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green; `mise run p:plugins:check` green
  (rule 16).

## Guardrails

- Touch nothing outside Owns. The temp worktree of the tag is removed before
  returning; never check the tag out in the main checkout.
- Any `mise install`/`mise lock` runs only with `HOME` and every `MISE_*` dir
  pointed at fresh `/tmp` paths (memory `mise-experiments-must-isolate-home`).
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config's all migrates a stackgen-v2.0.0 repo onto the template layout`
