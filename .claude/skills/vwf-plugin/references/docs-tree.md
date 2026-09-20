# The docs vwf maintains, OKF, and format versioning

The tree the workflow skills write into a product repo, why it is an OKF bundle,
and how the two format stamps work.

Docs the commands maintain live under `docs/blueprint/` (the outcome contract
`product.md` — problem/users/goals/slice-priority + the `/vwf:feedback`-owned
Metric readings appendix + the optional Tiers & entitlements matrix — the
machine-readable registry `registry.yaml` beside its prose view
`architecture.md`, `conventions.md`, the product-wide `design-system.md`, the
per-project env-var/secret catalog `environment.md`; **one flow folder per flow,
grouped by primary registry project and numbered in execution order** —
`flows/<project>/<NNN>-<flow>/index.md` at one uniform depth for UI and non-UI
projects alike — `index.md` holding the **platform-agnostic contract** (trigger,
actors, steps, diagram, jobs, acceptance; no screens) beside one
**`<platform>.md` per implemented platform** (`mobile`/`tablet`/`desktop`/
`auto`/`site`/`webapp`) carrying that platform's Screens (rows coded
`<NNN><letter>`, codes **shared across platform files**, each with its
per-screen Components block, and — on `site`/`webapp` alone, since
`blueprint_format` 25 — a per-screen **Metadata** block headed by the row's
code: `title`, `description`, `index` and `image`, with a `webapp` whose project
does not declare `seo` pinning `title` alone); a non-UI flow is `index.md`
alone, as is a `cli` project's — the seventh platform is a terminal surface with
no screens, so it takes no platform file and never reaches the canvas, mockups
or the scratchpad, and a cli-only project is exempt from the standard-flows
mandates. Numbers are **designated** — `100` is always `home`, `010` splash /
`020` signin / `030` recover-account / `040` onboarding, `110`–`890` product
flows, `910`–`950` the account and audit screens — on one number line per
project. `flows/index.md` is the catalog (per-project sections, numeric order, a
Platforms column) + inter-service contracts; **one entity folder per entity** —
`entities/<entity>/` holding exactly `index.md` + `schema.yaml` — with
`entities/index.md` the catalog + product-wide erDiagram; and the API contracts
`apis/<project>.openapi.yaml` — one per API-publishing project, one declaring
the `service` platform — plus the frozen `apis/released/` snapshots, which a
`service` with no co-declared screen platform alone gets (a `[service, webapp]`
project's API serves its own UI, so no independent consumer needs the freeze),
and `apis/released/entities/<entity>@<date>.schema.yaml`, frozen at the same
moment for every entity regardless of project shape; the blueprint root holds
only the system docs), `docs/plans/` (one folder per plan, of either kind —
`/vwf:plan`'s cycle plans as `<date>-<HHMM>-<slice>/`, `/vwf:change-plan`'s
ad-hoc change plans as `<date>-<name>/` — each an `index.md` plus one
`NN-<unit>.md` per unit, shaped by `assets/templates/plan-folder.md`; a cycle
folder lives in the target repo under `multi-repo`, a change folder in the base.
Both are discovered through the base repo's `docs/plans/index.md`, which holds
**one table** per `skills/plan-management/references/plan-index.md` — columns
`Folder`, `Kind`, `Plan`, `Target repo`, `Priority`, `Status`, `Requires`,
`Backlog`, statuses `APPROVED`/`RUNNING`/`COMPLETE` only, every edit a direct
commit on the integration branch — the queue `/vwf:execute next` reads with no
`Kind` filter. Every row, every folder's Status block and the archive move are
written by one skill-invoked skill, `plan-management`, whose verbs the planners
and `/vwf:execute` call: the landing moves the folder into `archived/` and
re-points the row when no gap is open, and leaves it live with the row
`COMPLETE` when one is; the `archive` verb, invoked when the user asks in prose,
moves a folder of either kind whole, only its Status line rewritten, and
re-points the row, after which the sweep drops a `COMPLETE` row nobody's
`Requires` names — its `Backlog` column carries the `Bnn` ids of the backlog
project's items, since 2026-09-18 the backlog is **not in the tree**: it is a
project on the base repo's forge, a GitHub Project named for the base repo under
its account, one per product, which `/vwf:backlog` alone writes and
`change-plan`, `plan`, `execute` and `plan-management`'s `archive` verb call
with the ids their plan's `backlog:` frontmatter carries), `docs/runbooks/`
(per-project operational runbooks plus `postmortems.md`, seeded by the
incident-response foundation and appended to by `/vwf:feedback incident`), and
`docs/prompts/` (`<type>/<project>/<NNN>-<flow>/<platform>.md` — canvas design
briefs grouped by prompt type → registry project → flow, one brief per platform
regenerated in place (the filename carries the platform, mirroring the flows
tree exactly), plus the per-design-project canvas conventions files
`screens/<project>/CLAUDE--<platform>.md`; written by `/vwf:screens prompt`;
committed intent artifacts, not blueprint docs), and `docs/scratchpad/`
(**gitignored, never committed** — the mockup render tree,
`<project>/<NNN>-<flow>/<platform>/<screen-slug>[--<state>].html`, written by
`/vwf:mockups` and blueprint §6a, overwritten in place per flow; vwf auto-adds
the `.gitignore` line when missing). Superseded commands/agents/templates are
archived under `archived/vwf-<date>/` (`vwf-2026-06-19/` from the prior model;
`vwf-2026-07-04/` holds the retired `autopilot` command, whose behavior merged
into `execute`; `vwf-2026-07-07/` the format-8 `integration.md` template,
dissolved into the flow templates). The single-file cycle plan `/vwf:plan` wrote
until 2026-09-16 was retired with nothing archived and no compatibility reader:
a plan in that shape still in flight is finished on the vwf release that wrote
it, or its slice is re-run through `/vwf:plan`, whose stamp-heal drops what
already conforms. The change plan's own executor was retired the same day,
2026-09-16, absorbed into `/vwf:execute` — the one executor, switching on each
unit's `Kind` — with nothing archived, no alias and no redirect; the record is
`docs/memory/decisions/2026-09-16-one-executor.md`.

The `docs/blueprint/` tree is an **OKF bundle** — vwf is an opinionated
*profile* of Google's Open Knowledge Format (OKF) v0.1. Every doc is a typed OKF
concept: mandatory YAML frontmatter (`type` from a fixed vocabulary —
`vwf-product`/`vwf-architecture`/`vwf-conventions`/`vwf-design-system`/
`vwf-environment`/`vwf-flow`/`vwf-flow-platform`/`vwf-integration` (the flow
catalog)/`vwf-entity`/`vwf-entities`/`vwf-plan`/`vwf-change-plan` (a plan
folder's `index.md` — cycle or ad-hoc change plan; the blueprint completeness
bars do not apply to it, and it carries no `status:` or `description:`, its
Status block being its one status) — plus `title`, `description`, `status`;
optional `timestamp`/`owner`/`resource`/`tags`; flow/entity docs additionally
carry the pipeline-owned `implementation:` build stamp), and cross-doc
relationships are typed markdown links (the OKF edge) rather than prose. YAML
artifacts (`registry.yaml`, `schema.yaml`, `*.openapi.yaml`) are typed by
**path**, not frontmatter (the OpenAPI files carry only `info.x-vwf.status`).
This makes a blueprint portable to any OKF-aware tool (e.g. the OKF static-HTML
visualizer) and ingestable by graphify, and lets the `blueprint-reviewer` verify
frontmatter + that every edge resolves. The doctrine lives in the
blueprint-authoring skill's `frontmatter-and-links` reference.

**Format versioning.** vwf ships the stamp in `assets/blueprint-format`
(currently **24**). Since vwf 18 the stamps are **drift detectors only** —
nothing selects a migration by them. There is no `N → N+1` delta ladder for the
blueprint format: a stale stamp sends `/vwf:setup` into its `migrate` mode,
which **reconciles the tree against the current format's own sources**
(`assets/templates/`, `assets/examples/blueprint/`, the blueprint-authoring
bars, `assets/vwf-config.md`) rather than replaying steps, resolving retired
spellings through the lineage table in
`skills/setup/references/format-lineage.md` and confirming by MCQ any spelling
that fans out to more than one current one. There is therefore no support
window: any stamp reconciles to the shipped one. **Do not restate the per-format
history here** — what each past format changed is git's job; a second narrative
copy is precisely the drift the density doctrine warns about, and it was 105
lines of this file before format 16. The *current* shape is what this section
describes throughout; the paired `config_format` (currently **20**, the bump
that added `enforcement.editor_keys`) is described under `assets/vwf-config.md`,
and its own `N → N+1` deltas do still live there — state-based reconciliation
replaced the **blueprint** ladder only. **Neither line issues 13 or 17.** From
`config_format` 18 and `blueprint_format` 24 onward a bump steps past both
integers — the same rule a plugin version and this repo's package versions obey
— so `config_format` went 16 → 18 when `enforcement.kept_files` arrived. Stamps
issued before the rule stand and are read by the history, not by the rule:
`config_format` 13 is real, and `blueprint_format` 13 is not. The lineage table
in `skills/setup/references/format-lineage.md` is where that history lives.

The two stamps are separate number lines, which have now drifted apart in both
directions: `14`, `16`, `18` and `20` shipped without a blueprint bump (the
first closed the stack menu; the second gave each stack axis its `unresolved`
state and made `deploy_template` a list; the third added
`enforcement.kept_files`; the fourth added `enforcement.editor_keys`) and `21`
shipped without a config bump (it only moved one config file). `22`/`15` shipped
**together**, as `19`/`12` and `20`/`13` did — the config's `template` pin and
`ui:` key both depend on the platform vocabulary, so a repo on one but not the
other is a state neither migration expects. `23` and `24` each then shipped
alone and purely additively: the first lifts the blueprint-coverage exemption
for the `plugin` platform, retires no spelling, and needs no config key.
`19`/`25` then shipped **together** again, and for the same kind of reason the
earlier pairs did: the `stylesheet` axis is a config key and the per-screen
`Metadata` block is a blueprint section, but the choice and the contract arrived
in one change, so a repo on one but not the other is a state neither side
expects.
