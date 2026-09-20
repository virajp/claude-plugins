---
type: vwf-change-plan
title: setup reshape triggers — every structural change re-checks the shape
requires: [ docs/plans/2026-09-20-init-editor-dedupe ]
backlog: [ B28 ]
---

# Plan — setup reshape triggers (2026-09-20)

## Status

**BLOCKED**

BLOCKED 2026-09-20 after wave 1 in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/plan/2026-09-20-setup-reshape-triggers
— UNRESOLVED: U2 owns `plugins/vwf/skills/stackgen-sync/SKILL.md`, which does
not exist; the skill is `plugins/stackgen/skills/stackgen-sync/SKILL.md`, under
the tree this plan rules untouched. Ruling needed: re-own U2 there (with a
stackgen bump in U6 and its release intent recorded) or drop the stackgen-sync
trigger.

## Consent

| Action                                            | Granted                                                                                                                                       |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                           |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                           |
| Release vwf publicly                              | minor — `19.37.0` → `19.38.0`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step |
| Release stackgen publicly                         | none — untouched                                                                                                                              |
| Release site publicly                             | patch — `1.1.32` → `1.1.33` via `mise run p:site:version`; no release step                                                                    |
| Release installer publicly                        | none — untouched                                                                                                                              |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, every vwf command that changes the repo's structure ends by
re-checking the shape and offering `/vwf:setup reshape` in the same session —
setup after its own materialize pass, `stackgen-sync` after a pack re-sync,
`architecture` as it already does — and a change made outside vwf is surfaced at
the next `/vwf:recall`, which evaluates doctor's local baseline predicates and
prints one drift line. The user never has to remember to run setup after the
initial shaping.

Backlog item B28, its third piece (of four). Requires
`2026-09-20-init-editor-dedupe` — the chain keeps `setup/SKILL.md`,
`init/SKILL.md` and the docs pages from being edited by two plans at once and
makes each version bump deterministic.

Not a reversal. It closes the half of the 2026-09-06 note left open —
"config-side drift as a mode signal" — and the run-log observation that
`stackgen-sync` describes a re-run of init it never invokes.

## Facts the survey established

- In-session invokers today: setup → init at
  `plugins/vwf/skills/setup/SKILL.md:75` (`reshape`) and `:134` (Step 0 offer);
  setup → doctor at `:223` (step 3); architecture → setup at
  `plugins/vwf/skills/architecture/SKILL.md:456-458`; plan → doctor at
  `plugins/vwf/skills/plan/SKILL.md:142`; execute → doctor at
  `plugins/vwf/skills/execute/SKILL.md:492-493` (preflight; halts on blocking
  findings only — shape drift is never blocking). Every other command only
  nudges setup on **format** drift (blueprint `:136`, design-system `:71`,
  product `:59`, recall `:93`, screens `:104`, verify `:39-41`, mockups `:64`,
  execute `:217`, feedback `:185`).
- Setup's Step 0 (`:92-138`) runs **before** the materialize pass, so a pack
  version moved by materialize in the same run is not reshaped until the next
  run. `stackgen-sync` (`plugins/vwf/skills/stackgen-sync/SKILL.md:77-82`) says
  "a re-run of init is what folds it in" and invokes nothing. A member added to
  `members:` or the registry outside architecture, and a folder rename, are
  caught only by doctor's predicates (b), (c), (d).
- Init's re-run doctrine (`plugins/vwf/skills/init/SKILL.md:596-636`) lists the
  reasons — registry exists, folder renamed, pack version moved, member
  added/removed/cloned, fresh clone with deferrals, forge drift, whenever doctor
  says so — and names Step 0 and `reshape` as the doors; it names no command
  that invokes them.
- Doctor's baseline predicates
  (`plugins/vwf/skills/doctor/references/stack-checks.md:284-453` plus (g) as
  the forge-pass plan landed them): (a)–(f) are file reads against the lockfile,
  the config and the tree; (g) needs the forge CLI. Doctor has no named subset
  invocation today — a caller runs it whole.
- `/vwf:recall` (`plugins/vwf/skills/recall/SKILL.md`) runs at session start,
  reads the handoff, the plan index and the palace; its only setup mention is
  the format-drift nudge at `:93`.
- Versions as the required plans leave them: vwf `19.37.0`, stackgen `1.20.3`
  (untouched here), site `1.1.32`. Commit types
  `ops docs merge feat fix refactor`, no scopes. Priority: `10 + 10` over the
  required plan's row → 20.

## Assumed decisions — confirm or override at review

