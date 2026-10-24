# Plan — One append-only action log per plan (2026-10-25)

## Goal

`/vwf:execute` writes one append-only log file for each plan, at
`~/Library/Caches/vwf/<repo>/<plan folder>.jsonl`, a place that macOS does
not clear, with every fact the progress pane needs. Old logs and dead session
markers are cleaned up.

This is plan B of a chain: A (`2026-10-24-plan-json-format`, archived) → B
(this) → C (the pane replays the log). The input was
`docs/scratchpad/preplans/plan-b-log.md`; the user approved its rulings on
2026-10-24. Plan A changed the format to JSON, so every `index.yaml` of the
pre-plan is `index.json`, and every `yq` read is `plan.mjs get`.

The user's rule: "Industry standard is to never edit a log file, always
append. If a plan was parked at 12:30pm and then resumed at 2:45pm, it will
have a 2:45pm entry which will superseed the 12:30pm entry." No step may edit
or remove a line of a log.

**Reversal (approved 2026-10-24):** `plan-management claim` writes `run:`
paths into the folder's `index.json` in the claim commit. This reverses the
rule "the index row is the one edit the run makes in the main checkout"
(decision D3). The docs unit records it in
`docs/memory/decisions/2026-10-25-action-log-per-plan.md`.

## Facts the survey established

### The action log today

- `plugins/vwf/skills/execute/scripts/log.mjs` (498 lines):
  - `ROOT` `:53` (`$VWF_LOG_ROOT` or `/tmp/vwf`), `SESSION` `:54`
    (`$CLAUDE_CODE_SESSION_ID` or `nosession`), `marker` `:55`
    (`<ROOT>/active/<SESSION>`); header comment `:9`, `:19-23`.
  - `start` (`:126`) needs `--folder`; it writes
    `<ROOT>/<repo>/<folder basename>/<stamp>-<session8>.jsonl` (`:139-142`),
    `stamp()` `:96-100` (local time), `repo` from the git common dir
    (`:133-138`); it writes the marker (`:141`, `:144`) and prints the path.
    `--mode` is a free string, default `fresh` (`:19` says `fresh|resume`).
  - `active()` `:102-108` tests that the marker exists, then reads it: the
    race.
  - `append` `:110-120` adds `ts`, `run` (`basename(file, ".jsonl")`, `:113`),
    `session`, `agent: null`, `event`, then spreads the fields;
    `appendFileSync`.
  - `fields()` `:71-89` turns `--key value` pairs into fields (`-` to `_`,
    integers and booleans coerced, `:57-68`). There is no stdin input and no
    schema check.
  - Verbs (map `:493`, usage on an unknown verb `:495`): `start`,
    `event <name>` (`:156`; warns `no active run in session …` `:164` and
    exits 0), `run [--event X] -- cmd…` (`:170`; keeps the command's exit
    code; warns `:200`), `end` (`:205`; `run.end`, then `rmSync(marker)`
    `:212`; warns `:208`), `summary <file>` (`:280-490`, text only; span
    `:302-315` is last minus first; first `run.start` and last `run.end`
    `:306-307`; sections PHASES, AGENTS, GATES, COMMITS, TOOLS, GAPS, STOP).
- `plugins/vwf/hooks/action-log.sh` (23 lines): root `:18`; fast exit when
  `active/` is empty `:19-20`; runs node `:22`; always exits 0.
- `plugins/vwf/hooks/action-log.mjs` (147 lines): `ROOT` `:33` (header `:8`);
  the session id from the payload's `session_id` (`:86-89`); the marker read
  with the race `:89-96`; `run` from the file name `:100`; it handles
  `PreToolUse`, `PostToolUse`, `SubagentStart`, `SubagentStop` (`:104-137`);
  `appendFileSync` `:139`.
- `plugins/vwf/hooks/hooks.json`: `PreCompact` (timeout 90), `Stop` (30), the
  four `action-log.sh` events (timeout 10 each, `:25-68`), the `modules` entry
  `:70-72`. No `SessionEnd` yet.
- `SessionEnd` (Claude Code hooks docs): a plugin can register it; the
  payload has `session_id` and `reason` (`clear`, `resume`, `logout`,
  `prompt_input_exit`, `other`); it fires on `/clear`, a normal exit and
  `/resume`, and is not guaranteed after a crash; a plugin hook has 1.5
  seconds. `CLAUDE_CODE_SESSION_ID` in a Bash call equals the hook's
  `session_id`.
- Tests: `scripts/src/execute-log.test.ts` (294 lines, 10 cases) is the only
  test of `log.mjs` and the hook. It sets `VWF_LOG_ROOT` to a `mkdtempSync`
  root (`:28-41`). The vitest config is the root `vitest.config.mts`
  (`{installer,scripts}/src/**/*.test.ts`). `scripts/src/plan-script.test.ts`
  tests `plan.mjs`.
- Rule 16 of `p:plugins:check` (`scripts/src/check.ts:279-317`) covers
  `skills/*/scripts/**/*.mjs`: an entry file directly under `scripts/` has the
  node shebang and is executable; every import starts with `node:`, `./`,
  `../` or `/`; no `require(`. It does not cover `hooks/*.mjs`.
  `checkHookScripts` (`:219-260`) checks that a script `hooks.json` names
  exists and is executable.

### The plan format after plan A

- `plugins/vwf/skills/plan-management/scripts/lib/schema.mjs`: the unit
  `status` enum (pending, running, green, failed, unresolved, skipped), an
  inline literal at `~:100-110`; the stage state enum (pending, green,
  failed, skipped), an inline literal at `:34`; gaps `~:136-143`. Neither
  enum is a named const today: U2 lifts each literal into a named export; `run: obj({}, { open: true })` `:145`; the
  header comment `:5-6` says `run` is open and "plan B fills it".
