# U2 — The `cloud-service/durable-objects` pack and the `cloudflare-durable-objects` bundle

- **Wave:** 2
- **Depends on:** U1 (the narrowed provider scope you cite)
- **Owns:** `plugins/stackgen/stacks/cloud-service/durable-objects/**` (all new)
  and `plugins/stackgen/stacks/bundles/cloudflare-durable-objects.md` (new).
  Touch nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling whose `capability` is **unset** with a
  comment — the shape you reuse: `pack.yaml` fields, one reference per topic,
  the router table, the citation seam to the provider);
  `plugins/stackgen/stacks/cloud-service/kv/**` and
  `plugins/stackgen/stacks/cloud-service/d1/**` (plan A's packs — the two stores
  your pick-and-trade places Durable Objects against; cite them by path, never
  restate); `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `plugins/stackgen/stacks/bundles/cloudflare-kv.md` (bundle frontmatter and
  prose register; a backing bundle has no `artifact:` key);
  `plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md` and
  `skills/cloudflare/references/*.md` as U1 left them (what you cite, never
  restate); `plugins/stackgen/assets/kinds.md:186-281` (the five service
  topics); `plugins/stackgen/assets/pack-format.md:144-234` (`pack.yaml` fields
  and the bundle file); `plugins/stackgen/assets/taxonomy.md` (the
  `stateful-compute` token plan A minted, and the "no capability token today"
  paragraph that names it).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` for every Durable
  Objects fact (fallback `/cloudflare/cloudflare-docs`).

## Ruling

B2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`name: Cloudflare <Service>`. Three are `axis: backing` with **no `artifact:`
key**." Durable Objects is one of the three.

B3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md`." Durable Objects
ships none.

B5: "Durable Objects and Containers cite none" of the contracts.

B6: "Durable Objects … **unset** with the zero-trust comment shape
(`stateful-compute` … carr[ies] no vwf token)." Rejected: `realtime-sync`.

B8: "Router skill directory and `name:` are `cloudflare-<slug>`:
`cloudflare-durable-objects`." The pack directory is `durable-objects`.

B9: "Backing packs: exactly five, named `pick-and-trade.md`,
`service-doctrine.md`, `cost-shape.md`, `identity-shape.md`, `local-dev.md`."

B10: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` (falling back to
`/cloudflare/cloudflare-docs`) at authoring time and cited by URL in the
reference that states it. No fact from memory."

B11: "`harness:` carries `health`, `e2e_staging`, `local_stack`, each
`task: n/a` with honest mechanism prose, as `zero-trust-access/pack.yaml:14-41`
… do[es]."

B12: "Packs **cite** the provider pack's identity-and-iam reference for the API
token and account id and never restate them."

B13: "Every new pack and bundle is `0.1.0`."

From plan A's decisions doc, the reason the category is not `object-storage`: a
per-key durable object is compute with state, not blob storage; pick-and-trade
never compares Durable Objects with R2 as alternatives.

Plan facts, to verify, not trust: the binding is
`durable_objects.bindings:
[{name, class_name}]` plus a `migrations` entry
(`new_sqlite_classes` for SQLite-backed storage) because the class lives in the
Worker script; one object per id, single-threaded; a storage API, alarms,
WebSocket hibernation; `wrangler dev` runs them locally.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Durable Objects`; a `summary` in the
   sibling's voice (stateful serverless: one addressable object per id with its
   own strongly consistent SQLite storage, single-threaded execution, alarms and
   WebSocket coordination — the place a product puts state that must be
   consistent per key, not the cache and not the shared database);
   `version: 0.1.0`; `type: cloud-service`; `category: stateful-compute`; the
   `capability` comment per B6 (three lines in the zero-trust shape, naming
   `stateful-compute` as the token-less category and that minting is vwf's
   move); `kind: cloud-provider`; `axis: backing`; **no `artifact:`**;
   `harness:` per B11 — `health` (an object has no endpoint of its own; the
   consuming Worker's readiness path fetches a known object and reports the
   round trip, and what that does and does not prove), `e2e_staging` (the class
   and its migration live in the Worker, so the environment is the Worker's — a
   staging Worker has its own objects; never a shared namespace with an id
   prefix), `local_stack` (`wrangler dev` runs Durable Objects locally with
   persisted state — where it lives, and the trap that local alarms and
   hibernation behave as verified).
2. **`conventions.md`** — the component's prose, copied verbatim into the
   template payload: what Durable Objects are and are not (not a database shared
   across requests — D1; not a cache — KV; cite both plan-A packs by path); the
   binding block (`durable_objects.bindings` with `name` and `class_name`, plus
   the `migrations` entry) as the shape the project adds to the Workers pack's
   `wrangler.jsonc` (B3), with a sentence that the class must be exported from
   the Worker script named by `main`; id design (`idFromName` vs `newUniqueId`,
   and why a name is a contract); the single-threaded guarantee and what it
   buys; the storage API and its transactional semantics as stated; alarms;
   WebSocket hibernation; the scope sentence — one pointer to the provider
   conventions for what Cloudflare services stackgen offers (never the list
   itself). Cite the provider doctrine for cost and identity; never restate.
3. **`skills/cloudflare-durable-objects/SKILL.md`** — the router, frontmatter in
   the sibling's exact shape (`name: cloudflare-durable-objects`,
   `version: 0.1.0`, `category: development`, `description`, `license: MIT`,
   `allowed-tools`), model-invocable, not paths-scoped. The "read one, not all"
   table with five rows, one per reference.
4. **`skills/cloudflare-durable-objects/references/`** — the five files of B9:
   - `pick-and-trade.md` — Durable Objects over KV (read-after-write and
     counters vs eventual reads), over D1 (per-key state vs shared relational
     data), over Workflows (a long-lived coordinator vs a durable multi-step run
     — cite U3's pack by path, do not restate), over an external store; the
     per-object throughput ceiling and what it means for hot keys; when Durable
     Objects are the wrong answer.
   - `service-doctrine.md` — class design (one responsibility per class), id
     design and the name-as-contract rule, the binding and migration block,
     storage API idioms (transactions, `blockConcurrencyWhile`, SQLite schema
     inside an object), alarms as the scheduler, WebSocket hibernation and its
     cost shape, location hints as stated, versioning a class (migrations:
     rename, delete, and why deleting is irreversible).
   - `cost-shape.md` — the pricing dimensions (requests, duration, storage, rows
     read/written for SQLite-backed objects) as Context7 states them today, the
     free-tier line, and the hibernation note; cite the provider's cost-doctrine
     for the account-level shape.
   - `identity-shape.md` — the API-token permission a deploy needs (verified
     name), the binding as the only runtime identity (no id in code), and a
     pointer to the provider's identity-and-iam for the token and account-id
     rule (B12).
   - `local-dev.md` — `wrangler dev`'s local Durable Objects, where state
     persists, `--remote` and its trap, how alarms fire locally, resetting local
     state between test runs; one sentence pointing at the provider's
     local-development-map row. Each reference individually researched against
     Context7 and cited by URL.
5. **`plugins/stackgen/stacks/bundles/cloudflare-durable-objects.md`** —
   frontmatter exactly: `name: Cloudflare Durable Objects`, `axis: backing`,
   `kind: cloud-provider`, `components:` the two refs of B2; no `artifact:`, no
   `platforms:`, no `unconditional:`. Body in the `cloudflare-kv.md` register: a
   heading `# Backing — Cloudflare Durable Objects`, what the composition is and
   why two components (provider facts written once, cited by the service), what
   pinning it gives a project, a sentence that the class lives in the project's
   Worker so this pin expects a Workers deploy pin beside it
   (`cloudflare-workers-ssr` or `cloudflare-containers`), and a sentence that it
   pins beside other backing bundles since the axis is a list (cite
   `vwf-config.md`'s wording, do not paraphrase into a new rule).

## Verification

- `ls plugins/stackgen/stacks/cloud-service/durable-objects/skills/cloudflare-durable-objects/references/`
  is exactly the five names of B9.
- `find plugins/stackgen/stacks/cloud-service/durable-objects -name config` is
  empty.
- `grep -n '^category: stateful-compute$' plugins/stackgen/stacks/cloud-service/durable-objects/pack.yaml`
  hits once; `grep -c '^capability:' pack.yaml` is 0 and
  `grep -c 'capability' pack.yaml` ≥ 1 (the comment).
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-durable-objects.md`
  is 0.
- `grep -rn 'object-storage\|R2' plugins/stackgen/stacks/cloud-service/durable-objects`
  — no hit frames R2 as an alternative to Durable Objects.
- `mise run plugins:check` exits 0 (rule 4 on `SKILL.md`; rule 12 vocabulary).
- `mise run plugins:inventory --check` **fails** with a diff that is exactly
  your new pack row and bundle row — expected; do not regenerate (U7's).
- `grep -rn "95octane\|virajp\|claude-plugins\|<account" plugins/stackgen/stacks/cloud-service/durable-objects plugins/stackgen/stacks/bundles/cloudflare-durable-objects.md`
  is empty.
- Every reference contains at least one `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**` (plan A's or
  nobody's), any other pack, any other bundle, any doc, `inventory.md`,
  `plugin.json`.
- Do not create a `config/` tier (B3). Do not create a sixth reference (B9).
- Do not name a mise task this pack does not ship (B11). Do not restate the
  credential names or the account-level cost shape — cite the provider (B12).
- Do not write Workflows, Containers or Agents SDK doctrine — U3, U5 and plan C
  own those; a pointer by path is the most you write.
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write `pnpm exec wrangler` / `npx wrangler` lines with
  Write, and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids or domains in shipped files.
- Never run `git checkout`, `git restore`, `git stash` or a formatter `--fix`
  outside your owned paths.

## Commit

`feat(stackgen): add the Durable Objects pack and the cloudflare-durable-objects bundle`
— written by the orchestrator after the wave gate, not by the unit.
