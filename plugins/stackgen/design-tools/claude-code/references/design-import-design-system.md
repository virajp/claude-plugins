# design-import-design-system — Claude Code

## import-design-system — Claude Code

The project's design tool resolved to `claude-code`. The design system is a
**file the repo commits**, `docs/design/<project>/design-system.md`, authored
in session by `design-session`. This is a read of a stored source, never a
reconstruction, so `derived` is always `false`.

## Prerequisites

None. The canvas is a directory in the repo — no key, no server, no network.

## What to do

1. **Resolve the canvas.** The project vwf names gives
   `docs/design/<project>/`. If `design-system.md` is not there, **halt**
   with exactly:

   > No design system in `docs/design/<project>/`. Run
   > `/design-session <project>` to author one.

   Never return a payload built from nothing — an empty design system reads
   as one nobody made, which is the failure the adapter contract forbids.
2. **Read `design-system.md`.** It is in the shape `taste-skill` authors —
   atmosphere, colour palette and roles, typography, component stylings,
   layout, motion, anti-patterns.
3. **Normalize into the payload.** Map what you found onto the contract's
   fields:
   - Semantic color **roles**, never raw swatch lists — the palette section
     names each value's role in prose; carry the role, the value and the
     one-line usage.
   - Typography, spacing, radius and motion as scales with roles, from the
     typography, layout and motion sections.
   - Components with their variants, behaviors and anti-patterns, from the
     component stylings and anti-patterns sections.
   - The accessibility standard the doc declares; `null` when it declares
     none, never an assumed one.
4. **Read `brand/` when it exists.** When `brand/logo.svg` is present, add the
   optional `brand:` block: `logo` is `docs/design/<project>/brand/logo.svg`,
   `variants` is every other `brand/*.svg` with its path and the use
   `brand/README.md` gives it, and `clear_space`, `min_size` and `rules` come
   from that README. Every path is **relative to the repo root**. When
   `brand/` is absent, **omit the block entirely** — never a `brand:` full of
   nulls.
5. **Set the source.** `source.tool: claude-code`, `source.reference` the
   canvas path `docs/design/<project>/design-system.md` — which is also the
   `design_system_id` vwf pins — and `derived: false`.

## Rules

- Never edit the canvas. Import is a read.
- A token the doc does not define is `null` with a line in `notes`.
- Return only the payload — nothing before it, nothing after.
