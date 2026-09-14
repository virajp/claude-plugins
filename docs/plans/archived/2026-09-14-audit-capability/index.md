---
type: vwf-change-plan
title: audit as an independent capability — the audit-store token, the
  contract, two provider packs
requires: [ docs/plans/archived/2026-09-13-vwf-process ]
backlog: [ B06 ]
---

# Plan — audit as an independent capability — the audit-store token, the contract, two provider packs (2026-09-14)

## Status

**COMPLETE** 2026-09-14. Approved 2026-09-14 by the user, after self-review.
Commits on `2026-09-14-audit-capability`, in order:

| Commit     | Unit | Subject                                                                                                          |
| ---------- | ---- | ---------------------------------------------------------------------------------------------------------------- |
| `64f7e94a` | U1   | vwf mints the audit-store capability; the audit foundation names its store and its standard contracts            |
| `b35da1ff` | U2   | audit-event standard entity and audit-history standard operator flow; blueprint and the surveyor require them    |
| `535e2901` | U4   | audit-store-d1 pack and bundle — the audit store on Cloudflare D1                                                |
| `1297cc72` | U3   | stackgen gains the audit category and contract; observability drops its audit claim                              |
| `034f033d` | —    | wave 1 run log                                                                                                   |
| `294c6fc4` | U5   | audit-store-postgres pack and bundle — the audit store on PostgreSQL                                             |
| `9b7b921c` | U4   | audit-store-d1 attributes its rules to the contract that carries them; the purge record is written after the run |
| `be7507fb` | —    | wave 2 run log                                                                                                   |
| `449e46f2` | U6   | audit as its own capability — the manual, the repo maps, the decision                                            |
| `8f3afda8` | U7   | bump vwf to 19.23.0, stackgen to 1.10.0, site to 1.1.12 — audit capability                                       |

U4 and U3 committed out of unit order in wave 1: the inventory pre-commit hook
fires on `stacks/**`, so U3's `stacks/readme.md` could not commit until U4's
pack and its regenerated inventory had landed together.

## Consent

| Action                                            | Granted                                                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                           |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                           |
| After landing: `/release`                         | ask                                                                                                                                                                           |
| Release vwf publicly                              | minor — `plugins/vwf/.claude-plugin/plugin.json`, the next minor above the value the tree holds when U7 runs, never a 13 or 17 component; by editing the `version` field      |
| Release stackgen publicly                         | minor — `plugins/stackgen/.claude-plugin/plugin.json`, the next minor above the value the tree holds when U7 runs, never a 13 or 17 component; by editing the `version` field |
| Release the two new packs                         | `0.1.0` each — `audit-store-d1` and `audit-store-postgres`, pinned by their bundles, `mise run p:plugins:inventory`; by U4's and U5's commits                                 |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U7 runs it first)                                                                  |
| Release installer publicly                        | none — untouched                                                                                                                                                              |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, audit is an independent, pinnable capability, outside
observability. vwf mints the backing token **`audit-store`** (kind B) beside the
foundation token `audit-log` (kind F): the first is the append-only,
access-controlled store a project pins on its backing axis, the second is what
is recorded, the read surface and the retention. The audit foundation expands
into a **standard entity `audit-event`** and a **standard operator flow
`audit-history`** in the console project, whose Authorization column carries the
access rule — operators read, the compliance role alone for events that
reference retained post-deletion data. stackgen gains the **`audit`** category
under `capability-provider`, its contract, and two per-stack provider packs,
**`audit-store-d1`** and **`audit-store-postgres`**, each riding an existing
datastore pack and claiming `capability: audit-store`. The observability
contract no longer claims audit's transport. Accepting the audit foundation
makes the console project declare `audit-store`, so doctor reports a missing
provider.

No reversal. The framing is the 2026-09-13 backlog request (B06): "Observability
collects logs, metrics and telemetry. However, there's a need to store AuditLogs
and these can contain sensitive data so it must be secured and accessible to
ONLY authorised people. Usually part of `console` project where authorised
people can access it. We need provision for that as independent capability
(outside observability ideally)". The per-stack shape is the user's 2026-09-14
answer: "There will be different stores depending on the stack".

## Facts the survey established

