# Brand

The design system's contract for the **logo** — required when the imported
design-system payload carries a `brand:` block, and deleted otherwise. Unlike
every other section it is **never elicited in text**: a logo is a file the
design tool holds, so the section is written from the payload or not at all.
Brand & Mood states what the product should feel like; this section states what
the mark *is* and what may never be done to it.

A complete Brand section states:

- **Source** — one repo-relative path to the file every variant derives from
  (a vector source). `null` only when the tool holds variants and no single
  source, with a rule line saying so.
- **At least one variant** — name, repo-relative path, and where it is used
  (mark, wordmark, lockup, mono, dark, …). A variant with no stated use is a
  file nobody can place.
- **Clear space** — the exclusion zone, in the logo's own units (a fraction of
  the mark's height, never a pixel count that changes with scale).
- **A minimum size** — the smallest legible rendering, per variant where they
  differ.
- **A mono or dark rule** — which variant stands in on a single-colour or dark
  surface, and whether the mark may be recoloured with a Color Token role.

Out (realization): the file formats per platform, the favicon set, the app
icons, the social preview — each **derives** from the source in `plan` and
`execute`, and the Brand assets section above names those surfaces by role. A
Brand section that lists rasterised sizes has leaked the build into the
contract; the source and the rules are what survive a rebuild.

Every path is **relative to the repo root**, never absolute and never a URL —
the doc is an offline contract, and it must resolve from a fresh clone.
