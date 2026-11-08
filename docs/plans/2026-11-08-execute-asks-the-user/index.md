# Plan — Make /vwf:execute ask the user in place of leaving open gaps (2026-11-08)

## Goal

After this lands, a `/vwf:execute` run takes no assumption and leaves no open gap
that a person can settle. When the plan is silent, a unit returns a `QUESTION`
block. The orchestrator asks the user, records the answer in the folder's
`decisions` list and resumes the unit. Under `/vwf:execute all` the question goes
through the runner to the loop and back. The progress pane shows the wait.

The user asked for this because a run "leaves too many gaps". The design came
from a discussion with platform tests on 2026-11-08 (the Facts below).

**Reversal.** This reverses D9 of
`docs/memory/decisions/2026-10-07-plans-carry-every-answer.md` and the "execute
asks nothing at run time" rule, and the "questions that block" alternative that
`docs/memory/decisions/2026-11-06-execution-solo-teams.md` rejected. The
planners keep their full interview. A run question exists only for what the
plan missed (D17).

## Facts the survey established

**Platform tests, 2026-11-08** (desktop session, agent teams flag on, Haiku
agents):

- A background subagent has `SendMessage` and has no `AskUserQuestion`. So only
  the top session can ask the user.
- The top session resumes a finished, unnamed subagent with `SendMessage` to its
  agent id, and the agent keeps its context. This also works for a custom agent
  type whose `tools:` line has no `SendMessage` (`vwf:product-reviewer`).
- The top session resumes a subagent that has its own child, and it keeps its
  context.
- When a layer-1 agent resumes its layer-2 child with `SendMessage`, the child
  gets the answer and keeps its context, but **its reply goes to the top session**,
  not to the layer-1 agent. The layer-1 agent cannot read it, and has no
  `TaskOutput` tool. This is why D6 has the runner dispatch a fresh unit.
- A fresh `Agent` dispatch from a layer-1 agent returns its result directly in
  the same turn.
- Not tested: the flag off, the CLI, Opus agents, a teammate that returns a
  `QUESTION` block, a whole run. Parked.

**Where the current behaviour is written** (paths under `plugins/vwf/`):

- "Execute asks the user nothing": `skills/execute/SKILL.md:21,44-56,62-64,184-188,205-206`;
  `references/rules.md:1,22,85-102,182-197,219`; `references/blocking.md:3,18-38`;
  `references/pause.md:34-39`; `references/setup.md:7,11-12`;
  `references/plan-files.md:29-30`; `references/waves.md:52-55`;
  `references/acceptance-and-ux.md:14,72,98-102`; `references/final-report.md:48`;
  `assets/execute-stages.md:260-268`; `assets/format-check.md:28`.
- The `edit` unit dispatch and the wave reviewer's block:
  `references/edit-unit.md:30,43-46,73-78,142-146`. The coder's `GAPS:`:
  `references/code-unit.md:38,47`. Reviewer `SPEC/PLAN GAPS:`:
  `references/review-unit.md:174-175`.
- `all`: `skills/execute/workflows/all.md:5-6,51,99-101,136-170`;
  `workflows/next.md:10`; `workflows/folder.md:106-107`;
  `agents/execute-runner.md:6,8,22,49-51,61-72`. The runner's tools are
  `Agent, Skill, Bash, Read, Write, Edit, Grep, Glob, TaskOutput, TaskStop`.
- Return blocks: the unit block, `assets/templates/plan-folder.md:582-592`;
  `agents/execute-coder.md:47-55,108-123`; `agents/execute-code-reviewer.md:126,149-171`;
  `agents/execute-security-reviewer.md:87,107-126`;
  `agents/execute-acceptance-verifier.md:72,76-92`; `agents/execute-ux-reviewer.md:117,120-142`.
  The two reviewers end "the turn ends with the block": this must allow the
  QUESTION lines.
- Planners: `assets/templates/plan-folder.md:398`; `assets/plan-interview.md:188-193`;
  `agents/plan-rulings-reviewer.md:21`; `skills/plan/SKILL.md:7,26`;
  `skills/change-plan/SKILL.md:5,20-22`; `skills/change-plan/references/self-review.md:44`.

**The record.** A `decisions` entry is `{id, decision, ruling, rejected, units}`,
all required (`skills/plan-management/scripts/lib/schema.mjs:140-147`). A `gaps`
entry is `{id, unit, stage, text, state}` (`schema.mjs:158-166`), and `unit`
must name a real unit or be `""`. The schema refuses unknown keys
(`schema.mjs:298-305`). `plan.mjs append` adds a `decisions` entry with no
code change. The unit status `unresolved` already exists.

