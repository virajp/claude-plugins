# U2 — Generator halt remedy, tools menu payload, reputation and reviewer wording

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/architecture/references/stack-menu.md`
  (read only — the consumer of the menu payload).

## Ruling

> - D1: A tools menu with one multi-select list of optional tools and no item
>   preselected. Only the tools the user picks are installed. The pick is
>   recorded in addons:; a re-run shows the current pick and asks only whether
>   to change it.
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
> - D9: The generator halts only when no Context7 server is reachable from any
>   source (the context7 addon in vwf-tools, a user-level MCP, another plugin),
>   keeping the rule never to write from training knowledge, and says: add
>   context7 through /vwf:architecture's tools menu, run /vwf:setup, restart the
>   session. The menu text says that generation needs context7. A duplicate
>   registration is the user's choice; the plan says nothing about it.
> - D10: It halts as today, with the new remedy: add taste-skill through
>   /vwf:architecture's tools menu, run /vwf:setup, restart. The tools menu says
>   that the claude-code design tool needs it. The three import skills do not
>   need taste-skill and keep working.

## Edits

All paths below are under `plugins/stackgen/`.

1. **`skills/stackgen-stack-template/references/generator.md`** — the
   precondition (`:19-23`) reads: Context7 must be reachable from some source
   — the `context7` addon in `vwf-tools`, a user-level MCP server, another
   plugin; when none is reachable, generation halts with exactly this sentence:

   > Generation needs the context7 tool. Add `context7` in `/vwf:architecture`'s
   > tools menu, run `/vwf:setup`, then restart the session.

   Keep the rule that no artifact is written from training knowledge, and keep
   `:24-27` as it is. `:31` and `:155` keep "on the same terms as Context7".
   At `:97-108`, the server fields a generated component may declare are
   `user_mcp_servers:` and `lsp_servers:` only; remove `mcp_servers:` from
   both lists.
2. **`skills/stackgen-stack-menu/SKILL.md`** — the menu returns an `addon`
   round beside the other axes: every bundle of axis `addon`, each with its
   slug, name and summary, **none marked default**, multi-select, and the
   open "generate" entry is not offered on this round. Each entry carries a
   `needed_by` note when a shipped pack needs it: `context7` → "the stackgen
   generator (any uncovered component)", `taste-skill` → "the claude-code
   design tool's design-session". Replace the text at `:64-67` with the D9
   sentence's substance: generation needs the context7 tool, picked on the
   tools round. Where the skill states that `default: true` is copied
   through, say that the `addon` axis never carries one.
3. **`skills/stackgen-reputation/SKILL.md`** — `:156` borrows "the
   generator's Context7 precondition"; keep the borrow and add that the
   precondition is met when a Context7 server is reachable from any source (D9).
4. **`agents/stackgen-skill-reviewer.md`** — `:65` and `:103`: the payload
   fields are `user_mcp_servers:` and `lsp_servers:`; remove `mcp_servers:`.
   `:55` stays.

## Verification

- Every unit-gate line: `mise x -- mise run code:format` — green.
- `grep -nE '(^|[^_])mcp_servers' <each owned file>` prints nothing.
- `grep -n 'tools menu' references/generator.md` finds the halt sentence.

## Guardrails

- Do not touch `local-plugin.md`, `materializer.md`, `SKILL.md` of
  `stackgen-stack-template`, or the assets (U1); the packs (U3); vwf (U4, U5).
- `plugins/**/*.md` is not formatted by dprint — match the fold width by hand;
  keep each code span on one line; strict-YAML frontmatter stays valid.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen tools round in the menu and context7 halt remedy`
