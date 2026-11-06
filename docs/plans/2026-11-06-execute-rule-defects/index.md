# Plan — Fix the rule defects of execute (2026-11-06)

## Goal

The rules of `execute` agree with each other, and an unattended run has no
prompt or stop that its rules do not name. This plan finishes B111.

**Reversal:** an all-blocking gap (H6) no longer pauses. It ends at the final
report, as `references/blocking.md` says. U3 records this as a decisions doc. An
agent that errors twice (H4) still pauses, so `references/blocking.md` stops
treating it as an isolated block.

The other B111 decision is outside this plan. The user ruled that no workflow
has an always-loaded budget. That edit is in `.claude/skills/skill-kit/`, so it
is a direct fix, per the user's ruling that plans change shipped plugins only.
It lands before this plan's hand-off, so B111 cannot close without it. No unit
depends on it.

## Facts the survey established

All execute paths are under `plugins/vwf/skills/execute/`. Line numbers are at
`77ee5b60`.

- **Defect 1:** `references/review-unit.md:83` says "every `code` unit". The
  refusal in `workflows/folder.md` says "a unit of any kind".
- **Defect 2:** `references/code-unit.md:24` already reads all three folders, so
  it needs no edit. `references/setup.md:21`, `references/rules.md:156` and the
  state table at `SKILL.md:140` omit `problems`.
- **Defect 3:** `references/rules.md:113` says "two exceptions". The run also has
  read-only git commands, such as `git log` and `git diff`. It has these commands
  that write: `git merge` and its `--abort` at `references/setup.md:78-80`, and
  `git worktree remove` at `workflows/all.md:117`. The `git submodule update` and
  `git clone` lines at `workflows/folder.md:26-27` are text for a person, because
  "the run clones nothing".
- **Defect 4:** `references/rules.md:236` omits `gates.keeps`, which
  `references/reconcile.md:54` runs.
- **Defect 5:** `SKILL.md:189-190` holds the refusal. `references/edit-unit.md:28`
  tells a unit to delete with `rm`.
- **Defect 6:** `plugins/vwf/skills/doctor/SKILL.md:89` offers fixes.
  `plugins/vwf/skills/handoff/SKILL.md:55` can ask which thread.
  `references/claim.md:31` runs doctor. `references/pause.md:55` runs handoff.
  `workflows/all.md:150-151` lists what a runner declares, and it changes too.
  `doctor` reads project names from `$ARGUMENTS`, and `handoff` reads a file name.
- **Defects 7 and 8:** the H4 and H6 rows are in the table at `SKILL.md:181` and
  `SKILL.md:183`. The H4 details are at `references/pause.md:23-25`.
  `references/review-unit.md:137` cites the "Subagent death" pause rule.
  `references/blocking.md:18` names the agent error, and `:33` holds the
  all-blocking rule. The cascade behind a review row is at
  `references/blocking.md:25-30`, `references/waves.md:53-54` and
  `references/review-unit.md:52`. `references/edit-unit.md:45-46` marks a dead agent
  `failed`, and it does not say to pause.
- **Gates:** `code:precommit` takes no argument and runs every file.
  `plugins/**/*.md` is not formatted, so match the fold width by hand.
- **Lint:** the kit lint on `execute` shows 0 errors and 0 `ST101`. `doctor` and
  `handoff` are not migrated, and they keep their lint errors.
- **Manual:** `site/src/content/docs/plugins/vwf.md:207` lists the all-blocking
  gap as a stop, and `:2606-2607` lists a gap that blocks all remaining work. `:2601`
  lists a stage subagent that dies twice, which stays true.
- **Dependencies:** this plan adds none.

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
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **B110**, the exit from the review loop and the choice to fix or park a gap. It
  is new behavior, and it has its own backlog item.
- **A run that continues after a dead agent.** The user first ruled for this, then
  reversed it, because it needs a new failure path for each agent type. It is not
  planned.
- **B112**, the defects in the other skills and the gaps in the standard.
- **The rewrite of `doctor` and `handoff`** to the standard. Each has its own turn
  in the migration, so this plan does not lint them.
- **The workflow budget** in `.claude/skills/skill-kit/`. It is a direct fix.

## Parked

none

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-06-execute-rule-defects

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
