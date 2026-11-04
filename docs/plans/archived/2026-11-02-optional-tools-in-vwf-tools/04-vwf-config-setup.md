# U4 — vwf drops Context7, gains addons:, migrates to config_format 25

- **Read first:** every owned file, top to bottom, before editing —
  `plugins/vwf/skills/setup/SKILL.md` and
  `references/{format-lineage,migrate-pipeline,materialize,migration-and-consent}.md`
  first.
- **Lazy-load:** the other files under `plugins/vwf/skills/setup/references/`.

## Ruling

> - D7: A top-level addons: list in .config/vwf.yaml, one per product, for
>   example addons: [context7, notion]. Absent or empty means no optional tool.
>   The name addons: keeps it apart from the existing repo.stack.tools key; the
>   menu is still shown to the user as optional tools.
> - D8: /vwf:architecture shows the tools menu after the stack menu and writes
>   addons:. /vwf:setup materializes each picked tool on every run and removes a
>   dropped one.
> - D12: Keep what the repo has: migrate writes into addons: each tool the repo
>   already records (notion from backing_template or the lockfile's mcp_servers,
>   taste-skill from the lockfile's bootstrap block; claude-design moves to
>   vwf-tools with its pack). For context7, which every vwf user had, it asks
>   one yes/no question. It renames the lockfile's local_plugin block from
>   stackgen-lsp to vwf-tools and moves the recorded .mcp.json entries to
>   vwf-tools, behind consent.
> - D14: Yes, to 25: the migration moves notion out of
>   projects.<name>.stack.backing_template into addons:, which is not additive.
>   The format-lineage row for 25 names the move, the addons: key and the
>   context7 question.
> - D15: The command vwf's manifest declares today, unchanged, moved under
>   user_mcp_servers: context7 in the context7 addon pack. The literal entry is
>   the fenced YAML block in U3's edit 4.
> - D21: Either source: notion is added to addons: when any
>   projects.<name>.stack.backing_template list names the slug notion, or any
>   repo's stackgen lockfile in the product records the
>   capability-provider/notion pack or its .mcp.json server.
> - D24: No. addons: is always a list, [] when none; it never holds unresolved,
>   and doctor never reports [] as a pending decision.
> - D25: The base repo only. Its stackgen lockfile records the addon claims, and
>   doctor reads the base repo's lockfile for the addons check. Members get no
>   addon skill files; the servers are user scope anyway.
> - D6: Each optional tool is a pack and a bundle of a new type, kind and axis
>   named addon, with no default: true: plugins/stackgen/stacks/addon/context7
>   (user_mcp_servers:), addon/notion (moved from capability-provider/notion,
>   its skill and its server), addon/taste-skill (a ## Claude plugins section).
>   The tools menu lists the bundles of the addon axis. assets/kinds.md gains an
>   addon kind. The name addon keeps the axis apart from the existing phrase
>   'the three tool axes' (design, cicd, stylesheet), which stays as it is.
>   addon counts as an axis: every 'seven axes' count becomes eight.
> - D29: The migration reads the stackgen lockfiles of every repo of the product
>   that is cloned locally (base and members) for notion and taste-skill (D12,
>   D21); a member not cloned locally is skipped with a one-line warning. A
>   member repo's old items (the notion skill files, its .mcp.json entry) are
>   removed by that member's own sync, behind consent; the relocation table
>   applies in the base repo only. A bootstrap plugin that another repo of the
>   product claims through an addon pack (taste-skill through the base repo's
>   addon/taste-skill) is never removed by a member's handoff removal.
> - D31: U4 adds to the menu-payload contract (stack-adapter.md:175-188) the
>   addon round's shape: product-level, multi-select, no default, no generate
>   entry, no defer, and an optional needed_by string on each entry naming the
>   shipped pack that needs it.

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — remove the whole
   `mcpServers` key. Change nothing else; the version is the release task's.
2. **`plugins/vwf/assets/vwf-config.md`** — the schema heading and sample
   move to `config_format 25`. Add a top-level `addons:` key in the sample with
   a comment in the file's voice: the optional tools the product picked, each
   a slug of the installed stack plugin's `addon` axis; written by
   `/vwf:architecture`'s tools round; materialized by `/vwf:setup` on every
   run; absent or `[]` means none; never preselected. The file names no notion
   today; at the
   `backing_template` key (`:86-88`) say that an `addon` slug never sits
   there. Every count of axes in the file (`:15` among them) becomes eight
   (D6). Add `addons:` to the Reading rules where the file
   lists each key's reader.
3. **`plugins/vwf/skills/setup/references/format-lineage.md`** — a row for
   25: adds `addons:` (always a list, `[]` when none, never `unresolved` —
   D24); removes a `notion` entry from every
   `projects.<name>.stack.backing_template` and adds `notion` to `addons:` when
   any `backing_template` list names the slug `notion` or any repo's stackgen
   lockfile in the product (D29) — of the repos cloned locally; a member not
   cloned is skipped with a one-line warning — records the
   `capability-provider/notion` pack or its `.mcp.json` server (D21); adds
   `taste-skill`
   to `addons:` when any repo's stackgen lockfile `bootstrap:` block records
   `taste-skill@taste-skill`; asks one yes/no question, "Keep the context7
   MCP server? vwf no longer installs it", adding `context7` on yes. 24 → 25
   is the only new step; 25 is issuable (not 13 or 17).
4. **`plugins/vwf/skills/setup/references/migrate-pipeline.md`** and
   **`migration-and-consent.md`** — the 24 → 25 step in the pipeline, with its
   one question and its consent line, in the shape the earlier steps use; the
   lockfile and `.mcp.json` half of D12 is stackgen's, run by the materialize
   pass that follows — say so, and do not restate it.
5. **`plugins/vwf/skills/setup/references/materialize.md`** and
   **`SKILL.md`** — the materialize pass reads `addons:` and fetches each slug
   as an `addon`-axis pin through the stack adapter, every run, like the other
   axes; a slug removed from `addons:` is removed through the adapter's removal
   path. Where `SKILL.md` lists what Step 0 or the spine stamps, name
   `config_format: 25`. Where it says a missing LSP plugin is not gating
   (`:285`), keep it.
6. **`plugins/vwf/assets/stack-adapter.md`** — the axis enum and every count
   of axes (`:15,183,280`, "the seven axes") gain `addon`; the fetch and
   removal contract names the `addon` axis: vwf passes each `addons:` slug as
   an `addon`-axis pin, product-level (not per project), and a slug dropped
   from `addons:` goes through the same removal call. The `addon` round offers
   no defer and never returns `unresolved` (D24). The phrase "the three tool
   axes" (`:230`) stays as it is. Add the `addon` round to the menu-payload
   contract (`:175-188`): product-level, multi-select, no default, no generate
   entry, no defer, and an optional `needed_by` string on each entry naming
   the shipped pack that needs it (D31).
7. **D25, in `materialize.md` and `stack-adapter.md`.** In a multi-repo
   product, the materialize pass passes `addons:` pins to the base repo only;
   members get none. In a single repo, the repo is the base.

## Verification

- Every unit-gate line: `mise x -- mise run code:format` — green.
- `node -e 'const
  m=require("./plugins/vwf/.claude-plugin/plugin.json");process.exit(m.mcpServers?1:0)'`
  exits 0.
- `grep -rn 'config_format: 25' plugins/vwf/assets/vwf-config.md` finds the
  sample.
- `grep -rn 'addons:' plugins/vwf/skills/setup` finds the materialize and the
  migration passages.

## Guardrails

- Do not touch `plugins/vwf/skills/architecture/**`, `doctor/**` or
  `assets/stack-vocabulary.md` (U5), any stackgen file (U1, U2, U3), or any
  doc (U6). Do not edit this repo's own `.config/vwf.yaml`.
- `plugins/**/*.md` is not formatted — match the fold width by hand; keep each
  code span on one line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf stops shipping Context7 and records optional tools`
