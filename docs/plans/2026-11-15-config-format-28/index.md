# Plan — R4b: vwf.yaml format 28, the slim stack and projects in bootstrap (2026-11-15)

## Goal

After this plan lands, `.config/vwf.yaml` is `config_format` 28: a project's
stack is a slim decision record (`services` and `deploy` in place of
`backing_template` and `deploy_template`, no `languages` or
`package_manager`); `repo.stack` keeps only its pin; the workspace `harness`
block is gone, a capability being present when its task exists; and
`registry.yaml` (`blueprint_format` 26) has no `path`, a project's folder being
bootstrap's `[projects.<name>]`. `/vwf:setup` migrates a format 27 repo. It is
the second R4 plan of `docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`;
R5 (format 29) removes the pack pins with the packs.

## Facts the survey established

- R4a (`docs/plans/2026-11-15-config-format-27`) leaves the format 27 schema
  in `plugins/vwf/assets/vwf-config.md` and the bootstrap calls of the
  scripts (`spawnSync`, the stub `bootstrap` in the tests).
- bootstrap R2d (bootstrap `docs/plans/2026-11-15-projects`, in bootstrap
  4.0.0): `[projects.<name>]` with `folder` in `repo.toml`; a `projects` list
  per tool in `tools.toml`, filled by `bootstrap detect --add`; `describe`
  gives each tool its `category`.
- bootstrap's language tools are `android`, `bun`, `flutter`, `go`, `java`,
  `kotlin`, `node`, `python`, `rust`, `swift`; its package managers are
  `pnpm` and `aube`. vwf's language tokens today come from the pinned
  template, so the two lists do not match (D6).
- bootstrap R1b's ports include `test:e2e` and `test:golden`; `describe`
  gives each port `present`. vwf's workspace `harness` also lists `dev`,
  `local_stack`, `e2e_staging`, `health`, `screenshots` and `test:load`.
- Readers outside the packs: under `plugins/vwf`, about 15 files name
  `backing_template`, about 10 `deploy_template`, about 25 the workspace
  harness; the registry `path` is read by doctor's `lib/stack.mjs` (about
  lines 160-185) and `execute/scripts/start.mjs` (about line 297).
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

- `stack.template` and `repo.stack.template`, and the packs: R5, format 29.
- `plugins/stackgen/stacks/**`: pack data stays until R5 (D13).
- bootstrap: R2d ships the projects.
- This repo's own `.config/` files.
- A version bump or a tag.

## Hand step before the run

- bootstrap 4.0.0, with R2d, is released and installed on this machine, and
  this repo has run `bootstrap init` (R3a's hand step).

## Parked

- R5: format 29, the stack without packs, requires this plan.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-15-config-format-28

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
