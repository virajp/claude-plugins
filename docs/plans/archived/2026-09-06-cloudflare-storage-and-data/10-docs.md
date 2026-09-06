# U10 — Docs: the reconciler's findings applied, and two decisions docs

- **Wave:** 3
- **Depends on:** U1–U9 (every `DOCS FALSIFIED:` line they returned)
- **Owns:** `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`,
  `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-09-06-pages-and-stream-leave-the-reservation.md`
  (new),
  `docs/memory/decisions/2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md`
  (new). Touch nothing outside this list.
- **Model:** opus
- **Read first:** the `docs-reconciler` agent's findings for this run's diff
  (the orchestrator dispatches it first and passes them to you); every
  `DOCS FALSIFIED:` line from U1–U9; then each owned file top to bottom before
  editing. The survey's list from `index.md` §Facts, "Docs that describe today's
  behaviour".
- **Lazy-load:**
  `docs/memory/decisions/2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md`
  and `2026-09-06-workers-ssr-redeems-the-script-reservation.md` (the two docs
  the reversal narrows — match their form, and cite them); the new pack
  `conventions.md` files, read-only, for the one-line description each doc row
  needs.

## Ruling

D10: "Pages and Stream leave the reservation list permanently; a decisions doc
records it with Cloudflare's steer as the ground for Pages and the user's
decline for Stream." The user's exact choice: "Retire both".

D2 and D3 (the tokens and `stateful-compute`) are recorded as the second
decisions doc, since a closed vocabulary that grew by fifteen tokens in one edit
deserves the reasoning next to it — including the `object-storage` concern the
user accepted.

`.claude/skills/stackgen-plugin/SKILL.md:26-27`: "do not restate a count or a
rule an asset owns" — no pack count, bundle count or category list is typed into
any doc; the docs point at `plugins/stackgen/stacks/inventory.md` and
`assets/taxonomy.md`.

## Edits

1. **Apply the reconciler's findings and every `DOCS FALSIFIED:` line**, each as
   the minimal edit that makes the passage true again. Expected sites, to be
   confirmed against the findings rather than assumed:
   - `site/src/content/docs/how-to/operate/choosing-your-stack.md:72-78` — the
     Cloudflare rows: add the seven backing bundles in the existing row form
     (one line each, the bundle slug and what pinning it gives), and a sentence
     after `:85-86` that backing bundles pin side by side, one per capability.
     Do not list what plans B–D will ship.
   - `site/src/content/docs/plugins/stackgen.md` — check `:90`, `:196`, `:680`
     stay true (they should: "both Workers packs" is still two; "no reservations
     are outstanding" is about kinds). If the page has a passage describing what
     Cloudflare covers, update it to point at the provider pack's conventions
     for the scope rather than listing services. Do not rename any heading (the
     site link checker follows fragments).
   - `plugins/stackgen/stacks/readme.md:174-192` — append a **Wave F** paragraph
     in the existing wave register: the seven storage/data packs and their
     bundles, that the taxonomy grew for all twenty Cloudflare services at once
     (pointing at `assets/taxonomy.md`, not listing the tokens), that the
     provider's scope prose now states shipped / planned / declined, and that
     plans B–D follow. Keep it to the length of the Wave E paragraph.
   - `readme.md:227-265` — only if a sentence there is now false (the "newest
     kind" sentence at `:261-265` is not: no kind was added). Likely one clause
     noting Cloudflare's storage and data services now ship as packs, if the
     paragraph names Cloudflare at all; else nothing.
   - `CLAUDE.md:211` (the stackgen row) and `.claude/docs/plugins.md:13` — only
     if they enumerate Cloudflare services; the survey says they do not.
   - `.claude/skills/stackgen-plugin/SKILL.md` — `:87-115` names the Workers
     packs as the `(f)` precedent; still true. Add nothing that restates a
     count. If the skill's map table at `:29-40` should point at the new
     decisions doc, add the row.
2. **`docs/memory/decisions/2026-09-06-pages-and-stream-leave-the-reservation.md`**
   — in the form of the two docs it narrows (frontmatter as theirs, a Context, a
   Decision, a Rejected list, a Consequences section). Context: the reservation
   list's two prior narrowings; the user's request for all Cloudflare services
   and the brief. Decision: Pages and Stream are retired, not deferred; the
   reservation list itself is dissolved in favour of the provider pack's
   three-part scope prose (shipped / planned / declined). Ground for Pages:
   Cloudflare's best-practices statement that Workers Static Assets is
   recommended and Pages "remains supported" (cite the URL the U2 unit used);
   ground for Stream: declined by the user when briefed. Rejected: "Retire
   Pages, keep Stream reserved"; "Keep both reserved". Consequences: a future
   Stream pack needs a fresh decision; no doc anywhere lists reserved Cloudflare
   services any more — the provider conventions are the single place.
3. **`docs/memory/decisions/2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md`**
   — same form. Context: twenty services across four plans, the closed
   vocabulary rule. Decision: the fourteen `cloud-service` additions and
   `agent-sdk`, minted once in plan A; the service→category mapping as a table
   (all twenty, including B–D's); the capability mapping of D8 (seven packs
   carry a token, thirteen unset). Rejected: coarser groups; an `email` token;
   `object-storage` for Durable Objects (with the reason the user accepted);
   `actor`. Consequences: B–D add no token; a category-validation checker rule
   is parked (name the Parked entry).

## Verification

- `mise run site:check` exits 0 (astro check, build, link checker over the
  edited pages).
- `pnpm exec dprint check readme.md CLAUDE.md` exits 0 (they **are**
  dprint-formatted; a widened table cell re-pads every row — accept the re-pad).
- `grep -n 'Pages' site/src/content/docs/how-to/operate/choosing-your-stack.md site/src/content/docs/plugins/stackgen.md readme.md`
  returns no line saying Pages is planned or reserved.
- `grep -rn '[0-9]\+ packs' readme.md CLAUDE.md .claude/skills/stackgen-plugin/SKILL.md site/src/content/docs/plugins/stackgen.md`
  returns nothing new (no count typed by hand).
- Both decisions docs exist and their frontmatter parses (match the two
  neighbours' field set exactly).
- Every `DOCS FALSIFIED:` line from U1–U9 is either applied or listed in your
  return block as `DECIDED: not applied — <why>`.

## Guardrails

- Do not touch `plugins/stackgen/stacks/cloud-*/**`,
  `plugins/stackgen/stacks/bundles/**`, `plugins/stackgen/assets/**`,
  `inventory.md`, `plugin.json` — not yours.
- Do not rename a heading in any site page; do not add a new site page (the nav
  would need an entry and the build fails without it).
- `readme.md`, `CLAUDE.md` are dprint-formatted — run `dprint fmt` on exactly
  those two if you widen a table; `plugins/**/*.md` and `docs/memory/**/*.md`
  are not — hand-fold.
- `cat` is aliased to `bat`: Write/Edit, never heredocs.
- Cite the two earlier decisions docs by path; do not edit them.

## Commit

`docs: Cloudflare storage and data — the scope, the categories, and the reservation's end`
— written by the orchestrator after the wave gate, not by the unit.
