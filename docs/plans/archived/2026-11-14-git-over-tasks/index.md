# Plan — R3b: git-workflow and land.mjs over bootstrap's git:* tasks, with the core branches (2026-11-14)

## Goal

After this plan lands, every git action of vwf runs through bootstrap's
`git:merge:<b>` and `git:worktree:*` tasks, `land.mjs` included; the landing
model is bootstrap's `repo.branches.<b>.landing`; and vwf works in a repo with
`develop`, `main` or both, from `repo.core_branches`. It is the second of
three R3 plans of `docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`,
and it takes the rulings of
`docs/memory/gaps/2026-11-14-one-or-two-core-branches-parked.md`.

## Amended 2026-11-18

This repo moved to bootstrap 4.1.1 (commit df7ea322) and R3a landed after
approval. The amend re-surveyed both and added D36 to D42: `land.mjs` runs no
destructive raw git (D36), rebases its own branch before the merge task
(D37), keeps a failed push's merge commit (D38), takes git's default merge
subject (D39), and stops on a missing port with the contract asset's new hint
(D40); the gates use `--all` (D41); D42 corrects the facts below. The rulings
review added D43 (`abandon` discards only `land.mjs`'s own scratch), D44
(`finish` reads `gh` or `glab`), D45 and D47 (fixes), D46 (no retry of an
unpushed merge), D48 (`finish` deletes its own merged scratch on origin) and
D49 (fixes); after the fourth round the user accepted the seven rulings of
D50. The priority is 10: the required R3a plan is archived.

## Facts the survey established

The 2026-11-18 survey; line numbers are about.

- `land.mjs` (`git-workflow/scripts/lib/land.mjs`, 400 lines) makes worktrees
  with raw `git worktree add --no-track` (line 119), merges with
  `merge --no-ff` (lines 257-258), opens a pull request itself (lines
  268-290), retries a rejected push (lines 27, 343-356), and stashes around a
  dirty main checkout (lines 152-240). `finish` deletes the branch on origin
  and locally with no merge check; `abandon` deletes its branch. Commit
  47bf7813 added submodule support (`mainCheckout`, line 75) and its tests
  (`scripts/src/git-land.test.ts` lines 290-333). Tests run by
  `pnpm vitest run` in CI.
- bootstrap 4.1.1's tasks are in `.config/mise/tasks/git/` and the library
  `.config/mise/tasks/_scripts/merge`, byte-identical to bootstrap's source.
  The merge library refuses a dirty checkout where it runs from (lines
  312-326), runs `pre-commit run --all-files` there (lines 89-138), changes to
  the main worktree (lines 301-310), pulls `<into>`, merges with
  `--no-ff --no-edit` (line 394), and pushes. On a conflict it exits 1 and
  leaves `MERGE_HEAD` in the main checkout (lines 390-400); on a failed push it
  exits 1 and leaves the merge commit on local `<into>` (lines 403-409). Under
  `pr` it pushes the branch and runs `gh pr create` or `glab mr create`, and
  exits 0 with no request when neither exists (lines 145-178). It prints plain
  text only.
- `git:worktree:create -- <branch> [--from <base>] [--no-setup]` uses
  `git worktree add -b` with no `--no-track` (line 78), so a branch cut from
  `origin/<into>` tracks it. `git:worktree:delete -- <branch>` removes the
  worktree first, then refuses a branch no core branch contains and prints
  `git branch -D <branch>` with exit 1 (lines 56-86).
- `bootstrap config get <key> --json` prints the contract envelope; the value
  is `data.value`. This repo: `repo.core_branches` is `["main", "develop"]`;
  `repo.branches.develop.landing` is `direct-commit`; `main` reads the default
  `direct-merge`. The values are `pr`, `direct-merge` and `direct-commit`.
- `bootstrap contract --json` lists the ports `git:merge:<branch>` and
  `git:worktree:create|setup|delete`; `bootstrap describe --json` lists
  `data.ports[].present`. `plugins/vwf/assets/bootstrap-contract.md` names
  neither.
- `code:merge`, `merge_model`, `[tools.git.branch.*]`, `read_merge_model` and
  `setup:worktree` are named in git-workflow, init, the hygiene
  CONTRIBUTING.md, doctor, readme and the docs; every hit in `plugins/` is in
  a file a unit owns.
- Gates: `code:format --all`, `code:lint --all`, `code:precommit`,
  `pnpm vitest run`. Without `--all`, `code:format` and `code:lint` examine
  only uncommitted files. Commit types: the ten of
  `.config/git-conventional-commits.yaml`, no scopes.

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

- **Satisfied 2026-11-18:** the precondition that this repo is on bootstrap
  4.0.0 or later with its `git:*` tasks (it is on 4.1.1, commit df7ea322).
- **bootstrap follow-up (D39):** bootstrap's `git:merge:<b>` task takes a
  message flag for the merge commit's subject; then `land.mjs` passes
  `--message` to it.
- **The user's own files (D7):** this repo's release tasks
  (`.config/mise/tasks/p/release`, `p/plugins/release`, `p/site/release`,
  `p/i/release`) and `.github/workflows/deps-update.yml` still call the
  removed `code:merge:main` and read the removed `.config/bootstrap.toml`, so
  a release fails until the user moves them to `git:merge:main` and
  `bootstrap config get repo.branches.main.landing`.
- After this plan lands, the uncommitted changes of the main checkout stay
  uncommitted and are never part of a merge; a landing stops when git refuses
  the checkout or the merge, or when the task's whole-tree hook pass fails
  (D23, D45).

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
