# U3 — Docs

- **Wave:** 3
- **Depends on:** U2
- **Owns:** `site/src/content/docs/plugins/vwf.md`,
  `.claude/skills/vwf-plugin/**`,
  `docs/memory/decisions/2026-10-21-execute-monitor-gap-fixes.md` (new), and any
  other human-facing passage `vwf:docs-sync` finds outside U1's Owns
- **Model:** opus
- **Kind:** edit
- **Read first:** `index.md` of this folder — the Goal, the facts and the
  decisions table.

## Ruling

> - Decision 10: The docs unit writes
>   `docs/memory/decisions/2026-10-21-execute-monitor-gap-fixes.md`; the dated
>   `2026-10-21-execute-monitor-inside-vwf.md` stays.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings, plus
   every `DOCS FALSIFIED:` line U1 returned.
2. **`docs/memory/decisions/2026-10-21-execute-monitor-gap-fixes.md`** — new,
   per `plugins/vwf/assets/memory.md`: decisions 1 to 7 of `index.md`, each with
   its rejected alternative, and that the plan closes the two gaps of
   `docs/plans/2026-10-21-execute-monitor-in-vwf`.
3. **`site/src/content/docs/plugins/vwf.md`** — in the progress-pane subsection
   of `/vwf:execute`: remove the edit-only limit (`:3077-3079`); say that the
   pane follows edit units, coders, review rows and wave reviews; add the
   wave-review lines to the description of the rows (`:3060-3065`); say when the
   run ends (the plan's Status, or 10 minutes after the run goes quiet); say
   that `/vwf-monitor` finds a plan in a member repo of a multi-repo product,
   and asks for a folder when several plans read `RUNNING`.
4. **`.claude/skills/vwf-plugin/SKILL.md:417-418`** — replace "follows only
   `vwf:execute-*` subagents, so an `edit`-only plan is not followed" with how
   the pane matches agents (decision 1).
5. Do not edit the dated decision docs or any plan folder under `docs/plans/`.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rn "edit-only\|follows only" site/src/content/docs/plugins/vwf.md .claude/skills/vwf-plugin`
  — no hit that describes the pane.

## Guardrails

- `site/**` is dprint-formatted: never end a table cell in a bare asterisk; keep
  each code span on one line.
- Do not edit `docs/plans/**`.

## Commit

`docs: the progress pane follows every unit`
