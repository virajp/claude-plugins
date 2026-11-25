# Plan — Every bootstrap write quotes its values and checks its key names (2026-11-23)

## Goal

After this plan lands, every bootstrap write that a vwf or stackgen skill makes
quotes its value and checks each name that goes into a key path, under one rule,
`## Passing values` of `bootstrap-contract.md`. Printed commands follow the same
rule, and doctor's `project-folder` remedy prints no command for a bad name. Gap
G2 of `2026-11-15-vwf-over-bundles` is closed. The security engine rated the gap
a command injection, high, confidence 8. No standing decision is reversed.

## Facts the survey established

- `bootstrap config set` takes the value as one positional argument, with no
  stdin or file form. Every bootstrap write in both plugins is a prose
  instruction to the model. No script runs `config set` or `add tool`; every
  process call uses `spawnSync` with an argument array and no shell.
- The only quoting rule today is step 4 **Quote.** of `## Declare the addons`
  in `plugins/vwf/skills/setup/references/materialize.md` (about lines
  209-214). Step 3 there checks the `<name>@<marketplace>` keys of a JSON
  value. Line 156 points to step 4.
- Writes with no rule, by file (about line numbers):
  - setup: `migrate-pipeline.md` 109, 121, 123, 165, 204, 205, 210;
    `onboard-pipeline.md` 43-44, 157; `SKILL.md` 305, 309;
    `workspace-structure.md` 63, 81, 88; `materialize.md` 143 (`add tool` with
    a name from a bundle, no catalog check).
  - `architecture/SKILL.md` 406-409, 428; `verify/SKILL.md` 60;
    `execute/references/land.md` 93, 101, 113;
    `plan/references/delta-checks.md` 70; `init/SKILL.md` 452, 455;
    `init/references/new-repo.md` 65.
  - stackgen `stackgen-stack-template/references/bootstrap-handoff.md` 64, 82,
    103: tool names are checked against `bootstrap catalog --json` (lines
    18-21); `--answer` values have no rule.
- `doctor/scripts/lib/stack.mjs` about line 403 builds the remedy
  `bootstrap config set repo.projects.${name} '{"folder":"<path>"}' --json` as
  text, displayed, not run. `name` comes from the registry; `<path>` is a
  literal placeholder. Its tests are in `scripts/src/doctor-checks.test.ts`.
- `bootstrap-contract.md` exists in both plugins with the same body, except
  vwf's pane exception and vwf's section `## The git ports`. The sentence near
  the top of each copy names only the pane exception (D19 fixes it).
- `bootstrap config set` stores the string that the shell passes: a
  single-quoted value is stored exactly, with no command run inside it; a JSON
  value is parsed into a table (D11, checked 2026-11-23).
- No user-facing doc mentions the quoting rule.
- `plugins/**/*.md` is excluded from `code:format` and `code:lint`; its fold
  width is matched by hand. Commit types are those of
  `.config/git-conventional-commits.yaml`, with no scope.

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
line `QUESTION: none`. A question is a point the plan does not decide and the
unit cannot settle inside its scope; the unit never proceeds on an
assumption.

A unit completes every edit that does not depend on an answer, never builds on
a part an answer can change, then returns all its open questions in one block.
Its edits stay uncommitted in the worktree. The orchestrator asks the user,
records each answer in `decisions`, and resumes the unit with the question ids
and answers; the resumed unit applies them and returns the whole block again
(the execute skill's `references/questions.md`).

## Out of scope

- `init/assets/hygiene/CONTRIBUTING.md` and `CONTRIBUTING-one-branch.md`: docs
  for people, not commands a skill runs.
- A script that builds and runs bootstrap commands in place of the prose
  instructions: a larger change, not asked for.

## Parked

- `/vwf:architecture` has no step that renames a registry project. The
  reports of D6, D21 and D28 name the route by hand until a later plan adds
  one: `docs/memory/gaps/2026-11-25-architecture-has-no-project-rename-parked.md`.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-23-bootstrap-value-quoting

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
