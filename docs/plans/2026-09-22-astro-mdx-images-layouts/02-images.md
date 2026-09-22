# U2 — Image pipeline reference

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/images.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file does not exist yet — you are creating it. Read,
  top to bottom, before writing:
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/head.md` (it
  already owns the icons and social-preview story — you must not duplicate it),
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/build-output.md`
  (the `dist/` contract your build-time output lands in), and
  `plugins/stackgen/stacks/framework/astro/skills/astro/references/ssr.md` (for
  the mode delta and the house voice).
- **Lazy-load:** `plugins/stackgen/stacks/framework/astro/conventions.md` — read
  it only to check you are not contradicting it, in particular its `## Head`
  section's `public/` rules. Do **not** edit it.

## Ruling

Quoted from index.md.

D1: "Three new shared references — `mdx.md`, `images.md`, `layouts.md` — written
once at pack level, each stating the genuine mode deltas inline. The four mode
references gain a routing line only. All four bundles get it."

D2: "'Four config facts, and the reasons for them' is a counted heading over the
proven-static set. The MDX integration entry and any image-service config live
in the new references instead, so the heading is never renumbered."

D6: "U1, U2 and U3 each resolve Astro's docs through Context7
(`resolve-library-id` then `get-library-docs`) before writing, and confirm from
the pack which Astro major it targets rather than assuming one. This is a
CLAUDE.md hard rule."

D7: "The only concrete third-party names the new prose emits are `@astrojs/mdx`
and `sharp`, both first-party Astro and both inside the `astro` / `@astrojs/*`
scope the pack already emits. A unit that finds it needs a name outside that
scope stops and returns `UNRESOLVED:` rather than inventing one."

From the plan's Facts: "`astro:assets`, `<Image>` and `getImage` return zero
hits across the entire pack." This file is what closes that.

From the plan's Goal: images are "the one genuine delta" across the four modes —
build-time optimization in SSG versus a runtime image service in SSR and hybrid.

## Edits

1. **Create `…/skills/astro/references/images.md`.** One `#` heading only — the
   linter enforces `markdown/no-multiple-h1` on this tree. Same opinionated
   register as the pack's other references. Cover, at minimum:

   - **The line between `src/` and `public/`.** An image imported from `src/`
     goes through the pipeline and is optimized, hashed and emitted; a file in
     `public/` is copied byte-for-byte and is never processed. State which
     belongs where and why. `conventions.md`'s `## Head` section already rules
     that the brand mark, the rasterized icon set and the social-preview image
     live under `public/` — **agree with it, cite it, do not restate it and do
     not contradict it.**
   - **`astro:assets` and `<Image>`.** The component, what it requires, and what
     it emits. Why the pack prefers it over a hand-written `<img>` for anything
     served from `src/`.
   - **`getImage`** for the cases a component cannot cover — an image needed in
     a meta tag, a CSS value, or a non-HTML context.
   - **Layout shift.** Why intrinsic dimensions matter and what the pipeline
     does and does not do for you here.
   - **The mode delta — this is the section that earns its place.** A short,
     clearly marked `## Per mode` section: in SSG every image is processed at
     build and lands in `dist/`; in SSR and hybrid, images on request-time
     routes need a runtime image service, and the deploy target constrains which
     one is available; in CSR the prerendered shell mostly sidesteps the
     question. Be concrete about the consequence — a project that picks SSR and
     assumes build-time behaviour gets a surprise.
   - **`sharp`** as Astro's default image service, and what changes when a
     deploy target cannot run it.
   - **What this does not decide** — a closing section in the pack's usual
     shape. The deploy target is the deploy axis's, not this pack's; say so.

2. **Do not duplicate the icons task.** `conventions.md` and `head.md` already
   own the favicon rasterizer that lands at
   `.config/mise/tasks/p/_project/icons`. Cross-reference it by name at most; it
   is not part of the `astro:assets` pipeline and conflating the two would be a
   real error.

3. **Do not create any other file.** `mdx.md` is U1's and `layouts.md` is U3's,
   both being written concurrently with yours.

## Verification

- `mise run p:plugins:check` exits 0.
- `mise run code:lint` exits 0 over the new file — in particular exactly one `#`
  heading.
- A grep of the new file for `astro:assets`, for `<Image` and for `getImage`
  each returns at least one hit (the plan's zero-hit claim must close for all
  three terms).
- The new file contains a `## Per mode` section, or a heading that plainly
  serves that role, naming all four modes.
- A grep for any npm package name outside the `astro` / `@astrojs/` scope
  returns nothing except `sharp`, which D7 allows by name.

## Guardrails

- Do not touch `mdx.md` (U1's), `layouts.md` (U3's), `SKILL.md` or any of the
  four mode references or `content-and-routing.md` (all U4's).
- **Do not open `conventions.md` for editing.** D2 rules it closed; the
  orchestrator checks it is absent from the branch diff. Its `## Head` section's
  `public/` rules are binding on you — agree with them.
- Do not restate `head.md`'s icons, manifest or social-preview contract.
- Do not bump any version.
- Delete with `rm`, never `git rm`. Stage nothing; commit nothing.
- **`plugins/**/*.md` is excluded from dprint but is linted.** Nothing
  auto-formats this file: match the surrounding fold width by hand.
- Keep every code span on one line.
- Use Context7 before writing any Astro API detail (D6). Confirm the Astro major
  the pack targets from the pack itself; do not assume a version.
- If you need a package name outside `astro` / `@astrojs/*` / `sharp`, stop and
  return `UNRESOLVED:` (D7).

## Commit

`feat: astro pack — image pipeline reference` — written by the orchestrator
after the wave gate, not by the unit.
