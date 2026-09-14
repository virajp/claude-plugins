---
type: vwf-change-plan
title: terminal design tool — the claude-code design-tool pack, the default on
  the design axis, and the logo in the design-system contract
requires:
  - docs/plans/archived/2026-09-14-stack-reputation
backlog: [ B11 ]
---

# Plan — terminal design tool — the claude-code design-tool pack, the default on the design axis, and the logo in the design-system contract (2026-09-14)

## Status

**RUNNING** 2026-09-15 by /vwf:change-execute. Worktree
`.worktrees/2026-09-14-terminal-design-tool`, branch
`2026-09-14-terminal-design-tool`. Approved 2026-09-14 by the user, after
self-review.

## Consent

| Action                                            | Granted                                                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                           |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                           |
| After landing: `/release`                         | ask                                                                                                                                                                           |
| Release vwf publicly                              | minor — `plugins/vwf/.claude-plugin/plugin.json`, the next minor above the value the tree holds when U7 runs, never a 13 or 17 component; by editing the `version` field      |
| Release stackgen publicly                         | minor — `plugins/stackgen/.claude-plugin/plugin.json`, the next minor above the value the tree holds when U7 runs, never a 13 or 17 component; by editing the `version` field |
| Release the new pack                              | `0.1.0` — `design-tool/claude-code`, pinned by its bundle, `mise run p:plugins:inventory`; by U5's commit                                                                     |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U7 runs it first)                                                                  |
| Release installer publicly                        | none — untouched                                                                                                                                                              |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

Claude Code itself is a design tool a product can pin — `claude-code` on the
design axis — and the one the architecture menu preselects. A product that pins
it authors its design system and its logo in-session, through the `taste-skill`
plugin, into a committed canvas at `docs/design/<project>/`, and vwf imports
both through the same three adapter skills every other design tool ships. The
logo becomes part of vwf's design-system contract as an optional `brand:` block,
so the blueprint can reference it and a later plan can derive a favicon set from
it.

This is the first of two plans for backlog item B11. Mockups rendered from the
canvas, the local server that serves them, the element-selection and comment
loop in the browser, and the edits made from those comments are **H2**, a
separate folder that requires this one. The tool-owns-authoring line
(`plugins/vwf/skills/design-system/SKILL.md:19-39`) is kept: the tool is Claude
Code running the pack's own authoring skill, its canvas is a directory, and vwf
still only imports. No standing decision is reversed.

## Facts the survey established

**The design axis.** The pin is `projects.<name>.design` in `.config/vwf.yaml` —
one of six axes; its value is the stackgen bundle slug
(`plugins/vwf/assets/stack-adapter.md:213-239`: the two tool axes `design` and
`cicd`, slug is the config value, required for any screen-platform project). The
`design:` block in the config is canvas state only — `design_system_id`,
`projects.<proj>.<platform>: <id>`, `flows_rendered`
(`plugins/vwf/assets/vwf-config.md:125-130`, writer/reader row `:213`). The
adapter reads the pin per project, never a product-wide `design.tool`
(`plugins/vwf/assets/design-adapter.md:50-72`). Elicited by architecture at
`plugins/vwf/skills/architecture/references/stack-menu.md:19`, `:46-47`,
`:85-105`, and `plugins/vwf/skills/architecture/SKILL.md:238-239`, `:347`. **No
default exists**: the menu is closed with no *other* entry
(`stack-menu.md:91-95`); the "offer the previous project's answer" rule
(`:51-56`) is per run.

**Possible values today: three bundle slugs** — `claude-design`
(`plugins/stackgen/stacks/design-tool/claude-design/pack.yaml:1-15`, the only
one with `mcp_servers:`, bundle `stacks/bundles/claude-design.md:1-21`),
`lovable` (`.../lovable/pack.yaml:1-12`, bundle `bundles/lovable.md:1-6`),
`stitch` (`.../stitch/pack.yaml:1-11`, bundle `bundles/stitch.md:1-6`).
Inventory `plugins/stackgen/stacks/inventory.md:27`, rows `:73-75`.

