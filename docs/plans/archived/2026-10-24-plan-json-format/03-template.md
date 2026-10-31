# U3 — The folder template and the interview checklist

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/assets/templates/plan-folder.md`,
  `plugins/vwf/assets/plan-interview.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom, and index.md's facts
  sections on the two schemas and the `plan.mjs` command line.

## Ruling

Decision 30: "A `stages` key in `index.json`, required for both kinds: `{renders, acceptance, ux, reconcile}`, each `{state, detail}`, `state` one of `pending`, `green`, `failed`, `skipped`. The planner writes each `pending`; `/vwf:execute` sets each with `plan.mjs set` as the stage runs or is skipped, and a resume reads them to know whether a stage already passed (today `execute/SKILL.md:790-807` keeps that in Run log rows). The migration writes the state that the old Run log rows show, else `pending`."

Decision 24: "A template sample that `plan.mjs validate` rejects is a failure:
U3's Verification validates each sample, and U12 returns `UNRESOLVED:` on a
red sample, which fails the run."

Decision 20: "U1 runs alone in wave 1 (with U9, which names no plugin path).
U3 to U8 run in wave 2 and depend on U1, because rule 6 of
`p:plugins:check` fails a `${CLAUDE_PLUGIN_ROOT}` path to `plan.mjs` before
U1 commits it."

Approved rulings: "`index.json` holds all the structured data" (the old
frontmatter keys, the status and its detail line, the consent, the three gate
tiers, the after-landing steps, the release levels, the units, the reason
each unit waits, the shared files, the decisions, and the `run:` paths, which
plan B fills); "`index.md` holds the prose: goal, facts, out of scope,
parked"; "The unit prompts stay in their own `.md` files"; "There is **no Run
log table**."

Decision 3: "As in the facts: no `waves:` list; each unit carries `title` and
`waits`; `gaps` serves both kinds; `covers`, `exposure`, `acceptance`,
`consent.lsp` are cycle-only."

Decision 4: "JSON: `index.json` and `docs/plans/index.json`, each with
`"format": 1`."

Decision 7: "A dot path; a segment after a list chooses the entry by its `id`.
The value is a string, `--json` reads it as JSON. `append <file> <list> --json <object>`
adds an entry. A wrong id is an error, never a new entry."

Decision 14: "No header lines (Wave, Depends on, Owns, Model, Kind). The file
keeps the H1 (`# U<n> — <title>`, the same text as the unit's `title`), Test
first, Read first, Lazy-load, Ruling, Edits, Verification, Guardrails and
Commit. The orchestrator reads wave, kind, model, owns and depends_on from
`index.json` and puts the owns list into the dispatch prompt."

## Edits

1. **`plugins/vwf/assets/templates/plan-folder.md`** — rewrite for the new
   shape. The folder holds `index.json`, `index.md` and one `NN-<unit>.md` per
   unit (plus `engine/` at run time, unchanged).
   - The preamble: `/vwf:execute` and `plan-management` read and write
     `index.json` only through `plan.mjs`
     (`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`); the
     planner writes it once with the Write tool and runs `plan.mjs validate`;
     every later change is one `set` or `append`; `index.md` is never parsed
     for data except the `- Bnn:` Parked lines.
   - An `## index.json` section with one complete fenced `json` sample of a
     change plan, and one of a cycle plan, each matching index.md's schema
     exactly (JSON has no comments, so the rules for each key go in a list
     under the sample: required keys per type, enum values, `waits`, the
     review unit rules, the `id` rule). Each sample must pass
     `plan.mjs validate` once its unit files exist — U12 tests this.
   - Every rule that today sits beside a markdown block moves to the key that
     replaces it: the Consent rules → `consent`; the Release levels rules →
     `release_levels`; the Kind and review-row rules → `units[].kind`; the
     Status values → `units[].status`; the Waves rule → `units[].waits`; the
     gates text → `gates.unit`, `gates.wave`, `gates.plan`, `gates.keeps`;
     After landing → `after_landing`; Shared-file rule → `shared_files`;
     Assumed decisions → `decisions`; New dependencies → `dependencies`;
     Acceptance criteria → `acceptance`; Gaps surfaced during execution →
     `gaps` (both kinds now); the Run log section is removed, and its rule
     becomes: the executor records each unit's `status`, `commit` and
     `rounds`, and a review unit's `range`, in `index.json`, and mirrors each
     fact to the mempalace journal.
   - An `## index.md` section: frontmatter is gone; the file is
     `# Plan — <title> (<date>)`, Goal, Slice (cycle plans only), Facts the
     survey established, Unit contract, Out of scope, Parked (with the
     `- Bnn:` rules), Launch.
   - The `NN-<unit>.md` shape without the bullet header lines, as decision 14
     says; the `NN-review.md` shape is the H1 and the Scope section only; the
     two fixed final units keep their text, with "index.md's survey facts"
     unchanged.
   - `docs/plans/index.md` → `docs/plans/index.json` wherever it occurs.
2. **`plugins/vwf/assets/plan-interview.md`** — every item that names a
   frontmatter key, a section of `index.md` or a column of
   `docs/plans/index.md` names the `index.json` key instead: items 2a, 2b,
   9a (`consent.lsp.<language>`), 12 (`priority` of the rows in
   `docs/plans/index.json`), 17 (`after_landing`), 18 (`release_levels`), 18a
   (`consent.end_all_run`), F (Parked stays in `index.md`), 19 and 20 (the
   folder is `DRAFT` while `status.state` reads `DRAFT`). The items' questions
   do not change.

## Verification

- `grep -n "docs/plans/index.md\|Run log\|frontmatter\|Status block\|Units table" plugins/vwf/assets/templates/plan-folder.md plugins/vwf/assets/plan-interview.md`
  finds only passages that name the old format on purpose (none expected).
- Each `json` sample under the `## index.json` heading of `plan-folder.md`
  validates (U1 landed `plan.mjs` in wave 1): write it to a temporary folder
  under `/tmp` as `index.json`, create an empty file for each unit's `file`
  and an `index.md` with a `- <id>:` line for each `backlog_pieces` id, and
  run `node plugins/vwf/skills/plan-management/scripts/plan.mjs validate <tmp>/index.json`.
  Each must exit 0. Remove the temporary folder after.
- `mise x -- mise run code:format` is green.

## Guardrails

- Touch nothing outside the two owned files.
- `plugins/**/*.md` is not formatted: keep lines at 80 columns by hand. Keep
  each code span on one line.
- Do not describe `yq` or `jq`.

## Commit

`feat: the plan folder template describes index.json`
