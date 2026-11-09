# U1 — Remove the three packs and the workspace category

- **Read first:** every owned file that survives, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` (pack and bundle
  shape), `plugins/stackgen/assets/kinds.md` (the kinds; owned by U2, read only).

## Ruling

> D3: The user. User's words: 'I want the ownership of install mcp servers to
> move to user and not this plugin. Wherever the mcp servers are required, AI
> agent should simply ask the user to install them.'

> D10: Delete both [the workspace category and `contracts/workspace.md`]. The
> bundle kind workspace (bun and pnpm workspaces) is a different thing and
> stays.

> D13: Reword it to compare with claude-code. The stitch pack version moves
> 0.1.0 to 0.1.1, with the pin in bundles/stitch.md, per the rule that a plan
> which edits a pack bumps it.

> D16: U1 runs `mise x -- mise run p:plugins:inventory` as its last step and
> keeps the output in its own commit.

## Edits

1. **Delete** with `rm -r`: `plugins/stackgen/stacks/addon/context7/`,
   `plugins/stackgen/stacks/addon/notion/`,
   `plugins/stackgen/stacks/design-tool/claude-design/`.
2. **Delete** with `rm`: `plugins/stackgen/stacks/bundles/context7.md`,
   `bundles/notion.md`, `bundles/claude-design.md`,
   `plugins/stackgen/assets/contracts/workspace.md`.
3. **`plugins/stackgen/stacks/design-tool/stitch/skills/design-import-design-system/SKILL.md`**
   — line 24 compares Stitch to Claude Design. Compare to `claude-code`
   instead (the design tool whose canvas is a committed directory and that
   stores a design system), keeping the point the sentence makes.
4. **`plugins/stackgen/stacks/design-tool/stitch/pack.yaml`** — `version: 0.1.0`
   → `0.1.1`. **`plugins/stackgen/stacks/bundles/stitch.md`** — the pin
   `design-tool/stitch@0.1.0` → `@0.1.1`.
5. **`plugins/stackgen/stacks/readme.md`** — `:195` lists the Wave D design
   tools: drop `claude-design`, keep the history sentence true (say it was
   removed on 2026-11-09). `:211-213` says `claude-design` declares a
   `user_mcp_servers:` entry: rewrite to say that no pack declares an MCP
   server; a pack that needs one names it in a `## MCP servers` section of its
   `conventions.md`, and the agent asks the user to install it. `:258-264` lists
   the optional tools: `taste-skill` alone. `:269-282` (the Workspace section):
   delete. `:44`, `:98` are passive Context7 hints — leave them (plan 2).
6. **`plugins/stackgen/assets/taxonomy.md`** — `:113-116`: `addon` has no
   category now; keep the sentence that `taste-skill` leaves `category` unset,
   and drop `workspace`, `addon/notion` and `addon/context7` (use
   `addon/taste-skill` as the example). Delete the `workspace` category passages
   at `:149`, `:156-161` and `:250-254`, and any line that cites
   `contracts/workspace.md`. Keep every passage about the bundle kind
   `workspace`.
7. **Last step:** run `mise x -- mise run p:plugins:inventory`, which rewrites
   `plugins/stackgen/stacks/inventory.md` (totals become 73 packs and 66
   bundles, or whatever the generator prints). Keep its output; do not edit the
   file by hand.

## Verification

- `mise x -- mise run p:plugins:inventory -- --check` exits 0.
- `command grep -rn -i -E 'claude-design|context7|notion|contracts/workspace' plugins/stackgen/stacks/readme.md plugins/stackgen/assets/taxonomy.md plugins/stackgen/stacks/design-tool/stitch plugins/stackgen/stacks/bundles`
  prints only the passive hints at `readme.md:44,98` and the removal history
  sentence.
- `ls plugins/stackgen/stacks/addon` prints `taste-skill` alone.

## Guardrails

- Do not touch `plugins/stackgen/assets/kinds.md` or `pack-format.md` (U2).
- Do not touch the 142 passive Context7 hints in other packs (plan 2).
- `plugins/**/*.md` is not formatted by dprint: match the surrounding fold
  width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: remove the context7, notion and claude-design packs`

> D28: Before it returns, each edit unit runs
> `mise x -- mise run code:format -- --fix <each file it changed>`, on its own
> changed files only, never the whole tree. The unit gate then only checks.

> D33: U1 adds a ## MCP servers section (D4) to the conventions.md of the
> lovable and stitch packs: the server name, its purpose and its official
> install page, read from the pack own skills and references. Their skills that
> reach the server ask the user to install it when it is missing and wait. Each
> pack gets one patch bump and a new bundle pin (stitch is bumped once in total,
> D13).

Edit 8: **lovable and stitch** — per D33: `plugins/stackgen/stacks/design-tool/lovable/conventions.md`
and `stitch/conventions.md` gain the section; the skills that reach the server
(`lovable/skills/design-import-design-system/SKILL.md:24`,
`lovable/skills/design-import-screens/SKILL.md:20`,
`stitch/skills/design-import-screens/SKILL.md:25` and any sibling) ask the user
to install it when it is missing. `lovable/pack.yaml` `0.1.0` → `0.1.1` and its
pin in `bundles/lovable.md`. Run the inventory generator after this edit.

> D4: A ## MCP servers section in the pack conventions.md. One line per server:
> its name, what it is for, and its official install page. It is not handed to
> bootstrap. When a skill needs the server and it is not available, the agent
> asks the user to install it and waits.

> D38 (gap 6): U1 writes the D4 bullet format —
> `` `<name>` — <what it is for>; install: <official URL> `` — as a new last
> section of each conventions.md, since neither has a ## Claude plugins section.

> D40: Both packs [lovable, stitch] get a line. U1 takes each server name and
> install page from the vendor official documentation, fetches the page live,
> and cites the URL and date in its report; with no official page it returns a
> question. A server a pack does not require carries the marker (optional)
> after its name; the Stitch line is optional, because Stitch works through its
> SDK. The D4 format gains that marker (U2, pack-format.md), the lockfile
> record of D39 carries optional: true (U2), and doctor never reports an
> optional server as drift (U3).
