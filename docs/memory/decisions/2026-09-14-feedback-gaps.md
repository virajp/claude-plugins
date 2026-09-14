# Decision — feedback keeps one hop, gains a shape-change kind and a build-state line

**Date** 2026-09-14 · **Branch** `2026-09-14-feedback-gaps` · **Plan**
[`docs/plans/2026-09-14-feedback-gaps/`](../../plans/2026-09-14-feedback-gaps/index.md)
· **Reverses** nothing · **Backlog** B05 (group C of the 2026-09-13 capture)

## What was decided before

- **2026-09-10** — the seventh kind. The plan
  `docs/plans/archived/2026-09-10-vwf-feedback-archive-import/` landed **not a
  blueprint gap**: a report with no flow, entity or screen behind it is handed
  verbatim to `/vwf:change-plan`, or filed to room `gaps` tagged `non-blueprint`
  when deferred. The backlog's note "parked from 2026-09-08: feedback routing a
  non-blueprint fix into change-plan" was stale by the time B05 was captured.
- **2026-09-13** — the backlog/feedback line, recorded in
  [`2026-09-13-vwf-process.md`](2026-09-13-vwf-process.md): the backlog is what
  cannot be picked up now, feedback is what is being worked now and may change
  `product`, `blueprint` or `architecture` before following `plan` → `execute`.
  That doc left feedback's routing itself to this plan.

## What prompted it

B05, in the user's words: "Add `/vwf:feedback` skill which is used once the
product is built and we want to make changes as per user feedback." The survey
found the skill shipping seven kinds with four gaps against that sentence: no
route reached `/vwf:architecture`, so a report whose fix needs the registry to
move first had no kind; nothing read the `implementation:` stamps or the
released snapshots, so the routes never said what state the thing they touched
was in; the feature-idea route ended in prose ("the normal blueprint → plan →
execute path") and named no unit; and `/vwf:product` took no argument, so the
feature-idea hand-off carried nothing across.

## The rulings

### 1. Scope — one hop kept

Verbatim from the plan:

> Fill the four gaps; keep one doc edit, one offered command and one hand-off
> per report. (User, MCQ.)

Rejected: feedback driving the whole chain — the gates at blueprint, plan and
execute already stop at every step, and a second driver on top of them is a
second place to be wrong; closing B05 as covered.

### 2. The eighth kind — Shape change

Verbatim from the plan:

> **Shape change** — signal: the fix needs a new project, a changed stack pin, a
> new capability or a cross-cutting foundation before any flow can be written.
> Route: `/vwf:architecture`, which hands to `/vwf:setup`'s materialize pass
> itself. A report whose shape change is incidental stays a Blueprint hole and
> reaches architecture through blueprint's own sub-step. Deferred: a line in
> `docs/blueprint/architecture.md`'s open questions, room `gaps`. (User, MCQ.)

The run fixed the heading as `## Open Questions` — the casing the flow and
entity templates use — created at the end of `architecture.md` when absent; the
architecture template itself is untouched.

Rejected: a "needs architecture first" flag on every kind.

### 3. Build state — read, printed, not recorded

Verbatim from the plan:

> After classifying, read the owning flow's or entity's `implementation:` stamp,
> and whether `docs/blueprint/apis/released/` holds the owning project's
> `<project>@*.openapi.yaml` or the entity's `entities/<entity>@*.schema.yaml`.
> Print one line —
> `Build state: <none/partial/complete>; contract: <unreleased/released>` —
> before the route. When a released contract is touched, the route note says the
> change is additive-only or expand and contract, citing blueprint's guard and
> plan's delta checks by name. No config key.

The four kinds with no owning flow or entity — metric reading, shape change,
incident, not a blueprint gap — print the same line with `n/a` in place of both
values.

Rejected: a lifecycle key in `.config/vwf.yaml` — the stamps and the snapshot
directory are already the record, and a key would be a second copy that drifts.

### 4–6, summarised

- **Feature idea names its unit.** An idea an existing flow or entity can absorb
  → `/vwf:blueprint <unit>`; an idea that implies a goal `product.md` does not
  serve → `/vwf:product <note>` first, then the unit. The unranked-candidate
  deferral stays. Rejected: prose "the normal path" with no unit.
- **Every route ends with the path line** — the remaining commands in one line,
  `then /vwf:plan <slice>` and `then /vwf:execute` — and the hand-off in the
  persist step stays single. Rejected: silence after the hand-off.
- **`/vwf:product` takes a feedback note** — its argument hint now reads
  "feedback note — optional; seeds the update questions"; update mode quotes the
  note in its first question and lets it seed which deltas are asked first;
  create mode ignores it. Nothing else in product changes. Rejected: a new
  product mode; a metric-only argument.

## Why

The user's definition of the same day, verbatim:

> `feedback` is different than `backlog`. `backlog` is something that can't be
> picked up right now, `feedback` is something that is being worked upon and
> might need change in `product`, `blueprint`, `architecture`, etc. It will then
> follow the `plan` and `execute` workflow.

Each gap is one word of that sentence: *architecture* had no route, *being
worked upon* had no build state to show, *follow the plan and execute workflow*
had no named unit or path to follow, and the `product` hand-off carried nothing.
None of it needs feedback to run the chain — the chain already runs itself.

## What stays outside

- **Feedback driving the chain** (ruling 1).
- **A lifecycle key in `.config/vwf.yaml`** (ruling 3).
- **Canvas mode** — untouched.
- **Verify's routes** — they call feedback by kind, and the eighth kind does not
  arise from a verify run.
- **Parked:** a removed registry project leaves an orphaned `p:<slug>:*` group
  nothing flags; product has no create-from-feedback path, so a feature idea on
  a repo with no `product.md` falls through to create mode, which ignores the
  note.
