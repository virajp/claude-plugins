GAP 2026-09-14 ★3 | design-review-loop parked items | open: a comment on a token
has no route to the design system, no gate checks pack-shipped scripts, favicon
and required-plugin checks are missing

**Source plan** `2026-09-14-design-review-loop`.

All four items were parked by the plan and are still open in the tree.

- A comment on a token or on the design system ("this blue is too loud") is
  applied to the screen today. The skill reports it as a design-system change.
  The route back to `design-system.md` through `design-session` does not exist.
- No gate runs `node --check` over `skills/**/scripts/*.mjs` that a pack ships.
  A syntax error in `serve.mjs` can land. Put the gate next to checker rule 11.
- No step derives a favicon from `brand:` (carried from the earlier
  `2026-09-14-terminal-design-tool` plan).
- `/vwf:doctor` has no row for required plugins (same origin).

Out of scope on purpose: hot reload, multi-user review and comment threading.
A review round is one person and one pass.
