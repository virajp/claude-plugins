# U2 — the planners record every answer

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-plan/SKILL.md`,
  `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/assets/plan-interview.md`,
  `plugins/vwf/assets/templates/plan-folder.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/execute/SKILL.md` (read only — the executor
  U1 is rewriting in the same wave; describe its new behaviour from this file's
  ruling, not from that file).

## Ruling

> **Goal.** `/vwf:plan` and `/vwf:change-plan` record an answer to every
> question a run could raise, and `/vwf:execute` asks nothing at run time.

> - Decision D1: Every after-landing step is `run` or dropped; the `ask` mode is
>   retired.
> - Decision D10: The planners' self-review gains a line — every Consent row
>   carries an answer, and no After landing step carries a mode other than
>   `run`.

Reversal 1, confirmed: 2026-09-17 ruling 8 — "stops once before each `ask` step"
— is retired. Ruling 9 stands: a release the user names at the release-intent
question and records as a `run` step is authorised.

## Edits

1. **`assets/plan-interview.md`** — item 17 (`:139-145`): each proposed step is
   confirmed as `run` or dropped; a step the user wants to check first is
   dropped and run by hand later. Item 18 (`:146-157`): a release recorded `run`
   is authorised; a release with no step is intent — the change waits for a
   later release. Remove every `ask` sentence. Add, under E or G, that the
   interview is not done while any question the run would otherwise raise is
   unanswered.
2. **`skills/change-plan/SKILL.md`** — §4(b) (`:170-176`) and §4(c) (`:187-193`,
   "intent, not authorisation" at `:190`): the same as item 17 and 18. §7
   self-review: add D10's line.
3. **`skills/plan/SKILL.md`** — `:336-340` ("each carrying `run` or `ask`"):
   `run` only. Its self-review: add D10's line.
4. **`assets/templates/plan-folder.md`** — Consent row `:62` reads `run`; the
   note `:66-78` drops `ask`; the After landing table `:185-190` — Mode column
   `run`, note "a step is `run`, or it is not in the table".

## Verification

- `mise run p:plugins:check` green.
- `grep -nE 'ask step|run / ask|or .ask.|recorded .ask.|intent, not authorisation' <each owned file>`
  returns nothing.

## Guardrails

- Do not touch `skills/execute/` (U1) or `skills/plan-management/` (U3); report
  their passages as `DOCS FALSIFIED:`.
- Keep the Consent and After landing block headings and column order exactly —
  execute parses them.
- `plugins/**/*.md` is not formatted — match the surrounding fold width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: the planners record every answer — after-landing steps are run or dropped`
