# Plans

Every change-plan folder under `docs/plans/` that is not yet archived, with its
status and what it waits on. A folder is run with `/vwf:change-execute <folder>`
in a fresh session; it halts until every `requires:` plan reads `COMPLETE`, and
moves to `archived/` when it lands. Archived plans are not listed here.

This file is written by hand today; making `/vwf:change-plan`,
`/vwf:change-execute` and `/vwf:archive` maintain it is a later change, since
vwf's index today lists flat cycle plans only.

| Folder | Plan | Status | Requires | Backlog |
| ------ | ---- | ------ | -------- | ------- |

`Requires` names only plans not yet archived; a requirement already under
`archived/` is satisfied. Nothing is in flight: every folder has landed.
