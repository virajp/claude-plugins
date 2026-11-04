# U1 — Local plugin becomes vwf-tools; mcp_servers: retired; old plugin migrated

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/stacks/bundles/claude-code.md` (read only).

## Ruling

> - D2: Every picked MCP server (context7, notion) lands in the vwf-tools local
>   plugin, user scope, like the LSP servers. The pick is the product's,
>   committed in .config/vwf.yaml's addons:; each person's machine gets the
>   servers in their own vwf-tools when they run /vwf:setup.
> - D3: It moves to vwf-tools and stays required: the claude-design pack
>   declares it under user_mcp_servers:, so it lands in vwf-tools whenever the
>   pack is picked, with no tools-menu step.
> - D4: Retire it: remove the mcp_servers: key, the .mcp.json write path and its
>   tier-2 consent line from the pack format, the materializer and the
>   generator. user_mcp_servers: is the only MCP key. stackgen-sync removes a
>   repo's recorded .mcp.json entries, behind consent.
> - D5: user_mcp_servers: keeps its name.
> - D6: Each optional tool is a pack and a bundle of a new type, kind and axis
>   named addon, with no default: true: plugins/stackgen/stacks/addon/context7
>   (user_mcp_servers:), addon/notion (moved from capability-provider/notion,
>   its skill and its server), addon/taste-skill (a ## Claude plugins section).
>   The tools menu lists the bundles of the addon axis. assets/kinds.md gains an
>   addon kind. The name addon keeps the axis apart from the existing phrase
>   'the three tool axes' (design, cicd, stylesheet), which stays as it is.
>   addon counts as an axis: every 'seven axes' count becomes eight.
> - D11: Through the bootstrap handoff, as today: the addon/taste-skill pack
>   carries the ## Claude plugins section, and the materializer hands it to
>   bootstrap through docs/sync/vwf.md. vwf-tools holds servers only.
> - D12: Keep what the repo has: migrate writes into addons: each tool the repo
>   already records (notion from backing_template or the lockfile's mcp_servers,
>   taste-skill from the lockfile's bootstrap block; claude-design moves to
>   vwf-tools with its pack). For context7, which every vwf user had, it asks
>   one yes/no question. It renames the lockfile's local_plugin block from
>   stackgen-lsp to vwf-tools and moves the recorded .mcp.json entries to
>   vwf-tools, behind consent.
> - D19: On the first materialization or sync that finds
>   ~/.claude/plugins/local/stackgen-lsp/, stackgen offers one tier-3 migration,
>   in this order: write ~/.claude/plugins/local/vwf-tools/ with the union of
>   both manifests' servers; register vwf-tools; claude plugin uninstall
>   stackgen-lsp@stackgen-lsp --scope user; claude plugin marketplace remove
>   stackgen-lsp; delete the old directory. Each step checks its own result
>   first and is skipped when already done. When a step fails or its printed
>   command is declined, stackgen stops and reports; doctor shows drift; the
>   next run continues from the first incomplete step. Both plugins may serve a
>   server in that window. A decline of the whole offer is D27.
> - D22: When the lockfile still names stackgen-lsp and
>   ~/.claude/plugins/local/stackgen-lsp/ does not exist — another repo already
>   migrated this machine, or the machine never had it — the lockfile's
>   local_plugin block is rewritten to the vwf-tools names without a prompt. The
>   repo's servers then merge into vwf-tools behind the normal tier-3 consent,
>   as a first write when vwf-tools does not exist yet.
> - D23: No general net diff. stackgen-sync carries a fixed relocation table:
>   capability-provider/notion -> addon/notion, and the taste-skill@taste-skill
>   claim of design-tool/claude-code@1 -> addon/taste-skill. In the base repo, a
>   relocated item is re-attributed in the lockfile, never removed and re-added;
>   a change of place (.mcp.json to vwf-tools) or of content (the notion skill's
>   paths: key) is a normal update behind its normal consent. In a member repo,
>   D29 applies instead: the old items are removed. The lockfile records the
>   owners of every item as a list: local_plugin servers as {name, packs:
>   [...]}; bootstrap.plugins keeps its existing map, whose components: [...]
>   list is the owners list; skill entries by their component. An old-shape
>   entry with no owners is read with owners unknown and rewritten on the next
>   sync. Doctor reads the owners from the lockfile and skips an entry whose
>   owners are unknown.
> - D25: The base repo only. Its stackgen lockfile records the addon claims, and
>   doctor reads the base repo's lockfile for the addons check. Members get no
>   addon skill files; the servers are user scope anyway.
> - D26: vwf-tools keeps a claims file inside its manifest folder,
>   ~/.claude/plugins/local/vwf-tools/.claude-plugin/claims.json, mapping each
>   server key (MCP and LSP) to the list of absolute repo paths that claim it,
>   so the rule that stackgen writes outside the repo only under .claude-plugin/
>   stays. A materialization adds this repo's path; a removal drops only this
>   repo's path and deletes the key from the manifest only when no repo claims
>   it. An absent claims.json means every key is unclaimed and kept. Any write
>   drops a claimed repo path that no longer exists on disk.
> - D27: Nothing is written: vwf-tools is not written or registered, and
>   stackgen-lsp stays as it is, so no server is served twice. Newly picked
>   addon servers and the claude-design server land nowhere until the migration
>   is accepted, and the repo's .mcp.json entries are kept: their removal is not
>   offered until the migration is accepted. The migration is offered again on
>   each later setup or sync until it is accepted; doctor reports the old
>   directory and the unlanded servers as drift. A sync runs the migration offer
>   whenever the stackgen-lsp directory exists, even in a repo whose lockfile
>   has no local_plugin block. When the user accepts the migration but declines
>   the separate .mcp.json key-removal line, the lockfile keeps its top-level
>   mcp_servers list and the removal is offered again on the next run.
> - D29: The migration reads the stackgen lockfiles of every repo of the product
>   that is cloned locally (base and members) for notion and taste-skill (D12,
>   D21); a member not cloned locally is skipped with a one-line warning. A
>   member repo's old items (the notion skill files, its .mcp.json entry) are
>   removed by that member's own sync, behind consent; the relocation table
>   applies in the base repo only. A bootstrap plugin that another repo of the
>   product claims through an addon pack (taste-skill through the base repo's
>   addon/taste-skill) is never removed by a member's handoff removal.
> - D30: The migration seeds claims.json with the current repo's path for each
>   key the current repo's lockfile claims; other repos add their claims on
>   their next sync. An inherited key no repo claims is never deleted
>   automatically; doctor reports it as drift.

The user's words: the local plugin "will contain all the selected LSPs and
other tools (MCP servers) that user selects to install".

## Edits

All paths below are under `plugins/stackgen/`.

1. **Rename, everywhere you own.** Replace every `stackgen-lsp` with
   `vwf-tools`: the directory `~/.claude/plugins/local/vwf-tools/`, the
   `plugin.json` `name`, the `marketplace.json` `name` and its plugin entry,
   and every `claude plugin …` command (`marketplace add`,
   `install vwf-tools@vwf-tools --scope user`, `marketplace update`,
   `plugin update`, `uninstall`, `marketplace remove`). The `marketplace.json`
   `owner` stays
   `stackgen`. Describe the plugin as "the one local plugin that holds every
   LSP server and every MCP server this machine's repos materialized".
2. **`skills/stackgen-stack-template/references/local-plugin.md`** — the
   routing table (`:24-31`) has two rows: `user_mcp_servers:` → the local
   plugin's `mcpServers`, tier 3; `lsp_servers:` → `lspServers`, tier 3.
   Remove the `mcp_servers:` row and every passage that contrasts the two MCP
   keys, the two-writers case among them; say once that the project-scoped
   key was retired at stackgen's next major (no version number) and why (D2).
   Remove the lockfile's top-level `mcp_servers` list from the lockfile prose
   (`:181-186`); `local_plugin.mcp_servers` stays. Add a section **Migrating
   from stackgen-lsp** that states D19 exactly, plus the lockfile half of D12:
   a lockfile `local_plugin` block that names `stackgen-lsp` is rewritten to
   the `vwf-tools` names in the same consented step, and a lockfile top-level
   `mcp_servers` list (the retired `.mcp.json` entries) is moved into
   `local_plugin.mcp_servers`, its keys removed from the repo's `.mcp.json`
   behind its own consent line — removing only keys the lockfile recorded,
   never a key the user wrote, and deleting `.mcp.json` only if it is then
   empty.
3. **`skills/stackgen-stack-template/references/materializer.md`** — remove
   the tier-2 `.mcp.json` target (`:159-161`), the MCP-wiring consent line
   (`:233-245`) and the `.mcp.json` removal case (`:353-354`); the only MCP
   path is step 4's local plugin. A `addon`-axis pin (D6) is materialized like
   any other bundle: its `user_mcp_servers:` go to step 4, its
   `## Claude plugins` to the bootstrap handoff (D11). Step 4 runs the D19
   migration first when the old directory exists. Fix the stale "step 3b"
   pointer at `:169` to "step 4". The rule at `:358` names `vwf-tools`.
