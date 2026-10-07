# U1 — the execute-runner agent

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/agents/execute-runner.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/agents/execute-coder.md` (the frontmatter shape,
  read only).

## Ruling

> - Decision E1: New agent `plugins/vwf/agents/execute-runner.md`: tools Agent,
>   Skill, Bash, Read, Write, Edit, Grep, Glob, TaskOutput, TaskStop and the
>   mempalace names the execute agents carry; `model: opus`; handed the folder
>   and the path to execute's `SKILL.md`, it follows that file for that one
>   folder.
> - Decision E6: The runner returns exactly five lines — `PLAN:`, `OUTCOME:`
>   (`COMPLETE`, `COMPLETE with gaps`, `STOPPED`), `DETAIL:` (the Status block
>   detail line), `RESUME:` (the resume command or `none`), `ENDS RUN:`
>   (`yes`/`no`).

## Edits

1. **`plugins/vwf/agents/execute-runner.md`** — frontmatter:
   `name:
   execute-runner`; a folded `description` saying it is invoked only
   by `/vwf:execute all`, one plan per dispatch — do not delegate to it for
   general tasks; `tools:` per E1, the mempalace names copied from
   `execute-coder.md`; `model: opus`. Body: read the `SKILL.md` path the prompt
   names, top to bottom, and run it as the orchestrator for the one folder named
   — runner mode as that file defines it; ask the user nothing; never read unit
   work inline; return exactly E6's five lines and nothing else.

## Verification

- `mise run p:plugins:check` green (strict YAML; rule 7 needs U2's backticked
  reference, so a rule-7 orphan finding before U2 lands is expected — name it in
  `DECIDED:`).

## Guardrails

- Touch nothing outside the one file.
- No colon-space inside a plain YAML scalar.

## Commit

`feat: add the execute-runner agent — one plan per dispatch`
