---
name: plan
description: Produce reviewable cycle plans as diffs for one slice of the
  blueprint (a flow or an entity). Reads desired (blueprint) vs actual (code),
  writes only the delta as a plan folder, docs/plans/<date>-<HHMM>-<slice>/ (an
  index.md plus one file per unit), that /vwf:execute runs unattended in a fresh
  session. Resolves the slice's transitive dependency chain and plans each
  unimplemented dependency as its own plan folder first, in order; routes any
  blueprint gap it uncovers back through /vwf:blueprint before writing — so no
  cycle builds on a gap. Requires the blueprint coverage stamp to read complete,
  and halts on any /vwf:doctor blocking finding across the chain's projects.
argument-hint: "[flow/<name> | entity/<name> | <name>]"
model: opus

disable-model-invocation: false
---

# plan — Cycle Plans (Diffs, Chained by Dependency)

Produce reviewable cycle plans for a chosen slice of the blueprint. A plan is a
**diff**: it reads the blueprint (desired state) and the actual code (actual
state) for one slice and writes only the delta — what exists, what is missing,
what changes, and in what order — as a **plan folder** ordered for TDD, one
unit per step, that `/vwf:execute` runs unattended in a fresh session.

A slice is never planned over unbuilt ground: the slice's **dependency chain**
is resolved first, and every dependency with an unimplemented delta gets **its
own plan folder**, planned and approved before the slice that stands on it —
small, focused plans executed in order, instead of one plan swallowing its
dependencies.

You own the user conversation and the approval gates. Do **not** restate the
blueprint; reference it.

Adopt the **Senior Developer & Architect** persona: read code before forming
opinions; order units test-first; surface drift rather than silently resolving
it. When a planning decision is genuinely open, elicit it following the
**elicitation protocol** in `${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`.

## Doc Paths

| Doc            | Path                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| Registry       | `docs/blueprint/registry.yaml`                                                      |
| Conventions    | `docs/blueprint/conventions.md`                                                     |
| Flow (slice)   | `docs/blueprint/flows/<project>/<NNN>-<flow>/` (`index.md` + `<platform>.md` files) |
| Entity (slice) | `docs/blueprint/entities/<entity>/` (`index.md` + schema)                           |
| API contract   | `docs/blueprint/apis/<project>.openapi.yaml`                                        |
| Released APIs  | `docs/blueprint/apis/released/`                                                     |
| Plan           | `<target-repo>/docs/plans/<date>-<HHMM>-<slice>/` — **the repo whose code it changes**; `index.md` plus one `NN-<unit>.md` per unit |
| Plan index     | `docs/plans/index.md` (base repo) — its one table, one row per plan folder of either kind (`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`) |
| Plan template  | `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`                             |
| Interview      | `${CLAUDE_PLUGIN_ROOT}/assets/plan-interview.md`                                    |
| Backlog        | `docs/backlog.md` (base repo) — read at §2; marked planned via `/vwf:backlog`       |
| Membership     | `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`                                        |

## References

| Reference                                    | When to read                                                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [§3 conditional checks](references/delta-checks.md) | While working §3 — stamp-heal (empty delta), the released-contract check (a touched `apis/released/` snapshot), the harness preflight (always), the deferred-core-token check (a production-bound slice), and the visual-review advisory (a flow with platform files) |
| [Writing the plan folder](references/plan-doc.md)   | At §7, once the shape is approved — the folder's frontmatter, the chain position in Slice, the acceptance-criteria transcription, and the one-unit-per-step rule |

---

## Pipeline

### 1. Resolve the slice

**Coverage gate.** Read the `blueprint:` block in `.config/vwf.yaml` (per the
vwf-config asset). **Halt unless `coverage: complete`:** "The blueprint is not
complete (`<remaining list, or 'never swept'>`). Run `/vwf:blueprint` to finish
the sweep — a plan cut from a partial blueprint builds gaps into the code." A
missing block means no sweep has stamped this repo yet — same halt.

