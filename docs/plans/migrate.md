# Migrate live plans to the JSON format

This guide is for an agent. It changes the live plans of one repo from the old
markdown format to the JSON format: each plan folder gets an `index.json`, and
the plan index `docs/plans/index.md` becomes `docs/plans/index.json`.

On the old format, `/vwf:execute` and every `plan-management` verb stop before
they change anything and point to this guide. After the migration, run the same
command again.

## The prompt

The user pastes this one line into a session in the repo to migrate:

    Read `<local path>/docs/plans/migrate.md` and follow it in this repo.

`<local path>` is the local clone of `virajp/claude-plugins`.

## Before you start

- The new format comes with vwf 22.0.0. Install that version or a later one
  before you migrate.
- Work from the local clone of `virajp/claude-plugins` that the prompt names.
  Every path in this guide that starts with `../../` is relative to this file.
  Resolve it to an absolute path before you use it.
- Run every step in the repo to migrate (the **target repo**), on its
  integration branch, in the main checkout. The plan index lives in the base
  repo. Under a `multi-repo` topology, a cycle plan's folder lives in its
  target member repo: migrate that folder in that repo, and commit and push
  each repo that you change.
- The schema of `index.json` is in
  `../../plugins/vwf/assets/templates/plan-folder.md`. The script that
  examines both files is
  `../../plugins/vwf/skills/plan-management/scripts/plan.mjs`.

## Stop condition

If `docs/plans/index.md` does not exist, the repo has nothing to migrate. Tell
the user and stop.

If `docs/plans/index.md` exists, the repo is in the old format, also when
`docs/plans/index.json` exists too (a migration that stopped half way). Do the
steps below. Write each file again from the old one; do not merge with a
half-written `index.json`.

## A running plan

A row of `docs/plans/index.md` with the status `RUNNING` is a claimed plan. The
new executor cannot resume a run that the old executor started, so this guide
unclaims it:

- The row in `docs/plans/index.json` gets `"status": "APPROVED"`.
- In the folder's `index.json`, `status.state` is `APPROVED`, and
  `status.detail` is
  `APPROVED <date> — unclaimed at migration; was RUNNING in <worktree>`, where
  `<date>` is today's date (`YYYY-MM-DD`) and `<worktree>` is the old worktree
  path.
- Every unit gets `"status": "pending"`, `"commit": ""` and `"rounds": 0`. A
  review unit gets `"range": {"from": "", "to": ""}`.
- Every stage in `stages` gets `{"state": "pending", "detail": ""}`.
- The `gaps` list stays as step 1 writes it.

Find the old worktree:

1. Read the path from the folder's Status line
   (`RUNNING since <time> in <worktree path> …`).
2. If that line names no path (for example a `BLOCKED` line), run
   `git worktree list` and find the worktree whose branch is named after the
   folder (the folder basename, often without its date prefix). If no
   worktree matches, write `unknown` as `<worktree>`.

Do not delete the worktree or the branch. At the end, tell the user the
worktree path and the branch name, so that the user can delete them. The next
`/vwf:execute` runs the plan from the start.

Every other plan keeps the status and the commit of each unit in the unit
fields.

## The two maps

### The old `index.md` of a folder → the keys of `index.json`

