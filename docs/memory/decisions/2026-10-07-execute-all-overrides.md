# Decision — /vwf:execute all asks its run-level questions once, as overrides for that run

**Date** 2026-10-07 · **Branch** `2026-10-07-execute-all-overrides` · **Plan**
[`docs/plans/2026-10-07-execute-all-overrides/`](../../plans/2026-10-07-execute-all-overrides/index.md)
· **Reverses** none · **Backlog** none

## What prompted it

With plan 2 landed ([`2026-10-07-execute-all.md`](./2026-10-07-execute-all.md)),
`/vwf:execute all` runs every runnable plan in its own runner, each exactly as
its folder records. Some questions are about the **run of several plans** — one
worktree or many, a step several plans record, a release, a plan recorded not to
merge — and no single folder can answer them.

This is plan 3 of a chain of three. It is not a reversal: the planners still
record every answer a single run needs, and execute still asks nothing at run
time, save these questions `all` asks once, before its first plan.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **The questions (O1).** Four, asked once before the first plan, one per turn,
  each a yes or no: one shared worktree; deduped after-landing steps; one
  release at the end; landing for each plan recorded `no`. Each is asked only
  when it applies to a plan the loop will reach; the shared-worktree one always.
  Rejected: fewer overrides.
- **Shared worktree (O2).** One worktree on branch `all-<date>-<HHMM>`, brought
  up to date from the integration branch before each plan; each plan lands in
  turn with "keep worktree"; the loop's exit removes it — except on a `STOPPED`
  end, whose resume runs in the worktree its status line names (G1). Rejected:
  one merge at the end.
- **Deduped steps (O3).** An identical after-landing step command recorded by
  several plans runs once, from the main checkout, after the last landed plan —
  on an early stop too; release steps are excluded. Rejected: running each
  plan's steps.
- **One release (O4).** Each distinct release step — anything that publishes: a
  tag, a package, a deploy, `/release` (G2) — a plan records `run` is held and
  runs once after the last plan; on an early stop every held release stays held
  and the exit lists it with its command. Rejected: running releases for the
  landed plans.
- **Landing override (O5).** Before the first plan, each plan the loop will
  reach that records merge `no` is listed, then asked one per turn: land it this
  run, yes or no. A no leaves it to stop at its landing, which ends the run.
  Rejected: none.
- **Where answers go (O6).** The answers are passed to each runner in its
  dispatch prompt as an `Overrides:` block and written as one `override:` row in
  each folder's Run log; a folder's Consent block is never changed. Rejected:
  writing them into the folders.
