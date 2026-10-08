# U3 — plan prints one launch block, after the whole chain and the priority are planned

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/plan/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, top to bottom; note §6 (`:364-367`) and §8
  (`:496-517`).

## Ruling

> - Decision H1: The scope is every item at the same priority.
> - Decision H2: An **open** item is `Backlog`, `In progress` or
>   `Partially done`. An **unplanned** item is `Backlog`, or `Partially done`
>   with no `Planned in:` line. The **check priority** is the highest priority
>   among the plan's backlog ids, or, with no id, the highest priority that has
>   an open item.
> - Decision H3: When the check finds unplanned items, the planner omits the
>   launch block. It prints those items and the command for the next one
>   (`/vwf:change-plan <item>` or `/vwf:plan <slice>`). `/vwf:execute` does not
>   change, and the user can still run it.
> - Decision H4: A new read-only verb, `/vwf:backlog unplanned [priority]`,
>   lists the unplanned items at a priority. If the backlog is unreadable, the
>   verb says so, and the planner prints the launch block as today.
> - Decision H5: Within a chain or a split, the check also counts the unplanned
>   elements of the session's own request: the launch block prints only after
>   the last element. "Approve only" in the middle of a chain ends with the next
>   element's command.

## Edits

1. **§6 gate options (`:364-367`)** — *Approve & plan next* stays. *Approve
   only* in the middle of a chain: the folder is handed off, and the skill ends
   with the remaining chain elements and the command for the next one
   (`/vwf:plan <slice>`) — no launch block.
2. **§8 (`:496-509`)** — before the launch block, the same check U2 adds to
   change-plan: compute the check priority (H2), invoke
   `/vwf:backlog unplanned <priority>`, and count the unplanned chain elements
   (H5). Nothing unplanned → the launch block, once; otherwise → the unplanned
   elements and items and the next command, no launch block; the backlog
   unreadable → the launch block with one line saying so.
3. **Mid-chain (`:515-517`)** — replace "the launch line is printed once per
   folder" with: mid-chain, no launch line is printed; the next element is
   planned; the launch block prints once, after the last element, when the check
   passes. Keep "the chain's first unexecuted plan is the one to run first".

## Verification

- `mise run p:plugins:check` and `mise run code:precommit` pass.
- `grep -n "once per folder" plugins/vwf/skills/plan/SKILL.md` returns nothing.

## Guardrails

- Do not touch any file outside Owns; `plugins/vwf/skills/plan/references/**` is
  not this unit's.
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: plan prints one launch block after the chain and the priority are planned`