**The action log.** `skills/execute/scripts/log.mjs:419` reserves only
`run.start`, `run.end`, `plan.snapshot` and `session.end`. Any other event name
is free, with `--key value` pairs and no validation (`log.mjs:434-446`). Strict
schemas exist for `row`, `gap`, `plan.snapshot` and `session.end` (`SCHEMAS`,
`log.mjs:197-310`), and only events that take JSON on stdin are checked
(`log.mjs:435-460`). The gap `class` enum is `GAP_CLASS` (`log.mjs:87`).
`summary` is `log.mjs:865-912`; it runs `report()` once per run, and the gaps
block of `report()` is `log.mjs:818-850`. The pane's `RunPhase` type is
`plugins/vwf/types/index.d.ts:8`. The hook `hooks/action-log.mjs:97-105`, `gapLines`, matches
only `^(GAP|UNRESOLVED):`. Tests: `scripts/src/execute-log.test.ts`; free events
`:175`, gap and row `:242-328`, hook `:377-508`, summary `:586-650`.

**The pane.** `hooks/monitor/plan.ts:234-258`, `phaseOf`, returns `ended`,
`not-run`, `live` or `paused`. `live` needs a live agent or a log line under 10
minutes old (`FRESH_MS`); an older wait shows "paused or stopped"
(`register.tsx:277-280,1207-1208`). `waiting` means only the queue (`"claim"`,
`"next"`: `register.tsx:347,866`; `plan.ts:404`; `view.tsx:872`). An
`AskUserQuestion` hook already steps the pane aside for an orchestrator
question (`register.tsx:993-1004`). Tests: `hooks/monitor/{plan,pane,refresh,agents}.test.*`,
not collected by vitest or CI; they run with `claude plugin test plugins/vwf`.

**Gates.** CI (`.github/workflows/plugins.yml`) runs `p:plugins:marketplace
--check`, `p:plugins:inventory --check`, `p:plugins:check`, `pnpm vitest run`,
`p:plugins:npm-normalize-test`, `p:releases:test`, and `tsc --noEmit`.
`code:precommit` takes no `--all` flag and always checks every file (open gap
`docs/memory/gaps/2026-11-06-gate-line-all-flag-undeclared-open.md`), so the plan
gate line has none. `p:plugins:check` rules that bite: 4 (strict-YAML
frontmatter), 6 (root-relative references), 7 (agent cross-references both
ways), 10 (technology-free wording), 12 (retired vocabulary), 16 (scripts import
only `node:` built-ins or relative paths).

**Tree traps.** `plugins/**/*.md` is not formatted by dprint: match the fold
width around an edit by hand. `readme.md`, `CLAUDE.md` and `site/**` are dprint's.
The repo commit convention allows `feat fix perf refactor revert test ops docs
merge wip`, and lists no scope.

**Docs that describe the old behaviour** (for U7): `site/src/content/docs/plugins/vwf.md:146,200-205,294,342,841,895,2115-2123,2449-2452,2585-2586,2609-2630,2652,2695-2708,2775-2776,3836`;
`how-to/operate/ad-hoc-change.md:16,113,156,178,250,294-310`;
`how-to/greenfield/single-repo.md:307,462,467,473`; `how-to/index.md:58,69`;
`how-to/operate/sessions-and-handoff.md:7,136`; `readme.md:23,30,64,249,265,407-410`;
`CLAUDE.md:73`; `.claude/docs/plugins.md:12`;
`.claude/skills/vwf-plugin/SKILL.md:84-104,398-446`;
`.claude/skills/vwf-plugin/references/skills-and-agents.md:38,72`.

**Backlog.** No item asked for this plan. B110 (P0, execute decides fix-or-park
without the user) is related and stays open (D12). B119 (runner risks) is
untouched.

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
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

This plan runs under the old executor, so its own units use the old block
above. The new block that the units write into vwf is D3.

## Out of scope

- Shortening the planner interview because a run can now ask. The user kept the
  full interview (D17).
- B110: accepting routine recommendations without the user, and the rule for
  the review-loop exit. It stays open (D12).
- B119: the two runner risks (the reserved `next` handoff, nesting depth 3).
- Fixing the `code:precommit --all` text in the template and planners: an open
  gap of its own.
- `brag-output/**`: it says the run is unattended, but it was a test and is not
  used (D43).
- `/vwf:verify` asking the user: it reads the new QUESTION lines and reports
  them, and does not become interactive (D34).

## Parked

- The real interactive run test, on the desktop and in the CLI, flag on and
  off, Opus agents, a teammate, `all` and headless:
  `docs/memory/gaps/2026-11-08-interactive-execute-real-run-test-parked.md`.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-08-execute-asks-the-user

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
