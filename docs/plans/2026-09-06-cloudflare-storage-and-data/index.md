---
type: repo-plan
title: Cloudflare storage and data — the taxonomy for all twenty services, and
  the seven storage/data packs (KV, R2, D1, Hyperdrive, Vectorize, Pipelines,
  Analytics Engine)
requires: []
---

# Plan — Cloudflare storage and data (2026-09-06)

Plan **A of four**. The three that follow stand on this one:
`docs/plans/2026-09-06-cloudflare-compute-and-orchestration` (B),
`docs/plans/2026-09-06-cloudflare-ai` (C, requires A and B) and
`docs/plans/2026-09-06-cloudflare-media-messaging-secrets` (D). Together they
ship twenty Cloudflare services as stackgen packs. This plan alone owns the
taxonomy edit for all twenty, so B, C and D never touch
`plugins/stackgen/assets/`.

## Status

**RUNNING** — started 2026-09-07 by `/execute-plan`. Worktree:
`.worktrees/2026-09-06-cloudflare-storage-and-data`, branch
`2026-09-06-cloudflare-storage-and-data`, cut from `develop` at `31cbf003`.

## Consent

| Action                                       | Granted |
| -------------------------------------------- | ------- |
| Merge to `develop` and push on green run     | yes     |
| Stage locally (`plugins:local`) on green run | yes     |
| Release `vwf` publicly                       | none    |
| Release `stackgen` publicly                  | none    |
| Release installer publicly                   | none    |
| Release site publicly                        | none    |

**A release is two stages.** The local one — `mise run plugins:local` — stages
the changed plugins into the dev marketplace and updates this machine's install;
it publishes nothing, so execute-plan runs it without a further prompt and only
reports what it staged. The public one is the tags, and it is what the release
rows above are about: they are intent, and execute-plan stops once before the
`main` merge and the tags and asks, per `CLAUDE.md`. A staged plugin loads only
in a **restarted** session. The user's answer for stackgen was "not this time":
the version still climbs to `1.3.0` so the dev marketplace stages it, but no
`stackgen-v1.3.0` tag is cut by this plan. Note for the eventual `main` merge:
`plugins.yml`'s "every marketplace ref names a tag" step runs on `main` only and
will want that tag then — that is the release step, not this plan's.

## Goal

After this lands, seven Cloudflare storage and data services — Workers KV, R2
(with R2 Data Catalog and R2 SQL folded in as references), D1, Hyperdrive,
Vectorize, Pipelines and Analytics Engine — are shipped `cloud-service` packs
under `plugins/stackgen/stacks/cloud-service/`, each reachable from the stack
menu as its own backing-axis bundle `cloudflare-<slug>`, so a project pinning
one gets a curated copy instead of a generator run. The taxonomy carries every
category token the twenty services across plans A–D need, minted once here. The
Cloudflare provider pack's scope prose names what ships, what plans B–D will
ship, and what is declined.

The framing: on 2026-09-05 a greenfield `/vwf:init` on the user's new website
repo was blocked because stackgen had no Cloudflare hosting stack; the Workers
Static Assets and Workers SSR packs redeemed that, and each left a reservation
list — "Pages, R2, D1, KV, Durable Objects, Queues, Images and Stream … planned
under their own effort". The user then asked for **all** Cloudflare developer
platform services, briefed service by service, and chose twenty. The user chose
four chained plans over one plan with capped waves, for smaller orchestrator
context and review surface per run, accepting four bumps and four landings.

**Reversal, confirmed by the user.** Two decisions docs
(`docs/memory/decisions/2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md`
and `2026-09-06-workers-ssr-redeems-the-script-reservation.md`) reserve
**Pages** and **Stream** by name. Both are **retired**, not deferred: Cloudflare
steers new projects to Workers Static Assets and says Pages only "remains
supported"; Stream was declined by the user when offered. The docs unit writes
`docs/memory/decisions/2026-09-06-pages-and-stream-leave-the-reservation.md`.

## Facts the survey established

**This repo.**

- stackgen is `1.2.1`, vwf `19.14.0`. `develop` is at `013b24a4`, clean. The
  inventory header reads 42 packs, 38 bundles, 12 kinds
  (`plugins/stackgen/stacks/inventory.md:10`).
