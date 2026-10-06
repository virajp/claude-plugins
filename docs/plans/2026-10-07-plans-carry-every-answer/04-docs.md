# U4 — Docs

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `CLAUDE.md`, `readme.md`, `.claude/skills/vwf-plugin/**`,
  `.claude/skills/release/SKILL.md`, `.claude/docs/ci-and-releases.md`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-07-plans-carry-every-answer.md` (new), and any
  other human-facing passage `vwf:docs-sync` finds outside `plugins/`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then each owned
  passage before editing it.

## Ruling

> **Goal.** `/vwf:plan` and `/vwf:change-plan` record an answer to every
> question a run could raise, and `/vwf:execute` asks nothing at run time — it
> follows the plan, and only runtime stops end a run, each reported with its
> resume command.

> - Decision D1: Every after-landing step is `run` or dropped; the `ask` mode is
>   retired.
> - Decision D2: A failed landing condition, the open gaps and a now-runnable
>   dependent plan are reported and the run stops; a fix goes into the folder
>   and the person re-runs `/vwf:execute <folder>`.
> - Decision D4: No after-landing step runs on an unmerged branch; the report
>   lists each step with its command.
> - Decision D8: On an archive completion warning the folder stays live, the row
>   is `COMPLETE`, and the report names the warning.

Both reversals in index.md's Goal are confirmed and land here as one decision
doc.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U3 returned.
2. Reconcile every passage index.md's Facts list under "The `ask` mode" names
   outside `plugins/` — `CLAUDE.md:61-62` and `:333-335` ("asked for once when
   it records `ask`" goes); `CLAUDE.md:5-8` stays (the `run` exception is still
   true); `readme.md`; `.claude/skills/vwf-plugin/SKILL.md:84`;
   `.claude/skills/vwf-plugin/references/skills-and-agents.md:36`, `:46`;
   `.claude/skills/release/SKILL.md:55`; `.claude/docs/ci-and-releases.md:98`;
   `site/src/content/docs/plugins/vwf.md` (`:2340-2343`, `:2694-2698`,
   `:3101-3104`, `:3116`, `:3502`, and the `/vwf:execute` section from `:2389` —
   where it describes Fix first / Reject, gap offers or the chain-forward
   offer); `site/src/content/docs/how-to/operate/ad-hoc-change.md` (`:121-123`,
   `:130-132`, `:247-253`, `:305`).
3. Write `docs/memory/decisions/2026-10-07-plans-carry-every-answer.md` per
   `plugins/vwf/assets/memory.md`: the two reversals (2026-09-17 ruling 8
   retired; the post-run dialogue becomes a report), D3–D9 as rulings with their
   rejected alternatives, and a pointer that ruling 9 of 2026-09-17 stands.

## Verification

- The full wave gate, including `mise run p:site:check` (links) and
  `mise run code:precommit` (dprint re-pads tables in `CLAUDE.md`, `readme.md`
  and `site/**`).
- `grep -rnE 'ask step|run / ask|recorded .ask.|stops once before' CLAUDE.md readme.md .claude site/src/content/docs`
  returns nothing about after-landing steps.

## Guardrails

- Never edit under `plugins/` — U1–U3 own it; a falsified passage there is a
  `GAP:`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: plans carry every answer — the manual, readme and repo docs follow`
