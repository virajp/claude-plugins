# U7 — Docs: the reconciler's findings applied, and the Agents SDK decisions doc

- **Wave:** 3
- **Depends on:** U1–U6 (every `DOCS FALSIFIED:` line they returned)
- **Owns:** `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`,
  `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-09-06-agents-sdk-is-a-framework-pack.md` (new).
  Touch nothing outside this list.
- **Model:** opus
- **Read first:** the `docs-reconciler` agent's findings for this run's diff
  (the orchestrator dispatches it first and passes them to you); every
  `DOCS FALSIFIED:` line from U1–U6; then each owned file top to bottom before
  editing. `index.md` §Facts, "Docs that enumerate framework packs or Cloudflare
  rows".
- **Lazy-load:**
  `docs/memory/decisions/2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md`
  and `2026-09-06-astro-four-modes-four-bundles.md` (the form to match, and the
  two docs this one cites); the new pack `conventions.md` files, read-only, for
  the one-line description each doc row needs.

## Ruling

D6 (quoted in full in `06-agents-sdk.md`): the Agents SDK ships as
`framework/cloudflare-agents` plus the `typescript-cloudflare-agents` language
bundle; rejected "Framework pack only, no bundle" (repeats the python-packs gap)
and "Park it". D7–D9 (the topic-driven references, the paths-scoped router, the
pairing sentences) are recorded with it.

`.claude/skills/stackgen-plugin/SKILL.md:26-27`: "do not restate a count or a
rule an asset owns" — no pack count, bundle count or category list is typed into
any doc; the docs point at `plugins/stackgen/stacks/inventory.md` and
`assets/taxonomy.md`.

## Edits

1. **Apply the reconciler's findings and every `DOCS FALSIFIED:` line**, each as
   the minimal edit that makes the passage true again. Expected sites, to be
   confirmed against the findings rather than assumed:
   - `site/src/content/docs/plugins/stackgen.md:155` — "**Two framework packs
     ship today**, `effect` and `astro`" → three, naming `cloudflare-agents` in
     the same sentence form. Do not rename any heading (the site link checker
     follows fragments, and `:158-159` cites one by anchor).
   - `site/src/content/docs/how-to/operate/choosing-your-stack.md:43-48` — the
     language-bundle rows gain `typescript-cloudflare-agents` in the existing
     row form; `:72-78` gains the four AI backing bundles in the row form plans
     A and B used. One sentence, if the page has none yet, that a language
     bundle carrying a framework that *is* a Durable Object pairs with a deploy
     pin and a backing pin — stated as what the bundle prose says, not as a new
     rule.
   - `plugins/stackgen/stacks/readme.md` — append a **Wave H** paragraph after
     B's Wave G, in the existing wave register: the four AI service packs and
     their bundles, and the Agents SDK as the third framework pack with its
     language bundle — why a framework and not a service, in one sentence. Keep
     it to the length of the Wave F paragraph.
   - `readme.md`, `CLAUDE.md:211`, `.claude/docs/plugins.md:13` — only if a
     sentence there is now false (a hand-typed "two framework packs" or a
     Cloudflare service enumeration). The survey found none; confirm.
   - `.claude/skills/stackgen-plugin/SKILL.md` — if its map table at `:29-40`
     should point at the new decisions doc, add the row; nothing that restates a
     count.
2. **`docs/memory/decisions/2026-09-06-agents-sdk-is-a-framework-pack.md`** — in
   the form of its neighbours (frontmatter as theirs; Context, Decision,
   Rejected, Consequences). Context: twenty Cloudflare services chosen; the
   Agents SDK is the one that is an npm framework on Durable Objects, not a
   service with a binding; framework packs are `language-bundle`/project-axis
   and reach a project only inside a language bundle; the python-packs gap
   (`docs/memory/gaps/2026-09-01-python-packs-authored-but-unreachable.md`) as
   the precedent for why a pack without a bundle is a defect. Decision: D6, D7,
   D8, D9 as written in `index.md`. Rejected: "Framework pack only, no bundle";
   "Park it"; a cloud-service pack with the five service topics forced onto a
   framework. Consequences: the third framework pack; the `agent-sdk` framework
   category (minted by plan A) has its first pack; the deploy-shape question
   (whether `workers-ssr`'s `wrangler.jsonc` template should carry a commented
   `durable_objects` + `migrations` block) is parked (name the Parked entry).

## Verification

- `mise run site:check` exits 0 (astro check, build, link checker over the
  edited pages).
- `pnpm exec dprint check readme.md CLAUDE.md` exits 0 if either was edited
  (they **are** dprint-formatted; a widened table cell re-pads every row —
  accept the re-pad).
- `grep -n 'Two framework packs' site/src/content/docs/plugins/stackgen.md` is
  empty; `grep -c 'cloudflare-agents' site/src/content/docs/plugins/stackgen.md`
  ≥ 1.
- `grep -c 'typescript-cloudflare-agents' site/src/content/docs/how-to/operate/choosing-your-stack.md`
  ≥ 1.
- `grep -rn '[0-9]\+ packs' readme.md CLAUDE.md .claude/skills/stackgen-plugin/SKILL.md site/src/content/docs/plugins/stackgen.md`
  returns nothing new (no count typed by hand).
- The decisions doc exists and its frontmatter parses (match the neighbours'
  field set exactly).
- Every `DOCS FALSIFIED:` line from U1–U6 is either applied or listed in your
  return block as `DECIDED: not applied — <why>`.

## Guardrails

- Do not touch `plugins/stackgen/stacks/cloud-*/**`,
  `plugins/stackgen/stacks/framework/**`, `plugins/stackgen/stacks/bundles/**`,
  `plugins/stackgen/assets/**`, `inventory.md`, `plugin.json` — not yours.
- Do not rename a heading in any site page; do not add a new site page (the nav
  would need an entry and the build fails without it).
- `readme.md`, `CLAUDE.md` are dprint-formatted — run `dprint fmt` on exactly
  those two if you widen a table; `plugins/**/*.md` and `docs/memory/**/*.md`
  are not — hand-fold.
- `cat` is aliased to `bat`: Write/Edit, never heredocs.
- Cite the earlier decisions docs by path; do not edit them.

## Commit

`docs: Cloudflare AI — four services and the Agents SDK as a framework` —
written by the orchestrator after the wave gate, not by the unit.
