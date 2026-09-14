# U1 — the `workspace` category and its contract

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/taxonomy.md`,
  `plugins/stackgen/assets/kinds.md` (only where a cross-reference to the
  category list needs the new row),
  `plugins/stackgen/assets/contracts/workspace.md` (new),
  `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/assets/contracts/secrets.md` and
  `plugins/stackgen/assets/contracts/observability.md` (the shape a contract
  takes — clauses a provider cites by role);
  `plugins/stackgen/assets/kinds.md:624-686` (the capability-provider kind bar);
  `plugins/stackgen/assets/artifact-doctrine.md:200-205` (a server belongs in
  exactly one place);
  `plugins/stackgen/stacks/capability-provider/doppler/pack.yaml` (the
  `capability`-unset comment).

## Ruling

Quoted from `index.md`:

> **2 — Kind.** `capability-provider`, a new category `workspace`, axis
> `backing`, pinned in `projects.<name>.backing_template`. Costs a neutral
> contract at `plugins/stackgen/assets/contracts/workspace.md` and a taxonomy
> row; no vwf change, no config-format bump.

> **3 — What Notion is.** An **agent-side knowledge workspace**: the team's
> docs, specs and tickets live there, and the agent reads, searches and writes
> them. The contract describes that access; "wired and available" is the whole
> scope — no vwf step consumes Notion in this plan.

> **5 — Token seam.** No vwf capability token: `workspace` joins the taxonomy's
> categories-with-no-token list, and `pack.yaml` leaves `capability` unset with
> doppler's comment adapted.

> **6 — Category name.** `workspace`; prose noun "the workspace".

## Edits

1. **`plugins/stackgen/assets/taxonomy.md`** — add `workspace` as a
   `capability-provider` category: one row in the category table where the
   others sit, and one entry in the categories-with-no-token list (`:129-137`
   today), with the one-line reason: the workspace is the agent's, not the
   product's runtime; minting a token is vwf's move and nothing here asks for
   one. Match the surrounding fold width by hand — this tree is not
   dprint-formatted.
2. **`plugins/stackgen/assets/contracts/workspace.md`** (new) — the neutral
   contract every workspace provider cites by role. Same section shape as
   `secrets.md`: a lead rule, then numbered clauses. The lead rule: **the agent
   reaches the workspace through an MCP server the pack lands in the repo's
   `.mcp.json` behind its own consent line — never through an API key in the
   tree, never through a file the application reads.** Clauses to write, each
   provider-neutral:
   - **Reach** — the server is project-scoped (repo `.mcp.json`), one server per
     provider, the lockfile records its key; a decline leaves the pack's skills
     landed and the workspace unreachable, and says so.
   - **Auth** — the person authenticates, not the repo: an OAuth flow the agent
     host runs on first use, or an integration token that reaches the server
     only as a process environment variable injected at the boundary (cite the
     secrets contract by role for that path). Nothing under version control
     carries a credential.
   - **Read** — what the agent may read: pages, databases, comments the
     authenticated person can see; search before browse; quote with the page's
     own identifier so a human can open it.
   - **Write** — what the agent may write, and the default: nothing without the
     user saying so in the session; a write names the page or database it will
     change before it changes it; no bulk edits, no deletes.
   - **Scope** — the workspace is a knowledge source for vwf's own steps and the
     person's questions; it is not a runtime dependency of the product, and a
     product that talks to the workspace at runtime is a different capability
     with a different contract (say this in one sentence; do not write that
     contract).
   - **Absence** — a project with no workspace pinned loses nothing: every vwf
     step works from the repo's own docs.
3. **`plugins/stackgen/assets/kinds.md`** — only if the capability-provider
   section enumerates categories or contracts by name: add `workspace` /
   `contracts/workspace.md` to that enumeration. If it enumerates nothing, touch
   nothing and say so in `DECIDED:`.
4. **`plugins/stackgen/stacks/readme.md`** — in the capability-provider
   paragraph (`:131-135` today), add the `workspace` category and name `notion`
   as its first provider, in the same voice and fold width as the neighbours. Do
   not write a count that U2's inventory will also state.

## Verification

- `mise run p:plugins:check` green (rule 12 scans this tree for retired
  vocabulary; rule 13 does not apply to `assets/`).
- `command grep -n 'workspace' plugins/stackgen/assets/taxonomy.md` shows both
  the category row and the no-token entry.
- `command grep -c '' plugins/stackgen/assets/contracts/workspace.md` is under
  the longest sibling contract (`secrets.md`) — this contract is smaller than
  the secrets one, not larger.
- `command grep -rn 'CLAUDE_PLUGIN_ROOT' plugins/stackgen/assets/contracts/workspace.md`
  is empty; the contract cites the secrets contract by role ("the secrets
  contract"), never by path.

## Guardrails

- Do not touch `plugins/stackgen/stacks/**` beyond `stacks/readme.md` — the pack
  and bundle are U2's.
- Do not touch `plugins/vwf/**` — no token is minted; the plan leaves vwf
  untouched.
- Do not restate the secrets contract's injection rule; cite it by role.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand. Strict-YAML frontmatter where a file has one.
- Never end a table cell in a bare asterisk.

## Commit

`feat: stackgen — the workspace category and its contract` — written by the
orchestrator after the wave gate, not by the unit. Type `feat` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
