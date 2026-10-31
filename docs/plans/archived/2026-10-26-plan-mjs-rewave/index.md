# Plan — plan.mjs rewave: renumber waves in one validated write (2026-10-26)

## Goal

After this plan lands, a planner can move units between waves with one
`plan.mjs rewave <file> <unit>=<wave>...` call. The call rebuilds `waves` as
`W1 ... W<n>`, validates the whole file, and writes once. Today no single
`set`, `append` or `remove` can do it, because the validator requires that
`waves` lists exactly `W1 ... W<n>` after every write. The planner rules also
forbid a whole-file rewrite after the first validate. On 2026-10-25 a 95octane
plan (`docs/plans/2026-10-18-effect-v4-http-redesign`) needed U3-U6 split into
one wave each, and the user had to permit a scripted whole-file rewrite as a
stopgap.

There is no reversal. The rule "never rewrite `index.json` whole after the
first validate" stays; `rewave` becomes one more permitted write, for the
planners only.

## Facts the survey established

- `plugins/vwf/skills/plan-management/scripts/plan.mjs` (313 lines) has five
  verbs: `get`, `set`, `append`, `remove`, `validate`. Arguments are
  positional; `parseArgs` near line 193 checks each verb's arity and flags;
  the verb `switch` starts near line 252; the `USAGE` text is near lines
  72-78 and the header comment near lines 1-47.
- Each write is `load()` (near line 90), a change in memory, then `write()`
  (near line 113), which validates the whole document, reports findings with
  exit 1, and writes nothing on a finding; else it writes a temp file and
  renames it. `rewave` reuses `write()`.
- `stamp()` (near line 133) acts only on a three-segment `set` of a status
  or state. `rewave` does not call it. Times come from `PLAN_NOW` or the
  clock.
- Exit codes: `usage()` exits 2; `fail()` takes a code; `report()` exits 1
  with one `file: path: message` line per finding.
- `lib/schema.mjs`: the waves rule near lines 405-434 (`waves` equals
  `W1 ... W<top>`, `top` the highest unit `wave`); `depends_on` must name a
  strictly earlier wave (near lines 349-367); a unit above wave 1 that is not
  a review, docs or gates unit needs a non-empty `waits` (near lines 371-382);
  a wave 1 unit may carry a non-empty `waits`. Wave and unit status enums are
  `pending`, `running`, `green`, `failed`, `unresolved`, `skipped`.
  `isPlanIndex()` near line 553 tells the plan index from a folder.
- A wave entry holds only `id`, `status`, `started`, `ended` — no unit list.
  Nothing in the schema cross-checks a unit's status against its wave's.
- Tests: `scripts/src/plan-script.test.ts` (774 lines). Helpers `plan(args,
  input?, now)` near line 62 (spawns node with `PLAN_NOW`), `read`, `parse`,
  `bytes`. Fixtures in `scripts/src/fixtures/plan-script/` (`change/`,
  `cycle/`, `docs/plans/index.json`), copied to a temp folder in `beforeEach`.
  The `change` fixture has five units at waves 1-5.
- `plan.mjs` and `lib/` import only `node:` modules and relative paths;
  `scripts/src/check.ts` `checkSkillScripts` enforces it.
- Passages that name the verbs or the after-first-validate write rule:
  `plan-management/SKILL.md` near lines 78-91 and 588;
  `plan-management/references/plan-index.md` near lines 17-21 (omits
  `remove`); `plan/SKILL.md` near lines 56 and 418-420;
  `plan/references/plan-doc.md` near lines 22-24; `change-plan/SKILL.md` near
  lines 280-283; `assets/plan-interview.md` item 20 near lines 206-218;
  `assets/templates/plan-folder.md` near lines 22-48 and 448;
  `agents/plan-rulings-reviewer.md` near lines 36-39; `execute/SKILL.md` near
  lines 102-116 and 1302; `CLAUDE.md` near line 53;
  `.claude/skills/vwf-plugin/SKILL.md` near line 72;
  `.claude/skills/vwf-plugin/references/docs-tree.md` near line 55;
  `site/src/content/docs/plugins/vwf.md` near lines 2484, 2653, 2841 and
  3276-3286. `assets/execute-stages.md`, `assets/memory.md` and
  `agents/execute-runner.md` describe executor writes only, and stay.
- Commit types (`.config/git-conventional-commits.yaml`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.
- The vwf version is 21.2.0. `.config/vwf.yaml` runs `mise run p:plugins:local`
  after every landing.
- The backlog (GitHub project 2 under `virajp`) holds no item for this
  defect, and the plan index holds no plan.

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

- A general `batch` verb — the user chose `rewave` (D1).
- A change to the waves rule in `lib/schema.mjs` — the rule stays; `rewave`
  works within it.
- A cross-check in `validate` between a unit's status and its wave's status —
  `rewave` enforces D3 itself.
- `/vwf:execute` calling `rewave` — a run never renumbers waves (D7).
- Repairing the 95octane plan — its stopgap rewrite already landed there.
- This repo's `.config/` — the user edits it by hand.

## Parked

None.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-26-plan-mjs-rewave

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
