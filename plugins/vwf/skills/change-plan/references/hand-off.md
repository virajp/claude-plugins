# §8 — Hand off

Run these in order.

1. **Hand the folder to `plan-management`.** Invoke
   `plan-management add <folder>`.
   - It sets `status` to `APPROVED` with the date, and appends the row with
     `kind` `change` and its derived priority. That skill's *add* verb owns both
     edits.
   - Until then the folder is `DRAFT`, and `/vwf:execute` refuses it.
   - On a refusal for the old plan format, take halt H2 in `SKILL.md`.
2. **Mark the backlog items planned.** When `backlog` or `backlog_pieces` names
   ids, invoke `/vwf:backlog planned <ids> <folder>` with the ids of both lists.
   That skill edits the project, not a file.
3. **Land the folder on the integration branch** through `vwf:git-workflow`'s
   protected-branch write, never a direct commit
   (`${CLAUDE_PLUGIN_ROOT}/skills/git-workflow/references/protected-branch.md`).
   Say why: the run's worktree is cut from the integration branch, so it sees
   the folder only once it lands there, and the index row lands with it.
   - `node ${CLAUDE_PLUGIN_ROOT}/skills/git-workflow/scripts/land.mjs open <repo>
     --into <integration> --name vwf-approve-<name>`, `<integration>` the
     integration branch as git-workflow resolves it.
   - **Move** into that worktree, at the same paths, exactly the plan folder
     and each parked record this interview wrote to `docs/memory/gaps/`, so the
     main checkout no longer carries them. Then the row: read it from the main
     checkout with `plan.mjs get docs/plans/index.json plans.<basename>`, append
     it in the worktree with
     `plan.mjs append docs/plans/index.json plans --json '<row>'`, and restore
     the main checkout's index with `git checkout -- docs/plans/index.json`.
     When the tip has no `docs/plans/index.json` yet, move the file instead.
     Nothing else goes in. The `plan-management` edit rides this write, because
     that skill never commits. Step 2 changed nothing in the tree.
   - `land.mjs close <worktree> --into <integration> --message "docs: change
     plan — <name> — approved, awaiting execution"`. The approve in §5 is the
     explicit request git-workflow's push rule wants, so do not ask again.
   - A `pr` result waits on its pull request per that reference, then runs
     `land.mjs finish`. A `conflict` or `failed` result: report it with the
     worktree path, and stop; the folder is not on the integration branch yet.

## Check that nothing at this priority is left to plan

Run this before recommending a run. `/vwf:backlog`'s *unplanned* verb defines an
**open** and an **unplanned** item.

The **check priority** is the highest priority among the `backlog` and
`backlog_pieces` ids of `index.json`. When both are empty, it is the highest
priority that has an open item.

Invoke `/vwf:backlog unplanned <priority>`, with no argument when the plan names
no id. Count, beside what it lists, the pieces of this session's request not yet
planned (§2's split). Then end as Output in `SKILL.md` says.
