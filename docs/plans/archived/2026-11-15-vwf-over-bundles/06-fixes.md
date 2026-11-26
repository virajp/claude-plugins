# U6 — The typescript wording and the split record

- **Read first:** `plugins/stackgen/tools/typescript/conventions.md` and
  `plugins/stackgen/tools/typescript/skills/typescript/references/config-and-env.md`
  as R5a leaves them, and
  `docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`, section
  "Amendment 2026-11-15 (R5 brainstorm)".

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D1, D20:** in the two typescript files, each mention of
  `docs/blueprint/environment.md` or a bare `environment.md` becomes "the
  repo's environment catalog"; no other line changes.
- **D19, D21:** `tools/typescript/tool.yaml` bumps `version` to `1.0.1`. As
  the last step, run `mise x -- mise run p:plugins:inventory` to regenerate
  `plugins/stackgen/stacks/inventory.md` (the one generator a unit runs), then
  `mise x -- mise run p:plugins:inventory -- --check`.
- **D9:** in the split record's amendment:
  - the background path reads
    `docs/memory/gaps/2026-11-15-r5-stack-without-packs-resolved.md`;
  - B3 ends: "`ux-gate` stays in stackgen as the web stack's UX adapter (R5b
    D1)";
  - B8 ends: "bootstrap has no `add plugin` verb: setup declares an addon in
    `tools.claude.plugins.project` and runs `setup:ai` (R5b D4)".

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside the owned files.

## Commit

`docs: the split record follows R5b, and typescript names no vwf path`
