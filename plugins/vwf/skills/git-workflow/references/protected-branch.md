# Protected-branch writes

`develop` and `main` are protected branches: **no direct commit**, ever. A
change that must reach one of them — the plan-queue rows (claim, unclaim,
completion), a planner's approved folder, the release-levels file — takes one
path, and `scripts/land.mjs` is that path. No other script commits, cuts a
branch or adds a worktree for such a write; every caller runs this one.

## The rule

1. Cut a worktree and a local branch from the tip of the protected branch.
   The branch stays local; it is pushed only when a pull request needs it.
2. Make the change in that worktree, and commit it there.
3. Merge the branch into the protected branch, in the main checkout, with
   `--no-ff`, and push.
4. Remove the worktree and delete the branch.
5. When **pre-commit refuses the merge** — a `no-commit-to-branch` hook, or
   any hook that stops the merge commit — push the branch and open a pull
   request into the protected branch instead. The caller waits for that pull
   request to merge before it goes on. This is rare.

A repo with no `origin` remote is supported: the tip is the local branch, and
there is no fetch, pull, push or pull request. A merge the hooks refuse there
fails, since no pull request can be opened.

## The script

`${CLAUDE_PLUGIN_ROOT}/skills/git-workflow/scripts/land.mjs`, four verbs, each
printing one JSON object on stdout:

```sh
node land.mjs open <repo dir> --into <branch> --name <branch name>
node land.mjs close <worktree> --into <branch> --message <message>
node land.mjs abandon <worktree>
node land.mjs finish <repo dir> --branch <branch name> --into <branch>
```

- **`open`** fetches, then cuts `<repo>/.worktrees/<name>` (or `worktrees/`,
  by the rule in [worktree setup](worktree-setup.md)) on the new local branch
  `<name>`, from `origin/<branch>`, or the local `<branch>` with no remote.
  It refuses a branch or a worktree path that already exists. It prints
  `{worktree, branch, into, base}`. The caller now edits files **in that
  worktree**, never in the main checkout.
- **`close`** stages every change in the worktree, commits it with
  `mise x -- git commit -m <message>` (the repo's hooks run), then, in the
  main checkout: sets aside that checkout's own changes in a stash held by
  its SHA, checks out `<branch>`, pulls, merges with
  `mise x -- git merge --no-ff -m <message>`, pushes, and restores the
  checkout and the stash. A rejected push undoes the local merge commit,
  pulls and merges again, up to 3 times. It prints one of:
  - `{landed: true, commit}` — the worktree and the branch are removed;
  - `{landed: false, kind: "pr", url, branch}` — the hooks refused the
    merge: the branch is pushed, a pull request is open (`gh`, else `glab`;
    `url` is `null`, with a `reason`, when neither could open it), the
    worktree is removed and the branch kept;
  - `{landed: false, kind: "conflict", files, reason}` — the merge conflicts
    on `files`; nothing merged, the worktree and branch stay;
  - `{landed: false, kind: "failed", reason}` — a commit, pull or push that
    failed; the worktree and branch stay.

  Any of them can carry a `warning`: a stash that could not be applied or
  dropped, or a worktree that could not be removed.
- **`abandon`** removes a worktree whose change will not land, and deletes
  its branch.
- **`finish`** runs once the pull request merged: it deletes the branch,
  local and on `origin`, and fast-forwards `<branch>` in the main checkout
  when that checkout is on it.

Exit 0 when the verb did its work (`close`: landed); 1 when `close` did not
land; 2 on a usage error or a git failure, with nothing on stdout.

## Waiting on a pull request

On `kind: "pr"` the caller does not go on as if the change landed. It waits
for the pull request with **one background watch** — never a foreground loop
and never a call that blocks past the shell's limit:

```sh
until state=$(mise x -- gh pr view <url> --json state --jq .state) && [ "$state" != OPEN ]; do sleep 60; done; echo "$state"
```

run in the background, so the session is notified when it ends. A subagent
that cannot be notified — an `execute-runner` — runs the same loop in the
foreground instead, each call bounded under the shell's limit
(`timeout 540 sh -c '<the loop>'`), repeated until the state is not `OPEN`.
Tell the user, in one line, the pull request URL and that the write waits on
it.
Then:

- `MERGED` → `land.mjs finish <repo> --branch <branch> --into <branch>`, then
  go on as on `landed: true`.
- `CLOSED` → the write did not land. `git branch -D <branch>` is the user's
  call: say so, and stop as the caller says for a failed write.

With no `url` (no forge CLI could open the request), name the pushed branch
and the protected branch, ask the user to open the pull request, and wait for
their word that it merged before `finish`.

## Callers

| Caller                                   | Branch name                | Message                                                      |
| ---------------------------------------- | -------------------------- | ------------------------------------------------------------ |
| `plan.mjs claim` (inside `start.mjs`)    | `vwf-claim-<plan name>`    | `docs: plan queue — <folder> running`                        |
| `plan-management` `unclaim`              | `vwf-unclaim-<plan name>`  | `docs: plan queue — <folder> unclaimed`                      |
| `/vwf:execute` completion                | `vwf-complete-<plan name>` | `docs: plan queue — <folder> complete`                       |
| `/vwf:plan`, `/vwf:change-plan` hand-off | `vwf-approve-<plan name>`  | `docs: plan — <slice> — approved, …` / `docs: change plan — …` |

`plan.mjs claim` calls the script's library directly and maps a conflict on
`docs/plans/index.json` to a lost claim. The other callers run the verbs.
