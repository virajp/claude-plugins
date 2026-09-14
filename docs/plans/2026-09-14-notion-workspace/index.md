---
type: vwf-change-plan
title: notion workspace — a workspace category, its contract, and the notion
  capability-provider pack
requires:
  - docs/plans/archived/2026-09-14-audit-capability
  - docs/plans/archived/2026-09-14-web-frontend-surface
backlog: [ B09 ]
---

# Plan — notion workspace — a workspace category, its contract, and the notion capability-provider pack (2026-09-14)

## Status

**RUNNING** since 2026-09-14. Worktree `.worktrees/2026-09-14-notion-workspace`,
branch `2026-09-14-notion-workspace`.

## Consent

| Action                                            | Granted                                                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                           |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                           |
| After landing: `/release`                         | ask                                                                                                                                                                           |
| Release stackgen publicly                         | minor — `plugins/stackgen/.claude-plugin/plugin.json`, the next minor above the value the tree holds when U4 runs, never a 13 or 17 component; by editing the `version` field |
| Release the new pack                              | `0.1.0` — `capability-provider/notion`, pinned by its bundle, `mise run p:plugins:inventory`; by U2's commit                                                                  |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U4 runs it first)                                                                  |
| Release vwf publicly                              | none — untouched                                                                                                                                                              |
| Release installer publicly                        | none — untouched                                                                                                                                                              |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

A product whose team keeps its docs, specs and tickets in Notion can pin
`notion` on a project's backing axis (`projects.<name>.backing_template`) and
have Notion's hosted MCP server land in that repo's `.mcp.json` behind the
tier-2 consent line the materializer already runs, recorded in the lockfile the
way the `claude-design` server is. "Wired and available" is the whole scope: no
vwf step reads Notion after this plan, and vwf is not touched.

