# U1 — MDX reference

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/mdx.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file does not exist yet — you are creating it. Read,
  top to bottom, before writing:
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/content-and-routing.md`
  (so you do not restate its `## Content collections` or
  `## Markdown transforms` sections) and
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/ssg.md` (for
  the house voice and fold width).
- **Lazy-load:** `plugins/stackgen/stacks/framework/astro/conventions.md` — read
  it only to check you are not contradicting it. Do **not** edit it.
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/head.md` if
  MDX frontmatter turns out to touch the head contract.

## Ruling

Quoted from index.md.

D1: "Three new shared references — `mdx.md`, `images.md`, `layouts.md` — written
once at pack level, each stating the genuine mode deltas inline. The four mode
references gain a routing line only. All four bundles get it."

D2: "'Four config facts, and the reasons for them' is a counted heading over the
proven-static set. The MDX integration entry and any image-service config live
in the new references instead, so the heading is never renumbered."

D3: "`mdx.md` owns MDX-the-format. `content-and-routing.md` keeps its
`## Markdown transforms` section and gains one cross-link; the `src/` table's
`src/layouts/` row gains a cross-link to `layouts.md`." — U4 writes that
cross-link, not you. You must not open `content-and-routing.md` for editing.

D6: "U1, U2 and U3 each resolve Astro's docs through Context7
(`resolve-library-id` then `get-library-docs`) before writing, and confirm from
the pack which Astro major it targets rather than assuming one. This is a
CLAUDE.md hard rule."

D7: "The only concrete third-party names the new prose emits are `@astrojs/mdx`
and `sharp`, both first-party Astro and both inside the `astro` / `@astrojs/*`
scope the pack already emits. A unit that finds it needs a name outside that
scope stops and returns `UNRESOLVED:` rather than inventing one."

Also from the plan's Goal: "MDX returns zero hits across the entire pack" — this
file is what closes that.

## Edits

1. **Create `…/skills/astro/references/mdx.md`.** One `#` heading only — the
   linter enforces `markdown/no-multiple-h1` on this tree. Write it as the
   pack's opinionated doctrine on MDX, in the same register as `ssg.md` and
   `content-and-routing.md`: state what the project should do and why, not a
   tutorial. Cover, at minimum:

   - **When MDX earns its place, and when it does not.** Plain markdown is the
     default; MDX is for content that must embed a component. Say plainly that
     reaching for MDX everywhere forfeits the zero-JS default the pack argues
     for in `conventions.md`'s `## Islands`.
   - **The integration.** `@astrojs/mdx`, registered in `astro.config`'s
     `integrations` array. This is where the MDX config lives — per D2 you do
     **not** add a fifth bullet to `conventions.md`'s "Four config facts".
   - **MDX inside content collections.** How an `.mdx` entry differs from an
     `.md` one when queried through `getCollection`, and what rendering it
     returns. Cross-reference `content-and-routing.md:42-75` by name rather than
     restating the `defineCollection` example.
   - **Components in MDX** — importing them, and the difference between a
     component rendered at build time and one that carries a `client:*`
     directive. This is the point where MDX meets the islands cost the pack
     already argues about.
   - **The mode delta, stated inline.** MDX authoring is identical in all four
     modes; what differs is *when* the collection is queried — at build in SSG,
     at request time in SSR and on hybrid's server routes. Say so explicitly and
     keep it to a short `## Per mode` section or a clearly marked paragraph. Do
     not write four near-identical sections.
   - **What this does not decide** — a closing section in the shape the pack's
     other references use.

2. **Do not create any other file.** `images.md` is U2's and `layouts.md` is
   U3's, and both are being written concurrently with yours.

## Verification

- `mise run p:plugins:check` exits 0.
- `mise run code:lint` exits 0 over the new file — in particular exactly one `#`
  heading.
- `grep -ri mdx plugins/stackgen/stacks/framework/astro/skills/astro/references/mdx.md`
  returns hits (the plan's zero-hit claim must close).
- The new file is not referenced from any file you do not own — U4 wires it in.
- `grep -c '@astrojs/mdx'` on the new file returns at least 1, and a grep for
  any npm package name outside the `astro` / `@astrojs/` scope returns nothing.

## Guardrails

- Do not touch `images.md` (U2's), `layouts.md` (U3's), `SKILL.md` or any of the
  four mode references or `content-and-routing.md` (all U4's).
- **Do not open `conventions.md` for editing.** D2 rules it closed; the
  orchestrator checks it is absent from the branch diff.
- Do not bump any version — not `pack.yaml`, not `SKILL.md`'s frontmatter.
- Delete with `rm`, never `git rm`. Stage nothing; commit nothing.
- **`plugins/**/*.md` is excluded from dprint but is linted.** Nothing
  auto-formats this file: match the surrounding fold width by hand, the way
  `ssg.md` and `content-and-routing.md` are folded.
- Keep every code span on one line. A span that wraps a line gets split into
  unreadable fragments and passes every gate anyway.
- Use Context7 before writing any Astro API detail (D6). Confirm the Astro major
  the pack targets from the pack itself; do not assume a version.
- If you need a package name outside `astro` / `@astrojs/*`, stop and return
  `UNRESOLVED:` (D7).

## Commit

`feat: astro pack — MDX reference` — written by the orchestrator after the wave
gate, not by the unit. `feat` is one of the six types
`.config/git-conventional-commits.yaml` allows; scopes are unrestricted there.
