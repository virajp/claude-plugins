# U2 — the `notion` capability-provider pack and its bundle

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/capability-provider/notion/**` (new),
  `plugins/stackgen/stacks/bundles/notion.md` (new),
  `plugins/stackgen/stacks/inventory.md` (regenerated, never hand-edited)
- **Model:** opus
- **Read first:** `plugins/stackgen/assets/contracts/workspace.md` (U1's output
  — the clauses this pack cites by role), then every file under
  `plugins/stackgen/stacks/capability-provider/doppler/` top to bottom (the
  shape to mirror), then `plugins/stackgen/stacks/bundles/doppler.md` and
  `plugins/stackgen/stacks/bundles/claude-design.md`.
- **Lazy-load:** `plugins/stackgen/assets/kinds.md:624-686` (the
  capability-provider bar); `plugins/stackgen/assets/pack-format.md:144-182`
  (the `pack.yaml` schema and the `mcp_servers:` key), `:245-266` (bundle pins);
  `plugins/stackgen/stacks/design-tool/claude-design/pack.yaml:12-15` (the only
  `mcp_servers:` entry that exists — the shape to copy);
  `.claude/skills/plugin-authoring/references/checks.md:145` (rule 13).

## Ruling

Quoted from `index.md`:

> **1 — Shape.** A stackgen pack declaring `mcp_servers:`; the materializer
> lands it in the target repo's `.mcp.json` behind the tier-2 consent line,
> recorded in the lockfile. No reversal.

> **2 — Kind.** `capability-provider`, a new category `workspace`, axis
> `backing`, pinned in `projects.<name>.backing_template`.

> **4 — Server.** Notion's **hosted remote MCP server** — `type: http`, a URL,
> OAuth run by Claude Code on first use; no token in the tree, no `env` key. U2
> confirms the URL and transport through Context7 (`resolve-library-id` →
> `query-docs`) before writing the entry.

> **5 — Token seam.** No vwf capability token: `workspace` joins the taxonomy's
> categories-with-no-token list, and `pack.yaml` leaves `capability` unset with
> doppler's comment adapted.

> **6 — Category name.** `workspace`; prose noun "the workspace".

> **7 — Wave order.** U2 runs after U1 so the pack cites the contract's clauses
> as written, not as guessed.

## Edits

1. **Verify the server first.** Call Context7 — `resolve-library-id` for
   Notion's MCP server, then `query-docs` for the hosted remote server's
   endpoint URL and transport, and for whether Claude Code's `.mcp.json` `http`
   type is the right transport for it (`http` versus `sse`). Write the entry
   from what Context7 returns. If Context7 cannot confirm a hosted endpoint,
   return `UNRESOLVED: hosted Notion MCP endpoint not confirmable via Context7`
   and stop — do not fall back to the stdio server, which is a rejected
   alternative.
2. **`plugins/stackgen/stacks/capability-provider/notion/pack.yaml`** (new) —
   `name: Notion`, a one-line `summary` in doppler's register (the workspace a
   team already writes in, reached by the agent through one server the person
   authorises once), `version: 0.1.0`, `type: capability-provider`,
   `category: workspace`, `capability` **unset** with doppler's comment adapted
   to name `workspace`, `kind: capability-provider`, `axis: backing`,
   `harness.local_stack: { task: n/a, mechanism: <hosted-only; nothing to compose> }`,
   and `mcp_servers:` with **one** server keyed `notion`, `type: http`, `url:`
   as verified in step 1, and **no `env` key**.
3. **`conventions.md`** (new) — what a repo that pins this pack expects of the
   agent: the read-before-write and name-the-page-first rules, cited from the
   workspace contract by role; the OAuth-once fact; that a declined `.mcp.json`
   write leaves the skills landed and the workspace unreachable.
4. **`skills/notion/SKILL.md`** (new) — strict-YAML frontmatter with `name`,
   `description`, `allowed-tools: Read Grep Glob Edit Write Bash` as the sibling
   packs declare; a body that says when to reach for the workspace and which
   reference answers which question.
5. **`skills/notion/references/`** (new) — the six-topic bar, each file citing
   the workspace contract by role, never restating it:
   - `pick-and-trade.md` — why Notion over the alternatives a team might hold
     its docs in, and the trade (a hosted dependency, one vendor's search).
   - `contract-satisfaction.md` — clause by clause against
     `contracts/workspace.md`: how this pack meets Reach, Auth, Read, Write,
     Scope, Absence.
   - `oauth-not-token.md` — the constraint file: the hosted server authenticates
     the person through the agent host's OAuth flow; the tree carries no
     integration token; where the stdio server would differ, in one paragraph,
     as the path this pack does not take.
   - `access-shape.md` — what the agent can reach once authorised: the pages and
     databases the authenticated person can see; search-first; identifiers a
     human can open.
   - `cost-shape.md` — the workspace plan is the team's existing one; the server
     adds no metered cost of its own; say what would change that.
   - `local-stack.md` — hosted-only; nothing to compose; `harness.local_stack`
     is `n/a` and why.
6. **`plugins/stackgen/stacks/bundles/notion.md`** (new) — frontmatter
   `name: Notion`, `axis: backing`, `kind: capability-provider`,
   `components: [ capability-provider/notion@0.1.0 ]`; a body in doppler's
   bundle's voice, plus the sentence the `claude-design` bundle carries: this
   bundle wires the server into `.mcp.json` behind its own consent line.
7. **`plugins/stackgen/stacks/inventory.md`** — run
   `mise run p:plugins:inventory` and take the result; never edit by hand.

## Verification

- `mise run p:plugins:inventory -- --check` green after regeneration.
- `mise run p:plugins:check` green — rules 4 (frontmatter on
  `skills/notion/SKILL.md`), 12, 13.
- `command grep -n -A6 'mcp_servers' plugins/stackgen/stacks/capability-provider/notion/pack.yaml`
  shows `type: http` and `url:`; `command grep -c 'env' ...notion/pack.yaml` is
  `0`.
- `command grep -rn 'CLAUDE_PLUGIN_ROOT\|assets/contracts\|\.\./' plugins/stackgen/stacks/capability-provider/notion`
  is empty.
- `command ls plugins/stackgen/stacks/capability-provider/notion/skills/notion/references`
  lists exactly six files.
- `command grep -rn 'NOTION_TOKEN\|notion-mcp-server' plugins/stackgen/stacks/capability-provider/notion`
  matches only inside `oauth-not-token.md`'s one paragraph on the path not
  taken, or nowhere.

## Guardrails

- Do not touch `plugins/stackgen/assets/**` or
  `plugins/stackgen/stacks/readme.md` — U1's, already landed; read them, cite
  them by role.
- Do not touch `plugins/vwf/**`.
- Do not hand-edit `inventory.md`; regenerate it.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match doppler's fold width by
  hand. Strict-YAML frontmatter on `SKILL.md` and the bundle: a frontmatter that
  does not parse drops the skill silently.
- Never end a table cell in a bare asterisk.
- Nothing in this pack is a `config/` payload, so rule 11 does not apply; do not
  add a `config/` directory.

## Commit

`feat: stackgen — the notion workspace pack` — written by the orchestrator after
the wave gate, not by the unit; the regenerated `inventory.md` lands in this
same commit. Type `feat` is in `.config/git-conventional-commits.yaml`; the file
lists no scopes.
