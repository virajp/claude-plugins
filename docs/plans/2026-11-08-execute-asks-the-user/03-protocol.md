# U3 — Write the question protocol into the execute skill

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/execute/references/action-log.md` (U1
  owns it: read only, for the event names); `workflows/all.md` (U4 owns it:
  read only, for *Runner mode*); `.claude/skills/skill-kit/SKILL.md` (the
  standard every skill keeps).

## Ruling

> D1 — Every would-be open gap: a unit's assumption (the old GAP and GAPS
> lines), an UNRESOLVED ruling, a reviewer's SPEC GAPS or PLAN GAPS line, a
> contested finding and an oscillation. A closed gap, which the run settled
> with no ruling owed (an Owns widened under the Goal, a finding a later round
> resolved, a citation corrected), stays recorded and is not asked.

> D2 — A unit cannot wait live. It ends its turn with the QUESTION block of
> D3, and its edits stay uncommitted in the worktree. The orchestrator asks
> the user with AskUserQuestion, one question per call, one at a time, and the
> other units of the wave continue. It records the answer per D5, then resumes
> the unit with SendMessage to the unit's agent id (a teammate by its name),
> the message carrying each question id and its answer. If the SendMessage
> fails, it dispatches the unit again with the same prompt plus the questions
> and answers, and a note that its earlier edits are in the worktree. No gate
> and no commit runs while a question of the wave is open or a resumed unit
> still works.

> D3 — The unit return block drops the GAP: and UNRESOLVED: lines and gains
> three lines per question, n counting from 1 in the block:
> `QUESTION Q<n>: <the question, readable alone>`,
> `OPTIONS Q<n>: <option 1, the recommendation> | <option 2> [| <option 3> | <option 4>]`
> with two to four options, each with its consequence after an em dash, and
> `WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>`.
> A block with no question carries the one line `QUESTION: none`. The CHANGED,
> DECIDED and DOCS FALSIFIED lines stay. A GAP:, GAPS: or UNRESOLVED: line from
> a folder written before this plan is read as a question with no options, and
> the orchestrator writes the options itself. The read-only reviewers and
> verifiers (code, security, acceptance, ux, the wave reviewer) return their
> SPEC GAPS or PLAN GAPS lines as these QUESTION lines too.

> D4 — A unit completes every edit that does not depend on an answer, then
> returns all its open questions in one block. It never builds on a part that
> an answer can change.

> D5 — Each answer is one entry appended to the folder's decisions list with
> the next D<n>: `decision` is the question, `ruling` is the answer as the user
> gave it, `rejected` is the options not taken, joined by `; `, or `none` for a
> free-text answer, and `units` is the asking unit. The schema does not change.
> The orchestrator logs
> `log.mjs event question --id <unit>-Q<n> --unit <unit> --text <question>` as
> it asks, and `log.mjs event answer --id <unit>-Q<n> --decision D<n>` once it
> records the answer. An unanswered question (D7) is one open entry of gaps,
> its text starting `QUESTION: `, and one gap event of class `question`.

> D7 — In an open session the orchestrator waits at the question for as long
> as necessary, with no timeout. A run where AskUserQuestion is not available
> or fails (a headless run such as claude -p) records each question as an open
> gap per D5, marks the unit unresolved, marks its dependents skipped,
> continues every unit that does not depend on it, and stops at the final
> report with the resume command. No run takes an assumption. A resource-cap
> pause (H5) with a question still open records it the same way before the
> handoff. A resume asks every open gap whose text starts `QUESTION: ` before
> it re-runs the unit, and resets that gap to closed with the answer once it is
> recorded.

> D8 — H7 (a security or breaking-API finding that does not converge), H8 (an
> uncovered irreversible or outward-facing decision, a wave order the written
> order cannot settle, blocking format drift) and a unit whose own
> Verification fails after the one mechanical re-dispatch. The orchestrator
> asks; the answer authorises that one action and the run continues. An answer
> that needs a path outside the unit's Owns widens the Owns under the existing
> rule, recorded as a closed gap that names the decision. H1, H2, H3, H4 and
> H5 stay stops. The plan's recorded merge consent does not change, and no
> answer widens it.

> D9 — The orchestrator asks the user about each one when its loop ends, after
> the closing pass, with the reviewer's recommendation as the first option. An
> answer to fix runs one targeted fix of that finding and a narrow check in the
> form of the closing pass, never a new round; if the finding is still open,
> the orchestrator asks again. An answer to accept records the decision, and no
> gap stays open. The security and breaking-API findings keep their own rule:
> always fixed, and H7 is the question of D8.

> D11 — Rule 6 of 2026-11-06 stays: a teammate never waits for a peer's reply.
> When no answer came, it writes the point as a QUESTION in its block, not as a
> GAP:, and the orchestrator asks the user.

> D17 — The planners keep their full interview: they still ask every question
> they can before the run, and a run question exists only for what the plan
> missed. The session question and the run-level questions of all stay as they
> are.

> D18 — An answer that says to stop, or that needs a change outside the plan's
> Goal, is recorded per D5, the unit is marked unresolved with the answer as
> detail, and the run continues as for an isolated block today: dependents
> skipped, the run stops at the final report. A unit that returns a further
> question after its resume is asked again; there is no cap, because the user
> can always answer stop.

> D19 — The question and answer events take JSON on stdin, as row and gap do,
> so their strict schemas run: `log.mjs event question` with one JSON object on
> stdin, and `log.mjs event answer` the same. This replaces the --key command
> lines of D5; the keys are unchanged.

> D21 — Open versus answered comes only from the question and answer events: a
> question event with no later answer of the same id is open. The gap event of
> class question is written only when a question goes into the folder gaps list
> unanswered (D7), as every gaps append already writes one gap event. The pane
> and summary do not use it for the open test.

> D22 — A unit Q<n> is local to its block. The orchestrator (a runner, under
> all) gives each question a plan-wide id Q<n>, one past the highest question
> id in the plan action log, and uses it in the question and answer events, in
> the decisions entry text, in the resume message and in the runner return
> block. The event id pattern is ^Q[0-9]+$, and the owner goes in the unit key.
> This replaces the <unit>-Q<n> ids of D5 and D6.

> D23 — The owner is the unit the question is about when there is one, for
> example the unit a wave-review finding names. Otherwise it is the stage name:
> setup, acceptance, ux, or W<n> for a wave. The question event unit key takes
> either form (^(U[0-9]+|W[0-9]+|setup|acceptance|ux)$). The decisions entry
> units list is that unit, or [] for a stage. An unanswered stage question is a
> gaps entry with unit "" and stage set to the stage name.

> D24 — Exactly what questions.md says for a folder run, by owner: a unit gets
> a fresh dispatch with the answer, a review finding goes into its loop-back or
> the fix of D9, H7 and H8 do the one authorised action, a stage answer
> continues that stage. The only difference under all: a runner never resumes
> an agent with SendMessage; it always dispatches fresh. A runner runs solo, so
> it has no teammates.

> D26 — Every answer goes into the folder decisions list (D5). An answer that
> sets a rule beyond this plan (a convention, a doctrine) also becomes a
> docs/memory/decisions/ file, under the existing run rule for durable
> decisions in execute-stages.md and rules.md. A one-off answer about this plan
> edit writes no memory file.

> D27 — U3 owns plugins/vwf/skills/execute/references/preflight.md. It rewords
> :57 for a run that can ask, and rewords :72 to keep its meaning without the
> words asks nothing: the LSP answer is in the folder, so the run does not
> re-ask it.

> D32 — A stop answer writes its decisions entry and one open gaps entry whose
> text starts STOPPED: and names the answer, owned as D23 says. The unit is
> unresolved and the run stops at the final report; the open gap keeps the work
> visible until a person rules on it.

> D35 — U3 owns plugins/vwf/assets/memory.md and rewords those lines alone: a
> run subagent returns QUESTION lines, and the orchestrator asks them per the
> execute skill references/questions.md.

> D36 — log.mjs gets one verb, next-question, that takes the same plan
> arguments as its other verbs and prints Q<n>: one past the highest question
> id in that plan action log, or Q1 when it has none. It writes nothing. U1
> builds and tests it, U1 documents it in action-log.md, and U3 and U4 cite
> that exact verb.

> D37 — An unanswered question keeps its id. Its open gaps entry text starts
> QUESTION Q<n>: (not QUESTION: ), so it carries the id. A resume asks it again
> under that same id and writes the answer event for it, which closes it in
> the pane and the summary. next-question never issues an id that the log
> already holds. A stopped run logs run.end, and the pane phase ended wins over
> question, so a stopped run does not show a wait. This amends the gap text
> prefix of D5 and D7.

> D39 — The open gap is recorded with unit "" and stage set to the owner name.
> A setup or W<n> question blocks everything after it: the run marks every
> pending unit skipped, with the question id as detail, and goes to the final
> report. An acceptance or ux question sets that stage failed, and the run
> goes to the final report. Either way the run stops at the final report with
> the resume command, and the resume asks the question first (D37).

> D40 — (6) Every gap text prefix in U3 and U5 is QUESTION Q<n>: per D37.

> D42 — From the action log. Under all, the runner logs the question event of
> each question before it returns OUTCOME: QUESTION. A resume asks every
> question event in the plan action log that has no answer event, under its
> own id, as well as the open QUESTION Q<n>: gaps, each id once. This is the
> one exception to the rule that a resume never reads the action log to
> decide what to run. U3 writes the rule in questions.md and blocking.md, and
> U4 cites it in all.md and folder.md.

> D44 — (2) Question ids (D22, D36) and the resume of D42 are the one place a
> run reads the log. If next-question fails, the orchestrator takes the id one
> past the highest Q<n> in the folder decisions and gaps text, and continues.
> (3) The orchestrator logs the question event before each ask, whether the ask
> then succeeds or not. (4) The question event gains two required keys, options
> (the raw OPTIONS text) and why (the WHY text); a resume or a fresh runner
> re-asks from them and fills rejected from options. (6) renders and reconcile
> are owners too, and the owner pattern is
> ^(U[0-9]+|W[0-9]+|setup|renders|acceptance|ux|reconcile)$; an unanswered one
> fails that stage per D39. The landing asks nothing: the consent rules hold.
> (7) U3 adds a Phases row to SKILL.md: Questions, gate user when the plan is
> silent, file references/questions.md, loads sometimes. (9) U3 Edit 14 also
> covers execute-stages.md:221,249,303,320 per D9.

> D13 — teams. U4 and U5 cite `references/questions.md` by path and by the
> section names you give it; send them the section names once you fix them.

## Edits

1. **`plugins/vwf/skills/execute/references/questions.md`** — new. The one
   authority for run-time questions; every other file cites it. Sections, in
   this order: *What is asked* (D1, D8, D9), *The QUESTION block* (D3, D4),
   *Asking* (D2: one `AskUserQuestion` call per question; its options are the
   `OPTIONS` entries in order, the first marked `(Recommended)`; the `WHY` line
   and the question's id and owner in the question text, so it reads alone),
   *Ids and owners* (D22, D23: the next id from the action log as U1
   documents it in `action-log.md`), *Recording* (D5 with the JSON form of
   D19, D21, D26), *Resuming the owner* (D2 and D24, by owner: an `edit` unit,
   a `code` unit's coder, a teammate by name; a read-only reviewer or verifier
   is not resumed, its answer goes to the loop-back it feeds or the fix of D9;
   H7 and H8 do the authorised action; a stage continues), *No one to answer*
   (D7), *An answer that stops* (D18, D32), *Teams* (D11), *Under all* (one
   paragraph citing `workflows/all.md` *Runner mode* for D6 and D24). Write it
   to the skill-kit standard of the other references.
2. **`plugins/vwf/skills/execute/SKILL.md`** — lines 21, 44-56, 62-64: replace
   "asks the user nothing" with: the planner asked every question it could; a
   run asks only what the plan missed, per `references/questions.md`, and
   never re-asks a ruling the folder holds. Keep the session question and the
   run-level questions of `all` as they are. Rename the persona to
   **Delivery driver**: keep moving, decide from the rules, ask where the plan
   is silent, never assume. Cite the rules as `[the run rules](references/rules.md)`.
   Add a Routing row: *A unit returns a question, or a stop of D8 holds* →
   `questions.md`, `sometimes`. Add a Phases row (D44 (7)): *Questions* — gate
   *user, when the plan is silent* — `references/questions.md` — `sometimes`. In the Halt and pause table, H7 and H8 become
   "Ask, per questions.md", and the paragraph at 186-190 follows D7 and D18.
   The Never list (205-206): "Take an assumption where the folder is silent;
   ask per questions.md".
3. **`plugins/vwf/skills/execute/references/rules.md`** — title `# The run rules`.
   Line 22: an order the written order cannot settle is a question (D8). *Gaps*
   (85-102): a run takes no assumption; `open` entries are unanswered
   questions (D7) and stop answers (D18); `closed` entries keep today's rule.
   *What does not stop the run* (182-197): keep every item that still holds,
   replace "ask what to do about a gap" with the D1-D2 rule, and say that the
   run asks only per questions.md. Never list (219): as SKILL.md.
