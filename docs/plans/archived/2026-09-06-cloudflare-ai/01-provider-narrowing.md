# U1 — The provider pack's scope, narrowed again: the AI services and the Agents SDK ship

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/cloud-provider/cloudflare/**` (every file
  under it, edit in place — no new files). Touch nothing outside this list. Plan
  A turned the six former duplicates in the Workers packs and existing bundles
  into one-sentence pointers; they need no edit and are **not** yours.
- **Model:** opus
- **Read first:** every owned file, top to bottom — in particular the three-part
  scope prose plan A's U2 wrote in `conventions.md` (shipped / planned /
  declined), the scope sentences in `skills/cloudflare/SKILL.md`, and the
  service table in `skills/cloudflare/references/local-development-map.md` with
  its "arriving under their own plans" row. Then
  `ls plugins/stackgen/stacks/cloud-service/` and
  `ls plugins/stackgen/stacks/framework/` to see what is on disk at run time.
- **Lazy-load:** `plugins/stackgen/assets/kinds.md:222-237` (the four provider
  topics — the map stays a provider-topic artifact); Context7
  `/websites/developers_cloudflare` for the one-line local-development fact per
  service you add.

## Ruling

D10: "One unit rewrites the provider pack's three lists: shipped = every
Cloudflare `cloud-service` pack on disk at run time plus this plan's four,
**plus** the Agents SDK named as a framework pack rather than a service; planned
= the remainder of the twenty, derived from disk; declined unchanged. Four
local-development-map rows."

The twenty, for deriving "planned": Zero Trust Access, Workers Static Assets,
Workers SSR (pre-existing); KV, R2, D1, Hyperdrive, Vectorize, Pipelines,
Analytics Engine (A); Durable Objects, Workflows, Containers, Queues (B);
Workers AI, AI Gateway, AI Search, Browser Rendering, Agents SDK (this plan);
Images, Realtime, Email Service, Secrets Store (D). A service is "shipped" when
`stacks/cloud-service/<slug>/pack.yaml` exists (or, for the Agents SDK,
`stacks/framework/cloudflare-agents/pack.yaml` — which this wave's U6 creates
**after** you run; name it as shipped anyway, since the plan lands as one).

The declined list is unchanged from plan A: Pages (superseded by Workers Static
Assets in Cloudflare's own guidance), Workers Sites (deprecated), Stream and
Turnstile (declined), account-level products (not stack components).

## Edits

1. **`cloud-provider/cloudflare/conventions.md`** — the three-part scope
   paragraph. Move Workers AI, AI Gateway, AI Search and Browser Rendering from
   "planned" to "shipped"; add one clause that the **Agents SDK** ships as a
   framework pack on the project axis (`framework/cloudflare-agents`, reached
   through the `typescript-cloudflare-agents` language bundle) rather than as a
   service — a reader looking for it under `cloud-service/` must be told where
   it is. "Planned" becomes whatever of the twenty is not on disk (if plan D has
   not run, its four; if it has, the paragraph says every named service now
   ships and the planned clause goes). Keep the register and the point (a short
   menu explains itself; never fill a gap from general knowledge).
2. **`skills/cloudflare/SKILL.md`** — the scope sentences, same lists compressed
   to the router's register. Frontmatter stays valid strict YAML.
3. **`skills/cloudflare/references/local-development-map.md`** — add one row
   each for Workers AI, AI Gateway, AI Search and Browser Rendering: a
   provider-level fact only — does `wrangler dev` run it locally, call the
   remote service (and bill), or have no local form. Workers AI and Browser
   Rendering are believed remote-only under `wrangler dev`; AI Gateway is a URL
   and has no local form; AI Search is believed remote-only — **verify each**
   against Context7 and cite. Add a fifth row for the Agents SDK only if the
   table already carries framework-level rows; otherwise a one-sentence note
   under the table that an agent runs locally as its Durable Object does (point
   at B's Durable Objects row). Update the "arriving under their own plans" row
   to the derived remainder, or remove it if nothing remains.

## Verification

- `grep -n 'Agents SDK\|cloudflare-agents' plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md`
  hits at least once, in the shipped clause.
- `grep -n 'Workers AI\|AI Gateway\|AI Search\|Browser Rendering' plugins/stackgen/stacks/cloud-provider/cloudflare/skills/cloudflare/references/local-development-map.md`
  hits four rows.
- No line in the provider pack says any of this plan's five is "planned".
- `mise run plugins:check` exits 0 (rule 4 on `SKILL.md`; rule 12 vocabulary).
- `git diff --stat` lists only files under `cloud-provider/cloudflare/`.

## Guardrails

- Do not create a new file. Do not touch `pack.yaml`. Do not edit any Workers
  pack, any bundle, any `cloud-service/` pack or `framework/` pack.
- Do not write per-service doctrine here — cost, identity, local-dev detail
  belong to U2–U6's packs, which cite the provider.
- `plugins/**/*.md` is not dprint-formatted — hand-fold; match the table
  alignment. `cat` is aliased to `bat`: Edit, never heredocs.
- No repo names, account ids or domains.

## Commit

`feat(stackgen): the Cloudflare provider's scope — the AI services and the Agents SDK ship`
— written by the orchestrator after the wave gate, not by the unit.
