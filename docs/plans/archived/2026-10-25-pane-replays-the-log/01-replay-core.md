# U1 — The replay core

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/execute/scripts/log.mjs` (read only: the
  event shapes it writes); `plugins/vwf/hooks/action-log.mjs` (read only: the
  hook's lines); `plugins/vwf/skills/plan-management/scripts/lib/schema.mjs`
  (read only: the plan index row and the folder shape);
  `plugins/vwf/skills/execute/references/action-log.md` (the event list).

## Ruling

> - D1: The pane reads three sources only: the RUNNING row of the base
>   repo's docs/plans/index.json, then the folder's index.json in the main
>   checkout (title, status.state, units, run), then the log at run.log. The
>   ~ of run.log is expanded with $.env.get("HOME"); VWF_LOG_ROOT is not
>   honoured, because the committed path does not carry it. The pane never
>   searches a worktree.
> - D2: Each read replays the whole log from its first line and rebuilds the
>   past and the current state.
> - D4: A missing log file is not an error: the pane shows the plan from
>   index.json, every unit pending, and the line 'no run data yet'.
> - D5: Log plus $.agent.list() for liveness. A unit's agent is the child id
>   of the Agent tool call whose tool.start summary (type :: name ::
>   description) names the unit id U<n> or a wave-review name R<wave>;
>   tool.end with the same tool_use_id carries the child. An agent is live
>   from its agent.start to its agent.end. When the run is in this session
>   and $.agent.list() shows the agent as done, or does not list it, the
>   agent counts as ended. The transcript button opens the child id. The
>   name matching on the agent list (isFollowed, mapUnit, unitFor, the
>   REVIEWER regex, disowned) is removed. This reverses gap-fixes D1.
> - D6: The run ends at a run.end or a stop after the last run.start, or at
>   a session.end of the session of the last run.start. A later run.start
>   makes the run live again. The 10-minute stale end (waitingSince,
>   WAIT_MS) is removed. This reverses gap-fixes D3.
> - D7: resolveBase and memberPaths stay, for a cycle plan in a member repo.
>   locate, roots, isClaimedIn and the worktree search are removed (this
>   supersedes gap-fixes D12, as that plan planned). With several RUNNING
>   rows, the pane takes the plan whose log's last run.start carries this
>   session's id; else it shows the RUNNING folders and /vwf-monitor
>   <folder> (gap-fixes D5 stays).
> - D9: When $.fs.stat gives a size over 4 MiB (4194304 bytes), the pane
>   runs tail -c 4000000 <log> through $.process.run and replays from the
>   first full line of its output. When that tail has no plan.snapshot, the
>   units come from the folder's index.json. The footer then says the
>   replay is partial.
> - D10: Each unit row shows its title from plan.snapshot, or from
>   index.json when the replay has none. A unit's start time is the ts of
>   its first row event with status running, else its agent's agent.start;
>   its end time is the ts of its last row event with a final status (green,
>   failed, unresolved, skipped). Both come from the replay, also for a unit
>   that started before the pane opened.
> - D11: plugins/vwf/types/index.d.ts drops UnitRow, LogRow and
>   PlanSnapshot; it carries the JSON unit shape (id, title, wave, file,
>   kind, status, commit, rounds, range) and the replayed state, with no type
>   named PlanSnapshot. These stay: the $.state keys monitorRun,
>   monitorQuiet, monitorViewing; the command /vwf-monitor and the pane id
>   vwf-monitor; the strip of control characters from plan text and log
>   text. The module imports no node: module and does not import plan.mjs;
>   it parses JSON with JSON.parse.
> - D14: Keep today's name rules, applied to the log. The replay splits an
>   Agent tool.start summary on ' :: ' at its first two separators: three
>   parts give type, name and description; two parts give type and
>   description, with no name. Then today's unitFor rules (the U<n>-late<k>,
>   R<wave>-late, R-late and -<n> suffixes, review-row reviewers by row id,
>   the REVIEWER regex over vwf:execute-* types) map that name and type to a
>   unit or a wave review; they move from the agent list to the replay. When a
>   unit has several agents, its row shows the latest one, and the transcript
>   button opens the latest. This amends D5: unitFor and REVIEWER stay, as
>   rules over the log, and only isFollowed, mapUnit and disowned are removed.
> - D15: They are removed with the markdown readers: replay gives each unit's
>   status and the open gaps, and a final status is green, failed, unresolved
>   or skipped (the schema.mjs unit enum).
> - D18: Empty until it ends again. A unit's end time is the ts of its last
>   row with a final status only when no later row set it running. A re-run
>   unit shows its first start time and no end time, then the new end time
>   when it ends again; its time column counts from the first start. This
>   amends D10's end time.
> - D22: With no run.start in the tail, the run is live unless the tail holds
>   a run.end, a stop or a session.end of the last session seen (D6). The
>   session for D7 is the session field of the tail's last line. A unit with
>   no running row in the tail shows no start time, only its status. The
>   footer's partial mark (D9) says why.
> - D23: No run data yet. A RUNNING row is always a plan to show: with run {}
>   or no run.log, the pane shows the plan from index.json, every unit
>   pending, and the line 'no run data yet' (D4), and keeps polling until the
>   run key and then the log appear.
> - D24: A hybrid. The state (status.state, each unit's title, wave, kind,
>   status, commit, rounds and range, and the open entries of gaps) comes from
>   the folder's index.json in the run's worktree: <the folder's repo
>   root>/<run.worktree>/<folder path>/index.json, read whole with JSON.parse
>   at each refresh, with the D8 stat skip. When that file does not exist
>   (before the worktree is cut, or after the landing removed it), the state
>   comes from the folder's index.json in the main checkout, or the archived
>   copy (D17). The log gives only what index.json does not hold: start and
>   end times (D10, D18), the agent of each unit and its liveness (D5, D14),
>   resumes and the run end (D6, D22), and the session for D7. The pane opens
>   the one path in run.worktree; it never lists or searches worktrees. This
>   amends D1, D4, D9 and D23: units and gaps never come from plan.snapshot or
>   row events; a tail with no plan.snapshot needs no fallback. It reverses
>   the interview answer to open point 1c, which rejected reading the worktree
>   copy.
> - D26: The title comes from the state file of D24 (the worktree, main or
>   archived index.json), never from plan.snapshot; this amends D10. In a
>   partial tail (D9, D22), D10's start fallback still applies: a unit's start
>   is its first running row in the tail, else its agent's agent.start in the
>   tail; it shows no start time only when the tail holds neither.
> - D29: U2 removes the dead code. U1 only adds the new API, the types and
>   their tests, and keeps the old readers, the old types and their tests
>   unchanged. U2 also owns plan.ts and plan.test.ts in wave 2: once
>   register.tsx no longer imports them, U2 removes the readers of D11 and D15
>   (parseIndex, runningFolders, isClaimedIn, isFollowed, section, table,
>   bullets, unitState, isFinished, gapsOf), the old types UnitRow, LogRow and
>   PlanSnapshot from index.d.ts, and their tests. So U2 also owns
>   plugins/vwf/types/index.d.ts in wave 2.
> - D32: The pane shows only the currently running plan, by three layers:
>   docs/plans/index.json gives the plan's status at the start and the end
>   (claim sets RUNNING, complete sets COMPLETE); the plan's index.json gives
>   the state while the plan runs (the worktree copy at run.worktree, D24;
>   during the landing, when the folder already moved inside the worktree,
>   <worktree>/docs/plans/archived/<basename>/index.json; after the merge, the
>   main copy); the log gives the event-by-event updates (times, agents, run
>   end). An all run runs one plan at a time, so the pane follows whichever
>   row reads RUNNING, and needs no re-find of a landed plan. When no row
>   reads RUNNING (the plan's row went COMPLETE, or between two plans of an
>   all run), the pane shows 'waiting for the next plan' and keeps polling for
>   up to 10 minutes, as in D20; a new RUNNING row shows at once; when the
>   wait ends with no RUNNING row, the D3 message shows for 10 seconds and the
>   pane closes. This supersedes D17 and D21. /vwf:execute does not change.

## Edits

1. **`plugins/vwf/hooks/monitor/plan.ts`** — pure functions only, no `$`
   calls, every one exported for U2:
   - Remove nothing and change no existing signature (D29): the markdown
     readers and today's `unitFor` stay until U2 removes them, because
     `register.tsx` still imports them. Keep using `folderIn`, `reviewName`,
     `ROW_ID`, `resolveBase`, `memberPaths`, `hostOf`, `joinPath` and the
     control-character strip.
   - Add `unitForAgent(type, name, units)` (D14): today's `unitFor` rules
     and the `REVIEWER` regex, over the type and the name parsed from the
     log's Agent `tool.start` summary in place of an agent-list entry.
   - Add `runningRows(text)`: the `RUNNING` rows of a
     `docs/plans/index.json` text (`id`, `folder`, `kind`, `title`,
     `target_repo`); a parse error returns `[]` and a problem string.
   - Add `isOldFormat(...)`: true when `docs/plans/index.md` exists, or the
     folder has `index.md` and no `index.json` (the caller passes the
     existence facts).
   - Add `readFolder(text)`: `{title, state, units, run}` from a folder's
     `index.json` text.
   - Add `expandHome(path, home)`: a leading `~/` becomes `home + "/"`.
   - Add `replay(lines, folder)`: one pass over the JSONL lines (each parsed
     with `JSON.parse`; a line that does not parse is skipped and counted),
     returning the state. Per D24, `folder` (the `readFolder` result of the
     worktree copy, else the main or archived copy) gives the plan status,
     the units with their title, wave, kind, status, commit, rounds and
     range, and the open gaps; the log adds only: the runs (each `run.start`
     begins one, with its run id, session, mode and start ts), the last
     run's session, each unit's start and end per D10 and D18, its agent per
     D5 and D14, the wave-review agents by `R<wave>`, the live agents
     (`agent.start` without `agent.end`), `ended` per D6 and D22, a
     `partial` flag the caller sets for D9, and the `no run data yet` case
     of D4 and D23 when there are no lines. `plan.snapshot`, `row` and `gap`
     events are not a source of state. Strip control characters from every
     text taken from the log or the folder.
2. **`plugins/vwf/types/index.d.ts`** — per D11, add the JSON unit shape and
   the replayed state under new names (none named `PlanSnapshot`). Keep
   `UnitRow`, `LogRow`, `PlanSnapshot`, `AgentRun`, `PlanRun`, `Run` and
   `PluginState.vwf` as they are: U2 removes or changes them (D29).
3. **`plugins/vwf/hooks/monitor/plan.test.ts`** — keep the existing tests;
   add new tests on JSON and JSONL fixtures (inline strings): `runningRows` with zero, one and two rows and a
   bad file; `isOldFormat`; `readFolder`; `expandHome`; `replay` over one
   run, over a resume (two `run.start`, the second live), a run ended by
   `run.end`, by `stop` and by `session.end`, a gap opened then closed, a
   unit's start and end times, an agent tied to a unit through the Agent
   tool lines, a skipped bad line, no lines (D4), a tail with no
   `run.start` (D22), unit status and gaps taken from `folder` even when
   the log's `row` and `gap` events say otherwise (D24).

## Verification

- `claude plugin test plugins/vwf` passes every test, the old ones included
  (D29: nothing that `register.tsx` imports changed).
- `claude plugin validate --strict plugins/vwf` passes.
- `mise x -- mise run code:format` is green.

## Guardrails

- Touch nothing outside the owned paths. `register.tsx` and the other three
  test files are U2's.
- No `node:` import, no import of `plan.mjs` or `log.mjs`, no new dependency.
- Delete with `rm`, never `git rm`.
- Do not run `git checkout`, `git restore` or a formatter `--fix` outside
  the owned paths.

## Commit

`feat: the progress pane replays the plan's action log`
