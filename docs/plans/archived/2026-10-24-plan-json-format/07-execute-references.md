# U7 — /vwf:execute: the references, the stages and the agents

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/execute/references/blocking.md`,
  `plugins/vwf/skills/execute/references/review-unit.md`,
  `plugins/vwf/skills/execute/references/edit-unit.md`,
  `plugins/vwf/skills/execute/references/code-unit.md`,
  `plugins/vwf/skills/execute/references/acceptance-and-ux.md`,
  `plugins/vwf/skills/execute/references/action-log.md`,
  `plugins/vwf/assets/execute-stages.md`,
  `plugins/vwf/agents/execute-coder.md`,
  `plugins/vwf/agents/execute-code-reviewer.md`,
  `plugins/vwf/agents/execute-security-reviewer.md`,
  `plugins/vwf/agents/execute-acceptance-verifier.md`,
  `plugins/vwf/agents/execute-ux-reviewer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, and index.md's facts
  sections (the two schemas, the command line, "Today's readers and
  writers").
- **Lazy-load:** `plugins/vwf/skills/execute/SKILL.md` (U6 owns it; read,
  never edit).

## Ruling

Decision 30: "A `stages` key in `index.json`, required for both kinds: `{renders, acceptance, ux, reconcile}`, each `{state, detail}`, `state` one of `pending`, `green`, `failed`, `skipped`. The planner writes each `pending`; `/vwf:execute` sets each with `plan.mjs set` as the stage runs or is skipped, and a resume reads them to know whether a stage already passed (today `execute/SKILL.md:790-807` keeps that in Run log rows). The migration writes the state that the old Run log rows show, else `pending`."

Decision 29: "The migration guide carries both maps itself; it pushes after its commit; a `BLOCKED` folder's worktree comes from `git worktree list` by the branch named after the folder; a part an old folder lacks gets its empty value (`[]`, `false`, `""`, `{"from": "", "to": ""}`) and the guide never stops for it; differing gap counts keep the lines and tell the user; a live folder holds an `index.md`. A cycle-only key on a change plan is a `validate` finding. U7 also owns `plugins/vwf/agents/execute-ux-reviewer.md` (`:29`, `:135`). The stackgen `tool-config` dprint and linter configs are out of scope under decision 28."

Decision 20: "U1 runs alone in wave 1 (with U9, which names no plugin path).
U3 to U8 run in wave 2 and depend on U1, because rule 6 of
`p:plugins:check` fails a `${CLAUDE_PLUGIN_ROOT}` path to `plan.mjs` before
U1 commits it."

Decision 1: "Fields in `index.json`: each unit has `status`, `commit` and
`rounds`, and a review unit has `range: {from, to}`. Resume, the review commit
map, the late re-run test and the final report read these fields, the `gaps`
list and `git log`. The mempalace `runs` journal still mirrors each fact that
a Run log row carried."

Decision 7: "A dot path; a segment after a list chooses the entry by its `id`.
The value is a string, `--json` reads it as JSON. `append <file> <list> --json <object>`
adds an entry. A wrong id is an error, never a new entry."

Decision 14: "No header lines (Wave, Depends on, Owns, Model, Kind). … The
orchestrator reads wave, kind, model, owns and depends_on from `index.json`
and puts the owns list into the dispatch prompt. A widened Owns is one `set`
call."

## Edits

1. **`references/blocking.md`** — the resume procedure reads each unit's
   `status` and `commit` from `index.json`, checks them against the worktree
   as today, and checks review-row ancestry against the row's `range.to`. A
   reset sets `status` to `pending` with `plan.mjs set`. Remove "the Units
   table and Run log carry the same facts".
2. **`references/review-unit.md`** — the commit map comes from
   `units[].commit` and `git log` over the range; each round sets the row's
   `range.from` and `range.to` and its `rounds`; the next row's `from` is the
   previous row's `range.to`; the late re-run reads the same fields; the
   widened coverage, the dropped findings and each round are mirrored to the
   journal in place of Run log rows; `engine/` logs stay. A row is found by
   `kind: review` in `units`.
3. **`references/edit-unit.md`** and **`references/code-unit.md`** — the unit
   is marked `running`, then `green` with its `commit` and `rounds`, through
   `plan.mjs set`; a widened Owns is one `set` of `units.<id>.owns --json`;
   a `GAP:` line is one `append` to `gaps`; the Run log rows become journal
   mirrors. The unit's prompt carries its `owns` from `index.json`, since the
   unit file has no header lines.
4. **`references/acceptance-and-ux.md`** — the criteria come from
   `acceptance`; a gap goes to `gaps`. The stage result goes to
   `stages.acceptance` and `stages.ux`, a `skipped` stage with its reason in
   `detail` (decision 30).
5. **`references/action-log.md`** — where it sets the action log apart from
   the Run log, it now sets it apart from the unit fields of `index.json`.
6. **`plugins/vwf/assets/execute-stages.md`** — the Run log shape section
   becomes "Run state in `index.json`": the unit fields, `range`, `gaps`,
   `overrides`, and the journal mirror.
7. **The four agents** — each reads the plan through `index.json` (the
   decisions, the unit entry, `shared_files`, `acceptance`) and the prose of
   `index.md` ("Facts the survey established"); the reviewers read each
   covered unit's `owns` from `index.json`.
8. **`plugins/vwf/agents/execute-ux-reviewer.md`** — `:29` and `:135` name
   "the `covers:` doc names": they become the doc names in the `covers` list
   of the folder's `index.json` (decision 29).

## Verification

- `grep -n "Run log\|docs/plans/index.md\|Status block\|Units table" <each owned file>`
  finds nothing.
- `mise x -- mise run code:format` is green.

## Guardrails

- Touch nothing outside the owned files. `SKILL.md`, `preflight.md`,
  `all.md` and `execute-runner.md` are U6's.
- Do not change `skills/execute/scripts/log.mjs` or its calls (plan B).
- Keep each procedure otherwise unchanged: change only what the format change
  falsifies.
- `plugins/**/*.md` is not formatted: keep lines at 80 columns by hand. Keep
  each code span on one line. Keep the agents' frontmatter strict YAML.

## Commit

`feat: the execute references and agents use the run state in index.json`