| Old part                                    | Key in `index.json`                                                                                                                                                                                                                                                     |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| —                                           | `format`: always `1`                                                                                                                                                                                                                                                    |
| frontmatter `type:`                         | `type`: `vwf-plan` or `vwf-change-plan`                                                                                                                                                                                                                                 |
| frontmatter `title:`                        | `title`                                                                                                                                                                                                                                                                 |
| frontmatter `requires:`                     | `requires`: the paths as written                                                                                                                                                                                                                                        |
| frontmatter `source:`                       | `source`                                                                                                                                                                                                                                                                |
| frontmatter `backlog:`                      | `backlog`                                                                                                                                                                                                                                                               |
| frontmatter `backlog_pieces:`               | `backlog_pieces`                                                                                                                                                                                                                                                        |
| frontmatter `gaps_of:`                      | `gaps_of`                                                                                                                                                                                                                                                               |
| frontmatter `covers:`                       | `covers` — cycle plans only                                                                                                                                                                                                                                             |
| frontmatter `exposure:`                     | `exposure` — cycle plans only, and only when the frontmatter has it                                                                                                                                                                                                     |
| Status block: the bold word                 | `status.state`: `DRAFT`, `APPROVED`, `RUNNING`, `BLOCKED`, `COMPLETE` or `ARCHIVED`                                                                                                                                                                                     |
| Status block: the line under it             | `status.detail`                                                                                                                                                                                                                                                         |
| Consent: Merge … on green                   | `consent.merge`: `yes` → `true`, `no` → `false`                                                                                                                                                                                                                         |
| Consent: End an `all` run after landing     | `consent.end_all_run`: `yes` → `true`, `no` → `false`                                                                                                                                                                                                                   |
| Consent: LSP `<language>`                   | `consent.lsp.<language>`: `installed` or `proceed without` — cycle plans only; `{}` when there is no LSP row                                                                                                                                                            |
| Consent: After landing: `<step>`            | nothing — the After landing table carries the step                                                                                                                                                                                                                      |
| Release levels table                        | `release_levels`: one `{id, level, reason}` per row; `id` is the Project cell                                                                                                                                                                                           |
| Units table and the unit files              | `units`: one entry per row — see the unit fields below                                                                                                                                                                                                                  |
| Unit gate                                   | `gates.unit`: one string per command line                                                                                                                                                                                                                               |
| Wave gate                                   | `gates.wave`: one string per command line; the prose ("plus the wave review …") is not a line                                                                                                                                                                         |
| Plan gate                                   | `gates.plan`: one string per command line                                                                                                                                                                                                                               |
| Gates the orchestrator keeps                | `gates.keeps`: one `{id: "K<n>", check, pass}` per gate; `check` is what it examines, `pass` is its pass condition                                                                                                                                                      |
| After landing table                         | `after_landing`: one `{id: "A<n>", step, mode: "run", notes}` per row, in order                                                                                                                                                                                         |
| New dependencies                            | `dependencies`: one `{id: "N<n>", package, purpose, preferred_over, unit}` per line                                                                                                                                                                                     |
| Shared-file rule table                      | `shared_files`: one `{id: "S<n>", file, why, owner}` per row                                                                                                                                                                                                            |
| Assumed decisions table                     | `decisions`: one `{id: "D<n>", decision, ruling, rejected, units}` per row; `<n>` is the `#` cell; `units` is the list of unit ids in the Unit cell (`all` → every unit id, `—` → `[]`)                                                                                  |
| Acceptance criteria                         | `acceptance`: one `{id: "AC<n>", text, flow}` per line — cycle plans only; `text` is the `Given … then …` sentence, `flow` is the link target; `none — no flow touched` → `[]`                                                                                          |
| Gaps surfaced during execution, and Run log | `gaps` — see step 1                                                                                                                                                                                                                                                     |
| Run log rows of `renders`, `acceptance`, `ux`, `reconcile` | `stages` — see step 1                                                                                                                                                                                                                                    |
| Run log, other rows                         | not carried over; only the highest Round of each unit goes to its `rounds`                                                                                                                                                                                             |
| —                                           | `run`: always `{}`                                                                                                                                                                                                                                                      |

The unit fields:

| Key          | Source                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`         | the Id cell                                                                                                                                                  |
| `title`      | the H1 of the unit file, after `U<n> — ` (the H1 `# U3 — Template` gives `Template`)                                                                         |
| `wave`       | the Wave cell, as a number                                                                                                                                   |
| `file`       | the file name in the Unit file cell (the link target)                                                                                                        |
| `kind`       | the Kind cell: `code`, `edit` or `review`                                                                                                                    |
| `model`      | the `Model:` header line of the unit file; `inherit` when it has none                                                                                        |
| `owns`       | the paths in the Owns cell, one string each; `—` → `[]`; always `[]` on a review unit                                                                        |
| `depends_on` | the ids in the Depends on cell; `—` → `[]`; `all` → every unit id in an earlier wave                                                                         |
| `waits`      | the reason that the Waves section gives for the unit's wave, copied for every unit whose wave line gives one (review units and the `-docs.md` and `-gates.md` units too). When the line gives none: `""` on wave 1, on a review unit, and on the two fixed final units (the files ending in `-docs.md` and `-gates.md`), where the schema lets `waits` be empty; else `migrated: no reason recorded` |
| `status`     | the Status cell: `pending`, `running`, `green`, `failed`, `unresolved` or `skipped`                                                                          |
| `commit`     | the Commit cell; `""` when it is empty                                                                                                                       |
| `rounds`     | the highest Round value in the Run log rows of this unit; `0` when it has none                                                                               |
| `range`      | review units only: `{"from": "", "to": ""}`                                                                                                                  |

### The old columns of `docs/plans/index.md` → the keys of `docs/plans/index.json`

The file is `{"format": 1, "plans": [ … ]}`, with one entry in `plans` per
row, in the order of the rows.

