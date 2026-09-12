# U4 — This repo's own `setup/ai`

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `.config/mise/tasks/setup/ai`. Touch nothing outside this list.
- **Model:** opus
- **Read first:** the owned file, then U1's landed
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/ai`
  as committed by wave 1.
- **Lazy-load:** none.

## Ruling

Quoted from index.md:

> **7. This repo adopts.** `.config/mise/tasks/setup/ai` becomes a byte copy of
> the pack's; both marked positions stay as shipped (this repo requires `vwf`
> and `stackgen` only).

## Edits

1. `cp` the landed pack file over `.config/mise/tasks/setup/ai`; set the exec
   bit. No hand edits.

## Verification

- `cmp .config/mise/tasks/setup/ai plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/ai`
  is silent.
- `test -x .config/mise/tasks/setup/ai`.
- `mise tasks --hidden | grep -q 'setup:ai'`.
- `mise run setup:ai --inventory` on this machine exits 0 and prints rows only
  (it reads; it installs nothing). Do **not** run the task without `--inventory`
  here — that reaches the real `~/.claude`.
- `mise x -- mise run code:precommit` twice, clean on the second.

## Guardrails

- Copy, do not retype.
- Never run `mise run setup:ai` (no flag) in this unit: the real config dir is
  not a test bed.
- Delete with `rm`, never `git rm` (nothing to delete).

## Commit

`ops: this repo's setup:ai is the pack's` — written by the orchestrator after
the wave gate. Type `ops`; no scope.