The backlog item asked which of two shapes the config takes. The repo had
already answered: the 2026-08-28 ruling ("generate the wiring, do not hold it")
and `plugins/stackgen/assets/artifact-doctrine.md:200-205` ("a server belongs in
exactly one place") put a project-scoped server in the repo's `.mcp.json`
through a pack, never in vwf's manifest, whose `context7` and `mempalace`
entries are vwf's own tooling and not a product's. This plan follows that
ruling; there is **no reversal**.

## Facts the survey established

**The two MCP shapes.** vwf's manifest `mcpServers` block is
`plugins/vwf/.claude-plugin/plugin.json:36-51` — `mempalace` (`type: http`) and
`context7` (stdio, runner overridable by `${CONTEXT7_RUNNER:-pnpm dlx}`, the
only token precedent being `${CONTEXT7_API_KEY:-}`); the checker guards its
runner shape at `scripts/src/check.ts:1425-1460`, and the marketplace projection
drops the block (`scripts/src/marketplace.ts:52`). The pack shape is
`mcp_servers:` in `pack.yaml`, defined at
`plugins/stackgen/assets/pack-format.md:169-182` (project-scoped → repo
`.mcp.json`; `user_mcp_servers:` → the generated local plugin; the same name in
both halts the run). Exactly one pack declares it today:
`plugins/stackgen/stacks/design-tool/claude-design/pack.yaml:12-15` —
`type: http`, a URL, no `env`. No pack `mcp_servers:` entry carries `env`.

**The write path.** `stackgen-stack-template`'s materializer performs the write
—
`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md:155-158`
(excluded from the file plan, tier 2) and `:219-226` (writes the project
`.mcp.json`, merges, never owns, records the keys under the lockfile's top-level
`mcp_servers`; a decline leaves the skills landed and says the tool is
unreachable). Tier table: `.../references/local-plugin.md:22-31`. The consent
tier is its own separately skippable line:
`plugins/stackgen/assets/output-tree.md:9`, `:21-28`, `:318`;
`.claude/skills/stackgen-plugin/SKILL.md:86`, `:141-146`. Re-sync diffs the key
as its own declinable line:
`plugins/stackgen/skills/stackgen-sync/SKILL.md:129-131`. The reviewer fails a
`.mcp.json` edit not behind its own consent line:
`plugins/stackgen/agents/stackgen-skill-reviewer.md:64`, `:92`.

**Kinds and axes are closed.** Twelve kinds at
`plugins/stackgen/assets/kinds.md` (the `capability-provider` spec is
`:624-686`: axis `backing`, a neutral contract under `assets/contracts/`, the
instance component carrying the six-topic bar, the category doctrine cited and
never restated). Axis vocabulary
`project | backing | deploy | repo | design | cicd` at
`plugins/stackgen/assets/pack-format.md:158`, `:201`. There is no kind for an
MCP-only pack. Capability-provider packs are pinned per project in
`projects.<name>.backing_template: [ <slug>, … ]`
(`plugins/vwf/assets/stack-adapter.md:72-93`). Shipped capability-provider
packs: `doppler`, `fnox`, `oidc`, `otel-lgtm`, `temporal` (the audit plan adds
`audit-store-d1` and `audit-store-postgres`).

**Categories with no vwf token exist.** `plugins/stackgen/assets/taxonomy.md`
lists them (`secrets-manager`, `access`, `static-hosting`, `stateful-compute`, …
at `:129-137`); doppler's `pack.yaml:6-9` leaves `capability` unset with a
comment saying so, and states that minting a token is vwf's move.
`plugins/vwf/assets/capability-vocabulary.md` is untouched by this plan.

**The pack shape to mirror** is
`plugins/stackgen/stacks/capability-provider/doppler/`: `pack.yaml` (name,
summary, version, type, category, kind, axis, harness), `conventions.md`,
`skills/doppler/SKILL.md`, and under `skills/doppler/references/` the six-topic
files `pick-and-trade.md`, `contract-satisfaction.md`, one constraint file
(`two-injectors.md` there), `access-shape.md`, `cost-shape.md`,
`local-stack.md`. The bundle is `plugins/stackgen/stacks/bundles/doppler.md`
(frontmatter `name`, `axis`, `kind`,
`components: [ capability-provider/doppler@1.0.0 ]`). A bundle pins the pack's
current `version`; `p:plugins:inventory` fails generation on a bad pin
(`pack-format.md:245-266`). Pack files cite nothing by plugin path — rule 13
(`.claude/skills/plugin-authoring/references/checks.md:145`).

**Doctor** checks no MCP server's wiring or reachability for any server
(`plugins/vwf/skills/doctor/` matches `mcp` only for `mempalace.yaml`); its
backing-axis check verifies the pin resolves to an offered template
(`plugins/vwf/skills/doctor/references/stack-checks.md:129-148`). Unchanged
here; parked.

**The two Notion servers.** Notion ships a hosted remote MCP server reached over
HTTP with OAuth that Claude Code runs on first use, and an open-source stdio
server (`@notionhq/notion-mcp-server`) that needs an integration token in its
environment. The hosted one matches the `claude-design` pack's entry shape
exactly. U2 verifies the current URL and transport through Context7 before
writing it — nothing in this folder is a source for that string.

**Docs that describe today's inventory** and will be falsified by a new category
and pack: `plugins/stackgen/stacks/readme.md:131-135` (the capability-provider
list, U1's), `plugins/stackgen/stacks/inventory.md` (generated, U2's),
`.claude/docs/plugins.md` and `.claude/skills/stackgen-plugin/SKILL.md` where
either counts packs or categories, `readme.md`'s plugin inventory, and
`site/src/content/docs/plugins/stackgen.md` (U3's). The audit plan's parked list
records "now five categories under capability-provider" — after this plan it is
six.

**Gates over the touched trees.** `p:plugins:check` rules 4 (strict-YAML
frontmatter on every pack skill), 12 (retired vocabulary) and 13 (no plugin-path
citation in a landed file) walk the new pack; rule 11 is moot (the pack ships no
`config/`). `p:plugins:inventory -- --check` asserts the pin. `mise tasks` and
the pending plans' gate lists give the nine wave-gate lines below. Commit
convention `.config/git-conventional-commits.yaml`: types `ops`, `docs`,
`merge`, `feat`, `fix`, `refactor`; no scopes.

**Recall.** No archived plan or decisions doc touches Notion; mempalace's
`ai-plugins` wing holds the 2026-08-28 wiring ruling quoted above.

## Assumed decisions — confirm or override at review

| # | Decision       | Ruling                                                                                                                                                                                                                                                                  | Rejected                                                                                                                | Unit   |
| - | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| 1 | Shape          | A stackgen pack declaring `mcp_servers:`; the materializer lands it in the target repo's `.mcp.json` behind the tier-2 consent line, recorded in the lockfile. No reversal. (User, MCQ.)                                                                                | vwf's manifest `mcpServers` (a reversal of 2026-08-28); `user_mcp_servers:` into the local plugin                       | U2     |
| 2 | Kind           | `capability-provider`, a new category `workspace`, axis `backing`, pinned in `projects.<name>.backing_template`. Costs a neutral contract at `plugins/stackgen/assets/contracts/workspace.md` and a taxonomy row; no vwf change, no config-format bump. (User, MCQ.)    | a new `agent-tool` kind on a new axis (widens the closed axis vocabulary across vwf); a contract-less standalone bundle | U1, U2 |
| 3 | What Notion is | An **agent-side knowledge workspace**: the team's docs, specs and tickets live there, and the agent reads, searches and writes them. The contract describes that access; "wired and available" is the whole scope — no vwf step consumes Notion in this plan. (User.)   | a runtime-integration contract (the product's code talking to Notion)                                                   | U1     |
| 4 | Server         | Notion's **hosted remote MCP server** — `type: http`, a URL, OAuth run by Claude Code on first use; no token in the tree, no `env` key. U2 confirms the URL and transport through Context7 (`resolve-library-id` → `query-docs`) before writing the entry. (User, MCQ.) | the local stdio `@notionhq/notion-mcp-server` with `NOTION_TOKEN: ${NOTION_TOKEN:-}` fed by the secrets provider        | U2     |
| 5 | Token seam     | No vwf capability token: `workspace` joins the taxonomy's categories-with-no-token list, and `pack.yaml` leaves `capability` unset with doppler's comment adapted. (Assumed — "wired and available" needs no elicitation surface in architecture.)                      | mint a `knowledge-workspace` B token in `plugins/vwf/assets/capability-vocabulary.md`                                   | U1, U2 |
| 6 | Category name  | `workspace`; prose noun "the workspace". (Assumed.)                                                                                                                                                                                                                     | `knowledge-workspace`, `knowledge-base`                                                                                 | U1, U2 |
| 7 | Wave order     | U2 runs after U1 so the pack cites the contract's clauses as written, not as guessed. (Assumed; the audit plan ran its pair concurrently.)                                                                                                                              | U1 and U2 in one wave                                                                                                   | U2     |

## New dependencies

none

## Units

| Id | Wave | Unit file                                            | Owns                                                                                                                                                                                                                                                                                                                                                                 | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-workspace-category.md](01-workspace-category.md) | `plugins/stackgen/assets/taxonomy.md`, `plugins/stackgen/assets/kinds.md` (only where a cross-reference needs it), `plugins/stackgen/assets/contracts/workspace.md` (new), `plugins/stackgen/stacks/readme.md`                                                                                                                                                       | —          | green   | 8d57fdaa |
| U2 | 2    | [02-notion-pack.md](02-notion-pack.md)               | `plugins/stackgen/stacks/capability-provider/notion/**` (new), `plugins/stackgen/stacks/bundles/notion.md` (new), `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                             | U1         | green   | 4a7ec74e |
| U3 | 3    | [03-docs.md](03-docs.md)                             | `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-14-audit-capability.md` (widened at run time: the "five categories" passage U2 reported), `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md` (widened at run time: the "design-tool packs are the case that needs it" passage R2 found) | U1–U2      | green   | ec25b9ac |
| U4 | 4    | [04-gates-and-bump.md](04-gates-and-bump.md)         | `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                                | U3         | running |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                               | Why it collides                                               | Owner   |
| ------------------------------------------------------------------ | ------------------------------------------------------------- | ------- |
| `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json` | several units bumping one version is a lost update            | U4 only |
| `.claude-plugin/marketplace.json`                                  | generated; regenerating mid-wave races                        | U4 only |
| `plugins/stackgen/stacks/inventory.md`                             | generated with the pack pin; must land with it in one commit  | U2 only |
| `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**` | n units editing one doc                                       | U3 only |
| `docs/backlog.md`                                                  | the backlog skill's; nobody in this run edits it              | nobody  |
| `plugins/vwf/**`                                                   | no vwf token is minted; the plan leaves vwf untouched         | nobody  |
| `plugins/stackgen/assets/contracts/secrets.md`                     | the precedent U1 reads for shape; this plan changes no clause | nobody  |

