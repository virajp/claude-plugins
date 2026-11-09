# U3 — vwf config_format 26 and design-tool wording

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `docs/memory/decisions/2026-11-02-optional-tools-in-vwf-tools.md`
  (the step 25 design), `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  (the `remove:` verb; owned by U2, read only), `scripts/src/check.ts`
  `prescribes()` (the enumeration rule; owned by U4, read only).

## Ruling

> D3: The user. User's words: 'I want the ownership of install mcp servers to
> move to user and not this plugin. Wherever the mcp servers are required, AI
> agent should simply ask the user to install them.'

> D4: A '## MCP servers' section in the pack's conventions.md, beside the
> existing '## Claude plugins' section. One line per server: its name, what it
> is for, and its official install page. It is not handed to bootstrap. When a
> skill needs the server and it is not available, the agent asks the user to
> install it and waits. Doctor reports a declared server that is not available
> as drift, never blocking.

> D5: config_format 26. The /vwf:setup migration removes context7 and notion
> from addons: … It asks once to re-pin each design: claude-design pin to
> another design tool, claude-code (the default) first, then lovable and
> stitch, and removes the old adapter skills and the claude-design server.

> D6: Step 25 no longer asks the context7 question and no longer adds context7
> or notion to addons:. A repo at 24 is never asked about a tool that step 26
> then removes. Step 26 handles repos already at 25.

> D19: Extend remove:. It accepts any materialized slug, not only axis addon.
> Plain remove: <slug> deletes the component with all its keys. The form
> remove: <slug> mcp-only keeps the component and deletes only its MCP server
> keys … Step 26 calls plain remove: for context7, notion and the re-pinned
> claude-design, and remove: <slug> mcp-only for every other slug whose
> lockfile entry has an MCP key.

> D20: Step 26 has two parts. The repo part (addons:, the claude-design re-pin)
> is the format step and runs once. The machine part runs on every /vwf:setup
> run, beside reconcile-claims: when this machine vwf-tools manifest holds any
> MCP server key, setup offers to remove them with one consent, through
> remove: <slug> mcp-only for each slug that claims one (and a plain key
> removal for a key no slug claims), and lists the servers for the user to
> install by hand. Declined: nothing is written and it is offered again next
> run. Doctor remedy /vwf:setup then points at this check.

> D21: The machine cleanup of D20 removes every MCP server key and every MCP
> claim in claims.json, whichever repo claims it. Its one consent names the
> other claiming repos. Those repos move to 26 on their next setup.

> D22: Step 25 still takes notion out of backing_template and adds nothing to
> addons:. Inside step 25 existing consent it calls the extended plain remove:
> for the capability-provider/notion component, so its skills and its server go.

> D23: Step 26 records the user choice, runs plain remove: claude-design (its
> skills, its server, its lockfile entry), then materializes the new design
> tool, so the new adapter skills land on clean paths.

> D24: One re-pin question that names every pinned project; the answer applies
> to all of them. Projects that pin another design tool are not touched.

> D25: Step 26 clears design.design_system_id, the re-pinned project
> design.projects entries and design.flows_rendered. The next /vwf:design-system
> and /vwf:screens set them for the new tool. docs/blueprint/design-system.md and
> the flow docs stay, because they are vwf own copies.

> D26 (amends D7): Each accepted part is applied and stays. A declined part
> writes nothing. The config_format stamp moves to 26 only when every part of
> the repo part is applied; until then setup offers only the remaining parts on
> each run, because every part is idempotent.

> D27: Doctor runs claude mcp list and looks for the exact server name of each
> ## MCP servers line in its output, at any scope. The command health-checks
> (connects to) each approved server; doctor accepts that as its one side
> effect and says so in the row. A listed server counts as available even if
> its health check fails, and the row notes the failure. A name that is not
> listed is drift. When the claude CLI is not on PATH, the row reads not
> checked.

> D30: config_format 25 to 26; the 24 to 25 narrative gets the D6 amendment; a
> new 25 to 26 narrative for step 26 (repo part and machine part); the :238
> writer row of addons: names step 26 as a writer.

> D31: A stack-template verb form remove: key <name>. It deletes that one
> server key from the vwf-tools manifest and claims.json, runs under the D20
> machine-cleanup consent, and returns the removed key name.

> D34: … The repo part of step 26 deletes the MCP records from that repo
> lockfile.

> D35: Step 26 runs remove: and the re-pin materialize in each repo whose
> lockfile names the component: the base and each member. A member that is not
> cloned locally is listed as a part not yet applied; per D26 the stamp stays
> at 25 until every member is done, and setup offers only that member part on
> a later run.

> D37: U4 adds claude-code to ENUMERATION_PEERS. U3 writes every vwf mention of
> claude-design within 100 characters of the replacement list, for example:
> re-pin claude-design to claude-code, lovable or stitch.

> D28: Before it returns, each edit unit runs
> `mise x -- mise run code:format -- --fix <each file it changed>`, on its own
> changed files only, never the whole tree. The unit gate then only checks.

## Edits

1. **`plugins/vwf/assets/vwf-config.md`** (D30) — `config_format` 25 → 26 at
   `:49,52`. The 24→25 narrative gets D6's amendment. Add a 25→26 narrative:
   the repo part and the machine part of step 26. The `:238` writer row of
   `addons:` names step 26.
2. **`plugins/vwf/skills/setup/references/format-lineage.md`** — step 25
   (`:132`): drop the context7 question and the notion move into `addons:`
   (D6); keep the removal of notion from `backing_template`, now through plain
   `remove:` (D22). Add a step 26 row with:
   - **Repo part** (runs once; D26 decides the stamp): in each repo whose
     lockfile names the component (D35) — plain `remove:` for `context7` and
     `notion` and their `addons:` entries; one re-pin question for all projects
     pinned to `claude-design` (D24), choices claude-code, lovable, stitch, then
     plain `remove: claude-design` and the new tool's materialize (D23); clear
     the `design.*` values of the re-pinned projects (D25); delete the MCP
     records from the lockfile (D34).
   - **Machine part** (every setup run; D20, D21, D31): one consent that lists
     every MCP key in this machine's `vwf-tools`, and the other repos that claim
     them; `remove: <slug> mcp-only` per claiming slug, `remove: key <name>` per
     unclaimed key; print the servers for the user to install by hand.
3. **`plugins/vwf/skills/setup/references/migrate-pipeline.md`** — `:59-72`:
   step 26 after 25, with its two parts; step 25 per D6 and D22.
4. **`plugins/vwf/skills/setup/references/migration-and-consent.md`** — step
   26's repo-part consent, the re-pin question and the machine-part consent, in
   the file's existing shape. Edit only if the file lists per-step consents.
5. **`plugins/vwf/skills/setup/SKILL.md`** — `:165-172`: format 26 and a
   one-line summary of step 26; beside the reconcile step, the machine part
   (D20).
6. **`plugins/vwf/skills/setup/references/materialize.md`** — `:86-91,155-170`:
   an addon lands no server; the per-machine rationale is for LSP servers only;
   the machine part of step 26 runs here on every run, beside reconcile-claims
   (D20). `:179-190`: the dropped-slug path also subtracts the slug's
   `local_plugin` LSP claims.
7. **`plugins/vwf/skills/doctor/references/stack-checks.md`** — `:172-189`: a
   `design:` pin naming a removed tool is drift, remedy `/vwf:setup`; write it
   per D37 ("a pin to claude-design — re-pin to claude-code, lovable or stitch
   with `/vwf:setup`"). `:215-250`: `vwf-tools` holds LSP servers only; an MCP
   key in `vwf-tools` is drift, remedy `/vwf:setup`; add the D4 row checked per
   D27. `:243-249`: drop "a picked tool's server and a design tool's server".
8. **`plugins/vwf/skills/doctor/SKILL.md`** — the §§3–5 row: name the
   `## MCP servers` check as drift (D27); edit nothing else.
