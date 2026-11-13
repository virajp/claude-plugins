# Start: one script call

## The call

After the session question, the whole start of a run is one call, from the main
checkout (any directory inside the base repo or a member; the script resolves the
base per `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`):

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/start.mjs <folder|next> [--worktree <repo-relative path>] [--continue-unknown-language]
```

`<folder|next>` is the argument: a folder or its `index.json`, or `next`. A runner
under `all` passes the folder it was handed. `--worktree` sets the folder's
`run.worktree` in place of the default `<dir>/<plan name>`; a runner under an `all`
override passes the shared worktree's path ([all.md](../workflows/all.md)).
`--continue-unknown-language` is passed only on the re-run below, after the user
said continue.

In order, it:

1. runs the format test of `SKILL.md`;
2. for `next`, picks the plan, as `plan.mjs pick` does ([next.md](../workflows/next.md));
3. resolves the folder and makes the refusals of [folder.md](../workflows/folder.md):
   `plan.mjs validate`, the status and the row, `plan.mjs resolve`, and the fresh-run
   refusals or the resume refusal;
4. starts the action log, fresh or resume, per [the action log](action-log.md);
5. runs the checks phase: `checks.mjs`'s checks
   (`${CLAUDE_PLUGIN_ROOT}/skills/doctor/scripts/checks.mjs`), scoped to the plan's
   projects — the registry projects its units' `owns` fall under, or the
   repo-level checks alone when none matches;
6. on any `blocking` row, stops with `blocked` and claims nothing;
7. runs the claim phase when the run is fresh — `plan.mjs claim`, per
   *Writing a row — the claim* in
   `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`.

A fresh run takes its checks before its log start, so a stop before the claim leaves
no log run open; its checks markers follow the log start and carry the true times.
Every row and folder value comes from the tip of the integration branch, never the
working copy. A fresh run's working copy of the folder must equal that tip, or the
run is refused: check out the integration branch and pull, then re-run.

## The result

It prints one JSON object on stdout, and nothing else there; progress and warnings
go to stderr. Exit 0 on `ready`; 1 on `refused`, `blocked` or `nothing`; 2 on a
usage or internal error, with nothing on stdout — report the stderr line and stop.

| Key              | Holds                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| `result`         | `ready`, `refused`, `blocked` or `nothing`                                                         |
| `mode`           | `fresh`, `resume`, or `null` when no folder was resolved                                           |
| `folder`         | the folder, repo-relative                                                                          |
| `kind`           | the row's `kind`, `cycle` or `change`                                                              |
| `priority`       | the row's `priority`                                                                               |
| `has_code_unit`  | whether a `units` entry has `kind` `code`                                                          |
| `has_covers`     | whether the folder has `covers`: a cycle plan, whose blueprint-bound steps run                     |
| `projects`       | the plan's projects the checks were scoped to                                                      |
| `findings`       | each `{rule, severity, project, subject, message, remedy}`: the `blocking` rows and the `unknown-language` rows; `project` is `null` on a repo-level row |
| `open_questions` | `null` on a fresh run; on a resume, `{gaps, events}`: the ids of the open `QUESTION` gaps, and the `question` events with no `answer` |
| `claim`          | the `plan.mjs claim` result, `{claimed: true, commit}` (a `warning` beside it when the stash did not pop) or `{claimed: false, kind, reason}`, `kind` one of `lost`, `member-failed`, `failed`; `null` when no claim ran |
| `message`        | one line for the user                                                                              |

Hold `mode`, `folder`, `has_code_unit` and `has_covers` for every gate below.

## Acting on the result

- **`ready`** → print `message`, and continue to [Setup](setup.md). A `claim`
  `warning` names the stash the claim could not pop (`vwf plan queue <folder>`):
  print it, and say to apply that stash by hand; the run continues in its own
  worktree. On a resume with a non-empty `open_questions`, ask each per
  [questions.md](questions.md) before Setup — each gap id and each event under its
  own id, once, per *No one to answer* there.
- **`refused`** → print `message` and stop. It names the refusal and its fix, in
  the words of [folder.md](../workflows/folder.md). Under `next` it names the picked
  folder too.
- **`blocked`** → print `message`, then each finding with its remedy, and stop.
  A blocking row is mandated tooling or the closed stack menu, so this is a hard
  halt with the remedy, not a question. One case differs: see *An unknown
  language* below.
- **`nothing`** → print `message` and stop: no runnable plan, with each `APPROVED`
  row and what it waits on, or that no approved plan was found.

### An unknown language

When the only rows that stop a fresh run are `unknown-language` rows (none of them
`blocking`), `start.mjs` returns `blocked` with no log start and no claim, and
`findings` holds those rows alone. Ask the user whether to continue or stop, one
`AskUserQuestion` call, naming each language and its project. **Ask only, record
nothing**: no log is open yet, so the question takes no `log.mjs next-question`
id, and writes no `question` or `answer` event and no `decisions` entry.

- **Continue** → run `start.mjs` again with the same argument and
  `--continue-unknown-language`. It claims, and its result is acted on as above.
- **Stop** → stop. Nothing was claimed, so there is nothing to unclaim.
- **No one to answer** (`AskUserQuestion` not available or failing) → stop, as
  for a stop: nothing was claimed or written.

A runner under `all` asks no one: it returns `OUTCOME: QUESTION` with this one
question, per *Runner mode* in [all.md](../workflows/all.md).

A `ready` result that follows a continue still lists the rows in `findings`; they
were answered, and are not asked again. **A resume never asks it**: when the row
already reads `RUNNING`, the fresh run asked, and its claim shows the user chose
continue, so a resume's `ready` with `unknown-language` rows continues with no
question.

### Why the checks run before the claim

A run started without the mandated tooling fails later and less legibly. A run
started against an undefined stack does not fail at all: it builds with the
conventions, harness and UX gate silently absent. So a `blocked` result leaves no
claim, no worktree and no `status` edit, and the fix and a re-run need no unclaim.
When the stop comes after the log start, `start.mjs` closes the log itself: an
`event stop`, then `end --outcome blocked`. A refusal before the log start writes
nothing to the log.

### The claim

These are the **two** edits the run makes in the main checkout: the row, set
`RUNNING`, and the folder's `run`, set to
`{"worktree": "<dir>/<branch>", "log": "~/Library/Caches/vwf/<repo>/<folder basename>.jsonl"}`
— the worktree this run will use and its log, the `~` literal. One commit,
`docs: plan queue — <folder> running`, pushed on the integration branch. When the
folder lives in a member repo, its `run` edit is a second, direct commit on that
repo's integration branch, with the same message, after the base's; its `<repo>`
and worktree are that repo's. They are made in the main checkout on purpose:

- The pushed row is what another session's `next` reads, so a claim that lived only
  on the run branch would claim nothing.
- `run` is how a reader such as the progress pane finds the worktree and the log.
- The run branch must never carry `docs/plans/index.json`, or two plans landing in
  parallel would conflict on it.

A claim that does not land is one of two outcomes, and `start.mjs` closes the log
for each with an `event stop` and an `end`:

- **Lost** (`kind` `lost`): another session claimed the row first. Under `next`,
  `start.mjs` ends the log with `--outcome claim-lost` and picks again on its own;
  under a named folder, the result is `refused`.
- **Failed** (`kind` `failed` or `member-failed`): a commit or push failed for
  another reason, the claim commit undone. The result is `refused` under `next` and
  a named folder alike, with no re-pick, and the log ends with
  `--outcome claim-failed`. A `member-failed` claim leaves the base row `RUNNING`:
  its `message` names the `plan-management unclaim <folder>` request, which the
  person makes; the run never makes it.

A resume whose row already reads `RUNNING` takes no claim; one whose row reads
`APPROVED` was unclaimed, and is claimed again as a fresh run.

## The action log from here

`start.mjs` has started this run's log ([the action log](action-log.md)), and written
the `checks` and `claim` phase markers. From here log each phase, gate line, commit,
review round, row, gap and stop at the point that reference names. The log is one
append-only file for each plan, at the folder's `run.log`. It is outside the repo,
and is never committed. A log call never stops the run. Under `all`, each runner's
`start.mjs` starts its own folder's log, and the loop logs nothing.

**No active run**. When a `log.mjs event` or `run` call prints
`log.mjs: no active run in session <id>` during a run, the session's marker is
gone. Run `log.mjs start --mode resume --folder <folder>`, which appends to the same
file, then repeat the call. The call itself exited 0, and a gate it wrapped kept its
own exit code.

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
