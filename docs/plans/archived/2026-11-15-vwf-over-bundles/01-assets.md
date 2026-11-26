# U1 — The adapter assets

- **Read first:** `plugins/vwf/assets/stack-adapter.md`,
  `design-adapter.md`, `stack-vocabulary.md` and `vwf-config.md` as R4b
  leaves them, and R5a's `01-tree.md` and `02-skills.md` (the stackgen side).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D5:** `stack-adapter.md`: the menu payload lists shipped bundles, repo
  bundles, design tools and addons, plus the open entry "compose a bundle";
  the `compose` verb (input `slug`, `axis`, `platforms`, `tools`, `packs`;
  output the slug); a bundle has `tools:` and `packs:`; the template payload
  carries no `language_facts`, `lsp_servers`, `package_manager`, `lockfile`
  or `harness`; `ux-gate` stays a stack adapter at its fixed name (D1).
- **D28, D23, D24, D27:** `stack-adapter.md`: each bundle entry of the menu
  payload and the materialized entry carry the bundle's `tools:`; each addon
  entry of the menu payload carries `plugin`, `marketplace` and `repo`; the
  section "The `addon` axis" describes setup declaring a picked addon in
  `tools.claude.plugins.project` and running `setup:ai` (D4, D17), with no
  stack-template pin and no `remove:` call for an addon.
- **D3:** `design-adapter.md`: the three roles live in the machine plugin
  `vwf-tools`, called as `vwf-tools:<role>` with the project name as the first
  argument; a tool's part is `skills/<role>/references/<tool>.md`; "Adding a
  tool" is a folder under stackgen's `design-tools/`, not a pack.
- **D2:** `vwf-config.md`: `stack.template` and `repo.stack.template` name a
  bundle, shipped or a repo bundle in `.claude/stackgen/bundles/`; `addons:`
  entries are names of `assets/addons.yaml`, declared in
  `tools.claude.plugins.project` by setup.
- `stack-vocabulary.md`: a bundle's tools are bootstrap tool names; tool
  knowledge follows the linked tools.
- A passage that names an earlier format as history stays (R4b D23).

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned files, except history.

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.

## Commit

`feat: the vwf adapter contracts follow bundles, tool knowledge and vwf-tools`