**Two audit vocabularies today, unreconciled.** The foundation token
`audit: privileged-destructive` in the registry's `cross_cutting:` block
(`plugins/vwf/skills/product-foundations/references/audit-logs.md:5–6`; template
`plugins/vwf/assets/templates/registry.yaml:106–113`) and the per-project
capability token `audit-log`, kind **F** — "product foundation, nothing to pin"
— at `plugins/vwf/assets/capability-vocabulary.md:40–41`. Kinds table `:18–22`;
groups `:27–41` (`operator-rbac` F `:34`, `distributed-tracing` B `:40`); only B
is pinnable `:59–60`; doctor's finding is non-blocking `:62–73`;
publisher/consumer rule `:75–96`; prose nouns `:111–124` (no noun for audit).
Both tokens sit side by side in the example registry
(`plugins/vwf/assets/examples/blueprint/registry.yaml:44, 63`).

**The coupling to remove.**
`plugins/stackgen/assets/contracts/observability.md:8–9` claims "the transport
half of `audit-log`". Nothing else couples them; the boundary sentence lives
only in `audit-logs.md:3–5`.

**The foundation reference** (`product-foundations/references/audit-logs.md`):
Default contract `:8` — scope `:10–14`, event shape `:15–18`, append-only
`:19–21`, structurally unavoidable `:22–24`, read surface `:25–27`, PII
`:28–29`; Elicit per product `:31` — storage `:39–40` ("a dedicated append-only
collection/table in the primary datastore; elicit if … an external/immutable
store"), retention `:41`, customer self-view `:42`; Blueprint expansion
`:44–50`. Checklist row `product-foundations/SKILL.md:41`; thirteen foundations,
five core `:19–33, 37–51`. Compliance role `references/users.md:14–18`.

**Blueprint expansion today.** A `conventions.md#audit` anchor
(`plugins/vwf/assets/templates/conventions.md:56`), an `Audit-recorded` column
on every flow's Trigger & Actors table and `(audit-recorded)` step markers
(`assets/templates/flow.md:70–88`;
`skills/blueprint-authoring/references/flow-contract.md:51–56, 147–152`), the
foundations bullet in `skills/blueprint/SKILL.md:267–276`, and the reviewer
lines `agents/blueprint-reviewer.md:82, 139`. No entity, flow or API. Standard
flows live in `plugins/vwf/assets/standard-flows.md` (`operator-rbac` ⇒ `signin`
mandatory at `:78–84`, needs `home` `:97–98`); the surveyor maps capabilities to
required flows at `agents/blueprint-surveyor.md:80–81`. No "standard entity"
concept exists; the example blueprint's entities are `customer` and `order`.

**Architecture.** 3b registry: capabilities offered from the vocabulary asset by
domain group, kinds B/F/P (`skills/architecture/SKILL.md:130–138`); console rule
"no console, no fullstack" → `[service, webapp]` + `operator-rbac` (`:189–192`;
`agents/architecture-writer.md:133–135`;
`references/derive-from-product.md:24`); 3c cross-cutting table `:260–267` and
the foundations walk `:269–288`, answers written to `cross_cutting:` by the
writer (`agents/architecture-writer.md:33–37`). The console "typically carries
auth, datastore, RBAC, audit"
(`skills/setup/references/workspace-structure.md:97–102`). Security reviewer
treats bypass of the operator-rbac project's audit wrapping as a surface
(`agents/execute-security-reviewer.md:28–41`).

**The pin.** `.config/vwf.yaml`
`projects.<name>.stack.backing_template:
[<slug>, …]`, one slug per capability
(`assets/vwf-config.md:75–77`;
`skills/architecture/references/stack-menu.md:16, 32–35`); the template payload
carries `capabilities:` derived from the components' `capability` tokens
(`plugins/stackgen/skills/stackgen-stack-template/SKILL.md:87–88`); doctor §5
matches declared B tokens against it
(`skills/doctor/references/stack-checks.md:171–192`).

**stackgen.** Taxonomy `plugins/stackgen/assets/taxonomy.md`: type definition
`:67–70`; the closed `capability-provider` list `:103–104` — `identity`,
`telemetry`, `workflow`, `secrets-manager`; the capability seam `:114–127`;
categories with no token `:129–137`; extension rule `:8–11`; category doctrine
lives once at `assets/contracts/<area>.md` `:218–229`. `assets/kinds.md:624–694`
— the kind's output (contract plus one instance component `:626–632`), axis
`backing` `:640`, harness `:649–654`, the six topics `:659–694` (pick and trade,
contract satisfaction, the constraint that bites, integration and access shape,
cost shape, local stack), reviewer bar `:1023–1026`. Pack format
`assets/pack-format.md:19–37` (layout), `:150–174` (`pack.yaml` schema;
`capability` singular `:156`), `:192–234` (bundle shape), `:260–266` (exact
pin), `:283–289`. The five packs: `otel-lgtm` (category `telemetry`, capability
`distributed-tracing`, harness `local_stack: stack:up`, no `config/`,
`skills/otel-lgtm/{SKILL.md, references/{pick-and-trade,
contract-satisfaction, cardinality, access-shape, cost-shape, local-stack}.md}`
— **the template**), `temporal`, `oidc`, `doppler` (capability unset, config
overlay), `fnox` (`harness: n/a`, hook). Bundles `stacks/bundles/<slug>.md`
(`otel-lgtm.md:1–12` shape: frontmatter `name`, `axis`, `kind`, `components`,
then a heading and one paragraph). The datastore packs to ride:
`cloud-service/d1` (`0.1.0`, capability `relational-datastore`, bundle
`cloudflare-d1.md`) and `datastore/postgres` (`0.1.0`, `relational-datastore`,
bundle `postgres.md`). Analytics Engine
(`cloud-service/analytics-engine/pack.yaml`, capability unset) — its
`pick-and-trade.md:65, 74` declines billing-grade counts (sampled) and data that
must outlive three months (fixed retention). Contracts today: `datastore`,
`identity`, `local-stack`, `object-storage`, `observability`, `orchestration`,
`release-trigger`, `secrets`. Precedent for a new category: commit `3baaaefc`
(`secrets-manager`) touched taxonomy, kinds, a new contract, `local-stack.md`,
packs, bundles, `stacks/readme.md`, the manifest, docs.

**Menu, landing, generators, checker.** The menu is one entry per bundle
(`skills/stackgen-stack-menu/SKILL.md:28–46`), product-independent. A capability
pack lands its template entry, skills and citations
(`skills/stackgen-stack-template/references/materializer.md:28–37`); nothing
lands `stack:up`. `scripts/src/inventory.ts` reads packs from the tree, category
and capability verbatim (`:121–151, 143–144`), asserts bundle pins against
versions (`:312–345`); tests compute counts from disk. No checker rule reads
`pack.yaml`'s category — a typo lands silently. Rule 4 strict frontmatter on
pack skills (`check.ts:660–698`), rule 13 landed citations (`:860–935`).
`p:plugins:shellcheck` visits no file in a pack without shell.

**Enumerations to reconcile.** `plugins/stackgen/stacks/inventory.md`
(generated: `:10` counts, `:23` the capability-provider row, `:34–38`);
`plugins/stackgen/stacks/readme.md:11–14, 130–134`; `taxonomy.md:129–132`;
`site/src/content/docs/plugins/stackgen.md:36–60` (category prose), `:150`,
`:193`; `site/src/content/docs/plugins/vwf.md:589–598` (backing example),
`:747–750` (console rule), `:1374–1377`, `:2427–2439` (thirteen foundations,
names audit's default);
`.claude/skills/vwf-plugin/references/skills-and-agents.md:88`,
`references/assets.md:16`, `references/docs-tree.md:45`, `SKILL.md:55, 122–137`;
`.claude/skills/stackgen-plugin/SKILL.md:39, 116`; `.claude/docs/plugins.md:13`;
`readme.md:273–277`. `CLAUDE.md` enumerates neither foundations nor packs.

**Gates and versions.** The nine wave-gate lines; no `.config/vwf.yaml` here;
commit types `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`, no scopes.
`plugins/**/*.md` is not dprint-formatted; `CLAUDE.md`, `readme.md`,
`.claude/**` and the site docs are. `pack.yaml`, its bundle pin and
`stacks/inventory.md` must land in one commit (the inventory hook fires on
`stacks/**`).

**Recall.** The 2026-09-06 decision doc on categories: closed per type, minted
in one edit to the taxonomy, capability tokens are vwf's. Parked since
2026-09-06: a checker rule validating `category` against the taxonomy.

## Assumed decisions — confirm or override at review

| #  | Decision            | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Rejected                                       | Unit       |
| -- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ---------- |
| 1  | Token seam          | Mint `audit-store` as kind **B** in the vocabulary's governance group; `audit-log` stays **F** as the product-side half (what is recorded, the read surface, retention). Both entries state the split. Prose noun for `audit-store`: "audit store". (User, MCQ.)                                                                                                                                                                                                                                 | reclassify `audit-log` to B                    | U1         |
| 2  | Realizations        | One `capability-provider` pack per store under a new category **`audit`**, each riding an existing datastore pack and claiming `capability: audit-store`. First two: `audit-store-d1` (rides `cloud-service/d1`) and `audit-store-postgres` (rides `datastore/postgres`), each `0.1.0` with its own bundle. (User, MCQ; "There will be different stores depending on the stack".)                                                                                                                | one agnostic pack; a list-valued `capability:` | U3, U4, U5 |
| 3  | Analytics Engine    | Declined as an audit store, in the contract, citing the pack's own trade: fixed retention and sampled totals against an audit log's completeness and legal-basis retention.                                                                                                                                                                                                                                                                                                                      | a third pack                                   | U3         |
| 4  | Contract            | `audit-event` is a standard entity: actor (id and class), action, target (entity and id), timestamp, outcome, reason, trace id; append-only, retention purge the only removal; ids not PII. `audit-history` is a standard operator flow in the console project, mandatory once the audit foundation is accepted; Authorization: operator roles read; the compliance role alone for events referencing retained post-deletion data. The surveyor treats both as coverage conditions. (User, MCQ.) | today's anchor and columns only                | U2         |
| 5  | Standard entities   | A new asset `plugins/vwf/assets/standard-entities.md`, the first entry `audit-event`, cited beside `standard-flows.md` wherever the blueprint skill and the surveyor cite that one.                                                                                                                                                                                                                                                                                                              | an entry inside `standard-flows.md`            | U2         |
| 6  | Pack shape          | Doctrine and the six-topic references only, modelled on `otel-lgtm`; no `config/` payload. The append-only schema, the insert-only role and the console-only read grants are described; the target repo's plan writes the migration. Harness `local_stack: n/a` with the reason — the datastore pack's own local stack serves.                                                                                                                                                                   | shipping a migration file                      | U4, U5     |
| 7  | Observability       | `contracts/observability.md:8–9` drops the audit-transport sentence and points at the audit contract by role.                                                                                                                                                                                                                                                                                                                                                                                    | leaving both claims                            | U3         |
| 8  | Architecture        | Accepting the audit foundation in 3c makes the console project (the `operator-rbac` holder) declare `audit-store` in its `capabilities:`; doctor's provider check then reports a missing pin as its existing non-blocking finding.                                                                                                                                                                                                                                                               | leaving the declaration to the user            | U1         |
| 9  | Inventory ownership | Each pack unit regenerates and owns `stacks/inventory.md`, so U4 and U5 run in consecutive waves.                                                                                                                                                                                                                                                                                                                                                                                                | one unit for both packs                        | U4, U5     |
| 10 | Research            | The pack units read the current D1 and Postgres documentation through the Context7 tools before writing grants, roles and append-only patterns; never from training knowledge.                                                                                                                                                                                                                                                                                                                   | training knowledge                             | U4, U5     |
| 11 | Ordering            | `requires: [docs/plans/archived/2026-09-13-vwf-process]`.                                                                                                                                                                                                                                                                                                                                                                                                                                        | concurrent                                     | —          |
| 12 | Wording             | The phrase for the category and the contract is "audit"; the store is "the audit store"; the foundation stays "audit logs". No file says "audit trail".                                                                                                                                                                                                                                                                                                                                          | mixed nouns                                    | all        |

## New dependencies

none

## Units

| Id | Wave | Unit file                                          | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Depends on | Status | Commit   |
| -- | ---- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1 | 1    | [01-vwf-vocabulary.md](01-vwf-vocabulary.md)       | `plugins/vwf/assets/capability-vocabulary.md`, `plugins/vwf/skills/product-foundations/references/audit-logs.md`, `plugins/vwf/skills/product-foundations/SKILL.md`, `plugins/vwf/skills/architecture/SKILL.md`, `plugins/vwf/assets/templates/registry.yaml`, `plugins/vwf/assets/examples/blueprint/registry.yaml`                                                                                                                                                                                                            | —          | green  | 64f7e94a |
| U2 | 1    | [02-vwf-contract.md](02-vwf-contract.md)           | `plugins/vwf/assets/standard-flows.md`, `plugins/vwf/assets/standard-entities.md` (new), `plugins/vwf/skills/blueprint/SKILL.md`, `plugins/vwf/agents/blueprint-surveyor.md`, `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`, `plugins/vwf/assets/templates/conventions.md`; **widened at run time (R1 round 2)**: `plugins/vwf/skills/blueprint/references/flow-placement.md`, `plugins/vwf/assets/templates/flow.md`, `plugins/vwf/assets/templates/flows-index.md`, `plugins/vwf/assets/vwf-config.md` | —          | green  | b35da1ff |
| U3 | 1    | [03-stackgen-category.md](03-stackgen-category.md) | `plugins/stackgen/assets/taxonomy.md`, `plugins/stackgen/assets/kinds.md`, `plugins/stackgen/assets/contracts/audit.md` (new), `plugins/stackgen/assets/contracts/observability.md`, `plugins/stackgen/stacks/readme.md`                                                                                                                                                                                                                                                                                                        | —          | green  | 1297cc72 |
| U4 | 1    | [04-pack-d1.md](04-pack-d1.md)                     | `plugins/stackgen/stacks/capability-provider/audit-store-d1/**` (new), `plugins/stackgen/stacks/bundles/audit-store-d1.md` (new), `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                                                                                        | —          | green  | 535e2901 |
| U5 | 2    | [05-pack-postgres.md](05-pack-postgres.md)         | `plugins/stackgen/stacks/capability-provider/audit-store-postgres/**` (new), `plugins/stackgen/stacks/bundles/audit-store-postgres.md` (new), `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                                                                            | U4         | green  | 294c6fc4 |
| U6 | 3    | [06-docs.md](06-docs.md)                           | `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`, `docs/backlog.md`, `docs/memory/decisions/2026-09-14-audit-capability.md` (new); **widened at run time (R1 round 2)**: `plugins/vwf/agents/blueprint-reviewer.md`, `plugins/vwf/skills/setup/references/format-lineage.md`                                                                                                                                                                                                                                  | U1–U5      | green  | 449e46f2 |
| U7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)       | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                                                                                                                                                 | U6         | green  | 8f3afda8 |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                               | Why it collides                                                 | Owner                      |
| ------------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------- |
| the two plugin manifests, `site/package.json`                      | several units bumping one version is a lost update              | U7 only                    |
| `.claude-plugin/marketplace.json`                                  | generated; regenerating mid-wave races                          | U7 only                    |
| `plugins/stackgen/stacks/inventory.md`                             | generated with the pack pins; must land with them in one commit | U4 in wave 1, U5 in wave 2 |
| `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**` | n units editing one doc                                         | U6 only                    |
| `docs/backlog.md`                                                  | the backlog skill's; this run's exception                       | U6 only                    |
| `plugins/stackgen/assets/contracts/local-stack.md`                 | the precedent touched it; this plan's packs add no local stack  | nobody                     |
| `plugins/vwf/skills/doctor/**`                                     | the provider check already covers a B token; unchanged          | nobody                     |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Four disjoint trees: vwf's vocabulary and
  foundation side; vwf's blueprint contract side; stackgen's taxonomy and
  contracts; the first pack with the inventory. U4 needs U3's category to be
  *right* but not to be on disk — it writes `category: audit` from this file.
- **Wave 2 — U5.** The second pack, after U4's inventory commit.
- **Wave 3 — U6.** Docs, over the branch delta plus the survey's list.
- **Wave 4 — U7.** The bumps, the marketplace generator, the full gate.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

Plus the wave review, plus every report read for `UNRESOLVED:`. Every line is
green before wave 1. `p:plugins:inventory -- --check` is expected red on the
wave-1 tree until U4's commit regenerates it — the orchestrator commits U4 with
the regenerated inventory before re-running the gate, per the shared-file rule.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                          |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | Stages vwf and stackgen into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag. A **restarted** session is what loads the staged plugins. |
| `/release`                 | ask  | Cuts the vwf, stackgen and site tags per the consent block. The run stops once and asks first.                                                                                 |

## Gates the orchestrator keeps

- **The six-topic bar.** After wave 2, each new pack directory holds
  `pack.yaml`, `conventions.md`, `skills/<slug>/SKILL.md` and six files under
  `skills/<slug>/references/` — `pick-and-trade.md`, `contract-satisfaction.md`,
  one constraint file, `access-shape.md`, `cost-shape.md`, `local-stack.md`;
  `command ls` proves it.
- **The token everywhere.**
  `command grep -rln "audit-store" plugins/vwf/assets/capability-vocabulary.md plugins/stackgen/assets/taxonomy.md plugins/stackgen/assets/contracts/audit.md plugins/stackgen/stacks/capability-provider/audit-store-d1/pack.yaml plugins/stackgen/stacks/capability-provider/audit-store-postgres/pack.yaml`
  lists all five.
- **The coupling gone.**
  `command grep -n "audit" plugins/stackgen/assets/contracts/observability.md`
  shows only a pointer to the audit contract, no transport claim.
- **The menu resolves.**
  `command ls plugins/stackgen/stacks/bundles/ | command grep audit-store` lists
  two bundles, and `p:plugins:inventory -- --check` is green.
- **Rule 13.**
  `command grep -rn "CLAUDE_PLUGIN_ROOT\|assets/contracts" plugins/stackgen/stacks/capability-provider/audit-store-*`
  is empty — the packs cite the contract by role.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. Exception, stated here so it is not a `GAP:`: U4 and U5 each run
`mise run p:plugins:inventory`, because a new pack's pin and the inventory must
land in one commit.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **An Analytics Engine audit pack** — decision 3.
- **A Firestore or document-store realization** — parked; the first two stores
  are relational.
- **A dedicated immutable store** (write-once object storage, an event store) —
  parked.
- **A `config/` payload or migration file in either pack** — decision 6.
- **Doctor changes** — the provider check already covers a B token.
- **The checker validating `category` against the taxonomy** — carried parked
  since 2026-09-06; this plan adds one more token it would catch.
- **Group A's, B's and C's files** — this plan requires A and touches none of
  the change-plan, init, feedback or product trees.

## Parked

- **`audit-store-firestore`** — the document-datastore realization, once a
  product on Firestore needs it; same shape as the two here.
- **An immutable-store pack** — write-once object storage with object lock, or
  an append-only event store, for products whose legal basis needs
  tamper-evidence beyond database grants.
- **A checker rule validating `pack.yaml`'s `category` against the taxonomy** —
  carried from the 2026-09-06 plans; now five categories under
  `capability-provider`.
- **Customer self-view of their own audit events** — the foundation keeps it off
  by default (`audit-logs.md:42`); a flow for it is a product decision.

## Run log

| Wave | Unit       | Model | Round   | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Commit   |
| ---- | ---------- | ----- | ------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight  | —     | —       | green       | All nine gate lines green on the branch tip. `setup:worktree` failed at `setup:deps:audit` (pnpm arg mismatch, pre-existing); lockfile restored and `pnpm install --frozen-lockfile` used instead.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 1    | U1         | opus  | 1       | green       | Minted `audit-store` B in the governance group; foundation, checklist row, 3c architecture sentence, both registries. DECIDED: the architecture sentence sits after the foundations walk, not beside the 3c table. GAP: no inline per-token gloss exists in the vocabulary's group list, so the two glosses landed in the reasoning section. GAP: the example registry's line-44 project is `api`, console-shaped only in holding `audit-log`; followed the edit's line citation rather than inventing an operator project.                                                                                                                                                                                                                                                                                                                                                                                                                                         | 64f7e94a |
| 1    | U2         | opus  | 1       | green       | New `standard-entities.md` with `audit-event`; `950 audit-history` standard flow; blueprint SKILL coverage condition; surveyor conditions 8 and 11; flow-contract and conventions citations. DECIDED: 950 is the lowest free Account/system number; the surveyor keys on the `audit-store` capability, not `cross_cutting:`; a synonym row added. GAP: no unit owns `blueprint_format`; assumed no bump since `audit-store` exists in no registry today. GAP: `entity-contract.md` is nobody's and owes a back-citation.                                                                                                                                                                                                                                                                                                                                                                                                                                            | b35da1ff |
| 1    | U3         | opus  | 1       | green       | `audit` category in the taxonomy and kinds; new `contracts/audit.md`; observability's audit-transport claim removed; `stacks/readme.md` paragraphs. DECIDED: also fixed taxonomy's type-definition enumeration; the contract's third column is where invariants are enforced, not a researched limit. GAP: edit 5's wave-list line is a historical record — followed the secrets-manager precedent instead. GAP: taxonomy has no by-area contract list; audit named in the category-doctrine prose.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 1297cc72 |
| 1    | U4         | opus  | 1       | green       | `audit-store-d1` pack (pack.yaml, conventions, SKILL, six references), its bundle, inventory regenerated (63 packs, 59 bundles). DECIDED: D1 trigger support unverifiable — stated as unverified, pushed to a migration test; event-first ordering with a monitored over-report; keyset paging. GAP: U3's contract clause 3 (ride a table in the product database) contradicts the unit file's dedicated-D1-database edit; followed the unit file and wrote clause 3 up as not satisfied — flagged for U3 to reconcile.                                                                                                                                                                                                                                                                                                                                                                                                                                             | 535e2901 |
| 1    | R1         | opus  | 1       | findings(4) | Rulings not clean: U3's `contracts/audit.md` added a same-atomic-unit invariant and a same-database requirement decision 6 does not carry. Plus: `audit-store` landed on the example registry's `api` (no `operator-rbac`); the `product-foundations/SKILL.md` checklist row ran 248 chars against the table's 161-166 band; `standard-entities.md` claimed a reader (`entity-contract.md`) that cites it nowhere.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |          |
| 1    | U3, U1, U2 | opus  | 1 (fix) | green       | Orchestrator ruling: **the contract does not decide the instance or the write ordering** — "rides an existing datastore pack" names the engine, not the database instance, and a realization that cannot write atomically states its ordering and residual. U3 cut both invariants to six and added the hand-over paragraph; U1 removed `audit-store` from the example registry (no project there holds `operator-rbac`) and re-cut the checklist row to 162 chars; U2 narrowed the lead to real readers.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |          |
| 1    | U1, U4     | opus  | 1 (fix) | green       | Downstream of the clause renumber: U1 reworded `audit-logs.md`'s Storage line so the foundation decides append-only/access-controlled/apart-from-ordinary-reads and the store and schema-vs-database choice belong to the `audit-store` pin; U4 rewrote `contract-satisfaction.md`, `pick-and-trade.md`, `no-roles.md` and its bundle against the six-clause contract, its dedicated D1 database and event-first ordering now stated as the realization statements the contract asks for.                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |          |
| 1    | R1         | opus  | 2       | findings(6) | Rulings still not clean: `stacks/readme.md:163` restated the removed same-transaction invariant as the packs' rationale. Plus five stale enumerations — `blueprint/SKILL.md:297` (U2's own), and four nobody-owned: `flow-placement.md:22`, `templates/flow.md:26`, `templates/flows-index.md:29`, `assets/vwf-config.md:109`. Convergence guard tripped (4 → 6, not strictly decreasing); the review loop ended here.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |          |
| 1    | U3, U2     | opus  | 2 (fix) | green       | Rulings residue is never left: U3 reworded `stacks/readme.md` to give the engine the product already runs as the reason for the ride, and swept `plugins/stackgen/` for surviving restatements (none). U2's Owns **widened** by the orchestrator to `flow-placement.md`, `templates/flow.md`, `templates/flows-index.md`, `assets/vwf-config.md` — its own change falsified them and no unit owned them; all five enumerations completed. GAP: a `config_format` bump may be owed for the new waiver namespace; no unit owns it, proceeded without one.                                                                                                                                                                                                                                                                                                                                                                                                             |          |
| 1    | gate       | —     | —       | green       | All nine wave-gate lines green. Two further nobody-owned enumerations reported by U2 — `agents/blueprint-reviewer.md:47-50` and `skills/setup/references/format-lineage.md:105` — handed to U6 as `DOCS FALSIFIED:` with its Owns widened, rather than a third fix round.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |          |
| 2    | U5         | opus  | 1       | green       | `audit-store-postgres` pack (pack.yaml, conventions, SKILL, six references incl. `three-roles.md`), its bundle, inventory regenerated (64 packs, 60 bundles). DECIDED: the instance is a schema in the product's own database — Postgres draws its boundary at the grant, so isolation needs no second instance and the same database buys the atomic write, the explicit contrast with D1. Write ordering is one transaction, with refusals inside an aborting transaction named as the exception. Three roles are writer/reader/purger; TRUNCATE called out as a named gap; partition-drop purge preferred but marked as DDL the append-only trigger never sees. Two facts flagged unverified rather than asserted. GAP: the owner is the migration identity the datastore contract already establishes, not a fourth pack-owned role. GAP: the two read tiers written as two database roles, with the session-setting alternative named and its weakness stated. | 294c6fc4 |
| 2    | R2         | opus  | 1       | findings(2) | Both coherence, both U5's: `conventions.md:37` attributed the structurally-unavoidable rule to the stackgen contract, which carries no such clause (it is vwf's product foundation) — inherited verbatim from the D1 pack, so both mis-cited; `conventions.md:52` wrote the purge event before the run yet named the count it removed. CONTRACT and RULINGS clean.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |          |
| 2    | U5, U4     | opus  | 1 (fix) | green       | U5 re-attributed the rule to the product's audit-log foundation by role and moved the purge record to after the run, in both files. U4 fixed the D1 copy plus two more of the same class it found by grep — `cost-shape.md` no longer credits the contract with a default scope, `pick-and-trade.md` no longer calls audit-in-a-table "the compromise the contract prevents".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |          |
| 2    | R2         | opus  | 2       | findings(4) | Each pack had missed the other's fix: three attributions in the Postgres pack (`cost-shape.md:18` scope, `three-roles.md:25` migration identity credited to the datastore contract, `three-roles.md:34` credential catalogue credited to the datastore rather than the secrets contract) and the purge wording still standing in the D1 pack. CONTRACT and RULINGS clean. Convergence guard tripped (2 → 4); the review loop ended here.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |          |
| 2    | U5, U4     | opus  | 2 (fix) | green       | Mechanical cross-apply of what each pack had missed, verified by grep rather than a third review round: U5 re-attributed all three plus one more its own sweep found (`access-shape.md:32`, env injection and names-not-values belong to the secrets contract); U4 moved the D1 purge record to after the run in both its files. Greps for the count-before-run wording, the contract-credited scope and rule 13 are all empty.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |          |
| 2    | gate       | —     | —       | green       | All nine wave-gate lines green, plus all five *Gates the orchestrator keeps*: the six-topic bar on both packs, `audit-store` in all five files, observability carrying only the pointer, two bundles with a green inventory, and rule 13 empty.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 9b7b921c |
| 3    | U6         | opus  | 1       | green       | Docs reconciled over `develop..HEAD` via `vwf:docs-sync` standalone, plus every `DOCS FALSIFIED:` line the run produced: the site manual's backing example, console rule, slug list, number line, standard-entities paragraph and foundations bullet; the stackgen category paragraph; two how-to pages; three `.claude/skills/vwf-plugin/references/` files; `.claude/skills/stackgen-plugin/SKILL.md`; the two widened plugin files. New decision doc. DECIDED: five passed-in falsified targets do not hold against the landed tree — verified, not assumed — since those passages enumerate no categories, assets or pack counts. DECIDED: `docs/backlog.md` untouched; `/vwf:backlog` is its only writer and the unit file's edit-by-hand line is superseded.                                                                                                                                                                                                  |          |
| 3    | R3         | opus  | 1       | findings(3) | Two real, both U6's: `site/.../vwf.md:377` kept the `910`–`940` band its `.claude` sibling had already moved to `950`; `:1493` listed the coverage worklist as standard flows only, where the landed condition pairs flows and entities. The third named a rejected alternative no decision in the plan carries — a stale line in the unit file. R3 independently re-checked and upheld all five of U6's dismissals, and verified every accuracy claim against the landed tree. CONTRACT and RULINGS clean.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |          |
| 3    | U6         | opus  | 1 (fix) | green       | Both real findings fixed and the class swept; the stale one left alone rather than fabricating a ruling. Owns **widened** once more to `plugins/vwf/skills/blueprint-authoring/references/entity-contract.md` — the back-citation `standard-entities.md` claims, reported three times across the run by U2 and U6 and owned by nobody.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 449e46f2 |
| 3    | gate       | —     | —       | green       | All nine wave-gate lines green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |          |
| 4    | U7         | opus  | 1       | green       | vwf 19.22.0 → **19.23.0**, stackgen 1.9.1 → **1.10.0**, site 1.1.11 → **1.1.12** (via `mise run p:site:version`, run first because it refuses a dirty tree); `.claude-plugin/marketplace.json` regenerated, pinning `vwf-v19.23.0` and `stackgen-v1.10.0`. DECIDED: no 13/17 skip needed — 23, 10 and 12 are all clear.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 8f3afda8 |
| 4    | gate       | —     | —       | green       | All nine wave-gate lines green and all five *Gates the orchestrator keeps* green on the final tree.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-14-audit-capability