**The design-tool kind.** `plugins/stackgen/assets/kinds.md:911-960`: type
`design-tool`, axis `design`, a Design-Bundle of exactly one component, three
fixed model-invocable skills, a five-topic bar, `harness: n/a`. Taxonomy
`plugins/stackgen/assets/taxonomy.md:81-85`, `:181-190`. The menu skill emits
one `templates:` entry per bundle file plus the `generate:` entry
(`plugins/stackgen/skills/stackgen-stack-menu/SKILL.md:51-73`) and reads nothing
(`:114-116`). Bundle frontmatter keys today: `name`, `axis`, `kind`,
`components` (`plugins/stackgen/assets/pack-format.md:186-200`).

**The three adapters** — contract `plugins/vwf/assets/design-adapter.md:23-48`
(three fixed names, two hops), `:74-88` (`disable-model-invocation: false`
mandatory), `:90-107` (three halts), `:236-249` (what stays vwf's), `:251-273`
(adding a tool). Payloads: screens `:109-139`, design system `:141-186`,
conversations `:188-234`. vwf's side: `import-design-system`
(`plugins/vwf/skills/import-design-system/SKILL.md:36-54` resolve, `:56-81`
dispatch to `design-import-design-system`, `:96-105` return), `import-screens`
(`:31-38`, `:40-58`, `:60-85`, `:98-107`), `import-conversations` (`:30-42`,
`:44-58`, `:60-85`, `:86-104` — `harvested: n/a` is an answer). Rule 8
(`scripts/src/check.ts:1100-1165`) discovers packs from
`stacks/design-tool/<tool>/pack.yaml` and asserts all three skills present and
model-invocable; doctrine
`.claude/skills/plugin-authoring/references/checks.md:74-79`.

**`/vwf:design-system`** — `plugins/vwf/skills/design-system/SKILL.md`: the tool
owns authoring `:19-39`; §1 registry and the text-only path `:58-78`; §3 adapter
preflight `:85-121`; §4 delegate and parse `:123-141`; **§5 distill
`:143-161`**; §6 file form `:163-171`; §7 reviewer loop `:173-181`
(`plugins/vwf/agents/design-system-reviewer.md`); §9 pin `:200-205`. Template:
`plugins/vwf/assets/templates/design-system.md` (sections through Terminal UX,
Anti-Patterns, Open Questions — **no brand or logo slot**). Authoring doctrine
`plugins/vwf/skills/design-system-authoring/` with `references/terminal-ux.md`.

**"Logo" appears nowhere** in vwf or stackgen except one unrelated image-fit
line
(`plugins/stackgen/stacks/cloud-service/images/skills/cloudflare-images/references/service-doctrine.md:103`).
The design-system payload (`design-adapter.md:147-181`) has no brand slot.

**The vwf naming guard.** `scripts/src/check.ts:1299-1320` bans `claude-design`
as a tool token in vwf prose and explains why `stitch`/`lovable` are not listed;
`:1322-1349` is a three-path exception list; `checks.md:222-240` bans both
MCP-prefix spellings. So `claude-code` and `taste-skill` may appear in stackgen
prose, in the pack, and in config data — **never in `plugins/vwf/**` prose**.
The default mechanism must therefore be a generic flag vwf honours without
naming the entry.

**`taste-skill`** is unknown to the repo (hits only in `docs/backlog.md` and two
archived run logs). On this machine it is installed at user scope as
`taste-skill@taste-skill` — plugin name and marketplace name both `taste-skill`.
vwf's `dependencies` list is exactly `stackgen`
(`plugins/vwf/.claude-plugin/plugin.json`); the `claude-design` plugin no longer
exists (`.claude/skills/vwf-plugin/references/dependencies.md:99-121`).
`pack.yaml` has no key for a required plugin (`pack-format.md:144-176`). The
surface for a product's required plugins is init's question 5
(`plugins/vwf/skills/init/SKILL.md:362`), written into the task library's
`setup:ai`, which installs at project scope through `claude plugin …`.

**Doctor** on the design axis:
`plugins/vwf/skills/doctor/references/stack-checks.md:129-148` (the pin resolves
to an offered template; `unresolved` is a degradation), `:155-169` (a
screen-platform project needs `design`). No check for `design_system_id`, the
design-system doc, the materialized adapters, or a required plugin's presence —
parked.

**Mockups today** land under
`docs/scratchpad/<project>/<NNN>-<flow>/<platform>/`
(`plugins/vwf/skills/mockups/SKILL.md:42`), rendered by
`plugins/vwf/agents/mockup-generator.md` (`tools: Read, Write, Grep, Glob` — no
Bash; self-contained HTML, no JS, `:51`). Nothing serves them; the only
serve-URL concept is suppressed
(`plugins/vwf/skills/screens/references/import-mode.md:28`). H2's territory;
listed so no unit here reaches for it.

**Gates over the touched trees.** `p:plugins:check` rules 4, 8, 10, 12, 13;
`pnpm vitest run` over `scripts/` (rule tests live in
`scripts/src/check.test.ts`); `pnpm exec tsc --noEmit -p scripts`;
`p:plugins:inventory -- --check`; `p:site:check`. Commit convention
`.config/git-conventional-commits.yaml`: `ops`, `docs`, `merge`, `feat`, `fix`,
`refactor`; no scopes.

**Docs that describe today's behaviour** and are falsified here: the design-tool
list and the "three tools" count wherever stated —
`plugins/stackgen/stacks/readme.md:114` (U3's),
`.claude/skills/stackgen-plugin/SKILL.md`, `.claude/skills/vwf-plugin/` (the
design-axis and adapter passages, tool-neutral), `.claude/docs/plugins.md`,
`site/src/content/docs/plugins/vwf.md` (`design-system`, the design axis, the
menu), `site/src/content/docs/plugins/stackgen.md` (the pack list), `readme.md`
(U6's); `.claude/skills/plugin-authoring/references/checks.md` (U4's — the new
assertion's doctrine).

## Assumed decisions — confirm or override at review

| #  | Decision             | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                      | Rejected                                                                                  | Unit       |
| -- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------- |
| 1  | Slug and default     | The pack's slug is `claude-code`. A bundle's frontmatter may carry `default: true`; the stackgen menu payload passes it through on that entry; vwf's architecture menu **preselects whichever entry carries it**, as a generic rule that names no tool. No config-format bump. (User, MCQ.)                                                                                                                                 | slug `terminal`; no default flag                                                          | U2, U3, U5 |
| 2  | taste-skill          | `taste-skill@taste-skill` is a **declared requirement**: the pack's `conventions.md` and its bundle name it as the plugin the product must add at init's question 5, so the repo's `setup:ai` installs it at project scope; every pack skill that needs it halts with one plain sentence when it is absent. No new pack key, no vendored copy, no vwf dependency. (User, MCQ.)                                              | a `plugins:` key in `pack.yaml` with a new consent tier; vendoring the doctrine           | U5         |
| 3  | Canvas               | The tool's source of truth is `docs/design/<project>/`, **committed**: `design-system.md` in the shape `taste-skill` authors, `brand/logo.svg` with the variants the brand block names, and — from H2 — screens and comments. `docs/blueprint/design-system.md` stays vwf's import, written only by `/vwf:design-system`. (User, MCQ.)                                                                                      | the gitignored scratchpad; writing the blueprint doc directly                             | U5         |
| 4  | Logo in the contract | The design-system payload gains an **optional `brand:` block** — logo source path, mark and wordmark variants, clear space, minimum size, mono and dark rules — and the design-system template an optional **Brand** section; `/vwf:design-system` §5 imports it when the payload carries it and elicits nothing for it otherwise. Other tools return no block. Optional means **no `blueprint_format` bump**. (User, MCQ.) | a separate `brand.md` doc with a fourth adapter (rule 8 widens); canvas-only, outside vwf | U1         |
| 5  | Authoring skill      | The pack ships a fourth, **user-invocable** skill, `design-session`, beside the three fixed adapters: it runs the interactive session — design system first (through `taste-skill`'s design skills), then the logo (through `taste-skill:brandkit`) — writing the canvas. H1's session ends at the logo; layouts are H2. (Assumed.)                                                                                         | authoring inside `design-import-design-system`; a vwf skill                               | U5         |
| 6  | H1 adapters          | `design-import-design-system` reads the canvas into the payload, brand block included. `design-import-screens` returns the adapter's no-screens shape until H2 lands a screens canvas; `design-import-conversations` returns `harvested: n/a` until H2 lands comments. All three ship model-invocable so rule 8 passes. (Assumed.)                                                                                          | omit the two (fails rule 8); stub them to halt                                            | U5         |
| 7  | Checker              | A new assertion under rule 9's neighbourhood: across `stacks/bundles/*.md`, **at most one bundle per axis** carries `default: true`, and the value is boolean. Reported with the two offending files. (Assumed — the flag is a menu preselect, and two would be silent nondeterminism.)                                                                                                                                     | trust the author; assert in `p:plugins:inventory` instead                                 | U4         |
| 8  | Kind spec            | `kinds.md`'s design-tool entry admits a **file canvas** (the tool's source is a committed directory the adapters read) beside the hosted-canvas tools, and an optional user-invocable authoring skill beyond the three fixed ones. Doctrine only; the checker asserts the three, not the fourth. (Assumed.)                                                                                                                 | a new kind `design-tool-local`                                                            | U3         |
| 9  | Wave order           | U5 (the pack) runs after U1 and U3 so it writes the brand block and the bundle flag as the contract defines them, not as guessed. (Assumed.)                                                                                                                                                                                                                                                                                | everything in one wave                                                                    | U5         |
| 10 | B11 status           | B11 stays `open` until H2 is planned, then is marked `planned` with both folders. (User, at the gate.)                                                                                                                                                                                                                                                                                                                      | mark it planned under H1 alone                                                            | —          |

## New dependencies

none in this repo. `taste-skill@taste-skill` is a runtime requirement of a
**product** that pins the pack, declared by the pack and installed by that
repo's `setup:ai`; nothing here adds it to this repo or to vwf's manifest.

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                                                                                                                                                                                                                | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-vwf-brand.md](01-vwf-brand.md)           | `plugins/vwf/assets/design-adapter.md`, `plugins/vwf/assets/templates/design-system.md`, `plugins/vwf/skills/design-system/SKILL.md`, `plugins/vwf/skills/design-system-authoring/SKILL.md`, `plugins/vwf/skills/design-system-authoring/references/brand.md` (new), `plugins/vwf/skills/design-system-authoring/references/checklist.md` (widened at run time, R1), `plugins/vwf/agents/design-system-reviewer.md` | —          | green   | e08051 |
| U2 | 1    | [02-vwf-default.md](02-vwf-default.md)       | `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/skills/architecture/references/stack-menu.md`, `plugins/vwf/skills/architecture/SKILL.md` (only where it restates the menu)                                                                                                                                                                                                                                     | —          | green   | 97d593 |
| U3 | 1    | [03-stackgen-menu.md](03-stackgen-menu.md)   | `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`, `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/assets/kinds.md`, `plugins/stackgen/stacks/readme.md`                                                                                                                                                                                                                                           | —          | green   | 26cb5f |
| U4 | 1    | [04-checker.md](04-checker.md)               | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `.claude/skills/plugin-authoring/references/checks.md`                                                                                                                                                                                                                                                                                                         | —          | green   | 689b1f |
| U5 | 2    | [05-pack.md](05-pack.md)                     | `plugins/stackgen/stacks/design-tool/claude-code/**` (new), `plugins/stackgen/stacks/bundles/claude-code.md` (new), `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                          | U1, U3     | green   | 49b6de |
| U6 | 3    | [06-docs.md](06-docs.md)                     | `readme.md`, `CLAUDE.md`, `.claude/**` except `.claude/skills/plugin-authoring/references/checks.md`, `site/src/content/docs/**`, `plugins/vwf/assets/design-adapter.md` (widened at run time, R2: the "one of the three supported tokens" passage only)                                                                                                                                                            | U1–U5      | pending |        |
| U7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md) | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                                     | U6         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                               | Why it collides                                                     | Owner   |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------- |
| the two plugin manifests, `site/package.json`                                      | several units bumping one version is a lost update                  | U7 only |
| `.claude-plugin/marketplace.json`                                                  | generated; regenerating mid-wave races                              | U7 only |
| `plugins/stackgen/stacks/inventory.md`                                             | generated with the pack pin; must land with it in one commit        | U5 only |
| `.claude/skills/plugin-authoring/references/checks.md`                             | the checker's doctrine ships with the checker                       | U4 only |
| `readme.md`, `CLAUDE.md`, the rest of `.claude/**`, `site/src/content/docs/**`     | n units editing one doc                                             | U6 only |
| `docs/backlog.md`                                                                  | the backlog skill's; B11 moves when H2 is planned                   | nobody  |
| `plugins/vwf/skills/architecture/SKILL.md`                                         | U2 touches only a menu restatement; U1 never touches it             | U2 only |
| `plugins/vwf/skills/mockups/**`, `agents/mockup-generator.md`, `skills/screens/**` | H2's                                                                | nobody  |
| `plugins/vwf/skills/import-*/**`                                                   | the adapters dispatch by fixed name; nothing changes for a new tool | nobody  |
| `plugins/vwf/skills/doctor/**`                                                     | parked                                                              | nobody  |

## Waves

- **Wave 1** — U1, U2, U3, U4 concurrently: vwf's design files, vwf's menu
  files, stackgen's assets and menu skill, and `scripts/` — four disjoint trees.
  U2 and U3 name the same flag from ruling 1, not from each other.
- **Wave 2** — U5 alone: the pack, its bundle, the regenerated inventory — after
  the brand block (U1) and the bundle key (U3) exist as written.
- **Wave 3** — U6: docs over the branch delta.
- **Wave 4** — U7: version bumps, the generated marketplace, the full gate.

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
wave-2 tree until U5's commit regenerates it — the orchestrator commits U5 with
the regenerated inventory before re-running the gate, per the shared-file rule.
U4's new assertion must be green on the wave-1 tree (no bundle carries the flag
yet) and on the wave-2 tree (exactly one does).

## After landing

| Step                       | Mode | Notes                                                                                                                                                                                                                                                                                |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | Stages vwf and stackgen into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag. A **restarted** session is what loads the staged plugins — and where the user confirms by hand that `/vwf:architecture`'s design menu preselects the new entry. |
| `/release`                 | ask  | Cuts the vwf, stackgen and site tags per the consent block. The run stops once and asks first.                                                                                                                                                                                       |

## Gates the orchestrator keeps

- **Rule 8 sees four skills.** After wave 2,
  `command ls plugins/stackgen/stacks/design-tool/claude-code/skills` lists
  `design-import-conversations`, `design-import-design-system`,
  `design-import-screens`, `design-session`, and `p:plugins:check` is green.
- **vwf names no tool.**
  `command grep -rn -i 'claude-code\|taste-skill\|taste skill' plugins/vwf` is
  empty at the end of wave 4.
- **Exactly one default.**
  `command grep -l '^default: true' plugins/stackgen/stacks/bundles/*.md` lists
  exactly `claude-code.md`.
- **The checker refuses two.** `scripts/src/check.test.ts` carries a case with
  two bundles on one axis both flagged, asserting a finding that names both
  files; `pnpm vitest run` is green.
- **The brand block is optional in both directions.**
  `command grep -n 'brand' plugins/vwf/assets/design-adapter.md` shows the block
  marked optional, and
  `command grep -n 'Brand' plugins/vwf/assets/templates/design-system.md` shows
  the section with a delete-if-absent comment like Terminal UX's.
- **The pack cites nothing by path.**
  `command grep -rn 'CLAUDE_PLUGIN_ROOT\|assets/' plugins/stackgen/stacks/design-tool/claude-code`
  is empty (rule 13).

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

- **Mockups, the local server, the browser comment loop, edits from comments** —
  H2, which requires this folder.
- **A `plugins:` key in `pack.yaml`** — the requirement is declared in prose and
  satisfied by init's question 5.
- **A doctor check that a required plugin is installed** — parked.
- **A `blueprint_format` bump** — the Brand section is optional.
- **Editing `web-frontend-surface`'s stale `requires:` path** — the user chose
  to leave that plan alone.

## Parked

- **Favicon derivation from `brand:`.** B08's head contract
  (`docs/plans/2026-09-14-web-frontend-surface/`) pins a favicon set; once
  `brand:` carries a logo source, the frontend packs' icon task can rasterize
  from it the way this repo's `p:site:icons` does. A small follow-on once both
  plans have landed.
- **A doctor row for required plugins.** Init's question 5 writes the plugin
  list into `setup:ai`; nothing verifies they are installed. A row comparing
  that list with `claude plugin list` would close the halt-at-first-use case the
  pack's skills fall back to.
- **`design_system_id` for a file canvas.** `/vwf:design-system` §9 pins an id
  the tool returns; for a directory the natural id is a content hash or the
  canvas path. U5 decides and reports `DECIDED:`; if it proves awkward, a
  design-adapter clarification is a one-line follow-on.
- **A second in-terminal skill set.** The pack names `taste-skill`; a product
  wanting a different design doctrine in the terminal would be a sibling pack,
  not a variant of this one.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                 | Commit |
| ---- | --------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight | —     | —     | green       | all nine gate lines green on develop @ 7312ffc6                                                                                                                                                                                                                                                                                                                        | —      |
| 1    | U1        | opus  | 1     | green       | reviewer conditionality via §7 signal / section comment, no frontmatter field; `logo: null` allowed only with variants + rules line. GAP: template already had a "Brand assets" section (favicon/social/theme) the survey called absent — kept, brand.md points at it; possible overlap is a docs/next-plan call                                                       | e08051 |
| 1    | U2        | opus  | 1     | green       | flag wins over previous answer; delegation table and design paragraph unchanged; DOCS FALSIFIED: site vwf.md and .claude/skills/vwf-plugin "no default" passages (U6). GAP: config_format grep whole-file, asserted diff hunks add none                                                                                                                                | 97d593 |
| 1    | U3        | opus  | 1     | green       | taxonomy.md left (enumerates no skill set); verified with HEAD checker (U4 mid-edit). DOCS FALSIFIED: .claude/skills/stackgen-plugin/SKILL.md bundle keys / design-tool skill count (U6)                                                                                                                                                                               | 26cb5f |
| 1    | U4        | opus  | 1     | green       | appended as rule 14 (not folded into rule 9); no-key skipped, `default: false` accepted, unparseable frontmatter skipped. DOCS FALSIFIED: "thirteen rules" in CLAUDE.md:65,:151, .claude/docs/repo-shape.md:69,:157, .claude/skills/vwf-plugin/SKILL.md:41 (U6)                                                                                                        | 689b1f |
| 1    | R1        | opus  | 1     | findings(6) | 3 rule-5 in U6 files handed as DOCS FALSIFIED (CLAUDE.md:165 "rule 13 newest"; skills-and-agents.md:91 reference list; site vwf.md:2677 section list); checklist.md:19 no Brand item — GAP: U1 Owns widened to design-system-authoring/references/checklist.md; fold width SKILL.md:41 (U1), pack-format.md:206 (U3); contract clean, rulings clean                    | —      |
| 1    | U3        | opus  | 2     | green       | pack-format.md:206 comment folded to 72 chars                                                                                                                                                                                                                                                                                                                          | 26cb5f |
| 1    | U1        | opus  | 2     | green       | SKILL.md:41 row folded to sibling width; checklist.md gains conditional Brand item mirroring Terminal UX                                                                                                                                                                                                                                                               | e08051 |
| 1    | R1        | opus  | 2     | findings(1) | contested (cap): design-system-authoring/SKILL.md:41 row 147 vs 149 chars, two spaces of pad short — cosmetic; contract clean, rulings clean                                                                                                                                                                                                                           | —      |
| 2    | U5        | opus  | 1     | green       | design_system_id = canvas path (hash would drift); doc shape = stitch-skill DESIGN.md seven sections, logo via brandkit, SVG by hand; design-session carries no model; adapters effort medium. GAP: adapter defines no "no-screens shape" — took the ERROR halt line; taste-skill frontmatter names differ from dirs — used installed `taste-skill:<dir>` names        | 49b6de |
| 2    | R2        | opus  | 1     | findings(4) | design-adapter.md:251 "one of the three supported tokens" falsified — GAP: U6 Owns widened to that passage; `effort: medium` on the three adapters vs develop@48014708 (moved after cut) removing it from all siblings → U5 drops it; screens SKILL.md:43 170-col fence line and conversations SKILL.md:35-37 three-line `reason:` → U5; contract clean, rulings clean | —      |
| 2    | U5        | opus  | 2     | green       | `effort:` dropped from the three adapters; ERROR and reason literals shortened to one line rather than folded (emitted = shown)                                                                                                                                                                                                                                        | 49b6de |
| 2    | R2        | opus  | 2     | pass        | no findings; contract clean, rulings clean                                                                                                                                                                                                                                                                                                                             | —      |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-14-terminal-design-tool
