---
type: vwf-change-plan
title: Plan folders become JSON
requires: []
source: []
backlog: []
backlog_pieces: []
gaps_of: []
---

# Plan — Plan folders become JSON (2026-10-24)

## Status

**COMPLETE**

COMPLETE 2026-10-25 — e2afcba7 a75dfa4f 2830f331 cfa764b4 99d8d138 2aba7573 2235929e b5d76f6a bab1f6af; 6 open gaps — folder stays live

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | yes     |

**The mode recorded here is the consent.** This plan has no After landing step
of its own: `.config/vwf.yaml` already runs `mise run p:plugins:local` after
every green landing. A restarted session is the one that loads the staged vwf.

## Release levels

| Project | Level | Reason                                                                                                                     |
| ------- | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| vwf     | MAJOR | The plan folder format changes; `/vwf:execute` and `plan-management` read only the new format; an old repo must migrate.   |
| site    | PATCH | The manual pages that describe the plan folder and the plan index change; no new page or feature.                          |

## Goal

After this plan lands, a plan folder keeps all its structured data in
`index.json`, and the plan index is `docs/plans/index.json`. One node script,
`plugins/vwf/skills/plan-management/scripts/plan.mjs`, reads, validates and
writes both files. No skill or script parses a markdown table of a plan. A
markdown table cannot be parsed without silent mistakes: a pipe in a cell
splits it (the monitor review found this at
`plugins/vwf/hooks/monitor/plan.ts:36`), a renamed heading or a new column
moves the data with no error, and the formatter re-pads tables.

This is plan A of a chain: A (this) → B (the action log, requires A) → C (the
progress pane, requires B). The user approved thirteen rulings on 2026-10-24
(memory `plan-yaml-format-design`). In this interview the user reversed four
of them, named here as reversals:

| Ruling | Was                                                      | Is now                                                                                 |
| ------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1, 2   | `index.yaml` and `docs/plans/index.yaml`                 | `index.json` and `docs/plans/index.json`                                               |
| 3      | edits with `mise x -- yq -i`, reads with `yq -o json`    | edits with `plan.mjs set` / `append`, one field at a time; reads with `plan.mjs get`   |
| 4      | a validator script                                       | the `validate` verb of the same `plan.mjs`                                             |
| 12     | `/vwf:doctor` blocks on a missing `yq`                   | dropped: vwf needs neither `yq` nor `jq` for plans                                     |

At the rulings review the user reversed one more approved ruling:

| Ruling | Was                                                                                       | Is now                                                                                                                       |
| ------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 8      | `/vwf:execute-old` and `plan-management-old`, copies of today's skills, for old folders   | no copies: `/vwf:execute` and every `plan-management` verb stop on the old format and point to `docs/plans/migrate.md`; after the migration they work |

The user said: "I am not too keen on making too many changes for something
which is temporary. Let's change the plan: Support only the new format; If new
format not found, redirect user to use `migrate.md` and change the format;
Once format is updated, use that".

The user's reason for JSON: "Humar is neither going to write nor read the
`index.yaml`. It's only for model and `vwf-monitor`" — so YAML readability has
no value, and JSON lets the pane (a TypeScript module) and every script read
the file with `JSON.parse` and no external binary.

The other approved rulings stand:

- `index.md` holds the prose only: goal, facts, out of scope, parked (and the
  slice, for a cycle plan). The unit prompts stay in their own `.md` files.
  There is no Run log table.
- `docs/plans/index.json` replaces `docs/plans/index.md`; the markdown table is
  dropped, with no generated view.
- A model never rewrites the whole file after it is created.
- The validator fails loudly. The planners run it before the hand-off, and
  `/vwf:execute` runs it at preflight.
- The planners, the folder template and the interview checklist write the new
  format. `plan-management` reads and writes both JSON files in every verb.
- `/vwf:execute` supports only the new format.
- No `plan-management migrate` verb: `docs/plans/migrate.md` in this repo tells
  an agent in another repo how to migrate its live plans; the user pastes a
  prompt that names the file's local path.
- Archived plans are not migrated: "Archived plans are not really a problem
  since they are never read".
- `/vwf:backlog` stops reading plan folders for its id allocation.
- Release level: vwf MAJOR.

The docs unit records the reversals in
`docs/memory/decisions/2026-10-24-plan-json-format.md`.

## Facts the survey established

### The schema of a plan folder's `index.json`

Every unit that writes, reads or describes the file uses exactly this shape.
Every list of objects has an `id` key, unique in that list, matching
`^[A-Za-z0-9_-]+$`. `(cycle)` marks a key that is required only when `type` is
`vwf-plan`, and absent from a change plan.

```json
{
  "format": 1,
  "type": "vwf-plan",
  "title": "<title>",
  "requires": [],
  "source": [],
  "backlog": [],
  "backlog_pieces": [],
  "gaps_of": [],
  "covers": [],
  "exposure": "dark",
  "status": { "state": "DRAFT", "detail": "DRAFT 2026-10-24" },
  "consent": {
    "merge": true,
    "end_all_run": false,
    "lsp": { "dart": "installed" }
  },
  "gates": {
    "unit": ["mise x -- mise run code:format"],
    "wave": ["mise x -- mise run code:lint"],
    "plan": ["mise x -- mise run code:precommit"],
    "keeps": [{ "id": "K1", "check": "<what>", "pass": "<condition>" }]
  },
  "after_landing": [
    { "id": "A1", "step": "<command>", "mode": "run", "notes": "<what it reaches>" }
  ],
  "release_levels": [
    { "id": "vwf", "level": "MAJOR", "reason": "<why>" }
  ],
  "dependencies": [
    { "id": "N1", "package": "<name>", "purpose": "<why>", "preferred_over": "<existing>", "unit": "U1" }
  ],
  "units": [
    {
      "id": "U1",
      "title": "<title>",
      "wave": 1,
      "file": "01-<unit>.md",
      "kind": "edit",
      "model": "opus",
      "owns": ["<path>"],
      "depends_on": [],
      "waits": "",
      "status": "pending",
      "commit": "",
      "rounds": 0
    },
    {
      "id": "U2",
      "title": "Review: <scope>",
      "wave": 2,
      "file": "02-review.md",
      "kind": "review",
      "model": "opus",
      "owns": [],
      "depends_on": ["U1"],
      "waits": "",
      "status": "pending",
      "commit": "",
      "rounds": 0,
      "range": { "from": "", "to": "" }
    }
  ],
  "shared_files": [
    { "id": "S1", "file": "<path>", "why": "<why it collides>", "owner": "U3" }
  ],
  "decisions": [
    { "id": "D1", "decision": "<question>", "ruling": "<answer>", "rejected": "<alternative>", "units": ["U1"] }
  ],
  "acceptance": [
    { "id": "AC1", "text": "Given <...>, when <...>, then <...>", "flow": "<path to the flow doc>" }
  ],
  "stages": {
    "renders": { "state": "pending", "detail": "" },
    "acceptance": { "state": "pending", "detail": "" },
    "ux": { "state": "pending", "detail": "" },
    "reconcile": { "state": "pending", "detail": "" }
  },
  "gaps": [
    { "id": "G1", "unit": "U1", "stage": "<stage>", "text": "<gap and assumption>", "state": "open" }
  ],
  "overrides": [
    { "id": "O1", "text": "<the override block lines, joined by '; '>" }
  ],
  "run": {}
}
```

