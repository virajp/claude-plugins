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

> **Goal.** After a `/vwf:execute` run, the renders of the built app from its UX
> stage are kept in `docs/scratchpad/<project>/renders/<platform>/<route>/` of
> the main checkout. `/vwf:mockups renders` serves them at a local URL for each
> platform, together with the mockups, and the comments go to `/vwf:feedback`.
> Execute stays unattended: it asks nothing, and its final report names the
> review command.

> - Decision E3: The `ux-gate` return can carry an optional `renders:` list, one
>   item for each image: `{ code, platform, state, file }`.
> - Decision E7: On `mobile`, `watch` and `auto`, the render server shows the
>   mockup and the render side by side.
> - Decision E8: On `site`, `webapp`, `tablet`, `desktop`, `tv` and `spatial`,
>   the mockup server and the render server run on two ports with the same
>   routes, linked by a new-window link.
> - Decision E10: Render comments go to `/vwf:feedback` as UX issues, one at a
>   time.

No reversal, so no decision doc.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U4 returned.
2. Reconcile the passages index.md's Facts list names:
   `site/src/content/docs/plugins/vwf.md` (`:2544`, `:2632`, `:2715`, `:3587`,
   and the `/vwf:mockups` section for the `renders` mode);
   `site/src/content/docs/how-to/greenfield/ui-with-design-tool.md:221-234`;
   `.claude/skills/vwf-plugin/references/assets.md:25`;
   `.claude/skills/vwf-plugin/references/skills-and-agents.md:74`. Each says
   that the UX stage keeps the renders of the built app, that
   `/vwf:mockups renders` serves them, and how the two views differ by platform.
3. **`site/src/content/docs/plugins/vwf.md:2635`** — replace "Flutter a
   code-level pass" with what is true: the Flutter gate runs golden tests and
   its accessibility checks (parked by plan 1 for this plan).

## Verification

- The full wave gate, including `mise run p:site:check` (links) and
  `mise run code:precommit`.
- `grep -n 'code-level pass' site/src/content/docs/plugins/vwf.md` — no hit that
  names Flutter.

## Guardrails

- Never edit under `plugins/` — U1–U4 own it; a falsified passage there is a
  `GAP:`.
- Leave the parked `.gitignore` claim in `docs-tree.md:71-75` alone.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: execute renders served at a URL — the manual and repo docs follow`
