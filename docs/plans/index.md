# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                         | Kind   | Plan                                                                 | Target repo | Priority | Status   | Requires                      | Backlog |
| ---------------------------------------------- | ------ | -------------------------------------------------------------------- | ----------- | -------- | -------- | ----------------------------- | ------- |
| `docs/plans/2026-09-20-init-editor-dedupe`     | change | init editor dedupe — a hand key and the block never both carry a key | —           | 10       | APPROVED | 2026-09-20-init-forge-pass    | B28     |
| `docs/plans/2026-09-20-setup-reshape-triggers` | change | setup reshape triggers — every structural change re-checks the shape | —           | 20       | APPROVED | 2026-09-20-init-editor-dedupe | B28     |
