# U3 — Add-on packs, design-tool packs, the design-tool MCP guard, pack versions and the inventory

- **Read first:** every owned file that exists, top to bottom, and
  `plugins/stackgen/stacks/capability-provider/notion/**` in full, before
  editing.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` (read only, U1 owns
  it), any existing `plugins/stackgen/stacks/bundles/*.md` as a shape sample,
  `plugins/stackgen/stacks/design-tool/claude-code/conventions.md` for the
  `## Claude plugins` shape.

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
> - D10: It halts as today, with the new remedy: add taste-skill through
>   /vwf:architecture's tools menu, run /vwf:setup, restart. The tools menu says
>   that the claude-code design tool needs it. The three import skills do not
>   need taste-skill and keep working.
> - D11: Through the bootstrap handoff, as today: the addon/taste-skill pack
>   carries the ## Claude plugins section, and the materializer hands it to
>   bootstrap through docs/sync/vwf.md. vwf-tools holds servers only.
> - D15: The command vwf's manifest declares today, unchanged, moved under
>   user_mcp_servers: context7 in the context7 addon pack. The literal entry is
>   the fenced YAML block in U3's edit 4.
> - D16: No. They are hints with no call and no halt; they stay. A sweep is
>   parked.
> - D17: U3, as its last step, with mise x -- mise run p:plugins:inventory: the
>   pre-commit inventory hook needs each new or moved pack, its bundle, its
>   pack.yaml version, kinds.md and inventory.md in one commit. U3 also bumps
>   the versions of the packs it changes. This is the one generator a non-gates
>   unit runs.
> - D20: Inside vwf-tools, Claude names the server tools
>   mcp__plugin_vwf-tools_claude-design__<op>; canvas-push.md and every
>   claude-design skill state that form. U3 widens the guard in
>   scripts/src/check.ts (:2326-2343) to match mcp__plugin_vwf-tools_<token>__
>   beside the forms it matches today, drops the .mcp.json wording of its
>   comment at :2335, and adds a case for the new form to
>   scripts/src/check.test.ts.
> - D28: Yes. U3 points the guard in scripts/src/check.ts (:2226-2281) also at
>   every pack's user_mcp_servers: stdio entries — every runner behind a
>   ${VAR:-default} expansion — keeps the manifest path, and adds one test case
>   in scripts/src/check.test.ts.

## Edits

All paths below are under `plugins/stackgen/`.

1. **`assets/kinds.md`** — add a level-two heading in the existing shape — the
   kind name
   addon in backticks, an em dash, then "an optional tool the user picks" —
   after the
   `stylesheet` section, with a short section in the file's voice: an `addon`
   pack lands no repo file of its own beyond its skills; it declares
   `user_mcp_servers:` (landed in `vwf-tools`) or a `## Claude plugins`
   section (handed to bootstrap); it is never a default; it is picked on the
   tools round and recorded in `.config/vwf.yaml`'s `addons:`. Give it the
   same sub-sections the neighbouring kinds give (its topic bar), kept short.
   At `:69`, `:132` and `:598`, "Context7's at use time" stays (D16).
2. **`assets/taxonomy.md`** — `:108,143,150-154`: the `workspace` category
   is now served by the `addon/notion` pack; say that an `addon` pack realizes
   no capability token.
3. **`assets/contracts/workspace.md`** — where it says the server lands in
   the repo's `.mcp.json`, say it lands in `vwf-tools`, user scope, and that
   each person picks it.
4. **`stacks/addon/context7/`** — new: `pack.yaml` (name `Context7`, a
   one-sentence summary, `version: 1.0.0`, `type: addon`, `kind: addon`,
   `axis: addon`, `harness: n/a` in the shape other packs use for none, and
   `user_mcp_servers:` with the D15 entry, exactly this YAML) and
   `conventions.md` (what it serves — current library docs to the agent and
   to the stackgen generator, which halts when no Context7 is reachable; that
   the runner variable overrides `pnpm dlx` and the API key variable is
   optional; that node and pnpm must be on `PATH`).

   ```yaml
   user_mcp_servers:
     context7:
       command: sh
       args:
         - -c
         - "${CONTEXT7_RUNNER:-pnpm dlx} @upstash/context7-mcp"
       env:
         CONTEXT7_API_KEY: "${CONTEXT7_API_KEY:-}"
   ```
5. **`stacks/addon/notion/`** — move every file of
   `stacks/capability-provider/notion/` here byte for byte (write the new
   files, then `rm -r` the old directory). Then: `pack.yaml` `type: addon`,
   `kind: addon`, `axis: addon`, keep `category: workspace` and the
   `capability` comment, `version: 1.0.0`, and rename `mcp_servers:` to
   `user_mcp_servers:` with the same entry. `conventions.md` and the skill's
   references (`access-shape.md:21-24` among them): the server lands in
   `vwf-tools` at user scope, not in `.mcp.json`; the skill's `paths:`
   frontmatter no longer names `**/.mcp.json` — give it no `paths:` key and
   let its description trigger it.
6. **`stacks/addon/taste-skill/`** — new: `pack.yaml` (name `taste-skill`,
   summary, `version: 1.0.0`, `type: addon`, `kind: addon`, `axis: addon`,
   `harness: n/a`) and `conventions.md` whose `## Claude plugins` section is
   the line moved from claude-code: `taste-skill@taste-skill` — marketplace
   `Leonxlnx/taste-skill`, user scope. Say that the claude-code design tool's
   `design-session` needs it.
