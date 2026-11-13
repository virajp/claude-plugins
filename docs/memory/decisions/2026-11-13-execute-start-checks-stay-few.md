DECISION 2026-11-13 ★4 | skill:execute, skill:doctor | execute's start
checks stay few → a check that only catches a repo that is new or not set up
properly belongs in /vwf:doctor, not in execute | alt rejected: block execute
on a pinned template when .config/vwf.yaml lists no stacks: adapter

# Execute's start checks stay few

The user ruled this as Q1 (D38) of
`docs/plans/2026-11-12-execute-scripted-start/`.

When `.config/vwf.yaml` has no `stacks:` key, or `stacks: []`, the checks
script walks no pin, and the pinned-not-materialized check passes.

The reason is the rule beyond the one case: execute runs almost every day, so
the checks at its start must stay few. A check that only catches a repo that is
new or not set up properly belongs in `/vwf:doctor`. In execute it costs time
and tokens on every run.
