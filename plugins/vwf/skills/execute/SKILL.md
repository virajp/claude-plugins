---
name: execute
description: >-
  Runs an approved plan folder to completion in a dedicated worktree and a
  fresh context, and lands it per the plan's recorded consent. Use as
  /vwf:execute <plan-folder>, next or all, once /vwf:plan or /vwf:change-plan
  has approved a folder in docs/plans/. Not for writing a plan (use plan or
  change-plan).
argument-hint: "<plan-folder, its index.json, next, or all>"
model: opus

user-invocable: true
disable-model-invocation: false
metadata:
  archetype: workflow
  depends-on: [plan-management, backlog, git-workflow, doctor, docs-sync, handoff, code-review, security-review]
---

# execute

Implement an approved plan to completion, autonomously. The plan folder is the
contract, and its `index.json` is the input. `/vwf:plan` or `/vwf:change-plan`
wrote every consent, unit scope and gate line there, beside the prose in
`index.md` and the rulings in the unit files. Read them; do not re-ask them.

**The argument** is `$ARGUMENTS`.

The orchestrator decides, reviews and verifies, and never reads unit work
inline. Every edit is a subagent's — this session's context stays the size of
the reports. Each unit's `kind` is the switch:

| `kind`   | What runs                                                                                                                                                                                                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`   | Passes code under TDD to the coverage gate and its commit. Implemented by `execute-coder`.                                                                                                                                                                                                                     |
| `edit`   | Dispatched with the other `edit` units of its wave, by the unit agents, and judged by the wave review.                                                                                                                                                                                                         |
| `review` | The planner placed it, by default once after the last code unit. Runs the two review engines and two reviewers over the branch delta since the previous review row, the security half alone when it covers `edit` units alone. Findings loop back to the owning units before it counts as done. Each later round covers the previous round's fixes alone. |

Acceptance and UX conformance run once after all units when the plan has
`covers`. You own the orchestration, and dispatch the five stage subagents:
`execute-coder` for `code` units, `execute-code-reviewer` and
`execute-security-reviewer` at `review` rows, `execute-acceptance-verifier` and
`execute-ux-reviewer` once per plan. You also dispatch the unit agents for
`edit` units, and the wave reviewer for every wave.

There are no per-stage human gates. Decisions come from
[the Autonomous Rules](references/rules.md). The run stops only at a runtime
stop: a Pause Condition, or the final report when something stands in the way
of the landing. Each stop is reported with its resume command.

**Execute asks the user nothing.** The planner asked every question a run needs,
and recorded the answer in the folder. Where the folder is silent and the rules
do not decide, report what is missing and stop. Never offer a choice, wait for a
yes, or ask how to proceed. A fix goes into the folder, and the person re-runs
`/vwf:execute <folder>`. Two exceptions come before the run starts and never
from a run: the run-level questions of `all`, asked once by the loop before its
first plan, and the session question below.

Run in a fresh context: a fresh session, or a runner that `all` dispatches. The
skill cannot check that. When the person typed `/vwf:execute`, the launch line
said it, and this skill trusts it.

Adopt the **Autonomous delivery driver** persona: keep moving, decide from the
rules, isolate all work in one worktree, document what you cannot resolve, and
land only what the plan's `consent` already authorised.

## First, on every run

**The session question.** Ask it when the model invoked this skill itself,
through the `Skill` tool. Do not ask it on a command the person typed, or as an
`execute-runner` — a runner reads this file rather than invoking the skill. Ask
it before the format test and before anything else: run in a **new session**, or
**continue in this session**? Say why in one line: the run needs the whole
context window, and this session has already used part of it.

- **New session** → start a fresh session with the host's tool for that, where
  the host has one, its prompt the same `/vwf:execute <argument>` line. Where it
  has none, print that line for the person to run in a fresh session. Then stop:
  claim nothing, cut no worktree, start no log.
- **Continue in this session** → run here, from the format test on.

**The format test.** Whatever the argument is — a folder, `next` or `all` — look
at the base repo's local checkout before any other step.

- The repo is in the **old format** whenever `docs/plans/index.md` exists, with
  or without `docs/plans/index.json` (a migration stopped half way).
- A named folder is in the old format when it holds an `index.md` and no
  `index.json`.

On the old format, stop before any change: claim nothing, cut no worktree, start
no log, write nothing. Print the migration message:

> This repo uses the old plan format. Migrate it with
> `https://github.com/virajp/claude-plugins/blob/main/docs/plans/migrate.md`
> — in a local clone of `virajp/claude-plugins`, paste "Read
> `<local path>/docs/plans/migrate.md` and follow it in this repo." — then
> run the same command again.

