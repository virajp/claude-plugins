# U1 — land.mjs calls the git:* tasks

- **Read first:** `plugins/vwf/skills/git-workflow/scripts/lib/land.mjs` and
  `scripts/land.mjs` whole, and `scripts/src/git-land.test.ts`.
- **Lazy-load:** the R2a plan in the bootstrap repo,
  `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/plans/2026-11-14-git-tasks/`
  (or its archived path): its `decisions` D2, D3, D13, D15, D16, D21, D22, D25
  and D28 define `git:merge:<b>` and `git:worktree:create|delete`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D1, D22:** `open` runs, in the main checkout,
  `mise run git:worktree:create -- <name> --from <base> --no-setup` (the task
  makes `.worktrees/<name>` and the branch, as `land.mjs` does today; R2a D3;
  `<base>` per D17). `close` runs `mise run git:merge:<into> -- <branch>` from
  the branch's worktree (D18): the task does the merge, the push or the pull
  request for the landing model of `<into>`, and removes nothing. Then `close`
  removes the worktree and the merged branch as it does today. The stash code
  goes.
- **D23:** the main checkout's uncommitted changes stay uncommitted and are
  never part of the merge; a landing stops only when git refuses the checkout
  or the merge.
- **D24:** `close` records the main checkout's branch before the task, and
  after a D15 abort or a D16 reset checks it out again if it changed.
- **D25:** after `create`, `open` runs `git branch --unset-upstream <name>`.
- **D26:** `open` first checks `origin/<name>`; if it exists, `open` returns
  `failed` with that reason and does not call `create`.
- **D9:** `close` reads the result from git after the task. Exit 0 with the
  branch merged into `<into>` (`git merge-base --is-ancestor`) is landed. Exit
  0 with the branch not merged is a PR, with its URL from
  `gh pr view <branch> --json url` when `gh` is present, else no URL. A
  non-zero exit is failed, with the end of the task's output as the reason.
  The hooks-to-PR fallback and the push retry of `land.mjs` go.
- **D15:** after a non-zero exit, if `MERGE_HEAD` exists in the main checkout,
  `close` collects the conflict files (`git diff --name-only --diff-filter=U`),
  runs `git merge --abort`, and returns the kind `conflict` with the files.
- **D16:** after a non-zero exit, if `<into>` is ahead of `origin/<into>`,
  `close` runs `git reset --keep origin/<into>` in the main checkout and
  returns `failed`.
- **D17:** with an `origin`, `open` fetches first and passes
  `--from origin/<into>`; with no `origin`, it passes `--from <into>` and does
  not fetch.
- **D18:** `close` runs the `git:merge` task from the branch's worktree; the
  task changes to the main worktree by itself for the merge.
- **D19:** the calls are `mise run git:worktree:create -- <name> --from <base>
  --no-setup` and `mise run git:merge:<into> -- <branch>`.
- **D20, D21:** `queue.mjs` (about lines 15, 478) and `start.mjs` (about line
  35) lose their stash, push-retry and PR-fallback text; `start.mjs` stops on
  `failed` and reports the reason, where it gave `pending` when hooks refused
  the claim merge. `execute-start.test.ts` (about line 383) expects that stop.
- **D30:** `open` runs the D25 call only when the branch has an upstream.
- **D31:** `close` records the tip of `<into>` before the task; D16 resets to
  that tip, not to `origin/<into>`.
- **D35:** on a PR result, `close` removes the worktree and keeps the branch.
- **D32:** the tests' fake `mise` also runs `run git:<x> -- <args>` as the
  stub file `.config/mise/tasks/git/<x>` (colons become slashes), and keeps
  its old behaviour for every other call.
- **D33:** `plan-management/scripts/plan.mjs` (about line 70): its text on the
  kind `pr` "when the hooks refused the merge" follows D9. Change nothing else
  in it.
- **D10:** no new result kind. A failed task, a dirty branch worktree included
  (D23), is the kind `failed` with the task's message.
- **D5, D11:** `abandon` and `finish` keep raw `git worktree remove` and the
  branch delete.
- **D6, D8:** the tests write stub `git:merge:<b>` and `git:worktree:create`
  tasks into each temp repo (mise file tasks under `.config/mise/tasks/git/`).
  Each stub does the plain git step and logs its arguments. No test uses the
  network or a real bootstrap. `plan-queue.test.ts` (about lines 426-470) and
  `execute-start.test.ts` (about line 383) get the same stubs.
- Keep `land.mjs`'s JSON results (`landed`, `kind`, `reason`, `commit`) and its
  verbs as they are.

## Edits

1. **`lib/land.mjs`**: `open`, `close` and the merge helpers per D1; remove the
   stash helpers and their warnings.
2. **`land.mjs`**: the header comment and usage text, if they name the stash.
3. **`scripts/src/git-land.test.ts`**: D6; a case where the branch's worktree is
   dirty gives `failed` (D10, D23); cases for D24, D25 and D26; a PR case and a landed case (D9); remove the
   stash, hooks-to-PR and push-retry cases.
4. **`scripts/src/plan-queue.test.ts`**, **`scripts/src/execute-start.test.ts`**:
   D8, D21; cases for D15 (conflict), D16 (push failure) and D17 (no origin).
5. **`plan-management/scripts/plan.mjs`**: D33.
6. **`plan-management/scripts/lib/queue.mjs`**,
   **`execute/scripts/start.mjs`**: D20, D21.

## Verification

- `mise x -- pnpm vitest run scripts/src/git-land.test.ts` passes.
- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside the eight owned files.
- A skill's node script stays dependency-free (checker rule 16).
- Delete with `rm`, never `git rm`.

## Commit

`feat: land.mjs lands through bootstrap's git tasks`
