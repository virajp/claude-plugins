# Plan — Retire plugin-installed MCP servers and the context7, notion and claude-design packs (2026-11-09)

## Goal

After this plan lands, stackgen installs no MCP server: the user owns every MCP
install, and where a server is needed the agent asks the user to install it.
The `addon/context7`, `addon/notion` and `design-tool/claude-design` packs, their
bundles and the `workspace` category no longer exist, and no doc names them as
options. A repo that pins one of them moves off it through `config_format` 26.
This finishes B106 before standalone Claude Design closes on 2026-12-14.

Plan 1 of 2. Plan 2 requires this folder: it makes the stackgen generator
research without Context7, and decides the passive Context7 hints (B124).

**Reversal.** This plan reverses D2, D3, D6, D9, D21 and D28 of
`docs/memory/decisions/2026-11-02-optional-tools-in-vwf-tools.md` (decision D17
here). U6 writes the new record.

## Facts the survey established

- **Versions.** vwf `24.1.0`, stackgen `5.0.0`, `config_format` 25
  (`plugins/vwf/assets/vwf-config.md:49,52`; restated at
  `plugins/vwf/skills/setup/SKILL.md:168`). The three packs are each at
  `1.0.0`. `.config/releases.yaml` holds no pending level. No unit bumps a
  plugin version.
- **Only these three packs declare `user_mcp_servers:`.** After the removal no
  shipped pack does. The generator can still emit the key
  (`plugins/stackgen/skills/stackgen-stack-template/references/generator.md:106-111,116-229`).
  LSP servers (`lsp_servers:` in `language/typescript`, `kotlin`, `swift`,
  `app-framework/flutter`, `swiftui`) stay in `vwf-tools`, so `claims.json` and
  `reconcile-claims:` keep their purpose.
- **The generator's Context7 halt.** `generator.md:19-37` (precondition, the
  halt sentence at `:25-26`), `:66-77` (research loop), `:226-229`, `:252-253`.
  Repeated at `plugins/stackgen/assets/artifact-doctrine.md:236-239`,
  `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md:58,69-72`,
  `plugins/stackgen/skills/stackgen-reputation/SKILL.md:163-168`.
- **The MCP-server path.** `plugins/stackgen/assets/pack-format.md:128-145`,
  `kinds.md:850-853`, `artifact-doctrine.md:205-206,268`,
  `output-tree.md:10,108`, `local-plugin.md:3,25-26,125-150,315-344`,
  stack-template `SKILL.md:46-57,91-118,198-206`,
  `materializer.md:165-169,253,364-462`, sync `SKILL.md:62-87,142-148,176-179,211,260-263`,
  reviewer agent `:55,65,95,102-106`, `plugins/vwf/assets/design-adapter.md:306-311`,
  `plugins/vwf/assets/stack-adapter.md:108,192,277-310`,
  `plugins/vwf/skills/setup/references/materialize.md:38,61,86-91,155-170,179-190,252`,
  `plugins/vwf/skills/doctor/references/stack-checks.md:172-189,215-250`.
- **Addons.** `addons:` is written by `/vwf:architecture`
  (`plugins/vwf/skills/architecture/references/stack-menu.md:27,172-198`) and
  migrated at `plugins/vwf/skills/setup/references/format-lineage.md:132`,
  `migrate-pipeline.md:59-72`, `setup/SKILL.md:165-172`. Schema:
  `plugins/vwf/assets/vwf-config.md:46,71,192,238,305-310,767-776`. After the
  removal only `addon/taste-skill` stays; it declares no server and installs
  through the bootstrap handoff.
- **A repo with `addons: [context7]` today** takes an undefined path: the
  materializer reads a missing `stacks/addon/context7/pack.yaml`
  (`materializer.md:376-380`) or errors (stack-template `SKILL.md:86-89`).
  A repo with `design: claude-design` keeps its adapter skills and its
  `vwf-tools` server; doctor reports generic drift (`stack-checks.md:182-183`).
- **Design tools.** `claude-design` is not a default; `bundles/claude-code.md:5`
  is `default: true` on every platform. Every design-tool pack ships the three
  adapter skills, so `claude-code`, `lovable` and `stitch` still serve
  `/vwf:design-system`, `/vwf:screens` and `/vwf:feedback canvas`. The stitch
  pack compares itself to Claude Design at
  `plugins/stackgen/stacks/design-tool/stitch/skills/design-import-design-system/SKILL.md:24`.
