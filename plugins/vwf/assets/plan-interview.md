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
   doc(s) on `index.json`'s `covers` reading `implementation: complete`.
2. **Scope check.** Is this one plan or several? A request spanning trees with
   no shared ruling is split now, each piece its own folder, ordered, chained
   through `index.json`'s `requires`.
   *Cycle plans:* scope is the resolved dependency chain, one folder per chain
   element, each `requires` the one before it — not a split the user draws.

2a. **Finishes or a piece.** For each backlog id the recall matched — every
id the arguments named, and every item the request turns out to be — does this
plan finish the item, or land one piece of it? Each such id goes on
`index.json`'s `source`, the items the plan was made for, and on exactly one
of the two lists below; an id a plan was made for is never left off both. A
finishing id goes on `backlog` — landing sets it `Done`; a piece id goes on
`backlog_pieces` — landing sets it `Partially done` — and what remains is
written as `- Bnn: <piece>` Parked lines in `index.md`, at least one per piece
id (section F). The last plan of a chain moves the id to `backlog`.

2b. **Gaps of a landed plan.** Does this plan take the gaps of a landed plan —
a row of `docs/plans/index.json` whose `gaps.open` is above `0`? Each such
folder goes on `index.json`'s `gaps_of`; at hand-off `plan-management add`
sets that row's `gaps` to an `open` of `0`, with this folder in `moved_to`.

3. **Non-goals.** What the user is explicitly not asking for, especially the
   adjacent thing the survey found. Goes to *Out of scope* with the reason.
4. **Reversals.** Does any part contradict a standing decision — a memory, a
   `docs/memory/decisions/` doc, a CLAUDE.md rule, a recalled drawer? Name it as
   a reversal and get it confirmed; a confirmed reversal becomes a decisions doc
   the docs unit writes.
   *Cycle plans:* every `CONTRADICTIONS:` line the surveyor returned is a
   reversal candidate too — code against blueprint is never settled in the
   plan; it is routed to `/vwf:blueprint` or carried as a drift entry in
   `decisions` naming the conforming unit.

## B. Per-project scope

5. **Which projects.** Confirm the survey's list of trees and projects. Anything
   the user adds re-runs the survey for that tree.
   *Cycle plans:* the projects come from the registry, per chain element — the
   `role` and `doc_unit` mapping — and the member repo each lives in; not asked.
6. **Per project, the concrete edits.** File-level where the survey allows it.
   This becomes each unit's `owns` in `index.json`, so it must be disjoint per
   wave.
   *Cycle plans:* the concrete edits are the delta the surveyor returned —
   `PARTIAL:` and `ABSENT:` lines — sized by the minimalism ladder into units.
7. **Behaviour change or not.** Per project: does a user of that project see a
   difference? Drives the release level (item 18).
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
   that needs it, with the rejected alternative in `decisions`. Keep
   asking until no unit would have to invent a decision.
   *Cycle plans:* only *how* questions belong here. Anything the what-vs-how
   test routes to `/vwf:blueprint` — behaviour, contract, data shape,
   acceptance — is a blueprint gap, routed before the plan is written, never
   settled in it.

9a. **LSP servers.** For every language `/vwf:doctor` reports without an LSP
server, ask once: install now, or proceed without. The answer is
`consent.lsp.<language>` in `index.json` — `installed` or
`proceed without` — which `/vwf:execute`'s preflight reads instead of asking.
*Change plans:* not asked — no code unit.

10. **Ordering.** Which units can run concurrently (disjoint paths, no
    dependency) and which must wait. The user overrides the derived order only
    where they know something the survey did not.
    *Cycle plans:* TDD order within dependency order — each unit names the
    failing test that defines done, and a harness bootstrap unit orders before
    the units whose verification depends on it. Waves are ordering only;
    `execute` runs units serially.

10a. **Review placement.** Where the review unit(s) — `kind` `review` — go:
the unit that runs `/code-review` and `/security-review` plus the two
reviewers over the branch delta since the previous review unit or the branch
base. No code unit triggers a review by itself, and `execute` infers none.
*Cycle plans:* default is **one** review unit, after the last code unit and
before the docs unit, covering every code unit. An earlier one is offered
only with a reason — a boundary later units build on — and that reason is an
entry in `decisions`.
*Change plans:* whether a review unit is needed at all — by default none, the
wave review is the only check. One is written only when the change lands
runnable code — anything that executes rather than is read: shipped shell or
hook scripts, build or tooling source, an installable package — and an entry
in `decisions` says why.
*Both kinds:* a review unit covers every unit in an earlier wave that no
earlier review unit covers, of any kind — not only the units that land
code — so no finding in its range falls on a unit it does not cover.

11. **Model per unit.** Default is `opus`, written explicitly into every
    unit's `model` in `index.json`. A unit the user wants on a stronger or
    cheaper tier records that tier instead; `inherit` means the session's
    model.
