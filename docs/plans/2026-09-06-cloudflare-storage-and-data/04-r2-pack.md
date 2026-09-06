# U4 — The `cloud-service/r2` pack and the `cloudflare-r2` bundle

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `plugins/stackgen/stacks/cloud-service/r2/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-r2.md` (new). Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  (the Cloudflare sibling's shape);
  `plugins/stackgen/stacks/cloud-service/firebase-storage/**` top to bottom (the
  shipped `object-file-storage` pack — how it cites
  `assets/contracts/object-storage.md` clause by clause; match that, do not copy
  its GCP facts); `plugins/stackgen/assets/contracts/object-storage.md` (the
  contract you cite); `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md`
  and `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**`
  as U2 left it; `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`, `:266-267` (cite, do not
  restate, a contract).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every R2, R2
  Data Catalog and R2 SQL fact (fallback `/cloudflare/cloudflare-docs`).

## Ruling

D4: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D5: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D11: router skill directory and `name:` are `cloudflare-r2`; the pack directory
is `r2`.

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

D6: "R2 → `object-storage.md`" — the pack cites the contract clause by clause in
`service-doctrine.md`.

D7: "R2 Data Catalog and R2 SQL are **sections inside the R2 pack's references**
(service-doctrine and cost-shape), not separate packs or extra reference files."

D8: R2 `capability: object-file-storage`.

## Edits

1. **`pack.yaml`** — `name: Cloudflare R2`; `summary` (S3-compatible object
   storage with no egress fee, the product's object store for user files, build
   artifacts, datasets and logs, with an Iceberg catalog and SQL over it when
   the objects are tables); `version: 0.1.0`; `type: cloud-service`;
   `category: object-storage`; `capability: object-file-storage`;
   `kind: cloud-provider`; `axis: backing`; no `artifact:`; `harness:` per D14 —
   `health` (a bucket has no health endpoint; the mechanism is the consuming
   Worker's dependency probe, or a HEAD on a known object via the binding —
   state which and why), `e2e_staging` (a bucket per environment, never a prefix
   in the production bucket; lifecycle rules per bucket), and `local_stack`
   (what `wrangler dev` simulates for R2 locally, verified).
2. **`conventions.md`** — what R2 is for; the S3 API compatibility and what it
   means for existing SDKs (endpoint, region string, credentials shape — as
   Cloudflare states them); the binding block (`r2_buckets` with `binding` and
   `bucket_name`) as the shape the project adds to the Workers pack's
   `wrangler.jsonc` (D5); public access (custom domains vs `r2.dev`) and why the
   default is private; presigned URLs vs Worker-mediated access; event
   notifications feeding Queues (planned in plan B — one pointer sentence to the
   provider's scope, never the list); R2 Data Catalog and R2 SQL in one
   paragraph as R2 features (D7); what this pack does not cover (Images for
   transformation — planned). Cite the provider for cost and identity.
3. **`skills/cloudflare-r2/SKILL.md`** — the router, sibling's frontmatter
   shape, five-row table.
4. **`skills/cloudflare-r2/references/`** — D12's five:
   - `pick-and-trade.md` — R2 over KV (large values), over D1 (blobs), over a
     third-party object store (egress); when a bucket is the wrong home (hot
     small values, transactional data); the Data Catalog decision (when objects
     become Iceberg tables) in a short section.
   - `service-doctrine.md` — bucket naming and per-environment buckets;
     object-key design; multipart and size limits as stated; storage classes and
     lifecycle rules; CORS; the binding block and the S3 endpoint form; the
     `object-storage.md` contract walked clause by clause; then two sections —
     **R2 Data Catalog** (enabling it per bucket via
     `wrangler r2 bucket catalog`, the Iceberg REST endpoint, which engines
     connect, verified) and **R2 SQL** (`wrangler r2 sql query`, what it can and
     cannot query today, verified) (D7).
   - `cost-shape.md` — storage classes, Class A/B operations, zero egress, the
     free tier, and a **Data Catalog / R2 SQL** section with their own pricing
     dimensions as stated (D7); cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for R2 (verified name), S3
     API credentials (account-scoped R2 tokens) vs the Worker binding, and the
     pointer to the provider's identity-and-iam (D15).
   - `local-dev.md` — `wrangler dev` local buckets and where state persists,
     `--remote`, seeding objects, `wrangler r2 object` subcommands, an S3 SDK
     against a local target if Cloudflare documents one (else say it does not);
     pointer to the provider's local-development-map row.
5. **`plugins/stackgen/stacks/bundles/cloudflare-r2.md`** — frontmatter
   `name: Cloudflare R2`, `axis: backing`, `kind: cloud-provider`, two
   components; no `artifact:`. Body in the `gcp-cloud-sql.md` register: a
   heading `# Backing — Cloudflare <Service>`, what the composition is and why
   two components (provider facts written once, cited by the service), what
   pinning it gives a project, and a sentence that it pins beside other backing
   bundles since the axis is a list (cite `vwf-config.md`'s wording, do not
   paraphrase into a new rule), with one sentence that the Data Catalog and R2
   SQL come with the pin and need no second bundle.

## Verification

- `ls plugins/stackgen/stacks/cloud-service/r2/skills/cloudflare-r2/references/`
  is exactly D12's five.
- `find plugins/stackgen/stacks/cloud-service/r2 -name config` is empty.
- `grep -n '^category: object-storage$'` and
  `grep -n '^capability: object-file-storage$'` on `pack.yaml` each hit once.
- `grep -c 'Data Catalog' plugins/stackgen/stacks/cloud-service/r2/skills/cloudflare-r2/references/service-doctrine.md`
  ≥ 1 and the same on `cost-shape.md` ≥ 1 (D7).
- `grep -c 'contracts/object-storage.md' -r plugins/stackgen/stacks/cloud-service/r2`
  ≥ 1.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-r2.md` is 0.
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
- Plus: do not create `r2-data-catalog` or `r2-sql` as packs, bundles or
  reference files (D7). Do not restate the contract's clauses — cite them and
  say how R2 satisfies each.

## Commit

`feat(stackgen): add the R2 pack — object storage with Data Catalog and R2 SQL — and the cloudflare-r2 bundle`
— written by the orchestrator after the wave gate, not by the unit.
