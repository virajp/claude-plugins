# U12 — The `workers-ssr` pack and bundle; the script reservation redeemed

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/cloud-service/workers-ssr/**` (new),
  `plugins/stackgen/stacks/bundles/cloudflare-workers-ssr.md` (new),
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-workers-static.md`,
  `plugins/stackgen/stacks/cloud-provider/cloudflare/**`,
  `plugins/stackgen/stacks/cloud-service/workers-static-assets/**`,
  `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`. Touch nothing
  outside this list.
- **Model:** inherit
- **Read first:**
  `plugins/stackgen/stacks/cloud-service/workers-static-assets/**` top to bottom
  — the model for every file here (`pack.yaml`, `conventions.md`,
  `config/wrangler.jsonc` with its two marked positions,
  `config/.config/mise/tasks/p/_project/deploy` with its credential guard,
  `skills/workers-static-assets/SKILL.md` and its eight references);
  `plugins/stackgen/stacks/cloud-service/cloud-run/pack.yaml` (a `compute`
  service: its `category`, `capability` and `harness` fields);
  `plugins/stackgen/assets/kinds.md:186-259` (the `cloud-provider` kind, the
  deploy-target extension for `compute`); the reservation prose as it stands
  after 2026-09-05: `cloud-provider/cloudflare/conventions.md:5-16`,
  `cloudflare-zero-trust.md` (the reservation paragraph and the "composes with a
  hosting pin" passage), `cloud-provider/cloudflare/skills/cloudflare/SKILL.md`
  (the coverage fence and the frontmatter `description`),
  `references/cost-doctrine.md` and `references/local-development-map.md`;
  `cloud-service/zero-trust-access/conventions.md` and its
  `references/pick-and-trade.md` (the same-provider hosting sentence);
  `plugins/stackgen/assets/ids.md` (U5's — cite by name);
  `docs/memory/decisions/2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md`.
- **Lazy-load:** Context7 `/websites/developers_cloudflare_workers` (a Worker
  with a script and static assets: `main`, `assets.binding`, `run_worker_first`,
  `nodejs_compat`, how unmatched requests fall through to the script) and
  `/withastro/docs` (`@astrojs/cloudflare` v13 for Astro 6: the unified
  entrypoint `@astrojs/cloudflare/entrypoints/server` as the `main`,
  `platformProxy` for local dev) — cite, do not assume.

## Ruling

D40: "add a workers-ssr pack and bundle to this plan": "A
`cloud-service/workers-ssr` pack: a Worker with a script, `@astrojs/cloudflare`
v13 as the adapter the SSR/Hybrid bundles cite for this pairing,
`wrangler.jsonc` with `main`, the same `p/_project/deploy` overlay shape,
category `compute`, artifact `worker-script`; and a `cloudflare-workers-ssr`
bundle. Redeems the reservation for Workers-with-a-script; Pages/R2/D1/KV/etc
stay reserved." The user: "Pair with all supported deployments, Cloudflare
Workers as preferred option."

D12: SSR and Hybrid name this bundle **first** among their pairings; this bundle
names `astro-ssr` and `astro-hybrid` as the project bundles it was built for.

D41 *(assumed)*: `artifact: worker-script` on both `pack.yaml` and the bundle —
the vocabulary is open (`container-image`, `npm-package`, `static-assets`, `n/a`
in use), and a script plus its assets is neither a container nor a directory.
`capability` mirrors `cloud-run/pack.yaml`'s field for `compute`.

The measured facts (Context7, 2026-09-06): a Worker with a script names `main`;
`assets.directory` and `assets.binding: "ASSETS"` let the script fetch assets;
with a script present, a request no asset matches falls through to the script
(so `not_found_handling` is the script's business); `nodejs_compat` is the
compatibility flag the Astro adapter needs; for Astro 6 the adapter's v13 moved
`main` from a built file path to the unified entrypoint
`@astrojs/cloudflare/entrypoints/server`, which serves local dev and production
alike; the adapter is not required for a purely static site.

D15 / D26 / D37 apply: ids per `assets/ids.md`; no editor fragment for a deploy
pack; no `pack.yaml` version moves — the new pack is `0.1.0`, the provider stays
`0.1.0`.

## Edits

1. **`cloud-service/workers-ssr/pack.yaml`** — `name`, a `summary` in the
   static-assets pack's register (a Worker that runs a script in front of its
   own static assets: on-demand rendering at the edge, the assets served by the
   platform, one deploy for both), `version: 0.1.0`, `type: cloud-service`,
   `category: compute`, `kind: cloud-provider`, `axis: deploy`,
   `artifact: worker-script`, `capability` as `cloud-run` sets it, `harness:` —
   `local_stack` = the framework's dev server through the adapter's platform
   proxy (mechanism, no task), `pipeline` = `p:<id>:deploy`, `health` = an HTTP
   probe of `/` and of one on-demand route returning a non-cached response,
   `task: n/a`.
2. **`conventions.md`** — the component's prose: what a Worker with a script is
   and is not (not a container; a V8 isolate with the platform's runtime,
   `nodejs_compat` for the Node surface the adapter needs); the config shape and
   its marked positions; that the script is the **framework adapter's** output
   and the adapter is named by the project bundle that pairs here (for Astro,
   `@astrojs/cloudflare` — cited as the fact the pairing rests on, in one
   sentence); credentials never in the file, `GLB_CLOUDFLARE_API_TOKEN` /
   `GLB_CLOUDFLARE_ACCOUNT_ID` as the static pack documents; the reservation
   sentence: Pages, R2, D1, KV, Durable Objects, Queues, Images and Stream stay
   planned under their own effort and are not offered.
3. **`config/wrangler.jsonc`** — the static pack's file as the model, byte for
   byte where the meaning is the same, and: `"main"` as a **marked position**
   whose shipped value is the Astro adapter's unified entrypoint with the
   comment that a different framework's adapter names a different entry;
   `"compatibility_flags": ["nodejs_compat"]`; `assets` with
   `"directory": "./dist"` and `"binding": "ASSETS"` and **no**
   `not_found_handling` (the script handles unmatched paths — say why in the
   comment); `"name"` and the `routes` block as marked positions exactly as the
   static pack ships them; `"$schema"`, `"compatibility_date"` as there.
4. **`config/.config/mise/tasks/p/_project/deploy`** — the static pack's overlay
   copied and adjusted: same header block, same credential guard, same
   `--dry-run` exemption, same build step, same wrangler resolution; the header
   names this pack; `print_header` says "with a script". Executable.
5. **`skills/workers-ssr/SKILL.md`** — the router, frontmatter in the static
   pack's exact shape, model-invocable; and eight references mirroring the
   static pack's topics, each written for a Worker that runs code:
   `pick-and-trade.md` (when a script at the edge is the deployment, and when a
   container is — cold starts, CPU limits, the Node surface),
   `service-doctrine.md` (`main`, bindings, `run_worker_first` as the knob this
   pack leaves off and why, the fall-through rule), `artifact.md` (files plus
   the entry; what the adapter emits into `dist/`), `pipeline.md` (the task CI
   runs, `wrangler deploy`, preview, rollback), `health.md` (the two probes and
   why the on-demand one earns), `cost-shape.md` (requests and CPU time, not
   seats; cite the provider's carve-out as the static pack does),
   `identity-shape.md` (the same token as the static pack; one account-owned
   token), `local-dev.md` (the adapter's platform proxy under the framework's
   dev server; `wrangler dev` against the built output as the second surface).
   Every Cloudflare fact cited to `/websites/developers_cloudflare_workers`.
6. **`bundles/cloudflare-workers-ssr.md`** — new:
   `name: Cloudflare Workers
   SSR`, `axis: deploy`, `kind: cloud-provider`,
   `components:` `cloud-provider/cloudflare@0.1.0` and
   `cloud-service/workers-ssr@0.1.0`, `artifact: worker-script`, **no**
   `unconditional:`. Body in `cloudflare-workers-static.md`'s voice: what it
   deploys, the pairing with the project bundles that emit a Worker entry
   (`astro-ssr`, `astro-hybrid` — named as the ones built for it), that it
   composes with `cloudflare-zero-trust` as the static bundle does, what stays
   reserved.
7. **The reservation, narrowed a second time** — every site that names "a Worker
   script fronting static assets" or "Workers-with-a-script" as reserved now
   names it as offered: `cloud-provider/cloudflare/conventions.md` (the
   reservation paragraph, the hosting claim, the closing service pointer — now
   three services), `cloudflare-zero-trust.md` (the reservation paragraph and
   the "composes with a hosting pin" passage), the provider skill's coverage
   fence and frontmatter `description` (strict YAML — same keys, same folded
   scalar), `references/cost-doctrine.md` (the closing section gains the
   script's request-and-CPU shape), `local-development-map.md` (a row for the
   adapter's platform proxy and `wrangler dev` with a script),
   `zero-trust-access/conventions.md` and `references/pick-and-trade.md` (the
   same-provider hosting sentence names both siblings). Minimal in-place edits;
   fold width by hand.
8. **`cloud-service/workers-static-assets/**`** — the cross-references: the
   `wrangler.jsonc` header comment ("Adding `main` here turns this into a
   different stack — see the `workers-static-assets` skill") now points at the
   `workers-ssr` pack by name; `conventions.md` and `service-doctrine.md` name
   the sibling where they say a script is out of scope; `pick-and-trade.md`
   names when to move to it. Nothing else in that pack changes.
9. **`bundles/cloudflare-workers-static.md`** — one sentence naming the SSR
   sibling and which project bundles pair with which.

## Verification

- `mise run plugins:check` exits 0 (rule 11: the overlay's exec bit and shebang,
  `wrangler.jsonc` at the config root — already allowlisted); the skill count
  rises by one; `claude plugin validate --strict` passes.
- `mise run plugins:shellcheck` exits 0 over the new overlay.
- `grep -rn "not offered" plugins/stackgen/stacks/cloud-provider/cloudflare plugins/stackgen/stacks/bundles/cloudflare-*.md`
  — every hit's reserved list contains neither "Workers" as a bare word nor
  "Worker script"; Pages, R2, D1, KV, Durable Objects, Queues, Images and Stream
  are still on it.
- `grep -n "unconditional" plugins/stackgen/stacks/bundles/cloudflare-workers-ssr.md`
  is empty; `grep -n "artifact: worker-script"` hits the bundle and `pack.yaml`.
- In the scratch materialization the orchestrator runs: `wrangler.jsonc` parses
  as JSONC (comments and trailing commas stripped), carries `main`,
  `compatibility_flags` containing `nodejs_compat`, `assets.directory` and
  `assets.binding`, no `not_found_handling`, and both marked positions intact;
  the overlay renamed to `p/scratch-dev/` lists as `p:scratch-dev:deploy` and
  exits 1 naming both credential variables with none set.
- `ls plugins/stackgen/stacks/cloud-service/workers-ssr/skills/workers-ssr/references/ | wc -l`
  = 8.
- `mise run plugins:inventory --check` is expected to be red until the
  orchestrator regenerates; say so, do not run the generator.

## Guardrails

- The provider pack's `pack.yaml` stays `0.1.0`; only prose changes there (the
  2026-09-05 ruling, kept).
- Do not edit `assets/` (U5), the Astro pack (U1) or the Astro bundles (U2); the
  SSR/Hybrid bundles name this bundle by the slug this plan fixes.
- Payload under `config/` is excluded from this repo's dprint; task file is
  bash, two-space, `-ci`; BSD `sed`. `cat` is `bat` — Write/Edit only.
- Strict-YAML frontmatter on the provider skill's `description` edit — verify
  with `yaml.safe_load` before returning.
- Name the Astro adapter as a fact the pairing rests on, once; this is a deploy
  pack, not a framework pack.

## Commit

`feat(stackgen): add the workers-ssr pack and cloudflare-workers-ssr bundle; the script reservation redeemed`
— written by the orchestrator after the wave gate, not by the unit.