## Waves

- **Wave 1** — U1 alone: the category doctrine and the contract the pack will
  cite.
- **Wave 2** — U2 alone: the pack, its bundle, the regenerated inventory.
- **Wave 3** — U3: docs over the branch delta.
- **Wave 4** — U4: version bumps, the generated marketplace, the full gate.

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
wave-2 tree until U2's commit regenerates it — the orchestrator commits U2 with
the regenerated inventory before re-running the gate, per the shared-file rule.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                 |
| -------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | Stages stackgen into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag. A **restarted** session is what loads the staged plugin. |
| `/release`                 | ask  | Cuts the stackgen and site tags per the consent block. The run stops once and asks first.                                                                             |

## Gates the orchestrator keeps

- **The six-topic bar.** After wave 2,
  `command ls -R plugins/stackgen/stacks/capability-provider/notion` shows
  `pack.yaml`, `conventions.md`, `skills/notion/SKILL.md` and six files under
  `skills/notion/references/` — `pick-and-trade.md`, `contract-satisfaction.md`,
  one constraint file, `access-shape.md`, `cost-shape.md`, `local-stack.md`.
- **The server entry is tokenless.**
  `command grep -n -A6 'mcp_servers' plugins/stackgen/stacks/capability-provider/notion/pack.yaml`
  shows one server named `notion` with `type: http` and a `url`, and no `env`
  key anywhere in the file.
