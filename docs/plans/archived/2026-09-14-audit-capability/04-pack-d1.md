# U4 — the `audit-store-d1` pack, its bundle, the inventory

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/capability-provider/audit-store-d1/**`
  (new), `plugins/stackgen/stacks/bundles/audit-store-d1.md` (new),
  `plugins/stackgen/stacks/inventory.md` (generated)
- **Model:** opus
- **Read first:** the `otel-lgtm` pack whole
  (`plugins/stackgen/stacks/capability-provider/otel-lgtm/` — `pack.yaml`,
  `conventions.md`, `skills/otel-lgtm/SKILL.md`, every file under `references/`)
  — it is the template; `plugins/stackgen/stacks/bundles/otel-lgtm.md`;
  `plugins/stackgen/assets/kinds.md` 624–694 (the six topics) and 1023–1026 (the
  reviewer bar); `plugins/stackgen/assets/pack-format.md` 150–174 and 260–289;
  the `d1` pack's `pack.yaml`, `conventions.md` and its
  `references/pick-and-trade.md` and `local-dev.md` (the store this rides).
- **Lazy-load:** `plugins/stackgen/assets/contracts/audit.md` **if U3 has
  written it by the time you read** — otherwise take the invariants from
  decision 6 below and cite the contract by role; `contracts/datastore.md`;
  `.claude/skills/plugin-authoring/references/checks.md` 150–184 (rule 13).

## Ruling

Decision 2: "One `capability-provider` pack per store under a new category
**`audit`**, each riding an existing datastore pack and claiming
`capability: audit-store`. First two: `audit-store-d1` (rides
`cloud-service/d1`) and `audit-store-postgres` … each `0.1.0` with its own
bundle."

Decision 6: "Doctrine and the six-topic references only, modelled on
`otel-lgtm`; no `config/` payload. The append-only schema, the insert-only role
and the console-only read grants are described; the target repo's plan writes
the migration. Harness `local_stack: n/a` with the reason — the datastore pack's
own local stack serves."

Decision 9: "Each pack unit regenerates and owns `stacks/inventory.md`".

Decision 10: "The pack units read the current D1 and Postgres documentation
through the Context7 tools before writing grants, roles and append-only
patterns; never from training knowledge."

Decision 12: "… the store is 'the audit store' … No file says 'audit trail'."

## Edits

0. **Research first.** Resolve the Cloudflare D1 library id with the Context7
   tools and query its docs for: the SQL dialect's support for triggers or
   constraints that refuse `UPDATE`/`DELETE` on a table, whether per-role grants
   exist (D1 has no roles — the binding is the principal, so append-only is
   enforced at the schema by triggers and at the seam by the Worker that owns
   the binding), time-travel and export for retention, and read isolation
   between Workers. Record what you relied on in `contract-satisfaction.md`.
1. **`pack.yaml`** — `name: Audit store · Cloudflare D1`; `summary:` one
   sentence (an isolated, append-only audit dataset in D1 read only by the
   console Worker); `version: 0.1.0`; `type: capability-provider`;
   `category: audit`; `capability: audit-store`; `kind: capability-provider`;
   `axis: backing`; `harness:` with `local_stack: {task: n/a, mechanism: …}`
   giving the reason — the D1 binding's local simulation is the local stack and
   the d1 pack declares it. No `artifact`.
2. **`conventions.md`** — the pack's rules in one page, as `otel-lgtm`'s: a
   dedicated D1 database for audit (never a table in the product database); the
   console Worker is the only binding holder; the writer seam is one function
   every privileged mutation passes through (the foundation's "structurally
   unavoidable" rule); triggers that abort `UPDATE` and `DELETE` on the events
   table; retention purge as the one delete path, itself recorded; ids not
   personal data.
3. **`skills/audit-store-d1/SKILL.md`** — frontmatter as `otel-lgtm`'s (`name`,
   `version`, `category: development`, `description`, `license`,
   `user-invocable: false`, `allowed-tools`, `paths` scoped to the console
   project's audit seam), the Doing → Read table over the six references, and
   one rule that does not wait for a reference.
4. **`skills/audit-store-d1/references/`** — the six topics: `pick-and-trade.md`
   (why D1 for a Workers product; what it trades — size limits, no roles,
   single-region primaries); `contract-satisfaction.md` (how each invariant of
   the audit contract is met, one row each, with the D1 fact it relies on);
   `no-roles.md` — the constraint that bites (D1 has no per-role grants, so read
   isolation is by binding ownership and append-only by trigger; what that means
   for the compliance-role rule); `access-shape.md` (the console's read path,
   the filter and detail queries the `audit-history` flow needs, pagination);
   `cost-shape.md` (rows written and read, storage, the retention purge's cost);
   `local-stack.md` (why `n/a`: the d1 pack's local simulation; how the
   acceptance suite asserts an event was written at the seam).
5. **`bundles/audit-store-d1.md`** — frontmatter
   `name: Audit store ·
   Cloudflare D1`, `axis: backing`,
   `kind: capability-provider`,
   `components: [capability-provider/audit-store-d1@0.1.0]`; a heading and one
   paragraph in `otel-lgtm.md`'s shape; a sentence that it composes with the
   `cloudflare-d1` bundle.
6. Run `mise run p:plugins:inventory` so `stacks/inventory.md` lists the pack
   and the bundle.

## Verification

- `mise run p:plugins:check` green (rule 4 on the skill's frontmatter; rule 13
  on every landed file — cite the audit contract and the d1 pack by role, never
  by path).
- `mise run p:plugins:inventory -- --check` green after the regeneration.
- `command ls plugins/stackgen/stacks/capability-provider/audit-store-d1/skills/audit-store-d1/references/`
  lists exactly
  `pick-and-trade.md contract-satisfaction.md no-roles.md
  access-shape.md cost-shape.md local-stack.md`.
- `command grep -rn "CLAUDE_PLUGIN_ROOT\|assets/contracts\|\.\./" plugins/stackgen/stacks/capability-provider/audit-store-d1`
  is empty.
- `command grep -rn "audit trail" plugins/stackgen/stacks/capability-provider/audit-store-d1`
  is empty.
- `command grep -n "audit-store-d1" plugins/stackgen/stacks/inventory.md` hits.

## Guardrails

- No `config/`, no `hooks/`, no `agents/`; the pack is prose.
- Do not touch the `d1` pack, `otel-lgtm`, any asset (U3), `plugins/vwf/` (U1,
  U2), or any doc (U6). The `postgres` pack is U5's, next wave.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Use the Context7 tools for every D1 fact; a fact you could not verify is
  stated as unverified in `contract-satisfaction.md`, not asserted.
- Delete with `rm`, never `git rm`.

## Commit

`feat: audit-store-d1 pack and bundle — the audit store on Cloudflare D1` —
written by the orchestrator after the wave gate, not by the unit; the
regenerated inventory rides this commit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
