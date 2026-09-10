# U3 — The `cloud-service/workflows` pack and the `cloudflare-workflows` bundle

- **Wave:** 2
- **Depends on:** U1 (the narrowed provider scope you cite)
- **Owns:** `plugins/stackgen/stacks/cloud-service/workflows/**` (all new) and
  `plugins/stackgen/stacks/bundles/cloudflare-workflows.md` (new). Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/cloud-service/zero-trust-access/**`
  top to bottom (the Cloudflare sibling's shape);
  `plugins/stackgen/stacks/cloud-service/cloud-sql/pack.yaml` and
  `plugins/stackgen/stacks/cloud-service/d1/**` (backing packs that **set**
  `capability` and cite a contract clause by clause — match the seam, not the
  facts); `plugins/stackgen/assets/contracts/orchestration.md` (the contract you
  cite — read it whole);
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md` and
  `plugins/stackgen/stacks/bundles/cloudflare-kv.md` (bundle frontmatter and
  prose register); `plugins/stackgen/stacks/cloud-provider/cloudflare/**` as U1
  left it (what you cite, never restate);
  `plugins/stackgen/assets/kinds.md:186-281`;
  `plugins/stackgen/assets/pack-format.md:144-234`, `:266-267` (cite, do not
  restate, a contract); `plugins/stackgen/assets/taxonomy.md` (the
  `orchestration` token and the capability seam).
- **Lazy-load:** `plugins/vwf/assets/capability-vocabulary.md:27-41`
  (`durable-workflows`, prose noun "the worker (by registry project)"); Context7
  `/websites/developers_cloudflare` for every Workflows fact.

## Ruling

B2: "One bundle per service: `cloudflare-<slug>`, kind `cloud-provider`,
components `cloud-provider/cloudflare@0.1.0` + `cloud-service/<slug>@0.1.0`,
`name: Cloudflare <Service>`. Three are `axis: backing` with **no `artifact:`
key**." Workflows is one of the three.

B3: "Backing-service packs ship **no `config/`**; the wrangler binding block a
project adds lives in `service-doctrine.md` and `local-dev.md`."

B5: "Workflows and Queues cite `assets/contracts/orchestration.md` clause by
clause (Workflows for `durable-workflows` …)."

B6: "Workflows `durable-workflows`."

B8: "Router skill directory and `name:` are `cloudflare-<slug>`:
`cloudflare-workflows`." The pack directory is `workflows`.

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

Plan facts, to verify, not trust: the binding is
`workflows: [{name, binding,
class_name}]`; steps retry, `sleep` and
`waitForEvent` are durable; `WorkflowInstance.status()` reads instance status;
`wrangler workflows` has subcommands for instances; `wrangler dev` runs
Workflows locally.

## Edits

1. **`pack.yaml`** — `name: Cloudflare Workflows`; a `summary` in the sibling's
   voice (durable multi-step execution bound to a Worker — steps that retry,
   sleep for days and wait for an external event without holding compute, the
   place a product puts a process that must finish once it has started);
   `version: 0.1.0`; `type: cloud-service`; `category: orchestration`;
   `capability: durable-workflows`; `kind: cloud-provider`; `axis: backing`;
   **no `artifact:`**; `harness:` per B11 — `health` (a Workflow has no
   endpoint; the mechanism is creating and polling a trivial instance from the
   consuming Worker's readiness path, or reading a recent instance's status —
   state which and what it proves), `e2e_staging` (the class lives in the
   Worker, so a staging Worker has its own instances; the suite creates
   instances and asserts on status, never on wall-clock), `local_stack`
   (`wrangler dev` runs Workflows locally — how `sleep` and `waitForEvent`
   behave locally, verified).
2. **`conventions.md`** — what Workflows is and is not (not a queue — Queues,
   cite U4's pack by path; not a cron — scheduled triggers start a Workflow,
   they are not one); the binding block (`workflows` with `name`, `binding`,
   `class_name`) as the shape the project adds to the Workers pack's
   `wrangler.jsonc` (B3), with a sentence that the class must be exported from
   the Worker named by `main`; step design (idempotent steps, the
   step-name-as-checkpoint rule, retry configuration, `sleep`, `waitForEvent`
   and who sends the event); instance ids and dedupe; the `orchestration.md`
   contract — one paragraph saying which clauses this pack satisfies (the
   `durable-workflows` ones) and that the queue and pub-sub clauses are Queues'
   (cite U4's pack); the scope sentence — one pointer to the provider
   conventions. Cite the provider doctrine for cost and identity.
3. **`skills/cloudflare-workflows/SKILL.md`** — the router, frontmatter in the
   sibling's exact shape (`name: cloudflare-workflows`, `version: 0.1.0`,
   `category: development`, `description`, `license: MIT`, `allowed-tools`),
   model-invocable, not paths-scoped. Five-row table.
4. **`skills/cloudflare-workflows/references/`** — the five files of B9:
   - `pick-and-trade.md` — Workflows over Queues (a process with steps and state
     vs independent messages with consumers), over Durable Objects with alarms
     (a run that ends vs a coordinator that lives — cite U2's pack by path),
     over an external orchestration engine the team runs (cite the
     `orchestration.md` contract's "pick the smallest thing that holds"
     section); when Workflows is the wrong answer (sub-second latency, unbounded
     fan-out).
   - `service-doctrine.md` — the `orchestration.md` contract's
     `durable-workflows` clauses walked one by one with how Workflows satisfies
     each; step idempotency and naming; retry and backoff configuration as
     stated; `sleep`/`waitForEvent` limits as stated; instance lifecycle
     (create, status, pause, terminate, restart); versioning a Workflow class
     while instances are in flight; the binding block.
   - `cost-shape.md` — the pricing dimensions (requests, CPU time, storage of
     step state) as Context7 states them today, the free-tier line, and that
     sleeping costs no compute; cite the provider's cost-doctrine.
   - `identity-shape.md` — the API-token permission a deploy needs (verified
     name), the binding as runtime identity, who may send `waitForEvent` events
     and how that is authenticated, pointer to the provider's identity-and-iam
     (B12).
   - `local-dev.md` — `wrangler dev`'s local Workflows, `wrangler workflows`
     subcommands the loop uses (trigger, describe, list — verified),
     fast-forwarding sleeps locally if Cloudflare documents it (else say it does
     not), resetting local state; pointer to the provider's
     local-development-map row. Each reference individually researched against
     Context7 and cited by URL.
5. **`plugins/stackgen/stacks/bundles/cloudflare-workflows.md`** — frontmatter
   exactly: `name: Cloudflare Workflows`, `axis: backing`,
   `kind: cloud-provider`, `components:` the two refs of B2; no `artifact:`, no
   `platforms:`, no `unconditional:`. Body in the `cloudflare-kv.md` register: a
   heading `# Backing — Cloudflare Workflows`, the composition and why two
   components, what pinning it gives a project, a sentence that the class lives
   in the project's Worker so this pin expects a Workers deploy pin beside it,
   and a sentence that it pins beside other backing bundles since the axis is a
   list (cite `vwf-config.md`'s wording).

## Verification

- `ls plugins/stackgen/stacks/cloud-service/workflows/skills/cloudflare-workflows/references/`
  is exactly the five names of B9.
- `find plugins/stackgen/stacks/cloud-service/workflows -name config` is empty.
- `grep -n '^category: orchestration$'` and
  `grep -n '^capability: durable-workflows$'` on `pack.yaml` each hit once.
- `grep -rc 'contracts/orchestration.md' plugins/stackgen/stacks/cloud-service/workflows`
  ≥ 1, and `service-doctrine.md` names `durable-workflows`.
- `grep -c '^artifact:' plugins/stackgen/stacks/bundles/cloudflare-workflows.md`
  is 0.
- `mise run plugins:check` exits 0; `mise run plugins:inventory --check` fails
  with exactly your two rows (expected; do not regenerate — U7's).
- `grep -rn "95octane\|virajp\|claude-plugins\|<account" plugins/stackgen/stacks/cloud-service/workflows plugins/stackgen/stacks/bundles/cloudflare-workflows.md`
  is empty.
- Every reference contains at least one `developers.cloudflare.com` URL.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U1's), `assets/**` (plan A's or
  nobody's), any other pack, any other bundle, any doc, `inventory.md`,
  `plugin.json`.
- Do not create a `config/` tier (B3). Do not create a sixth reference (B9).
- Do not name a mise task this pack does not ship (B11). Do not restate the
  credential names or the account-level cost shape — cite the provider (B12).
- Do not restate the `orchestration.md` contract's clauses — cite them and say
  how Workflows satisfies each. Do not write Queues or Durable Objects doctrine
  — U4 and U2 own those.
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

`feat(stackgen): add the Workflows pack and the cloudflare-workflows bundle` —
written by the orchestrator after the wave gate, not by the unit.
