# Decision — plan every item at the priority before recommending execute

**Date** 2026-10-09 · **Branch** `2026-10-09-plan-all-before-execute` · **Plan**
[`docs/plans/2026-10-09-plan-all-before-execute/`](../../plans/2026-10-09-plan-all-before-execute/index.md)
· **Reverses** the launch-line rules of `/vwf:plan` §6 and §8 and
`/vwf:change-plan` §8 · **Backlog** B93

## What prompted it

Backlog item B93: "Always finish planning all the items before recommending to
execute." Every planner hand-off ended on an `/vwf:execute` launch line, even
while items at the same priority — or later elements of the same chain — were
still unplanned.

## The reversals, confirmed by the user on 2026-10-09

1. **`/vwf:plan`** printed the launch line once per folder, and its *Approve
   only* choice in the middle of a chain still printed it. Now the launch block
   prints once, after the last element of the chain, and only when the check
   finds no unplanned item.
2. **`/vwf:change-plan` §8** ended every piece with exactly the launch block.
   Now the ending depends on the check.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **Scope (H1).** The check counts every item at the same priority. Rejected:
  only the session's own request; the whole backlog.
- **Definitions (H2).** An **open** item is `Backlog`, `In progress` or
  `Partially done`. An **unplanned** item is `Backlog`, or `Partially done` with
  no `Planned in:` line. The **check priority** is the highest priority among
  the plan's backlog ids, or, with no id, the highest priority that has an open
  item. No alternative was weighed.
- **Ending (H3).** When the check finds unplanned items, the planner omits the
  launch block, prints those items and the command for the next one
  (`/vwf:change-plan <item>` or `/vwf:plan <slice>`). `/vwf:execute` does not
  change, and the user can still run it. Rejected: blocking execute; a launch
  block with a warning.
- **The verb (H4).** A new read-only verb, `/vwf:backlog unplanned [priority]`,
  lists the unplanned items at a priority (by default the top open priority),
  its `--jq` filter in the backlog's GitHub reference. An unreadable backlog
  says so, and the planner prints the launch block as before. Rejected: inline
  checks in each planner.
- **Chains (H5).** Within a chain or a split, the check also counts the
  session's own unplanned elements, so the launch block prints only after the
  last; *Approve only* mid-chain ends with the next element's command. Rejected:
  a launch block for each folder.
- **Other skills (H6).** `handoff`'s Next prompt is not `/vwf:execute …` while
  the check finds unplanned items; `recall` checks again before it prints a
  handoff's execute line; `feedback`'s change-plan route points to the planner's
  own ending. A prompt resuming a folder already claimed — its row `RUNNING`, a
  paused or blocked run — is never replaced. No alternative was weighed.
