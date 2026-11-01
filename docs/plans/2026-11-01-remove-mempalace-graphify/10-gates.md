# U10 — Gates

- **Read first:** `plugins/vwf/.claude-plugin/plugin.json`.
- **Lazy-load:** none.

## Ruling

> D1: Remove completely: after the change no plugin names mempalace or
> graphify. The one exception is cleanup code: doctor's drift rule for
> leftovers and the config_format 24 migration in setup may name the old files
> and keys. Nothing else in any plugin names either tool.

> D10: The gates unit U10 owns plugins/vwf/.claude-plugin/plugin.json and
> .claude-plugin/marketplace.json: it removes mcpServers.mempalace and the
> words mempalace-backed memory from the description, then runs mise run
> p:plugins:marketplace, so the pre-commit freshness hook sees both in one
> commit.

> D13: U10, in wave 4: files of U4, U5 and U6 cite it, and p:plugins:check
> refuses a citation of a missing file, so it is deleted only after those
> units have committed.

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — remove the
   `mcpServers.mempalace` entry; remove "mempalace-backed memory" from the
   `description`, keeping the sentence correct. Leave `version` alone.
2. **`plugins/vwf/assets/graphify.md`** — delete with `rm` (D13). U4, U5 and
   U6 removed every citation of it in wave 1; confirm with
   `grep -rl 'assets/graphify.md' plugins/` (no hit) before you delete it.
3. Run `mise x -- mise run p:plugins:marketplace` — it regenerates
   **`.claude-plugin/marketplace.json`** (and the gitignored dev manifest).
   This generator is this unit's by plan.
4. Pass the full wave gate.

## Verification

- `mise x -- mise run code:lint`
- `mise x -- mise run p:plugins:marketplace -- --check` passes.
- `mise x -- mise run p:plugins:check` passes.
- `jq -e '.mcpServers.mempalace == null' plugins/vwf/.claude-plugin/plugin.json` prints `true`.

## Guardrails

- Bump no version: the release task does that.
- Touch nothing outside the three owned files. The gitignored dev manifest
  that `p:plugins:marketplace` also writes is the generator's output, not an
  edit of yours.

## Commit

`feat!: vwf drops the mempalace MCP server`
