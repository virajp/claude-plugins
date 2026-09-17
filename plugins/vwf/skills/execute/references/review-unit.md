# One `review` row (the Waves section)

Read this when a wave holds a `review` row. A review row is the only place the
two review engines and the two reviewers run: no `code` unit triggers a review
by itself, and the orchestrator infers no row — it runs what the Units table
writes, and preflight has already refused a plan whose `code` units no row
covers. A row runs **first in its wave**, before any `edit` or `code` unit of
that wave is dispatched, so the engines see a committed tree and nothing in
flight — every unit it covers is in an earlier wave, which preflight
guaranteed — and never concurrently with a `code` unit's pipeline. The stage
table, the dispatch contracts and the shared stage rules are
`${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`; this file is the loop that
runs them over the row.

The row's unit file, `NN-review.md`, carries only the header lines and a
**Scope** section naming what it reviews. Its Owns is `—`: the row edits
nothing, commits nothing and stages nothing. The fix commits a round produces
belong to the units fixed.

For the row (skip it when the folder's Run log already shows it `green` — its
last round clean, or ended at the cap or the guard with its residuals recorded
`contested`):

1. **scope** — compute the range the row reviews: the branch delta since the
   previous `review` row **in table order** that reached `green` — the `to`
   the last round of its **main loop** recorded; a late re-run never advances
   a row's recorded `to`, so nothing landed between that loop and a re-run is
   skipped — else the branch base, the integration branch's tip the worktree
   was cut from — to `HEAD`. Rows never run out of order: a skipped row skips
   every later row too, per [blocking.md](blocking.md). The row's **file
   list** is every file `git diff --name-only <from>..<to>` yields, each
   mapped to **the unit whose commit last touched it inside the range**. The
   commit → unit map is built **once, over the whole branch** (`<base>..HEAD`)
   and used everywhere — the range bounds which files the row scopes, never
   the map: every commit on the branch from the Units table's Commit cells
   **and** every Run log row's Commit cell — a fix commit is one unit's row —
   so a late re-run's map is as full as the main loop's; a commit in neither
   is the orchestrator's own folder commit, touches only `docs/plans/`, and is
   excluded. The map is unambiguous and never read from Owns, and the
   reviewers receive it. **The one rule for a finding on a file whose unit
   the row does not cover** — a change plan's row covers only the units
   landing runnable code: a **security** finding is never dropped or deferred
   — it routes to that unit all the same, and the round's Run log row records
   the coverage widened to it; a **non-security** finding is dropped with the
   dropped-count clause. Record the range (`<from>..<to>`), the file list and
   its unit map in the row's Run log row — **every round records its own
   `from..to`**, since `to` grows as fixes land, and the next row's `from` and
   a resume read the main loop's last `to`. The file list and its map are what
   the reviewers receive as their scope, never a unit. A file in the list that
   the row's Scope section does not name is still in scope: the list is the
   contract, the section its description. Preflight guarantees the range and
   the coverage agree: the row sits in a later wave than every unit it covers
   — directly or transitively via Depends on — so each is committed before the
   row runs, and it covers every `code` unit in an earlier wave that no
   earlier row covers, so no covered commit is reviewed by a row that does not
   cover its unit.
2. **engines** — in **one message**, invoke `/code-review` at high effort and
   `/security-review` through the `Skill` tool. The engines are
   **branch-scoped**, not range-scoped: `/code-review` takes the branch,
   `/security-review` takes no target, and each reads the whole branch delta.
   Each may run as a background task; note the task each reports. Wait on each
   with `TaskOutput`, blocking, up to 30 minutes from invocation. An engine
   that errors or times out is stopped with `TaskStop` and counted
   unavailable, with the reason kept for the prompt. Record each engine's
   output in the run journal (room `runs`, drawer `<plan folder>`) under the
   row and round, then **filter** it: a finding on a file in the row's file
   list is kept; a finding on a file **outside the range** is kept too —
   an in-range change can break a caller the range does not touch — **unless
   the same finding (path, line, text) appeared in the recorded engine output
   of a previous row or this row's earlier loop**, in which case it is that
   loop's and is dropped, said in one clause of the row's Run log row,
   "n engine findings already reported by <row> dropped". A kept out-of-range
   finding maps through the one branch-wide map: to the unit whose commit
   last touched that file on the branch, covered or not; when no branch
   commit touched it, to the unit whose in-range change the engine or
   reviewer names as the cause; when none is named, to the unit that last
   touched the in-range file the finding cites; and when still nothing, it is
   recorded `contested` with `unmapped` in Detail — never silently dropped.
   The one rule of step 1 then applies to a mapped finding in step 4 like any
   other. Hand the reviewers the filtered output. The one rule is not applied
   here: the reviewers report every finding in full, and the orchestrator
   applies it in step 4.
3. **reviewers** — in **one message**, dispatch `execute-code-reviewer` and
   `execute-security-reviewer` so both run at once, per the two dispatch
   contracts in `execute-stages.md`: the row id, the round number, the plan
   folder path, the range and the file list as the scope, the unit files —
   with their Owns — of every unit the row **covers**, which is every unit its
   Depends on names directly or transitively through the units they name, the
   same set preflight counted — the rulings the code is reviewed against — the
   file list's unit map, which is what lets a reviewer label each finding with
   the unit whose commit last touched its file — the wing, and, when a unit
   the row covers is `code`, the resolved
   stack with its `conventions:` prose (Setup step 3 fetched it only then) and
   the registry (`docs/blueprint/registry.yaml`, for the security reviewer's
   capabilities and threat notes); a row covering `edit` units alone passes
   none of these, and the reviewers review against the unit files and rulings
   alone. Each dispatch prompt ends with a
   section headed
   `## Engine` holding either that engine's output verbatim or the single line
   `ENGINE: unavailable — <reason>`. They are independent read-only passes over
   the same range; neither reads the other's output, so serializing them only
   costs wall-clock. Each reviewer returns exactly one block — `REVIEW:` or
   `SECURITY:`. A return without it is an error under the "Subagent death"
   pause rule: re-dispatch once; twice in a row on one row → record `blocked`,
   pause.

   The reviewers run no engine, so the orchestrator never waits for a
   notification on a reviewer's behalf and never sends a reviewer a message to
   finish its block — the only thing it waits for from a reviewer is its
   return.
