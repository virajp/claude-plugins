# U8 — The `cloud-service/pipelines` pack and the `cloudflare-pipelines` bundle

- **Wave:** 2
- **Depends on:** U1 (the `ingestion` token), U2
- **Owns:** `plugins/stackgen/stacks/cloud-service/pipelines/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-pipelines.md` (new). Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  (the sibling whose `capability` is unset with a comment);
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md`,
  `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as
  U2 left it; `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `ingestion` token and the
  token-less paragraph).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every Pipelines
  fact — **this is the service whose wrangler binding key the plan did not
  verify**; find it first.

## Ruling

D4: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D5: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D11: router skill directory and `name:` are `cloudflare-pipelines`; the pack
directory is `pipelines`.

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

D6: Pipelines cites no contract.

D8: Pipelines `capability` **unset** with the zero-trust comment shape
(`ingestion` has no vwf token today).

Plan facts, to verify, not trust: "Pipelines = streaming ingestion into R2
Iceberg tables"; the sink is R2 (U4's pack — cite it by name as the sibling pin
the project also needs, do not restate R2 doctrine). "Pipelines' key is to be
verified by its unit."

## Edits

1. **`pack.yaml`** — `name: Cloudflare Pipelines`; `summary` (streaming
   ingestion — events from Workers or an HTTP endpoint, optional SQL transforms,
   landing as Parquet or Iceberg tables in R2 — the way clickstream, telemetry
   and structured events reach the object store without a broker the team runs);
   `version: 0.1.0`; `type: cloud-service`; `category: ingestion`; the
   `capability` comment per D8; `kind: cloud-provider`; `axis: backing`; no
   `artifact:`; `harness:` per D14 — `health` (what proves a pipeline is
   accepting — a send through the binding or the HTTP endpoint and where the
   acceptance is observable — and what it does not prove: delivery to the sink),
   `e2e_staging` (a pipeline and a sink bucket per environment; never a shared
   sink with a prefix), `local_stack` (whether Pipelines has any local form
   under `wrangler dev` — verify; if none, say "None" and how a project
   substitutes, as the zero-trust pack does).
2. **`conventions.md`** — what Pipelines is (streams, transforms, sinks, in the
   vocabulary Cloudflare uses today — verify the current nouns); the binding
   block (the verified key) and the HTTP ingest alternative, as the shape the
   project adds to the Workers pack's `wrangler.jsonc` (D5); creating the
   pipeline and its sink (`wrangler pipelines …` as verified); schema and format
   choices (JSON in, Parquet/Iceberg out; the Data Catalog link — one sentence,
   citing U4's R2 pack for the catalog itself); batching and delivery semantics
   as stated; what this pack does not cover (Queues for task processing —
   planned; Analytics Engine for metrics — its own pack; one pointer sentence to
   the provider's scope).
3. **`skills/cloudflare-pipelines/SKILL.md`** — the router, sibling's shape,
   five-row table.
4. **`skills/cloudflare-pipelines/references/`** — D12's five:
   - `pick-and-trade.md` — Pipelines vs Queues (durable events for analytics vs
     tasks with consumers), vs Analytics Engine (raw events to tables vs
     aggregated time-series), vs writing to R2 directly from a Worker (why
     batching and schema belong to the pipeline); when the product does not need
     it at all.
   - `service-doctrine.md` — stream/schema design, transform placement, sink
     configuration (format, partitioning, the Iceberg table via the Data Catalog
     — cite the R2 pack), delivery guarantees and duplicates, the binding block
     and the HTTP endpoint's auth shape.
   - `cost-shape.md` — ingestion and delivery dimensions as stated, and that the
     sink's storage is R2's cost (cite U4's cost-shape by path rather than
     restating); cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for Pipelines (verified),
     the HTTP endpoint's authentication as stated, pointer to the provider's
     identity-and-iam (D15).
   - `local-dev.md` — the local form or its absence as verified; how a project
     substitutes (a dev pipeline into a dev bucket, or a stub behind the
     binding's seam); pointer to the provider's local-development-map row.
5. **`plugins/stackgen/stacks/bundles/cloudflare-pipelines.md`** — frontmatter
   `name: Cloudflare Pipelines`, `axis: backing`, `kind: cloud-provider`, two
   components; no `artifact:`. Body in the `gcp-cloud-sql.md` register: a
   heading `# Backing — Cloudflare <Service>`, what the composition is and why
   two components (provider facts written once, cited by the service), what
   pinning it gives a project, and a sentence that it pins beside other backing
   bundles since the axis is a list (cite `vwf-config.md`'s wording, do not
   paraphrase into a new rule), plus the pairing sentence: a Pipelines pin
   expects an R2 pin beside it for the sink.

## Verification

- `ls …/pipelines/skills/cloudflare-pipelines/references/` is exactly D12's
  five.
- `find plugins/stackgen/stacks/cloud-service/pipelines -name config` is empty.
- `grep -n '^category: ingestion$'` on `pack.yaml` hits once;
  `grep -c '^capability:' pack.yaml` is 0 and the comment is present.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-pipelines.md`
  is 0.
- The verified wrangler key for a Pipelines binding appears in
  `service-doctrine.md` with the URL it came from.
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
- Plus: if Context7 shows Pipelines' product vocabulary or binding key differs
  from the plan's facts, follow Context7 and record the difference as
  `DECIDED:`; if the product's current shape makes the `ingestion` category or
  the summary wrong, return `UNRESOLVED:` rather than choosing.

## Commit

`feat(stackgen): add the Pipelines pack and the cloudflare-pipelines bundle` —
written by the orchestrator after the wave gate, not by the unit.
