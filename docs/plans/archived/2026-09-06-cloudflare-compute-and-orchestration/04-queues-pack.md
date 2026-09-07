# U4 — The `cloud-service/queues` pack and the `cloudflare-queues` bundle

- **Wave:** 2
- **Depends on:** U1 (the narrowed provider scope you cite)
- **Owns:** `plugins/stackgen/stacks/cloud-service/queues/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-queues.md` (new). Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling's shape);
  `plugins/stackgen/stacks/cloud-service/cloud-sql/pack.yaml` and
  `plugins/stackgen/stacks/cloud-service/r2/**` (plan A's R2 pack — you cite its
  event-notifications paragraph by path as a producer, never restate it);
  `plugins/stackgen/assets/contracts/orchestration.md` (the contract you cite —
  read it whole); `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `plugins/stackgen/stacks/bundles/cloudflare-kv.md`;
  `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as U1 left it;
  `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`, `:266-267`;
  `plugins/stackgen/assets/taxonomy.md` (the `queue` token and the capability
  seam: "a `queue` component `message-queue` or `pub-sub`").
- **Lazy-load:** `plugins/vwf/assets/capability-vocabulary.md:27-41`
  (`message-queue`, prose noun "the queue"); Context7
  `/websites/developers_cloudflare` for every Queues fact.

## Ruling

B2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`name: Cloudflare <Service>`. Three are `axis: backing` with **no `artifact:`
key**." Queues is one of the three.

B3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md`."

B5: "Workflows and Queues cite `assets/contracts/orchestration.md` clause by
clause (… Queues for `message-queue`)."

B6: "Queues `message-queue`." Rejected: `pub-sub` — Queues delivers each message
to one consumer; a fan-out topic is not what it is.

B8: "Router skill directory and `name:` are `cloudflare-<slug>`:
`cloudflare-queues`." The pack directory is `queues`.

B9: "Backing packs: exactly five, named `pick-and-trade.md`,
`service-doctrine.md`, `cost-shape.md`, `identity-shape.md`, `local-dev.md`."

B10: "Every Cloudflare fact in a pack is verified against Context7
`/websites/developers_cloudflare` (falling back to
`/cloudflare/cloudflare-docs`) at authoring time and cited by URL in the
reference that states it. No fact from memory."

B11: "`harness:` carries `health`, `e2e_staging`, `local_stack`, each
`task: n/a` with honest mechanism prose."

B12: "Packs **cite** the provider pack's identity-and-iam reference for the API
token and account id and never restate them."

B13: "Every new pack and bundle is `0.1.0`."

Plan facts, to verify, not trust: producer bindings are
`queues.producers: [{binding, queue}]`; consumers are
`queues.consumers: [{queue, max_batch_size, max_batch_timeout, max_retries,
dead_letter_queue}]`;
pull consumers exist over HTTP; R2 event notifications can produce to a queue;
`wrangler dev` simulates queues locally.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Queues`; a `summary` in the sibling's
   voice (durable at-least-once messaging between Workers — a producer binding,
   a consumer handler with batches, retries and a dead-letter queue, the place a
   product puts background work it must not lose); `version:
   0.1.0`;
   `type: cloud-service`; `category: queue`; `capability: message-queue`;
   `kind: cloud-provider`; `axis: backing`; **no `artifact:`**; `harness:` per
   B11 — `health` (a queue has no endpoint; the mechanism is the consumer's own
   backlog and age metrics read from the dashboard or API, or a canary message
   with a round-trip assertion — state which and what each proves),
   `e2e_staging` (a queue per environment, bound by name; a suite that sends and
   asserts on the consumer's side effect, never on delivery timing),
   `local_stack` (`wrangler dev` runs producer and consumer locally in one
   process — what is and is not simulated, verified).
2. **`conventions.md`** — what Queues is and is not (not a pub-sub topic; not a
   workflow — cite U3's pack by path); the producer and consumer blocks as the
   shape the project adds to the Workers pack's `wrangler.jsonc` (B3); queue
   naming per environment; message design (small, idempotent, typed; the
   body-size limit as stated); batch and retry configuration and the dead-letter
   queue as a required decision; pull consumers over HTTP and when they fit; R2
   event notifications as a producer — one sentence citing the R2 pack's
   paragraph, no restatement; the `orchestration.md` contract — one paragraph
   saying which clauses this pack satisfies (the `message-queue` ones) and that
   the durable-workflow clauses are Workflows' (cite U3's pack); the scope
   sentence — one pointer to the provider conventions. Cite the provider
   doctrine for cost and identity.
3. **`skills/cloudflare-queues/SKILL.md`** — the router, frontmatter in the
   sibling's exact shape (`name: cloudflare-queues`, `version: 0.1.0`,
   `category: development`, `description`, `license: MIT`, `allowed-tools`),
   model-invocable, not paths-scoped. Five-row table.