7. **`stacks/bundles/context7.md`, `notion.md`, `taste-skill.md`** — one
   bundle each, `axis: addon`, `kind: addon`, no `default:` key, components
   `addon/<slug>@1.0.0`, a short body. `notion.md` replaces the old body's
   `.mcp.json` sentences with `vwf-tools`.
8. **`stacks/design-tool/claude-code/`** — remove the `## Claude plugins`
   section from `conventions.md` (`:92-94`); rewrite `:68-76` and its halt
   sentence to the D10 remedy:

   > `taste-skill` is not installed. Add `taste-skill` in `/vwf:architecture`'s
   > tools menu, run `/vwf:setup`, then restart the session.

   Use the same sentence in
   `stacks/design-tool/claude-code/skills/design-session/SKILL.md:64-69` and
   `:267`. `bundles/claude-code.md:22-25` says the design tool needs the
   taste-skill tool, picked on the tools round. Bump `pack.yaml` to `2.0.0`
   and the pin in `bundles/claude-code.md` to match.
9. **`stacks/design-tool/claude-design/`** — `pack.yaml`: rename
   `mcp_servers:` to `user_mcp_servers:`, same entry, and fix its comment to
   "landed in vwf-tools behind tier-3 consent"; any skill or conventions
   passage that says `.mcp.json` says `vwf-tools`;
   `bundles/claude-design.md:13-14`
   likewise. Bump `pack.yaml` to `1.0.0` and the pin in
   `bundles/claude-design.md` to match. Per D20, every claude-design skill
   and reference that names the server's tools —
   `skills/design-import-screens/references/canvas-push.md:28-32`
   among them — states the plugin-scoped form
   `mcp__plugin_vwf-tools_claude-design__<op>`.
10. **`scripts/src/check.ts`** and **`scripts/src/check.test.ts`** (D20) —
    the design-tool MCP guard (`:2326-2343`) also matches
    `mcp__plugin_vwf-tools_<token>__`, beside the forms it matches today; its
    comment at `:2335` says the servers land in `vwf-tools`, not `.mcp.json`.
    Add one test case for the new form, in the shape of the existing cases
    (`check.test.ts:1758-1771`). Run `mise x -- pnpm vitest run
    scripts/src/check.test.ts`.
11. **`scripts/src/check.ts`** (D28) — the stdio runner guard
    (`:2226-2281`) also walks every
    `plugins/stackgen/stacks/**/pack.yaml` and applies the same rule to each
    `user_mcp_servers:` entry whose `command` is a stdio runner; the manifest
    path stays. Add one passing case (the context7 pack shape) and one failing
    case (a bare `pnpm dlx` runner) to `scripts/src/check.test.ts`.
12. **Last:** `mise x -- mise run p:plugins:inventory` — regenerate
    `stacks/inventory.md`. Keep what it writes.

## Verification

- Every unit-gate line: `mise x -- mise run code:format` — green.
- `mise x -- mise run p:plugins:inventory -- --check` — green.
- `mise x -- mise run p:plugins:check` — green.
- `mise x -- pnpm vitest run scripts/src/check.test.ts` — green.
- `test ! -e plugins/stackgen/stacks/capability-provider/notion` — true.
- `grep -rnE '(^|[^_])mcp_servers:' plugins/stackgen/stacks` prints nothing.
- `grep -rn "installs .taste-skill"
  plugins/stackgen/stacks/design-tool/claude-code`
  prints nothing (the `node` lines that name `mise run setup` stay).

## Guardrails

- Do not touch `plugins/stackgen/stacks/readme.md` (U6), `pack-format.md` or
  any other asset U1 owns, `generator.md` or the menu (U2), any other pack,
  or any other bundle.
- Every number you write skips 13 and 17.
- `plugins/stackgen/stacks/*/*/config/` is payload — these packs have none; do
  not create one.
- Strict-YAML frontmatter stays valid; `plugins/**/*.md` is not formatted —
  match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen addon pack for context7, notion and taste-skill`
