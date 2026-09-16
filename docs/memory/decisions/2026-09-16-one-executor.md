# Decision — one executor: `/vwf:execute` runs every plan folder

**Date** 2026-09-16 · **Branch** `2026-09-16-one-executor` · **Plan**
[`docs/plans/2026-09-16-one-executor/`](../../plans/2026-09-16-one-executor/index.md)
· **Reverses** nothing — this is the first Parked item of
[`2026-09-16-plan-folders.md`](./2026-09-16-plan-folders.md) coming due, plan 2
of 2, whose `requires:` names that folder · **Backlog** none

## What prompted it

Plan 1 gave both planners one folder shape and one plan index, and left two
executors reading it: `/vwf:execute` ran a cycle folder's units serially through
the TDD / coverage / engines / review + security pipeline and left the folder
live for `/vwf:archive`; `/vwf:change-execute` dispatched a change folder's
units concurrently per wave under a wave review and moved the folder to
`archived/` itself. The `Kind` column plan 1 wrote into every Units table was
switched on by neither. The user wanted one executor — one launch line, one
`next`, one landing — without losing what each did well: TDD and the two
reviewers on code, concurrency and the contract-scoped wave review on prose. The
survey found nothing programmatic naming `change-execute` — no hook, agent,
manifest, task, checker or workflow — so the change was prose across skills,
assets and docs, and no format number moved.

## What changed

`/vwf:execute <folder> | next` runs every plan folder, of either kind. The Units
table's `Kind` cell is the switch: within a wave, every `edit` unit is
dispatched in one message and awaited, then each `code` unit runs serially
through its pipeline, then the wave review `R<wave>` judges the wave against the
contract, then the wave gate. The acceptance and UX pass, the blueprint
reconcile and the chain forward fire only when the plan has `covers:`. The
landing follows recorded consent, moves the folder to `archived/` when no gap is
open, and stops once before every after-landing step. `skills/change-execute/`
is deleted whole — no alias, no redirect; its `### /vwf:change-execute` heading
leaves the manual and the nine inbound links re-point to `#vwfexecute`.
`skills/execute/` keeps the shared spine in `SKILL.md` and holds five
references: `code-unit.md` (the per-unit pipeline, moved verbatim),
`edit-unit.md` (the dispatch and the wave review), `blocking.md` (moved from
`change-execute`), `preflight.md` (now the `code`-unit preflight) and
`acceptance-and-ux.md`.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **One executor (1).** `skills/execute/` is the one executor and keeps its
  name; `skills/change-execute/` is deleted whole — `SKILL.md` and its three
  references. Rejected: a thin alias kept for one release.
- **The Kind switch (2).** The executor reads each unit's `Kind` from the Units
  table. `code` runs the per-unit pipeline — recall, coder under TDD, engines,
  both reviewers, merged loop-back, gaps, commit, journal — moved verbatim into
  `references/code-unit.md`; `edit` runs the dispatch and wave review from
  `change-execute` §4 and `wave-review.md`, now `references/edit-unit.md`.
  `SKILL.md` keeps the shared spine: resolve and claim, worktree, preflight, the
  wave loop, report, landing, after landing, pauses. Rejected: one executor per
  kind; everything inline.
- **Mixed waves (3).** Within a wave: every `edit` unit dispatched in one
  message and awaited; then each `code` unit serially through its pipeline; then
  the wave review, then the wave gate. Engines and reviewers never overlap
  across units. Rejected: everything concurrent; everything serial.
- **The wave review (4).** `R<wave>` runs after every wave, of either kind,
  scoped to the contract — rulings honoured, Owns respected, cross-unit drift,
  docs falsified — and is told that code-quality and security findings on a
  `code` unit belong to that unit's reviewers and are not re-raised. The
  two-round cap, the guard and `contested` residue stay. Rejected: only waves
  holding an `edit` unit.
