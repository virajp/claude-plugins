# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                        | Kind   | Plan                                                                                        | Target repo | Priority | Status   | Requires                         | Backlog  |
| --------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- | ----------- | -------- | -------- | -------------------------------- | -------- |
| `docs/plans/2026-09-20-pack-first-run-safety` | change | pack first-run safety — no task clobbers host state; git-config requires a forge identity   | —           | 10       | RUNNING  | —                                | B28      |
| `docs/plans/2026-09-20-init-mode-seam`        | change | init mode seam — three modes from evidence, the stack read, conflicts offered in every mode | —           | 20       | APPROVED | 2026-09-20-pack-first-run-safety | B28      |
| `docs/plans/2026-09-20-init-brownfield-reads` | change | init brownfield reads — root configs, hooks, tasks and .gitignore read first                | —           | 30       | APPROVED | 2026-09-20-init-mode-seam        | B28      |
| `docs/plans/2026-09-20-branch-model`          | change | branch model — landing model per branch; the git pass reads where it stands                 | —           | 40       | APPROVED | 2026-09-20-init-brownfield-reads | B28, B53 |
