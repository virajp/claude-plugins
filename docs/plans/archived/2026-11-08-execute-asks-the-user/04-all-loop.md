# U4 — Relay a question through the all loop

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/execute/references/questions.md` (U3
  creates it: read only, cite its sections by name);
  `docs/memory/decisions/2026-10-07-execute-all.md`.

## Ruling

> D6 — A runner with an open question first waits until every unit it
> dispatched has returned, then returns the return block with
> `OUTCOME: QUESTION` and, after the five lines, the QUESTION, OPTIONS and WHY
> lines of each open question, each prefixed with its unit id
> (`QUESTION U3-Q1: …`). The loop asks the user each one, then resumes the
> runner with SendMessage, the message carrying each id and its answer. The
> resumed runner records the answers per D5 and dispatches a fresh unit for
> each asking unit, with its prompt plus the questions, the answers and the
> note that its earlier edits are in the worktree; a fresh dispatch from the
> runner returns its result in the same turn. If the SendMessage to the runner
> fails, the loop dispatches a fresh runner on the same folder, with an
> `Answers:` block after the overrides block, one line per id and answer; that
> runner appends each answer per D5 before its resume path runs. The loop
> still reads no unit report: the QUESTION lines are part of the runner's
> return block.

> D15 — The loop resumes the runner and asks the user; the runner only
> dispatches fresh units, which it can do today. Its tools line does not
> change.

> D7 — In an open session the orchestrator waits at the question for as long
> as necessary, with no timeout. A run where AskUserQuestion is not available
> or fails (a headless run such as claude -p) records each question as an open
> gap per D5, marks the unit unresolved, marks its dependents skipped,
> continues every unit that does not depend on it, and stops at the final
> report with the resume command. No run takes an assumption.

> D17 — The session question and the run-level questions of all stay as they
> are.

> D22 — A unit Q<n> is local to its block. The orchestrator (a runner, under
> all) gives each question a plan-wide id Q<n>, one past the highest question
> id in the plan action log, and uses it in the question and answer events, in
> the decisions entry text, in the resume message and in the runner return
> block. This replaces the <unit>-Q<n> ids of D5 and D6.

> D24 — Exactly what questions.md says for a folder run, by owner: a unit gets
> a fresh dispatch with the answer, a review finding goes into its loop-back or
> the fix of D9, H7 and H8 do the one authorised action, a stage answer
> continues that stage. The only difference under all: a runner never resumes
> an agent with SendMessage; it always dispatches fresh. A runner runs solo, so
> it has no teammates.

> D36 — log.mjs gets one verb, next-question, that takes the same plan
> arguments as its other verbs and prints Q<n>: one past the highest question
> id in that plan action log, or Q1 when it has none. U3 and U4 cite that exact
> verb.

> D37 — An unanswered question keeps its id. Its open gaps entry text starts
> QUESTION Q<n>: (not QUESTION: ), so it carries the id. A resume asks it again
> under that same id and writes the answer event for it.

> D38 — The loop resumes the runner with SendMessage, the message reading no
> one can answer and naming each Q<n>. The runner then does D7 itself: it
> records each open gap, marks the units, continues the units that do not
> depend on them, and ends with the final report and a STOPPED return block.
> If the resume fails, the loop ends the row STOPPED with the open question ids
> in its detail, and the folder records them on its next resume. The loop
> still edits no folder.

> D42 — From the action log. Under all, the runner logs the question event of
> each question before it returns OUTCOME: QUESTION. A resume asks every
> question event in the plan action log that has no answer event, under its
> own id, as well as the open QUESTION Q<n>: gaps, each id once. U3 writes the
> rule in questions.md and blocking.md, and U4 cites it in all.md and
> folder.md.

> D44 — (4) The question event gains two required keys, options (the raw
> OPTIONS text) and why (the WHY text); a resume or a fresh runner re-asks from
> them and fills rejected from options. (5) U4 adds the Answers: block to
> all.md:92 (the dispatch prompt) and to the Inputs of execute-runner.md.

So the runner's return lines read `QUESTION Q<n> <owner>: …`, with the
plan-wide id of D22 and the owner of D23 (a unit, a wave or a stage), and the
`Answers:` block lines read `- Q<n>: <answer>`.

> D13 — teams. U3 writes `references/questions.md`; ask U3 for its section
> names, and do not wait for them: cite the file by path if no answer came.

## Edits

1. **`plugins/vwf/skills/execute/workflows/all.md`** —
   - Lines 5-6: `all` stops at the first point it cannot settle, and relays a
     question per D6 rather than stopping.
   - Line 51 and *The loop* step 4 (99-101): a reply whose `OUTCOME:` is
     `QUESTION` is a legal reply. The loop asks each question with
     `AskUserQuestion`, one per call, the unit id in the text; loads
     `SendMessage` with `ToolSearch`; resumes the runner by its agent id; and
     waits for its next reply, which is a return block again. On a failed
     `SendMessage`, the fresh runner with the `Answers:` block of D6.
     A headless loop (D7): per D38, it resumes the runner with "no one can
     answer" and the ids, and records the runner's next return block as
     usual.
   - *The overrides block*: add the `Answers:` block shape after it,
     `- Q<n>: <answer>` per line, and `Answers: none` never sent.
   - *The loop* step 3 (line 92, "two paths and the overrides block, and
     nothing else"): the prompt may also carry the `Answers:` block, only on
     the fresh runner of D6 (D44 (5)).
   - *Runner mode*: replace "It asks nothing, of anyone" with D6's runner part:
     wait for every dispatched unit, return `OUTCOME: QUESTION` with the
     `QUESTION Q<n> <owner>:`, `OPTIONS Q<n>:` and `WHY Q<n>:` lines, and on
     resume record per D5 and apply each answer by owner per D24. A
     runner never resumes a unit with `SendMessage`; say why in one line (its
     reply goes to the top session). Keep the skill-prompt rule: a skill that
     asks regardless still stops the runner.
   - *The return block*: `OUTCOME` gains `QUESTION`, with `RESUME: none` and
     `ENDS RUN: no`; the QUESTION lines follow the five lines only on that
     outcome.
2. **`plugins/vwf/agents/execute-runner.md`** — lines 6, 22, 49-51: the runner
   asks nothing itself and relays questions per D6. Its Inputs (lines 19-40)
   gain the optional `Answers:` block after `Overrides:` (D44 (5)): the runner
   appends each answer per D5, taking `options` from the question's log event
   to fill `rejected` (D44 (4)), before its resume path runs. Lines 61-72: the return
   contract allows the QUESTION lines after the five lines on
   `OUTCOME: QUESTION`, and nothing else. The `tools:` line does not change
   (D15). Keep the frontmatter strict YAML.
3. **`plugins/vwf/skills/execute/workflows/next.md`** — line 10: replace
   "meant to run unattended" with wording that holds for a run that can ask.
4. **`plugins/vwf/skills/execute/workflows/folder.md`** — lines 106-107: a
   resume reads a ruling from the unit file or from the `decisions` entries
   that answers appended, and asks an open `QUESTION Q<n>: ` gap and every
   unanswered `question` event of the action log first, each under its own id
   (D37, D42). Cite `references/questions.md` for the rule.

## Verification

- `mise x -- mise run code:format` and `mise x -- mise run p:plugins:check`
  pass.
- `grep -n "OUTCOME: QUESTION\|QUESTION" plugins/vwf/skills/execute/workflows/all.md plugins/vwf/agents/execute-runner.md`
  finds the return block in both files, with the same shape.
- `grep -n "^tools:" plugins/vwf/agents/execute-runner.md` is unchanged.

## Guardrails

- Do not touch `SKILL.md` or `references/**` (U3), or any other agent (U5).
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: relay a question from an all runner to the user and back`
