# Plan — The default vwf gate lines examine every file (--all) (2026-11-18)

## Goal

After this plan lands, each default unit and wave gate line that `/vwf:plan`
and `/vwf:change-plan` propose examines every file of the repository
(`--all`), so a gate on a clean worktree does not examine an empty set. The
request is item 4 of the bootstrap prompt
`docs/prompts/2026-11-18-claude-plugins-bootstrap-4.md` and the bootstrap gap
`docs/memory/gaps/2026-11-15-vwf-gates-all-parked.md` (both in the bootstrap
repository). There is no reversal.

## Facts the survey established

- From bootstrap 4.0.0 on, `code:format` and `code:lint` examine only the
  uncommitted files (staged, changed and new) when they get no files and no
  `--all`. With `--all`, they examine every file of the repository.
- The default gate lines are in four plugin files:
  `plugins/vwf/skills/change-plan/references/gates-consent.md:17-18`,
  `plugins/vwf/skills/plan/references/plan-doc.md:33-34`,
  `plugins/vwf/assets/templates/plan-folder.md:88-89` and `:198-199`. The
  example line of `plugins/vwf/skills/execute/references/action-log.md:100`
  shows the wave gate.
- `/vwf:execute` has no gate line of its own. It runs the lines of the folder.
- The hygiene asset `plugins/vwf/skills/init/assets/hygiene/CONTRIBUTING.md:71-72`
  says that `code:format` runs "every formatter, over what it owns".
- The docs that describe the defaults:
  `site/src/content/docs/plugins/vwf.md:3501`,
  `site/src/content/docs/how-to/operate/ad-hoc-change.md:120` and
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:48`.
- This repo had bootstrap 3.3.1 tasks on 2026-11-18. Its
  `.config/mise/tasks/code/format/_default` passes each argument to dprint as
  a file, so `--all` fails there until this repo adopts 4.0.0 (R3a D15).
- The stackgen pack texts that name `mise run code:lint` say which tool the
  task runs. That stays true.
- `plugins/**/*.md` is not formatted: re-pad a table by hand.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc, never adds a dependency the plan
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never writes a lock file with Write, Edit, `sed` or a
script.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    QUESTION Q<n>: <the question, readable alone>
    OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> | <option 4>]
    WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>

The three QUESTION lines repeat per question, `n` counting from 1 in the
block, with two to four options; a block with no question carries the one
line `QUESTION: none`. A unit completes every edit that does not depend on an
answer, then returns all its open questions in one block. Its edits stay
uncommitted in the worktree.

## Out of scope

- The gate lines of the queued plans (D4): their gates still pass, but examine
  fewer files.
- The stackgen pack texts that name `code:lint` or `code:format` (D7).
- A check in `/vwf:execute` that refuses a gate line without `--all` (D3).
- The CONTRIBUTING.md of a repo that already has one keeps its old comment,
  because `/vwf:init` never rewrites a present asset (D12).
- The other items of the bootstrap prompt. Items 1 and 2 belong to R3a, R3b,
  R3c and R4a; item 3 to R5a and the next folder (the LSP check, B150).

## Parked

None.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-18-gates-all

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
