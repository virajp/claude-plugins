# U2 — stackgen installs no MCP server

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `docs/memory/decisions/2026-11-02-optional-tools-in-vwf-tools.md`
  (the design this reverses), `plugins/stackgen/stacks/language/typescript/pack.yaml`
  (an `lsp_servers:` example that stays).

## Ruling

> D2: Reword the halt only. The generator keeps requiring Context7 until plan 2.
> When no Context7 server is reachable, it asks the user to install a Context7
> MCP server themselves (user scope), names the official install page, and
> waits; it never installs one and never names a tools menu option.

> D3: The user. User's words: 'I want the ownership of install mcp servers to
> move to user and not this plugin. Wherever the mcp servers are required, AI
> agent should simply ask the user to install them.' The pack key
> user_mcp_servers: is retired: no pack declares it, the generator emits none,
> the materializer writes none, and vwf-tools holds LSP servers only. The
> tier-3 consent keeps only its LSP part.

> D4: A '## MCP servers' section in the pack's conventions.md, beside the
> existing '## Claude plugins' section. One line per server: its name, what it
> is for, and its official install page. It is not handed to bootstrap. When a
> skill needs the server and it is not available, the agent asks the user to
> install it and waits. Doctor reports a declared server that is not available
> as drift, never blocking.

> D12: Remove the row [capability-provider/notion to addon/notion]. Step 26
> cleans up repos that still have notion from any older format, because the
> migration steps run in sequence.

> D19: Extend remove:. It accepts any materialized slug, not only axis addon
> (stack-template SKILL.md:96-97 loses that refusal). Plain remove: <slug>
> deletes the component with all its keys. The form remove: <slug> mcp-only
> keeps the component and deletes only its MCP server keys from the vwf-tools
> manifest, claims.json and the lockfile local_plugin MCP records, and returns
> the removed server names. Step 26 calls plain remove: for context7, notion and
> the re-pinned claude-design, and remove: <slug> mcp-only for every other slug
> whose lockfile entry has an MCP key.

> D20: … The machine part runs on every /vwf:setup run, beside
> reconcile-claims: when this machine vwf-tools manifest holds any MCP server
> key, setup offers to remove them with one consent, through remove: <slug>
> mcp-only for each slug that claims one (and a plain key removal for a key no
> slug claims). (The plain key removal is a stackgen verb too: write it in the
> stack-template `SKILL.md` beside `remove:`.)

> D16: U2 runs `mise x -- mise run p:plugins:marketplace` as its last step and
> keeps the output in its own commit.

## Edits

1. **`plugins/stackgen/assets/pack-format.md`** — `:128-145`: retire
   `user_mcp_servers:`. State that a pack declares no MCP server; the key is
   refused by the checker. Add the `## MCP servers` section of `conventions.md`
   (D4) next to where `## Claude plugins` is described: one bullet per server —
   `` `<name>` — <what it is for>; install: <official URL> `` — never a
   command, never a config block. `lsp_servers:` stays unchanged. `:363` is a
   passive Context7 hint — leave it (plan 2).
2. **`plugins/stackgen/assets/kinds.md`** — `:850-853`: an `addon` pack carries
   a `## Claude plugins` section (the `user_mcp_servers:` alternative is gone).
   Keep the bundle kind `workspace`. `:69,132,598` are passive hints — leave.
3. **`plugins/stackgen/assets/artifact-doctrine.md`** — `:205-206,268`: no MCP
   server is materialized; `:236-239`: the Context7 halt now asks the user to
   install a Context7 MCP server (D2).
4. **`plugins/stackgen/assets/output-tree.md`** — `:10,108`: `vwf-tools` holds
   LSP servers only.
5. **`plugins/stackgen/skills/stackgen-stack-template/references/generator.md`**
   — `:19-37`: keep the requirement; rewrite the halt sentence at `:25-26` to
   D2's form: the agent asks the user to install a Context7 MCP server at user
   scope, gives `https://github.com/upstash/context7` as the install page,
   waits, and re-checks before it continues; never a tools-menu remedy.
   `:106-111,116-229`: the generator emits no `user_mcp_servers:` entry; a
   generated pack that needs a server writes a `## MCP servers` section in its
   `conventions.md` (D4). Remove the server-declaration research and vetting
   steps that exist only for MCP servers; keep everything that vets
   `lsp_servers:`.
6. **`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`**
   — `:165-169,253,364-462`: the addon path lands no server (steps 3-5 of the
   addon merge lose their MCP part); `reconcile-claims:` acts on LSP keys only;
   `remove:` is extended per D19 — any materialized slug, plain and `mcp-only`
   forms, MCP keys removed from the manifest, `claims.json` and the lockfile
   in both forms (write the verb in stack-template `SKILL.md:91-118`, the
   materializer `:406-437` and `local-plugin.md:236-266`). A repo still naming a removed addon pack (no
   `stacks/addon/<slug>/pack.yaml`) is reported and skipped, never an error —
   `/vwf:setup` step 26 removes it.
7. **`plugins/stackgen/skills/stackgen-stack-template/references/local-plugin.md`**
   — `:3,25-26,125-150,315-344`: `vwf-tools` holds `lsp_servers` only; replace
   the `"context7"` claims example with an LSP key such as `typescript-lsp`; the
   tier-3 consent covers LSP servers only.
8. **`plugins/stackgen/skills/stackgen-stack-template/references/bootstrap-handoff.md`**
   — state that a `## MCP servers` section is never handed to bootstrap; only
   `## Claude plugins` is. Change nothing else.
