---
type: vwf-change-plan
title: Plan all before execute
requires: [ docs/plans/2026-10-08-release-levels-recorded ]
backlog: [ B93 ]
backlog_pieces: []
---

# Plan — Plan all before execute (2026-10-09)

## Status

**APPROVED**

APPROVED 2026-10-09 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| End an `all` run after landing                    | no      |

This plan has the folder shape of `2026-10-08-release-levels-recorded`: no
`Release` Consent rows, a `## Release levels` section, and a gates unit that
bumps nothing. The End an `all` run row is `no`: the executor does not use the
planner, handoff or recall skills.

## Release levels

| Project | Level | Reason                                                                      |
| ------- | ----- | --------------------------------------------------------------------------- |
| vwf     | MINOR | new behaviour: a `backlog unplanned` verb, and the planners end differently |
| site    | PATCH | the manual pages describe the new ending; the site gets no new feature      |

## Goal

A planner recommends `/vwf:execute` only when no open backlog item at the check
priority is unplanned. Until then, each hand-off ends with the next item to
plan. The rule is backlog item B93: "Always finish planning all the items before
recommending to execute."

**Reversals of skill rulings** (confirmed by the user on 2026-10-09):

1. `/vwf:plan` printed "the launch line … once per folder"
   (`plugins/vwf/skills/plan/SKILL.md:515-517`), and its *Approve only* choice
   in the middle of a chain still printed it (`:364-367`). Now the launch block
   prints once, after the last element, and only when the check finds no
   unplanned item.
2. `/vwf:change-plan` §8 ended every piece "with exactly this" launch block
   (`plugins/vwf/skills/change-plan/SKILL.md:364-377`). Now the ending depends
   on the check.

## Facts the survey established