- **The category everywhere.**
  `command grep -ln 'workspace' plugins/stackgen/assets/taxonomy.md plugins/stackgen/assets/contracts/workspace.md plugins/stackgen/stacks/capability-provider/notion/pack.yaml plugins/stackgen/stacks/readme.md`
  lists all four.
- **The menu resolves.**
  `command ls plugins/stackgen/stacks/bundles/ | command grep notion` lists
  exactly `notion.md`, and `p:plugins:inventory -- --check` is green.
- **Rule 13.**
  `command grep -rn 'CLAUDE_PLUGIN_ROOT\|assets/contracts' plugins/stackgen/stacks/capability-provider/notion`
  is empty — the pack cites the contract by role.
- **vwf untouched.** `git diff --stat <base>..HEAD -- plugins/vwf` is empty at
  the end of wave 4.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

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

- **The server in vwf's manifest** — the repo's doctrine puts a product's server
  in the repo's `.mcp.json`; vwf's own two entries are vwf's tooling.
- **A token-bearing stdio server** — the hosted server needs no secret in the
  tree, so the secrets-provider seam is not exercised here.
- **A vwf capability token** — nothing in architecture needs to elicit Notion
  for "wired and available".
- **Any vwf step reading Notion** — parked below.

## Parked

- **A `/vwf:doctor` wiring/reachability check for MCP servers.** No server —
  `mempalace`, `context7`, `claude-design`, now `notion` — has one; doctor
  matches `mcp` only for the `mempalace.yaml` config file. A row reading the
  lockfile's `mcp_servers` keys against the repo's `.mcp.json` would close the
  silent-decline case the materializer records.
- **A vwf step consuming Notion** — `/vwf:feedback` harvesting a Notion
  database, or `/vwf:product` reading a workspace page as its source. Needs a
  ruling on which steps and what the agent may write back.
- **A `notion-local` instance pack** — the stdio server with a
  `${NOTION_TOKEN:-}` env seam fed by the secrets provider, should the hosted
  server's OAuth prove unworkable in some environment (CI, a headless box). It
  would be the first pack `mcp_servers:` entry carrying `env`, and the checker
  rule on runner overridability (`checks.md:235-245`) would need extending to
  pack entries.

## Run log

