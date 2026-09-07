# U6 — Docs: the reconciler's findings applied, and the Secrets Store decisions doc

- **Wave:** 3
- **Depends on:** U1–U5 (every `DOCS FALSIFIED:` line they returned)
- **Owns:** `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`,
  `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`
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
  (plan A's two — match their form and cite the second, which records the
  `secrets-manager` placement); the new packs' `conventions.md` files,
  read-only, for the one-line description each doc row needs.

## Ruling

D5, the user's ruling verbatim: "Secrets Store is NOT for development
environment but for Cloud Environment where applications run in production or
staging". Rejected: a `capability-provider` pack; folding into the provider
pack.

D16:
"`docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`
records D5 with its rejected shapes, so the next plan that touches secrets does
not re-open it."

`.claude/skills/stackgen-plugin/SKILL.md:26-27`: "do not restate a count or a
rule an asset owns" — no pack count, bundle count or category list is typed into
any doc; the docs point at `plugins/stackgen/stacks/inventory.md` and
`assets/taxonomy.md`.

The wave-letter rule from the index: `plugins/stackgen/stacks/readme.md` gets
"the next wave letter after the last one present" — plan A appends F; B and C,
if landed, G and H; so this plan's paragraph is G, H or I depending on what is
on disk.

## Edits

1. **Apply the reconciler's findings and every `DOCS FALSIFIED:` line**, each as
   the minimal edit that makes the passage true again. Expected sites, to be
   confirmed against the findings rather than assumed:
   - `site/src/content/docs/how-to/operate/choosing-your-stack.md:72-78` — the
     Cloudflare rows: add the four backing bundles (`cloudflare-images`,
     `cloudflare-realtime`, `cloudflare-email-service`,
     `cloudflare-secrets-store`) in the existing row form, one line each.
   - `site/src/content/docs/how-to/operate/choosing-your-stack.md:62`
     ("`doppler` and `fnox` for secrets") — add **one sentence** after it: those
     are the developer-machine and CI providers; the runtime secrets a deployed
     Worker or Container reads are a backing pin, Cloudflare's being
     `cloudflare-secrets-store`. Do not restructure the paragraph.
   - `site/src/content/docs/plugins/stackgen.md:350-353` and `:626` — check the
     fnox passages stay true (they should; the guard hook and the overlay are
     unchanged). If the page anywhere describes the secrets provider as the
     whole secrets story, add one clause pointing at the runtime side. Do not
     rename any heading (the link checker follows fragments). Do not add a
     count.
   - `plugins/stackgen/stacks/readme.md` — append a wave paragraph with the next
     letter after the last present, in the existing wave register: the four
     packs and their bundles; the two-tools rule for secrets in one sentence;
     that this closes the four-plan Cloudflare effort **only if** plans B and C
     are already on disk (check `ls plugins/stackgen/stacks/cloud-service/` for
     `containers` and `stacks/framework/` for `cloudflare-agents`) — otherwise
     say which remain. Keep it to the length of the Wave E paragraph.
   - `readme.md`, `CLAUDE.md:211`, `.claude/docs/plugins.md:13` — only if a
     sentence is falsified; the survey found no Cloudflare service or secrets
     enumeration in them beyond the `fnox`/`devtools` history.
   - `.claude/skills/stackgen-plugin/SKILL.md` — if its map table at `:29-40`
     lists decisions docs, add the new one; otherwise nothing.
2. **`docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`**
   — in the form of plan A's two decisions docs (same frontmatter field set;
   Context, Decision, Rejected, Consequences). Context: twenty Cloudflare
   services across four plans; `secrets-manager` already a `capability-provider`
   category with `fnox` as the init-time pick; the user adding Secrets Store
   because Containers and Workers need it. Decision: the user's words verbatim;
   Secrets Store is a `cloud-service` / `secrets-manager` backing pack for
   staging and production; fnox stays the developer-machine and CI provider; the
   two coexist and the noun is shared on purpose (cite plan A's categories doc
   for the taxonomy placement); the `secrets.md` contract is cited by the pack
   with the binding as the process boundary. Rejected: "capability-provider
   pack" (no laptop-side injection; cannot feed pre-commit or mise tasks); "fold
   into the provider pack" (never on the menu, cannot be pinned). Consequences:
   a project may pin both; vwf may one day split the token by environment
   (parked); no other Cloudflare pack describes secret storage — they point at
   this one by path.

## Verification

- `mise run site:check` exits 0 (astro check, build, link checker over the
  edited pages).
- `pnpm exec dprint check readme.md CLAUDE.md` exits 0 if either was touched
  (they **are** dprint-formatted).
- `grep -n 'cloudflare-secrets-store' site/src/content/docs/how-to/operate/choosing-your-stack.md`
  hits at least once.
- `grep -rn '[0-9]\+ packs' readme.md CLAUDE.md .claude/skills/stackgen-plugin/SKILL.md site/src/content/docs/plugins/stackgen.md`
  returns nothing new (no count typed by hand).
- The decisions doc exists and its frontmatter parses (match plan A's two
  neighbours' field set exactly).
- Every `DOCS FALSIFIED:` line from U1–U5 is either applied or listed in your
  return block as `DECIDED: not applied — <why>`.

## Guardrails

- Do not touch `plugins/stackgen/stacks/cloud-*/**`,
  `plugins/stackgen/stacks/capability-provider/**`,
  `plugins/stackgen/stacks/bundles/**`, `plugins/stackgen/assets/**`,
  `inventory.md`, `plugin.json` — not yours.
- Do not rename a heading in any site page; do not add a new site page (the nav
  would need an entry and the build fails without it).
- `readme.md`, `CLAUDE.md` are dprint-formatted — run `dprint fmt` on exactly
  those two if you widen a table; `plugins/**/*.md` and `docs/memory/**/*.md`
  are not — hand-fold.
- `cat` is aliased to `bat`: Write/Edit, never heredocs.
- Cite plan A's decisions docs by path; do not edit them.

## Commit

`docs: Cloudflare media, messaging and secrets — the runtime secrets seam` —
written by the orchestrator after the wave gate, not by the unit.
