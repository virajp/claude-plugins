# U6 — Docs: the reconciler's findings applied, and the instead-of decisions doc

- **Wave:** 3
- **Depends on:** U1–U5 (every `DOCS FALSIFIED:` line they returned)
- **Owns:** `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`,
  `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-09-06-containers-pin-instead-of-workers-ssr.md`
  (new). Touch nothing outside this list.
- **Model:** opus
- **Read first:** the `docs-reconciler` agent's findings for this run's diff
  (the orchestrator dispatches it first and passes them to you); every
  `DOCS FALSIFIED:` line from U1–U5; then each owned file top to bottom before
  editing. The survey's list from `index.md` §Facts, "Docs that describe today's
  behaviour".
- **Lazy-load:**
  `docs/memory/decisions/2026-09-06-pages-and-stream-leave-the-reservation.md`
  and `2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md`
  (plan A's docs — match their form);
  `docs/memory/decisions/2026-09-06-workers-ssr-redeems-the-script-reservation.md`
  (the doc that established the Workers SSR pack the new ruling relates to; cite
  it); the new pack `conventions.md` files, read-only, for the one-line
  description each doc row needs.

## Ruling

B4: "A Containers project **is** a Workers project, so `cloudflare-containers`
is pinned **instead of** `cloudflare-workers-ssr`, never beside it — both ship a
`wrangler.jsonc` and would collide; the bundle prose says so. The Containers
`wrangler.jsonc` is a **complete** Worker config (`main`, the container block,
the DO binding and migration)." Recorded as a decisions doc because it is the
first rule about two deploy bundles from one provider being mutually exclusive,
and the next provider pack with two Worker-shaped targets will need it.

`.claude/skills/stackgen-plugin/SKILL.md:26-27`: "do not restate a count or a
rule an asset owns" — no pack count, bundle count or category list is typed into
any doc; the docs point at `plugins/stackgen/stacks/inventory.md` and
`assets/taxonomy.md`.

Known falsified passages (confirm against the findings rather than assume):
`site/src/content/docs/plugins/stackgen.md:90` ("Both Cloudflare Workers deploy
packs' `assets.directory` cite that heading") and `:680` ("which is how both
Workers packs land `p:<id>:deploy`") — Containers is a third pack shipping
`wrangler.jsonc` and the deploy overlay, though it has no `assets.directory`.

## Edits

1. **Apply the reconciler's findings and every `DOCS FALSIFIED:` line**, each as
   the minimal edit that makes the passage true again. Expected sites:
   - `site/src/content/docs/plugins/stackgen.md:90` — "both … deploy packs"
     becomes a sentence that is true of three: the two Workers packs cite the
     Astro build-output heading for `assets.directory`; Containers ships no
     assets block. Rewrite minimally; do not rename the heading it cites. `:680`
     — "both Workers packs land `p:<id>:deploy`" becomes "the three Cloudflare
     deploy packs" or equivalent, naming Containers. Check `:196` and `:155`
     stay true (they should — kinds and framework packs are unchanged here).
   - `site/src/content/docs/how-to/operate/choosing-your-stack.md:72-78` — the
     Cloudflare rows: add the three backing bundles in the existing row form and
     a `cloudflare-containers` row under the deploy targets, with the instead-of
     clause in one sentence. Do not list what plans C–D will ship.
   - `plugins/stackgen/stacks/readme.md` — append a **Wave G** paragraph after
     plan A's Wave F, in the existing wave register: the four compute and
     orchestration packs and their bundles, that Containers is the third deploy
     target and the first pack with a config tier since Workers SSR, and the
     instead-of rule in one clause pointing at the decisions doc. Keep it to the
     length of the Wave F paragraph.
   - `.claude/skills/stackgen-plugin/SKILL.md:87-115` — the `(f)` config-entry
     precedent names `workers-static-assets` and `workers-ssr`; add `containers`
     to the same clause. Add nothing that restates a count. If the skill's map
     table should point at the new decisions doc, add the row.
   - `readme.md:227-265`, `CLAUDE.md:211`, `.claude/docs/plugins.md:13` — only
     if a sentence there is now false; the survey says they enumerate no
     Cloudflare services.
2. **`docs/memory/decisions/2026-09-06-containers-pin-instead-of-workers-ssr.md`**
   — in the form of plan A's two decisions docs (frontmatter as theirs, a
   Context, a Decision, a Rejected list, a Consequences section). Context: three
   Cloudflare deploy targets now ship; two of them (`workers-ssr`, `containers`)
   are Worker-with-a-script shapes and both ship the root `wrangler.jsonc` as a
   complete config; the deploy axis is a list, so the collision is representable
   and must be ruled out in prose. Decision: B4 verbatim;
   `cloudflare-zero-trust` still composes beside either. Rejected: a Containers
   pack that layers onto a Workers SSR pin (would need a wrangler fragment merge
   that does not exist); a shared wrangler fragment convention (same); a
   `deploy-target/container-image` component in the bundle (mirrors
   `gcp-cloud-run`, which has none). Consequences: the next provider pack with
   two Worker-shaped deploy targets states the same exclusivity in its bundle
   prose; a checker rule that detects two pinned bundles shipping the same root
   file is parked (name plan A's Parked entry on category validation as the
   gate-only plan it would join).

## Verification

- `mise run site:check` exits 0 (astro check, build, link checker over the
  edited pages).
- `pnpm exec dprint check readme.md CLAUDE.md` exits 0 (they **are**
  dprint-formatted; accept a re-padded table).
- `grep -n 'both Workers packs\|Both Cloudflare Workers deploy packs' site/src/content/docs/plugins/stackgen.md`
  is empty.
- `grep -rn '[0-9]\+ packs' readme.md CLAUDE.md .claude/skills/stackgen-plugin/SKILL.md site/src/content/docs/plugins/stackgen.md`
  returns nothing new (no count typed by hand).
- The decisions doc exists and its frontmatter parses (match plan A's two docs'
  field set exactly).
- Every `DOCS FALSIFIED:` line from U1–U5 is either applied or listed in your
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
- Cite plan A's decisions docs and the Workers SSR one by path; do not edit
  them.
- Never run `git checkout`, `git restore`, `git stash` or a formatter `--fix`
  outside your owned paths.

## Commit

`docs: Cloudflare compute and orchestration — four packs, and Containers pins instead of Workers SSR`
— written by the orchestrator after the wave gate, not by the unit.
