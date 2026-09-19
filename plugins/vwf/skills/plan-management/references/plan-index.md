# The Plan Index

`docs/plans/index.md` is the product's one view of its plans as a set. It lives
in the **base** repo, as the backlog project is the base's — a `repo` or
`monorepo` topology has only the base, and under `multi-repo` a command running
in a member repo addresses the base's file. Every skill that reads or writes the
file follows this contract; no skill reads a plan's status from anywhere else
when this file has a row for it.

The file holds **one table**. Every plan folder is a row, whichever skill wrote
the folder and whichever repo holds it. Its writers are the verbs of
`plan-management`, called by `/vwf:plan`, `/vwf:change-plan` and
`/vwf:execute` — and, for `unclaim` and `archive`, by a session on the user's
word — each making the one edit named under *Writers and their edits*.

## The prose frame

The file opens with this intro, above the table, so a file written fresh reads
the same as one that grew. A writer creating the file writes the intro and the
header row, then its own row; a writer finding the file writes only its row.

    # Plans

    The product's plans as a set — the one file every vwf command reads to find
    a plan without walking the member repos, and the queue `/vwf:execute next`
    reads to pick the next runnable plan.

    ## Plans

    | Folder | Kind | Plan | Target repo | Priority | Status | Requires | Backlog |
    | ------ | ---- | ---- | ----------- | -------- | ------ | -------- | ------- |

## The columns

Header row, exactly:

    | Folder | Kind | Plan | Target repo | Priority | Status | Requires | Backlog |

