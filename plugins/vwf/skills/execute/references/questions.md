# Run-time questions

Read this when a unit or a reviewer returns a `QUESTION` line, or when a stop below holds. The planner
asked every question it could, and recorded each answer in the folder. A run asks only what the plan
missed, and never re-asks a ruling the folder holds. A run takes no assumption.

This file is the one authority for run-time questions. Every other file of this skill cites it.
`log.mjs` below means `node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs`, and `plan.mjs` means
`node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`.

The session question and the run-level questions of `all` stay as they are, in `SKILL.md` and
[all.md](../workflows/all.md). They come before the run starts, and this file does not govern them.

## What is asked

Every would-be open gap is a question:

- a unit's assumption — the old `GAP:` and `GAPS:` lines;
- an `UNRESOLVED:` ruling;
- a reviewer's or verifier's `SPEC GAPS` or `PLAN GAPS` line;
- a contested finding, and an oscillation, at the end of their loop (below).

A closed gap is not asked. The run settled it with no ruling owed, and it stays recorded. Examples:

- an Owns widened under the plan's Goal, and the fix applied;
- a finding a later round or the closing pass resolved;
- a citation corrected.

A recorded fact of the run — no harness, no capture, a coverage short of target, a failed render copy —
is no question either. It stays an `open` gap in its usual text form, and is not asked.

Three stops are questions too:

| ID | Condition                                                                                                    | The answer                     |
| -- | ------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| H7 | A security or `[breaking-api]` finding trips the convergence guard                                           | authorises that one action     |
| H8 | An uncovered irreversible or outward-facing decision; a wave order the written order cannot settle; blocking format drift | authorises that one action |
| —  | A unit's own Verification fails after the one mechanical re-dispatch, per [blocking.md](blocking.md)         | authorises that one action     |

The run continues after the action. An answer that needs a path outside the unit's Owns widens the Owns
under the existing rule in [the run rules](rules.md). Record the widening as a `closed` gap that names the
decision. H1, H2, H3, H4 and H5 stay stops, per [pause.md](pause.md). The plan's recorded merge `consent`
does not change, and no answer widens it. The landing asks nothing — the consent rules hold there.

**A contested finding or an oscillation** is asked when its loop ends, after the closing pass in
`${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`. The reviewer's recommendation is the first option.

- An answer to **fix** runs one targeted fix of that finding, and a narrow check in the form of the
  closing pass. It is never a new round. If the finding is still open, ask again.
- An answer to **accept** records the decision, and no gap stays open.
- A security or `[breaking-api]` finding keeps its own rule: it is always fixed. Its non-converging case
  is the H7 question above.

## The QUESTION block

A unit's return block keeps its `CHANGED:`, `DECIDED:` and `DOCS FALSIFIED:` lines. It has no `GAP:` and
no `UNRESOLVED:` line. Each open question is three lines, `n` counting from 1 in the block:

```text
QUESTION Q<n>: <the question, readable alone>
OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> — <consequence> | <option 4> — <consequence>]
WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>
```

- `OPTIONS` holds two to four options, each with its consequence after an em dash. The first is the
  recommendation.
- A block with no question carries the one line `QUESTION: none`.
- The read-only reviewers and verifiers — code, security, acceptance, ux and the wave reviewer — return
  their `SPEC GAPS` or `PLAN GAPS` points as these lines too.
- A `GAP:`, `GAPS:` or `UNRESOLVED:` line from a folder written before this protocol is read as a
  question with no options. The orchestrator writes the options itself.

**When a unit returns.** A unit completes every edit that does not depend on an answer. Then it returns
all its open questions in one block. It never builds on a part that an answer can change. Its edits stay
uncommitted in the worktree.

## Asking

A subagent cannot wait live: it has no `AskUserQuestion`, and its turn ends with its block. Only the
top session asks the user.

1. Give the question its plan-wide id, per *Ids and owners*.
2. Log its `question` event, per *Recording*, before the ask — whether the ask then succeeds or not.
3. Call `AskUserQuestion` once, for this question alone.
   - Its options are the `OPTIONS` entries, in order. Mark the first `(Recommended)`.
   - Its question text carries the id, the owner and the `WHY` line, so it reads alone.
4. Ask the next question only after this one is answered — one question per call, one at a time.
5. Record the answer per *Recording*, then resume the owner per *Resuming the owner*.

The other units of the wave continue while a question waits. In an open session, wait at the question as
long as necessary, with no timeout. No gate and no commit runs while a question of the wave is open, or
while a resumed unit still works — the pre-commit stash can destroy its edits.

When `AskUserQuestion` is not available, or fails, follow *No one to answer*.

## Ids and owners

