# U1 — execute asks nothing at run time

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/execute/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing — `SKILL.md`
  and every file under `references/`.
- **Lazy-load:** `plugins/vwf/skills/plan-management/SKILL.md` (the `archive`
  and `unclaim` verbs, read only), `plugins/vwf/assets/execute-stages.md` (read
  only).

## Ruling

> **Goal.** `/vwf:execute` asks nothing at run time — it follows the plan, and
> only runtime stops (a failed gate, a dead subagent, a resource cap, a blocking
> gap, a failed landing condition) end a run, each reported with its resume
> command.

> - Decision D1: Every after-landing step is `run` or dropped; the `ask` mode is
>   retired.
> - Decision D2: A failed landing condition, the open gaps and a now-runnable
>   dependent plan are reported and the run stops; a fix goes into the folder
>   and the person re-runs `/vwf:execute <folder>`.
> - Decision D3: Missing target repo — report and stop, naming the missing repo
>   and its clone command.
> - Decision D4: No after-landing step runs on an unmerged branch; the report
>   lists each step with its command, to run after a hand merge.
> - Decision D5: Failed after-landing step — the remaining steps do not run; the
>   report names the failed step, its exit code, and the steps not run.
> - Decision D6: Resume with the worktree gone — the report names the
>   `plan-management unclaim <folder>` request for the person to make; execute
>   never invokes `unclaim`.
> - Decision D7: A folder carrying an `ask` step is refused on a fresh run and
>   on resume alike, naming the planner to re-run.
> - Decision D8: Execute calls `archive` with the declared preference "do not
>   ask"; on any completion warning the folder is not archived, the row still
>   goes `COMPLETE`, and the report names the warning and the archive request to
>   make later.
> - Decision D9: An uncovered irreversible decision, an ambiguous wave order, or
>   blocking format drift ends the run as a blocking-gap stop, reported with
>   what is needed and the resume command.

Reversal 2, confirmed: the Fix first / Reject choice, the offer to close each
gap, and the chain-forward offer of `/vwf:execute <next-folder>` become a
report, and the run stops.

## Edits

Every row of index.md's Facts table "Where `/vwf:execute` waits on the user
today" (rows a–n) is rewritten; row f stays as it is.

1. **`SKILL.md` — description and opening** (`:14`, `:43-45`): the run stops
   only at a runtime stop; drop "or ask" and the stop "before each after-landing
   step whose recorded mode is `ask`". State once, near the top, that execute
   asks the user nothing — every answer is in the folder.
2. **`SKILL.md:99-101`** (row a) — a missing target repo: report the repo and
   its clone command, and stop (D3). No offer.
3. **`SKILL.md:139-140`** (row b) — reword so the report names the unclaim
   request the person can make; no "ask to unclaim" phrasing addressed to the
   run.
4. **`SKILL.md:163-165` and `:180-183`** — the Mode refusal narrows: a mode
   other than `run` (including `ask`) is refused, on resume and on a fresh run,
   naming the planner to re-run (D7).
5. **`SKILL.md:231-235` and `references/format-check.md:24`** (row c) — blocking
   format drift is a blocking-gap stop naming `/vwf:setup`, not an offer (D9).
6. **`SKILL.md:271-274`** (row d) and **`:447-448`** (row e) — an ambiguous wave
   order or an uncovered irreversible decision is a blocking-gap stop (D9):
   commit what is safe, write the gap section, report what is needed and the
   resume command. Remove "Pause and ask".
7. **`SKILL.md:760-761`** (row n) — the landing's `archive` call passes the
   declared preference "do not ask"; on a completion warning the folder stays
   live, the row is `COMPLETE`, and the report names the warning and the archive
   request (D8).
8. **`SKILL.md:798-812`** (row g) — a failed landing condition: the report lists
   what failed and the resume command, and the run stops. Delete Fix first and
   Reject (D2).
9. **`SKILL.md:814-822`** (row h) — list each open gap with the command that
   closes it (`/vwf:blueprint`, `/vwf:plan`); offer nothing (D2).
10. **`SKILL.md:824-831`** (row i) — print the launch line for each dependent
    plan now runnable; offer nothing (D2).
11. **`SKILL.md:833-876`** (rows j, k, l) — After landing: each step is `run`;
    an unmerged branch runs no step and lists each with its command (D4); a
    failed step stops the rest and the report names it, its exit code and the
    steps not run (D5); delete the "offer waiting" passage and every `ask`
    sentence (D1).
12. **`SKILL.md:878-889`** — the doctrine passage: the run stops at the Pause
    Conditions and the final report, nowhere else; drop the `ask` steps.
13. **`SKILL.md:902`** — the "never" list: replace the `ask` line with "Asks the
    user anything at run time".
14. **`references/blocking.md:63-73`** (row m) — on resume with the worktree
    gone, report the `plan-management unclaim <folder>` request and stop; never
    invoke `unclaim` (D6). Also `:72`, `:102`: keep the resume command.
15. Any other passage under `plugins/vwf/skills/execute/` that offers, asks, or
    waits — fold it into a report-and-stop the same way, and name it in a
    `DECIDED:` line.

## Verification

- `mise run p:plugins:check` green (strict-YAML frontmatter, cross-references).
- `grep -rnE 'ask step|run / ask|or .ask.|recorded .ask.|Fix first|offer' plugins/vwf/skills/execute`
  returns only the false positive "stops once at the end", and any "offer" left
  names a report, not a question — list each survivor in `DECIDED:`.
- `disable-model-invocation: true` still at the frontmatter.

## Guardrails

- Do not touch plan-management, the planners, or any doc outside
  `plugins/vwf/skills/execute/` — report them as `DOCS FALSIFIED:`.
- The Pause Conditions and the resource-cap contract stay as they are; only
  their reporting is touched.
- `plugins/**/*.md` is not formatted — match the surrounding fold width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: execute asks nothing at run time — every answer is in the plan`