4. **`plugins/vwf/skills/execute/references/blocking.md`** — an isolated block
   now comes from an unanswered question (D7), a stop answer (D18), or a
   failed Verification once its question was answered with stop; a failed
   Verification after the mechanical re-dispatch is first a question (D8).
   Resume step 3 asks every open `QUESTION Q<n>: ` gap and every unanswered
   `question` event of the action log first, each under its own id (D37,
   D42). The report
   "asks nothing" lines (36-38) become: the report lists what was not answered,
   with the resume command.
5. **`plugins/vwf/skills/execute/references/pause.md`** — H7 and H8 move out of
   the pause details: point to questions.md. Under the cap directive, add the
   D7 step for an open question before the handoff.
6. **`plugins/vwf/skills/execute/references/waves.md`** — lines 52-55: read
   each report for `QUESTION` lines (and old `GAP:`/`UNRESOLVED:` lines), and
   run no gate while a question of the wave is open (D2).
7. **`plugins/vwf/skills/execute/references/edit-unit.md`** — the dispatch
   prompt (line 30) asks for the block of D3. Step 2 (43-46) handles QUESTION
   lines per questions.md in place of appending each `GAP:`. The wave
   reviewer's block (73-78) gains the QUESTION lines for a plan hole it finds.
   The closing pass's residual (123-125) follows D9. The teams section
   (142-146 and the loop) follows D11 and D2: a teammate is resumed by name.
