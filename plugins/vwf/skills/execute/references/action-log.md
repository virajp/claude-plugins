# The action log (every run)

Read this once, at Resolve, before the first log call. Every plan has one
JSONL file outside the repo, so nothing is committed and no worktree removal
or branch cleanup touches it:

    ~/Library/Caches/vwf/<repo>/<plan folder basename>.jsonl

`<repo>` is the name of the repo that holds the folder, derived from its git
common dir, so the main checkout and a worktree name the same file.
`$VWF_LOG_ROOT`, when set, replaces `~/Library/Caches/vwf` — the tests use
it. The claim writes the path, with a literal `~`, into the folder's
`run.log`, and `run.worktree` beside it; that is how a reader finds both.

The file is **append-only**: no step edits or removes a line of it. Each
`start`, fresh or resume, appends a new `run.start`, and every line carries
the id of the run that wrote it in its `run` field —
`<YYYYMMDD-HHMMSS>-<session8>`, local time — so a plan paused at 12:30 and
resumed at 14:45 holds both runs, the later superseding the earlier. macOS
does not clear `~/Library/Caches`; the file goes only when `prune` removes
it, under Clean-up below.

The log answers four questions the unit fields of the folder's `index.json`
cannot: how long each phase, gate and commit took; what ran in parallel and
what ran in sequence; when each unit started and ended, which agent ran it and
when the run ended — what the progress pane reads from it, taking the state
from `index.json`; and where a gap came from — the agent that raised it and
the tool calls it made first. The `row` and `gap` events stay, for
`log.mjs summary` and a later reader.

Two writers append to it. The **hooks** in `hooks/hooks.json` write every tool
call and subagent — start, end, duration, agent id — on the machine's clock,
with nothing for you to do. **You** write what only the orchestrator knows,
through the script:

    node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs <verb> …

Call it from the directory the step runs in — the main checkout before the
worktree exists, the worktree after. A log call never stops a run and is never
a reason to pause: a call that fails is skipped, and the run goes on. The log
is a record of the run, never an input to it — the unit fields of
`index.json` and the worktree stay the record a resume reads.

## The calls

Each item is one point in the run and the call made there; the names in angle
brackets are filled from the run.

- **Once the folder is read and not refused:** `start --folder <folder> --mode fresh`,
  `<folder>` the copy the run read; or, on a resume,
  `start --folder <the worktree copy of the folder> --mode resume`. `--mode`
  is `fresh` or `resume` only; another value exits 2 and writes nothing.
  `start` reads `<folder>/index.json` and appends one `plan.snapshot` event,
  `{folder, units}`, right after `run.start` — `units` that file's `units`
  list, which is where a unit's `kind` comes from.
- **Each phase, before and after:** `event phase.start --phase <phase>` and
  `event phase.end --phase <phase>`, with the same keys on both.
- **Every gate line:** `run --tier <tier> --unit <id> --wave <n> -- <the gate line>`,
  the tier one of `unit`, `wave`, `plan`, `preflight`; drop a key that does not
  apply.
- **Every commit on a unit's behalf:** `run --event commit --unit <id> -- <the commit command>`.
- **Each `review` row round, as it returns:** `event review.round --row <id> --loop <loop id> --round <n>`
  plus `--from <sha> --to <sha> --files <n> --review <n> --security <n> --routed <n>`,
  the last the count of findings routed to an uncovered unit.
- **Each gap recorded** — a `GAP:`, an `UNRESOLVED:`, a `contested` finding, an
  oscillation — and each `append` to the folder's `gaps` and each `set` of a
  gap's `state`: `event gap`, its JSON on stdin (below).
- **Each run fact set in `index.json`** — a unit's `status`, `commit`,
  `rounds` or `range`, or a stage: `event row`, its JSON on stdin (below),
  right after the `plan.mjs set`.
- **A stop** — a pause, a block, a refusal after `start`: `event stop --reason "<why>" --resume "/vwf:execute <folder>"`,
  then `end --outcome paused` or `end --outcome blocked`.
- **The landing, after the last after-landing step:** `end --outcome complete`,
  or `end --outcome ready` when `consent.merge` read `false`.

