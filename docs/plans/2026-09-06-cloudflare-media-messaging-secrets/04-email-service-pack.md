# U4 — The `cloud-service/email-service` pack and the `cloudflare-email-service` bundle

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/cloud-service/email-service/**` (all new)
  and `plugins/stackgen/stacks/bundles/cloudflare-email-service.md` (new). Touch
  nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling's shape);
  `plugins/stackgen/stacks/cloud-service/cloud-sql/pack.yaml` (a backing pack
  that **sets** `capability`); one of plan A's packs (e.g.
  `stacks/cloud-service/d1/**`) for the `skills/cloudflare-<slug>/` naming;
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as
  U1 left it; `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `messaging` token and the
  capability seam sentence that `messaging` realizes `email`).
- **Lazy-load:** `plugins/vwf/assets/capability-vocabulary.md:27-41` and `:120`
  (`email`, prose noun "the email provider"); Context7
  `/websites/developers_cloudflare` for every Email Service, Email Routing and
  Email Workers fact (fallback `/cloudflare/cloudflare-docs`).

## Ruling

D2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`."

D4: Email Service cites no contract (none exists for `messaging`).

D6: Email Service `capability: email`.

D8: router skill directory and `name:` are `cloudflare-email`; the pack
directory is `email-service`; the bundle is `cloudflare-email-service`.

D9: "Exactly five per pack, named for the topics: `pick-and-trade.md`,
`service-doctrine.md`, `cost-shape.md`, `identity-shape.md`, `local-dev.md`. No
sixth file." "Email's receive side (Routing, Email Workers) … [is a]
**section**, not [a] file."

D10: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` … at authoring time and cited by URL in the
reference that states it. No fact from memory." Email Routing / Email Workers →
Email Service is stated once, verified, including whether Cloudflare still
brands the receive side separately.

D11: `harness:` with `health`, `e2e_staging`, `local_stack`, each `task: n/a`
with honest mechanism prose. "Realtime and Email have no local form — the
mechanism says 'None' and how a project substitutes, as `zero-trust-access`
does." If Context7 shows `wrangler dev` does something with a `send_email`
binding locally, state that instead — honestly.

D12: cite the provider's identity-and-iam reference for the account credential;
DKIM material and any API key are secrets under the provider's secrets doctrine,
with the Secrets Store pack (`stacks/cloud-service/secrets-store/`, this wave)
named by path as the runtime home.

D13: version `0.1.0`.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Email Service`; `summary` (send
   transactional email from a Worker and receive it into one — the product's
   email provider on its own domain, with routing rules, DKIM and SPF handled at
   the zone); `version: 0.1.0`; `type: cloud-service`; `category: messaging`;
   `capability: email`; `kind: cloud-provider`; `axis: backing`; **no
   `artifact:`**; `harness:` per D11 — `health` (what proves sending works
   without sending — a binding presence check, or a send to a sink address the
   environment owns, and its trap; receive health is the routing rule's status
   as observable via API, if documented), `e2e_staging` (a subdomain or separate
   zone per environment with its own DNS records; a sink mailbox for assertions;
   never real recipients), `local_stack` ("None" for receive; for send, whatever
   `wrangler dev` does with the binding, verified; the substitute is a stub
   behind the project's mail seam).
2. **`conventions.md`** — what Email Service is, and that Email Routing and
   Email Workers are its receive side (the rename, once); the send side: the
   `send_email` binding shape as verified (`send_email: [{name, …}]` with
   `destination_address` / `allowed_destination_addresses` if those are the
   current keys), the message construction the docs recommend, the
   allowed-destination rules; the receive side: routing rules to a Worker, the
   `email()` handler, forwarding and rejecting; the DNS the zone needs (MX, SPF,
   DKIM as Cloudflare states — never invented record values); the binding block
   as the shape the project adds to the Workers pack's `wrangler.jsonc` (D3);
   what this pack does not cover (marketing/bulk sending — say whether the
   product is transactional-only per Cloudflare; push and SMS — other
   `messaging` providers) with one pointer sentence to the provider conventions
   for scope.
3. **`skills/cloudflare-email/SKILL.md`** — the router, frontmatter in the
   sibling's exact shape (`name: cloudflare-email`, `version: 0.1.0`,
   `category: development`, `description`, `license: MIT`, `allowed-tools`),
   model-invocable, not paths-scoped; five-row table.
4. **`skills/cloudflare-email/references/`** — D9's five:
   - `pick-and-trade.md` — Email Service over a third-party transactional
     provider (domain already on Cloudflare, the binding, no API key in the
     Worker) and where a third party still wins (templates, analytics,
     deliverability tooling, volume); receive via Email Workers vs a mailbox
     provider's webhooks.
   - `service-doctrine.md` — send: the binding, message construction,
     destination rules, idempotency and retries as judgment; receive: routing
     rules, the `email()` handler, parsing, forwarding, rejecting, the
     receive-side section; DNS records and verification; the `email` capability
     clause this realizes (no contract file — say so in one sentence).
   - `cost-shape.md` — pricing dimensions as stated (messages sent, received;
     any free allowance); cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission for Email (verified), DKIM
     as a secret at the zone, the binding as runtime identity, pointer to the
     provider's identity-and-iam and the Secrets Store pack (D12).
   - `local-dev.md` — the send-side local behaviour as verified, "None" for
     receive, the stub-behind-the-seam substitute, a sink mailbox for staging;
     pointer to the provider's local-development-map row. Each reference
     individually researched against Context7 and cited by URL.
5. **`plugins/stackgen/stacks/bundles/cloudflare-email-service.md`** —
   frontmatter exactly: `name: Cloudflare Email Service`, `axis: backing`,
   `kind: cloud-provider`, two `components`; no `artifact:`, no `platforms:`, no
   `unconditional:`. Body in the `gcp-cloud-sql.md` register:
   `# Backing — Cloudflare Email Service`, the composition and why two
   components, what pinning it gives a project (the `email` capability), the
   list-axis sentence (cite `vwf-config.md`'s wording), and a sentence that the
   zone's DNS is the one thing the pin cannot lay down for the project.

## Verification

- `ls plugins/stackgen/stacks/cloud-service/email-service/skills/cloudflare-email/references/`
  is exactly the five names of D9.
- `find plugins/stackgen/stacks/cloud-service/email-service -name config` is
  empty.
- `grep -n '^category: messaging$'` and `grep -n '^capability: email$'` on
  `…/email-service/pack.yaml` each hit once.
- `grep -c 'Email Routing' -r plugins/stackgen/stacks/cloud-service/email-service`
  ≥ 1 (the receive side named).
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-email-service.md`
  is 0.
- `mise run plugins:check` exits 0; `plugins:inventory --check` fails with
  exactly your two rows (expected).
- No repo names, account ids, domains or real addresses (use `example.com` and
  RFC 2606 names only); every reference cites a `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**` (nobody's), any
  other pack, any other bundle, any doc, `inventory.md`, `plugin.json`.
- Do not create a `config/` tier (D3). Do not create a sixth reference (D9).
- Do not name a mise task this pack does not ship (D11). Do not restate the
  credential names or the account-level cost shape — cite the provider (D12).
- Do not invent DNS record values; quote Cloudflare's or describe the shape.
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write `pnpm exec wrangler` / `npx wrangler` lines with
  Write, and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids or domains in shipped files.

## Commit

`feat(stackgen): add the Email Service pack and the cloudflare-email-service bundle`
— written by the orchestrator after the wave gate, not by the unit.
