# U1 — manifest: launch mempalace without `--palace`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json` (the `mempalace` entry
  only), `scripts/src/check.ts` (the comment at `:1993-1997` only)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/.claude-plugin/plugin.json` whole;
  `scripts/src/check.ts:1985-2050`.
- **Lazy-load:** `.claude/skills/plugin-authoring/SKILL.md`, only if the checker
  complains about the manifest.

## Ruling

Decision 2: "`mise x -- mempalace-mcp` — drop `--palace`, `--backend` and
`--allow-insecure-no-token`, so mempalace reads `MEMPALACE_PALACE_PATH` itself
and expands `~`." Rejected: "`${MEMPALACE_RUNNER:-mise x --} mempalace-mcp`, the
context7 pattern; bare `mempalace-mcp`."

Decision 3: "Keep `command: "sh"` with `args: ["-c", …]`; only the argument
string changes."

Decision 8: "Correct the stale comment at `scripts/src/check.ts:1993-1997`;
leave the synthetic `type: http` fixture in `check.test.ts:1575-1590`."

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — in
   `mcpServers.mempalace.args`, the second element becomes exactly
   `mise x -- mempalace-mcp`. `command` stays `"sh"`, `type` stays `"stdio"`,
   the first arg stays `"-c"`. Touch no other key — not `version`, which is
   U4's.
2. **`scripts/src/check.ts:1993-1997`** — the comment that calls vwf's mempalace
   entry "a URL to a user-run daemon": rewrite it to say the entry is a stdio
   command (`sh -c "mise x -- mempalace-mcp"`) that the manifest-runner guard
   reads like any other, and that `mise` is not a `TOOL_TOKENS` entry. Comment
   only — no logic change.

## Verification

- `jq -r '.mcpServers.mempalace.args[1]' plugins/vwf/.claude-plugin/plugin.json`
  prints `mise x -- mempalace-mcp`.
- `grep -c -- '--palace\|--backend\|allow-insecure' plugins/vwf/.claude-plugin/plugin.json`
  prints `0`.
- `mise run p:plugins:check`, `pnpm vitest run` and
  `pnpm exec tsc --noEmit -p scripts` green.
- `git diff --stat` shows only the two owned files.

## Guardrails

- Do not touch `version` in `plugin.json`, the context7 entry, or any other
  manifest key.
- No logic change in `check.ts`; do not edit `check.test.ts`.
- Do not edit any doc — report what you see as `DOCS FALSIFIED:`.
- Do not run `p:plugins:marketplace`; the version and the generated manifest are
  U4's.
- Delete with `rm`, never `git rm`.

## Commit

`fix: launch vwf's mempalace server without --palace, so a ~ path expands` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
