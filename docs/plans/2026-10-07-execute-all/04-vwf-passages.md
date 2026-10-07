# U4 — the other vwf passages follow

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/plan-management/**`,
  `plugins/vwf/skills/recall/SKILL.md`, `plugins/vwf/skills/handoff/SKILL.md`,
  `plugins/vwf/skills/feedback/SKILL.md`,
  `plugins/vwf/assets/execute-stages.md`,
  `plugins/vwf/assets/templates/project-claude.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** each passage index.md's Facts list names in these files.

## Ruling

> - Decision E2: `/vwf:execute all` calls `plan-management next`, dispatches one
>   runner, waits for it, and repeats until nothing is runnable.
> - Decision E7: Plain `/vwf:execute <folder>` and `next` are unchanged.

Reversal, confirmed: "a fresh session" becomes "a fresh context: a fresh
session, or a runner that `all` dispatches".

## Edits

1. **plan-management** — the caller table (`SKILL.md:422-428`): execute's `next`
   row says "in its `next` and `all` modes"; `references/plan-index.md` `:120`,
   `:129` likewise.
2. **recall** (`:135-136`), **handoff** (`:126`, `:186`), **feedback** (`:210`),
   **`assets/templates/project-claude.md:13`** — wherever a launch line or
   "fresh session" is stated, the reversal's wording, and `all` beside `next`
   where the queue is offered.
3. **`assets/execute-stages.md:25-26`** — add `execute-runner` to the stage
   table, dispatched only by `all`.

## Verification

- `mise run p:plugins:check` green.

## Guardrails

- Touch nothing outside Owns; `skills/execute/` is U2's.
- `plugins/**/*.md` is not formatted — match the fold width by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: vwf's launch lines and queue passages name /vwf:execute all`
