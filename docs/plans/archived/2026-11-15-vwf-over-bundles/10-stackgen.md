# U10 — stackgen: the menu, the materialized entry and addons

- **Read first:** `plugins/stackgen/skills/stackgen-stack-menu/` and
  `plugins/stackgen/skills/stackgen-stack-template/` with their references,
  and `plugins/stackgen/assets/addons.yaml`, `output-tree.md` and
  `pack-format.md`, as R5a leaves them.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D23:** each bundle entry of the menu payload carries the bundle's
  `tools:`. The materialized entry `.claude/stackgen/templates/<slug>.md`
  carries the same `tools:` list in its frontmatter. Setup reads the tools
  from the menu payload, before it materializes; doctor reads them from the
  materialized entry.
- **D15, D24:** `assets/addons.yaml`: each entry has `name`, `summary`,
  `plugin`, `marketplace`, `repo` (owner/repo) and `design_tools`; `name`
  equals `plugin`; `source` goes. `taste-skill` reads `plugin: taste-skill`,
  `marketplace: taste-skill`, `repo: Leonxlnx/taste-skill`. The menu payload
  carries each addon's `plugin`, `marketplace` and `repo`.
- **D22:** each stackgen passage on addons says: vwf's setup declares a picked
  addon in the `claude` tool's `plugins.project` and runs `setup:ai`; no
  passage names `bootstrap add plugin` or `source`.

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside `plugins/stackgen/skills/` and
  `plugins/stackgen/assets/`.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.

## Commit

`feat: stackgen carries bundle tools and addon install fields for vwf`
