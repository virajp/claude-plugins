# U1 — vwf skills: the mempalace skill describes the daemon, doctor probes it

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/mempalace/**`, `plugins/vwf/skills/doctor/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts; `plugins/vwf/.claude-plugin/plugin.json`
  :44-47 (the HTTP entry — read-only); `plugins/vwf/skills/mempalace/SKILL.md`
  whole; `plugins/vwf/skills/doctor/SKILL.md` :150-170 and :270-285, and
  `plugins/vwf/skills/doctor/references/harness-and-memory.md` §7 (:21-96). Line
  numbers may have moved.

## Ruling

> - Decision 1: vwf's mempalace server is an HTTP daemon at `127.0.0.1:8765` for
>   every vwf user, as the manifest declares.
> - Decision 2: Generically: the command
>   `mempalace-mcp --transport http --host 127.0.0.1 --port 8765`; its env —
>   `MEMPALACE_BACKEND` and `MEMPALACE_QDRANT_URL` always set together, and
>   `MEMPALACE_PALACE_PATH` — set on the supervisor that runs it, not in
>   `~/.claude/settings.json`; it must be running before a Claude session
>   starts; pitchfork and launchd named as examples of a supervisor.
> - Decision 3: Doctor adds a degradation check:
>   `curl -s -o /dev/null --max-time 2 http://127.0.0.1:8765/mcp`; any HTTP
>   response is reachable, a refused connection or a timeout is a degradation
>   whose remedy is decision 2's start command and env.
> - Decision 7: Any comment or sentence a unit adds is one sentence, wrapped at
>   the fold.

## Edits

1. **`skills/mempalace/SKILL.md`** — rewrite every stdio passage (:59-60,
   :75-90, :102-108, :131-135) to decisions 1 and 2: "### The MCP server"
   describes the daemon, the start command, the env set on the supervisor, and
   that it runs before a session; the env block section moves from
   `~/.claude/settings.json` to the supervisor. Keep the backend rule (both
   `MEMPALACE_BACKEND` and `MEMPALACE_QDRANT_URL`, or ChromaDB is silently
   selected) and the upstream-plugin advice.
2. **`skills/doctor/references/harness-and-memory.md` §7** — add decision 3's
   check as its own numbered predicate: the exact `curl` line, its two outcomes,
   severity *degradation*, the remedy. Replace :95-96's "an unreachable server
   is context, not a finding" accordingly.
3. **`skills/doctor/SKILL.md`** — wherever the report or the check list names
   §7's predicates (:159, :277), name the new one; one sentence each.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `grep -n -i "stdio\|settings.json\|spawn" plugins/vwf/skills/mempalace/SKILL.md`
  finds nothing describing vwf's own server (the upstream plugin's stdio server
  may still be named)

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line; no `|` inside a table cell.
- Touch nothing outside the owned paths — not the manifest, not the site, not
  `vendor/`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`fix: vwf's mempalace skill describes the HTTP daemon and doctor probes it` —
written by the orchestrator after the wave gate.
