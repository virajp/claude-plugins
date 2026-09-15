# Decision — architecture decides, setup pins: five consumer gaps closed

**Date** 2026-09-13 · **Branch** `2026-09-13-consumer-gaps` · **Plan**
[`docs/plans/2026-09-13-consumer-gaps/`](../../plans/2026-09-13-consumer-gaps/index.md)
· **Reverses** `plugins/vwf/assets/stack-adapter.md`'s
materialization-at-pin-time rule and
`plugins/vwf/skills/architecture/references/stack-menu.md`'s placement of it
inside `/vwf:architecture`; and `plugins/vwf/assets/vwf-config.md`'s
*"`unresolved` only ever arrives from an `/vwf:architecture` run"* together with
`plugins/vwf/skills/setup/references/onboard-pipeline.md`'s *"setup never writes
`unresolved`"* · **Umbrella**
[`2026-09-13-init-walks-the-members.md`](./2026-09-13-init-walks-the-members.md)

## What prompted it

A real multi-repo Flutter product — 95octane — ran `/vwf:setup` → `/vwf:product`
→ `/vwf:architecture` on 2026-09-13 and surfaced five defects in one sitting.
None of them was the consumer's own drift; each was a plugin gap the consumer
had no way to work around.

## The user's model

Quoted, because the whole shape of this change follows from it:

> setup is responsible for pinning the stack to respective repos; setup is NOT
> responsible to decide the stack, that responsibility is with architecture;
> setup will run before architecture as well as after (this must be programmed),
> so the decision of stack and pinning are covered.

## The three reversals

