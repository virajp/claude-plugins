# U5 — Docs

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `CLAUDE.md`, `readme.md`, `.claude/skills/vwf-plugin/**`,
  `.claude/docs/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-07-execute-all.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions.

## Ruling

> **Goal.** Typing `/vwf:execute all` once runs every runnable plan, highest
> priority first, each in its own runner subagent; the loop stops at the first
> point that needs the user; the session keeps only a one-line result per plan.

> - Decision E1: the runner is the agent `execute-runner`.
> - Decision E3: Any runtime stop — the runner stops; the loop ends, printing
>   its table and the resume command.
> - Decision E4: a plan whose Consent row "End an `all` run after landing" reads
>   `yes` ends the run after it.

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U4 returned.
2. Reconcile the docs index.md's Facts list: `/vwf:execute all` beside
   `<folder>` and `next`; the reversal's wording; `execute-runner` in
   `.claude/skills/vwf-plugin/references/skills-and-agents.md`'s agent table.
3. Write `docs/memory/decisions/2026-10-07-execute-all.md` per
   `plugins/vwf/assets/memory.md`: the reversal and E1–E7 with their rejected
   alternatives.

## Verification

- The full wave gate, including `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit under `plugins/`; a falsified passage there is a `GAP:`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: /vwf:execute all — the manual, readme and repo docs follow`
