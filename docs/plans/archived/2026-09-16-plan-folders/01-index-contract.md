# U1 — The index contract: one table, one procedure

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/plan-index.md`
- **Model:** opus
- **Read first:** `plugins/vwf/assets/plan-index.md` top to bottom;
  `plugins/vwf/skills/change-execute/references/queue.md` top to bottom (read
  only — U7 deletes it).
- **Lazy-load:** `plugins/vwf/assets/membership.md` (how a member repo resolves
  the base's file); `docs/plans/archived/2026-09-15-plan-index-queue/index.md`
  (the plan that wrote the two-table contract, for its rulings).

## Ruling

Decision 3: "Header
`Folder, Kind, Plan, Target repo, Priority, Status,
Requires, Backlog`. `Kind`
is `cycle` for `type: vwf-plan`, `change` for `type: vwf-change-plan`.
`Target repo` is the member holding the code for a cycle plan, `—` for a change
plan. The queue procedure (read at tip, claim, completion, sweep) moves from
`change-execute/references/queue.md` into `assets/plan-index.md`."

Decision 4: "Both executors take `<folder>` or `next`; `next` reads the one
table, filtered to its own `Kind`, ordered by Priority then date prefix then
folder. Both claim the row `RUNNING` with a pushed commit in the main checkout
**before** the worktree is cut. Priority is derived (`10 + max` over unarchived
`requires:` rows), never asked."

Decision 5: "A cycle plan's `requires:` entry is satisfied when every `covers:`
doc of the required plan reads `implementation: complete` in the base repo's
blueprint — the existing test — because cycle folders live in the target repo,
which may not be cloned. The index row is what `next`, the claim and visibility
use; it is not the satisfaction test for a cycle entry. A change entry keeps the
row/archived test."

Decision 10 (the part that binds this unit): "`assets/plan-index.md` — the table
plus the procedure."

## Edits

1. **`plugins/vwf/assets/plan-index.md`** — rewrite as the one contract. Keep
   the file's opening sentence (the product's one view of its plans as a set,
   living in the base repo) and its structure of *prose frame → columns →
   statuses → writers → resolution → the pick → procedure*, and change:
   - **One table.** Replace the two-table paragraph and the writers table
     (`:10-15`) with one statement: the file holds **one table**, every plan
     folder is a row, and the writers are `/vwf:plan`, `/vwf:change-plan`,
     `/vwf:execute`, `/vwf:change-execute`, `/vwf:archive`. Replace the prose
     frame (`:26-40`) with one heading `## Plans` and the header row
     `| Folder | Kind | Plan | Target repo | Priority | Status | Requires | Backlog |`.
     A writer creating the file writes the intro and this header, then its row.
   - **Delete the cycle-table section** (`:42-50`) and every "flat", "flat
     file", `docs/plans/<plan>.md` and "cycle-plan table" / "change-plan table"
     phrase.
   - **Columns.** Add `Kind` (`cycle` or `change`, derived from the folder's
     `type:` frontmatter — `vwf-plan` → `cycle`, `vwf-change-plan` → `change`)
     and `Target repo` (for a cycle plan the member repo whose code it changes,
     resolved per `membership.md`; `—` for a change plan and for any plan in a
     `repo` or `monorepo` topology). Keep the meaning of `Folder`, `Plan`,
     `Priority`, `Status`, `Requires`, `Backlog` as written.
   - **Writers table.** One row per writer: `/vwf:plan` and `/vwf:change-plan`
     append the row `APPROVED` in their hand-off commit; `/vwf:execute` and
     `/vwf:change-execute` set `RUNNING` at claim — before the worktree is cut —
     and `COMPLETE` after the merge lands, pointing `Folder` at the archived
     path, then run the sweep; `/vwf:archive` applies the landing edit by hand.
     Note that a cycle plan's folder lives in the **target repo** and is
     archived there, while its row lives in the base.
   - **Resolution.** Keep basename matching and "no skill re-points a
     `requires:` line". Split satisfaction by the **required** plan's kind: a
     `change` requirement is satisfied by a `COMPLETE` row or an archived folder
     with no row (as today); a `cycle` requirement is satisfied when every doc
     in that plan's `covers:` reads `implementation: complete` in the base
     repo's blueprint — the row is not the test, because the folder may sit in a
     member that is not cloned. State that the kind of a requirement is read
     from its row, or from the archived folder's `type:` when there is no row.
   - **The pick.** `next` is taken by **either executor**, each filtering the
     candidates to its own `Kind` — `/vwf:execute next` picks among `cycle`
     rows, `/vwf:change-execute next` among `change` rows — with the same order
     (Priority ascending, then the folder's date prefix, then folder name) and
     the same exclusions (a `RUNNING` row is never taken; a row waiting on an
     unsatisfied requirement is not a candidate).
   - **The procedure.** Append, as `## The procedure`, the content of
     `change-execute/references/queue.md` — *Reading the queue*, *Writing a
     row*, *The sweep* — rewritten to name neither skill: "the executor", "the
     run". Keep every git command verbatim (they were proven on 2026-09-15).
     Change the claim and landing commit messages to
     `docs: plan queue — <folder> running` and `… complete` unchanged. In the
     sweep, the "cycle-plan table is never touched" sentence goes.
   - **After landing** section (`:121-125`) stays as written.
2. Fold by hand at the file's existing width — `plugins/**/*.md` is not
   dprint-formatted.

## Verification

- `grep -c 'cycle-plan table\|change-plan table\|flat\|docs/plans/<plan>.md\|two tables' plugins/vwf/assets/plan-index.md`
  prints `0`.
- `grep -n '| Folder | Kind | Plan | Target repo | Priority | Status | Requires | Backlog |' plugins/vwf/assets/plan-index.md`
  hits once.
- `grep -n '^## The procedure' plugins/vwf/assets/plan-index.md` hits once, and
  `grep -c 'git pull --rebase\|git stash push -u\|git reset --soft HEAD~1' plugins/vwf/assets/plan-index.md`
  prints `3`.
- `grep -n 'implementation: complete' plugins/vwf/assets/plan-index.md` hits in
  the resolution section.
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch `plugins/vwf/skills/**` — the four skill trees and their
  references are wave 2's; `references/queue.md` is deleted by U7, not by you.
- Do not touch `docs/plans/index.md` — the orchestrator's, in the main checkout;
  the file's *shape* changes when the first writer under the new contract writes
  it.
- No escaped backtick inside a code span; no code span beginning with `##`.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`feat: plan index — one table, one procedure, both kinds` — written by the
orchestrator after the wave gate, not by the unit. Type `feat` is in
`.config/git-conventional-commits.yaml`; the repo allows no scope.
