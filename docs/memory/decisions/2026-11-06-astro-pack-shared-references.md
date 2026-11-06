DECISION 2026-09-22 ★3 | astro pack MDX, images, layouts | three shared
pack-level references, mode deltas stated inline — one pack serves all four
bundles, so a per-mode copy would repeat itself | alt per-mode sections rejected
(duplicated four times); alt widening `conventions.md` rejected (renumbers a
counted heading)

**Source plan** `2026-09-22-astro-mdx-images-layouts`

The backlog item B47 said "astro-ssg defined in detail, MDX for static
content". The survey found its premise partly false.

- There is no "astro-ssg pack". There is one pack, `framework/astro`, and all
  four bundles pin the same version of it.
- Content collections were already covered in depth. MDX and the image
  pipeline had zero mentions in the whole pack. Layouts were one table row.
- `mdx.md`, `images.md` and `layouts.md` hold the new material. Each of the
  four mode references gets one routing line only.
- `conventions.md` stays closed. "Four config facts, and the reasons for them"
  is a counted heading over the proven-static set. The MDX integration and any
  image-service config live in the new references, so the heading is never
  renumbered.
- `mdx.md` owns MDX the format. `content-and-routing.md` keeps its markdown
  transforms section and gains one cross-link. The content collection glob
  stays `**/[^_]*.md`; `mdx.md` alone says to widen it to `{md,mdx}`.
- No reputation unit ran: the only new third-party names are `@astrojs/mdx`
  and `sharp`, inside the scope the pack already emits.

## Parked

- Reference breadth: astro has 8 references where flutter has 30, with no
  deep-dives for state, data, performance or i18n. The user chose MDX, images
  and layouts (option A) over Flutter-style breadth (option B). Several of those
  topics belong to the react or deploy-axis pack. It needs its own backlog item.
- This repo's own `site/` is hand-built Astro and is not materialized from the
  pack. Adding MDX to the pack does not add MDX to `site/`.
- `build_output:` as a template-payload field stays parked from
  `2026-09-05-astro-static`.
