# The Memory Tree

Read this when writing the repo's memory layout. It sits beside
`${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, which owns the protocol itself.

## Write the memory tree

Create `docs/memory/` with its four folders: `decisions/`, `gaps/` and
`problems/`, each holding `<date>-<slug>.md` records, and `handoff/`, holding
`<name>.md`. The tree lives where the memory asset's location rule puts it —
the base repo, in a multi-repo product; a member gets none. `handoff/` is
developer-specific and stays out of git through a line already in the repo's
`.gitignore`: it is among the universal lines `/stackgen:tool-config` renders
between its markers, so setup **writes no ignore file**. A repo whose
`.gitignore` lacks it is behind its shape, and Step 0's offer is what brings it
forward. A pre-format-19 `docs/handoffs/next.md` moves to
`docs/memory/handoff/next.md`.

An existing `docs/memory/` is **merged, never overwritten**: a record already
there stays, and setup only adds the folders that are missing. A folder the
current format no longer has is not this step's to remove — the migrate
pipeline's `23 → 24` step offers it, one row each
([migrate pipeline](migrate-pipeline.md)).

Present the folders to create as part of the pipeline's dry-run plan, per
[migration & consent](migration-and-consent.md), under that existing consent
discipline; do not invent a second gate. **On decline**, change nothing and say
so.
