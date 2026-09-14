# Plans

Every change-plan folder under `docs/plans/` that is not yet archived, with its
status and what it waits on. A folder is run with `/vwf:change-execute <folder>`
in a fresh session; it halts until every `requires:` plan reads `COMPLETE`, and
moves to `archived/` when it lands. Archived plans are not listed here.

This file is written by hand today; making `/vwf:change-plan`,
`/vwf:change-execute` and `/vwf:archive` maintain it is a later change, since
vwf's index today lists flat cycle plans only.

| Folder                                                                        | Plan                                                                                                                                | Status   | Requires                          | Backlog |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------- | ------- |
| [`2026-09-14-feedback-gaps`](2026-09-14-feedback-gaps/index.md)               | feedback — the shape-change kind, build state, a named unit, a product note                                                         | APPROVED | —                                 | B05     |
| [`2026-09-14-stack-reputation`](2026-09-14-stack-reputation/index.md)         | stack reputation — a verdict on every name stackgen generates, and a skill anyone can point at a package                            | APPROVED | —                                 | B10     |
| [`2026-09-14-terminal-design-tool`](2026-09-14-terminal-design-tool/index.md) | terminal design tool — the claude-code design-tool pack, the default on the design axis, and the logo in the design-system contract | APPROVED | `2026-09-14-stack-reputation`     | B11     |
| [`2026-09-14-design-review-loop`](2026-09-14-design-review-loop/index.md)     | design review loop — screens in the canvas, a review server from the repo, comments applied in session                              | APPROVED | `2026-09-14-terminal-design-tool` | B11     |

`Requires` names only plans not yet archived; a requirement already under
`archived/` is satisfied. `feedback-gaps` can start now; the other three run in
the order listed.
