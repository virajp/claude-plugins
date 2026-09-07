# U3 — The `cloud-service/realtime` pack and the `cloudflare-realtime` bundle

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/cloud-service/realtime/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-realtime.md` (new). Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling whose `capability` is unset with a
  comment and whose `local_stack` mechanism honestly says "None"); one of plan
  A's packs (e.g. `stacks/cloud-service/kv/**`) for the
  `skills/cloudflare-<slug>/` naming;
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `gcp-cloud-sql.md`; `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as
  U1 left it; `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`;
  `plugins/stackgen/assets/taxonomy.md` (the `realtime` token and the token-less
  paragraph).
- **Lazy-load:** `plugins/vwf/assets/capability-vocabulary.md:27-41`
  (`realtime-sync` — to explain why this pack does **not** carry it); Context7
  `/websites/developers_cloudflare` for every Realtime fact (fallback
  `/cloudflare/cloudflare-docs`).

## Ruling

D2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`axis: backing`, **no `artifact:` key**, `name: Cloudflare <Service>` in the
zero-trust bundle's shape."

D3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md` as the shape to
add to the project's own `wrangler.jsonc`." For Realtime there is **no wrangler
binding** — the pack says so plainly; what a project adds is the app id and the
app secret as configuration and a secret.

D4: Realtime cites no contract.

D6: Realtime `capability` **unset** with the zero-trust comment shape
(`realtime` has no vwf token today). "Realtime's comment says why it is not
`realtime-sync`: that token is data sync, this is media."

D8: router skill directory and `name:` are `cloudflare-realtime`; the pack
directory is `realtime`; the bundle is `cloudflare-realtime`.

D9: "Exactly five per pack, named for the topics: `pick-and-trade.md`,
`service-doctrine.md`, `cost-shape.md`, `identity-shape.md`, `local-dev.md`. No
sixth file."

D10: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` … at authoring time and cited by URL in the
reference that states it. No fact from memory." Calls → Realtime is stated once,
verified.

D11: `harness:` with `health`, `e2e_staging`, `local_stack`, each `task: n/a`
with honest mechanism prose. "Realtime and Email have no local form — the
mechanism says 'None' and how a project substitutes, as `zero-trust-access`
does."

D12: cite the provider's identity-and-iam reference for the account credential;
the Realtime app secret is a secret under the provider's secrets doctrine, with
the Secrets Store pack (`stacks/cloud-service/secrets-store/`, landing in this
same wave) named by path as the runtime home.

D13: version `0.1.0`.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Realtime`; `summary` (a selective
   forwarding unit and TURN service for WebRTC audio, video and data tracks —
   the media plane for calls and live rooms, driven from a Worker over its REST
   API, not a binding); `version: 0.1.0`; `type: cloud-service`;
   `category: realtime`; the `capability` comment per D6 (three or four lines:
   `realtime` has no token; `realtime-sync` is data synchronization over
   WebSockets, which Durable Objects serve — this is media, so it stays unset);
   `kind: cloud-provider`; `axis: backing`; **no `artifact:`**; `harness:` per
   D11 — `health` (an authenticated call to the REST API that creates and tears
   down a session from the consuming Worker's readiness path — what it proves
   and its cost, or a cheaper probe if Cloudflare documents one), `e2e_staging`
   (an app per environment — separate app id and secret; never one app with a
   naming convention), `local_stack` ("None" — the SFU and TURN are remote-only;
   a local run uses a dev app or fakes the media layer behind the seam the
   project already uses; state it as the zero-trust pack does).
2. **`conventions.md`** — what Realtime is (SFU, TURN, the session/track model,
   in the nouns Cloudflare uses today — verify; whether a higher-level SDK such
   as RealtimeKit exists and what it adds, if Context7 documents it); that Calls
   is the older name; that there is **no wrangler binding** — the Worker calls
   the REST API with the app id and a bearer app secret, and the client
   negotiates WebRTC with the SFU; where the app secret lives (D12); the pairing
   rule — signalling and room state usually live in a Durable Object (planned or
   shipped by plan B; cite `stacks/cloud-service/durable-objects/` by path "when
   it exists", never restate); what this pack does not cover (data sync —
   Durable Objects; recorded media storage — R2; one pointer sentence to the
   provider conventions for scope).
3. **`skills/cloudflare-realtime/SKILL.md`** — the router, frontmatter in the
   sibling's exact shape (`name: cloudflare-realtime`, `version: 0.1.0`,
   `category: development`, `description`, `license: MIT`, `allowed-tools`),
   model-invocable, not paths-scoped; five-row table.
4. **`skills/cloudflare-realtime/references/`** — D9's five:
   - `pick-and-trade.md` — Realtime over a third-party WebRTC platform, over
     peer-to-peer WebRTC (when an SFU is needed at all), over Durable Objects
     WebSockets (media vs data — the `realtime-sync` sentence); when the product
     does not need it.
   - `service-doctrine.md` — app creation, the session lifecycle
     (new/renegotiate/close), track publishing and pulling, TURN credentials and
     their expiry, the signalling seam the project owns, error handling and
     reconnection, limits as stated.
   - `cost-shape.md` — pricing dimensions as stated (egress or minutes, TURN
     usage), the free allowance; cite the provider's cost-doctrine.
   - `identity-shape.md` — the app id and app secret (server-side only), the
     API-token permission to create apps (verified), TURN credential generation
     as the client-facing identity, pointer to the provider's identity-and-iam
     and the Secrets Store pack (D12).
   - `local-dev.md` — "None" for a local SFU; a dev app as the substitute, what
     a test can and cannot cover, browser test notes if Cloudflare gives them;
     pointer to the provider's local-development-map row. Each reference
     individually researched against Context7 and cited by URL.
5. **`plugins/stackgen/stacks/bundles/cloudflare-realtime.md`** — frontmatter
   exactly: `name: Cloudflare Realtime`, `axis: backing`,
   `kind: cloud-provider`, two `components`; no `artifact:`, no `platforms:`, no
   `unconditional:`. Body in the `gcp-cloud-sql.md` register:
   `# Backing — Cloudflare Realtime`, what the composition is and why two
   components, what pinning it gives a project, the list-axis sentence (cite
   `vwf-config.md`'s wording), and the pairing sentence: a Realtime pin expects
   a Durable Objects pin beside it for signalling and room state, once that
   bundle exists.

## Verification

- `ls plugins/stackgen/stacks/cloud-service/realtime/skills/cloudflare-realtime/references/`
  is exactly the five names of D9.
- `find plugins/stackgen/stacks/cloud-service/realtime -name config` is empty.
- `grep -n '^category: realtime$' …/realtime/pack.yaml` hits once;
  `grep -c '^capability:' …/pack.yaml` is 0 and the comment mentions
  `realtime-sync`.
- `grep -c 'Calls' -r plugins/stackgen/stacks/cloud-service/realtime` ≥ 1 (the
  rename, stated once).
- `grep -c 'binding' plugins/stackgen/stacks/cloud-service/realtime/conventions.md`
  ≥ 1 — the sentence that there is no wrangler binding.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-realtime.md`
  is 0.
- `mise run plugins:check` exits 0; `plugins:inventory --check` fails with
  exactly your two rows (expected).
- No repo names, account ids, domains or real app ids; every reference cites a
  `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**` (nobody's), any
  other pack, any other bundle, any doc, `inventory.md`, `plugin.json`.
- Do not create a `config/` tier (D3). Do not create a sixth reference (D9).
- Do not name a mise task this pack does not ship (D11). Do not restate the
  credential names or the account-level cost shape — cite the provider (D12).
- Do not write Durable Objects doctrine — plan B's pack owns it; cite by path.
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write `pnpm exec wrangler` / `npx wrangler` lines with
  Write, and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — no tabs,
  quoted strings where a colon appears in a value.
- No absolute paths, repo names, account ids or domains in shipped files.

## Commit

`feat(stackgen): add the Realtime pack and the cloudflare-realtime bundle` —
written by the orchestrator after the wave gate, not by the unit.
