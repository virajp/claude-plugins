# U3 — The `cloud-service/ai-gateway` pack and the `cloudflare-ai-gateway` bundle

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/cloud-service/ai-gateway/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-ai-gateway.md` (new). Touch
  nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling: `pack.yaml` field shape, the
  `capability`-unset comment at `pack.yaml:7-9`, one reference per topic, the
  router table, the citation seam to the provider — and a pack, like this one,
  whose service is **not** a wrangler binding but a plane in front of things);
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `plugins/stackgen/stacks/bundles/gcp-cloud-sql.md`;
  `plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md` and
  `skills/cloudflare/references/*.md` as U1 left them — **especially the secrets
  doctrine** in identity-and-iam, which governs stored provider keys;
  `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `ai-gateway` token).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every AI Gateway
  fact (fallback `/cloudflare/cloudflare-docs`).

## Ruling

D2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`." For this pack the "binding block" is
the gateway option on the `ai` binding **and** the gateway URL form — both are
shapes the project writes, neither is a file this pack ships.

D4: AI Gateway cites no contract.

D5: `capability` **unset** with the zero-trust comment shape (`ai-gateway` has
no vwf token today).

D11: router skill directory and `name:` are `cloudflare-ai-gateway`; the pack
directory is `ai-gateway`.

D12: "Exactly five [references] per pack, named for the topics:
`pick-and-trade.md`, `service-doctrine.md`, `cost-shape.md`,
`identity-shape.md`, `local-dev.md`. No sixth file."

D13: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` (falling back to
`/cloudflare/cloudflare-docs`) at authoring time and cited by URL in the
reference that states it. No fact from memory."

D14: `harness:` with `health`, `e2e_staging`, `local_stack`, each `task: n/a`
with honest mechanism prose. No task is invented.

D15: "Cite the provider pack's identity-and-iam reference; state only the
per-service token permission. AI Gateway's stored upstream-provider keys are a
**secret the provider's secrets doctrine governs** — the pack points at that
doctrine, not at plan D's Secrets Store pack."

D17: version `0.1.0`.

Plan facts, to verify, not trust: "AI Gateway is reached by **URL** — a gateway
endpoint per upstream provider — and through the `ai` binding's gateway option;
it is not a binding of its own. It fronts third-party providers as well as
Workers AI: caching, rate limiting, logs, fallbacks, stored provider keys
(BYOK), authenticated gateways."

## Edits

1. **`pack.yaml`** — `name: Cloudflare AI Gateway`; `summary` (one URL in front
   of every model call the product makes — to Workers AI or to any third-party
   provider — that adds caching, rate limiting, logging, retries and fallbacks,
   and holds the upstream keys so the Worker never does); `version: 0.1.0`;
   `type: cloud-service`; `category: ai-gateway`; the `capability` comment per
   D5; `kind: cloud-provider`; `axis: backing`; no `artifact:`; `harness:` per
   D14 — `health` (the gateway is a proxy: a probe through it measures the
   gateway plus the upstream; what the analytics endpoint or a cached request
   can prove instead), `e2e_staging` (a gateway per environment so logs and
   caches never mix; the suite hits the staging gateway, and the cache means a
   suite can pass on stale answers — name the trap and the cache-bypass header
   or setting as stated), `local_stack` (a gateway is a URL: local dev calls the
   real gateway — no local form, and what a project stubs instead).
2. **`conventions.md`** — what AI Gateway is (a plane in front of model calls,
   provider-agnostic); the two ways a Worker reaches it — the gateway URL form
   per upstream provider, and the `ai` binding's gateway option for Workers AI —
   as verified, as shapes the project writes (D3); the features and their
   defaults (cache, rate limits, logging and what is logged, fallbacks,
   retries); authenticated gateways and the gateway token; stored provider keys
   (BYOK) — where the upstream key lives and that it is a secret under the
   provider's secrets doctrine (cite identity-and-iam; D15 — never a plan-D pack
   name); what this pack does not cover (Workers AI itself, AI Search; one
   pointer sentence to the provider conventions for scope).
3. **`skills/cloudflare-ai-gateway/SKILL.md`** — the router, sibling's
   frontmatter shape, five-row table.
4. **`skills/cloudflare-ai-gateway/references/`** — D12's five:
   - `pick-and-trade.md` — the gateway with Workers AI vs the gateway alone in
     front of a third-party provider (a product hosted on Cloudflare compute
     that uses no Workers AI still wants the gateway — say so, and note the
     Parked item that a product hosted elsewhere has no clean pin); the gateway
     vs calling providers directly (observability and cost control vs one more
     hop); when to bypass the cache.
   - `service-doctrine.md` — gateway-per-environment naming, the URL and binding
     shapes, cache policy per route (TTL, bypass, what is safe to cache), rate
     limits, fallback chains and how a fallback changes the model the product
     actually used (log it), logging and PII (what not to log), evaluations if
     Cloudflare offers them today — verified.
   - `cost-shape.md` — the gateway's own pricing (free / paid features as
     stated), that upstream costs remain the provider's, and how caching changes
     the bill; cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for AI Gateway (verified),
     the gateway authentication token, stored provider keys as secrets under the
     provider's doctrine (D15), pointer to identity-and-iam.
   - `local-dev.md` — no local form; local dev calls the real staging gateway or
     stubs the call at the seam; `wrangler` has no gateway subcommand (verify);
     pointer to the provider's local-development-map row.
5. **`plugins/stackgen/stacks/bundles/cloudflare-ai-gateway.md`** — frontmatter
   `name: Cloudflare AI Gateway`, `axis: backing`, `kind: cloud-provider`, two
   components; no `artifact:`. Body in the `gcp-cloud-sql.md` register: a
   heading `# Backing — Cloudflare AI Gateway`, what the composition is and why
   two components (provider facts written once, cited by the service), what
   pinning it gives a project, a sentence that it pins beside other backing
   bundles since the axis is a list (cite `vwf-config.md`'s wording), and one
   sentence that it composes with or without `cloudflare-workers-ai`.

## Verification

- `ls plugins/stackgen/stacks/cloud-service/ai-gateway/skills/cloudflare-ai-gateway/references/`
  is exactly D12's five.
- `find plugins/stackgen/stacks/cloud-service/ai-gateway -name config` is empty.
- `grep -n '^category: ai-gateway$' …/ai-gateway/pack.yaml` hits once;
  `grep -c '^capability:' pack.yaml` is 0 and the comment is present.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-ai-gateway.md`
  is 0.
- `grep -rn 'secrets-store\|Secrets Store' plugins/stackgen/stacks/cloud-service/ai-gateway`
  is empty (D15: the secrets doctrine is the provider's, never a plan-D pack).
- `mise run plugins:check` exits 0; `plugins:inventory --check` fails with
  exactly your two rows (expected).
- No repo names, account ids, domains or real gateway ids; every reference cites
  a `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**`, any other
  pack, any other bundle, any doc, `inventory.md`, `plugin.json`.
- Do not create a `config/` tier (D3). Do not create a sixth reference (D12).
- Do not name a mise task this pack does not ship (D14). Do not restate the
  credential names or the account-level cost shape — cite the provider (D15).
- Do not name plan D's Secrets Store pack or bundle anywhere (D15).
- Do not write Workers AI or AI Search doctrine — U2's and U4's.
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write such lines with Write and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids or domains in shipped files.

## Commit

`feat(stackgen): add the AI Gateway pack and the cloudflare-ai-gateway bundle` —
written by the orchestrator after the wave gate, not by the unit.
