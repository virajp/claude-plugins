# Decision — `docs/plans/index.md` is the change-plan queue, and after-landing steps are `ask` only

**Date** 2026-09-15 · **Branch** `2026-09-15-plan-index-queue` · **Plan**
[`docs/plans/2026-09-15-plan-index-queue/`](../../plans/2026-09-15-plan-index-queue/index.md)
· **Reverses** part of
[`2026-09-13-vwf-process.md`](./2026-09-13-vwf-process.md) — the rule that
change plans are never listed in the index, and the `run` after-landing mode ·
**Backlog** none

## What was decided before

`docs/plans/index.md` was `/vwf:plan`'s file: one row per flat cycle plan (plan,
target repo, status), appended by `/vwf:plan`, flipped to archived by
`/vwf:archive`, read by `/vwf:execute` to chain forward. The 2026-09-13 record
placed the backlog *beside* it and left it at that. `/vwf:change-plan`'s folders
were, by the shipped `/vwf:archive` rule, **never** listed there — archive's
no-argument listing found them by walking `docs/plans/` for any `index.md`
reading `type: vwf-change-plan`, and archiving one left no row to fix. There was
no plan-level priority anywhere; the backlog's `P1`–`P3` was a backlog
vocabulary, not a plan one. `/vwf:change-execute` took one argument, a folder,
and nothing chose the next plan for you.

A change plan's After landing table carried two modes: `run` — executed
unprompted after a consented landing, so long as it published nothing and cut no
tag — and `ask`. `mise run p:plugins:local` was this repo's standing `run` step.
And this repo already kept a hand-written `docs/plans/index.md` in the shape
this plan mechanises, with a note that mechanising it "is a later change".

## What changed

`docs/plans/index.md` holds **two tables**, each with its own writers, under one
contract at `plugins/vwf/assets/plan-index.md`: the cycle-plan table exactly as
before, and a **Change plans** table with columns `Folder`, `Plan`, `Priority`,
`Status`, `Requires`, `Backlog`. The file is the base repo's, as
`docs/backlog.md` is; a run in a member repo addresses the base's.

- `/vwf:change-plan` appends the row at hand-off, `APPROVED`, with a **derived
  priority**, in the same commit as the folder.
- `/vwf:change-execute` **claims** the row — `RUNNING`, committed and pushed on
  the integration branch from the main checkout, **before** the worktree is cut
  — and after the merge lands sets it `COMPLETE` at the archived path and
  sweeps. Every index edit is a direct integration-branch commit; the run branch
  never carries the file.
- `/vwf:change-execute next` reads that table alone, picks the runnable
  `APPROVED` row of lowest priority, and runs it as if named.
- `/vwf:archive` applies the landing edit to a folder's row and reads the table
  for its no-argument listing.
- After-landing steps are **`ask` only**. The `run` mode is retired; a `run` in
  an older folder is read as `ask`.

## The reversal, named as one

The 2026-09-13 record and the shipped `/vwf:archive` ruled that the index lists
cycle plans only and that change-plan folders are never listed there. That is
reversed: change plans get their own table in the same file. The cycle-plan
table is untouched, and the parity question — the same claim / `next` / priority
semantics for `/vwf:plan`'s flat plans — is parked below rather than decided.

## The rulings, with what each rejected

- **Claiming (3).** A claim is the row set to `RUNNING`, committed and pushed on
  the integration branch before the worktree exists. A named run on an
  `APPROVED` plan claims the same way; a resume finds its row already `RUNNING`
  and leaves it. Rejected: the branch's existence as the claim; no cross-session
  guard at all.
- **Dirty main checkout (5).** `git stash push -u`, checkout the integration
  branch, `git pull --ff-only`, edit and commit the index, push,
  `git checkout -`, `git stash pop` — one plain git call per step, and every
  exit restores the checkout. Rejected: refusing and naming the blocker.
- **Rejected push (6).** `git pull --rebase`. A clean rebase means a different
  row changed — push again; the pick stands, since a claim only ever flips
  `APPROVED` to `RUNNING` and cannot make a satisfied `requires:` unsatisfied. A
  conflict on the index means the same row — abort the rebase, drop the claim
  commit (`reset --soft`, then restore the file from `HEAD`), `pull --ff-only`,
  restore the checkout, re-pick. A completion re-applies its row until it lands
  and never re-picks. Rejected: fetch and hard-reset.
- **What `next` picks (7).** `APPROVED` rows whose every `requires:` entry
  resolves to a `COMPLETE` row or to an archived folder with no row; ordered by
  `Priority`, then the folder's date prefix, then name. Nothing runnable prints
  each `APPROVED` row and what it waits on. Rejected: running while a
  requirement is still `RUNNING`.
- **Stale claims (8).** `next` never takes a `RUNNING` row. Resuming is the
  named form; a claim whose session is gone is reset to `APPROVED` by hand, in
  an integration-branch commit. Rejected: `next` taking over when the worktree
  is absent.
- **Priority (9).** Derived by `change-plan`, never asked:
  `10 + max(Priority of every unarchived plan in its requires:)`, or `10`. Shown
  at the gate as a fact, written into the row at hand-off. Rejected: the next
  free block after the highest active; a user override.
- **Requires matching (10).** By **basename** — `docs/plans/X` and
  `docs/plans/archived/X` name the same plan; no skill re-points a `requires:`
  line; an entry with no row and no folder anywhere is a named refusal.
  Rejected: exact path, with dependents re-pointed at landing.
- **Landing (11).** After the merge, one integration-branch commit —
  `docs: plan queue — <folder> complete` — sets the row `COMPLETE` with `Folder`
  at the archived path, then removes every `COMPLETE` row no `APPROVED` or
  `RUNNING` row's `Requires` names. The claim commit is
  `docs: plan queue — <folder> running`. Rejected: keeping every `COMPLETE` row
  until archived by hand.
- **After-landing modes (13).** `ask` only. `change-plan` §4(b) offers no `run`;
  the template's table reads `ask`; `change-execute` stops once before every
  step. Rejected: keeping `run`; defaulting deploy steps to `ask`.

The other rulings — the two-table shape (1), index rows carrying only
`APPROVED`/`RUNNING`/`COMPLETE` while the folder keeps the run detail (2), index
edits only as direct integration-branch commits (4), archive applying the same
row rule (12), the index as the base repo's file (14) — are recorded with their
rejected alternatives in the plan's decisions table.

## Parked

- **Cycle-plan queue parity.** `/vwf:plan`'s flat plans keep their own table and
  `/vwf:execute` keeps its chain-forward offer. A later plan can give cycle
  plans the same claim / `next` / derived-priority semantics, reading
  `assets/plan-index.md` as the shared contract.
- **`/vwf:change-execute release <folder>`.** A verb that resets a stale
  `RUNNING` row to `APPROVED` in an integration-branch commit, instead of the
  hand edit decision 8 relies on. Needs a rule for proving the session is gone.
