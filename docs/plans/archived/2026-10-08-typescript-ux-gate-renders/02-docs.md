# U2 — Docs

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/vwf-plugin/**`, `readme.md`, `CLAUDE.md`, and any other
  human-facing passage `vwf:docs-sync` finds outside `plugins/`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then each owned
  passage before editing it.

## Ruling

> **Goal.** The TypeScript `ux-gate` names each browser capture
> `<code>--<state>.png` and returns the `renders:` list that plan 2a defines, so
> `/vwf:execute` keeps the renders of the built app for each web project and
> `/vwf:mockups renders` serves them.

> - Decision F1: Only the TypeScript `ux-gate`. Flutter and SwiftUI return no
>   `renders:` list; B94 covers them.

No reversal, so no decision doc.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1 returned.
2. `site/src/content/docs/plugins/stackgen.md` — the TypeScript pack's `ux-gate`
   passage says the captures are kept and served after the run; the Flutter and
   SwiftUI passages say that their renders are not yet kept (B94). Where
   `site/src/content/docs/plugins/vwf.md` describes `/vwf:mockups renders`, say
   that only web projects have renders today.

## Verification

- The full wave gate, including `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit under `plugins/` — U1 and U3 own it; a falsified passage there is a
  `GAP:`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: typescript ux-gate renders — the manual follows`
