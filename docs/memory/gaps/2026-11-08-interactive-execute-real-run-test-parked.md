GAP 2026-11-08 ★3 | execute asks the user | the interactive run is proved
only by diff review and the pane tests — open | parked by the plan that
makes execute ask

**Source plan** `2026-11-08-execute-asks-the-user`

The run that lands the change loads the old vwf, so it cannot test the new
behaviour on itself. These facts were tested on 2026-11-08 in a desktop session,
with agent teams on and Haiku agents only:

- A top session resumes a finished subagent with `SendMessage` by its agent id,
  and the agent keeps its context. This also works for a custom agent type
  whose tool list has no `SendMessage`.
- A layer-1 agent that resumes its layer-2 child loses the child's reply: the
  reply goes to the top session. A fresh dispatch from layer 1 returns directly.

Not tested. Test each after `mise run p:plugins:local` and a restarted session,
with a small plan that has a planted gap:

1. A whole interactive `/vwf:execute <folder>` run on the desktop.
2. The same run in the CLI.
3. Agent teams off: does a resume by agent id still work?
4. A teammate in a `teams` wave that returns a `QUESTION:` block.
5. Opus agents, and `execute-coder`.
6. `/vwf:execute all` with a question in the second plan.
7. A headless run (`claude -p`): the question is recorded and the run stops at
   the final report.
