# U5 — Give the agents, the template and the planners the QUESTION block

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/execute/references/questions.md` (U3
  creates it: read only, cite it by its plugin-root path);
  `.claude/skills/plugin-authoring/references/checks.md` rules 4 and 7.

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
> the message carrying each question id and its answer.

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

> D17 — The planners keep their full interview: they still ask every question
> they can before the run, and a run question exists only for what the plan
> missed.

> D37 — An unanswered question keeps its id. Its open gaps entry text starts
> QUESTION Q<n>: (not QUESTION: ), so it carries the id.

> D40 — (6) Every gap text prefix in U3 and U5 is QUESTION Q<n>: per D37. (7)
> The U5 grep check covers only the five execute-* agents and the template;
> other agents keep their own GAPS lines.

> D34 — U5 owns plugins/vwf/skills/verify/SKILL.md. Verify reads the QUESTION
> lines in place of the old line and reports them as it reports the old line
> today. Verify does not become interactive in this plan.

> D13 — teams. U3 writes the protocol; send it a boundary question if a
> passage you write must match a section of `questions.md`.

## Edits

1. **`plugins/vwf/agents/execute-coder.md`** — *Blueprint/plan gaps* (47-55):
   replace "proceed on the most idiomatic assumption" with D4 and the QUESTION
   lines of D3. Add: when resumed with answers, apply each under the same TDD
   cycle, then return the whole block again. The return contract (108-123)
   replaces `GAPS:` with the QUESTION lines, or `QUESTION: none`. A dependency
   the plan does not list is a question, not a gap.
2. **`plugins/vwf/agents/execute-code-reviewer.md`** and
   **`plugins/vwf/agents/execute-security-reviewer.md`** — the `SPEC/PLAN GAPS:`
   lines (126, 162; 87, 119) become QUESTION lines per D3; the "turn ends with
   the block" wording (168-171; 124-126) allows them inside the block. The
   reviewer is never resumed: the orchestrator asks and routes the answer.
3. **`plugins/vwf/agents/execute-acceptance-verifier.md`** and
   **`plugins/vwf/agents/execute-ux-reviewer.md`** — the gap lines (72, 88;
   117, 135, 142) become QUESTION lines per D3.
4. **`plugins/vwf/agents/plan-rulings-reviewer.md`** — line 21: `/vwf:execute`
   asks the user only what the plan missed, so each gap found here is a
   question that a run would otherwise stop to ask.
5. **`plugins/vwf/assets/templates/plan-folder.md`** —
   - line 389: a wave gate reads every report for QUESTION lines, not
     `UNRESOLVED:`.
   - line 398: replace "`/vwf:execute` asks nothing at run time" with: a step
     the interview did not confirm `run` is not in the list.
   - `decisions` (479-483): the run appends one entry per answer, per the
     execute skill's `references/questions.md`.
   - `gaps` (497-507): `text` is an unanswered question (starting
     `QUESTION Q<n>: `), a stop answer (starting `STOPPED: `), or how the run
     closed a point; a run takes
     no assumption.
   - the *Unit contract* (582-592): the block of D3 in place of the `GAP:` and
     `UNRESOLVED:` lines, and a paragraph for D4 and the resume.
6. **`plugins/vwf/assets/plan-interview.md`** — lines 188-193: keep the bar
   that the interview leaves no question the run would raise; say that a run
   asks only what the plan missed (D17).
7. **`plugins/vwf/skills/plan/SKILL.md`** — lines 7 and 26: replace
   "unattended" with "in a fresh context", and say that a run asks only what
   the plan missed. Line 520 ("`/vwf:execute` asks none") takes the D17
   wording too (D28: "U5 edit 7 also covers line 520 with the D17 wording, and
   U5 grep check adds the pattern asks none.").
8. **`plugins/vwf/skills/change-plan/SKILL.md`** — lines 5 and 20-22: the bar
   is a plan that `/vwf:execute` can run without a question; a run that meets
   one asks, and that is the planner's miss. Keep the frontmatter
   `description` within its current meaning; edit it only if it says
   "no one present".
9. **`plugins/vwf/skills/change-plan/references/self-review.md`** — lines 44
   and 51: replace "asks nothing at run time" and "`/vwf:execute` asks none"
   with the D17 wording.
10. **`plugins/vwf/skills/verify/SKILL.md`** — line 136 and every other
    passage that reads the acceptance verifier's `SPEC/PLAN GAPS:` line: read
    its `QUESTION Q<n>:`, `OPTIONS Q<n>:` and `WHY Q<n>:` lines instead, and
    report them as verify reports that line today (D34). Change nothing else.

## Verification

- `mise x -- mise run code:format` and `mise x -- mise run p:plugins:check`
  pass (rules 4 and 7 cover the agent frontmatter and cross-references).
- `grep -n "GAPS:\|^ *GAP:\|UNRESOLVED:" plugins/vwf/agents/execute-coder.md plugins/vwf/agents/execute-code-reviewer.md plugins/vwf/agents/execute-security-reviewer.md plugins/vwf/agents/execute-acceptance-verifier.md plugins/vwf/agents/execute-ux-reviewer.md plugins/vwf/assets/templates/plan-folder.md`
  finds only the D3 rule for older folders.
- `grep -rn "asks nothing at run time\|asks none\|unattended" plugins/vwf/assets/templates/plan-folder.md plugins/vwf/assets/plan-interview.md plugins/vwf/skills/plan/SKILL.md plugins/vwf/skills/change-plan/SKILL.md plugins/vwf/skills/change-plan/references/self-review.md`
  finds nothing in an owned file.

## Guardrails

- Do not touch `plugins/vwf/skills/execute/**` (U1, U3, U4) or
  `execute-runner.md` (U4).
- Keep every agent's and skill's frontmatter strict YAML; change no `tools:`
  line.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: return plan holes as questions from every execute agent`
