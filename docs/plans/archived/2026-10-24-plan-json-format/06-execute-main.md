# U6 — /vwf:execute: the main file, preflight and all

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/skills/execute/references/preflight.md`,
  `plugins/vwf/skills/execute/references/all.md`,
  `plugins/vwf/agents/execute-runner.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, and index.md's facts
  sections (the two schemas, the command line, and "Today's readers and
  writers", which lists the `file:line` of each passage in `SKILL.md`).
- **Lazy-load:** the other files in `plugins/vwf/skills/execute/references/`
  (U7 owns them; read, never edit).

## Ruling

Decision 30: "A `stages` key in `index.json`, required for both kinds: `{renders, acceptance, ux, reconcile}`, each `{state, detail}`, `state` one of `pending`, `green`, `failed`, `skipped`. The planner writes each `pending`; `/vwf:execute` sets each with `plan.mjs set` as the stage runs or is skipped, and a resume reads them to know whether a stage already passed (today `execute/SKILL.md:790-807` keeps that in Run log rows). The migration writes the state that the old Run log rows show, else `pending`."

Decision 32: "An empty list is the old-shape case: preflight does not refuse it, the landing writes nothing to `.config/releases.yaml`, and the report carries today's fixed line (`preflight.md:11-14`, `SKILL.md:981-986`). Only a migrated folder can have `[]`; the planners always write one row per project.                                           "

Decision 23: "The repo is in the old format whenever `docs/plans/index.md` exists, with or without `docs/plans/index.json` (a migration stopped half way). The test reads the local checkout. A repo with neither file has no plan: `next` and `all` report no runnable plan, and so does an origin tree with no `docs/plans/index.json`."

Decision 25: "The message names `https://github.com/virajp/claude-plugins/blob/main/docs/plans/migrate.md`. Other repos get vwf only from a release, which merges `develop` into `main`, so the URL exists by then. On this machine the staged build prints it before the release; that 404 is accepted."

Decision 20: "U1 runs alone in wave 1 (with U9, which names no plugin path).
U3 to U8 run in wave 2 and depend on U1, because rule 6 of
`p:plugins:check` fails a `${CLAUDE_PLUGIN_ROOT}` path to `plan.mjs` before
U1 commits it."

Approved ruling: "**`/vwf:execute` supports only the new format.**" The
validator runs at "`/vwf:execute` … at preflight. It must fail loudly."

Decision 1: "Fields in `index.json`: each unit has `status`, `commit` and
`rounds`, and a review unit has `range: {from, to}`. Resume, the review commit
map, the late re-run test and the final report read these fields, the `gaps`
list and `git log`. The mempalace `runs` journal still mirrors each fact that
a Run log row carried."

Decision 7: "A dot path; a segment after a list chooses the entry by its `id`.
The value is a string, `--json` reads it as JSON. `append <file> <list> --json <object>`
adds an entry. A wrong id is an error, never a new entry."

Decision 9: "Only the new format is supported. A repo is in the old format
whenever `docs/plans/index.md` exists, with or without `docs/plans/index.json`; a
folder is in the old format when it has `index.md` and no `index.json`.
`/vwf:execute` (a named folder, `next` and `all`) and every `plan-management`
verb examine the format first. On the old format they stop before any change
and print the migration message: the repo uses the old plan format; migrate it
with `https://github.com/virajp/claude-plugins/blob/main/docs/plans/migrate.md`
— in a local clone of `virajp/claude-plugins`, paste "Read
`<local path>/docs/plans/migrate.md` and follow it in this repo."; then run
the same command again. After the migration the command works on the new
format. The test reads the local checkout. A repo with neither file has no plan:
`next` and `all` report no runnable plan, and so does an origin tree with no
`docs/plans/index.json`."

Decision 10: "No `execute-old` and no `plan-management-old` skill. The user
said: "I am not too keen on making too many changes for something which is
temporary.""

Decision 14: "The orchestrator reads wave, kind, model, owns and depends_on
from `index.json` and puts the owns list into the dispatch prompt. A widened
Owns is one `set` call."

Decision 16: "The runner appends one entry to `overrides` (`{id, text}`) and
never changes `consent`."

## Edits

1. **`plugins/vwf/skills/execute/SKILL.md`**:
   - A new first step, before anything else: the format test of decision 9.
     On the old format, stop and print the migration message; claim
     nothing, cut no worktree, write nothing.
   - Every read of the folder (frontmatter, Status, Consent, Units, gates,
     After landing, Release levels, Gaps, Acceptance) becomes a
     `plan.mjs get` of the key that replaces it; every write becomes one
     `plan.mjs set` or `append` (unit `status`, `commit`, `rounds`; `gaps`
     entries, for both kinds of plan). `status` stays the
     `plan-management status` verb's.
   - The Run log: remove the table and every "append a Run log row". Each
     fact a row carried goes to the unit fields where it is a unit fact, and
     to the mempalace `runs` journal as today. The final report is rendered
     from the unit fields, the `gaps` list, `git log` and the journal, never
     from recollection. The wave closing commit
     `docs: plan run log — <folder> wave <n>` becomes
     `docs: plan state — <folder> wave <n>`.
   - The plan index: `docs/plans/index.md` → `docs/plans/index.json`, through
     `plan-management` as today.
   - The Consent reads: `consent.merge`, `consent.end_all_run`,
     `consent.lsp.<language>`; the old-shape `Release <project>` row passage is
     removed.
   - A unit's dispatch prompt carries its `owns` list from `index.json`, and
     its model from `units[].model` (decision 14).
   - The plan-level stages (`:790-807` today): `renders`, `acceptance`, `ux`
     and `reconcile` are set in `stages` with `plan.mjs set` as each one runs
     or is skipped, and a resume reads `stages` to know whether a stage
     already passed (decision 30).
   - `release_levels: []` keeps the old-shape behaviour of `:981-986`: write
     nothing to `.config/releases.yaml`, and print today's fixed report line
     (decision 32).
2. **`plugins/vwf/skills/execute/references/preflight.md`** — preflight
   starts with
   `node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs validate <folder>/index.json`;
   a red result is a refusal that prints every finding. The release-levels and
   LSP checks read `release_levels` and `consent.lsp`. An empty
   `release_levels` list is the old-shape case of `:11-14`: not a refusal
   (decision 32). A gap is appended to
   `gaps`.
3. **`plugins/vwf/skills/execute/references/all.md`** — `list` and `next`
   read `docs/plans/index.json`; the `override:` Run log row becomes one
   `append <folder>/index.json overrides --json '{"id": "O<n>", "text": "…"}'`
   (decision 16); `consent.end_all_run` replaces the Consent row.
4. **`plugins/vwf/agents/execute-runner.md`** — the override goes to
   `overrides` per decision 16; DETAIL echoes `status.detail`.

## Verification

- `grep -n "Run log\|docs/plans/index.md\|Status block\|Units table\|frontmatter" <each owned file>`
  finds only the format test of decision 9.
- `grep -n "migrate.md" plugins/vwf/skills/execute/SKILL.md` finds the
  format test.
- `mise x -- mise run code:format` is green.

## Guardrails

- Touch nothing outside the owned files. The references `blocking.md`,
  `review-unit.md`, `edit-unit.md`, `code-unit.md`, `acceptance-and-ux.md`,
  `action-log.md` and `assets/execute-stages.md` are U7's; when this file
  names a rule they hold, keep the pointer and do not restate the rule.
- Do not change `skills/execute/scripts/log.mjs` or its calls (plan B).
- Keep the procedure otherwise unchanged: change only what the format change
  falsifies.
- `plugins/**/*.md` is not formatted: keep lines at 80 columns by hand. Keep
  each code span on one line. Keep the frontmatter strict YAML.

## Commit

`feat: execute reads and writes index.json and stops on the old format`
