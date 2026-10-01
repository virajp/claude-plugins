# Decision — the plugins ship no editor configuration

**Date** 2026-10-01 · **Branch** `2026-10-01-drop-vscode` · **Plan**
[`docs/plans/2026-10-01-drop-vscode/`](../../plans/2026-10-01-drop-vscode/index.md)
· **Supersedes**
[`2026-09-06-editor-fragments-inside-the-fence.md`](./2026-09-06-editor-fragments-inside-the-fence.md)
and [`2026-09-20-init-editor-dedupe.md`](./2026-09-20-init-editor-dedupe.md)

## What was decided before

On 2026-09-06 the `config/`-tier fence was narrowed so a pack could ship a
per-pack editor fragment at `.config/vscode.d/<pack>.jsonc`, three keys wide,
which `/vwf:init` composed into one marked block in `.vscode/settings.json` and
`.vscode/extensions.json`, with a `setup:vscode` task keeping a per-repo editor
profile in step with the composed recommendations. On 2026-09-20 the composition
learned to read the hand section and ask about a colliding key — keep, take or
union — recorded under `enforcement.editor_keys`. On 2026-09-21 every fragment
became conditional on `editor: vscode`, an axis init asked as its seventh
question and, from `config_format` 21, recorded as `answers.editor`.

## What changed

The user, verbatim: *"drop vscode settings from the plugin, let user create and
manage their vscode settings (for now, may make dedicated skill for it but
later)"*.

- **E1 — the `editor` axis is retired everywhere**: init's editor question (init
  now asks eight), `answers.editor`, tool-config's `editor` key, the pack
  `conditional:` `when: editor`, the checker's axis and the materializer's
  condition. `conditional:` itself stays documented with three axes — `forge`,
  `secrets`, `update_bot` — and no shipped pack uses it today.
- **E2 — what is deleted**: all twelve shipped fragments (tool-config's mise,
  dprint and pre-commit ones, init's hygiene baseline, and the eight pack ones —
  astro, pnpm, analysis-options, eslint, ruff, swift-format, swiftlint,
  tsconfig); init's editor merge and its reference; the `setup:vscode` task and
  its call in `setup:all`.
- **E3 — shaped repos** move by `config_format` 21 → 22: the migration drops
  `answers.editor` and `enforcement.editor_keys`, and offers each
  `.config/vscode.d/*.jsonc` for delete, one row each. `.vscode/` is the user's
  and is never touched — its files, a block an earlier run composed and its
  markers all stay. tool-config's mise migration deletes a landed
  `.config/mise/tasks/setup/vscode` with its lock entry only where its content
  matches its record and the repo's `setup/all` no longer calls it; otherwise it
  is kept and reported.
- **E4 — thin packs**: `analysis-options` and `tsconfig` carried nothing in
  `config/` but their fragment, so they become doctrine-only packs — conventions
  and skill stay, bundles unchanged.
- **E5 — the `.vscode/` gate lines stay**: dprint's `jsonTrailingCommaFiles`
  entry, pre-commit's `check-json` exclude (its comment now says `.vscode/`
  files are JSONC by design) and the `.gitignore` note leaving `.vscode/`
  tracked. They protect a user's own files, not a plugin's.
- **E6 — this repo** deletes its four dead `.config/vscode.d/` fragments and
  keeps its own `.vscode/`.

The fence is back to four things outside it, the third now **editor settings**
outright, as it read before 2026-09-06.

## The alternatives rejected

- **Keep the axis for a future editor** — an axis with no fragment behind it is
  a question asked for nothing.
- **Strip init's marked block from `.vscode/` on migration** — the files are the
  user's now, and a rewrite of a file they may have edited around the block is
  the wrong default; they keep or edit it by hand.
- **Retire `analysis-options` and `tsconfig`** — their doctrine is still what an
  agent reads when it writes `analysis_options.yaml` or `tsconfig*.json`.
  Landing real base configs from templates is parked for a later plan.

## Later

A dedicated vscode skill for users who want one is the user's "later" — not
planned.
