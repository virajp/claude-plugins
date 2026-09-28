# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                         | Kind   | Plan                                                                                                                  | Target repo | Priority | Status   | Requires                                                                 | Backlog |
| ---------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- | ----------- | -------- | -------- | ------------------------------------------------------------------------ | ------- |
| docs/plans/2026-09-28-one-pin-and-tracked-lock | change | one pin per tool and a tracked lock — tool-config asks which version to keep, init never leaves the mise lock ignored | —           | 80       | COMPLETE | 2026-09-26-init-commits-the-lock, 2026-09-27-dash-names-and-mise-ignores | —       |
