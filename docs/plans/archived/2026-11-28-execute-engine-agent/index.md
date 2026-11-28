# Plan — A review row runs each engine in its own agent, so a runner always returns its block (2026-11-28)

## Goal

After this plan lands, a `vwf:execute-runner` under `/vwf:execute all` always
returns its five-line block. A `review` row dispatches one `execute-engine`
agent per engine (`/code-review`, `/security-review`); each agent writes its
engine's report to the round's log and returns one `ENGINE:` line, so an
engine's closing report ends only that agent's turn. The runner and *Runner
mode* also say that a skill's output is never the runner's reply.

The defect: in two `all` runs (plans `2026-11-23-bootstrap-value-quoting` and
`2026-11-26-stackgen-bootstrap-tasks`), the runner's last message was the raw
security-review report, so the loop could not go on without a manual
`SendMessage` resume. No reversal: the engines still run at a review row,
before the reviewers (`docs/memory/decisions/2026-09-17-review-rows.md`); only
the means changes.

## Facts the survey established

- `plugins/vwf/skills/execute/references/review-unit.md:88`: "In **one
  message**, invoke `/code-review` at high effort and `/security-review`
  through the `Skill` tool." :90-:91 the targets; :93 the TaskOutput/TaskStop
  wait; :96-:98 the orchestrator saves each output to
  `<folder>/engine/<loop-id>-<round>.log`; loop ids at :24-:28.
- `plugins/vwf/assets/execute-stages.md:43-:54` restates the outline; the
  stage table is about :20-:30.
- `plugins/vwf/agents/execute-runner.md:8` tools include `Skill`; :21-:23
  forbid invoking the execute skill only; :78-:99 the return contract, stated
  once at the end.
- `plugins/vwf/skills/execute/workflows/all.md` *Runner mode* (about
  :196-:231) has no rule that a skill's output is input, not the reply;
  *The loop* step 4 (about :115-:118) turns a reply with no block into
  `STOPPED`.
- `/code-review` and `/security-review` are Claude Code built-ins; the vwf
  skills a runner invokes are `/vwf:git-workflow`, `plan-management`,
  `/vwf:backlog` and `/vwf:handoff`.
- No hook or test checks the shape of a runner's last message
  (`plugins/vwf/hooks/hooks.json:36` only logs `SubagentStop`).
- `plugins/vwf/.claude-plugin/plugin.json` lists no agents: an agent is found
  by its folder.
- Docs that a fix falsifies: `site/src/content/docs/plugins/vwf.md`
  :201-:205, :2293-:2294, :2726-:2737, :2870, :3759-:3761, :4156;
  `.claude/skills/vwf-plugin/SKILL.md:95-97`;
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:72-75`.
- Layer 3 under `all` (D15): `/code-review`'s own agents sit at layer 3 when
  a runner dispatches an engine agent. The precedent is
  `plugins/vwf/skills/execute/workflows/all.md:230-231`, where the docs-sync
  surveyor runs at layer 3 in every `all` run. The first `all` run with a
  code-review row is the proof of layer 3 (D20).
- The gates over these trees: `code:format`, `code:lint` and the pre-commit
  pass (`code:precommit`), which runs `p:plugins:check` and
  `p:plugins:marketplace --check`.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc, never adds a dependency the plan
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never writes a lock file — the file a package
manager or a toolchain manager writes to pin what it resolved — with Write,
Edit, `sed` or a script: a lock file changes only as the output of the CLI
that owns it, the command the stack's package-manager conventions name, and
the unit keeps what that CLI wrote. A unit whose manifest change moves a lock
file lists that lock file in its `owns` beside the manifest.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    QUESTION Q<n>: <the question, readable alone>
    OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> | <option 4>]
    WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>

The three QUESTION lines repeat per question, `n` counting from 1 in the
block, with two to four options; a block with no question carries the one
line `QUESTION: none`. A question is a point the plan does not decide and the
unit cannot settle inside its scope; the unit never proceeds on an
assumption.

A unit completes every edit that does not depend on an answer, never builds on
a part an answer can change, then returns all its open questions in one block.
Its edits stay uncommitted in the worktree. The orchestrator asks the user,
records each answer in `decisions`, and resumes the unit with the question ids
and answers; the resumed unit applies them and returns the whole block again
(the execute skill's `references/questions.md`).

## Known risks

The user ruled "cut to the minimum": this plan proves none of these in its
own run. The first real `/vwf:execute all` run that reaches a review row
shows each one (D20).

- The engine's own git commands read the worktree after the engine agent's
  `cd <worktree>`.
- `/code-review`'s own agents run at layer 3 under `all`.
- A hung engine hangs the run: the foreground dispatch has no timer (D11).

## Out of scope

- B119, the other runner risks: the reserved `next` handoff file that
  successive runners overwrite, and the nesting depth of the docs-sync
  surveyor. They are a separate backlog item.
- A guard in the loop that resumes a runner whose reply has no block: the
  user ruled to fix the source, not to add a guard (D3).
- A hook or a test that checks the shape of a runner's last message.

## Parked

none

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-28-execute-engine-agent

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
