---
type: repo-plan
title: Retire the repo-level create-plan / execute-plan in favour of the vwf
  pair
requires: [ docs/plans/2026-09-08-vwf-change-workflow ]
---

# Plan — Retire the repo-level plan skills (2026-09-08)

## Status

**RUNNING** since 2026-09-08, in the worktree
`.worktrees/2026-09-08-retire-repo-plan-skills` on branch
`2026-09-08-retire-repo-plan-skills`, cut from `develop` at `97729e3a`. Run by
`/vwf:change-execute`, not by the retired `/execute-plan` the Launch line names.

**APPROVED** 2026-09-08 by the user, after the shape gate and the
post-self-review yes.

## Consent

| Action                                       | Granted                                |
| -------------------------------------------- | -------------------------------------- |
| Merge to `develop` and push on green run     | yes                                    |
| Stage locally (`plugins:local`) on green run | n/a — nothing under `plugins/` changes |
| Release `vwf` publicly                       | none                                   |
| Release `stackgen` publicly                  | none                                   |
| Release installer publicly                   | none                                   |
| Release site publicly                        | none                                   |

**A release is two stages.** The local one — `mise run plugins:local` — stages
the changed plugins into the dev marketplace and updates this machine's install;
it publishes nothing, so execute-plan runs it without a further prompt and only
reports what it staged. The public one is the tags, and it is what the release
rows above are about: they are intent, and execute-plan stops once before the
`main` merge and the tags and asks, per `CLAUDE.md`. A staged plugin loads only
in a **restarted** session.

This plan touches `.claude/` and root docs only: nothing to stage, nothing to
release, no version bumped.

## Goal

After this lands, this repo plans and runs its own changes with the vwf pair —
`/vwf:change-plan` and `/vwf:change-execute`, shipped by
`docs/plans/2026-09-08-vwf-change-workflow` — and no longer carries its own
`.claude/skills/create-plan/`, `.claude/skills/execute-plan/` or the
`docs-reconciler` agent they used. Every repo doc that pointed at the repo
copies points at the vwf pair, and this repo's specifics (its gate lines, its
local stage, its release ritual) live in each plan folder, as the generic pair's
design requires.

The user chose this as the second of two chained plans (*"Two chained plans
now"*). It is the first real use of the staged pair: the **next** plan for this
repo is written by `/vwf:change-plan`, and this plan's own run is the **last**
by `/execute-plan`.

**Sequencing that is not the skill's to check:** run this only after plan 1 has
landed **and** `mise run plugins:local` has staged vwf **and** a session has
restarted, so the vwf pair is loaded when the retired copies disappear. This run
is executed by the old `/execute-plan`, which reads its own skill at session
start and is unaffected by deleting its files inside the worktree.

This plan reverses no standing decision; `CLAUDE.md:48-50`'s "a change to this
repo is planned with `/create-plan`" is a mechanism statement, updated, not a
decision reversed.

## Facts the survey established

**What goes.** `.claude/skills/create-plan/` (SKILL.md, references/interview.md,
references/plan-template.md — 517 lines), `.claude/skills/execute-plan/`
(SKILL.md, references/wave-review.md, references/blocking.md — 372 lines),
`.claude/agents/docs-reconciler.md` (its frontmatter `:1-11` says "for this
repo"; `:38-52` is a surface-ownership table hardcoding `readme.md`,
`CLAUDE.md`, `site/src/content/docs/**`, `installer/CLAUDE.md`).

**What stays.** `.claude/agents/target-verifier.md` — this repo's plans keep
naming it under *Gates the orchestrator keeps*; the generic pair's interview
item 13 asks for exactly that kind of check. `docs/plans/archived/**` (sixteen
folders and the flat files) — history, never rewritten.
`docs/memory/handoff/next.md` — a memory artefact, named the skills as they
were. `.claude/skills/release/`, `.claude/skills/plugin-authoring/`,
`.claude/skills/vwf-plugin/`, `.claude/skills/stackgen-plugin/`.

**Every pointer to the retired names outside archived plans and memory:**

| File                                 | Lines    | Says                                                                                                                                                                               |
| ------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                          | `:48-50` | "`release`, `create-plan` and `execute-plan` are slash commands — a change to this repo is planned with `/create-plan` and run, in a fresh session, with `/execute-plan <folder>`" |
| `CLAUDE.md`                          | `:64-65` | the two "Where the detail lives" table rows                                                                                                                                        |
| `CLAUDE.md`                          | `:77-78` | the `[cp]` and `[ep]` reference-link definitions                                                                                                                                   |
| `CLAUDE.md`                          | `:281`   | "`/execute-plan` runs it unprompted at the end of a green run" (the local stage)                                                                                                   |
| `.claude/docs/ci-and-releases.md`    | `:62`    | the same local-stage sentence                                                                                                                                                      |
| `.claude/skills/release/SKILL.md`    | `:50`    | the same local-stage sentence                                                                                                                                                      |
| `.claude/skills/vwf-plugin/SKILL.md` | `:197`   | "Delegate the sweep to the `docs-reconciler` agent rather than reading those files inline"                                                                                         |

`readme.md` and `site/src/content/docs/**` mention neither skill.

**The vwf pair's contract this repo now relies on** (from plan 1's decisions):
the plan folder's Wave gate section carries this repo's gate lines verbatim; the
After landing section carries `mise run plugins:local` as `run` and `/release`
as `ask`; `Release <project>` rows carry the bump intent; the docs unit runs
`vwf:docs-sync`; `target-verifier` is named per plan under *Gates the
orchestrator keeps*. This repo has no `.config/vwf.yaml`; the pair does not need
one.

