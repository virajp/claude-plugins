# The plan queue (§1 and §7)

Read this when the run reads or writes a row of the base repo's
`docs/plans/index.md` — the `next` pick, the claim at the start of a run, and
the `COMPLETE` row after a landing. The file's shape — the two tables, the
change-plan table's columns `Folder`, `Plan`, `Priority`, `Status`, `Requires`,
`Backlog` — is the contract at `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`;
this reference is the procedure, and every step of it is one plain git command.

Both procedures run in the **main checkout of the base repo**, never in a
worktree. The index is the base repo's, as `docs/backlog.md` is — a run started
in a member repo addresses the base's file, resolved the way
`${CLAUDE_PLUGIN_ROOT}/assets/membership.md` resolves it. `<integration>` below
is the branch `vwf:git-workflow` resolves as the integration branch; this
reference never assumes its name.

## Reading the queue

1. `git fetch origin`.
2. Read the file at the integration branch's tip, never the working copy —
   `git show origin/<integration>:docs/plans/index.md`. The working copy may be
   stale, dirty, or checked out on another branch; the tip is what every other
   session pushed to.
3. Parse the change-plan table per the contract. No change-plan table, or a
   table with no rows → say so and stop.
4. Resolve every `Requires` cell, entry by entry, by **basename**:
   `docs/plans/X` and `docs/plans/archived/X` name the same plan, so an entry is
   matched against the basename of each row's `Folder` cell.
   - A row matches → the entry is satisfied when that row's `Status` is
     `COMPLETE`, and unsatisfied when it is `APPROVED` or `RUNNING`.
   - No row matches, and `docs/plans/archived/<basename>/` exists on disk in the
     base repo → satisfied: the plan landed and its row was swept.
   - Neither → the entry is **unresolvable**, and the plan that names it is
     refused, naming the entry and the plan. No skill re-points a `requires:`
     line; the user fixes the entry by hand.
5. The candidates are the `APPROVED` rows whose every entry is satisfied. A
   `RUNNING` row is never a candidate, however stale — a claim is released only
   by a hand edit back to `APPROVED`, committed on the integration branch — and
   a row waiting on a `RUNNING` requirement is not one either.
6. Order the candidates by `Priority` ascending, then by the folder's date
   prefix ascending, then by folder name. The first is the pick.
7. No candidate → print each `APPROVED` row with what it waits on — the
   requirement that is `APPROVED` or `RUNNING`, or the entry that resolves to
   nothing — and stop.

For a **named** folder the same read applies to its one row: find it by the
folder's basename, resolve its `Requires` the same way, and refuse on the same
conditions. §1 says what each row status means for a named run.

## Writing a row — the claim, and the completion

The one edit this skill makes in the main checkout. Record two facts before
touching anything: the branch the checkout is on, and whether a stash was
taken.

1. When the checkout is dirty — `git status --porcelain` prints anything —
   `git stash push -u -m "vwf change-execute <folder>"` and remember that a
   stash was taken.
2. When the checkout is not on `<integration>` — `git checkout <integration>`.
3. `git pull --ff-only`.
4. Edit the one row in the change-plan table:
   - **Claim** — the folder's row `Status` from `APPROVED` to `RUNNING`.
   - **Completion** — the row `Status` to `COMPLETE`, its `Folder` cell to
     `docs/plans/archived/<basename>`, then the sweep below.
5. `git add -- docs/plans/index.md` — that file alone; nothing else the
   checkout carries rides this commit.
6. `mise x -- git commit -m "docs: plan queue — <folder> running"` for a
   claim, `… — <folder> complete` for a completion. `<folder>` is the
   basename.
7. `git push`. On a **rejected push**, loop:
   - `git pull --rebase`.
   - The rebase is clean → another session changed a different row. `git push`
     again. For a claim the pick stands: a claim only ever flips `APPROVED` to
     `RUNNING`, and no such flip can make a satisfied `requires:` unsatisfied.
   - The rebase conflicts on `docs/plans/index.md` → the same row.
     `git rebase --abort`, then drop the commit — `git reset --soft HEAD~1`,
     then `git checkout HEAD -- docs/plans/index.md`, which restores the file
     in both the index and the tree from the commit before the claim — then
     `git pull --ff-only`. Then, by kind:
     - A **completion** re-applies the same row from step 4 and pushes again —
       a completion never re-picks; it repeats until the push lands, then
       reaches step 8.
     - A **claim** goes to step 8 first — the checkout is restored before
       anything else is decided — and then back to *Reading the queue*: for
       `next`, a re-pick, which either starts this procedure over at step 1
       for the next candidate or stops with nothing runnable; for a named
       folder, the row is now `RUNNING` under another session and §1 refuses
       it. Neither exit skips step 8.
8. **Restore the checkout — every path ends here**, the landed push, the
   dropped claim and the refusal alike. When the checkout was on another
   branch — `git checkout -`. When a stash was taken — `git stash pop`.

Every command is one plain call; none of them is `--force`, `reset --hard` or
`--no-verify`, which `vwf:git-workflow` forbids everywhere. The push carries no
plan-folder edit and no worktree commit: the run branch never touches
`docs/plans/index.md`, which is what lets two sessions land in parallel
without a conflict on it.

## The sweep

Runs inside the completion edit, after the row is set `COMPLETE`. Remove every
`COMPLETE` row whose `Folder` basename appears in no `APPROVED` or `RUNNING`
row's `Requires` cell. A `COMPLETE` row that something still requires stays,
its `Folder` pointing under `archived/`, until the last row that names it is
itself complete and swept — a later completion sweeps it then. The cycle-plan
table is never touched.
