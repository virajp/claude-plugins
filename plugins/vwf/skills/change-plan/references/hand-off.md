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
3. **Commit and push the folder** through `vwf:git-workflow`. Invoke it with
   these declared preferences, so it asks nothing:
   - **Work in place on the current branch, no worktree** — its Step 1 "if
     declined" path. Say why: the run's worktree is cut from the integration
     branch, so it sees the folder only once it is committed there. A folder
     still untracked at hand-off gets swept into some later wave's commit. The
     index row rides the same commit for the same reason, a direct commit on the
     branch, never a worktree's.
   - **Stage exactly the plan folder**, `docs/plans/index.json` and each parked
     record this interview wrote to `docs/memory/gaps/`, and nothing else. The `plan-management` edit rides this commit, because that skill
     never commits. Step 2 changed nothing in the tree.
   - **Commit** with type `docs` and the message
     `docs: change plan — <name> — approved, awaiting execution`.
   - **Push to the branch's upstream** after the commit, setting the upstream
     when the branch has none. The approve in §5 is the explicit request
     git-workflow's push rule wants, so do not ask again. Push nowhere but the
     branch you stand on, and merge nothing.

## Check that nothing at this priority is left to plan

Run this before recommending a run. `/vwf:backlog`'s *unplanned* verb defines an
**open** and an **unplanned** item.

The **check priority** is the highest priority among the `backlog` and
`backlog_pieces` ids of `index.json`. When both are empty, it is the highest
priority that has an open item.

Invoke `/vwf:backlog unplanned <priority>`, with no argument when the plan names
no id. Count, beside what it lists, the pieces of this session's request not yet
planned (§2's split). Then end as Output in `SKILL.md` says.
