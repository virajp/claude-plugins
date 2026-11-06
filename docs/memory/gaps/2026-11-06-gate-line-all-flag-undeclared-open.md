GAP 2026-11-05 ★2 | plan gate line code:precommit --all | open — planners write
`--all`, but the synced task no longer declares that flag and always runs
`--all-files` — the gate still passes, but earlier plans rested on a declared
flag | not fixed

**Source plan** `2026-11-05-change-plan-pilot`, `2026-10-26-plan-mjs-rewave`,
`2026-10-25-action-log-per-plan`

History:

- Three plans ruled that the gate line `mise x -- mise run code:precommit --all`
  needs no `--` separator, because the task declared `--all` as a usage flag.
- The pilot parked a fix of the text itself. `change-plan` section 4 and
  `plugins/vwf/assets/templates/plan-folder.md` (line 89) tell planners to
  write `--all`. The rewrite kept it, since a rewrite must not change behavior.
- Today `.config/mise/tasks/code/precommit` (synced from bootstrap) has no usage
  line for `--all`. It always runs `pre-commit run --all-files`.

Open: the planner text and the template still write `--all`. The flag reaches
the script as an unused argument. Fix the source in the template and the
planners, or ask bootstrap to declare the flag.
