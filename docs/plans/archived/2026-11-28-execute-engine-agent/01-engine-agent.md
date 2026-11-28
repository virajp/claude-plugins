# U1 — Engines run in their own agent

- **Read first:** every owned file that exists, top to bottom, before editing:
  `plugins/vwf/skills/execute/references/review-unit.md` (the whole file; the
  engine step is section *2. engines*, about :86-:98) and
  `plugins/vwf/assets/execute-stages.md` (the stage table about :20-:30 and the
  outline about :40-:56).
- **Lazy-load:** `plugins/vwf/agents/execute-runner.md` and
  `plugins/vwf/agents/execute-code-reviewer.md` (the frontmatter keys and the
  body shape of a sibling `execute-*` agent);
  `plugins/vwf/agents/execute-security-reviewer.md`.

## Ruling

> D1 — Each engine in a subagent: the orchestrator dispatches one engine agent
> per engine, in one message. Each invokes its engine through Skill, writes the
> report verbatim to `<folder>/engine/<loop-id>-<round>.log`, and returns one
> status line. The engine's final report then ends only that agent's turn.
> Same for plain `/vwf:execute` and runners, so one path.

> D2 — A new vwf agent: `plugins/vwf/agents/execute-engine.md`, tools Skill,
> Agent, Write, Bash, Read (D12). It invokes the named engine with its target,
> writes the report verbatim to the given log path, and returns one line,
> `ENGINE: <name> <round> ok <path>` or `ENGINE: <name> <round> failed <reason>`
> (D10). It dispatches no agent itself; only the engine it invokes may start
> its own agents (D12). Under `all` it is layer 2 (the loop, the runner, the
> engine agent); `/code-review`'s own reviewer agents then sit at layer 3, the
> default nesting limit — the precedent is
> `plugins/vwf/skills/execute/workflows/all.md:230-231`, where the docs-sync
> surveyor runs at layer 3 in every `all` run (D15).

> D10 — The return contract is `ENGINE: <name> <round> ok <path>` or
> `ENGINE: <name> <round> failed <reason>`.

> D11 — Engine agents are dispatched in the foreground, both in one message,
> as unit agents are, so their one-line replies come back in the same turn.
> There is no 30-minute wait, no TaskStop and no TaskOutput for the engines. A
> hung engine hangs the run, as a hung unit agent does (a known risk, D20).

> D20 — Known risks, recorded for the first real `/vwf:execute all` run that
> reaches a review row, not proven in this run: (a) the engine's own git
> commands read the worktree after the agent's `cd`; (b) `/code-review`'s own
> agents run at layer 3 under `all`; (c) a hung engine hangs the run.

> D16 — U1 owns `plugins/vwf/skills/execute/references/rules.md` (about :34),
> `plugins/vwf/agents/execute-code-reviewer.md` (about :8) and
> `plugins/vwf/agents/execute-security-reviewer.md` (about :7): an
> `execute-engine` agent runs the engine, and the orchestrator hands over its
> log.

> D18 — `plugins/vwf/assets/execute-stages.md` gets no sixth dispatch
> contract. Its stage table gets an `engine` row whose note points to
> review-unit.md and `agents/execute-engine.md`, as the `run` row's note does,
> and the count stays five.

> D21 — U1 owns `plugins/vwf/skills/execute/SKILL.md` and names the engine
> agent at :36 and in the list of stage subagents at :39-:43.

> D4 — An engine agent that errors, returns no `ENGINE:` line, or returns
> `failed` counts as an unavailable engine under the rule review-unit.md
> already has: the reason is kept for the reviewers' prompt. The orchestrator
> waits on the engine agent, not on the engine (D11).

> D5 — The cause: review-unit.md:88 invokes the built-in engines `/code-review`
> and `/security-review` through the Skill tool, in the orchestrator's own
> turn. Their closing report ended a runner's turn, so the runner never
> returned its five-line block.

## Edits

1. **`plugins/vwf/agents/execute-engine.md`** — a new file. Frontmatter in the
   exact form of the sibling `execute-*` agents (`name`, a folded
   `description`, `tools`, `model`, then `---`):
   - `name: execute-engine`
   - `description`: "Review-engine runner for the /vwf:execute command. Invoked
     only by /vwf:execute — do not delegate to it for general tasks. Runs one
     review engine (/code-review or /security-review) over the worktree the
     orchestrator names, writes the engine's report verbatim to the log path
     it is given, and returns one ENGINE line." Fold it as the siblings fold
     theirs.
   - `tools: Skill, Agent, Write, Bash, Read`
   - `model: opus`

   The body, in the siblings' style (headings and short paragraphs):
   - **Inputs:** the engine (`/code-review` at high effort with the round's
     `<from>..<to>` as its target, or `/security-review` with no target), the
     worktree path, the log path (`<folder>/engine/<loop-id>-<round>.log`
     inside that worktree), the row id and the round.
   - **What to do:** the first Bash call is `cd <worktree>`, then
     `git rev-parse --show-toplevel`; when it does not print the worktree path,
     return `ENGINE: <name> <round> failed <reason>` and invoke nothing (D9).
     Run every later Bash command against the worktree too (`cd` into it at
     the start of each command, or `git -C <worktree>`), so the engine reads
     the worktree's branch, not the main checkout. Invoke exactly the
     named engine through the Skill tool, with its target and effort. Create
     the `engine/` folder when it is absent, and write the engine's whole
     report, verbatim, to the log path with the Write tool.
   - **Never:** edit any other file, act on a finding, run the other engine,
     commit, or dispatch an agent yourself. Only the engine you invoke may
     start its own agents (D12).
   - **The engine's report is not your reply.** The engine's instructions end
     with a final report. That report goes into the log file; it is never your
     last message.
   - **Return:** your last message is exactly one line, and nothing else:
     `ENGINE: <name> <round> ok <path>` when the log is written, or
     `ENGINE: <name> <round> failed <reason>` when the engine errored or no
     report came back. `<name>` is `code-review` or `security-review`.
