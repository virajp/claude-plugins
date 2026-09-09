---
type: vwf-change-plan
title: vwf — feedback routes a non-blueprint fix to change-plan, archive
  learns
  folders, the import-* skills are hidden
requires: [ docs/plans/2026-09-10-vwf-pair-hardening ]
---

# Plan — vwf: feedback → change-plan, archive folders, hidden import-* (2026-09-10)

## Status

**APPROVED** 2026-09-10 by the user, after the shape gate and the
post-self-review yes.

## Consent

| Action                                            | Granted                                                                                                                                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                                                       |
| After landing: `mise run plugins:local`           | run                                                                                                                                                                                                       |
| After landing: `/release`                         | ask                                                                                                                                                                                                       |
| Release `vwf` publicly                            | minor — → 19.15.0 (superseding the pair plan's 19.14.1 if that is still unreleased when this runs), by editing `version` in `plugins/vwf/.claude-plugin/plugin.json`, then `mise run plugins:marketplace` |
| Release `stackgen` publicly                       | none                                                                                                                                                                                                      |
| Release installer publicly                        | none                                                                                                                                                                                                      |
| Release site publicly                             | none                                                                                                                                                                                                      |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, `/vwf:feedback` has a route for the report that is not a
blueprint gap — tooling, docs, CI, a refactor — and sends it to
`/vwf:change-plan`; `/vwf:archive` archives a change-plan folder as readily as a
flat cycle plan; the three `vwf:import-*` skills are hidden from the `/` menu
the way `init` is, still reachable by the three commands that call them; and
those callers name the skills by their real spelling.

These are plan 1's Parked items
(`docs/plans/archived/2026-09-08-vwf-change-workflow/index.md`, Parked), plus
one defect the survey found on the way. The `import-*` hiding carries the reason
`init` was hidden on 2026-09-06 — *"too many user invocable skills"* — which the
parked note asked to confirm rather than assume; the user confirmed it. Nothing
is reversed.

## Facts the survey established

**feedback.** The classification table is
`plugins/vwf/skills/feedback/SKILL.md:86-93` (six rows: Behavior bug, Blueprint
hole, Metric reading, UX issue, Feature idea, Incident); the route list is
`:95-138`, one bullet per kind in the same order. `change-plan/SKILL.md:15` is
`disable-model-invocation: false` (feedback's own `:14` too), so a route can
call it today. Two docs already promise this as a future route:
`site/src/content/docs/plugins/vwf.md:758-760` and
`.claude/skills/vwf-plugin/references/skills-and-agents.md:40`.

**archive.** `plugins/vwf/skills/archive/SKILL.md` is flat-file only: `:65-68`
moves `docs/plans/<plan>.md` (+ `<plan>.gap-report.md`); `:33` lists candidates
from `docs/plans/index.md` rows; `:71-74` rewrites the index row; `:55-56` reads
`requires:`/`covers:` from the plan's frontmatter. A folder passed as
`$ARGUMENTS` (`:32`) matches none of that — it misfires, not crashes.
`change-execute/SKILL.md:157-159` archives its own folder at landing and
decision 9 of the 2026-09-08 plan keeps change plans out of
`docs/plans/index.md`, so today nothing routes a change plan through archive.
Manual: `vwf.md:1562-1569` (`### /vwf:archive`), command row `:740`.

**import-*.** Frontmatter today: `import-design-system/SKILL.md:7`,
`import-conversations/SKILL.md:7`, `import-screens/SKILL.md:8` carry
`disable-model-invocation: false` and **no** `user-invocable` key (so they show
in `/`); each carries a "must stay false" note (`:18`/`:19`/`:20`). Callers:
`feedback/SKILL.md:47` (`/vwf:import-conversations <project>`),
`design-system/SKILL.md:128` and `screens/SKILL.md:87` — and those two still say
`/<tool>:<tool>-import-*`, stale against `assets/design-adapter.md:27-29` which
names `/vwf:import-*`. Rule 8 (`scripts/src/check.ts:1079-1147`) checks only the
pack-landed `design-import-*` skills (`stacks/design-tool/<tool>/skills/`),
asserting `disable-model-invocation: false` at `:1133`; it does not touch vwf's
`import-*`, so hiding needs no rule change. Doctrine for the two-key
combination: `init/SKILL.md:18-24`. `skills-and-agents.md:11-13` says "one —
init — is skill-invoked"; the table has no `import-*` rows. The manual's
invocation-policy prose is `vwf.md:755-762`; the import prose `:116-121`; the
command table `:730-743` lists no `/vwf:import-*` rows.

**Docs that describe today's behaviour.** `vwf.md` `### /vwf:design-system`
`:1117`, `### /vwf:screens` `:1336`, `### /vwf:archive` `:1562`,
`### /vwf:feedback` `:1600`; `readme.md:22` (feedback only);
`skills-and-agents.md:11-13,40`; `CLAUDE.md` (the workflow paragraph names
`feedback`).

**Gates.** `plugins:check` (rule 9 asserts the adapter skills' invocation
fields; strict-YAML frontmatter), `plugins:marketplace --check`,
`plugins:inventory --check`, `plugins:npm-normalize-test`, `pnpm vitest run`,
`tsc -p installer`, `tsc -p scripts`, `site:check`. No gate delta: rule 8 is
untouched by design; the hidden combination is the one `init` already passes.

**Versions.** vwf 19.14.0 today; 19.14.1 after the pair plan. This plan's bump
is minor.

## Assumed decisions — confirm or override at review

| # | Decision            | Ruling                                                                                                                                                                                                                                                                                                                                                                                                          | Rejected                                                                                   | Unit |
| - | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| 1 | The seventh route   | feedback's table gains *Not a blueprint gap — tooling, docs, CI, a refactor, a tree the blueprint does not describe* → `/vwf:change-plan <request>`, after Incident in both the table and the route list.                                                                                                                                                                                                       | —                                                                                          | U1   |
| 2 | Archive and folders | **Teach archive folders.** A `docs/plans/<date>-<name>/` whose `index.md` frontmatter is `type: vwf-change-plan` is moved whole to `docs/plans/archived/<date>-<name>/`; `requires:`/`covers:` are read from `index.md`; only the Status line is rewritten (`ARCHIVED <date> — not run` unless it already reads `COMPLETE`); `docs/plans/index.md` is never touched (decision 9 of the 2026-09-08 plan stands). | say it is not archive's job (one refusing paragraph) — the user: *"Teach archive folders"* | U2   |
| 3 | Hiding import-*     | `user-invocable: false` + `disable-model-invocation: false` on all three — the `init` combination: out of the `/` menu, still callable. The "must stay false" notes stay. `skills-and-agents.md`'s "one — init — is skill-invoked" becomes four.                                                                                                                                                                | keep them visible and record why                                                           | U3   |
| 4 | The stale callers   | `design-system/SKILL.md:128` and `screens/SKILL.md:87` name `/vwf:import-design-system` and `/vwf:import-screens`, matching `assets/design-adapter.md:27-29`.                                                                                                                                                                                                                                                   | —                                                                                          | U3   |
| 5 | Rule 8              | Untouched. It asserts the pack-landed `design-import-*` skills only; enforcing `user-invocable: false` on vwf's own `import-*` would be a new assertion nobody asked for.                                                                                                                                                                                                                                       | a rule-9-shaped assertion for the three                                                    | —    |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                                     | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-feedback.md](01-feedback.md)             | `plugins/vwf/skills/feedback/SKILL.md`                                                                                                                                                                                                   | —          | pending |        |
| U2 | 1    | [02-archive.md](02-archive.md)               | `plugins/vwf/skills/archive/**`                                                                                                                                                                                                          | —          | pending |        |
| U3 | 1    | [03-import-skills.md](03-import-skills.md)   | `plugins/vwf/skills/import-design-system/SKILL.md`, `plugins/vwf/skills/import-screens/SKILL.md`, `plugins/vwf/skills/import-conversations/SKILL.md`, `plugins/vwf/skills/design-system/SKILL.md`, `plugins/vwf/skills/screens/SKILL.md` | —          | pending |        |
| U4 | 2    | [04-docs.md](04-docs.md)                     | `site/src/content/docs/plugins/vwf.md`, `site/src/content/docs/how-to/**`, `.claude/skills/vwf-plugin/**`, `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `docs/memory/decisions/**` (none expected)                                       | U1–U3      | pending |        |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md) | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`                                                                                                                                                              | U4         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                     | Why it collides                                                                                                                           | Owner   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json` | the version                                                                                                                               | U5 only |
| `.claude-plugin/marketplace.json`        | generated                                                                                                                                 | U5 only |
| `plugins/vwf/skills/feedback/SKILL.md`   | U1's route and U3's `:47` caller live in one file — U1 owns it; the `:47` line already says `/vwf:import-conversations` and needs nothing | U1 only |
| the docs                                 | docs                                                                                                                                      | U4 only |

## Waves

- **Wave 1 — U1, U2, U3.** Three skill trees, disjoint paths.
- **Wave 2 — U4**, the docs unit.
- **Wave 3 — U5**, the gates-and-bump unit.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `mise run plugins:npm-normalize-test`,
`pnpm vitest run`, `pnpm exec tsc --noEmit -p installer`,
`pnpm exec tsc --noEmit -p scripts`, `mise run site:check` — plus the wave
review, plus every report read for `UNRESOLVED:`. (If
`docs/plans/2026-09-10-repo-task-groups-and-editor-block` has landed first, the
task names are `p:plugins:*` and `p:site:check`; the orchestrator uses whichever
`mise tasks --hidden` lists.) The plan's own checks:

- `grep -c 'user-invocable: false' plugins/vwf/skills/import-*/SKILL.md` → 1
  each.
- `grep -rn '/<tool>:<tool>-import' plugins/vwf/skills` → nothing.

## After landing

| Step                     | Mode | Notes                                                                                                                                            |
| ------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run plugins:local` | run  | stages vwf into the dev marketplace under `19.15.0+N` and updates this machine's install; publishes nothing; a **restarted** session picks it up |
| `/release`               | ask  | cuts `vwf-v19.15.0`; reaches every user of the marketplace                                                                                       |

## Gates the orchestrator keeps

- In a **restarted** session after `plugins:local`: the `/` menu lists no
  `vwf:import-*` entry, and `/vwf:design-system`'s adapter step still reaches
  `vwf:import-design-system` (a dry read of the skill is enough — no design tool
  call). Reported, not gated on, if the session cannot be restarted in the run.
- No `target-verifier` run: no manifest or agent change; the skill set is
  unchanged in count.

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

- **Rule 8** — decision 5.
- **Listing change plans in `docs/plans/index.md`** — decision 9 of the
  2026-09-08 plan stands; archive never writes that file for a folder.
- **A mermaid node for the ad-hoc pair** — declined on 2026-09-08.
- **This repo's own `/vwf:setup`** — still "not yet applicable".

## Parked

none

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

Run in a fresh session, after `docs/plans/2026-09-10-vwf-pair-hardening` reads
`COMPLETE`:

/vwf:change-execute docs/plans/2026-09-10-vwf-feedback-archive-import
