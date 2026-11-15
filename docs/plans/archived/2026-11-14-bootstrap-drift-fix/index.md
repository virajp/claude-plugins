# Plan — P0: fix the plugins' drift against today's bootstrap (2026-11-14)

## Goal

After this plan lands, every reference in the plugins to a bootstrap key, path,
instruction verb, clone flag or dry-run output line matches bootstrap as it is
today. git-workflow reads `merge_model` from `[tools.git.branch.<branch>]`, so a
repo with `merge_model = "pr"` on `develop` lands through a PR.

This is phase P0 of the design in
`docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`. It fixes defects
that exist today and does not wait for the new design (R1 onwards). There is no
reversal of a standing decision.

## Facts the survey established

- bootstrap renamed `[branch.<b>]` to `[tools.git.branch.<b>]`,
  `commit_scopes` to `[tools.git].commit_scopes` and `[claude.plugins.<scope>]`
  to `[tools.claude.plugins.<scope>]` (bootstrap `docs/sync/migrate.md` M34,
  `docs/design/bootstrap-config.md`). It removed `[overrides.gitignore]`.
- git-workflow's `read_merge_model()` reads `.branch[B].merge_model`, so a
  migrated repo always reads `direct`
  (`plugins/vwf/skills/git-workflow/SKILL.md:223`).
- The bootstrap clone has `repo/packs.toml` and `repo/tools/<tool>/tools.toml`.
  `docs/sync/vwf.md` uses `bootstrap: add [..]`, `bootstrap: remove [..]` and
  `git clone --filter=blob:none`.
- The bootstrap CLI replaced repo-sync. A dry run prints, on stderr, list lines
  with the words `would change`, `would add`, `would seed` or `would remove`, an
  info line `bootstrap_commit would change to <commit>`, and a headline
  `Dry run: no file would change` or `Dry run: <n> file(s) would change`
  (bootstrap `docs/design/cli.md`, "The output of a run"). A values file in an
  old form makes the command stop with code 2 and "run bootstrap init".
- bootstrap's `code-precommit` task and this repo's synced copy declare no flag
  and always run `pre-commit run --all-files`.
- No stale reference is in executable code of the plugins or in test fixtures.
  The fixtures already use plain `code:precommit`.
- The gates: `code:format`, `code:lint`, `code:precommit`, `p:plugins:check`,
  `p:plugins:marketplace`, `p:plugins:inventory`. `plugins/**/*.md` is not
  dprint-formatted; `CLAUDE.md`, `readme.md` and the site pages are.
- The commit convention (`.config/git-conventional-commits.yaml`) lists ten
  types and no scopes.

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
answer, then returns all its open questions in one block.

## Out of scope

- This repo's own `.config/bootstrap.toml` and the four release tasks
  `.config/mise/tasks/p/release`, `p/plugins/release`, `p/i/release` and
  `p/site/release`, which read `.branch.main.merge_model`. The user edits
  `.config/` files by hand (hand step below).
- The synced `.config/mise/tasks/_scripts/merge`, which reads the old key: a
  bootstrap sync refreshes it.
- Any change to the bootstrap repo.
- Everything from phase R1 onwards: the `.config/bootstrap/` folder, the
  `bootstrap config` verb, the contract, `git:*` tasks, packs.

## Parked

- The rulings of the retired DRAFT plan `2026-11-13-one-or-two-core-branches`
  belong to R3: `docs/memory/gaps/2026-11-14-one-or-two-core-branches-parked.md`.
- **Hand step for the user, after this plan lands:** migrate this repo's
  `.config/bootstrap.toml` to the current form (`[branch.develop]` becomes
  `[tools.git.branch.develop]`, `extensions` and `[overrides.gitignore]` go,
  per bootstrap M34), and change the `yq` read in the four release tasks to
  `.tools.git.branch.main.merge_model`. Until then the docs and the tasks
  differ (D5).

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-14-bootstrap-drift-fix

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
