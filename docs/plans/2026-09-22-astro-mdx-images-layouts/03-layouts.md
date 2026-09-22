# U3 — Layouts and slots reference

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/layouts.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file does not exist yet — you are creating it. Read,
  top to bottom, before writing:
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/content-and-routing.md`
  (its `## src/ layout` table at lines 6-21 is the one-line treatment you are
  replacing with a real one — but you do **not** edit that file), and
  `plugins/stackgen/stacks/framework/astro/conventions.md` lines 93-101 (the
  head-props contract, which is today the only substantive thing the pack says
  about layouts — you must agree with it exactly).
- **Lazy-load:**
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/head.md` if
  the layout-owns-the-head rule needs more than the conventions summary.

## Ruling

Quoted from index.md.

D1: "Three new shared references — `mdx.md`, `images.md`, `layouts.md` — written
once at pack level, each stating the genuine mode deltas inline. The four mode
references gain a routing line only. All four bundles get it."

D3: "`mdx.md` owns MDX-the-format. `content-and-routing.md` keeps its
`## Markdown transforms` section and gains one cross-link; the `src/` table's
`src/layouts/` row gains a cross-link to `layouts.md`." — U4 writes that
cross-link, not you.

D6: "U1, U2 and U3 each resolve Astro's docs through Context7
(`resolve-library-id` then `get-library-docs`) before writing, and confirm from
the pack which Astro major it targets rather than assuming one. This is a
CLAUDE.md hard rule."

From the plan's Facts: "The page/layout split exists only as two one-line rows
in the `src/` table at `content-and-routing.md:6-21` plus the head-props
contract at `conventions.md:93-101`." This file is what gives it depth.

From the plan's Goal: layouts are the topic with **no mode delta at all** — they
behave identically in SSG, SSR, hybrid and CSR. Do not invent one.

## Edits

1. **Create `…/skills/astro/references/layouts.md`.** One `#` heading only — the
   linter enforces `markdown/no-multiple-h1` on this tree. Same opinionated
   register as the pack's other references. Cover, at minimum:

   - **What belongs in a layout and what belongs in a page.** The split the
     `src/` table gestures at, argued properly: a layout is the page shell, a
     page is the route and its content. State the failure each side of the line
     prevents.
   - **Slots.** The default slot, named slots, and fallback content. This is the
     composition mechanism the pack currently never explains.
   - **Props, and the head contract.** `conventions.md:93-101` already rules
     that one layout owns the head and every page passes it the title, the
     description, whether the page is offered to search, and the shared-link
     image — and that a second layout emitting its own head tags is the failure
     that rule exists for. **Agree with it and cite it; do not restate it in
     full and do not contradict it.** Your job is the general props-and-slots
     shape it is one instance of.
   - **Nesting layouts** — when a layout wrapping another earns its place, and
     the head rule's constraint on doing so.
   - **Layouts in markdown and content collections** — the frontmatter `layout`
     key versus rendering a collection entry inside a layout from a page, and
     which the pack prefers.
   - **No mode delta.** State explicitly, in one line, that layouts and slots
     behave identically across all four rendering modes. Do **not** write a
     `## Per mode` section for this file — there is nothing to put in it, and
     inventing a distinction would be worse than silence.
   - **What this does not decide** — a closing section in the pack's usual
     shape. The UI kit and how styles are authored are explicitly not this
     pack's, per `conventions.md`'s closing section.

2. **Do not create any other file.** `mdx.md` is U1's and `images.md` is U2's,
   both being written concurrently with yours.

## Verification

- `mise run p:plugins:check` exits 0.
- `mise run code:lint` exits 0 over the new file — in particular exactly one `#`
  heading.
- The new file names slots (default, named, fallback) and carries the one-line
  statement that no mode delta exists.
- The new file does **not** contain a `## Per mode` section.
- Nothing in the new file contradicts `conventions.md:93-101` on which layout
  owns the head.

## Guardrails

- Do not touch `mdx.md` (U1's), `images.md` (U2's), `SKILL.md` or any of the
  four mode references or `content-and-routing.md` (all U4's).
- **Do not open `conventions.md` for editing.** D2 rules it closed; the
  orchestrator checks it is absent from the branch diff. You read lines 93-101
  to agree with them, nothing more.
- Do not bump any version.
- Delete with `rm`, never `git rm`. Stage nothing; commit nothing.
- **`plugins/**/*.md` is excluded from dprint but is linted.** Nothing
  auto-formats this file: match the surrounding fold width by hand.
- Keep every code span on one line.
- Use Context7 before writing any Astro API detail (D6), in particular the slot
  and layout API surface. Confirm the Astro major the pack targets from the pack
  itself; do not assume a version.

## Commit

`feat: astro pack — layouts and slots reference` — written by the orchestrator
after the wave gate, not by the unit.
