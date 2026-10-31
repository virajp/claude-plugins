# U1 — The progress pane follows every unit, and its defects are fixed

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/hooks/monitor/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, and the two review logs
  `docs/plans/2026-10-21-execute-monitor-in-vwf/engine/U2-1.log` and `U2-2.log`,
  before editing.
- **Lazy-load:** `plugins/vwf/skills/execute/references/edit-unit.md`,
  `plugins/vwf/skills/execute/references/review-unit.md`,
  `plugins/vwf/assets/membership.md`, the engine types the `claude-code` import
  names (run `claude plugin validate plugins/vwf` for what the module hooks and
  calls)

## Ruling

> - Decision 1: Follow an agent when its `name` is a unit id of the current plan
>   (`U<n>`) or a wave-review name (`R<wave>`, `R<wave>-late`, `R-late`), or its
>   type starts with `vwf:execute-` (the runner excepted). Map it to a unit by
>   its name; a coder by the unit file in its prompt; a review-row reviewer by
>   the row id in its prompt, read before any file name, so a reviewer never
>   counts against the units it covers. Do not adopt an agent of an earlier plan
>   of an `all` run.
> - Decision 2: One line per wave review under the unit rows — status, start,
>   end, time — that opens its transcript like a unit row; not a segment of the
>   progress bar.
> - Decision 3: The run ends when the plan's Status reads `COMPLETE` or
>   `BLOCKED`, or the folder moved to `docs/plans/archived/`. A main-loop turn
>   that ends with no live agent only marks the run waiting; the pane keeps
>   reading, and ends the run after 10 minutes with no change in the plan file
>   or the agents.
> - Decision 4: The refresh merges into the current state inside the `update`
>   callback (agents and plans by id), and `turn.complete` goes through `poke`;
>   an agent seen before and missing from `agent.list` is `completed` with
>   `endedAt` now; keep the known `index.md` path while it exists, search only
>   when it is gone; an `isOpen` state gates the compact tool rows, and
>   `AskUserQuestion` reopens only a pane it closed; `void poke($)` in
>   `tool.call`; the row id before the file name in `unitFor`; escaped pipes
>   split correctly.
> - Decision 5: With no folder named and several `RUNNING` rows, prefer the row
>   whose `index.md` is in this session's checkout or one of its worktrees;
>   otherwise set a `problem` that asks for `/vwf-monitor <folder>`; re-resolve
>   while the pick was a guess.
> - Decision 6: Resolve the base repo per `membership.md` (`.config/vwf.yaml`
>   here, else the membership `host:`, else a linked worktree's main checkout);
>   read the plan index there; search the base, each `members:` `path:` and
>   their worktrees. Read the paths with a small line reader — no YAML library.
> - Decision 7: The 3-second timer runs only while a run is live, and stops when
>   the run ends.
> - Decision 8: One new test case for each of rulings 1 to 7, in the existing
>   test files or a new `agents.test.tsx` under `hooks/monitor/`.
> - Decision 12: Decision 4's known `index.md` path is kept only while no linked
>   worktree for the run exists. A main-checkout copy is known until then; once
>   the run's worktree exists, its copy replaces the main-checkout copy on the
>   next refresh. Add one test: a run whose pane first finds the main-checkout
>   copy reads the worktree copy once that worktree appears.

## Edits

The facts section of `index.md` maps each defect to its line in `R`
(`register.tsx`) and `P` (`plan.ts`).

1. **Matching (decision 1)** — replace the `AGENT_PREFIX` filters at `R:240` and
   `R:364-367` with one predicate over `name`, type and the current plan's unit
   ids. In `P`, `unitFor` takes the agent's `name` first, then a row id (`U<n>`,
   `U<n>-late<k>`) found in the prompt, then a unit file name; a wave-review
   name maps to its wave, not to a unit. An agent spawned while an earlier plan
   of an `all` run was current is never adopted into the new one.
2. **Wave-review lines (decision 2)** — keep the wave reviews in the run state
   beside the unit agents; draw one keyed `Button` line per wave review under
   the unit rows, its press opening the transcript as a unit row's does
   (`$.ui.view`). The progress bar keeps one segment per unit.
3. **Run end (decision 3)** — `turn.complete` (`R:416-438`) no longer ends the
   run by itself. The run ends when the refresh reads `COMPLETE` or `BLOCKED`,
   or finds the folder only under `docs/plans/archived/`, or when 10 minutes
   pass with no change in the plan file text or the agent set after a main-loop
   turn ended with no live agent. Show the waiting state in the pane's status
   line.
4. **The seven small fixes (decision 4)** — at the lines the facts give:
   `R:184,280` and `R:422`; `R:250-261`; `R:145-159`; `R:353-355,441-454` and
   the close paths; `R:341`; `P:113-123`; `P:30-36`.
5. **Several `RUNNING` rows (decision 5)** — at `R:199-206` and `P:100-105`.
6. **Member repos (decision 6)** — at `R:119-142,197-205`: a base-repo resolver
   and a `members:` `path:` reader, both plain functions in `P` (no `$`), so
   `plan.test.ts` tests them.
7. **Timer (decision 7)** — move the `$.clock.every` from `session.start`
   (`R:292`) to the run's start; cancel the returned timer when the run ends,
   and before a new run starts.
8. **Tests (decision 8)** — one new case per ruling, each failing before its
   fix. Keep the 6 existing tests green.

## Verification

- `claude plugin test plugins/vwf` — green: the 6 existing tests and the new
  ones.
- `claude plugin validate --strict plugins/vwf` — passes.
- `mise run p:plugins:check` — green.
- `grep -n "AGENT_PREFIX" plugins/vwf/hooks/monitor/register.tsx` — no filter
  that excludes `general-purpose` unit agents is left.

## Guardrails

- Touch nothing outside `plugins/vwf/hooks/monitor/**`. Do not edit
  `plugins/vwf/types/index.d.ts`, `plugins/vwf/hooks/hooks.json` or the
  manifest. If a new `$.state` key is needed (for example `isOpen`), keep it in
  a module variable or an existing key, or return `UNRESOLVED:` naming the
  contract change — `types/index.d.ts` is outside this unit's Owns.
- Keep the command `vwf-monitor`, the pane id `vwf-monitor` and the state keys
  `vwf.monitorRun`, `vwf.monitorQuiet`, `vwf.monitorViewing`.
- Write each spacer as `{" "}`, never as an element holding only a space: dprint
  at commit empties such an element.
- No new dependency. The module has no DOM and no Node: reach files and
  processes through `$`.
- Delete with `rm`, never `git rm`.

## Commit

`fix: the progress pane follows every unit, and its review defects are fixed`
