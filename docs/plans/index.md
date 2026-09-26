# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                             | Kind   | Plan                                                                               | Target repo | Priority | Status   | Requires | Backlog     |
| -------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- | ----------- | -------- | -------- | -------- | ----------- |
| docs/plans/2026-09-25-partial-backlog-items        | change | partial backlog items — a plan that lands one piece leaves its item Partially done | —           | 10       | COMPLETE | —        | B52         |
| docs/plans/2026-09-26-mise-lock-honoured           | change | mise lock honoured — setup:all installs from the lockfile, --upgrade moves it      | —           | 10       | COMPLETE | —        | B54 (piece) |
| docs/plans/2026-09-26-mise-conf-d-layout           | change | mise conf.d layout — section files, one lock for every environment                 | —           | 10       | APPROVED | —        | B54 (piece) |
| docs/plans/2026-09-26-mise-lock-sidecar-exclusions | change | mise lock sidecar exclusions — no formatter or hook rewrites .config/mise/locks/   | —           | 10       | APPROVED | —        | B69         |
