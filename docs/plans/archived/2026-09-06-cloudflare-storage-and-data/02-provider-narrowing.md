# U2 — The provider pack's scope, narrowed: shipped, planned, declined

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/cloud-provider/cloudflare/**` (every file
  under it, edit in place — no new files); and **only the reservation passages**
  in `plugins/stackgen/stacks/cloud-service/workers-ssr/conventions.md`,
  `plugins/stackgen/stacks/cloud-service/workers-ssr/skills/workers-ssr/SKILL.md`,
  `plugins/stackgen/stacks/cloud-service/workers-static-assets/conventions.md`,
  `plugins/stackgen/stacks/cloud-service/workers-static-assets/skills/workers-static-assets/SKILL.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-workers-ssr.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-workers-static.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md`. Touch nothing
  outside this list, and nothing in those seven files beyond the passage that
  names the reserved services.
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing. In particular
  `cloud-provider/cloudflare/conventions.md:7-11` (the reservation), `:19-20`,
  `:29-32`; `skills/cloudflare/SKILL.md:11`, `:34-35`, `:43-45`;
  `skills/cloudflare/references/local-development-map.md:8-14` (the service
  table); and the six duplicate passages at
  `workers-ssr/conventions.md:136-138`,
  `workers-ssr/skills/workers-ssr/SKILL.md:59`,
  `workers-static-assets/conventions.md:104-106`,
  `workers-static-assets/skills/workers-static-assets/SKILL.md:56`,
  `bundles/cloudflare-workers-ssr.md:103-105`,
  `bundles/cloudflare-workers-static.md:56`,
  `bundles/cloudflare-zero-trust.md:36-40` (line numbers from the survey;
  re-locate by grepping `Pages`).
- **Lazy-load:** `plugins/stackgen/assets/kinds.md:222-237` (the four provider
  topics, so the local-development map stays a provider-topic artifact and does
  not become service doctrine); Context7 `/websites/developers_cloudflare` for
  the one-line local-development fact per service you add to the map.

## Ruling

D9: "One unit rewrites every service-enumerating passage in the provider pack
**and** the six duplicates in the Workers packs and existing bundles. After this
plan the prose names: shipped (Zero Trust Access, Workers Static Assets, Workers
SSR, the seven here), planned in B–D (by name), and declined (Pages, Stream,
Turnstile)."

D10: "Pages and Stream leave the reservation list permanently." Pages because
Cloudflare's own best-practices page says Workers Static Assets is the
recommended approach and Pages only "remains supported"; Stream because the user
declined it when briefed.

The user's scope answer, verbatim: "Compute & orchestration (all); Storage and
data (all); AI (all); Media and messaging (Images, Realtime, Email Service);
Include `Secrets Store` as it will be required if hosting containers in
CloudFlare or even Workers."

The three lists this unit writes, exactly:

- **Shipped by this plan's landing:** Zero Trust Access, Workers Static Assets,
  Workers SSR, Workers KV, R2 (with R2 Data Catalog and R2 SQL), D1, Hyperdrive,
  Vectorize, Pipelines, Analytics Engine.
- **Planned, each under its own plan:** Durable Objects, Workflows, Containers,
  Queues (compute and orchestration); Workers AI, AI Gateway, AI Search, Browser
  Rendering, the Agents SDK (AI); Images, Realtime, Email Service, Secrets Store
  (media, messaging, secrets).
- **Declined, and why, one clause each:** Pages (superseded by Workers Static
  Assets in Cloudflare's own guidance); Workers Sites (deprecated in Wrangler
  v4); Stream and Turnstile (declined when offered); account-level products
  (WAF, DNS, Tunnels, Zaraz, Logpush, Workers for Platforms and the like) are
  not stack components at all.

## Edits

1. **`cloud-provider/cloudflare/conventions.md`** — the paragraph at `:7-11`
   ("The coverage here is deliberately narrow … Pages, R2, D1, KV, Durable
   Objects, Queues, Images and Stream are planned under their own effort and are
   **not offered**"). Rewrite it so it keeps its point — a menu that comes back
   short must explain itself; never fill a gap from general Cloudflare knowledge
   — and carries the three lists above. Keep the register. The "shipped" list
   may say "the storage and data services" and name them; the "planned" list
   names the plan domain, not the plan folder. Then re-read `:19-20` (two
   hosting shapes) and `:29-32` (role grants) and adjust only if a sentence
   there is now false — the hosting shapes are unchanged by this plan; a
   role-grant sentence that says "the only services" would be.
2. **`skills/cloudflare/SKILL.md`** — the scope sentences at `:11`, `:34-35` and
   `:43-45`. Same three lists, compressed to the router's register (one or two
   sentences each place). The description frontmatter must remain valid strict
   YAML; if it names services, update it too.
3. **`skills/cloudflare/references/local-development-map.md`** — the service
   table at `:8-14`. Add one row per service that ships in this plan (KV, R2,
   D1, Hyperdrive, Vectorize, Pipelines, Analytics Engine), each row a
   provider-level fact only: whether `wrangler dev` simulates it locally, hits
   the remote resource, or has no local form — one line, verified against
   Context7 and cited in the row or a footnote. Keep the existing rows. Replace
   the catch-all row "Everything else Cloudflare sells | Out of this stack's
   scope entirely" with two rows: one for the planned services ("arriving under
   their own plans; until then, out of scope") and one for the declined set. Do
   **not** write service doctrine here — the per-service `local-dev.md`
   reference in each pack (U3–U9, not yours) carries the detail; this map is the
   provider's index of it.
4. **The six duplicate passages** — in each of the seven files listed under
   Owns, the sentence or short paragraph that names "Pages, R2, D1, KV, Durable
   Objects, Queues, Images and Stream" (or a subset) as reserved. Replace each
   with **one sentence** that points at the provider pack's conventions for the
   current scope ("what Cloudflare services stackgen offers, and which are
   planned or declined, is the provider component's to state — see
   `cloud-provider/cloudflare/conventions.md`") so the list is never duplicated
   again. Where the passage also states a fact about the Workers pack itself
   (for example, that it ships no bindings), keep that fact and drop only the
   service enumeration. `bundles/cloudflare-zero-trust.md:36-40` restates the
   reservation at more length — same treatment, one pointer sentence.

## Verification

- `grep -rn 'Pages' plugins/stackgen/stacks/cloud-provider/cloudflare plugins/stackgen/stacks/cloud-service/workers-ssr plugins/stackgen/stacks/cloud-service/workers-static-assets plugins/stackgen/stacks/bundles/cloudflare-*.md`
  — every hit is in the provider pack and says Pages is superseded or declined;
  **no** hit says "planned".
- `grep -rln 'Durable Objects, Queues, Images and Stream' plugins/stackgen/stacks`
  is empty (the old list is gone everywhere).
- `grep -c '^|' plugins/stackgen/stacks/cloud-provider/cloudflare/skills/cloudflare/references/local-development-map.md`
  grew by at least 8 (seven service rows plus one, minus the removed catch-all).
- `mise run plugins:check` exits 0 (rule 4: every edited SKILL.md still parses
  as strict YAML; rule 12: no retired vocabulary).
- `git diff --stat` lists at most nine files, all under the Owns list.

## Guardrails

- Do not create a new file anywhere. Do not touch `pack.yaml` in any pack. Do
  not edit any line in the seven non-provider files other than the reservation
  passage — in particular, not the "both Workers packs" or `assets.directory`
  prose, which the docs of this repo cite by heading.
- Do not write per-service doctrine into the provider pack: cost, identity,
  local-dev detail per service belongs to U3–U9's packs, which cite the
  provider. If a sentence you want to write starts with a service name and ends
  with a binding key, it is theirs.
- `plugins/**/*.md` is not dprint-formatted — hand-fold to the surrounding
  width; match the existing table alignment in the local-development map.
- `cat` is aliased to `bat` on this machine: Edit, never heredocs.
- No repo names, account ids or domains in shipped files.

## Commit

`feat(stackgen): narrow the Cloudflare provider's scope — shipped, planned, declined`
— written by the orchestrator after the wave gate, not by the unit.
