# Blocking and resume (On failure, and Resolve and refuse early)

Read this when a unit returns `UNRESOLVED:`, fails its verification, dies, or
when a run starts against a `BLOCKED` or `RUNNING` plan.

Every mark below is one call that sets the unit's `status` in the folder's
`index.json`, made in the worktree:

    node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs set <folder>/index.json units.U<n>.status <status>

A unit entry has no detail field: a mark's detail rides the status line below
and the run journal (mempalace room `runs`, drawer `<plan folder>`). Each mark
— the resets of Resume step 4 and 5 included — is followed by one
`log.mjs event row`, `{"unit", "wave", "status"}`, and each `append` to
`gaps` by one `log.mjs event gap`, per *The plan files* in `SKILL.md`.

## Isolated versus all-blocking

A unit blocks when it returns `UNRESOLVED:`, when its agent errors twice, or
when its own Verification fails after the one mechanical re-dispatch below. A
`GAP:` never blocks — it is a stated assumption, appended to the `gaps` list
of `index.json` and answered in the final report.

- **Isolated block.** Mark the unit `unresolved` or `failed`, mark every unit
  that transitively depends on it `skipped` with `depends on U<n>` as detail,
  and **continue** with every unit that does not. Later waves still run for
  their unblocked units — except that a skipped `review` row skips **every
  later `review` row** too, with `depends on <row>` as detail — rows review
  consecutive ranges and are never run out of order — **and every later
  `code` unit a later `review` row covers**, with `review row <row> skipped`
  as detail: a `code` unit never lands without its row ahead of it, and a
  commit between skipped rows would be swallowed as uncovered by the first
  row's range on resume, per [review-unit.md](review-unit.md). The two fixed
  final units do **not** run
  while anything
  is skipped — docs reconciled against a half-landed change would describe a
  state that never existed.
- **All-blocking.** When every remaining unit is skipped, there is nothing left
  to run. Go straight to the final report.

Either way the run stops **once**, at the final report, with every ruling needed
listed together — one per blocked unit, specific enough that the answer is a
sentence the user pastes into the plan — and the resume command. The report
asks nothing: never mid-wave, never "how should I proceed".

## The mechanical re-dispatch

If a unit's failure is inside its own scope and needs no ruling — a typo, a
stale fold width, a grep check it missed, a verification line it forgot to run —
re-dispatch that unit alone, once, with the failure appended to its prompt. A
second failure blocks. Anything that would need a decision the unit file does
not carry is not mechanical, however small it looks.

## What the status line records

The block is written with
`plan-management status <folder> BLOCKED "<detail>"` in the worktree, the
detail being:

`BLOCKED at wave <n> — U<a> UNRESOLVED: <text>; U<b> failed: <gate line or
agent died>; U<c>, U<d> skipped (depend on U<a>)`
plus the worktree path.

Each unit's `status` and `commit` in `index.json` carry the facts per unit;
the status line is the summary a reader sees first. The plan's row in the base
repo's `docs/plans/index.json` is **not** updated on a block or a pause — it
stays `RUNNING`, the claim this session holds, and carries none of this
detail; the row is released only by `plan-management`'s `unclaim`, on the
user's ask.

## Resume

A re-run against `BLOCKED` or `RUNNING`:

1. Confirm the worktree in the status line exists. If it does not, the run
   cannot resume — report it and **stop**, with the row as it was. The report
   names the request the person makes to reset it, in prose to a session:
   `plan-management unclaim <folder>` — the verb in
   `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/SKILL.md`, which proves the
   worktree absent, never touches the run's branch, and resets the row and
   the folder's `status` to `APPROVED` — then the fresh claim, a new
   `/vwf:execute <folder>`. Execute never invokes `unclaim` itself; nothing
   takes a `RUNNING` row otherwise.
2. The index row stays `RUNNING` through the resume and is not touched. A row
   found reading `APPROVED` was unclaimed, and the Resolve step claims it
   again before continuing.
3. Confirm the ruling each `unresolved` unit asked for is now in its unit file
   or the `decisions` list of `index.json`. If the status line's
   `UNRESOLVED:` text still describes an unanswered question, stop and name
   it.
4. **The worktree is authoritative.** Read the units with the script above,
   `plan.mjs get <folder>/index.json units`. For every unit whose `status` is
   `green`, check its `commit` exists on the branch. A `green` unit whose
   commit is absent is reset to `pending` and re-run — the unit fields can be
   ahead of what landed if a session died between the report and the commit,
   and the committed tree is ground truth. A `green` `review` row is exempt:
   its `commit` is empty by design, and it is skipped on its `status` alone,
   per [review-unit.md](review-unit.md) — unless a `code` or `edit` unit it
   covers carries a `commit` that is **not an ancestor of** the `to` its
   last loop recorded — the row's `range.to` for its main loop, or the `to`
   the journal records for its last late loop, which `index.json` does not
   hold (`git merge-base --is-ancestor <commit> <to>` fails): that is a
   **pending late re-run**, run before continuing, per *Late loop-backs re-run
   the last row* there. With the journal unreachable the test reads
   `range.to` alone, so a late re-run already done runs once more — a repeat,
   never a skip. The test is by ancestry, never by recency, so a resume after
   a late re-run that already reviewed the commit finds nothing pending; and
   each covered unit is tested **once**, whether the row's `depends_on` names
   it directly or reaches it transitively, so no unit counts twice.
5. Reset `unresolved`, `failed` and `skipped` units to `pending`, one
   `plan.mjs set` of `units.U<n>.status` each.
6. Re-run the preflight, then continue from the first wave with a pending unit;
   `review` rows run in `units` order, each ranged from the previous row in
   `units` order that reached `green`. A plan-level stage whose entry in
   `stages` reads `green` or `skipped` already ran and is not run again.
   The `gaps` list and the journal records from the earlier attempt stay; a
   unit's `rounds` continues from the value recorded, so the final report
   shows the whole history.

The user edits the plan and re-runs `/vwf:execute <folder>`; nothing else
is needed to resume.
