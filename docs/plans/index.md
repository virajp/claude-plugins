# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                         | Kind   | Plan                                                                                                                  | Target repo | Priority | Status   | Requires                                                                 | Backlog                  |
| ---------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- | ----------- | -------- | -------- | ------------------------------------------------------------------------ | ------------------------ |
| docs/plans/2026-09-25-partial-backlog-items    | change | partial backlog items — a plan that lands one piece leaves its item Partially done                                    | —           | 10       | COMPLETE | —                                                                        | B52                      |
| docs/plans/2026-09-26-mise-lock-honoured       | change | mise lock honoured — setup:all installs from the lockfile, --upgrade moves it                                         | —           | 10       | COMPLETE | —                                                                        | B54 (piece)              |
| docs/plans/2026-09-26-mise-conf-d-layout       | change | mise conf.d layout — section files, one lock for every environment                                                    | —           | 10       | COMPLETE | —                                                                        | B54 (piece)              |
| docs/plans/2026-09-26-init-commits-the-lock    | change | init commits the lock — the first CI run of a shaped repo finds its mise lock                                         | —           | 60       | COMPLETE | 2026-09-26-tool-config-hygiene                                           | B67                      |
| docs/plans/2026-09-26-tool-config-gates        | change | tool-config gates — dprint, pre-commit, gitleaks and grype move into stackgen:tool-config                             | —           | 40       | COMPLETE | 2026-09-26-tool-config-mise                                              | B66 (piece), B72 (piece) |
| docs/plans/2026-09-26-tool-config-hygiene      | change | tool-config hygiene — git, graphify and renovate move into stackgen:tool-config; init fetches no bundle               | —           | 50       | COMPLETE | 2026-09-26-tool-config-gates                                             | B66, B72                 |
| docs/plans/2026-09-28-one-pin-and-tracked-lock | change | one pin per tool and a tracked lock — tool-config asks which version to keep, init never leaves the mise lock ignored | —           | 80       | COMPLETE | 2026-09-26-init-commits-the-lock, 2026-09-27-dash-names-and-mise-ignores | —                        |
