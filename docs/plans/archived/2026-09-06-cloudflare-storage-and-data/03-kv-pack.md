# U3 — The `cloud-service/kv` pack and the `cloudflare-kv` bundle

- **Wave:** 2
- **Depends on:** U1 (the `key-value` token), U2 (the narrowed provider scope
  you cite)
- **Owns:** `plugins/stackgen/stacks/cloud-service/kv/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-kv.md` (new). Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling: `pack.yaml` field shape, one reference
  per topic, the router table, the citation seam to the provider);
  `plugins/stackgen/stacks/cloud-service/cloud-sql/pack.yaml` (a backing sibling
  that **sets** `capability`);
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `plugins/stackgen/stacks/bundles/gcp-cloud-sql.md` (bundle frontmatter and
  prose register; the backing one has no `artifact:` key);
  `plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md` and
  `skills/cloudflare/references/*.md` as U2 left them (what you cite, never
  restate); `plugins/stackgen/assets/kinds.md:186-281` (the five service
  topics); `plugins/stackgen/assets/pack-format.md:144-234` (`pack.yaml` fields
  and the bundle file); `plugins/stackgen/assets/taxonomy.md` (the `key-value`
  token U1 minted and the capability seam).
- **Lazy-load:** `plugins/vwf/assets/capability-vocabulary.md:27-41`
  (`cache-layer` and its prose noun "the cache"); Context7
  `/websites/developers_cloudflare` for every KV fact (fallback
  `/cloudflare/cloudflare-docs`).

## Ruling

D4: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D5: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D6: KV "cite[s] none" of the contracts.

D8: KV `capability: cache-layer`.

D11: router skill directory and `name:` are `cloudflare-kv`; the pack directory
is `kv`.

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

## Edits

1. **`pack.yaml`** — `name: Cloudflare Workers KV`; a `summary` in the sibling's
   voice (a global, eventually consistent key-value store for read-heavy
   configuration, routing metadata and cached results — the cache layer a Worker
   reads on every request, not the datastore it writes on every request);
   `version: 0.1.0`; `type: cloud-service`; `category: key-value`;
   `capability: cache-layer`; `kind: cloud-provider`; `axis: backing`; **no
   `artifact:`**; `harness:` per D14 — `health` (a KV read is not a health
   signal for the store, which has no endpoint; a Worker that depends on a key
   probes its own dependency and reports the miss, and that is the mechanism —
   say so), `e2e_staging` (a separate namespace per environment, bound by id;
   never the production namespace with a prefix — the trap and why), and
   `local_stack` (what `wrangler dev` does for KV locally and where its state
   persists, verified).
2. **`conventions.md`** — the component's prose, copied verbatim into the
   template payload: what KV is for and is not for (eventual consistency, the
   propagation window as Cloudflare states it, the value-size and key-size
   limits as stated, why it is `cache-layer` and not a datastore); the binding
   shape a project adds to its `wrangler.jsonc` (`kv_namespaces` with `binding`
   and `id`, and the per-environment form), as a snippet with a sentence saying
   the project's Workers pack owns that file and this pack only names what goes
   in it (D5); how a namespace is created and the id recorded; what this pack
   explicitly does **not** cover (Durable Objects for strongly consistent state
   — planned; D1 for relational — its own pack) with one pointer sentence to the
   provider conventions for scope (never the list itself). Cite the provider
   doctrine for cost and identity; never restate.
3. **`skills/cloudflare-kv/SKILL.md`** — the router, frontmatter in the
   sibling's exact shape (`name: cloudflare-kv`, `version: 0.1.0`,
   `category: development`, `description`, `license: MIT`, `allowed-tools`),
   model-invocable, not paths-scoped. The "read one, not all" table with five
   rows, one per reference.
4. **`skills/cloudflare-kv/references/`** — the five files of D12:
   - `pick-and-trade.md` — when KV over Durable Objects storage, D1, or an
     in-Worker cache (`caches.default`); the consistency/latency/cost triangle;
     the cases where KV is the wrong answer (counters, anything
     read-after-write).
   - `service-doctrine.md` — key design, TTL and expiration, metadata, bulk
     operations, list pagination, the binding block and per-environment
     namespaces, the write-rate limit per key as Cloudflare states it, and the
     `cache-layer` capability clause this realizes (no contract file exists for
     it — say so in one sentence rather than inventing one).
   - `cost-shape.md` — the pricing dimensions (reads, writes, deletes, lists,
     storage) as Context7 states them today, with the free-tier line; cite the
     provider's cost-doctrine for the account-level shape.
   - `identity-shape.md` — the API-token permission a deploy needs for KV
     (verified name), the binding as the only runtime identity (no key in code),
     and a pointer to the provider's identity-and-iam for the token and
     account-id rule (D15).
   - `local-dev.md` — `wrangler dev`'s local KV simulation, where state lives,
     `--remote` and its trap, seeding a namespace for tests, `wrangler kv`
     subcommands the loop uses; one sentence pointing at the provider's
     local-development-map row. Each reference individually researched against
     Context7 and cited by URL.
5. **`plugins/stackgen/stacks/bundles/cloudflare-kv.md`** — frontmatter exactly:
   `name: Cloudflare Workers KV`, `axis: backing`, `kind: cloud-provider`,
   `components:` the two refs of D4; no `artifact:`, no `platforms:`, no
   `unconditional:`. Body in the `gcp-cloud-sql.md` register: a heading
   `# Backing — Cloudflare Workers KV`, what the composition is and why two
   components (provider facts written once, cited by the service), what pinning
   it gives a project, and a sentence that it pins beside other backing bundles
   since the axis is a list (cite `vwf-config.md`'s wording, do not paraphrase
   into a new rule).

## Verification

- `ls plugins/stackgen/stacks/cloud-service/kv/skills/cloudflare-kv/references/`
  is exactly the five names of D12.
- `find plugins/stackgen/stacks/cloud-service/kv -name config` is empty.
- `grep -n '^category: key-value$' plugins/stackgen/stacks/cloud-service/kv/pack.yaml`
  and `grep -n '^capability: cache-layer$' …` each hit once.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-kv.md` is 0.
- `mise run plugins:check` exits 0 (rule 4 on `SKILL.md`; rule 12 vocabulary).
- `mise run plugins:inventory --check` **fails** with a diff that is exactly
  your new pack row and bundle row — expected; do not regenerate (U11's).
- `grep -rn "95octane\|virajp\|claude-plugins\|<account" plugins/stackgen/stacks/cloud-service/kv plugins/stackgen/stacks/bundles/cloudflare-kv.md`
  is empty.
- Every reference contains at least one `developers.cloudflare.com` URL.

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

## Commit

`feat(stackgen): add the Workers KV pack and the cloudflare-kv bundle` — written
by the orchestrator after the wave gate, not by the unit.
