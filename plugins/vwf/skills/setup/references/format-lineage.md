# Format Lineage

Every spelling vwf has retired, and what it is called now. Read this while
reconciling a repo authored against an older format: such a tree usually names
things *correctly for the format it was written in* and wrongly for this one,
and that difference is a rename to recognise, not a gap to fill.

This file replaces the per-format delta ladder. Reconciliation is
**state-based** — diff the tree against the current format's definition sources
(`${CLAUDE_PLUGIN_ROOT}/assets/templates/`,
`${CLAUDE_PLUGIN_ROOT}/assets/examples/blueprint/`, the blueprint-authoring bars, and
`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`) and fix what differs. The table below
exists only so a retired spelling resolves to the thing it became rather than
registering as something unknown.

## What the stamps mean now

`blueprint_format` (**25**) and `config_format` (**26**) are **drift
detectors** and nothing else. `${CLAUDE_PLUGIN_ROOT}/assets/format-check.md` compares
a repo's stamps against the shipped integers and nudges
`/vwf:setup`. Nothing selects a migration path by them any more,
and there is no support window: a repo stamped `2` and a repo stamped `22`
reconcile against the same current format, by the same algorithm, in one pass.

**Neither line issues 13 or 17 any more.** From `config_format` **18** and
`blueprint_format` **24** onward the rule stands for both stamps: a bump steps
past 13 and past 17, so neither integer is ever stamped again. The history the
rule inherited is uneven, and an old stamp is read by the history rather than
by the rule — `config_format` 13 **is real** and was issued, so a repo stamped
13 on that line is stamped 13; `blueprint_format` 13 was skipped, so a repo
reading 13 there is treated as 12; and 17 was never issued on either line, so a
repo reading 17 on either is treated as **16**, which is why `config_format`
went 16 → 18 when `enforcement.kept_files` arrived. The two stamps are separate
number lines and never comparable.

## The lineage table

A **fan-out** row maps one retired token onto more than one current spelling and
must go through the rule below. Every other row is mechanical.

