DECISION 2026-09-01 ★4 | devtools plugin dissolved into stackgen | stackgen is a
vwf dependency and materializes the doctrine into the repo, so the plugin has no
job left | alt keep devtools (rejected: each of its four arguments failed,
below)

**Source plan** `2026-09-01-devtools-dissolution`,
`2026-08-31-stack-plugin-migration`.

This replaced the 2026-08-29 decision "devtools survives the waves". That
record keeps its body as the strongest case against the change. The plan
folder it links to is gone. The answers are here.

The four arguments for keeping devtools, and why each failed:

- "mise is a doctor mandate, and the doctrine for a halt belongs next to the
  halt." stackgen is now a declared vwf dependency, so it is always installed
  with vwf. The doctrine also lands in the repo's own `.claude/`, so it is
  present for every collaborator with no plugin installed.
- "scaffold is a live seam, a skill vwf cannot see fails silently." vwf already
  calls `stackgen-stack-menu` and `stackgen-stack-template` by fixed name. The
  seam was already accepted. The same mitigation applies: the skill stays
  model-invocable and the body says so.
- "28 task files fall outside stackgen's `.claude/`-only output." This was the
  real blocker. The fix was a charter change: a `config/` tier in packs. It is
  the same move that allowed `.mcp.json`.
- "scaffold and mise cannot be split." They are not split. Both land in
  `toolchain-manager/mise`, closer than before.

Facts a later reader needs:

- The north star closed at two plugins (`vwf`, `stackgen`).
- The migration minted the category `workspace` (the kind that the repo-axis
  bundles had no word for) and `access` (for Cloudflare Zero Trust, one
  component). The `access` category is accepted as a one-component value.
- A task file that lands at mode 644 does not appear in `mise tasks` at all.
  It is a missing task, not a permission error.
- Dissolution doctrine alone was not enough: `materializer.md` still stated
  the `.claude/`-only boundary in the negative. An unplanned unit taught the
  landing procedure the new tier.
- Not done, by design: making the task runner pickable (`mise run` stays
  hardcoded in vwf), and a python language bundle (see the gap record for
  `uv` and `ruff`).