- `covers`, `exposure` (optional), `acceptance` and `consent.lsp` are
  `(cycle)` keys. Every other key is required for both kinds; an empty list
  is written `[]`.
- The sample is a cycle plan; a `vwf-change-plan` has the same keys without
  the `(cycle)` ones. `exposure` has one value, `dark`.
- `type`: `vwf-plan` or `vwf-change-plan`. `status.state`: `DRAFT`,
  `APPROVED`, `RUNNING`, `BLOCKED`, `COMPLETE` or `ARCHIVED`.
  `status.detail`: the one line that the Status block carried.
- A unit's `kind`: `code`, `edit` or `review`. Its `status`: `pending`,
  `running`, `green`, `failed`, `unresolved` or `skipped`. `rounds` is the
  highest round the unit reached. `commit` is the unit's last commit hash, or
  `""`. Only a `review` unit has `range`, `owns` is `[]` for it, and its
  `depends_on` is never empty.
- `waits` is required (non-empty) when `wave` is above 1, except on a `review`
  unit and on the two fixed final units (the files ending in `-docs.md` and
  `-gates.md`). It is the named reason the unit waits.
- `release_levels[].level`: `NONE`, `PATCH`, `MINOR` or `MAJOR`; its `id` is
  the project name. `after_landing[].mode` is always `run`.
  `consent.lsp.<language>`: `installed` or `proceed without`.
- `gaps[].state`: `open` or `closed`. `gaps` serves both kinds of plan.
  `unit` is the id of an existing unit, or `""` for a plan-level gap (from
  preflight, acceptance or a migration). `stage` names the stage that found
  it, or `""` when it is not known. `text` is non-empty. The writer takes the
  next id: `G<n>`, one past the highest `G` id in the list.
- `stages` is required for both kinds (decision 30). It holds exactly the
  four plan-level stages `renders`, `acceptance`, `ux` and `reconcile`; each
  `state` is `pending`, `green`, `failed` or `skipped`, and `detail` is the
  reason or the result in one line. The planner writes each stage `pending`;
  `/vwf:execute` sets it as the stage runs or is skipped (on a change plan,
  every stage that does not apply is `skipped`), and a resume reads it.
- `run` is `{}`; plan B fills it.

### The schema of `docs/plans/index.json`

```json
{
  "format": 1,
  "plans": [
    {
      "id": "2026-10-24-plan-json-format",
      "folder": "docs/plans/2026-10-24-plan-json-format",
      "kind": "change",
      "title": "Plan folders become JSON",
      "target_repo": null,
      "priority": 10,
      "status": "APPROVED",
      "gaps": null,
      "requires": [],
      "backlog": [],
      "backlog_pieces": []
    }
  ]
}
```

- `id` is the folder basename; `folder` is the path from the repo root, which
  `complete` re-points to `docs/plans/archived/<id>`.
- `kind`: `change` or `cycle`. `status`: `APPROVED`, `RUNNING` or `COMPLETE`
  only, as today. `target_repo`: the member repo of a cycle plan in a
  multi-repo product, else `null`.
- `gaps`: `null` until the plan lands; then `{ "open": <n>, "moved_to": [] }`;
  after a later plan takes them, `{ "open": 0, "moved_to": ["<basename>"] }`.
- The columns of today's table map one to one: Folder → `folder` (and `id`),
  Kind → `kind`, Plan → `title`, Target repo → `target_repo`, Priority →
  `priority`, Status → `status`, Gaps → `gaps`, Requires → `requires`, Backlog
  → `backlog` plus `backlog_pieces`.

### The `plan.mjs` command line

`node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs <verb> …`

- `get <file> [<path>] [--raw]` prints the value at the path as JSON (`--raw`
  prints a string without quotes). No path prints the whole file. `<file>` may
  be `-`, which reads the JSON from stdin, so a caller can pipe
  `git show origin/<branch>:docs/plans/index.json` into it.
- `set <file> <path> <value> [--json]` sets one field. The value is a string,
  or JSON with `--json`. A missing key on an object is created; a list entry
  must already exist.
- `append <file> <path> --json <value>` adds one entry to the list at the
  path. An object entry must carry an `id` that the list does not hold.
- `validate <file>` examines the file against its schema. The path that ends
  in `docs/plans/index.json` is the plan index; every other `index.json` is a
  plan folder.
- A path is dot-separated keys. A segment that follows a list chooses the
  entry whose `id` equals the segment: `units.U3.status`, `gaps.G2.state`,
  `plans.2026-10-24-x.status`, `consent.lsp.dart`. A wrong id is an error,
  never a new entry.
- `set` and `append` validate the result before they write. They write to a
  temporary file in the same directory and rename it over the original, so a
  failed or partial write leaves the file as it was. On any error they write
  nothing.
- Every write serializes with `JSON.stringify(value, null, 2)` plus one
  trailing newline, and keeps the key order of the file (a new key goes at the
  end of its object). The repo's end-of-file and trailing-whitespace hooks
  still cover `docs/plans/`.
- Exit 0 on success. Exit 1 on a validation error, one line per finding
  (`<file>: <path>: <message>`) on stderr. Exit 2 on a usage error or a
  missing or unparsable file.

### What `validate` examines

- On a plan folder: `format` is 1; `type` is valid; every required key for
  the type exists with the right JSON type; every enum value is valid; ids are
  unique and match the id pattern in each list; each unit's `file` exists in
  the folder; each `depends_on` id names a unit in the same file, with a
  smaller `wave`; `waits` is non-empty where the schema requires it; a
  `review` unit has `owns: []`, a non-empty `depends_on` and a `range`, and no
  other unit has a `range`; `backlog` and `backlog_pieces` share no id; each
  `source` id is on `backlog` or `backlog_pieces`; each `backlog_pieces` id
  has a line that starts with `- <id>:` in the folder's `index.md`, and no
  `backlog` id has one.
