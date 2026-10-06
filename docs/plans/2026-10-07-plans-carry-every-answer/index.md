---
type: vwf-change-plan
title: Plans carry every answer — the planners ask everything, execute asks
  nothing
requires: []
backlog: []
backlog_pieces: []
---

# Plan — Plans carry every answer — the planners ask everything, execute asks nothing (2026-10-07)

## Status

**APPROVED**

APPROVED 2026-10-07 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release vwf publicly                              | none    |
| Release site publicly                             | none    |

**The mode recorded here is the consent.** The one step is `run`: it runs on a
green landing without a prompt. It stages vwf into the dev marketplace, picked
up only by a **restarted** session. **Release none** for vwf and the site: this
is plan 1 of a three-plan chain, and the chain ships in one tag after plan 3.
vwf still takes its version bump here — `plugins/vwf/.claude-plugin/plugin.json`
`20.1.0` → `21.0.0` (major, by editing the file, then
`mise run p:plugins:marketplace`): the last tag is `vwf-v20.0.1`, so `20.1.0` is
only a minor above it, and refusing a folder that carries an `ask` step breaks a
folder that used to run. The site is not bumped (`p:site:version` is not run).

## Goal

After this lands, `/vwf:plan` and `/vwf:change-plan` record an answer to every
question a run could raise, and `/vwf:execute` asks nothing at run time — it
follows the plan, and only runtime stops (a failed gate, a dead subagent, a
resource cap, a blocking gap, a failed landing condition) end a run, each
reported with its resume command.

The framing: the user ruled "planners must ask all questions before hand and
embed the answers in the plan; execute will simply implement the plan and follow
all the instructions". This is plan 1 of a chain of three — plan 2 adds
`/vwf:execute all` (every runnable plan, each in its own runner subagent), and
plan 3 gives `all` run-level questions asked once before the first plan, as
overrides of the plans' steps.

**Two reversals, both confirmed by the user:**

1. `docs/memory/decisions/2026-09-17-after-landing-runs-on-recorded-consent.md`
   ruling 8 — "On a green landing execute runs every `run` step in order without
   a prompt and stops once before each `ask` step" — and that doc's note that an
   unconsented landing's steps are "offered, every one as an `ask`". The `ask`
   mode is retired: every after-landing step is `run`, or it is dropped from the
   plan. Ruling 9 stands — a release recorded `run` is authorised by the
   release-intent question.
2. Execute's post-run dialogue (skill text, no decision doc): the "Fix first /
   Reject" choice after a failed landing condition, the offer to close each gap,
   and the chain-forward offer of `/vwf:execute <next-folder>` all become a
   report — what failed, the open gaps, the next launch line — and the run
   stops. A fix goes into the folder, and the person re-runs
   `/vwf:execute <folder>`.

## Facts the survey established

**Where `/vwf:execute` waits on the user today** — every one is removed:

| # | Where (`plugins/vwf/skills/execute/`)               | What it asks or offers today                                |
| - | --------------------------------------------------- | ----------------------------------------------------------- |
| a | `SKILL.md:99-101`                                   | clone a missing target repo; stops on decline               |
| b | `SKILL.md:139-140`                                  | tells the user to "ask to unclaim" a `RUNNING` prerequisite |
| c | `SKILL.md:231-235`, `references/format-check.md:24` | pauses on blocking format drift for `/vwf:setup`            |
| d | `SKILL.md:271-274`                                  | an ambiguous wave order paused as an "uncovered decision"   |
| e | `SKILL.md:447-448`                                  | "uncovered irreversible decision … Pause and ask"           |
| g | `SKILL.md:798-812`                                  | failed landing condition — Fix first / Reject               |
| h | `SKILL.md:814-822`                                  | offers to close each gap, and to archive                    |
| i | `SKILL.md:824-831`                                  | offers `/vwf:execute <next-folder>`                         |
| j | `SKILL.md:847-856`                                  | unmerged branch — worktree-runnable steps offered as `ask`  |
| k | `SKILL.md:858-862`                                  | offers waiting before an `ask` step                         |
| l | `SKILL.md:869-871`                                  | after a failed step, offers the remaining steps             |
| m | `references/blocking.md:63-73`                      | on resume with the worktree gone, offers to unclaim         |
| n | `SKILL.md:760-761` → plan-management `archive`      | archive's completion warning "asks to proceed"              |

Row f (`SKILL.md:439-446` — the all-blocking gap, the non-converging cap-exempt
finding) is already pause-and-report and stays.

**The `ask` mode** — every passage that defines or uses it:

- execute `SKILL.md:14`, `:43-45`, `:163-165` (resume refuses a mode that is
  neither `run` nor `ask`), `:180-183` (the same on a fresh run), `:833-845`,
  `:847-856`, `:858-862`, `:869-871`, `:878-889` (the doctrine passage listing
  the allowed pauses), `:902`
