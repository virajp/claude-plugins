# U3 — Docs

- **Read first:** every owned file's passage named below, and the commits of
  U1 and U2 on the run branch (`git log` and `git show` of each).
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`,
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the shape of a decision record).

## Ruling

> D1 — Each engine in a subagent: the orchestrator dispatches one engine agent
> per engine, in one message. Each invokes its engine through Skill, writes the
> report verbatim to `<folder>/engine/<loop-id>-<round>.log`, and returns one
> status line. The engine's final report then ends only that agent's turn.
> Same for plain `/vwf:execute` and runners, so one path.

> D2 — A new vwf agent: `plugins/vwf/agents/execute-engine.md`, tools Skill,
> Agent, Write, Bash, Read (D12). It returns one line,
> `ENGINE: <name> <round> ok <path>` or `ENGINE: <name> <round> failed <reason>`
> (D10).

> D17 — U3 also rewords the two reviewer rows of
> `.claude/skills/vwf-plugin/references/skills-and-agents.md` (about :74-:75):
> an `execute-engine` agent runs the engine; the reviewers still run none.

> D3 — execute-runner.md and all.md *Runner mode* say that a skill's output is
> input for the next step, never the reply; the runner's last message is
> always the return block. The loop's rule that a reply with no block is
> STOPPED stays.

## Edits

1. **`site/src/content/docs/plugins/vwf.md`** — each passage that says
   execute runs the engines "itself" or through a Skill call now says that a
   review row dispatches one `execute-engine` agent per engine, which writes
   the engine's report to the round's log: about :201-:205, :2293-:2294,
   :2726-:2737, :2870 (the diagram), :3759-:3761 and :4156 (the code comment
   "engines → review ‖ security"). Where the page lists the runner's return
   (about :2505-:2522), add that a skill's output is never the runner's reply.
   Where the page lists vwf's agents, add `execute-engine`.
2. **`.claude/skills/vwf-plugin/SKILL.md`** (about :95-:97) — "a `review` row
   through the two engines plus the code and security reviewers" names the
   `execute-engine` agent that runs each engine.
3. **`.claude/skills/vwf-plugin/references/skills-and-agents.md`** — add an
   `execute-engine` row beside the `execute-runner` and reviewer rows (about
   :72-:75), in the table's form: what it does (runs one review engine over a
   row's range and writes its report to the round's log), who invokes it
   (`/vwf:execute` at a `review` row), its return (one `ENGINE:` line).
   Also reword the two existing reviewer rows (about :74-:75), which say the
   engine output is what "the orchestrator runs": an `execute-engine` agent
   runs the engine, and the orchestrator hands its log to the reviewer; the
   reviewers still run no engine themselves (D17).
4. **`.claude/docs/plugins.md`**, **`readme.md`**, **`CLAUDE.md`** — only
   where a passage names vwf's agents or says how the engines run; grep for
   `execute-runner`, `security-review` and `code-review` and change only a
   falsified passage.
5. **`docs/memory/decisions/2026-11-28-engines-run-in-their-own-agent.md`** —
   a new decision record per `memory.md`: D1, D2, D3 and D4 with their
   rejected alternatives, the cause (D5), and that it refines
   `docs/memory/decisions/2026-09-17-review-rows.md` (the engines still run at
   a review row before the reviewers; only the means changes) and
   `docs/memory/decisions/2026-10-07-execute-all.md` (the runner keeps
   `Skill`).
6. Run `vwf:docs-sync` over the run's branch delta and apply what it finds,
   plus every `DOCS FALSIFIED:` line U1 and U2 returned.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all` green.
- `grep -n 'execute-engine' site/src/content/docs/plugins/vwf.md .claude/skills/vwf-plugin/references/skills-and-agents.md`
  prints at least one line in each file.

## Guardrails

- Edit no file under `plugins/`: U1 and U2 own them.
- `CLAUDE.md` and `readme.md` are dprint-formatted: widening one table cell
  re-pads every row; let `code:format` pad them.
- Delete with `rm`, never `git rm`. No `git checkout` or `git restore`.

## Commit

`docs: engines run in their own agent; a runner always returns its block` —
written by the orchestrator after the unit gate and the wave gate, not by the
unit.
