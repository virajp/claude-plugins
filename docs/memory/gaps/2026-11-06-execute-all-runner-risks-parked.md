GAP 2026-10-07 ★2 | execute all | two risks of the runner loop were named at the
interview and never ruled — open | not checked in the current code

**Source plan** `2026-10-07-plans-carry-every-answer` (Parked section, plan 2
of its chain, `2026-10-07-execute-all`).

The plan named five open points for `/vwf:execute all`. Three have a ruling in
`2026-10-07-execute-all.md`: the cap check (E5), the reload risk (E4) and the
role suffix. Two have none:

- `/vwf:handoff` writes the reserved `next` file, and successive runners of one
  loop overwrite it.
- Nesting depth 3 is reached when docs-sync's surveyor runs under a runner.

Check both when the executor is rewritten.
`plugins/vwf/skills/execute/references/all.md`
no longer exists in the tree, so the loop text moved.