- Cloudflare coverage today: `stacks/cloud-provider/cloudflare/` (v0.1.0, no
  `axis:` — composes on both axes, `pack.yaml:7-10`),
  `stacks/cloud-service/workers-static-assets/` (`static-hosting`, deploy,
  `artifact: static-assets`), `stacks/cloud-service/workers-ssr/` (`compute`,
  deploy, `artifact: worker-script`), `stacks/cloud-service/zero-trust-access/`
  (`access`, deploy, `artifact: n/a`), and the bundles
  `stacks/bundles/cloudflare-workers-static.md`, `cloudflare-workers-ssr.md`,
  `cloudflare-zero-trust.md`. GCP has nine `cloud-service` packs; the backing
  ones (`cloud-sql`, `firestore`, `firebase-storage`) are the shape this plan's
  packs take.
- **Backing-service packs ship no `config/`.** `cloud-sql`, `firestore`,
  `firebase-storage`, `zero-trust-access` each contain exactly `pack.yaml`,
  `conventions.md`, `skills/<name>/SKILL.md` and five references —
  `pick-and-trade.md`, `service-doctrine.md`, `cost-shape.md`,
  `identity-shape.md`, `local-dev.md`. Only the two deploy-target packs carry a
  `config/` tier (`wrangler.jsonc` + `.config/mise/tasks/p/_project/deploy`).
- The `cloud-provider` kind: provider topics (four) at
  `plugins/stackgen/assets/kinds.md:225-237`; the five service topics at
  `:242-252` (Pick & trade, Service doctrine, Cost shape, Identity shape, Local
  dev); the deploy-target extension (Artifact, Pipeline, Health) at `:254-265`
  fires only for category `compute` or `static-hosting`. Axis follows category
  (`:201-204`): those two → `deploy`, everything else → `backing`. A service
  component cites the provider doctrine rather than restating it (`:198-200`).
  Reference filenames matching topic names is convention in every shipped pack,
  not a stated contract (`:25`, `:205` say only "one artifact per topic").
- The `cloud-service` category list is **closed** and lives at
  `plugins/stackgen/assets/taxonomy.md:94-96`: `compute` / `sql` / `document` /
  `queue` / `object-storage` / `cdn` / `static-hosting` / `access` / `identity`
  / `messaging`. `framework` at `:92-93`, `datastore` at `:97-98` (has
  `key-value` and `vector`), `capability-provider` at `:99-100` (has
  `secrets-manager`). Extending the vocabulary is an explicit reviewed edit,
  never invented by a run (`:9-13`). The four categories with no vwf capability
  token are named at `:120-121` (`cdn`, `secrets-manager`, `access`,
  `static-hosting`); a component in such a category leaves `capability` unset
  with a comment (the shape is `cloud-service/zero-trust-access/pack.yaml:7-9`).
- Capability tokens a cloud-service pack may name are vwf's
  (`plugins/vwf/assets/capability-vocabulary.md:27-41`): among them
  `relational-datastore`, `object-file-storage`, `cache-layer`, `search-index`,
  `durable-workflows`, `message-queue`, `pub-sub`, `email`. Shipped precedent:
  `cloud-sql/pack.yaml:8` `relational-datastore`, `firebase-storage/pack.yaml:9`
  `object-file-storage`, `firestore/pack.yaml:8` `document-datastore`.
- Contracts in `plugins/stackgen/assets/contracts/`: `datastore.md`,
  `identity.md`, `local-stack.md`, `object-storage.md`, `observability.md`,
  `orchestration.md`, `release-trigger.md`, `secrets.md`. Citation is
  conditional — "where it realizes a blueprint capability" (`kinds.md:244`;
  `taxonomy.md:198-201` "instance components cite it and stay thin").
- Bundle shape: `plugins/stackgen/assets/pack-format.md:192-234`. A backing
  bundle has **no `artifact:` key** (`:204`, deploy axis only). The template for
  a per-service Cloudflare bundle is
  `stacks/bundles/cloudflare-zero-trust.md:1-9` (`name`, `axis`,
  `kind: cloud-provider`, two `components`); the backing analogue is
  `stacks/bundles/gcp-cloud-sql.md:1-10`. A bundle's slug is its filename; the
  menu lists every `stacks/bundles/*.md` except `unconditional: true`
  (`skills/stackgen-stack-menu/SKILL.md:28-46`).
- **Both stack axes are lists.** `plugins/vwf/assets/vwf-config.md:72`
  (`backing_template`: "A LIST: one slug per capability the project needs") and
  `:75` (`deploy_template` a list since format 16). So per-service bundles are
  pinned side by side; `gcp-cloud-sql`'s four components were a choice, not a
  workaround.
