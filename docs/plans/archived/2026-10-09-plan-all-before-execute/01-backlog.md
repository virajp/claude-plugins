# U1 — backlog: the `unplanned` verb

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/backlog/SKILL.md`,
  `plugins/vwf/skills/backlog/references/github.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom.

## Ruling

> - Decision H2: An **open** item is `Backlog`, `In progress` or
>   `Partially done`. An **unplanned** item is `Backlog`, or `Partially done`
>   with no `Planned in:` line. The **check priority** is the highest priority
>   among the plan's backlog ids, or, with no id, the highest priority that has
>   an open item.
> - Decision H4: A new read-only verb, `/vwf:backlog unplanned [priority]`,
>   lists the unplanned items at a priority (by default, the top open priority).
>   Its `--jq` filter goes in `github.md`. If the backlog is unreadable, the
>   verb says so, and the planner prints the launch block as today.

## Edits

1. **`SKILL.md`, Verbs** — add `### unplanned [priority]` after `next`:
   read-only; with a priority (`P0`, `P1`, `P2`), list the unplanned items at
   it; with none, find the top open priority (H2) and list the unplanned items
   at it; print each item's id and title, ordered by id, then one line naming
   the priority used; an empty result is one line ("no unplanned item at Pn").
   Like `list` and `next`, it passes with a `read:project` token. Add it to the
   precondition's tolerance sentence (the verbs that write nothing).
2. **`SKILL.md`, Who calls it** — a row: `/vwf:change-plan`, `/vwf:plan`,
   `handoff`, `recall`, `feedback` — before printing a launch block or an
   execute next step — `unplanned [priority]`.
3. **`references/github.md`, Per verb** — the filter, in the style of the `next`
   filter, one `--jq` call each:
   - the top open priority: the minimum `priority` over items whose `status` is
     `Backlog`, `In progress` or `Partially done`;
   - the unplanned items at a priority: `status == "Backlog"`, or
     `status == "Partially done"` with no `(?m)^Planned in:` line in
     `content.body`, and `priority == <P>`, sorted by the id's number, printed
     as `[id, title] | @tsv`. Test both against the real project before
     returning
     (`gh project item-list 2 --owner virajp --format json --limit 500 --jq …`).

## Verification

- `mise run p:plugins:check` and `mise run code:precommit` pass.
- The two filters run against the real project and print what H2 says.

## Guardrails

- Do not touch any file outside Owns. Parse with `--jq` or `jq` only (the
  Parsing rule).
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: backlog unplanned verb`
