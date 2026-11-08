# U1 — Log the question and the answer

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/plan-management/scripts/lib/schema.mjs`
  (read only, for the shape of a strict schema);
  `.claude/skills/plugin-authoring/references/checks.md` rule 16.

## Ruling

> D3 — The unit return block drops the GAP: and UNRESOLVED: lines and gains
> three lines per question, n counting from 1 in the block:
> `QUESTION Q<n>: <the question, readable alone>`,
> `OPTIONS Q<n>: <option 1, the recommendation> | <option 2> [| <option 3> | <option 4>]`
> with two to four options, each with its consequence after an em dash, and
> `WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>`.
> A block with no question carries the one line `QUESTION: none`. The CHANGED,
> DECIDED and DOCS FALSIFIED lines stay. A GAP:, GAPS: or UNRESOLVED: line from
> a folder written before this plan is read as a question with no options, and
> the orchestrator writes the options itself.

> D19 — The question and answer events take JSON on stdin, as row and gap do,
> so their strict schemas run: `log.mjs event question` with one JSON object on
> stdin, and `log.mjs event answer` the same. This replaces the --key command
> lines of D5; the keys are unchanged.

> D20 — As a plain string in the same agent.end gaps list, exactly as a GAP:
> line, with no class. QUESTION: none is not copied. Only the orchestrator
> question and answer events say which questions are open. This replaces the
> hook sentence of D5.

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

> D23 — The question event unit key takes either form
> (^(U[0-9]+|W[0-9]+|setup|acceptance|ux)$).

> D36 — log.mjs gets one verb, next-question, that takes the same plan
> arguments as its other verbs and prints Q<n>: one past the highest question
> id in that plan action log, or Q1 when it has none. It writes nothing. U1
> builds and tests it, U1 documents it in action-log.md, and U3 and U4 cite
> that exact verb. This replaces the choice left open in U1 edit 1.

> D37 — An unanswered question keeps its id. Its open gaps entry text starts
> QUESTION Q<n>: (not QUESTION: ), so it carries the id. A resume asks it again
> under that same id and writes the answer event for it, which closes it in
> the pane and the summary. next-question never issues an id that the log
> already holds.

> D40 — (3) The question section of log.mjs summary is plan-wide, printed once
> after the per-run reports. (4) next-question reads the session active run
> marker, as the event verb does; with no active run it prints an error and
> exits 1. (8) summary is log.mjs:865-912, and its gaps block is 818-850.

> D44 — (1) The stdin check is log.mjs:435-460. (2) U1 rewrites the three
> action-log.md sentences (a log call never stops a run; the log is never an
> input; never read the log for an id): question ids (D22, D36) and the resume
> of D42 are the one place a run reads the log. If next-question fails, the
> orchestrator takes the id one past the highest Q<n> in the folder decisions
> and gaps text, and continues. (3) The orchestrator logs the question event
> before each ask, whether the ask then succeeds or not. (4) The question event
> gains two required keys, options (the raw OPTIONS text) and why (the WHY
> text); a resume or a fresh runner re-asks from them and fills rejected from
> options. (6) The owner pattern is
> ^(U[0-9]+|W[0-9]+|setup|renders|acceptance|ux|reconcile)$.

> D13 — teams. U2 reads the `question` and `answer` events that this unit
> defines; the names and keys are fixed, so do not change them.

## Edits

1. **`plugins/vwf/skills/execute/scripts/log.mjs`** —
   - Add `"question"` to `GAP_CLASS` (line 87).
   - Add two strict schemas to `SCHEMAS`, written the way the `gap` schema is
     written, and make `event question` and `event answer` read one JSON object
     on stdin and check it, as `event row` and `event gap` do (lines 435-460):
     - `question`: `id` (`^Q[0-9]+$`), `unit`
       (`^(U[0-9]+|W[0-9]+|setup|renders|acceptance|ux|reconcile)$`), `text`,
       `options` and `why` (each non-empty), all required.
     - `answer`: `id` (`^Q[0-9]+$`) and `decision` (`^D[0-9]+$`), both required.
   - Do not reserve either name.
   - Add the verb `next-question` (D36, D40): it reads the session's active
     run marker as `event` does, exits 1 with an error when no run is active,
     and prints `Q<n>`, one past the highest `question` id in the log, `Q1`
     for none, and writes nothing. A `question` event whose id the log already
     holds is legal (a resume asks again under the same id, D37); the verb
     counts the id once.
   - In `summary` (lines 865-912, which runs `report()` once per run), add one
     plan-wide section, printed once after every per-run report: one line per
     `question` id in log order across all runs, with its unit, its text cut to one line, and
     `answered: D<n>` or `open`. Print it only when the log has a `question`
     event. An `answer` with no earlier `question` of the same id is a summary
     warning line, not an error.
2. **`plugins/vwf/hooks/action-log.mjs`** — make `gapLines` (lines 97-105)
   also match `^QUESTION Q[0-9]+:`. Each matching line goes into `agent.end`'s
   `gaps` list as a plain string, exactly as a `GAP:` line does. `QUESTION: none`
   matches nothing. Keep `GAP:` and `UNRESOLVED:`. Update the comment at lines
   15-16 to name the three prefixes.
3. **`plugins/vwf/skills/execute/references/action-log.md`** — document the
   `question` and `answer` events with their JSON keys, and when the
   orchestrator writes each (`question` before each ask, whether or not the ask
   succeeds; `answer` once it records the answer). Rewrite the three sentences
   of D44 (2): "A log call never stops a run… skip a call that fails", "The log
   is a record of the run, never an input to it" and "Never read the log for an
   id". Each keeps its rule, save the one exception: question ids and the
   resume's unanswered questions are read from the log, and a failed
   `next-question` falls back to the folder per D44 (2). Document
   the next-id read. Add the class `question` to the gap classes (around line
   109): only for a question that goes into `gaps` unanswered. Say that the hook
   copies a subagent's `QUESTION Q<n>:` lines into `agent.end` like `GAP:`
   lines, and that a `question` with no later `answer` of the same id is an
   open question, which the progress pane shows as a wait.
4. **`scripts/src/execute-log.test.ts`** — add cases, in the style of the
   existing ones:
   - `event question` and `event answer` with a valid JSON object are written;
     a missing key, a bad `id`, a bad `unit` and a bad `decision` are refused.
   - a `unit` of `W2`, `setup` and `reconcile` is accepted; a `question`
     without `options` or `why` is refused.
   - a `gap` event of class `question` is accepted.
   - the hook copies two `QUESTION Q<n>:` lines into `agent.end`'s `gaps`, and
     `QUESTION: none` into nothing; a `GAP:` line still works.
   - `next-question` prints `Q1` on an empty log, `Q3` after `Q1` and `Q2`,
     and still `Q3` after `Q2` was logged a second time.
   - `summary` shows a question asked twice under one id, then answered, as
     one answered line, also when the ask and the answer are in two runs.
   - `next-question` with no active run exits 1.
   - `summary` lists one answered and one open question, and omits the section
     when there is none.

## Verification

- `mise x -- pnpm vitest run scripts/src/execute-log.test.ts` passes.
- `mise x -- mise run code:format` and `mise x -- mise run p:plugins:check`
  pass.
- `grep -n '"question"' plugins/vwf/skills/execute/scripts/log.mjs` finds the
  class and the schema.

## Guardrails

- Do not touch `plugins/vwf/hooks/monitor/**` (U2) or any other execute
  reference (U3).
- `log.mjs` imports only `node:` built-ins and relative paths (rule 16).
- `plugins/**/*.md` is not formatted by dprint: keep the fold width of
  `action-log.md` by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: log the questions a run asks and their answers`
