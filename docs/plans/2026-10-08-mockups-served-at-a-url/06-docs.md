# U5 — Docs

- **Wave:** 3
- **Depends on:** U1, U2, U3, U4
- **Owns:** `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`,
  `readme.md`, `CLAUDE.md`, and any other human-facing passage `vwf:docs-sync`
  finds outside `plugins/`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then each owned
  passage before editing it.

## Ruling

> **Goal.** `/vwf:mockups` and the `/vwf:blueprint` §6a screen review give the
> user a local `http://127.0.0.1:<port>/` URL for each flow, not a list of file
> paths. The page is an index of every platform and screen of the flow, with a
> comment overlay on each screen; the comments return to the session as
> proposals the user confirms one at a time. When `node` is absent, the skills
> fall back to the file paths of today.

> - Decision D5: Comments are appended to
>   `docs/scratchpad/<project>/<NNN>-<flow>/comments.yaml`.
> - Decision D7: When `node` is not on the path, the skill says so with the
>   remedy `MISE_ENV=dev mise run setup:all` and hands over the absolute file
>   paths as today.

No reversal, so no decision doc.

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
   says the mockups are served at a local URL with comments, and that file paths
   are the fallback without `node`.

## Verification

- The full wave gate, including `mise run p:site:check` (links) and
  `mise run code:precommit` (dprint re-pads tables in `CLAUDE.md`, `readme.md`
  and `site/**`).
- `grep -rn 'open them in your browser\|open directly in your browser' site/src/content/docs .claude/skills/vwf-plugin`
  — no hit outside a `node` fallback sentence.

## Guardrails

- Never edit under `plugins/` — U1–U4 own it; a falsified passage there is a
  `GAP:`.
- Leave the parked items alone: the `.gitignore` claim in `docs-tree.md:71-75`
  and `vwf.md:2635`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: mockups served at a URL — the manual and repo docs follow`