A unit's `Q<n>` is local to its block. The orchestrator gives each question a plan-wide id, one past the
highest question id in the plan's action log:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs next-question
```

It prints `Q<n>`, or `Q1` when the log has none, and writes nothing. [The action log](action-log.md)
documents the verb. If it fails, take the id one past the highest `Q<n>` in the folder's `decisions` and
`gaps` text, and continue. The plan-wide id goes into the `question` and `answer` events, the `decisions`
entry, the resume message and, under `all`, the runner's return block. An id never changes: a question
asked again keeps it.

Question ids, and the resume step of *No one to answer*, are the one place a run reads the action log.

**The owner** is the unit the question is about, when there is one — for example, the unit a wave-review
finding names. Otherwise it is the stage: `setup`, `renders`, `acceptance`, `ux`, `reconcile`, or `W<n>`
for a wave. The `question` event's `unit` key takes either form,
`^(U[0-9]+|W[0-9]+|setup|renders|acceptance|ux|reconcile)$`.

## Recording

Log each question as it is asked, and each answer once it is recorded. Both events take one JSON object on
stdin, so their strict schemas run:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs event question <<'EOF'
{"id": "Q4", "unit": "U3", "text": "<the question>", "options": "<the raw OPTIONS text>", "why": "<the WHY text>"}
EOF
node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs event answer <<'EOF'
{"id": "Q4", "decision": "D45"}
EOF
```

Each answer is one entry appended to the folder's `decisions` list, with the next `D<n>`, one past the
highest:

    plan.mjs append <folder>/index.json decisions --json '{"id": "D45", "decision": "Q4: <the question>", "ruling": "<the answer>", "rejected": "<the options not taken>", "units": ["U3"]}'

- `decision` is the question, led by its id.
- `ruling` is the answer as the user gave it.
- `rejected` is the options not taken, joined by `; `, or `none` for a free-text answer.
- `units` is the owner unit, or `[]` for a stage owner.

The schema does not change. A question is open while its `question` event has no later `answer` event of
the same id — that test alone tells open from answered.

An answer that sets a rule beyond this plan — a convention, a doctrine — also becomes a
`docs/memory/decisions/` file, under the run rule for durable decisions in [the run rules](rules.md) and
`execute-stages.md`. A one-off answer about this plan writes no memory file.

## Resuming the owner

Apply each answer by its owner:

| Owner                                        | What the answer does                                                                                  |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| An `edit` unit, or a `code` unit's coder     | Resume it with one `SendMessage` to its agent id, carrying each question id and its answer            |
| A teammate, in a `teams` wave                | Resume it with one `SendMessage` to its name, the same message                                        |
| A read-only reviewer or verifier             | Not resumed. The answer goes into the loop-back it feeds, or the fix of a contested finding above      |
| H7, H8, or a failed Verification             | Do the one action the answer authorised                                                               |
| A stage: `setup`, `renders`, `acceptance`, `ux`, `reconcile`, `W<n>` | Continue that stage with the answer                                           |

If the `SendMessage` fails, dispatch the unit again with the same prompt plus the questions and answers,
and a note that its earlier edits are in the worktree.

A unit that returns a further question after its resume is asked again. There is no cap — the user can
always answer stop.

## No one to answer

A run where `AskUserQuestion` is not available or fails — a headless run such as `claude -p` — takes no
assumption. For each open question:

1. Append one `open` entry to `gaps`, its `text` starting `QUESTION Q<n>: ` and then the question. A unit
   owner is its `unit`. A stage owner is `unit` `""` with `stage` set to the owner's name.
2. Log its `gap` event, of class `question`, per [the plan files](plan-files.md).
3. Act by owner:
   - **A unit**: mark it `unresolved`, and its dependents `skipped`, per [blocking.md](blocking.md).
     Continue every unit that does not depend on it.
   - **`setup` or `W<n>`**: mark every pending unit `skipped`, with the question id as detail.
   - **`renders`, `acceptance`, `ux` or `reconcile`**: set that stage `failed`.
4. Stop at the final report, with the resume command.

A resource-cap pause (H5) with a question still open records it the same way, before the handoff.

**On a resume**, before any unit re-runs, ask each of these once, under its own id:

- every `open` gap whose `text` starts `QUESTION Q<n>: `;
- every `question` event in the plan's action log with no `answer` event of the same id.

Re-ask from the event's `text`, `options` and `why`, and fill `rejected` from its `options`. Write the
`answer` event, and the `decisions` entry, per *Recording*. Then close the gap: `gaps.G<n>.state` to
`closed`, and its `text` ended with the ruling. Under `all`, a question the loop could not hand back lives
only in the action log — this is why the resume reads it.

## An answer that stops

An answer that says to stop, or that needs a change outside the plan's Goal:

1. Record it per *Recording*.
2. Append one `open` entry to `gaps`, its `text` starting `STOPPED: ` and naming the question id and the
   answer. Own it as *Ids and owners* says.
3. Mark the unit `unresolved`, with the answer as detail. A stage or wave owner is marked as in *No one to
   answer*, step 3.
4. Continue as for an isolated block, per [blocking.md](blocking.md): dependents skipped, and the run stops
   at the final report.

The open gap keeps the work visible until a person rules on it.

## Teams

A teammate never waits for a peer's reply. When no answer came, it writes the point as a `QUESTION` in its
block, never as a `GAP:`. The orchestrator asks the user, and resumes the teammate by its name.

## Under all

A runner is a subagent, so it asks no one. *Runner mode* in [all.md](../workflows/all.md) says how its
questions reach the loop and its answers come back. On resume a runner applies each answer exactly as this
file says, by owner, with one difference: it never resumes an agent with `SendMessage`, and always
dispatches a fresh one. A runner runs `solo`, so it has no teammates.
