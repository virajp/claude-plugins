# U2 — vwf skills: mempalace is a stdio server configured in settings.json

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/mempalace/SKILL.md`,
  `plugins/vwf/skills/mempalace-recall/SKILL.md`,
  `plugins/vwf/vendor/mempalace/README.md`, `plugins/vwf/assets/memory.md`,
  `plugins/vwf/skills/setup/references/memory-tree.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom; index.md's Facts section.
- **Lazy-load:** `plugins/vwf/.claude-plugin/plugin.json:44-51`, only to see the
  entry's shape — its argument string is U1's and changes in this wave, so cite
  it as decision 2 states it, never as the file reads now.

## Ruling

Decision 1: "Keep stdio. Record the `hallways.json` race and the per-session
embedder as known costs; revisit if mempalace adds a lock, or if lost hallway
links ever show up." The decisions doc itself is U3's.

Decision 2: "`mise x -- mempalace-mcp` — drop `--palace`, `--backend` and
`--allow-insecure-no-token`, so mempalace reads `MEMPALACE_PALACE_PATH` itself
and expands `~`."

Decision 4: "The `env` block of `~/.claude/settings.json`: `MEMPALACE_BACKEND`,
`MEMPALACE_QDRANT_URL`, `MEMPALACE_PALACE_PATH` as `~/.local/share/mempalace`,
`MEMPALACE_MAX_BACKUPS`; `$HOME` and `${HOME}` never expand there.
`MEMPALACE_MCP_HTTP_ALLOW_INSECURE_NO_TOKEN` is dropped." Rejected: "mise
`[env]` or the shell's startup script."

Decision 5: "Documented as optional: `MEMPALACE_EMBEDDING_MODEL`,
`MEMPALACE_EMBEDDING_DEVICE`. A palace is bound to the model it was built with;
switching fails with `EmbedderIdentityMismatchError`; mempalace 3.10.0's
`repair` cannot re-embed a Qdrant palace — dump and refile instead."

Decision 6: "Docs describe stdio only. The supervisor-env trap and the literal
`~` / `${HOME}` lessons are kept once, in the new decisions doc." Rejected:
"keep 'run it as a shared HTTP daemon instead' as a documented alternative."

## Edits

1. **`plugins/vwf/skills/mempalace/SKILL.md`**
   - `:45-58` — keep the per-setting precedence (it is mempalace's), but drop
     the supervisor and "the daemon" framing: the server is a child of each
     Claude session and inherits Claude's environment, which includes the
     settings `env` block.
   - `:73-87` — the environment block moves to `~/.claude/settings.json`: a JSON
     `"env": { … }` sample carrying the four variables of decision 4,
     `MEMPALACE_PALACE_PATH` as `"~/.local/share/mempalace"`. State in one
     sentence that Claude passes these values literally — `$HOME` and `${HOME}`
     stay as typed, so use `~` or an absolute path. Drop
     `MEMPALACE_MCP_HTTP_ALLOW_INSECURE_NO_TOKEN`. Then the two optional
     embedder variables per decision 5, with the binding and the re-embed
     warning in two or three sentences.
   - `:89-107` — "The MCP server daemon" section becomes "The MCP server": vwf's
     manifest spawns `mempalace-mcp` over stdio through
     `mise x -- mempalace-mcp`, once per Claude session; there is no daemon to
     run, supervise or restart; the server reads its palace path and backend
     from the environment and `~/.mempalace/config.json`. Name the cost in one
     sentence: each session runs its own server and embedder.
   - `:130` — "available … without any further configuration" → available once
     the plugin is installed, `mempalace` is installed through mise, and the
     `env` block above is set.
2. **`plugins/vwf/skills/mempalace-recall/SKILL.md`** — `:24-27`: the setup the
   mempalace skill covers is the install, Qdrant and the settings `env`, not
   "the HTTP daemon"; `:87-89`: "check the daemon" → check that the server
   started (the `mempalace` MCP server in `/mcp`) and that the settings `env` is
   set.
3. **`plugins/vwf/vendor/mempalace/README.md`** — `:29-35`: vwf declares the
   server in its own `plugin.json` (not `plugin.yaml`) as a stdio command, and
   nothing is installed out of band beyond the `mempalace` tool itself;
   `:54-57`: upstream's stdio shape and vwf's are now the same transport — say
   what still differs (vwf launches through `mise x --` and configures through
   the settings `env`); `:63-70`: the environment lives in the settings `env`
   block, and there is no daemon. Leave `:36-51` alone — parked.
4. **`plugins/vwf/assets/memory.md:24, 278`** and
   **`plugins/vwf/skills/setup/references/memory-tree.md:21`** — "daemon" →
   "server" where it names mempalace's MCP server; the "optional, skip silently
   when it is down" logic around it stays exactly as it is.

## Verification

- `grep -n -i '8765\|transport http\|pitchfork\|supervisor\|healthz\|ALLOW_INSECURE' <the five owned files>`
  — no hit that describes how vwf runs mempalace today.
- `grep -n -i 'daemon' <the five owned files>` — every remaining hit is about
  something other than vwf's mempalace server, or is explicitly history.
- `grep -n 'mise\].*MEMPALACE\|\[env\]' plugins/vwf/skills/mempalace/SKILL.md` —
  no hit telling the reader to put `MEMPALACE_*` in mise `[env]`.
- `mise run p:plugins:check` green.

## Guardrails

- `plugins/**/*.md` is **not** dprint-formatted — match each file's existing
  fold width by hand.
- Strict-YAML frontmatter: do not touch either skill's frontmatter.
- Do not edit `plugin.json` (U1's), any site page or `.claude/` file (U3's), or
  any `docs/memory/` file (U3's).
- Leave `vendor/mempalace/README.md:36-51` untouched — parked.
- Do not end a table cell in a bare asterisk; keep every code span on one line.
- Delete with `rm`, never `git rm`.

## Commit

`docs: vwf mempalace skills — a stdio server configured in settings.json` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