- The provider pack's service-enumerating passages, all to be edited by U2:
  `stacks/cloud-provider/cloudflare/conventions.md:7-11` (the reservation),
  `:19-20` (the two hosting shapes), `:29-32` (role grants);
  `skills/cloudflare/SKILL.md:11`, `:34-35`, `:43-45` (the scope fence);
  `skills/cloudflare/references/local-development-map.md:8-14` (the service
  table with its catch-all row). The reservation is duplicated in six more
  places: `cloud-service/workers-ssr/conventions.md:136-138`,
  `workers-ssr/skills/workers-ssr/SKILL.md:59`,
  `cloud-service/workers-static-assets/conventions.md:104-106`,
  `workers-static-assets/skills/workers-static-assets/SKILL.md:56`,
  `bundles/cloudflare-workers-ssr.md:103-105`,
  `bundles/cloudflare-workers-static.md:56`,
  `bundles/cloudflare-zero-trust.md:36-40`.
- Skill naming precedent inside a pack: the skill directory may differ from the
  pack slug and is provider-prefixed where the bare name would be ambiguous
  (`cloud-service/firestore/skills/gcp-firestore/`). The router-skill
  frontmatter shape is
  `zero-trust-access/skills/zero-trust-access/SKILL.md:1-12` (`name`, `version`,
  `category: development`, `description`, `license`, `allowed-tools`), followed
  by the "read one, not all" table.

**Gates.**

- `plugins:inventory` (`scripts/src/inventory.ts`) reads every
  `stacks/*/*/pack.yaml` (required: `name`, `summary`, `version`, `kind`;
  `:132-135`), every `stacks/bundles/*.md` frontmatter (required: `name`,
  `kind`, `axis`, `components`; `:168-171`) and the
  `## \`kind\``headings of`assets/kinds.md`; it throws on an undefined kind (`:82-89`). Nothing
  validates`category`against taxonomy.md. Nothing enumerates`artifact:`
  tokens.
- `plugins:check` — twelve rules
  (`.claude/skills/plugin-authoring/references/checks.md`); rule 11
  (`checks.md:87-130`, `scripts/src/check.ts:396-491`) walks only a pack's
  `config/` tier, which no pack in this plan has. Rule 4 strict-YAML frontmatter
  applies to every shipped skill. Rule 12 scans every shipped `.md`/`.yaml` for
  retired vocabulary (`checks.md:198-206`).
- `plugins:shellcheck` walks `config/` and `hooks/` only — nothing in this plan.
- `pnpm vitest run`: `scripts/src/inventory.test.ts:19-63` and
  `check.test.ts:27` read the **real tree** — no fixture to update, but the
  committed inventory must be byte-identical to a fresh render and the tree must
  produce zero findings.
- Pre-commit order on a `plugins/` change: marketplace → inventory → check →
  shellcheck, then the upstream hooks, dprint, the linter, gitleaks. **Wave 1 of
  both earlier Cloudflare plans landed as one commit**, forced by
  `plugins:inventory --check` — expect the same here.
- `dprint.json` excludes `plugins/**/*.md` — pack prose is hand-folded. `cat` is
  aliased to `bat` on this machine: Write/Edit, never heredocs.
- `site:check` runs in `site.yml` only; the docs unit owns `site/**` edits so
  the wave gate adds it for wave 3.

**Docs that describe today's behaviour** (the docs unit's list):

