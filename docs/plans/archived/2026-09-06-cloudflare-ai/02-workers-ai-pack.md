# U2 — The `cloud-service/workers-ai` pack and the `cloudflare-workers-ai` bundle

- **Wave:** 2
- **Depends on:** U1 (the narrowed provider scope you cite)
- **Owns:** `plugins/stackgen/stacks/cloud-service/workers-ai/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-workers-ai.md` (new). Touch
  nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling: `pack.yaml` field shape, the
  `capability`-unset comment at `pack.yaml:7-9`, one reference per topic, the
  router table, the citation seam to the provider);
  `plugins/stackgen/stacks/cloud-service/vectorize/**` (plan A's pack, the
  embeddings consumer you cite by path — read, never edit);
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `plugins/stackgen/stacks/bundles/gcp-cloud-sql.md` (bundle frontmatter and
  prose register; the backing one has no `artifact:` key);
  `plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md` and
  `skills/cloudflare/references/*.md` as U1 left them (what you cite, never
  restate); `plugins/stackgen/assets/kinds.md:186-281` (the five service
  topics); `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `inference` token and the
  token-less paragraph).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every Workers AI
  fact (fallback `/cloudflare/cloudflare-docs`), including the changelog entry
  on planned model deprecations.

## Ruling

D2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D4: Workers AI cites no contract — `inference` has no contract and no token.

D5: `capability` **unset** with the zero-trust comment shape (`inference` has no
vwf token today).

D11: router skill directory and `name:` are `cloudflare-workers-ai`; the pack
directory is `workers-ai`.

D12: "Exactly five [references] per pack, named for the topics:
`pick-and-trade.md`, `service-doctrine.md`, `cost-shape.md`,
`identity-shape.md`, `local-dev.md`. No sixth file."

D13: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` (falling back to
`/cloudflare/cloudflare-docs`) at authoring time and cited by URL in the
reference that states it. No fact from memory."

D14: `harness:` with `health`, `e2e_staging`, `local_stack`, each `task: n/a`
with honest mechanism prose. No task is invented.

D15: cite the provider pack's identity-and-iam reference for the API token and
account id; state only the per-service token permission here.

D16: "No Workers AI model id is written as doctrine anywhere in this plan's
packs. A reference may quote a model id **as a cited example from Cloudflare's
own docs**, marked as such, next to the sentence on tracking deprecations."

