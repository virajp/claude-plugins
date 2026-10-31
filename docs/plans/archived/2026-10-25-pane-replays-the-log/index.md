# Plan — The progress pane replays the action log (2026-10-25)

## Goal

The `/vwf:execute` progress pane (the `vwf-monitor` mod) shows everything it
shows today, gaps included, from `docs/plans/index.json`, the plan's
`index.json` and the plan's action log alone.

This is plan C of a chain: A (`2026-10-24-plan-json-format`) → B
(`2026-10-25-action-log-per-plan`) → C (this). A and B are archived
`COMPLETE`. The input was `docs/scratchpad/preplans/plan-c-pane.md`, whose
rulings the user approved on 2026-10-24; every `index.yaml` there is
`index.json` after plan A.

The user's words: "Pane, of `vwf-monitor` mode, will be heavily relying on the
log file for it's information. If the mod is closed in-between and then
started again, it will have to scan through the whole log file to understand
the historical state and current state. It will use the log file to display
all the information that it is suppose to, including gaps, etc." And: "I
don't want to see the empty pane of `vwf-monitor`, it can simply come up and
vanish. this is only temporary setup so no point of over engineering."

**Reversals** of `docs/memory/decisions/2026-10-21-execute-monitor-gap-fixes.md`,
confirmed in the interview: its D1 (follow agents by name on the agent list)
becomes decision D5; its D3 (the run-end rule with the 10-minute stale end)
becomes D6; its D12 (`locate` keeps a known `index.md`) is superseded by D7,
as that plan handed to a later plan.

## Facts the survey established

### The module today

- `plugins/vwf/hooks/monitor/`: `register.tsx` (1122 lines, the whole mod),
  `plan.ts` (353, parsers and helpers), `plan.test.ts` (217, 9 tests),
  `agents.test.tsx` (734, 19 tests), `pane.test.tsx` (110), `refresh.test.tsx`
  (116). Registered under `modules` in `plugins/vwf/hooks/hooks.json`. No
  README, no `package.json`; imports only `claude-code` and
  `claude-code/testing`.
- `register.tsx`: atoms `monitorRun`, `monitorQuiet`, `monitorViewing`
  (`:40-42`); module variables `:89-154`; `/vwf-monitor` `:636`, `:653-667`;
  typed `/vwf:execute` opens through `prompt.submit` `:670-677`; Skill
  `vwf:execute` `:680-688`; `open()` `:91-102`; `close()` `:104`;
  `AskUserQuestion` close and reopen `:717-729`; the 3 s timer
  (`THROTTLE_MS`) `:124-125`, `:162-170`; `poke` `:441-457`; `tool.call`
  `:691-714`; `turn.complete` `:866-888`; `agent.spawn` `:857`; `refresh`
  `:470-632`; `roots()` `:269-305`; `locate` `:316-376`; `pick()` `:383-438`
  (reads `docs/plans/index.md`); `isFollowed`/`mapUnit` `:460-467`,
  `:549-564`, `:763-767`; runner scoping `:554-556`; `disowned` `:532`;
  run-end rule `:617-631` (`WAIT_MS` `:124`, `waitingSince` `:880-885`,
  `endRun` `:195-206`); the Pane `:907-1121` (empty state `:915-924`, buttons
  `:975-1001`, title and status `:1002-1016`, times `:1017-1020`, progress bar
  `:1021-1035`, unit table `:1037-1070`, wave reviews `:1071-1093`, gaps
  `:1094-1098`, footer `:1100-1115`, problem `:1116`); `colorOf`
  `:110-122`; start and end times from `AgentRun` (`:830`, `:576-577`).
- `plan.ts`: markdown helpers `section` `:17`, `table` `:30`, `bullets`
  `:56`; `parseIndex` `:71-105`; `runningFolders` `:108`; `folderIn` `:116`;
  `ROW_ID` `:125`; `reviewName` `:130`; `isFollowed` `:138`; `REVIEWER`
  `:156`; `unitFor` `:163-189`; `resolveBase`, `memberPaths`, `hostOf`,
  `joinPath` `:200-299`; `isClaimedIn` `:302`; `unitState` `:310`;
  `isFinished` `:337`; `gapsOf` `:342`; the `CONTROL` strip `:14`.
- `plugins/vwf/types/index.d.ts`: `UnitRow` `:2`, `LogRow` `:12`,
  `PlanSnapshot` `:23-27`, `AgentRun` `:32`, `PlanRun` `:44`, `Run` `:54`,
  `PluginState.vwf` `:66-73`; the manifest's `"types"` key names it.
- The tests run with `claude plugin test plugins/vwf` (it runs the
  `*.test.ts(x)` files inside the plugin folder) and import
  `claude-code/testing`. The root vitest config does not reach them. No mise
  task and no CI job runs them; `p:plugins:check` runs
  `claude plugin validate --strict` only when `claude` is on `PATH`, and CI
  has no `claude`. No tsconfig in the repo covers the module.

### The mod API (the built-in plugin-authoring skill's types)

- `$.fs.read(path)` rejects a missing file and a file over 4 MiB; there is no
  offset read. `$.fs.stat` gives `{size, mtimeMs}`; `$.fs.exists`,
  `$.fs.list`.
