# U5 — Docs

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`,
  `CLAUDE.md`, `docs/memory/decisions/2026-10-09-plan-all-before-execute.md`,
  and any other human-facing passage `vwf:docs-sync` finds
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then each owned
  passage before editing it.
- **Lazy-load:** `plugins/vwf/assets/memory.md` (the decisions-doc shape)

## Ruling

> **Goal.** A planner recommends `/vwf:execute` only when no open backlog item
> at the check priority is unplanned. Until then, each hand-off ends with the
> next item to plan.

> - Decision H2: An **open** item is `Backlog`, `In progress` or
>   `Partially done`. An **unplanned** item is `Backlog`, or `Partially done`
>   with no `Planned in:` line. The **check priority** is the highest priority
>   among the plan's backlog ids, or, with no id, the highest priority that has
>   an open item.
> - Decision H3: When the check finds unplanned items, the planner omits the
>   launch block. It prints those items and the command for the next one.
>   `/vwf:execute` does not change, and the user can still run it.
> - Decision H4: A new read-only verb, `/vwf:backlog unplanned [priority]`.
> - Decision H5: Within a chain or a split, the launch block prints only after
>   the last element.

The two reversals in index.md's Goal are confirmed; they land as a decisions doc
here.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U4 returned.
2. **`site/src/content/docs/plugins/vwf.md`** — `#vwfplan` (`:2452-2478`:
   *Approve only*, the hand-off, mid-chain), `#vwfchange-plan` (`:3246-3247`,
   `:3327-3328`, `:3335`), `#vwfbacklog` (`:3078`: add the `unplanned` verb),
   the mental model and the commands table (`:299`, `:313`, `:330-331`,
   `:376-379`, `:390-393`, `:857-858`, `:864`, `:876-877`), the worked example
   (`:3665`, `:3680`).
3. **`site/src/content/docs/how-to/operate/ad-hoc-change.md`** — `:95-98`
   (several pieces are planned in one session), `:173` ("Only then does it print
   the launch line" gains the condition), `:177-201`, `:339-343`.
4. **`CLAUDE.md`** — the "Where the detail lives" paragraph: the planners print
   the launch line only when the priority is fully planned.
5. **`docs/memory/decisions/2026-10-09-plan-all-before-execute.md`** — per
   `plugins/vwf/assets/memory.md`: the two reversals, H1–H6, each with its
   rejected alternative, and a pointer to this folder.

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit under `plugins/` — U1–U4 own it; a falsified passage there is a
  `GAP:`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
  `CLAUDE.md` is dprint-formatted.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: plan all before execute — the manual follows`
