# Vendored from MemPalace

vwf ships mempalace's memory layer directly rather than depending on the
upstream plugin. Before this, `mempalace` was a url-sourced entry in
`marketplace.yaml` and a vwf dependency — which meant **OpenCode users got no
memory at all**, because a url-sourced plugin has no rendered bundle and the
installer skips it (`cli/src/plan.ts`, the `localOnly` branch). Vendoring is
what makes memory ship on every target instead of only where a marketplace can
reach.

## Provenance

| | |
|---|---|
| **Upstream** | <https://github.com/MemPalace/mempalace> |
| **Version taken** | `3.7.0` |
| **Licence** | MIT — see [LICENSE](LICENSE), which ships with every rendered bundle |
| **Author** | MemPalace Contributors |

## What was taken

Two skills, and nothing else:

| Upstream path | Lands as |
|---|---|
| `skills/mempalace/SKILL.md` | `templates/vwf/skills/mempalace/` |
| `skills/mempalace-recall/SKILL.md` | `templates/vwf/skills/mempalace-recall/` |

Deliberately **not** taken: the Python package, the MCP server implementation,
and the `integrations/` tree. vwf declares the MCP server in its own
`plugin.json` as a stdio command, and nothing is installed out of band beyond
the `mempalace` tool itself, which the machine's tool manager provides. Only the
agent-facing prose is vendored.

**The auto-save hooks are not vendored either — they are reimplemented.**
Upstream's `mempal_save_hook.sh` counts human messages by parsing
`transcript_path`, a Claude Code JSONL transcript, and breaks its own save loop
with `stop_hook_active`. Neither exists on Cursor, Oh-My-Pi or OpenCode, so
wrapping that script for them produces a hook that runs, finds no transcript,
and does nothing — working in the coverage report, dead in practice. vwf's
`hooks/mempalace-checkpoint.sh` counts *stops* in a state file instead, which
needs only a session id, and `opencode-plugin/mempalace-autosave.ts` counts
real messages through OpenCode's server API. Same behaviour, four targets, no
transcript dependency.

Also not taken: upstream's `.claude-plugin/hooks/hooks.json`. It references
`mempal-stop-hook.sh`, `mempal-session-end-hook.sh` and
`mempal-precompact-hook.sh` — hyphenated names that **do not exist** in the
`3.7.0` tree, where every script is underscored.

## Local edits

The **setup instructions** in `mempalace` are replaced, not amended. Upstream's
Prerequisites documents `uv tool install` / `pip install` and the stdio shape.
The transport is now the same — vwf spawns `mempalace-mcp` over stdio too —
but vwf launches it through `mise x --` and configures it through the `env`
block of `~/.claude/settings.json`, neither of which upstream's prose covers.
The replacement documents the setup vwf assumes: the mise-managed install
(`"pipx:mempalace" = { version = "latest" }` in `[tools]`, preferably the
development-environment config);
**qdrant as the backend** rather than the chroma default, because chroma does
not support concurrent access — run as a loopback-bound container, with the
image and port pinned in the skill's fenced run command; configuration
through `~/.mempalace/config.json` plus `MEMPALACE_*` environment variables in
the settings `env` block, including the per-setting precedence flip (the file
wins the backend choice, env wins the qdrant connection settings), palace at
`~/.local/share/mempalace`; the optional embedder variables; and
`mempalace-mcp` as a per-session stdio server — there is no daemon. Re-apply
this on any resync.

Two pointers, in `mempalace-recall`: upstream's `/mempalace-init` command is
not shipped by vwf (only the two skills were taken), so both mentions of it —
the Step 0 setup pointer and the server-down unhappy path — now point at the
`mempalace` skill's setup instead. Re-apply on any resync.

One word, in `mempalace-recall`: the adjective describing time-ordered
knowledge graphs was replaced with "time-aware". That adjective is spelled
exactly like one of the orchestration engines in `p:plugins:check`'s
no-tool-names guard, which cannot tell the two apart. The alternative was a
third entry in `TOOL_NAME_EXCEPTIONS`, a list kept deliberately narrow —
weakening a real guard to protect an incidental English word is the wrong
trade. Re-apply this on any resync.

## Resync policy

This is a **one-time fork, re-synced deliberately** — not a mirror and not a
submodule. Nothing automated watches upstream, so a change there is invisible
here until someone looks.

To re-sync: diff the two skills against the upstream tag, apply what matters,
and update the **Version taken** row. That row is the only thing that makes
drift detectable, so it is the one edit that must not be skipped.

The coupling that does survive is the **MCP tool names** the skills instruct
the model to call. Those are upstream's API, and a rename there makes the prose
wrong in a way no gate here can catch — `p:plugins:check` validates
frontmatter and links, not whether a named tool exists. Everything else is
prose.