- change-plan `SKILL.md:170-176` (§4(b)) and `:187-193` (§4(c), "intent, not
  authorisation" at `:190`)
- plan `SKILL.md:336-340`
- plan-management `references/plan-index.md:268-275`; plan-management
  `SKILL.md:249-275` and `:443-444` ("Every completion warning asks")
- `assets/plan-interview.md:139-145` (item 17) and `:146-157` (item 18)
- `assets/templates/plan-folder.md:62`, `:66-78`, `:185-190`
- `CLAUDE.md:61-62` and `:333-335` (`:5-8`'s release rule keeps its `run`
  exception and stays true)
- `readme.md` — the `/vwf:execute` passage near `:252-255`
- `.claude/skills/vwf-plugin/SKILL.md:84`;
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:36`, `:46`
- `.claude/skills/release/SKILL.md:55`; `.claude/docs/ci-and-releases.md:98`
- `site/src/content/docs/plugins/vwf.md:2340-2343`, `:2694-2698`, `:3101-3104`,
  `:3116`, `:3502`, and the `/vwf:execute` section from `:2389`
- `site/src/content/docs/how-to/operate/ad-hoc-change.md:121-123`, `:130-132`,
  `:247-253`, `:305`
- Not this mode (leave alone): `skills/init/SKILL.md:740`, `:816`; execute
  `SKILL.md:634`; `vwf.md:2630`.

**Other facts**

- Execute's frontmatter has no `allowed-tools`; every ask is prose.
  `disable-model-invocation: true` (`SKILL.md:22`) stays.
- Preflight already validates the After landing *Mode* column at
  `SKILL.md:163-165` (resume) and `:180-183` (fresh run); the refusal narrows
  there. `references/preflight.md` does not cover that table. No checker
  (`scripts/src/check.ts`) or test reads plan folders.
- `plan-management unclaim` itself "asks once" (`plan-management/SKILL.md:172`)
  — execute never invokes it.
- Both APPROVED plans (`2026-10-05-fnox-dev-only`,
  `2026-10-05-reshape-migration`) record merge `yes` and one `run` step; no
  unarchived folder carries an `| ask |` cell.
- vwf is `20.1.0`; the last tag is `vwf-v20.0.1`.
- Commit types (`.config/git-conventional-commits.yaml`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.
- `plugins/**/*.md` is **not** dprint-formatted — match the fold width by hand.
  `CLAUDE.md`, `readme.md` and `site/**` are.

## Assumed decisions — confirm or override at review

| #   | Decision                        | Ruling                                                                                                                                                                                                                         | Rejected                                                | Unit       |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ---------- |
| D1  | After-landing modes             | Every after-landing step is `run` or dropped; the `ask` mode is retired                                                                                                                                                        | keep `ask`; keep `ask` for release steps only           | U1, U2, U3 |
| D2  | Post-run dialogue               | A failed landing condition, the open gaps and a now-runnable dependent plan are reported and the run stops; a fix goes into the folder and the person re-runs `/vwf:execute <folder>`                                          | the Fix first / Reject dialogue; offering to close gaps | U1         |
| D3  | Missing target repo             | Report and stop, naming the missing repo and its clone command                                                                                                                                                                 | a `Clone <repo>` consent row in every multi-repo plan   | U1         |
| D4  | Unmerged branch                 | No after-landing step runs on an unmerged branch; the report lists each step with its command, to run after a hand merge                                                                                                       | a per-step "also run from the worktree" flag            | U1         |
| D5  | Failed after-landing step       | The remaining steps do not run; the report names the failed step, its exit code, and the steps not run                                                                                                                         | continue with the remaining steps                       | U1         |
| D6  | Resume with the worktree gone   | The report names the `plan-management unclaim <folder>` request for the person to make; execute never invokes `unclaim`                                                                                                        | execute calling `unclaim` (it asks once itself)         | U1         |
| D7  | A folder carrying an `ask` step | Refused on a fresh run and on resume alike, naming the planner to re-run                                                                                                                                                       | reading `ask` as dropped                                | U1         |
| D8  | Archive warning at landing      | Execute calls `archive` with the declared preference "do not ask"; on any completion warning the folder is not archived, the row still goes `COMPLETE`, and the report names the warning and the archive request to make later | archive anyway and record the warning                   | U1, U3     |
| D9  | Mid-run decisions               | An uncovered irreversible decision, an ambiguous wave order, or blocking format drift ends the run as a blocking-gap stop, reported with what is needed and the resume command                                                 | pause and ask                                           | U1         |
| D10 | Planner self-review             | The planners' self-review gains a line: every Consent row carries an answer, and no After landing step carries a mode other than `run`                                                                                         | none                                                    | U2         |
| D11 | Review row                      | None — every change is prose; the wave review is the only check                                                                                                                                                                | a `Kind: review` row                                    | —          |
| D12 | Version and release             | vwf `20.1.0` → `21.0.0` (major); release none; the site is neither bumped nor released                                                                                                                                         | minor `20.2.0`; releasing now                           | U5         |

## New dependencies

none

## Units

| Id | Wave | Unit file                                      | Kind | Owns                                                                                                                                                                                                                                                              | Depends on | Status  | Commit |
| -- | ---- | ---------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-execute.md](01-execute.md)                 | edit | `plugins/vwf/skills/execute/**`                                                                                                                                                                                                                                   | —          | pending |        |
| U2 | 1    | [02-planners.md](02-planners.md)               | edit | `plugins/vwf/skills/change-plan/SKILL.md`, `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/assets/plan-interview.md`, `plugins/vwf/assets/templates/plan-folder.md`                                                                                              | —          | pending |        |
| U3 | 1    | [03-plan-management.md](03-plan-management.md) | edit | `plugins/vwf/skills/plan-management/**`                                                                                                                                                                                                                           | —          | pending |        |
| U4 | 2    | [04-docs.md](04-docs.md)                       | edit | `CLAUDE.md`, `readme.md`, `.claude/skills/vwf-plugin/**`, `.claude/skills/release/SKILL.md`, `.claude/docs/ci-and-releases.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-07-plans-carry-every-answer.md`, and any other passage docs-sync finds | U1, U2, U3 | pending |        |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md)   | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                       | U4         | pending |        |

## Shared-file rule

| File                                      | Why it collides                                    | Owner                    |
| ----------------------------------------- | -------------------------------------------------- | ------------------------ |
| `plugins/vwf/.claude-plugin/plugin.json`  | several units bumping one version is a lost update | gates-and-bump unit only |
| `.claude-plugin/marketplace.json`         | generated; regenerating mid-wave races             | gates-and-bump unit only |
| every human-facing doc outside `plugins/` | n units editing one doc                            | docs unit only           |

## Waves

- **Wave 1 — U1, U2, U3.** Disjoint trees: execute, the two planners plus the
  two shared planner assets, plan-management. No unit reads another's output.
- **Wave 2 — U4.** The docs, over the whole wave-1 delta.
- **Wave 3 — U5.** The bump and the generator, then the full gate.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
pnpm exec tsc --noEmit -p scripts
mise run code:precommit
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                    |
| -------------------------- | ---- | ------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages vwf into the dev marketplace; a **restarted** session picks it up |

## Gates the orchestrator keeps

- **No `ask` mode left in the shipped tree.** After U5, this returns nothing
  outside the known false positives (`skills/init/SKILL.md:740`, `:816`; execute
  `SKILL.md`'s "stops once at the end"):

  ```text
  grep -rnE 'ask step|run / ask|or .ask.|recorded .ask.|intent, not authorisation' plugins/vwf
  ```

  Pass: zero other hits.
- **No run-time question left in execute.** Reading
  `plugins/vwf/skills/execute/` top to bottom, no passage offers, asks, or waits
  for the user; every former ask (Facts rows a–n) ends in a report and a stop.
  Pass: the wave review finds none.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore`, or a formatter's
`--fix` over any path outside its Owns.

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

- **`/vwf:execute all` and its run-level overrides** — plans 2 and 3 of this
  chain (see Parked).
- **The set of runtime stops** — a failed gate, a dead subagent, a resource cap,
  a blocking gap and a failed landing condition still end a run; only how each
  is reported changes.
- **A checker rule over plan folders** — execute's preflight stays the check;
  nothing in `scripts/` reads plan folders.
- **Rewriting archived plans** — folders under `docs/plans/archived/` that carry
  `ask` stay as written.
- **Landing consent `no`** — stays a valid answer: the run stops at the merge
  and prints the worktree and branch, asking nothing.

## Parked

- **Plan 2 — `/vwf:execute all`** (requires this plan). Agreed in this session's
  interview: goal "typing `/vwf:execute all` once runs every runnable plan,
  highest priority first, each in its own runner subagent; the loop stops at the
  first point that needs the user; the session keeps only a one-line result per
  plan"; non-goals — parallel runners, skipping past a stuck plan, resuming or
  unclaiming a paused plan, making execute model-invocable, a cap on plan count;
  **reversal confirmed** — "a fresh session" becomes "a fresh context: a fresh
  session, or a runner that `all` dispatches" (plain `<folder>` and `next`
  unchanged); the runner is a new agent `plugins/vwf/agents/execute-runner.md`
  with explicit tools (Agent, Skill, Bash, Read, Write, Edit, Grep, Glob,
  TaskOutput, TaskStop, the mempalace names), `model: opus`, handed the folder
  and the path to execute's `SKILL.md`, never asking, returning a capped block;
  a runtime stop → the runner stops and the loop ends. Open: the 5-hour/7-day
  cap check between plans (the cap hook reads the main session's statusline),
  the reload risk (a plan that edits vwf leaves later plans in the same loop on
  the old version), `/vwf:handoff`'s reserved `next` overwritten by successive
  runners, checker rule 7 adding the role suffix `runner`, nesting depth 3
  reached by docs-sync's surveyor under a runner.
- **Plan 3 — `/vwf:execute all`'s run-level questions** (requires plan 2): asked
  once, before the first plan, each answer an override of the plans' steps for
  that run only — e.g. "build every plan on one worktree?", which touches
  claims, branches and landing.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-10-07-plans-carry-every-answer

or let the queue pick it, by priority:

/vwf:execute next
