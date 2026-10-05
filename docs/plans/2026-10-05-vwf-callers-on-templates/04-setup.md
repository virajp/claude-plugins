# U4 — setup on the renderer

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/setup/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/setup/SKILL.md` whole;
  `references/{materialize,migrate-pipeline,format-lineage,onboard-pipeline,memory-tree,workspace-structure}.md`;
  plan 2's index.md (E1, E2, E9, Template names); the landed tool-config
  `SKILL.md` and `stackgen-stack-template` materializer reference.

## Ruling

> F2 — shaped = `.config/stackgen.yaml` with `format: 1`; old layout without it
> = plan 4's trigger; until plan 4 lands, setup says so and stops rather than
> reshaping it.

> F3 — setup re-derives `NODE` after pinning: `true` when any pinned pack in
> that repo is Node-based (package-manager pnpm, language typescript,
> toolchain-gate eslint, any framework whose bundle includes pnpm), else
> `false`, and calls `all --node <value>` when it changed. F4 — `EXTERNAL`
> `true` only when a pinned pack ships a `setup/external/*` task.

> F7 — `answers:` leaves `vwf.yaml` (`config_format` 23); the 22 → 23 migration
> of existing configs is plan 4's.

> F8 — setup's memory tree stops writing `.gitignore` and `.graphifyignore` (B80
> item 4); the lines are tool-config's universal ones.

> F10 — For each pinned pack: copy `config/` (unchanged), then
> `pack --slug --dir --set` with each `values:` entry's value — run `detect`,
> else ask its `question` — then record per F5. A dropped pack: `pack-remove`,
> then delete its recorded files. Re-derive `NODE`/`EXTERNAL`. `apply-entries`,
> `set-env` and `machine_env` go. `setup:ai` → `setup:ai:all` everywhere vwf
> names it.

## Edits

1. **`SKILL.md`** — Step 0's shaped check (lines 108-113) per F2; the per-run
   re-application of each pack (lines 216-236) becomes F10; `machine_env` (line
   209), `.vscode` (line 162) and the graphify hook passage (line 324) per the
   new model; `setup:ai` → `setup:ai:all`.
2. **`references/materialize.md`** — the preview/answers flow (lines 168-178)
   over `pack`/`pack-remove`/`all`; F10's values step replaces `machine_env` and
   `set-env` (lines 245-333); the answers and update_bot reads (lines 33-46,
   112-154) go — the forge is passed as `all --forge` from `origin`'s host on
   every run (replacing the in-place rewrite at line 137).
3. **`references/format-lineage.md`** — add `config_format` 23: `answers:`
   removed, values in `stackgen.yaml`; the migration is "applied by
   `/vwf:setup reshape` (plan 4)". **`references/migrate-pipeline.md`** — a 23
   row pointing at reshape; no migration body here.
4. **`references/memory-tree.md`** (lines 13-14 and around) — no banner, no
   ignore writes (F8). **`references/onboard-pipeline.md`** (line 58),
   **`references/workspace-structure.md`** (line 56) — names corrected.

## Verification

- `rg -n "update.bot|renovate|apply-entries|add-exclude|MARKED POSITION|marked position|machine_env|set-env|source: tool-config|# ==== vwf memory|setup:ai\b[^:]" plugins/vwf/skills/setup`
  prints nothing.
- `mise run p:plugins:check` green.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/setup/**`; the config schema doc
  (`plugins/vwf/assets/vwf-config.md`) is U5's.
- `plugins/**/*.md` is not dprint-formatted: match the fold width; code spans on
  one line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf setup applies packs through tool-config pack and their values`
