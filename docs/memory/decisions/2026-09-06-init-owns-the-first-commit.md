# Decision — `/vwf:init` owns the first commit and the branch model

**Date** 2026-09-06 · **Branch** `2026-09-05-astro-static` · **Plan**
[`docs/plans/2026-09-05-astro-static/`](../../plans/2026-09-05-astro-static/index.md)
· **Reverses** `new-repo.md:20`, *"Nothing else in this pipeline touches git
history"* · **Umbrella**
[`2026-09-05-vwf-init-and-the-repo-shape.md`](./2026-09-05-vwf-init-and-the-repo-shape.md)

## What was decided before

`init` created the repository — default branch `main`, `develop` off it — and
then never touched git again. It wrote files and left them unstaged. The first
commit was somebody else's problem.

## What was measured

The first real greenfield run (`virajp.dev`, 2026-09-05) reported five defects;
the 2026-09-06 survey found nine and measured the causes rather than taking them
on report. Four of them are this decision's:

- **`git branch develop` off an empty `main` is impossible.** §1 ran before
  anything was written and nothing committed after, so HEAD was unborn and the
  second branch had nothing to point at.
- **The shipped branch guard blocks whoever makes the first commit.** The gates
  pack ships `no-commit-to-branch --branch main` at the commit stage, with no
  `stages:` override.
- **A `main`-only repo cannot merge.** `code:merge:develop` passes every
  predicate, runs the whole-tree hook pass, hops to the main worktree, and dies
  at `git checkout develop` with no restore. `code:merge:main` dies earlier.
- **The fragment merge leaves the pre-commit config modified-but-unstaged**,
  which aborts *every* commit, including the one that would have staged it.

## What changed

`init` gains a **git pass** — §11 of the new-repo pipeline, the last step before
the report, and the only step besides §1 that touches git at all.

**The branch sequence** (D16). The user's ruling, verbatim:

> If the git is empty, start with `develop` and NOT `main`. Once a commit is
> done, add `main`.

> No matter which is default branch, work must flow from feature
> branches/worktree to develop to main.

So §1 creates the repository on `develop` and stops — no second branch, no
commit, no remote — and §11 creates `main` from the first commit. The mechanism
and the model agree: a repository with no commit has an unborn HEAD, *and* the
branch a fresh repository sits on should be the one work lands in. An existing
repo gets whichever of the two it lacks, created after the commit, from the one
it has. Both branches exist afterwards whichever way the repo arrived, because a
repo missing one has merge tasks that cannot run.

**The two consents** (D18). The user's ruling:

> At the end of `init`, ask user to commit (local commit, push, etc)

One question, three answers — **commit**, **commit and push**, **leave it** —
asked with the file count and the branch shown first, so it is answered against
facts rather than a promise. Push is a second decision inside one question,
never an assumed consequence of committing. The message is fixed:

```text
ops: shape the repo with the toolchain, gates and hygiene baselines
```

`ops` because the commit-message gate's closed type set is what the gate this
run just installed reads it against.

**The gate configuration commits first, alone**, on an existing repo. The user's
ruling:

> When there's a change in `.config/pre-commit-config.yaml`, it must be
> committed independently (along with it's dependencies like
> `.config/git-conventional-commits.yaml`)

That is defect 9's fix, and it travels with the commit-message gate's config and
the fragment directory because they are one change: the fragment merge is what
the gate config's marked blocks hold, and the commit-message config is what the
gate config invokes.

**The branch guard ships unchanged** (D19). On the new-repo path the first
commit precedes hook wiring *by construction* — §9 makes the task library
discoverable and wires nothing; §10 offers the bootstrap aggregator, which is
what installs the hooks, *after* §11's commit. So the guard is not in place yet
and never sees that commit. Nothing is disabled, nothing is skipped, and no
verification-skipping flag is ever passed. *Rejected:* shipping the hook at
`stages: [manual]`, on the precedent of `check-hooks-apply`; and guarding
`develop` too.

**The forge default** (D17). The user's ruling:

> Ask user which branch must be default branch in remote … with `develop` being
> default selection.

`init` asks, with `develop` preselected, and then runs the toolchain pack's own
task — `mise run setup:default-branch <answer>` — reporting **only what the task
reported, verbatim**. The task sets it where it finds a forge CLI and a remote,
and prints the command where it does not. `init` never inspects the forge, never
names one, and never chooses between CLIs: that knowledge is the pack's, and
putting it in a vwf skill is exactly the naming checker rule 10 forbids. The
question is asked even where there is no remote, because the answer is a
decision about the repository and re-asking after a remote appears is a question
already answered.

**The merge predicate** (D21). `_scripts/merge` gains one predicate before the
hook pass — the destination branch must exist locally — naming the two-branch
model. Asked there rather than left to the checkout, so a repo whose branches
were never laid out fails in one command instead of after a whole-tree hook run
with no restore.

## What stays outside

- **`init` never writes to `~/.config`.** The per-repo launch aliases are the
  user's global configuration, reading `REPO_NAME` out of the repo.
  `setup:vscode` writes to the editor's profile store, which is what the profile
  mechanism is for, and nowhere else.
- **`init` never resolves a conflict.** A merge left mid-way is a judgement call
  a pipeline cannot make.
- **`init` never pushes without the second consent**, never rewrites history,
  and never force-pushes.
- **Init still writes no CI workflow**, no language manifest and no lockfile.
  That half of the charter fence did not move.

## The re-run doctrine that rode with it

The user's ruling: *"`init` must be run at regular interval to keep everything
in sync"*. `init` gains a **When to run it again** section naming the moments —
after the registry exists, after a pack version moves, on a fresh clone that
reports drift, and whenever `/vwf:doctor` says so — and `/vwf:doctor` gains the
finding that says it: the adapter lockfile against installed packs, registry ids
against the commit scopes and the task groups, a missing `develop` or `main`, an
unfilled `REPO_NAME`. Every row is `drift`, none is blocking, and all four share
one remedy printed once. A repo behind its baseline is out of date, not broken.

Idempotence is now claimed **per id source**. A run after `/vwf:architecture`
resolves ids from the registry that an earlier run resolved from directories or
from the repo's own name, and the rename rows say **"id source changed"** in
those words — never "a pack moved", which is the adapter's re-sync conversation
and a different kind of row entirely.