The slice is a single unit from `$ARGUMENTS`: `flow/<name>`, `entity/<name>`, or
a bare `<name>` — resolve a bare name against `docs/blueprint/flows/` first
(matching the flow **slug**, ignoring the project group and `NNN-` prefix —
`signin` matches `flows/app/020-signin/`; the same slug in two projects → MCQ),
then `docs/blueprint/entities/`; if both exist, ask (MCQ). There is no `api/`
slice — an API contract change rides the flow or entity plan that needs it.
**Halt if no blueprint doc exists** for the slice: "No blueprint found for
`<slice>`. Run `/vwf:blueprint` first." A request that spans **several flows**
is not one slice — apply the scope check (§2 of
`${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`): decompose it, agree on order,
and run this pipeline per slice.

**Format check.** Run the preflight in
`${CLAUDE_PLUGIN_ROOT}/assets/format-check.md`; if the repo's blueprint format
is behind what vwf ships, nudge `/vwf:setup` (proceed unless a needed artifact
is missing).

### 2. Resolve the dependency chain

**Recall first.** Per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, recall prior
decisions and plan rationale for this slice (rooms `decisions`, `planning`)
before computing anything — build on them, don't re-derive resolved choices.
Skip silently if mempalace is unavailable. Read the **base repo's**
`docs/backlog.md` too, when the product has one — the backlog is product-level
and lives there, whichever member this slice will land in. A slice that is
already a backlog item carries its id into §7's `backlog:` frontmatter, so the
item is marked planned rather than planned twice.

Derive the slice's dependency graph from the blueprint's typed links:

- **Dependency edges:** a flow's Steps/Screens links to entities; a flow's link
  to a precondition flow; an entity's Relationships links to entities.
- **Not dependencies:** `Used by:` back-links (they invert the edge and would
  make every pair a cycle) and links to `conventions.md`, `design-system.md`,
  `product.md`, `architecture.md`, or `registry.yaml` (references, not buildable
  units).

Traverse **transitively**. Prune every reached doc whose frontmatter reads
`implementation: complete` — and stop traversing through it (its own
dependencies are already built under it). What remains, plus the requested
slice, is the **chain**.

- **Cycles:** a strongly-connected component (e.g. two entities that reference
  each other) collapses into **one chain element** covering all its docs —
  planned together in a single plan; the only multi-doc plan.
- **Present the chain** in topological order, deepest dependency first, the
  requested slice last — one numbered line each:
  `1. entity/customer — implementation: none`, `2. flow/checkout — requested`.
  The user may **approve the chain**, **trim an element** (a conscious hole —
  record it as an assumed-decisions row of every downstream plan in the chain),
  or **abort**. A chain of length 1 (no unbuilt dependencies) proceeds without
  ceremony.

**Member gate.** Before the stack gate, resolve which repo each chain project
lives in, per `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`. For every repo not on this
machine, say what it is needed for and **offer a consent-gated clone**. On
accept, clone and continue. **On decline, continue with that project excluded
and record the blind spot** — name every uninspected project in the §6 approval
presentation *and* in the folder's *Facts the survey established*, so a reader
knows the delta was computed without seeing them. A plan written against
incomplete knowledge is useful; one that looks complete is not.

**Stack gate.** Once the chain is approved, run `/vwf:doctor` scoped to every
registry project the chain's elements map to **that is present on this machine**,
and **halt on any `blocking`
finding** — report it with its remedy and stop. An absent, declined project is
skipped rather than blocking: it is already recorded as a blind spot, and
halting on a repo the user chose not to clone would override the consent they
just gave. A stack no installed plugin
defines (an **unknown** language, a `custom` template pin) is the finding this
gate exists for: a plan's units are sized against the selected templates'
conventions, and when there is no template there are no conventions — the plan
would read as ordinary while resting on nothing
(`${CLAUDE_PLUGIN_ROOT}/assets/stack-vocabulary.md`).

**An `unresolved` axis halts too, and doctor is not what catches it** — doctor
reports deferral as a degradation, deliberately, since defining a product with
no stack chosen is a supported state. The halt belongs to the step below and
fires there, before any adapter is called: see *Resolving the conventions* in
`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`, step 1. Report it
**distinguishably from a failed fetch** — one is a question nobody answered and
points at `/vwf:architecture`, the other is a plugin that broke.