- On both files: an object allows only the keys that the schema names, and
  an unknown key is a finding (decision 22). On a `vwf-change-plan`, each
  cycle-only key (`covers`, `exposure`, `acceptance`, `consent.lsp`) is a
  finding too. Two objects are open: `run`
  (plan B fills it) and `consent.lsp` (its keys are language names).
- On the plan index: `format` is 1; `plans` is a list; each row has every key
  with the right type and a valid enum value; `id` equals the basename of
  `folder`; ids are unique.

### Today's readers and writers (from the survey)

- `plugins/vwf/skills/execute/SKILL.md` (1167 lines): frontmatter at
  `:138-152`; Status read `:158-207`; Consent `:637-641`, `:913-915`; the
  Units table `:210-221`, `:336-350`, `:463-464`, `:695-696`, `:731`; the gate
  sections `:446-456`, `:646-655`, `:714-718`, `:848-852`; After landing
  `:1066-1110`; Release levels `:205-229`, `:981-986`; the Gaps section
  `:408-429`, `:893-895`; Run log writers `:475-486`, `:665-672`, `:736`
  (commit `docs: plan run log — <folder> wave <n>`), and readers `:573-589`
  (resume), `:858-867` (final report); the claim `:277-301`; `complete`
  `:955-966`; the release-levels commit `:1002-1014`; the plan index
  `:108-128`, `:155-195`.
- `execute/references/`: `blocking.md` (101 lines; resume `:59-101`),
  `review-unit.md` (259; commit map `:52-55`, range `:42`, `:70-74`, late
  re-run `:240-244`, engine logs `:92`), `all.md` (225; override row `:18-25`,
  `:68-75`), `edit-unit.md` (119), `code-unit.md` (57), `preflight.md` (88),
  `acceptance-and-ux.md` (27), `action-log.md` (76).
- `plugins/vwf/assets/execute-stages.md`: the Run log shape from `:282`.
- `plugins/vwf/agents/`: `execute-runner.md` (`override:` line `:56-58`,
  DETAIL `:70`), `execute-coder.md` (`:26-27`), `execute-code-reviewer.md`
  (`:42-44`), `execute-security-reviewer.md` (`:41-44`),
  `execute-acceptance-verifier.md` (`:27`), `plan-rulings-reviewer.md`
  (`:29-30`).
- `plugins/vwf/skills/plan-management/SKILL.md` (480 lines): verbs `add`
  `:101-133`, `claim` `:135`, `unclaim` `:147-199`, `status` `:201-216`,
  `complete` `:218-229`, `archive` `:231-391`, `next` `:393-404`, `resolve`
  `:406-422`, `priority` `:424-432`, `list` `:434-440`.
  `references/plan-index.md` (288 lines) defines the table; it ships no script
  today.
- `plugins/vwf/skills/backlog/`: id allocation `SKILL.md:133-135`, `:269`, and
  the grep/sed pipeline over plan frontmatter in `references/github.md:267-291`;
  the plan title for `Landed:` at `SKILL.md:210-211`, `github.md:350-352`.
- `recall/SKILL.md:134-146` resumes "from the folder's Run log".
  `doctor/SKILL.md:291-294` records the LSP answer as a Consent row.
  `setup/references/onboard-pipeline.md:29-30`, `:170-171` scaffold
  `docs/plans/`.
- The planners: `change-plan/SKILL.md` (468 lines; the folder passage
  `:255-336`, self-review `:338-381`, hand-off `:382-455`), `plan/SKILL.md`
  (587; Doc Paths `:52-54`, write `:388-489`, hand-off `:490-572`),
  `plan/references/plan-doc.md` (76).
- The template `assets/templates/plan-folder.md` (439 lines) and the checklist
  `assets/plan-interview.md` (217).
- The pane, `plugins/vwf/hooks/monitor/plan.ts` and `register.tsx`, parses
  `index.md` and `docs/plans/index.md`. It is out of scope; plan C rewrites it.
