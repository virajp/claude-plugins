# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos. The first table lists the flat cycle
plans `/vwf:plan` writes, each in the repo whose code it changes; the second is
the queue of change-plan folders, which `/vwf:change-execute next` reads to pick
the next runnable plan.

## Cycle plans

| Plan | Target repo | Status |
| ---- | ----------- | ------ |

## Change plans

| Folder | Plan | Priority | Status | Requires | Backlog |
| ------ | ---- | -------- | ------ | -------- | ------- |
