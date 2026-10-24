# Decision — the progress pane follows every unit, and its review defects are fixed

**Date** 2026-10-21 · **Branch** `2026-10-21-execute-monitor-gap-fixes` ·
**Plan** `docs/plans/2026-10-21-execute-monitor-gap-fixes/`

## What it closes

The two open gaps of `docs/plans/2026-10-21-execute-monitor-in-vwf`: the pane
followed only `vwf:execute-*` subagents, so it could not follow a plan made only
of `edit` units, and the defects its review found, carried over from the
prototype. No standing decision is reversed: that plan's decision 6 only scoped
it to a move, and `2026-10-21-execute-monitor-inside-vwf.md` listed these as
known limits. That dated doc stays as written.

## The decisions

**Matching (D1).** Follow an agent when its `name` is a unit id of the current
plan (`U<n>`) or a wave-review name (`R<wave>`, `R<wave>-late`, `R-late`), or
its type starts with `vwf:execute-`, the runner excepted. Map it to a unit by
its name; a coder by the unit file in its prompt; a review-row reviewer by the
row id in its prompt, read before any file name, so a reviewer never counts
against the units it covers. Never adopt an agent of an earlier plan of an `all`
run. Rejected: follow any subagent while a run is live.

**Wave reviews (D2).** One line per wave review under the unit rows — status,
start, end, time — that opens its transcript like a unit row. Rejected: wave
reviews not shown.

**Run end (D3).** The run ends when the plan's Status reads `COMPLETE` or
`BLOCKED`, or the folder moved to `docs/plans/archived/`. A main-loop turn that
ends with no live agent only marks the run waiting; the pane ends the run after
10 minutes with no change in the plan file or the agents. Rejected: the
main-turn rule, fixed.

**Seven small fixes (D4).** The refresh merges into the current state inside the
`update` callback, and `turn.complete` goes through `poke`; an agent seen before
and missing from `agent.list` is `completed`, ended now; the known `index.md`
path is kept while it exists, searched for only when gone; an `isOpen` state
gates the compact tool rows, and `AskUserQuestion` reopens only a pane it
closed; `tool.call` no longer awaits `poke`; the row id is read before the file
name; escaped pipes in table cells split correctly. Rejected: park some.

**Several RUNNING rows (D5).** With no folder named and several `RUNNING` rows,
prefer the row whose `index.md` is in this session's checkout or one of its
worktrees; otherwise set a problem that asks for `/vwf-monitor <folder>`; a
guessed pick re-resolves. Rejected: the first row.

**Member repos (D6).** Resolve the base repo per `membership.md`, read the plan
index there, and search the base, each `members:` `path:` and their worktrees,
with a small line reader and no YAML library. Rejected: park the member-repo
search.

**Timer (D7).** The 3-second timer runs only while a run is live. Rejected: a
timer in every vwf session.

**Known index.md (D12).** D4's known `index.md` is kept only while no linked
worktree for the run exists. A main-checkout copy is known until then; once the
run's worktree exists, its copy replaces the main-checkout copy on the next
refresh. Rejected: the main-checkout copy stays known. Recording the worktree
and log paths in the plan frontmatter at the claim is a later plan's.