- **Archiving at landing (5).** When the landing's gap list is empty, the
  landing moves the folder to `docs/plans/archived/`, re-points `Folder`, sets
  `COMPLETE` and sweeps — for both kinds. When any gap is open, the folder stays
  live as the working record, the row reads `COMPLETE` with `Folder` at the live
  path, and the report names `/vwf:archive` for after reconciliation.
  `plan-index.md`'s two writer rows collapse to one. Rejected: always leave for
  archive; always move.
- **What `covers:` gates (6).** Present only on a cycle plan, `covers:` gates
  the format check, the stamp-based `requires:` test, the Doc Paths blueprint
  rows, the acceptance and UX pass, Reconcile's stamps / registry / environment
  / harness steps, the coverage / acceptance / ux / stamps bullets of the
  report, gap reconciliation and chain forward. A plan without it skips each,
  journaled. Rejected: run everything for every plan.
- **Preflight by content (7).** `/vwf:doctor` runs for every plan. The
  stack-conventions fetch and the LSP consent-row rule run only when the Units
  table holds a `code` unit; `references/preflight.md` says so. Rejected: full
  preflight for every plan.
- **Mempalace by Kind (8).** The Run log mirrors to room `runs` for every plan;
  per-unit recall before dispatch and decision persistence after run for `code`
  units only — an `edit` unit's ruling is in its file. Rejected: mempalace for
  every unit.
- **The fixed final units (9).** The docs unit and the gates-and-bump unit are
  the last two waves for every plan, run only when nothing was skipped, as
  `change-execute` §4 said. `execute`'s inline docs-sync call in Reconcile goes
  — the docs unit does it. The `implementation:` stamps and the registry /
  environment / harness reconcile stay the orchestrator's Reconcile step, gated
  on `covers:`, run before the docs unit's wave so its delta is complete.
  Rejected: the orchestrator keeps doing docs-sync itself.
- **Landing and pauses (10).** The report, landing and after-landing text is
  `change-execute` §§6–8 — the fuller version — with `execute`'s additions: the
  `covers:`-gated report bullets, `/vwf:backlog done`, the git-workflow declared
  preference, the consent-withheld rule (Status stays `RUNNING`, branch ready to
  land by hand). The pause taxonomy, the resource-cap hook contract and "What
  does not stop the run" are `execute`'s and apply to every plan. Rejected: two
  shorter variants.
- **`next` (11).** No Kind filter: candidates are every `APPROVED` row whose
  requirements are satisfied, ordered as before; the `Kind` cell is still
  written and printed with the pick. Rejected: the per-kind filter.
- **The retired anchor (12).** The `### /vwf:change-execute` heading is removed
  from the manual's `plugins/vwf.md`; its content folds into `### /vwf:execute`.
  The nine inbound `#vwfchange-execute` links re-point to `#vwfexecute`.
  `ad-hoc-change.md` keeps its title and description; its body names
  `/vwf:execute`. No redirect exists to keep. Rejected: an empty heading kept as
  an anchor.
- **The planners' launch lines (13).** `/vwf:change-plan` and `/vwf:plan` both
  end with `/vwf:execute docs/plans/<folder>` and `/vwf:execute next`;
  `plan-folder.md`'s Launch block, its "No executor switches on it yet"
  paragraph and its Run log "per unit report" sentence are rewritten for one
  executor; `plan-index.md`'s "either executor" prose and the intro written into
  every repo's index name one `next`. Nothing rejected.
- **Frontmatter (14).** `execute`'s `description` names both kinds and the Kind
  switch; `argument-hint` and `disable-model-invocation: true` are unchanged.
  `change-plan`'s `description` names `/vwf:execute` where it named
  `change-execute`. Nothing rejected.

One departure surfaced in the run and was corrected by the wave review: a first
draft gated decision persistence on `covers:` rather than on a `code` unit; the
landed text follows ruling 8.

## Parked

- **`release <folder>`** — resets a stale `RUNNING` row to `APPROVED` in an
  integration-branch commit instead of the hand edit. Needs a rule for proving
  the session is gone. Parked since the queue plan.
- **The diary checkpoint beside the run log.** The Stop hook fires mid-run, so a
  unit produces a diary entry on top of its run-log row. A later plan decides
  whether the hook stands down while a run is open. Parked since the deadlock
  plan.
