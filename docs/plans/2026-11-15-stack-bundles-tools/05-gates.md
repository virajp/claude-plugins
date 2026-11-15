# U5 — Versions and gates

- **Read first:** `index.json` of this folder, `gates` and `release_levels`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D14:** each knowledge pack whose files changed in this run bumps its
  `version` MAJOR in `pack.yaml`, skipping 13 and 17. Each bundle `packs:` ref
  follows its pack's new version. Tool entries and design tools stay at
  `1.0.0`. No plugin manifest version changes.

## Edits

1. The pack versions and the bundle refs (D14).
2. Run `mise x -- mise run p:plugins:inventory` to regenerate
   `stacks/inventory.md`.
3. Run `mise x -- mise run p:plugins:marketplace -- --check`. It must pass with
   no change.
4. Run the plan gate of `gates.plan`, and K1 and K2 of `gates.keeps`.

## Verification

- The commands above pass.

## Guardrails

- A failing gate is a question, never a fix outside the owned files.

## Commit

`ops: bump the changed stackgen packs and regenerate the inventory`
