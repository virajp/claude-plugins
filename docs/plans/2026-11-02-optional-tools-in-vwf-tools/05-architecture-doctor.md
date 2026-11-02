# U5 — Architecture tools menu and doctor drift check

- **Read first:** every owned file you edit, top to bottom —
  `plugins/vwf/skills/architecture/SKILL.md`,
  `plugins/vwf/skills/architecture/references/stack-menu.md`,
  `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/assets/stack-vocabulary.md`.
- **Lazy-load:** `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md` (read
  only — U2 adds the `addon` round to its payload in the same wave).

## Ruling

> - D1: A tools menu with one multi-select list of optional tools and no item
>   preselected. Only the tools the user picks are installed. The pick is
>   recorded in addons:; a re-run shows the current pick and asks only whether
>   to change it.
> - D7: A top-level addons: list in .config/vwf.yaml, one per product, for
>   example addons: [context7, notion]. Absent or empty means no optional tool.
>   The name addons: keeps it apart from the existing repo.stack.tools key; the
>   menu is still shown to the user as optional tools.
> - D8: /vwf:architecture shows the tools menu after the stack menu and writes
>   addons:. /vwf:setup materializes each picked tool on every run and removes a
>   dropped one.
> - D13: Drift, never blocking: a picked tool that is not installed, or an
>   installed tool that is not picked, is a drift finding, remedied by
>   /vwf:setup. A missing tool never blocks execute; the generator and
>   design-session halt on their own.
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
> - D24: No. addons: is always a list, [] when none; it never holds unresolved,
>   and doctor never reports [] as a pending decision.
> - D25: The base repo only. Its stackgen lockfile records the addon claims, and
>   doctor reads the base repo's lockfile for the addons check. Members get no
>   addon skill files; the servers are user scope anyway.
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
> - D6: Each optional tool is a pack and a bundle of a new type, kind and axis
>   named addon, with no default: true: plugins/stackgen/stacks/addon/context7
>   (user_mcp_servers:), addon/notion (moved from capability-provider/notion,
>   its skill and its server), addon/taste-skill (a ## Claude plugins section).
>   The tools menu lists the bundles of the addon axis. assets/kinds.md gains an
>   addon kind. The name addon keeps the axis apart from the existing phrase
>   'the three tool axes' (design, cicd, stylesheet), which stays as it is.
>   addon counts as an axis: every 'seven axes' count becomes eight.
> - D30: The migration seeds claims.json with the current repo's path for each
>   key the current repo's lockfile claims; other repos add their claims on
>   their next sync. An inherited key no repo claims is never deleted
>   automatically; doctor reports it as drift.

The menu payload U2 adds: an `addon` round, every bundle of axis `addon` with
its slug, name and summary, none marked default, multi-select, no generate
entry, each with a `needed_by` note when a shipped pack needs it (`context7` →
the stackgen generator; `taste-skill` → the claude-code design tool's
design-session).

## Edits

1. **`plugins/vwf/skills/architecture/references/stack-menu.md`** — a
   **Tools round**, after the last axis round: one multi-select
   `AskUserQuestion` over the menu's `addon` entries, **nothing preselected**,
   each option's description the entry's summary plus its `needed_by` note;
   on a re-run, the current `addons:` list is shown as the current pick and
   the round asks only whether to change it. Write the answer as `addons:` in
   `.config/vwf.yaml` (`[]` when nothing is picked). When the stack menu
   returns no `addon` round, skip the round and write nothing. The round
   offers no "defer this axis" option and never writes `unresolved` (D24).
2. **`plugins/vwf/skills/architecture/SKILL.md`** — name the tools round in
   the step list where the stack menu is, and state that `addons:` is never
   preselected and is written only from the user's pick.
3. **`plugins/vwf/skills/doctor/references/stack-checks.md`** — a **Addons**
   check: for each slug in `addons:`, the tool's servers are present in the
   `vwf-tools` plugin's manifest
   (`~/.claude/plugins/local/vwf-tools/.claude-plugin/plugin.json`)
   or its plugin is installed (for a `## Claude plugins` tool); the reverse
   case is a server the repo's stackgen lockfile records under
   `local_plugin.mcp_servers` whose `packs` list holds `addon/<slug>` whose slug
   is not
   in `addons:` — the lockfile entries are `{name, packs: [...]}` (D23), so read
   the owners there and never match keys against pack declarations; an entry
   whose owners are unknown (the old shape) is skipped. `addons: []` is never a
   pending
   decision (D24). Each mismatch is
   **drift**, remedied by `/vwf:setup`, never blocking. A
   `~/.claude/plugins/local/stackgen-lsp/` directory is drift too, remedied by
   `/vwf:setup` (stackgen migrates it). Where the LSP check (`:74-90`) names
   the plugin that provides a server, name `vwf-tools`.
4. **`plugins/vwf/skills/doctor/SKILL.md`** — add the Addons check to the
   checks table row it belongs to (the stack checks row) in a few words.
5. **`plugins/vwf/assets/stack-vocabulary.md`** — `:18`: the LSP plugin is
   the plugin whose `lspServers` covers the language — for a materialized
   stack, stackgen's generated `vwf-tools`. Add an `addon` axis line where the
   file lists the axes, and a `addons:` line where it lists config keys.
6. **`plugins/vwf/assets/design-adapter.md`** — `:309-310`: the materializer
   writes a design tool's MCP server into the `vwf-tools` local plugin, user
   scope, behind its tier-3 consent line — not into the project's
   `.mcp.json`.
7. **D23, D25 and D27, in `stack-checks.md`.** The Addons check reads the
   base repo's stackgen lockfile (D25), and reads every owner from it (D23):
   forward — a slug in `addons:` with no lockfile item owned by
   `addon/<slug>`, or whose owned servers are missing from the `vwf-tools`
   manifest, or whose owned bootstrap plugin is not installed, is drift;
   reverse — any lockfile item (server, skill entry, bootstrap plugin) owned by
   `addon/<slug>` whose slug is not in `addons:` is drift. A
   `~/.claude/plugins/local/stackgen-lsp/` directory stays drift until the
   migration is accepted (D27). Rename the check from **Tools** to **Addons**
   in edits 3 and 4.
8. **Axis counts (D6).** Every "seven stack axes" count becomes eight, the
   `addon` axis named:
   `plugins/vwf/skills/doctor/references/stack-checks.md:167,386`,
   `plugins/vwf/skills/doctor/SKILL.md:168`,
   `plugins/vwf/assets/stack-vocabulary.md:74,97`.
9. **Owners and claims (D23, D30).** In edit 7, the lockfile owners are
   lists — a server is `{name, packs: [...]}`, and a `bootstrap.plugins` map
   entry lists its owners in `components: [...]`; an item is owned by an addon
   when that list holds `addon/<slug>`. A key in the `vwf-tools` manifest that
   `~/.claude/plugins/local/vwf-tools/.claude-plugin/claims.json` lists for no
   repo is drift.

## Verification

- Every unit-gate line: `mise x -- mise run code:format` — green.
- `grep -rn 'preselect'
  plugins/vwf/skills/architecture/references/stack-menu.md`
  finds the tools round's "nothing preselected" rule.
- `grep -rn 'vwf-tools' plugins/vwf/skills/doctor/references/stack-checks.md`
  finds the Addons check.

## Guardrails

- Do not touch `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/skills/setup/**`
  or the vwf manifest (U4), any stackgen file (U1, U2, U3), or any doc (U6).
- `plugins/**/*.md` is not formatted — match the fold width by hand; keep each
  code span on one line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf architecture tools round and doctor tools drift check`