- `~` is not expanded; `$.env.get("HOME")` gives the home path (the name must
  be a string literal).
- No file watch, save the untested settings hook `FileChanged`.
- Timers: `$.clock.now`, `after`, `every`, `sleep`; a hot reload drops module
  timers.
- `$.process.run` runs a command. `$.ui.open`, `$.ui.close`, `$.ui.view`,
  `$.ui.toast`. Hook events include `session.start`, `session.end`,
  `prompt.submit`, `tool.call`, `agent.spawn`, `turn.complete`, `ui.close`.
- No `node:` import in a module; a render hook must not write state.

### The sources after plans A and B

- `docs/plans/index.json`: rows `{id, folder, kind, title, target_repo,
  priority, status, gaps, requires, backlog, backlog_pieces}`; `status` is
  `APPROVED`, `RUNNING` or `COMPLETE`
  (`plugins/vwf/skills/plan-management/scripts/lib/schema.mjs:157-174`).
- A folder's `index.json`: `status {state, detail}`, `units` (`id`, `title`,
  `wave`, `file`, `kind`, `status`, `commit`, `rounds`, `range`), `gaps`,
  `run {worktree, log}` written by `claim` in the main checkout, with a
  literal `~` in `log`.
- The log, one append-only JSONL file per plan. Every line has `ts`, `run`
  (the run id `<YYYYMMDD-HHMMSS>-<session8>`), `session`, `agent` (null for
  the orchestrator) and `event`. `log.mjs`: `run.start {folder, repo, mode,
  head, branch}` then `plan.snapshot {folder, units}`; `row` (`unit` or
  `stage`, `status` always, `wave` on a unit row, optional `rounds`,
  `commit`, `range`, `detail`); `gap` (`id` `G<n>` or `L<n>`, `unit`,
  `stage`, `text`, `state`, optional `class`, `source`); `phase.start`,
  `phase.end`, `gate`, `commit`, `review.round`, `stop`, `run.end
  {outcome}`. The hook (`plugins/vwf/hooks/action-log.mjs`): `tool.start`
  (`tool`, `tool_use_id`, `summary`; for an Agent call the summary is
  `subagent_type :: name :: description`), `tool.end` (`dur_ms`, `child`),
  `agent.start`, `agent.end` (`agent_type`, `gaps` on end), `session.end
  {reason}`. The unit name is not on the `agent.*` lines; it is matched
  through `tool_use_id` to `child`. Plan B's decisions D2, D8, D9, D22-D24,
  D30 (the hook logs only the program name of a Bash command).
- The largest log so far is 657 KB (plan A's run, under `/tmp/vwf/`).

### Standing rulings this plan keeps

From `docs/memory/decisions/2026-10-21-execute-monitor-inside-vwf.md`: D1
(a hooks module inside vwf), D2 (the file layout and the `types` key), D3
(the `$.state` keys), D4 (`/vwf-monitor` and the pane id `vwf-monitor`), D6
(control characters stripped), D7 (the tests ship inside the plugin). From the
gap-fixes decisions: D2 (one line per wave review), D4 (merge inside
`update`; the `AskUserQuestion` close and reopen; `tool.call` does not await
`poke`), D5 (several RUNNING rows), D6 (member-repo search), D7 (the timer
only while a run is live).

### Docs that describe the pane

- `site/src/content/docs/plugins/vwf.md`: `:117-118`; the section
  "The progress pane" `:3169-3231` (`:3202`, `:3223-3224` name the markdown);
  `site/src/content/docs/plugins/mempalace.md:103` links to
  `vwf.md#the-progress-pane`.
- `readme.md:197`; `CLAUDE.md:378-387` (`:381-383` the markdown caveat);
  `.claude/skills/vwf-plugin/SKILL.md:20`, `:404`, `:442-460`;
  `.claude/skills/vwf-plugin/references/assets.md:44-45`;
  `.claude/skills/plugin-authoring/SKILL.md:104-111`. `plugins/vwf/skills/execute/SKILL.md:134`,
  `:378` and `references/action-log.md:25` need no change.
- `docs/plans/gaps/2026-10-21-execute-monitor-gap-fixes.md`: the four parked
  items of the gap-fixes plan; nothing references the file.

### The repo

- Commit types: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- `.config/vwf.yaml` runs `mise run p:plugins:local` after every green
  landing.
- dprint formats `**/*.tsx` and `**/*.ts` here; `plugins/**/*.md` is not
  formatted.
- vwf is `21.2.0`, site `1.1.50`. No unit bumps a version.
- The backlog item B101 ("Mod: vwf status block", Partially done) is not on
  this plan, by the user's answer.

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

- `plugins/vwf/skills/execute/scripts/log.mjs` and the action-log hooks —
  plan B's, landed.
- CI — it has no `claude` binary.
- This repo's `.config/` — the user edits it by hand.
- Backlog item B101 — the user did not put this plan on it.

## Parked

- In an `all` run, show the plans that ran before the current one, with their
  outcome (a parked item of the gap-fixes plan, not taken here).
- `claude plugin test plugins/vwf` in `p:plugins:check` — an edit of this
  repo's `.config/`, which the user makes by hand.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-25-pane-replays-the-log

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
