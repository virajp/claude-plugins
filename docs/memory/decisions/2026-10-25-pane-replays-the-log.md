# Decision — the progress pane replays the plan's action log

**Date** 2026-10-25 · **Branch** `pane-replays-the-log` · **Plan**
`docs/plans/2026-10-25-pane-replays-the-log`

## What changed

The `/vwf:execute` progress pane (the `vwf-monitor` mod) reads three sources and
nothing else: the `RUNNING` row of the base repo's `docs/plans/index.json`, the
folder's `index.json` for the state, and the plan's action log at `run.log` for
what `index.json` does not hold — the times, each unit's agent and its liveness,
the resumes and the run end. It no longer reads the markdown plan format.

This is plan C of a chain: A (`2026-10-24-plan-json-format`) → B
(`2026-10-25-action-log-per-plan`) → C (this).

The user's words: "It will use the log file to display all the information that
it is suppose to, including gaps, etc." And: "I don't want to see the empty pane
of `vwf-monitor`, it can simply come up and vanish."

## Reversals

Of `docs/memory/decisions/2026-10-21-execute-monitor-gap-fixes.md`, confirmed in
the interview:

- **Its D1** (follow agents by name on the agent list) becomes D5 and D14: the
  agent of a unit comes from the log, and the name rules apply to the log.
- **Its D3** (the run-end rule with the 10-minute stale end) becomes D6: the run
  ends at events in the log.
- **Its D12** (`locate` keeps a known `index.md`) is superseded by D7, as that
  plan handed to a later plan.

D24 also reverses the interview answer to open point 1c, which rejected reading
the worktree copy of `index.json`.

## The decisions

1. **D1 Sources.** The `RUNNING` row of `docs/plans/index.json`, the folder's
   `index.json`, the log at `run.log`; `~` expanded from `HOME`; `VWF_LOG_ROOT`
   not honoured; no worktree search. Amended by D24.
2. **D2 Replay.** Each read replays the whole log from its first line.
3. **D3 Nothing to show.** On the old format, or with no `RUNNING` row or no
   folder, one message for 10 s, then the pane closes. Amended by D20.
4. **D4 Missing log.** Not an error: every unit pending and `no run data yet`.
5. **D5 Agents.** A unit's agent is the child of the Agent call whose summary
   names it; live from `agent.start` to `agent.end`, or ended when this
   session's `$.agent.list()` shows it done or omits it. Reverses gap-fixes D1.
6. **D6 Run end.** A `run.end` or `stop` after the last `run.start`, or a
   `session.end` of that run's session; a later `run.start` revives it; the
   10-minute stale end removed. Reverses gap-fixes D3.
7. **D7 Finding the plan.** `resolveBase` and `memberPaths` stay; `locate`,
   `roots`, `isClaimedIn` and the worktree search go. With several `RUNNING`
   rows, the one whose log's last `run.start` is this session's, else the list
   and `/vwf-monitor <folder>`. Supersedes gap-fixes D12.
8. **D8 Following.** The 3 s timer while live and the pokes stay; a `$.fs.stat`
   with unchanged size and mtime skips the read.
9. **D9 Over 4 MiB.** `tail -c 4000000` through `$.process.run`, replayed from
   the first full line; the footer says the replay is partial.
10. **D10 Titles and times.** A unit's start is its first `running` row, else
    its agent's `agent.start`; its end the last row with a final status.
11. **D11 Types.** `UnitRow`, `LogRow`, `PlanSnapshot` dropped; the JSON unit
    shape and the replayed state added. The `$.state` keys, `/vwf-monitor`, the
    pane id and the control-character strip stay; no `node:` import, no
    `plan.mjs` import.
12. **D12** `docs/plans/gaps/2026-10-21-execute-monitor-gap-fixes.md` deleted;
    its items are in this plan, two taken and two parked.
13. **D13** A security review unit covers U1 and U2.
14. **D14 Name rules over the log.** The summary splits on `::`; today's
    `unitFor` rules and the `REVIEWER` regex map name and type to a unit or a
    wave review. The latest agent of a unit is shown. Amends D5.
15. **D15** `unitState`, `isFinished`, `gapsOf` removed; final statuses are
    green, failed, unresolved, skipped.
16. **D16** `$.process.run` runs the tail with no shell; a truncated or failed
    run shows the problem line and a partial replay.
17. **D17** Superseded by D32.
18. **D18 Re-run units.** The end time is empty until the unit ends again; the
    time counts from the first start.
19. **D19** `site/.../mempalace.md` counts five action-log hooks.
20. **D20 Waiting for the claim.** An open from `/vwf:execute` shows
    `waiting for the claim` and polls up to 10 minutes; then the D3 message.
21. **D21** Superseded by D32.
22. **D22 A tail with no `run.start`.** Live unless it holds a `run.end`, a
    `stop` or a `session.end` of the last session seen; the D7 session is the
    tail's last line's.
23. **D23 Empty `run`.** A `RUNNING` row always shows: `no run data yet`, and
    polling until the run key and the log appear.
24. **D24 Hybrid state.** The state comes from the worktree copy of `index.json`
    at `run.worktree`, else the main or archived copy; the log gives only times,
    agents, resumes, run end and the D7 session.
25. **D25** `execute/SKILL.md:378` stays true.
26. **D26** Titles come from the D24 state file; a partial tail keeps D10's
    start fallback.
27. **D27** `.claude/docs/plugins.md` names the D24 sources.
28. **D28** A runner's `log.mjs` calls carry the parent session id, verified.
29. **D29** U1 adds the new API beside the old; U2 removes the dead readers and
    types.
30. **D30** `execute-stages.md` and `action-log.md` say the pane reads the
    times, agents and run end from the log and the state from `index.json`; the
    `row` and `gap` events stay for `log.mjs summary` and a later reader.
31. **D31** No runner scoping: the per-plan log is the scope.
32. **D32 The running plan.** The pane follows whichever row reads `RUNNING`;
    during the landing it reads the archived copy inside the worktree; with no
    `RUNNING` row it shows `waiting for the next plan` up to 10 minutes, then
    the D3 message. Supersedes D17 and D21.

## Gaps taken during the run

- **G1** D22's "last session seen" is the session of the tail's last line, the
  same as D7's.
- **G2** The D7 choice view of several `RUNNING` rows refreshes on pokes only,
  not on the 3 s timer.
- **Security review** `parse()` strips control characters from a JSON error
  before the pane shows it.

## Rejected

A worktree search for a newer `index.json`; an incremental read; a persistent
empty pane; the log as the only source of run state; the `FileChanged` hook;
runner scoping; keeping a landed plan on screen.
