# One `review` row (the Waves section)

Read this when a wave holds a `review` row. A review row is the only place the
two review engines and the two reviewers run: no `code` unit triggers a review
by itself, and the orchestrator infers no row — it runs what the Units table
writes, and preflight has already refused a plan whose `code` units no row
covers. A row is dispatched in wave order like any unit, after every unit its
Depends on names is done, and never concurrently with a `code` unit's pipeline.
The stage table, the dispatch contracts and the shared stage rules are
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
   previous `review` row that reached `green`, else the branch base — the
   integration branch's tip the worktree was cut from — to `HEAD`. Record the
   range (`<from>..<to>`) and the file list `git diff --name-only <from>..<to>`
   yields in the row's first Run log row; the file list is what the reviewers
   receive as their scope, never a unit. A file in the range that the row's
   Scope section does not name is still in the row's scope: the range is the
   contract, the section its description. Preflight guarantees the range and
   the coverage agree: the row sits in a later wave than every unit it covers,
   so each is committed before the row runs, and its Depends on names every
   `code` unit in an earlier wave that no earlier row named, so no covered
   commit is reviewed by a row that does not own its unit.
2. **engines** — in **one message**, invoke `/code-review` at high effort and
   `/security-review` over that range through the `Skill` tool. Each may run as
   a background task; note the task each reports. Wait on each with
   `TaskOutput`, blocking, up to 30 minutes from invocation. An engine that
   errors or times out is stopped with `TaskStop` and counted unavailable, with
   the reason kept for the prompt.
3. **reviewers** — in **one message**, dispatch `execute-code-reviewer` and
   `execute-security-reviewer` so both run at once, per the two dispatch
   contracts in `execute-stages.md`: the row id, the round number, the plan
   folder path, the range and the file list as the scope, the unit files —
   with their Owns — of every unit the row **covers**, which is every unit its
   Depends on names directly or transitively through the units they name, the
   same set preflight counted — the rulings the code is reviewed against, and
   what lets a reviewer label each finding with the unit whose Owns holds its
   file — the wing and the resolved stack. Each dispatch prompt ends with a
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
   names a file and is labelled `(<unit>)` — the unit whose Owns holds that
   file, which the reviewers resolved from the unit files they were handed;
   the orchestrator checks the label against the Owns lists it holds. For each
   unit named, re-dispatch it **by its Kind**, one dispatch per unit, the units
   serially in wave order, each re-committed per the staging discipline: a
   `code` unit's coder in fix-first mode, per the `code` contract in
   `execute-stages.md`, with the two recall **tags** and its own unit id — the
   coder recalls the drawers and fixes only the findings labelled with its id;
   an `edit` unit — a change plan may place a row over `edit` units — per
   [edit-unit.md](edit-unit.md)'s loop-back, the same prompt plus the finding
   lines labelled with its id, no tag and no stack. Then repeat the row
   **in full, engines first** — steps 2 and 3 over the same range, extended to
   the new `HEAD`. Merging the two reviewers' findings into one fix pass is
   what keeps the two stages from rewriting each other's lines. Gating is
   per-stage and unchanged: every security finding and every `[breaking-api]`
   finding **must** be fixed (cap-exempt); other review findings loop under
   `pipeline.review_round_cap` (residuals after the cap → documented as gaps,
   marked `contested`). A round counts once, even though it ran two reviewers
   and may have re-dispatched several coders. Before each new round, apply the
   **convergence guard** in `execute-stages.md` — the `contested` exit and the
   cap-exempt pause apply to the row exactly as they applied to a unit. A
   finding on a file **no unit owns** does not loop: it is the orchestrator's
   `GAP:` line in the row's Run log row, with the file and the finding, and the
   final report lists it.
5. **gaps** — any reviewer's gap pointer → mirror into the "Gaps surfaced
   during execution" section of the folder's `index.md` and file to mempalace
   room `gaps`. Decide blocking vs non-blocking and act per the rules.
6. **journal** — fill the row's Units table cell: Status `green` when the last
   round is clean **and** when the loop ended at the cap or the convergence
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
   the round count is the row count and a skip carries its `why`. Recall tags
   are `<row-id>/review/<round>` and `<row-id>/security/<round>`, and the
   drawer's `source_file` is the plan folder path — row ids repeat across
   plans filed to one wing, so every recall of a tag filters on it.

## Late loop-backs re-run the last row

A fix that lands **after the last `review` row covering its unit** — the wave
review's loop-back to a `code` unit in the row's own wave (the wave review
runs after the row), an acceptance or UX loop-back after all units, or a
fix-first loop-back at the final report — is code no engine or reviewer has
seen. Before the run proceeds past it, that row is **re-run in full over the
fix delta** — the range from the row's last green `HEAD` to the new `HEAD`,
engines first, both reviewers, steps 2-4 and 6 — as a further round of the
row under its cap and guard. The re-run is a Run log row per node like any
round. `code-unit.md`, `edit-unit.md` and the Waves and Acceptance sections of
`SKILL.md` cite this rule rather than restate it.

What the row never does: edit a file, stage a path, or commit — a review row
that has to change something has a coder do it, under the unit that owns the
file. It never widens its own range past `HEAD`, and never reviews a unit that
is not in the range — a unit the next row covers waits for the next row.
