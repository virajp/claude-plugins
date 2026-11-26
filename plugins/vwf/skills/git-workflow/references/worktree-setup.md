# Creating an Isolated Workspace (Step 2)

Read this only when **Step 1** concluded a worktree must be created — you are in
the main checkout and isolation was consented to (or pre-declared by the
caller). Already inside a linked worktree, or working in place after a decline,
skip straight to Step 3.

Run the three sub-steps in order — create the worktree with bootstrap's
`git:worktree:create` task, populate its submodules, set it up with
`git:worktree:setup`. The task is the only creation path: never a Claude Code
worktree tool (see the Core Rules).

## 2a. Create the Worktree with `git:worktree:create`

### Directory selection

The task chooses it: `.worktrees/<name>` of the main checkout, or
`worktrees/<name>` when only `worktrees/` exists.

### Safety verification

Verify the directory is git-ignored before creating the worktree. Probe a
child path: a `.worktrees/` pattern does not match the bare name until the
directory exists, so the bare name reads "not ignored" on a first worktree.

```bash
git check-ignore -q .worktrees/x 2>/dev/null || git check-ignore -q worktrees/x 2>/dev/null
```

If NOT ignored: stop and say so. `.worktrees/` is a line in the repo's
`.gitignore`, synced by bootstrap's git tool; this skill never writes the file.

### Branch name

`$BRANCH_NAME` is the name the caller declared, when it declares one —
`/vwf:execute` names the branch with the plan's name: the `<name>` of a change
plan folder `docs/plans/<date>-<name>/`, or the `<slice>` of a cycle plan
folder `docs/plans/<date>-<HHMM>-<slice>/`. The worktree takes the same name.
Otherwise derive a short
kebab-case slug from the task, show it to the user and confirm it before the
worktree is cut:

```bash
BRANCH_NAME="<declared name, or the confirmed kebab-case slug>"
```

### Create the worktree

Always branch from the **integration branch** `<into>` (the Core Rules), at
its tip on `origin`. After a fetch, cut it. The task cuts a new branch with
no upstream, so the branch stays local:

```bash
git fetch origin
mise x -- mise run git:worktree:create -- "$BRANCH_NAME" --from "origin/<into>" --no-setup
cd "$(git worktree list --porcelain | awk -v b="refs/heads/$BRANCH_NAME" '/^worktree /{p=substr($0,10)} /^branch /{if ($2==b) print p}')"
```

With no `origin` remote, skip the fetch and pass `--from <into>`. Step 2c
runs the setup the `--no-setup` left out.

**Sandbox fallback:** If the task fails with a permission error, report it
and proceed in the current directory instead.

Then **proceed to Step 2b** (submodules).

## 2b. Initialize Submodules (always)

A newly created worktree does **not** inherit the submodules from the main
checkout — a fresh worktree leaves the submodule directories empty. If the repo
uses submodules, populate them in the new worktree before doing any work — they
are required to build and run the project.

Resolve the new worktree's path from git, then init its submodules — skip
silently if the repo has none:

```bash
# Path of the worktree just created for this branch
WORKTREE_PATH=$(git worktree list --porcelain \
  | awk -v b="refs/heads/$BRANCH_NAME" '/^worktree /{p=substr($0,10)} /^branch /{if ($2==b) print p}')

# Only if the repo declares submodules
if [ -f "$WORKTREE_PATH/.gitmodules" ]; then
  git -C "$WORKTREE_PATH" submodule update --init --recursive
fi
```

`git -C "$WORKTREE_PATH"` works from any directory. Having already `cd`'d into
the worktree in Step 2a, `git submodule update --init --recursive` from there is
equivalent.

If a submodule fails to fetch (e.g. no network or auth), report it and ask the
user how to proceed — do not leave a partially-initialized worktree silently.

## 2c. Initialize the Worktree (mise task)

A fresh worktree has no installed dependencies. After submodules are populated,
bootstrap it so it can build and run — prefer the dedicated
`git:worktree:setup` task, falling back to the full bootstrap entrypoint
`setup`:

```bash
have_task() { mise x -- mise tasks --hidden 2>/dev/null | awk 'NR>1 {print $1}' | grep -qx "$1"; }

if have_task git:worktree:setup; then
  MISE_ENV=dev mise x -- mise run git:worktree:setup
elif have_task setup; then
  MISE_ENV=dev mise x -- mise run setup
fi
```

**Why the probe prefers it.** Both tasks run `setup:mise`, the repo's own
`setup:secrets` and `setup:deps` tasks and `setup:precommit`, and neither passes
`--upgrade` here, so each installs only what the lockfiles and configs already
pin. `git:worktree:setup` also checks out the submodules
(`git submodule update --init --recursive`), which `setup` does not, and it
leaves out the `setup:vscode` that `setup` runs when the repo has that task. The
`dev` on each is there because bootstrap loads no `conf.d` file without
`MISE_ENV`. Only `setup --upgrade` upgrades anything, and this probe never
passes it: a worktree is a place to work on a branch, not a place to move a
lockfile.

The name is probed, never constructed. A repo carrying an older spelling of the
task is not broken, but this probe will not find it and the run silently takes
the fallback or skips the step — the toolchain manager's own task library is
where the older spellings are recorded and mapped forward.

Run it from the worktree root. **Skip silently** if neither task exists. If the
task fails, report it and ask the user how to proceed rather than working in a
half-initialized worktree.

## Removing a worktree

A worktree made here is removed with its task, from another checkout:
`mise x -- mise run git:worktree:delete -- <name>`. The task removes the
worktree first, then deletes the branch only when a core branch has each of
its commits. If it exits 1, run `gh pr view <name> --json state,headRefOid`
(or `glab mr view <name> --output json`, reading `state` and `sha`). When
the state is `MERGED` (glab: `merged`), first run `git fetch --prune origin`
when an `origin` remote exists, so the merged head is in the local clone.
Only when that head holds the local tip — it equals
`git rev-parse refs/heads/<name>`, or
`git merge-base --is-ancestor refs/heads/<name> <head>` exits 0 — run the
`git branch -D` command that the task printed. Otherwise keep the branch,
report the failure — a stale local core branch also gives exit 1, and a tip
the merged head lacks is unmerged work — and stop.
