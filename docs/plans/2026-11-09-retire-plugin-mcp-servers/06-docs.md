# U6 — Docs

- **Read first:** the facts section of `index.md` (its "Docs that name the
  tools" list), then each owned doc at the lines it names.
- **Lazy-load:** `plugins/stackgen/stacks/design-tool/claude-code/` (the pack
  the rewritten how-to describes), `plugins/vwf/skills/docs-sync/SKILL.md`,
  `plugins/vwf/assets/memory.md` (the decision record format).

## Ruling

> D3: The user. User's words: 'I want the ownership of install mcp servers to
> move to user and not this plugin. Wherever the mcp servers are required, AI
> agent should simply ask the user to install them.'

> D10: Delete both [the workspace category and its contract]. The bundle kind
> workspace (bun and pnpm workspaces) is a different thing and stays.

> D11: Keep the page and its URL. Rewrite the walkthrough around claude-code,
> the default design tool: the canvas in docs/design/<project>/,
> design-session, review on loopback. Name lovable and stitch as other choices.

> D17: D2, D3, D6, D9, D21 and D28 of the 2026-11-02 record are reversed. U6
> writes docs/memory/decisions/2026-11-09-mcp-servers-owned-by-user.md, which
> states each reversal and points to that record; the old record is not edited.

## Edits

1. Run `/vwf:docs-sync` over the branch delta. Apply its findings, every
   `DOCS FALSIFIED:` line the earlier units returned, and the list below.
2. **`CLAUDE.md`** — `:261-262`: vwf ships no MCP server, and stackgen installs
   none — the user installs any MCP server, and the agent asks for it; the
   addon axis holds `taste-skill`; drop "Context7-researched" only where it
   says the generator halts for a tools-menu reason (keep that the generator
   needs Context7 until plan 2).
3. **`readme.md`** — `:74-81` (`CONTEXT7_RUNNER` and pnpm-for-context7
   prerequisites: remove), `:292-294` (the generator asks the user to install
   Context7), `:353-363` (optional tools: taste-skill; delete the workspace
   paragraph), `:491-497` (credits: keep Context7 credited as the research
   source the generator uses; drop "pnpm as its runner").
4. **`.claude/docs/plugins.md`** `:12-13`; **`.claude/docs/repo-shape.md`**
   `:231-234` (the runner rule is gone; the checker refuses `user_mcp_servers:`
   and any `mcp__` prefix in vwf).
5. **`.claude/skills/stackgen-plugin/SKILL.md`** — `:31,53,71,91-94,160,174-182`
   per the rulings; `:301` is a passive hint — leave. **`.claude/skills/vwf-plugin/SKILL.md`**
   `:22,56-57`; **`references/dependencies.md`** `:74-99,114`;
   **`references/skills-and-agents.md`** `:35`; **`references/assets.md`** `:24`
   (`config_format` 26).
6. **`.claude/skills/plugin-authoring/references/checks.md`** `:292-302`: the
   rule text for the `user_mcp_servers:` refusal and the general `mcp__` guard;
   remove the runner-rule history.
7. **`.claude/agents/target-verifier.md`** `:114`: stackgen lands LSP servers
   only.
8. **Site manual:** `site/src/content/docs/plugins/stackgen.md` and
   `plugins/vwf.md` at the lines the facts list names (`config_format` 26 in
   the migrate section; the MCP servers section of vwf.md says the user installs
   servers and the agent asks); `how-to/operate/choosing-your-stack.md:199-206`;
   `how-to/brownfield/migrate-old-vwf-repo.md:71-74` (add the 26 step);
   `installer/usage.md:124`.
9. **`site/src/content/docs/how-to/greenfield/ui-with-design-tool.md`** —
   rewrite per D11; keep the file name, the title's meaning and every heading
   anchor another page links to (`how-to/index.md:23`,
   `how-to/greenfield/single-repo.md:229`, `how-to/operate/choosing-your-stack.md:239`,
   `site/src/pages/index.astro:73`). Edit `index.astro` only if its link text
   names Claude Design.
10. **`docs/memory/decisions/2026-11-09-mcp-servers-owned-by-user.md`** — new
    record per `plugins/vwf/assets/memory.md`: the decision (D3, D4, D5), each
    reversal of the 2026-11-02 record with its id, the rejected alternatives,
    the source plan `2026-11-09-retire-plugin-mcp-servers`, and B106.

## Verification

- `mise x -- mise run p:site:check` exits 0.
- The K1 search of `index.json` finds no hit in the owned docs except history
  lines and the new decision record.

## Guardrails

- `CLAUDE.md`, `readme.md` and the site pages are dprint-formatted; a widened
  table cell re-pads every row — format them per D28.
- Do not edit `docs/memory/decisions/2026-11-02-optional-tools-in-vwf-tools.md`.
- Do not edit `site/CLAUDE.md:131-135` (history of the site's design source).
- Do not edit `docs/design/**` (design exports, byte for byte).
- A table cell that ends in `*` oscillates between the formatter and the linter.

## Commit

`docs: users install mcp servers; drop context7, notion and claude-design`

> D28: Before it returns, each edit unit runs
> `mise x -- mise run code:format -- --fix <each file it changed>`, on its own
> changed files only, never the whole tree. The unit gate then only checks.

Edit 11: also `CLAUDE.md:14` ("generates a repo's LSP and MCP servers into one
local plugin" — LSP servers only) and `.claude/skills/stackgen-plugin/SKILL.md:205-206`
(rulings round 2, gap 13).

> D38 (gap 2): U6 owns .claude/skills/plugin-authoring/references/structure.md:
> lines 73 and 93 list mcpServers as an allowed manifest block — a plugin now
> declares no MCP server, and the checker refuses the key.