After the migration the same command runs on the new format. A repo with neither
file has no plan: `next` and `all` report no runnable plan, and a named folder
halts as [folder.md](workflows/folder.md) says.

## Invoke

| Form                            | Workflow                       | Loads     |
| ------------------------------- | ------------------------------ | --------- |
| `<plan-folder>`, its index.json | [folder.md](workflows/folder.md) | always    |
| `next`                          | [next.md](workflows/next.md), then folder.md | sometimes |
| `all`                           | [all.md](workflows/all.md)     | sometimes |
| You are an `execute-runner`     | [all.md](workflows/all.md), *Runner mode*, then folder.md | sometimes |

## Routing

| Doing                                               | Read                                             | Loads     |
| --------------------------------------------------- | ------------------------------------------------ | --------- |
| Reading or writing the folder                       | [plan-files.md](references/plan-files.md)        | always    |
| Deciding anything during the run                    | [rules.md](references/rules.md)                  | always    |
| Each call to `log.mjs`, read once at Resolve        | [action-log.md](references/action-log.md)        | always    |
| Resolve, for `validate` and the release levels; Setup steps 2 and 3 with a `code` unit | [preflight.md](references/preflight.md) | always |
| A wave holds a `code` unit                          | [code-unit.md](references/code-unit.md)          | sometimes |
| A wave holds an `edit` unit, and every wave's review | [edit-unit.md](references/edit-unit.md)         | always    |
| A wave holds a `review` row                         | [review-unit.md](references/review-unit.md)      | sometimes |
| On failure, and on a resume                         | [blocking.md](references/blocking.md)            | sometimes |
| A Pause Condition holds                             | [pause.md](references/pause.md)                  | sometimes |

Read each `sometimes` file where it applies, and never upfront.

## State

| File                                                                                                                  | Access                       | Owner                         |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------- |
| Plan: `docs/plans/<date>-<HHMM>-<slice>/` (target repo), `docs/plans/<date>-<name>/` (base): `index.json`, `index.md`, unit files | read; written through `plan.mjs` | the planner; this run for run facts |
| Plan index: `docs/plans/index.json` (base repo), its `plans` list                                                     | read; written through its verbs | `plan-management`             |
| Plan template: `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`                                                | read                         | vwf                           |
| Membership: `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`                                                              | read                         | vwf                           |
| Backlog: a project on the base repo's forge, never a path                                                             | marked done or partial through its verbs | `/vwf:backlog`    |
| `<folder>/engine/<loop-id>-<round>.log`, each engine's output | written at a `review` row; committed with the folder | this skill |
| `<log root>/active/<session id>`, the session's run marker | written by `log.mjs`; deleted by `log.mjs` and the `SessionEnd` hook | this skill and its hooks |
| `~/Library/Caches/vwf/<repo>/<folder basename>.jsonl`, the action log                                                 | append only                  | this skill and its hooks      |
| `.config/releases.yaml`                                                                                               | raised on a merged landing   | this skill; the release step clears |
| `docs/memory/decisions/`, `docs/memory/gaps/`                                                                         | read; decisions written      | the memory rule               |
| `docs/scratchpad/<project>/renders/` in the main checkout                                                             | written by `renders.mjs`     | this skill                    |
| `.config/vwf.yaml`                                                                                                    | read; `harness:` at Reconcile | the repo                     |
| Registry: `docs/blueprint/registry.yaml` — *cycle plans only*                                                         | read; updated at Reconcile   | the blueprint                 |
| Flow (slice): `docs/blueprint/flows/<project>/<NNN>-<flow>/index.md` — *cycle plans only*                             | read                         | the blueprint                 |
| Entity: `docs/blueprint/entities/<entity>/` (`index.md` + schema) — *cycle plans only*                                | read                         | the blueprint                 |
| API contract: `docs/blueprint/apis/<project>.openapi.yaml` — *cycle plans only*                                       | read                         | the blueprint                 |
| Released APIs: `docs/blueprint/apis/released/` — *cycle plans only*                                                   | read                         | the blueprint                 |
| Conventions: `docs/blueprint/conventions.md` — *cycle plans only*                                                     | read                         | the blueprint                 |
| Environment: `docs/blueprint/environment.md` — *cycle plans only*                                                     | read; updated at Reconcile   | the blueprint                 |
| The `implementation:` stamp of each `covers` doc — *cycle plans only*                                                 | written at Reconcile         | this skill                    |

