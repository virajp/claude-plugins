# Decision — vwf's mempalace server is an HTTP daemon the user runs

**Date** 2026-09-29 · **Branch** `2026-09-29-mempalace-http-daemon` · **Plan**
[`docs/plans/2026-09-29-mempalace-http-daemon/`](../../plans/2026-09-29-mempalace-http-daemon/index.md)
· **Reverses** the stdio ruling · **Supersedes**
[`2026-09-23-mempalace-stdio-settings-env.md`](./2026-09-23-mempalace-stdio-settings-env.md),
which stays as history and is not edited

## What was decided before

The 2026-09-23 record kept vwf's mempalace server on stdio: `type: "stdio"`,
`command: "sh"`, the one argument string `mise x -- mempalace-mcp`, spawned by
Claude Code once per session, its `MEMPALACE_*` environment in the `env` block
of `~/.claude/settings.json`. It was chosen for zero setup, with two costs
accepted — the lockless `hallways.json` race between per-session servers, and
one embedder per session — and it rejected "revert to the HTTP daemon" by name.

## What changed

**Commit `3a62fa48` (2026-09-26) switched the manifest back to HTTP and changed
nothing else**, and it shipped in `vwf-v20.0.0`: vwf's `plugin.json` declares
`{"type": "http", "url": "http://127.0.0.1:8765/mcp"}`. Every doc, skill and
agent still described stdio; this decision confirms the manifest and brings them
in line.

- **The server is one daemon the user runs**, never one a session starts:
  `mempalace-mcp --transport http --host 127.0.0.1 --port 8765`, under any
  supervisor — pitchfork and launchd are named as examples, and the docs stay
  generic about which. It must be running before a Claude Code session starts.
- **Its environment is set on that supervisor**, not in
  `~/.claude/settings.json`: `MEMPALACE_BACKEND` and `MEMPALACE_QDRANT_URL`
  always together, and `MEMPALACE_PALACE_PATH`.
- **`/vwf:doctor` probes it.** §7 runs
  `curl -s -o /dev/null --max-time 2 http://127.0.0.1:8765/mcp`; any HTTP
  response is reachable, and a refused connection or a timeout is a
  **degradation** whose remedy is the start command and the environment above.
- **The anchor moves.** The site's "Running the server (stdio)" heading became
  "Running the server (HTTP daemon)", and both inbound links followed.

## Why

The user ruled it at the plan's interview: **"HTTP is intended"** — for every
vwf user, reversing the 2026-09-23 stdio decision.

One daemon also closes both costs the stdio ruling accepted: it serialises the
`hallways.json` and tunnel-file writes in-process, so no two servers race, and
it holds one embedder rather than one per session. The price is the one the
stdio record named — a supervised process every user runs — and doctor's probe
is what makes a missing one visible rather than a silent loss of memory tools.

## The alternatives rejected

- **Revert the manifest to stdio.** It is what the docs described, but not what
  the user intends, and it reopens the race and the per-session embedder.
- **A vwf-shipped task to run the daemon**, or pitchfork-specific steps. The
  supervisor is the user's machine; the docs describe the command and its
  environment generically.
- **Doctor docs only, or a blocking finding.** Memory is best-effort and every
  memory step already degrades without it, so unreachable is a degradation.

## Still out of scope

- The user's machine — the pitchfork config, the Qdrant stack, the global mise
  `mempalace:*` tasks.
- The upstream mempalace plugin, whose own stdio server stays the user's to
  toggle off in `/mcp`.
- Vendored mempalace, including the stale Cursor and OpenCode references in
  `plugins/vwf/vendor/mempalace/README.md`, and whether the docs should show a
  Qdrant compose file rather than a bare `docker run` — both still parked.
