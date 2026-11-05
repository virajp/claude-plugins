# The final report

Before landing, **render the report from the record**: the folder's `index.json` (`units`,
`gaps`, `stages`, `release_levels`), the branch's `git log` and the action log. Do not render
from memory. By now the run may have spanned dozens of dispatches, a compaction, or a
resource-cap handoff, and the record is the account that survived all three intact. Read
`plan.mjs get <folder>/index.json` back and present:

- every unit with its `status`, `rounds`, `model`, `commit`, and any `skipped` or `failed`
  reason. For a `review` row, every node beneath it with its round and outcome, from the action
  log's `review.round` and `row` events, the units its findings re-dispatched, and each late
  re-run's rounds beside the main loop's, per [review-unit.md](review-unit.md). **Read** round
  counts **from the fields**, and never recall them
- every entry of `gaps` the units returned, with the assumption each proceeded on, including every
  Owns the orchestrator widened at run time, with the finding that caused it
- the review findings that survived the cap, marked `contested`
- **model downgrades**, named on the nodes that ran under them
- the unit gate, wave gate, plan gate and orchestrator gate results
- the release levels recorded: the folder's `release_levels` entries, and, once the landing has
  written them, each key it raised in `.config/releases.yaml`, from and to; or the one line
  *old-shape folder — no release levels recorded* for a folder whose `release_levels` is `[]`
- the worktree path
- the action log's path, the folder's `run.log`, and its `log.mjs summary`, which reports each run of
  the plan (one `run.start` to the next, the pause between them not counted) and the totals: the
  phases, the agents and the parallel factor, the gates by tier
- each after-landing step and its outcome, once After landing has run

With `covers`, also:

- **coverage** against the configured target, and the **acceptance** (per-criterion pass or fail) and
  **ux** (findings + a11y) results, each from its `stages` entry, or its `skipped` entry's `why`
- **the renders kept**, from `stages.renders`: the count per platform and the line "review them with
  `/vwf:mockups renders`", or, when it reads `skipped`, its reason and no review command
- **the implementation stamps written**: each `covers` doc and the state it was set to, with why anything
  is short of `complete`
- **the consolidated gap list**: the `open` entries of the folder's `gaps`, plus one line counting the
  `closed` ones, marking which came from a **cap** and which from the **convergence guard** — they point
  reconciliation at different places

Fall back to `git log` and the action log only when the folder cannot be read. Say so plainly, and mark the
report **reconstructed**. The reader needs to know whether it is a record or a recollection. A reconstructed
report is a valid thing to land on; an undisclosed one is not.

If any unit is `skipped`, `failed` or `unresolved`, this report is the block notice, and the run stops here
with the status set to `BLOCKED`.
