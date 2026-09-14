---
name: design-session
version: 0.1.0
category: design
description: Run an interactive design session in the terminal for one registry project — the design system first, through the taste-skill plugin's design skills, then the logo through its brand kit — writing the repo's committed design canvas under docs/design/<project>/. The authoring surface of the claude-code design tool; /vwf:design-system imports what it writes.
argument-hint: "<project>"
license: MIT
disable-model-invocation: true
---

# design-session — Claude Code

The authoring half of the `claude-code` design tool. The three
`design-import-*` skills beside it only **read** the canvas; this is the one
skill that **writes** it, and it is the user's to invoke — vwf never calls it.

**What this session produces**, under `docs/design/<project>/`:

```text
design-system.md      the design system, in the shape taste-skill authors
brand/logo.svg        the source mark
brand/<variant>.svg   the variants the session settles on
brand/README.md       clear space, minimum sizes, the rules
```

**What it does not produce.** Layouts, screen mockups, a review server and a
comment loop are **not part of this session yet** — they are a later release.
The session ends at the logo.

## 1. Resolve the project

Read `docs/blueprint/registry.yaml`. Halt if it does not exist: "No registry
found. Run `/vwf:architecture` first." Find the project named in the argument;
halt if it is not there, listing the projects that are. Halt if that project
declares **no screen platform** (`site`, `webapp`, `desktop`, `mobile`,
`tablet`, `auto`):

> `<project>` has no screen surface, so there is nothing to design. A
> text-only product elicits Terminal UX through `/vwf:design-system` directly.

Read `docs/blueprint/product.md` when it exists — the problem, the users, the
tone it states are the brief the design read starts from — and any
`docs/design/<project>/design-system.md` already there, because a second
session **revises** rather than restarts.

## 2. Check the plugin

Confirm the `taste-skill` plugin is installed — its skills appear as
`taste-skill:<name>` in the session's skill list. If none do, halt with
exactly:

> `taste-skill` is not installed. Add `taste-skill@taste-skill` to this
> product's required plugins and run `mise run setup:ai`.

## 3. The design system

Invoke **`taste-skill:taste-skill`** with the brief from §1. Its opening
move is the one this session wants: a one-line design read, the three dials
inferred from the brief, and one question where the brief is ambiguous —
asked of the user in the terminal, not guessed. Where the product's
direction calls for it, the plugin's narrower skills refine the read
(`taste-skill:soft-skill`, `taste-skill:minimalist-skill`,
`taste-skill:brutalist-skill`); pull one only when the read points at it.

Write **`docs/design/<project>/design-system.md`** in the seven-section
document shape the plugin authors — the `DESIGN.md` structure its
`taste-skill:stitch-skill` defines, titled for this project:

1. Visual Theme & Atmosphere
2. Color Palette & Roles — every value named with its **role** and a one-line
   use, one accent at most
3. Typography Rules — display, body, mono, and what is banned
4. Component Stylings — buttons, cards, inputs, loaders, empty states, with
   their interaction states
5. Layout Principles
6. Motion & Interaction
7. Anti-Patterns

That shape is what `design-import-design-system` reads, section by section,
into vwf's payload — so keep the headings, and keep every value beside a
role: a swatch with no role is a token the import must return as `null`.
State the accessibility standard the system commits to in the section it
bears on; the import returns `null` for one that is never stated.

**Review in the terminal.** Show the user the document section by section and
take their edits before moving on. This is the design tool's review surface,
and it is the whole of it in this release.

## 4. The logo

Invoke **`taste-skill:brandkit`** with the design system just written as its
brief — atmosphere, palette and typography are the constraints the mark must
sit inside. Its logo concepting (monogram, product action, metaphor, negative
space, construction geometry) is the exploration; settle one direction with
the user before drawing.

Author the mark as **SVG**, by hand, in the session:

- `brand/logo.svg` — the source every variant derives from. Vector paths,
  no raster, no embedded font — text outlined.
- `brand/<variant>.svg` — each variant the direction needs, named for what
  it is: `mark`, `wordmark`, `lockup`, `mono`, `dark`. Ship the ones the
  product will place, not a full set for its own sake.
- `brand/README.md` — the rules the mark lives by, which is exactly what the
  design-system import reads into the payload's `brand:` block:
  - each variant and **where it goes**;
  - **clear space** in the mark's own units (a fraction of its height,
    never pixels);
  - the **minimum size** per variant where they differ;
  - the **rules** — which variant stands in on a single-colour or dark
    surface, whether the mark may be recoloured, and what never happens to
    it.

Review the mark with the user the same way: show it, take the edits, settle.
Every path written into the README is **relative to the repo root**.

## 5. Close

The canvas is committed like any other doc; leave that to the user's normal
commit. Then tell the user, in one line, to run **`/vwf:design-system`** —
that is what imports the canvas into `docs/blueprint/design-system.md`, Brand
section included, and pins it. This session never writes that file.

## Rules

- Write only under `docs/design/<project>/`. Never `docs/blueprint/`.
- Never skip the design read to reach a default aesthetic; the plugin's
  first rule is the one this tool exists to honour.
- Never invent a brand rule the user did not settle; a README line the
  import copies into a contract is a decision, not filler.
