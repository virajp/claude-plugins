# After landing — every step runs as the plan recorded it

Read the folder's `after_landing` list. Every entry carries the `mode` `run`, decided at the
planner's interview and written there.

A **green landing** means that the branch merged and pushed per `consent.merge`. On one, each entry's
`step` runs in list order from the main checkout, with no prompt. The `run` recorded in the folder is
each step's authorisation, consented at the interview that wrote it.

No step releases. A release is always a step a person runs by hand, `/release` or the repo's own,
and the landing has only recorded its level. An empty list runs no plan step, and is said in one
clause. A mode other than `run` never reaches here: `validate` refused it, on a fresh run and a
resume alike.

**The repo's default steps**. After the plan's own steps, read `.config/vwf.yaml`'s optional
`after_landing:` key, a list of commands the user keeps by hand. Run each, in list order, as a `run`
step on the same terms: same authorisation, same report, same failure rule. Skip a command the plan's
own list already ran, so it runs once. An absent key, or an absent file, adds no step.

**Under an `all` override**, a step does not run here when the block names its command under
`skip as deduped`. This holds for a plan step and a default step alike. Report it as deferred to the loop's exit — *skipped
(deduped)* — and record it in the final report. The remaining steps run in order without it. It is
neither a failure nor a step not run.

**When the branch did not merge**, **no step runs**, plan step or default step. Either the landing was
not consented, or it was consented and the merge hit a conflict. A conflict is the hard halt of the `yes`
branch in [land.md](land.md), and the folder's status reads `BLOCKED` with the files. A step's authorisation was for a
green landing, and this is not one. The report lists every step with its command, to run by hand after the
hand merge.

The orchestrator runs the steps, never a unit. A step may mutate the machine rather than the tree under
review, and a unit never reaches outside the worktree.

Report each step with its outcome:

- **Ran**. Say what it did in the step's own terms. A step's `notes` can say that a **restarted** session is needed for its effect. Report that
  sentence — this session already loaded what the step replaced.
- **Exited non-zero**. Report the failed step, its exit code and its output verbatim, and stop. The remaining
  steps do **not** run, since a step after a failed one may assume its effect. The report names each step not
  run with its command. Never work around it. A step that refuses is usually a fact about the machine rather
  than a failure of the run. The plan named that step, not a substitute for it.

Then end the action log — `end --outcome complete`, or `ready` when the branch was left to land by hand — per
[the action log](action-log.md).