1. **Materialization moves from architecture to setup.**
   `plugins/vwf/assets/stack-adapter.md:305-309` ("Materialization itself
   happens once, interactively, when the pin is first made") and
   `plugins/vwf/skills/architecture/references/stack-menu.md:124-129` place it
   at pin time inside `/vwf:architecture`. Now `/vwf:setup` owns it, as a
   materialize pass that runs on every setup run; architecture only records the
   decision and invokes setup at its end.
2. **Setup writes `unresolved`.** `plugins/vwf/assets/vwf-config.md:165`
   ("**`unresolved` only ever arrives from an `/vwf:architecture` run** … No
   migration writes it") and
   `plugins/vwf/skills/setup/references/onboard-pipeline.md:72-77` ("setup never
   writes `unresolved` … An axis setup could not settle is left absent") are
   reversed for one case: an **absent** project axis on a repo architecture has
   not run on. A pinned slug is never rewritten.
3. **The landing consent rule.** Memory records that merge to develop, push and
   release each need explicit in-the-moment consent. The user chose an
   unattended landing for this plan. Recorded as a one-plan override, not as a
   change to the rule.

## The five gaps, and what changed

**Gap 1 — `auto` is a platform the Flutter template covers.** The
`app-framework/flutter` pack went `0.2.0` → `0.3.0` declaring a fifth platform,
the `dart-flutter` bundle re-pinned it and widened its own list, and vwf's
platform vocabulary, the registry template and every "four platforms" passage
across both plugins moved to five. `auto` is **not** a fifth build target: the
in-car surface is the *same mobile binary* reaching CarPlay and Android Auto
through the `swift` and `kotlin` `platform-edge` languages the pack already
declared, so it is only ever declared **alongside** `mobile`, never alone and
never as its own project. That rule is prose in two places — the bundle body,
which says *why*, and vwf's `platforms.md` vocabulary — and deliberately **not**
a doctor predicate, which would put a stackgen-specific rule in a stack-agnostic
checker.

**Gap 2 — every commit message a vwf skill writes passes the commit gate.** The
pre-commit pack's `git-conventional-commits.yaml` allows ten types and no more;
`blueprint(...)` failed on type everywhere and `docs(<scope>):` would fail on
scope the moment `init` filled `commitScopes` with registry project ids. Ten
skills moved to **bare** prefixes — `docs:` for every blueprint-tree commit,
`ops:` where `chore(vwf):` stood — and the two "Common types" lists became the
pack's ten verbatim. No `init` change and no `config_format` bump: no key
changed shape.

**Gap 3 — the reviewer accepts `—` on an `untested` row.** The
`product-reviewer`'s validation item read as if every row needed Evidence; the
source rule requires it only once status *leaves* `untested`. That item and
three invertible `blueprint-reviewer` items were rewritten **trigger-first**,
each stating the non-gap case explicitly, with no change in meaning.

**Gap 4 — the stack-template contract carries its target repo.** The invocation
argument stays `<slug>`; the target repo travels as one optional `repo: <path>`
line beside the principles-catalog paths, in the same payload style — the
member's `path` relative to the base root, resolved as the member whose
`projects:` list holds the project, absent meaning the current repo. stackgen
documents receiving it, the materializer writes there and keeps **that** repo's
lockfile, and every vwf caller passes it under `multi-repo`, where the
conventions fetch dedupes per (plugin, repo, slug). A second positional argument
was rejected so a caller that knows nothing about repos keeps working.

**Gap 5 — the axis states and the two-pass.** `/vwf:setup` gained a
**materialize pass** (`skills/setup/references/materialize.md`), running once
per run in **every** mode — `current` included, since a repo architecture just
wrote pins into resolves to exactly that mode. It groups the axes holding a slug
the target repo's lockfile does not name, dedupes by slug per repo, and invokes
the adapter once per `(repo, slug)` in registry order; each landing sits behind
the adapter's own consent line. An `unresolved` axis is skipped silently; an
**absent** one is written `unresolved` and the run continues. `/vwf:doctor`
gained a distinct finding, **pinned, not materialized — `/vwf:setup`
materializes it**: one row per project, still **blocking** ("the severity
follows the pin, never the calendar"), reached only after a declined landing or
on a repo setup has not re-run on — which is the exact state 95octane was in,
its pins predating materialization and doctor reading its languages as unknown.

## Rejected

Every alternative the plan's assumed-decisions table weighed and turned down:

| Decision                               | Rejected                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| Flutter pack version                   | patch — a widened platform list is a wider contract, which reads as minor                |
| Where the `auto` pairing rule lives    | a doctor predicate; bundle-only                                                          |
| The commit convention vwf adopts       | `init` fills a fixed `blueprint` scope; `init` fills per-doc scopes                      |
| Reviewer wording                       | `product-reviewer` only                                                                  |
| How the target repo travels            | a second positional argument; passing it only under `siblings`                           |
| Batching                               | one landing per repo — a stackgen landing-rule and consent-shape change nobody asked for |
| Where setup's materialize pass lives   | inline in `SKILL.md`; continue past a decline with a warning                             |
| Architecture's handoff                 | print `/vwf:setup` as the next command and stop                                          |
| What setup writes on an undecided axis | rewrite the stale pin to `unresolved` with the old slug in `note:`                       |
| Doctor's new finding                   | downgrade to a degradation until architecture has run                                    |

## What stays outside

- **The consumer's own drift** — 95octane's trimmed
  `.config/git-conventional-commits.yaml`, its diverged `setup/ai` task, its
  astro advisory. Named in the request as not plugin gaps;
  `/stackgen:stackgen-sync`'s business.
- **Per-repo batching in stackgen.** The per-slug landing rule is unchanged: one
  landing set, one commit, per slug.
- **A `config_format` bump.** No key changed shape.
- **A separate `auto` bundle.** The request forbids it; `auto` rides the Flutter
  template.
- **The landing consent override is one-plan-only.** The standing rule is
  unchanged and the override expires with this plan.

### Parked

- **Plan 2 — the elicitation redesign** (`requires:` this plan): ask high-level
  questions and derive the rest (public/private → licence, forge → CI system,
  language + repo type → the bundle filter); **`not-applicable`** as a fourth
  axis state on every axis, set and lifted by architecture only; the secrets
  provider as a recorded per-repo axis, which is the `config_format` 19 bump;
  and whether to **keep or retire stackgen's generate-for-anything-uncovered
  path** — a reversal candidate of
  [`2026-08-19-stackgen-dispatch-and-agents-tree.md`](./2026-08-19-stackgen-dispatch-and-agents-tree.md),
  the user's stated lean being retire.
- **`vwf-config.md:51,89,108` say "format 19"** meaning the blueprint line — a
  wording bug beside the files this plan touched, untouched here.
- **`format-check.md` compares only `blueprint_format`** though
  `format-lineage.md` says it compares both stamps.
- **This repo's own root convention file** is a six-type hand-written variant,
  already parked as "plan 2 reshapes claude-plugins".
- **Doctor predicates for `MERGE_MODEL` and `MEMBERS` drift** — carried from the
  task-library plan.
