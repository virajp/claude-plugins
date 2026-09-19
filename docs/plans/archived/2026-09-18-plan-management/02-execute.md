# U2 — `execute` calls the verbs

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/skills/execute/references/blocking.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom;
  `plugins/vwf/skills/plan-management/SKILL.md` (U1's, committed — the verbs you
  call and what each returns).
- **Lazy-load:** `plugins/vwf/skills/plan-management/references/plan-index.md`
  when a passage you are replacing cites a section of the old asset by name.

## Ruling

Decisions 4, 8, 9 and 11, quoted:

> **4.** The skill never commits; the caller does — `execute` keeps
> `docs: plan queue — <folder> running` and `… complete`.

> **8.** On `yes` with an empty gap list:
> `status <folder> COMPLETE <date,
> commits>` → `archive <folder>` in the
> worktree (moves, leaves `COMPLETE`, closes backlog ids, marks the mempalace
> drawer; edits no row) → the one final `docs:` commit → merge →
> `complete <folder>` in the main checkout (row `COMPLETE`, `Folder` re-pointed,
> sweep). With a gap open, or on `no`: `status` only, the folder stays live.

> **9.** Gap-kept, hand-merged and never-run folders are retired when a user
> asks in prose; the session invokes `archive <folder>` in the main checkout,
> which then also applies the row edit and sweep, and commits via git-workflow
> as `docs: archive plan <name>`.

> **11.** U1 lands alone in wave 1 so the references path exists before U2/U3
> cite it.

## Edits

Every citation of `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` in the owned
files (`SKILL.md:77,90,185,319,747` at survey time) becomes
`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`, and
every procedure `execute` performs on the index or the Status block becomes an
invocation of the verb — the skill is invoked as `plan-management <verb> …`, the
way `execute` already invokes `/vwf:backlog done <ids>` and `/vwf:git-workflow`.
The prose keeps saying **what** happens and **which commit carries it**; it
stops saying **how** the row or block is edited.

1. **`SKILL.md:11-17`** (description) — the claim and the `next` read are still
   described, now "through `plan-management`".
2. **`SKILL.md:75-84`** (`next` mode) — invoke `plan-management next`; run what
   it returns, or stop with its nothing-runnable message.
3. **`SKILL.md:86-157`** (finding the plan, the refusals, `requires:`) — the
   folder and row reads stay `execute`'s to describe, but the resolution at
   `:117-136` becomes `plan-management resolve <folder>`; the refusals on a
   `DRAFT`/`COMPLETE` Status, a missing or `RUNNING` row, and the resume path
   are unchanged in behaviour.
4. **`SKILL.md:182-196`** (the claim) — `plan-management claim <folder>`, then
   the `docs: plan queue — <folder> running` commit and push, exactly as now, in
   the main checkout.
5. **`SKILL.md:197-205`** (Status → `RUNNING`) —
   `plan-management status
   <folder> RUNNING "RUNNING since <ts> in <worktree>"`,
   in the worktree.
6. **`SKILL.md:392-395`** (paused) — the same verb with the paused detail.
7. **`SKILL.md:727-736`** (Land steps 2–3) — rewrite to decision 8's sequence:
   step 2 is `status … COMPLETE …` on `yes` (or
   `RUNNING — ready to
   land by hand on <branch>` on `no`); step 3, on `yes`
   with an **empty** gap list, `plan-management archive <folder>` — which moves
   the folder, closes the backlog ids and marks the drawer, so the separate
   `/vwf:backlog done` call at `:734-735` is made only on the paths where
   `archive` is **not** invoked (an open gap, or `no`); then the one final
   `docs:` commit in the worktree, as now.
8. **`SKILL.md:745-756`** (after the merge) —
   `plan-management complete
   <folder>` in the main checkout, then the
   `docs: plan queue — <folder>
   complete` commit; the re-pointing and the
   sweep are the verb's, so the parenthetical describing them shrinks to a
   citation.
9. **`SKILL.md:757-760`** (`no`) — the row stays `RUNNING` until the hand merge
   is followed by asking the session to archive the folder, which runs `archive`
   in the main checkout and applies the same row edit. No `/vwf:archive`.
10. **`SKILL.md:783-785`** (gap reconciliation) — "retired by asking the session
    to archive it — `plan-management archive <folder>`, which the user reaches
    in prose, never by a typed command".
11. **`SKILL.md:786-791`** (chain forward) — the scan of `Requires` may stay a
    read, or call `list`; either way cite the references path, not the asset.
12. **`SKILL.md:865-868`** ("never does") — keep the two rules, restated as:
    never edits the index or a Status block itself — every such edit is a
    `plan-management` verb — and never takes a `RUNNING` row.
13. **`references/blocking.md:4,45-52`** — the `BLOCKED` write becomes
    `plan-management status <folder> BLOCKED "<detail>"`; `:56-65` (the hand
    reset) stays a hand edit and gains one sentence: the `unclaim` verb that
    would replace it is backlog B12.
14. Any other `/vwf:archive` or `assets/plan-index.md` the grep in Verification
    finds inside the owned files.

## Verification

- `grep -n 'vwf:archive\|assets/plan-index' plugins/vwf/skills/execute/` returns
  nothing.
- `grep -c 'plan-management' plugins/vwf/skills/execute/SKILL.md` ≥ 8 — one per
  verb site listed above.
- `mise run p:plugins:check` green (every
  `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`
  citation resolves — U1 is committed).
- `mise run code:precommit` green.

## Guardrails

- Touch nothing outside the two owned files — not `skills/plan-management/`, not
  the assets, not `skills/archive/` (still present; U5 deletes it).
- Do not restate a verb's procedure in `execute`; cite the verb. The point of
  the plan is one implementation.
- `plugins/**/*.md` is not dprint-formatted — fold by hand at the neighbouring
  width.
- No escaped backtick inside a code span; no table cell ending in a bare `*`.
- Delete nothing; `rm` nothing.

## Commit

`refactor: execute — the plan index, the Status block and the archive through plan-management`
— written by the orchestrator after the wave gate. `refactor` is in
`.config/git-conventional-commits.yaml`.
