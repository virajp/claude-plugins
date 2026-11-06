# The action log (every run)

Read this once, at Resolve, before the first log call. Every plan has one JSONL file outside the
repo, so nothing is committed and no worktree removal or branch cleanup touches it:

    ~/Library/Caches/vwf/<repo>/<plan folder basename>.jsonl

The name `<repo>` is the repo that holds the folder, derived from its git common dir. So the main
checkout and a worktree name the same file. When set, `$VWF_LOG_ROOT` replaces `~/Library/Caches/vwf`;
the tests use it. The claim writes the path, with a literal `~`, into the folder's `run.log`, and
`run.worktree` beside it. That is how a reader finds both.

The file is **append-only**: no step edits or removes a line of it. Each `start`, fresh or resume, appends a
new `run.start`. Every line carries the id of the run that wrote it in its `run` field,
`<YYYYMMDD-HHMMSS>-<session8>`, local time. So a plan paused at 12:30 and resumed at 14:45 holds both runs, the
later superseding the earlier. macOS does not clear `~/Library/Caches`. The file goes only when `prune` removes
it, under Clean-up below.

The log is the run's real-time feed, for debugging and timing statistics. It answers what the folder's
`index.json` cannot:

- how long each phase, gate and commit took;
- what ran in parallel and what ran in sequence;
- which agent ran each unit;
- where a gap came from: the agent that raised it and the tool calls it made first.

The start and end of each unit, wave and stage, and of the plan, live in `index.json` and the plan's row. The script
`plan.mjs` stamps them ([the plan files](plan-files.md)). The progress pane takes those from the JSON. From the log it takes
only each unit's agent, whether it is live, and how recent the last line is. The `row` and `gap` events stay, for
`log.mjs summary` and a later reader.

Two writers append to it:

- The **hooks** in `hooks/hooks.json` write every tool call and subagent: start, end, duration, agent id. They write
  on the machine's clock, with nothing for you to do.
- **You** write what only the orchestrator knows, through the script below.

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs <verb> …
```

Call it from the directory the step runs in: the main checkout before the worktree exists, the worktree after. A log
call never stops a run, and is never a reason to pause: skip a call that fails, and go on. The log is a record of the
run, never an input to it. The unit fields of `index.json` and the worktree stay the record a resume reads.

## The calls

Each item is one point in the run and the call made there. Fill the names in angle brackets from the run.

- **Once the folder is read and not refused:** `start --folder <folder> --mode fresh`, `<folder>` the copy the run read.
  On a resume, the call is `start --folder <the worktree copy of the folder> --mode resume`.
  - The value of `--mode` is `fresh` or `resume` only. Another value exits 2 and writes nothing.
  - The `start` call reads `<folder>/index.json`. It appends one `plan.snapshot` event, `{folder, units}`, right after
    `run.start`.
  - The `units` value is that file's `units` list, which is where a unit's `kind` comes from.
- **Each phase, before and after:** `event phase.start --phase <phase>` and `event phase.end --phase <phase>`, with the
  same keys on both.
- **The execution mode, once decided, and again if the run falls back:** `event execution --mode <solo|teams> --reason "<why>"`,
  per [preflight.md](preflight.md). Drop `--reason` when the mode is what the plan recorded.
- **Every gate line:** `run --tier <tier> --unit <id> --wave <n> -- <the gate line>`, the tier one of `unit`, `wave`,
  `plan`, `preflight`. Drop a key that does not apply.
- **Every commit on a unit's behalf:** `run --event commit --unit <id> -- <the commit command>`.
- **Each `review` row round, as it returns:** `event review.round --row <id> --loop <loop id> --round <n>` plus
  `--from <sha> --to <sha> --files <n> --review <n> --security <n> --routed <n>`, the last the count of findings routed to
  an uncovered unit.
- **Each gap recorded, and each `append` to the folder's `gaps`, and each `set` of a gap's `state`:** `event gap`, its JSON
  on stdin (below). A recorded gap is a `GAP:`, an `UNRESOLVED:`, a `contested` finding or an oscillation.
- **Each run fact set in `index.json`:** `event row`, its JSON on stdin (below), right after the `plan.mjs set`. A run
  fact is a unit's `status`, `commit`, `rounds` or `range`, or a stage. A wave's `status` set has no event: the wave's `phase.start` and
  `phase.end` carry it.
- **A stop** — a pause, a block, a refusal after `start`: `event stop --reason "<why>" --resume "/vwf:execute <folder>"`,
  then `end --outcome paused` or `end --outcome blocked`.
- **The landing, after the last after-landing step:** `end --outcome complete`, or `end --outcome ready` when
  `consent.merge` read `false`.

The phases, in run order: `doctor`, `claim`, `worktree`, `preflight`, `wave` (with `--wave <n>`), `acceptance`, `ux`,
`reconcile`, `final-waves`, `plan-gate`, `land`, `after-landing`. A review row's loop sits inside its wave's phase, and is
logged by its rounds.

`run` runs the command with its output where it would have gone. It then logs the command line, its exit code and its
duration, and exits with the command's own code. So wrapping a gate line changes nothing about how its result is read. Put
the shell's redirection outside the wrapper:
`log.mjs run --tier wave -- mise x -- mise run code:lint > /tmp/g.log 2>&1`.

For the older events a `--key value` pair becomes a field; quote a value with spaces. Keep a `text` to the line as recorded,
never a file's content.

### `row` and `gap` on stdin

`event row` and `event gap` read one JSON object on stdin, in a quoted heredoc (`<<'EOF'`), so the shell expands nothing in it:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs event row <<'EOF'
{"unit": "U2", "wave": 1, "status": "green", "commit": "1a2b3c4", "rounds": 1}
EOF
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs event gap <<'EOF'
{"unit": "U2", "stage": "", "text": "<the line>", "state": "open", "class": "GAP", "source": "unit"}
EOF
```

