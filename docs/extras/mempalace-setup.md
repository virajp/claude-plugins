# MemPalace setup: one palace per repo, no hub

MemPalace 3.10.0 · Qdrant backend · stdio MCP in Claude Code (installed by `vwf`
≥ 20.1.0) · config via mise

## Goals

- Use MemPalace in every repo, with several Claude Code sessions per repo at
  once.
- Repos are independent and share nothing. Writes and mines must run in parallel
  across repos.

## Architecture

| Layer       | What runs                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| User level  | Qdrant only, as a Docker container in OrbStack (`127.0.0.1:6333`). **No hub.**                                                             |
| Per repo    | Its own palace, plus the tools needed to run MemPalace, from the repo's mise config.                                                       |
| Per session | `mempalace-mcp` (stdio), started by Claude Code via `mise x`. It finds no hub, so it runs the server in-process against the repo's palace. |

### Why no hub (`mempalace serve`)

The previous setup was one shared palace behind a launchd-managed hub. It
serialized everything:

- **The hub holds the palace writer lease for its lifetime**, so direct mines
  fail with "palace … is held by PID …".
- **Forwarded mines run synchronously inside the hub**, and the CLI waits on a
  hardcoded `_HUB_MINE_TIMEOUT_S = 3600`. Long mines time out on the client side
  even though the job keeps running.
- **A mine holds the hub's exclusive `_HTTP_REQUEST_LOCK`**, so every session's
  reads, in every repo, stall until the mine finishes.
- **Locks are per palace, not per wing**, so per-repo wings in one palace can't
  run mines in parallel.

### Why this design works

- **Qdrant is a multi-writer backend**
  (`_MULTI_PROCESS_WRITER_BACKENDS = {pgvector, qdrant}`). With
  `MEMPALACE_MCP_ALLOW_PEER_WRITER=1`, MCP sessions never take the long-lived
  writer lease.
- **Mines take a per-palace lock**
  (`~/.mempalace/locks/mine_palace_<hash(palace path)>.lock`) only while they
  run. One palace per repo means mines across repos run in parallel; a second
  mine in the same repo exits with `MineAlreadyRunning`.
- **No hub request lock**, so searches keep working while their own repo mines.
- **One Qdrant instance serves every palace**, because collections are prefixed
  `mempalace_<sha256(palace path)[:16]>_…`.

## Config

### User level — `~/.config/mise/conf.d/mempalace.toml`

```toml
[env]
MEMPALACE_BACKEND               = "qdrant"
MEMPALACE_EMBEDDING_DEVICE      = "auto"
MEMPALACE_EMBEDDING_MODEL       = "minilm"
MEMPALACE_MAX_BACKUPS           = 4
MEMPALACE_MCP_ALLOW_PEER_WRITER = 1
MEMPALACE_MCP_IDLE_HOURS        = 0
MEMPALACE_QDRANT_URL            = "http://127.0.0.1:6333"
```

| Variable                               | Why                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MEMPALACE_BACKEND = "qdrant"`         | It's the only local-friendly backend MemPalace treats as safe for multiple writer processes. The Qdrant server handles concurrency, and its backend uses only an in-process `RLock`, never the palace `flock`. Chroma/SQLite backends force a single writer, since concurrent writers can corrupt the HNSW index, and they ignore the peer-writer flag.                              |
| `MEMPALACE_QDRANT_URL`                 | A single Qdrant container in OrbStack serves all palaces, isolated by the collection prefix. Only one service to run at user level.                                                                                                                                                                                                                                                  |
| `MEMPALACE_EMBEDDING_MODEL = "minilm"` | Replaced `embeddinggemma`. On macOS, `auto` runs embeddinggemma on CPU, because CoreML is denylisted for it (it returns NaN or all-zero vectors). That made first mines take over an hour and hit the 3600 s hub timeout. minilm is much faster on CPU and English-only, which is fine for code. **Changing the model** requires a fresh palace or `mempalace repair rebuild-index`. |
| `MEMPALACE_EMBEDDING_DEVICE = "auto"`  | Lets ONNX Runtime pick the best provider. With minilm (not denylisted) this may be CoreML. Pin `cpu` if you need predictable performance or see odd results.                                                                                                                                                                                                                         |
| `MEMPALACE_MAX_BACKUPS = 4`            | Caps the timestamped full-copy backups written by `mempalace migrate` and `repair max-seq-id`, which otherwise grow until the disk fills. Rarely triggered on Qdrant, but a cheap safety net.                                                                                                                                                                                        |
| `MEMPALACE_MCP_ALLOW_PEER_WRITER = 1`  | **The key setting.** Stops each MCP session from holding the palace writer lease for its lifetime. Several sessions per repo can write, and CLI/hook/watcher mines aren't blocked by open sessions. Only honored for Qdrant/pgvector.                                                                                                                                                |
| `MEMPALACE_MCP_IDLE_HOURS = 0`         | Disables the idle-exit watchdog (default 8 h). Without this, a Claude session left idle overnight finds its stdio MCP server has exited and loses MemPalace tools until restart. The watchdog exists to release Chroma file handles, which doesn't apply to Qdrant.                                                                                                                  |

These live at user level so every repo shares the same backend and model. A
palace's recorded embedder identity must match the configured model.

### Per repo — `<repo>/.config/mise/conf.d/mempalace.dev.toml`

```toml
[tools]
"pipx:mempalace" = "3.10.0"
python           = "3.14"
uv               = "latest"
# …plus any other tools MemPalace needs

