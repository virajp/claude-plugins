# Plan — Optional tools in vwf-tools: context7, notion and taste-skill on explicit pick (2026-11-02)

## Goal

After this plan lands, the local plugin that stackgen generates is named
`vwf-tools`, and it holds every LSP server and every MCP server a repo
materializes. Three tools stop being installed by default: the `context7` MCP
server (today in vwf's own manifest), the `notion` MCP server (today written to
the repo's `.mcp.json`) and the `taste-skill@taste-skill` Claude plugin (today
handed to bootstrap by the default `claude-code` design bundle). Each is a pack
on a new `addon` axis, offered by a tools menu in `/vwf:architecture` with no
item preselected, recorded in a product-level `addons:` list in
`.config/vwf.yaml`, and materialized by `/vwf:setup` only when picked.

The user asked for this on 2026-11-02, after a table of every external
dependency of the two plugins showed that vwf installs Context7 for everyone.

Two reversals of standing decisions, named as such:

- **R1.** vwf no longer ships Context7. This reverses the absorption of the
  old context7 plugin into vwf's manifest
  (`.claude/skills/vwf-plugin/SKILL.md:54`,
  `.claude/skills/vwf-plugin/references/dependencies.md:77-91`).
- **R2.** The project-scoped `mcp_servers:` pack key and the tier-2 `.mcp.json`
  write path are retired. This reverses the three-sibling-keys design
  (`local-plugin.md:17-33`, `pack-format.md:128-143`, `output-tree.md:96-100`).
  `user_mcp_servers:` and `lsp_servers:` stay.

## Facts the survey established

**The local plugin (`stackgen-lsp`).**

- 29 hits, all prose; no script, test or checker rule contains the name. Hits:
  `references/local-plugin.md` (10: :4, :63, :72, :86, :89, :109-110,
  :152-153, :202-203), `references/materializer.md` (4: :265, :284-285, :358),
  `assets/output-tree.md` (9: :65, :68, :75-76, :329-331, :376-377),
  `assets/artifact-doctrine.md:188`, `skills/stackgen-sync/SKILL.md:110`,
  `.claude/skills/stackgen-plugin/SKILL.md:214`, `readme.md:295`,
  `site/src/content/docs/plugins/stackgen.md:602`. The paths above are under
  `plugins/stackgen/skills/stackgen-stack-template/` or `plugins/stackgen/`.
- Path
  `~/.claude/plugins/local/stackgen-lsp/.claude-plugin/{plugin.json,marketplace.json}`;
  shapes at `local-plugin.md:69-92`; tier-3 consent in two declinable items
  (`local-plugin.md:137-165`, `materializer.md:262-297`); merge as a union
  across repos (`local-plugin.md:115-135`); re-sync `local-plugin.md:101-113`
  and `stackgen-sync/SKILL.md:107-129,158-163`; removal
  `local-plugin.md:188-214`, `output-tree.md:369-383`.
- Lockfile block `local_plugin: {path, marketplace, plugin, scope,
  lsp_servers[], mcp_servers[], registered}`
  at `output-tree.md:328-336`; existing repos record the old names.
- Stale pointer: `materializer.md:169` says step 3b; the section is step 4.
- This machine has the plugin registered (`lspServers: [typescript-lsp]`).
- `plugins/vwf/assets/stack-vocabulary.md:18` defines the LSP plugin as the
  `virajp-plugins` plugin whose `lspServers` covers the language — stale.
- Generic "generated local plugin" prose that needs no rename:
  `materializer.md:168`, `output-tree.md:11,19,58,61,98,109,290`,
  `pack-format.md:129-141`, the `facts.lsp` lines of the language and
  app-framework packs, `stackgen-skill-reviewer.md:64-65,103`.

**MCP keys.**

- `mcp_servers:` (repo `.mcp.json`, tier 2) is declared by two packs only:
  `design-tool/claude-design/pack.yaml:12` and
  `capability-provider/notion/pack.yaml:17`. `user_mcp_servers:` is declared by
  none. `lsp_servers:` by `language/{typescript,kotlin,swift}` and
  `app-framework/{flutter,swiftui}`.
- The materializer's MCP consent line:
  `materializer.md:159-161,233-245,353-354`.
  Routing table: `local-plugin.md:24-31`. Lockfile split:
  `local-plugin.md:181-186`, `output-tree.md:338-341`. Two-writers halt:
  `artifact-doctrine.md` §5. Generator prose naming the keys:
  `generator.md:97-108`. Reviewer: `stackgen-skill-reviewer.md:65,103`.

**Context7.**

- No vwf skill, agent or reference uses Context7 at run time; vwf's only tie is
  `plugins/vwf/.claude-plugin/plugin.json:33-41`. Doctor does not check it.
- The stackgen generator halts without it: `generator.md:19-23` (precondition),
  `:60-63` (research step), `:31,:155` (reputation halts on the same terms).
  The menu text says so: `stackgen-stack-menu/SKILL.md:64-67`. Doctrine lines:
  `stackgen-reputation/SKILL.md:156`, `artifact-doctrine.md:237`,
  `stackgen-skill-reviewer.md:55`, `kinds.md:69,132,598`, `pack-format.md:359`.
- About 130 pack files carry passive "API belongs to Context7 at use time"
  hints — not swept (D16).
- Checker `scripts/src/check.ts:2226-2281` is generic over `mcpServers` and
  returns `[]` when the key is absent; its tests use a synthetic fixture. U3
  extends it to pack `user_mcp_servers:` (D28) and widens the design-tool MCP
  guard at `:2326-2343` (D20).