Both are strict, like `plan.snapshot` and `session.end`. A missing required key, a wrong type, a wrong enum value or an unknown
key exits non-zero and writes nothing. Like every log call, it never stops the run.

- **`row`**: exactly one of `unit` (`"U<n>"`) or `stage` (a `stages` key). `status`, always: the unit's or the stage's status after
  the set, one of the status values `plan.mjs` validates. `wave` (an integer, 1 or more), always with `unit`. Then the field that
  changed, when one did: `rounds` (an integer, 0 or more), `commit` (the short hash), `range` (`{"from": "<sha>", "to": "<sha>"}`) or
  `detail` (a string). A row with `status` alone records a status change.
- **`gap`**: `unit`, `stage` (each `""` when not known), `text` (not empty) and `state` (`open` or `closed`), all required. `class`
  (`GAP`, `UNRESOLVED`, `contested`, `oscillation`) and `source` (`unit`, `wave-review`, `review-row`, `gate`, `acceptance`, `ux`),
  optional. `id` is the `G<n>` of the folder's `gaps` entry when the gap is one. Leave it out for a recorded line that is not an
  `index.json` gap. Then `log.mjs` writes the next `L<n>`, with `state` `open`. That id is one past the highest `L` id in the log,
  or `L1` when none. Never read the log for an id.

### No active run

`event` and `run` exit 0 and print one fixed line on stderr, `log.mjs: no active run in session <id>`, when the session has no marker.
A gate it wrapped keeps its own exit code. When you see that line during a run, run `start --mode resume --folder <folder>`, which
appends to the same file, then repeat the call.

## Clean-up

- **Old logs — `prune`**. `log.mjs prune --repo <root> --days 30 --keep <folder basename>` deletes a log under `<log root>/<repo>/`
  only when both of these hold:
  - Its plan folder is archived: `<root>/docs/plans/archived/<basename>` or `<basename>-<n>` is a directory.
  - The log has not changed for more than 30 days.

  It never deletes the log `--keep` names, so a live plan paused for a month keeps its log. The verb `plan-management archive` calls it
  as its last step, after each move into `docs/plans/archived/`. It passes `--keep` the folder it archived, and `--repo` the root of the
  checkout it ran in. The `/vwf:execute` skill never calls it itself.
- **Dead markers — at `start`**. `start` deletes the marker of every other session whose log has not changed for 24 hours, and always the
  `nosession` marker. It never touches a log.
- **A session's end — the `SessionEnd` hook**. A session ends on `/clear`, a normal exit or `/resume`. The hook then appends
  `session.end {reason}` to that session's log and deletes its marker. A crash fires no hook; the next `start`'s sweep takes that marker.

## Reading it

    node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs summary <file>

This reports each run of the plan, one `run.start` to the next, and the totals. The pause from a run's last line to the next `run.start` is
not counted. For each, it prints:

- the phases with their durations;
- every agent with its start, duration and what spawned it;
- the total agent time, the wall time the agents covered, the peak number at once and the parallel factor;
- the gates by tier and the commits;
- the tool time of the orchestrator apart from the agents;
- the units from their `row` events, every gap from its `gap` events, every stop, and each execution mode.

The final report names the log file's path, the folder's `run.log`.
