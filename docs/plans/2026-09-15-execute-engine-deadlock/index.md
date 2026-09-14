---
type: vwf-change-plan
title: execute engine deadlock — the orchestrator runs the review engines and
  hands their output to single-turn reviewers
requires: []
backlog: []
---

# Plan — execute engine deadlock — the orchestrator runs the review engines and hands their output to single-turn reviewers (2026-09-15)

## Status

**RUNNING** since 2026-09-15 — worktree
`.worktrees/2026-09-15-execute-engine-deadlock`, branch
`2026-09-15-execute-engine-deadlock`. Approved 2026-09-15 by the user, after
self-review.

## Consent

| Action                                            | Granted                                                                                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                                                      |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                      |
| Release vwf publicly                              | patch — `plugins/vwf/.claude-plugin/plugin.json`, the next patch above the value the tree holds when U4 runs, never a 13 or 17 component; by editing the `version` field |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U4 runs it first)                                                             |
| Release stackgen publicly                         | none — untouched                                                                                                                                                         |
| Release installer publicly                        | none — untouched                                                                                                                                                         |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

This plan carries **no** `/release` step: the user ruled on 2026-09-14 that
every plan's bump batches into one tag, offered only when `docs/plans/` holds no
unarchived folder, and `2026-09-14-design-review-loop` is still pending. The
bumps recorded above ship with that later release.

## Goal

A `/vwf:execute` step reaches its `REVIEW:` and `SECURITY:` blocks with no user
input, however long `/code-review` or `/security-review` takes. Today the two
reviewer subagents invoke those skills themselves; each skill forks a
**background** agent and returns at once, the reviewer finishes its manual
dimensions, ends its turn, and the engine's completion lands in the
orchestrator's session — where the stage contract says only "wait for the
reviewer's block". Both sides wait; nothing moves until a human types. A 14-step
run on 2026-09-14 lost two hours to it, on the two steps whose diffs were large
enough for the engine to outlive the manual pass.

The fix moves the engines to the orchestrator, which is the main session: it
receives the completion, and it has `TaskOutput` to wait on it. The reviewers
become single-turn — manual dimensions, merge with the engine text they were
handed, one block. No standing decision is reversed; the 2026-09-08
change-workflow plan left both reviewer agents untouched by choice, and nothing
in `docs/memory/decisions/` or `docs/backlog.md` covers the engines.

## Facts the survey established

**Harness behaviour, from the docs (fetched 2026-09-15, Claude Code 2.1.270).**

- `/code-review` is a forked skill and runs in the **background by default**
  (v2.1.218+). `background: false` is a frontmatter field on the skill's own
  file; an invoker cannot ask for a synchronous run. `/security-review`
  completed inline in the observed run, but nothing documents it either way —
  treat both the same.
- `TaskOutput` is **stripped from every subagent**, foreground or background. A
  reviewer cannot poll or block on an engine it launched.
- A foreground subagent that ended its turn is not documented to receive a later
  completion; the observed run shows the completion reaching the parent session
  instead.
- `SendMessage` resumes a completed subagent with its context intact, and a
  running subagent treats its launcher's message as task direction. Not used by
  this plan — recorded so the rejected shapes stay legible.
- Claude Code waits for a forked skill when an earlier invocation of the same
  skill is still running. Two consecutive steps' engines therefore serialize;
  harmless here.

**The reviewer agents.** `plugins/vwf/agents/execute-code-reviewer.md`:
frontmatter `tools` at 8-12 (`Read, Bash, Grep, Glob, Skill, SlashCommand` plus
four mempalace ids), `model: opus` at 13, description names the engine at 6-7;
step 1 "Run `/code-review` as the engine … high effort" at 23-25; the
`ENGINE: unavailable` fallback at 25-27; manual dimensions 28-89; "merge both
into one findings list" at 91; "do not paste /code-review output" at 115; return
block 120-130
(`FINDINGS / SPEC COMPLIANCE / SPEC/PLAN GAPS / API COMPAT /
VERDICT / RECALL / GAPS / ENGINE`),
`ENGINE` line at 129, "nothing before or after the block" at 132.
`execute-security-reviewer.md`: tools 7-11, model 12, description 5-6, step 1 at
23, fallback 23-27, manual dimensions 28-50, merge at 52, block 82-90, `ENGINE`
line at 89. Neither says anything about waiting, background agents, or ending
the turn; both treat the skill as synchronous. A reviewer that reads the skill's
spawn acknowledgement as "no findings" also reports a spurious
`ENGINE: unavailable` — the same bug wearing a quieter face.

