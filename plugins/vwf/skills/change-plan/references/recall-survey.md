# §1 — Recall, then survey

## Recall first

Before asking anything, read what is already decided:

- `docs/memory/decisions/` — any doc touching the trees the request names.
- The last plan in `docs/plans/archived/` that touched the same tree. It is a
  folder or, before 2026-09-16, a single `.md` file, the shape cycle plans had
  until then. Read its *Out of scope* and *Parked* from `index.md`, and its
  `gaps` list from `index.json`. An old-format folder, with an `index.md` and no
  `index.json`, carries all three in its `index.md`, the gaps in its *Run log*
  and its gaps section. The request is often one of those items coming due, and
  a gap the last run surfaced is a fact.
- The backlog, through `/vwf:backlog list` — the prioritised list of work that
  cannot be picked up now, a project on the base repo's forge.
  - It is product-level: a session in a member repo reads the base's project,
    resolved from the base's remote, never one of its own.
  - When the verb reports it unreadable — `gh` absent, unauthenticated or
    without the `project` scope, or no project yet — record that with its reason
    in the facts, and continue with nothing.
  - The request is often one of its items. Note every id it covers, and for each
    whether this plan finishes the item or lands one piece of it. Interview item
    2a settles that, so `index.json` can carry the id on the right list.
  - Every id noted here is a **source** id, recorded on the `index.json`
    `source` list — the executor can then tell a plan made for an item from one
    made for none.
  - The same read tells the interview which items share the plan's priority,
    which §8's check counts before it recommends `/vwf:execute`.
- The base repo's `docs/plans/index.json` — the plan index, the one file where
  every active plan of either kind, its status and its priority live. Read it
  with
  `node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs get docs/plans/index.json plans`.
  - `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md` is
    the shape.
  - Like the backlog it is the base's alone, read from a member repo and never
    duplicated there.
  - The `priority` key of the rows a new plan will require, of either kind, is
    what §5's derived priority stands on.
  - A row whose `gaps.open` is above `0` is a landed plan with gaps that no plan
    took yet. A request that takes them puts its folder on `gaps_of` — interview
    item 2b.
- The `docs/memory/decisions/` and `docs/memory/gaps/` folders, by the recall
  rule of `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`. Skip silently when a folder
  is absent.

A standing decision the request contradicts is a **reversal**. Name it as one in
the interview, never as a fresh choice.

## Survey second

Dispatch **Explore** subagents, concurrently in one message, to map for the
request:

- The trees the change touches, and the project of each. Read the registry
  `docs/blueprint/registry.yaml` when the repo has one. Otherwise take the
  repo's top-level directories as the projects.
- The gates that already cover those trees: the task runner's list
  (`mise tasks`), the `harness:` stamp in `.config/vwf.yaml` when one is stamped
  (`${CLAUDE_PLUGIN_ROOT}/assets/harness.md` is the vocabulary), and the CI
  workflow files.
- The docs that describe the current behaviour: the README, `CLAUDE.md`,
  `docs/`, and any per-project README or home doc.
- The third-party dependencies each tree already has — a unit can then reuse
  before adding.
- The repo's commit convention: `.config/git-conventional-commits.yaml` where
  the repo has one, else whatever its commit-message gate reads. Every unit
  file's `## Commit` line then carries a type, and a scope, that gate accepts. A
  repo with no convention file takes git-workflow's common types: `feat`, `fix`,
  `perf`, `refactor`, `revert`, `test`, `ops`, `docs`, `merge`, `wip`.
- When the request retires or renames a name, the name itself, grepped across
  every tree the repo has: `.claude/`, `installer/`, `site/src/content/docs/`,
  `plugins/`, the root docs. Every hit is a passage the change falsifies, and
  needs an owner in some unit's `owns` before the plan is written — the three
  plans that skipped this left the docs unit inheriting nobody-owned passages at
  run time.

Instruct every Explore agent to return conclusions and `file:line` pointers
only, never file contents, diffs or directory dumps. Hold the findings: they
ground the questions and become the plan's facts section. Leave the files unread
yourself — the survey keeps the orchestrator context small, and the same rule
binds `/vwf:execute`.
