# U9 — The migration guide for other repos

- **Wave:** 1
- **Depends on:** —
- **Owns:** `docs/plans/migrate.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's facts sections on the two schemas and the
  command line, and `plugins/vwf/assets/templates/plan-folder.md` at the
  branch base (`git show $(git merge-base HEAD develop):plugins/vwf/assets/templates/plan-folder.md`),
  which describes the old format.

## Ruling

Decision 30: "A `stages` key in `index.json`, required for both kinds: `{renders, acceptance, ux, reconcile}`, each `{state, detail}`, `state` one of `pending`, `green`, `failed`, `skipped`. The planner writes each `pending`; `/vwf:execute` sets each with `plan.mjs set` as the stage runs or is skipped, and a resume reads them to know whether a stage already passed (today `execute/SKILL.md:790-807` keeps that in Run log rows). The migration writes the state that the old Run log rows show, else `pending`."

Decision 31: "The migration guide copies the reason that the old Waves line gives for the unit's wave; when there is none, it writes `migrated: no reason recorded`.                                                                                                                                                                                "

Decision 29: "The migration guide carries both maps itself; it pushes after its commit; a `BLOCKED` folder's worktree comes from `git worktree list` by the branch named after the folder; a part an old folder lacks gets its empty value (`[]`, `false`, `""`, `{"from": "", "to": ""}`) and the guide never stops for it; differing gap counts keep the lines and tell the user; a live folder holds an `index.md`. A cycle-only key on a change plan is a `validate` finding. U7 also owns `plugins/vwf/agents/execute-ux-reviewer.md` (`:29`, `:135`). The stackgen `tool-config` dprint and linter configs are out of scope under decision 28."

Decision 26: "The guide takes each gap line of the old "Gaps surfaced during execution" section and each Run log row whose Outcome or Detail starts with `GAP:`; `unit` and `stage` are `""` when the old line does not name them; a line with no state word is `open`. The count of `open` gaps equals the row's Gaps count."

Approved ruling: "**No `plan-management migrate` verb.**
`docs/plans/migrate.md` in this repo tells an agent in another repo how to
migrate its live plans. The user pastes a prompt that names the file's
**local path** in that repo's session."

Approved ruling: "**Archived plans are not read** … so they are not
migrated."

Decision 13: "A row that reads `RUNNING` is unclaimed by the guide itself:
the row becomes `APPROVED`, every unit `pending` with an empty `commit`,
`rounds` 0, and `status.detail` reads
`APPROVED <date> — unclaimed at migration; was RUNNING in <worktree>`. The guide then names the old worktree
and branch for the user to delete; the next `/vwf:execute` runs the plan from
the start. Every other plan keeps its unit status and commit in the unit
fields. The Run log rows are not carried over. The prompt is one line: "Read
`<local path>/docs/plans/migrate.md` and follow it in this repo.""

Decision 9 (in short): there is no old executor; on the old format every vwf
command stops and points to this guide.

Decision 15: "The user migrates it by hand after this plan lands."

## Edits

1. **`docs/plans/migrate.md`** — a guide for an agent, in STE. Sections:
   - **The prompt** — the one line of decision 13, for the user to paste.
   - **Before you start** — the vwf version that brings the new format; the
     guide works from a local clone of `virajp/claude-plugins`, and every
     path it names is relative to the guide (`../../plugins/vwf/…`).
   - **Stop condition** — no `docs/plans/index.md`: nothing to migrate.
   - **A running plan** — a row of `docs/plans/index.md` that reads
     `RUNNING` is unclaimed as decision 13 says, and the guide names the old
     worktree path and its branch for the user to delete. It reads the path
     from the folder's Status line; when that line names none (a `BLOCKED`
     line), it finds the worktree in `git worktree list` by the branch named
     after the folder. The guide deletes neither.
   - **The two maps** — the guide carries both maps itself, from index.md's
     facts of this plan: the old `index.md` sections → the keys of
     `index.json`, and the old columns of `docs/plans/index.md` → the keys of
     `docs/plans/index.json` (Folder → `folder` and `id`, Kind → `kind`, Plan
     → `title`, Target repo → `target_repo`, Priority → `priority`, Status →
     `status`, Gaps → `gaps`, Requires → `requires`, Backlog → `backlog` and
     `backlog_pieces`).
   - **Steps**, numbered:
     1. For each live folder (a folder under `docs/plans/`, outside
        `archived/`, that holds an `index.md` — with or without a row; so
        `docs/plans/gaps/` is not a plan), write
        `index.json` from the old `index.md`: the frontmatter keys, the Status
        block (`status.state` and `status.detail`), Consent (`consent`),
        Release levels, Units (each unit's `title` from the H1 of its unit
        file, `waits` from the Waves line of the unit's wave, else
        `migrated: no reason recorded` (decision 31), `status` and `commit` from the
        table, `rounds` 0 unless the Run log shows rounds), the three gates
        and the orchestrator's gates, After landing, Shared-file rule,
        Assumed decisions, New dependencies, Acceptance criteria and Gaps.
        The `gaps` list takes every gap line of the "Gaps surfaced during
        execution" section and every Run log row whose Outcome or Detail
        starts with `GAP:` (a change plan records its gaps only there):
        `unit` from the row's Unit cell when it names a unit, else `""`;
        `stage` from the line when it names one, else `""`; `state` from the
        line's first word, and `open` when it has no state word. When the
        count of `open` gaps differs from the row's Gaps count, the guide
        keeps the lines and tells the user the two counts.
        A part that an old folder lacks gets its empty value, and the guide
        never stops for it: no Release levels → `release_levels: []`; no End
        an `all` run row → `consent.end_all_run: false`; no Merge row →
        `consent.merge: false`; no gate section → `[]`; no After landing →
        `[]`; a review unit → `range: {"from": "", "to": ""}`.
        `stages` (decision 30): each of `renders`, `acceptance`, `ux` and
        `reconcile` takes the state that the old Run log rows show for it,
        else `pending`.
        The schema is the template at
        `../../plugins/vwf/assets/templates/plan-folder.md`.
     2. Cut those sections out of `index.md`, and the frontmatter; keep the
        prose sections the template names.
     3. Remove the header lines from each unit file.
     4. Run `node ../../plugins/vwf/skills/plan-management/scripts/plan.mjs validate <folder>/index.json`
        (as an absolute path) on each folder, and fix each finding.
     5. Write `docs/plans/index.json` from the rows of `docs/plans/index.md`
        (the column map above) and validate it.
     6. Delete `docs/plans/index.md`.
     7. Commit on the integration branch:
        `docs: plans move to the JSON format`.
     8. Push to the branch's upstream: `next` and `all` read the origin
        tree, so an unpushed migration shows no runnable plan.
   - **What is not migrated** — archived folders, and Run log rows.

## Verification

- The file exists and names the prompt line, the unclaim of a `RUNNING` plan, the eight
  steps and the validate call.
- `mise x -- mise run code:format` is green (`docs/plans/` is excluded from
  the formatter, so this proves only that nothing else changed).

## Guardrails

- Touch nothing outside `docs/plans/migrate.md`. Do not touch
  `docs/plans/index.md` or this plan's folder.
- Keep each code span on one line.

## Commit

`docs: a guide to migrate live plans to the JSON format`
