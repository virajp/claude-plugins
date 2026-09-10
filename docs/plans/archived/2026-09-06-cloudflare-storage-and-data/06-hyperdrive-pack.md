# U6 — The `cloud-service/hyperdrive` pack and the `cloudflare-hyperdrive` bundle

- **Wave:** 2
- **Depends on:** U1 (the `database-proxy` token), U2
- **Owns:** `plugins/stackgen/stacks/cloud-service/hyperdrive/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-hyperdrive.md` (new). Touch
  nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  (the Cloudflare sibling — and the pack whose `capability` is **unset** with a
  comment, the shape you reuse);
  `plugins/stackgen/stacks/cloud-service/cloud-sql/**` (the datastore this proxy
  most often fronts; you cite its existence in pick-and-trade, you do not
  restate it); `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md`,
  `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as
  U2 left it; `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `database-proxy` token and the "no
  capability token today" paragraph as U1 left them).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every Hyperdrive
  fact.

## Ruling

D4: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D5: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D11: router skill directory and `name:` are `cloudflare-hyperdrive`; the pack
directory is `hyperdrive`.

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

D6: Hyperdrive cites no contract.

D8: Hyperdrive "**unset** with the zero-trust comment shape, since [its category
has] no vwf token today." The datastore behind it realizes
`relational-datastore`; the proxy realizes nothing — say so in the comment.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Hyperdrive`; `summary` (a connection pool
   and query cache between Workers and an existing Postgres or MySQL wherever it
   lives — the datastore stays where it is, the Worker stops paying a cold
   TCP+TLS handshake per request); `version: 0.1.0`; `type: cloud-service`;
   `category: database-proxy`; the `capability` comment per D8 (three lines in
   the zero-trust shape, naming `database-proxy` as the token-less category and
   that the fronted datastore carries the capability); `kind: cloud-provider`;
   `axis: backing`; no `artifact:`; `harness:` per D14 — `health` (a query
   through the binding proves the pool, the origin and the credential at once;
   what a failure at each layer looks like), `e2e_staging` (a Hyperdrive config
   per environment pointing at that environment's database; never one config
   with a swapped origin), `local_stack` (the local connection-string override
   wrangler documents for Hyperdrive, its exact variable name verified, and that
   local dev talks to a real database — there is no simulated origin).
2. **`conventions.md`** — what Hyperdrive is and is not (not a database, not a
   replica, not a schema tool); the binding block (`hyperdrive` with `binding`
   and `id`) and `compatibility_flags: ["nodejs_compat"]` as the shape the
   project adds to the Workers pack's `wrangler.jsonc` (D5); creating a config
   from an origin connection string (`wrangler hyperdrive create`, verified) and
   where the origin credential lives (the provider's secrets doctrine — cite;
   the plan-D Secrets Store pack later — one pointer sentence to the provider's
   scope); supported drivers and ORMs as stated; query caching — what is cached,
   what is bypassed, how to disable; the pairing rule: this pack pins **beside**
   a datastore pin (`gcp-cloud-sql`, a generated Postgres, …) and never instead
   of one.
3. **`skills/cloudflare-hyperdrive/SKILL.md`** — the router, sibling's shape,
   five-row table.
4. **`skills/cloudflare-hyperdrive/references/`** — D12's five:
   - `pick-and-trade.md` — Hyperdrive+existing database vs D1 (data already
     elsewhere vs data born at the edge), vs direct connection from Workers (why
     that fails at scale), vs a self-run pooler; when caching helps and when it
     must be off.
   - `service-doctrine.md` — origin requirements (TLS, public reachability or
     the private-network path via the provider's networking doctrine — cite it),
     the driver setup per supported driver as stated, connection-string
     handling, cache controls, transactions and their limits through a pooler.
   - `cost-shape.md` — Hyperdrive's pricing as stated (included with Workers
     paid, or its own dimensions — verify), the origin's egress note; cite the
     provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for Hyperdrive (verified),
     the origin database credential as a secret (cite the provider's
     identity-and-iam and secrets doctrine, D15), least privilege on the origin
     role.
   - `local-dev.md` — the local connection-string override variable (verified
     name and form), pointing at a local or a dev database, `wrangler dev`
     behaviour, and the trap that local dev never exercises the pool; pointer to
     the provider's local-development-map row.
5. **`plugins/stackgen/stacks/bundles/cloudflare-hyperdrive.md`** — frontmatter
   `name: Cloudflare Hyperdrive`, `axis: backing`, `kind: cloud-provider`, two
   components; no `artifact:`. Body in the `gcp-cloud-sql.md` register: a
   heading `# Backing — Cloudflare <Service>`, what the composition is and why
   two components (provider facts written once, cited by the service), what
   pinning it gives a project, and a sentence that it pins beside other backing
   bundles since the axis is a list (cite `vwf-config.md`'s wording, do not
   paraphrase into a new rule), plus the pairing sentence: this bundle is pinned
   **alongside** a datastore bundle, never alone.

## Verification

- `ls …/hyperdrive/skills/cloudflare-hyperdrive/references/` is exactly D12's
  five.
- `find plugins/stackgen/stacks/cloud-service/hyperdrive -name config` is empty.
- `grep -n '^category: database-proxy$'` on `pack.yaml` hits once;
  `grep -c '^capability:' pack.yaml` is 0 and `grep -c 'capability' pack.yaml` ≥
  1 (the comment).
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-hyperdrive.md`
  is 0.
- `mise run plugins:check` exits 0; `plugins:inventory --check` fails with
  exactly your two rows (expected).
- No repo names, account ids, domains or connection strings with real hosts;
  every reference cites a `developers.cloudflare.com` URL.

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
- Plus: do not write Postgres or MySQL doctrine — the datastore pack owns it;
  you write the proxy's.

## Commit

`feat(stackgen): add the Hyperdrive pack and the cloudflare-hyperdrive bundle` —
written by the orchestrator after the wave gate, not by the unit.
