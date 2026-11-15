# U4 — Docs

- **Read first:** the DOCS FALSIFIED lines of U1 and U2, and the run of
  `vwf:docs-sync` over the delta of waves 1 and 2.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- Every owned passage that names a removed kind, a tool pack, a design-tool
  pack, the addon pack, a bundle's `components:`, pack `lsp_servers` or a
  pack test task describes the new tree: bundles with `tools` and `packs`,
  tool knowledge, design tools, `addons.yaml`, LSP from bootstrap (D3-D13).
- `CLAUDE.md`: the `p:plugins:check` and `p:plugins:inventory` lines and the
  stackgen row; the snapshot generator with its hand-added task (D13).
- `.claude/skills/plugin-authoring/references/checks.md`: the text of rules 4,
  8, 11, 13 and 14 (D12).
- `.claude/skills/stackgen-plugin/`: the pack and bundle model.
- The site manual: `plugins/stackgen.md`, `how-to/operate/choosing-your-stack.md`
  and each other page the sync names.
- vwf passages are R5b's: report them, do not edit them.

## Edits

1. Each owned passage above.

## Verification

- `mise x -- mise run code:format` passes.
- `mise x -- mise run p:site:check` passes.

## Guardrails

- Touch nothing outside the owned paths.
- `CLAUDE.md`, `readme.md` and the site pages are dprint-formatted; run
  `code:format` after each edit.

## Commit

`docs: stackgen bundles over bootstrap tools, tool knowledge and design tools`
