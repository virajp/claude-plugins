# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                              | Kind   | Plan                                                                                                    | Target repo | Priority | Status  | Requires | Backlog |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- | ----------- | -------- | ------- | -------- | ------- |
| `docs/plans/2026-09-17-review-rows` | change | Review rows — the plan places the code and security review; after-landing steps run on recorded consent | —           | 10       | RUNNING | —        | —       |
