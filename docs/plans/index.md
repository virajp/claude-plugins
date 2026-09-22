# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                    | Kind   | Plan                                                                                | Target repo | Priority | Status   | Requires                         | Backlog |
| ----------------------------------------- | ------ | ----------------------------------------------------------------------------------- | ----------- | -------- | -------- | -------------------------------- | ------- |
| `docs/plans/2026-09-22-persisted-answers` | change | persisted answers — the four conditional axes recorded, every caller evaluates them | —           | 60       | COMPLETE | 2026-09-20-pack-intent-rendering | —       |
