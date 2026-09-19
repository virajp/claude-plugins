---
type: vwf-change-plan
title: backlog trim preserves Status — snapshot every item before the replace
  mutation, restore it after
requires: []
backlog: []
---

# Plan — backlog trim preserves Status — snapshot every item before the replace mutation, restore it after (2026-09-19)

## Status

**APPROVED**

APPROVED 2026-09-19 by the user

## Consent

| Action                                            | Granted                                                                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                    |
| After landing: `mise run p:plugins:local`         | run                                                                                                                    |
| Release vwf publicly                              | patch — `19.34.1` → `19.34.2`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json`; no release step, the tag waits |
| Release site publicly                             | patch — `1.1.28` → `1.1.29`, `mise run p:site:version`; no release step, the tag waits                                 |
| Release installer publicly                        | none — untouched                                                                                                       |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, `/vwf:backlog`'s bootstrap can trim a project's `Status` field
on a project whose items already carry a Status without losing any of them: it
snapshots every item's Status to a temp file before the replace mutation and
writes each one back, by option name, from the option ids re-read after it.

The framing: the 2026-09-19 plan `backlog-status-vocabulary` guarded the trim
with one check — stop while any item sits in `Ready` or `In review`, the two
options the trim removes (its decision 2) — and its reference said "step 2 is
what makes it safe". The first real run, on project #2 that same day, found no
such item, ran the mutation, and every one of the 40 items lost its Status:
`updateProjectV2Field` reissues **every** option's id, kept names included, and
an item's value is bound to the old id. The statuses were reconstructed from
each item's body (`Evidence:` tail → `Done`, else `Backlog`) and the project's
raw dump was committed under `docs/memory/backlog/`. This plan corrects the
procedure; the stop for the two removed options stays, since an item in one has
nowhere to be restored to. A correction, not a reversal.

## Facts the survey established

**The skill.** `plugins/vwf/skills/backlog/SKILL.md` — the bootstrap paragraph
`:87-96` (the trim `:89-92`; "the trim is a replace … would lose its Status …
never moves an item itself" `:92-96`; "the reference specifies the procedure and
both mutations" `:96`); the `close` verb's "adding the option to the field first
when it is absent" `:163-164`. `references/github.md` — the Bootstrap section
`:84-176`: step 1 field-list `:90-91`, step 2 the `Ready`/`In review` item-list
stop `:92-101`, step 3 the colour query `:102-114`, step 4 the four-entry
replace mutation `:115-139` ending "Every option not sent … is deleted; that is
the point of the trim, and step 2 is what makes it safe" `:137-139`, step 5 the
field-list re-read `:140-141`; the Items section `:177-212` — `item-list` keys
`:181-186` (`id` the `PVTI_…` item id, `content`, one lower-case key per
populated field including `status`); the per-verb Status edit
`item-edit --id … --field-id <status-field-id> --single-select-option-id`
`:225-226`.

**The API, as observed on project #2 (2026-09-19).** Before the mutation the
field carried six options (`Backlog`, `Ready`, `In progress`, `In review`,
`Done`, `Closed`) with ids `e68ff844 … 9733462a`; after the four-option replace
the field carried four options with **new** ids (`5f3193f2`, `46a295f8`,
`74f5fe9f`, `d2700806`), and `item-list` returned no `status` key for any of the
40 items — `priority` and `group` untouched. Restoring was one
`item-edit --single-select-option-id` per item against the new ids; 40 calls, no
failures.

**Repo docs and the site.**
`.claude/skills/vwf-plugin/references/skills-and-agents.md:45` (the backlog row:
"trims the template's Status field of its Ready and In review options (stopping
while any item sits in one, naming it, never moving it)");
`site/src/content/docs/plugins/vwf.md` under `### /vwf:backlog` (`:2419`):
`:2472-2478` — "The trim removes an item's Status along with the option, so
while any item sits in Ready or In review the skill stops …". `readme.md` and
`CLAUDE.md` name the bootstrap nowhere.
`docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md` records the
trim-safety ruling at `:51-56` — historical, never edited; its headings
(`What
prompted it`, `What changed`, `The rulings, with what each rejected`,
`What it
corrects`, `Consequences for a user`, `What stays outside`) are the
shape a new decision doc takes.

**The backup.** `docs/memory/backlog/2026-09-19-project-2-items.json` and
`…-fields.json` — the project's raw `item-list` and `field-list` after the wipe,
committed at `e4a1c2d4`. Not edited by this plan.

**Gates.** Pre-commit runs `format`, `lint`, `sec`, `npm-normalize-hook-test`,
`plugins-marketplace`, `plugins-inventory`, `plugins-check`,
`plugins-shellcheck` and the standard hooks. `p:site:check` is the site's gate,
a wave-gate line because `vwf.md` changes. `plugins/**/*.md` is not
dprint-formatted — match the fold width by hand; `.claude/**`, `site/**` and
`docs/**` markdown are.

