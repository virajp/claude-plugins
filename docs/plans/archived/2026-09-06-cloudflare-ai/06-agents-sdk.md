# U6 — The `framework/cloudflare-agents` pack and the `typescript-cloudflare-agents` bundle

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/framework/cloudflare-agents/**` (all new)
  and `plugins/stackgen/stacks/bundles/typescript-cloudflare-agents.md` (new).
  Touch nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/framework/effect/**` top to bottom
  (`pack.yaml` — the field set and the `# Topic 2 of the language-bundle bar`
  comment; `conventions.md`; `skills/effect/SKILL.md` — the paths-scoped,
  `user-invocable: false` frontmatter and the "Layers on the TypeScript
  baseline" opening; the three `references/`);
  `plugins/stackgen/stacks/framework/astro/**` (the same shape with eight
  references, `framework-doctrine.md` first — how a framework pack with more
  than one shape lays its doctrine out; its `paths:` include config-file globs,
  the precedent for D8);
  `plugins/stackgen/stacks/bundles/typescript-effect-hono.md` top to bottom (the
  bundle template); `plugins/stackgen/assets/kinds.md:50-135` (the
  `language-bundle` kind: axis, structure, scope "never API reference",
  invocation "routers paths-scoped", the twelve-topic bar — topic 2 is yours);
  `plugins/stackgen/assets/pack-format.md:144-234` (`pack.yaml` fields; the
  bundle file; `platforms:` is project-axis only, `:159`, `:203`);
  `plugins/stackgen/assets/taxonomy.md` (the `agent-sdk` framework token);
  `plugins/stackgen/stacks/cloud-service/durable-objects/**` (plan B's pack —
  the object an agent is; read for the binding and migration shape it documents,
  cite it by path, never edit);
  `plugins/stackgen/stacks/cloud-service/workers-ssr/**` (the deploy pack whose
  `wrangler.jsonc` hosts the agent's Worker; read, never edit).
- **Lazy-load:** Context7 `/websites/developers_cloudflare` — the `agents`
  section — for every Agents SDK fact; resolve the `agents` npm package as a
  Context7 library too and prefer whichever is more current; fallback
  `/cloudflare/cloudflare-docs`.

## Ruling

D6, the user's choice: "Framework pack + language bundle (Recommended) —
`framework/cloudflare-agents` (new framework category `agent-sdk`) plus a
`typescript-cloudflare-agents` language bundle so it is actually pinnable."
Rejected: "Framework pack only, no bundle" (repeats the python-packs gap:
authored, reachable by nobody); "Park it". Pack: `type: framework`,
`category: agent-sdk`, `kind: language-bundle`, `axis: project`, `harness: n/a`.
Bundle: `kind: language-bundle`, `axis: project`, `platforms: [service]`,
components exactly those of `typescript-effect-hono` with both frameworks
replaced by `framework/cloudflare-agents@0.1.0`.

D7: "Topic-driven, as `framework/effect` and `framework/astro` lay theirs out —
**not** the five service topics. Expected set: the Agent class model and state;
the Durable Object it compiles to and the `wrangler.jsonc` binding + migration;
client connection and WebSocket patterns; scheduling; testing. The unit may
merge or split by what Context7 shows, recording the final set as `DECIDED:`."

D8: "Paths-scoped and `user-invocable: false`, in the effect/astro frontmatter
shape; opens with the 'Layers on the TypeScript baseline' sentence. Paths: the
TypeScript globs plus `**/wrangler.jsonc` and `**/wrangler.toml` (the agent's
binding and migration live there) — the unit confirms the astro precedent of
adding config-file globs."

D9: "The bundle prose states it pairs with `cloudflare-workers-ssr` on the
deploy axis (the Worker that hosts the agent) and `cloudflare-durable-objects`
on the backing axis (B's pack; the object the agent is). It does not add those
components to its own `components:` list — axes are lists and the project pins
them."

D12 (as it applies here): "Service packs: exactly five, named … The framework
pack: per D7."

D3 (as it applies here): the framework pack ships no `config/` — language-bundle
packs never do. D4: no contract. D5: a framework pack has **no `capability`
field at all** (`effect/pack.yaml`). D11: the pack directory and the skill are
both `cloudflare-agents` ("a framework slug carries the vendor because `agents`
alone is a generic noun"). D13: every fact verified against Context7 and cited
by URL. D17: version `0.1.0`.

From `kinds.md:50-135`, binding here verbatim: scope is "layout, idioms, testing
shape, placement. Never API reference (Context7 serves that at use time), never
the datastore's or cloud's judgment."

## Edits

1. **`pack.yaml`** — `name: Cloudflare Agents SDK`; `summary` in the effect
   pack's voice (the `agents` package as the shape of a stateful, addressable
   agent on Workers — an `Agent` class that is a Durable Object with state, SQL,
   schedules and live connections, and the client that talks to it);
   `version: 0.1.0`; `type: framework`; `category: agent-sdk`;
   `kind: language-bundle`; `axis: project`; the comment
   `# Topic 2 of the language-bundle bar — one artifact per detected framework.`
   exactly as `effect/pack.yaml:8-10` carries it; `harness: n/a`. No
   `capability`, no `artifact`, no `platforms` (platforms are the bundle's).
2. **`conventions.md`** — the component's prose, in the effect `conventions.md`
   register: what the SDK is and what it layers on (TypeScript with `strict`; a
   Worker; a Durable Object namespace — the binding and migration the agent
   class needs in `wrangler.jsonc`, quoted as the shape the project writes into
   the Workers pack's file, with a sentence that the deploy pack owns the file);
   the Agent class as the unit of design (one agent class per addressable thing,
   state shape, when SQL storage over the state object); how clients connect
   (the SDK's client, WebSocket, the React hooks named as an option — not a
   React pack); scheduling and its idempotency; what it is not (a workflow
   engine — Workflows, plan B's; a chat UI); the pairing sentences of D9 with
   the two bundle slugs; one pointer sentence to the provider conventions for
   scope.
3. **`skills/cloudflare-agents/SKILL.md`** — the router. Frontmatter in the
   effect/astro shape: `name: cloudflare-agents`, `version: 0.1.0`,
   `category: development`, `description` (in astro's register, ending with the
   "Auto-applies when editing …" clause), `license: MIT`,
   `user-invocable: false`, `allowed-tools`, and `paths:` — the TypeScript globs
   effect uses plus `"**/wrangler.jsonc"` and `"**/wrangler.toml"` (D8; confirm
   astro's `astro.config.*` glob is the precedent and note it in `DECIDED:`).
   Body opens with "Layers on the TypeScript baseline — read that skill's
   standards first; this adds to them and replaces none of them." then one bold
   sentence stating the SDK's hard requirement (an agent **is** a Durable
   Object: no agent without the binding and migration), then the "read one, not
   all" table with one row per reference.
4. **`skills/cloudflare-agents/references/`** — per D7, topic-driven. Plan the
   set from what Context7 shows, starting from: `agent-model.md` (the Agent
   class, state, SQL storage, lifecycle hooks), `durable-object-wiring.md` (the
   `durable_objects.bindings` + `migrations` entries, `new_sqlite_classes` or
   whatever the docs require, addressing by name/id, cite plan B's Durable
   Objects pack for the object's own doctrine), `connections.md` (the client
   SDK, WebSocket and HTTP patterns, auth at the connection), `scheduling.md`
   (`schedule`, cron-like and delayed tasks, idempotency), `testing.md` (the
   testing shape — `@cloudflare/vitest-pool-workers` or whatever Cloudflare
   documents for Durable Object tests, verified; what to test in-process vs
   against `wrangler dev`). Merge or split as the docs warrant; record the final
   list in `DECIDED:`. Every file individually researched and cited by URL;
   **never API reference** — patterns, placement and judgment, with Context7
   named as where the API lives at use time.
5. **`plugins/stackgen/stacks/bundles/typescript-cloudflare-agents.md`** —
   frontmatter exactly: `name: TypeScript · Cloudflare Agents`, `axis: project`,
   `kind: language-bundle`, `components:` — `language/typescript@0.1.0`,
   `package-manager/pnpm@0.1.0`, `toolchain-gate/tsconfig@0.1.0`,
   `toolchain-gate/eslint@0.1.0`, `framework/cloudflare-agents@0.1.0` — in that
   order; `platforms:` — `service`. No `artifact:`, no `unconditional:`. Body in
   the `typescript-effect-hono.md` register: the heading
   `# Project — TypeScript · Cloudflare Agents` (match the sibling's heading
   form exactly), what the composition is and why five components, what a
   project pinning it gets, and D9's two pairing sentences naming
   `cloudflare-workers-ssr` (deploy) and `cloudflare-durable-objects` (backing)
   as the pins that make the agent deployable and real — stated as pairings the
   project pins on those axes, not as components here.

## Verification

- `find plugins/stackgen/stacks/framework/cloudflare-agents -name config` is
  empty.
- `grep -n '^type: framework$\|^category: agent-sdk$\|^kind: language-bundle$\|^axis: project$\|^harness: n/a$' plugins/stackgen/stacks/framework/cloudflare-agents/pack.yaml`
  hits five lines; `grep -c 'capability\|artifact\|platforms' pack.yaml` is 0.
- `grep -n '^user-invocable: false$' …/skills/cloudflare-agents/SKILL.md` hits
  once; `grep -n 'wrangler.jsonc' SKILL.md` hits in `paths:`.
- `ls …/skills/cloudflare-agents/references/ | wc -l` ≥ 4, and every filename is
  named in the router table.
- `grep -c '^- framework/cloudflare-agents@0.1.0$' plugins/stackgen/stacks/bundles/typescript-cloudflare-agents.md`
  is 1; `grep -c '^- language/typescript@0.1.0$' …` is 1;
  `grep -c '^platforms:' …` is 1; `grep -c '^artifact:' …` is 0.
- `grep -c 'cloudflare-workers-ssr\|cloudflare-durable-objects' plugins/stackgen/stacks/bundles/typescript-cloudflare-agents.md`
  ≥ 2 (D9).
- `mise run plugins:check` exits 0 (rule 4 strict-YAML on the paths-scoped
  router; rule 12 vocabulary); `plugins:inventory --check` fails with exactly
  your pack row and bundle row (expected; do not regenerate — U8's).
- No repo names, account ids or domains; every reference cites a
  `developers.cloudflare.com` URL (or the `agents` package docs' URL).

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**`, any
  `cloud-service/` pack (plan B's `durable-objects` and the Workers packs are
  cited by path only), `framework/effect/**`, `framework/astro/**`, any existing
  bundle, any doc, `inventory.md`, `plugin.json`.
- Do not add `cloud-service/*` or `cloud-provider/*` components to the bundle
  (D9). Do not add a `capability` or `artifact` field to the framework pack.
- Do not write Durable Objects or Workers doctrine — cite those packs by path.
  Do not write API reference — the kind forbids it; patterns and placement only.
- Do not write a `framework/react` pack or React doctrine beyond naming the
  SDK's React hooks as a client option (parked).
- If Context7 shows the `agents` package's current shape contradicts the
  expected reference set, follow Context7 and record `DECIDED:`; if it shows the
  SDK is not a Durable-Object framework at all any more, return `UNRESOLVED:`.
- `plugins/**/*.md` is not dprint-formatted — hand-fold. `cat` is aliased to
  `bat`: Write/Edit, never heredocs. A pipe containing `npm` is rewritten to
  `pnpm` by a hook — write `pnpm add agents` / `npx wrangler` lines with Write
  and check the file after.
- Strict-YAML frontmatter: a rejected `SKILL.md` is dropped silently — the
  `paths:` list must be a proper YAML sequence of quoted globs as effect's is.
- No absolute paths, repo names, account ids or domains in shipped files.

## Commit

`feat(stackgen): add the Cloudflare Agents SDK framework pack and the typescript-cloudflare-agents bundle`
— written by the orchestrator after the wave gate, not by the unit.
