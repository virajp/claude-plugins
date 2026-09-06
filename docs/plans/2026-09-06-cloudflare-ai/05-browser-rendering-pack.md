# U5 — The `cloud-service/browser-rendering` pack and the `cloudflare-browser-rendering` bundle

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/cloud-service/browser-rendering/**` (all
  new) and `plugins/stackgen/stacks/bundles/cloudflare-browser-rendering.md`
  (new). Touch nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling: `pack.yaml` field shape, the
  `capability`-unset comment at `pack.yaml:7-9`, one reference per topic, the
  router table, the citation seam to the provider);
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as
  U1 left it; `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `browser` token).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every Browser
  Rendering fact (fallback `/cloudflare/cloudflare-docs`).

## Ruling

D2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D4: Browser Rendering cites no contract.

D5: `capability` **unset** with the zero-trust comment shape (`browser` has no
vwf token today).

D11: router skill directory and `name:` are `cloudflare-browser-rendering`; the
pack directory is `browser-rendering`.

D12: "Exactly five [references] per pack, named for the topics:
`pick-and-trade.md`, `service-doctrine.md`, `cost-shape.md`,
`identity-shape.md`, `local-dev.md`. No sixth file."

D13: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` (falling back to
`/cloudflare/cloudflare-docs`) at authoring time and cited by URL in the
reference that states it. No fact from memory."

D14: `harness:` with `health`, `e2e_staging`, `local_stack`, each `task: n/a`
with honest mechanism prose. No task is invented.

D15: cite the provider pack's identity-and-iam reference for credentials; state
only the per-service token permission here.

D17: version `0.1.0`.

Plan facts, to verify, not trust: "Browser Rendering is reached through the
`browser: {binding}` binding (Cloudflare's Puppeteer and Playwright forks) and a
REST API with endpoints such as content, screenshot, pdf, scrape. Session reuse
and concurrency limits exist; local behaviour to be verified."

## Edits

1. **`pack.yaml`** — `name: Cloudflare Browser Rendering`; `summary` (headless
   Chrome as a service — a Worker drives a real browser through a binding, or
   any caller hits a REST endpoint for content, screenshots, PDFs and structured
   scrapes — for rendering, testing and crawling without running browsers);
   `version: 0.1.0`; `type: cloud-service`; `category: browser`; the
   `capability` comment per D5; `kind: cloud-provider`; `axis: backing`; no
   `artifact:`; `harness:` per D14 — `health` (a browser session is slow to
   open; the probe is a REST `content` call against a fixed page, or the
   binding's limits endpoint if one exists — verify — and what each proves),
   `e2e_staging` (the service is account-wide; environment isolation is by the
   URLs the product renders, and concurrency limits are shared — name the trap),
   `local_stack` (whether `wrangler dev` runs the binding against the remote
   service or has a local form — verify and state exactly).
2. **`conventions.md`** — what Browser Rendering is; the two access paths — the
   `browser` binding with the Puppeteer or Playwright fork as stated, and the
   REST API — and when each; the binding block as the shape the project adds to
   the Workers pack's `wrangler.jsonc` (D3); session lifecycle (open, reuse,
   keep-alive, close) and the concurrency and duration limits as stated; what to
   render (own pages for previews and PDFs; third-party pages under the crawl
   etiquette judgment); the AI Search crawl (one pointer sentence: AI Search
   uses this service to fetch rendered pages — U4's pack, cited by path); what
   this pack does not cover; one pointer sentence to the provider conventions
   for scope.
3. **`skills/cloudflare-browser-rendering/SKILL.md`** — the router, sibling's
   frontmatter shape, five-row table.
4. **`skills/cloudflare-browser-rendering/references/`** — D12's five:
   - `pick-and-trade.md` — Browser Rendering vs a self-run headless browser
     (Containers pack — plan B's, cite by path if present on disk at run time,
     else name it as planned via the provider's scope), vs a third-party
     rendering API; binding vs REST; Puppeteer vs Playwright fork as stated;
     when a product should not render at all (fetch the source instead).
   - `service-doctrine.md` — session management and reuse, timeouts, the limits,
     the binding block, the REST endpoints and their request shapes as
     documented, output handling (screenshots and PDFs to R2 — cite plan A's R2
     pack by path), robots and rate etiquette as judgment.
   - `cost-shape.md` — pricing dimensions as stated (browser-hours, concurrent
     sessions, REST requests, free tier); cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for Browser Rendering
     (verified) for the REST path, the binding as runtime identity, pointer to
     identity-and-iam (D15).
   - `local-dev.md` — local vs remote behaviour as verified, the stub seam for
     tests that must not open real sessions, `wrangler` subcommands if any;
     pointer to the provider's local-development-map row.
5. **`plugins/stackgen/stacks/bundles/cloudflare-browser-rendering.md`** —
   frontmatter `name: Cloudflare Browser Rendering`, `axis: backing`,
   `kind: cloud-provider`, two components; no `artifact:`. Body in the
   `gcp-cloud-sql.md` register: a heading
   `# Backing — Cloudflare Browser Rendering`, what the composition is and why
   two components, what pinning it gives a project, and a sentence that it pins
   beside other backing bundles since the axis is a list (cite `vwf-config.md`'s
   wording).

## Verification

- `ls plugins/stackgen/stacks/cloud-service/browser-rendering/skills/cloudflare-browser-rendering/references/`
  is exactly D12's five.
- `find plugins/stackgen/stacks/cloud-service/browser-rendering -name config` is
  empty.
- `grep -n '^category: browser$' …/browser-rendering/pack.yaml` hits once;
  `grep -c '^capability:' pack.yaml` is 0 and the comment is present.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-browser-rendering.md`
  is 0.
- `mise run plugins:check` exits 0; `plugins:inventory --check` fails with
  exactly your two rows (expected).
- No repo names, account ids or domains; every reference cites a
  `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**`, any other
  pack, any other bundle, any doc, `inventory.md`, `plugin.json`.
- Do not create a `config/` tier (D3). Do not create a sixth reference (D12).
- Do not name a mise task this pack does not ship (D14). Do not restate the
  credential names or the account-level cost shape — cite the provider (D15).
- Do not write AI Search, R2 or Containers doctrine — cite those packs by path.
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write such lines with Write and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids or domains in shipped files.

## Commit

`feat(stackgen): add the Browser Rendering pack and the cloudflare-browser-rendering bundle`
— written by the orchestrator after the wave gate, not by the unit.
