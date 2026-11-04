# U7 — Gates

- **Read first:** `plugins/stackgen/.claude-plugin/plugin.json`.

## Ruling

> - D4: Retire it: remove the mcp_servers: key, the .mcp.json write path and its
>   tier-2 consent line from the pack format, the materializer and the
>   generator. user_mcp_servers: is the only MCP key. stackgen-sync removes a
>   repo's recorded .mcp.json entries, behind consent.
> - D17: U3, as its last step, with mise x -- mise run p:plugins:inventory: the
>   pre-commit inventory hook needs each new or moved pack, its bundle, its
>   pack.yaml version, kinds.md and inventory.md in one commit. U3 also bumps
>   the versions of the packs it changes. This is the one generator a non-gates
>   unit runs.

## Edits

1. **`plugins/stackgen/.claude-plugin/plugin.json`** — in `description`
   only: the language servers sentence says they go to the generated local
   plugin `vwf-tools` outside the repo, together with every MCP server a
   component declares; the last sentence no longer names `.mcp.json` — it
   says `.claude/settings.json` is written only behind its own explicit
   consent line, merging never owning; add one clause that optional tools
   (context7, notion, taste-skill) are an `addon` axis the user picks. Keep
   "per-topic Context7 research". Change no other key; the version is the
   release task's.
2. `mise x -- mise run p:plugins:marketplace` — regenerate
   `.claude-plugin/marketplace.json`. Keep what it writes.
3. Run the full wave gate.

## Verification

- Every wave-gate line — green.
- `grep -c 'mcp.json' plugins/stackgen/.claude-plugin/plugin.json` prints 0.

## Guardrails

- Touch nothing else. `plugins/stackgen/stacks/inventory.md` is U3's and is
  already fresh; if the inventory check is red here, report `UNRESOLVED:`
  rather than regenerating it.
- The plugin manifest edit and the regenerated `marketplace.json` land in one
  commit.

## Commit

`ops: stackgen description names vwf-tools; regenerate the marketplace`
