# Decision — plan-management: one owner of the plan index, the Status block and the archive

**Date** 2026-09-18 · **Branch** `2026-09-18-plan-management` · **Plan**
[`docs/plans/2026-09-18-plan-management/`](../../plans/2026-09-18-plan-management/index.md)
· **Reverses** the typed `/vwf:archive` command, documented as user-only since
the plan-index plan of 2026-09-15
([`2026-09-15-plan-index-queue.md`](./2026-09-15-plan-index-queue.md)) ·
**Backlog** none covered; B12 is the consequence

## What prompted it

The session found that `/vwf:execute`'s inline archive and the `archive` skill
had drifted apart: the skill's completion check would have warned on every green
landing, its commit shape differed from the executor's, and only the skill
marked the mempalace journal drawer. Behind that, four copies of the plan-index
contract — the asset, `execute`, `plan`, `change-plan` — each carried the
procedure in its own words. Rather than re-wire one writer to call the other,
the `backlog` pattern was applied to `docs/plans/`: one skill as the sole writer
of a file several commands need to move.

## What changed

A new vwf skill, `plan-management`, is the only writer of the base repo's
`docs/plans/index.md`, of every plan folder's **Status** block, and of the move
that retires a folder into `docs/plans/archived/`; it is also the one
implementation of the reads over them — the `next` pick, `requires:` resolution,
priority derivation and the listing. Nine verbs: `add`, `claim`, `status`,
`complete`, `archive`, `next`, `resolve`, `priority <folder | requires…>`,
`list`. `/vwf:plan`, `/vwf:change-plan` and `/vwf:execute` call the verbs
instead of carrying the procedure. The contract moved from
`assets/plan-index.md` to `skills/plan-management/references/plan-index.md`; the
`archive` skill and the asset are deleted. The skill is **model-only** —
`user-invocable: false`, `disable-model-invocation: false`, the pair `init`
carries.

## The reversal

`/vwf:archive` is no longer a typed command. Since 2026-09-15 the site manual
listed it in the Commands table, the worked walkthrough ended on it, and the
shipped `project-claude.md` workflow line ended on it. Now a landing with no
open gap archives the folder itself, and a folder the landing left live —
gap-kept, hand-merged, or never run — is retired by **asking in prose**: the
session invokes `archive <folder>` in the main checkout, which moves the folder,
applies the row edit and sweep, closes the backlog ids, marks the mempalace
drawer, and reports the commit for `/vwf:git-workflow` —
`docs: archive plan <name>`. Asking to see the queue invokes `list` the same
way.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **What it owns (1).** The index rows, the archive move, and each plan folder's
  Status block. The planners keep writing the folder's content; `execute` keeps
  writing the Run log. Rejected: everything under `docs/plans/` (a Run log hop
  per unit, a payload contract for folder creation); the index and the move only
  (the Status block would drift).
- **Invocation (2).** Model-only, with the guard note `init` carries. A user
  reaches `archive` or `list` by asking. Rejected: user-invocable like
  `backlog`, which reverses the model-only intent for archiving.
- **The verb set (3).** Nine, each under its own heading. Rejected: folding
  `status` into `claim`/`complete` (they edit different checkouts); dropping
  `priority`/`resolve` (two implementations of each rule).
- **Commits (4).** The skill never commits; the caller does — `execute` keeps
  its two `docs: plan queue — <folder> …` commits, the planners their approval
  commit, a standalone archive the session's git-workflow commit. Rejected: per
  verb; always committing itself.
- **The landing sequence (8).** On `yes` with an empty gap list:
  `status … COMPLETE` → `archive <folder>` in the worktree → the final `docs:`
  commit → merge → `complete <folder>` in the main checkout. With a gap open, or
  on `no`: `status` only, the folder stays live. Rejected: `execute` keeps
  moving the folder inline.
- **The stale-`RUNNING` reset (13).** Not this plan — it is backlog B12.
  Rejected: adding it now on the user's word alone.

## Refined during execution

- **`priority` takes `<folder | requires…>`.** Both planners invoke it at their
  gate, before the folder is written, so the verb also accepts the `requires:`
  entries themselves.
- **One more owner.** `assets/topologies/multi-repo.md` cited the asset; the
  docs unit's Owns were widened to re-point it.

## Consequence for the next plan

B12, `P1`: the `unclaim <folder>` verb — resetting a stale `RUNNING` row to
`APPROVED` in an integration-branch commit — now has a home in
`plan-management`. It still needs the liveness rule this plan did not design:
how a session proves the claiming run is gone.

## Parked

- **The diary checkpoint beside the run log.** The Stop hook fires mid-run, so a
  unit produces a diary entry on top of its run-log row. A later plan decides
  whether the hook stands down while a run is open. Parked since the deadlock
  plan (2026-09-15), carried through review-rows (2026-09-17).
