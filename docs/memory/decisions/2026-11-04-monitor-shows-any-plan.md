# Decision — the progress pane shows any plan

**Date** 2026-11-04 · **Branch** `develop`

## What changed

The `vwf-monitor` pane shows any plan in any status, and it stays open. The
desktop surfaces draw a timeline and a flat plan list. The user approved both
from samples with fake data, and asked for the change to be built with no plan
folder.

## Reversals

Of `docs/memory/decisions/2026-10-25-pane-replays-the-log.md`:

- **D3, D20 and D32:** the pane no longer closes when no plan reads `RUNNING`.
- **The rejection of "keeping a landed plan on screen":** a landed plan now
  stays
  on screen until the user closes the pane.

The old-format message and the missing `docs/plans/index.json` message keep the
10 s close, because there is nothing to show.

## The decisions

1. **Before the claim.** The user's words: "Show the list of plans in the order
   that is most likely to be picked up next. Once the plan is claimed, switch to
   the details of that plan". `/vwf:execute <folder>` shows that plan at once.
2. **The claim.** A `RUNNING` row outside the opening's baseline, or a baseline
   row with this session's `run.start`. Another session's plan never ends a
   wait.
3. **The list order.** Running, then ready in the `next` order, then waiting for
   a
   required plan, then complete, the latest first.
4. **A bare `/vwf-monitor`.** The running plan, else the latest, else the list.
5. **Final stages.** The sample showed a plan gate, a landing and an
   after-landing
   step, but `index.json` records none of them. The group shows the folder's
   real
   stages and hides a skipped or pending one. The plan format did not change.
6. **Bars.** Flex `Box` parts in whole percents: the engine refuses a fractional
   percent, and a `Box` offset takes character cells.

## Rejected

A `Select` control for plans; the grouped list; one `Svg` chart, which has no
pressable rows; running `plan.mjs` from the mod.