Three things about its placement and scope, each deliberate:

- **Here, not in §1.** The scope is the *chain's* projects, not the requested
  slice's — a dependency planned into another project must be gated too, and
  which projects those are is not known until the chain resolves.
- **Before §3, because §3 is the expensive part.** The surveyor is the largest
  inline read in the workflow; halting after it would spend exactly the work the
  gate exists to avoid.
- **Blocking only.** Every other finding is noted, not acted on — planning
  compiles nothing. The one exception is the **LSP question**: for each
  language doctor reports without an LSP server, ask once (MCQ — *install now*
  / *proceed without*) and hold the answer for the folder's Consent block as a
  `LSP <language>: installed / proceed without` row (interview item 9a). An
  absent toolchain is asked here, once, and recorded — `execute` reads the row
  and never asks it again. A language doctor reports as *unavailable* (no LSP
  ships in this marketplace) has nothing to install and is not asked; note it.

This is a delegation, never a second copy of the rule — the finding kinds and
their remedies live in `doctor` alone, so closing the menu further never means
editing this file.

**Resolve the stack conventions.** With the gate clean, fetch the `conventions:`
prose for every template the chain's projects pin, per *Resolving the
conventions* in `${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md` — deduped by
slug, **once for the whole chain**, before §3. Its step 1 is where an
`unresolved` axis halts, ahead of any fetch. The config block names the
templates; only the plugin holds what they say, and the *how* questions this
command settles — where a file goes, what a test looks like, which existing
shape to extend — are answered by that prose. Sizing units without it is
guessing at a layout the repo already has an opinion about.

**Under `topology: multi-repo`, pass the target repo with each fetch.** Each
project's pins were materialized into *its own* repo, so the invocation carries
the `repo: <path>` line that asset's *The target repo* defines — the member
whose `members:` entry lists that project, per the membership asset
(`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`); a project no member lists is
the base's. The dedupe still holds, now per (repo, slug) rather than per slug:
two members on the same slug are two materializations, and resolving one for
both would size units against prose the other repo does not contain.

Once per chain rather than per element, because every element of a chain sits in
the same few projects and the prose cannot change between them. Hold the result
for §§3–7.

Then run §§3–8 **once per chain element, in order** — each element produces its
own plan folder behind its own approval gate.

### 3. Read desired vs actual & compute the delta

- **Desired:** the blueprint docs for this element — a flow's doc plus the
  `schema.yaml` of each entity it links, the operations it names in
  `apis/<project>.openapi.yaml`, and its **Acceptance block** (the criteria the
  cycle must land); an entity's `index.md` + `schema.yaml` plus the API
  operations that serve it — plus `conventions.md`, the registry, and — when the
  element consumes external credentials/env vars —
  `docs/blueprint/environment.md`.
- **Actual:** the real code in the submodule(s) the registry maps this element
  to (resolve section→project by `role` and `doc_unit`, as in `blueprint` §2).

**Delegate the survey.** Dispatch a fresh `plan-surveyor` subagent per chain
element rather than reading the codebase yourself — this is the largest inline
read in the workflow, and everything it loads would otherwise tax every
subsequent turn of the pass. Pass it the element's blueprint doc path(s), the
registry `projects:` block, **each project's `stack` block** from
`.config/vwf.yaml` (the registry carries none — the surveyor's Inputs require
it, and it is what lets a reuse candidate be recognised as one), the relevant
`conventions.md` anchors, and the API contract path(s) the element references.

The resolved **stack conventions prose** stays here rather than going with it.
The surveyor answers *what exists*; the prose answers *where a new thing
belongs*, which is this command's question when it sizes the units. Sending it
along would grow the workflow's largest read to settle a question the surveyor is
not asked. It surveys **graph-first** per
`${CLAUDE_PLUGIN_ROOT}/assets/graphify.md` (falling back silently to direct
reads when no graph is reachable) and returns terse `PRESENT:` / `PARTIAL:` /
`ABSENT:` / `REUSE CANDIDATES:` / `CONTRADICTIONS:` / `HARNESS:` lines with
`file:line` pointers — never code. When a chain has several unimplemented
elements, **dispatch their surveyors in a single message** so they run
concurrently.

