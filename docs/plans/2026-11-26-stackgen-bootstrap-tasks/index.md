# Plan — stackgen names only what a bootstrap-synced repo has (2026-11-26)

## Goal

After this plan lands, each skill, task and check that stackgen ships names
only tasks, files and tool commands that a bootstrap-synced repo has. The five
pack tasks are Python uv scripts in bootstrap's M48/M51 form, the wrong task
and package names are fixed, the generator tells a generated skill to name no
task, and checker rules 11 and 17 match bootstrap.

The user asked to fix the skills that stackgen generates for mise and other
tools, now that bootstrap owns the mise config and creates the tasks. The
survey found that stackgen lands no mise skill today: the old `tool-config`
landed `.claude/skills/mise/SKILL.md`, and it went when `tool-config` was
deleted (2026-11-03).

**Reversal (D14):** `docs/memory/decisions/2026-10-01-repo-local-mise-skill-returns.md`
gave the repo-local mise skill to stackgen. The user rules that bootstrap
owns and generates it; stackgen lands none. The planner session writes the
handoff prompt in bootstrap's `docs/prompts/` before the run (D4).

## Facts the survey established

- **bootstrap's task names.** Per-tool parts are `code:format:NN-<name>`,
  `code:lint:NN-<name>`, `setup:deps:NN-<name>`, `test:golden:NN-<name>`,
  `test:e2e:NN-<name>`; the aggregators (`setup`, `code`, `code:format`,
  `code:lint`, `test`, `test:e2e`, `test:golden`) come from the `mise` tool.
  Python is formatted by dprint's ruff plugin (`code:format:05-dprint`) and
  linted by ruff (`code:lint:70-ruff`).
- **bootstrap M48/M51.** The shell libraries of `_scripts/` are gone and the
  sync removes them; every repo-owned task is a Python uv script `<name>.py`
  that imports `helpers.py` (`~/Projects/github.com/virajp/bootstrap/docs/sync/migrate.md`).
- **The five pack tasks** are bash: `p/_project/deploy` of workers-ssr,
  workers-static-assets and containers (each sources the retired
  `_scripts/helpers` at :12), and `p/_project/icons` of astro and html.
- **Checker.** Rule 11 (`checkPackConfigTier`, `scripts/src/check.ts`)
  accepts the shebangs `bash`, `node`, `python3` (`PACK_TASK_SHEBANGS`,
  :345); rule 17 (`checkBareMiseUse`, about :2006-:2040) tells the agent to
  enter the tool into the config by hand.
- **Wrong names.** eslint names `npm:@askviraj/linter` (bootstrap pins
  `@virajp.dev/linter`); ruff's seam says ruff formats under `code:format`;
  flutter names `tests:unit`; fnox names `e2e:local`; github-actions says
  every pin is exact and is written into the config by hand.
- **Harness contract.** `dev` and `stack:up` are vwf harness task names
  (`plugins/vwf/assets/harness.md`), which the repo writes; `e2e_local` is the
  `test:e2e` port.
- **Gates.** `mise x -- mise run code:format --all`, `code:lint --all`,
  `code:precommit`; `vitest run` covers `scripts/src/check.test.ts`;
  `p:plugins:check` and `p:plugins:inventory --check` run in pre-commit.
- **Commit convention.** `.config/git-conventional-commits.yaml`: `feat`,
  `fix`, `perf`, `refactor`, `revert`, `test`, `ops`, `docs`, `merge`, `wip`.
- No backlog item covers this request (B122 is about other pack faults).

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc, never adds a dependency the plan
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never writes a lock file — the file a package
manager or a toolchain manager writes to pin what it resolved — with Write,
Edit, `sed` or a script: a lock file changes only as the output of the CLI
that owns it, the command the stack's package-manager conventions name, and
the unit keeps what that CLI wrote. A unit whose manifest change moves a lock
file lists that lock file in its `owns` beside the manifest.

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
answer, never builds on a part an answer can change, then returns all its
open questions in one block. Its edits stay uncommitted in the worktree.

## Out of scope

- The mise skill itself — bootstrap owns it (D14); the planner session hands
  the item to bootstrap (D4).
- Shipped skills dropping their task names — the user ruled shipped skills
  keep them (D3b).
- Rule 14 does not check the `tools:` list of a `tool.yaml` against
  bootstrap's snapshot — not asked for.
- B122 — other pack faults that no checker rule finds.

## Parked

- The move of the Cloudflare packs from Wrangler to `cf` — planned next as its
  own folder that requires this one (D35).

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-26-stackgen-bootstrap-tasks

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
