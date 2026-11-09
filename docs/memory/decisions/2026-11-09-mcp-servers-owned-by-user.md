DECISION 2026-11-09 ★5 | plugins:vwf+stackgen | the user installs every MCP
server; no plugin or pack does → user_mcp_servers: retired, a pack names a
server in a ## MCP servers section, the context7, notion and claude-design packs
removed, config_format 26 migrates | reverses D2, D3, D6, D9, D21 and D28 of
2026-11-02-optional-tools-in-vwf-tools | alts rejected below

# Decision — MCP servers are owned by the user

**Date** 2026-11-09 · **Plan**
`docs/plans/2026-11-09-retire-plugin-mcp-servers` · **Backlog** B106

## Why

The user's words: "I want the ownership of install mcp servers to move to user
and not this plugin. Wherever the mcp servers are required, AI agent should
simply ask the user to install them." Standalone Claude Design also closes on
2026-12-14, so the `claude-design` pack and the server it landed had to go
before then.

## Decisions

- **D3. The user installs every MCP server.** The pack key `user_mcp_servers:`
  is retired: no pack declares it, the generator emits none, the materializer
  writes none, and `vwf-tools` holds LSP servers only. The tier-3 consent keeps
  only its LSP part. `p:plugins:check` refuses the key in any pack, refuses an
  `mcpServers` key in any plugin manifest, and refuses any `mcp__` server prefix
  in vwf prose.
- **D4. A pack names the server it needs** in a `## MCP servers` section of its
  `conventions.md`, beside `## Claude plugins`: one line per server, its exact
  name, what it is for and its official install page, `(optional)` after the
  name when the pack works without it. It is not handed to bootstrap. When a
  skill needs the server and it is missing, the agent asks the user to install
  it and waits. The materializer records each line in the lockfile's
  `required_mcp_servers`, and `/vwf:doctor` reports a declared server that
  `claude mcp list` does not show as drift, never blocking, an optional one not
  at all.
- **D5. `config_format` 26 moves a repo off the removed packs.** Its repo part
  runs once: `context7` and `notion` leave `addons:` through `remove: <slug>`,
  which now takes any materialized slug on any axis; one question re-pins every
  `claude-design` project to `claude-code`, `lovable` or `stitch`; and every MCP
  record in each lockfile is deleted directly. Its machine part runs on every
  `/vwf:setup`: one consent removes each MCP server key in `vwf-tools` through
  `remove: key <name>` and lists the servers for the user to install by hand.
- The `addon/context7`, `addon/notion` and `design-tool/claude-design` packs,
  their bundles, the `workspace` category and `contracts/workspace.md` are
  removed. The bundle kind `workspace` stays. `addon/taste-skill` is the one
  optional tool left.
- The stackgen generator keeps needing Context7 until plan 2: when none is
  reachable it asks the user to install a Context7 MCP server themselves and
  waits. It never installs one and never names a tools menu option.

## Reversals of 2026-11-02-optional-tools-in-vwf-tools

The old record is not edited; each reversed decision is listed here.

- **D2** (every picked MCP server lands in `vwf-tools`) — reversed: no MCP
  server lands in `vwf-tools`; the user installs it.
- **D3** (the claude-design server moves to `vwf-tools` and stays required) —
  reversed: the `claude-design` pack is removed, and its projects are re-pinned
  by step 26.
- **D6** (context7, notion and taste-skill are the `addon` packs) — reversed:
  only `addon/taste-skill` stays.
- **D9** (the generator halt names the tools menu) — reversed: the halt asks the
  user to install a Context7 MCP server and waits.
- **D21** (notion joins `addons:`) — reversed: step 25 adds no retired tool to
  `addons:`, and removes a `capability-provider/notion` entry.
- **D28** (the stdio runner guard reads every pack's `user_mcp_servers:`) —
  reversed: the runner guard is gone; the checker refuses the key and any
  `mcpServers` manifest key outright.

## Rejected

- Keep `user_mcp_servers:` for generated packs; a separate plan for the
  ownership move.
- Skill text only, with no structured declaration; a pack.yaml key such as
  `required_mcp_servers:`.
- A doctor remedy only, with no format bump; a silent drop in setup.
- Keep the runner guard for generated packs.
- Keep the workspace contract with no provider.
