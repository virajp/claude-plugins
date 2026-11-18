# U5 — Review: land.mjs over the git:* tasks

## Scope

U1, the branch delta of `plugins/vwf/skills/git-workflow/scripts/`,
`plugins/vwf/skills/plan-management/scripts/lib/queue.mjs`,
`plugins/vwf/skills/execute/scripts/start.mjs` and the three test files since
the branch base (D28). The plan lands a node script that rebases its own
branch, merges, pushes and deletes worktrees and branches (D1, D36, D37).
Focus:

- **No destructive raw git (D36):** `land.mjs` never runs `git merge --abort`
  or `git reset` in the main checkout, never checks a branch out after a task,
  never deletes an unmerged branch, and runs `git push --delete` only in
  `finish`, for its own scratch whose request `gh` or `glab` reports merged
  (D48). The only `git rebase --abort` runs in `close`'s own worktree (D37).
- A non-zero task exit whose branch already landed is landed with a warning,
  never failed (D49).
- On `conflict` or `failed`, `close` keeps the worktree for its caller (D45),
  and removes it on landed or PR. Nothing deletes a branch that is not merged,
  except `abandon` of `land.mjs`'s own scratch: every commit after
  `branch.<name>.vwfLandBase` carries `Vwf-Land: close` (D5, D43). `finish`
  deletes only after `gh` or `glab` reports the request merged (D11, D44).
- A conflict in the main checkout is `failed` and is left for the user
  (D15); a lost claim is the D37 `conflict` and leaves the main checkout clean.
- The JSON results keep their shape; the tests use no network (D6).
