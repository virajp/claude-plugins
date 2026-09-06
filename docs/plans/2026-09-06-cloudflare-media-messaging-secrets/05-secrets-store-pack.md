# U5 — The `cloud-service/secrets-store` pack and the `cloudflare-secrets-store` bundle

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/cloud-service/secrets-store/**` (all new)
  and `plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md` (new). Touch
  nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling whose `capability` is unset with a
  comment); `plugins/stackgen/stacks/capability-provider/fnox/**` top to bottom
  (the **other** `secrets-manager` pack — you cite it and define the seam with
  it; you do not edit it); `plugins/stackgen/assets/contracts/secrets.md` (the
  contract you cite clause by clause);
  `plugins/stackgen/stacks/cloud-service/r2/**` or another plan A pack (a
  contract-citing Cloudflare pack — how `r2` cites `object-storage.md`; match
  the seam); `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as
  U1 left it (in particular its identity-and-iam and any secrets doctrine it
  carries — you cite, never restate);
  `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`, `:266-267`;
  `plugins/stackgen/assets/taxonomy.md` (the `secrets-manager` token on the
  `cloud-service` line and U1-of-plan-A's note that the same word under
  `capability-provider` means the developer-side provider).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every Secrets
  Store fact (fallback `/cloudflare/cloudflare-docs`).

## Ruling

D5, the user's ruling verbatim: "Secrets Store is NOT for development
environment but for Cloud Environment where applications run in production or
staging". The plan's reading: "A `cloud-service` pack, category
`secrets-manager`, backing axis, for the runtime environment only. … It coexists
with `capability-provider/fnox`; the pack's `capability` comment and the bundle
prose both say so." Rejected: a `capability-provider` pack (a second init-time
secrets provider — it has no laptop-side injection and cannot feed pre-commit or
mise tasks); folding into the provider pack.

The user's reason for including it: "it will be required if hosting containers
in CloudFlare or even Workers."

D2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D4: "Secrets Store → `assets/contracts/secrets.md`, clause by clause, stating
that the Workers binding is the process-boundary injection the rule demands and
naming the one place the model differs." The contract's cardinal rule: "A secret
reaches a process as an environment variable, injected at the process boundary —
never read by the application from a file." and "the injector wraps the task,
not the application". A Workers binding is injected by the runtime at the
process boundary — neither a file nor an SDK compiled into the app; the
difference is that the value is read with `.get()` on the binding rather than
from a shell variable. Say exactly that, then walk the numbered "What a manager
must be able to do" list clause by clause (per-environment sets, fail-not-
fallback, non-interactive CI auth, …) and state for each how Secrets Store
satisfies it or does not.

D6: Secrets Store `capability` **unset** with a comment that says **both**
things: `secrets-manager` has no vwf token today (the zero-trust shape), and
this is the **runtime** binding for a hosted Worker or Container while
`capability-provider/fnox` is the developer-machine and CI provider — the two
coexist and neither replaces the other.

D8: router skill directory and `name:` are `cloudflare-secrets-store`; the pack
directory is `secrets-store`; the bundle is `cloudflare-secrets-store`.

D9: "Exactly five per pack, named for the topics: `pick-and-trade.md`,
`service-doctrine.md`, `cost-shape.md`, `identity-shape.md`, `local-dev.md`. No
sixth file."

D10: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` … at authoring time and cited by URL in the
reference that states it. No fact from memory."

D11: `harness:` with `health`, `e2e_staging`, `local_stack`, each `task: n/a`
with honest mechanism prose.

D12: cite the provider's identity-and-iam reference for the account credential;
`identity-shape.md` states only the per-service permissions (who may create,
edit, read secrets in the store).

D13: version `0.1.0`.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Secrets Store`; `summary` (the
   account-level secrets a hosted Worker or Container reads at run time through
   a binding — staging and production values that never touch the repo, the
   laptop or a per-Worker secret list; the developer-side provider is a
   different tool); `version: 0.1.0`; `type: cloud-service`;
   `category: secrets-manager`; the `capability` comment per D6 (four to six
   lines); `kind: cloud-provider`; `axis: backing`; **no `artifact:`**;
   `harness:` per D11 — `health` (a `.get()` on a known non-sensitive sentinel
   secret from the consuming Worker's readiness path proves the binding and the
   store; say why a real secret is never the probe), `e2e_staging` (the store is
   account-level — verify whether one or many stores exist per account today —
   so environment isolation is by **secret name** or by binding, and the naming
   rule that keeps staging from reading production; state it as Cloudflare's
   model allows, not as a wish), `local_stack` (what `wrangler
   dev` does with
   a `secrets_store_secrets` binding — a local value source such as `.dev.vars`
   or a `--remote` read, verified — and that local values come from the
   developer-side provider, i.e. fnox's injection, never from the store).
2. **`conventions.md`** — the two-tools rule first, in plain words: fnox (or
   whichever `capability-provider` the repo picked at init) holds and injects
   secrets for a developer's machine and for CI; Secrets Store holds the values
   a deployed Worker or Container reads in staging and production. Then: the
   store model (account-level, secrets by name, scopes if Cloudflare defines
   them, verified); the binding block
   (`secrets_store_secrets: [{binding,
   store_id, secret_name}]` as verified)
   as the shape the project adds to the Workers pack's or the Containers pack's
   `wrangler.jsonc` (D3) — cite `stacks/cloud-service/containers/` by path "when
   it exists"; how it differs from per-Worker `wrangler secret put` and when
   each is right; creating and rotating secrets (`wrangler secrets-store …`
   subcommands as verified, and the dashboard); the `secrets.md` contract walked
   as D4 requires; what this pack does not cover (developer-side secrets — fnox;
   TLS keys — the zone; one pointer sentence to the provider conventions for
   scope).
3. **`skills/cloudflare-secrets-store/SKILL.md`** — the router, frontmatter in
   the sibling's exact shape (`name: cloudflare-secrets-store`,
   `version: 0.1.0`, `category: development`, `description`, `license: MIT`,
   `allowed-tools`), model-invocable, not paths-scoped; five-row table.
4. **`skills/cloudflare-secrets-store/references/`** — D9's five:
   - `pick-and-trade.md` — Secrets Store over per-Worker secrets (shared across
     Workers and Containers, rotated once, audited), over environment variables
     in `wrangler.jsonc` (never for secrets), over the developer-side provider
     reaching into production (why that is the wrong tool — the user's ruling in
     the pack's own words); when per-Worker secrets are still fine.
   - `service-doctrine.md` — naming per environment, the binding block, the
     `.get()` read pattern and caching it per request rather than per call,
     rotation (create new, re-point, delete old), permissions, and the contract
     walk of D4.
   - `cost-shape.md` — pricing as stated (whether the store is included with
     Workers paid or has its own dimensions — verify) ; cite the provider's
     cost-doctrine.
   - `identity-shape.md` — the account-level permissions for the store (verified
     role or token scopes: create/edit vs read), the binding as the runtime
     identity, that CI needs no store access to deploy (the binding is
     configuration, not a value), pointer to the provider's identity-and-iam
     (D12).
   - `local-dev.md` — the local behaviour as verified, that local values come
     from fnox's injection, the `.dev.vars` shape if that is Cloudflare's
     answer, the trap of `--remote` reading production; pointer to the
     provider's local-development-map row. Each reference individually
     researched against Context7 and cited by URL.
5. **`plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md`** —
   frontmatter exactly: `name: Cloudflare Secrets Store`, `axis: backing`,
   `kind: cloud-provider`, two `components`; no `artifact:`, no `platforms:`, no
   `unconditional:`. Body in the `gcp-cloud-sql.md` register:
   `# Backing — Cloudflare Secrets Store`, the composition and why two
   components, what pinning it gives a project, the list-axis sentence (cite
   `vwf-config.md`'s wording), and the pairing prose D5 demands: pinned
   **beside** whatever hosts the code (`cloudflare-workers-ssr`,
   `cloudflare-containers` when it exists) and **beside** the repo's
   `capability-provider` secrets pick (`fnox`), never instead of either.

## Verification

- `ls plugins/stackgen/stacks/cloud-service/secrets-store/skills/cloudflare-secrets-store/references/`
  is exactly the five names of D9.
- `find plugins/stackgen/stacks/cloud-service/secrets-store -name config` is
  empty.
- `grep -n '^category: secrets-manager$' …/secrets-store/pack.yaml` hits once;
  `grep -c '^capability:' …/pack.yaml` is 0 and the comment mentions both `fnox`
  and "runtime".
- `grep -rc 'contracts/secrets.md' plugins/stackgen/stacks/cloud-service/secrets-store`
  ≥ 1.
- `grep -rl 'fnox' plugins/stackgen/stacks/cloud-service/secrets-store plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md`
  lists at least `conventions.md`, `pack.yaml` and the bundle.
- `grep -c 'secrets_store_secrets' plugins/stackgen/stacks/cloud-service/secrets-store/conventions.md`
  ≥ 1 (or the verified key, if it differs — then `DECIDED:` says so).
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md`
  is 0.
- `mise run plugins:check` exits 0; `plugins:inventory --check` fails with
  exactly your two rows (expected).
- No repo names, account ids, domains or store ids; every reference cites a
  `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's),
  `capability-provider/fnox/**` (cited, never edited), `assets/**` (nobody's),
  any other pack, any other bundle, any doc, `inventory.md`, `plugin.json`.
- Do not create a `config/` tier (D3). Do not create a sixth reference (D9).
- Do not name a mise task this pack does not ship (D11). Do not restate the
  credential names or the account-level cost shape — cite the provider (D12).
- Do not restate the `secrets.md` contract — cite each clause and say how it is
  met (D4). Do not soften the cardinal rule to fit the binding model; state the
  difference honestly.
- Do not describe Secrets Store as a development-time or CI secrets provider in
  any sentence (D5).
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write `pnpm exec wrangler` / `npx wrangler` lines with
  Write, and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids or domains in shipped files.

## Commit

`feat(stackgen): add the Secrets Store pack — the runtime secrets binding beside fnox — and the cloudflare-secrets-store bundle`
— written by the orchestrator after the wave gate, not by the unit.
