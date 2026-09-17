# Decision — an after-landing step runs on the consent the plan recorded

**Date** 2026-09-17 · **Branch** `2026-09-17-review-rows` · **Plan**
[`docs/plans/2026-09-17-review-rows/`](../../plans/2026-09-17-review-rows/index.md)
· **Reverses** the after-landing clause of
[`2026-09-16-one-executor.md`](./2026-09-16-one-executor.md) — "stops once
before every after-landing step"; the `run` mode that plan retired is back — and
the standing rule that merge, push and release need in-the-moment consent ·
**Backlog** none

## What prompted it

The one-executor plan of 2026-09-16 made every after-landing step an `ask`: the
executor stopped once before each and a `run` in an older folder was read as
`ask`. Planning the review-rows change, the user ruled that the consent belongs
at the interview, in the user's words:

> This step must be asked during planning itself and recorded in the plan. This
> way if execution is green, it can be landed in local or staging or production.

A plan is approved by a person at its interview; the After landing table is part
of what they approve. Asking again at landing was a second gate on a decision
already taken, and it blocked the unattended run the executor exists to be.

## What changed

Each after-landing step carries `run` or `ask`, decided at interview item 17 and
written to the folder's After landing table. On a green landing `/vwf:execute`
runs every `run` step in table order without a prompt — the `run` recorded in
the folder is its authorisation — and stops once before each `ask` step. A
release step may be recorded `run`; the interview's release question is the ask.
A table with no Mode column or an unknown mode is refused at preflight. When the
landing was **not** consented, only the steps whose Notes say they may run from
the worktree are offered, every one as an `ask` — a `run` was consented for a
green landing and this is not one. `CLAUDE.md`'s "ALWAYS ask user before running
`p:plugins:release` …" rule gains the one exception.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **After-landing mode (8).** Reversal. Each step carries `run` or `ask`,
  decided at interview item 17 and written to the After landing table. On a
  green landing execute runs every `run` step in order without a prompt and
  stops once before each `ask` step. A `run` in a folder is authorisation; the
  "read as `ask`" clause goes. Rejected: ask-only with `run` retired — the
  2026-09-16 ruling.
- **Release steps under `run` (9).** A release step may be recorded `run`: the
  interview's release question (item 18) is the ask. `CLAUDE.md`'s hard rule
  gains that one exception — a plan whose After landing table records the
  release as `run`, consented at its interview. Rejected: release always asked
  in the moment.
- **This plan's own consent (11).** No review row (every unit `edit`, markdown
  only); `mise run p:plugins:local` as `run`; vwf minor, site patch; no release.
  Rejected: a release now.

## Caveat

The executor that ran this plan predates ruling 8 and read the folder's `run` as
`ask`, so it stopped once before `mise run p:plugins:local`. The next plan is
the first whose `run` steps run unprompted.
