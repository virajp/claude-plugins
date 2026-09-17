# Decision — one plan folder shape, one plan index, both executors read it

**Date** 2026-09-16 · **Branch** `2026-09-16-plan-folders` · **Plan**
[`docs/plans/2026-09-16-plan-folders/`](../../plans/2026-09-16-plan-folders/index.md)
· **Reverses** nothing — this is the parked *Cycle-plan queue parity* item of
[`2026-09-15-plan-index-queue.md`](./2026-09-15-plan-index-queue.md) coming due
· **Backlog** none

## What prompted it

The 2026-09-15 record gave change plans a queue — a row in `docs/plans/index.md`
with a derived priority, a claim before the worktree, `next`, a sweep — and
parked the same semantics for `/vwf:plan`, whose cycle plans were still single
files with their own table and no claim. Beside the parity gap, `/vwf:plan`'s
own hand-off could not run unattended: a cycle plan carried no consent rows, no
gate lines and no after-landing table, so `/vwf:execute` stopped at a human
final gate and asked mid-run for things a plan folder could have carried — the
LSP question among them — and its one fresh-session path was the in-session
*Approve & execute* option, which needed `execute` to stay model-invocable.

## What changed

`/vwf:plan` and `/vwf:change-plan` write the **same folder** — `index.md` plus
one `NN-<unit>.md` per unit, shaped by `assets/templates/plan-folder.md` and
interviewed from `assets/plan-interview.md`. `docs/plans/index.md` holds **one
table** with a `Kind` column, and the claim / completion / sweep procedure moved
from `change-execute`'s reference into `assets/plan-index.md`, so both executors
follow one contract, `next` included. `/vwf:execute` takes a folder or `next`,
claims its row before the worktree, runs units serially through its existing
pipeline, renders the report from the folder's Run log and lands per the
folder's Consent block. `/vwf:archive` handles folders of either kind and
nothing else. Plan 2 — one executor with a per-unit `Kind` switch, retiring
`/vwf:change-execute` — names this folder in its `requires:`.

## The rulings, with what each rejected

Numbered as in the plan's decisions table; the rulings a later plan is most
likely to re-open.

- **Cycle folder name (1).** `docs/plans/<date>-<HHMM>-<slice>/`. The time
  component stays so two plans for one slice on one day coexist. Rejected:
  `<date>-<slice>`, and keeping the single file.
- **Units carry Kind (2).** Every unit carries Wave, Owns, Depends-on, Model and
  **Kind** — `code` from `/vwf:plan`, `edit` from `/vwf:change-plan`. No
  executor switches on it yet: `execute` runs its per-unit pipeline on every
  unit, `change-execute` its wave review. Rejected: introducing Kind in plan 2
  only, which would have made plan 2 rewrite every folder written in between.
- **`next` and Priority for both (4).** Both executors take `<folder>` or
  `next`; `next` reads the one table filtered to its own Kind, ordered by
  Priority, then date prefix, then folder. Both claim `RUNNING` with a pushed
  commit before the worktree is cut. Priority is derived, never asked. Rejected:
  **removing `next` everywhere** — proposed mid-interview on 2026-09-16 and
  withdrawn the same day, so a later reader should not take it up as new. The
  queue exists to let a fresh session pick work without a person naming the
  folder.
- **Cycle `requires:` satisfaction (5).** A cycle requirement is satisfied when
  every `covers:` doc of the required plan reads `implementation: complete` in
  the base's blueprint — the existing test — because a cycle folder lives in its
  target repo, which may not be cloned. The row is what `next`, the claim and
  visibility use, not the satisfaction test. A change requirement keeps the
  row-or-archived test. Rejected: the index status as the test for both kinds.
- **In-flight single-file plans (6).** No compatibility path; `execute` reads
  folders only. A plan in the old shape still in flight is finished on the vwf
  release that wrote it, or its slice is re-run through `/vwf:plan`, whose
  stamp-heal drops what already conforms. Rejected: a one-release legacy reader.
- **Concurrency (7).** `execute` runs units **serially in dependency order** —
  one unit is one step through the existing code → review + security pipeline;
  waves are honoured as ordering only. Plan 2 decides concurrency when it merges
  the loops. Rejected: concurrent coders per wave now.
- **Landing (8).** `execute` lands per the folder's Consent block: the report is
  rendered from the Run log; when consent reads yes, every gate is green and no
  blocking gap is open, it merges and pushes without a further prompt, writes
  the row `COMPLETE` with `Folder` left at the live path, and sweeps. The folder
  is not moved: `/vwf:archive` moves it and re-points the row, which is why the
  sweep removes only `COMPLETE` rows whose `Folder` is already under
  `archived/`. Every after-landing step asks. A red gate, an open blocking gap
  or `no` stops at the report. Rejected: keeping the human final gate in this
  plan; `execute` re-pointing `Folder` while the folder stays live (an R2
  finding — archive could then never find it).
- **The LSP question (9).** Asked once at `/vwf:plan`'s stack gate — install now
  or proceed without — and recorded as a consent row
  `LSP <language>: installed / proceed without`. `execute` Setup halts on
  `blocking` only, reads the row, and never asks. Rejected: `execute` asking at
  Setup.
- **Shared assets (10).** `assets/templates/plan-folder.md`,
  `assets/plan-interview.md` and `assets/plan-index.md` (the table plus the
  procedure) are the three shared files. `assets/templates/plan.md`,
  `change-plan/references/{plan-template,interview}.md` and
  `change-execute/references/queue.md` are deleted. Rejected: an interview per
  skill.
- **`/vwf:plan` hand-off (11).** Mirrors `change-plan` §8: `APPROVED`, the index
  row, `/vwf:backlog planned`, then commit **and push** the folder in place on
  the current branch through `git-workflow` with declared preferences, then the
  launch line. *Approve & execute* is removed; *Approve & plan next* (mid-chain)
  and *Approve only* stay. Under `multi-repo` the member's folder commit lands
  first, the base's index and backlog commit last. Rejected: the in-session
  hand-off; a local, unpushed worktree.
- **Run log (12).** The folder `index.md`'s Run log table is the record for both
  kinds. `execute` appends one row per node as it returns and mirrors it to the
  mempalace `runs` journal; the folder is what the final report renders and what
  a resume reads first, the journal a copy that may be down. Rejected: journal
  only, with an empty folder log for cycle plans.
- **`execute` invocation mode (17).** `disable-model-invocation: true` — a
  person launches it in a fresh session, like `change-execute`, and every resume
  is a person re-running `/vwf:execute <folder>`; the one caller that needed
  model invocation was the retired in-session hand-off. Rejected: keeping it
  model-invocable.

The other rulings — the one table and its columns (3), the Status block as the
one status with `status:` leaving the frontmatter (13), the three cycle-only
sections (14), `archive` on folders only (15), the agents saying *unit* (16) —
are recorded with their rejected alternatives in the plan's decisions table.

## Parked

- **Plan 2 — one executor.** `/vwf:execute` absorbs `/vwf:change-execute`:
  `code` units get the TDD / coverage / engines / review + security pipeline,
  `edit` units the wave review; acceptance, UX and the blueprint reconcile fire
  only when the plan has `covers:`; `change-execute` retired outright, no alias.
  Decided 2026-09-15, planned after this lands with
  `requires: [docs/plans/2026-09-16-plan-folders]`.
- **`release <folder>`** and **the diary checkpoint beside the run log** — as
  parked in the plan, unchanged since the queue and deadlock plans.
