# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` and
`/vwf:execute all` read to pick the next runnable plan.

## Plans

| Folder                                                | Kind   | Plan                            | Target repo | Priority | Status   | Requires                                   | Backlog     |
| ----------------------------------------------------- | ------ | ------------------------------- | ----------- | -------- | -------- | ------------------------------------------ | ----------- |
| docs/plans/2026-10-08-mockups-served-at-a-url         | change | Mockups served at a URL         | —           | 10       | RUNNING  | —                                          | B91 (piece) |
| docs/plans/2026-10-08-execute-renders-served-at-a-url | change | Execute renders served at a URL | —           | 20       | APPROVED | 2026-10-08-mockups-served-at-a-url         | B91 (piece) |
| docs/plans/2026-10-08-typescript-ux-gate-renders      | change | TypeScript ux-gate renders      | —           | 30       | APPROVED | 2026-10-08-execute-renders-served-at-a-url | B91         |
| docs/plans/2026-10-08-release-levels-recorded         | change | Release levels recorded         | —           | 40       | APPROVED | 2026-10-08-typescript-ux-gate-renders      | B96 (piece) |
| docs/plans/2026-10-08-release-tasks-bump              | change | Release tasks bump              | —           | 50       | APPROVED | 2026-10-08-release-levels-recorded         | B96         |
