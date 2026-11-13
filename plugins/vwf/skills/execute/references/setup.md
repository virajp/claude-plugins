# Format check, recall, setup

## Format Check

With `covers`, before the first unit, run the preflight in
`${CLAUDE_PLUGIN_ROOT}/assets/format-check.md`. Take its report and never its offer
— the run does not migrate.

- **Non-blocking** format drift: log it and continue.
- **Blocking** drift (the run needs an artifact the old format lacks): the H8
  question, owner `setup`, per [questions.md](questions.md). Name the drift, and
  `/vwf:setup` as what reconciles it. Never migrate autonomously.

Without `covers`, skip the check, and say so in one line of the final report — the
plan reads no blueprint artifact.

## Recall (`docs/memory/`)

Per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, before the first unit:

1. List the file names of `docs/memory/decisions/`, `docs/memory/problems/` and
   `docs/memory/gaps/`.
2. Read the files whose slug or title matches this plan, newest first, at most ten per folder.
   A match is on its slice, its name, or the projects it changes.
3. Read no file in full that does not match.

The plan rationale is the folder itself. Per-unit recall continues inside the `code`
pipeline, for `code` units only. A `docs/memory/` folder that is absent or empty
recalls nothing, silently.

**Resume check**. On a `BLOCKED` or `RUNNING` folder, the resumed run reads the
folder's `index.json` and the branch's `git log`:

- Each unit's `status`, `commit` and `rounds`: which units are already `green` and
  their commits, and which unit is the first that is not.
- For a `review` row: which round last returned, and whether a late re-run is pending.
  It is pending when a covered unit's `commit` is not an ancestor of the row's
  `range.to`, per [blocking.md](blocking.md) step 4. The test is by ancestry, not recency,
  with each covered unit tested once.
- The `gaps` list.
- The `stages`, which say whether a plan-level stage already passed.

Then follow the Resume steps of [blocking and resume](blocking.md):

- The worktree in the status line must exist.
- The rulings a block asked for must now be in the plan.
- **The worktree is authoritative**. Re-run a unit whose `commit` is absent from the
  branch — the committed code is ground truth.
- Resume at the first non-`green` unit. Never re-implement a finished one.
- The earlier attempt's fields stay. A unit run again continues its `rounds`.

This is how a run paused at a resource cap (`/vwf:handoff`, then
`/vwf:execute <folder>` in a fresh session) picks up where it left off. `start.mjs`
starts the resumed run's action log with `log.mjs start --mode resume --folder <the
worktree copy of the folder>`, which appends a new `run.start` and `plan.snapshot` to
the same file the folder's `run.log` names. Never read the log to decide where to resume.

## Setup

`start.mjs` has already logged the `checks` and `claim` phases. Setup logs its own
two, each call from the directory the step runs in, per
[the action log](action-log.md):

- `log.mjs event phase.start --phase worktree` before step 1, from the main
  checkout, and `log.mjs event phase.end --phase worktree` once step 1 is done,
  from the worktree;
- `log.mjs event phase.start --phase preflight` before step 2, and
  `log.mjs event phase.end --phase preflight` once its gate lines are green, both
  from the worktree.

1. **Worktree**. Invoke `/vwf:git-workflow` to create the dedicated worktree, passing
   the declared preferences:
   - isolate without prompting;
   - branch from the repo's integration branch, named with the plan's name: the
     `<name>` of a change plan's `docs/plans/<date>-<name>/`, the `<slice>` of a cycle
     plan's `docs/plans/<date>-<HHMM>-<slice>/`. So `2026-10-24-plan-json-format` runs
     on the branch and worktree `plan-json-format`;
   - commit-only, no post-commit prompt;
   - never merge or push.

   That skill resolves which branch the integration branch is; this one never assumes
   a name. All later work and commits happen here. **No unit gets
   `isolation: "worktree"`** — units in a wave own disjoint paths. Record the worktree
   path in the folder's status line.

   **Under an `all` override**, the dispatch prompt's overrides block names a
   `shared worktree: <branch>`, per [`all` and runner mode](../workflows/all.md). Then cut
   no worktree of the plan's name: the runner passed that worktree's path to
   `start.mjs --worktree`, so the claim's `run.worktree` already names it.
   - When a worktree on that branch exists, reuse it. Stop when it is not clean. Then
     bring it up to date with a plain `git merge <integration branch>` run inside it,
     where the plan before it landed. Treat a conflict as the hard halt
     [land.md](land.md) names: abort, keep the worktree, and mark the folder `BLOCKED`
     with the conflicting files.
   - When none exists, invoke `/vwf:git-workflow` with the same preferences, the branch
     named as given instead of with the plan's name.

   Record that path in the status line. Once the preflight below is green, append the
   one `overrides` entry the reference describes.

   **In a `multi-repo` product, the linkage decides which repo the worktree is of**.
   `/vwf:git-workflow` resolves it:

   - **`linkage: submodule`** — unchanged from every previous release. The worktree is
     of the **base** repo (the outermost superproject). The members are populated
     inside it, so one tree holds both the code and the blueprint. Nothing here is
     cross-repo. The member's pointer commit is part of landing the branch.
   - **`linkage: siblings`** — the base repo's tree does **not** contain the members,
     so the worktree is of the **target member**. The base's writes go to the base checkout as a second working tree. These are Reconcile's
     `implementation:` stamps, and the docs unit's edits to the base's own docs. Commit the two separately, **base repo
     last** — a half-finished run never leaves a doc claiming work that has not landed.
2. **Preflight (nothing here asks — its answers are in the folder)**. The start checks
   already ran before the claim, in `start.mjs` ([claim.md](claim.md)); a blocking row
   stopped the run there.

   **The LSP check waits on the parked bootstrap work**
   (`docs/memory/gaps/2026-11-13-execute-lsp-check-parked.md`): this step checks no LSP
   server, and a run with a `code` unit proceeds without an LSP gate until then.

   Run every line of the folder's `gates.unit` and `gates.wave`, in that order,
   once, from the worktree root. Run what is written and infer nothing. A gate the plan
   does not name is not this run's to invent, however obvious it looks in the tree.
   `gates.plan` does not run here; it runs once, at the end.

   When a list is empty, say so in the final report and continue. When both are empty,
   the wave review is the only gate before the end.

   A red line here is the integration branch's, not the plan's. Stop and report it as
   such — never start a run that would be blamed for a failure it inherited. The green
   preflight is in the action log, each line a `run --tier preflight` call.

   Then decide the run's mode, per *The execution mode* in [preflight.md](preflight.md).
3. **Stack conventions — only when the plan has a `code` unit**. Fetch the
   `conventions:` prose for every template this plan's projects pin. Follow the *Stack
   conventions* section of [the `code`-unit preflight](preflight.md). Fetch once for the
   whole run, deduped per (repo, slug), with its two distinguishable halts. A plan of
   `edit` units alone skips this step, said in the final report.
4. **Wave order**. Read the folder's `units`, and build the sequence from each entry's
   `wave`, `depends_on` and `kind`. Record the sequence you will execute. Every unit
   reads `pending` at approval, and no field is written ahead of its unit. The action
   log's `plan.snapshot` already holds the `units` list the sequence is built from. The
   orchestrator sets the unit fields and logs a `row` event per node or report, per
   `execute-stages.md`. The folder is both the resumable record and what the final
   report renders.
