# The plan files

A plan folder keeps every structured fact in its `index.json`, with the schema
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md` writes. Its prose (goal,
facts, out of scope, parked) is in `index.md`, and each unit's prompt is in the
file its `units` entry names. The plan index is the base repo's
`docs/plans/index.json`. One script reads and writes both files, and below
`plan.mjs` names it:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs <verb> …
```

## Reads and writes

- **Every read** is `plan.mjs get <folder>/index.json <path>` — a dot path, where
  a segment after a list chooses the entry by its `id`: `units.U3.status`,
  `consent.merge`, `stages.ux.state`, `gaps.G2.state`.
- **Every write** the run makes to the folder is one
  `plan.mjs set <folder>/index.json <path> <value>`, or one
  `plan.mjs append <folder>/index.json <list> --json <entry>`. Pass `--json` to
  `set` for any value not a string: a number, boolean, list, object or null.
- Never rewrite the file whole, or edit it with Write, Edit or `sed`. Use one
  `set` or `append` per change — the script validates each write.
- Never call `plan.mjs rewave <file> <unit>=<wave>...`; the wave order is in
  [the rules](rules.md).
  That call is a planner write, run after a `set` of a moved unit's `waits` when
  the unit moves above wave 1. A run never renumbers waves.
- A write that exits non-zero wrote nothing. It is a blocking-gap stop per the
  Pause Conditions, with its stderr as the detail.

## What the run writes

- Each unit's `status`: `running` at dispatch, then `green`, `failed`,
  `unresolved` or `skipped`.
- Each unit's `commit` (the short hash of its last commit) and `rounds` (the
  highest round it reached).
- A `review` row's `range`, per [review-unit.md](review-unit.md).
- Each wave's `status`: `set waves.W<n>.status running` as the wave starts,
  `green` as it closes, `failed` when a unit in it failed or was skipped.
- Each entry of `gaps`.
- Each of the four `stages`: its `state` `running` as it starts, then `green`,
  `failed` or `skipped`.
- Under `all`, one entry of `overrides`.

Never set the plan's own `status.state` and `status.detail` here — they are the
`plan-management status` verb's, and the plan index is `plan-management`'s.

**The run writes no time**. Every unit, wave and stage carries `started` and
`ended`. The script `plan.mjs` stamps them itself, in the same validated write. It
stamps on each `set` of a unit's or wave's `status` or a stage's `state`. A first `running`
sets `started`, a later `running` clears `ended`, and a final status sets
`ended`. `plan-management`'s `claim` and `complete` stamp the plan's row in
`docs/plans/index.json` the same way.

## A gap

A gap is one
`append <folder>/index.json gaps --json '{"id": "G<n>", "unit": "<id>", "stage": "<stage>", "text": "<what the plan left open> · <the assumption taken>", "state": "open"}'`.
`G<n>` is one past the highest `G` id in the list. `unit` and `stage` are `""`
for a plan-level gap or a stage not known. Closing one is two `set` calls:
`gaps.G<n>.state` to `closed`, and `gaps.G<n>.text` to its line ended with how.

## Every run fact goes to the action log too

`index.json` keeps the facts: it is committed, and resume and the final report
read it. The log carries the same facts as events, the real-time feed for
`log.mjs summary`, debugging and timing statistics. The progress pane reads the
states and the times from `index.json` and the plan's row. From the log it reads
only each unit's agent and whether the run is still writing.

- After each `set` of a unit's `status`, `commit`, `rounds` or `range`, or of a
  stage, run `log.mjs event row` with the JSON on stdin.
- After each `append` to `gaps` and each `set` of a gap's `state`, run
  `log.mjs event gap`.
- A wave's `status` set is followed by no event: the wave's `phase.start` and
  `phase.end` already carry it.

Both read a quoted heredoc, so nothing in it is expanded:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs event row <<'EOF'
{"unit": "U3", "wave": 2, "status": "green", "commit": "1a2b3c4"}
EOF
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs event gap <<'EOF'
{"id": "G2", "unit": "U3", "stage": "", "text": "<the line>", "state": "open", "class": "GAP", "source": "unit"}
EOF
```

- A `row` carries exactly one of `unit` or `stage` (a `stages` key), and always
  `status`, the status after the set. A unit row also carries `wave`. Add the
  field that changed — `commit`, `rounds`, `range` (`{"from", "to"}`) or
  `detail` — or none, for a status change.
- A `gap` carries `unit`, `stage`, `text` and `state`, plus `class` and `source`
  as [the action log](action-log.md) lists them. Its `id` is the `G<n>` of the
  `gaps` entry. Leave `id` out for a recorded line that is not an `index.json`
  gap, and `log.mjs` gives it the next `L<n>`.
- Both are strict: an unknown key or a wrong value exits non-zero and writes
  nothing, and a log call never stops a run.
