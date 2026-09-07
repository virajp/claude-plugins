# U4 — The `cloud-service/ai-search` pack and the `cloudflare-ai-search` bundle

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/cloud-service/ai-search/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-ai-search.md` (new). Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling: `pack.yaml` field shape, the
  `capability`-unset comment at `pack.yaml:7-9`, one reference per topic, the
  router table, the citation seam to the provider);
  `plugins/stackgen/stacks/cloud-service/r2/**` and
  `plugins/stackgen/stacks/cloud-service/vectorize/**` (plan A's packs — the
  source you pair with and the alternative you trade against; read, never edit);
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as
  U1 left it; `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `retrieval` token).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every AI Search
  fact (fallback `/cloudflare/cloudflare-docs`) — **the wrangler binding key is
  the fact the plan did not verify**; find it first.

## Ruling

D2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D4: AI Search cites no contract.

D5: `capability` **unset** with the zero-trust comment shape (`retrieval` has no
vwf token today). Rejected at the interview: "stretching `search-index` onto AI
Search" — a managed retrieval pipeline is not an index; say so in the comment in
one clause.

D11: router skill directory and `name:` are `cloudflare-ai-search`; the pack
directory is `ai-search`.

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

Plan facts, to verify, not trust: "AI Search was AutoRAG. Context7 shows a
binding used as `env.AI_SEARCH.get(INSTANCE_ID).search({query})` and
`.items.uploadAndPoll(key, html, {timeoutMs})`; sources are R2 buckets and
website crawls (the crawl example uses Browser Rendering's `BROWSER` binding
with `quickAction("content", …)`)."

## Edits

1. **`pack.yaml`** — `name: Cloudflare AI Search`; `summary` (a managed
   retrieval pipeline — point it at an R2 bucket or a website, it chunks,
   embeds, indexes and answers queries with citations, the product's retrieval
   layer when the team should not run one); `version: 0.1.0`;
   `type: cloud-service`; `category: retrieval`; the `capability` comment per
   D5; `kind: cloud-provider`; `axis: backing`; no `artifact:`; `harness:` per
   D14 — `health` (an instance's indexing status and a fixed known-answer query
   as the probe; what a stale index looks like), `e2e_staging` (an instance per
   environment over that environment's source bucket; indexing latency means the
   suite must poll for readiness — `uploadAndPoll` or the status endpoint, as
   verified), `local_stack` (whether the binding has any local form under
   `wrangler dev` — verify; expected remote-only, and the stub a project keeps
   at the seam).
2. **`conventions.md`** — what AI Search is, and one sentence that it was called
   AutoRAG (for the reader searching the old name); instances and their sources
   (R2 buckets — cite `stacks/cloud-service/r2/` by path for the bucket itself;
   website crawl — and that the crawl uses Browser Rendering, this plan's U5
   sibling, one pointer sentence); the binding block (the verified wrangler key)
   and the namespace/instance call shape, as the shape the project adds to the
   Workers pack's `wrangler.jsonc` (D3); indexing controls (chunking, embedding
   model choice, metadata filters, reindex cadence) as stated; query modes
   (search vs AI-generated answer, citations); what this pack does not cover (a
   hand-rolled pipeline on Vectorize + Workers AI — cite
   `stacks/cloud-service/vectorize/` by path as the alternative; one pointer
   sentence to the provider conventions for scope).
3. **`skills/cloudflare-ai-search/SKILL.md`** — the router, sibling's
   frontmatter shape, five-row table.
4. **`skills/cloudflare-ai-search/references/`** — D12's five:
   - `pick-and-trade.md` — AI Search vs Vectorize + Workers AI hand-rolled
     retrieval (control over chunking and ranking vs a managed pipeline; when
     the product's retrieval is its differentiator and when it is plumbing); vs
     an external RAG service; the source-type decision (bucket vs crawl).
   - `service-doctrine.md` — instance-per-environment naming, source bucket
     layout and item keys (the `.html`→Markdown conversion rule the docs show),
     indexing configuration, query shapes and citations, reindexing and
     freshness, the binding block with the verified key, and the seam the
     product keeps so retrieval can move.
   - `cost-shape.md` — pricing as stated (indexing, queries, the embedding
     model's Workers AI cost, the bucket's R2 cost — cite plan A's R2 cost-shape
     by path rather than restating); cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for AI Search (verified),
     the binding as runtime identity, the service's own access to the source
     bucket (how it is granted, as stated), pointer to identity-and-iam (D15).
   - `local-dev.md` — the local form or its absence as verified; a staging
     instance as the dev target and the shared-state trap; pointer to the
     provider's local-development-map row.
5. **`plugins/stackgen/stacks/bundles/cloudflare-ai-search.md`** — frontmatter
   `name: Cloudflare AI Search`, `axis: backing`, `kind: cloud-provider`, two
   components; no `artifact:`. Body in the `gcp-cloud-sql.md` register: a
   heading `# Backing — Cloudflare AI Search`, what the composition is and why
   two components, what pinning it gives a project, a sentence that it pins
   beside other backing bundles since the axis is a list (cite `vwf-config.md`'s
   wording), plus the pairing sentence: an AI Search pin over a bucket source
   expects a `cloudflare-r2` pin beside it.

## Verification

- `ls plugins/stackgen/stacks/cloud-service/ai-search/skills/cloudflare-ai-search/references/`
  is exactly D12's five.
- `find plugins/stackgen/stacks/cloud-service/ai-search -name config` is empty.
- `grep -n '^category: retrieval$' …/ai-search/pack.yaml` hits once;
  `grep -c '^capability:' pack.yaml` is 0 and the comment is present.
- `grep -c 'AutoRAG' plugins/stackgen/stacks/cloud-service/ai-search/conventions.md`
  is exactly 1.
- The verified wrangler key for the AI Search binding appears in
  `service-doctrine.md` with the URL it came from.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-ai-search.md`
  is 0.
- `mise run plugins:check` exits 0; `plugins:inventory --check` fails with
  exactly your two rows (expected).
- No repo names, account ids or domains; every reference cites a
  `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**`, any other pack
  (including plan A's `r2` and `vectorize`), any other bundle, any doc,
  `inventory.md`, `plugin.json`.
- Do not create a `config/` tier (D3). Do not create a sixth reference (D12).
- Do not name a mise task this pack does not ship (D14). Do not restate the
  credential names or the account-level cost shape — cite the provider (D15).
- Do not write R2, Vectorize, Workers AI or Browser Rendering doctrine — cite
  those packs by path.
- If Context7 shows the product's current name, binding key or source types
  differ from the plan's facts, follow Context7 and record the difference as
  `DECIDED:`; if the current shape makes the `retrieval` category or the summary
  wrong, return `UNRESOLVED:` rather than choosing.
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write such lines with Write and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids or domains in shipped files.

## Commit

`feat(stackgen): add the AI Search pack and the cloudflare-ai-search bundle` —
written by the orchestrator after the wave gate, not by the unit.
