# Landing a Branch (Step 4's merge sequences)

Read this only when **Step 4** resolved to one of the two merge options — by the
user's choice or a caller-declared preference. A **Commit only** outcome never
needs it.

The merge-conflict hard halt in Step 4 applies to **both** sequences below: on a
conflict, leave the main checkout mid-merge as the task left it, run no
`git merge --abort`, leave the worktree intact, and report — never resolve
autonomously.

Every landing runs bootstrap's `git:merge:<b>` task, `<b>` the destination.
When a repo has no such task, the landing stops with the hint of *The git
ports* in `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`: there is no
fallback merge.

## Merge, push & clean up

End the worktree with **full coverage** — nothing left uncommitted, submodule
pointers current — then remove it. Order matters:

1. **Land each changed submodule.** For every submodule with work on this
   branch, run its own merge task from the submodule (this lands the
   submodule's branch under the model of
   `bootstrap config get repo.branches.<b>.landing --json` in that member,
   `<b>` its integration branch).
   Repeat per changed submodule:

   ```bash
   mise x --cd <submodule> -- mise run git:merge:<b> -- <branch>
   ```

2. **Update the outer repo's submodule pointers.** Back in the outer worktree,
   stage the moved gitlinks and commit them so the superproject records the new
   submodule commits:

   ```bash
   git add <submodule-paths>            # the gitlinks that moved
   mise x -- git commit -m "ops: update submodule pointers"
   ```

3. **Land the outer repo.** From this worktree, run

   ```bash
   mise x -- mise run git:merge:<b> -- <branch>
   ```

   The task reads the outer repo's own `repo.branches.<b>.landing` and applies
   it: it changes to the main worktree, pulls `<b>`, merges and pushes. The
   main checkout's uncommitted changes stay uncommitted and are never part of
   the merge. The landing stops when git refuses the checkout or the merge,
   or when the task's whole-tree hook pass (`pre-commit run --all-files`)
   fails or rewrites a file anywhere in the tree. A member repo's landing runs
   the same task there:
   `mise x --cd <member> -- mise run git:merge:<b> -- <branch>`.

4. **Remove the worktree.** From the main checkout, run
   `mise x -- mise run git:worktree:delete -- <branch>`. It removes the
   worktree first, and deletes the branch when a core branch has each of its
   commits. If it exits 1, run `gh pr view <branch> --json state,headRefOid`
   (or `glab mr view <branch> --output json`, reading `state` and `sha`).
   When the state is `MERGED` (glab: `merged`), first run
   `git fetch --prune origin` when an `origin` remote exists, so the merged
   head is in the local clone. Only when that head holds the local tip —
   it equals `git rev-parse refs/heads/<branch>`, or
   `git merge-base --is-ancestor refs/heads/<branch> <head>` exits 0 —
   run the `git branch -D` command that the task printed. Otherwise keep
   the branch, report the failure — a stale local core branch also gives
   exit 1, and a tip the merged head lacks is unmerged work — and stop.

5. **Sweep stale worktrees.** After this one lands, list the other worktrees
   under the worktree dir (`git worktree list`) whose branches are **fully
   merged** into the destination (`git branch --merged`), and offer to remove
   them with `git:worktree:delete`. Never remove a worktree with unmerged work.

For a repo with **no submodules**, skip steps 1–2: land the branch with its
`git:merge:<b>` task, then remove the worktree.

## Merge, push & keep worktree

Run the same land sequence — any submodule work, then the outer repo's
`git:merge:<b>` task — but **do not remove** the worktree. Inform the user
which branch and path it is on.

## Under `pr`

Both sequences above describe `direct-merge` or `direct-commit` for the
destination Step 4 resolved. Under `pr` for that destination the shape is the
same and only the outer repo's step 3 changes: its `git:merge:<b>` task runs
the same predicates, pushes the branch and **opens a pull request** against
the destination (`gh`, else `glab`; with neither, it pushes and opens none) —
nothing merges locally, and the branch lands only when someone merges that
request.

- **Step 1 is unchanged.** Each submodule member is its own repo with its own
  `repo.branches.<b>.landing` — a member on a direct model merges and pushes
  as before even when the outer repo is `pr`, and a member on `pr` opens its
  own request and stops, which means the outer pointer cannot advance until it
  is merged. Report that and stop rather than working around it.
- **Step 2 still happens.** Commit the moved gitlinks on **this branch** before
  the push, so the pointer travels in the pull request instead of waiting for a
  merge that will not happen here.
- **Step 3 is the push and the request**, done by the task. There is no
  pointer-commit-then-merge in the base repo under `pr`.
- **Steps 4–5 are unchanged** — teardown follows the option the user chose.
  Under **clean up** the worktree goes while the request is still open, and
  step 4's exit 1 is reported as step 4 says — the task kept the unmerged
  branch, which the request needs; under
  **keep worktree** it stays for review fixes. The stale sweep still only
  removes worktrees whose branches are fully merged into the destination, so a
  branch awaiting review is never swept.