<written by /vwf:change-execute; empty at approval>

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | —     | green       | All nine wave-gate lines green on the branch as cut                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | U1        | opus  | 1     | green       | DECIDED: kinds.md role enumeration touched; contract cites secrets/taxonomy/kinds by role (no token, departs from siblings); no-token reason as its own paragraph; audit.md demoted from newest. GAP: readme paragraph placed after Audit, before Stylesheet; taxonomy/kinds cited by role not path                                                                                                                                                                                                                                                        |          |
| 1    | R1        | opus  | 1     | findings(4) | taxonomy.md:262 workspace is third not second to realize no token (web-head.md also none); taxonomy.md:267 web-head.md is newer than audit.md, chain not folded; contracts/workspace.md:16 fold break at 39 chars; kinds.md:632 edit 3's condition (enumerates by name) not met, roles only. CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                 |          |
| 1    | U1        | opus  | 2     | green       | Wave gate green, nine lines. Fixed all four: chain now workspace ← web-head ← audit, third no-token contract; fold rewrapped; kinds.md reverted by hand (condition not met). DOCS FALSIFIED: .claude/skills/stackgen-plugin/SKILL.md:39 names web-head newest (U3's)                                                                                                                                                                                                                                                                                       |          |
| 1    | R1        | opus  | 2     | pass        | All four resolved; wave touches three paths, all in Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 8d57fdaa |
| 2    | U2        | opus  | 1     | green       | DECIDED: url https://mcp.notion.com/mcp, type http, confirmed via Context7 (streamable HTTP recommended; /sse legacy, named as the same server and refused as a second entry); paths **/.mcp.json; capability-unset comment cites taxonomy by role; environment.md untouched. DOCS FALSIFIED: docs/memory/decisions/2026-09-14-audit-capability.md:162 "five categories" → six, nobody's Owns — U3's Owns widened to it. GAP: workspace is already a kind name (kinds.md:524); category and kind are separate namespaces, proceeded as decision #6 directs |          |
| 2    | R2        | opus  | 1     | findings(3) | materializer.md:221 "design-tool packs are the case that needs it" now false (nobody's Owns → U3 widened); site stackgen.md:225 newest category is audit → workspace (U3's, handed on); notion SKILL.md:15 paths**/.mcp.json loads the skill only while editing wiring, never while reading the workspace — looped to U2. CONTRACT clean, RULINGS clean                                                                                                                                                                                                    |          |
| 2    | U2        | opus  | 2     | green       | Wave gate green, nine lines; six orchestrator checks green. DECIDED: kept paths **/.mcp.json (a real judgment moment: the /sse second entry, no env block), moved the use trigger into description — user-invocable false + paths is model-reachable per artifact-doctrine.md:51; paths not widened to docs/ (would fire on every doc edit)                                                                                                                                                                                                                |          |
| 2    | R2        | opus  | 2     | pass        | SKILL.md only file changed in round 2; frontmatter strict-YAML; rules 1-4 clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 4a7ec74e |
| 3    | U3        | opus  | 1     | green       | Six files: stackgen-plugin SKILL.md contracts row, site stackgen.md (newest category workspace, cross-pack contracts list, unset-capability exception), site choosing-your-stack.md backing-axis sentence, readme.md stackgen paragraph, the two widened passages. DECIDED: CLAUDE.md and site vwf.md untouched (nothing falsified); every count from inventory.md. GAP: verification requires notion in .claude/docs/plugins.md, but that file holds no pack/category content — left unedited                                                             |          |
| 3    | R3        | opus  | 1     | findings(3) | materializer.md:223 hand-fold not refilled (42 chars); materializer.md:221 "the design-tool packs" plural vs one pack (site says second after claude-design); 03-docs.md:64 GAP confirmed — .claude/docs/plugins.md has no pack content, verification line unsatisfiable, unedited was right. CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                |          |
| 3    | U3        | opus  | 2     | green       | Wave gate green, nine lines. materializer passage names both packs that declare mcp_servers (claude-design, notion) and is hand-refilled to the file's width; nothing else touched                                                                                                                                                                                                                                                                                                                                                                         |          |
| 3    | R3        | opus  | 2     | pass        | Both resolved; the one remaining line restates U3's GAP as correct (verification line for .claude/docs/plugins.md unsatisfiable), not a defect                                                                                                                                                                                                                                                                                                                                                                                                             | ec25b9ac |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-14-notion-workspace
