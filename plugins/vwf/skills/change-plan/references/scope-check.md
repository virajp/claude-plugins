# §2 — Scope check

When the request is really several independent pieces — two trees with no shared
ruling, a doctrine change plus an unrelated tooling fix — say so before refining
anything. Decompose it, agree the order, and plan one folder per piece, each
through this whole procedure. One plan never swallows another.

- A later piece that stands on an earlier one names it in its `index.json`
  `requires` list. `/vwf:execute` halts until every required plan reads
  `COMPLETE`.
- Plan the pieces one after another in this session. Each runs §3 to §8.
- §8's ending for a piece that is not the last goes straight back to §3 for the
  next piece. Print no launch block until the last one is planned.

## Parking

An answer mid-interview that raises something outside this plan's scope is
parked durably. Acknowledge it, and write a `docs/memory/gaps/` record at once,
per the parked-scope rule in `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, with enough
to pick it up later. Do not widen the plan. §6 also writes it to the *Parked*
list of the plan's `index.md`. Parked items are the first thing the next plan's
recall reads.

A Parked entry that belongs to a backlog item begins with its id:
`- Bnn: <piece>`. A plan that lands one piece of an item writes what remains
that way, at least one line per `backlog_pieces` id, naming the chained folder
where one already covers the piece.