| Retired spelling | Current spelling | Kind | Fan-out |
| --- | --- | --- | --- |
| `workspace`, then `polyrepo` | `multi-repo` plus `linkage: submodule` | topology | |
| a project's `type:` key | `role:` | role | |
| `api`, `service` | `backend` + `platforms: [ service ]` | role | |
| `worker` | `backend` + `[ worker ]` | role | |
| `web` (as a role), `site` | `frontend` + `[ site ]` | role | yes |
| a `site` that publishes its own API contract | `backend` + `[ service, webapp ]` | role | yes |
| `console`, `fullstack` | `backend` + `[ service, webapp ]` + the `operator-rbac` capability | role | |
| `app`, `frontend` on screen platforms | `frontend` + its own platform list | role | |
| `frontend` whose only platform is `cli` | `frontend` + `[ cli ]` | role | |
| `infra`, then `iac` | `system` + `[ iac ]` | role | |
| `library`, `packages` | `[ packages ]` under **any** role — the consumer decides | role | yes |
| `web` (as a platform) | `site` or `webapp` | platform | yes |
| `carplay`, `android-auto` | `auto` | platform | |
| `desktop` on a content-surface project | `web`, then `site` or `webapp` | platform | yes |
| `cli` as a config-only key | a registry `platforms:` token like any other | platform | |
| `assets/stacks/<type>.md` | `assets/stacks/<type>/<slug>.md`, with frontmatter | template-path | |
| `<type>/<slug>`, `console/<slug>` | `project/<slug>` (it passed through `project/fullstack/<slug>`) | template-path | |
| `project/<role>/<slug>` | `project/<slug>` | template-path | |
| `template: custom` | retired — repin from the stack plugin's menu | template-path | yes |
| a scalar `deploy_template` | a list: `[ <slug> ]` | template-path | |
| `deploy_template: n/a` | `[]` — "decided: none" on a list axis | template-path | |
| `docs/specs/` | `docs/blueprint/` | file-location | |
| `docs/blueprint/.vwf.yml` | `.config/vwf.yaml` | file-location | |
| `docs/blueprint/<entity>.md`, or `<entity>/` at the blueprint root | `entities/<entity>/index.md` + `schema.yaml` | file-location | |
| entity `data.md` / `api.md` / `jobs.md` / `screens.md` | `index.md` + `schema.yaml`, `apis/<project>.openapi.yaml`, and the owning flow's Screens and Jobs | file-location | yes |
| a single-file entity's `## Data Model` table | `schema.yaml` — Field/Type/Optional/Default/Validation become `properties`/`required`/`default`, unmappable prose the property's `description` | file-location | |
| a single-file entity's `## API Surface` table | `apis/<project>.openapi.yaml`, one operation per row with a generated `operationId` | file-location | |
| `docs/blueprint/integration.md` | `flows/index.md` plus one `flows/<project>/<NNN>-<flow>/index.md` per flow | file-location | |
| `architecture.md`'s `## Project Registry` and `## Cross-cutting Decisions` | `registry.yaml` (`projects`, `cross_cutting`) | file-location | |
| links to `architecture.md#project-registry` | `./registry.yaml` | file-location | |
| `flows/<flow>/`, `flows/<project>/<device>/<NNN>-<flow>/` | `flows/<project>/<NNN>-<flow>/` | file-location | |
| a flow's `## Screens` section inside `index.md` | `<platform>.md` beside it | file-location | |
| an in-car flow as its own folder | `auto.md` inside the parent flow it is a subset of | file-location | yes |
| `docs/prompts/screens/<project>/<device>/<NNN>-<flow>/<seq>.md` | `docs/prompts/screens/<project>/<NNN>-<flow>/<platform>.md` | file-location | |
| a prompt tree's `carplay.md` / `android-auto.md` | `auto.md` | file-location | |
| `docs/prompts/screens/<project>/<device>/CLAUDE--<platform>.md` | `docs/prompts/screens/<project>/CLAUDE--<platform>.md` | file-location | |
| `docs/handoffs/next.md` | `docs/memory/handoff/next.md` | file-location | |
| a `mempalace.yaml` anywhere — per repo, per mined tree, or under `.config/` | retired in `config_format` 24 — the memory store is `docs/memory/` alone; each file is offered for delete by the migrate pipeline, one row each | retirement | |
| `docs/memory/planning/`, `runs/`, `doctor/` | retired in `config_format` 24 — the plan folder and `docs/plans/index.json` hold the planning record and the run state, and doctor reports again on each run; each folder that exists is offered for delete, one row each | retirement | |
| an entity's `Serves:` line | `Used by:`, linking the flows that use it (flows keep `Serves:`) | doc-section | |
| `## Consistency boundary`, `## Failure handling`, `## Idempotency`, and links to them | one `## Guarantees` table, anchored `#guarantees` | doc-section | |
| a flow's `device:` frontmatter key | the `Platforms` table plus each `<platform>.md`'s `platform:` | doc-section | |
| the registry's `deviations:` block | the config's `enforcement:` block | doc-section | |
| `stage-*` / `prod-*` tag globs in `conventions.md#pipeline` | `<project>-stage-v<semver>` / `<project>-prod-v<semver>` | doc-section | |
| a secrets or env-var **catalog** under `conventions.md#config` | `docs/blueprint/environment.md`; `#config` keeps only the injection mechanism | doc-section | |
| type `vwf-integration` on a root `integration.md` | the same token, now the type of `flows/index.md` — the spelling never changed, its referent did | doc-section | |
| a Risks-table `Validated by` cell (or no validation column at all) | `Validation method` + `Status` + `Evidence` columns — old text maps onto the closed method vocabulary (the product skill's `references/validation.md`); `Status` is `untested` unless the row already carries evidence | doc-section | yes |
| a Slice priority table with no `Validates` column | a `Validates` column naming the Risks row the slice validates — `—` when it validates none | doc-section | |
| a goal with no `Re-evaluate if:` line | the first goal gains one — `<metric> below <floor> by <date> → kill / pivot / re-scope` — elicited, never invented | doc-section | yes |
| a free-text `Measured via:` line | one of the four structured forms (`counter <flow-slug>.<outcome>`, `counter <entity>.<state>`, `store-metric <intent>`, `external <source>`) — propose from the old text, confirm where ambiguous; a `counter` form is also declared beside the owning flow's Acceptance block or entity's Lifecycle table | doc-section | yes |
| a flow Guarantees row with no `Load & latency` cell | the cell, defaulted to the token `default — per conventions#reliability` | doc-section | |
| an entity doc with no `Scale:` line | a `Scale:` line — count order-of-magnitude at a stated horizon plus the growth driver — elicited | doc-section | yes |
| an externally-triggered or payment/entitlement-mutating flow with no abuse-case criterion | one abuse-case Given/When/Then in Acceptance, or `n/a — <why>` — elicited | doc-section | yes |
| a core foundation skipped by omission in the registry | accepted (or adapted), or an explicit `<foundation>: deferred-preprod` token — elicited, never defaulted | doc-section | yes |
| a registry `capabilities` block with no trust-boundary abuse notes | one worst-plausible-abuse line per trust boundary (external caller, webhook, file upload) — elicited | doc-section | yes |
| a `conventions.md#reliability` carrying SLOs only | plus expected user count and aggregate request rate at a stated horizon — elicited on first touch | doc-section | yes |
| `conventions.md#baseline` ending at rule 15 | rule 16, `baseline/expand-contract` | doc-section | |
| released-API snapshots only under `apis/released/` | plus per-entity `schema.yaml` snapshots in `apis/released/entities/` — written by the next production `/vwf:verify`, nothing to migrate | doc-section | |
| `conventions.md#pipeline` ending at rule 5 | rules 6–8 — `pipeline/load-proven`, `pipeline/rollback-path`, `pipeline/dependency-audit` | doc-section | |
| no `conventions.md#incidents` section | the alert-conditions table (condition → destination → runbook), once the incident foundation is accepted | doc-section | |
| an entity's `Actors & Actions` section | retired — actors are the owning flow's Trigger & Actors | retirement | |
| ungrouped, unnumbered flow folders | `flows/<project>/<NNN>-<flow>/`, gap-numbered by 10 | numbering | |
| numbers assigned per device subgroup | one number line per project | numbering | |
| any number on a standard flow | its designated number (`010`/`020`/`030`/`040`, `100`, `910`–`950`); everything else into `110`–`890`, existing order preserved | numbering | |
| a screen code carrying the old flow number (`010a`) | re-coded to the new number (`100a`), letters and order kept | numbering | |
| a synonym flow slug (`login`, `dashboard`, …) | the standard slug in `${CLAUDE_PLUGIN_ROOT}/assets/standard-flows.md` | numbering | yes |
| a standard flow's primary screen name (`Dashboard`) | the flow's slug (`home`) | numbering | yes |
| canvas page names `010-signin--mobile`, `--carplay` | `020-signin--mobile`, `--auto` — this targets canvas state, not the repo tree | numbering | |
| `pipeline.autopilot_caps` | `pipeline.execute_caps` | config-key | |
| `mockups:`, `mockups.project_id` | `design:`, `design.project_id` | config-key | |
| `design.project_id`, a flat `design.projects.<project>` | `design.projects.<project>.<platform>` | config-key | yes |
| `design.design_system_id` tied to a mockup project's uuid | the same key, now its own canvas project, one per product — a value equal to one of `design.projects`' uuids is the drift signal | config-key | |
| `design.flows_pushed` | `design.flows_rendered` | config-key | |
| `design.tool` | `projects.<name>.design`, on UI projects only | config-key | |
| product-wide `backing:` / `deploy:` | `projects.<name>.stack.backing_template` (a list) / `deploy_template` | config-key | |
| a project's `stack:` key in the registry | `projects.<name>.stack` in the config — the registry carries no stack at all | config-key | |
| no CI axis anywhere — there was never a product-wide `cicd:` to move down | `projects.<name>.cicd`, detected once from the repo and confirmed | config-key | yes |
| `projects.<name>.platforms` in the config | the registry's `platforms:` — the single source | config-key | yes |
| `ui:` computed from a project's UI **role** | the same key, now true when some project declares a screen platform — recompute it from the registry rather than trusting a stale `true` on a `cli`-only product | config-key | |
| `enforcement.stacks` | retired — `projects.<name>.stack` plus its `note` | config-key | |
| `projects.<name>.stack_reason` | `projects.<name>.stack.note`, carried verbatim | config-key | |
| a flat **list** at `projects.<name>.stack` | the structured block — `template`, `languages`, `frameworks`, `dependencies`, split per `${CLAUDE_PLUGIN_ROOT}/assets/stack-vocabulary.md` | config-key | |
| `enforcement.structure` | retired — `topology` plus `topology_reason` | config-key | |
| no `enforcement.kept_files` block | `kept_files: {}` — the block format 18 introduced; nothing is retired and nothing converts, an absent block reading as empty | config-key | |
| `enforcement.editor_keys` (format 20), `answers.editor` (format 21) | retired in `config_format` 22 — both keys removed, nothing converts; every `.config/vscode.d/*.jsonc` is offered for delete, one row each, defaulting to delete; `.vscode/` is never touched by this pass — its `settings.json` is bootstrap's | retirement | |
| a top-level `answers:` block (formats 21–22) | retired in `config_format` 23 — nothing reads the block: a repo's answers live in its `.config/bootstrap.toml`, written by bootstrap, whose `docs/sync/migrate.md` maps the old keys; the per-repo dependency-bot key retires with nothing to convert, since its tool is no longer landed. This pass leaves the block and its stamp, and its report says that the block can be removed by hand, after which the next `/vwf:setup` stamps 23; a config that never carried the block only takes the stamp | retirement | |
| a flow id carrying a `<device>` segment, or missing its `<platform>` leaf | `<project>/<NNN>-<flow>/<platform>` | config-key | |
| `environments` keys `dev`, `test`, `stage`, `prod` | `development`, `staging`, `production` — `test` has no single canonical partner; propose, never auto-fix | config-key | yes |
| a `memory:` block (`memory.wing`), and the palace rooms it addressed (`plans`, then `planning`; `decision`, then `decisions`) | retired in `config_format` 24 — the block is offered for removal by the migrate pipeline; a room's records are files under `docs/memory/decisions/`, `gaps/` and `problems/` from then on | retirement | |
| no top-level `addons:`; a `notion` entry in a `projects.<name>.stack.backing_template`; the MCP server vwf's manifest shipped | `config_format` 25 — `addons:`, always a list, `[]` when none, never `unresolved`. `notion` leaves every `backing_template` and joins nothing: in each repo whose stackgen lockfile records the `capability-provider/notion` pack — the base and each member — the step calls the stack adapter's plain `remove: capability-provider/notion` under this step's one consent, so its skills and its server go. A member not cloned locally is a part not yet applied, and the stamp stays at 24 until it is done. `taste-skill` joins when any repo's stackgen lockfile `bootstrap:` block records `taste-skill@taste-skill`; "any repo" means those cloned locally, base and members, a member not cloned skipped with a one-line warning. The server vwf's manifest used to ship is not asked about and adds nothing to `addons:` — a repo at 24 is never asked about a tool step 26 then removes | config-key | |
| an `addons:` entry `context7` or `notion`; a `projects.<name>.design` pin to `claude-design`, retired beside claude-code, lovable and stitch; an MCP record in a stackgen lockfile; an MCP server key in this machine's `vwf-tools` | `config_format` 26 — every MCP server is the user's to install, and no stack plugin lands one. **Repo part** — the format step, run once: in each repo whose stackgen lockfile names the component, the base and each member, the stack adapter's plain `remove: context7` and `remove: notion`, and both leave `addons:`. One re-pin question names every project pinned to `claude-design` and re-pins all of them to claude-code (the default), lovable or stitch; on claude-code the same question offers to add `taste-skill` to `addons:`, yes the default. Projects pinned to another design tool are not touched. Setup records the choice, runs plain `remove: claude-design` (its skills, its server, its lockfile entry) and then materializes the picked tool — claude-code, lovable or stitch — so its adapter skills land on clean paths, and clears `design.design_system_id`, the re-pinned projects' `design.projects` entries and `design.flows_rendered`; `docs/blueprint/design-system.md` and the flow docs stay. One more row of the step deletes every MCP record left in each lockfile directly, whichever slug recorded it or none, so no MCP record survives the migration. Setup asks one consent and passes it to each `remove:` call. Each accepted part is applied and stays, a declined part writes nothing, and a member not cloned locally is a part not yet applied: the stamp moves to 26 only once every part is applied, and until then setup offers only the remaining parts. **Machine part** — every setup run, at any stamp, beside `reconcile-claims:`: when this machine's `vwf-tools` manifest holds an MCP server key, one consent lists every key and the other repos that claim one; on yes, `remove: key <name>` per key, which edits only that manifest and `claims.json`, then setup prints the servers for the user to install by hand. Declined, nothing is written and it is offered again on the next run | config-key | |
| no `projects.<name>.stylesheet` on a project declaring a `site` or `webapp` platform | `stylesheet: unresolved` — the axis `config_format` 19 introduced; nothing converts, the key is written so the deferred decision is visible. A project declaring neither platform takes no key | config-key | |
| a Screens row on a `site`/`webapp` platform file with no `Metadata` block | the block, `blueprint_format` 25 — propose per row: `title` from the Screen cell, `description` empty, `index: yes` for `site` and `no` for `webapp`, `image: default`; never auto-fix | doc-section | |

Two notes the table cannot carry. **vwf ships no stack templates**: a
`project/<slug>` pin resolves through a stack plugin
(`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`), so a retired path is repinned from a
menu, never rewritten by hand. And **retiring the palace in `config_format` 24
moves no drawer into `docs/memory/`** — a format reconcile removes only the
config that addressed it, and never reads, rewrites or deletes palace data.

## The fan-out rule

A retired token that maps to more than one current spelling is **never picked
silently**. Resolve each one in three steps:

1. **Read the evidence.** The recognition tables in `topology-detection.md` say
   what each current spelling looks like on disk. Judge the directory, not the
   name it used to carry.
2. **Propose** the mapping that evidence supports, quoting the evidence that
   supports it.
3. **Confirm by MCQ**, one decision per round per
   `${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`, with the other candidates offered.

Where no evidence separates the candidates, ask outright rather than defaulting.
Old role `packages` is the case that proves the rule: `packages` is now a
platform available under every role, the role names the package's primary
consumer domain, and nothing about the package's behaviour changes either way —
so a wrong answer here is invisible forever.
