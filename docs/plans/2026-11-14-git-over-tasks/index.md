# Plan — R3b: git-workflow and land.mjs over bootstrap's git:* tasks, with the core branches (2026-11-14)

## Goal

After this plan lands, every git action of vwf runs through bootstrap's
`git:merge:<b>` and `git:worktree:*` tasks, `land.mjs` included; the landing
model is bootstrap's `repo.branches.<b>.landing`; and vwf works in a repo with
`develop`, `main` or both, from `repo.core_branches`. It is the second of
three R3 plans of `docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`,
and it takes the rulings of
`docs/memory/gaps/2026-11-14-one-or-two-core-branches-parked.md`.

## Facts the survey established

- `land.mjs` (`git-workflow/scripts/lib/land.mjs`) makes worktrees with raw
  `git worktree add` (about line 112), merges with
  `mise x -- git merge --no-ff` (about line 251), opens a pull request itself,
  and stashes around a dirty main checkout. Its tests are
  `scripts/src/git-land.test.ts`, run by `pnpm vitest run` in CI.
- bootstrap's merge library (`repo/tools/git/tasks/merge`) refuses a dirty
  checkout (about line 115), runs the whole-tree hook pass, checks out the
  destination in the main worktree, and opens a PR with `gh` or `glab`.
- R2a (bootstrap) renames `code:merge:<b>` to `git:merge:<b>` (a task per core
  branch), `setup:worktree` to `git:worktree:setup`, and adds
  `git:worktree:create|delete|list`, with no aliases.
- After P0, git-workflow reads `[tools.git.branch.<b>].merge_model`; R1a moves
  it to `repo.branches.<b>.landing` (`pr`, `direct-merge`, `direct-commit`).
- `code:merge`, `merge_model` and `setup:worktree` are named in git-workflow,
  init, the hygiene CONTRIBUTING.md, doctor and readme.
- Gates: `code:format`, `code:lint`, `code:precommit`, `pnpm vitest run`.
  Commit types: the ten of `.config/git-conventional-commits.yaml`, no scopes.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc it does not own, never adds a
dependency the plan does not list, never commits. A unit deletes with plain
`rm`, never `git rm` — it stages nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    QUESTION Q<n>: <the question, readable alone>
    OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> | <option 4>]
    WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>

The three QUESTION lines repeat per question, `n` counting from 1 in the
block, with two to four options; a block with no question carries the one
line `QUESTION: none`. A question is a point the plan does not decide and the
unit cannot settle inside its scope; the unit never proceeds on an
assumption.

A unit completes every edit that does not depend on an answer, never builds on
a part an answer can change, then returns all its open questions in one block.
Its edits stay uncommitted in the worktree. The orchestrator asks the user,
records each answer in `decisions`, and resumes the unit with the question ids
and answers; the resumed unit applies them and returns the whole block again.

## Out of scope

- `virajp-plugins`: R3c. Topology and members: R4. Packs: R5.
- This repo's own `.config/` files and release tasks.
- A version bump or a tag.

## Parked

- **Before this plan runs:** this repo must be on bootstrap 4.0.0 and have run
  `bootstrap init` (the hand step of R3a), so that its `git:*` tasks exist.
- After this plan lands, the uncommitted changes of the main checkout stay
  uncommitted and are never part of a merge; a landing stops only when git
  refuses the checkout or the merge (D23).

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-14-git-over-tasks

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
