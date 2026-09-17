# U3 — the index contract, archive, and the neighbours that describe the index

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/plan-index.md` (new),
  `plugins/vwf/skills/archive/SKILL.md`, `plugins/vwf/assets/membership.md`,
  `plugins/vwf/assets/topologies/multi-repo.md`,
  `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/skills/backlog/SKILL.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing; `index.md`'s
  Goal, Facts and Assumed decisions.
- **Lazy-load:** `plugins/vwf/assets/memory.md` (the asset house style —
  contract prose with one fixed shape);
  `plugins/vwf/skills/backlog/SKILL.md:34-60` (the table-with-fixed-columns
  pattern this asset mirrors); `docs/plans/index.md` in this repo (read only —
  U4 owns it — the hand-written shape the asset generalises).

## Ruling

Decision 1: "Two tables in `docs/plans/index.md`: the cycle-plan table exactly
as `/vwf:plan` and `/vwf:archive` write it today, plus a **Change plans** table
with columns `Folder`, `Plan`, `Priority`, `Status`, `Requires`, `Backlog`. Each
writer edits only its own table. The contract is one asset,
`plugins/vwf/assets/plan-index.md`, cited by every skill that reads or writes
the file."

Decision 10: "A `requires:` entry matches an index row, or an archived folder,
by its **basename** — `docs/plans/X` and `docs/plans/archived/X` name the same
plan. No skill ever re-points a `requires:` line. An entry with no row and no
folder anywhere is a refusal, named."

Decision 12: "`/vwf:archive <folder>` applies the same rule as decision 11 to
that folder's row, in its own commit; its no-argument listing reads the
change-plan table for folders instead of walking `docs/plans/`. Archiving a
folder that has no row adds none."

Decision 11, which 12 applies: "one integration-branch commit sets the row
`COMPLETE` with its `Folder` column pointing at the archived path, then removes
every `COMPLETE` row that no `APPROVED` or `RUNNING` row's `Requires` names."

Decision 14: "The index is the **base** repo's, as `docs/backlog.md` is; a run
in a member repo addresses the base's file."

The reversal, from `index.md`'s Goal: the 2026-09-13 decision and the shipped
`/vwf:archive` rule that change-plan folders are **never** listed in
`docs/plans/index.md` is reversed — change plans get their own table in the same
file; the cycle-plan table is untouched.

Decisions 2, 7, 9 and 13 are facts the asset states (statuses, pick order,
derived priority, `ask` only) — quote them from `index.md`, never restate
differently.

## Edits

1. **`plugins/vwf/assets/plan-index.md`** (new) — the contract for
   `docs/plans/index.md`, the base repo's, in the shape every writer and reader
   follows:
   - the file's purpose and placement (decision 14);
   - the **cycle-plan table**: columns exactly as `/vwf:plan` writes them today
     (plan, target repo, status — read `skills/plan/SKILL.md:337-341` and
     `skills/archive/SKILL.md:107-110` for the current words), its writers
     `/vwf:plan` and `/vwf:archive`, unchanged by this contract;
   - the **change-plan table**: header row
     `| Folder | Plan | Priority | Status | Requires | Backlog |` with a
     one-line meaning per column — `Folder` the path relative to the repo root,
     moving under `archived/` at landing; `Plan` the title; `Priority` the
     derived integer of decision 9; `Status` one of `APPROVED`, `RUNNING`,
     `COMPLETE` (decision 2 — and what each means: approved and waiting, claimed
     by a session, landed and kept only while required); `Requires` the
     basenames of the folder's `requires:` entries or `—`; `Backlog` the ids or
     `—`;
   - the **writers and their edits**: `/vwf:change-plan` appends a row at
     hand-off; `/vwf:change-execute` sets `RUNNING` at claim and `COMPLETE` at
     landing then sweeps; `/vwf:archive` applies the landing rule by hand. Every
     edit is a direct commit on the integration branch, never in a worktree,
     with the two commit messages decision 11 names;
   - **resolution**: basename matching (decision 10), and what satisfies a
     requirement — a `COMPLETE` row, or an archived folder with no row;
   - **the pick** (decision 7) and the tie-breaks, and that `RUNNING` rows are
     never taken (decision 8);
   - the file's **prose frame**: a two-sentence intro above the tables saying
     what each table is, so a repo whose file is written fresh reads the same as
     one that grew — give the intro text, so `change-plan` can write the whole
     file the first time.
