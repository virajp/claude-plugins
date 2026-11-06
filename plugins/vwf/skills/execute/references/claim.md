# Start the log, run doctor, claim the row

## Start the action log

Once the folder is read and no refusal stopped the run, start this run's action
log per [the action log](action-log.md).

- On a fresh run: `log.mjs start` in the main checkout, `--folder` the copy of the
  folder it read.
- On a resume: `log.mjs start --mode resume --folder <the worktree copy of the folder>`,
  which appends to the same file.

From here log each phase, gate line, commit, review round, row, gap and stop at
the point that reference names. The `start` call also writes one `plan.snapshot` event,
the folder's `units` list.

The log is one append-only file for each plan. Its path is what the folder's
`run.log` names once the claim below has written it:
`~/Library/Caches/vwf/<repo>/<folder basename>.jsonl`. It is outside the repo, and
is never committed. A log call never stops the run. Under `all`, each runner starts
its own folder's log, and the loop logs nothing.

**No active run**. When a `log.mjs event` or `run` call prints
`log.mjs: no active run in session <id>` during a run, the session's marker is
gone. Run `log.mjs start --mode resume --folder <folder>`, which appends to the same
file, then repeat the call. The call itself exited 0, and a gate it wrapped kept its
own exit code.

## Run doctor before the claim

On every run, fresh and resume, run `/vwf:doctor <projects> prefer: report only` in
the main checkout. Scope it to the plan's projects, or the base repo's own when the
plan names none. So `<projects>` is the plan's projects, else the base repo's own
project name. A repo with no such name passes the prefix alone. Run it before
the claim and before the worktree is cut. It reads each project's `stack.languages`
from `.config/vwf.yaml` and checks LSP servers, toolchains, manifests and the
harness.

**Halt on any `blocking` finding**: mise, or a stack no installed plugin defines (an
**unknown** language, a `custom` template pin). These are mandated tooling and the
closed stack menu, so this is a hard halt with the remedy, not a question. A run
started without them fails later and less legibly. A run started against an undefined
stack does not fail at all: it builds with the conventions, harness and UX gate
silently absent.

Report and stop. A halt here leaves no claim, no worktree and no `status` edit, so
the fix and a re-run need no unclaim. Keep the report: Setup step 2 reads it.

## Claim the row

Before the worktree is cut, and before the folder's own `status` is touched:

1. Invoke `plan-management claim <folder>` in the main checkout. It sets the row
   `RUNNING`. It sets the folder's `run` to
   `{"worktree": "<dir>/<branch>", "log": "~/Library/Caches/vwf/<repo>/<folder basename>.jsonl"}`.
   That is the worktree this run will use and its log, the `~` literal.
2. Commit and push `docs: plan queue — <folder> running` on the integration branch,
   exactly as *Writing a row — the claim* in
   `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md` spells out.

When the folder lives in a member repo, its `run` edit is a direct commit on that
repo's integration branch, with the same message. Its `<repo>` and worktree are
that repo's.

These are the **two** edits the run makes in the main checkout: the row and the
folder's `run`. They are made there on purpose:

- The pushed row is what another session's `next` reads, so a claim that lived only
  on the run branch would claim nothing.
- `run` is how a reader such as the progress pane finds the worktree and the log.
- The run branch must never carry `docs/plans/index.json`, or two plans landing in
  parallel would conflict on it.

Handle a rejected push per that procedure. A clean rebase pushes again. A conflict on
the same row means the plan was claimed first, and the run re-picks (`next`) or stops
(a named folder). A resume whose row already reads `RUNNING` skips this step.

## The folder's status

Once Setup step 1 has cut the worktree, invoke
`plan-management status <folder> RUNNING "RUNNING since <ts> in <worktree>"` there.
The folder's `status` is the verb's. Every later change to it (a pause, a block, the
landing) is the same verb with a different state and detail.

From there, edit the folder in the worktree only, through `plan.mjs`, and commit it
with each unit. A session that dies still leaves a legible plan on the branch. Never
edit it in the main checkout, which would dirty the integration branch. The one
exception is the claim's two edits above, the index row and the folder's `run`. These
are committed and pushed in the main checkout, and never edited in the worktree.

The row does not change on a pause or a block. The index carries `APPROVED`, `RUNNING`
or `COMPLETE` only, and the folder's status line keeps the run detail.