**Checker.** No `plugins:check` rule scans `.claude/`; deleting files there
breaks no gate. `CLAUDE.md` and `.claude/**/*.md` are dprint-formatted; the
`[cp]`/`[ep]` link definitions removed must leave no dangling reference
(`markdownlint` MD053 flags an unused definition, not a missing one; a missing
one renders as literal text — grep for `[cp]`/`[ep]` after editing).

## Assumed decisions — confirm or override at review

| # | Decision                             | Ruling                                                                                                                                                                                                                                                                                                                      | Rejected                                                                       | Unit |
| - | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---- |
| 1 | `docs-reconciler`                    | Deleted. `vwf:docs-sync` and its surveyor take over the docs unit; the surface-ownership knowledge it carried is already `CLAUDE.md`'s "Docs ship with the change" rule.                                                                                                                                                    | keep it as a plan-named docs agent behind a new `Docs agent:` line in the pair | U2   |
| 2 | Who deletes `docs-reconciler`        | The **docs unit**, after the orchestrator has dispatched the agent for this run's findings — so this run still gets its reconciliation and the file is gone in the same commit as the docs that stop naming it.                                                                                                             | U1 in wave 1 (the agent would vanish before the docs unit dispatched it)       | U2   |
| 3 | `target-verifier`                    | Stays, unchanged. Named per plan under *Gates the orchestrator keeps*.                                                                                                                                                                                                                                                      | delete with the rest                                                           | —    |
| 4 | `CLAUDE.md` "Where the detail lives" | The two rows and their link definitions are **replaced** by one row pointing at the vwf manual's sections for the pair (`site/src/content/docs/plugins/vwf.md` anchors `#vwfchange-plan`, `#vwfchange-execute`) and the how-to page — an absolute GitHub URL is not needed; a repo-relative path is the table's convention. | delete the rows with no replacement                                            | U2   |
| 5 | The mechanism sentence               | `CLAUDE.md:48-50` reads: a change to this repo is planned with `/vwf:change-plan` and run, in a fresh session, with `/vwf:change-execute <folder>`; each plan folder carries this repo's gate lines, `mise run plugins:local` as a `run` step and `/release` as an `ask` step. One sentence, not a paragraph.               | —                                                                              | U2   |
| 6 | Archived plans and memory            | Untouched: `docs/plans/archived/**`, `docs/memory/**`.                                                                                                                                                                                                                                                                      | rewrite historical launch lines                                                | —    |

## New dependencies

none

## Units

| Id | Wave | Unit file                    | Owns                                                                                                                                                                                                                                                                                                                                                                 | Depends on | Status  | Commit     |
| -- | ---- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ---------- |
| U1 | 1    | [01-retire.md](01-retire.md) | delete `.claude/skills/create-plan/**`, `.claude/skills/execute-plan/**`; edit `.claude/skills/release/SKILL.md`, `.claude/skills/vwf-plugin/SKILL.md`                                                                                                                                                                                                               | —          | green   | `9b0f8caf` |
| U2 | 2    | [02-docs.md](02-docs.md)     | `CLAUDE.md`, `.claude/docs/ci-and-releases.md`, `readme.md` (expected untouched), `site/src/content/docs/**` (expected untouched); delete `.claude/agents/docs-reconciler.md`; **widened by the R1 GAP:** the one `docs-reconciler` sentence in each of `.claude/skills/plugin-authoring/SKILL.md`, `.claude/skills/stackgen-plugin/SKILL.md`, `installer/CLAUDE.md` | U1         | pending |            |
| U3 | 3    | [03-gates.md](03-gates.md)   | `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md` (generated — expected unchanged); **no `plugin.json`**                                                                                                                                                                                                                                     | U2         | pending |            |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                 | Why it collides                                                                                                | Owner   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------- |
| `CLAUDE.md`, `.claude/docs/**`       | docs — the docs unit's                                                                                         | U2 only |
| `.claude/skills/vwf-plugin/SKILL.md` | one line (`:197`); U1 owns it so U2's `.claude/skills/vwf-plugin/**` claim from plan 1 does **not** apply here | U1 only |
| `.claude/agents/docs-reconciler.md`  | must outlive its last dispatch (decision 2)                                                                    | U2 only |
| `plugins/**`                         | nothing here changes a plugin                                                                                  | nobody  |