8. **`plugins/vwf/skills/execute/references/code-unit.md`** — step 3 handles
   the coder's QUESTION lines per questions.md; step 5's status follows D7 and
   D18.
9. **`plugins/vwf/skills/execute/references/review-unit.md`** — lines 174-175:
   each SPEC/PLAN line is a question; the contested residual follows D9; a
   non-converging cap-exempt finding is the H7 question of D8.
10. **`plugins/vwf/skills/execute/references/acceptance-and-ux.md`** — remove
    "autonomous policy" (lines 14, 72); SPEC GAPS lines (98-102) are questions.
11. **`plugins/vwf/skills/execute/references/setup.md`** — blocking format
    drift (lines 7, 11-12) is the H8 question of D8.
12. **`plugins/vwf/skills/execute/references/final-report.md`** — add the
    decisions the run recorded from answers (the entries D5 appended, with the
    questions), and the open `QUESTION Q<n>: ` gaps. Line 48 keeps its rule.
13. **`plugins/vwf/skills/execute/references/plan-files.md`** — lines 29-30:
    make the passage agree with D8; a failed record write that is no decision
    stays a stop.
14. **`plugins/vwf/assets/execute-stages.md`** — lines 260-268: gaps become
    questions per the execute skill's `references/questions.md`, cited by its
    plugin-root path. Add a `decisions` row to the run-state key table (303):
    appended by the run, one entry per answer. Lines 221, 249, 303 and 320,
    which record a contested finding or an oscillation as an `open` gap,
    follow D9: each is a question at the end of its loop (D44 (9)).
