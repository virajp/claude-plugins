# Protected-branch writes

Each core branch — each branch of `repo.core_branches`, the `data.value` of
`bootstrap config get repo.core_branches --json` — is a protected branch: **no
direct commit** from vwf, ever. A change that must reach one of them — the
plan-queue rows (claim, unclaim, completion), a planner's approved folder, the
release-levels file — takes one path, and `scripts/land.mjs` is that path. No
other script commits, cuts a branch or adds a worktree for such a write; every
caller runs this one. The integration branch is `develop` when it is a core
branch, else `main`.

## The rule

1. Cut a worktree and a local branch from the tip of the protected branch,
   with `git:worktree:create`. The branch stays local; it is pushed only when
   a pull request needs it.
2. Make the change in that worktree, and commit it there.
3. Rebase the branch on the tip of the protected branch, in its own worktree,
   then land it with `mise x -- mise run git:merge:<branch> -- <name>`, run
   from that worktree. The task applies the protected branch's landing model,
   `repo.branches.<branch>.landing`: under `direct-merge` or `direct-commit`
   it merges in the main checkout and pushes; under `pr` it pushes the branch
   and opens a pull request, and the caller waits for that pull request to
   merge before it goes on.
4. Remove the worktree with `git:worktree:delete`; the branch goes once it is
   merged.

The main checkout's uncommitted changes stay uncommitted and are never part of
the merge. A landing stops when git refuses the checkout or the merge, or when
the task's whole-tree hook pass (`pre-commit run --all-files`) fails or
rewrites a file anywhere in the tree — `failed`, never a pull request in its
place.

A repo with no `origin` remote is supported: the tip is the local branch, and
there is no fetch, pull, push or pull request.

## The script

`${CLAUDE_PLUGIN_ROOT}/skills/git-workflow/scripts/land.mjs`, four verbs, each
printing one JSON object on stdout:

```sh
node land.mjs open <repo dir> --into <branch> --name <branch name>
node land.mjs close <worktree> --into <branch> --message <message>
node land.mjs abandon <worktree>
node land.mjs finish <repo dir> --branch <branch name> --into <branch>
```

- **`open`** records the base in `branch.<name>.vwfLandBase`, fetches, then
  runs `git:worktree:create -- <name> --from origin/<branch> --no-setup`
  (`--from <branch>` with no remote), and drops an upstream that an old
  `git:worktree:create` (synced before bootstrap `c3e3ddd`) gives the new
  branch. The worktree is `<repo>/.worktrees/<name>` (or `worktrees/`, as
  the task chooses). `<repo>` is the main checkout of the repo `<repo dir>` is
  in; for a submodule, that is the submodule's own work tree (the
  `core.worktree` of its git dir), never the superproject. It refuses a branch
  or a worktree path that already exists, and a `<name>` that exists on
  `origin`. It prints `{worktree, branch, into, base}`. The caller now edits
  files **in that worktree**, never in the main checkout.
- **`close`** stages every change in the worktree, commits it with
  `mise x -- git commit -m <message>` (the repo's hooks run; the commit
  carries the trailer `Vwf-Land: close`), fetches, and rebases the branch on
  `origin/<branch>` (the local `<branch>` with no remote) in its own worktree.
  Then, from that worktree, it runs `git:merge:<branch> -- <name>` and reads
  the result from git. The merge commit has git's default subject; the
  `<message>` is the subject of the change commit. It refuses before the task
  when the main checkout is already mid-merge. It prints one of:
  - `{landed: true, commit}` — the branch is in `<branch>`; the worktree and
    the branch are removed;
  - `{landed: false, kind: "pr", url, branch}` — the landing model is `pr`:
    the task pushed the branch and opened a pull request (`url` from
    `gh pr view`, `null` when no forge CLI is present), the worktree is
    removed and the branch kept;
  - `{landed: false, kind: "conflict", files, reason}` — the rebase conflicts
    on `files`; the rebase is aborted in the branch's own worktree, nothing
    merged, the worktree and branch stay;
  - `{landed: false, kind: "failed", reason}` — a commit or the task failed;
    the worktree and branch stay. When the task conflicts in the main
    checkout, the reason names the files and says the main checkout is left
    mid-merge for the user to resolve and commit, or `git merge --abort`.
    When the push failed, the result also carries `unpushed: true`: the merge
    commit stays on local `<branch>`, and the reason gives
    `git push origin <branch>`, run from the main checkout. Every reason
    after the task says the main checkout is now on `<branch>` when it is.

  Any of them can carry a `warning`: a worktree that could not be removed, or
  the task's output when the change landed but the task's restoring checkout
  failed.
- **`abandon`** removes a worktree whose change will not land. When the
  branch is `land.mjs`'s own scratch — every commit after
  `branch.<name>.vwfLandBase` carries `Vwf-Land: close` — it removes the
  worktree and deletes the branch, dirty or unmerged. Otherwise it runs
  `git:worktree:delete`, keeps an unmerged branch, and its `warning` holds the
  task's output and the `git branch -D` command.
- **`finish`** runs once the pull request merged: when `gh pr view` gives
  `MERGED` or `glab mr view` gives `merged`, it reads the request's head
  (`headRefOid`, or glab's `sha`) and fetches. When that head is the local
  branch's tip, or the tip is an ancestor of it, it deletes the local branch —
  and, for `land.mjs`'s own scratch branch, the branch on `origin` — and
  fast-forwards `<branch>` in the main checkout when that checkout is on it.
  With neither CLI, a state other than merged, or a head that is empty,
  missing or does not hold the tip, it keeps both branches and prints
  `{finished: false, reason, command}`, exit 1: the caller reports `command`
  for the user to run once they see the branch's commits merged.

Exit 0 when the verb did its work (`close`: landed); 1 when `close` did not
land or `finish` did not finish; 2 on a usage error or a git failure, with
nothing on stdout. When a `git:*` task is missing, the verb returns `failed`
with the hint of *The git ports* in
`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`.

## Acting on a failed result

Only a `conflict` may be retried, after `abandon`, as each caller says. On
`failed` the caller stops and reports the reason. On `unpushed: true` it
stops, reports `git push origin <branch>`, and never retries: a retry would
conflict with the unpushed merge commit and leave the main checkout
mid-merge.

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
  go on as on `landed: true`. A `finished: false` result is reported with its
  `command`, and the caller goes on: the change landed.
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
