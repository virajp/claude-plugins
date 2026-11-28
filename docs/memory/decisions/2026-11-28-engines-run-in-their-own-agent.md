# Decision — review engines run in their own agent; a runner always returns its block

DECISION 2026-11-28 ★4 | execute:review-row | engines in the orchestrator's
turn → one execute-engine agent per engine; runner's last message is always its
block — an engine's closing report ended a runner's turn | alt instruction-only,
runner-only path, loop resume guard rejected

**Date** 2026-11-28 · **Branch** `all-2026-11-28-1018` · **Plan**
`docs/plans/2026-11-28-execute-engine-agent/` · **Refines**
[`2026-09-17-review-rows.md`](./2026-09-17-review-rows.md) and
[`2026-10-07-execute-all.md`](./2026-10-07-execute-all.md) · **Reverses**
nothing · **Backlog** none

## What prompted it (D5)

`skills/execute/references/review-unit.md` invoked the built-in engines
`/code-review` and `/security-review` through the `Skill` tool, in the
orchestrator's own turn. Each engine's instructions end with a final report.
Under `/vwf:execute all` that report ended the runner's turn, so the runner
never returned its five-line block — in plans
`2026-11-23-bootstrap-value-quoting` and `2026-11-26-stackgen-bootstrap-tasks`.
Each time a manual `SendMessage` resume let the runner finish. No text told the
runner that a skill's report is input for its next step, and no hook checks the
shape of a runner's last message.

## The rulings, with what each rejected

- **D1 — each engine in a subagent.** At a `review` row the orchestrator
  dispatches one engine agent per engine, in one message. Each invokes its
  engine through `Skill`, writes the report verbatim to
  `<folder>/engine/<loop-id>-<round>.log` and returns one status line, so the
  engine's report ends only that agent's turn. One path for plain
  `/vwf:execute` and for runners. Rejected: instruction only (keep the `Skill`
  call in the orchestrator and say the output is data — the engine's own text
  still says to end on the report); engine agents for runners only (two paths
  to keep in step).
- **D2 — a new vwf agent, `agents/execute-engine.md`**, tools `Skill`, `Agent`,
  `Write`, `Bash`, `Read`. It returns `ENGINE: <name> <round> ok <path>` or
  `ENGINE: <name> <round> failed <reason>`. It dispatches no agent itself; only
  the engine it invokes may start its own. Under `all` it sits at layer two, and
  `/code-review`'s own agents at layer three, the default nesting limit — the
  precedent being the docs-sync surveyor, at layer three in every `all` run.
  Rejected: the built-in general-purpose agent (the contract would live only in
  prompt text, and it has every tool).
- **D3 — a skill's output is never the runner's reply.** `execute-runner.md`
  and `all.md` *Runner mode* say that the output of any `Skill` call, a vwf
  skill or a built-in, is input for the next step; the runner's last message is
  always the return block. The loop's rule that a reply with no block is
  `STOPPED` stays. Rejected: the rule plus a loop that resumes a runner once
  before recording `STOPPED` (a guard, not a fix at the source); D1 alone
  (leaves the same failure open for the vwf skills the runner invokes).
- **D4 — a failed engine agent is an unavailable engine.** An agent that
  errors, returns no `ENGINE:` line, or returns `failed` counts as unavailable
  under the rule `review-unit.md` already has, its reason kept for the
  reviewers' prompt. The dispatch replaces only the `TaskOutput`/`TaskStop`
  wait. Rejected: a new failure rule for engine agents.

## How it refines the earlier records

- **`2026-09-17-review-rows.md`** — the engines still run at a `review` row,
  before the two reviewers, over the same range; only the means changes, from a
  `Skill` call in the orchestrator's turn to an `execute-engine` agent.
- **`2026-10-07-execute-all.md`** — the runner keeps the `Skill` tool for the
  vwf skills it invokes; it now treats their output as input, never its reply.

## Known risks, unproven in this run (D20)

The first real `/vwf:execute all` run that reaches a review row shows each: the
engine's own git commands read the worktree after the agent's `cd`;
`/code-review`'s agents run at layer three; a hung engine hangs the run, since
the foreground dispatch has no timer.
