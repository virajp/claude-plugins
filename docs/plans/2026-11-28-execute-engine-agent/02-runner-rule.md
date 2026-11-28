# U2 — A skill's output is never the runner's reply

- **Read first:** `plugins/vwf/agents/execute-runner.md`, top to bottom, and
  `plugins/vwf/skills/execute/workflows/all.md` section *Runner mode* (about
  :196-:231) and *The return block* after it.
- **Lazy-load:** `plugins/vwf/skills/execute/references/review-unit.md`
  section *2. engines* (read only; U1 changes it).

## Ruling

> D3 — Rule in the runner: execute-runner.md and all.md *Runner mode* say that
> a skill's output — any Skill call, a vwf skill or a built-in — is input for
> the next step, never the reply. After each Skill call the runner continues
> the run, and its last message is always the return block. The loop's rule
> that a reply with no block is STOPPED (all.md *The loop* step 4) stays as it
> is (the user's rule: fix the source, not a guard).

> D2 — A new vwf agent: `plugins/vwf/agents/execute-engine.md`, tools Skill,
> Agent, Write, Bash, Read (D12). It invokes the named engine with its target,
> writes the report verbatim to the given log path, and returns one line,
> `ENGINE: <name> <round> ok <path>` or `ENGINE: <name> <round> failed <reason>`
> (D10). Under `all` it is layer 2 (the loop, the runner, the engine agent);
> `/code-review`'s own reviewer agents then sit at layer 3, the default
> nesting limit (precedent: `all.md:230-231`, D15).

> D5 — The cause: review-unit.md:88 invokes the built-in engines through the
> Skill tool, in the orchestrator's own turn. Their closing report ended a
> runner's turn, so the runner never returned its five-line block. No text
> told the runner that the report is input for the next step.

## Edits

1. **`plugins/vwf/agents/execute-runner.md`**:
   - In *Inputs*, after the sentence that says not to invoke the execute skill
     through `Skill` (about :21-:23), add a short paragraph: you still invoke
     other skills through `Skill` where the execute files say so
     (`/vwf:git-workflow`, `plan-management`, `/vwf:backlog`, `/vwf:handoff`).
     A skill's output — a vwf skill's or a built-in's — is input for your next
     step, never your reply, even when the skill's own text says to end with a
     report. After each `Skill` call, continue the run.
   - In *Return contract* (about :78-:99), after "Output **only** these five
     lines…", add one sentence: your last message is always this block, after
     every skill, agent and engine you ran; nothing a skill returned is ever
     your last message.
   - Keep the `tools:` line (:8) as it is.
2. **`plugins/vwf/skills/execute/workflows/all.md`**, *Runner mode*:
   - After the bullet "**It returns the block and nothing else**" (about
     :209-:211), add one sentence to that bullet: a skill's output — any
     `Skill` call, a vwf skill or a built-in — is input for the runner's next
     step, never its reply; after each `Skill` call the runner continues, and
     its last message is always the block.
   - In the bullet "**Its subagents are one layer deeper**" (about :230-:231),
     add the engine agents: the `execute-engine` agents a review row
     dispatches are layer two, and the agents `/code-review` starts inside one
     are layer three, the default nesting limit, as the docs-sync surveyor is.
   - Do not change *The loop* step 4 (about :115-:118): a reply that is not
     the block still reads `STOPPED`, *runner returned no block*.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all` green.
- `mise x -- mise run p:plugins:check` green.
- `grep -n 'never your reply\|never its reply' plugins/vwf/agents/execute-runner.md plugins/vwf/skills/execute/workflows/all.md`
  prints at least one line in each file.
- `grep -n 'runner returned' plugins/vwf/skills/execute/workflows/all.md`
  still prints the loop's STOPPED rule.

## Guardrails

- Do not touch `plugins/vwf/skills/execute/references/review-unit.md`,
  `plugins/vwf/assets/execute-stages.md` or
  `plugins/vwf/agents/execute-engine.md`: U1 owns them.
- Edit only the two sections of all.md named above.
- `plugins/**/*.md` is not dprint-formatted: match the fold width of the
  lines around each edit by hand (all.md uses long lines; execute-runner.md
  folds at about 78).
- Delete with `rm`, never `git rm`. No `git checkout` or `git restore`. No
  formatter `--fix` outside these files.

## Commit

`fix(vwf): a runner's last message is always its return block` — written by
the orchestrator after the unit gate and the wave gate, not by the unit.
