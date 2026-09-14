# Backlog

Work agreed but not yet planned. Each item is picked up by `/vwf:change-plan`,
alone or as the group its row names, and moves to `done` when its plan is
archived under `docs/plans/archived/`. Priority is `P1` (pick first) to `P3`.

Captured 2026-09-13 from a single request; the grouping below is the proposed
plan split, to be confirmed at each plan's interview.

| Id  | Item                                                                    | Group | Priority | Status |
| --- | ----------------------------------------------------------------------- | ----- | -------- | ------ |
| B01 | `/vwf:change-plan` commits and pushes the plan folder when it hands off | A     | P1       | done   |
| B02 | Version rule: no version component equal to `13` or `17`, enforced      | A     | P1       | done   |
| B03 | `/vwf:backlog` skill — a prioritised to-do list beside the blueprint    | A     | P1       | done   |
| B04 | `init`: split `REPO_NAME` (folder name) from the `p:<id>:*` group id    | B     | P1       | done   |
| B05 | `/vwf:feedback` — post-build change intake from user feedback           | C     | P2       | done   |
| B06 | Audit logs as an independent, access-controlled capability              | D     | P2       | done   |
| B07 | Stylesheet axis for web frontends: `tailwindcss` and `stylex`           | E     | P2       | done   |
| B08 | SEO, OpenGraph and favicons for sites and webapps                       | E     | P2       | done   |
| B09 | `notion` MCP server config                                              | F     | P3       | done   |
| B10 | `stack-reputation` skill — vet every stack stackgen recommends          | G     | P2       | done   |
| B11 | Claude Code terminal as the default design tool, via `taste-skill`      | H     | P2       | done   |

## Groups

- **A — vwf process** (B01, B02, B03). Small, independent skill and gate
  changes; one plan.
- **B — init id split** (B04). Touches `init`, the mise pack's conventions and
  task library, and `doctor`; one plan.
- **C — feedback** (B05). A `feedback` skill already ships; the plan decides
  whether this is a rework or a gap in what it routes.
- **D — audit-log capability** (B06). A `product-foundations` reference for
  audit logs already exists; this adds the stackgen capability pack and the
  console wiring.
- **E — web frontend surface** (B07, B08). Both land in the frontend packs and
  the blueprint's screen contracts; one plan.
- **F — notion MCP** (B09). Where MCP server configs live decides the shape.
- **G — stack reputation** (B10). A stackgen skill, run before any recommend.
- **H — terminal design tool** (B11). The largest; likely more than one plan.

## Items

### B01 — change-plan commits and pushes the plan

At the end of `/vwf:change-plan`, once the folder is `APPROVED`, commit it and
push to `develop` or the current branch, before the hand-off line. Today the
skill writes the folder and stops; the plan reaches the fresh session only if
the user commits by hand.

Planned in: `docs/plans/archived/2026-09-13-vwf-process/`

### B02 — version rule: never 13 or 17

Every version line (plugin semver, `config_format`, `blueprint_format`, the
installer, the site) skips any version containing `13` or `17` as a component.
Today this is documented in `setup/references/format-lineage.md` and in memory,
enforced nowhere. Program it: the checker (`p:plugins:check`) refuses such a
manifest version, the release and version tasks refuse to cut one, and the
skills that bump a format stamp state the rule.

Planned in: `docs/plans/archived/2026-09-13-vwf-process/`

### B03 — `/vwf:backlog` skill

A separately managed to-do list, picked up when other work is done. Each entry
carries a priority that decides what is picked first. Adds, lists, reprioritises
and closes entries; `/vwf:change-plan` and `/vwf:plan` can read it for the next
item. This file is the seed and the first consumer.

Planned in: `docs/plans/archived/2026-09-13-vwf-process/`

### B04 — split `REPO_NAME` from the task-group id

`init` uses one id for `REPO_NAME` and for the `p:<id>:*` task group. They
differ: `REPO_NAME` is the folder name (`95octane`), while the group id is per
project and recommended to be the project type (`service`, `worker`, `console`).
Separate them in `init`'s question 2, the mise pack's marked positions and
conventions, and `doctor`'s checks.

Planned in: `docs/plans/archived/2026-09-14-repo-name-split/`

### B05 — `/vwf:feedback`

Used once the product is built, to make changes as per user feedback. The
shipped `feedback` skill classifies and routes production feedback into
blueprint, product, design-system, postmortem or change-plan. Plan interview
decides what the request adds beyond that.

Planned in: `docs/plans/archived/2026-09-14-feedback-gaps/`

### B06 — audit logs as an independent capability

Observability collects logs, metrics and telemetry. Audit logs are separate:
they can contain sensitive data, must be stored securely, and are readable only
by authorised people, usually through the `console` project. Provision it as an
independent capability outside observability: a stackgen `capability-provider`
pack with a category of its own, the blueprint contract it implies, and the
console access rule. The existing `product-foundations/references/audit-logs.md`
is the contract's starting point.

Planned in: `docs/plans/archived/2026-09-14-audit-capability/`

### B07 — stylesheet options for web frontends

Any web-based frontend (webapp or site) can pick a stylesheet approach. Offer
`tailwindcss` and `stylex`. Decide whether this is a new stackgen pack type or a
component of the `app-framework` packs, how the design-system tokens map into
each, and how `doctor` checks the pick.

Planned in: `docs/plans/archived/2026-09-14-web-frontend-surface/`

### B08 — SEO, OpenGraph and favicons

Every website, and webapp where it applies, ships SEO metadata, OpenGraph tags
and a favicon set. The site in this repo already does both by hand
(`2026-09-05-site-seo-and-markdown`, `p:site:icons`); lift that into what the
frontend packs land and what the blueprint's screen contract pins.

Planned in: `docs/plans/archived/2026-09-14-web-frontend-surface/`

### B09 — `notion` MCP server config

Add a `notion` MCP server config. Today MCP servers live in vwf's manifest
(`mempalace`, `context7`) and in `design-tool` packs (`mcp_servers:` written
into the project's `.mcp.json` behind consent). Decide which of the two shapes
notion takes.

Planned in: `docs/plans/archived/2026-09-14-notion-workspace/`

### B10 — `stack-reputation` skill

Before stackgen recommends or generates a stack, check the reputation of every
package, action or image it names, so a malicious or typosquatted package is
never recommended. Defines the signals (registry age, downloads, maintainers,
advisories, provenance), the sources, and where in the stack-menu and template
flow it runs.

Planned in: `docs/plans/2026-09-14-stack-reputation/`

### B11 — Claude Code terminal as the default design tool

A `design-tool` pack for Claude Code itself, made the default. It uses
`taste-skill` and runs an interactive session: it starts by creating a design
system, then a logo, then layouts (mockups and prototypes). The mockups are
served by a local webserver so the user opens a browser, selects elements and
enters comments, and edits are made from those. Touches the design axis,
`design-system`, `screens`, `mockups`, `import-*` adapters and
`feedback canvas`.

Planned in: `docs/plans/archived/2026-09-14-terminal-design-tool/` (the pack,
the default, the logo) and `docs/plans/archived/2026-09-14-design-review-loop/`
(screens, the review server, the comment round)
