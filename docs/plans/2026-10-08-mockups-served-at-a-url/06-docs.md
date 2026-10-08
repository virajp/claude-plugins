# U5 — Docs

- **Wave:** 3
- **Depends on:** U1, U2, U3, U4
- **Owns:** `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`,
  `readme.md`, `CLAUDE.md`,
  `docs/memory/decisions/2026-10-08-mockups-on-production-routes.md` (new), and
  any other human-facing passage `vwf:docs-sync` finds outside `plugins/`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal (with its Reversals), Facts and Assumed
  decisions; then each owned passage before editing it.

## Ruling

> **Goal.** After `/vwf:mockups` or the `/vwf:blueprint` §6a screen review, the
> user opens one `http://127.0.0.1:<port>/` URL for each platform. The mockups
> use the production routes, the screens of all flows are connected, and every
> link works. A link check passes before the user is asked to validate. Each
> screen has a comment overlay; the comments return to the session as proposals
> that the user confirms one at a time.

> - Decision D3: One server for each platform, with all flows. The root is
>   `docs/scratchpad/<project>/<platform>/`.
> - Decision D4: A screen with the route `/a/b` is the file
>   `<root>/a/b/index.html`. `GET /` serves the app's `/` screen.
>   `GET /__mockups/` is a list of every flow, screen and state.
> - Decision D5: A state is the URL `<route>?state=<state>`.
> - Decision D7: A screen with no route gets the route `/<code>-<slug>`.
> - Decision D12: If links are still broken after 2 rounds, the skill gives no
>   URL and asks for no review.
> - Decision D15: Comments are appended to `<root>/__mockups/comments.yaml`.
> - Decision D17: When `node` is not on the path, the skill renders nothing and
>   stops; the remedy is `MISE_ENV=dev mise run setup:all`.
> - Decision D18: The old `docs/scratchpad/<project>/<NNN>-<flow>/` directories
>   are not read; the user can delete them.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U4 returned.
2. Reconcile the passages index.md's Facts list names:
   `site/src/content/docs/plugins/vwf.md` (`:327`, `:855`, `:2128-2131`,
   `:2183-2211`);
   `site/src/content/docs/how-to/greenfield/single-repo.md:273-274`;
   `site/src/content/docs/how-to/greenfield/ui-with-design-tool.md:198-212`;
   `.claude/skills/vwf-plugin/references/docs-tree.md:71-75` (the path and
   viewing text only);
   `.claude/skills/vwf-plugin/references/skills-and-agents.md:33`, `:68`. Each
   says the mockups are a connected site on the production routes, one local URL
   for each platform, with a link check before the review, a state switcher, a
   `/__mockups/` list and comments; and that `node` is necessary. The
   `/vwf:mockups` section of `vwf.md` also says that the old per-flow
   directories can be deleted (D18).
3. Write `docs/memory/decisions/2026-10-08-mockups-on-production-routes.md`, in
   the shape of the other files in that directory: the decision (D3-D5, D7, D12,
   D17), the reason (the mockups showed one screen and their other links were
   broken; the generator invented each link and nothing examined them), and the
   rejected alternatives from index.md's decisions table.

## Verification

- The full wave gate, including `mise run p:site:check` (links) and
  `mise run code:precommit` (dprint re-pads tables in `CLAUDE.md`, `readme.md`
  and `site/**`).
- `grep -rn '<NNN>-<flow>/<platform>/' site/src/content/docs .claude/skills/vwf-plugin`
  — no hit outside a `flows_rendered` key or the D18 sentence.
- `grep -rn 'open them in your browser\|open directly in your browser' site/src/content/docs .claude/skills/vwf-plugin`
  — no hit.

## Guardrails

- Never edit under `plugins/` — U1–U4 own it; a falsified passage there is a
  `GAP:`.
- Leave the parked items alone: the `.gitignore` claim in `docs-tree.md:71-75`
  and `vwf.md:2635`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: mockups on production routes — the manual and repo docs follow`