| # | Decision       | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Rejected                                             | Unit   |
| - | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| 1 | Triggers       | Setup re-runs its Step 0 shape check **after** the materialize pass, once per run, so a pack version moved in the run is offered for reshape in the same session; `stackgen-sync` ends by invoking `/vwf:setup reshape` in-session instead of describing it; `architecture` is unchanged — it already invokes setup                                                                                                                                                              | commands only, no recall nudge; a session-start hook | U1, U2 |
| 2 | Offer, not run | Every trigger **offers** `reshape` on consent, exactly the Step 0 way — one line naming the drifted repos and the predicate, then the question; nothing reshapes unprompted, and a clean check says nothing                                                                                                                                                                                                                                                                      | auto-reshape when the check finds drift              | U1, U2 |
| 3 | Recall nudge   | `/vwf:recall` evaluates doctor's **local** baseline predicates — (a) through (f), file reads only, never the forge predicate (g) — per repo of the product, and prints one line: the drifted repos, the failing letters, and `/vwf:setup reshape`; silent when every repo is clean or when the repo has never been shaped (no lockfile). Doctor gains a named **`baseline`** invocation — the local predicates alone, no stack, no health, no memory checks — which recall calls | recall runs doctor whole; recall reads the forge     | U3     |
| 4 | Init doctrine  | The re-run passage of `init/SKILL.md` gains the list of in-session triggers — architecture, setup after materialize, `stackgen-sync`, recall's nudge — each in one line beside the reasons it already lists; the doors stay Step 0 and `reshape`                                                                                                                                                                                                                                 | leave the trigger list to the site docs              | U4     |
| 5 | Review row     | None — prose only                                                                                                                                                                                                                                                                                                                                                                                                                                                                | a `Kind: review` row                                 | —      |

## New dependencies

none

## Units