- `site/src/content/docs/plugins/stackgen.md:90` and `:680` ("both Workers
  packs" — still true after this plan, falsified by plan B's Containers; leave),
  `:196` ("no reservations are outstanding" — about kinds, stays true), `:155`
  ("Two framework packs ship today" — plan C's concern);
  `site/src/content/docs/how-to/operate/choosing-your-stack.md:72-78` (the
  Cloudflare service list) and `:85-86`.
- `plugins/stackgen/stacks/readme.md:174-192` — the Wave E narrative; a new wave
  paragraph belongs here.
- `.claude/skills/stackgen-plugin/SKILL.md:87-115` names the Workers packs by
  hand as the `(f)` config-entry precedent — stays true; `:26-27` forbids
  restating counts.
- `readme.md:227-265` (the stackgen paragraph; `:261-265` hand-asserts the
  newest kind — unchanged by this plan), `CLAUDE.md:211` (the stackgen row),
  `.claude/docs/plugins.md:13`.
- `docs/memory/handoff/next.md` is stale (describes init-behind-setup as
  pending); not this plan's to fix — parked.

**Cloudflare, from Context7 (`/websites/developers_cloudflare`, primary;
`/cloudflare/cloudflare-docs` secondary).** Every unit re-verifies before
citing; these are the facts the interview rested on.

- Workers Sites is deprecated in Wrangler v4; Workers Static Assets is "the
  recommended approach for deploying static sites … While Cloudflare Pages
  remains supported, new features and optimizations are primarily focused on
  Workers" — the ground for retiring Pages.
- Wrangler config is `wrangler.jsonc` (or `.toml`) at the repo root with
  `$schema: ./node_modules/wrangler/config-schema.json` and a
  `compatibility_date`. Bindings seen in the docs:
  `kv_namespaces:
  [{binding, id}]`, `r2_buckets: [{binding, bucket_name}]`,
  `d1_databases:
  [{binding, database_name, database_id}]`,
  `hyperdrive: [{binding, id}]`, `vectorize: [{binding, index_name}]`,
  `analytics_engine_datasets:
  [{binding, dataset}]`, `ai: {binding}`,
  `workflows: [{name, binding,
  class_name}]`,
  `durable_objects.bindings: [{name, class_name}]`. Pipelines' key is to be
  verified by its unit.
- Cloudflare's own storage comparison table: KV = "configuration data, service
  routing metadata, personalization"; R2 = objects; Hyperdrive = "connecting to
  an existing database … using your existing database drivers & ORMs"; Durable
  Objects = coordination and strongly consistent storage; D1 = relational;
  Queues = background jobs; Vectorize = embeddings; Pipelines = streaming
  ingestion; Analytics Engine = high-cardinality time-series via Workers and
  SQL.
- R2 Data Catalog (`wrangler r2 bucket catalog …`) and R2 SQL
  (`wrangler r2 sql query [WAREHOUSE] [QUERY]`) exist and are R2 features, hence
  folded into the R2 pack.
- Wrangler has `--x-provision` / `--x-auto-create` experimental flags to
  provision draft bindings; a pack may mention them as experimental, never rely
  on them.

## Assumed decisions — confirm or override at review

| #   | Decision           | Ruling                                                                                                                                                                                                                                                                                                                              | Rejected                                                                                          | Unit                |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------- |
| D1  | Plan split         | "Four chained plans": A (this) taxonomy + storage/data; B compute/orchestration requires A; C AI requires A and B; D media/messaging/secrets requires A. Plan A mints every category token all twenty services need.                                                                                                                | One plan with capped waves; two plans                                                             | all four `index.md` |
| D2  | Category tokens    | Thirteen new `cloud-service` tokens: `key-value`, `stateful-compute`, `orchestration`, `database-proxy`, `vector`, `ingestion`, `analytics`, `inference`, `ai-gateway`, `retrieval`, `browser`, `media`, `realtime`; plus `secrets-manager` added to the `cloud-service` list; plus `agent-sdk` added to the `framework` list.      | Coarser groups (`ai`, `media`, `analytics` only); an `email` token instead of reusing `messaging` | U1                  |
| D3  | Durable Objects    | Category `stateful-compute`. Raised because the user first said `object-storage`; the concern (pick-and-trade would compare it with R2, and it cannot cite the blob-storage contract) was accepted.                                                                                                                                 | `object-storage`; `actor`                                                                         | U1 (token), plan B  |
| D4  | Bundle granularity | "One bundle per service": `cloudflare-<slug>`, kind `cloud-provider`, components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`, `axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the zero-trust bundle's shape.                                                                          | Domain composites (`cloudflare-data`, …) after `gcp-cloud-sql`; both                              | U3–U9               |
| D5  | Config tier        | Backing-service packs ship **no `config/`**; the wrangler binding block a project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to add to the project's own `wrangler.jsonc`.                                                                                                                                 | A wrangler fragment convention (no merger exists; the Workers packs own `wrangler.jsonc`)         | U3–U9               |
| D6  | Contracts          | Cite a `assets/contracts/` doc only where one exists for the pack's category and capability: D1 → `datastore.md`, R2 → `object-storage.md`; KV, Hyperdrive, Vectorize, Pipelines, Analytics Engine cite none. No new contracts are written.                                                                                         | Writing a contract per new category                                                               | U3–U9               |
| D7  | R2's siblings      | R2 Data Catalog and R2 SQL are **sections inside the R2 pack's references** (service-doctrine and cost-shape), not separate packs or extra reference files.                                                                                                                                                                         | Separate `r2-data-catalog` / `r2-sql` packs; extra reference files                                | U4                  |
| D8  | `capability:`      | D1 `relational-datastore`, R2 `object-file-storage`, KV `cache-layer`, Vectorize `search-index`. Hyperdrive, Pipelines, Analytics Engine **unset** with the zero-trust comment shape, since their categories have no vwf token today.                                                                                               | Only the taxonomy-fixed three; stretching more tokens                                             | U3–U9               |
| D9  | Provider narrowing | One unit rewrites every service-enumerating passage in the provider pack **and** the six duplicates in the Workers packs and existing bundles. After this plan the prose names: shipped (Zero Trust Access, Workers Static Assets, Workers SSR, the seven here), planned in B–D (by name), and declined (Pages, Stream, Turnstile). | Each pack unit editing the provider (shared-file collision)                                       | U2                  |
| D10 | Reversal           | Pages and Stream leave the reservation list permanently; a decisions doc records it with Cloudflare's steer as the ground for Pages and the user's decline for Stream.                                                                                                                                                              | Retire Pages only; keep both reserved                                                             | U10                 |
| D11 | Skill naming       | Every new Cloudflare service pack's router skill directory and `name:` is `cloudflare-<slug>` (`skills/cloudflare-kv/`, `cloudflare-r2`, …). The pack directory slug stays bare (`kv`, `r2`, `d1`, `hyperdrive`, `vectorize`, `pipelines`, `analytics-engine`). The three existing packs are not renamed.                           | Bare skill names as `workers-ssr` used (ambiguous for `kv`, `r2`, `d1`)                           | U3–U9               |
| D12 | Reference files    | Exactly five per pack, named for the topics: `pick-and-trade.md`, `service-doctrine.md`, `cost-shape.md`, `identity-shape.md`, `local-dev.md`. No sixth file.                                                                                                                                                                       | Topic-free names; extra files for sub-features                                                    | U3–U9               |
| D13 | Research sourcing  | Every Cloudflare fact in a pack is verified against Context7 `/websites/developers_cloudflare` (falling back to `/cloudflare/cloudflare-docs`) at authoring time and cited by URL in the reference that states it. No fact from memory.                                                                                             | Trusting the facts section of this plan                                                           | U3–U9               |
| D14 | Harness block      | `harness:` carries `health`, `e2e_staging`, `local_stack`, each `task: n/a` with honest mechanism prose, as `zero-trust-access/pack.yaml:14-41` and `cloud-sql/pack.yaml` do. No task is invented.                                                                                                                                  | Naming a mise task the pack does not ship                                                         | U3–U9               |
| D15 | Credentials        | Packs **cite** the provider pack's identity-and-iam reference for the API token and account id and never restate the names or the scopes; identity-shape.md states only the per-service token permission the service needs.                                                                                                         | Restating the credential rule per pack                                                            | U3–U9               |
| D16 | Versions           | Every new pack and bundle is `0.1.0`; stackgen bumps to `1.3.0` (minor: new menu entries), untagged.                                                                                                                                                                                                                                | Patch                                                                                             | U11                 |
| D17 | Model              | `opus` on every unit.                                                                                                                                                                                                                                                                                                               | `inherit`                                                                                         | all                 |
| D18 | Waves              | Taxonomy and provider prose land before the packs (wave 1), packs concurrently (wave 2), then docs, then gates.                                                                                                                                                                                                                     | Packs in wave 1 as the Astro plan did                                                             | index               |

## New dependencies

None. Packs are YAML and Markdown; no unit adds a package.

## Units

| Id  | Wave | Unit file                                                  | Owns                                                                                                                                                                                                                                                                                                                           | Depends on | Status  | Commit   |
| --- | ---- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | -------- |
| U1  | 1    | [01-taxonomy.md](01-taxonomy.md)                           | `plugins/stackgen/assets/taxonomy.md`                                                                                                                                                                                                                                                                                          | —          | green   | a4205a71 |
| U2  | 1    | [02-provider-narrowing.md](02-provider-narrowing.md)       | `plugins/stackgen/stacks/cloud-provider/cloudflare/**`; the reservation passages only in `stacks/cloud-service/workers-ssr/**`, `stacks/cloud-service/workers-static-assets/**`, `stacks/bundles/cloudflare-workers-ssr.md`, `stacks/bundles/cloudflare-workers-static.md`, `stacks/bundles/cloudflare-zero-trust.md`          | —          | green   | 2aeacb8d |
| U3  | 2    | [03-kv-pack.md](03-kv-pack.md)                             | `plugins/stackgen/stacks/cloud-service/kv/**`, `plugins/stackgen/stacks/bundles/cloudflare-kv.md`                                                                                                                                                                                                                              | U1, U2     | pending |          |
| U4  | 2    | [04-r2-pack.md](04-r2-pack.md)                             | `plugins/stackgen/stacks/cloud-service/r2/**`, `plugins/stackgen/stacks/bundles/cloudflare-r2.md`                                                                                                                                                                                                                              | U1, U2     | pending |          |
| U5  | 2    | [05-d1-pack.md](05-d1-pack.md)                             | `plugins/stackgen/stacks/cloud-service/d1/**`, `plugins/stackgen/stacks/bundles/cloudflare-d1.md`                                                                                                                                                                                                                              | U1, U2     | pending |          |
| U6  | 2    | [06-hyperdrive-pack.md](06-hyperdrive-pack.md)             | `plugins/stackgen/stacks/cloud-service/hyperdrive/**`, `plugins/stackgen/stacks/bundles/cloudflare-hyperdrive.md`                                                                                                                                                                                                              | U1, U2     | pending |          |
| U7  | 2    | [07-vectorize-pack.md](07-vectorize-pack.md)               | `plugins/stackgen/stacks/cloud-service/vectorize/**`, `plugins/stackgen/stacks/bundles/cloudflare-vectorize.md`                                                                                                                                                                                                                | U1, U2     | pending |          |
| U8  | 2    | [08-pipelines-pack.md](08-pipelines-pack.md)               | `plugins/stackgen/stacks/cloud-service/pipelines/**`, `plugins/stackgen/stacks/bundles/cloudflare-pipelines.md`                                                                                                                                                                                                                | U1, U2     | pending |          |
| U9  | 2    | [09-analytics-engine-pack.md](09-analytics-engine-pack.md) | `plugins/stackgen/stacks/cloud-service/analytics-engine/**`, `plugins/stackgen/stacks/bundles/cloudflare-analytics-engine.md`                                                                                                                                                                                                  | U1, U2     | pending |          |
| U10 | 3    | [10-docs.md](10-docs.md)                                   | `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `plugins/stackgen/stacks/readme.md`, `docs/memory/decisions/2026-09-06-pages-and-stream-leave-the-reservation.md`, `docs/memory/decisions/2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md` | U1–U9      | pending |          |
| U11 | 4    | [11-gates-and-bump.md](11-gates-and-bump.md)               | `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                       | U10        | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                                                           | Why it collides                                                                     | Owner    |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | -------- |
| `plugins/stackgen/.claude-plugin/plugin.json`                                                                                  | several units bumping one version is a lost update                                  | U11 only |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                      | generated; regenerating mid-wave races                                              | U11 only |
| `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `docs/memory/**` | n units editing one doc                                                             | U10 only |
| `plugins/stackgen/stacks/readme.md`                                                                                            | the wave narrative every pack would want a line in                                  | U10 only |
| `plugins/stackgen/assets/taxonomy.md`                                                                                          | every pack's category token; B, C, D need theirs minted here too                    | U1 only  |
| `plugins/stackgen/stacks/cloud-provider/cloudflare/**`                                                                         | seven packs would each want the scope prose and the local-dev map to name them      | U2 only  |
| The six reservation passages in `workers-ssr/**`, `workers-static-assets/**`, `bundles/cloudflare-*.md`                        | same                                                                                | U2 only  |
| `plugins/stackgen/assets/kinds.md`, `pack-format.md`, `artifact-doctrine.md`, `contracts/**`                                   | nothing in this plan changes them; a unit that thinks it must reports `UNRESOLVED:` | nobody   |

## Waves

- **Wave 1 — U1, U2.** Disjoint: the taxonomy file and the provider-pack prose.
  Both must exist before a pack cites a token or the narrowed scope.
- **Wave 2 — U3–U9.** Seven pack units, each owning one new directory and one
  new bundle file; nothing shared. They cite U1's tokens and U2's prose
  read-only.
- **Wave 3 — U10.** Docs, after every `DOCS FALSIFIED:` line is in.
- **Wave 4 — U11.** Bump, generate, full gate, target-verifier.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `mise run plugins:shellcheck`,
`pnpm vitest run`, `pnpm exec tsc --noEmit -p installer` and `-p scripts`,
`mise run plugins:npm-normalize-test`, `mise run site:check` from wave 3 on (U10
owns `site/**`), plus the wave review, plus every report read for `UNRESOLVED:`.

The inventory `--check` **will fail after wave 2 until U11 regenerates it** —
that is the expected state, recorded as such in the wave-2 gate line, exactly as
both earlier Cloudflare plans recorded it; the orchestrator does not regenerate
mid-wave. Because pre-commit runs the same check, wave 2 cannot be committed
before U11's regeneration: expect waves 2–4 to land as **one commit** unless the
orchestrator regenerates the inventory itself at the wave-2 boundary (allowed —
it is the orchestrator's file, not a unit's; if it does, U11 re-runs the
generator and confirms no diff).

Plan-specific checks, run by the orchestrator after wave 2:

- `ls plugins/stackgen/stacks/cloud-service/{kv,r2,d1,hyperdrive,vectorize,pipelines,analytics-engine}/skills/cloudflare-*/references/ | grep -c '\.md$'`
  is 35 — five per pack, and the five names are exactly D12's.
- `find plugins/stackgen/stacks/cloud-service/{kv,r2,d1,hyperdrive,vectorize,pipelines,analytics-engine} -name config`
  is empty (D5).
- `grep -L '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-{kv,r2,d1,hyperdrive,vectorize,pipelines,analytics-engine}.md`
  lists all seven (D4: no artifact key on a backing bundle).
- `grep -h '^category:' plugins/stackgen/stacks/cloud-service/{kv,r2,d1,hyperdrive,vectorize,pipelines,analytics-engine}/pack.yaml`
  yields exactly `key-value`, `object-storage`, `sql`, `database-proxy`,
  `vector`, `ingestion`, `analytics`, and every one of those tokens appears on
  `taxonomy.md`'s `cloud-service` line.
- `grep -rn 'Pages\b' plugins/stackgen/stacks/cloud-provider/cloudflare plugins/stackgen/stacks/bundles/cloudflare-*.md`
  returns only lines that say Pages is declined or superseded — never "planned".

## Gates the orchestrator keeps

- **The menu check**, after wave 2: read `plugins/stackgen/stacks/bundles/` the
  way `stackgen-stack-menu` does — every `*.md` without `unconditional: true` is
  a menu row. The seven new `cloudflare-*.md` files must each parse as
  frontmatter with `name`, `axis: backing`, `kind: cloud-provider` and two
  `components` refs whose targets exist on disk
  (`stacks/cloud-provider/cloudflare/pack.yaml` and
  `stacks/cloud-service/<slug>/pack.yaml`). Pass = seven rows, all resolvable. A
  failure is a wave-2 finding routed to the owning unit.
- **No scratch materialization.** No pack in this plan has a `config/` tier, so
  there is nothing for `/vwf:init` to lay down; the Astro plan recorded the same
  for project-axis packs.
- **`target-verifier`** runs inside U11: a hermetic install
  (`CLAUDE_CONFIG_DIR=/tmp/…`) of stackgen `1.3.0` from the dev marketplace
  shows the seven pack directories and seven bundle files under the installed
  plugin's `stacks/`, and an uninstall leaves nothing behind. Pass = both.
- **`plugins:local`** after landing, by the orchestrator, per the consent block.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits, never runs `git checkout`/`git restore`/`git stash` or a
formatter `--fix` outside its owned paths.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **Pages** — retired (D10). Cloudflare steers new projects to Workers Static
  Assets, which ships.
- **Workers Sites** — deprecated by Cloudflare in Wrangler v4; never a
  candidate.
- **Stream** — retired (D10); declined by the user when briefed.
- **Turnstile** — declined by the user when briefed; recorded as a possible
  later pack under Parked.
- **Durable Objects, Workflows, Containers, Queues** — plan B. **Workers AI, AI
  Gateway, AI Search, Browser Rendering, Agents SDK** — plan C. **Images,
  Realtime, Email Service, Secrets Store** — plan D. Their category tokens are
  minted here (D2); their packs are not.
- **Zaraz, Logpush, Snippets, Cache Reserve, Workers for Platforms, WAF, DNS,
  Tunnels, Load Balancing, Rules** — account-level configuration, not
  repo-pinned stack components; stackgen's pack model has no place for them.
- **Pub/Sub** — could not be verified as a current product via Context7; left
  out rather than assumed.
- **Any vwf file** — vwf stays vendor-free on hosting and mints its own
  capability tokens; the categories without a token stay unset (D8).
- **New contracts** under `assets/contracts/` (D6).
- **New `plugins:check` rules** — none is needed for these packs; two gaps are
  parked.
- **A public stackgen or site release** — consent recorded as "not this time";
  the version still bumps.

## Parked

- **A checker rule validating `pack.yaml`'s `category` against `taxonomy.md`'s
  list for its `type`.** Today a typo in a category lands silently; this plan
  adds thirteen tokens and seven packs that would benefit. Belongs in a
  gate-only plan (`scripts/src/check.ts` + `checks.md` + a `check.test.ts`
  case).
- **An enumerated `artifact:` token list.** `pack-format.md:168` and `:204`
  declare `<token>`; the tokens in use are `container-image`, `npm-package`,
  `static-assets`, `worker-script`, `n/a`. Minting one requires no asset edit
  today. Same gate-only plan.
- **vwf capability tokens for the new categories** — `key-value` maps to
  `cache-layer` and `vector` to `search-index` already; `database-proxy`,
  `ingestion`, `analytics`, `stateful-compute`, `inference`, `ai-gateway`,
  `retrieval`, `browser`, `media`, `realtime`, `secrets-manager` have none.
  Minting is vwf's move; joins the still-open `static-hosting` token from
  `2026-09-05-cloudflare-workers-static`.
- **A D1 migrations task overlay** (`p:<id>:db-migrate` running
  `wrangler d1 migrations apply`). Backing packs ship no `config/` (D5); a
  recurring dev-loop task is the one case where that rule chafes. Decide with
  the first real D1 project.
- **`p:<id>:preview`** (`wrangler versions upload` / preview URLs) — still open
  from the Workers Static Assets plan.
- **Turnstile** as a `cloud-service` pack (category would be new, e.g.
  `bot-protection`); declined this round.
- **Composite Cloudflare bundles** by domain — rejected under D4, recorded so it
  is not re-opened as a fresh idea without the per-service menu having been
  tried.
- **`docs/memory/handoff/next.md` is stale** (describes the landed
  init-behind-setup plan as pending). A handoff rewrite, not this plan's.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green       | check, marketplace --check, inventory --check, shellcheck, vitest (272 passed), tsc installer+scripts, npm-normalize, site:check — all clean on `develop` at `31cbf003`                                                                                                                                                                                                                                                                                                                                                         |          |
| 1    | U1        | opus  | 1     | green       | taxonomy.md: 14 cloud-service tokens + `agent-sdk`; DECIDED: mappings in the capability-seam paragraph, no-token sentence drops its count, minting note under "The capability seam"; DOCS FALSIFIED: stacks/readme.md:186-192, site stackgen.md category list; GAP none                                                                                                                                                                                                                                                         | a4205a71 |
| 1    | U2        | opus  | 1     | green       | 10 files: provider conventions/SKILL/local-dev map rewritten (offered/planned/declined lists, 7 service rows), 7 reservation passages → one pointer sentence each; DECIDED: Cloudflare's local/remote vocabulary, Pipelines row defers to its pack, role-grant hands per-service permissions to identity-shape, closing line lists ten slugs; GAP: unit said "at most nine files" but Owns is ten — Owns taken as authoritative; GAP: Hyperdrive local mode stated as mode + one clause, connection-string mechanics left to U6 | 2aeacb8d |
| 1    | R1        | opus  | 1     | findings(2) | cost-doctrine.md:59 [U2] docs — "two surfaces" falsified once wave 2 ships seven backing services; taxonomy.md:141 [U1] completeness — minting note 4 sentences vs "two or three", unrequested superlative. CONTRACT clean, RULINGS clean. Both looped to owners                                                                                                                                                                                                                                                                |          |
| 1    | U1        | opus  | 2     | green       | minting note cut to three sentences, superlative dropped; GAP none                                                                                                                                                                                                                                                                                                                                                                                                                                                              | a4205a71 |
| 1    | U2        | opus  | 2     | green       | cost-doctrine.md:59 scope sentence now "any Cloudflare service this stack offers besides the proxy", per-service terms handed to each pack's cost-shape; DECIDED: kept the two hosting billing sentences as examples, no enumeration here; GAP none                                                                                                                                                                                                                                                                             | 2aeacb8d |
| 1    | R1        | opus  | 2     | pass        | FINDINGS 0, CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |          |

## Launch

Run in a fresh session:

/execute-plan docs/plans/2026-09-06-cloudflare-storage-and-data
