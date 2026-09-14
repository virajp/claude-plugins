# U5 — the `audit-store-postgres` pack, its bundle, the inventory

- **Wave:** 2
- **Depends on:** U4
- **Owns:**
  `plugins/stackgen/stacks/capability-provider/audit-store-postgres/**` (new),
  `plugins/stackgen/stacks/bundles/audit-store-postgres.md` (new),
  `plugins/stackgen/stacks/inventory.md` (generated)
- **Model:** opus
- **Read first:** the `audit-store-d1` pack U4 landed, whole — match its shape
  file for file; `plugins/stackgen/assets/contracts/audit.md`;
  `plugins/stackgen/assets/kinds.md` 624–694 and 1023–1026;
  `plugins/stackgen/assets/pack-format.md` 150–174 and 260–289; the
  `datastore/postgres` pack's `pack.yaml`, `conventions.md` and its references
  (the store this rides); `plugins/stackgen/stacks/bundles/postgres.md`.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md` 150–184
  (rule 13); the `cloud-service/cloud-sql` pack's
  `references/identity-and-iam.md` (hosted Postgres roles, for one sentence in
  pick-and-trade).

## Ruling

Decision 2: "… `audit-store-postgres` (rides `datastore/postgres`), each `0.1.0`
with its own bundle."

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

0. **Research first.** Resolve the PostgreSQL library id with the Context7 tools
   and query its docs for: a dedicated schema with `GRANT INSERT` only to the
   writing role and `REVOKE UPDATE, DELETE`, row-level security policies that
   limit `SELECT` to the operator and compliance roles,
   `BEFORE UPDATE OR DELETE` triggers that raise, a separate role that owns the
   retention purge, and partitioning by time for the purge. Record what you
   relied on in `contract-satisfaction.md`.
1. **`pack.yaml`** — `name: Audit store · PostgreSQL`; `summary:` one sentence
   (an isolated, append-only audit schema in the product's PostgreSQL with
   insert-only and console-only grants); `version: 0.1.0`;
   `type: capability-provider`; `category: audit`; `capability: audit-store`;
   `kind: capability-provider`; `axis: backing`; `harness:` with
   `local_stack: {task: n/a, mechanism: …}` giving the reason — the postgres
   pack's composed database is the local stack. No `artifact`.
2. **`conventions.md`** — a dedicated schema, never the public one; three roles
   (writer: insert only; reader: select under policy, held by the console;
   purger: delete under the retention job only); triggers that raise on update
   or delete; the writer seam every privileged mutation passes through; the
   purge recorded as an event; ids not personal data.
3. **`skills/audit-store-postgres/SKILL.md`** — frontmatter and body in the d1
   pack's shape, paths scoped to the console project's audit seam and the
   migrations that create the schema.
4. **`skills/audit-store-postgres/references/`** — the six topics:
   `pick-and-trade.md`; `contract-satisfaction.md`; `three-roles.md` — the
   constraint that bites (the grants only hold if the application connects as
   the right role, so connection-string discipline per project is the rule);
   `access-shape.md`; `cost-shape.md`; `local-stack.md` (why `n/a`).
5. **`bundles/audit-store-postgres.md`** — frontmatter
   `name: Audit store ·
   PostgreSQL`, `axis: backing`,
   `kind: capability-provider`,
   `components: [capability-provider/audit-store-postgres@0.1.0]`; a heading and
   one paragraph; a sentence that it composes with the `postgres` bundle and,
   through it, with a hosted Postgres such as the cloud-sql pack.
6. Run `mise run p:plugins:inventory` so `stacks/inventory.md` lists the pack
   and the bundle.

## Verification

- `mise run p:plugins:check` green.
- `mise run p:plugins:inventory -- --check` green after the regeneration.
- `command ls plugins/stackgen/stacks/capability-provider/audit-store-postgres/skills/audit-store-postgres/references/`
  lists exactly
  `pick-and-trade.md contract-satisfaction.md three-roles.md
  access-shape.md cost-shape.md local-stack.md`.
- `command grep -rn "CLAUDE_PLUGIN_ROOT\|assets/contracts\|\.\./" plugins/stackgen/stacks/capability-provider/audit-store-postgres`
  is empty.
- `command grep -rn "audit trail" plugins/stackgen/stacks/capability-provider/audit-store-postgres`
  is empty.
- `command grep -n "audit-store-postgres" plugins/stackgen/stacks/inventory.md`
  hits.

## Guardrails

- No `config/`, no `hooks/`, no `agents/`; the pack is prose.
- Do not touch the `postgres` or `cloud-sql` packs, the d1 pack (U4), any asset
  (U3), `plugins/vwf/` (U1, U2), or any doc (U6).
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Use the Context7 tools for every PostgreSQL fact; an unverified fact is stated
  as unverified, not asserted.
- Delete with `rm`, never `git rm`.

## Commit

`feat: audit-store-postgres pack and bundle — the audit store on PostgreSQL` —
written by the orchestrator after the wave gate, not by the unit; the
regenerated inventory rides this commit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
