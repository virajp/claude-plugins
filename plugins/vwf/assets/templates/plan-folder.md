# The plan folder template

One folder shape for both planners. `/vwf:plan` writes it for a blueprint slice
and `/vwf:change-plan` for ad-hoc work; `/vwf:execute` parses it and rewrites
the status column and the run log. The folder holds `index.md` and one
`NN-<unit>.md` per unit, and is named

- `docs/plans/<YYYY-MM-DD>-<HHMM>-<slice>/` for a **cycle plan** — the time
  component stays so two plans for one slice on one day coexist;
- `docs/plans/<YYYY-MM-DD>-<kebab-name>/` for a **change plan**.

Every section below is required unless marked *cycle plans only*. The
frontmatter and the **Status**, **Consent**, **Units**, **Wave gate**, **After
landing** and **Run log** blocks have a fixed shape the executor parses, so keep
the headings and the column order exactly. The **Status** block is the one
status a plan has — there is no `status:` key in the frontmatter.

<!-- Where the retired cycle template's sections went: "Current state (actual)"
     and "Target state (per blueprint)" fold into Facts the survey established;
     "Risks / drift" folds into Assumed decisions, one row per contradiction
     naming the conforming unit; "Out of scope for this cycle" is Out of scope;
     "Delta — ordered steps" is the Units table plus one NN-<unit>.md each. -->

## index.md

