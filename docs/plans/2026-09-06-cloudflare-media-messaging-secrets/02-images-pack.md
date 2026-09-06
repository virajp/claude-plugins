# U2 — The `cloud-service/images` pack and the `cloudflare-images` bundle

- **Wave:** 2
- **Depends on:** U1 (the narrowed provider scope you cite)
- **Owns:** `plugins/stackgen/stacks/cloud-service/images/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-images.md` (new). Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling: `pack.yaml` field shape, the
  `capability` deliberately-unset comment, one reference per topic, the router
  table, the citation seam to the provider); one of plan A's packs, e.g.
  `plugins/stackgen/stacks/cloud-service/r2/**` (the pack you pair with, and the
  `skills/cloudflare-<slug>/` naming);
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md`, `cloudflare-r2.md`
  and `gcp-cloud-sql.md` (bundle frontmatter and prose register; a backing
  bundle has no `artifact:` key);
  `plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md` and
  `skills/cloudflare/references/*.md` as U1 left them (what you cite, never
  restate); `plugins/stackgen/assets/kinds.md:186-281` (the five service
  topics); `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `media` token and the "no
  capability token today" paragraph).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every Images
  fact (fallback `/cloudflare/cloudflare-docs`).

## Ruling

D2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D4: Images cites no contract.

D6: Images `capability` **unset** with the zero-trust comment shape (`media` has
no vwf token today).

D8: router skill directory and `name:` are `cloudflare-images`; the pack
directory is `images`; the bundle is `cloudflare-images`.

D9: "Exactly five per pack, named for the topics: `pick-and-trade.md`,
`service-doctrine.md`, `cost-shape.md`, `identity-shape.md`, `local-dev.md`. No
sixth file." Images' storage side is a **section**, not a file.

D10: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` … at authoring time and cited by URL in the
reference that states it. No fact from memory." Image Resizing → Images is
stated once, verified.

D11: `harness:` with `health`, `e2e_staging`, `local_stack`, each `task: n/a`
with honest mechanism prose.

D12: cite the provider's identity-and-iam reference for credentials; state only
the per-service token permission here. Signing keys for signed URLs are secrets
under the provider's secrets doctrine; point at the Secrets Store pack by path
(`stacks/cloud-service/secrets-store/`, landing in this same wave) as the
runtime home.

D13: version `0.1.0`.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Images`; a `summary` in the sibling's
   voice (transform, optimize and deliver images at the edge — from objects the
   product already stores or from Images' own storage — the media layer a site
   or app reads rather than a bucket it writes); `version: 0.1.0`;
   `type: cloud-service`; `category: media`; the `capability` comment per D6
   (three lines in the zero-trust shape, naming `media` as the token-less
   category); `kind: cloud-provider`; `axis: backing`; **no `artifact:`**;
   `harness:` per D11 — `health` (a transformation URL for a known source image
   fetched from the consuming project's readiness path, and what a failure
   proves: the zone setting, the binding, or the origin), `e2e_staging`
   (transformations are per zone; Images storage is per account — say what
   isolates an environment, verified: a separate zone or hostname, a variant
   naming rule, or nothing, honestly), `local_stack` (what `wrangler dev` does
   with an `images` binding — local transformation or remote — verified).
2. **`conventions.md`** — the component's prose, copied verbatim into the
   template payload: the two products under one name (transformations on a zone,
   via URL or via the Worker binding; Images storage with variants, signed URLs
   and direct creator upload) and that Image Resizing is the older name for the
   first; the binding block (`images: {binding}` as verified) as the shape the
   project adds to the Workers pack's `wrangler.jsonc` (D3); the pairing rule —
   origin objects live in R2 (cite `stacks/cloud-service/r2/` by path) or in
   Images storage, and when each; what this pack does not cover (video — Stream
   is declined; general object storage — R2) with one pointer sentence to the
   provider conventions for scope. Cite the provider doctrine for cost and
   identity; never restate.
3. **`skills/cloudflare-images/SKILL.md`** — the router, frontmatter in the
   sibling's exact shape (`name: cloudflare-images`, `version: 0.1.0`,
   `category: development`, `description`, `license: MIT`, `allowed-tools`),
   model-invocable, not paths-scoped. The "read one, not all" table with five
   rows.
4. **`skills/cloudflare-images/references/`** — D9's five:
   - `pick-and-trade.md` — transformations over pre-rendered variants in R2,
     Images storage over R2 as the origin, the binding over URL transformations;
     where Images is the wrong answer (video, non-image assets, a framework's
     own image pipeline already in place).
   - `service-doctrine.md` — enabling transformations on a zone, the URL and
     binding forms and their options as stated (fit, width, format, quality),
     caching behaviour, source restrictions and allowed origins, the storage
     side as a section (upload paths, variants, signed URLs, direct creator
     upload, the metadata model), the binding block.
   - `cost-shape.md` — pricing dimensions as stated (unique transformations,
     stored images, delivered images) and the free allowance; cite the
     provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for Images (verified), the
     signing key for signed URLs as a secret (D12), the binding as runtime
     identity; pointer to the provider's identity-and-iam.
   - `local-dev.md` — the local or remote behaviour as verified, a fixture image
     for tests, the trap that a zone-level setting cannot be reproduced locally;
     pointer to the provider's local-development-map row. Each reference
     individually researched against Context7 and cited by URL.
5. **`plugins/stackgen/stacks/bundles/cloudflare-images.md`** — frontmatter
   exactly: `name: Cloudflare Images`, `axis: backing`, `kind: cloud-provider`,
   `components:` the two refs of D2; no `artifact:`, no `platforms:`, no
   `unconditional:`. Body in the `gcp-cloud-sql.md` register: a heading
   `# Backing — Cloudflare Images`, what the composition is and why two
   components (provider facts written once, cited by the service), what pinning
   it gives a project, a sentence that it pins beside other backing bundles
   since the axis is a list (cite `vwf-config.md`'s wording, do not paraphrase
   into a new rule), and the pairing sentence: an Images pin usually sits beside
   an R2 pin for the origin objects.

## Verification

- `ls plugins/stackgen/stacks/cloud-service/images/skills/cloudflare-images/references/`
  is exactly the five names of D9.
- `find plugins/stackgen/stacks/cloud-service/images -name config` is empty.
- `grep -n '^category: media$' plugins/stackgen/stacks/cloud-service/images/pack.yaml`
  hits once; `grep -c '^capability:' …/pack.yaml` is 0 and the comment is
  present.
- `grep -c 'Image Resizing' -r plugins/stackgen/stacks/cloud-service/images` ≥ 1
  (the rename, stated).
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-images.md`
  is 0.
- `mise run plugins:check` exits 0 (rule 4 on `SKILL.md`; rule 12 vocabulary).
- `mise run plugins:inventory --check` **fails** with a diff that is exactly
  your new pack row and bundle row — expected; do not regenerate (U7's).
- `grep -rn "95octane\|virajp\|claude-plugins\|<account" plugins/stackgen/stacks/cloud-service/images plugins/stackgen/stacks/bundles/cloudflare-images.md`
  is empty.
- Every reference contains at least one `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**` (nobody's), any
  other pack, any other bundle, any doc, `inventory.md`, `plugin.json`.
- Do not create a `config/` tier (D3). Do not create a sixth reference (D9).
- Do not name a mise task this pack does not ship (D11). Do not restate the
  credential names or the account-level cost shape — cite the provider (D12).
- Do not write Stream or video doctrine — Stream is retired.
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write `pnpm exec wrangler` / `npx wrangler` lines with
  Write, and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids or domains in shipped files.

## Commit

`feat(stackgen): add the Images pack and the cloudflare-images bundle` — written
by the orchestrator after the wave gate, not by the unit.