- `plugins/vwf/assets/templates/plan-folder.md`: `run` `{}` in both samples
  (`:152`, `:279`); the open-key rule `:289`; the `run` rule `:453`; "There is
  no run log" `:455-459`.
- `plugins/vwf/skills/plan-management/SKILL.md`: `claim` `:194-204` (row only;
  "edits no folder status"; commit `docs: plan queue — <folder> running`);
  `unclaim` `:206-258` (commit `docs: plan queue — <folder> unclaimed`);
  `archive` `:297-458`; the index edited only in the main checkout
  `:109-111`. `references/plan-index.md:104`, `:225` ("The one edit the
  executor makes in the main checkout"), `:293`.
- `plugins/vwf/skills/execute/SKILL.md`: the `plan.mjs` contract `:102-130`;
  the resume route `:255-271`; `log.mjs start` in the main checkout
  `:303-308` (with `/tmp/vwf` `:308`); the claim and the "one edit" rule
  `:327-350` (`:331`); `run` for gates `:502-503`; `event stop` and `end`
  `:547-548`; the resume check `:628-642`; the branch and worktree name
  `:653-662`; the journal `:726`; the final report `:927-964` (`summary`
  `:950`); `end --outcome` `:1187-1188`; `:1228`.
- `execute/references/action-log.md`: intro and location `:1-27` (`/tmp/vwf`
  `:7`, the three-day note `:9`, the call template `:20`), the calls `:28-67`
  (`start` fresh or resume `:34`), "Reading it" `:68-end`; no clean-up
  section.
- Run facts are written with `plan.mjs` at: `references/code-unit.md:14-17`,
  `:37`, `:51`; `references/edit-unit.md:35`, `:39-40`, `:111`, `:132`;
  `references/review-unit.md:41-44`, `:91`, `:210`, `:228-232`;
  `references/blocking.md:9`, `:89-108`, `:114`;
  `references/acceptance-and-ux.md:10`; `execute/SKILL.md:870`.
  `assets/execute-stages.md` defines the journal shape.
- git-workflow creates the worktree at `.worktrees/<branch>`
  (`git-workflow/references/worktree-setup.md:21-25`, `:61`); the branch is
  the plan's name.
- The pane (`plugins/vwf/hooks/monitor/`, `plugins/vwf/types/index.d.ts`)
  still parses markdown and reads no log. Plan C rewrites it.

### Mentions of `/tmp/vwf` and of the claim rule

- Code: `log.mjs:9`, `:53`; `action-log.mjs:8`, `:33`; `action-log.sh:18`;
  `execute-log.test.ts:4` (comment).
- Docs: `execute/SKILL.md:308`; `execute/references/action-log.md:7`;
  `CLAUDE.md:261`, `:60-63` (claim and archive), `:373-374` (hooks);
  `.claude/skills/vwf-plugin/SKILL.md:69-91`, `:364`, `:401-423`;
  `.claude/skills/vwf-plugin/references/docs-tree.md:59-71`,
  `assets.md:36-42`, `skills-and-agents.md:20`, `:36`, `:39`;
  `.claude/docs/repo-shape.md:271-272`;
  `site/src/content/docs/plugins/vwf.md` (hooks `:117`, claim `:2735-2739`,
  `:2757`, `:3254`, unclaim `:2670-2672`, `:2988-2989`, `:3255`, `:3286`,
  archive `:3054-3072`, `:3258`, `:3265-3283`, report `:3007`, the action log
  `:3115-3150`, plan-management `:3214-3308`, walkthrough `:4073`, `:4085`);
  `site/src/content/docs/how-to/operate/ad-hoc-change.md:267-276`,
  `:314-329`, `:356-365`; `site/src/content/docs/how-to/greenfield/single-repo.md:324`.
  `readme.md` and `installer/` have no hits. `site/dist/` is build output.

### The repo

- Commit types (`.config/git-conventional-commits.yaml`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.
- `.config/vwf.yaml` runs `mise run p:plugins:local` after every green
  landing; it has no `harness:` stamp.
- `plugins/**/*.md` is not dprint-formatted: keep the 80-column fold by hand.
  `CLAUDE.md` and `site/**` are formatted. `docs/plans/` is excluded from
  dprint and the linter.
- vwf is `21.2.0`, site `1.1.50`. No unit bumps a version.
- This repo moved to the JSON plan format on 2026-10-25 (`91881ac9`).

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

## Out of scope

- `plugins/vwf/hooks/monitor/` and `plugins/vwf/types/index.d.ts` — plan C
  makes the pane replay the log.
- Old logs in `/tmp/vwf/` — left alone (decision D1).
- Windows and Linux log locations — vwf is macOS only.
- This repo's `.config/` — the user edits it by hand.
- `plan.mjs` itself — the orchestrator writes the row events (decision D12).

## Parked

- Plan C: change `docs/scratchpad/preplans/plan-c-pane.md` from `index.yaml`
  and `yq` to `index.json` and `plan.mjs`; the pane finds the running plan in
  `docs/plans/index.json`, then reads the folder's `run.worktree` and
  `run.log` (expand the literal `~`), and replays the log, `plan.snapshot`,
  `row`, `gap` and `session.end` included.
- `claude plugin test plugins/vwf` in `p:plugins:check` — an edit of this
  repo's `.config/`, which the user makes by hand.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-25-action-log-per-plan

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
