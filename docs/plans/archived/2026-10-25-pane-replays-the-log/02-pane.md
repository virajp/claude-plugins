# U2 — The pane on the new sources

- **Read first:** every owned file, top to bottom, before editing; then
  `plugins/vwf/hooks/monitor/plan.ts` and `plugins/vwf/types/index.d.ts`
  (read only: U1's API).
- **Lazy-load:** the mod API types that the built-in plugin-authoring skill
  writes (`claude-code.d.ts`); `.claude/skills/plugin-authoring/SKILL.md`.

## Ruling

> - D1: The pane reads three sources only: the RUNNING row of the base
>   repo's docs/plans/index.json, then the folder's index.json in the main
>   checkout (title, status.state, units, run), then the log at run.log. The
>   ~ of run.log is expanded with $.env.get("HOME"); VWF_LOG_ROOT is not
>   honoured, because the committed path does not carry it. The pane never
>   searches a worktree.
> - D3: Only the new format. When the repo is in the old format
>   (docs/plans/index.md exists, or the folder has index.md and no
>   index.json), or when there is nothing to show (no RUNNING row, or the
>   named folder is not found), the pane shows one message for 10 seconds,
>   then closes ($.clock.after(10000, …) then $.ui.close). This replaces the
>   persistent empty state.
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
> - D8: Keep the 3 s timer while a run is live and the pokes on tool.call,
>   turn.complete and agent.spawn (gap-fixes D7 stays). Before each read,
>   $.fs.stat the log; when size and mtimeMs are unchanged since the last
>   read, skip the read and keep the state.
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
> - D16: Yes. $.process.run runs an argument vector with no shell and returns
>   the first 4194304 bytes of stdout (isStdoutTruncated says when cut), with
>   a 30 s default timeout (the claude-code.d.ts of the built-in
>   plugin-authoring skill, process.run). tail -c 4000000 stays under that
>   cap. The call is ["tail", "-c", "4000000", <log path>]; when
>   isStdoutTruncated is true or the exit code is not 0, the pane shows the
>   problem line and the partial replay of what it has.
> - D17: Superseded by D32.
> - D18: Empty until it ends again. A unit's end time is the ts of its last
>   row with a final status only when no later row set it running. A re-run
>   unit shows its first start time and no end time, then the new end time
>   when it ends again; its time column counts from the first start. This
>   amends D10's end time.
> - D20: Wait for the claim. An open from /vwf:execute (typed, or the Skill
>   vwf:execute) shows 'waiting for the claim' and keeps polling (the D8 timer
>   and pokes) for up to 10 minutes; the first poke that finds a RUNNING row
>   shows that plan. Only when the wait ends with no RUNNING row does the D3
>   message show for 10 seconds, and the pane closes. An open by /vwf-monitor
>   with no RUNNING row shows the D3 message at once. This amends D3.
> - D21: Superseded by D32.
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
> - D28: Yes, verified on 2026-10-25: a general-purpose subagent's Bash
>   printed the same CLAUDE_CODE_SESSION_ID as its parent session
>   (4ed5e911-…), and 2016 subagent hook lines of plan A's log carry the
>   parent's session. So D7 and D21 hold for an all run's runners.
> - D29: U2 removes the dead code. U1 only adds the new API, the types and
>   their tests, and keeps the old readers, the old types and their tests
>   unchanged. U2 also owns plan.ts and plan.test.ts in wave 2: once
>   register.tsx no longer imports them, U2 removes the readers of D11 and D15
>   (parseIndex, runningFolders, isClaimedIn, isFollowed, section, table,
>   bullets, unitState, isFinished, gapsOf), the old types UnitRow, LogRow and
>   PlanSnapshot from index.d.ts, and their tests. So U2 also owns
>   plugins/vwf/types/index.d.ts in wave 2.
> - D31: No. The per-plan log is the scope: every line in a plan's log comes
>   from that plan's run, its runner and the runner's children. The pane
>   filters no line by runner, and today's runner scoping
>   (register.tsx:554-556) is removed.
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

1. **`plugins/vwf/hooks/monitor/register.tsx`**
   - Finding the plan (D1, D7): `resolveBase`, then
     `docs/plans/index.json`; on a missing index or the old format, the D3
     message. `runningRows`; one row, or the D7 choice. The folder's
     `index.json` in the main checkout (the member's checkout for a
     `target_repo` row, through `memberPaths`) for `run`; then the state
     from `<repo root>/<run.worktree>/<folder path>/index.json` when that
     file exists, else the main or archived copy (D24); then
     `expandHome(run.log)` for the log.
     Remove `locate`, `roots`, `pick`, the git worktree reads and the 30 s
     git cache.
   - Refresh (D8, D9, D16, D24): the `$.fs.stat` skip, for the state file
     and the log each; the whole read, or the
     `tail` read over 4 MiB with the D16 argument vector and its truncation
     and exit-code check; then `replay`. A missing log is D4.
   - Liveness (D5, D14): in the run's own session, cross-check the replayed
     live agents against `$.agent.list()`; remove `isFollowed`, `mapUnit`
     and `disowned` (the name rules now live in the replay). Remove the runner scoping of an `all` run (`:554-556`,
     D31): the per-plan log is the scope.
   - Run end (D6, D32): from the replayed `ended`; remove `waitingSince`,
     `WAIT_MS` and the stale end. While the row reads `RUNNING`, an ended
     run shows as ended and a later `run.start` makes it live. When no row
     reads `RUNNING`, the D32 wait: 'waiting for the next plan', the timer
     keeps polling for up to 10 minutes, a new `RUNNING` row shows at once,
     then the D3 message and the close. Keep no landed plan's state.
   - Render: keep the sections and the buttons of today; the unit table gains
     the title column (D10); the start and end times come from the replay;
     the gaps section lists the open gaps of the replay; the footer shows the
     log path and the partial mark (D9). Replace the persistent empty state
     with the D3 message and its 10 s close.
   - Keep the `$.state` keys, `/vwf-monitor [folder|close]`, the pane id,
     the `AskUserQuestion` close and reopen, and the `tool.call` poke that
     does not await.
2. **`plugins/vwf/hooks/monitor/plan.ts`, `plan.test.ts` and
   `plugins/vwf/types/index.d.ts`** (D29) — once `register.tsx` no longer
   imports them, remove `parseIndex`, `runningFolders`, `isClaimedIn`,
   `isFollowed`, `section`, `table`, `bullets`, `unitState`, `isFinished`,
   `gapsOf` and today's `unitFor` (replaced by U1's `unitForAgent`), every
   helper only they use, and their tests; remove the types `UnitRow`,
   `LogRow` and `PlanSnapshot`, and change `AgentRun`, `PlanRun` and `Run`
   to the new fields, keeping the `PluginState.vwf` key names. Do not change
   U1's new functions save to remove an import of a deleted name.