[env]
MEMPALACE_PALACE_PATH = "~/.local/share/mempalace-palaces/<repo_name>"
```

| Setting                                   | Why                                                                                                                                                                                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MEMPALACE_PALACE_PATH` per repo          | The mine lock and the Qdrant collection prefix are both keyed by palace path, so separate paths give independent locks (parallel mines) and isolated data. The value is resolved with `abspath(expanduser())`, so `~` is safe and stable. |
| Path outside `~/.local/share/mempalace`   | That's the old shared palace directory. Nesting new palaces inside it mixes the two.                                                                                                                                                      |
| Tools declared per repo                   | MemPalace is available only in repos that opt in. A Claude session started elsewhere fails to launch `mempalace-mcp` instead of silently creating or writing to a default palace.                                                         |
| `python` / `uv`                           | The runtime and installer behind mise's `pipx:` backend. The Python version matches the interpreter MemPalace's venv was built with.                                                                                                      |
| `pipx:mempalace` pinned                   | Lock behavior, env flags and the embedder-identity rules here were all verified against 3.10.0 source. Upgrade on purpose and re-check them.                                                                                              |
| `mempalace.yaml` → `wing` = repo basename | Still useful for labeling and retrieval. It has no effect on locking.                                                                                                                                                                     |

### Claude Code MCP server (user scope, installed by `vwf` ≥ 20.1.0)

```json
"mempalace": {
  "type": "stdio",
  "command": "sh",
  "args": ["-c", "exec \"$HOME/.local/bin/mise\" x -- mempalace-mcp"]
}
```

| Choice                            | Why                                                                                                                                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stdio`, not `http`               | An HTTP entry needs a fixed URL, which implies a hub. Stdio gives each session a server bound to its repo's palace.                                                                |
| `mempalace-mcp`                   | The actual server (`mempalace.mcp_proxy:main`). `mempalace mcp` only prints setup instructions. With no hub registered, the proxy runs the full server in-process.                 |
| `mise x --`                       | Resolves mise config from Claude's cwd (the repo), so the server gets that repo's palace path and tools.                                                                           |
| `$HOME/.local/bin/mise`, absolute | Doesn't depend on `PATH`, which Claude may not inherit when launched from an IDE or app. `vwf` guarantees mise lives there.                                                        |
| `sh -c` with bare `$HOME`         | The shell expands `$HOME`, avoiding Claude Code's history of not expanding `${VAR}` in plugin `.mcp.json` files, and its validator treating `${…}` in `args` as required env vars. |
| `sh`, not `bash`                  | Bash invoked as `sh` doesn't source `$BASH_ENV`, so nothing can write to stdout and corrupt the JSON-RPC stream.                                                                   |
| `exec`                            | Replaces the shell, so stdio and signals go straight to the server.                                                                                                                |

## One-time steps

1. **Disable the old `mempalace-hub` mise bootstrap service**
   (`enabled = false`), not just stop it. A live hub for a palace makes the CLI
   and proxy forward to it, which brings back the serialization.
2. **In each repo:** `mise trust && mise install`, then
   `mise x -- mempalace mine . --mode projects`. New palace paths mean new
   Qdrant prefixes, so the old shared palace's data doesn't carry over.
3. **If mining warns `EmbedderIdentityUnknownWarning` for `mempalace_closets`**,
   record the identity. `palace set-embedder` only records drawers (it passes no
   `collection_name`), so call the function directly from inside the repo:

   ```sh
   mise x -- "$(mise where pipx:mempalace)/mempalace/bin/python" -c '
   from mempalace.config import MempalaceConfig
   from mempalace.palace import set_palace_embedder_identity
   p = MempalaceConfig().palace_path
   for c in (None, "mempalace_closets"):
       print(c or "drawers", *set_palace_embedder_identity(p, collection_name=c))
   '
   ```

   It's safe to repeat, and it refuses to overwrite a different recorded model
   without `force=True`.
4. **Optional:** drop the old palace's `mempalace_<oldhash>_*` collections from
   Qdrant.

## Verify

- In the repo: `mise x -- mempalace status` should show the repo's palace path
  and the Qdrant backend. This also confirms mise loads `mempalace.dev.toml`
  without `MISE_ENV=dev`.
- In Claude: `/mcp` should show `mempalace` connected, and `mempalace_status`
  should report the same palace.

## Caveats

- **Launch `claude` from the repo root** in a mise-activated shell. `mise x`
  resolves config from cwd, and save hooks inherit Claude's env, not `mise x`'s.
- **Mines serialize within a repo.** The watcher and sweep jobs should treat
  `MineAlreadyRunning` as "skip"; the next run picks up the changes.
- **Each session loads its own embedder.** That's modest with minilm and a
  remote index, and it was the original reason for the hub back in the Chroma
  days.
- **The knowledge graph is still local SQLite**
  (`<palace>/knowledge_graph.sqlite3`, 10 s busy timeout). Heavy concurrent KG
  writes in one repo can hit `database is locked`.
- **A hook's diary checkpoint can be refused** if it lands during a mine in the
  same repo (upstream #2614). It's a brief collision, not a persistent failure.
