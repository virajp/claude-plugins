# Plan — R4a: vwf.yaml format 27, the repo facts move to bootstrap's repo.toml (2026-11-15)

## Goal

After this plan lands, `.config/vwf.yaml` is `config_format` 27: product,
topology, members and environments live in bootstrap's
`.config/bootstrap/repo.toml`, read and written through `bootstrap config`;
`linkage` and `.config/vwf-membership.yaml` are gone; and `/vwf:setup`
migrates a format 26 repo. It is the first of two R4 plans of
`docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`; R4b (format 28)
slims the project stack and removes the workspace harness, and R5 (format 29)
removes the pack pins with the packs.

## Facts the survey established

- The format 26 schema is `plugins/vwf/assets/vwf-config.md` (about lines
  51-162). Under `plugins/vwf`, 55 files name a moved key or
  `vwf-membership` (69 files name `members`, many in other senses).
- bootstrap R1a's `repo.toml` has `product_name`, `topology`,
  `topology_reason`, `[members.<name>]` (`folder`, `type` = `submodule`,
  `folder` or `sibling`, `url`, `label`, `worktree_install`), `[home]` in a
  submodule or sibling member (written by that member's sync), `release_env`
  and `[deploy.<env>]` (`<project> = <url>`). R1a's `init` already moves
  bootstrap's old `[member.*]`, so a value can already be in `repo.toml`.
  `repo.environments` is bootstrap's list of mise environments, not vwf's.
- Scripts that read `members`: doctor's `scripts/`, `execute/scripts/start.mjs`
  and `plan-management/scripts/lib/queue.mjs`, each able to run a command with
  `spawnSync`; their tests are `scripts/src/doctor-checks.test.ts`,
  `execute-start.test.ts`, `plan-queue.test.ts` and `plan-yaml.test.ts`.
- The progress pane (`hooks/monitor/plan.ts`, `register.tsx`) reads
  `vwf.yaml` and `vwf-membership.yaml` with `$.fs.read` and runs no command.
  Its local gate is `claude plugin test plugins/vwf`.
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

- The project stack slim (`backing_template`, `deploy_template`, `languages`,
  `package_manager`), `repo.stack` other than its pin, and the workspace
  `harness`: R4b, format 28.
- `stack.template` and `repo.stack.template`: R5, format 29 (D1).
- stackgen, except the D15 back-link (D27), and this repo's own `.config/`
  files.
- A version bump or a tag.

## Parked

- R4b: format 28, the stack slim and the harness removal, requires this plan.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-15-config-format-27

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
