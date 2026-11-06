PROBLEM 2026-10-09 ★3 | unit agent lost during a run | an agent hung in a mise
probe, and `/reload-plugins` stopped another before it changed a file — dispatch
again once, and probe tools without installs

**Source plan** `2026-10-09-android-compose-stack`,
`2026-10-21-execute-monitor-gap-fixes`.

Two cases, the same effect: a unit agent returned nothing, and the run needed a
second dispatch.

Case 1, `2026-10-09-android-compose-stack`, unit U1:

- The agent hung about 30 minutes in a Bash `mise` probe. It never returned and
  could not be stopped.
- The cause was not confirmed. The re-dispatch guard suggests the probe tried to
  install tools.
- The fix was one re-dispatch with a no-install guard in the prompt.
- A related machine fact: `mise x` failed on the `pipx:mempalace` install, so
  gate lines ran with `MISE_TASK_RUN_AUTO_INSTALL`, `MISE_AUTO_INSTALL`,
  `MISE_EXEC_AUTO_INSTALL` and `MISE_NOT_FOUND_AUTO_INSTALL` set to false. The
  failure came from the python version on that machine, not from the tree.

Case 2, `2026-10-21-execute-monitor-gap-fixes`, unit U1 in a review loop-back:

- A `/reload-plugins` command stopped the agent before it changed a file.
- The run marked the row `failed` and dispatched again once with the same
  prompt. The second run finished.

How to avoid it:

- Give a unit that runs `mise` a prompt line that forbids installs.
- Do not run `/reload-plugins` while a `/vwf:execute` run has live agents.
- Dispatch again once. Stop the run on a second loss.
