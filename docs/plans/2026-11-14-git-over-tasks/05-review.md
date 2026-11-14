# U5 — Review: land.mjs over the git:* tasks

## Scope

U1, the branch delta of `plugins/vwf/skills/git-workflow/scripts/`,
`plugins/vwf/skills/plan-management/scripts/lib/queue.mjs`,
`plugins/vwf/skills/execute/scripts/start.mjs` and the three test files since
the branch base (D28). The plan lands a node
script that merges, pushes and deletes worktrees and branches (D1, D5).
Focus: a failed task never leaves a half-landed branch, a stale worktree or a
deleted unmerged branch; `abandon` deletes only its own branch (D5); the JSON
results keep their shape; the tests use no network (D6).
