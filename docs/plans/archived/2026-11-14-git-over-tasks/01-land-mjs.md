# U1 — land.mjs calls the git:* tasks

- **Read first:** `plugins/vwf/skills/git-workflow/scripts/lib/land.mjs` and
  `scripts/land.mjs` whole, and `scripts/src/git-land.test.ts`.
- **Lazy-load:** the R2a plan in the bootstrap repo,
  `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/plans/archived/2026-11-14-git-tasks/`:
  its `decisions` D2, D3, D13, D15, D16, D21, D22, D25 and D28 define
  `git:merge:<b>` and `git:worktree:create|delete`. The shipped tasks are in
  this repo under `.config/mise/tasks/git/` and the library
  `.config/mise/tasks/_scripts/merge` (bootstrap 4.1.1).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`. The plan was amended on 2026-11-18
(D36 to D42).

- **D36 — no destructive raw git.** `land.mjs` never aborts a merge, never
  resets a branch, never checks a branch out after a task, never deletes an
  unmerged branch other than its own scratch (D43), and never deletes a
  remote branch other than its own scratch after `gh` or `glab` reports the
  request merged (D48). The other raw git write that stays is
  `git branch --unset-upstream` (D25, D30).
- **D1, D19, D22:** `open` runs, in the main checkout,
  `mise run git:worktree:create -- <name> --from <base> --no-setup` (the task
  makes `.worktrees/<name>` and the branch; `<base>` per D17). `close` runs
  `mise run git:merge:<into> -- <branch>` from the branch's worktree (D18):
  the task does the merge, the push or the pull request for the landing of
  `<into>`. Then `close` runs `mise run git:worktree:delete -- <branch>` from
  the main checkout: on a landed result it removes the worktree and deletes the
  merged branch; on a PR result it removes the worktree and keeps the branch,
  with exit 1, which is expected there (D35). The stash code goes.
- **D37 — rebase first:** before the task, `close` fetches (with an `origin`)
  and runs `git rebase origin/<into>` in its own worktree (`git rebase <into>`
  with no `origin`). On a rebase conflict, it collects the files
  (`git diff --name-only --diff-filter=U`), runs `git rebase --abort` in that
  worktree only, and returns the kind `conflict` with the files. Nothing in
  the main checkout changes. After a clean rebase, `close` records the new
  base again in `branch.<name>.vwfLandBase` (D47), so the branch stays
  abandonable as scratch (D43).
- **D23, D45:** the main checkout's uncommitted changes stay uncommitted and
  are never part of the merge. A landing stops when git refuses the checkout
  or the merge, or when the task's whole-tree hook pass
  (`pre-commit run --all-files`) fails or rewrites a file anywhere; each is
  `failed`.
- **D45 — the worktree on a failure:** on `conflict` or `failed`, `close` keeps
  the worktree for its caller, which retries or abandons it. It removes the
  worktree only on landed or PR. A `failed` reason after the task says the
  main checkout is now on `<into>` only when `close` sees the main checkout's
  HEAD on `<into>` (D47).
- **D26, D40, D47 — a failed `open`:** it throws `LandError` (exit 2, the
  message on stderr), as today.
- **D50 — `open` and `close` edges:** `open` writes
  `branch.<name>.vwfLandBase` before it calls `git:worktree:create`; when
  `create` fails, `open` removes what `create` left through the D43 scratch
  path, then throws. `close` refuses before the task, as `failed`, when the
  main checkout already has `MERGE_HEAD`, and says the main checkout was
  mid-merge before the landing. The test stub `git:merge` exits 1 with a
  hook-failure message when a marker file `.stub-hook-fail` exists in the
  checkout it runs from; it runs no `pre-commit`.
- **D43 — land.mjs's own scratch:** `open` records the base commit in the
  branch config, `git config branch.<name>.vwfLandBase <sha>`, and `close`
  adds the trailer `Vwf-Land: close` to each change commit it makes.
- **D25, D30:** after `create`, `open` runs `git branch --unset-upstream <name>`
  when the branch has an upstream.
- **D26:** `open` first checks `origin/<name>`; if it exists, `open` returns
  `failed` with that reason and does not call `create`.
- **D9:** `close` reads the result from git after the task. Exit 0 with the
  branch merged into `<into>` (`git merge-base --is-ancestor`) is landed. Exit
  0 with the branch not merged is a PR, with its URL from
  `gh pr view <branch> --json url` when `gh` is present, else no URL (the task
  also exits 0 with no request when neither `gh` nor `glab` exists). A
  non-zero exit is failed, with the end of the task's output as the reason; a
  `gh pr create` failure after the push is failed, and the pushed branch
  stays. The hooks-to-PR fallback and the push retry of `land.mjs` go.
- **D49 — a landed change with a failed restore:** when the task exits
  non-zero, `MERGE_HEAD` is absent and the branch is in `origin/<into>` (or,
  with no `origin`, in local `<into>`), the change landed and only the task's
  restore checkout failed: `close` returns landed with a `warning` that holds
  the task's output. This check runs after D15 and before D38.
- **D15:** after a non-zero exit, if `MERGE_HEAD` exists in the main checkout,
  `close` collects the files (`git diff --name-only --diff-filter=U`) and
  returns `failed`, not `conflict`: the reason names the files, says the main
  checkout is left mid-merge as the task left it, and gives the two ways out,
  resolve and commit, or `git merge --abort`. `close` runs neither.
- **D16, D31, D38, D45:** checked after D15. When the task exits non-zero,
  `MERGE_HEAD` is absent, and the branch is in local `<into>`
  (`git merge-base --is-ancestor <branch> <into>`) but not in `origin/<into>`,
  the push failed: `close` returns `failed` with the field `unpushed: true`
  (D46); the merge commit stays on local `<into>`, not pushed, and the reason
  gives `git push origin <into>`, run from the main checkout. It resets
  nothing. A caller never retries this result.
- **D24:** goes. `close` checks nothing out after the task.
- **D17:** with an `origin`, `open` fetches first and passes
  `--from origin/<into>`; with no `origin`, it passes `--from <into>` and does
  not fetch.
- **D18:** `close` runs the `git:merge` task from the branch's worktree; the
  task changes to the main worktree by itself for the merge.
- **D39:** the merge commit keeps git's default subject. `close --message` is
  the subject of the change commit only.
- **D40:** when `mise` reports the task as not found, `close` or `open` returns
  `failed` with the hint of the git-ports section of
  `plugins/vwf/assets/bootstrap-contract.md`: run `bootstrap migrate`.
- **D20, D21:** `queue.mjs` (about lines 15, 478) and `start.mjs` (about line
  35) lose their stash, push-retry and PR-fallback text; `start.mjs` stops on
  `failed` and reports the reason, where it gave `pending` when hooks refused
  the claim merge (about lines 654-661). `execute-start.test.ts` (about line
  383) expects that stop. `queue.mjs`'s `lost` result (about line 467) stays:
  it reads the D37 `conflict`. Both stop on a result with `unpushed: true` and
  report its push command, with no retry (D46).
- **D32:** the tests' fake `mise` also runs `run git:<x> -- <args>` as the
  stub file `.config/mise/tasks/git/<x>` (colons become slashes), and keeps
  its old behaviour for every other call.
- **D33:** `plan-management/scripts/plan.mjs` (about lines 69-70): its text on
  the kind `pr` "when the hooks refused the merge" follows D9. Change nothing
  else in it.
- **D10:** no new result kind. A failed task, a failed hook pass included
  (D23), is the kind `failed` with the task's message.
- **D5, D36, D43:** `abandon` discards only `land.mjs`'s own scratch. When the
  branch has `branch.<name>.vwfLandBase` and every commit after that base
  carries the trailer `Vwf-Land: close` (a branch with no commit qualifies),
  it runs `git worktree remove --force` and `git branch -D`, dirty or
  unmerged. Otherwise it runs `mise run git:worktree:delete -- <branch>` from
  the main checkout; on exit 1 it keeps what is left and returns
  `{ abandoned: true, branch }` with a `warning` that holds the task's output
  and the `git branch -D` command.
- **D11, D36, D44:** `finish` deletes the local branch with `git branch -D`
  only when `gh pr view <branch> --json state` gives `MERGED` or
  `glab mr view <branch> --output json` gives the state `merged`. With neither
  CLI, or another state, it keeps the branch and returns
  `{ finished: false, reason, command }` with exit 1, `command` the
  `git branch -D` for the user (D47). When the request merged and the branch
  is `land.mjs`'s own scratch (the D43 test), it also runs
  `git push origin --delete <branch>` (D48); it never deletes any other
  remote branch. It keeps the `git pull --ff-only` of `<into>` when the main
  checkout is on `<into>`.
- **D6, D8:** the tests write stub `git:merge:<b>`, `git:worktree:create` and
  `git:worktree:delete` tasks into each temp repo (mise file tasks under
  `.config/mise/tasks/git/`). Each stub does the plain git step and logs its
  arguments; the `git:merge` stub merges with `--no-ff --no-edit`, as the real
  task does. No test uses the network or a real bootstrap. `plan-queue.test.ts`
  (the `claim` block, about lines 426-490) and `execute-start.test.ts` (about
  line 383) get the same stubs.
- Keep `land.mjs`'s JSON results (`landed`, `kind`, `reason`, `commit`) and its
  verbs as they are. The submodule support of commit `47bf7813` (`mainCheckout`,
  about line 75) stays.

## Edits

1. **`lib/land.mjs`**: `open`, `close`, `abandon`, `finish` and the merge
   helpers per the rulings above. Remove the stash helpers (about lines
   152-240), the `pullRequest` fallback (about lines 268-290) and the push
   retry (about lines 27 and 343-356). Raw `git worktree add` (about line
   119) and `mergeOnce` (about lines 257-258) go.
2. **`land.mjs`**: the header comment and usage text (about lines 4-5 and
   14-18): no push retry, no PR fallback, no stash; `abandon` keeps an unmerged
   branch; `finish` needs a merged PR.
3. **`scripts/src/git-land.test.ts`**: D6, D32. Cases: a stub hook of the
   task's safety net (the D50 marker file) gives `failed` and keeps the
   worktree (D10, D23, D45); `open` with a failing `create` leaves no branch,
   and `close` refuses a main checkout already mid-merge (D50); D24 gone; D25, D26; a PR case and a landed case (D9); a D37
   rebase conflict gives `conflict` and leaves the main checkout clean; a D15
   task conflict gives `failed` and leaves `MERGE_HEAD`; a D38 push failure
   keeps the merge commit and gives `unpushed: true` (D46); the merge
   subject check (about line 179) checks the change commit (D39, D47); `abandon` removes a dirty scratch branch with
   only `Vwf-Land: close` commits, and keeps a branch with another commit
   (D43); `finish` refuses a PR that is not merged, and with no `gh` or
   `glab` keeps the branch (D44). The submodule cases (about
   lines 290-333) run with the stubs. Remove the stash (about lines 196-206),
   hooks-to-PR (about line 209) and push-retry cases.
4. **`scripts/src/plan-queue.test.ts`**, **`scripts/src/execute-start.test.ts`**:
   D8, D21; the stash cases (about lines 472 and 485) go; the merge-subject
   check (about lines 446-447) checks the change commit (D39); cases for D37
   (a lost claim), D15 (a task conflict) and D17 (no origin).
5. **`plan-management/scripts/plan.mjs`**: D33.
6. **`plan-management/scripts/lib/queue.mjs`**,
   **`execute/scripts/start.mjs`**: D20, D21.

## Verification

- `mise x -- pnpm vitest run scripts/src/git-land.test.ts` passes.
- `mise x -- mise run code:format --all` passes.
- `grep -nE 'reset --keep|reset --hard|merge --abort|stash' plugins/vwf/skills/git-workflow/scripts/lib/land.mjs`
  finds no git call of those kinds (D45: the unstage `git reset --quiet`
  stays), and the one `--delete` push is inside `finish`, after the D44 and
  D43 checks (D48).

## Guardrails

- Touch nothing outside the eight owned files.
- A skill's node script stays dependency-free (checker rule 16).
- Delete with `rm`, never `git rm`.

## Commit

`feat: land.mjs lands through bootstrap's git tasks`
