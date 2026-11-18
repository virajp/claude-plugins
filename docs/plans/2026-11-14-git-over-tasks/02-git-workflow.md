# U2 — git-workflow reads the landing key and calls the git:* tasks

- **Read first:** the owned git-workflow files whole, and
  `plugins/vwf/assets/bootstrap-contract.md` (R3a).
- **Lazy-load:** `docs/memory/gaps/2026-11-14-one-or-two-core-branches-parked.md`;
  the R2a plan
  `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/plans/archived/2026-11-14-git-tasks/`;
  the shipped tasks under `.config/mise/tasks/git/` of this repo (bootstrap
  4.1.1).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`. The plan was amended on 2026-11-18
(D36 to D42).

- **D4, D42:** the landing model of a destination `<b>` is the `data.value` of
  `bootstrap config get repo.branches.<b>.landing --json` (the JSON contract
  envelope): `pr`, `direct-merge` (the default) or `direct-commit`.
  `read_merge_model` and every `merge_model`, `[branch.*]` or
  `[tools.git.branch.*]` name go. The `git:merge:<b>` task applies the model
  itself; git-workflow reads it only to tell the user what a landing will do,
  and to refuse a direct commit where the value is not `direct-commit`.
- **D1:** a landing runs `mise x -- mise run git:merge:<b> -- <branch>`; a
  member repo's landing runs it there:
  `mise x --cd <member> -- mise run git:merge:<b> -- <branch>`. A worktree is
  made with `git:worktree:create`, set up with `git:worktree:setup`, and
  removed with `git:worktree:delete`. The main checkout's uncommitted changes
  stay uncommitted and are never part of the merge. A landing stops when git
  refuses the checkout or the merge, or when the task's whole-tree hook pass
  (`pre-commit run --all-files`) fails or rewrites a file anywhere in the tree
  (D23, D45).
- **D36, D43:** the prose tells no one to abort a merge, reset a branch, or
  delete an unmerged or a remote branch on the tool's own account. The one
  exceptions are `land.mjs`'s own scratch branch (every commit after
  `branch.<name>.vwfLandBase` carries `Vwf-Land: close`): `abandon` deletes
  it, and `finish` deletes it on origin too once `gh` or `glab` reports its
  request merged (D48).
- **D49 — a worktree from git-workflow:** after a fetch, run
  `mise x -- mise run git:worktree:create -- <name> --from origin/<into> --no-setup`
  (`--from <into>` with no `origin`), then `git branch --unset-upstream <name>`
  when the branch has an upstream; Step 2c then runs `git:worktree:setup`.
- **D27, D44:** `git:worktree:delete` removes the worktree before it checks the
  branch. If it exits 1 and `gh pr view <branch> --json state` gives `MERGED`,
  or `glab mr view <branch> --output json` gives `merged`, run the
  `git branch -D` command that the task printed. Otherwise report the failure
  (a stale local core branch also gives exit 1) and stop.
- **D37, D15, D38, D39** (for `protected-branch.md`, `claim.md`,
  `plan-management/SKILL.md` and `plan-index.md`, which describe `land.mjs`):
  `close` rebases its own branch on `origin/<into>` first, and a rebase
  conflict is the kind `conflict`, which a claim reads as `lost`; a conflict
  of the task in the main checkout is `failed`, left mid-merge for the user
  to resolve or abort; a failed push is `failed`, and the merge commit stays
  on local `<into>` until the next landing pushes it; the merge commit has
  git's default subject. On `conflict` or `failed`, `close` keeps the
  worktree for the caller to retry or abandon, and every `failed` reason
  after the task says the main checkout is now on `<into>` when it is (D45,
  D47). `finish` deletes a branch only after `gh` or `glab` reports its
  request merged, else returns `{ finished: false, reason, command }` with
  exit 1 and the caller reports the command (D44, D47). A failed push returns
  `unpushed: true`: the caller stops, reports `git push origin <into>`, and
  never retries it; a caller retries a `conflict` only (D46).
- **D40:** add a **git ports** section to
  `plugins/vwf/assets/bootstrap-contract.md`: the ports `git:merge:<branch>`
  and `git:worktree:create|setup|delete`; the check `bootstrap describe --json`,
  `data.ports[].present`; and the hint for a missing port, run
  `bootstrap migrate`. `landing.md` cites it where the "else merge it"
  fallback was (D34).
- **D3:** the integration branch is `develop` when `develop` is in
  `repo.core_branches` (the `data.value` of
  `bootstrap config get repo.core_branches --json`), else `main`. With both,
  work moves feature → `develop` → `main`; with one, each feature lands on
  that branch. A core branch that exists only on `origin` gets a local branch
  that tracks `origin/<branch>`. The user's words: "If there's a develop branch
  then make changes on develop branch only and keep remote in sync so that
  other contributors don't run the same plan on their machine. In case develop
  branch does not exist and main does then use main with same rules".

## Edits

1. **`git-workflow/SKILL.md`**: about lines 37-43 and 213-234 (the merge model
   and `read_merge_model`, about lines 223-230): D4; the step that names the
   integration branch, and the "develop or main" text at about lines 55, 80
   and 96: D3; each `code:merge` name: D1.
2. **`references/landing.md`**: about lines 18-79: D1 and D4, for the base and
   for a member. The "else merge it" fallback when no merge task exists (about
   lines 37 and 53) goes: a missing task stops the landing with the D40 hint
   (D34).
3. **`references/worktree-setup.md`**: about line 62 and lines 102-118: D1
   and D49 (`git:worktree:create` in place of `git worktree add`;
   `git:worktree:setup` in place of `setup:worktree`; the `have_task` probe
   names the new task); D27 for the removal. **`SKILL.md`** about lines 28 and
   148: the same `git worktree add` change (D49).
4. **`references/protected-branch.md`** (about lines 12-24 and 48-63),
   **`plugins/vwf/skills/execute/references/claim.md`** (about lines 69, 77,
   139 and 152-161),
   **`plugins/vwf/skills/plan-management/SKILL.md`** (about lines 111 and
   246-247): the stash, `merge --no-ff`, the PR fallback, "a merge the hooks
   refuse becomes a pull request" and "develop and main" become D1, D3, D9 and
   the D37/D15/D38/D39 bullet (D12): `land.mjs` calls `git:merge:<b>`, reads
   the result from git, and a dirty branch worktree gives `failed` (D23).
5. **`plugins/vwf/skills/plan-management/references/plan-index.md`** (about
   lines 302-303, 316-317 and 330-331): the same, with D15 to D19 and D37 (D20).
6. **`plugins/vwf/assets/bootstrap-contract.md`**: the D40 section.
7. **`plugins/vwf/skills/execute/references/land.md`** (about line 45, "abort,
   keep the worktree"; about lines 52-54, abandon and try again; about line
   60, `finish`), **`plugins/vwf/skills/plan/SKILL.md`** (about line 570) and
   **`plugins/vwf/skills/change-plan/references/hand-off.md`** (about line 37):
   D15 (no abort; the main checkout is left for the user), D36, D44 and the
   new `finish` result, and D46 (no retry of an unpushed merge) (D47).
8. **`git-workflow/SKILL.md`** step 4 (about lines 264-271): on a conflict it
   stops and leaves the merge for the user, as D15; it runs no
   `git merge --abort` (D50).
9. **`plugins/vwf/skills/execute/references/setup.md`** (about lines 89-93):
   the `git merge <integration branch>` of an `all` run's shared worktree runs
   in that worktree, not in the main checkout, so its `git merge --abort`
   stays; state the rule there without citing `land.md` (D50).
- Each task call in prose has the `--` separator (D19).

## Verification

- `mise x -- mise run code:format --all` passes.
- `grep -nE 'code:merge|merge_model|tools\.git\.branch' plugins/vwf/skills/git-workflow/SKILL.md plugins/vwf/skills/git-workflow/references/*.md`
  finds nothing.

## Guardrails

- Touch nothing outside the twelve owned files.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: git-workflow lands through bootstrap's git tasks and core branches`
