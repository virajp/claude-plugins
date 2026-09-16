---
type: vwf-change-plan
title: Review rows — the plan places the code and security review;
  after-landing steps run on recorded consent
requires: []
backlog: []
---

# Plan — Review rows — the plan places the code and security review; after-landing steps run on recorded consent (2026-09-17)

## Status

**APPROVED** 2026-09-17 by the user.

## Consent

| Action                                            | Granted                                                              |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                  |
| After landing: `mise run p:plugins:local`         | run                                                                  |
| Release vwf publicly                              | minor — 19.31.0 → 19.32.0, hand edit of `plugin.json`; not this time |
| Release site publicly                             | patch — 1.1.25 → 1.1.26, `mise run p:site:version`; not this time    |

**A release recorded here is intent, not authorisation.** The after-landing step
is recorded as `run` under ruling 8 — consent given at this interview. The
executor that runs this plan predates ruling 8 and reads `run` as `ask`
(`plugins/vwf/skills/execute/SKILL.md:715`), so it will stop once and ask; the
next plan is the first whose `run` steps run unprompted.
`mise run p:plugins:local` stages vwf into the dev marketplace; it is picked up
only by a **restarted** session. No tag is cut: the bump is recorded, the tag
waits for a later plan.

## Goal

After this lands, `/vwf:execute` runs the `/code-review` and `/security-review`
engines, and the `execute-code-reviewer` and `execute-security-reviewer` agents,
only where the plan folder places a **`Kind: review` row** in its Units table —
by default once, after the last code unit and before the docs unit — instead of
after every `code` unit and every review round. A code unit runs TDD, the
coverage gate and its commit, and moves on. A review row covers the branch delta
since the previous review row or the branch base, runs both engines and both
reviewers together, and loops findings back to the owning unit's coder under the
existing round cap. Both planners write the row; a plan with code units and no
row is refused at preflight.

Beside it, one **reversal**: an after-landing step carries the mode the
interview recorded, `run` or `ask`, and `/vwf:execute` runs a `run` step on a
green landing without a prompt. This reverses the 2026-09-16 one-executor ruling
— "every after-landing step is asked for in the moment; the `run` mode is
retired" (`CLAUDE.md:60`, `execute/SKILL.md:710-718`, `:772-773`) — and the
standing memory rule that merge, push and release need in-the-moment consent.
The user ruled on 2026-09-17 that consent recorded at planning is the consent,
so a green run can land locally, or to staging or production, as the plan says.
The docs unit writes the decision record.

The framing: the user found `/vwf:execute` running `code-review` and
`security-review` at every step of a multi-unit plan, which is waste; the
2026-09-15 deadlock plan had parked "the per-step slowness" as out of its scope.
This plan is that item coming due.

## Facts the survey established

- **The per-unit review is hard-wired in five places**, all prose, none
  programmatic — no hook, checker rule, task or manifest reads a review
  placement. vwf is 19.31.0, site 1.1.25, the plan index has no active row.
- **`plugins/vwf/skills/execute/SKILL.md`** — description :5-8; intro :29-42
  (code unit = TDD then concurrent review + security; five stage subagents);
  waves :209-216 ("Engines and reviewers never overlap across units"); "Full
  pipeline every code unit" :221-235 (the orchestrator runs the two engines
  itself); security / breaking-API gate :236-243; round cap
  `pipeline.review_round_cap` default 4, convergence guard, wave-review cap 2
  :244-262; Waves steps 2-3 :496-511; fixed final waves :596-600; fix-first
  re-runs a code unit's engines + reviewers :686-689; After landing :710-718
  (every step `ask`, `run` read as `ask`); never-list :772-773.
- **`references/code-unit.md`** — :3-8 one at a time; step 3 :26-47 one message
  invoking `/code-review` (high) + `/security-review` via Skill, `TaskOutput`
  wait up to 30 min, then both reviewers in one message with an Engine section;
  merged loop-back :48-60 ("repeat step 3 in full — engines first" every round);
  run-log rows :69-78.
- **`references/edit-unit.md`** — :1-10 edit units have no stage; wave review
  after every wave; :40-56 the wave reviewer is scoped to the contract and
  explicitly not code quality or security "already ran"; :71-104 the loop (≤2
  rounds), a code unit looped back re-enters code-unit from step 2 including the
  engines.
