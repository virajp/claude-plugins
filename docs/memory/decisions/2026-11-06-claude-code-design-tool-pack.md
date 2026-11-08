DECISION 2026-09-14 ★3 | claude-code design tool | The terminal is a design tool
whose canvas is a committed directory; the logo joins the design-system contract
as an optional block — a file canvas needs no new kind and an optional block
needs no format bump | alt hosted canvas, new kind, separate brand doc rejected

**Source plan** `2026-09-14-terminal-design-tool` (backlog B11, part 1 of 2).

- Slug `claude-code`. Rejected: `terminal`.
- The canvas is `docs/design/<project>/`, committed.
  `docs/blueprint/design-system.md`
  stays vwf's import and only `/vwf:design-system` writes it. Rejected: a
  gitignored scratchpad; writing the blueprint doc directly. The
  tool-owns-authoring
  line holds: vwf imports and never authors.
- `taste-skill@taste-skill` is a declared requirement, named in the pack's
  `conventions.md` and bundle. Init's question 5 adds it, so `setup:ai`
  installs it. Every pack skill that needs it halts with one plain sentence
  when it is absent. Rejected: a `plugins:` key in `pack.yaml` (needs a new
  consent tier); vendoring the doctrine.
- The design-system payload gains an optional `brand:` block (logo source,
  variants, clear space, minimum size, mono and dark rules). Optional means no
  `blueprint_format` bump. Other tools return no block. Rejected: a separate
  `brand.md` doc with a fourth adapter (it widens checker rule 8).
- A design-tool pack ships a fourth, user-invocable skill, `design-session`,
  beside the three fixed adapters. All three adapters stay model-invocable so
  rule 8 passes. Rejected: omit two adapters (fails rule 8); stub them to halt;
  author inside the import adapter.
- Kind spec: `kinds.md` admits a file canvas beside hosted canvases. Rejected:
  a new kind `design-tool-local`.
- `design_system_id` for a file canvas is the canvas path. A content hash
  drifts on every edit.
- B11 stays `open` until part 2 (mockups, local server, browser comments) is
  planned. The user ruled this at the gate. Rejected: mark it planned under
  part 1 alone.
- The default flag rule this plan added is superseded by the per-platform rule
  in `2026-09-15-default-per-platform`.