Read the *cycle plans only* rows on a plan with `covers`, and never otherwise.

## Phases

| Phase                                     | Gate                                       | File                                                       | Loads     |
| ----------------------------------------- | ------------------------------------------ | ---------------------------------------------------------- | --------- |
| Session question                          | user, only when the model invoked it       | [SKILL.md](SKILL.md)                                       | always    |
| Run-level questions                       | user, once, only under `all`               | [all.md](workflows/all.md)                                 | sometimes |
| Resolve: read the folder, refuse early    | auto                                       | [folder.md](workflows/folder.md)                           | always    |
| Start the log, run doctor, claim the row  | auto                                       | [claim.md](references/claim.md)                            | always    |
| Format check, recall, setup               | auto                                       | [setup.md](references/setup.md)                            | always    |
| Waves                                     | auto                                       | [waves.md](references/waves.md)                            | always    |
| Acceptance and UX, with `covers`          | auto                                       | [acceptance-and-ux.md](references/acceptance-and-ux.md)    | sometimes |
| Reconcile and the fixed final waves       | auto                                       | [reconcile.md](references/reconcile.md)                    | always    |
| The final report                          | auto                                       | [final-report.md](references/final-report.md)              | always    |
| Land                                      | auto, by the recorded `consent`            | [land.md](references/land.md)                              | always    |
| After landing                             | auto, on a green landing                   | [after-landing.md](references/after-landing.md)            | always    |

## Halt and pause

These are the only stops before the final report. Refusals at Resolve come
first, and stop before the claim: [folder.md](workflows/folder.md). The steps of
a pause are [pause.md](references/pause.md).

| ID | Condition                                                                                                                                                                                                 | Action                                                     |
| -- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| H1 | No approved plan, or a plan with `covers` and a missing blueprint for a needed slice                                                                                                                      | Hard halt                                                  |
| H2 | The test, coverage or build harness cannot run at all (TDD cannot be verified) when a `code` unit is planned                                                                                              | Hard halt                                                  |
| H3 | A git or merge conflict that cannot be safely resolved                                                                                                                                                    | Hard halt                                                  |
| H4 | A stage subagent errors twice in a row (after one re-dispatch) on the same unit. A reviewer that returned without its `REVIEW:` / `SECURITY:` block counts as an error                                    | Commit what is safe, record the unit blocked, pause        |
| H5 | Resource caps: context > 65%, 5-hour > 90%, or 7-day > 80%, delivered by an external hook                                                                                                                 | Pause per [pause.md](references/pause.md)                  |
| H6 | All-blocking gap: a blocking gap halts every remaining unit, and no independent work is left                                                                                                              | Document it and pause                                      |
| H7 | Non-converging cap-exempt finding: a security or `[breaking-api]` finding trips the convergence guard                                                                                                     | Pause with the finding, the rounds tried, and each change  |
| H8 | Uncovered decision: irreversible or outward-facing and not covered by the rules or the folder; an ambiguous wave order the written order cannot settle; blocking format drift                              | Blocking-gap stop. Never ask                               |

An isolated blocking gap does not pause: skip, document and continue per the
rules. Everything else is decided from the rules — do not pause for routine
approvals. Refuse destructive operations (`--force`, `reset --hard`, deleting
files the run did not create), and never pause on them.

## Output

- The [final report](references/final-report.md), rendered from the record.
- At a stop, a report with its resume command, `/vwf:execute <folder>`.
- As a runner, the five lines of [*The return block*](workflows/all.md), and no
  line more.

## Never

The full list is [*What this skill never does*](references/rules.md).

- Read a unit's owned files or do a unit's work inline; dispatch it — the
  session's context stays the size of the reports.
- Ask the user anything at run time; report and stop with the resume command —
  no one is there to answer.
- Merge or push the run branch before the landing, or past the recorded
  `consent`; commit in the worktree — the plan holds the only authorisation.
- Bump a version; record a release level at the landing — a person runs the
  release step that bumps it.
- Run a gate that the plan's gate lists do not name, or skip one they do; run
  what is written — a gate the plan does not name is not this run's to invent.
