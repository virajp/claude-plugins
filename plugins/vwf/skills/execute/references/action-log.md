# The action log (every run)

Read this once, at Resolve, before the first log call. Every run writes one
JSONL file outside the repo, so nothing is committed and no worktree removal
or branch cleanup touches it:

    /tmp/vwf/<repo>/<plan folder basename>/<YYYYMMDD-HHMMSS>-<session8>.jsonl

macOS removes a file under `/tmp` that nothing read or changed for three days.
The log answers four questions the unit fields of the folder's `index.json`
cannot: how long each phase, gate and commit took; what ran in parallel and
what ran in sequence; what the progress pane shows; and where a gap came from
— the agent that raised it and the tool calls it made first.

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
  or `--mode resume` on a resume.
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
  oscillation: `event gap --class <class> --source <source> --unit <id> --text "<the line>"`,
  the class one of `GAP`, `UNRESOLVED`, `contested`, `oscillation`, the source
  one of `unit`, `wave-review`, `review-row`, `gate`, `acceptance`, `ux`.
- **Each unit's outcome, as its `status` in `index.json` is set:** `event unit --unit <id> --kind <kind> --wave <n> --status <status> --round <n>`.
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

A `--key value` pair becomes a field; a value with spaces is quoted. Keep a
`--text` to the line as recorded, never a file's content.

## Reading it

    node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs summary <file>

prints the phases with their durations, every agent with its start, duration
and what spawned it — with the total agent time, the wall time they covered,
the peak number at once and the parallel factor — the gates by tier, the
commits, the tool time of the orchestrator apart from the agents, every gap,
and every stop. The final report names the log file's path.
