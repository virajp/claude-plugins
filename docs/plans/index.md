# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                                 | Kind   | Plan                                                                                | Target repo | Priority | Status   | Requires                         | Backlog |
| ------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------- | ----------- | -------- | -------- | -------------------------------- | ------- |
| `docs/plans/archived/2026-09-20-pack-intent-rendering` | change | pack intent rendering — conditional files, the editor split, one exclusion set      | —           | 50       | COMPLETE | 2026-09-20-branch-model          | B28     |
| `docs/plans/2026-09-22-persisted-answers`              | change | persisted answers — the four conditional axes recorded, every caller evaluates them | —           | 60       | APPROVED | 2026-09-20-pack-intent-rendering | —       |