**The orchestrator.** `plugins/vwf/skills/execute/SKILL.md` (480 lines):
description at 5; pipeline summary 98-107; "full pipeline every step" 124-126;
capped rounds and convergence guard 135-151; gaps rule 152-157; journal rule
172-181; pause conditions incl. "Subagent death" 198-201; execute loop 341-382
with step 3 "review + security (concurrent)" at 356-359, step 4 merged loop-back
360-371, step 5 gaps 372-374, step 7 persist and journal 377-382; final-gate
"Fix first" loop 455-457. `plugins/vwf/assets/execute-stages.md` (243 lines):
stage table 10-16, "dispatch both in a single message" 18-22, review dispatch
contract 52-65 (engine named at 57), security dispatch contract 66-71 (engine at
68-69), loop-on-findings 118-126, convergence guard 127-148, journal shape
167-205 with "write on return" at 199-201. No line in either names a
notification, `SendMessage`, `TaskOutput`, or what to do with a reviewer that
returned without its block. `skills/execute/references/` holds only
`preflight.md` and `acceptance-and-ux.md`.

**The cadence conflict.** `plugins/vwf/assets/memory.md:332-333` says the run
journal is written "as each step completes" (`add_drawer` then `update_drawer`);
`execute/SKILL.md:377-382` and `execute-stages.md:199-201` mandate a write as
**each node returns**. Same write, two cadences.

**Elsewhere.** `/vwf:change-execute`'s wave reviewer
(`skills/change-execute/references/wave-review.md:11-34`) invokes no engine —
unaffected. No hook references either skill. The other `engine` hits under
`plugins/vwf/` are unrelated senses.

**Docs that describe today's behaviour.** `site/src/content/docs/plugins/vwf.md`
195-197 ("leans on review engines … falling back to manual dimensions"),
1889-1894 (the `/vwf:execute` bullet, which also still reads
`code → review → security` sequentially), 205-210, 168-177, 325;
`.claude/skills/vwf-plugin/references/skills-and-agents.md:69-70` (agent table
rows, no engine mention); `readme.md:57-62` and the two how-to one-liners
(`how-to/greenfield/single-repo.md:282-284`, `cli-product.md:167`) describe the
loop's shape only and stay true. `CLAUDE.md` and `.claude/docs/**` do not
mention the engines.

**Gates.** The nine wave-gate lines below; `p:plugins:check`'s fourteen rules
cover the agent and skill frontmatter (strict YAML). No gate can assert prose
behaviour. Commit types allowed by `.config/git-conventional-commits.yaml`:
`ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes. No mise task bumps
a plugin — the version field is edited by hand and
`mise run p:plugins:marketplace` regenerates the manifest. vwf is `19.27.0`,
site `1.1.19`.

## Assumed decisions — confirm or override at review

| # | Decision             | Ruling                                                                                                                                                                                                                                                                             | Rejected                                                                                                                                                                                                                                                                                                                     | Unit   |
| - | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1 | Who runs the engines | The orchestrator invokes `/code-review` (high effort) and `/security-review` itself, in one message, after the coder returns; waits on both with `TaskOutput`; then dispatches both reviewers in one message with each engine's output in its prompt. The reviewers run no engine. | (a) reviewer keeps the engine, orchestrator forwards the completion to the idle reviewer — relies on undocumented routing, the very path that deadlocked; (b) reviewers dispatched alongside the engines and resumed on report — keeps the overlap but adds a two-state contract on both sides, where the original bug lived | U1, U2 |
| 2 | Reviewer turn shape  | A reviewer is single-turn: manual dimensions, merge with the engine text in its prompt, return one block. Ending the turn without the block, or with any promise to fold findings in later, is named as forbidden in the agent file.                                               | —                                                                                                                                                                                                                                                                                                                            | U1     |
| 3 | Engine hand-off      | The engine's output is pasted verbatim into the reviewer's dispatch prompt under an `## Engine` heading.                                                                                                                                                                           | write it to a scratch file and pass the path — the reviewer is single-turn, so a file buys nothing and adds a write                                                                                                                                                                                                          | U2     |
| 4 | Engine failure       | An engine that errors, or has not reported 30 minutes after invocation, is stopped with `TaskStop`; the reviewer is dispatched with `## Engine` reading `ENGINE: unavailable — <reason>`. The reviewer's existing fallback and its `ENGINE: unavailable` return line stay.         | pause and ask — execute is autonomous between start and the final gate                                                                                                                                                                                                                                                       | U2     |
| 5 | Blockless return     | A reviewer return that carries no `REVIEW:` / `SECURITY:` block is an error under the existing "Subagent death" pause rule: re-dispatch once; twice in a row on one step → journal `blocked`, pause.                                                                               | a new pause condition                                                                                                                                                                                                                                                                                                        | U2     |
| 6 | Re-review rounds     | Every review round — the merged loop-back rounds 2–4 and the final-gate "Fix first" loop — runs the engines again before dispatching the reviewers, the same sequence as round 1.                                                                                                  | engines in round 1 only — a fix that introduces a new bug would be caught by the manual dimensions alone                                                                                                                                                                                                                     | U2     |
| 7 | Reviewer tools       | `Skill` and `SlashCommand` leave both reviewers' `tools` lists — nothing remains for them to invoke. The four mempalace ids stay; `model: opus` stays.                                                                                                                             | keep them                                                                                                                                                                                                                                                                                                                    | U1     |
| 8 | Journal cadence      | `assets/memory.md:332-333` is reconciled to the per-node cadence `execute/SKILL.md:377-382` and `execute-stages.md:199-201` already mandate — a record as each node returns, not as each step completes.                                                                           | park it                                                                                                                                                                                                                                                                                                                      | U2     |

