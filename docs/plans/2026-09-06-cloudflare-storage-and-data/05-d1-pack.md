# U5 — The `cloud-service/d1` pack and the `cloudflare-d1` bundle

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `plugins/stackgen/stacks/cloud-service/d1/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-d1.md` (new). Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  (the Cloudflare sibling's shape);
  `plugins/stackgen/stacks/cloud-service/cloud-sql/**` top to bottom (the
  shipped `relational-datastore` pack — how it cites
  `assets/contracts/datastore.md`; match the seam, not the GCP facts);
  `plugins/stackgen/assets/contracts/datastore.md`;
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as
  U2 left it; `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`, `:266-267`.
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every D1 fact.

## Ruling

D4: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D5: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D11: router skill directory and `name:` are `cloudflare-d1`; the pack directory
is `d1`.

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

D6: "D1 → `datastore.md`" — cited clause by clause in `service-doctrine.md`.

D8: D1 `capability: relational-datastore`.

From Parked, so you do not ship it: "A D1 migrations task overlay … Backing
packs ship no `config/` (D5) … Decide with the first real D1 project." The
migrations **workflow** is doctrine here; the **task** is not shipped.

## Edits

1. **`pack.yaml`** — `name: Cloudflare D1`; `summary` (a serverless SQLite
   database bound to a Worker — relational data at the edge with read
   replication, sized for per-tenant or per-product datasets rather than one
   monolith); `version: 0.1.0`; `type: cloud-service`; `category: sql`;
   `capability: relational-datastore`; `kind: cloud-provider`; `axis: backing`;
   no `artifact:`; `harness:` per D14 — `health` (a trivial query through the
   binding from the consuming Worker's readiness path, and why `SELECT 1` proves
   the binding and not the schema), `e2e_staging` (a database per environment by
   `database_id`; migrations applied to it before the suite; never Time Travel
   as a test reset), `local_stack` (`wrangler
   dev`'s local SQLite, `--local`
   migrations, where state persists, verified).
2. **`conventions.md`** — what D1 is and its limits as Cloudflare states them
   (database size, the SQLite dialect, no long transactions across requests);
   the binding block (`d1_databases` with `binding`, `database_name`,
   `database_id`) as the shape the project adds to the Workers pack's
   `wrangler.jsonc` (D5); the migrations workflow
   (`wrangler d1 migrations
   create` / `apply --local` / `--remote`, the
   migrations directory, that the repo commits migrations and CI applies them
   before deploy — stated as the doctrine, with a sentence that this pack ships
   no task for it and why: parked until the first real D1 project); read
   replication / Sessions API and the consistency it gives, verified; Time
   Travel as a recovery tool; what this pack does not cover (Hyperdrive for an
   external Postgres — its own pack; Durable Objects' SQLite for per-object
   state — planned) with one pointer sentence to the provider's scope.
3. **`skills/cloudflare-d1/SKILL.md`** — the router, sibling's shape, five-row
   table.
4. **`skills/cloudflare-d1/references/`** — D12's five:
   - `pick-and-trade.md` — D1 over Hyperdrive+Postgres (when the data belongs at
     the edge vs when it already lives elsewhere), over Durable Objects SQLite
     (shared relational vs per-object), over KV; the sizing and multi-tenant
     shape; where D1 is the wrong answer.
   - `service-doctrine.md` — schema and migration conventions, prepared
     statements and batching, the binding block and per-environment ids, the
     Sessions API for read consistency, backup/Time Travel doctrine, and the
     `datastore.md` contract walked clause by clause.
   - `cost-shape.md` — rows read / rows written / storage as stated, the free
     tier, the replication cost note if any; cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for D1 (verified), the
     binding as the runtime identity, pointer to the provider's identity-and-iam
     (D15).
   - `local-dev.md` — `wrangler dev` local D1, applying migrations locally,
     seeding, `wrangler d1 execute --local`, `--remote` and its trap; pointer to
     the provider's local-development-map row.
5. **`plugins/stackgen/stacks/bundles/cloudflare-d1.md`** — frontmatter
   `name: Cloudflare D1`, `axis: backing`, `kind: cloud-provider`, two
   components; no `artifact:`. Body in the `gcp-cloud-sql.md` register: a
   heading `# Backing — Cloudflare <Service>`, what the composition is and why
   two components (provider facts written once, cited by the service), what
   pinning it gives a project, and a sentence that it pins beside other backing
   bundles since the axis is a list (cite `vwf-config.md`'s wording, do not
   paraphrase into a new rule).

## Verification

- `ls …/d1/skills/cloudflare-d1/references/` is exactly D12's five.
- `find plugins/stackgen/stacks/cloud-service/d1 -name config` is empty; in
  particular no `.config/mise/tasks` anywhere under the pack.
- `grep -n '^category: sql$'` and `grep -n '^capability: relational-datastore$'`
  on `pack.yaml` each hit once.
- `grep -rc 'contracts/datastore.md' plugins/stackgen/stacks/cloud-service/d1`
  ≥ 1.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-d1.md` is 0.
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
- Plus: do not ship a migrations task or any `config/` file, however tempting —
  it is parked by name. Do not restate the datastore contract.

## Commit

`feat(stackgen): add the D1 pack and the cloudflare-d1 bundle` — written by the
orchestrator after the wave gate, not by the unit.
