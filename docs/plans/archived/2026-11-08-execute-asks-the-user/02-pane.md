# U2 — Show a waiting state in the progress pane

- **Read first:** `plugins/vwf/hooks/monitor/plan.ts`, `register.tsx`,
  `view.tsx` and `plan.test.ts`, top to bottom, before editing.
- **Lazy-load:** `.claude/skills/vwf-plugin/SKILL.md` lines 398-452 (the pane
  and its local gates); `.claude/skills/plugin-authoring/SKILL.md` (the gates of
  a hooks module); `pane.test.tsx`, `refresh.test.tsx`, `agents.test.tsx`.

## Ruling

> D10 — While the plan's action log has a `question` event with no later
> `answer` event of the same id, the pane shows the phase `question`: the text
> `waiting for your answer` and the question text, and never
> `paused or stopped`, however old the last line is.

> D19 — The question and answer events take JSON on stdin, as row and gap do,
> so their strict schemas run: `log.mjs event question` with one JSON object on
> stdin, and `log.mjs event answer` the same. This replaces the --key command
> lines of D5; the keys are unchanged.

So a `question` line carries `id` (`Q<n>`), `unit` and `text`, and an `answer`
line carries `id` and `decision` (`D<n>`).

> D21 — Open versus answered comes only from the question and answer events: a
> question event with no later answer of the same id is open. The gap event of
> class question is written only when a question goes into the folder gaps list
> unanswered (D7), as every gaps append already writes one gap event. The pane
> and summary do not use it for the open test.

> D22 — The orchestrator (a runner, under all) gives each question a plan-wide
> id Q<n>, one past the highest question id in the plan action log, and uses it
> in the question and answer events. The event id pattern is ^Q[0-9]+$, and
> the owner goes in the unit key.

> D23 — The owner is the unit the question is about when there is one.
> Otherwise it is the stage name: setup, acceptance, ux, or W<n> for a wave.
> The question event unit key takes either form
> (^(U[0-9]+|W[0-9]+|setup|acceptance|ux)$).

> D37 — An unanswered question keeps its id. A resume asks it again under that
> same id and writes the answer event for it, which closes it in the pane and
> the summary. A stopped run logs run.end, and the pane phase ended wins over
> question, so a stopped run does not show a wait.

> D40 — (1) U2 also owns plugins/vwf/types/index.d.ts, to add question to the
> RunPhase type; it only adds.

> D41 — The question phase holds only while the run that asked is still going:
> the open question event comes after the last run.start and no run.end
> follows it. When a run.end follows the open question, the pane shows the
> phase it shows today (paused, or ended from the folder status) and adds one
> line: open question: Q<n>, asked at the resume. This replaces the D37
> sentence that a stopped run shows no wait because ended wins.

> D44 — (6) The owner pattern is
> ^(U[0-9]+|W[0-9]+|setup|renders|acceptance|ux|reconcile)$. (10) U2
> Verification and K1 use claude plugin validate --strict plugins/vwf beside
> claude plugin test plugins/vwf.

> D25 — Accepted. The pane steps aside while the dialog is on screen, and shows
> the waiting state at all other times. U2 does not change the hook at
> register.tsx:993-1004. The tests cover the state, not the dialog.

> D13 — teams. U1 defines the two events above; their names and keys are
> fixed. Do not wait for U1. The events carry JSON (D19): read the keys `id`,
> `unit`, `text` and `decision` from the log line.

## Edits

1. **`plugins/vwf/hooks/monitor/plan.ts`** — where the pane reads the action
   log, collect the open questions: each `question` event whose `id` no later
   `answer` event carries, with its `unit` and `text`. In `phaseOf`
   (lines 234-258), return a new phase `question` per D41: an open question
   after the last `run.start` with no `run.end` after it. It wins over `live`
   and `paused`, and loses to `ended`. When a `run.end` follows an open
   question, keep today's phase and expose the open ids, so the view adds the
   line of D41. Export the open questions with the state the view reads.
   Add `"question"` to `RunPhase` in `plugins/vwf/types/index.d.ts` (line 8),
   and add the open-questions field there; change nothing else in that file.
2. **`plugins/vwf/hooks/monitor/register.tsx`** — handle the `question` phase
   wherever a phase is switched on (around lines 224-231, 277-280 and
   1207-1208): a distinct colour that is not the red of `unresolved`, and the
   line `waiting for your answer`. Do not change the `AskUserQuestion` hook at
   lines 993-1004, and do not reuse the `waiting` value, which means the queue
   (`claim`, `next`).
3. **`plugins/vwf/hooks/monitor/view.tsx`** — render the `question` phase: the
   line `waiting for your answer`, then one line per open question,
   `<id> <unit> — <text>`, cut to the pane width. The owner can be a unit, a
   wave (`W2`) or a stage (`setup`).
4. **`plugins/vwf/hooks/monitor/plan.test.ts`** and the pane tests — add cases:
   an open question gives the phase `question` even when the last log line is
   older than `FRESH_MS`; an answered question gives the phase it gave before;
   an ended run stays `ended`; an open question followed by `run.end` on a
   RUNNING folder shows `paused` plus the line
   `open question: Q<n>, asked at the resume`; a question logged twice under one id and then
   answered once is closed; the view shows `waiting for your answer` and the
   question text.

## Verification

- `claude plugin test plugins/vwf` passes from the worktree root, and the new
  cases run.
- `mise x -- mise run code:format` and `mise x -- mise run p:plugins:check`
  pass.
- `claude plugin validate --strict plugins/vwf` passes from the worktree root.

## Guardrails

- Do not touch `plugins/vwf/skills/execute/**` or `plugins/vwf/hooks/action-log.mjs`
  (U1, U3).
- Keep the state contract that the manifest's `types` key names: add a field,
  never rename or remove one.
- Delete with `rm`, never `git rm`.

## Commit

`feat: show in the progress pane that a run waits for an answer`
