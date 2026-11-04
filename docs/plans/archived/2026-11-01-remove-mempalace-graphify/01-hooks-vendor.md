# U1 — vwf hooks and vendored mempalace

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `installer/CLAUDE.md` (only to see what the test covered; do not edit it).

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

## Edits

1. **`plugins/vwf/hooks/hooks.json`** — remove the `PreCompact` and `Stop`
   entries that run `mempalace-precompact.sh` and `mempalace-checkpoint.sh`.
   Keep every other entry and the `modules` list unchanged. If an event key is
   left with no hooks, remove the key.
2. **`plugins/vwf/hooks/mempalace-checkpoint.sh`**, **`mempalace-precompact.sh`**
   — delete with `rm`.
3. **`plugins/vwf/vendor/mempalace/`**, **`plugins/vwf/skills/mempalace/`**,
   **`plugins/vwf/skills/mempalace-recall/`** — delete each tree with `rm -r`.
4. **`plugins/vwf/vendor/andrej-karpathy-skills/README.md`** (`:8`) and
   **`NOTICE.md`** (`:46`) — reword the two lines that compare karpathy's
   vendoring with mempalace's, so they state karpathy's own reason and no
   longer name mempalace.
5. **`installer/src/mempalace-checkpoint-script.test.ts`** — delete with `rm`;
   the script it tests is gone.

## Verification

- `mise x -- mise run code:format`
- `grep -rli mempalace plugins/vwf/hooks plugins/vwf/vendor` finds nothing.
- `plugins/vwf/hooks/hooks.json` parses as JSON (`jq . plugins/vwf/hooks/hooks.json`).

## Guardrails

- Do not touch `plugins/vwf/.claude-plugin/plugin.json` — U10 owns it (D10).
- Do not touch `hooks/action-log.sh` or `hooks/monitor/`.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width of the
  surrounding text by hand.

## Commit

`feat!: vwf drops the mempalace hooks and vendored skills`