4. **the loop** — merge the two returns into one findings set. Every finding
   names a file and is labelled `(<unit>)` — the unit whose commit last
   touched that file in the range, read off the unit map the reviewers were
   handed; the orchestrator checks the label against the same map, then
   applies the one rule of step 1 to every finding whose unit the row does not
   cover — security routed to that unit with the widening recorded,
   non-security dropped with the dropped-count clause, "n findings on
   uncovered units dropped", on the round's Run log row. For each unit
   remaining, re-dispatch it **by its Kind**, one dispatch per unit, the units
   serially in wave order, each re-committed per the staging discipline: a
   `code` unit's coder in fix-first mode, per the `code` contract in
   `execute-stages.md`, with the two recall **tags** and its own unit id — the
   coder recalls the drawers and fixes only the findings labelled with its id;
   an `edit` unit — a change plan may place a row over `edit` units — per
   [edit-unit.md](edit-unit.md)'s loop-back, the same prompt plus the finding
   lines labelled with its id, no tag and no stack. Then repeat the row
   **in full, engines first** — steps 1 to 3, the range's `from` unchanged and
   its `to` extended to the new `HEAD`, recorded on the round's own row.
   Merging the two
   reviewers' findings into one fix pass is
   what keeps the two stages from rewriting each other's lines. Gating is
   per-stage and unchanged: every security finding and every `[breaking-api]`
   finding **must** be fixed (cap-exempt); other review findings loop under
   `pipeline.review_round_cap` (residuals after the cap → documented as gaps,
   marked `contested`). A round counts once, even though it ran two reviewers
   and may have re-dispatched several units. Before each new round, apply the
   **convergence guard** in `execute-stages.md` — the `contested` exit and the
   cap-exempt pause apply to the row exactly as they applied to a unit. The
   guard ignores a kept out-of-range finding a previous row or this row's
   earlier loop marked `contested`: it is that loop's residual, not this
   loop's oscillation.
5. **gaps** — any reviewer's gap pointer → mirror into the "Gaps surfaced
   during execution" section of the folder's `index.md` and file to mempalace
   room `gaps`. Decide blocking vs non-blocking and act per the rules.
6. **journal** — fill the row's Units table cell: Status `green` when the last
   round is clean, **or** when the loop ended at the cap or the convergence
   guard with its residuals recorded `contested` — contested findings never
   block, per the Autonomous Rules, so the row is done, the next row's range
   starts after it, and a resume skips it; `blocked` / `failed` per the rules.
   The Commit cell stays empty — the row has no commit of its own, and the
   folder's edits ride the commit that closes the wave. The **Run log rows**
   are written **as each node
   returns**, not batched here: one `review` row and one `security` row per
   round, each carrying the row id in the unit cell and the row's wave in the
   wave cell (`Wave | Unit | Model | Round | Outcome | Detail | Commit`), plus
   one `code` row per coder re-dispatched with its fix commit, appended to the
   folder's `index.md` and mirrored to the journal before the next dispatch, so
   the round count is **per loop**: the main loop's highest `Round` value, and
   each late re-run's own highest, reported beside it as `re-run n: m rounds`
   — never the row count, since one round writes several — and the
   convergence guard compares rows within one loop only. A skip carries its
   `why`.
   Recall tags
   are `<row-id>/review/<round>` and `<row-id>/security/<round>`, and the
   drawer's `source_file` is the plan folder path — row ids repeat across
   plans filed to one wing, so every recall of a tag filters on it.

## Late loop-backs re-run the last row

A fix that lands **after the last `review` row covering its unit** — the wave
review of the row's own wave, or the acceptance or UX pass after all units, or
a fix-first loop-back at the final report, looping back to an earlier-wave
unit that row covers, of either Kind — is code no engine or reviewer has
seen. Before the run proceeds past it, that row is **re-run in full over the
fix delta** — the loop-back's own fix commits and nothing later. The re-run's
range is its own: `from` is the parent of its first fix commit, `to` the
newest fix commit of its latest round, and a round after the first extends
`to` only; the file list and unit map come from that range as in step 1. Then
engines first, both reviewers, steps 2-6. The re-run is a **new loop** over
its own range, not a further round of the finished one: its rounds restart at
1 — the Run log rows say `re-run n` in Detail — the convergence guard's
baseline is the re-run's own round 1, and `pipeline.review_round_cap` applies
to it afresh. The re-run is a Run log row per node like any round, and its
rows record their own `from..to` without advancing the row's recorded `to` —
the next row's `from` is the `to` of this row's main loop. After the re-run,
the wave review runs once more over the re-run's fix commits, counted against
its two-round cap, then the gate.
`code-unit.md`, `edit-unit.md` and the Waves and Acceptance sections of
`SKILL.md` cite this rule rather than restate it.

What the row never does: edit a file, stage a path, or commit — a review row
that has to change something re-dispatches the unit whose commit last touched
the file. It never widens its own range past `HEAD`, and never reviews a unit that
is not in the range — a unit the next row covers waits for the next row.
