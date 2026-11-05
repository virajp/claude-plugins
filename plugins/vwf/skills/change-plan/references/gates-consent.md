# §4 — Gates, after landing, release levels

Four sub-steps. Propose (a), (b) and (d) from the survey, and have the user
confirm them. (c) is derived and stated, never confirmed here: the user changes
a level at the §5 gate. Write all four into `index.json`. `/vwf:execute` runs
what is written and nothing it infers.

## (a) The three gates

Propose the exact commands the run must pass, one per line, for each tier. Draw
them from the survey's gate list: the repo's task runner tasks, the capabilities
the `harness:` stamp records, and the checks CI already runs over the touched
trees. Confirm them.

| List         | `/vwf:execute` runs it                   | Default, when `mise tasks ls` lists it    |
| ------------ | ---------------------------------------- | ----------------------------------------- |
| `gates.unit` | once before each unit's commit           | `mise x -- mise run code:format`          |
| `gates.wave` | once before wave 1, and after every wave | `mise x -- mise run code:lint`            |
| `gates.plan` | once over the finished tree              | `mise x -- mise run code:precommit --all` |

- The cheap check runs most often, and the full hook pass runs once.
- The plan gate takes `--all` because it runs over the finished, committed tree.
  Without it, `code:precommit` checks only uncommitted files, and on a clean
  tree it checks nothing.
- Put a check that runs the whole hook pass or a slow test suite in the plan
  gate, not the wave gate.
- A check that only holds once a particular unit has landed is not a wave-gate
  line — the gate runs before wave 1 and must be green then. Make it that unit's
  *Verification*, repeated in the gates unit's.
- A repo with no task runner and no harness stamp records `none`. Say plainly
  that the run then has no automated gate, and the wave review is the only
  check.
- The wave review is the only review a change plan runs by default. Write a
  `review` unit only when the change lands runnable code (item 10a), with its
  reason in the `decisions` list. Over a change plan's `edit` units it runs
  `/security-review` and the security reviewer alone — the wave review has
  already judged the units against their files.

## (b) After landing

Propose the ordered steps that follow a consented landing, and walk them by
interview item 17, which owns `run` or dropped. They become the `after_landing`
list; empty is a valid answer, written `[]`.

- Never carry a release step in a plan or record one in `consent` — a release is
  always a later hand step, `/release`.
- Record only a landing consent you explicitly asked for — the mode recorded is
  the consent.
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
in `.config/releases.yaml` at landing — one key per project, the highest level
wins. `/release` is a later hand step that reads that file.

## (d) Ending an `all` run

Write `consent.end_all_run`, the answer to interview item 18a. Ask it only when
the units' `owns` include a plugin the run itself loads. When the plan touches
no such plugin, write `false` unasked.
