# U4 — Wire the three references into the skill

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `plugins/stackgen/stacks/framework/astro/skills/astro/SKILL.md`, and
  under `plugins/stackgen/stacks/framework/astro/skills/astro/references/`:
  `ssg.md`, `ssr.md`, `hybrid.md`, `csr.md`, `content-and-routing.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing — all six.
  Then read the three files wave 1 created, so your routing lines name headings
  that actually exist: `references/mdx.md`, `references/images.md`,
  `references/layouts.md`.
- **Lazy-load:** `plugins/stackgen/stacks/framework/astro/conventions.md` — to
  check consistency only. Do **not** edit it.

## Ruling

Quoted from index.md.

D1: "Three new shared references — `mdx.md`, `images.md`, `layouts.md` — written
once at pack level, each stating the genuine mode deltas inline. **The four mode
references gain a routing line only.** All four bundles get it."

D3: "`mdx.md` owns MDX-the-format. `content-and-routing.md` keeps its
`## Markdown transforms` section and gains one cross-link; the `src/` table's
`src/layouts/` row gains a cross-link to `layouts.md`."

D5: "U4 owns `SKILL.md` wholly, including bumping its frontmatter `version:`
from `0.1.0` to `0.2.0`. The gates-and-bump rule governs *released project*
versions; a skill's own frontmatter version is content U4 is already rewriting,
and splitting it would put two units in one file against the shared-file rule."

D2: "'Four config facts, and the reasons for them' is a counted heading over the
proven-static set." — so `conventions.md` stays closed to you too.

## Edits

1. **`skills/astro/SKILL.md`** — three changes, and nothing else:
   - Add three rows to the routing table, in the shape the existing nine rows
     use (a *Doing* cell and a *Read* cell holding a markdown link). Place them
     where they read naturally — MDX and layouts belong near the existing
     "Routes, content collections, markdown, `src/` layout" row; images belong
     near the Head row. Suggested *Doing* cells, which you may reword to match
     the table's voice: authoring content that embeds a component; images from
     `src/`, the pipeline and layout shift; page shells, slots and what a layout
     owns.
   - Widen the frontmatter `description:` so it names MDX, images and layouts
     alongside what it already lists. It is strict YAML — a folded scalar that
     breaks parsing drops the whole skill silently, so keep the existing
     continuation-indent style exactly.
   - Bump the frontmatter `version:` from `0.1.0` to `0.2.0` (D5). This is the
     skill's own version, not the pack's — `pack.yaml` is U6's and you must not
     touch it.

2. **`references/ssg.md`, `ssr.md`, `hybrid.md`, `csr.md`** — **one routing line
   each, and nothing more.** D1 is explicit: these four gain a routing line
   only. Do not add a `## MDX`, `## Images` or `## Layouts` section to any of
   them — that was the option the interview rejected. Each line points at
   whichever of the three new references carries that mode's delta. For images
   specifically, `ssr.md` and `hybrid.md` should point at `images.md`'s per-mode
   section, since that is where their runtime-image-service constraint is
   stated.

3. **`references/content-and-routing.md`** — exactly two cross-links (D3):
   - In the `## src/ layout` table (around lines 6-21), the `src/layouts/` row
     gains a link to `layouts.md`.
   - The `## Markdown transforms` section (around lines 76-91) gains one
     cross-link to `mdx.md`. **Keep the section itself** — do not move its
     content into `mdx.md`, and do not delete it. The two files divide as D3
     says: transforms stay here, MDX-the-format is `mdx.md`'s.

   Change nothing else in this file. Its `## Content collections` section (lines
   42-75) is already correct and is explicitly not a gap.

## Verification

- `mise run p:plugins:check` exits 0 — in particular its frontmatter rule, which
  is what catches a `SKILL.md` whose strict YAML you broke.
- `mise run code:lint` exits 0 over all six owned files.
- `SKILL.md` frontmatter parses as YAML and reads `version: 0.2.0`.
- Every markdown link you added resolves to a file that exists — grep each
  target path.
- A grep of the four mode references shows each gained routing lines and **no**
  new `##` heading.
- `grep -ri mdx` across `plugins/stackgen/stacks/framework/astro/` returns hits
  in `SKILL.md` as well as in `mdx.md`.
- `git diff --name-only` for your unit lists exactly the six owned files and
  nothing else — in particular not `conventions.md`, not `pack.yaml`.

## Guardrails

- Do not touch `mdx.md`, `images.md` or `layouts.md` — wave 1 owns their
  content. You link to them; you do not edit them.
- **Do not open `conventions.md` for editing.** D2 rules it closed; the
  orchestrator checks it is absent from the branch diff.
- Do not touch `pack.yaml`, any bundle file, `inventory.md` or any `plugin.json`
  — all U6's.
- Do not add a per-mode section to the four mode references. A routing line is
  the whole of the change there (D1).
- Delete with `rm`, never `git rm`. Stage nothing; commit nothing.
- **`plugins/**/*.md` is excluded from dprint but is linted.** Nothing
  auto-formats these files: match the surrounding fold width by hand, and note
  that widening a table cell means re-padding that table's rows yourself.
- Keep every code span on one line. Never end a table cell in a bare asterisk —
  the formatter and the linter disagree about it and never converge.
- `SKILL.md`'s frontmatter is strict YAML. A parse failure drops the skill with
  no error.

## Commit

`feat: astro pack — route MDX, images and layouts from the skill` — written by
the orchestrator after the wave gate, not by the unit.