D17: version `0.1.0`.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Workers AI`; a `summary` in the sibling's
   voice (serverless inference on a catalog of open models, reached from a
   Worker through a binding — text, embeddings, vision, speech — the product's
   inference provider when the model it needs is in the catalog and the data
   should not leave the edge); `version: 0.1.0`; `type: cloud-service`;
   `category: inference`; the `capability` comment per D5 (three lines in the
   zero-trust shape, naming `inference` as the token-less category);
   `kind: cloud-provider`; `axis: backing`; **no `artifact:`**; `harness:` per
   D14 — `health` (an inference call is expensive and non-deterministic, so the
   probe is the binding's presence plus a model-list or a minimal fixed-input
   call to a cheap model — state which and what it proves), `e2e_staging` (the
   same binding in every environment; isolation is by the product, not the
   service; the cost trap of running a suite against real inference and the mock
   seam the suite uses instead), `local_stack` (whether `wrangler dev` calls the
   remote service and bills — verify and state exactly, with the URL).
2. **`conventions.md`** — the component's prose, copied verbatim into the
   template payload: what Workers AI is for and is not for; the binding block
   (`ai: {binding}`) as the shape the project adds to the Workers pack's
   `wrangler.jsonc` (D3); the REST alternative and when a non-Worker caller uses
   it; how to pick a model (task, context length, cost tier, licence) and how to
   track deprecations (the changelog, the per-model deprecation dates, pinning
   the id in one place in the codebase) — with a cited example model id marked
   as an example (D16); the pairing with Vectorize for embeddings (cite
   `stacks/cloud-service/vectorize/` by path); what this pack does not cover (AI
   Gateway for caching and third-party providers, AI Search for managed
   retrieval — its siblings in this plan; one pointer sentence to the provider
   conventions for scope, never the list itself). Cite the provider doctrine for
   cost and identity; never restate.
3. **`skills/cloudflare-workers-ai/SKILL.md`** — the router, frontmatter in the
   sibling's exact shape (`name: cloudflare-workers-ai`, `version: 0.1.0`,
   `category: development`, `description`, `license: MIT`, `allowed-tools`),
   model-invocable, not paths-scoped. The "read one, not all" table with five
   rows.
4. **`skills/cloudflare-workers-ai/references/`** — D12's five:
   - `pick-and-trade.md` — Workers AI vs a third-party provider through AI
     Gateway (catalog coverage, latency, data residency, cost), vs running the
     model elsewhere; when the catalog does not have the model the product needs
     and the honest answer is "not this pack".
   - `service-doctrine.md` — the binding block, `env.AI.run` call shapes as
     documented (streaming, structured output where offered), model selection
     and pinning, deprecation tracking (D16), rate limits and concurrency as
     stated, prompt and output handling as judgment (log prompts? never with PII
     — the reason), and the seam a product keeps so a model swap is one edit.
   - `cost-shape.md` — the pricing unit (neurons, or whatever Cloudflare states
     today), the free allocation, per-model price classes; cite the provider's
     cost-doctrine.
   - `identity-shape.md` — the API-token permission for Workers AI (verified
     name) for the REST path, the binding as the only runtime identity, pointer
     to the provider's identity-and-iam (D15).
   - `local-dev.md` — `wrangler dev` behaviour (remote call and billing — as
     verified), the mock seam for tests, `wrangler ai` subcommands the loop
     uses; one sentence pointing at the provider's local-development-map row.
     Each reference individually researched against Context7 and cited by URL.
5. **`plugins/stackgen/stacks/bundles/cloudflare-workers-ai.md`** — frontmatter
   exactly: `name: Cloudflare Workers AI`, `axis: backing`,
   `kind: cloud-provider`, `components:` the two refs of D2; no `artifact:`, no
   `platforms:`, no `unconditional:`. Body in the `gcp-cloud-sql.md` register: a
   heading `# Backing — Cloudflare Workers AI`, what the composition is and why
   two components (provider facts written once, cited by the service), what
   pinning it gives a project, and a sentence that it pins beside other backing
   bundles since the axis is a list (cite `vwf-config.md`'s wording, do not
   paraphrase into a new rule).

## Verification

- `ls plugins/stackgen/stacks/cloud-service/workers-ai/skills/cloudflare-workers-ai/references/`
  is exactly the five names of D12.
- `find plugins/stackgen/stacks/cloud-service/workers-ai -name config` is empty.
- `grep -n '^category: inference$' plugins/stackgen/stacks/cloud-service/workers-ai/pack.yaml`
  hits once; `grep -c '^capability:' pack.yaml` is 0 and
  `grep -c 'capability' pack.yaml` ≥ 1 (the comment).
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-workers-ai.md`
  is 0.
- `grep -rn '@cf/' plugins/stackgen/stacks/cloud-service/workers-ai` — every hit
  sits next to the word "example" and a `developers.cloudflare.com` URL (D16).
- `mise run plugins:check` exits 0 (rule 4 on `SKILL.md`; rule 12 vocabulary).
- `mise run plugins:inventory --check` **fails** with a diff that is exactly
  your new pack row and bundle row — expected; do not regenerate (U8's).
- `grep -rn "95octane\|virajp\|claude-plugins\|<account" plugins/stackgen/stacks/cloud-service/workers-ai plugins/stackgen/stacks/bundles/cloudflare-workers-ai.md`
  is empty.
- Every reference contains at least one `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**` (nobody's in
  this plan), any other pack, any other bundle, any doc, `inventory.md`,
  `plugin.json`.
- Do not create a `config/` tier (D3). Do not create a sixth reference (D12).
- Do not name a mise task this pack does not ship (D14). Do not restate the
  credential names or the account-level cost shape — cite the provider (D15).
- Do not write a recommended-models table or a model id as doctrine (D16).
- Do not write AI Gateway or AI Search doctrine — U3's and U4's.
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write `pnpm exec wrangler` / `npx wrangler` lines with
  Write, and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids or domains in shipped files.

## Commit

`feat(stackgen): add the Workers AI pack and the cloudflare-workers-ai bundle` —
written by the orchestrator after the wave gate, not by the unit.
