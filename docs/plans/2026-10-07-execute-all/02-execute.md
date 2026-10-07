# U2 — execute gains `all` and runner mode

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/execute/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom.

## Ruling

> **Goal.** Typing `/vwf:execute all` once runs every runnable plan, highest
> priority first, each in its own runner subagent; the loop stops at the first
> point that needs the user; the session keeps only a one-line result per plan.

> - Decision E1: the runner is the agent `execute-runner`, handed the folder and
>   the path to this skill's `SKILL.md`; it follows that file for that one
>   folder.
> - Decision E2: `/vwf:execute all` calls `plan-management next`, dispatches one
>   runner, waits for it, and repeats until nothing is runnable; runners never
>   run in parallel.
> - Decision E3: Any runtime stop — the runner stops; the loop ends, printing
>   its table and the resume command.
> - Decision E4: on a folder whose Consent row "End an `all` run after landing"
>   reads `yes`, `all` ends after that plan and reports "restart, then
>   `/vwf:execute all`".
> - Decision E5: The cap hook pauses a runner as it pauses execute today, which
>   ends the loop; the loop starts no new plan once a cap directive has reached
>   the session; a runner's own context goes unmeasured.
> - Decision E6: The runner returns exactly five lines — `PLAN:`, `OUTCOME:`
>   (`COMPLETE`, `COMPLETE with gaps`, `STOPPED`), `DETAIL:`, `RESUME:`,
>   `ENDS RUN:`; the loop's exit is one table of these plus the stop reason.
> - Decision E7: Plain `/vwf:execute <folder>` and `next` are unchanged;
>   `disable-model-invocation` stays `true`.

Reversal, confirmed: "a session that has done nothing else" becomes "a fresh
context: a fresh session, or a runner that `all` dispatches".

## Edits

1. **`SKILL.md` frontmatter** — `argument-hint` gains `all`; the description
   names `/vwf:execute all`. `disable-model-invocation: true` stays.
2. **`SKILL.md` — Resolve** (near `:77-86`): `$ARGUMENTS` `all` routes to the
   new reference; `<folder>` and `next` unchanged.
3. **`references/all.md`** (new) — the loop (E2–E6): the session must be one
   that has done nothing else; each iteration calls `plan-management next`,
   stops when nothing is runnable, dispatches `execute-runner` with the folder
   and this skill's `SKILL.md` absolute path, records the five-line return; ends
   on `STOPPED`, on `ENDS RUN: yes`, or when a cap directive has reached the
   session; prints the table and the stop reason. **Runner mode**: what a runner
   does differently — nothing but its return (E6); every stop it hits is the
   stop execute already defines.
4. **`SKILL.md:51-52`, `:830`** — the reversal's wording.
5. Reference `execute-runner` in backticks from `SKILL.md` or
   `references/all.md` (checker rule 7).

## Verification

- `mise run p:plugins:check` green, with U1's agent present.
- `grep -n 'all' plugins/vwf/skills/execute/SKILL.md` shows the argument-hint
  and the route.

## Guardrails

- Do not touch `plugins/vwf/agents/` (U1) or any other skill.
- `plugins/**/*.md` is not formatted — match the fold width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: /vwf:execute all runs every runnable plan in its own runner`
