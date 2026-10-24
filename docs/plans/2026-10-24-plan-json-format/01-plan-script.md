# U1 — plan.mjs: get, set, append and validate

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/plan-management/scripts/**`,
  `scripts/src/plan-script.test.ts`, `scripts/src/fixtures/plan-script/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/execute/scripts/log.mjs` (the house style
  of a shipped node script: shebang, header comment, argument parsing, exit
  codes), `scripts/src/execute-log.test.ts` (how a suite spawns a shipped
  script), `scripts/src/check.ts:262-308` (rule 16), and index.md's three
  facts sections "The schema of a plan folder's `index.json`", "The schema of
  `docs/plans/index.json`", "The `plan.mjs` command line" and "What `validate`
  examines".
- **Lazy-load:** `plugins/stackgen/skills/tool-config/scripts/` (a skill
  script with a `lib/` folder).

## Ruling

Decision 30: "A `stages` key in `index.json`, required for both kinds: `{renders, acceptance, ux, reconcile}`, each `{state, detail}`, `state` one of `pending`, `green`, `failed`, `skipped`. The planner writes each `pending`; `/vwf:execute` sets each with `plan.mjs set` as the stage runs or is skipped, and a resume reads them to know whether a stage already passed (today `execute/SKILL.md:790-807` keeps that in Run log rows). The migration writes the state that the old Run log rows show, else `pending`."

Decision 29: "The migration guide carries both maps itself; it pushes after its commit; a `BLOCKED` folder's worktree comes from `git worktree list` by the branch named after the folder; a part an old folder lacks gets its empty value (`[]`, `false`, `""`, `{"from": "", "to": ""}`) and the guide never stops for it; differing gap counts keep the lines and tell the user; a live folder holds an `index.md`. A cycle-only key on a change plan is a `validate` finding. U7 also owns `plugins/vwf/agents/execute-ux-reviewer.md` (`:29`, `:135`). The stackgen `tool-config` dprint and linter configs are out of scope under decision 28."

Decision 1: "Fields in `index.json`: each unit has `status`, `commit` and
`rounds`, and a review unit has `range: {from, to}`. Resume, the review commit
map, the late re-run test and the final report read these fields, the `gaps`
list and `git log`."

Decision 3: "As in the facts: no `waves:` list; each unit carries `title` and
`waits`; `gaps` serves both kinds; `covers`, `exposure`, `acceptance`,
`consent.lsp` are cycle-only."

Decision 4: "JSON: `index.json` and `docs/plans/index.json`, each with
`"format": 1`."

Decision 5: "`plan.mjs`, `node:` builtins only, with the verbs `get`, `set`,
`append` and `validate`, as in the facts. No `yq` and no `jq`."

Decision 6: "`plugins/vwf/skills/plan-management/scripts/plan.mjs`, helpers in
`plugins/vwf/skills/plan-management/scripts/lib/`."

Decision 7: "A dot path; a segment after a list chooses the entry by its `id`.
The value is a string, `--json` reads it as JSON. `append <file> <list> --json <object>`
adds an entry. A wrong id is an error, never a new entry."

Decision 12: "As in the facts: a `plans` list of rows with `id`; `gaps` is
`null` until landed, then `{open, moved_to}`."

Decision 22: "`validate` rejects a key that the schema does not name, on
every object of both files, except `run` (plan B fills it) and `consent.lsp`
(its keys are language names). So a `set` with a misspelt key fails and
writes nothing. A later format change bumps `format` and adds its keys."

Approved ruling: the validator "must fail loudly".

## Edits

1. **`plugins/vwf/skills/plan-management/scripts/plan.mjs`** — the entry file.
   First line exactly `#!/usr/bin/env node`, then a `//` header comment that
   names the four verbs and their usage, as `log.mjs` does. Mode `0755`
   (`chmod +x`). It parses the arguments and calls the helpers. It implements
   the command line exactly as index.md's facts state it: the verbs, `-` for
   stdin on `get` only, the path rule, `--json`, `--raw`, the
   temporary file plus rename in the same directory, the validation before
   every write, and the exit codes 0, 1 and 2 with one finding per line on
   stderr as `<file>: <path>: <message>`.
2. **`plugins/vwf/skills/plan-management/scripts/lib/path.mjs`** — split a dot
   path, walk it (an object segment is a key; a segment after a list is the
   `id` of an entry), get the value, and set or append at it. A missing key
   on an object is created by `set`; a missing list entry is an error.
3. **`plugins/vwf/skills/plan-management/scripts/lib/schema.mjs`** — the two
   validators, one for a plan folder file and one for the plan index, each
   returning a list of findings, implementing every check of index.md's
   "What `validate` examines". The folder validator takes the folder path so
   it can examine that each unit `file` exists and read `index.md` for the
   `- <id>:` Parked lines (a line-start match only — no markdown table
   parse). The choice between the two validators is by path: a path that ends
   in `docs/plans/index.json` is the plan index. `validate` takes a file path
   only; `-` (stdin) is for `get` alone.
4. **`scripts/src/plan-script.test.ts`** — a vitest suite that spawns the
   script with `spawnSync("node", [script, …])` against copies of the fixtures
   in a temp directory. Cover at least: `get` of a key, of a unit by id, of
   the whole file, from stdin, and `--raw`; `set` of a string, of `--json`,
   of a new key under `run` (accepted), of a misspelt key such as
   `units.U1.stauts` (refused by decision 22, file unchanged), of a cycle-only
   key such as `covers` on a `vwf-change-plan` (refused by decision 29), of a
   `stages` entry with an unknown state (refused by decision 30), of a wrong id (exit 1 or 2, file unchanged byte for
   byte); `append` of a new entry and of a duplicate id (refused, file
   unchanged); `validate` green on each valid fixture and red, exit 1, on one
   fixture per rule of "What `validate` examines"; a `set` that would make the
   file invalid (refused, file unchanged); a missing file and broken JSON
   (exit 2).
5. **`scripts/src/fixtures/plan-script/`** — a valid change-plan folder
   (`index.json`, `index.md`, its unit `.md` files), a valid cycle-plan
   folder and a valid `docs/plans/index.json`. Every committed `.json`
   fixture must be valid JSON, because the `check-json` pre-commit hook
   (`.config/pre-commit-config.yaml:189-197`) rejects a broken one: the
   suite builds the broken-JSON case and every invalid variant in code, in
   its temp directory.
6. **Serialization** — every write follows the facts:
   `JSON.stringify(value, null, 2)`, one trailing newline, the file's key
   order kept. The suite asserts the bytes of a file after one `set`.

## Verification

- `mise x -- pnpm vitest run scripts/src/plan-script.test.ts` is green.
- `mise x -- pnpm exec tsc --noEmit -p scripts` is green.
- `mise x -- mise run p:plugins:check` is green (rule 16 over the new script).
- `mise x -- mise run code:format` is green.
- `grep -rn "require(" plugins/vwf/skills/plan-management/scripts` finds
  nothing, and every import starts with `node:`, `./` or `../`.

## Guardrails

- Touch nothing outside the Owns list. Do not edit
  `plugins/vwf/skills/plan-management/SKILL.md` — U5 owns it.
- No npm package, in the script or as a new dev dependency for the suite.
- Do not write a YAML parser and do not call `yq` or `jq`.
- Delete with `rm`, never `git rm`. No `git checkout` or `git restore`.

## Commit

`feat: plan.mjs reads, writes and validates the JSON plan files`
