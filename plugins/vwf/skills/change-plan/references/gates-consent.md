# §4 — Gates, after landing, release levels

Four sub-steps, none asked as a question of its own. (a) is stated, and asks
only a gate delta (interview item 13). (b) asks only a step the survey cannot
decide. (c) and (d) are stated. The user changes any of them at the §5 gate,
with *revise*. Write all four into `index.json`. `/vwf:execute` runs what is
written and nothing it infers.

## (a) The three gates

Write the exact commands the run must pass, one per line, for each tier. When
`mise tasks ls --hidden` lists the default tasks, write the defaults below,
unasked. Otherwise draw the lines from the survey's gate list: the repo's task
runner tasks, the capabilities whose tasks exist, and the checks CI already runs
over the touched trees. Either way, state them; never confirm them one by one.

| List         | `/vwf:execute` runs it                   | Default, when `mise tasks ls --hidden` lists it |
| ------------ | ---------------------------------------- | ----------------------------------------------- |
| `gates.unit` | once before each unit's commit           | `mise x -- mise run code:format --all`          |
| `gates.wave` | once before wave 1, and after every wave | `mise x -- mise run code:lint --all`            |
| `gates.plan` | once over the finished tree              | `mise x -- mise run code:precommit`             |

- The cheap check runs most often, and the full hook pass runs once.
- The plan gate runs the full hook pass over every file of the finished tree,
  because `code:precommit` always runs pre-commit with `--all-files`; it takes
  no flag.
- The unit and wave lines take `--all`: with no files and no `--all`,
  `code:format` and `code:lint` examine only the uncommitted files, and the
  wave gate runs on a clean worktree before wave 1 and after each wave, where
  that set is empty.
- Put a check that runs the whole hook pass or a slow test suite in the plan
  gate, not the wave gate.
- A check that only holds once a particular unit has landed is not a wave-gate
  line — the gate runs before wave 1 and must be green then. Make it that unit's
  *Verification*, repeated in the gates unit's.
- A repo with no task runner records `none`. Say plainly
  that the run then has no automated gate, and the wave review is the only
  check.
- The wave review is the only review a change plan runs by default. Write a
  `review` unit only when the change lands runnable code (item 10a), with its
  reason in the `decisions` list. Over a change plan's `edit` units it runs
  `/security-review` and the security reviewer alone — the wave review has
  already judged the units against their files.

## (b) After landing

Propose the ordered steps that follow a consented landing. Interview item 17
records each `run` unasked, and asks only about a step the survey cannot
decide. They become the `after_landing`
list; empty is a valid answer, written `[]`.

- Never carry a release step in a plan or record one in `consent` — a release is
  always a later hand step, `/release`.
- Write `consent.merge` `true`, unasked (interview item 16). Write `false` only
  when the user asks for it — the mode recorded is the consent.
- The executor never stops before a step to ask.
- Do not propose a command already in `.config/vwf.yaml`'s `after_landing:` list
  — `/vwf:execute` runs it after every green landing.
- Where a step stages something the session already loaded, say plainly that
  only a restarted session picks it up.

## (c) Release levels

Derive a level for each project the units touch, never ask it, and give a
one-line reason. Interview item 18 owns the mapping, and the template owns the
`release_levels` entry shape. Item 18 is stated, as item 12's priority is.

No unit bumps a version and no plan releases. `/vwf:execute` raises each level
in `.config/bootstrap/releases.toml`, through `bootstrap config`, at landing —
one key per project, the highest level wins. `/release` is a later hand step
that reads those levels.

## (d) Ending an `all` run

Write `consent.end_all_run` `false`, unasked, on every plan (interview item
18a). A user who runs `/vwf:execute all` means to run every plan.
