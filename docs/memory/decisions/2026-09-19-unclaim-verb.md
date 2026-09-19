# Decision — unclaim verb: release a stale RUNNING claim through plan-management

**Date** 2026-09-19 · **Branch** `2026-09-19-unclaim-verb` · **Plan**
[`docs/plans/2026-09-19-unclaim-verb/`](../../plans/2026-09-19-unclaim-verb/index.md)
· **Reverses** nothing · **Backlog** B12 covered · **Deferred by** the
plan-management plan of 2026-09-18
([`2026-09-18-plan-management.md`](./2026-09-18-plan-management.md))

## What prompted it

The 2026-09-18 plan made `plan-management` the sole writer of
`docs/plans/index.md` and every folder's Status block, and deferred exactly one
write by name — backlog B12, the stale-`RUNNING` reset — because it needed a
liveness rule that plan did not design: how a session proves the claiming run is
gone. Until now that reset was the one hand edit the contract still permitted,
described in five places across `plan-management`, its contract and `execute`.
This plan designs the rule and gives the reset its verb, so no plan row is ever
hand-edited again.

## What changed

A tenth `plan-management` verb, `unclaim <folder>`: the reverse of `claim`, for
a claim whose run is gone. It runs in the main checkout on the integration
branch after `git pull --ff-only`, with `claim`'s own procedure; it refuses a
row that is not `RUNNING` in one line; it proves the run is gone by the absence
of the run's worktree from `git worktree list`, refusing while one exists and
naming `git worktree remove <path>` as the user's act of proof; it reports the
run's branch, when it exists, with the `git branch -D <branch>` line and never
deletes it; it shows what it found and asks once; then it resets the row's
`Status` cell `RUNNING` → `APPROVED`, and the folder's Status block only when it
does not already read `APPROVED`, and reports the commit for the caller —
`docs: plan queue — <folder> unclaimed`. The skill's "never does" list gains
"remove a worktree or delete a branch". The parked restyle rode along: an item
left `In progress`, not `In Progress`.

`/vwf:execute`'s three passages re-point at the verb: its two refusals — a
`RUNNING` row under an `APPROVED` folder, and a `RUNNING` requirement — name
`unclaim` instead of a hand reset, and the resume path in `blocking.md`, on
finding the worktree gone, offers to invoke `unclaim` and does so on a yes;
execute never runs it unprompted.

## Not a reversal

"A `RUNNING` row is never stolen" stands: `next` still never picks one and
`claim` still refuses one. `unclaim` releases a claim on the user's consent
after the proof; it never takes one.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **Liveness (1).** The run is proven gone when the worktree the folder's Status
  block names is absent from `git worktree list`. The verb refuses while it
  exists, naming `git worktree remove <path>` — a command git itself refuses on
  a dirty tree, so unfinished work is never lost silently. No new state, no
  heartbeat. Rejected: consent alone (a live run in another window gets its row
  pulled out from under it, and its landing `complete` finds `APPROVED`);
  worktree and branch both gone (deletes committed unit work).
- **The stale branch (2).** Reported, never touched: the branch and the
  `git branch -D <branch>` line, with the note that a fresh `/vwf:execute`
  refuses to cut a worktree over it until it is gone; the user decides whether
  the committed units are worth keeping. Rejected: offering to delete it — a
  destructive git action in a bookkeeping skill.
- **Where and what (3).** The main checkout on the integration branch after
  `git pull --ff-only`, `claim`'s procedure. The row's `Status` cell only, and
  the folder's Status block only when it does not already read `APPROVED` (at
  claim the block is edited in the worktree, so on the integration branch it
  usually still does). A row that is not `RUNNING` is refused in one line. The
  skill never commits; it reports `docs: plan queue — <folder> unclaimed` for
  the caller. Rejected: committing itself (decision 4 of 2026-09-18).
- **Consent (4).** The verb shows what it found — the worktree absent, the
  branch present or not, the Status detail line — and asks once before editing
  anything. Rejected: resetting on the prose ask alone.
- **Callers (5).** A session on the user's ask, like `archive` and `list`;
  `/vwf:execute`'s two refusals name the verb, and its resume path offers it
  when the worktree is gone and invokes it on a yes. Rejected: execute
  unclaiming on its own.

## Refined during execution

- **Same-row push conflict on unclaim.** The contract's push-rejection loop had
  two branches, a dropped claim and a landed completion, neither of which fit;
  an unclaim whose row changed under it — the run landed, or another session
  released it — restores the checkout and stops, and the user asks again after
  reading the queue.

## Consequence for a user

A dead session's row is released by asking the session to unclaim the folder,
never by editing the index. The worktree must be removed first — the verb names
the command and refuses until it is gone. The run's branch is reported with the
line that would delete it, and left for the user to keep or drop.

## Out of scope

- **A heartbeat or automatic staleness detection** — the worktree's absence is
  the one proof; no session writes a liveness timestamp.
- **Cross-session locking** — the index row is the lock, as it was.
- **Execute unclaiming on its own** — it offers the verb on the resume path and
  the user says yes.
- **Deleting the stale branch** — reported, never touched.
- **The GitLab backlog backend** — still parked from the 2026-09-18 plan.

## Parked

- **The diary checkpoint beside the run log.** The Stop hook fires mid-run, so a
  unit produces a diary entry on top of its run-log row. A later plan decides
  whether the hook stands down while a run is open. Parked since the deadlock
  plan (2026-09-15), carried through review-rows (2026-09-17) and
  plan-management (2026-09-18).