```markdown
---
type: vwf-plan | vwf-change-plan
title: <title>
requires: [] # earlier plan folders this one stands on, e.g. docs/plans/2026-09-01-x
backlog: [] # ids from docs/backlog.md this plan covers, or empty
covers: [] # cycle plans only — the blueprint doc(s) this plan implements; the
           # list the implementation: stamp is written to
exposure: dark # cycle plans only, optional — the slice ships behind a flag
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
| After landing: <step>                             | ask                          |
| Release <project> publicly                        | none / patch / minor / major |
| LSP <language>                                    | installed / proceed without  |

<one `After landing:` row per step, in order; one `Release` row per project the
units touch, each naming the command that bumps its version; one `LSP` row per
language `/vwf:doctor` flagged without a server — cycle plans only, answered at
`/vwf:plan`'s stack gate. That row is what `/vwf:execute`'s preflight reads
instead of asking.>

**A release recorded here is intent, not authorisation.** Every after-landing
step is an `ask` step: the run stops once, reports what it would do, and waits.
Where a step stages something this session already loaded, it is picked up only
by a **restarted** session.

## Goal

<one paragraph: what is true after this lands. Then the framing that produced
the plan, and any reversal of a standing decision, named as one.>

## Slice <!-- cycle plans only -->

<which flow or entity this plan covers, with a link to its blueprint doc, and
the plan's chain position when it is part of a dependency chain — e.g. "Plan 2
of 3 — requires `<folder>`; required by `<folder>`". A standalone plan states
"no dependency chain". Under `exposure: dark`, the flag's name, owner and
removal date, and the unit that removes it.>

## Facts the survey established

<what recall and the survey found, so no unit re-derives it: counts, paths, the
gates that cover the trees, the docs that describe today's behaviour, the
dependencies each tree already has. For a cycle plan: what already exists in
the target repo against what the blueprint says should — reference blueprint
sections, do not restate them.>

## Assumed decisions — confirm or override at review

| # | Decision | Ruling | Rejected | Unit |
| - | -------- | ------ | -------- | ---- |

<for a cycle plan, every code-contradicts-blueprint drift is a row here: the
contradiction as the decision, the conforming unit in the last column — the
blueprint is never adjusted to match code silently.>

## New dependencies

<one line per package: name, what for, the existing thing it was preferred over,
the unit that adds it — or "none". A unit adds nothing not listed here.>

## Units

| Id   | Wave   | Unit file              | Kind | Owns                                              | Depends on | Status  | Commit |
| ---- | ------ | ---------------------- | ---- | ------------------------------------------------- | ---------- | ------- | ------ |
| U1   | 1      | [01-x.md](01-x.md)     | code | `path/a`, `path/b`                                | —          | pending |        |
| …    |        |                        |      |                                                   |            |         |        |
| Un-1 | last   | `NN-docs.md`           | edit | the repo's docs (README, CLAUDE.md, `docs/**`, …) | all        | pending |        |
| Un   | last+1 | `NN-gates-and-bump.md` | edit | version files, generated files                    | Un-1       | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

Kind is `code` or `edit`. `/vwf:plan` writes `code` on every slice unit and
`edit` on the two fixed final units above; `/vwf:change-plan` writes `edit` on
every unit. `/vwf:execute` runs a `code` unit through the per-unit pipeline and
an `edit` unit under the wave review — the `edit` units of a wave are
dispatched together, the `code` units one at a time.

## Shared-file rule

| File                                   | Why it collides                                    | Owner                    |
| -------------------------------------- | -------------------------------------------------- | ------------------------ |
| <each version file>                    | several units bumping one version is a lost update | gates-and-bump unit only |
| <each generated file>                  | generated; regenerating mid-wave races             | gates-and-bump unit only |
| <each human-facing doc>                | n units editing one doc                            | docs unit only           |
| <any other file two units would touch> |                                                    |                          |

## Waves

<one line per wave: which units, why they are safe together. A cycle plan's
waves are ordering only — `execute` runs its units serially in dependency
order.>

## Wave gate

<the exact commands confirmed in the interview, one per line, or `none`> plus
the wave review, plus every report read for `UNRESOLVED:`. <Add the plan's own
checks here.> Every line here must be green before wave 1 — a check that holds
only once a unit has landed belongs in that unit's **Verification**, not here.

## After landing

| Step                          | Mode | Notes                               |
| ----------------------------- | ---- | ----------------------------------- |
| <the command or skill to run> | ask  | <what it does, and what it reaches> |

<or "none". The run stops once and asks before every step.>

## Gates the orchestrator keeps

<what a diff cannot prove — a real install, a scratch-repo run, a smoke test —
each with its pass condition>

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

<each declined item, with the reason>

## Parked

<each item raised during the interview that belongs to a later plan, with enough
context to pick it up — or "none">

## Run log

<written by the executor; empty at approval. `execute` appends one row per
node for a `code` unit — a unit yields several — and one row per unit report
for an `edit` unit, both as they return. This table is the record for both
kinds; the mempalace journal is a mirror.>

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Acceptance criteria (from blueprint) <!-- cycle plans only -->

<copied verbatim from the Acceptance blocks of the flow docs this slice touches
— the contract `execute`'s acceptance stage verifies end to end. The units must
include the E2E tests that cover each criterion (the coder implements them; the
acceptance verifier maps and runs them). Write "none — no flow touched" when
the slice maps to no flow.>

- [ ] Given <...>, when <...>, then <...> — from
      [<flow name>](../../blueprint/flows/<project>/<NNN>-<flow>/index.md)

## Gaps surfaced during execution <!-- cycle plans only -->

<appended by `execute` as blueprint/plan holes surface — empty at approval. One
terse line per gap: stage that found it · what the blueprint/plan under- or
mis-specified · the assumption execution proceeded on. The durable,
mempalace-independent copy; full detail lives in the mempalace `gaps` room.
Reconciled into the blueprint (/vwf:blueprint) and a re-plan (/vwf:plan) at
cycle end.>

- …

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/<date>-<name>

or let the queue pick it, by priority:

/vwf:execute next
```

## NN-<unit>.md

```markdown
# U<n> — <title>

- **Wave:** <n>
- **Depends on:** <ids or —>
- **Owns:** <explicit paths>
- **Model:** <opus | a named tier | inherit>
- **Kind:** <code | edit>
- **Test first:** <code units only — the failing test that defines done>
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
- Delete with `rm`, never `git rm`.
- <the trap specific to this tree — the formatter's scope, strict-YAML
  frontmatter, BSD sed, byte-copy not retype>

## Commit

`<type>: <description>` — written by the orchestrator after the wave gate, not
by the unit. The type, and the scope where the repo's convention file lists any,
comes from the file the survey read — `.config/git-conventional-commits.yaml` or
the repo's equivalent — never a type that file does not allow.
```

## The two fixed final units

**Docs.** A unit that runs `vwf:docs-sync` over the run's branch delta
(`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`) and applies its findings plus
every `DOCS FALSIFIED:` line the earlier units returned and the list from
index.md's survey facts. Docs ship with the change, so this unit is never
optional — it runs `/vwf:docs-sync` for every plan, of either kind, and the
executor runs no docs-sync of its own. A confirmed reversal from the interview
also lands here, as a
`docs/memory/decisions/<date>-<slug>.md` per
`${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.

**Gates and bump.** Bumps each released project's version per the consent block,
using the command that block names, runs the generators the plan names, and
passes the full wave gate. A bump that would land on a component equal to 13 or
17 goes one further — `x.12.0` minor becomes `x.14.0`, `x.y.16` patch becomes
`x.y.18`; those two integers are never issued on any version line, and the
consent block names the version the bump actually reaches. Its report is the
run's final gate. It does not write the `implementation:` stamps on a cycle
plan's `covers:` docs — those are the executor's Reconcile step, gated on
`covers:` and run before the docs unit's wave, so the docs unit's delta is
complete.

It does **not** run the after-landing steps — those are the orchestrator's,
after the landing, because an after-landing step mutates the machine rather than
the tree under review, and a unit never reaches outside the worktree.
