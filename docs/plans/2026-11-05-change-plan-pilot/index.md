# Plan — skill-kit pilot: rewrite change-plan with the rule ledger (2026-11-05)

## Goal

`change-plan` loads fewer words on each run, a settled ledger proves that it
keeps every rule that the user did not drop, and `stats.md` shows the before and after numbers. Behavior
does not change. This is the first real test of the `skill-kit` ledger.

No reversal. The word budget is the "no line caps" narrowing that the user ruled
on, on 2026-11-05.

## Facts the survey established

**Before numbers**, measured on 2026-11-05 at `8d81706d`:

| Measure                        | Before |
| ------------------------------ | ------ |
| `SKILL.md` body words          | 4,912  |
| Always-loaded words            | 4,912  |
| Total words                    | 5,082  |
| `SKILL.md` bytes               | 31,097 |
| Description chars              | 924    |
| Files in the skill             | 1      |
| Lint errors                    | 2      |
| Long sentences (ST101)         | 76     |
| Ledger entries                 | 123    |

- **Tools:** `.claude/skills/skill-kit/`. Run its scripts from the worktree root.
- **No gate reads the prose:** no test or checker asserts on the text of
  `change-plan`, its headings, or its section numbers. The rules that touch the
  file are generic: checker rule 4 (strict YAML), rule 6 (root-relative paths)
  and rule 12 (retired vocabulary).
- **Citations to keep:** other files cite `plugins/vwf/assets/plan-interview.md`
  by "interview item N" (items 2a, 2b, 12, 17, 18). This plan does not edit that
  file, so these stay valid. Old decision docs cite "§8" and "§4(b)" of this
  skill. They are history, and no unit edits them.
- **Conventions:** a vwf skill cites its own references by relative link, and
  other plugin files by `${CLAUDE_PLUGIN_ROOT}/…`. dprint excludes
  `plugins/**/*.md`, so match the fold width of 80 by hand.
- **Commit types:** `feat`, `fix`, `perf`, `refactor`, `revert`, `test`, `ops`,
  `docs`, `merge`, `wip`. The repo lists no scope.
- **Dependencies:** none are new.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc, never adds a dependency the plan
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never writes a lock file.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- Any other skill. This is the pilot, and the rest of the rollout needs the
  result.
- Any behavior change in `change-plan`. A rewrite and a change need separate
  reviews.
- Changes to `.claude/skills/skill-kit/`. A proof tool that changes during its
  own proof proves nothing.
- Edits to old decision docs that cite "§8". They are history.
- `plugins/vwf/assets/plan-interview.md` and `plan-folder.md`. A rule that only
  the skill holds stays in the skill.

## Parked

- B108: the rest of the rollout: `execute`, the other large skills, one plan for
  the packs with descriptions and bodies together, then enforcement.
- The hand-off and self-review text that `plan` and `change-plan` share can move
  to one reference, in a later plan.
- The `design-import-*` and `ux-gate` contracts have no contract file, so AD602
  stays open until the pack plan writes them.
- `change-plan` §4(a) and `plugins/vwf/assets/templates/plan-folder.md:89` tell
  planners to write `code:precommit --all`. The task takes no such flag, and it always uses
  `--all-files`. The rewrite keeps this text, because behavior must not change.
  Fix the source in a later plan.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-11-05-change-plan-pilot

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
