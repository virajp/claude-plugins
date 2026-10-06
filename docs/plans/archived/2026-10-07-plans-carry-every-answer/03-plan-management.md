# U3 — plan-management archives without asking when told to

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/plan-management/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing — `SKILL.md`
  and `references/plan-index.md`.

## Ruling

> - Decision D1: Every after-landing step is `run` or dropped; the `ask` mode is
>   retired.
> - Decision D8: Execute calls `archive` with the declared preference "do not
>   ask"; on any completion warning the folder is not archived, the row still
>   goes `COMPLETE`, and the report names the warning and the archive request to
>   make later.

## Edits

1. **`SKILL.md` — `archive`** (`:249-275`, and "Every completion warning asks"
   at `:443-444`): add the declared preference "do not ask". With it, a
   completion warning does not archive and does not ask — the verb returns the
   warning to its caller, leaving the folder live and the row as the caller set
   it. Without it, the verb asks as today (a person asking to archive).
2. **`SKILL.md`** — the caller table (near `:422-428`): execute's `archive` row
   names the preference.
3. **`references/plan-index.md:268-275`** — its After landing passage: a step is
   `run`; drop `ask`.
4. **`unclaim`** (`SKILL.md:171-173`) stays a person's request that asks once —
   add one sentence that execute never invokes it.

## Verification

- `mise run p:plugins:check` green.
- `grep -nE 'ask step|run / ask|or .ask.|recorded .ask.' plugins/vwf/skills/plan-management -r`
  returns nothing.

## Guardrails

- Do not touch `skills/execute/` (U1) or the planners (U2); report their
  passages as `DOCS FALSIFIED:`.
- `plan-management` still never commits.
- `plugins/**/*.md` is not formatted — match the surrounding fold width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: plan-management archive takes a do-not-ask preference`
