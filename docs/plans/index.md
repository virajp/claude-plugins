# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                         | Kind   | Plan                                                                                                                  | Target repo | Priority | Status   | Requires                                                                 | Backlog                  |
| ---------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- | ----------- | -------- | -------- | ------------------------------------------------------------------------ | ------------------------ |
| docs/plans/2026-09-26-init-commits-the-lock    | change | init commits the lock — the first CI run of a shaped repo finds its mise lock                                         | —           | 60       | COMPLETE | 2026-09-26-tool-config-hygiene                                           | B67                      |
| docs/plans/2026-09-26-tool-config-gates        | change | tool-config gates — dprint, pre-commit, gitleaks and grype move into stackgen:tool-config                             | —           | 40       | COMPLETE | 2026-09-26-tool-config-mise                                              | B66 (piece), B72 (piece) |
| docs/plans/2026-09-26-tool-config-hygiene      | change | tool-config hygiene — git, graphify and renovate move into stackgen:tool-config; init fetches no bundle               | —           | 50       | COMPLETE | 2026-09-26-tool-config-gates                                             | B66, B72                 |
| docs/plans/2026-09-28-one-pin-and-tracked-lock | change | one pin per tool and a tracked lock — tool-config asks which version to keep, init never leaves the mise lock ignored | —           | 80       | COMPLETE | 2026-09-26-init-commits-the-lock, 2026-09-27-dash-names-and-mise-ignores | —                        |