- Docs: `readme.md:68-75,215,242,276,472-477`, `CLAUDE.md:265`,
  `.claude/docs/plugins.md:12`, `.claude/docs/repo-shape.md:251`,
  `.claude/agents/target-verifier.md:113`,
  `.claude/skills/vwf-plugin/SKILL.md:21,54`,
  `.claude/skills/vwf-plugin/references/dependencies.md:77-91`,
  `.claude/skills/stackgen-plugin/SKILL.md:31,105,115,319`,
  `.claude/skills/plugin-authoring/references/checks.md:347-349`,
  `site/src/content/docs/plugins/vwf.md:59,104-106,4262-4296`,
  `site/src/content/docs/plugins/stackgen.md:213,223,349,1441-1444,1476,1490`,
  `site/src/content/docs/installer/usage.md:123`,
  `plugins/stackgen/.claude-plugin/plugin.json:5`,
  `.claude-plugin/marketplace.json:16`.

**notion.**

- Backing axis, picked through `projects.<name>.stack.backing_template`
  (`plugins/vwf/assets/vwf-config.md:86-88`); bundle `bundles/notion.md`, not
  default; `category: workspace`, no capability token
  (`assets/taxonomy.md:108,143,150-154`). Lands the `notion` skill (SKILL.md
  plus six references) and the `.mcp.json` entry. The skill auto-applies on
  `**/.mcp.json` (`skills/notion/SKILL.md:17`); `access-shape.md:21-24` shows a
  `.mcp.json` snippet. No vwf skill reads it.
- Versions: `pack.yaml:4` 0.1.0, `bundles/notion.md:6`, `inventory.md:37,155`.

**taste-skill and the design-tool packs.**

- `bundles/claude-code.md:5` is `default: true` — every UI project gets
  taste-skill today. Only `design-session` checks and halts
  (`skills/design-session/SKILL.md:64-69,267`; invocations at
  :76,81-82,86,110,164-167,313). `conventions.md:68-76` (halt sentence),
  `:92-94` (the `## Claude plugins` section). Bundle text
  `bundles/claude-code.md:22-25`.
- The handoff is `references/bootstrap-handoff.md` steps 4-10; materializer
  `:18-20,103-112,257-261,300-302,346-348`. Format spec
  `pack-format.md:194-205` (example taste-skill line :204).
- claude-design: `pack.yaml:12-15` declares the server; its import skills read
  through it (`design-import-screens/SKILL.md:22`,
  `design-import-conversations/SKILL.md:34`); bundle
  `bundles/claude-design.md:13-18`.
- Versions: claude-code `pack.yaml:5` 1.0.0, `bundles/claude-code.md:7`,
  `inventory.md:75,119`; claude-design `pack.yaml:4` 0.4.0,
  `bundles/claude-design.md:6`, `inventory.md:76,120`.

**Mechanics.**

- `scripts/src/inventory.ts` reads the kind vocabulary from the level-two
  headings of `assets/kinds.md` (``## `name` — …``); an undefined kind fails
  generation. Pack types and axes are free text in the scripts.
- The pre-commit `plugins-inventory` hook fires on any `stacks/**` path and
  asserts the inventory is fresh and every bundle pin equals its pack version;
  the marketplace hook asserts `.claude-plugin/marketplace.json` matches the
  manifests, whose descriptions it projects.
- `.config/vwf.yaml` is at `config_format: 24` (`vwf-config.md:47-50`); 25 is
  the next issuable number.
- Commit types (`.config/git-conventional-commits.yaml`): feat, fix, perf,
  refactor, revert, test, ops, docs, merge, wip.
- Gates: `code:format`, `code:lint`, `p:plugins:check`,
  `p:plugins:inventory`, `p:plugins:marketplace`, `code:precommit` (in the
  committed develop tree). `.config/vwf.yaml` `after_landing:` already runs
  `mise run p:plugins:local`.
- Recall: no open backlog item asks for this; B64, B43 (taste-skill-adjacent
  design skills), B102 (bootstrap integration) and B106 (the claude-design
  pack's future) are neighbours, not sources.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a plugin
version, never runs a generator (U3's inventory run is the one exception,
D17), never edits a doc outside its owns, never adds a dependency the plan does
not list, never commits. A unit deletes with plain `rm`, never `git rm` — it
stages nothing. A unit never writes a lock file.

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

- No tool other than context7, notion and taste-skill is added to the menu —
  B64 (Impeccable) and B43 (image-to-code) stay in the backlog.
- The future of the claude-design pack stays with B106; this plan only moves its
  server to `vwf-tools`.
- LSP selection does not change: LSP servers still come with their language
  and app-framework packs, with no menu.
- This repo's own `.config/vwf.yaml` is not edited; the user adds
  `addons: [context7]` by hand.
- In `scripts/src/**`, only `check.ts` and `check.test.ts` change: the
  design-tool MCP guard (D20) and the stdio runner guard (D28).

## Parked

- Sweep the about 130 pack hints that say API reference belongs to Context7 at
  use time (D16), to say "when context7 is picked".
- The `context7` keyword in the root `package.json` is installer metadata; the
  installer is not in this plan.
- `materializer.md:169`'s stale "step 3b" pointer is fixed by U1 only if U1
  edits that passage anyway.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-02-optional-tools-in-vwf-tools

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
