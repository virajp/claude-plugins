# U9 — The `cloud-service/analytics-engine` pack and the `cloudflare-analytics-engine` bundle

- **Wave:** 2
- **Depends on:** U1 (the `analytics` token), U2
- **Owns:** `plugins/stackgen/stacks/cloud-service/analytics-engine/**` (all
  new) and `plugins/stackgen/stacks/bundles/cloudflare-analytics-engine.md`
  (new). Touch nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  (the sibling whose `capability` is unset with a comment);
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md`,
  `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as
  U2 left it; `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `analytics` token);
  `plugins/stackgen/assets/contracts/observability.md` — **read to state why you
  do not cite it** (see Ruling).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every Analytics
  Engine fact.

## Ruling

D4: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D5: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D11: router skill directory and `name:` are `cloudflare-analytics-engine`; the
pack directory is `analytics-engine`.

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

D6: Analytics Engine cites no contract. `observability.md` is the telemetry sink
contract (`distributed-tracing`); Analytics Engine is a product-metrics store
written from Workers, not a trace sink — `pick-and-trade.md` says so in one
sentence so the next reader does not re-open it.

D8: Analytics Engine `capability` **unset** with the zero-trust comment shape
(`analytics` has no vwf token today).

Plan fact, to verify: the binding is
`analytics_engine_datasets: [{binding,
dataset}]` and writes are
`writeDataPoint({blobs, doubles, indexes})`; reads are a SQL API over HTTP.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Analytics Engine`; `summary`
   (high-cardinality time-series written from Workers with one call and read
   with SQL — usage metrics, per-tenant counters and service telemetry without a
   metrics pipeline the team runs); `version: 0.1.0`; `type: cloud-service`;
   `category: analytics`; the `capability` comment per D8;
   `kind: cloud-provider`; `axis: backing`; no `artifact:`; `harness:` per D14 —
   `health` (a write is fire-and-forget and returns nothing to probe; the
   mechanism is a SQL read of a recent data point, with the sampling and delay
   caveats as stated), `e2e_staging` (a dataset per environment; the dataset
   name is the isolation), `local_stack` (what `wrangler dev` does with
   `writeDataPoint` locally — verify; likely a no-op or a log — and say so).
2. **`conventions.md`** — what Analytics Engine is; the data-point shape (blobs,
   doubles, indexes and their limits as stated) and how index choice drives
   sampling; the binding block (`analytics_engine_datasets`) as the shape the
   project adds to the Workers pack's `wrangler.jsonc` (D5); the SQL API
   (endpoint, auth, the dialect's limits, retention as stated); adaptive
   sampling and how to read `_sample_interval`; what this pack does not cover
   (traces and logs — the product's telemetry sink, cited by contract name; raw
   event lakes — Pipelines, its own pack; one pointer sentence to the provider's
   scope).
3. **`skills/cloudflare-analytics-engine/SKILL.md`** — the router, sibling's
   shape, five-row table.
4. **`skills/cloudflare-analytics-engine/references/`** — D12's five:
   - `pick-and-trade.md` — Analytics Engine vs a telemetry sink (metrics about
     the product vs traces about the system — the `observability.md` sentence of
     the Ruling), vs Pipelines+R2 (aggregates vs raw), vs a counter in D1 or
     Durable Objects (exact vs sampled); when it is the wrong answer
     (billing-grade counts).
   - `service-doctrine.md` — dataset naming per environment, the data-point
     schema as a contract the Worker keeps stable, index selection and
     cardinality, querying (the SQL API, `_sample_interval` weighting, time
     windows), the binding block, and dashboards reading the SQL API.
   - `cost-shape.md` — pricing dimensions as stated (data points written,
     queries) and the free tier; cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for the SQL API (verified —
     reads need an Account Analytics permission or similar; state exactly), the
     binding as write identity, pointer to the provider's identity-and-iam
     (D15).
   - `local-dev.md` — local behaviour of writes as verified, querying a dev
     dataset, and the trap that sampling makes small datasets look wrong;
     pointer to the provider's local-development-map row.
5. **`plugins/stackgen/stacks/bundles/cloudflare-analytics-engine.md`** —
   frontmatter `name: Cloudflare Analytics Engine`, `axis: backing`,
   `kind: cloud-provider`, two components; no `artifact:`. Body in the
   `gcp-cloud-sql.md` register: a heading
   `# Backing — Cloudflare Analytics Engine`, what the composition is and why
   two components (provider facts written once, cited by the service), what
   pinning it gives a project, and a sentence that it pins beside other backing
   bundles since the axis is a list (cite `vwf-config.md`'s wording, do not
   paraphrase into a new rule).

## Verification

- `ls …/analytics-engine/skills/cloudflare-analytics-engine/references/` is
  exactly D12's five.
- `find plugins/stackgen/stacks/cloud-service/analytics-engine -name config` is
  empty.
- `grep -n '^category: analytics$'` on `pack.yaml` hits once;
  `grep -c '^capability:' pack.yaml` is 0 and the comment is present.
- `grep -c 'observability.md' plugins/stackgen/stacks/cloud-service/analytics-engine/skills/cloudflare-analytics-engine/references/pick-and-trade.md`
  ≥ 1 (the one-sentence non-citation).
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-analytics-engine.md`
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
- Plus: do not write observability doctrine — the sink contract and whichever
  pack realizes it own that.

## Commit

`feat(stackgen): add the Analytics Engine pack and the cloudflare-analytics-engine bundle`
— written by the orchestrator after the wave gate, not by the unit.