| Old column    | Key in the row                                                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Folder`      | `folder`: the path without the code span; and `id`: the basename of that path                                                                               |
| `Kind`        | `kind`: `change` or `cycle`                                                                                                                                 |
| `Plan`        | `title`                                                                                                                                                     |
| `Target repo` | `target_repo`: the repo name; `—` → `null`                                                                                                                  |
| `Priority`    | `priority`, as a number                                                                                                                                     |
| `Status`      | `status`: `APPROVED`, `RUNNING` or `COMPLETE` (a `RUNNING` row becomes `APPROVED`; see "A running plan")                                                    |
| `Gaps`        | `gaps`: `-` → `null`; `<n>` → `{"open": <n>, "moved_to": []}`; `0 — moved to <a>, <b>` → `{"open": 0, "moved_to": ["<a>", "<b>"]}`                       |
| `Requires`    | `requires`: the basenames in the cell; `—` → `[]`                                                                                                           |
| `Backlog`     | `backlog`: each id without `(piece)`; `backlog_pieces`: each id written `Bnn (piece)`, without the suffix; `—` → `[]` for both                              |

## Steps

1. **Write `index.json` for each live folder.** A live folder is a folder
   under `docs/plans/`, outside `docs/plans/archived/`, that holds an
   `index.md`, with or without a row in the plan index. So `docs/plans/gaps/`
   is not a plan. Write `<folder>/index.json` with the Write tool, from the
   old `index.md` and the unit files, per the first map. Use the key order of
   the schema in the template.
   - **Gaps.** The `gaps` list takes every gap line of the "Gaps surfaced
     during execution" section, and every Run log row whose Outcome or Detail
     starts with `GAP:` (a change plan records its gaps only there). Each gap
     is `{id: "G<n>", unit, stage, text, state}`, numbered from `G1` in the
     order found:
     - `unit` is the unit id from the row's Unit cell when it names a unit,
       else `""`;
     - `stage` is the stage that the line names, else `""`;
     - `state` is the first word of the line when it is `open` or `closed`,
       else `open`;
     - `text` is the rest of the line, never empty.

     When the count of `open` gaps differs from the Gaps count of the folder's
     row in the plan index, keep all the lines and tell the user both counts.
     Do not stop.
   - **Stages.** `stages` has the four keys `renders`, `acceptance`, `ux` and
     `reconcile`. Each takes the state that the last Run log row for that unit
     name shows: Outcome `pass` → `green`; `skipped` → `skipped`; `fail(<n>)`,
     `findings(<n>)` or `blocked` → `failed`. `detail` is the row's Detail
     cell. A stage with no Run log row is `{"state": "pending", "detail": ""}`.
   - **Missing parts.** A part that an old folder does not have gets its empty
     value. Never stop for it:
     - no Release levels → `"release_levels": []`;
     - no End an `all` run row → `consent.end_all_run` is `false`;
     - no Merge row → `consent.merge` is `false`;
     - no Unit gate, Wave gate or Plan gate section → `[]` for that gate;
     - no Gates the orchestrator keeps → `"keeps": []`;
     - no After landing, or `none` → `"after_landing": []`;
     - no `source:`, `backlog_pieces:` or `gaps_of:` → `[]`;
     - a review unit → `"range": {"from": "", "to": ""}`;
     - any other list → `[]`, any other string → `""`.
   - **Change plans.** A `vwf-change-plan` has no `covers`, `exposure`,
     `acceptance` or `consent.lsp`. `validate` reports each of them as a
     finding.
2. **Cut the moved parts out of `index.md`.** Remove the frontmatter and
   every section that step 1 moved to `index.json`: Status, Consent, Release
   levels, Units, Unit gate, Wave gate, Plan gate, Gates the orchestrator
   keeps, After landing, Shared-file rule, Assumed decisions, New
   dependencies, Acceptance criteria, Gaps surfaced during execution and Run
   log. Keep the prose sections that the template names (Goal, Slice on a
   cycle plan, Facts the survey established, Out of scope, Parked, and the
   others the template keeps). Keep each `- Bnn:` line under Parked.
3. **Remove the header lines from each unit file.** Delete the `Wave:`,
   `Depends on:`, `Owns:`, `Model:` and `Kind:` lines under the H1. Keep the
   H1 and the other parts (Test first, Read first, Lazy-load, Ruling, Edits,
   Verification, Guardrails, Commit, and the Scope of a review unit).
4. **Validate each folder.** Run this command, with the script's absolute
   path, on each folder:

       node <local path>/plugins/vwf/skills/plan-management/scripts/plan.mjs validate <folder>/index.json

   The script is `../../plugins/vwf/skills/plan-management/scripts/plan.mjs`
   relative to this guide. Each finding is one line,
   `<file>: <path>: <message>`. Fix each finding in `index.json` and run the
   command again, until it exits 0.
5. **Write `docs/plans/index.json`** from the rows of `docs/plans/index.md`,
   per the second map, and validate it with the same command:

       node <local path>/plugins/vwf/skills/plan-management/scripts/plan.mjs validate docs/plans/index.json

6. **Delete `docs/plans/index.md`** with `rm`.
7. **Commit** on the integration branch, in the main checkout:
   `docs: plans move to the JSON format`. Include each `index.json`, each
   changed `index.md` and unit file, `docs/plans/index.json`, and the deleted
   `docs/plans/index.md`.
8. **Push** to the branch's upstream. `/vwf:execute next` and
   `/vwf:execute all` read the origin tree, so an unpushed migration shows no
   runnable plan.

Then tell the user:

- each folder that you migrated;
- each plan that you unclaimed, with its old worktree path and branch, to
  delete;
- each folder whose `open` gap count differs from its row's Gaps count, with
  both counts.

## What is not migrated

- **Archived folders** (`docs/plans/archived/**`). No command reads them. An
  archived folder with no `index.json` still satisfies a `requires` entry.
- **Run log rows.** Only the highest Round of each unit (to `rounds`), the
  `GAP:` rows (to `gaps`) and the stage rows (to `stages`) are read. The other
  rows are dropped. The mempalace `runs` journal keeps its copy.
