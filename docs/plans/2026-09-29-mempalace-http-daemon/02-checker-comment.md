# U2 — the checker's doc comment names the HTTP entry

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** `scripts/src/check.ts` :2340-2380 (the `invocations()` doc
  comment and the code under it); `plugins/vwf/.claude-plugin/plugin.json`
  :44-47 (read-only). Line numbers may have moved.

## Ruling

> - Decision 1: vwf's mempalace server is an HTTP daemon at `127.0.0.1:8765` for
>   every vwf user, as the manifest declares.
> - Decision 7: Any comment or sentence a unit adds is one sentence, wrapped at
>   the fold.

## Edits

1. **The `invocations()` doc comment** (:2356-2362) — it cites vwf's mempalace
   entry as `sh -c "mise x -- mempalace-mcp"`. Rewrite it to what the manifest
   declares now, or to a generic example, and keep its statement that an http
   server carries no runner. Comment only — no code change.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `pnpm vitest run` green
- `git diff --stat` shows only comment lines changed in `scripts/src/check.ts`

## Guardrails

- Touch nothing outside the owned path; no code change, no test change.
- No `git checkout`/`restore`; no formatter `--fix` outside Owns.

## Commit

`docs: the checker's comment names vwf's HTTP mempalace entry` — written by the
orchestrator after the wave gate.