- Places that print an execute launch line or recommend execute:
  - `plugins/vwf/skills/change-plan/SKILL.md:364-377` (§8, "end with exactly
    this", `:330`); §2 split at `:113-120` has no rule on when to hand off and
    no loop back to §3 for the next piece.
  - `plugins/vwf/skills/plan/SKILL.md:496-509` (§8 block), `:515-517`
    (mid-chain, once per folder), `:364-367` (§6 *Approve & plan next* /
    *Approve only*); the chain is resolved at `:95-136` and planned per element
    at `:211-212`.
  - `plugins/vwf/assets/templates/plan-folder.md:277-293` (the `## Launch`
    section in every `index.md`).
  - `plugins/vwf/skills/handoff/SKILL.md:123-135` and
    `plugins/vwf/assets/templates/handoff.md:36`, `:46-51` (the Next prompt and
    next steps).
  - `plugins/vwf/skills/recall/SKILL.md:131-140` (prints a handoff's execute
    launch line).
  - `plugins/vwf/skills/feedback/SKILL.md:210-211` (the change-plan route ends
    with `/vwf:execute <folder>` or `all`).
  - Not affected: `backlog` `next` (recommends a planner,
    `plugins/vwf/skills/backlog/SKILL.md:154-164`), `execute`'s chain-forward
    and resume lines (already-planned rows), `plan-management next`,
    `project-claude.md`'s static order line.
- The backlog's GitHub reference
  (`plugins/vwf/skills/backlog/references/github.md`) holds a `--jq` filter for
  each verb since B97 (`fix: backlog parses gh output with jq only`), including
  the `next` candidates filter; its Parsing rule forbids any parser but
  `--jq`/`jq`.
- Status values: `Backlog`, `In progress`, `Partially done`, `Done`, `Closed`;
  priorities `P0`, `P1`, `P2`. An item with a pending plan ends its body with
  `Planned in: <folder>[, …]`.
- Site docs that describe the hand-off: `site/src/content/docs/plugins/vwf.md`
  (mental model `:299`, `:313`, `:330-331`, `:376-379`, `:390-393`; commands
  table `:857-858`, `:864`, `:876-877`; `#vwfplan` `:2452-2478`; `#vwfexecute`
  `:2494`; `#vwfbacklog` `:3078`; `#vwfchange-plan` `:3246-3247`, `:3327-3328`,
  `:3335`; worked example `:3665`, `:3680`),
  `site/src/content/docs/how-to/operate/ad-hoc-change.md` (`:95-98`, `:143`,
  `:173`, `:177-201`, `:339-343`). `CLAUDE.md`'s "Where the detail lives"
  paragraph describes the planners' hand-off.
- `2026-10-08-release-levels-recorded` (U2, U3) owns `change-plan/SKILL.md` and
  `plan/SKILL.md`; this plan requires it, so it edits the landed text.
- Commit types allowed: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`, no
  scopes.

## Assumed decisions — confirm or override at review

| #  | Decision       | Ruling                                                                                                                                                                                                                                                                                        | Rejected                                     | Unit   |
| -- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------ |
| H1 | Scope          | The scope is every item at the same priority                                                                                                                                                                                                                                                  | the session's request; the whole backlog     | U1–U4  |
| H2 | Definitions    | An **open** item is `Backlog`, `In progress` or `Partially done`. An **unplanned** item is `Backlog`, or `Partially done` with no `Planned in:` line. The **check priority** is the highest priority among the plan's backlog ids, or, with no id, the highest priority that has an open item | —                                            | U1–U4  |
| H3 | Ending         | When the check finds unplanned items, the planner omits the launch block. It prints those items and the command for the next one (`/vwf:change-plan <item>` or `/vwf:plan <slice>`). `/vwf:execute` does not change, and the user can still run it                                            | block execute; a launch block with a warning | U2, U3 |
| H4 | The verb       | A new read-only verb, `/vwf:backlog unplanned [priority]`, lists the unplanned items at a priority (by default, the top open priority). Its `--jq` filter goes in `github.md`. If the backlog is unreadable, the verb says so, and the planner prints the launch block as today               | inline checks in each planner                | U1     |
| H5 | Chains         | Within a chain or a split, the check also counts the unplanned elements of the session's own request: the launch block prints only after the last element. "Approve only" in the middle of a chain ends with the next element's command                                                       | a launch block for each folder               | U2, U3 |
| H6 | Other skills   | `handoff`: the Next prompt is not `/vwf:execute …` while the check finds unplanned items. `recall` checks again before it prints a handoff's execute line. `feedback`'s change-plan route points to the planner's own ending                                                                  | —                                            | U4     |
| H7 | Launch section | The `## Launch` section of the plan-folder template stays as it is: it describes how to run the folder, and it is not a recommendation                                                                                                                                                        | make it conditional                          | —      |
| H8 | Review         | No review row: prose only                                                                                                                                                                                                                                                                     | —                                            | —      |

## New dependencies

none

## Units

| Id | Wave | Unit file                              | Kind | Owns                                                                                                                                                                                             | Depends on     | Status  | Commit |
| -- | ---- | -------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------- | ------ |
| U1 | 1    | [01-backlog.md](01-backlog.md)         | edit | `plugins/vwf/skills/backlog/SKILL.md`, `plugins/vwf/skills/backlog/references/github.md`                                                                                                         | —              | pending |        |
| U2 | 1    | [02-change-plan.md](02-change-plan.md) | edit | `plugins/vwf/skills/change-plan/SKILL.md`                                                                                                                                                        | —              | pending |        |
| U3 | 1    | [03-plan.md](03-plan.md)               | edit | `plugins/vwf/skills/plan/SKILL.md`                                                                                                                                                               | —              | pending |        |
| U4 | 1    | [04-handoff.md](04-handoff.md)         | edit | `plugins/vwf/skills/handoff/SKILL.md`, `plugins/vwf/assets/templates/handoff.md`, `plugins/vwf/skills/recall/SKILL.md`, `plugins/vwf/skills/feedback/SKILL.md`                                   | —              | pending |        |
| U5 | 2    | [05-docs.md](05-docs.md)               | edit | `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`, `CLAUDE.md`, `docs/memory/decisions/2026-10-09-plan-all-before-execute.md`, and any other human-facing passage `vwf:docs-sync` finds | U1, U2, U3, U4 | pending |        |
| U6 | 3    | [06-gates.md](06-gates.md)             | edit | —                                                                                                                                                                                                | U5             | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                      | Why it collides                             | Owner            |
| ------------------------------------------------------------------------- | ------------------------------------------- | ---------------- |
| `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | version files and a generated file; no bump | nobody — never   |
| `.config/releases.yaml`                                                   | written by `/vwf:execute` at landing        | nobody in a unit |
| the human-facing docs                                                     | n units editing one doc                     | U5 only          |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Separate files. U2–U4 name the verb
  `/vwf:backlog unplanned [priority]` and the H2 definitions exactly as quoted
  here, so no unit waits for U1's text.
- **Wave 2 — U5.** Docs.
- **Wave 3 — U6.** Gates.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
pnpm exec tsc --noEmit -p scripts
mise run code:precommit
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                                                                                      |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf into the dev marketplace; a restarted session loads it. Publishes nothing. If `.config/vwf.yaml`'s `after_landing:` also lists it, it runs once |

## Gates the orchestrator keeps

- After U1: run the new `unplanned` filter from `github.md` against the real
  project (`gh project item-list 2 --owner virajp …`) once. Pass: it prints the
  unplanned items at the top open priority, one per line, and nothing else.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc outside its Owns, never adds a dependency this file
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Blocking `/vwf:execute` itself while items are unplanned (H3: rejected).
- The `## Launch` section of the plan-folder template (H7).

## Parked

none

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-09-plan-all-before-execute

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
