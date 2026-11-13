# `next` — the runnable plan of highest priority

The pick is `start.mjs next` ([claim.md](../references/claim.md)): one call that
picks, resolves, checks and claims. The pick is `plan.mjs pick`'s, per *Reading the
queue* in `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`.
The candidates are every `APPROVED` row whose requirements are satisfied, `cycle` or
`change` alike. There is no kind filter.

- **On a pick:** the result names the folder taken, its `kind` and its `priority`;
  print them. Ask no confirmation — the pick is the queue's, and the run asks only
  what its plan left open. The script then runs [folder.md](folder.md) on that folder
  as if it had been named.
- **A refusal of the picked folder** (a fresh-run refusal, or `validate`): the result
  is `refused`, its `message` naming the picked folder and the refusal, the same as a
  named folder. Stop; there is no re-pick.
- **A lost claim:** another session claimed the row first. The script closes that
  log with the outcome `claim-lost` and picks again on its own; only a lost claim
  re-picks. A claim that failed otherwise is `refused`, with no re-pick.
- **Nothing runnable:** the result is `nothing`. Stop with its `message`: each
  `APPROVED` row and what it waits on, or that the index is absent or holds no rows.