- **`assets/execute-stages.md`** — stage table :17-24 (review / security "per
  unit, ‖, after /code-review | /security-review"); engines-first prose :25-34;
  dispatch contracts with the Engine section and the round number :65-89; knobs
  :131-134; loop on findings + convergence guard :142-158; the run journal
  :192-240 — one row per node execution, `node` ∈ code / review / security /
  acceptance / ux / edit in Detail, `wave` is `—` for acceptance / ux /
  reconcile (:206-208); recall tags `<slice>/review|security/<round>` :66-67,
  :82-83.
- **The two agents** — `agents/execute-code-reviewer.md` :5-9, :25-44, :98-99,
  :110 and `agents/execute-security-reviewer.md` :5-7, :25-34, :68-69, :96 — all
  say "the unit"; description says the orchestrator ran the engine and handed it
  over.
- **The template** `assets/templates/plan-folder.md` — Units table :104-109 (Id,
  Wave, Unit file, Kind, Owns, Depends on, Status, Commit); Kind paragraph
  :114-118 (`code` or `edit`); After landing :142-148 (Mode `ask`, "stops once
  and asks before every step"); Consent block :39-56 ("Every after-landing step
  is an `ask` step"); run log :185-193; unit-file header :236-241. Nothing lets
  a plan say when a review fires.
- **`assets/plan-interview.md`** — no review item; item 17 (after-landing steps)
  says each is `ask` or dropped; its only "review" hit is the self-review at
  :139.
- **The planners** — `skills/plan/SKILL.md:364` every unit `Kind: code`; `:325`
  the Consent block's "after-landing `ask` steps".
  `skills/change-plan/SKILL.md:154` the wave review is "the only check";
  `:157-160` "Every step has one mode, `ask`"; `:218-222` every unit
  `Kind: edit`.
- **Timing:** the only figures are the 30-minute engine wait (code-unit :31,
  execute-stages :29) and "serializing only costs wall-clock" (code-unit :39).
  No per-step minute figure in the trees.
- **Human-facing docs that describe today's pipeline** (the docs units' list):
  `readme.md:238` ("code unit through TDD, coverage, review+security"), `:241`;
  `CLAUDE.md:5` (the release hard rule), `:60` (`run` retired), `:309`
  (pipeline), `:372-378` (`ask` step, the hard rule);
  `.claude/skills/vwf-plugin/SKILL.md:72`, `:77`;
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:48`, `:69-70`;
  `.claude/docs/ci-and-releases.md:82-86`, `:286`;
  `site/src/content/docs/plugins/vwf.md` :152-154, :160, :167-176, :194-197,
  :204-205, :264, :811, :859, :1989-1999, :2001-2004, :2031-2039, :2048-2058,
  :2111 (mermaid node), :2468-2476 (`run` retired), :2816-2817;
  `site/src/content/docs/how-to/greenfield/single-repo.md:289`, `:441`;
  `how-to/greenfield/cli-product.md:158`, `:167`;
  `how-to/greenfield/api-only-service.md:154-155`. Still true after the change:
  `vwf.md:2719`, `cli-product.md:229`, `api-only-service.md:183`,
  `ui-with-design-tool.md:236`. `.claude/docs/*` has no pipeline passage.
- **Gates** over `plugins/vwf/**` and `site/**`: the five wave-gate lines below,
  from the last plan; pre-commit runs marketplace, inventory, check, shellcheck,
  format / lint / sec, conventional-commits; CI `plugins.yml` job `validate`,
  `site.yml` jobs `build` and `deploy`. `code:precommit` misses untracked files
  — `git add` a new file before the gate.
- **Commit convention** `.config/git-conventional-commits.yaml`: types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Bump precedent**
  (`docs/plans/archived/2026-09-16-one-executor/08-gates-and-bump.md`):
  `mise run p:site:version` first, bare, on a clean worktree; hand-edit
  `plugins/vwf/.claude-plugin/plugin.json`; `mise run p:plugins:marketplace`
  regenerates `.claude-plugin/marketplace.json`; full wave gate.
- **Recall:**
  `docs/plans/archived/2026-09-15-execute-engine-deadlock/index.md:277-279`
  parked the per-step slowness; `:301-310` of the one-executor plan carries
  `release <folder>` and the diary checkpoint, both still parked. No
  `docs/memory/decisions/` doc pins the review to per-unit.

## Assumed decisions — confirm or override at review

| #  | Decision                  | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Rejected                                                                   | Unit       |
| -- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| 1  | Trigger shape             | A review is a **`Kind: review` row** in the Units table: Owns `—`, Depends on names the units it covers, Model `opus`, and a `NN-review.md` unit file carrying only the header lines and a Scope section naming what it reviews. When execute reaches it in wave order it runs `/code-review` and `/security-review`, waits, then dispatches `execute-code-reviewer` and `execute-security-reviewer` in one message with the Engine section — step 3 of today's code-unit, once, over the row's scope | a `review after:` flag on a code unit; a Review-points section in index.md | U1, U2, U3 |
| 2  | Default placement         | Both planners write **one** review row, after the last code unit and before the docs unit. An earlier row is a planner decision with its reason in the plan's assumed-decisions table — e.g. a boundary later units build on. No code unit triggers a review by itself                                                                                                                                                                                                                                | per-unit review (status quo); execute implies a row                        | U1, U3     |
| 3  | Review scope              | A review row reviews the **branch delta since the previous review row, or the branch base** when it is the first                                                                                                                                                                                                                                                                                                                                                                                      | per-unit commits                                                           | U1, U2     |
| 4  | Findings loop             | A finding names a file; the orchestrator maps it to the unit whose Owns holds it and re-dispatches that unit's coder in fix-first mode; then the row re-runs in full, engines first. `pipeline.review_round_cap`, the convergence guard and the `contested` exit apply to the row unchanged. A finding on a file no unit owns is the orchestrator's `GAP:`                                                                                                                                            | a separate cap for review rows                                             | U1         |
| 5  | Journal and recall tags   | The run journal's node value `review` names the row; the unit cell carries the row id; `wave` is the row's wave. Recall tags become `<row-id>/review/<round>` and `<row-id>/security/<round>`                                                                                                                                                                                                                                                                                                         | a new tag scheme                                                           | U1, U2     |
| 6  | Change plans              | A change plan gets **no review row by default** — the wave review stays its only check. `/vwf:change-plan` writes one only when the change lands runnable code (shipped shell or hook scripts, `scripts/`, `installer/`), and says why in the decisions table                                                                                                                                                                                                                                         | never a row on a change plan; always one at the end                        | U3         |
| 7  | Missing row               | A plan with `code` units and no review row covering them is **refused at preflight**, naming the uncovered units and the fix: add a row and re-approve. Execute runs what is written and infers no node                                                                                                                                                                                                                                                                                               | execute implies a row after the last code unit                             | U1         |
| 8  | After-landing mode        | **Reversal.** Each after-landing step carries `run` or `ask`, decided at interview item 17 and written to the After landing table. On a green landing execute runs every `run` step in order without a prompt and stops once before each `ask` step. A `run` in a folder is authorisation; the "read as `ask`" clause goes                                                                                                                                                                            | ask-only, `run` retired (the 2026-09-16 ruling)                            | U1, U3, U4 |
| 9  | Release steps under `run` | A release step may be recorded `run`: the interview's release question (item 18) is the ask. `CLAUDE.md`'s "ALWAYS ask user before running `p:plugins:release` …" rule gains that one exception — a plan whose After landing table records the release as `run`, consented at its interview                                                                                                                                                                                                           | release always asked in the moment                                         | U4         |
| 10 | What stays                | A code unit stays TDD → coverage → commit; the `edit` wave review is unchanged; the acceptance and UX passes stay after the last unit, hence after the final review row                                                                                                                                                                                                                                                                                                                               | —                                                                          | U1         |
| 11 | This plan's own consent   | No review row (all `edit`, markdown only); `mise run p:plugins:local` as `run`; vwf minor, site patch; no release                                                                                                                                                                                                                                                                                                                                                                                     | a release now                                                              | U6         |

## New dependencies

none

## Units

| Id | Wave | Unit file                                      | Kind | Owns                                                                                                                                                                                                                                                    | Depends on | Status  | Commit |
| -- | ---- | ---------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-execute-core.md](01-execute-core.md)       | edit | `plugins/vwf/skills/execute/SKILL.md`, `plugins/vwf/skills/execute/references/code-unit.md`, `plugins/vwf/skills/execute/references/edit-unit.md`, `plugins/vwf/skills/execute/references/review-unit.md` (new), `plugins/vwf/assets/execute-stages.md` | —          | pending |        |
| U2 | 1    | [02-reviewer-agents.md](02-reviewer-agents.md) | edit | `plugins/vwf/agents/execute-code-reviewer.md`, `plugins/vwf/agents/execute-security-reviewer.md`                                                                                                                                                        | —          | pending |        |
| U3 | 1    | [03-planners.md](03-planners.md)               | edit | `plugins/vwf/assets/templates/plan-folder.md`, `plugins/vwf/assets/plan-interview.md`, `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/change-plan/SKILL.md`                                                                                    | —          | pending |        |
| U4 | 2    | [04-docs-repo.md](04-docs-repo.md)             | edit | `readme.md`, `CLAUDE.md`, `.claude/skills/vwf-plugin/**`, `.claude/docs/ci-and-releases.md`, `docs/memory/decisions/2026-09-17-review-rows.md` (new), `docs/memory/decisions/2026-09-17-after-landing-runs-on-recorded-consent.md` (new)                | U1, U2, U3 | pending |        |
| U5 | 2    | [05-docs-site.md](05-docs-site.md)             | edit | `site/src/content/docs/plugins/vwf.md`, `site/src/content/docs/how-to/**`                                                                                                                                                                               | U1, U2, U3 | pending |        |
| U6 | 3    | [06-gates-and-bump.md](06-gates-and-bump.md)   | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`                                                                                                                                                        | U4, U5     | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

Kind is `edit` on every unit — a change plan. This plan carries no review row:
ruling 6, it lands markdown only.

## Shared-file rule

| File                                          | Why it collides                               | Owner   |
| --------------------------------------------- | --------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`      | version file                                  | U6 only |
| `site/package.json`                           | version file                                  | U6 only |
| `.claude-plugin/marketplace.json`             | generated                                     | U6 only |
| `readme.md`, `CLAUDE.md`, `.claude/**`        | repo docs                                     | U4 only |
| `site/src/content/docs/**`                    | site docs                                     | U5 only |
| `plugins/vwf/assets/execute-stages.md`        | U1 and U2 both describe the dispatch contract | U1 only |
| `plugins/vwf/assets/templates/plan-folder.md` | U1 and U3 both describe Kind and the run log  | U3 only |
| `docs/plans/index.md`, `docs/backlog.md`      | the planner's and the executor's              | nobody  |

## Waves

- **Wave 1 — U1, U2, U3.** Disjoint trees: execute's skill and its assets; the
  two agents; the template, the interview and the two planners. Each edits its
  own files against the rulings alone.
- **Wave 2 — U4, U5.** Repo docs and site docs, disjoint, both reading wave 1's
  result and running `vwf:docs-sync` over the branch delta.
- **Wave 3 — U6.** The bump, after the docs, the run's final gate.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run code:precommit
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`. Every line is
green on `develop` at `f64d98fb` before wave 1. `code:precommit` misses
untracked files: `git add` every new file before running it.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                                                   |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | Stages vwf into the dev marketplace and updates this machine's install; publishes nothing, cuts no tag. Picked up only by a **restarted** session. The executor running this plan reads `run` as `ask`. |

No release step: the bump is recorded, the tag waits for a later plan.

## Gates the orchestrator keeps

none — the wave gate and the wave review are the checks. The rulings are prose
in skills; the first `/vwf:plan` after this lands is the proof that a review row
is written, and the first `/vwf:execute` of it the proof that one review runs.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` outside its Owns.

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

- **The `edit` wave review** — invokes no engine, was never the waste; ruling
  10.
- **The TDD and coverage stage** — the coder's own gate, per unit; ruling 10.
- **The acceptance and UX passes** — unchanged in place.
- **A release** — the bump is recorded; the tag waits.
- **`plugins/stackgen`** — names no review.

## Parked

- **`release <folder>`** — resets a stale `RUNNING` row to `APPROVED` in an
  integration-branch commit instead of the hand edit. Needs a rule for proving
  the session is gone. Parked since the queue plan (2026-09-15).
- **The diary checkpoint beside the run log.** The Stop hook fires mid-run, so a
  unit produces a diary entry on top of its run-log row. A later plan decides
  whether the hook stands down while a run is open. Parked since the deadlock
  plan (2026-09-15).

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-17-review-rows

or let the queue pick it, by priority:

/vwf:execute next