## Review-stage contract

Both wave-1 units implement this text; U2 writes it into the orchestrator, U1
into the two agents. Neither invents a field the other does not read.

**Orchestrator, after the coder returns green, and again at the start of every
review round:**

1. In **one message**, invoke `/code-review` at high effort and
   `/security-review` through the `Skill` tool. Each may run as a background
   task; note the task it reports.
2. Wait on each with `TaskOutput`, blocking, up to 30 minutes from invocation.
   An engine that errors or times out is stopped with `TaskStop` and counted
   unavailable, with the reason kept for the prompt.
3. In **one message**, dispatch `execute-code-reviewer` and
   `execute-security-reviewer`. Each dispatch prompt ends with a section headed
   `## Engine` holding either the engine's output verbatim, or the single line
   `ENGINE: unavailable — <reason>`.
4. Each reviewer returns exactly one block. A return without the block is an
   error under "Subagent death". The orchestrator never waits for anything from
   a reviewer but its return, and never expects a notification on a reviewer's
   behalf — the reviewers run no engine.

**Reviewer:** step 1 reads the `## Engine` section of the dispatch prompt in
place of running the skill. A prompt with no `## Engine` section is read as
`ENGINE: unavailable — not supplied`, and the return line says so. Everything
from the manual dimensions onward is unchanged. The block's `ENGINE` line keeps
its current vocabulary.

## New dependencies

none

## Units

