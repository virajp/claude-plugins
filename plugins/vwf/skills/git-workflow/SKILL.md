---
name: git-workflow
description: Manage git workflows — worktree isolation, commits, merges, and
  pushes. Use
  for all substantive changes; never work directly in the main worktree.
argument-hint: "(no args)"
model: sonnet

allowed-tools: Bash Read AskUserQuestion
disable-model-invocation: false
---

# Git Workflow

## Core Rules

- Use a worktree for all substantive changes — never work directly in the main
  worktree
- Worktrees are always created for the **outermost superproject**, never a
  submodule (Step 1 resolves this)
- **A sibling member is its own outermost superproject.** Under a `multi-repo`
  product with `linkage: siblings`, the members are ordinary repos — the
  superproject walk correctly ends at the member, and that is where the worktree
  belongs. The base repo is a **separate** checkout the caller writes to
  directly; it is never reached by walking up from a member
  (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`)
- **Worktrees are bootstrap's tasks' work, never a Claude Code tool's.**
  Create, enter and leave a worktree with
  `mise x -- mise run git:worktree:create -- <name> …`, `cd` and
  `mise x -- mise run git:worktree:delete -- <name>` — never with
  `EnterWorktree`, `ExitWorktree` or an agent's worktree isolation. Such a
  tool branches from origin's default branch rather than the integration
  branch, and its session refuses `git`
- **The integration branch comes from `repo.core_branches`** — the
  `data.value` of `bootstrap config get repo.core_branches --json`. It is
  `develop` when `develop` is in that list, else `main`. With both, work
  moves feature → `develop` → `main`; with one, each feature lands on that
  branch. A core branch that exists only on `origin` gets a local branch that
  tracks `origin/<branch>` before anything lands on it. Every caller that
  names "the integration branch, as git-workflow resolves it" means this
  rule
- **Initialize** every new worktree with its mise bootstrap task (Step 2c), and
  **end** every worktree with full coverage — land the branch (plus any
  submodule work and pointer updates), then remove it (Step 4)
- **How a branch lands is the repo's choice, not this skill's.** The repo sets
  it **per destination** `<b>`: the landing model is the `data.value` of
  `bootstrap config get repo.branches.<b>.landing --json` — `pr`,
  `direct-merge` (the default) or `direct-commit`. `direct-merge` merges the
  branch to the destination and pushes; `pr` pushes the branch and opens a
  pull request instead, merging nothing locally; `direct-commit` also allows a
  commit made on `<b>` itself. A landing always runs
  `mise x -- mise run git:merge:<b> -- <branch>`, and the task applies the
  model itself. This skill reads the model only to tell the user what a
  landing will do (Step 4), and to refuse a direct commit on `<b>` where the
  value is not `direct-commit`
- **The `git:merge:<b>` task refuses a dirty tree** where it runs —
  untracked files, uncommitted changes, or unpushed commits on the branch each
  stop the merge before it touches git. That is not a nuisance: whatever is
  uncommitted at merge time is work the merge commit would claim to carry and
  does not, and the repair belongs on the branch that caused it. Commit or
  clean first, then re-run. The main checkout's uncommitted changes stay
  uncommitted and are never part of the merge. A landing stops when git
  refuses the checkout or the merge, or when the task's whole-tree hook pass
  (`pre-commit run --all-files`) fails or rewrites a file anywhere in the tree
- **No destructive git on the tool's own account.** Nothing here aborts a
  merge, resets a branch, or deletes an unmerged or a remote branch unless the
  user asks. The one exception is `land.mjs`'s own scratch branch — every
  commit after `branch.<name>.vwfLandBase` carries `Vwf-Land: close`:
  `abandon` deletes it, and `finish` deletes it on `origin` too once `gh` or
  `glab` reports its request merged with a head that holds the local tip
- Never push without explicit user request — always ask after a successful
  commit
- Check `no-commit-to-branch` hook in `.config/pre-commit-config.yaml` before
  committing to any branch
- **Never a direct commit on a core branch whose landing is not
  `direct-commit`.** Each branch of `repo.core_branches` is a protected
  branch. A vwf change to one — a plan-queue row, a planner's approved
  folder, anything — is made in its own worktree on its own local branch,
  committed there, and landed with `git:merge:<b>`, and the worktree removed;
  when the landing is `pr`, the task opens a pull request instead, and the
  caller waits for it to merge. The script `scripts/land.mjs` does this, and
  every vwf caller uses it — no other script commits, cuts a branch or adds a
  worktree on a protected branch.
  [Protected-branch writes](references/protected-branch.md)

## Caller Preferences

This command takes **no arguments** — callers parameterize its behavior through
**declared preferences in the invocation text** (e.g. `/vwf:execute`: "isolate
without asking; commit only — never merge/push"). Honor any such declared
preference: it drives the **Step 1** consent (skip the worktree prompt when
isolation is pre-declared), the **Step 2** branch name (use the declared name;
`/vwf:execute` names it with the plan's name, the folder's `<name>` or
`<slice>` without its date) and the **Step 4** post-commit
choice (take the declared action, skip the prompt). Absent a declared
preference, ask as each step specifies.

## Safety Rules

**Never:**

- `--force`, `--no-verify`, `reset --hard`, force-push to a core branch
- Update git config
- Any destructive operation without explicit user request

If hooks fail during a commit: fix the issue, then create a **new commit** —
never `--amend` after a hook failure, never retry with `--no-verify`.

## References

The branches most runs never take. Read one only when the step below, or a
caller's write to a protected branch, routes you into it — a run that lands in
an existing worktree and stops at a commit needs none of them.

| Reference                                     | When to read                                                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [Worktree setup](references/worktree-setup.md) | **Step 2** — only when Step 1 concluded a worktree must be created (`git:worktree:create`, submodules, `git:worktree:setup`) |
| [Protected-branch writes](references/protected-branch.md) | Whenever a change must reach a core branch outside a worktree's own landing — a plan-queue row, a planner's folder — through `scripts/land.mjs` |
| [Landing a branch](references/landing.md)      | **Step 4** — only when the chosen post-commit action is one of the two landing options (submodule order, push, the `pr` path, teardown, stale sweep) |

---

## Step 1 — Detect Existing Isolation

**Before creating anything, check if you are already in an isolated workspace.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside git submodules.
Before concluding anything, resolve whether you are inside a submodule:

```bash
SUPERPROJECT=$(git rev-parse --show-superproject-working-tree 2>/dev/null)
```

**If `SUPERPROJECT` is non-empty, you are inside a submodule.** The worktree
must be created for the **parent repo**, never for the submodule. Move to the
superproject root and re-run the detection from there — every step below
(consent, worktree creation, submodule init) then operates on the parent repo:

```bash
cd "$SUPERPROJECT"
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

If the parent repo is itself nested in a further superproject, repeat until
`git rev-parse --show-superproject-working-tree` is empty — the worktree is
always created at the outermost parent.

**If `GIT_DIR != GIT_COMMON` (and not a submodule):** You are already in a
linked worktree — skip directly to Step 3. Do NOT create another worktree.

**If `GIT_DIR == GIT_COMMON`:** You are in the main checkout. Ask for consent:

> "Would you like me to set up an isolated worktree? It protects your current
> branch from changes."

Honor any existing declared preference without asking again. If declined, work
in place and skip to Step 3.

---

## Step 2 — Create Isolated Workspace

Read [Worktree setup](references/worktree-setup.md) and follow its three
sub-steps in order: **2a** creates the worktree with
`git:worktree:create -- <name> --from origin/<into> --no-setup`, **2b**
populates its submodules, **2c** runs `git:worktree:setup`.

---

## Step 3 — Commit Workflow

Work from the **repository root**.

1. `code:precommit` — run the hooks **before you stage**. The task runs every
   hook over every file git tracks, with no flag, so a change to a tracked file
   needs no staging for it to be seen; a new file is checked once it is
   `git add`-ed, or by the commit hook at commit — and running it first is what
   folds a formatter's reflow and a linter's fix into the very commit you are
   about to write, instead of into a second "fix hooks" commit that means
   nothing to anyone reading the history. Guard it with the same `have_task`
   check Step 2c uses; **skip silently** when the task is absent.

   **Run it twice.** The task fails when a hook fails, and a hook that *fixed*
   a file fails by design — that is how pre-commit reports "I changed something,
   look again". So the first pass is allowed to fail and the second is not: if
   the repeat still fails, a hook found something it cannot fix and that is a
   real stop, not a fixup.

   ```bash
   have_task code:precommit || exit 0
   mise x -- mise run code:precommit || true   # pass 1: may fix, may fail
   mise x -- mise run code:precommit           # pass 2: must be clean
   ```

   The `|| true` belongs **here, on the first pass only** — never inside the
   task. A task that swallows its own failures can never gate anything; a caller
   that ignores one failure it expects, once, still can.
2. `git status` → `git add <files>` (never `git add -A`) — staging comes
   **after** step 1, so what you stage is already what the hooks want
3. `git diff --cached` — review staged changes
4. Read `.config/git-conventional-commits.yaml` for authoritative types and
   scopes — do not invent scopes
5. `mise x -- git commit -m "<type>(<scope>): <description>"`
6. If hooks fail: fix, then **new commit** (never `--amend`, never
   `--no-verify`)

### Commit Format

```text
<type>(<scope>): <description>
```

- Lowercase, imperative mood, under 72 characters, no trailing period
- Scope is optional — omit when the change spans multiple areas

Common types: `feat`, `fix`, `perf`, `refactor`, `revert`, `test`, `ops`,
`docs`, `merge`, `wip`

A specification or a design document is `docs` — there is no `blueprint` type.

---

## Step 4 — Post-Commit Action

**Caller-declared preference.** If the invoker declared a post-commit action
(e.g. `/vwf:execute`: "commit only — do not prompt, never merge or push"), honor
it without asking: take that action and skip the prompt below. This is the only
way the prompt is bypassed.

**Read the landing model before you ask.** What `git:merge:<b>` does is the
repo's setting, held **per destination** `<b>` — the integration branch for a
feature branch, `main` for `develop` landing on `main` — so read the one for
the destination you are about to land on, from the root of the repository
that lands; the base repo and each member have their own:

```bash
mise x -- bootstrap config get repo.branches.<b>.landing --json
```

The model is the envelope's `data.value`: `pr`, `direct-merge` (the default)
or `direct-commit`. The task applies it; this read only words the options
below. When the command fails or its envelope's `ok` is false, stop with the
envelope's `errors` messages as bootstrap gives them
(`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`) and offer no landing
option: a model that cannot be read is not guessed.

Otherwise, after a successful commit, ask the user to choose what to do next via
`AskUserQuestion` with these three options — the first is the same in every
model, the other two are worded by the model you just read for this
destination:

**Under `direct-merge` or `direct-commit` for this destination:**

- **Commit only** — stop here; leave the worktree as-is for continued work.
- **Merge, push & clean up** — land the branch on the destination with
  `git:merge:<b>`, which merges and pushes, then delete the additional
  worktree.
- **Merge, push & keep worktree** — land the branch on the destination with
  `git:merge:<b>`, which merges and pushes, but leave the additional worktree
  open for continued work.

**Under `pr` for this destination:**

- **Commit only** — stop here; leave the worktree as-is for continued work.
- **Push & open PR & clean up** — push the branch and open a pull request, then
  archive/delete the additional worktree.
- **Push & open PR & keep worktree** — push the branch and open a pull request,
  leaving the additional worktree open for continued work.

Under `pr` the task pushes the branch, opens the pull request and **stops** —
nothing is merged, and the change lands only when someone merges that pull
request. So say plainly which you are doing: **clean up** removes the worktree
while the pull request is still open, and **keep worktree** leaves it in place
for review fixes, which is the safer default to suggest when the user has no
preference.

**On a merge conflict (either land sequence).** This applies under
`direct-merge` and `direct-commit` only, where a merge actually happens
locally. If a merge — the outer repo's or a submodule's `git:merge:<b>` task
— **conflicts**, the task exits 1 and leaves the main checkout mid-merge. Do
**not** resolve it autonomously, and run no `git merge --abort`: leave the
merge for the user to resolve and commit, or abort, leave the worktree
**intact**, and report the conflicting files
(`git diff --name-only --diff-filter=U` in the main checkout) to the caller.
Callers treat this as a **hard halt**. Under `pr` nothing merges locally, so
the outer repo cannot conflict here; a submodule that lands under its own
direct model still can, and the same hard halt applies to it.

Execute the chosen action:

### Commit only

Nothing further. Inform the user the commit is done and the worktree remains
available.

### The two landing options

Read [Landing a branch](references/landing.md) and follow the sequence for the
chosen option — submodules first, then the outer repo's pointers and its
`git:merge:<b>` task; under a direct model for the destination that task
merges and pushes, under `pr` it pushes and opens the pull request.
**Clean up** additionally removes this worktree and sweeps stale ones,
**keep worktree** leaves it in place.

---

## Useful Commands

| Situation                             | Command                             |
| ------------------------------------- | ----------------------------------- |
| Save unfinished work temporarily      | `git stash` / `git stash pop`       |
| Clean up WIP commits before merge     | `git rebase -i <base>`              |
| Find which commit introduced a bug    | `git bisect start` / `good` / `bad` |
| Inspect a file's change history       | `git log -p -- <file>`              |
| Undo last commit, keep changes staged | `git reset --soft HEAD~1`           |
| View branch divergence                | `git log --oneline --graph --all`   |
