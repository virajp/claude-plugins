# U2 — setup reads bootstrap and migrates stackgen.yaml

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `SKILL.md`, `references/materialize.md`,
  `references/migrate-pipeline.md`, `references/onboard-pipeline.md`,
  `references/format-lineage.md`, `references/memory-tree.md`.

## Ruling

> - Decision 3: Shaped means `.config/bootstrap.toml` exists. A repo with
>   `.config/stackgen.yaml` and no `.config/bootstrap.toml` is migrated by
>   `/vwf:setup reshape`: it sends `bootstrap: adopt` with the values read from
>   `stackgen.yaml`, then deletes `stackgen.yaml` on the user's consent.
> - Decision 6: vwf uses bootstrap's names: `setup` (was `setup:all`), `code`
>   (was `code:all`), `code:format`, `code:lint`, `setup:worktree` with `setup`
>   as the fallback.
> - Decision 7: setup passes no `pack --set` values; forge and secrets come from
>   the tools `.config/bootstrap.toml` selects (`github`/`gitlab`;
>   `fnox`/`doppler`).
> - Decision 8: setup and doctor cite
>   `plugins/vwf/skills/init/references/bootstrap-handoff.md` by path.

## Edits

1. **`SKILL.md`** — Step 0's shaped test reads `.config/bootstrap.toml` (:63-64,
   :111-112, :133, :161, :181); remove the pack `--set` values step (:211-236);
   :322-325 per decision 6. Add the decision 3 migration to the `reshape` path:
   map `stackgen.yaml`'s values (repo name, product name, merge models, forge,
   secrets, `NODE`, `EXTERNAL`) to the adopt instruction's `tools` and `values`,
   hand off per `bootstrap-handoff.md` (cite it, do not restate it), then ask
   before deleting `stackgen.yaml`.
2. **`references/materialize.md`** (:38, :132, :197, :225, :285),
   **`migrate-pipeline.md`** (:32), **`onboard-pipeline.md`** (:55),
   **`format-lineage.md`** (:127), **`memory-tree.md`** — rewrite every passage
   that names tool-config, `stackgen.yaml` as current, `setup:all`, `code:all`
   or `setup:ai:all`.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rnE 'tool-config|setup:all|code:all|setup:ai:all|--set' plugins/vwf/skills/setup`
  — no hit.
- `grep -rn 'stackgen.yaml' plugins/vwf/skills/setup` — only the migration
  passage.

## Guardrails

- Do not touch `plugins/vwf/skills/init/**` — cite `bootstrap-handoff.md` only
  by path.
- `plugins/**/*.md` is not formatted; match the surrounding fold width by hand.

## Commit

`feat: setup reads bootstrap and migrates stackgen.yaml`