The phases, in run order: `doctor`, `claim`, `worktree`, `preflight`, `wave`
(with `--wave <n>`), `acceptance`, `ux`, `reconcile`, `final-waves`,
`plan-gate`, `land`, `after-landing`. A review row's loop sits inside its
wave's phase and is logged by its rounds.

`run` runs the command with its output where it would have gone, then logs the
command line, its exit code and its duration, and exits with the command's own
code — so wrapping a gate line changes nothing about how its result is read.
Put the shell's redirection outside the wrapper:
`log.mjs run --tier wave -- mise x -- mise run code:lint > /tmp/g.log 2>&1`.

For the older events a `--key value` pair becomes a field; a value with spaces
is quoted. Keep a `text` to the line as recorded, never a file's content.

### `row` and `gap` on stdin

`event row` and `event gap` read one JSON object on stdin, in a quoted
heredoc (`<<'EOF'`), so the shell expands nothing in it:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs event row <<'EOF'
{"unit": "U2", "wave": 1, "status": "green", "commit": "1a2b3c4", "rounds": 1}
EOF
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs event gap <<'EOF'
{"unit": "U2", "stage": "", "text": "<the line>", "state": "open", "class": "GAP", "source": "unit"}
EOF
```

Both are strict, like `plan.snapshot` and `session.end`: a missing required
key, a wrong type, a wrong enum value or an unknown key exits non-zero and
writes nothing — and, like every log call, never stops the run.

- **`row`** — exactly one of `unit` (`"U<n>"`) or `stage` (a `stages` key);
  `status`, always — the unit's or the stage's status after the set, one of
  the status values `plan.mjs` validates; `wave` (an integer, 1 or more),
  always with `unit`. Then the field that changed, when one did: `rounds` (an
  integer, 0 or more), `commit` (the short hash), `range`
  (`{"from": "<sha>", "to": "<sha>"}`) or `detail` (a string). A row with
  `status` alone records a status change.
- **`gap`** — `unit`, `stage` (each `""` when not known), `text` (not empty)
  and `state` (`open` or `closed`), all required; `class` (`GAP`,
  `UNRESOLVED`, `contested`, `oscillation`) and `source` (`unit`,
  `wave-review`, `review-row`, `gate`, `acceptance`, `ux`), optional. `id` is
  the `G<n>` of the folder's `gaps` entry when the gap is one; leave it out
  for a recorded line that is not an `index.json` gap, and `log.mjs` writes
  the next `L<n>` — one past the highest `L` id in the log, `L1` when none —
  with `state` `open`. Never read the log for an id.

### No active run

`event` and `run` exit 0 and print one fixed line on stderr,
`log.mjs: no active run in session <id>`, when the session has no marker —
a gate it wrapped keeps its own exit code. When you see that line during a
run, run `start --mode resume --folder <folder>`, which appends to the same
file, then repeat the call.

## Clean-up

- **Old logs — `prune`.**
  `log.mjs prune --repo <root> --days 30 --keep <folder basename>` deletes
  a log under `<log root>/<repo>/` only when its plan folder is archived —
  `<root>/docs/plans/archived/<basename>` or `<basename>-<n>` is a
  directory — and the log has not changed for more than 30 days. It never
  deletes the log `--keep` names, so a live plan paused for a month keeps
  its log. `plan-management archive` calls it as its last step,
  after each move into `docs/plans/archived/`, with `--keep` the folder it
  archived and `--repo` the root of the checkout it ran in. `/vwf:execute`
  never calls it itself.
- **Dead markers — at `start`.** `start` deletes the marker of every other
  session whose log has not changed for 24 hours, and always the `nosession`
  marker. It never touches a log.
- **A session's end — the `SessionEnd` hook.** When a session ends —
  `/clear`, a normal exit, `/resume` — the hook appends
  `session.end {reason}` to that session's log and deletes its marker. A
  crash fires no hook; the next `start`'s sweep takes that marker.

## Reading it

    node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs summary <file>

reports each run of the plan — one `run.start` to the next; the pause from a
run's last line to the next `run.start` is not counted — and the totals. For
each, it prints the phases with their durations, every agent with its start,
duration and what spawned it — with the total agent time, the wall time they
covered, the peak number at once and the parallel factor — the gates by tier,
the commits, the tool time of the orchestrator apart from the agents, the
units from their `row` events, every gap from its `gap` events, and every
stop. The final report names the log file's path, the folder's `run.log`.
