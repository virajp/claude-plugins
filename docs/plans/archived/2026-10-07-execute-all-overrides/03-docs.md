# U3 — Docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `CLAUDE.md`, `readme.md`, `.claude/skills/vwf-plugin/**`,
  `.claude/docs/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-07-execute-all-overrides.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal and Assumed decisions.

## Ruling

> **Goal.** `/vwf:execute all` asks its run-level questions once, before the
> first plan, and applies each answer as an override of the plans' steps for
> that run only.

> - Decision O1: Four questions — one shared worktree; deduped after-landing
>   steps; one release at the end; landing for each plan recorded `no`.

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U2 returned — chiefly the `/vwf:execute` section of
   `site/src/content/docs/plugins/vwf.md` and
   `site/src/content/docs/how-to/operate/ad-hoc-change.md`.
2. Write `docs/memory/decisions/2026-10-07-execute-all-overrides.md` per
   `plugins/vwf/assets/memory.md`: O1–O6 with their rejected alternatives.

## Verification

- The full wave gate, including `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit under `plugins/`; a falsified passage there is a `GAP:`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: /vwf:execute all's run-level questions — the manual follows`
