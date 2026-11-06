PROBLEM 2026-09-15 ★4 | execute review engines | A reviewer subagent that
invokes `/code-review` or `/security-review` deadlocks the run — each skill
forks a background agent and returns at once, so the orchestrator waits for the
reviewer and the reviewer is gone | fixed: the orchestrator runs the engines

**Source plan** `2026-09-15-execute-engine-deadlock`.

Cause. The reviewer finished its manual dimensions and ended its turn. The
engine's completion then landed in the orchestrator session, where the stage
contract only said "wait for the reviewer's block". Both sides waited until a
human typed. A 14-step run on 2026-09-14 lost two hours on the two steps with
a large diff, where the engine outlived the manual pass.

Fix. The orchestrator is the main session, so it receives the completion and
has `TaskOutput` to wait on. It runs both engines, waits, then dispatches the
reviewers with each engine output pasted under `## Engine`. A reviewer is
single-turn and runs no engine. Every review round runs the engines again.

Rejected options:

- The reviewer keeps the engine and the orchestrator forwards the completion
  to the idle reviewer. It relies on undocumented routing, the path that
  deadlocked.
- Reviewers dispatched beside the engines and resumed on report. It keeps the
  overlap but adds a two-state contract on both sides, where the bug lived.
- A scratch file for the engine output. The reviewer is single-turn, so a file
  adds a write and buys nothing.
- Engines in round 1 only. A fix that adds a bug then meets the manual
  dimensions alone.
- Pause and ask on engine failure. Execute is autonomous between start and the
  final gate. An engine that errors or is silent after 30 minutes is stopped,
  and the reviewer gets `ENGINE: unavailable — <reason>`.

Cost. The serial order costs up to the engine run time per round (0.5 to 9
minutes observed). The overlap stays rejected. The overall per-step slowness
(about 35 minutes a step) was flagged and never fixed.

Avoid again. A subagent never invokes a skill that forks background work.
