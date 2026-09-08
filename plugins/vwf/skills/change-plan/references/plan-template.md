# The plan folder template

`docs/plans/<YYYY-MM-DD>-<kebab-name>/` holds `index.md` and one `NN-<unit>.md`
per unit. Every section below is required. The frontmatter and the **Status**,
**Consent**, **Units**, **Wave gate**, **After landing** and **Run log** blocks
have a fixed shape: `/vwf:change-execute` parses them and rewrites the status
column and the run log, so keep the headings and the column order exactly.

## index.md

```markdown
---
type: vwf-change-plan
title: <title>
requires: [] # earlier plan folders this one stands on, e.g. docs/plans/2026-09-01-x
---

# Plan — <title> (<date>)

## Status

**DRAFT** | **APPROVED** | **RUNNING** | **BLOCKED** | **COMPLETE**

<one line: when it changed and by what — "APPROVED 2026-09-04 by the user";
"RUNNING since 2026-09-05 10:12 in <worktree path>"; "BLOCKED at wave 2
— U4 UNRESOLVED: <ruling needed>; U5 skipped (depends on U4)">

## Consent

| Action                                            | Granted                      |
| ------------------------------------------------- | ---------------------------- |
| Merge to the integration branch and push on green | yes / no                     |
| After landing: <step>                             | run / ask                    |
| Release <project> publicly                        | none / patch / minor / major |

<one `After landing:` row per step, in order; one `Release` row per project the
units touch, each naming the command that bumps its version.>

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

<one paragraph: what is true after this lands. Then the framing that produced
the plan, and any reversal of a standing decision, named as one.>

## Facts the survey established

<what recall and the Explore pass found, so no unit re-derives it: counts,
paths, the gates that cover the trees, the docs that describe today's behaviour,
the dependencies each tree already has>

## Assumed decisions — confirm or override at review

| # | Decision | Ruling | Rejected | Unit |
| - | -------- | ------ | -------- | ---- |

## New dependencies

<one line per package: name, what for, the existing thing it was preferred over,
the unit that adds it — or "none". A unit adds nothing not listed here.>

## Units

| Id   | Wave   | Unit file              | Owns                                              | Depends on | Status  | Commit |
| ---- | ------ | ---------------------- | ------------------------------------------------- | ---------- | ------- | ------ |
| U1   | 1      | [01-x.md](01-x.md)     | `path/a`, `path/b`                                | —          | pending |        |
| …    |        |                        |                                                   |            |         |        |
| Un-1 | last   | `NN-docs.md`           | the repo's docs (README, CLAUDE.md, `docs/**`, …) | all        | pending |        |
| Un   | last+1 | `NN-gates-and-bump.md` | version files, generated files                    | Un-1       | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                   | Why it collides                                    | Owner                    |
| -------------------------------------- | -------------------------------------------------- | ------------------------ |
| <each version file>                    | several units bumping one version is a lost update | gates-and-bump unit only |
| <each generated file>                  | generated; regenerating mid-wave races             | gates-and-bump unit only |
| <each human-facing doc>                | n units editing one doc                            | docs unit only           |
| <any other file two units would touch> |                                                    |                          |

## Waves

<one line per wave: which units, why they are safe together>

## Wave gate

<the exact commands confirmed in the interview, one per line, or `none`> plus
the wave review, plus every report read for `UNRESOLVED:`. <Add the plan's own
checks here.>

## After landing

| Step                          | Mode      | Notes                               |
| ----------------------------- | --------- | ----------------------------------- |
| <the command or skill to run> | run / ask | <what it does, and what it reaches> |

<or "none". `run` steps execute unprompted after a consented landing; the run
stops once and asks before every `ask` step.>

## Gates the orchestrator keeps

<what a diff cannot prove — a real install, a scratch-repo run, a smoke test —
each with its pass condition>

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

<each declined item, with the reason>

## Parked

<each item raised during the interview that belongs to a later plan, with enough
context to pick it up — or "none">

## Run log

<written by /vwf:change-execute; empty at approval>

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/<date>-<name>
```

## NN-<unit>.md

```markdown
# U<n> — <title>

- **Wave:** <n>
- **Depends on:** <ids or —>
- **Owns:** <explicit paths>
- **Model:** <opus | a named tier | inherit>
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** <files to open only if an edit needs them>

## Ruling

<quoted verbatim from index.md's assumed decisions and the user's answers —
never paraphrased>

## Edits

1. **`<path>`** — <what changes, precisely enough that two readers would make
   the same edit>
2. …

## Verification

- <the gate lines this unit must pass before returning>
- <grep-level checks specific to the edit>

## Guardrails

- Do not touch <the neighbour another unit owns>.
- <the trap specific to this tree — the formatter's scope, strict-YAML
  frontmatter, BSD sed, byte-copy not retype>

## Commit

`<type>: <description>` — written by the orchestrator after the wave gate, not
by the unit.
```

## The two fixed final units

**Docs.** A unit that runs `vwf:docs-sync` over the run's branch delta
(`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`) and applies its findings plus
every `DOCS FALSIFIED:` line the earlier units returned and the list from
index.md's survey facts. Docs ship with the change, so this unit is never
optional. A confirmed reversal from the interview also lands here, as a
`docs/memory/decisions/<date>-<slug>.md` per
`${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.

**Gates and bump.** Bumps each released project's version per the consent block,
using the command that block names, runs the generators the plan names, and
passes the full wave gate. Its report is the run's final gate.

It does **not** run the after-landing steps — those are the orchestrator's,
after the landing, because a `run` step mutates the machine rather than the tree
under review, and a unit never reaches outside the worktree.