12. **Priority.** Stated, never asked: no folder exists yet, so invoke
    `plan-management priority <requires…>` with the `requires` entries this
    plan will carry — folder basenames, possibly none — and say what it
    returns: `10 + max` over the `priority` of every unarchived required row
    in the base repo's `docs/plans/index.json`, or `10` when the plan
    requires none of them — and which row it stands on. The user may name
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
    hit of the retired-name grep — a hit with no owner is a unit to add to
    `units` now, not a `DOCS FALSIFIED:` line to discover at run time. The
    docs unit reconciles exactly these plus whatever `vwf:docs-sync` finds.
    *Cycle plans:* read from the surveyor's `HARNESS:` and drift lines — the
    docs that describe a harness or a behaviour the slice changes.

## E. Consent

16. **Landing.** May a fully green run merge to the integration branch and push
    without a further prompt? The answer is `consent.merge` in `index.json`.
    Default when unanswered is **no** (`false`).
17. **After-landing steps.** Walk the steps the planner proposed one at a time;
    each is confirmed as `run` or dropped, and each `run` step is an entry
    of `index.json`'s `after_landing`. `run` means a green landing runs
    the step with no prompt — the consent given here is the consent. A step
    the user wants to check first is dropped, and run by hand later; the
    executor never stops before a step to ask. Where a step stages something
    this session already loaded, say that a **restarted** session is what
    picks it up. A command that `.config/vwf.yaml`'s `after_landing:` already
    lists is not proposed as a plan step: `/vwf:execute` runs it after every
    green landing (`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md` is the
    doctrine). No steps at all is a valid answer.
18. **Release level, per affected project.** Stated, never asked: the planner
    derives each level from the change — breaks users → `MAJOR`, new behaviour
    → `MINOR`, a fix → `PATCH`, no user-visible change → `NONE` — and writes
    one `release_levels` entry in `index.json` per project the units touch,
    `NONE` included, each with its reason. It shows the levels at the gate,
    as it shows the priority; the user may change a level there, and nothing
    else changes it. The plan never bumps a version and never releases: at
    landing `/vwf:execute` raises each level in `.config/releases.yaml` (the
    highest wins), and a release is cut later, by hand.
    - **18a. End an `all` run after landing.** Asked only when the plan's
      `owns` include a plugin the run itself loads — a plugin installed in the
      session that runs `/vwf:execute all`, whose edits that session goes on
      running stale until it restarts: should an `all` run end after this
      plan lands, yes or no? The answer is `consent.end_all_run` in
      `index.json`; on yes (`true`), `all` ends after this plan and reports
      "restart, then `/vwf:execute all`". When the `owns` touch no such
      plugin it is written `false`, unasked.

The executor asks nothing at run time — every answer is in the folder, save
the run-level questions /vwf:execute all asks once, before its first plan. It
follows the plan, and only a runtime stop ends a run. So the interview is not
done while any question the run would otherwise raise is unanswered: every
key of `consent` carries an answer, every after-landing step reads `run`, and
every decision a unit or the executor would otherwise have to pause on is a
ruling in the plan.

## F. Parked

Anything raised during A–E that belongs to a later plan is written to the
*Parked* list of `index.md` before the next question is asked — never
carried only in conversation. A Parked entry that belongs to a backlog item
begins with its id — `- Bnn: <piece>` — naming the chained folder where one
already covers the piece. Every `backlog_pieces` id needs at least one such
line, and a `backlog` id has none; `plan.mjs validate` refuses a folder that
breaks either, names one id on both lists, or names a `source` id on neither.

## G. The gate

19. **Present the shape** per the planner's gate step and ask once: approve,
    revise or abandon. Only an explicit approve writes the folder — and the
    hand-off commits and pushes it — and only a later explicit yes after
    self-review sets `status.state` to `APPROVED`.
20. **The rulings review.** At self-review, once the planner's own checks are
    fixed and while the folder is still `DRAFT` — `status.state` reads
    `DRAFT` — dispatch a fresh `plan-rulings-reviewer` subagent with the
    folder path and the repo root alone. It returns `NO GAPS` or a numbered
    `GAPS:` list — the cases the rulings leave open, which the run would
    otherwise meet as gaps. Ask the user each gap **one at a time**, the same
    way as A–E, and write each answer into the folder before the next
    question: a new or amended entry of `decisions`, quoted in the unit file
    it reaches, a unit's `owns` widened, or a Parked line. An answer that a
    case is accepted or out of scope is a ruling too, and goes into
    `decisions`. Then dispatch a fresh reviewer again, over the changed
    folder. Loop until it returns `NO GAPS`, **four rounds at most**. When
    round four still returns gaps, show the list and have the user rule on
    each one or accept it as an open gap, written into `decisions` — never
    hand off with an unread list.
