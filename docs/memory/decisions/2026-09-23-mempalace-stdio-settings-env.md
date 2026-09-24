# Decision — vwf's mempalace server runs over stdio, configured in Claude's settings

**Date** 2026-09-23 · **Branch** `2026-09-23-mempalace-stdio-settings-env` ·
**Plan**
[`docs/plans/2026-09-23-mempalace-stdio-settings-env/`](../../plans/2026-09-23-mempalace-stdio-settings-env/index.md)
· **Reverses** the shared-HTTP-daemon ruling · **Supersedes** the daemon
passages of
[`2026-08-13-mempalace-wiring-and-plan.md`](./2026-08-13-mempalace-wiring-and-plan.md)

## What was decided before

vwf declared mempalace as `type: http` against `http://127.0.0.1:8765/mcp`: one
long-lived `mempalace-mcp --transport http` daemon, run by the user under a
supervisor (pitchfork in practice), serving every Claude Code session at once.
`.claude/skills/vwf-plugin/references/dependencies.md` gave the reason and
closed the door on stdio: on Qdrant the store is safe for concurrent processes,
"and stdio is still wrong", because `hallways.json` is a lockless
read-modify-write — one daemon serialises those writes in-process, while N
per-session servers race and last-writer-wins silently drops entity edges — and
because each stdio server would hold its own ~140 MB embedder. The daemon's
environment lived in the global mise config's `[env]`, with
`MEMPALACE_MCP_HTTP_ALLOW_INSECURE_NO_TOKEN=1` letting it run tokenless on
loopback.

## What changed

**Commit `9dbef1d1` (2026-09-23) moved the manifest to stdio without docs, and
this decision confirms it.** vwf's `plugin.json` now declares `type: "stdio"`,
`command: "sh"`, and the one argument string `mise x -- mempalace-mcp`. Claude
Code spawns the server once per session; there is no daemon to run, supervise or
restart.

**The launch line carries no flags.** The first stdio line was
`mise x -- mempalace-mcp --palace $MEMPALACE_PALACE_PATH --backend $MEMPALACE_BACKEND --allow-insecure-no-token`.
The shell substitutes the variable but never expands a `~` inside a substituted
value, and mempalace 3.10.0 takes a `--palace` value verbatim — so
`~/.local/share/mempalace` opened `<cwd>/~/.local/share/mempalace`, and a
`${HOME}/…` value from Claude's settings created a literal `${HOME}/` directory
in this repo on 2026-09-23. mempalace **does** expand `~` when it reads
`MEMPALACE_PALACE_PATH` from the environment itself (`mempalace/config.py`,
`os.path.abspath(os.path.expanduser(...))`), so dropping `--palace` is the fix.
`--backend` went with it — the backend then comes from
`~/.mempalace/config.json` and `MEMPALACE_BACKEND`, in that order — and
`--allow-insecure-no-token`, which only concerns the HTTP transport.

**The environment lives in the `env` block of `~/.claude/settings.json`** —
`MEMPALACE_BACKEND`, `MEMPALACE_QDRANT_URL`, `MEMPALACE_PALACE_PATH` as
`~/.local/share/mempalace`, `MEMPALACE_MAX_BACKUPS` — because a stdio server is
a child of the session and sees Claude's environment. Claude passes those values
**literally**: `$HOME` and `${HOME}` are never expanded there, while a `~`
survives to mempalace, which expands it.
`MEMPALACE_MCP_HTTP_ALLOW_INSECURE_NO_TOKEN` is dropped.

**The embedder variables are documented as optional** —
`MEMPALACE_EMBEDDING_MODEL`, `MEMPALACE_EMBEDDING_DEVICE`. A palace records its
embedder (`mempalace_embedder.json`) and is bound to it: opening it under
another model fails with `EmbedderIdentityMismatchError`. mempalace 3.10.0's
`repair` is Chroma-only, so a Qdrant palace cannot be re-embedded in place —
switching models means dumping the drawers and refiling them into a fresh
palace.

## Why

Zero setup. A stdio server needs the tool on the path and an `env` block, and
nothing else — no supervisor, no port, no readiness probe, no second process to
keep alive across reboots.

The two costs the old ruling named are **accepted, not solved**:

- **The `hallways.json` race.** Every session's server does a lockless
  read-modify-write of the palace's `hallways.json` (`mempalace/hallways.py`,
  still lockless in 3.10.0); two concurrent rebuilds drop entity links silently.
  Drawers in Qdrant are unaffected.
- **The per-session embedder.** Each session loads its own.

**Revisit the transport** if mempalace adds a lock to `hallways.json`, or if
lost hallway links ever show up.

## Lessons carried from the daemon era

The manual stops teaching the daemon with this decision; these are kept here so
nothing learned is lost.

- **A supervised daemon inherits its supervisor's environment**, captured when
  the supervisor started. Fixing a variable in the shell config and restarting
  the daemon changes nothing — restart the **supervisor**. The config file was
  only a partial escape: it settles the backend choice outright, but a stale
  `MEMPALACE_QDRANT_*` in the captured environment still outranks the file for
  the connection settings.
- **A literal `~` is a relative path.** A quoted `'~/.local/share/mempalace'`
  arriving through a variable kept its `~`, and resolved against pitchfork's
  working directory — which is how
  `~/.config/pitchfork/~/.local/share/mempalace/` came to exist, holding a
  fourth empty palace. The same shape recurred under stdio through `--palace`,
  as above.

The daemon passages of
[`2026-08-13-mempalace-wiring-and-plan.md`](./2026-08-13-mempalace-wiring-and-plan.md)
— the pitchfork supervisor, and its fix of baking `$HOME` into the run command —
are superseded by this record. That file is the historical record and is not
edited.

## The alternatives rejected

- **Revert to the HTTP daemon at `127.0.0.1:8765`.** It solves the race and the
  embedder cost, at the price of a supervised process every user must run.
- **Stdio plus a lock or workaround.** Parked: the fix is a lock upstream in
  mempalace, or a vwf-side serialisation — its own plan, once either is chosen.
- **A configurable runner**, `${MEMPALACE_RUNNER:-mise x --} mempalace-mcp` in
  the context7 pattern, or a bare `mempalace-mcp`. `mise x --` stays.
- **The environment in mise `[env]` or the shell's startup script.** A server
  Claude spawns sees Claude's environment; the settings `env` block is the one
  place every session reads.
