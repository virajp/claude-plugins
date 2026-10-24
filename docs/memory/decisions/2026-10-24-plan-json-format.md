# Decision — plan folders and the plan index are JSON

**Date** 2026-10-24 · **Branch** `plan-json-format` · **Plan**
`docs/plans/2026-10-24-plan-json-format` · **vwf** MAJOR

## What changed

A plan folder keeps all its structured data in `index.json`. The `index.md` of
the folder keeps the prose only: the goal, the facts, out of scope and parked.
The plan index is `docs/plans/index.json`. The markdown table of
`docs/plans/index.md` is gone, with no generated view. One node script,
`plugins/vwf/skills/plan-management/scripts/plan.mjs`, reads, validates and
writes both files. No skill or script parses a markdown table of a plan.

The reason: a markdown table cannot be parsed without silent mistakes. A pipe in
a cell splits the cell. A renamed heading or a new column moves the data with no
error. The formatter re-pads the tables.

This is plan A of a chain: A (this plan) → B (the action log) → C (the progress
pane).

## Reversals

The user approved thirteen rulings on 2026-10-24 (memory
`plan-yaml-format-design`). In the interview, the user reversed four of them:

| Ruling | Was                                                   | Is now                                                                                 |
| ------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1, 2   | `index.yaml` and `docs/plans/index.yaml`              | `index.json` and `docs/plans/index.json`                                               |
| 3      | edits with `mise x -- yq -i`, reads with `yq -o json` | edits with `plan.mjs set` and `append`, one field at a time; reads with `plan.mjs get` |
| 4      | a validator script                                    | the `validate` verb of the same `plan.mjs`                                             |
| 12     | `/vwf:doctor` blocks on a missing `yq`                | dropped: vwf needs neither `yq` nor `jq` for plans                                     |

At the rulings review, the user reversed one more approved ruling:

| Ruling | Was                                                                                     | Is now                                                                                                                                                |
| ------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8      | `/vwf:execute-old` and `plan-management-old`, copies of the old skills, for old folders | no copies: `/vwf:execute` and every `plan-management` verb stop on the old format and point to `docs/plans/migrate.md`; after the migration they work |

The user said about JSON: "Humar is neither going to write nor read the
`index.yaml`. It's only for model and `vwf-monitor`". So YAML readability has no
value. JSON lets the pane (a TypeScript module) and every script read the file
with `JSON.parse` and no external binary.

The user said about ruling 8: "I am not too keen on making too many changes for
something which is temporary. Let's change the plan: Support only the new
format; If new format not found, redirect user to use `migrate.md` and change
the format; Once format is updated, use that".

## The decisions, in short

1. **Run facts before plan B.** Each unit in `index.json` has `status`, `commit`
   and `rounds`; a review unit also has `range`. Resume, the review commit map,
   the late re-run test and the final report read these fields, the `gaps` list
   and `git log`. The mempalace `runs` journal mirrors them. The Run log table
   is gone.
2. **The pane before plan C.** `hooks/monitor/` and `types/index.d.ts` do not
   change. The pane still reads `docs/plans/index.md`. On the JSON format it
   opens on each `/vwf:execute` and shows that no plan is running.
3. **The schema.** No `waves` list. Each unit has `title` and `waits`. `gaps`
   serves both kinds of plan. `covers`, `exposure`, `acceptance` and
   `consent.lsp` are for cycle plans only.
4. **The format.** JSON, each file with `"format": 1`.
5. **The tool.** `plan.mjs` uses `node:` builtins only. Its verbs are `get`,
   `set`, `append` and `validate`. There is no `yq`, no `jq` and no new doctor
   check.
6. **The script location.** `plugins/vwf/skills/plan-management/scripts/`, with
   helpers in `scripts/lib/`.
7. **The path syntax.** A dot path. A segment after a list selects the entry by
   its `id`. A wrong id is an error, never a new entry.
8. **Plan creation.** The planner writes the whole `index.json` once with the
   Write tool, then runs `validate`. After that, every change is one `set` or
   `append` call.
9. **Old folders.** Only the new format is supported. A repo is in the old
   format when `docs/plans/index.md` exists. A folder is in the old format when
   it has `index.md` and no `index.json`. `/vwf:execute` and every
   `plan-management` verb stop before any change and print the migration
   message.
10. **No old-format copies.** There is no `execute-old` and no
    `plan-management-old`.
11. **The mixed state.** `plan-management add` refuses while
    `docs/plans/index.md` exists.