9. **`plugins/stackgen/skills/stackgen-stack-template/SKILL.md`** —
   `:46-57,91-118,198-206`: drop the per-machine server rationale for addons and
   the MCP half of the consent; `:86-89`: a removed addon slug is reported, not
   an error (same rule as edit 6).
10. **`plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`** — `:57-59`: the
    `needed_by` mapping keeps `taste-skill` only; `:69-72`: the generator note
    says the agent asks the user to install a Context7 MCP server when the
    generator runs (D2), no tools-menu option.
11. **`plugins/stackgen/skills/stackgen-sync/SKILL.md`** — `:65-85`: remove the
    `capability-provider/notion → addon/notion` row and the `:80` sentence about
    old notion skill files (D12); keep the taste-skill row; `:142-148,176-179,211`:
    sync subtracts LSP keys only.
12. **`plugins/stackgen/skills/stackgen-reputation/SKILL.md`** — `:163-168`:
    the offline rule refers to "the generator's Context7 precondition"; keep the
    reference, drop any tools-menu remedy wording.
13. **`plugins/stackgen/agents/stackgen-skill-reviewer.md`** — `:65,95,102-106`:
    a generated `user_mcp_servers:` entry is a gap; a `## MCP servers` section
    is the accepted form. `:55` is a passive hint — leave.
14. **`plugins/stackgen/.claude-plugin/plugin.json`** — `description` only: drop
    "optional tools (context7, notion, taste-skill)"; say the optional tool is
    taste-skill and that MCP servers are the user's to install. Keep
    "per-topic Context7 research" (plan 2 owns it). Never touch `version`.
15. **Last step:** run `mise x -- mise run p:plugins:marketplace`, which
    rewrites `.claude-plugin/marketplace.json`. Keep its output.

## Verification

- `mise x -- mise run p:plugins:marketplace -- --check` exits 0.
- `command grep -rn 'user_mcp_servers' plugins/stackgen` prints only lines that
  say the key is retired or refused.
- `command grep -rn -i 'tools menu' plugins/stackgen/skills/stackgen-stack-template/references/generator.md`
  prints nothing.

## Guardrails

- Do not touch `plugins/stackgen/stacks/**` (U1) or any vwf file (U3).
- Do not touch the passive "Context7 at use time" hints (plan 2).
- Keep every `lsp_servers:` rule and the `claims.json` mechanism.
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
- Strict YAML frontmatter: a skill's frontmatter that fails to parse drops the
  skill silently. Change no frontmatter key.

## Commit

`feat: stackgen installs no mcp server`

## Ruling added in the rulings review

> D21: The machine cleanup of D20 removes every MCP server key and every MCP
> claim in claims.json, whichever repo claims it. Its one consent names the
> other claiming repos. Those repos move to 26 on their next setup.

> D28: Before it returns, each edit unit runs
> `mise x -- mise run code:format -- --fix <each file it changed>`, on its own
> changed files only, never the whole tree. The unit gate then only checks.

> D31: A stack-template verb form remove: key <name>. It deletes that one server
> key from the vwf-tools manifest and claims.json, runs under the D20
> machine-cleanup consent, and returns the removed key name.

> D32: U2 removes the keyword context7 from package.json keywords and owns
> package.json for that one edit.

> D34: Every stackgen verb (materialize, sync, reconcile-claims) ignores MCP
> records in a lockfile: it lands no server, adds no claim and reports nothing.
> The repo part of step 26 deletes the MCP records from that repo lockfile.

> D36: The materializer and stack-template resolution report and skip any pin
> whose pack no longer exists, on every axis (addon, design and the rest),
> never an error. Its materialized skills stay until step 26 removes them.
> (This replaces the addon-only wording of edits 6 and 9.)

Edit 16: **`package.json`** — remove `"context7"` from `keywords` (D32).

> D39: When the materializer lands a pack, it reads the ## MCP servers section
> of its conventions.md and records each line (name, purpose, install URL) in
> that component lockfile entry under a new key required_mcp_servers. Doctor
> reads only the lockfile for the D4 and D27 row. Nothing installs a server.
> (Write it in materializer.md, local-plugin.md or wherever the lockfile entry
> shape is defined, and in stack-template SKILL.md.)

> D40: Both packs [lovable, stitch] get a line. U1 takes each server name and
> install page from the vendor official documentation, fetches the page live,
> and cites the URL and date in its report; with no official page it returns a
> question. A server a pack does not require carries the marker (optional)
> after its name; the Stitch line is optional, because Stitch works through its
> SDK. The D4 format gains that marker (U2, pack-format.md), the lockfile
> record of D39 carries optional: true (U2), and doctor never reports an
> optional server as drift (U3).

## Rulings from round 4

> D43: When setup calls remove: inside step 26, setup asks the one consent and
> passes consented to each call; the verb asks its own consent only when a user
> runs it directly.

> D44: Setup calls the verb once inside each member repo, the way it
> materializes members today; remove: gets no new repo argument.

> D45: The machine part uses remove: key <name> for every MCP key in vwf-tools.
> It edits only the vwf-tools manifest and claims.json and commits nothing; each
> repo own step 26 cleans its lockfile (D34). This replaces the mcp-only calls
> of D20 in the machine part; mcp-only stays for the repo part.

> D47: Doctor reads a missing required_mcp_servers key as no servers declared.
> stackgen-sync fills the key when it updates a pack to a version whose
> conventions.md has a ## MCP servers section.
