# Decision — one universal `.vscode/settings.json` ships with tool-config

**Date** 2026-10-05 · **Branch** `2026-10-05-tool-config-templates` · **Plan**
[`docs/plans/2026-10-05-tool-config-templates/`](../../plans/2026-10-05-tool-config-templates/index.md)
· **Supersedes**
[`2026-10-01-editor-config-dropped.md`](./2026-10-01-editor-config-dropped.md)
E1-E3 (B40: no editor configuration in either plugin; `.vscode/` the user's)

## What was decided before

On 2026-10-01 the plugins stopped shipping any editor configuration: the
`editor` axis, every per-pack fragment and `setup:vscode` were retired, and a
repo's `.vscode/` was left as the user's, never touched.

## What changed

The user fixed the reference layout in
`~/Projects/github.com/virajp/bootstrap/.config`, whose `.vscode/settings.json`
every repo now shares. Confirmed with the other nine reversals on 2026-10-05:
*"yes, confirm all ten"*.

- **V1 — one asset.** `skills/tool-config/assets/.vscode/settings.json` is
  bootstrap's file byte for byte, landed by `all` into every repo and owned
  whole: a hand edit is a `write` row answered `ok` or `keep-existing`.
- **V2 — still no pack editor settings.** No pack ships one and nothing is
  composed; the `editor` axis stays retired.
- **V3 — the gate lines stay.** dprint's `jsonTrailingCommaFiles` names
  `.vscode/settings.json`, pre-commit's `check-json` keeps `exclude: ^\.vscode/`
  with its comment, and `.gitignore` leaves `.vscode/` tracked.
- **V4 — `.config/claude-status.json`** ships beside it, a template naming the
  project from `origin` (`PROJECT_NAME`).

## The alternatives rejected

- **Leave `.vscode/` to the user** — every repo then carries a hand-copied file
  that drifts from bootstrap's.
- **Per-pack fragments composed again** — the composition machinery 2026-10-01
  removed.