12. **The plan index.** A `plans` list of rows with `id`. `gaps` is `null` until
    the plan lands, then `{open, moved_to}`.
13. **The migration guide.** A `RUNNING` plan becomes `APPROVED`, with every
    unit `pending`; the next `/vwf:execute` runs it from the start. The Run log
    rows are not carried over.
14. **The unit files.** No header lines (Wave, Depends on, Owns, Model, Kind).
    The orchestrator reads these from `index.json`.
15. **This repo's own `docs/plans/`.** The user migrates it by hand after this
    plan lands.
16. **The `override:` row.** An `all` run appends one entry to `overrides` and
    never changes `consent`.
17. **Review.** One review row, because `plan.mjs` is runnable code.
18. **Backlog ids.** `/vwf:backlog` takes the next id from the item titles and
    the `backlog` and `backlog_pieces` lists of the rows in
    `docs/plans/index.json`, and reads no plan folder for it. The title for a
    `Landed:` line comes from the folder's `index.json` `title`.
19. **An archived old-format requirement.** An archived folder with no
    `index.json` satisfies a `requires` entry.
20. **Commit order.** The script unit commits first, because the plugin checker
    fails a path to a file that does not exist.
21. **`blueprint-authoring`.** Its `paths` glob adds `docs/plans/**/index.json`.
22. **Unknown keys.** `validate` rejects a key that the schema does not name,
    except in `run` and `consent.lsp`.
23. **Edge states.** Both index files present is the old format. A repo with
    neither file has no plan.
24. **Template samples.** A template sample that `validate` rejects is a
    failure.
25. **The URL in the migration message.** It names the `main` branch copy of
    `docs/plans/migrate.md`.
26. **Gaps in a migrated plan.** The guide takes the old gap lines and the Run
    log rows that start with `GAP:`. A line with no state word is `open`.
27. **Other commands on the old format.** Only `/vwf:execute` and the
    `plan-management` verbs run the format test. The user accepts that other
    commands read nothing until the repo is migrated — including the risk that,
    in a repo on the old format, `/vwf:backlog add` reads an absent
    `docs/plans/index.json` as no rows and can issue an id a live plan holds.
28. **Formatting in other repos.** Plan A changes nothing for other repos. The
    user adds the `docs/plans/` exclusion to bootstrap by hand.
29. **Round-3 rulings.** The guide carries both maps, pushes after its commit,
    and gives a missing part its empty value. A cycle-only key on a change plan
    is a `validate` finding.
30. **Plan-level stages.** A `stages` key holds `renders`, `acceptance`, `ux`
    and `reconcile`, each `{state, detail}`. A resume reads them.
31. **Migrated `waits`.** The guide copies the old Waves reason, else writes
    `migrated: no reason recorded`.
32. **`release_levels: []`.** Only a migrated folder has an empty list. It is
    not a refusal; the landing writes no level.

## Rulings on the gaps of the run (2026-10-25)

The run closed with six open gaps. The user ruled on each one, and the fixes
landed without a plan, on the branch `ops/gaps-plan-json-format`.

1. **The branch and worktree name.** `/vwf:execute` names the branch and the
   worktree with the plan's name: the `<name>` of a change plan folder
   `<date>-<name>`, or the `<slice>` of a cycle plan folder
   `<date>-<HHMM>-<slice>`. The user said: "use the `plan name` as worktree as
   well as branch".
2. **Empty strings.** No change. `validate` refuses `""` only for the plan
   `title`, a unit's `title` and `file`, a gap's `text` and every `id`. The
   template now says so.
3. **Removing a row.** `plan.mjs` has a fifth verb, `remove <file> <path>`. It
   removes one list entry by its `id`. The sweep removes each row with one call
   and never writes the whole `plans` list.
4. **The docs unit's `depends_on`.** It names every other unit except the gates
   unit. The gates unit names the docs unit only.
5. **The result of each round.** No change to the schema. The mempalace journal
   is the only record of each round. The action log of plan B takes this record.
   Decision 1 stands.
6. **The plan gate.** The planners propose
   `mise x -- mise run code:precommit --all`. Without `--all`, the task checks
   only uncommitted files, so on the finished tree it checks nothing.

## Rejected

YAML with `yq`; `jq`; a minimal pane read now; a `rounds` list in `index.json`
(gap 5, as decision 1 already ruled); old-format skill copies; a
`plan-management migrate` verb; migrating archived plans; a generated markdown
view of `docs/plans/index.json`.
