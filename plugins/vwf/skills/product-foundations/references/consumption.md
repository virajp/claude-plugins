# How the workflow consumes this

`/vwf:architecture` walks the checklist as part of its cross-cutting elicitation.
It records the selection as a `cross_cutting` token. `/vwf:blueprint` expands
accepted ones into the canonical contract in `conventions.md`, plus the
per-entity surfaces each reference names.

## `/vwf:architecture` (step 3c)

Walk the checklist.

For each **elective** foundation:

1. Present the default in one line.
2. Ask via MCQ: **accept the default / adapt it / not applicable**.
3. Record the selection as a `cross_cutting` token, such as
   `audit: privileged-destructive` or `notifications: [push, email]`.
4. Omit a not-applicable answer from the registry. That omission *is* the record.

For each **core** foundation, the MCQ offers **accept the default / adapt it /
defer — not production-bound**:

- A core foundation has no "not applicable". A product with no reliability target
  or no DR posture is not a claim vwf lets stand silently.
- A deferral records a registry token `<foundation>: deferred-preprod`, such as
  `reliability: deferred-preprod`, and never an omission. Omission stays the
  record only for electives.

## `/vwf:plan` (production-bound slice) and `/vwf:verify production`

Treat any `deferred-preprod` core token still on the registry as a **blocking**
finding. The product is shipping to customers on a foundation it explicitly said
was not ready.

## `/vwf:blueprint`

For each accepted (or deferred) foundation:

1. Expand the contract into `conventions.md` under its anchor on first touch. The
   reference names the anchor.
2. Elicit the per-flow surface as flows are authored:
   - audit markers on the flow's Trigger & Actors rows and steps for
     privileged/destructive actions
   - notification triggers
   - sync/async classification and placement (the flow's Background Jobs table)
   - settings reads

Flow and entity docs link the anchors. They never restate the contract.

## `/vwf:plan` and `execute`

Consume the contracts like any other conventions anchor. The change-logs
reference also hooks execute's docs-sync step.

## No new sections

Foundations expand into **existing** blueprint structures: conventions anchors,
flow Trigger & Actors, Background Jobs, flow steps. They add no new mandatory doc
sections, so a product that defers or skips a foundation is not in format drift.