Read a pointed-at file yourself only when a specific decision genuinely needs
its contents. From the surveyor's return, determine what must change and the
order to do it in. Reference blueprint sections; do not restate them.

A `CONTRADICTIONS:` entry is never resolved in the plan — route it per §4, like
any blueprint gap. `HARNESS:` seeds the preflight below.

Apply the **minimalism decision ladder** in
`${CLAUDE_PLUGIN_ROOT}/assets/minimalism.md` as you size each unit: include a
unit only if a blueprint requirement needs it (rung 1), and prefer reusing
existing code, the stdlib, a native platform feature, or an installed dependency
over new code or a new dependency (rungs 2–5). The plan carries no speculative
units and no unrequested abstraction or configurability — never at the cost of a
safety guardrail. Every **new third-party dependency** a unit introduces is
named explicitly in that unit and in the folder's *New dependencies* section
(package + what it's for): the plan's approval gate is where the user consents
to new dependencies, and execute never installs one the plan doesn't name.

**Then run the five checks** in
[§3 conditional checks](references/delta-checks.md) — stamp-heal, the
released-contract check, the harness preflight, the deferred-core-token check,
and the visual-review advisory. The harness preflight fires on every element;
the other four only when their condition holds. The harness preflight's
injected bootstrap step is an injected **unit**, ordered before the units whose
verification depends on it.

### 4. Route blueprint gaps back; flag drift

**A blueprint gap goes back to the blueprint — before the plan is written.**
When diffing or elicitation exposes a hole in the *contract* — a behaviour the
blueprint never pinned down, a missing relationship, flow, or acceptance
criterion, a schema property or API operation the element needs that no doc
specifies — do **not** settle it inside the plan and do not park it as an
assumed decision: pause, present the gap, and offer
`/vwf:blueprint <flow|entity>` (or `/vwf:architecture` for a registry hole).
After that pass lands (and re-stamps coverage), re-derive the affected part of
the diff (§3) against the updated contract. A plan written over a known
blueprint gap defeats execute's autonomy: execute would hit the same hole
mid-run and could only document it as a gap, where the contract should already
have answered it.

**Drift: the blueprint is the source of truth — code follows.** When the code
**contradicts** the blueprint (not merely lags it), never adjust the blueprint
to match the code silently. Either the plan carries units that conform the code,
or the user consciously amends the contract via `/vwf:blueprint` (which demotes
the doc's `implementation:` stamp). Every contradiction is a row of the
assumed-decisions table — the contradiction as the decision, the conforming unit
(or the amendment decision) in the *Unit* column. If the blueprint implies a
surface the registry/code lacks (e.g. a background job with no worker project),
surface that there too.

**Consume execution-surfaced gaps.** If a prior plan for this slice exists —
**the most recent un-archived plan folder** (folder names are timestamped; take
the latest one still under `docs/plans/`, not `archived/`) — read the "Gaps
surfaced during execution" section of its `index.md`, and per
`${CLAUDE_PLUGIN_ROOT}/assets/memory.md` recall room `gaps` for the slice. When
this plan is a reconcile loop-back from `/vwf:execute`, closing those plan
holes is the point of the pass — fold each into the units (against the
now-updated blueprint) rather than re-deriving blind. Skip the recall silently
if mempalace is unavailable.

### 5. Interview

Work through `${CLAUDE_PLUGIN_ROOT}/assets/plan-interview.md` top to bottom,
one item per turn, following its *Cycle plans:* notes — the blueprint and the
surveyor answer most items before they are reached, and an answered item is
confirmed in a sentence, never re-asked. **Never batch** — one decision per
turn, and never assume one.

The plan is a diff — most of it is mechanical. But where the blueprint
underdetermines **how** to land a change (unit ordering with competing valid
sequences, how to resolve a drift §4 surfaced, an ambiguous delta with more than
one reasonable implementation path), elicit it per the protocol — one question
at a time, MCQ + "Other", proposing 2-3 approaches with a recommendation. Apply
the decisions-vs-mechanics filter: if exactly one idiomatic path exists given
the blueprint, conventions, and code, don't ask — proceed. Never guess — and
apply the **what-vs-how test**: a question about what the product should *do*
(behaviour, contract, data shape, acceptance) is a blueprint gap — route it per
§4, never settle it here. An approved plan carries no unresolved decisions.

Every ruling lands in the assumed-decisions table with the alternative it
rejected and the unit it binds; anything raised that belongs to a later plan
goes to *Parked* before the next question. The **priority** (item 12) is stated
as a fact, never asked: `10 + max` over the `Priority` column of every
unarchived `requires:` row in the base repo's `docs/plans/index.md`, or `10`
when the plan requires none of them — say which row it stands on. Items 16–18
produce the Consent block: the landing answer, the after-landing `ask` steps,
and the release intent per project the units touch; the LSP rows come from §2.

### 6. Present the shape — the approval gate (per chain element)

**Nothing is written to disk before this gate.** Present the folder's sections
per `${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`, scaled to their
weight and confirmed one at a time: the goal and the Slice (chain position);
the assumed-decisions table, every ruling with its rejected alternative and
every drift row; the unit map — id, wave, owns, depends-on, the failing test
each names; every new dependency (package, what for, which unit); the wave
gate, the after-landing steps, the gates the orchestrator keeps, and the
derived priority with its arithmetic; the consent block, LSP rows included; the
acceptance criteria the units cover; the blind spots and the visual-review
advisory, when any; the parked list. Then wait for explicit approval. Offer:

- **Approve & plan next** (mid-chain) — write the folder (§7), hand it off
  (§8), then proceed to the next chain element (§3).
- **Approve only** — write the folder (§7), hand it off (§8), and stop
  (mid-chain: the rest of the chain stays unplanned; say so).
- **Reject** — then either **Revise** (apply feedback to the section named,
  re-present, looping until approved or abandoned) or **Abandon** (nothing is
  on disk; leave a one-line note of what was decided so the next attempt can
  recall it — and abandon the chain's downstream elements too, since they stand
  on it).

**Persist.** On approve, per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, store the
approved plan's durable "how to land it" decisions and any deliberately deferred
options to mempalace (room `planning`) — skip what the folder captures verbatim,
and skip silently if mempalace is unavailable.

### 7. Write the folder

Write `docs/plans/<date>-<HHMM>-<slice>/` from
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`, following
[Writing the plan folder](references/plan-doc.md): `index.md` — the frontmatter
(`type: vwf-plan`, `covers:`, `requires:`, `backlog:`), the Status block at
`DRAFT`, the Consent block, the cycle-only sections (Slice, Acceptance criteria
(from blueprint), Gaps surfaced during execution), the assumed decisions, the
units table — plus one `NN-<unit>.md` per unit. Every unit is `Kind: code`, on
Model `opus` unless the interview recorded another tier, with its Wave from
dependency order, its Owns the files it touches, its Depends-on, its **Test
first** line, its ruling quoted from `index.md`, its Verification (the gate
lines) and its Commit line. Harness bootstrap units and the expand / backfill /
contract units of `delta-checks.md` are units like any other, ordered before
what depends on them. The two fixed final units — docs, gates-and-bump — are
written as the template says.

**`backlog:`.** The frontmatter also carries a `backlog:` list — the ids of the
`docs/backlog.md` items §2's recall matched to this element. Write it empty when
the slice came from nowhere in the backlog; an empty or absent list means the
plan covers no backlog item, and §8 then calls nothing.

**Dark exposure.** A plan may declare `exposure: dark` for its slice — the
slice ships behind a **release flag** in the runtime-settings document (per the
runtime-settings foundation: same schema/cache/audit path, no new
infrastructure). Declaring it injects the flag key into the plan — **name,
owner, removal date** — and an explicit **flag-removal unit**, so the flag's
retirement is planned work, never silently accumulated debt.

**Into the repo whose code this plan changes.** In a `repo` or `monorepo`
topology that is the one checkout and the rule costs nothing. In `multi-repo` it
is the member holding the chain element's project — resolve it from `members:`
per `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`. A chain spanning two members already
produces one plan per element, so each simply lands in its own repo; a plan is
never split across repos. The folder is written **in place on the current
branch** — this skill cuts no worktree; the fresh session that runs the plan
cuts its own.

**The dependency gate does not move.** `execute` halts until every `requires:`
plan's `covers:` docs read `implementation: complete`, and those stamps live in
the blueprint — in the base repo. So the chain resolves from the base alone even
when the upstream plans sit in members that are not cloned here.

**Self-review** before handing off, fixing inline: every assumed-decisions row
is quoted in the unit file its *Unit* column names; every owned path appears in
exactly one unit per wave; every acceptance criterion is covered by some unit's
E2E test; every unit's Verification names a gate line; every `requires:` folder
exists; the derived priority matches its arithmetic; the launch line names this
folder.

### 8. Hand off

In this order.

1. **Set the status** to `APPROVED` with the date; until then it is `DRAFT` and
   `/vwf:execute` refuses it.
2. **Add the index row.** Append one row to the base repo's
   `docs/plans/index.md`, per `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`:
   `Folder` the plan folder path relative to its repo root, `Kind` `cycle`,
   `Plan` the title, `Target repo` the member whose code it changes under
   `multi-repo` or `—`, `Priority` the integer §5 derived, `Status`
   `APPROVED`, `Requires` the basenames of its `requires:` entries or `—`,
   `Backlog` its `backlog:` ids or `—`. When the file does not exist yet, write
   its whole shape from the asset first, then append. This is the one edit this
   skill makes to that file — every other row is `/vwf:execute`'s or
   `/vwf:archive`'s.
3. **Mark the backlog items planned.** When the frontmatter's `backlog:` list
   names ids, invoke `/vwf:backlog planned <ids> <folder>` — that skill edits
   the file; this one never does.
4. **Commit and push the folder** through `vwf:git-workflow`, invoked with
   these declared preferences, so it asks nothing:
   - **work in place on the current branch, no worktree** — its Step 1 "if
     declined" path. Say why: the fresh session's worktree is cut from the
     integration branch, so it can see the folder only once the folder is
     committed there; a folder still untracked at hand-off gets swept into some
     later wave's commit. The index row rides the same commit for the same
     reason — it is a direct commit on the branch, never a worktree's
   - **stage exactly the plan folder**, `docs/plans/index.md`, plus
     `docs/backlog.md` when step 3 changed it, and nothing else
   - **commit** with type `docs` and the message
     `docs: plan — <slice> — approved, awaiting execution`
   - **push to the branch's upstream** after the commit, setting the upstream
     when the branch has none. The approve in §6 is the explicit request
     git-workflow's push rule wants; do not ask again

   Under `multi-repo` the folder and the index are two repos: two commits,
   the member's (the folder) first, the base's (the index row, and the backlog
   edit) last, both pushed.

Then end with exactly this, and nothing after it:

```text
Run in a fresh session:

/vwf:execute docs/plans/<date>-<HHMM>-<slice>

or let the queue pick it, by priority:

/vwf:execute next
```

Do not start executing. The fresh session is the point — this session's context
is the survey and the interview, and the run should carry none of it.

**Mid-chain**, after the push, continue to the next element (§3) — each element
is its own folder, its own row, its own commit; the launch line is printed once
per folder and the chain's first unexecuted plan is the one to run first.

## What this skill never does

- Writes anything to disk before the gate in §6 is approved
- Executes a unit, edits a file the plan names, or bumps a version
- Asks two things in one turn, or asks what the blueprint, the surveyor or the
  repo already answers
- Settles a *what* question — behaviour, contract, data shape, acceptance — that
  belongs to `/vwf:blueprint`
- Records a release or landing consent it did not explicitly ask for
- Pushes anywhere but the branch it stands on, and merges nothing
- Edits `docs/backlog.md` itself — it calls `/vwf:backlog`, which owns the file
- Edits any row of `docs/plans/index.md` but the one it appends — statuses are
  `/vwf:execute`'s and `/vwf:archive`'s
