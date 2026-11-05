# Blocking and resume

Read this when a unit returns `UNRESOLVED:`, fails its verification or dies, or when a run
starts against a `BLOCKED` or `RUNNING` plan.

Every mark below is one call that sets the unit's `status` in the folder's `index.json`, made
in the worktree:

    node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs set <folder>/index.json units.U<n>.status <status>

A unit entry has no detail field. A mark's detail rides the status line below, and the `detail`
of the mark's `row` event in the action log. Follow each mark, the resets of Resume steps 4 and 5
included, with one `log.mjs event row`, `{"unit", "wave", "status"}`. Follow each `append` to
`gaps` with one `log.mjs event gap`, per [the plan files](plan-files.md).

## Isolated versus all-blocking

A unit blocks when it returns `UNRESOLVED:`, when its agent errors twice, or when its own
Verification fails after the one mechanical re-dispatch below. A `GAP:` never blocks: it is a stated
assumption, appended to the `gaps` list of `index.json` and answered in the final report.

- **Isolated block.** Mark the unit `unresolved` or `failed`. Mark every unit that transitively
  depends on it `skipped`, with `depends on U<n>` as detail. **Continue** with every unit that does
  not. Later waves still run for their unblocked units, with these exceptions:
  - A skipped `review` row skips **every later `review` row** too, with `depends on <row>` as detail
    — rows review consecutive ranges and are never run out of order.
  - It also skips **every later `code` unit a later `review` row covers**, with
    `review row <row> skipped` as detail. A `code` unit never lands without its row ahead of it, and a
    commit between skipped rows would be swallowed as uncovered by the first row's range on resume, per
    [review-unit.md](review-unit.md).
  - The two fixed final units do **not** run while anything is skipped — docs reconciled against a
    half-landed change would describe a state that never existed.
- **All-blocking.** When every remaining unit is skipped, there is nothing left to run. Go straight to
  the final report.

Either way the run stops **once**, at the final report. It lists every ruling needed together, one per
blocked unit, specific enough that the answer is a sentence the user pastes into the plan, and the resume
command. The report asks nothing: never mid-wave, never "how should I proceed".

## The mechanical re-dispatch

If a unit's failure is inside its own scope and needs no ruling — a typo, a stale fold width, a grep check
it missed, a verification line it forgot to run — re-dispatch that unit alone, once, with the failure
appended to its prompt. A second failure blocks. Anything that would need a decision the unit file does not
carry is not mechanical, however small it looks.

## What the status line records

Write the block with `plan-management status <folder> BLOCKED "<detail>"` in the worktree, the detail being:

`BLOCKED at wave <n> — U<a> UNRESOLVED: <text>; U<b> failed: <gate line or agent died>; U<c>, U<d> skipped (depend on U<a>)`
plus the worktree path.

Each unit's `status` and `commit` in `index.json` carry the facts per unit. The status line is the summary a
reader sees first. The plan's row in the base repo's `docs/plans/index.json` is **not** updated on a block or a
pause. It stays `RUNNING`, the claim this session holds, and carries none of this detail. Only
`plan-management`'s `unclaim` releases the row, on the user's ask.

## Resume

A re-run against `BLOCKED` or `RUNNING`:

1. Confirm that the worktree in the status line exists. If it does not, the run cannot resume: report it and
   **stop**, with the row as it was. The report names the request the person makes to reset it, in prose to a
   session: `plan-management unclaim <folder>`, the verb in
   `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/SKILL.md`. That verb proves the worktree absent, never touches
   the run's branch, and resets the row and the folder's `status` to `APPROVED`. Then comes the fresh claim, a new
   `/vwf:execute <folder>`. Execute never invokes `unclaim` itself, and nothing takes a `RUNNING` row otherwise.
2. The index row stays `RUNNING` through the resume, and is not touched. A row found reading `APPROVED` was
   unclaimed, and the Resolve step claims it again before continuing.
3. Confirm that the ruling each `unresolved` unit asked for is now in its unit file or the `decisions` list of
   `index.json`. If the status line's `UNRESOLVED:` text still describes an unanswered question, stop and name it.
4. **The worktree is authoritative.** Read the units with the script above, `plan.mjs get <folder>/index.json units`.
   For every unit whose `status` is `green`, check that its `commit` exists on the branch.
   - Reset a `green` unit whose commit is absent to `pending`, and re-run it. The unit fields can be ahead of what
     landed if a session died between the report and the commit, and the committed tree is ground truth.
   - A `green` `review` row is exempt: its `commit` is empty by design, and it is skipped on its `status` alone, per
     [review-unit.md](review-unit.md).
   - The exception is a `code` or `edit` unit it covers that carries a `commit` that is **not an ancestor of** the row's
     `range.to`, the `to` its main loop recorded (`git merge-base --is-ancestor <commit> <to>` fails). That is a
     **pending late re-run**, run before continuing, per *Late loop-backs re-run the last row* there.
   - `index.json` holds no late loop's `to`, and the action log is never read to decide a resume. So a late re-run
     already done runs once more — a repeat, never a skip.
   - The test is by ancestry, never by recency, so a resume after a row's main loop that already reviewed the commit
     finds nothing pending. Each covered unit is tested **once**, whether the row's `depends_on` names it directly or
     reaches it transitively, so no unit counts twice.
5. Reset `unresolved`, `failed` and `skipped` units to `pending`, one `plan.mjs set` of `units.U<n>.status` each. A reset
   stamps nothing. The unit's next `running` clears its `ended` and keeps its first `started`, and a `failed` wave goes
   `running` again the same way when it re-runs, per [the plan files](plan-files.md).
6. Re-run the preflight, then continue from the first wave with a pending unit.
   - `review` rows run in `units` order, each ranged from the previous row in `units` order that reached `green`.
   - A plan-level stage whose entry in `stages` reads `green` or `skipped` already ran, and is not run again.
   - The `gaps` list and the action log's lines from the earlier attempt stay. A unit's `rounds` continues from the value
     recorded, so the final report shows the whole history.

The user edits the plan and re-runs `/vwf:execute <folder>`. Nothing else is needed to resume.