2. **`plugins/vwf/skills/execute/references/review-unit.md`**, section *2.
   engines* (about :86-:98) — replace the Skill invocation and the
   TaskOutput/TaskStop wait with the dispatch, and keep the rest of the step:
   - In **one message**, dispatch one `vwf:execute-engine` agent per engine
     (the `execute-engine` agent), each in the foreground, as unit agents are
     (D11): `/code-review` at high effort and
     `/security-review`, or `/security-review` alone on a security-only row.
     Give each no `name` and no `isolation`. Its prompt carries the engine,
     the target (`<from>..<to>` for `/code-review`; none for
     `/security-review`), the worktree path, the log path
     `<folder>/engine/<loop-id>-<round>.log`, the row id and the round.
   - Keep the two target bullets (about :90-:91) as they are.
   - Replace the TaskOutput/TaskStop paragraph (about :93) with D11 and D4:
     the foreground dispatch returns each agent's one line in the same turn;
     an engine agent that errors, returns no `ENGINE:` line, or returns
     `failed` counts as unavailable, the reason kept for the prompt. Name no
     TaskOutput, no TaskStop and no time limit for the engines.
   - Change the "Save each engine's output verbatim" paragraph (about :96-:98)
     so the engine agent writes the log, and the orchestrator reads the log
     file for the filter below. Keep the `.log` extension sentence and the
     whitespace-hook sentence.
   - Add one sentence with the reason: an engine's own instructions end with a
     final report, so an engine run in the orchestrator's own turn would end
     that turn on the report; in its own agent it ends only that agent's turn.
   - Change nothing else in the file.
3. **`plugins/vwf/assets/execute-stages.md`** — in the outline (about
   :43-:54), "the orchestrator invokes `/code-review` (high effort) and
   `/security-review` in one message … waits on each with `TaskOutput`
   (blocking, up to 30 minutes from invocation; an engine that errors or times
   out is stopped with `TaskStop` and counted unavailable, reason kept)"
   becomes: the orchestrator dispatches one `execute-engine` agent per engine
   in one message, in the foreground (D11), each of which writes its engine's
   report to the round's log and returns one `ENGINE:` line; an agent that
   errors or returns `failed` counts as unavailable, reason kept. Add one row
   to the stage table (about :20-:30), after `security`:
   `| engine | Review engine | opus | `execute-engine` | at each `review` row, once per engine, before `review` and `security` |`,
   padded to the table's columns, with a note in the form of the `run` row's
   note: its contract is `skills/execute/references/review-unit.md` and
   `agents/execute-engine.md` (D18). The count of dispatch contracts stays
   five; add no contract. Keep every other line.
4. **`plugins/vwf/skills/execute/references/rules.md`** (about :34) — "The
   orchestrator runs the two review engines itself" becomes: an
   `execute-engine` agent runs each review engine, and the orchestrator hands
   its log to the reviewers (D16). Change nothing else in the file.
5. **`plugins/vwf/agents/execute-code-reviewer.md`** (about :8) and
   **`plugins/vwf/agents/execute-security-reviewer.md`** (about :7) — where
   the description says the engine is something "the orchestrator runs", it
   says an `execute-engine` agent runs it and the orchestrator hands over its
   output (D16). Keep the folded YAML form of each description. Change
   nothing else in either file.
6. **`plugins/vwf/skills/execute/SKILL.md`** (D21) — in the `review` row of
   the kind table (about :36), "Runs the two review engines" becomes "Runs the
   two review engines, each in its own `execute-engine` agent". In the
   paragraph about :39-:43, "the five stage subagents" becomes "the six stage
   subagents", and the list adds `execute-engine` at `review` rows, once per
   engine. Keep the table's padding. Change nothing else in the file.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all` green.
- `mise x -- mise run p:plugins:check` green (it parses the new agent's frontmatter).
- `grep -n 'TaskOutput\|TaskStop\|through the .Skill. tool' plugins/vwf/skills/execute/references/review-unit.md`
  prints no line about the engines.
- `grep -n 'execute-engine' plugins/vwf/skills/execute/references/review-unit.md plugins/vwf/assets/execute-stages.md`
  prints at least one line in each file.
- `grep -n 'execute-engine' plugins/vwf/skills/execute/SKILL.md` prints at
  least two lines.
- No in-run proof that the engine reads the worktree: the user ruled "cut to
  the minimum", and D20 records the risk for the first real `all` run.

## Guardrails

- Do not touch `plugins/vwf/agents/execute-runner.md` or
  `plugins/vwf/skills/execute/workflows/all.md`: U2 owns them.
- Do not change the filter, the reviewers' dispatch or the dedupe in
  review-unit.md, or the engines' targets.
- `plugins/**/*.md` is not dprint-formatted: match the fold width of the
  lines around each edit by hand. A new agent file's frontmatter is strict
  YAML: a description with a colon in it must be folded or quoted as the
  siblings do.
- Delete with `rm`, never `git rm`. No `git checkout` or `git restore`. No
  formatter `--fix` outside these files.

## Commit

`fix(vwf): run each review engine in its own execute-engine agent` — written
by the orchestrator after the unit gate and the wave gate, not by the unit.