4. **`skills/cloudflare-queues/references/`** — the five files of B9:
   - `pick-and-trade.md` — Queues over Workflows (independent messages vs a
     process with steps), over Durable Objects (fan-in of work vs per-key
     coordination — cite U2's pack), over Pipelines (tasks with consumers vs
     events to tables — cite plan A's Pipelines pack by path), over an external
     broker the team runs (cite the `orchestration.md` contract's "pick the
     smallest thing that holds"); when Queues is the wrong answer (ordering
     guarantees, fan-out to many consumers).
   - `service-doctrine.md` — the `orchestration.md` contract's `message-queue`
     clauses walked one by one with how Queues satisfies each; message schema
     and idempotency keys; batch sizing and `max_batch_timeout` trade-offs as
     stated; retries, `retry()` with delay, and the dead-letter queue; ack
     semantics; consumer concurrency as stated; the producer and consumer
     blocks; pull consumers.
   - `cost-shape.md` — the pricing dimensions (operations: write, read, delete;
     the per-message counting rule) as Context7 states them today, the free-tier
     line; cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission a deploy needs (verified
     name), the binding as runtime identity, the pull-consumer credential shape,
     pointer to the provider's identity-and-iam (B12).
   - `local-dev.md` — `wrangler dev`'s local queues (producer and consumer in
     one process; what happens with two Workers), `wrangler queues` subcommands
     the loop uses (create, list, consumer add — verified), the trap that local
     delivery is instant and hides timeout bugs; pointer to the provider's
     local-development-map row. Each reference individually researched against
     Context7 and cited by URL.
5. **`plugins/stackgen/stacks/bundles/cloudflare-queues.md`** — frontmatter
   exactly: `name: Cloudflare Queues`, `axis: backing`, `kind: cloud-provider`,
   `components:` the two refs of B2; no `artifact:`, no `platforms:`, no
   `unconditional:`. Body in the `cloudflare-kv.md` register: a heading
   `# Backing — Cloudflare Queues`, the composition and why two components, what
   pinning it gives a project, a sentence that the consumer lives in a Worker so
   this pin expects a Workers deploy pin beside it, and a sentence that it pins
   beside other backing bundles since the axis is a list (cite `vwf-config.md`'s
   wording).

## Verification

- `ls plugins/stackgen/stacks/cloud-service/queues/skills/cloudflare-queues/references/`
  is exactly the five names of B9.
- `find plugins/stackgen/stacks/cloud-service/queues -name config` is empty.
- `grep -n '^category: queue$'` and `grep -n '^capability: message-queue$'` on
  `pack.yaml` each hit once.
- `grep -rc 'contracts/orchestration.md' plugins/stackgen/stacks/cloud-service/queues`
  ≥ 1, and `service-doctrine.md` names `message-queue`.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-queues.md`
  is 0.
- `mise run plugins:check` exits 0; `mise run plugins:inventory --check` fails
  with exactly your two rows (expected; do not regenerate — U7's).
- `grep -rn "95octane\|virajp\|claude-plugins\|<account" plugins/stackgen/stacks/cloud-service/queues plugins/stackgen/stacks/bundles/cloudflare-queues.md`
  is empty.
- Every reference contains at least one `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**` (plan A's or
  nobody's), any other pack, any other bundle, any doc, `inventory.md`,
  `plugin.json`.
- Do not create a `config/` tier (B3). Do not create a sixth reference (B9).
- Do not name a mise task this pack does not ship (B11). Do not restate the
  credential names or the account-level cost shape — cite the provider (B12).
- Do not restate the `orchestration.md` contract's clauses — cite them. Do not
  write R2, Workflows or Durable Objects doctrine — their packs own it.
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

`feat(stackgen): add the Queues pack and the cloudflare-queues bundle` — written
by the orchestrator after the wave gate, not by the unit.