9. **`plugins/vwf/skills/architecture/references/stack-menu.md`** — `:172-198`:
   the tools round offers the addon packs the menu returns; no example names
   context7 or notion.
10. **`plugins/vwf/skills/design-system/SKILL.md`** — `:30`: example tools
    claude-code, lovable, stitch.
11. **`plugins/vwf/assets/design-adapter.md`** — `:4`: claude-code, Lovable,
    Stitch; `:44-49`: the token count; `:56`: the fenced example uses
    `design: claude-code`; `:306-311`: no design-tool pack lands an MCP server;
    a tool that needs one names it in `## MCP servers` (D4).
12. **`plugins/vwf/assets/stack-adapter.md`** — `:252`: example token
    `claude-code`; `:277-310`: the addon contract lands no server;
    `:108,192`: `needed_by` stays.
13. **`plugins/vwf/assets/templates/screen-prompt.md`** — `:7`: the brief is
    for the configured design tool's canvas session.
14. **`plugins/vwf/assets/templates/canvas-claude.md`** — `:17`: one design
    project per platform in the configured design tool.

## Verification

- `mise x -- mise run p:plugins:check` exits 0 after wave 1 (the wave gate).
- `command grep -rn -i -E 'claude-design|claude design|claude\.ai/design|context7|notion' plugins/vwf`
  prints only the format-lineage, vwf-config and migrate-pipeline history and
  step 26 text, the step 26 consent lines and the doctor re-pin row — each
  `claude-design` within 100 characters of claude-code, lovable or stitch.
- `command grep -rn 'config_format' plugins/vwf/assets/vwf-config.md` shows 26.

## Guardrails

- Name no technology alone in vwf prose: `p:plugins:check` reports a tool token
  with no peer within 100 characters (D37).
- Write no `mcp__` server prefix anywhere in vwf (U4's guard refuses it).
- Do not touch `plugins/stackgen/**` (U1, U2) or `scripts/**` (U4).
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
- Change no skill frontmatter.

## Commit

`feat: config_format 26 retires plugin-installed mcp servers`

> D39: … Doctor reads only the lockfile key required_mcp_servers (one entry per
> ## MCP servers line: name, purpose, install URL) for the D4 and D27 row.

> D40: Both packs [lovable, stitch] get a line. U1 takes each server name and
> install page from the vendor official documentation, fetches the page live,
> and cites the URL and date in its report; with no official page it returns a
> question. A server a pack does not require carries the marker (optional)
> after its name; the Stitch line is optional, because Stitch works through its
> SDK. The D4 format gains that marker (U2, pack-format.md), the lockfile
> record of D39 carries optional: true (U2), and doctor never reports an
> optional server as drift (U3).

> D41: Step 25 runs the capability-provider/notion removal in each repo whose
> lockfile records it: the base and each member. An uncloned member is a part
> not yet applied, and the stamp stays at 24 until it is done, as D35 rules for
> step 26.

> D42 (gap 10): U3 owns plugins/vwf/skills/screens/references/import-mode.md
> (24-28) and prompt-mode.md (118), which name Claude Design MCP tool verbs and
> its hosted canvas project; U3 rewrites them tool-neutral: the adapter skills
> do the reading, and the canvas conventions file belongs to the configured
> design tool.

> D18 (amended): commit order U1, U2, U4, U3 — U3 commits after U4, so its
> claude-design mentions beside claude-code pass with the new peer.

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

> D46: After a re-pin to claude-code, step 26 offers to add taste-skill to
> addons: in the same question, yes the default.
