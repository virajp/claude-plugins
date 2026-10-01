# I2 — `setup/precommit` strips raw graphify hooks before unsetting hooksPath

- **Wave:** 1
- **Depends on:** —
- **Model:** opus
- **Kind:** edit
- **Owns:**
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/precommit`

## Ruling

> I6 — `setup/precommit` strips graphify's raw hooks before unsetting
> `core.hooksPath` (B80 item 8).

## Edits

1. Under `--force` with `core.hooksPath` set, unset it first, then run the
   graphify raw-hook strip over `.git/hooks` (today `:45-50` skips when
   `HOOKS_PATH` is set; `:159-161` unsets after).

## Verification

- `mise run p:plugins:shellcheck` green; the full wave gate.

## Commit

`fix: setup:precommit --force strips graphify raw hooks after unsetting hooksPath`
