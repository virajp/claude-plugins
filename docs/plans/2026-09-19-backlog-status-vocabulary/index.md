---
type: vwf-change-plan
title: backlog status vocabulary — the Team planning template's real options,
  and a next-id floor that continues a migrated numbering
requires: []
backlog: []
---

# Plan — backlog status vocabulary — the Team planning template's real options, and a next-id floor that continues a migrated numbering (2026-09-19)

## Status

**APPROVED**

APPROVED 2026-09-19 by the user

## Consent

| Action                                                    | Granted                                                                                                                |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green         | yes                                                                                                                    |
| After landing: `mise run p:plugins:local`                 | run                                                                                                                    |
| After landing: `/vwf:backlog list` in a restarted session | ask                                                                                                                    |
| Release vwf publicly                                      | patch — `19.34.0` → `19.34.1`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json`; no release step, the tag waits |
| Release site publicly                                     | patch — `1.1.27` → `1.1.28`, `mise run p:site:version`; no release step, the tag waits                                 |
| Release installer publicly                                | none — untouched                                                                                                       |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, `/vwf:backlog` reads and writes the Status options the Team
planning template actually ships — `Backlog`, `In progress`, `Done` — plus its
own `Closed`, and its bootstrap trims the template's two other options, `Ready`
and `In review`, off the field so the vocabulary is exactly those four. A fresh
project's first id continues from the highest `Bnn` any plan folder's `backlog:`
list names, so a backlog migrated from the retired `docs/backlog.md` never
restarts at `B01`.

The framing: the 2026-09-18 plan that moved the backlog onto a GitHub Project
recorded the template as shipping `Todo / In Progress / Done` (its decision 5)
from a stale survey fact; the first real run against project #2 found
`Backlog / Ready / In progress / In review / Done`, so `add` had no `Todo` to
set. The same run found the reference's "an empty project starts at `B01`"
contradicting the plan's own intent that B12 be re-added with its number. Not a
reversal — a factual correction of one ruling and one rule.

## Facts the survey established

**The skill.** `plugins/vwf/skills/backlog/SKILL.md` — the field table `:75`
(`Status` = `Todo` → `In Progress` → `Done`, or `Closed`), the old-vocabulary
translation `:79`, the two body-line statuses `:83-84`, the bootstrap paragraph
`:87-88`, `add` setting `Todo` `:107-109`, `next` naming the top `Todo` `:128`,
`planned` `:144-146`, `done` `:151`, the never-does list's id rule `:187-188`.
`references/github.md` — option ids read `:78`, the bootstrap mutation's inlined
option list `:108-109` (`Todo`, `In Progress`), the next-id rule `:172-176` ("An
empty project starts at `B01`"), `add` `:190`, the status edits `:205-206`.

**The template, as it stands.** Project #2 (`claude-plugins` under `virajp`,
created 2026-09-18 from Team planning) shipped Status
`Backlog / Ready / In progress / In review / Done` with colours
`GREEN / BLUE / YELLOW / PURPLE / ORANGE` and a description each; the 2026-09-18
bootstrap added `Closed` (`GRAY`) by replacing the list and created the `Group`
text field. `updateProjectV2Field` **replaces** the option list: every option
not sent back is deleted, and an item sitting in a deleted option loses its
Status value. Replacing the list also reissues every option id, so ids are read
after the mutation, never before. Today every item on project #2 is `Backlog` or
`Done`.

**The callers.** `change-plan`, `plan`, `execute`, `plan-management`,
`feedback`, `doctor` name no Status option literally;
`plan-management/SKILL.md:256` uses "In Progress" as generic prose — parked, not
falsified.

**Repo docs and the site.**
`.claude/skills/vwf-plugin/references/skills-and-agents.md:45` (the backlog row:
"statuses `Todo` → `In Progress` → `Done`, or `Closed`");
`site/src/content/docs/plugins/vwf.md:2435` (a code-sample comment, "the top
Todo item"), `:2467-2468` (the Status sentence), `:2489` (`next` names the top
`Todo`). `readme.md` names no option.
`docs/memory/decisions/2026-09-18-backlog-on-github-projects.md:73` records the
wrong mapping as the ruling of its day — historical, never edited.

**Ids in the plan folders.** Every `backlog:` list under `docs/plans/archived/`
names B01–B11 between them (`[ B01, B02, B03 ]`, `[ B04 ]`, `[ B05 ]`,
`[ B06 ]`, `[ B07, B08 ]`, `[ B09 ]`, `[ B10 ]`, `[ B11 ]` twice); the live
`docs/plans/` holds none. Prose in those folders mentions B13–B16 as well — body
text, not frontmatter, and not to be counted.

**Gates.** Pre-commit runs `format`, `lint`, `sec`, `npm-normalize-hook-test`,
`plugins-marketplace`, `plugins-inventory`, `plugins-check`,
`plugins-shellcheck` and the standard hooks. `p:site:check` is the site's gate,
in neither pre-commit nor `plugins.yml`; it is a wave-gate line because `vwf.md`
changes. `plugins/**/*.md` is not dprint-formatted — match the fold width by
hand; `.claude/**`, `site/**` and `docs/**` markdown are.

**Commit convention.** `.config/git-conventional-commits.yaml` allows `ops`,
`docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.

**Versions.** `plugins/vwf/.claude-plugin/plugin.json` reads `19.34.0`, bumped
by hand; `mise run p:plugins:marketplace` regenerates
`.claude-plugin/marketplace.json` from it. `site/package.json` reads `1.1.27`,
bumped by bare `mise run p:site:version` (patch is the default; it refuses a
dirty tree). Neither target reaches a `13` or `17` component.

**The plan index** is empty of rows — this plan requires nothing and its
priority is `10`.

## Assumed decisions — confirm or override at review

| # | Decision          | Ruling                                                                                                                                                                                                                                                                                                                                                                                           | Rejected                                                                             | Unit |
| - | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ---- |
| 1 | Vocabulary        | `open` → `Backlog`, `planned` → `In progress` (lower-case p, as the template spells it), `done` → `Done`, `closed` → `Closed`. The bootstrap replaces the Status option list with exactly those four — `Backlog`, `In progress` and `Done` sent back with the colour and description read from the field, `Closed` as `GRAY` / "Dropped without a plan" — so `Ready` and `In review` are removed | keep `Ready` / `In review` as board-only states `next` prefers; ignore them entirely | U1   |
| 2 | Trim safety       | Before the replacing mutation, the bootstrap lists the items whose Status is `Ready` or `In review`; when any exist it stops, names each item and its state, asks the user to move them to `Backlog` or `In progress` on the board, and the verb is re-run. It never moves an item itself                                                                                                        | move `Ready` → `Backlog` and `In review` → `In progress` automatically, then trim    | U1   |
| 3 | Next-id floor     | The next id is one past the highest number over two sources: every item title in the project, and every id in the `backlog:` frontmatter list of every plan folder under `docs/plans/` and `docs/plans/archived/` in the base repo — frontmatter lists only, never prose. `B01` only when both sources are empty. An id spent by a retired file store is therefore never reissued                | ask for a starting number on an empty project; a constant floor in the skill         | U1   |
| 4 | Idempotence       | The bootstrap mutates the Status field only when its option list is not exactly `Backlog`, `In progress`, `Done`, `Closed` (order ignored); `Group` is created only when absent. Option ids are read from `field-list` after any mutation, since a replace reissues them                                                                                                                         | —                                                                                    | U1   |
| 5 | The decision docs | `docs/memory/decisions/2026-09-18-backlog-on-github-projects.md` stays as written — a record of its day. A new `docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md` records the correction: what the template really ships, the four-option vocabulary, the trim, and the next-id floor, citing the 2026-09-18 doc's ruling 5 as what it corrects                                     | edit the old doc in place                                                            | U2   |
| 6 | Review row        | None — nothing runnable lands; the wave review is the check                                                                                                                                                                                                                                                                                                                                      | —                                                                                    | —    |

## New dependencies

None.

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                              | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-skill.md](01-skill.md)                   | edit | `plugins/vwf/skills/backlog/SKILL.md`, `plugins/vwf/skills/backlog/references/github.md`                                                                                          | —          | pending |        |
| U2 | 2    | [02-docs.md](02-docs.md)                     | edit | `.claude/skills/vwf-plugin/references/skills-and-agents.md`, `site/src/content/docs/plugins/vwf.md`, `docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md`, `readme.md` | U1         | pending |        |
| U3 | 3    | [03-gates-and-bump.md](03-gates-and-bump.md) | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`                                                                                  | U2         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                   | Why it collides                | Owner   |
| ------------------------------------------------------ | ------------------------------ | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`               | the version                    | U3 only |
| `.claude-plugin/marketplace.json`                      | generated from the manifest    | U3 only |
| `site/package.json`                                    | the site version               | U3 only |
| `readme.md`, `.claude/**`, `site/**`, `docs/memory/**` | human-facing docs              | U2 only |
| `plugins/vwf/skills/backlog/**`                        | U2 cites it; only U1 writes it | U1 only |

## Waves

- **Wave 1 — U1 alone.** Rewrites the vocabulary, the bootstrap and the next-id
  rule in the skill and its reference.
- **Wave 2 — U2.** The repo docs, the site, the new decision doc; runs docs-sync
  over wave 1.
- **Wave 3 — U3.** The two bumps, the generator, the full gate.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                                       | Mode | Notes                                                                                                                                                                                                                                                                          |
| ------------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local`                 | run  | stages vwf at `19.34.1+N` into the dev marketplace and updates this machine's install; publishes nothing, cuts no tag; a **restarted** session loads it                                                                                                                        |
| `/vwf:backlog list` in a restarted session | ask  | the first verb against project #2 on the new skill: its bootstrap reads the Status field, finds `Ready` and `In review`, checks no item sits in them, and trims the field to the four options; `list` then prints the table under the new vocabulary — the proof of the change |

## Gates the orchestrator keeps

none beyond the wave gate — the after-landing `ask` step is the first real
exercise against a project, and the run touches GitHub nowhere.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` outside its Owns. No unit runs `gh` against GitHub — the run is offline
with respect to the forge.

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

- **Using `Ready` and `In review`** — declined (decision 1); the field is
  trimmed to the skill's four.
- **Auto-moving items out of a trimmed option** — declined (decision 2).
- **Editing the 2026-09-18 decision doc** — declined (decision 5); history.
- **A release** — both bumps are recorded; the tags wait for a later `/release`.
- **The GitLab backend** — still parked from the 2026-09-18 plan.

## Parked

- `plugins/vwf/skills/plan-management/SKILL.md:256` reads "an item `In Progress`
  forever" as generic prose, not an option name; restyle to `In progress` next
  time that file is touched.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-19-backlog-status-vocabulary

or let the queue pick it, by priority:

/vwf:execute next
