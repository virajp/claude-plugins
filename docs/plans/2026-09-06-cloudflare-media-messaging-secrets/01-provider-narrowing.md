# U1 — The provider pack's scope: four more shipped

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/cloud-provider/cloudflare/**` (edit in
  place — no new files). Touch nothing outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom, as plan A's U2 left them —
  `conventions.md` (the three-list scope paragraph),
  `skills/cloudflare/SKILL.md` (the scope sentences),
  `skills/cloudflare/references/local-development-map.md` (the service table).
  Then `ls plugins/stackgen/stacks/cloud-service/` to see which Cloudflare packs
  exist **on disk right now** — plans B and C may or may not have landed.
- **Lazy-load:** `plugins/stackgen/assets/kinds.md:222-237` (the four provider
  topics — the map stays a provider artifact); Context7
  `/websites/developers_cloudflare` for the one-line local-development fact per
  service you add.

## Ruling

D7: "One unit updates the provider pack's three lists: shipped = every
Cloudflare `cloud-service` pack on disk at run time plus this plan's four;
planned = the remainder of the twenty, derived from disk; if none remain, the
planned clause is dropped and the paragraph says the platform coverage is
complete; declined unchanged. Four local-development-map rows."

The twenty, for deriving the remainder: Workers KV, R2, D1, Hyperdrive,
Vectorize, Pipelines, Analytics Engine (plan A); Durable Objects, Workflows,
Containers, Queues (plan B); Workers AI, AI Gateway, AI Search, Browser
Rendering, the Agents SDK (plan C — the SDK is a `framework/cloudflare-agents`
pack, so look under `stacks/framework/` for it); Images, Realtime, Email
Service, Secrets Store (this plan). Plus the three that predate all four plans:
Zero Trust Access, Workers Static Assets, Workers SSR.

The declined list is plan A's and does not change: Pages, Workers Sites, Stream,
Turnstile, and the account-level products.

## Edits

1. **`conventions.md`** — the scope paragraph. Move Images, Realtime, Email
   Service and Secrets Store from "planned" to "shipped". Recompute "planned"
   from disk per the Ruling. If nothing remains planned, drop the clause and
   replace it with one sentence that the developer-platform coverage the
   twenty-service effort set out to ship is complete, and that any service not
   named is declined or out of scope — never silently missing. Add one sentence,
   in the provider's voice, that the runtime secrets binding (Secrets Store) and
   the repo's secrets provider (`fnox`, on the capability axis) are two
   different things that coexist — pointing at the Secrets Store pack for the
   doctrine, not restating it.
2. **`skills/cloudflare/SKILL.md`** — the scope sentences, same three lists
   compressed to the router's register. Keep the frontmatter valid strict YAML;
   update the description if it names services.
3. **`skills/cloudflare/references/local-development-map.md`** — four new rows,
   one per service, each a provider-level fact verified against Context7 and
   cited: Images (transformations from `wrangler dev` — local or remote — as
   stated); Realtime (no local form; the REST API is remote); Email Service (no
   local form for receive; what `wrangler dev` does with a `send_email` binding,
   as stated); Secrets Store (what `wrangler dev` does with a
   `secrets_store_secrets` binding locally — a local value file or `--remote` —
   as stated). Keep existing rows. If the "planned" row from plan A's U2 is now
   empty, remove it; keep the declined row.

## Verification

- `grep -n 'Secrets Store\|Realtime\|Email Service\|Images' plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md`
  — each appears in the shipped list, none in a planned list.
- The planned list, if present, names only services with **no** pack directory
  under `stacks/cloud-service/` or `stacks/framework/` — check each name against
  `ls`.
- `grep -c '^|' plugins/stackgen/stacks/cloud-provider/cloudflare/skills/cloudflare/references/local-development-map.md`
  grew by 4 (or 3, if the planned row was removed).
- `mise run plugins:check` exits 0 (rule 4 on `SKILL.md`; rule 12).
- `git diff --stat` lists only files under the Owns path.

## Guardrails

- Do not create a new file. Do not touch `pack.yaml`. Do not edit any other pack
  or bundle — the six former duplicate passages are pointer sentences now and
  need nothing.
- Do not write per-service doctrine here; the four packs (U2–U5) own it.
- `plugins/**/*.md` is not dprint-formatted — hand-fold; match the table
  alignment.
- `cat` is aliased to `bat`: Edit, never heredocs.
- No repo names, account ids or domains.

## Commit

`feat(stackgen): the Cloudflare provider's scope — media, messaging and secrets shipped`
— written by the orchestrator after the wave gate, not by the unit.
