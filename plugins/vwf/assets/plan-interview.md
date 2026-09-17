# The interview checklist

One checklist for both planners. `/vwf:change-plan` asks it over an ad-hoc
request; `/vwf:plan` asks it over a blueprint slice, where the survey and the
blueprint answer most items before they are reached. Where an item differs
between the two, an indented *Cycle plans:* or *Change plans:* line says how.

One item per turn. Ask in this order; an item the survey or the recall answered
is confirmed in one sentence rather than asked. The interview ends when every
item has an answer written into the plan, not when the user seems done.

Where an item has more than one reasonable answer, propose two or three
approaches with their trade-offs, recommendation first. Where it has exactly one
idiomatic answer given the repo, do not ask — state it and move on.

## A. The change

1. **Goal, in one sentence.** What is true after the plan lands that is not true
   now. Reject a goal that names a mechanism instead of an outcome.
   *Cycle plans:* the goal is the slice and its chain position — the blueprint
   doc(s) under `covers:` reading `implementation: complete`.
2. **Scope check.** Is this one plan or several? A request spanning trees with
   no shared ruling is split now, each piece its own folder, ordered, chained
   through `requires:`.
   *Cycle plans:* scope is the resolved dependency chain, one folder per chain
   element, each `requires:` the one before it — not a split the user draws.
3. **Non-goals.** What the user is explicitly not asking for, especially the
   adjacent thing the survey found. Goes to *Out of scope* with the reason.
4. **Reversals.** Does any part contradict a standing decision — a memory, a
   `docs/memory/decisions/` doc, a CLAUDE.md rule, a recalled drawer? Name it as
   a reversal and get it confirmed; a confirmed reversal becomes a decisions doc
   the docs unit writes.
   *Cycle plans:* every `CONTRADICTIONS:` line the surveyor returned is a
   reversal candidate too — code against blueprint is never settled in the
   plan; it is routed to `/vwf:blueprint` or carried as a drift row naming the
   conforming unit.

## B. Per-project scope

5. **Which projects.** Confirm the survey's list of trees and projects. Anything
   the user adds re-runs the survey for that tree.
   *Cycle plans:* the projects come from the registry, per chain element — the
   `role` and `doc_unit` mapping — and the member repo each lives in; not asked.
6. **Per project, the concrete edits.** File-level where the survey allows it.
   This becomes the unit table's *Owns* column, so it must be disjoint per wave.
   *Cycle plans:* the concrete edits are the delta the surveyor returned —
   `PARTIAL:` and `ABSENT:` lines — sized by the minimalism ladder into units.
7. **Behaviour change or not.** Per project: does a user of that project see a
   difference? Drives the release intent.
   *Cycle plans:* always yes — a slice lands blueprint behaviour by definition.
8. **New dependencies.** Does any edit need a package the tree does not already
   have? Name it, what for, and the existing thing it was preferred over. A unit
   adds no dependency the plan does not list.
   *Cycle plans:* named per unit — package plus what it is for — exactly as the
   plan skill's §3 requires; the approval gate is where the user consents to
   each, and `execute` installs none the plan does not name.

## C. Rulings

9. **Every open design point.** One question each, approaches with trade-offs,
   recommended option first. The answer is quoted verbatim into the unit file
   that needs it, with the rejected alternative in the decisions table. Keep
   asking until no unit would have to invent a decision.
   *Cycle plans:* only *how* questions belong here. Anything the what-vs-how
   test routes to `/vwf:blueprint` — behaviour, contract, data shape,
   acceptance — is a blueprint gap, routed before the plan is written, never
   settled in it.

9a. **LSP servers.** For every language `/vwf:doctor` reports without an LSP
server, ask once: install now, or proceed without. The answer is a consent row —
`LSP <language>: installed / proceed without` — which `/vwf:execute`'s preflight
reads instead of asking.
*Change plans:* not asked — no code unit.

10. **Ordering.** Which units can run concurrently (disjoint paths, no
    dependency) and which must wait. The user overrides the derived order only
    where they know something the survey did not.
    *Cycle plans:* TDD order within dependency order — each unit names the
    failing test that defines done, and a harness bootstrap unit orders before
    the units whose verification depends on it. Waves are ordering only;
    `execute` runs units serially.