| Column        | Meaning                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Folder`      | the folder's path relative to its repo's root, in a code span; moves under `docs/plans/archived/` at landing     |
| `Kind`        | `cycle` or `change`, read from the folder's `type:` frontmatter — `vwf-plan` is `cycle`, `vwf-change-plan` is `change` |
| `Plan`        | the plan's `title:` from its `index.md` frontmatter                                                              |
| `Target repo` | for a cycle plan, the member repo whose code it changes, resolved per `assets/membership.md`; `—` for a change plan, and for any plan in a `repo` or `monorepo` topology |
| `Priority`    | the derived integer — `10 + max(Priority of every unarchived plan in its requires:)`, or `10` when it requires none of them; never asked, never edited by hand |
| `Status`      | `APPROVED`, `RUNNING` or `COMPLETE` — nothing else                                                               |
| `Requires`    | the **basenames** of the folder's `requires:` entries, or `—`                                                    |
| `Backlog`     | the ids from the folder's `backlog:` frontmatter — the `Bnn` prefixes of the backlog project's items — or `—`     |

The three statuses:

- `APPROVED` — approved at hand-off and waiting to be picked up;
- `RUNNING` — claimed by a session, which may be mid-run, paused or blocked.
  The folder's own Status block keeps that detail — `BLOCKED`,
  `RUNNING — paused …`, the worktree path; the index never mirrors it. A
  `RUNNING` row is opaque to every reader whatever the folder says;
- `COMPLETE` — landed, and kept only while another row's `Requires` names it.

## Writers and their edits

| Verb       | Caller                          | Edit                                                                                                                                                                                                                                                                                       |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `add`      | `/vwf:plan`, `/vwf:change-plan` | appends the row, `APPROVED`, in the planner's hand-off commit                                                                                                                                                                                                                              |
| `claim`    | `/vwf:execute`                  | sets `RUNNING` — before the worktree is cut; the commit `docs: plan queue — <folder> running`                                                                                                                                                                                              |
| `unclaim`  | a session, on the user's word   | sets `APPROVED` back from `RUNNING` — the one reverse edit, in the main checkout, once the run's worktree is gone and the user consents; invoked by a session on the user's word, or by `/vwf:execute`'s resume path on a yes; the commit `docs: plan queue — <folder> unclaimed`          |
| `complete` | `/vwf:execute`                  | sets `COMPLETE` after the merge lands, re-pointing `Folder` under `archived/` when the landing archived the folder (an empty gap list) and leaving it at the live path otherwise — `archive` re-points it later — then runs the **sweep**; the commit `docs: plan queue — <folder> complete` |
| `archive`  | a session, on the user's word   | applies the landing edit to one folder's row, in the commit of the session that asked; a folder with no row gets none                                                                                                                                                                      |

No verb commits: the caller named in each row commits the edit.

A cycle plan's folder lives in the **target repo** — the member whose code it
changes — and is archived there, under that repo's `docs/plans/archived/`; its
row lives in the base, like every row. A change plan's folder and its row are
both the base's.

The **sweep**: after a row is set `COMPLETE`, remove every `COMPLETE` row
whose `Folder` already points under `docs/plans/archived/` and that no
`APPROVED` or `RUNNING` row's `Requires` names. A completed plan nobody still
waits on leaves the queue once its folder is archived; that folder is the
record. A `COMPLETE` row whose `Folder` is a live path is never swept — it is
how the `archive` verb finds the folder it has yet to move.

**Every edit is a direct commit on the integration branch, made in the main
checkout, never in a worktree.** The run branch never touches this file, so two
parallel landings cannot conflict on it. The three commit messages:

- the claim: `docs: plan queue — <folder> running`
- the unclaim: `docs: plan queue — <folder> unclaimed`
- the landing: `docs: plan queue — <folder> complete`

`/vwf:plan`'s and `/vwf:change-plan`'s rows ride their own approval commits,
and the `archive` verb's edit rides the commit of the session that asked.

## Resolution

A `requires:` entry matches a row, or an archived folder, by its **basename**:
`docs/plans/X` and `docs/plans/archived/X` name the same plan. No skill ever
re-points a `requires:` line.

Whether an entry is **satisfied** depends on the kind of the **required** plan
— read from its row's `Kind` cell, or, when there is no row, from the archived
folder's `type:` frontmatter:

- a `change` requirement is satisfied when its basename resolves to a
  `COMPLETE` row, or to a folder under `docs/plans/archived/` with no row (it
  was swept, or archived before this contract). An entry that resolves to an
  `APPROVED` or `RUNNING` row is not yet satisfied;
- a `cycle` requirement is satisfied when every doc in that plan's `covers:`
  reads `implementation: complete` in the base repo's blueprint. The row is
  not the test: a cycle folder lives in its target repo, which may not be
  cloned, while the blueprint is always the base's. The row is what the pick,
  the claim and visibility use.

An entry with no row and no folder anywhere — not under `docs/plans/`, not
under `docs/plans/archived/`, in the base or in any cloned member — is a
refusal, named.

## The pick

`next` is taken by the one executor — `/vwf:execute next` reads this table
alone, rows of either kind:

- **candidates** are `APPROVED` rows, `cycle` or `change`, whose every
  `Requires` entry is satisfied;
- **order** is `Priority` ascending, then the folder's date prefix ascending,
  then folder name;
- the pick prints the folder, its `Kind` and its `Priority`;
- a `RUNNING` row is **never** taken — resuming one is
  `/vwf:execute <folder>`, and a claim whose session is gone is released by
  `unclaim <folder>`, once the worktree it names is gone, in a commit on the
  integration branch;
- a row waiting on an unsatisfied requirement is not a candidate;
- nothing runnable → print each `APPROVED` row and what it waits on, and stop;
- no table, or no rows → say so and stop.

The claim is the row set to `RUNNING`, committed and pushed **before** the
worktree is cut; a rejected push means re-pull and re-pick.

## The procedure

The `next` pick, the claim at the start of a run, and the `COMPLETE` row after
a landing are each a read or a write of this file, and every step of them is
one plain git command. Both procedures run in the **main checkout of the base
repo**, never in a worktree. The index is the base repo's, as the backlog
project is — a run started in a member repo addresses the base's file, resolved
the way `${CLAUDE_PLUGIN_ROOT}/assets/membership.md` resolves it.
`<integration>` below is the branch `vwf:git-workflow` resolves as the
integration branch; this contract never assumes its name.

### Reading the queue

1. `git fetch origin`.
2. Read the file at the integration branch's tip, never the working copy —
   `git show origin/<integration>:docs/plans/index.md`. The working copy may be
   stale, dirty, or checked out on another branch; the tip is what every other
   session pushed to.
3. Parse the table per this contract, keeping the rows. No table, or no rows →
   say so and stop.
4. Resolve every `Requires` cell, entry by entry, by **basename**:
   `docs/plans/X` and `docs/plans/archived/X` name the same plan, so an entry is
   matched against the basename of each row's `Folder` cell, and its kind is
   read from that row — or from the archived folder's `type:` when no row
   matches.
   - A row matches and the required plan is a `change` plan → the entry is
     satisfied when that row's `Status` is `COMPLETE`, and unsatisfied when it
     is `APPROVED` or `RUNNING`.
   - No row matches, the required plan is a `change` plan, and
     `docs/plans/archived/<basename>/` exists on disk in the base repo →
     satisfied: the plan landed and its row was swept.
   - The required plan is a `cycle` plan → the entry is satisfied when every
     doc in its `covers:` reads `implementation: complete` in the base repo's
     blueprint, whatever its row says and whether or not its folder is on
     disk.
   - Neither a row nor a folder → the entry is **unresolvable**, and the plan
     that names it is refused, naming the entry and the plan. No skill
     re-points a `requires:` line; the user fixes the entry by hand.
5. The candidates are the `APPROVED` rows whose every entry is satisfied, of
   either kind. A `RUNNING` row is never a candidate, however stale — a
   claim is released only by `unclaim <folder>`, once the worktree it names
   is gone, in a commit on the integration branch — and a row waiting on a
   `RUNNING` requirement is not one either.
6. Order the candidates by `Priority` ascending, then by the folder's date
   prefix ascending, then by folder name. The first is the pick; print its
   folder, `Kind` and `Priority`.
7. No candidate → print each `APPROVED` row with what it waits on
   — the requirement that is `APPROVED` or `RUNNING`, the `covers:` doc not
   yet `implementation: complete`, or the entry that resolves to nothing — and
   stop.

For a **named** folder the same read applies to its one row: find it by the
folder's basename, resolve its `Requires` the same way, and refuse on the same
conditions. The executor says what each row status means for a named run.

### Writing a row — the claim, and the completion

The one edit the executor makes in the main checkout. `unclaim` follows the
same procedure with the reverse edit — the row from `RUNNING` back to
`APPROVED` — and the push-rejection rule applies unchanged. Record two facts
before touching anything: the branch the checkout is on, and whether a stash
was taken.

1. When the checkout is dirty — `git status --porcelain` prints anything —
   `git stash push -u -m "vwf plan queue <folder>"` and remember that a stash
   was taken.
2. When the checkout is not on `<integration>` — `git checkout <integration>`.
3. `git pull --ff-only`.
4. Edit the one row in the table:
   - **Claim** — the folder's row `Status` from `APPROVED` to `RUNNING`.
   - **Unclaim** — the row `Status` from `RUNNING` back to `APPROVED`, once
     the verb's liveness check and the user's consent have passed.
   - **Completion** — the row `Status` to `COMPLETE`, then the sweep below.
     The `Folder` cell is re-pointed to `docs/plans/archived/<basename>` by
     whichever skill moves the folder: the completion edit itself when the
     landing's gap list is empty and `/vwf:execute` archives the folder at
     landing; the `archive` verb when a gap was open and the folder stayed
     live as the working record. A `COMPLETE` row whose `Folder` is still a
     live path is one `archive` has yet to move, and the sweep leaves it alone
     until `archive`'s own landing edit re-points it.
5. `git add -- docs/plans/index.md` — that file alone; nothing else the
   checkout carries rides this commit.
6. `mise x -- git commit -m "docs: plan queue — <folder> running"` for a
   claim, `… — <folder> unclaimed` for an unclaim, `… — <folder> complete`
   for a completion. `<folder>` is the basename.
7. `git push`. On a **rejected push**, loop:
   - `git pull --rebase`.
   - The rebase is clean → another session changed a different row. `git push`
     again. For a claim the pick stands: a claim only ever flips `APPROVED` to
     `RUNNING`, and no such flip can make a satisfied `requires:` unsatisfied.
   - The rebase conflicts on `docs/plans/index.md` → the same row.
     `git rebase --abort`, then drop the commit — `git reset --soft HEAD~1`,
     then `git checkout HEAD -- docs/plans/index.md`, which restores the file
     in both the index and the tree from the commit before the claim — then
     `git pull --ff-only`. Then, by kind of edit:
     - A **completion** re-applies the same row from step 4 and pushes again —
       a completion never re-picks; it repeats until the push lands, then
       reaches step 8.
     - A **claim** goes to step 8 first — the checkout is restored before
       anything else is decided — and then back to *Reading the queue*: for
       `next`, a re-pick, which either starts this procedure over at step 1
       for the next candidate or stops with nothing runnable; for a named
       folder, the row is now `RUNNING` under another session and the
       executor refuses it. Neither exit skips step 8.
     - An **unclaim** goes to step 8 and stops: the same row changed under
       it — the run landed, or another session released it — so the verb
       reports that and the user asks again after reading the queue.
8. **Restore the checkout — every path ends here**, the landed push, the
   dropped claim and the refusal alike. When the checkout was on another
   branch — `git checkout -`. When a stash was taken — `git stash pop`.

Every command is one plain call; none of them is `--force`, `reset --hard` or
`--no-verify`, which `vwf:git-workflow` forbids everywhere. The push carries no
plan-folder edit and no worktree commit: the run branch never touches
`docs/plans/index.md`, which is what lets two sessions land in parallel
without a conflict on it.

### The sweep

Runs inside the completion edit, after the row is set `COMPLETE`. A sweep
candidate is a `COMPLETE` row whose `Folder` already points under
`docs/plans/archived/`; remove each candidate whose `Folder` basename appears
in no `APPROVED` or `RUNNING` row's `Requires` cell. A candidate that
something still requires stays until the last row that names it is itself
complete and swept — a later completion sweeps it then. A `COMPLETE` row whose
`Folder` is a live path is not a candidate: it stays until the `archive` verb
moves the folder and re-points the cell, after which that landing edit's own
sweep may remove it.

## After landing

A plan folder's After landing table carries one *Mode* per step, `run` or
`ask`, as the planner's interview recorded it. On a green landing
`/vwf:execute` runs a `run` step in table order without a prompt — the `run`
in the folder is its authorisation — and stops once before an `ask` step. A
table with no *Mode* column, or a mode that is neither, is refused at
execute's preflight.
