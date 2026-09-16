# One `code` unit (the Waves section)

Read this when a wave holds a `code` unit. Each `code` unit in the wave runs
this pipeline **one at a time**, after the wave's `edit` units have returned —
engines and reviewers never overlap across units. The stage table, the
per-stage dispatch contracts and the shared stage rules are
`${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`; this file is the loop that
runs them.

For the unit (skip it when the folder's Run log already shows it done — its
`code` node carries a commit and its reviewers' last round is clean):

1. **recall** — before dispatching, `mempalace_search` the wing scoped to this
   unit's slice across rooms `decisions`, `problems`, `gaps`, and `runs` (limit
   3-5). Pass the relevant hits (with the wing) to the coder so it builds on
   prior decisions instead of re-deriving them. Skip silently if mempalace is
   down.
2. **code** — dispatch `execute-coder` per the stage contract in
   `execute-stages.md`: the unit's `NN-<unit>.md` file (its ruling, Test first
   line, Owns and Verification) plus the index's *Facts the survey
   established*, *Assumed decisions* and *Shared-file rule* sections — never
   the whole folder — the resolved stack, wing, and recall hits. Mark the unit
   `running` in the Units table. A sub-100% coverage result against the
   configured target (`.config/vwf.yaml` `pipeline.coverage_target`, default
   100) is documented as a gap — never a silent pass.
3. **review + security (engines first, then concurrent)** — four moves, in
   this order:
   1. In **one message**, invoke `/code-review` at high effort and
      `/security-review` through the `Skill` tool. Each may run as a background
      task; note the task each reports.
   2. Wait on each with `TaskOutput`, blocking, up to 30 minutes from
      invocation. An engine that errors or times out is stopped with `TaskStop`
      and counted unavailable, with the reason kept for the prompt.
   3. In **one message**, dispatch `execute-code-reviewer` and
      `execute-security-reviewer` so both run at once. Each dispatch prompt
      ends with a section headed `## Engine` holding either that engine's
      output verbatim or the single line `ENGINE: unavailable — <reason>`. They
      are independent read-only passes over the same diff; neither reads the
      other's output, so serializing them only costs wall-clock.
   4. Each reviewer returns exactly one block — `REVIEW:` or `SECURITY:`. A
      return without it is an error under the "Subagent death" pause rule:
      re-dispatch once; twice in a row on one unit → record `blocked`, pause.

   The reviewers run no engine, so the orchestrator never waits for a
   notification on a reviewer's behalf and never sends a reviewer a message to
   finish its block — the only thing it waits for from a reviewer is its
   return.
4. **resolve both findings sets in one loop-back** — merge the two returns and
   send the combined findings **tags** to `code` in **one** dispatch, then
   repeat step 3 in full — engines first, then both reviewers concurrently —
   for every round. Merging is not just faster, it is better:
   the coder fixes review and security findings in a single pass instead of two,
   so the two stages never fight over the same lines. Gating is unchanged and
   per-stage: every security finding and every `[breaking-api]` finding **must**
   be fixed (cap-exempt); other review findings loop **per the round-cap rule**
   (residuals after the cap → documented as gaps). A round counts once, even
   though it ran two reviewers. Before each new round, apply the **convergence
   guard** — the merged loop-back is what *keeps* the two reviewers from
   fighting over the same lines, and the guard is what catches it when that
   fails.
5. **gaps** — any stage's gap pointer → mirror into the "Gaps surfaced during
   execution" section of the folder's `index.md` and file to mempalace room
   `gaps`. Decide blocking vs non-blocking and act per the rules.
6. **commit** — commit the unit's work via `/vwf:git-workflow`, **per the
   commit-only preference**, with the unit file's Commit line. The folder's
   edits — the Run log rows, the Units table cells, the gap section — ride the
   same commit: the folder is edited in the worktree, never in the main
   checkout.
7. **persist & journal** — store the unit's durable decisions to room
   `decisions`, and fill the unit's Units table row: Status `green` (or
   `skipped`, `failed`, `unresolved` per the gap rules) and the short commit
   hash. The **Run log rows** themselves are written **as each node returns**
   (steps 2-4), not batched here: one row per execution
   (`Wave | Unit | Model | Round | Outcome | Detail | Commit`), appended to the
   folder's `index.md` and mirrored to the journal before the next dispatch, so
   the round count is the row count and a skip carries its `why`. Batching them
   to the end of the unit is what makes a resumed run repeat work and the report
   render from memory.
