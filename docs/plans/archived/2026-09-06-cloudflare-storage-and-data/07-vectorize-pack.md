# U7 — The `cloud-service/vectorize` pack and the `cloudflare-vectorize` bundle

- **Wave:** 2
- **Depends on:** U1 (the `vector` token), U2
- **Owns:** `plugins/stackgen/stacks/cloud-service/vectorize/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-vectorize.md` (new). Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`;
  `plugins/stackgen/stacks/cloud-service/cloud-sql/pack.yaml` (a backing pack
  that sets `capability`);
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md`,
  `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as
  U2 left it; `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `vector` token).
- **Lazy-load:** `plugins/vwf/assets/capability-vocabulary.md:27-41`
  (`search-index`, prose noun "the search index"); Context7
  `/websites/developers_cloudflare` for every Vectorize fact.

## Ruling

D4: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D5: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D11: router skill directory and `name:` are `cloudflare-vectorize`; the pack
directory is `vectorize`.

D12: "Exactly five [references] per pack, named for the topics:
`pick-and-trade.md`, `service-doctrine.md`, `cost-shape.md`,
`identity-shape.md`, `local-dev.md`. No sixth file."

D13: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` … at authoring time and cited by URL in the
reference that states it. No fact from memory."

D14: `harness:` with `health`, `e2e_staging`, `local_stack`, each `task: n/a`
with honest mechanism prose.

D15: cite the provider's identity-and-iam reference for credentials; state only
the per-service token permission here.

D16: version `0.1.0`.

D6: Vectorize cites no contract.

D8: Vectorize `capability: search-index`.

Plan C (not yours) ships Workers AI and AI Search. You may say embeddings come
from "the product's inference provider" and point at the provider's scope for
which Cloudflare one; you do not write Workers AI doctrine.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Vectorize`; `summary` (a vector index
   bound to a Worker — similarity search over embeddings for retrieval,
   recommendation and classification, with metadata filtering, the search index
   a product's own embeddings live in); `version: 0.1.0`; `type: cloud-service`;
   `category: vector`; `capability: search-index`; `kind: cloud-provider`;
   `axis: backing`; no `artifact:`; `harness:` per D14 — `health` (an index has
   no endpoint; a `describe` or a known-vector query from the consuming Worker
   is the probe, and what it does and does not prove), `e2e_staging` (an index
   per environment; the dimension and metric are fixed at creation so an
   environment mismatch is a create-time decision), `local_stack` (whether
   `wrangler dev` runs Vectorize locally or only with `--remote` — verify and
   state exactly).
2. **`conventions.md`** — what Vectorize is; index creation (dimensions, metric,
   the fixed-at-creation rule), namespaces and metadata indexes as stated; the
   binding block (`vectorize` with `binding` and `index_name`) as the shape the
   project adds to the Workers pack's `wrangler.jsonc` (D5); upsert/query/delete
   semantics and the limits as stated (vector count, dimensions, metadata size,
   top-k); where embeddings come from (inference is a separate pick — one
   pointer sentence to the provider's scope); what this pack does not cover (a
   managed retrieval pipeline over documents — planned as AI Search; that is
   plan C's).
3. **`skills/cloudflare-vectorize/SKILL.md`** — the router, sibling's shape,
   five-row table.
4. **`skills/cloudflare-vectorize/references/`** — D12's five:
   - `pick-and-trade.md` — Vectorize vs a vector column in the relational store
     (D1 has none; Postgres+pgvector via Hyperdrive does — when each), vs a
     managed retrieval product, vs an external vector database; the metric and
     dimension choices and what they cost to change (recreate).
   - `service-doctrine.md` — index lifecycle, namespace and metadata-filter
     design, batch upsert shape and idempotency by id, query patterns (top-k,
     returnValues/returnMetadata trade), the binding block, versioning an index
     when the embedding model changes (dual-write and cut over — as judgment,
     with the reason).
   - `cost-shape.md` — queried and stored vector dimensions as the pricing
     dimensions if that is how Cloudflare states them (verify), the free tier;
     cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for Vectorize (verified),
     the binding as runtime identity, pointer to the provider's identity-and-iam
     (D15).
   - `local-dev.md` — local vs `--remote` for Vectorize as verified, seeding a
     dev index, `wrangler vectorize` subcommands the loop uses, the trap that a
     remote dev index is shared state; pointer to the provider's
     local-development-map row.
5. **`plugins/stackgen/stacks/bundles/cloudflare-vectorize.md`** — frontmatter
   `name: Cloudflare Vectorize`, `axis: backing`, `kind: cloud-provider`, two
   components; no `artifact:`. Body in the `gcp-cloud-sql.md` register: a
   heading `# Backing — Cloudflare <Service>`, what the composition is and why
   two components (provider facts written once, cited by the service), what
   pinning it gives a project, and a sentence that it pins beside other backing
   bundles since the axis is a list (cite `vwf-config.md`'s wording, do not
   paraphrase into a new rule).

## Verification

- `ls …/vectorize/skills/cloudflare-vectorize/references/` is exactly D12's
  five.
- `find plugins/stackgen/stacks/cloud-service/vectorize -name config` is empty.
- `grep -n '^category: vector$'` and `grep -n '^capability: search-index$'` on
  `pack.yaml` each hit once.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-vectorize.md`
  is 0.
- `mise run plugins:check` exits 0; `plugins:inventory --check` fails with
  exactly your two rows (expected).
- No repo names, account ids or domains; every reference cites a
  `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U2's), `assets/**` (U1's or
  nobody's), any other pack, any other bundle, any doc, `inventory.md`,
  `plugin.json`.
- Do not create a `config/` tier (D5). Do not create a sixth reference (D12).
- Do not name a mise task this pack does not ship (D14). Do not restate the
  credential names or the account-level cost shape — cite the provider (D15).
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write `pnpm exec wrangler` / `npx wrangler` lines with
  Write, and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids or domains in shipped files.
- Plus: no Workers AI or AI Search doctrine (plan C's); no embedding-model
  recommendations by name beyond what Cloudflare's own Vectorize docs use as
  examples, cited.

## Commit

`feat(stackgen): add the Vectorize pack and the cloudflare-vectorize bundle` —
written by the orchestrator after the wave gate, not by the unit.
