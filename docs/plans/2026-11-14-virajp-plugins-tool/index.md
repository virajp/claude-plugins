# Plan — R3c: vwf repos add the virajp-plugins tool, and the plugin handoff goes through bootstrap config (2026-11-14)

## Goal

After this plan lands, `/vwf:init` adds bootstrap's `virajp-plugins` tool to
the base repo, so vwf's `.gitignore` lines and its plugin entry come from
bootstrap; doctor checks the vwf plugin at any scope and the tool's ignore
lines; stackgen's plugin handoff writes the claude tool's values through
`bootstrap config` and runs `setup:ai`; and the docs describe the declarative
`setup:ai`. It is the last of three R3 plans of
`docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`, and it takes the
parked record of bootstrap's R2c
(`docs/memory/gaps/2026-11-14-plugins-add-virajp-plugins-parked.md` in the
bootstrap repo).

## Facts the survey established

- bootstrap's R2c moves vwf's `.gitignore` lines and the `vwf@virajp-plugins`
  entry into a selectable `virajp-plugins` tool; `setup:ai` installs what the
  claude tool lists, records the project plugins it installs in
  `plugins.installed`, uninstalls them at project scope when they leave the
  list, updates only with `--update`, and makes no pnpx call.
- After R3a, stackgen's handoff still gives the plugin verbs
  `bootstrap: add|remove <scope> plugins […]` and the key
  `[claude.plugins.<scope>]` (`bootstrap-handoff.md`, about lines 50-60 and
  94-115).
- `installer/CLAUDE.md` (about lines 25-31) and `readme.md` (about 141)
  describe the pnpx call inside `setup:ai`; `CLAUDE.md` (about 298, 429-431)
  describes `setup:ai` and a pack's plugin without the R2c rules.
- Eight vwf passages say that bootstrap's git tool syncs vwf's ignore lines.
- A repo shaped before this plan has no `virajp-plugins` tool; after bootstrap
  4.0.0 it loses vwf's `.gitignore` lines at its next sync. The user can have
  vwf installed at user scope on the machine.
- Gates: `code:format`, `code:lint`, `code:precommit`. Commit types: the ten
  of `.config/git-conventional-commits.yaml`, no scopes.

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

- The installer's code (`installer/src/`): it stays the one-shot.
- Topology and members: R4. Packs: R5.
- This repo's own `.config/` files.
- A version bump or a tag.

## Parked

- None.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-14-virajp-plugins-tool

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
