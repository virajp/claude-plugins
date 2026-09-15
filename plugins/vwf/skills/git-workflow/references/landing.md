# Landing a Branch (Step 4's merge sequences)

Read this only when **Step 4** resolved to one of the two merge options — by the
user's choice or a caller-declared preference. A **Commit only** outcome never
needs it.

The merge-conflict hard halt in Step 4 applies to **both** sequences below: on a
conflict, abort cleanly, leave the worktree intact, and report — never resolve
autonomously.

## Merge, push & clean up

End the worktree with **full coverage** — nothing left uncommitted, submodule
pointers current — then remove it. Order matters:

1. **Land each changed submodule.** For every submodule with work on this
   branch, run its own merge task from the submodule directory (this commits and
   pushes the submodule's branch). Repeat per changed submodule:

   ```bash
   mise x --cd <submodule> -- mise run code:merge:develop <branch>
   ```

2. **Update the outer repo's submodule pointers.** Back in the outer worktree,
   stage the moved gitlinks and commit them so the superproject records the new
   submodule commits:

   ```bash
   git add <submodule-paths>            # the gitlinks that moved
   mise x -- git commit -m "ops: update submodule pointers"
   ```

3. **Land the outer repo.** Merge this branch to the destination — its own
   `code:merge:` task if the outer repo defines one, else merge the branch in
   the main worktree and `git push`. The task pushes for you; only the manual
   path needs the push spelled out.

4. **Remove the worktree.**
   - **Native tool:** use its teardown (e.g. `ExitWorktree` or equivalent).
   - **Git fallback:** `git worktree remove <path>`.

5. **Sweep stale worktrees.** After this one lands, list the other worktrees
   under the worktree dir (`git worktree list`) whose branches are **fully
   merged** into the destination (`git branch --merged`), and offer to remove
   them. Never remove a worktree with unmerged work.

For a repo with **no submodules**, skip steps 1–2: land the branch (its
`code:merge:` task if defined, else merge it in the main worktree and push),
then remove the worktree.

## Merge, push & keep worktree

Run the same land sequence — any submodule work, then the outer repo +
`git
push` — but **do not remove** the worktree. Inform the user which branch
and path it is on.

## Under `pr`

Both sequences above describe the `direct` mode Step 4 resolved. Under `pr` the
shape is the same and only the outer repo's step 3 changes: its `code:merge:`
task runs the same predicates, pushes the branch and **opens a pull request**
against the destination — nothing merges locally, and the branch lands only when
someone merges that request.

- **Step 1 is unchanged.** Each submodule member is its own repo with its own
  config, so it lands under its **own** `MERGE_MODEL` — a member set to `direct`
  merges and pushes as before even when the outer repo is `pr`, and a member set
  to `pr` opens its own request and stops, which means the outer pointer cannot
  advance until it is merged. Report that and stop rather than working around
  it.
- **Step 2 still happens.** Commit the moved gitlinks on **this branch** before
  the push, so the pointer travels in the pull request instead of waiting for a
  merge that will not happen here.
- **Step 3 is the push and the request**, done by the task. There is no
  pointer-commit-then-merge in the base repo under `pr`.
- **Steps 4–5 are unchanged** — teardown follows the option the user chose.
  Under **clean up** the worktree goes while the request is still open; under
  **keep worktree** it stays for review fixes. The stale sweep still only
  removes worktrees whose branches are fully merged into the destination, so a
  branch awaiting review is never swept.