- **The workspace category** is used only by `addon/notion`:
  `plugins/stackgen/assets/taxonomy.md:113-116,149,156-161,250-254`,
  `plugins/stackgen/assets/contracts/workspace.md`,
  `plugins/stackgen/stacks/readme.md:269-282`. The bundle kind `workspace`
  (`kinds.md:97-101,283-364,890,916-923`) is a different thing.
- **The checker.** `scripts/src/check.ts:1455-1500` (`TOOL_TOKENS`, `claude-design`
  at `:1499`), `:1536-1544` (`ENUMERATION_PEERS`), `:1574`, `:1604-1709`
  (`invocations`, `runnerFindings`, `checkManifestRunners`, `checkPackRunners`,
  called at `:101`), `:1748-1775` (the design-MCP guard). Tests:
  `scripts/src/check.test.ts:1380-1415,1445-1545,1552-1650`.
  `scripts/src/plugins.ts:56` is a history comment. vwf has no `mcp__` prefix in
  any file today.
- **Gates.** `p:plugins:check`, `p:plugins:inventory -- --check`,
  `p:plugins:marketplace -- --check`, `pnpm vitest run`,
  `pnpm exec tsc --noEmit -p scripts|installer` (`.github/workflows/plugins.yml`),
  `p:site:check` (`site.yml`). Pre-commit runs the marketplace, inventory
  (filtered to `^plugins/stackgen/(stacks/|assets/kinds\.md)`) and check hooks.
  `code:precommit` takes no `--all` flag (B118) and runs every file.
- **Commit convention.** `.config/git-conventional-commits.yaml`: types `feat`,
  `fix`, `perf`, `refactor`, `revert`, `test`, `ops`, `docs`, `merge`, `wip`;
  `commitScopes: []`, so scopes are free.
- **Docs that name the tools** (U6): `CLAUDE.md:261-262`; `readme.md:74-81,292-294,353-363,491-497`;
  `.claude/docs/plugins.md:12-13`; `.claude/docs/repo-shape.md:231-234`;
  `.claude/skills/stackgen-plugin/SKILL.md:31,53,71,91-94,160,174-182,301`;
  `.claude/skills/vwf-plugin/SKILL.md:22,56-57`;
  `.claude/skills/vwf-plugin/references/{dependencies.md:74-99,114,skills-and-agents.md:35,assets.md:24}`;
  `.claude/skills/plugin-authoring/references/checks.md:292-302`;
  `.claude/agents/target-verifier.md:114`;
  `site/src/content/docs/plugins/stackgen.md:57-58,149,214-230,358,469-482,511,556-588,609,658,947-950,984,1009-1012`;
  `site/src/content/docs/plugins/vwf.md:54-55,102,178,1393,1397,1578,1852,2066,4055-4059`;
  `site/src/content/docs/how-to/greenfield/ui-with-design-tool.md` (whole page);
  `how-to/operate/choosing-your-stack.md:199-206,239`;
  `how-to/brownfield/migrate-old-vwf-repo.md:71-74`;
  `installer/usage.md:124`; `site/src/pages/index.astro:73` (a link).

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a plugin
version, never runs a generator its unit file does not name, never edits a doc
it does not own, never adds a dependency, never commits. A unit deletes with
plain `rm`, never `git rm` — it stages nothing. A unit never writes a lock file.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    QUESTION Q<n>: <the question, readable alone>
    OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> | <option 4>]
    WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>

The three QUESTION lines repeat per question, `n` counting from 1 in the block,
with two to four options; a block with no question carries the one line
`QUESTION: none`. A unit completes every edit that does not depend on an answer,
never builds on a part an answer can change, then returns all its open questions
in one block.

## Out of scope

- The generator's research without Context7, and the 142 passive "Context7 at
  use time" hints in 49 packs (B124) — plan 2, which requires this folder.
- B127 (the elicitation redesign, and whether the generator path stays) — the
  user's lean is to retire it; not decided here.
- The `taste-skill` addon — it stays, and installs through bootstrap.
- The `design.*` config keys (`design_system_id`, `projects.<project>.<platform>`,
  `flows_rendered`) — they still serve `lovable` and `stitch`.
- The design exports under `docs/design/` and `docs/scratchpad/site-design/` —
  kept byte for byte; their Context7 prerequisite row is history.
- `installer/` — its `["mcp","context7"]` test key path is a sample, not the pack.
- The site's own Claude Design project (`site/CLAUDE.md:131-135`) — its chats
  and comments are lost after 2026-12-14; exporting them is the user's hand
  step, outside the plugins.

## Parked

none

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-09-retire-plugin-mcp-servers

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
