DECISION 2026-11-01 ★3 | mempalace and graphify removal | rulings D5 to D20 and
the run gaps that the main record leaves to the plan folder — agents return
palace-bound findings in their report, the migration is offered by state at any
stamp | alt two chained plans, a stamp held at 23, and a suffix-free overwrite
rejected

**Source plan** `2026-11-01-remove-mempalace-graphify` (main record:
`2026-11-01-remove-mempalace-graphify`).

Rulings and the reason for each:

- Agents lose the palace tools. A finding that went to the palace now comes
  back as a line in the agent's report, and the orchestrator records it in the
  plan's `index.json`. Gaps a run finds go to `index.json` only.
  `docs/memory/gaps/`
  holds gaps found outside a run: blueprint, verify, feedback. Rejected: write
  to both.
- One plan, not two chained plans (mempalace first). The units split by file
  area, with one review unit after wave 1.
- `config_format` 24 always applies. A declined removal row stays, doctor
  reports it as drift, and the step does not ask again. Rejected: hold the
  stamp at 23 until every row is applied.
- The removal rows are offered by state at any stamp, not only at stamp 23.
  The stamp still moves one step at a time. Rejected: only stamp 23.
- A record whose file name exists takes the suffix `-2`, then `-3`. A
  handoff of an existing name replaces it. Rejected: overwrite a record.
- Delete order trap: `p:plugins:check` refuses a citation of a missing file.
  `assets/graphify.md` is deleted in the last wave, after every unit that cites
  it has committed. A wave 1 delete fails the pre-commit check.
- The gates unit edits `plugin.json` and runs `p:plugins:marketplace`, so
  one commit holds both. A unit runs no generator.
- The checker no longer reads `OWN_HOOKS_DIR` in tool-config setup. Only the
  removed graphify code read it.

Gap rulings (user, 2026-11-05):

- Where the base-repo walk ends at "not a vwf repo", handoff and recall use
  that repo's main checkout as the root.
- Doctor's Leftovers rule covers the base and each locally present member. The
  `docs/memory/` ignore line is drift and never blocks.
- A `graphify-out/` directory stays unignored in the plugin. Bootstrap ignores
  it, and doctor Leftovers reports it. An ignore line that names graphify
  breaks D1.