- Retired-name grep (`Run log`, `docs/plans/index.md`, `Status block`,
  `Units table`) also hits `assets/memory.md` (7), `assets/membership.md`
  (1), `assets/topologies/multi-repo.md` (3),
  `blueprint-authoring/references/frontmatter-and-links.md` (1),
  `types/index.d.ts` (2, the pane's, out of scope), and the docs listed in
  the docs unit.

### The repo

- Node scripts in skills: rule 16 of `p:plugins:check`
  (`scripts/src/check.ts:262-308`): an entry file directly under `scripts/`
  starts with `#!/usr/bin/env node` and is executable; files under
  `scripts/lib/` need neither; every import must start with `node:`, `./`,
  `../` or `/`; no `require(`. The example to follow is
  `plugins/vwf/skills/execute/scripts/log.mjs`, tested by
  `scripts/src/execute-log.test.ts` with `spawnSync("node", [script, …])`.
- vitest: `vitest.config.mts` includes `{installer,scripts}/src/**/*.test.ts`.
- CI (`.github/workflows/plugins.yml`) runs with `MISE_ENV: ci`, which pins
  no `yq` and no `jq`. `plan.mjs` needs neither.
- Commit types (`.config/git-conventional-commits.yaml`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.
- `docs/plans/` is excluded from dprint and the linter in this repo (commit
  `69a46975`).
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width
  (80 columns) by hand. `CLAUDE.md`, `readme.md` and `site/**` are formatted.
- vwf is at `21.2.0`. No unit bumps it.
- This repo's `docs/plans/index.md` is empty. This plan is written in the old
  format, because today's executor runs it; its row is in
  `docs/plans/index.md`. No unit touches `docs/plans/index.md`.

## Assumed decisions — confirm or override at review

| #   | Decision                                 | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                           | Rejected                                                                  | Unit                |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------- |
| 1   | Where the run facts go before plan B     | Fields in `index.json`: each unit has `status`, `commit` and `rounds`, and a review unit has `range: {from, to}`. Resume, the review commit map, the late re-run test and the final report read these fields, the `gaps` list and `git log`. The mempalace `runs` journal still mirrors each fact that a Run log row carried.                                                                                                       | row events in the action log now; a `run_log` list in the file            | U1, U6, U7          |
| 2   | The pane before plan C                   | `plugins/vwf/hooks/monitor/` and `plugins/vwf/types/index.d.ts` are not changed. The docs say that the progress pane cannot read the new format until plan C: it still opens on each `/vwf:execute` (`register.tsx:669-673`) and shows that no plan is running, because it reads `docs/plans/index.md` (`register.tsx:393-400`).                                                                                                                                                                                                                                       | a minimal read of the new file now; a message for 10 seconds now          | U11                 |
| 3   | The schema                               | As in the facts: no `waves:` list; each unit carries `title` and `waits`; `gaps` serves both kinds; `covers`, `exposure`, `acceptance`, `consent.lsp` are cycle-only.                                                                                                                                                                                                                                                              | a separate `waves:` list with a reason per wave                           | U1, U3, U4          |
| 4   | The format                               | JSON: `index.json` and `docs/plans/index.json`, each with `"format": 1`. A reversal of rulings 1 and 2.                                                                                                                                                                                                                                                                                                                          | YAML with `yq`; JSON edited with `yq -i`                                  | all                 |
| 5   | The tool                                 | `plan.mjs`, `node:` builtins only, with the verbs `get`, `set`, `append` and `validate`, as in the facts. No `yq` and no `jq`. `/vwf:doctor` gets no new check. A reversal of rulings 3, 4 and 12.                                                                                                                                                                                                                                 | `yq`; `jq` with a temporary file                                          | U1, U8              |
| 6   | The script location                      | `plugins/vwf/skills/plan-management/scripts/plan.mjs`, helpers in `plugins/vwf/skills/plan-management/scripts/lib/`.                                                                                                                                                                                                                                                                                                              | `execute/scripts/`; a new `plugins/vwf/scripts/`                          | U1                  |
| 7   | The path syntax                          | A dot path; a segment after a list chooses the entry by its `id`. The value is a string, `--json` reads it as JSON. `append <file> <list> --json <object>` adds an entry. A wrong id is an error, never a new entry.                                                                                                                                                                                                              | positions by number; one named verb per change                            | U1, U4, U5, U6, U7, U8 |
| 8   | Plan creation                            | The planner writes the whole `index.json` once with the Write tool, then runs `plan.mjs validate`. Every later change is one `set` or `append` call; a model never rewrites the whole file.                                                                                                                                                                                                                                      | —                                                                         | U4                  |
| 9   | Old folders                              | Only the new format is supported. A repo is in the old format whenever `docs/plans/index.md` exists, with or without `docs/plans/index.json`; a folder is in the old format when it has `index.md` and no `index.json`. `/vwf:execute` (a named folder, `next` and `all`) and every `plan-management` verb examine the format first. On the old format they stop before any change and print the migration message: the repo uses the old plan format; migrate it with `https://github.com/virajp/claude-plugins/blob/main/docs/plans/migrate.md` — in a local clone of `virajp/claude-plugins`, paste "Read `<local path>/docs/plans/migrate.md` and follow it in this repo."; then run the same command again. After the migration the command works on the new format. The test reads the local checkout. A repo with neither file has no plan: `next` and `all` report no runnable plan, and so does an origin tree with no `docs/plans/index.json`. A reversal of approved ruling 8. | `vwf:execute-old` and `vwf:plan-management-old` copies (the approved ruling 8) | U5, U6 |
| 10  | No old-format copies                     | No `execute-old` and no `plan-management-old` skill. The user said: "I am not too keen on making too many changes for something which is temporary."                                                                                                                                                                                                                                                                         | self-contained copies of today's two skills                               | U6                  |
| 11  | A repo in the mixed state                | `plan-management add` refuses while `docs/plans/index.md` exists, with the migration message of decision 9.                                                                                                                                                                                                                                                                                                                       | two plan indexes side by side                                             | U5                  |
| 12  | The plan index                           | As in the facts: a `plans` list of rows with `id`; `gaps` is `null` until landed, then `{open, moved_to}`.                                                                                                                                                                                                                                                                                                                       | an object keyed by basename                                               | U1, U5              |
| 13  | The migration guide                      | A row that reads `RUNNING` is unclaimed by the guide itself: the row becomes `APPROVED`, every unit `pending` with an empty `commit`, `rounds` 0, and `status.detail` reads `APPROVED <date> — unclaimed at migration; was RUNNING in <worktree>`. The guide then names the old worktree and branch for the user to delete; the next `/vwf:execute` runs the plan from the start. Every other plan keeps its unit status and commit in the unit fields. The Run log rows are not carried over. The prompt is one line: "Read `<local path>/docs/plans/migrate.md` and follow it in this repo." | stop and finish the run on the vwf release before this one; also migrating the copy in the run's worktree | U9 |
| 14  | The unit files                           | No header lines (Wave, Depends on, Owns, Model, Kind). The file keeps the H1 (`# U<n> — <title>`, the same text as the unit's `title`), Test first, Read first, Lazy-load, Ruling, Edits, Verification, Guardrails and Commit. The orchestrator reads wave, kind, model, owns and depends_on from `index.json` and puts the owns list into the dispatch prompt. A widened Owns is one `set` call.                                   | keeping the header lines as a copy                                        | U3, U4, U6, U7      |
| 15  | This repo's own `docs/plans/`            | The user migrates it by hand after this plan lands. No unit touches `docs/plans/index.md`.                                                                                                                                                                                                                                                                                                                                       | an after-landing step                                                     | U9                  |
| 16  | The `override:` row of an `all` run      | The runner appends one entry to `overrides` (`{id, text}`) and never changes `consent`.                                                                                                                                                                                                                                                                                                                                          | —                                                                         | U6                  |
| 17  | Review row                               | One review row, R10, because `plan.mjs` is runnable code.                                                                                                                                                                                                                                                                                                                                                                         | the wave review alone                                                     | R10                 |
| 18  | Backlog ids                              | `/vwf:backlog` takes the next id from the item titles and the `backlog` and `backlog_pieces` lists of the rows in `docs/plans/index.json`. It reads the plan title for a `Landed:` line from the folder's `index.json` `title`.                                                                                                                                                                                                   | reading every plan folder, live and archived                              | U8                  |
| 19  | An archived old-format requirement       | An archived folder with no `index.json` satisfies a `requires` entry, for both kinds of plan; `resolve` reads nothing from it.                                                                                                                                                                                                                                                                                                    | reading the old frontmatter; reporting it unresolvable                    | U5                  |
| 20  | The order of the commits                 | U1 runs alone in wave 1 (with U9, which names no plugin path). U3 to U8 run in wave 2 and depend on U1, because rule 6 of `p:plugins:check` fails a `${CLAUDE_PLUGIN_ROOT}` path to `plan.mjs` before U1 commits it.                                                                                                                                                                                                       | one wave with U1 committed first                                          | U3, U4, U5, U6, U7, U8 |
| 21  | `blueprint-authoring/SKILL.md`           | U8 also owns `plugins/vwf/skills/blueprint-authoring/SKILL.md`: `:61-65` names `index.json`, and the `paths` glob at `:16` adds `docs/plans/**/index.json`. U8 also owns `plugins/vwf/skills/blueprint/references/rename-and-delete.md`, whose `:8` names the `covers:` frontmatter.                                                                                                                                                                                                                     | out of scope                                                              | U8                  |
| 22  | Unknown keys                             | `validate` rejects a key that the schema does not name, on every object of both files, except `run` (plan B fills it) and `consent.lsp` (its keys are language names). So a `set` with a misspelt key fails and writes nothing. A later format change bumps `format` and adds its keys.                                                                                                                                         | allowing unknown keys                                                     | U1                  |
| 23  | Edge states of the format test           | The repo is in the old format whenever `docs/plans/index.md` exists, with or without `docs/plans/index.json` (a migration stopped half way). The test reads the local checkout. A repo with neither file has no plan: `next` and `all` report no runnable plan, and so does an origin tree with no `docs/plans/index.json`. | going ahead on `index.json` when both exist                               | U5, U6              |
| 24  | Template samples                         | A template sample that `plan.mjs validate` rejects is a failure: U3's Verification validates each sample, and U12 returns `UNRESOLVED:` on a red sample, which fails the run.                                                                                                                   | a `DOCS FALSIFIED:` line that no later unit applies                       | U3, U12             |
| 25  | The URL in the migration message         | The message names `https://github.com/virajp/claude-plugins/blob/main/docs/plans/migrate.md`. Other repos get vwf only from a release, which merges `develop` into `main`, so the URL exists by then. On this machine the staged build prints it before the release; that 404 is accepted. | the `develop` URL                                                         | U5, U6              |
| 26  | Gaps in a migrated plan                  | The guide takes each gap line of the old "Gaps surfaced during execution" section and each Run log row whose Outcome or Detail starts with `GAP:`; `unit` and `stage` are `""` when the old line does not name them; a line with no state word is `open`. The count of `open` gaps equals the row's Gaps count. | dropping the gaps of a change plan with the Run log                      | U9                  |
| 27  | Other commands on the old format         | Only `/vwf:execute` and the `plan-management` verbs run the format test. In a repo with the old format, `/vwf:backlog add` reads an absent `docs/plans/index.json` as no rows and can issue an id that a live plan holds; `/vwf:recall` and the planners' recall find no plan. The user accepted this until the repo is migrated. | the format test in the planners, `backlog add` and `recall`; in every backlog verb | U8 |
| 28  | `docs/plans/` formatting in other repos  | Plan A changes nothing for other repos. The repos that bootstrap shapes do not exclude `docs/plans/` from dprint and the linter, so their format hook can rewrite an `index.json` that `plan.mjs` wrote; a Parked line asks the user to add the exclusion to bootstrap by hand. | a handoff prompt in bootstrap's `docs/prompts/` | — |
| 29  | Round-3 rulings                          | The migration guide carries both maps itself; it pushes after its commit; a `BLOCKED` folder's worktree comes from `git worktree list` by the branch named after the folder; a part an old folder lacks gets its empty value (`[]`, `false`, `""`, `{"from": "", "to": ""}`) and the guide never stops for it; differing gap counts keep the lines and tell the user; a live folder holds an `index.md`. A cycle-only key on a change plan is a `validate` finding. U7 also owns `plugins/vwf/agents/execute-ux-reviewer.md` (`:29`, `:135`). The stackgen `tool-config` dprint and linter configs are out of scope under decision 28. | — | U1, U7, U9 |
| 30  | Plan-level stages                        | A `stages` key in `index.json`, required for both kinds: `{renders, acceptance, ux, reconcile}`, each `{state, detail}`, `state` one of `pending`, `green`, `failed`, `skipped`. The planner writes each `pending`; `/vwf:execute` sets each with `plan.mjs set` as the stage runs or is skipped, and a resume reads them to know whether a stage already passed (today `execute/SKILL.md:790-807` keeps that in Run log rows). The migration writes the state that the old Run log rows show, else `pending`. | running every plan-level stage again on each resume                       | U1, U3, U6, U7, U9  |
| 31  | Migrated `waits`                         | The migration guide copies the reason that the old Waves line gives for the unit's wave; when there is none, it writes `migrated: no reason recorded`.                                                                                                                                                                                 | stopping to ask the user for each reason                                  | U9                  |
| 32  | `release_levels: []`                     | An empty list is the old-shape case: preflight does not refuse it, the landing writes nothing to `.config/releases.yaml`, and the report carries today's fixed line (`preflight.md:11-14`, `SKILL.md:981-986`). Only a migrated folder can have `[]`; the planners always write one row per project.                                            | refusing an empty list at preflight                                       | U6                  |

## New dependencies

none — `plan.mjs` uses `node:` builtins only.

## Units

| Id  | Wave | Unit file                                   | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                 | Depends on | Status  | Commit |
| --- | ---- | ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | ------ |
| U1  | 1    | [01-plan-script.md](01-plan-script.md)      | edit   | `plugins/vwf/skills/plan-management/scripts/**`, `scripts/src/plan-script.test.ts`, `scripts/src/fixtures/plan-script/**`                                                                                                                                                                                                                                                            | —          | green | e2afcba7 |
| U3  | 2    | [03-template.md](03-template.md)            | edit   | `plugins/vwf/assets/templates/plan-folder.md`, `plugins/vwf/assets/plan-interview.md`                                                                                                                                                                                                                                                                                                | U1         | green | 2830f331 |
| U4  | 2    | [04-planners.md](04-planners.md)            | edit   | `plugins/vwf/skills/change-plan/SKILL.md`, `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/plan/references/plan-doc.md`, `plugins/vwf/agents/plan-rulings-reviewer.md`                                                                                                                                                                                                       | U1         | green | cfa764b4 |
| U5  | 2    | [05-plan-management.md](05-plan-management.md) | edit | `plugins/vwf/skills/plan-management/SKILL.md`, `plugins/vwf/skills/plan-management/references/plan-index.md`                                                                                                                                                                                                                                                                          | U1         | green | 99d8d138 |
| U6  | 2    | [06-execute-main.md](06-execute-main.md)    | edit   | `plugins/vwf/skills/execute/SKILL.md`, `plugins/vwf/skills/execute/references/preflight.md`, `plugins/vwf/skills/execute/references/all.md`, `plugins/vwf/agents/execute-runner.md`                                                                                                                                                                                                   | U1         | green | 2aba7573 |
| U7  | 2    | [07-execute-references.md](07-execute-references.md) | edit | `plugins/vwf/skills/execute/references/blocking.md`, `plugins/vwf/skills/execute/references/review-unit.md`, `plugins/vwf/skills/execute/references/edit-unit.md`, `plugins/vwf/skills/execute/references/code-unit.md`, `plugins/vwf/skills/execute/references/acceptance-and-ux.md`, `plugins/vwf/skills/execute/references/action-log.md`, `plugins/vwf/assets/execute-stages.md`, `plugins/vwf/agents/execute-coder.md`, `plugins/vwf/agents/execute-code-reviewer.md`, `plugins/vwf/agents/execute-security-reviewer.md`, `plugins/vwf/agents/execute-acceptance-verifier.md`, `plugins/vwf/agents/execute-ux-reviewer.md` | U1 | green | 2235929e |
| U8  | 2    | [08-readers.md](08-readers.md)              | edit   | `plugins/vwf/skills/backlog/SKILL.md`, `plugins/vwf/skills/backlog/references/github.md`, `plugins/vwf/skills/recall/SKILL.md`, `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/setup/references/onboard-pipeline.md`, `plugins/vwf/assets/membership.md`, `plugins/vwf/assets/memory.md`, `plugins/vwf/assets/topologies/multi-repo.md`, `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md`, `plugins/vwf/skills/blueprint-authoring/SKILL.md`, `plugins/vwf/skills/blueprint/references/rename-and-delete.md` | U1 | green | b5d76f6a |
| U9  | 1    | [09-migrate-guide.md](09-migrate-guide.md)  | edit   | `docs/plans/migrate.md`                                                                                                                                                                                                                                                                                                                                                              | —          | green | a75dfa4f |
| R10 | 3    | [10-review.md](10-review.md)                | review | —                                                                                                                                                                                                                                                                                                                                                                                    | U1, U3, U4, U5, U6, U7, U8, U9 | green |  |
| U11 | 4    | [11-docs.md](11-docs.md)                    | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/plugins.md`, `.claude/docs/ci-and-releases.md`, `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-24-plan-json-format.md`                                                                                                                                                                          | R10        | green | bab1f6af |
| U12 | 5    | [12-gates.md](12-gates.md)                  | edit   | `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                                                                                                                    | U11        | green | — (no change) |

## Shared-file rule

| File                                         | Why it collides                          | Owner                      |
| -------------------------------------------- | ---------------------------------------- | -------------------------- |
| `plugins/vwf/.claude-plugin/plugin.json`     | the version file                         | nobody — the release task  |
| `.claude-plugin/marketplace.json`            | generated; regenerating mid-wave races   | gates unit only (U12)      |
| every human-facing doc listed under U11      | many units would edit one doc            | docs unit only (U11)       |
| this plan folder                             | the executor rewrites Status and the log | the orchestrator           |
| `docs/plans/index.md`                        | the old executor's claim and landing     | the orchestrator; no unit  |

## Waves

There is no U2: the unit was removed at the rulings review (decision 10).

- **Wave 1 — U1 and U9.** Their Owns do not overlap, and neither reads the
  other's output.
- **Wave 2 — U3, U4, U5, U6, U7 and U8.** Each one waits for U1 for the same
  named reason: its files name
  `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`, and rule 6
  of `p:plugins:check`, which runs at each unit's commit, fails a path to a
  file that does not exist yet (decision 20). Their Owns do not overlap, and
  each quotes the schema and the rulings from this file, not another unit's
  text.
- **Wave 3 — R10.** It reviews the commit range of waves 1 and 2, so it waits
  for every earlier commit.
- **Wave 4 — U11**, the fixed docs unit.
- **Wave 5 — U12**, the fixed gates unit.

## Unit gate

mise x -- mise run code:format

`/vwf:execute` runs every line once before each commit it makes on a unit's
behalf — the unit's own commit and each fix commit — and never while another
unit is still editing. A red line is that unit's failure. Every line here must
be green before wave 1.

## Wave gate

mise x -- mise run code:lint

plus the wave review, plus every report read for `UNRESOLVED:`.
`/vwf:execute` runs every line once after each wave. Every line here must be
green before wave 1.

## Plan gate

mise x -- mise run code:precommit
mise x -- pnpm vitest run
mise x -- pnpm exec tsc --noEmit -p scripts

`/vwf:execute` runs every line once, after the fixed final waves, over the
finished tree, before it calls the run green.

The gate delta: "U3 and then U12 run `plan.mjs validate` on each JSON sample
in the template, so the template and the script must agree." U1 adds the
vitest suite `scripts/src/plan-script.test.ts`.

## After landing

none — `.config/vwf.yaml`'s `after_landing:` already runs
`mise run p:plugins:local` after every green landing, and a restarted session
loads it.

## Gates the orchestrator keeps

none — the vitest suite of U1 runs `plan.mjs` for real, and U3 and U12
validate the template's JSON samples with it (decision 24).

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never writes a lock file with Write, Edit, `sed` or a script.
A unit never runs `git checkout`, `git restore` or a formatter with `--fix`
outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- `plugins/vwf/hooks/monitor/` and `plugins/vwf/types/index.d.ts` — plan C
  rewrites the progress pane; until then the pane opens and shows no running plan (decision 2).
- `plugins/vwf/skills/execute/scripts/log.mjs`, `plugins/vwf/hooks/action-log.mjs`
  and `plugins/vwf/hooks/action-log.sh` — plan B owns the action log. The
  executor keeps calling today's `log.mjs`.
- `vwf:execute-old` and `vwf:plan-management-old` — not made (decision 10).
- Archived plan folders — nothing reads them, so they are not migrated
  (approved ruling 10).
- This repo's `.config/` — the user edits it by hand.
- This repo's `docs/plans/index.md` — this plan's own row lives there, and the
  user migrates it by hand after landing (decision 15).
- A generated markdown view of `docs/plans/index.json` — dropped "for now, if
  needed we can add later".
- `/vwf:doctor` checks for `yq` — not necessary any more (decision 5).

## Parked

- Plan B: decide whether the run fields in `index.json` (`units[].status`,
  `commit`, `rounds`, `range`, `gaps`, `overrides`) stay once the log carries
  the same facts — they are committed and survive a lost machine, the log is
  local. Change the preplan `docs/scratchpad/preplans/plan-b-log.md` from
  `index.yaml` and `yq` to `index.json` and `plan.mjs` (its units snapshot
  becomes `plan.mjs get <folder>/index.json units`).
- Plan C: the pane reads `docs/plans/index.json` and the plan's `index.json`
  with `JSON.parse`, takes each unit's `title` from `index.json`, and changes
  `plugins/vwf/types/index.d.ts`. Change the preplan
  `docs/scratchpad/preplans/plan-c-pane.md` the same way.
- This repo: after this plan lands and is archived, follow
  `docs/plans/migrate.md` here — delete `docs/plans/index.md` and write
  `{"format": 1, "plans": []}` to `docs/plans/index.json` — before plan B is
  planned.
- Bootstrap (by hand): exclude `docs/plans/` from the dprint and linter
  configs that bootstrap syncs, as this repo did in `69a46975`, so a
  formatter never rewrites an `index.json` that `plan.mjs` wrote
  (decision 28). The stackgen `tool-config` assets
  (`plugins/stackgen/skills/tool-config/assets/.config/dprint.json` and
  `.config/linter.yaml`) also lack the exclusion; they are out of scope here,
  because bootstrap replaces `tool-config`.

## Gaps surfaced during execution

- open · U9 edit · the plan does not say how `/vwf:execute` names a run's branch · the migration guide assumes the folder basename, often without its date prefix
- open · U1 edit · the plan does not say which string values may be empty · `validate` requires non-empty only titles, the unit `file`, gap `text` and ids
- open · U5 edit · the plan does not say how a row is removed from `docs/plans/index.json` (`plan.mjs` has no remove verb) · the sweep sets the whole `plans` list with one `set … --json`
- open · U3 edit · the plan leaves the template's docs-unit `depends_on` open (the old table said "all") · the sample names the previous wave's unit — the review row, or U1 on a change plan
- closed · U7 edit · `index.json` keeps one `commit` per unit and one `range` per review row, so an earlier fix commit and a late loop's `to` are kept only in the mempalace journal · the commit map reads the journal; with mempalace down such a commit is refused at map time, and a late re-run repeats once — closed by R2 round 1: the map now reads `git log` and `index.json` alone, a commit placed by its unit's `commit` or by the one unit whose `owns` covers it
- open · U6 edit · the plan does not say where per-node round results go once the Run log is gone · the run journal alone holds them
- open · U12 gates · `mise run code:precommit` scans only staged files, so on a clean tree the plan gate line covers nothing already committed · each unit commit ran the same hooks on its own files

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |
| 0 | preflight | — | 1 | pass | doctor: no blocking (no registry; stack checks n/a); unit gate code:format green; wave gate code:lint green; no code unit — LSP and conventions skipped; Format Check skipped (no covers:) | — |
| 0 | sequence | — | — | pass | W1: U1, U9 (edit) · W2: U3–U8 (edit) · W3: R10 (review, security-only) · W4: U11 docs · W5: U12 gates | — |
| 1 | U9 migrate guide | opus | 1 | pass | edit; DECIDED: vwf 22.0.0 named; review range empty; stage map pass→green/skipped/else failed; waits empty on W1/review/docs/gates; model from Model line else inherit; missing worktree 'unknown'; index requires holds basenames. GAP: branch name of a run not stated — assumed folder basename, often without date prefix | — |
| 1 | U1 plan.mjs | opus | 1 | pass | edit; 3 files + 78-test vitest suite green. DECIDED: bad path exit 2, duplicate id exit 1; set creates only the last key; index.md read only when backlog lists non-empty; validate prints '<file>: valid'; a value starting -- is a usage error. GAP: the plan does not say which strings may be empty — only titles, unit file, gap text, ids are required non-empty | — |
| 1 | R1 | opus | 1 | findings(2) | migrate.md:129 [U9] rule 2 — waits '' on review/docs/gates units drops the Waves reason (decision 31); plan.mjs:138-143 [U1] rule 2 — a set value starting -- cannot be set. CONTRACT clean | — |
| 1 | U9 migrate guide | opus | 2 | pass | edit fix of R1 finding; waits now copies the Waves reason for every unit, '' only where the schema allows, else 'migrated: no reason recorded' | — |
| 1 | U1 plan.mjs | opus | 2 | pass | edit fix of R1 finding; arguments parsed by position (parseArgs), a set value may start with --; 86 tests, tsc, p:plugins:check green | — |
| 1 | R1 | opus | 2 | pass | both round-1 findings resolved; CONTRACT clean; RULINGS clean | — |
| 1 | U1 plan.mjs | — | — | commit | unit commit | e2afcba7 |
| 1 | U9 migrate guide | — | — | commit | unit commit | a75dfa4f |
| 2 | U8 readers | opus | 1 | pass | edit; 10 files; backlog ids from index.json rows, titles via plan.mjs get; recall/doctor/membership/memory/multi-repo/blueprint-authoring/rename-and-delete re-pointed. DECIDED: onboard-pipeline.md unchanged (names no plan index); wave-review findings in memory.md go to the runs journal | — |
| 2 | U5 plan-management | opus | 1 | pass | edit; SKILL.md + plan-index.md rewritten for index.json; format test section; add refuses while docs/plans/index.md exists; resolve: archived folder w/o index.json satisfied. DECIDED: sweep = one set of the whole plans list; archive open-gap warning stays cycle-only; gaps_of appends to moved_to. GAP: row removal not specified — assumed one set of the plans list | — |
| 2 | U3 template | opus | 1 | pass | edit; plan-folder.md rewritten (index.json section, change + cycle samples both validate, no unit header lines, no Run log); plan-interview.md items re-pointed to index.json keys. DECIDED: sample release id 'api'; folder requires/gaps_of keep paths; item 16 names consent.merge; section F 'has none'. GAP: docs unit depends_on open — assumed the previous wave's unit | — |
| 2 | U4 planners | opus | 1 | pass | edit; change-plan + plan SKILL.md, plan-doc.md, plan-rulings-reviewer.md re-pointed: write index.json once, validate, prose-only index.md, add refusal stops at DRAFT. DECIDED: fixes before first green validate use Edit (set refuses an invalid file); unasked end_all_run written false | — |
| 2 | U7 execute references | opus | 1 | pass | edit; 6 references + execute-stages.md + 5 agents re-pointed to index.json fields and the journal. DECIDED: a review row ends failed/unresolved, not blocked (not a schema value); contested residuals appended to gaps. DOCS FALSIFIED: execute/SKILL.md:671,735 (U6's) cites the old Run log section. GAP: an overwritten fix commit and a late loop's to are kept only in the journal — with mempalace down such a commit is refused and a late re-run repeats once | — |
| 2 | U6 execute main | opus | 1 | pass | edit; execute SKILL.md, preflight.md, all.md, execute-runner.md: format test first, plan.mjs reads/writes, Run log gone, wave commit 'docs: plan state', release_levels [] old-shape. DECIDED: a failed set/append is a blocking-gap stop; resume skips green/skipped stages; validate-covered refusals point to validate; widened Owns = set units.<id>.owns + closed gap; reconcile hash in stages.reconcile.detail. GAP: per-node round results go to the run journal alone | — |
| 2 | R2 | opus | 1 | findings(7) | github.md:278 [U8] sweep removes archived rows; SKILL.md:352 [U5] archive gap warning cycle-only; SKILL.md:186 [U5] gaps_of path as id; review-unit.md:60 [U7] commit map needs journal (decision 1); edit-unit.md:108 [U7]/SKILL.md:516,:112 [U6] widened-Owns gap state + --json; memory.md:368 [U8] journal status enum; fold >80 cols [U3,U4,U6,U7]. RULINGS: U4 departed from decision 8 (Edit before first green validate). CONTRACT clean | — |
| 2 | U5 plan-management | opus | 2 | pass | edit fix of R2 findings: archive open-gap warning for both kinds; gaps_of write uses plans.<basename> | — |
| 2 | U8 readers | opus | 2 | pass | edit fix of R2 findings: backlog id source states the sweep truthfully (github.md, SKILL.md); memory.md journal status uses the unit enum | — |
| 2 | U4 planners | opus | 2 | pass | edit fix of R2: creation = Write + validate; a red validate re-Writes the whole file until green; from the first green validate only set/append; plan/SKILL.md refolded. Its UNRESOLVED line is a wording note ('once' in plan-doc.md), not a ruling — passed to R2 round 2 | — |
| 2 | U6 execute main | opus | 2 | pass | edit fix of R2: --json for any non-string value; widened Owns set with --json; 3 lines refolded. Its UNRESOLVED lines name table rows, a code span and fenced commands over 80 cols that cannot fold — a note, not a ruling | — |
| 2 | U3 template | opus | 2 | pass | edit fix of R2: prose lines refolded to 80 cols in plan-interview.md and plan-folder.md; code-block lines left. Its UNRESOLVED line asks whether the fold covers code blocks — a note, not a ruling; prose only (house practice) | — |
| 2 | U7 execute references | opus | 2 | pass | edit fix of R2: commit map from git log + index.json only (by commit hash, else by covering owns; uncovered/split commit refused); late loop range from git log; widened-Owns gap closed + --json list; lines refolded. UNRESOLVED/GAP lines are width notes (byte vs char count; a one-line code span) — not rulings | — |
| 2 | R2 | opus | 2 | findings(2) | round-1 items 1–7 RESOLVED; RULINGS clean (U4 honours decision 8); new: execute/SKILL.md:123 [U6] 'status is never set here' contradicts the list; plan-folder.md:40 [U3] template lacks the Write+validate creation step / re-Write on red. Cap reached → closing pass | — |
| 2 | U3 template | opus | closing | pass | closing-pass fix: plan-folder.md:40 states the Write + validate creation step and the re-Write on red | — |
| 2 | U6 execute main | opus | closing | pass | closing-pass fix: SKILL.md:123 names status.state/status.detail as plan-management's | — |
| 2 | R2 | opus | closing | pass | closing check: both open findings RESOLVED; no regression | — |
| 2 | U3 | — | — | commit | unit commit | 2830f331 |
| 2 | U4 | — | — | commit | unit commit | cfa764b4 |
| 2 | U5 | — | — | commit | unit commit | 99d8d138 |
| 2 | U6 | — | — | commit | unit commit | 2aba7573 |
| 2 | U7 | — | — | commit | unit commit | 2235929e |
| 2 | U8 | — | — | commit | unit commit | b5d76f6a |
| 3 | R10 | opus | 1 | pass | security (security-only row: covers edit units alone); range a5dcb9d3..9edba857; 51 files mapped to U1,U3–U9; engine: 0 findings >= 8 (engine/R10-1.log); reviewer: FINDINGS none, VERDICT approve | — |
| 3 | R3 | — | 1 | pass | wave review: no unit edited in wave 3 (the row re-dispatched nothing); empty diff | — |
| — | acceptance | — | — | skipped | why: no covers: — a change plan has no acceptance criteria and no Screens contract | — |
| — | ux | — | — | skipped | why: no covers: — a change plan has no acceptance criteria and no Screens contract | — |
| — | renders | — | — | skipped | why: no covers: — a change plan has no acceptance criteria and no Screens contract | — |
| — | reconcile | — | — | skipped | why: no covers: (no stamps, registry or environment to reconcile); no code unit (nothing to persist) | — |
| 4 | U11 docs | opus | 1 | pass | edit; readme, CLAUDE.md, .claude/docs, vwf-plugin skill, site vwf.md + how-to pages, decision record (STE). DECIDED: record covers all 32 decisions; ad-hoc-change says ask the session to unclaim, not edit the row by hand. p:site:check green | — |
| 4 | R4 | opus | 1 | findings(6) | docs-tree.md:52 + CLAUDE.md:52 'plan.mjs alone writes' vs decision 8 (Write at creation); decision record :97 decision 18 misstated, :113 decision 27 drops the accepted risk; mempalace.md:351 table not re-padded; vwf.md:2976,2988,3178,3462 prose past 80 cols (dprint excludes **/plugins/**/*.md). CONTRACT clean | — |
| 4 | U11 docs | opus | 2 | pass | edit fix of R4: docs-tree.md/CLAUDE.md say created once with Write then set/append; record decisions 18 and 27 corrected; mempalace.md table re-padded; vwf.md added prose wrapped. code:format, p:site:check green | — |
| 4 | R4 | opus | 2 | findings(1) | round-1 items 1–6 RESOLVED; new: vwf.md:2648 'read and written only through plan.mjs' (decision 8). Cap reached → closing pass | — |
| 4 | U11 docs | opus | closing | pass | closing-pass fix: vwf.md:2648 says created once with Write, validated, then set/append; reads via get | — |
| 4 | R4 | opus | closing | pass | closing check: RESOLVED; no regression | — |
| 4 | U11 | — | — | commit | unit commit | bab1f6af |
| 5 | U12 gates | opus | 1 | pass | edit; marketplace.json unchanged (no commit); both template samples validate; vitest 801 pass; tsc green. GAP: code:precommit scanned no changed files — covers only staged files | — |
| 5 | R5 | — | 1 | pass | wave review: U12 changed no file; empty diff | — |
| — | plan gate | — | — | pass | code:precommit 0; vitest 801/801; tsc --noEmit -p scripts 0. Gates the orchestrator keeps: none | — |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-24-plan-json-format

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
