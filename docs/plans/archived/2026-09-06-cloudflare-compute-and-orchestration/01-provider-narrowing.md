# U1 — The provider pack's scope, narrowed again: four more shipped

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/cloud-provider/cloudflare/**` (every file
  under it, edit in place — no new files). Touch nothing outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing. In particular
  `conventions.md` (the three-list scope paragraph plan A's U2 wrote — locate it
  by grepping `declined`), `skills/cloudflare/SKILL.md` (the scope sentences,
  same grep), and `skills/cloudflare/references/local-development-map.md` (the
  service table with its "planned" and "declined" rows). Then
  `ls plugins/stackgen/stacks/cloud-service/` — the shipped list is derived from
  what is on disk, not from this file.
- **Lazy-load:** `plugins/stackgen/assets/kinds.md:222-237` (the four provider
  topics — the local-development map stays a provider-topic artifact and never
  becomes service doctrine); Context7 `/websites/developers_cloudflare` for the
  one-line local-development fact per service you add to the map.

## Ruling

B7: "One unit rewrites the provider pack's three lists. The **shipped** list is
every Cloudflare `cloud-service` pack present on disk at run time plus this
plan's four; the **planned** list is the remainder of the twenty, derived from
disk (plan D may have run first); the declined list is unchanged. Four rows join
the local-development map."

B10: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` (falling back to
`/cloudflare/cloudflare-docs`) at authoring time and cited by URL in the
reference that states it. No fact from memory."

The twenty services, so the remainder is computable: Zero Trust Access, Workers
Static Assets, Workers SSR (the three that predate plan A); Workers KV, R2, D1,
Hyperdrive, Vectorize, Pipelines, Analytics Engine (plan A); Durable Objects,
Workflows, Queues, Containers (this plan); Workers AI, AI Gateway, AI Search,
Browser Rendering, the Agents SDK (plan C); Images, Realtime, Email Service,
Secrets Store (plan D). The declined list is plan A's and does not change: Pages
(superseded by Workers Static Assets in Cloudflare's own guidance); Workers
Sites (deprecated in Wrangler v4); Stream and Turnstile (declined when offered);
account-level products (WAF, DNS, Tunnels, Zaraz, Logpush, Workers for Platforms
and the like) are not stack components at all.

The six duplicate reservation passages in `workers-ssr/**`,
`workers-static-assets/**` and the three older `bundles/cloudflare-*.md` became
one-sentence pointers to the provider conventions in plan A. **They are not
yours and need no edit** — that was the point of making them pointers.

## Edits

1. **`conventions.md`** — the three-list scope paragraph. Move Durable Objects,
   Workflows, Queues and Containers from the planned list to the shipped list.
   Compute the shipped list as: every directory under
   `plugins/stackgen/stacks/cloud-service/` that is a Cloudflare service (the
   three predating plan A, plan A's seven, and any of plan D's four if present
   on disk) plus this plan's four; the planned list is the twenty minus that.
   Keep the register and the point (a menu that comes back short must explain
   itself; never fill a gap from general Cloudflare knowledge). Containers
   changes one more sentence: the paragraph that names "the two hosting shapes"
   (assets-only and script-in-front) now names **three deploy targets** —
   Workers Static Assets, Workers SSR, and Containers — and says in one clause
   that Containers is pinned instead of Workers SSR, not beside it (cite the
   `cloudflare-containers` bundle for the reasoning; do not restate it).
2. **`skills/cloudflare/SKILL.md`** — the scope sentences. Same three lists,
   compressed to the router's register. The `description:` frontmatter must
   remain valid strict YAML; if it names services or "two hosting shapes",
   update it too.
3. **`skills/cloudflare/references/local-development-map.md`** — the service
   table. Add one row per service in this plan (Durable Objects, Workflows,
   Queues, Containers), each a provider-level fact only: whether `wrangler dev`
   simulates it locally, what it needs on the machine (Containers: Docker), or
   that it has no local form — one line, verified against Context7 and cited in
   the row or a footnote. Move the four names out of the "planned" row. Keep
   every existing row. Do **not** write service doctrine here — the per-service
   `local-dev.md` reference in each pack (U2–U5, not yours) carries the detail;
   this map is the provider's index of it.
4. **Anything else under `cloud-provider/cloudflare/**`** that enumerates
   services by name (grep `Durable Objects`, `Queues`, `Workflows`, `Containers`
   across the tree): make each true against the new lists. Do not add a new
   topic or reference file.

## Verification

- `grep -rn 'Durable Objects\|Workflows\|Queues\|Containers' plugins/stackgen/stacks/cloud-provider/cloudflare`
  — every hit is in a shipped list, a local-dev-map row, or a deploy-target
  sentence; **no** hit is in a "planned" list.
- `grep -rn 'two hosting shapes\|two deploy' plugins/stackgen/stacks/cloud-provider/cloudflare`
  is empty (the count moved to three).
- `grep -c '^|' plugins/stackgen/stacks/cloud-provider/cloudflare/skills/cloudflare/references/local-development-map.md`
  grew by 4.
- `grep -rn 'Pages' plugins/stackgen/stacks/cloud-provider/cloudflare` — every
  hit says superseded or declined, never planned.
- `mise run plugins:check` exits 0 (rule 4: `SKILL.md` still parses as strict
  YAML; rule 12: no retired vocabulary).
- `git diff --stat` lists only files under
  `plugins/stackgen/stacks/cloud-provider/cloudflare/`.

## Guardrails

- Do not create a new file anywhere. Do not touch `pack.yaml` in any pack —
  including the provider's. Do not edit `workers-ssr/**`,
  `workers-static-assets/**`, any bundle, any asset, any doc, `inventory.md`,
  `plugin.json`.
- Do not write per-service doctrine into the provider pack: cost, identity,
  binding keys, local-dev detail per service belong to U2–U5's packs, which cite
  the provider. If a sentence you want to write starts with a service name and
  ends with a binding key, it is theirs.
- Do not hard-code the shipped list from this file's expectation — derive it
  from `ls plugins/stackgen/stacks/cloud-service/`, because plan D may have
  landed first. If a directory is there that is not one of the twenty and not a
  GCP pack, report it as `GAP:` and leave it out of the lists.
- `plugins/**/*.md` is not dprint-formatted — hand-fold to the surrounding
  width; match the existing table alignment in the local-development map.
- `cat` is aliased to `bat` on this machine: Edit, never heredocs.
- No repo names, account ids or domains in shipped files.
- Never run `git checkout`, `git restore`, `git stash` or a formatter `--fix`
  outside your owned paths.

## Commit

`feat(stackgen): the Cloudflare provider's scope names Durable Objects, Workflows, Queues and Containers as shipped`
— written by the orchestrator after the wave gate, not by the unit.