## Waves

- **Wave 1 — U1 alone.** Deletions and the two skill-doc sentences.
- **Wave 2 — U2**, the docs unit, after the reconciler has been dispatched over
  wave 1's diff; deletes the reconciler last.
- **Wave 3 — U3**, the gates unit: generators (no diff expected), full gate.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `pnpm vitest run`,
`pnpm exec tsc --noEmit -p installer` and `-p scripts`,
`mise run plugins:npm-normalize-test` (no unit owns anything under `site/`, so
`site:check` does not run), plus the wave review, plus every report read for
`UNRESOLVED:`. The plan's own checks:

- `command ls .claude/skills/` shows neither `create-plan` nor `execute-plan`.
- `grep -rn 'create-plan\|execute-plan\|docs-reconciler' CLAUDE.md readme.md .claude/ site/src/content/docs/ --include='*.md'`
  → nothing, from wave 2 on.
- `grep -n '\[cp\]\|\[ep\]' CLAUDE.md` → nothing.
- `pnpm exec dprint check CLAUDE.md .claude/docs/ci-and-releases.md` green.

## Gates the orchestrator keeps

- After the landing, in the main checkout: `command ls .claude/skills/` shows no
  `create-plan`, no `execute-plan`; `command ls .claude/agents/` shows
  `target-verifier.md` and not `docs-reconciler.md`.
- The run's own final report is the proof that the old `/execute-plan` could
  execute a plan that deletes it. Say so in one line.
- **Not this run's to prove:** that `/vwf:change-plan` works in this repo. The
  next plan for this repo proves it; the final report ends by saying the next
  plan is `/vwf:change-plan`.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits.

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

- **Any change under `plugins/`.** The pair is plan 1's; a defect found here is
  a `GAP:` in this run's report and a new change plan, never a fix inside this
  one.
- **Deleting `target-verifier`.** Decision 3.
- **Rewriting archived plans or memory files** that name the retired skills.
  Decision 6.
- **Running `/vwf:setup` on this repo.** Not needed by the pair (plan 1 decision
  2); parked in plan 1.
- **Keeping `docs-reconciler` as an optional plan-named agent.** The user chose
  delete.

## Parked

- **The next plan for this repo is the pair's first end-to-end run.** Whatever
  it surfaces about `/vwf:change-plan` or `/vwf:change-execute` — a heading the
  executor misparses, a gate line the survey missed, an `ask` step asked twice —
  is a change plan against `plugins/vwf/skills/change-*` and a vwf patch
  release, not a repo-skill fix.
- Everything on plan 1's Parked list stands.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Commit     |
| ---- | --------- | ----- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 0    | preflight | —     | 1     | green       | `plugins:check`, `plugins:marketplace --check`, `plugins:inventory --check`, `plugins:npm-normalize-test`, `pnpm vitest run` (288 passed, 2 skipped), `tsc -p installer`, `tsc -p scripts`, `dprint check CLAUDE.md .claude/docs/ci-and-releases.md` — all green on `develop` at `97729e3a`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —          |
| 1    | U1        | opus  | 1     | green       | Deleted both skill trees (`git rm -r`); `release/SKILL.md:50` and `vwf-plugin/SKILL.md:210` repointed. DECIDED: `run` step wording quoted from `change-execute/SKILL.md:168`; `dprint fmt` on `vwf-plugin/SKILL.md` only (re-wrap inside the edited paragraph). DOCS FALSIFIED: none beyond the U2 table. GAP: none. Commit type `refactor:` — the unit file said `chore:`, which `.config/git-conventional-commits.yaml` does not allow.                                                                                                                                                                                                                                                                                                                                                                                     | `9b0f8caf` |
| 1    | R1        | opus  | 1     | findings(4) | CONTRACT clean, RULINGS clean. Rule 5 (docs): the survey missed three more `docs-reconciler` delegation sentences owned by nobody — `.claude/skills/plugin-authoring/SKILL.md:135`, `.claude/skills/stackgen-plugin/SKILL.md:215`, `installer/CLAUDE.md:216` — plus `site/src/content/docs/installer/internals.md:170` (in U2's Owns); the wave gate's `docs-reconciler` grep cannot go green from wave 2 on while the two `.claude/skills/` passages stand. Orchestrator GAP: treated as `DOCS FALSIFIED:` lines for the docs unit — U2's Owns widened to those four passages (one sentence each, same replacement as edit 3 of 01-retire.md), the Goal's "every repo doc that pointed at the repo copies points at the vwf pair" being the plan's own instruction. No round 2: wave 1's files are unchanged by the routing. |            |

## Launch

Run in a fresh session — after plan 1 has landed, `plugins:local` has staged
vwf, and the session has been restarted:

/execute-plan docs/plans/2026-09-08-retire-repo-plan-skills