2. **`plugins/vwf/skills/archive/SKILL.md`** — the reversal, carried through:
   - `:18-23` — the two shapes: the folder "is listed in the change-plan table
     of `docs/plans/index.md`, per
     `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`". Delete "**never** listed …
     archiving it does not start listing it".
   - `:52-62` — the no-argument listing: folders come from the change-plan table
     (`APPROVED` and `RUNNING` rows, the latter marked in flight and skipped
     from the offer), not from a walk; a folder on disk with no row is listed as
     "unindexed", so a hand-made folder is still visible.
   - `:88-97` and `:118-123` — the folder path: after moving the folder, apply
     decision 12 — set its row `COMPLETE` with the archived `Folder`, run the
     sweep, and commit `docs/plans/index.md` in the archive's own commit; a
     folder with no row gets none. Say the edit is made on the integration
     branch in the main checkout when the archive runs there, and that archiving
     from inside a worktree leaves the row for the landing to fix.
   - `:128-130` — delete "`docs/plans/index.md` is never touched for a folder.
     Change plans are not listed there, by decision"; replace with the
     one-sentence rule and the asset citation.
   - Wherever it says `requires:` names a path: basename matching, decision 10.
3. **`plugins/vwf/assets/membership.md:146-148`** and
   **`plugins/vwf/assets/topologies/multi-repo.md:47,142`** — "a thin index of
   every plan and its target" becomes "a thin index — the cycle-plan table and
   the change-plan queue, per `assets/plan-index.md`"; the tree at
   `multi-repo.md:43,77` is unchanged (the file already appears).
4. **`plugins/vwf/skills/plan/SKILL.md:49,337-341`** and
   **`plugins/vwf/skills/execute/SKILL.md:42-46,79`** — the sentences that call
   the index "one row per plan" name the **cycle-plan table** and cite the
   asset; nothing else changes — parity for cycle plans is parked.
5. **`plugins/vwf/skills/backlog/SKILL.md:34`** — "beside `docs/plans/index.md`"
   gains "(the plan index — `assets/plan-index.md`)". Nothing else.

## Verification

- `mise run p:plugins:check` green (the new asset is under `assets/`, which rule
  13 does not walk; the skills' frontmatter still parse).
- `command test -f plugins/vwf/assets/plan-index.md`.
- `command grep -rn 'never listed\|never be listed\|never touched for a folder\|not listed there' plugins/vwf/skills/archive/SKILL.md`
  returns nothing.
- `command grep -c 'plan-index.md' plugins/vwf/skills/archive/SKILL.md plugins/vwf/skills/plan/SKILL.md plugins/vwf/skills/execute/SKILL.md plugins/vwf/assets/membership.md plugins/vwf/assets/topologies/multi-repo.md plugins/vwf/skills/backlog/SKILL.md`
  — every file ≥ 1.
- `command grep -n '| Folder | Plan | Priority | Status | Requires | Backlog |' plugins/vwf/assets/plan-index.md`
  hits.

## Guardrails

- Touch nothing outside the owned files. `change-plan/**` is U1's,
  `change-execute/**` U2's, every doc U4's — a wrong passage there is a
  `DOCS FALSIFIED:` line, not an edit.
- `plugins/**/*.md` is **not** dprint-formatted: match the surrounding fold
  width by hand.
- Strict-YAML frontmatter on every SKILL.md you edit.
- The asset cites nothing by `${CLAUDE_PLUGIN_ROOT}` — it is read by skills, not
  landed in a repo, so the token is fine in skills but keep the asset's own
  prose path-free apart from `docs/plans/index.md` and `docs/plans/archived/`.
- Never end a table cell in a bare asterisk; no escaped backticks inside code
  spans.
- Delete with `rm`, never `git rm`.

## Commit

`feat: plan-index contract — change plans listed in docs/plans/index.md, archive keeps the row`
— written by the orchestrator after the wave gate, not by the unit.
