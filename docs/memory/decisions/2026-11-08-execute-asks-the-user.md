DECISION 2026-11-08 ★5 | skill:execute | a run asks the user when the plan is
silent → QUESTION lines in place of GAP and UNRESOLVED, asked one at a time,
answers recorded in decisions | reverses D9 of
2026-10-07-plans-carry-every-answer, the "execute asks nothing at run time"
rule, and the rejected "questions that block" of
2026-11-06-execution-solo-teams | alts rejected per ruling, D1 to D18 below

# /vwf:execute asks the user in place of leaving open gaps

The user asked for this because a run "leaves too many gaps". A run now takes no
assumption. A point the plan does not settle is a question the orchestrator asks
the user. The protocol is `plugins/vwf/skills/execute/references/questions.md`;
the plan is `docs/plans/2026-11-08-execute-asks-the-user/`.

## The reversal (D17)

This reverses three standing decisions:

- D9 of `2026-10-07-plans-carry-every-answer.md`: an uncovered decision was a
  blocking-gap stop, and pause-and-ask was rejected.
- The "execute asks nothing at run time" rule.
- The "questions that block" alternative that
  `2026-11-06-execution-solo-teams.md`
  rejected.

What stays: the planners keep their full interview and still ask every question
they can before the run. A run question exists only for what the plan missed.
The session question and the run-level questions of `all` do not change.

## Rulings, in short

1. **D1 — What is asked.** Every would-be open gap: a unit's assumption, an
   `UNRESOLVED` ruling, a reviewer's `SPEC GAPS` or `PLAN GAPS`, a contested
   finding, an oscillation. A closed gap is not asked. Rejected: ask only about
   behaviour, contract or scope; ask only units' lines.
2. **D2 — How.** A unit ends its turn with its questions, its edits uncommitted.
   The top session asks with `AskUserQuestion`, one question per call, records
   the answer and resumes the unit with `SendMessage`; a failed resume
   re-dispatches it. No gate or commit runs while a question is open. Rejected:
   a unit that waits live for a reply.
3. **D3 — Shape.** `QUESTION Q<n>:`, `OPTIONS Q<n>:` (two to four, the
   recommendation first, each with its consequence) and `WHY Q<n>:`, or
   `QUESTION: none`. The `GAP:` and `UNRESOLVED:` lines go; an old folder's are
   read as questions with no options. Reviewers and verifiers use the same
   lines. Rejected: keep `GAP:` and `UNRESOLVED:` beside them.
4. **D4 — When.** A unit finishes every edit an answer cannot change, then
   returns all its questions at once. Rejected: stop at the first question.
5. **D5 — Record.** Each answer is one `decisions` entry, with no schema change;
   `question` and `answer` events go to the action log. Rejected: a new
   `index.json` key.
6. **D6 — Under `all`.** The runner waits for its units, returns
   `OUTCOME: QUESTION` with the question lines, and the loop asks and resumes
   it;
   a failed resume dispatches a fresh runner with an `Answers:` block. The
   runner
   dispatches a fresh unit for each answer. Rejected: the runner resumes its
   unit with `SendMessage`; no questions under `all`.
7. **D7 — No one to answer.** An open session waits with no timeout. A headless
   run records each question as an open gap, marks the unit `unresolved`, skips
   its dependents, continues the rest and stops at the final report; the resume
   asks them first. Rejected: an `--unattended` flag; stop at the first
   question.
8. **D8 — Stops that become questions.** H7, H8 and a unit whose Verification
   fails after the one mechanical re-dispatch. The answer authorises that one
   action. H1 to H5 stay stops, and no answer widens the merge consent.
   Rejected: keep H7 a pause.
9. **D9 — Contested findings and oscillations.** Asked when the loop ends, the
   reviewer's recommendation first; fix runs one targeted fix and a narrow
   check, accept records the decision. Rejected: record them as open gaps.
10. **D10 — The pane.** An open question shows the phase `question`, `waiting
    for your answer`, never `paused or stopped`. Rejected: park the pane.
11. **D11 — Teams.** A teammate never waits for a peer; an unanswered point is a
    `QUESTION` in its block. Rejected: none.
12. **D12 — B110.** This plan wins and B110 stays open; the recommendation comes
    first, so a good one takes one answer. Rejected: close or merge B110.
13. **D13 — Mode.** `teams`. Rejected: `solo`.
14. **D14 — Review.** One review unit over the runnable code. Rejected: the wave
    review alone.
15. **D15 — Runner tools.** Unchanged: the loop asks and resumes, the runner
    only
    dispatches. Rejected: give the runner `SendMessage` and `AskUserQuestion`.
16. **D16 — Verification.** `claude plugin test plugins/vwf`; a whole
    interactive run is parked in
    `docs/memory/gaps/2026-11-08-interactive-execute-real-run-test-parked.md`.
    Rejected: a nested headless smoke run.
17. **D17 — The reversal.** Above. Rejected: also shorten the planner interview.
18. **D18 — Stop answers.** An answer to stop, or one beyond the Goal, marks the
    unit `unresolved` and the run stops at the final report; a further question
    after a resume is asked again, with no cap. Rejected: a cap per unit.

D19 to D44 refine these: questions get plan-wide ids from `log.mjs
next-question`, the events take JSON on stdin, an owner is a unit or a stage,
an unanswered question keeps its id, and a resume asks every unanswered question
it finds in the gaps or the action log. A recorded fact of the run — no harness,
no capture, a coverage short of target, a failed render copy — stays an open gap
and is not asked.

## What the platform tests found (2026-11-08)

Desktop session, agent teams flag on, Haiku agents. Test them again before a
rule changes.

- A background subagent has `SendMessage` and no `AskUserQuestion`. Only the
  top session can ask the user.
- The top session resumes a finished, unnamed subagent with `SendMessage` to its
  agent id, and the agent keeps its context — also a custom agent type whose
  `tools:` line has no `SendMessage`.
- The top session resumes a subagent that has its own child, and it keeps its
  context.
- When a layer-1 agent resumes its layer-2 child with `SendMessage`, the child
  keeps its context, but its reply goes to the top session, not to the layer-1
  agent, which cannot read it. So the runner dispatches a fresh unit (D6).
- A fresh `Agent` dispatch from a layer-1 agent returns its result in the same
  turn.
- Not tested: the flag off, the CLI, Opus agents, a teammate returning a
  `QUESTION` block, a whole run. Parked.