| Id | Wave | Unit file                                          | Kind | Owns                                                                                                                                                                             | Depends on     | Status     | Commit   |
| -- | ---- | -------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------- | -------- |
| U1 | 1    | [01-setup.md](01-setup.md)                         | edit | `plugins/vwf/skills/setup/SKILL.md`                                                                                                                                              | —              | green      | 93a626bd |
| U2 | 1    | [02-stackgen-sync.md](02-stackgen-sync.md)         | edit | `plugins/vwf/skills/stackgen-sync/SKILL.md`                                                                                                                                      | —              | unresolved |          |
| U3 | 1    | [03-recall-and-doctor.md](03-recall-and-doctor.md) | edit | `plugins/vwf/skills/recall/SKILL.md`, `plugins/vwf/skills/doctor/SKILL.md`                                                                                                       | —              | green      | 12913a81 |
| U4 | 1    | [04-init.md](04-init.md)                           | edit | `plugins/vwf/skills/init/SKILL.md`                                                                                                                                               | —              | green      | a0448eb0 |
| U5 | 2    | [05-docs.md](05-docs.md)                           | edit | `readme.md`, `CLAUDE.md`, `.claude/docs/repo-shape.md`, `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-20-setup-reshape-triggers.md` | U1, U2, U3, U4 | skipped    |          |
| U6 | 3    | [06-gates-and-bump.md](06-gates-and-bump.md)       | edit | `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                 | U5             | skipped    |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Every unit is `edit`.

## Shared-file rule

| File                                                                                         | Why it collides                         | Owner   |
| -------------------------------------------------------------------------------------------- | --------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`                                | version files                           | U6 only |
| `.claude-plugin/marketplace.json`                                                            | generated                               | U6 only |
| every human-facing doc — `readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, `docs/memory/**` | n units editing one doc                 | U5 only |
| `plugins/vwf/skills/doctor/SKILL.md`                                                         | U1/U2 would cite `baseline`; U3 owns it | U3 only |
| `plugins/stackgen/**`                                                                        | untouched — stackgen is not released    | —       |

## Waves

- **Wave 1** — U1, U2, U3, U4: four disjoint skill trees; each cites the others'
  sections by name.
- **Wave 2** — U5: the docs over the branch delta plus the decisions doc.
- **Wave 3** — U6: the two bumps, the marketplace, the full gate.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                      |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages vwf at `19.38.0+N` into the dev marketplace and updates this machine's install; publishes nothing; a **restarted** session loads it |

## Gates the orchestrator keeps

none beyond the wave gate.

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

- A session-start hook running doctor — rejected at the interview as noise on
  sessions that never touch the shape.
- The forge predicate (g) at recall — needs the forge CLI; stays doctor's whole
  run and setup's Step 0.
- Making shape drift a blocking finding for `/vwf:execute` — it stays drift.
- `architecture`'s existing invocation of setup — unchanged.
- A public release — the bump lands; the tag waits for the next `/release`.

## Parked

- B28's last piece — the greenfield / brownfield rework (D) — is its own folder,
  chained after this one. B28 closes only when it lands.

## Gaps surfaced during execution

- **U2 — blocking, isolated.** Decision 1 and the survey cite
  `plugins/vwf/skills/stackgen-sync/SKILL.md:77-82`; no such file. The passage
  ("a re-run of init is what folds it in") is
  `plugins/stackgen/skills/stackgen-sync/SKILL.md:82`, inside sync step 2. The
  Shared-file rule marks `plugins/stackgen/**` untouched and Consent records no
  stackgen release, so U2 made no edit. Ruling needed: (a) re-own U2 to the
  stackgen path, add a stackgen bump to U6 and record its release intent; or (b)
  drop the stackgen-sync trigger (decision 1 then covers setup alone, and the
  init bullet at `init/SKILL.md:656` and decision 4 lose that line). U5 and U6
  skipped as dependents.
- **R1 contested (round 2, cap).** `init/SKILL.md:656` names an in-session
  reshape from `/stackgen:stackgen-sync` that the tree does not have while U2 is
  unresolved; resolves with the U2 ruling.
- **U3 GAP (non-blocking).** Recall's pipeline reads no plan index, so the shape
  check sits after the format check and before step 3's palace reads.
- **DOCS FALSIFIED handed to U5:** `vwf.md#vwfsetup` (shape check no longer Step
  0 only), `vwf.md` doctor argument surface and recall pipeline,
  `vwf.md:1340-1348` #vwfinit "When it runs again" (no trigger list),
  `.claude/skills/vwf-plugin/` setup description.

## Run log

| Wave | Unit      | Model | Round | Outcome               | Detail                                                                                                                                                                                                                                                                                                                                                                                                                 | Commit   |
| ---- | --------- | ----- | ----- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | pass                  | doctor: no blocking finding (mise, graphify CLI, graph in main checkout; no vwf.yaml → no stack pins); wave gate 5/5 green on develop tip; format check, conventions fetch skipped — no covers:, edit units only                                                                                                                                                                                                       | —        |
| 1    | U1        | opus  | 1     | pass                  | DECIDED: second shape check is the materialize pass's closing subsection (the pass runs in every mode; step 3 does not run in `current`), never on `reshape`; Step 0 gains the one sentence. DOCS FALSIFIED: vwf.md#vwfsetup, vwf-plugin skill setup description. GAP none                                                                                                                                             | 93a626bd |
| 1    | U2        | opus  | 1     | unresolved            | owned path `plugins/vwf/skills/stackgen-sync/SKILL.md` does not exist — the skill is `plugins/stackgen/skills/stackgen-sync/SKILL.md:82`, under the tree the Shared-file rule and Consent mark untouched; no edit made. Ruling needed: (a) re-own U2 to the stackgen path, add a stackgen bump to U6 and record its release intent, or (b) drop the stackgen-sync trigger from this plan. U5, U6 skipped as dependents | —        |
| 1    | U4        | opus  | 1     | pass                  | DECIDED: four-line trigger list placed after the reasons list, framed as offers-the-Step-0-way, silent when clean; recall line names (a)–(f), defers (g). DOCS FALSIFIED: none found (vwf.md init section, vwf-plugin skill — U5 to confirm). GAP none                                                                                                                                                                 | a0448eb0 |
| 1    | U3        | opus  | 1     | pass                  | DECIDED: `baseline` is an argument value beside the project list, not a mode; a lockfile-less base reports `not shaped`, distinct from drift. DOCS FALSIFIED: vwf.md doctor argument surface and recall pipeline. GAP: recall reads no plan index — shape check placed after the format check, before step 3 palace reads                                                                                              | 12913a81 |
| 1    | R1        | opus  | 1     | findings(2)           | init/SKILL.md:656 [U4] names `/vwf:stackgen-sync`, which does not exist — the command is `/stackgen:stackgen-sync` (looped to U4 as the name fix; whether the bullet stands follows the U2 ruling); vwf.md:1340-1348 #vwfinit "When it runs again" carries no trigger list — DOCS FALSIFIED handed to U5 (already in its Owns). CONTRACT clean, RULINGS clean                                                          | —        |
| 1    | U4        | opus  | 2     | pass                  | R1 finding applied: the sync bullet names `/stackgen:stackgen-sync`; refolded, nothing else touched                                                                                                                                                                                                                                                                                                                    | a0448eb0 |
| 1    | R1        | opus  | 2     | findings(1) contested | init/SKILL.md:656 [U4] the sync bullet asserts an in-session reshape the tree does not have while U2 is unresolved — holds until the U2 ruling lands or the bullet is dropped; not a departure from decision 4. CONTRACT clean, RULINGS clean                                                                                                                                                                          | —        |
| 1    | gate      | —     | 1     | pass                  | wave gate 5/5 green; U2 unresolved → U5, U6 skipped as dependents; run stops at the report                                                                                                                                                                                                                                                                                                                             | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-20-setup-reshape-triggers

or let the queue pick it, by priority:

/vwf:execute next