15. **`plugins/vwf/assets/format-check.md`** — line 28: execute asks the H8
    question for blocking drift, per D8.
16. **`plugins/vwf/skills/execute/references/preflight.md`** — line 57 and
    line 72, per D27. Change nothing else in the file.
17. **`plugins/vwf/assets/memory.md`** — lines 165-169, per D35. Change nothing
    else in the file.

In every file above, an open `gaps` entry from a run is one of two: an
unanswered question (text starting `QUESTION Q<n>: `, D37) or a stop answer
(text starting `STOPPED: `, D32). The next id is `log.mjs next-question`
(D36), with the fallback of D44 (2); the `question` event, with its `options`
and `why`, is logged before each ask (D44 (3), (4)); a stage or wave question
that no one answers follows D39, and the owners include `renders` and
`reconcile` (D44 (6)). Every `log.mjs event question` or `event answer`
you write in an example takes its JSON on stdin (D19).

## Verification

- `mise x -- mise run code:format`, `mise x -- mise run code:lint` and
  `mise x -- mise run p:plugins:check` pass.
- `grep -rn "asks nothing\|Never ask\|Autonomous\|unattended" plugins/vwf/skills/execute/SKILL.md plugins/vwf/skills/execute/references plugins/vwf/assets/execute-stages.md plugins/vwf/assets/format-check.md`
  finds no line that says a run never asks the user. A line about the session
  question or a skill invoked with a do-not-ask preference can stay.
- `grep -c "questions.md" plugins/vwf/skills/execute/SKILL.md` is at least 2.

## Guardrails

- Do not touch `workflows/**`, `agents/**`, `references/action-log.md` or
  `scripts/**` (U1, U4, U5).
- `plugins/**/*.md` is not formatted by dprint: match each file's fold width by
  hand. Keep SKILL.md's frontmatter strict YAML.
- Remove no rule that this plan does not replace; a rule you move goes to
  `questions.md` word for word.
- Delete with `rm`, never `git rm`.

## Commit

`feat: ask the user when the plan is silent, in place of leaving a gap`
