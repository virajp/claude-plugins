# U4 — The two planners write the JSON folder

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/change-plan/SKILL.md`,
  `plugins/vwf/skills/plan/SKILL.md`,
  `plugins/vwf/skills/plan/references/plan-doc.md`,
  `plugins/vwf/agents/plan-rulings-reviewer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, and index.md's facts
  sections on the two schemas and the `plan.mjs` command line.

## Ruling

Decision 20: "U1 runs alone in wave 1 (with U9, which names no plugin path).
U3 to U8 run in wave 2 and depend on U1, because rule 6 of
`p:plugins:check` fails a `${CLAUDE_PLUGIN_ROOT}` path to `plan.mjs` before
U1 commits it."

Approved ruling: "The planners `/vwf:plan` and `/vwf:change-plan`, the folder
template and the interview checklist write the new format." The validator
runs in "the planners … before the hand-off".

Decision 3: "As in the facts: no `waves:` list; each unit carries `title` and
`waits`; `gaps` serves both kinds; `covers`, `exposure`, `acceptance`,
`consent.lsp` are cycle-only."

Decision 7: "A dot path; a segment after a list chooses the entry by its `id`.
The value is a string, `--json` reads it as JSON. `append <file> <list> --json <object>`
adds an entry. A wrong id is an error, never a new entry."

Decision 8: "The planner writes the whole `index.json` once with the Write
tool, then runs `plan.mjs validate`. Every later change is one `set` or
`append` call; a model never rewrites the whole file."

Decision 14: "No header lines (Wave, Depends on, Owns, Model, Kind). The file
keeps the H1 (`# U<n> — <title>`, the same text as the unit's `title`), Test
first, Read first, Lazy-load, Ruling, Edits, Verification, Guardrails and
Commit."

## Edits

1. **`plugins/vwf/skills/change-plan/SKILL.md`**:
   - §1 recall: the plan index is `docs/plans/index.json`, read with
     `plan.mjs get`; its rows' `priority` and `gaps` keys replace the
     `Priority` and `Gaps` columns. The last archived plan is read from its
     `index.json` and `index.md` when it has them, or from its `index.md` (the
     old format) when it does not; the Run log is read only in an old-format
     folder.
   - §4 and §5: the gates, after-landing steps and release levels are written
     to `gates`, `after_landing` and `release_levels` of `index.json`.
   - §6 "Write the folder": the folder is `index.json` (written once with the
     Write tool, per decision 8), `index.md` (the prose sections of the
     template) and the unit files (no header lines). `type`, `source`,
     `backlog`, `backlog_pieces` and `gaps_of` are keys of `index.json`, with
     the same meanings. Every rule that names the Units table, the decisions
     table, Waves, the Shared-file rule, Out of scope and Parked names its new
     home (the `units`, `decisions`, `units[].waits`, `shared_files` keys, and
     the `index.md` sections). Every unit carries `title` and, after wave 1,
     `waits`.
   - §7 self-review: first run
     `node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs validate <folder>/index.json`;
     a red result is fixed before any other check. The remaining checks name
     the JSON keys.
   - §8 hand-off: stage the plan folder and `docs/plans/index.json`. Say that
     `plan-management add` refuses while `docs/plans/index.md` exists, and
     that the planner then stops with the folder still `DRAFT`, uncommitted,
     and prints the refusal.
   - "What this skill never does": `docs/plans/index.json` and the folder's
     `status` key.
2. **`plugins/vwf/skills/plan/SKILL.md`** — the same changes for the cycle
   planner: the Doc Paths rows (Plan, Plan index, Plan template), the recall of
   a prior plan's gaps (the `gaps` list of `index.json`; the "Gaps surfaced
   during execution" section only in an old-format folder), §7 write, the
   self-review with `plan.mjs validate`, §8 hand-off, the never-does list. The
   cycle-only keys `covers`, `exposure`, `acceptance` and `consent.lsp` are
   written here.
3. **`plugins/vwf/skills/plan/references/plan-doc.md`** — rewrite for
   `index.json`: the key list in place of the frontmatter list, `status` in
   place of the Status block, `acceptance` in place of the section, and no
   Run log ("The Run log table is written empty too" is removed).
4. **`plugins/vwf/agents/plan-rulings-reviewer.md`** — its input is the
   folder's `index.json` (the decisions, units, gates and the rest), the
   prose of `index.md` (goal, facts, out of scope, parked) and the unit files.
   It may run `plan.mjs get` and `plan.mjs validate` through Bash.

## Verification

- `grep -n "docs/plans/index.md\|Run log\|Status block\|Units table" <each owned file>`
  finds only passages about the old format on purpose.
- `grep -n "plan.mjs validate" plugins/vwf/skills/change-plan/SKILL.md plugins/vwf/skills/plan/SKILL.md`
  finds the self-review step in each.
- `mise x -- mise run code:format` is green.

## Guardrails

- Touch nothing outside the owned files. The template is U3's, the
  `plan-management` skill is U5's.
- Keep each skill's procedure and its rules otherwise unchanged: change only
  what the format change falsifies.
- `plugins/**/*.md` is not formatted: keep lines at 80 columns by hand. Keep
  each code span on one line. Keep the frontmatter strict YAML.

## Commit

`feat: the planners write index.json`