**Commit convention.** `.config/git-conventional-commits.yaml` allows `ops`,
`docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.

**Versions.** `plugins/vwf/.claude-plugin/plugin.json` reads `19.34.1`, bumped
by hand; `mise run p:plugins:marketplace` regenerates
`.claude-plugin/marketplace.json` from it. `site/package.json` reads `1.1.28`,
bumped by bare `mise run p:site:version` (patch is the default; it refuses a
dirty tree). Neither target reaches a `13` or `17` component.

**The plan index** is empty of rows — this plan requires nothing and its
priority is `10`.

## Assumed decisions — confirm or override at review

| # | Decision          | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Rejected                                                                     | Unit |
| - | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---- |
| 1 | Snapshot, restore | The bootstrap's Status steps run in this order: (1) field-list — exactly the four, skip to `Group`; (2) item-list filtered to `Ready`/`In review` — any, stop as today; (3) **snapshot** — item-list, every item that has a `status` key, written as `<item-id>\t<status>` lines to a `mktemp` file, its path printed before the mutation; (4) the colour/description query; (5) the four-option replace mutation; (6) field-list re-read for the new option ids; (7) **restore** — for each snapshot line, `item-edit --single-select-option-id` with the new id of that name, one call per item; print the count restored. Any failed `item-edit` stops the verb naming the item and the snapshot path — the field is never left half-restored silently. An item with no `status` key is skipped on both sides | snapshot held in memory only; refuse to trim while any item carries a Status | U1   |
| 2 | The hazard, named | The reference states the hazard generically — **any** replace of a single-select field's option list reissues every option's id, kept names included, and an item's value is bound to the old id — so "step 2 is what makes it safe" becomes "the stop covers the removed options and the restore covers the kept ones; neither alone is safe"                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | scope the warning to the trim of `Ready`/`In review` alone                   | U1   |
| 3 | The decision docs | `docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md` stays as written. A new `docs/memory/decisions/2026-09-19-backlog-trim-preserves-status.md` records the incident (the first run on project #2 cleared all 40 items; restored by body inference — `Evidence:` tail → `Done`, else `Backlog`; raw dump under `docs/memory/backlog/`), the corrected procedure, and that it corrects the earlier doc's ruling 2 and the "step 2 is what makes it safe" sentence                                                                                                                                                                                                                                                                                                                                     | edit the old doc in place                                                    | U2   |
| 4 | Review row        | None — nothing runnable lands; the wave review is the check                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                                            | —    |

## New dependencies

None.

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                  | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-skill.md](01-skill.md)                   | edit | `plugins/vwf/skills/backlog/SKILL.md`, `plugins/vwf/skills/backlog/references/github.md`                                                                                              | —          | pending |        |
| U2 | 2    | [02-docs.md](02-docs.md)                     | edit | `.claude/skills/vwf-plugin/references/skills-and-agents.md`, `site/src/content/docs/plugins/vwf.md`, `docs/memory/decisions/2026-09-19-backlog-trim-preserves-status.md`, `readme.md` | U1         | pending |        |
| U3 | 3    | [03-gates-and-bump.md](03-gates-and-bump.md) | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`                                                                                      | U2         | pending |        |

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

- **Wave 1 — U1 alone.** The bootstrap paragraph in the skill; the seven-step
  procedure in the reference.
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

| Step                       | Mode | Notes                                                                                                                                                   |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf at `19.34.2+N` into the dev marketplace and updates this machine's install; publishes nothing, cuts no tag; a **restarted** session loads it |

## Gates the orchestrator keeps

none beyond the wave gate — project #2 is already trimmed, so no verb can
exercise the snapshot/restore path until a project is next created from the
template; the run touches GitHub nowhere.

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

- **Dropping the `Ready`/`In review` stop** — declined; an item in a removed
  option has nowhere to be restored to.
- **A backup file written into the repo by the skill** — declined; the skill
  edits nothing on disk. The snapshot is a temp file whose path is printed.
- **Editing the 2026-09-19 vocabulary decision doc** — declined (decision 3);
  history.
- **Editing `docs/memory/backlog/`** — the dump is a record, not a store.
- **A release** — both bumps are recorded; the tags wait for a later `/release`.
- **The GitLab backend** — still parked from the 2026-09-18 plan.

## Parked

- `plugins/vwf/skills/plan-management/SKILL.md:256` reads "an item `In Progress`
  forever" as generic prose, not an option name; restyle to `In progress` next
  time that file is touched. Carried from the 2026-09-19 vocabulary plan.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-19-backlog-trim-preserves-status

or let the queue pick it, by priority:

/vwf:execute next
