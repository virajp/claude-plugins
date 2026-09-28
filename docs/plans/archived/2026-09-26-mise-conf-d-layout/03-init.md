# U3 — init splices into the conf.d layout, and reshape migrates the old one

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/references/tool-configs.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `new-repo.md` :280–310, :425–610, :680–710, :1025–1040;
  `existing-repo.md` :260–290, :480–510, :750–795; `tool-configs.md` :15–55;
  `SKILL.md` :370–385; index.md's Facts.
- **Lazy-load:** `init/references/fragments-and-sections.md` (the marker-merge
  idiom the migration reuses); `.claude/skills/plugin-authoring/SKILL.md`.

## Ruling

> - Decision 2: `.config/mise.toml` and `.config/mise.<env>.toml` hold only
>   `[settings]` and top-level keys. `RUNTIME_BLOCK` stays at the end of
>   `[settings]`.
> - Decision 3: Every other section is its own file,
>   `.config/mise/conf.d/<section>.toml` for all environments and
>   `<section>.<env>.toml` for one.
> - Decision 4: One `.config/mise/mise.lock`.
> - Decision 6: every vwf caller uses `MISE_ENV=dev mise run setup:all`.
> - Decision 8: `REPO_NAME`, `MERGE_MODEL_DEVELOP`/`MAIN` and `MEMBERS` sit in
>   `conf.d/env.toml`, `PATH_ENTRIES` at its end; the `setup-<member>` alias
>   template in `conf.d/shell_alias.dev.toml`; `RUNTIME_BLOCK` stays in
>   `mise.toml` `[settings]`. init's splices and doctor's predicates read those
>   files.
> - Decision 9: `/vwf:setup reshape` migrates a repo on the old layout: one
>   consent-gated plan row per repo moves each table into its `conf.d` section
>   file, keeps hand-added lines, adds `miserc.toml`, and replaces the old
>   per-file locks with one combined lock.
> - Decision 12: Any sentence or comment you add is short.

## Edits

1. **`new-repo.md`** — every splice names its new file: :285–297 no longer
   assumes both runtime positions share a file (`RUNTIME_BLOCK` in `mise.toml`,
   `PATH_ENTRIES` in `conf.d/env.toml`); :430–446 list; :456–468 aliases →
   `conf.d/shell_alias.dev.toml`; :510, :538–545, :596–601, :1032. §10 runs
   `MISE_ENV=dev mise run setup:all`, one sentence why.
2. **`existing-repo.md`** — :266–280: a moved root file's `[env]` goes to
   `conf.d/env.toml`, `[tools]` to `conf.d/tools.toml` (or the environment's
   file), any other table to its section file; :485–507, :758–790 follow. Add
   the **layout migration** row (decision 9): detected when a
   `.config/mise*.toml` carries a non-settings table or `.config/mise*.lock`
   exists; the row lists each table → its target file, preserves hand lines,
   adds `.config/miserc.toml`, removes the old locks and runs the combined
   `mise lock` from decision 4; offered once per repo, consent-gated.
3. **`tool-configs.md`** :23–30, :39, :48 — the layout is `miserc.toml`,
   settings-only mise files, and `conf.d` section files; drop "four files".
4. **`SKILL.md`** :378–379 — same.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `grep -n "mise.dev.toml\|\[env\] block" plugins/vwf/skills/init -r` shows no
  splice target still pointing at a top-level table

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the four owned files.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: vwf init — splice into conf.d section files, reshape migrates the old layout`
— written by the orchestrator after the wave gate.
