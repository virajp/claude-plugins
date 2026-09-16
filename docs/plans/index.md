# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` and
`/vwf:change-execute next` read to pick the next runnable plan of their kind.

## Plans

| Folder                               | Kind   | Plan                                               | Target repo | Priority | Status  | Requires                | Backlog |
| ------------------------------------ | ------ | -------------------------------------------------- | ----------- | -------- | ------- | ----------------------- | ------- |
| `docs/plans/2026-09-16-one-executor` | change | One executor — /vwf:execute runs every plan folder | —           | 10       | RUNNING | 2026-09-16-plan-folders | —       |
