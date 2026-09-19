# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                              | Kind   | Plan                                                                                              | Target repo | Priority | Status   | Requires | Backlog |
| --------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- | ----------- | -------- | -------- | -------- | ------- |
| docs/plans/2026-09-19-backlog-trim-preserves-status | change | backlog trim preserves Status — snapshot every item before the replace mutation, restore it after | —           | 10       | APPROVED | —        | —       |
