# U4 — handoff, recall and feedback follow the rule

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/handoff/SKILL.md`,
  `plugins/vwf/assets/templates/handoff.md`,
  `plugins/vwf/skills/recall/SKILL.md`, `plugins/vwf/skills/feedback/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `handoff/SKILL.md:123-135`, `templates/handoff.md:36`,
  `:46-51`, `recall/SKILL.md:131-140`, `feedback/SKILL.md:200-215`.

## Ruling

> - Decision H2: An **open** item is `Backlog`, `In progress` or
>   `Partially done`. An **unplanned** item is `Backlog`, or `Partially done`
>   with no `Planned in:` line. The **check priority** is the highest priority
>   among the plan's backlog ids, or, with no id, the highest priority that has
>   an open item.
> - Decision H4: A new read-only verb, `/vwf:backlog unplanned [priority]`,
>   lists the unplanned items at a priority (by default, the top open priority).
>   If the backlog is unreadable, the verb says so.
> - Decision H6: `handoff`: the Next prompt is not `/vwf:execute …` while the
>   check finds unplanned items. `recall` checks again before it prints a
>   handoff's execute line. `feedback`'s change-plan route points to the
>   planner's own ending.

## Edits

1. **`handoff/SKILL.md` (`:123-135`)** — when the Next prompt would be
   `/vwf:execute …`, first invoke `/vwf:backlog unplanned` (the top open
   priority); if it lists items, the Next prompt is the planner command for the
   first one instead, and the next-steps list names the others. Backlog
   unreadable → keep the execute prompt.
2. **`templates/handoff.md`** — the Next prompt and next-steps placeholders say
   the same in one line.
3. **`recall/SKILL.md` (`:131-140`)** — before printing a handoff's execute
   launch line, invoke `/vwf:backlog unplanned`; if it lists items, print them
   and the planner command for the first one instead of the launch line.
4. **`feedback/SKILL.md` (`:210-211`)** — the change-plan route ends with "then
   follow `/vwf:change-plan`'s own ending" instead of naming `/vwf:execute`
   directly. Leave the other routes' "then `/vwf:plan <slice>`, then
   `/vwf:execute`" order lines unchanged; they describe the order, not a next
   step.

## Verification

- `mise run p:plugins:check` and `mise run code:precommit` pass.

## Guardrails

- Do not touch any file outside Owns.
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
  Keep frontmatter strict YAML.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: handoff, recall and feedback stop recommending execute while items are unplanned`