10a. **Review placement.** Where the `Kind: review` row(s) go — the row that
runs `/code-review` and `/security-review` plus the two reviewers over the
branch delta since the previous row or the branch base. No code unit triggers a
review by itself, and `execute` infers no row.
*Cycle plans:* default is **one** row, after the last code unit and before the
docs unit, covering every code unit. An earlier row is offered only with a
reason — a boundary later units build on — and that reason is a row in the
assumed-decisions table.
*Change plans:* whether a row is needed at all — by default none, the wave
review is the only check. One is written only when the change lands runnable
code — anything that executes rather than is read: shipped shell or hook
scripts, build or tooling source, an installable package — and the decisions
table says why.

11. **Model per unit.** Default is `opus`, written explicitly into every unit
    file's `Model:` line. A unit the user wants on a stronger or cheaper tier
    records that tier instead; `inherit` means the session's model.
12. **Priority.** Stated, never asked: no folder exists yet, so invoke
    `plan-management priority <requires…>` with the `requires:` entries this
    plan will carry — folder basenames, possibly none — and say what it
    returns: `10 + max` over the `Priority` column of every unarchived
    `requires:` row in the base repo's `docs/plans/index.md`, or `10` when the
    plan requires none of them — and which row it stands on. The user may name
    a required plan the interview missed, which changes the arithmetic —
    nothing else does; run the verb again.

## D. Gates and docs

13. **Gate deltas.** Which check, test, or task must change or be added so the
    new behaviour is asserted, and which existing gate the change will break
    until it is adjusted. Each is an owned edit in a unit.
    *Cycle plans:* the harness bootstrap units the preflight injects — every
    capability the element's gates need and the repo lacks — are gate deltas
    too, and the minimalism ladder never strikes them.
14. **Verification the orchestrator keeps.** Anything a diff cannot prove — a
    real install, a scratch-repo run, a smoke test. Name it, name its pass
    condition.
15. **Docs the change falsifies.** Confirm the survey's list, including every
    hit of the retired-name grep — a hit with no owner is a unit-table row to
    add now, not a `DOCS FALSIFIED:` line to discover at run time. The docs unit
    reconciles exactly these plus whatever `vwf:docs-sync` finds.
    *Cycle plans:* read from the surveyor's `HARNESS:` and drift lines — the
    docs that describe a harness or a behaviour the slice changes.

## E. Consent

16. **Landing.** May a fully green run merge to the integration branch and push
    without a further prompt? Default when unanswered is **no**.
17. **After-landing steps.** Walk the steps the planner proposed one at a time;
    each is confirmed as `run`, `ask` or dropped, and the mode is written to the
    After landing table. `run` means a green landing runs the step with no
    prompt — the consent given here is the consent; `ask` means the run stops
    once before it, reports what it would do, and waits. Where a step stages
    something this session already loaded, say that a **restarted** session is
    what picks it up. No steps at all is a valid answer.
18. **Release intent, per affected project.** Release to users or not, and
    `none` / `patch` / `minor` / `major`, together with the command that bumps
    the version. Record every answer including "not this time". This question
    doubles as the consent for a release step recorded `run` in item 17: a
    release the user names here and records `run` is authorised, and the
    executor runs it on a green landing without asking again. A release
    recorded `ask`, or with no after-landing step, is **intent, not
    authorisation** — the executor stops once and asks. A bump that
    would land on a component equal to 13 or 17 goes one further — `x.12.0`
    minor becomes `x.14.0`, `x.y.16` patch becomes `x.y.18`; those two integers
    are never issued on any version line, and the consent row names the version
    the bump actually reaches.

## F. Parked

Anything raised during A–E that belongs to a later plan is written to the
*Parked* list before the next question is asked — never carried only in
conversation.

## G. The gate

19. **Present the shape** per the planner's gate step and ask once: approve,
    revise or abandon. Only an explicit approve writes the folder — and the
    hand-off commits and pushes it — and only a later explicit yes after
    self-review sets the status to `APPROVED`.
