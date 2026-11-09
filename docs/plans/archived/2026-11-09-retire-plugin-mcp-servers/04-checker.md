# U4 — Checker refuses user_mcp_servers and guards every MCP prefix

- **Read first:** `scripts/src/check.ts:80-120` (rule dispatch), `:1440-1800`,
  and `scripts/src/check.test.ts:1370-1660`.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md` (the
  rule numbers; owned by U6, read only).

## Ruling

> D8: A checker rule refuses a user_mcp_servers: key in any pack.yaml. The D28
> stdio runner guard over pack entries (checkPackRunners and its tests with the
> stacks/addon/context7 fixture) is removed. checkManifestRunners stays only if
> it still guards a plugin.json mcpServers key; otherwise it goes too, with a
> test that a plugin.json with mcpServers is refused.

> D9: The guard becomes general: any mcp__plugin_vwf-tools_,
> mcp__plugin_design-tools_ or mcp__<name>__ server prefix in vwf prose is a
> finding, because vwf reaches no server, whoever installed it. claude-design
> stays in TOOL_TOKENS as a retired token with a comment that names the
> 2026-12-14 sunset of standalone Claude Design. The prescription tests keep
> their sample token; the guard tests change to the general prefix. The
> ENUMERATION_PEERS comment names claude-code, lovable and stitch as the design
> values.

> D18: The orchestrator commits the wave 1 units in the order U1, U2, U4, U3.
> U4 adds a rule that refuses user_mcp_servers:, and pre-commit stashes the
> unstaged edits of the units not yet committed, so a U4 commit before U1 would
> scan the three packs U1 deletes and fail the hook.

## Edits

1. **`scripts/src/check.ts`** —
   - Add a finding: a `pack.yaml` under `plugins/*/stacks/**` with a top-level
     `user_mcp_servers:` key — message: the key is retired; a pack names a
     server it needs in a `## MCP servers` section of its `conventions.md`, and
     the user installs it. Put it under the existing pack rule that validates
     pack keys (rule 11's retired-key list, if that is where `tool-config:` and
     `machine_env:` are refused); do not add a new rule number unless no
     existing rule fits.
   - Remove `checkPackRunners` and its call at `:101`. Keep `invocations` and
     `runnerFindings` only if `checkManifestRunners` still uses them (D8).
   - `checkManifestRunners`: if it guards `mcpServers` in a plugin's
     `plugin.json`, change it to refuse any `mcpServers` key (a plugin declares
     no MCP server); else remove it with its helpers.
   - The design-MCP guard `:1748-1775`: match the general prefixes
     `mcp__plugin_vwf-tools_`, `mcp__plugin_design-tools_` and
     `/mcp__[a-z0-9_-]+__/` in vwf prose, independent of `TOOL_TOKENS`. Message:
     vwf reaches no MCP server; it calls the fixed adapter skills, and a server
     is the user's install. Keep the de-duplication with the prescription rule.
   - `TOOL_TOKENS` `:1494-1499`: keep `"claude-design"`; rewrite its comment:
     standalone Claude Design closes on 2026-12-14 and its pack was removed on
     2026-11-09; the token stays retired so prose cannot prescribe it again.
   - `ENUMERATION_PEERS` comment `:1536-1544` and the `prescribes` docstring
     `:1574`: the design values are `claude-code`, `lovable` and `stitch`.
   - `:1635-1637,1673`: drop the context7 history in the comments that
     survive.
2. **`scripts/src/check.test.ts`** — remove the pack-runner tests
   (`:1491-1545`) and the manifest-runner tests if their function is removed;
   add a test for the new `user_mcp_servers:` refusal (one pack with the key →
   one finding; one without → none); rewrite the design-MCP guard tests
   (`:1380-1415`) so each of the three prefixes, with a server name that is not
   in `TOOL_TOKENS` (for example `mcp__plugin_vwf-tools_foo__bar`), is a
   finding, and plain prose is none. Keep the prescription suite
   (`:1552-1650`) with its `claude-design` sample token.
3. **`scripts/src/plugins.ts`** — `:56`: remove the context7 history from the
   comment; change no code.

## Verification

- `mise x -- pnpm vitest run scripts` exits 0.
- `mise x -- pnpm exec tsc --noEmit -p scripts` exits 0.
- `mise x -- mise run p:plugins:check` exits 0 on the worktree tree as wave 1
  leaves it (it can be red before U1 deletes the three packs; then report it,
  and the wave gate decides).

## Guardrails

- Do not touch `plugins/**` or any doc (U1, U2, U3, U6).
- Keep every other rule's number; rule 15 stays retired.
- Run no generator.

## Commit

`feat: checker refuses user_mcp_servers and any mcp prefix in vwf`

> D28: Before it returns, each edit unit runs
> `mise x -- mise run code:format -- --fix <each file it changed>`, on its own
> changed files only, never the whole tree. The unit gate then only checks.

> D8 (as amended): checkManifestRunners becomes a refusal of any mcpServers key
> in every plugin manifest (vwf and stackgen plugin.json), because a plugin
> declares no MCP server (D3); its runner helpers go, with a test that a
> plugin.json with mcpServers is refused.

> D37: U4 adds claude-code to ENUMERATION_PEERS. U3 writes every vwf mention of
> claude-design within 100 characters of the replacement list. The retired
> token still catches a lone mention. (Add a test: claude-design within 100
> characters of claude-code is not a finding.)

> D38 (gaps 2 and 3): U4 follows D8 as amended — checkManifestRunners becomes a
> refusal of mcpServers over the vwf and stackgen manifests, and the runner
> helpers (invocations, runnerFindings) go; where Edit 1 says "only if" or
> "else", D8 as amended wins. U4 also owns scripts/src/marketplace.ts, for the
> comment at lines 52-55 only: a plugin manifest declares no mcpServers.