3. **`agents.test.tsx`, `pane.test.tsx`, `refresh.test.tsx`** — rewrite the
   fixtures as JSON (`docs/plans/index.json`, the folder's `index.json`) and
   JSONL logs. Cover: a typed `/vwf:execute` opens the pane with the plan,
   unit titles and gaps; unit status taken from the worktree copy of
   `index.json`, and from the worktree's archived path during the landing
   (D24, D32); the row going `COMPLETE` shows 'waiting for the next plan',
   a second plan's `RUNNING` row then shows at once, and 10 minutes with no
   `RUNNING` row end in the D3 message and the close (D32); a resume (a second `run.start`) makes an ended run
   live; `run.end` ends it; the D3 message closes after 10 s (mock clock) on
   the old format and with no `RUNNING` row; two `RUNNING` rows pick the one
   of this session, else show the choice; the `$.fs.stat` skip reads once
   for two refreshes with no change; a live agent that `$.agent.list()`
   shows as done counts as ended; a log over 4 MiB uses the tail read.

## Verification

- `claude plugin test plugins/vwf` passes every test.
- `claude plugin validate --strict plugins/vwf` passes.
- `grep -n 'parseIndex\|runningFolders\|isClaimedIn\|unitState\|gapsOf\|UnitRow\|LogRow\|PlanSnapshot' plugins/vwf/hooks/monitor/*.ts plugins/vwf/hooks/monitor/*.tsx plugins/vwf/types/index.d.ts`
  prints nothing.
- `mise x -- mise run code:format` is green.
- `grep -n 'locate\|WAIT_MS\|waitingSince\|disowned\|index\.md' plugins/vwf/hooks/monitor/register.tsx`
  prints only the old-format test of D3.

## Guardrails

- Touch nothing outside the owned paths. In `plan.ts`, `plan.test.ts` and
  the types, only the D29 removals and type changes: if U1's API lacks
  something, report `GAP:` with the assumption, and do the least inside
  `register.tsx`.
- No `node:` import, no new dependency. A render hook writes no state.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the progress pane reads the plan index, the folder and its log`