4. **`skills/stackgen-stack-template/SKILL.md`** — every mention of
   `mcp_servers:` or `.mcp.json` as a stackgen write target goes; the payload
   fields it names are `user_mcp_servers:` and `lsp_servers:`. Name the `addon`
   axis beside the other axes wherever the skill lists them.
5. **`skills/stackgen-sync/SKILL.md`** — `:110` reads the `vwf-tools`
   manifest; step 4 and step 6 run the D19 migration and the D12 lockfile
   rewrite when they find the old names; a recorded top-level `mcp_servers`
   list is handled as in edit 2.
6. **`assets/output-tree.md`** — the third target (`:58-105`) is `vwf-tools`;
   the tier-2 definition and the `.mcp.json` history (`:9,27-34,97,204`) say
   `.mcp.json` is no longer written; the lockfile sample (`:328-341`) carries
   the `vwf-tools` names and no top-level `mcp_servers`; removal
   (`:369-383`) names `vwf-tools`.
7. **`assets/artifact-doctrine.md`** — `:188` names `vwf-tools`; §5 drops the
   two-writers fault and the `mcp_servers:` key; `:237` says generation halts
   the way it does when no Context7 server is reachable from any source,
   and names the remedy in one clause: add `context7` in `/vwf:architecture`'s
   tools menu,
   run `/vwf:setup`, then restart the session.