| Id | Wave | Unit file                                            | Owns                                                                                                           | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-reviewer-agents.md](01-reviewer-agents.md)       | `plugins/vwf/agents/execute-code-reviewer.md`, `plugins/vwf/agents/execute-security-reviewer.md`               | —          | green   | 87884cfd |
| U2 | 1    | [02-orchestrator-stage.md](02-orchestrator-stage.md) | `plugins/vwf/skills/execute/SKILL.md`, `plugins/vwf/assets/execute-stages.md`, `plugins/vwf/assets/memory.md`  | —          | green   | 6d430029 |
| U3 | 2    | [03-docs.md](03-docs.md)                             | `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`                                             | U1, U2     | green   | 0804ff94 |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md)         | `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json` (regenerated) | U3         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                     | Why it collides                                    | Owner   |
| ---------------------------------------- | -------------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json` | several units bumping one version is a lost update | U4 only |
| `site/package.json`                      | the same                                           | U4 only |
| `.claude-plugin/marketplace.json`        | generated; regenerating mid-wave races             | U4 only |
| `site/src/content/docs/**`               | human-facing docs                                  | U3 only |
| `readme.md`, `CLAUDE.md`, `.claude/**`   | human-facing docs                                  | U3 only |

## Waves

- **Wave 1 — U1, U2.** Disjoint files: the two agent files against the execute
  skill and two assets. Both implement the contract section above verbatim, so
  neither depends on reading the other's edit.
- **Wave 2 — U3.** Docs, after the tree is final.
- **Wave 3 — U4.** Bump and regenerate, after the docs.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

Plus the wave review, plus every report read for `UNRESOLVED:`. Every line is
green before wave 1 — this plan adds no pack, rule or generated file, so every
line holds throughout.

## After landing

| Step                       | Mode | Notes                                                                                                                                     |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | Stages vwf into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag; a **restarted** session loads it. |

No `/release` step — see the consent block.

## Gates the orchestrator keeps

- **The long-engine trace.** The wave-1 reviewer, in addition to its usual
  rules, walks one step whose engine takes longer than the reviewer's manual
  pass through the new text alone — `execute/SKILL.md` step 3 and
  `execute-stages.md`, then each agent file — and writes the sequence of events
  it reaches. Pass condition: a `REVIEW:` and a `SECURITY:` block are reached
  with no user input and no `SendMessage`, and no line in either agent file
  invokes `/code-review` or `/security-review`. A trace that needs a step the
  text does not state is a finding.
- No dry-run mode exists for `/vwf:execute`; a real long-diff run is the user's
  next execute on `virajp.dev`, outside this plan (see Parked).

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **The per-step slowness** (~35 minutes per step without stalls). The request
  said flag, not fix; one contradiction is fixed under ruling 8, the rest is
  parked.
- **`/vwf:change-execute`'s wave reviewer.** It invokes no engine
  (`wave-review.md:11-34`) and cannot deadlock this way.
- **Restoring the overlap** between the engine run and the reviewer's manual
  pass (rejected shape (b) in ruling 1). Serial costs up to the engine's run
  time per round — 0.5 to 9 minutes observed — against the two hours a stall
  cost.
- **The triple prescription** of the per-node journal write
  (`execute/SKILL.md:172-181`, `:377-382`, `execute-stages.md:199-201`). They
  agree; it is a maintenance hazard, not a defect, and the user dropped it.

## Parked

- **Diary checkpoint beside the journal.** The Stop hook
  (`plugins/vwf/hooks/hooks.json:14-23` → `hooks/mempalace-checkpoint.sh`, every
  `MEMPALACE_SAVE_INTERVAL` stops, default 15) fires mid-run, so an execute step
  produces a diary entry on top of its journal record — two mempalace writes
  describing the same step, only one of which the final report renders.
  Structural; a later plan decides whether the hook should stand down while a
  run journal is open.
- **A real long-diff execute run** as proof of this fix — the user's next
  `/vwf:execute` on `virajp.dev` (plan `docs/plans/2026-09-14-1533-home.md`,
  steps 9–14 remaining). If a step with a whole-test-suite diff stalls, the
  trace in "Gates the orchestrator keeps" missed a path.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                             | Commit   |
| ---- | --------- | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green       | all nine gate lines green on the integration branch                                                                                                                                                                                                                                                                                                | —        |
| 1    | U1        | opus  | 1     | returned    | DECIDED: fallback `ENGINE` line keeps its exact text, reason appended in prose; step 2's "dimension `/code-review` does not cover" and "do not paste output" rule left verbatim (name, not invoke). GAP: none                                                                                                                                      | 87884cfd |
| 1    | U2        | opus  | 1     | returned    | DECIDED: stage-table "Runs" column widened, rows re-padded by hand. DOCS FALSIFIED: vwf.md:195-197, :1889-1894, skills-and-agents.md:69-70 (all already listed for U3). GAP: none                                                                                                                                                                  | 6d430029 |
| 1    | R1        | opus  | 1     | findings(2) | SKILL.md:105 [U2] fold broken at 101 chars; execute-code-reviewer.md:32-34 + security:31-34 [U1] RULINGS — `ENGINE` line verbatim with "carrying the reason given" but no stated home for the reason; not-supplied indistinguishable from failure. TRACE: pass — both blocks reached, no user input, no SendMessage, no skill invoked by an agent  |          |
| 1    | U1        | opus  | 2     | returned    | fallback line is now `ENGINE: unavailable — <reason>` in step 1 and the block; fixed suffix gone. DECIDED: block comment names the `## Engine` section, not the skill                                                                                                                                                                              | 87884cfd |
| 1    | U2        | opus  | 2     | returned    | re-folded the Pipeline paragraph at 80; no other over-80 line added                                                                                                                                                                                                                                                                                | 6d430029 |
| 1    | R1        | opus  | 2     | pass        | FINDINGS: 0; CONTRACT clean; TRACE unchanged. RULINGS residual, contested: the fallback suffix `manual dimensions only` became `<reason>` — orchestrator-directed to close round 1, since the contract's "keeps its current vocabulary" and "the return line says so" could not both hold; `ENGINE: unavailable —` kept, nothing parses the suffix |          |
| 2    | U3        | opus  | 1     | returned    | DECIDED: mermaid node vwf.md:1932 edited too (same `code → review → security` string); agent rows gained one hand-off clause each; docs-sync surveyor: FINDINGS none, readme/how-tos/vwf.md:168-177,205-210,325 confirmed true. GAP: none                                                                                                          | 0804ff94 |
| 2    | R2        | opus  | 1     | findings(1) | skills-and-agents.md:69-70 [U3] rule 2 — dangling "it" in both reviewer rows; fact right, alignment intact. CONTRACT clean; RULINGS clean                                                                                                                                                                                                          |          |
| 2    | U3        | opus  | 2     | returned    | rows 69-70 reworded ("runs and hands over under `## Engine`"), width re-padded                                                                                                                                                                                                                                                                     | 0804ff94 |
| 2    | R2        | opus  | 2     | pass        | FINDINGS: 0; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                         |          |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-15-execute-engine-deadlock