8. **`assets/pack-format.md`** — remove `mcp_servers:` from the field list
   (`:128-143`); `user_mcp_servers:` and `lsp_servers:` remain. Add the `addon`
   type, kind and axis to every enumeration of types, kinds and axes in the
   file: an `addon` pack is optional, never `default: true`, picked only through
   the tools menu and recorded in `.config/vwf.yaml`'s `addons:` list (D7), and
   carries at least one of `user_mcp_servers:` or a `## Claude plugins`
   section. The `## Claude plugins` spec (`:194-205`) says the section is
   allowed on an `addon` pack only, and its example line stays
   `taste-skill@taste-skill`. `:359` stays.
9. **D22, D23, D25, D26, D27, D29 and D30, in `local-plugin.md`,
   `materializer.md`, `stackgen-sync/SKILL.md` and `output-tree.md`.**
   (a) **Migration offer and decline** — in the **Migrating from stackgen-lsp**
   section: the offer runs whenever `~/.claude/plugins/local/stackgen-lsp/`
   exists, even in a repo whose lockfile has no `local_plugin` block; a
   decline writes nothing (no `vwf-tools`, no registration, `stackgen-lsp`
   unchanged), newly picked addon servers and the claude-design server land
   nowhere until it is accepted, and the offer comes back on each later setup
   or sync (D27). A declined `.mcp.json` key-removal line keeps the lockfile's
   top-level `mcp_servers` list, and the removal is offered again (D27).
   (b) **No old directory** — a lockfile that names `stackgen-lsp` on a
   machine with no `stackgen-lsp/` directory is rewritten with no prompt, and
   `vwf-tools` is then a first write behind tier-3 consent when it does not
   exist (D22).
   (c) **Relocation table** — `stackgen-sync` carries a fixed table:
   `capability-provider/notion` → `addon/notion`, and the
   `taste-skill@taste-skill` claim of `design-tool/claude-code@1` →
   `addon/taste-skill`. A relocated item is re-attributed in the lockfile,
   never removed and re-added; a change of place (`.mcp.json` → `vwf-tools`)
   or of content is a normal update behind its normal consent (D23). The table
   applies in the
   base repo only. In a member repo of a multi-repo product, the old notion
   skill files and `.mcp.json` entry are removed by that member's sync,
   behind consent; a member not cloned locally is skipped with a one-line
   warning (D29).
   (d) **Owners as lists** — the lockfile sample records the owners of every
   item: `local_plugin` servers as `{name, packs: [...]}`, `bootstrap.plugins`
   keeps its existing map, whose `components: [...]` list is the owners
   list, skill entries by their `component`;
   a list of bare names (the old shape) is read with owners unknown and
   rewritten on the next sync (D23).
   (e) **Claims** — the claims file
   `~/.claude/plugins/local/vwf-tools/.claude-plugin/claims.json`: server key
   (MCP and LSP)
   → list of absolute repo paths, written beside the manifest in the same
   consented step, a path added on materialization and dropped on removal, a
   key deleted from the manifest only when its list is empty (D26). An absent
   claims file means every key is
   unclaimed and kept; any write drops a claimed repo path that no longer
   exists on disk (D26). The migration seeds it with the current repo's path
   for each key this repo's lockfile claims; other repos add theirs on their
   next sync; a key no repo claims is never deleted automatically (D30).
   (f) **Base repo** — an `addon` pin is materialized only in the repo vwf
   names for it, the base repo (D25).
   (g) **Migration order** — write `vwf-tools`, register it, uninstall
   `stackgen-lsp@stackgen-lsp`, remove the `stackgen-lsp` marketplace, delete
   the old directory; each step checks its own result first and is skipped
   when already done; a failed or declined step stops the run with a report,
   and the next run continues from the first incomplete step (D19). While the
   migration is declined, the repo's `.mcp.json` entries are kept and their
   removal is not offered (D27).
10. **`skills/stackgen-stack-template/references/bootstrap-handoff.md`** —
    the removal rule (`:91-99`): a plugin is not removed when another repo of
    the product claims it through an `addon` pack — taste-skill through the
    base repo's `addon/taste-skill` (D29). Name `vwf-tools` wherever the file
    names the local plugin.

## Verification

- Every unit-gate line: `mise x -- mise run code:format` — green.
- `grep -rn 'stackgen-lsp' <each owned file>` prints only lines inside the
  **Migrating from stackgen-lsp** section and the migration steps.
- `grep -rnE '(^|[^_])mcp_servers:' <each owned file>` prints only lines that
  describe the retirement or the migration.
- `grep -rn '\.mcp\.json' <each owned file>` prints only retirement and
  migration lines.

## Guardrails

- Do not touch `references/generator.md` (U2), any pack under `stacks/` (U3),
  `plugins/stackgen/.claude-plugin/plugin.json` (U7) or any doc (U6).
- `plugins/**/*.md` is not formatted by dprint — match the surrounding fold
  width by hand; keep each code span on one line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen local plugin becomes vwf-tools and holds every MCP server`
